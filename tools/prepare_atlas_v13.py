"""Package supplied Heavy Rain, Multi and Storms outputs for a static atlas.

No hazard model is run. Original selected tables/GIS are copied unchanged;
display geometries and map images are derived only for browser rendering.
"""
from pathlib import Path
from collections import defaultdict
import argparse, csv, hashlib, json, math, shutil, sqlite3, zipfile
import numpy as np
import rasterio
from rasterio.warp import calculate_default_transform, transform_bounds
from pyproj import Transformer
import shapely
from shapely.geometry import mapping, shape
from PIL import Image

p=argparse.ArgumentParser();p.add_argument('--inputs',type=Path,required=True);p.add_argument('--atlas',type=Path,required=True);a=p.parse_args()
inputs=a.inputs.resolve();atlas=a.atlas.resolve()
roots={'heavy-rain':inputs/'CLIMAAX_HEAVY_RAIN_ALANYA_v1','multi':inputs/'CLIMAAX_MULTI_ALANYA_v1','storms':inputs/'CLIMAAX_STORMSv3'}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,separators=(',',':'),allow_nan=False)+'\n')
def rows(p):
 def scalar(s):
  if s is None or s.strip() in ('','nan','NaN'):return None
  if s in ('True','False'):return s=='True'
  try:
   n=float(s)
   if not math.isfinite(n):return None
   if n.is_integer() and not (len(s)>1 and s.startswith('0')):return int(n)
   return n
  except ValueError:return s
 with p.open(encoding='utf-8-sig',newline='') as f:return [{k:scalar(v) for k,v in r.items()} for r in csv.DictReader(f)]
def clean(v):
 if isinstance(v,float) and not math.isfinite(v):return None
 if isinstance(v,dict):return {k:clean(x) for k,x in v.items()}
 if isinstance(v,(tuple,list)):return [clean(x) for x in v]
 return v
def gpkg(path,keep=None,simplify=0):
 con=sqlite3.connect(path);con.row_factory=sqlite3.Row
 table,geom,srs=con.execute('select table_name,column_name,srs_id from gpkg_geometry_columns').fetchone()
 tx=Transformer.from_crs(srs,4326,always_xy=True);features=[]
 for row in con.execute('select * from "'+table+'"'):
  blob=row[geom];env=(blob[3]>>1)&7;offset=8+[0,32,48,48,64][env]
  g=shapely.from_wkb(blob[offset:])
  if simplify:g=shapely.simplify(g,simplify,preserve_topology=True)
  g=shapely.transform(g,tx.transform,interleaved=False)
  props={k:row[k] for k in row.keys() if k not in (geom,'fid') and (keep is None or k in keep)}
  geomobj=json.loads(shapely.to_geojson(g))
  def rounding(c):return [round(x,7) if isinstance(x,(float,int)) else rounding(x) for x in c]
  geomobj['coordinates']=rounding(geomobj['coordinates'])
  features.append({'type':'Feature','id':props.get('asset_id',props.get('cell_id',props.get('name',len(features)))),'properties':clean(props),'geometry':geomobj})
 con.close();return {'type':'FeatureCollection','features':features}
def partition(fc,path):
 buckets=defaultdict(list)
 for f in fc['features']:
  g=shape(f['geometry']);b=g.bounds;f['bbox']=list(b);c=g.centroid
  x=int((c.x+180)/360*32768);lat=np.deg2rad(np.clip(c.y,-85.05,85.05));y=int((1-np.arcsinh(np.tan(lat))/np.pi)/2*32768)
  buckets[(x,y)].append(f)
 tiles=[]
 for (x,y),features in sorted(buckets.items()):
  rel=f'data/buildings/{x}_{y}.geojson';dest=path/rel;save(dest,{'type':'FeatureCollection','features':features})
  bb=[min(f['bbox'][0] for f in features),min(f['bbox'][1] for f in features),max(f['bbox'][2] for f in features),max(f['bbox'][3] for f in features)]
  tiles.append({'path':rel,'bbox':bb,'count':len(features),'sha256':sha(dest)})
 return {'count':len(fc['features']),'min_zoom':15,'tiles':tiles}
def copy_source(module,relative):
 src=roots[module]/relative;dest=atlas/module/'downloads'/relative
 dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dest)
 manifests[module].append({'source_path':relative,'path':'downloads/'+relative,'bytes':src.stat().st_size,'sha256':sha(src)})
 return 'downloads/'+relative
