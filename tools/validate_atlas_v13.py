from pathlib import Path
from collections import Counter
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import csv,hashlib,json,zipfile,argparse
import numpy as np
import rasterio
from rasterio.warp import calculate_default_transform
from pyproj import Transformer
from PIL import Image
import shapely
from shapely.geometry import shape

p=argparse.ArgumentParser();p.add_argument('--atlas',type=Path,required=True);p.add_argument('--baseline',type=Path,required=True);a=p.parse_args();root=a.atlas;baseline=a.baseline
checks=[]
def passed(s):checks.append(s);print(s,flush=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def readcsv(p):
 with p.open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
data={h:json.loads((root/h/'data/catalog.json').read_text()) for h in ['heavy-rain','multi','storms']}
changed=[];preserved=0
for old in baseline.rglob('*'):
 if old.is_file():
  rel=old.relative_to(baseline);new=root/rel;assert new.is_file(),str(rel)
  if sha(old)!=sha(new):changed.append(str(rel))
  else:preserved+=1
assert sorted(changed)==['drought/index.html','floods/index.html','index.html','wildfires/index.html'],changed
passed(f'All {preserved} non-entry v12 files are byte-identical; only the four old HTML entry points changed.')

source_count=0
for h in data:
 manifest=json.loads((root/h/'downloads/source-manifest-v13.json').read_text());archives={}
 for item in manifest['sources']:
  if 'archive' in item:
   if item['archive'] not in archives:archives[item['archive']]=zipfile.ZipFile(root/h/item['archive'])
   b=archives[item['archive']].read(item['entry'])
  else:b=(root/h/item['path']).read_bytes()
  assert len(b)==item['bytes'] and hashlib.sha256(b).hexdigest()==item['sha256'],item
  source_count+=1
 for z in archives.values():assert z.testzip() is None;z.close()
passed(f'All {source_count} original source tables/JSON/GIS entries pass byte-level SHA-256 and ZIP CRC checks.')

for h in ['heavy-rain','storms']:
 d=data[h];ids=set();features=[]
 for tile in d['buildings']['tiles']:
  p=root/h/tile['path'];assert sha(p)==tile['sha256'];fc=json.loads(p.read_text());assert len(fc['features'])==tile['count']
  for f in fc['features']:
   assert f['id'] not in ids;ids.add(f['id']);features.append(f)
 assert len(ids)==d['buildings']['count']==27960
 assert all(shapely.is_valid(shape(f['geometry'])) for f in features)
 if h=='heavy-rain':
  byid={f['properties']['asset_id']:f['properties'] for f in features}
  for case in d['cases']:
   c=case['case_id'];rows=readcsv(root/h/f'downloads/outputs/tables/buildings_{c}.csv');assert {r['asset_id'] for r in rows}==ids
   count=Counter();assessed=0;residential=0;elevated=0
   for row in rows:
    source=[float(row[k]) if row[k] else None for k in ['screening_class','screening_score','rain_mm','model_min_mm','model_max_mm']]
    assert byid[row['asset_id']]['cases'][c]==source
    if row['assessed']=='True':assessed+=1;count[int(row['screening_class'])]+=1
    if row['use_group']=='confirmed_residential':residential+=1;elevated+=int(row['assessed']=='True' and int(row['screening_class'])>=3)
   assert assessed==27958 and residential==3285
   assert d['stats'][c]['classes']==[count[i] for i in [1,2,3,4]]
   assert d['stats'][c]['residential_elevated']==elevated
  rows=[r for r in d['tables']['neighbourhood_building_screening'] if r['case_id']=='3h_T100_historical_1976-2005' and r['use_group']=='confirmed_residential' and r['neighbourhood']!='UNASSIGNED']
  assert len(rows)==102 and sum(r['mapped_buildings']==0 and r['elevated_or_high_pct_of_assessed'] is None for r in rows)==64
  assert len(d['tables']['climate_cell_return_levels_ensemble'])==1152
  native=json.loads((root/h/d['native_grid']).read_text());assert len(native['features'])==24
  assert set(f['properties']['cell_id'] for f in native['features'])==set(r['cell_id'] for r in d['tables']['climate_cell_return_levels_ensemble'])
 else:
  counts=Counter(f['properties']['height_source'] for f in features)
  assert counts=={'missing':26240,'OSM_declared_height_unverified':221,'OSM_levels_times_assumed_floor_height':1499},counts
  assert all(f['properties']['height_for_preparation_m'] is None for f in features if f['properties']['height_source']=='missing')
 passed(f'{h}: 27,960 unique valid display footprints, source attribute fidelity and missingness checked.')
passed('Heavy Rain: six cases reconcile; 64 neighbourhoods without residential inventory remain unavailable; all 24 climate-cell joins are complete.')

samples=0
for c,meta in data['heavy-rain']['rasters'].items():
 image=np.array(Image.open(root/'heavy-rain'/meta['image']));code=np.zeros(image.shape[:2],dtype=np.uint8)
 for i,color in enumerate(data['heavy-rain']['palette'],1):code[np.all(image[:,:,:3]==np.array(list(bytes.fromhex(color[1:]))),axis=2)&(image[:,:,3]>0)]=i
 assert np.all((code>0)==(image[:,:,3]>0))
 with zipfile.ZipFile(root/'heavy-rain/downloads/geospatial-sources.zip') as z:
  source=z.read(f'outputs/gis/screening_classes_{c}.tif')
 with rasterio.io.MemoryFile(source) as mem:
  with mem.open() as ds:
   arr=ds.read(1);assert all(meta['counts'][str(i)]==int(np.count_nonzero(arr==i)) for i in [1,2,3,4])
   tx,w,h=calculate_default_transform(ds.crs,3857,ds.width,ds.height,*ds.bounds);assert image.shape[:2]==(h,w)
   rng=np.random.default_rng(20261110);rr=[];cc=[]
   for i in range(5):
    yy,xx=np.where(code==i);n=min(250,len(xx));take=rng.choice(len(xx),n,replace=False);rr.extend(yy[take]);cc.extend(xx[take])
   rr=np.array(rr);cc=np.array(cc);x=tx.c+(cc+.5)*tx.a;y=tx.f+(rr+.5)*tx.e;sx,sy=Transformer.from_crs(3857,ds.crs,always_xy=True).transform(x,y);inv=~ds.transform
   col=np.floor(inv.a*sx+inv.b*sy+inv.c).astype(int);row=np.floor(inv.d*sx+inv.e*sy+inv.f).astype(int);inside=(row>=0)&(row<ds.height)&(col>=0)&(col<ds.width)
   expected=np.zeros(len(rr),dtype=np.uint8);expected[inside]=arr[row[inside],col[inside]];assert np.array_equal(expected,code[rr,cc]);samples+=len(rr)
passed(f'All six screening images retain source colours/classes/nodata and pass {samples} exact source-pixel-centre back-projection comparisons.')

d=data['multi']
for name,total in [('facilities',289),('road_segments',14975)]:
 fc=json.loads((root/'multi'/('data/facilities.geojson' if name=='facilities' else 'data/road_segments.geojson')).read_text());rows=readcsv(root/'multi'/f'downloads/outputs/tables/{name}_indicators.csv');source={r['asset_id']:r for r in rows}
 assert len(fc['features'])==len(source)==total
 for f in fc['features']:
  props=f['properties'];r=source[props['asset_id']]
  for k in ['lst_median','ndvi_median','local_heat_excess_median','length_m','lst_valid_fraction','recent_TXgt35_days_annual_mean']:
   if props[k] is None:assert not r[k] or r[k]=='nan'
   else:assert props[k]==float(r[k]),(k,props[k],r[k])
 assert all(shapely.is_valid(shape(f['geometry'])) for f in fc['features'])
passed('Multi: all 289 facilities and 14,975 road segments join one-to-one to original values, lengths and missingness; all display geometries are valid.')

d=data['storms'];r=d['tables']['exposure_thresholds'][-1]
assert r['threshold_ms']==32.7 and r['buildings']==1455 and abs(r['road_km']-378.67336355486526)<1e-10
assert len(d['tables']['mgm_year_coverage'])==31 and sum(r['valid_days'] for r in d['tables']['mgm_year_coverage'])==10851
assert sum(r['coverage']==1 for r in d['tables']['mgm_year_coverage'])==23
assert d['road_count']==6538 and not list((root/'storms/data').glob('*.tif'))
passed('Storms: supplied threshold totals, station coverage, 23 complete years and source inventory counts reconcile; no spatial gust field is fabricated.')

class Parser(HTMLParser):
 def __init__(self):super().__init__();self.refs=[];self.nav=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag in ['script','img','iframe'] and a.get('src'):self.refs.append(a['src'])
  if tag in ['a','link'] and a.get('href'):self.refs.append(a['href'])
  if tag=='a' and 'data-hazard-label' in a:self.nav+=1
for name in ['index.html','floods/index.html','drought/index.html','wildfires/index.html','heavy-rain/index.html','multi/index.html','storms/index.html']:
 path=root/name;parser=Parser();parser.feed(path.read_text());assert parser.nav==7,(name,parser.nav)
 for ref in parser.refs:
  u=urlsplit(ref)
  if not u.scheme and not u.netloc and u.path:
   assert (path.parent/unquote(u.path)).is_file(),(name,ref)
for h,d in data.items():
 for path in d['table_downloads'].values():assert (root/h/path).is_file()
 for fig in d['figures']:
  for path in fig['images'].values():assert (root/h/path).is_file()
passed('All seven navigation entry points, local static resources, table downloads and both-language figure paths resolve.')
report={'release':'13.0.0','date':'2026-11-10','passed':len(checks),'failed':0,'checks':checks,'preserved_v12_files':preserved,'changed_v12_files':sorted(changed),'purpose':'Source preservation and display verification, not scientific model validation.','browser_qa':'Recorded separately after interactive desktop/mobile checks.'}
(root/'VALIDATION_V13.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('PASS',len(checks),'FAIL 0')
