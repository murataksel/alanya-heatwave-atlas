from pathlib import Path
import csv, json, math, re, shutil, sqlite3, struct, hashlib, zipfile
import numpy as np
from PIL import Image
import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling, transform_bounds
from pyproj import Transformer
from shapely import from_wkb, to_geojson
from shapely.ops import transform as geom_transform

import argparse
parser=argparse.ArgumentParser(description="Prepare supplied drought and wildfire outputs for Atlas v10; no scientific models are re-run.")
parser.add_argument('--drought-outputs',type=Path,required=True)
parser.add_argument('--fire-outputs',type=Path,required=True)
parser.add_argument('--drought-archive',type=Path,required=True)
parser.add_argument('--fire-archive',type=Path,required=True)
parser.add_argument('--site',type=Path,default=Path(__file__).resolve().parents[1])
args=parser.parse_args()
SITE=args.site.resolve()
D=args.drought_outputs.resolve()
F=args.fire_outputs.resolve()

def clean(v):
    if isinstance(v,dict): return {k:clean(x) for k,x in v.items()}
    if isinstance(v,(list,tuple)):return [clean(x) for x in v]
    if isinstance(v,(np.integer,np.floating)):v=v.item()
    if isinstance(v,float) and not math.isfinite(v):return None
    return v
def write_json(p,obj):
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(clean(obj),ensure_ascii=False,separators=(',',':'),allow_nan=False))
def js_data(p,name,obj):
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text('window.'+name+'='+json.dumps(clean(obj),ensure_ascii=False,separators=(',',':'),allow_nan=False).replace('</','<\\/')+';\n')
def table(p):
    rows=list(csv.DictReader(p.open(encoding='utf-8-sig')))
    for r in rows:
        for k,v in list(r.items()):
            if v=='':r[k]=None
            elif re.fullmatch(r'-?\d+(\.\d*)?([eE][+-]?\d+)?',v):r[k]=float(v) if any(x in v for x in '.eE') else int(v)
    return clean(rows)
def gpkg(p,layer):
    c=sqlite3.connect(p);c.row_factory=sqlite3.Row
    srs=c.execute('select srs_id from gpkg_contents where table_name=?',(layer,)).fetchone()[0]
    t=Transformer.from_crs(srs,4326,always_xy=True).transform
    features=[]
    for row in c.execute('select * from "'+layer+'"'):
        row=dict(row);blob=row.pop('geom');flags=blob[3];env=(flags>>1)&7
        off=8+{0:0,1:32,2:48,3:48,4:64}[env]
        geom=geom_transform(t,from_wkb(blob[off:]))
        features.append({'type':'Feature','properties':clean(row),'geometry':json.loads(to_geojson(geom))})
    c.close();return {'type':'FeatureCollection','features':features}
def extract_html_layers(p):
    s=p.read_text();decoder=json.JSONDecoder();data={}
    for m in re.finditer(r'(geo_json_[0-9a-f]+)_add\(\s*(\{)',s):
        obj,_=decoder.raw_decode(s[m.start(2):]);data[m.group(1)]=obj
    end=s[s.rfind('var layer_control_'):]
    names=re.findall(r'"([^"\n]+)"\s*:\s*(geo_json_[0-9a-f]+)',end)
    return {name:data[var] for name,var in names}