def source_zip(module,paths):
 dest=atlas/module/'downloads/geospatial-sources.zip';dest.parent.mkdir(parents=True,exist_ok=True)
 with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for rel in paths:
   src=roots[module]/rel;z.write(src,rel)
   manifests[module].append({'source_path':rel,'archive':'downloads/geospatial-sources.zip','entry':rel,'bytes':src.stat().st_size,'sha256':sha(src)})
 return 'downloads/geospatial-sources.zip'
def figures(module):
 src=roots[module]/('outputs/figures' if module!='storms' else 'outputs/figures');items=[]
 paths=sorted((src/'EN').glob('*.png')) if (src/'EN').exists() else sorted(src.glob('*.png'))
 for i,p in enumerate(paths):
  item={'id':p.stem,'source_filename':p.name,'source_sha256':sha(p),'images':{}}
  for lang in ['en','tr']:
   sp=src/lang.upper()/p.name if (src/lang.upper()).exists() else p
   if not sp.exists():sp=p
   dest=atlas/module/'figures'/f'{p.stem}_{lang}.webp';dest.parent.mkdir(parents=True,exist_ok=True)
   with Image.open(sp) as im:
    im.thumbnail((2100,2100));im.convert('RGB').save(dest,'WEBP',quality=93,method=6)
   item['images'][lang]='figures/'+dest.name
  item['source_languages']=['en','tr'] if (src/'TR').exists() else ['source']
  items.append(item)
 return items
def categorical_image(source,destination,palette):
 with rasterio.open(source) as ds:
  arr=ds.read(1);valid=(ds.read_masks(1)>0)&np.isfinite(arr)
  assert set(np.unique(arr[valid])).issubset({1,2,3,4})
  src=np.where(valid,arr,0).astype(np.uint8);tx,w,h=calculate_default_transform(ds.crs,3857,ds.width,ds.height,*ds.bounds)
  dst=np.zeros((h,w),dtype=np.uint8);inv=~ds.transform;transform=Transformer.from_crs(3857,ds.crs,always_xy=True)
  xc=tx.c+(np.arange(w)+.5)*tx.a
  for first in range(0,h,128):
   last=min(h,first+128);yc=tx.f+(np.arange(first,last)+.5)*tx.e;gx,gy=np.meshgrid(xc,yc);sx,sy=transform.transform(gx,gy)
   cc=np.floor(inv.a*sx+inv.b*sy+inv.c).astype(int);rr=np.floor(inv.d*sx+inv.e*sy+inv.f).astype(int)
   inside=(rr>=0)&(rr<ds.height)&(cc>=0)&(cc<ds.width);block=dst[first:last];block[inside]=src[rr[inside],cc[inside]]
  colours=np.zeros((5,4),dtype=np.uint8)
  for i,c in enumerate(palette,1):colours[i]=[*bytes.fromhex(c[1:]),255]
  Image.fromarray(colours[dst]).save(destination,optimize=True)
  west,south,east,north=transform_bounds(3857,4326,*rasterio.transform.array_bounds(h,w,tx))
  return {'bounds':[[south,west],[north,east]],'source_resolution_m':list(ds.res),'source_crs':str(ds.crs),'source_sha256':sha(source),'resampling':'exact inverse nearest neighbour','counts':{str(i):int(np.count_nonzero(src==i)) for i in range(1,5)}}

manifests={k:[] for k in roots};datasets={}
for module in roots:
 (atlas/module/'data').mkdir(parents=True,exist_ok=True)
print('Preparing Heavy Rain',flush=True)
module='heavy-rain';src=roots[module];dest=atlas/module
boundary=json.loads((src/'data/input/gis/alanya_boundary.geojson').read_text());save(dest/'data/boundary.geojson',boundary)
neighbourhoods=gpkg(src/'outputs/gis/neighbourhoods_analysis.gpkg');save(dest/'data/neighbourhoods.geojson',neighbourhoods)
native=gpkg(src/'outputs/gis/climate_native_grid.gpkg');save(dest/'data/native-grid.geojson',native)
cases=rows(src/'outputs/tables/cases.csv');case_ids=[c['case_id'] for c in cases]
building=gpkg(src/'outputs/gis/buildings_base.gpkg');byid={f['properties']['asset_id']:f for f in building['features']}
for f in building['features']:f['properties']['cases']={}
stats={}
for case in cases:
 c=case['case_id'];records=rows(src/f'outputs/tables/buildings_{c}.csv');assert len(records)==len(building['features'])
 stat={'mapped':len(records),'assessed':0,'classes':[0,0,0,0],'residential':0,'residential_elevated':0}
 for r in records:
  f=byid[r['asset_id']];f['properties']['cases'][c]=[r['screening_class'],r['screening_score'],r['rain_mm'],r['model_min_mm'],r['model_max_mm']]
  if r['assessed']:stat['assessed']+=1;stat['classes'][int(r['screening_class'])-1]+=1
  if r['use_group']=='confirmed_residential':stat['residential']+=1;stat['residential_elevated']+=int(r['assessed'] and r['screening_class']>=3)
 stats[c]=stat
buildings=partition(building,dest)
palette=['#b8dacf','#f5df8a','#ed9b55','#b84449'];rasters={}
for c in case_ids:
 rel=f'data/screening_{c}.png';meta=categorical_image(src/f'outputs/gis/screening_classes_{c}.tif',dest/rel,palette);meta['image']=rel;rasters[c]=meta
tables={p.stem:rows(p) for p in sorted((src/'outputs/tables').glob('*.csv'))}
web_tables=['climate_cell_return_levels_ensemble','neighbourhood_building_screening','neighbourhood_screening_area','station_annual_indices','daily_bias_metrics','district_residential_summary','screening_parameter_sensitivity_range','mgm_official_idf']
for p in sorted((src/'outputs/tables').glob('*.csv')):copy_source(module,p.relative_to(src).as_posix())
for p in sorted((src/'outputs/audit').glob('*.json')):copy_source(module,p.relative_to(src).as_posix())
copy_source(module,'config/alanya.json')
source_zip(module,[p.relative_to(src).as_posix() for p in sorted((src/'outputs/gis').glob('*')) if p.is_file()]+['data/input/gis/alanya_boundary.geojson'])
datasets[module]={'hazard':module,'cases':cases,'stats':stats,'palette':palette,'rasters':rasters,'buildings':buildings,'tables':{k:tables[k] for k in web_tables},'table_downloads':{k:f'downloads/outputs/tables/{k}.csv' for k in web_tables},'audit':json.loads((src/'outputs/audit/result_summary.json').read_text()),'figures':figures(module),'boundary':'data/boundary.geojson','neighbourhoods':'data/neighbourhoods.geojson','native_grid':'data/native-grid.geojson'}
print('Preparing Multi infrastructure',flush=True)
module='multi';src=roots[module];dest=atlas/module
boundary_path=next(src.glob('data/**/alanya_boundary.geojson'));save(dest/'data/boundary.geojson',json.loads(boundary_path.read_text()))
fields=['asset_id','name','category','subtype','scope','area_m2','length_m','lst_median','lst_p90','lst_valid_fraction','lst_observations_median','local_heat_excess_median','ndvi_median','ndbi_median','elevation_median','slope_median','tpi_median','mapped_waterway_distance_m','recent_TXgt35_days_annual_mean','baseline_TXgt35_days_annual_mean','baseline_precip_P99_all_days_mm','lst_area_percentile','local_heat_excess_area_percentile','ndvi_area_percentile','TXgt35_days_change_recent_minus_baseline','climate_cell_id','temperature_profile_distance_km','geometry_kind','qa_flags']
road_forward=Transformer.from_crs(4326,32636,always_xy=True);road_backward=Transformer.from_crs(32636,4326,always_xy=True)
for name in ['facilities','road_segments']:
 records=rows(src/f'outputs/tables/{name}_indicators.csv');byid={r['asset_id']:r for r in records};assert len(byid)==len(records)
 geo=json.loads((src/f'outputs/maps/{name}_indicators.geojson').read_text());assert len(geo['features'])==len(records)
 for f in geo['features']:
  ident=f['properties']['asset_id'];f['id']=ident;f['properties']={k:byid[ident].get(k) for k in fields}
  # A display rendition only; the original GIS is provided separately.
  if name=='road_segments':
   g=shapely.transform(shape(f['geometry']),road_forward.transform,interleaved=False);g=shapely.simplify(g,3,preserve_topology=True);g=shapely.transform(g,road_backward.transform,interleaved=False);f['geometry']=mapping(g)
  f['bbox']=list(shape(f['geometry']).bounds)
 save(dest/f'data/{name}.geojson',geo)
 if name=='facilities':facility_rows=[{k:r.get(k) for k in fields} for r in records]
for p in sorted((src/'outputs/tables').glob('*')):
 if p.is_file():copy_source(module,p.relative_to(src).as_posix())