def prep_common(hazard,base):
    dest=SITE/hazard
    for dr in ['data','downloads','figures','rasters']: (dest/dr).mkdir(parents=True,exist_ok=True)
    tables={}
    for p in base.rglob('*.csv'):
        key=p.stem
        # Names are unique in both supplied output archives.
        shutil.copy2(p,dest/'downloads'/p.name);tables[key]=table(p)
    for p in base.rglob('*.json'):
        shutil.copy2(p,dest/'downloads'/p.name)
    figures=[]
    for p in sorted(base.rglob('*.png')):
        if p.stem.endswith('_transparent'):continue
        out=dest/'figures'/(p.stem+'.webp')
        with Image.open(p) as im:
            im.save(out,'WEBP',lossless=True,method=5,exact=True)
            # Decode equality verifies that no scientific figure pixels changed.
            with Image.open(out) as chk:assert np.array_equal(np.asarray(im.convert('RGBA')),np.asarray(chk.convert('RGBA'))),p
        figures.append({'id':p.stem,'src':'figures/'+out.name,'title':p.stem.replace('_',' '),'source':str(p.relative_to(base))})
    manifest={'atlas_version':'10.0.0','prepared_date':'2026-10-23','input_archive':('drought_outputs.rar' if hazard=='drought' else 'fire_outputs.zip'),
        'archive_sha256':hashlib.sha256((args.drought_archive if hazard=='drought' else args.fire_archive).read_bytes()).hexdigest(),
        'presentation_only':True,'transformations':['GPKG geometries reprojected to EPSG:4326 without simplification.','Raster display reprojected to EPSG:3857 with nearest-neighbour sampling; native values retained for point inspection.','PNG scientific figures converted to pixel-identical lossless WebP.','CSV and metadata downloads copied unchanged. No scientific models re-run.'],
        'source_files':[{'path':str(p.relative_to(base)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(base.rglob('*')) if p.is_file()]}
    write_json(dest/'downloads/source-manifest.json',manifest)
    with zipfile.ZipFile(dest/'downloads/geospatial-source.zip','w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for p in sorted(base.rglob('*')):
            if p.suffix.lower() in ['.tif','.gpkg','.svg']:z.write(p,str(p.relative_to(base)))
    return dest,tables,figures

dd,dt,df=prep_common('drought',D)
dg={n:gpkg(D/'gis/Alanya_agricultural_drought.gpkg',n) for n in ['Alanya_boundary','climate_hazard_cells','production_Banana','production_Citrus','production_Avocado','production_hazard_intersections']}
for name,g in dg.items():write_json(dd/'data'/(name+'.geojson'),g)
ds={
 'Alanya_study_domain':'Supplied Alanya polygon, source grid and production coverage; boundary area 1,577.46 km².',
 'Alanya_climatic_water_balance':'Annual precipitation minus reference evapotranspiration. An annual climatic balance is not a measured soil-water deficit.',
 'Alanya_soil_AWC':'Available water capacity in mm/m. Rooting-zone available water requires multiplication by root depth in metres.',
 'Alanya_irrigation_seasonality':'Inherited monthly, district-land-area-weighted irrigation requirements. These do not represent planted-crop irrigation totals.',
 'Alanya_crop_risk_summary':'Source screening estimates on known allocated production only; incomplete spatial coverage and undocumented price year.'}
for f in df:f['caption']=ds.get(f['id'],'Inherited RCP8.5 2046–2050 screening. Known legacy algorithm issues remain unresolved; use the method audit with this figure.')
js_data(dd/'data/catalog.js','ATLAS_DATA',{'hazard':'drought','tables':dt,'geo':dg,'figures':df,'metadata':{'configuration':json.loads((D/'00_audit/run_config.json').read_text()),'scope_km2':1577.46}})

fd,ft,ff=prep_common('wildfires',F)
fg=extract_html_layers(F/'maps/Alanya_infrastructure_atlas.html')
fg['Selected institutional resources']=gpkg(F/'maps/local_resources.gpkg','selected_resources')
fg['EFFIS WUI source indicator']=gpkg(F/'maps/effis_wui_native.gpkg','wui')
fg['Native weather cells']=gpkg(F/'maps/response_historical_cells.gpkg','historical')
fg['Weather-cell line segments']=gpkg(F/'maps/response_infrastructure_cells.gpkg','line_segments')
fg['Weather-cell energy facilities']=gpkg(F/'maps/response_infrastructure_cells.gpkg','energy_facilities')
fg['Exploratory hazard line segments']=gpkg(F/'maps/gis_hazard_segments.gpkg','segments')
fg['Road risk intervals']=gpkg(F/'maps/road_risk_intervals.gpkg','risk_intervals')
for name,g in fg.items():write_json(fd/'data'/(re.sub('[^a-z0-9]+','-',name.lower()).strip('-')+'.geojson'),g)
captions=json.loads((F/'captions.json').read_text())
for f in ff:f['caption']=captions.get(f['id'],'Source analytical figure; refer to the associated tables and model validation notes.')

# Display palettes are fixed across scenarios. Values are read from the native
# raster on click, never from the colour-rendered or resampled image.
PALETTES={
 'score':['#fff6d5','#ffd17a','#f0904d','#d14738','#7e173e'],
 'hazard':['#d2dad7','#fdf4c0','#fee28b','#fbb55c','#ee7144','#ca343b','#781d3e'],
 'risk':['#d2dad7','#ffedbc','#f8b35b','#e26b44','#9e2845'],
 'novelty':['#70bdad','#cb4560'],
 'change':['#167e87','#8ec9ca','#f2efe6','#edaa80','#bc3645']}
def rgb(h):return np.array([int(h[i:i+2],16) for i in (1,3,5)])
def colors(a,kind,vmin,vmax):
    palette=PALETTES[kind]
    if kind in ['hazard','risk','novelty']:
        idx=np.clip(np.nan_to_num(a,nan=0).astype(int),0,len(palette)-1)
        return np.array([rgb(h) for h in palette],dtype=np.uint8)[idx]
    frac=np.clip((a-vmin)/(vmax-vmin),0,1)*(len(palette)-1)
    lo=np.floor(np.nan_to_num(frac)).astype(int);hi=np.minimum(lo+1,len(palette)-1);w=np.nan_to_num(frac-lo)[...,None]
    pal=np.array([rgb(h) for h in palette]);return (pal[lo]*(1-w)+pal[hi]*w).astype('uint8')

rasters=[]
for family,prefix,configs in [
 ('ECLIPS','ml',['HIST_199110','RCP45_CLMcom_CCLM_202140','RCP45_CLMcom_CCLM_204160','RCP85_CLMcom_CCLM_202140','RCP85_CLMcom_CCLM_204160']),
 ('CHELSA','chelsa',['HIST_1991_2020']+[f'{rcp}_CSC_REMO2009_{per}' for rcp in ['RCP45','RCP85'] for per in ['2021_2040','2041_2060','2061_2080']])]:
    metrics={'susceptibility':('Relative RF score','score',0,1),'hazard':('Ordinal hazard class','hazard',0,6),
      'risk_population':('Population risk class','risk',0,4),'risk_economic':('Economic risk class','risk',0,4),
      'risk_ecological':('Ecological risk class','risk',0,4),'risk_ecological_economic':('Ecological–economic risk class','risk',0,4)}
    for conf in configs:
        mm=dict(metrics)
        if not conf.startswith('HIST'):
            mm['climate_novelty']=('Outside training climate','novelty',0,1)
            mm['susceptibility_change' if prefix=='ml' else 'score_change']=('RF score change from historical','change',-1,1)
        for metric,(title,kind,vmin,vmax) in mm.items():
            p=F/'maps'/f'{prefix}_{metric}_{conf}.tif'
            if not p.exists():continue
            rid=p.stem
            with rasterio.open(p) as src:
                native=src.read(1,masked=True).astype('float64').filled(np.nan)
                trans,width,height=calculate_default_transform(src.crs,'EPSG:3857',src.width,src.height,*src.bounds,resolution=180)
                arr=np.full((height,width),np.nan,dtype='float32')
                reproject(native,arr,src_transform=src.transform,src_crs=src.crs,dst_transform=trans,dst_crs='EPSG:3857',src_nodata=np.nan,dst_nodata=np.nan,resampling=Resampling.nearest)
                rgba=np.concatenate([colors(arr,kind,vmin,vmax),np.where(np.isfinite(arr),255,0).astype('uint8')[...,None]],axis=-1)
                Image.fromarray(rgba).save(fd/'rasters'/f'{rid}.png')
                west,south,east,north=transform_bounds('EPSG:3857','EPSG:4326',trans.c,trans.f+height*trans.e,trans.c+width*trans.a,trans.f)
                obj={'width':src.width,'height':src.height,'transform':list(src.transform)[:6],'radius':6371007.181,'projection':'MODIS sinusoidal','values':native.reshape(-1).tolist()}
                js_data(fd/'rasters'/f'{rid}.js','ATLAS_RASTER_PENDING',{'id':rid,**obj})
                rasters.append({'id':rid,'family':family,'configuration':conf,'metric':metric,'title':title,'palette':PALETTES[kind],'kind':kind,'min':vmin,'max':vmax,'bounds':[[south,west],[north,east]],'image':f'rasters/{rid}.png','native':'rasters/'+rid+'.js','valid_cells':int(np.isfinite(native).sum()),'source':'maps/'+p.name})

meta={n:json.loads((F/n).read_text()) for n in ['ML_MODEL_METADATA.json','CHELSA_MODEL_METADATA.json','FINAL_VERIFICATION.json','RUN_STATUS.json']}
js_data(fd/'data/catalog.js','ATLAS_DATA',{'hazard':'wildfires','tables':ft,'geo':fg,'figures':ff,'rasters':rasters,'metadata':meta})

# Preserve the supplied analytical narrative and captions; only web asset links
# change. Inaccessible source-notebook/template links are labelled in the app.
report=(F/'FINAL_REPORT_EN.html').read_text()
report=re.sub(r'figures/([^"\']+)\.png',r'figures/\1.webp',report)
report=report.replace('maps/Alanya_infrastructure_atlas.html','index.html#module=evidence').replace('maps/Alanya_wildfire_atlas.html','index.html#module=evidence')
report=re.sub(r'tables/([^"\']+\.csv)',r'downloads/\1',report)
report=report.replace('GALLERY.html','index.html#view=figures&allFigures=1')
report=re.sub(r'<a href="(\.\./[^"\n]+\.ipynb)">([^<]+)</a>',r'<span title="Referenced upstream notebook; not included in the supplied output archive">\2 (not included in uploaded outputs)</span>',report)
(fd/'source-report.html').write_text(report)

for dest in [dd,fd]:
    with zipfile.ZipFile(dest/'downloads/web-map-vectors.zip','w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for p in sorted((dest/'data').glob('*.geojson')):z.write(p,p.name)

print(json.dumps({'drought':{'features':{k:len(v['features']) for k,v in dg.items()},'figures':len(df),'tables':len(dt)},'wildfires':{'layers':len(fg),'rasters':len(rasters),'figures':len(ff),'tables':len(ft)},'total_MB':sum(p.stat().st_size for p in SITE.rglob('*') if p.is_file())/1e6},indent=2))