source_zip(module,['outputs/maps/facilities_indicators.geojson','outputs/maps/road_segments_indicators.geojson',boundary_path.relative_to(src).as_posix()])
datasets[module]={'hazard':module,'boundary':'data/boundary.geojson','facilities':'data/facilities.geojson','roads':'data/road_segments.geojson','facility_rows':facility_rows,'inventory':json.loads((src/'outputs/tables/inventory_summary.json').read_text()),'climate':json.loads((src/'outputs/tables/climate_status.json').read_text()),'satellite':json.loads((src/'outputs/tables/satellite_status.json').read_text()),'figures':figures(module),'tables':{},'table_downloads':{}}
for name in ['sector_summary','climate_annual','climate_periods','precipitation_return_levels','heat_context_review_list','indicator_dictionary']:
 datasets[module]['tables'][name]=rows(src/f'outputs/tables/{name}.csv');datasets[module]['table_downloads'][name]=f'downloads/outputs/tables/{name}.csv'
datasets[module]['tables']['facilities_indicators']=facility_rows;datasets[module]['table_downloads']['facilities_indicators']='downloads/outputs/tables/facilities_indicators.csv'
print('Preparing Storms',flush=True)
module='storms';src=roots[module];dest=atlas/module
save(dest/'data/boundary.geojson',json.loads((src/'data/input/alanya_boundary.geojson').read_text()))
building=gpkg(src/'outputs/microscale/gis/building_height_audit.gpkg');b_index=partition(building,dest)
roads=gpkg(src/'data/input/roads.gpkg',simplify=3);save(dest/'data/roads.geojson',roads)
for rel in ['outputs/bias/tables','outputs/microscale/tables','data/input/shared_scenario_review']:
 for p in sorted((src/rel).glob('*')):
  if p.is_file():copy_source(module,p.relative_to(src).as_posix())
for rel in ['DATA_STATUS.json','config/alanya.json','config/microscale.json']:copy_source(module,rel)
source_zip(module,['outputs/microscale/gis/building_height_audit.gpkg','data/input/roads.gpkg','data/input/alanya_boundary.geojson'])
tables={};downloads={}
for name,path in {'mgm_year_coverage':'outputs/bias/tables/mgm_year_coverage.csv','mgm_daily_max':'outputs/bias/tables/mgm_daily_max.csv','exposure_thresholds':'data/input/shared_scenario_review/exposure_thresholds.csv','hazard_coverage':'data/input/shared_scenario_review/hazard_coverage.csv'}.items():
 data=rows(src/path)
 if name!='mgm_daily_max':tables[name]=data
 downloads[name]='downloads/'+path
datasets[module]={'hazard':module,'boundary':'data/boundary.geojson','roads':'data/roads.geojson','road_count':len(roads['features']),'buildings':b_index,'height':json.loads((src/'outputs/microscale/tables/height_summary.json').read_text()),'data_status':json.loads((src/'DATA_STATUS.json').read_text()),'station':json.loads((src/'outputs/bias/tables/mgm_source.json').read_text()),'shared_display':json.loads((src/'data/input/shared_scenario_review/map_display_settings.json').read_text()),'tables':tables,'table_downloads':downloads,'figures':figures(module)}

for module,data in datasets.items():
 data['version']='13.0.0';data['source_manifest']='downloads/source-manifest-v13.json'
 save(atlas/module/'downloads/source-manifest-v13.json',{'version':'13.0.0','uploaded_archive':{'heavy-rain':'CLIMAAX_HEAVY_RAIN_ALANYA_v1.zip','multi':'CLIMAAX_MULTI_ALANYA_v1(1).zip','storms':'CLIMAAX_STORMSv3.rar'}[module],'sources':manifests[module],'display_only':{'buildings':'Seven decimal-place coordinates; complete source footprints, no risk imputation.','roads':'3 m topology-preserving simplification; numerical lengths retain supplied source values.','figures':'Resized WebP browser renditions; source file hashes recorded.','raster':'Exact inverse nearest neighbour; source categories retained.'}})
 save(atlas/module/'data/catalog.json',data)
 (atlas/module/'data/catalog.js').write_text('window.ATLAS_EXTENDED_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'),allow_nan=False)+';\n')
 print(module,'catalog',round((atlas/module/'data/catalog.js').stat().st_size/1e6,2),'MB','figures',len(data['figures']),flush=True)
print('Data preparation complete',flush=True)
