import json,glob,os,sys,numpy
import geeViz.getImagesLib as getImagesLib
import geeViz.taskManagerLib as tml
ee = getImagesLib.ee
Map = getImagesLib.Map
Map.clearMap()
############################################################################
areas = glob.glob('*.geojson')
asset_folder = 'projects/lcms-292214/assets/Dashboard'
areas = [i for i in areas if i.find('LMPU-transition')>-1]
print(areas)
############################################################################
#Make all assets public
def makeTablesPublic(table_dir):
  tables = ee.data.getList({'id':table_dir})
  for table in tables:
      table = table['id']
      print('Making public: ',table)
      ee.data.setAssetAcl(table, json.dumps({u'writers': [], u'all_users_can_read': True, u'readers': []}))
def deleteTables(table_dir,name):
    tables = ee.data.getList({'id':table_dir})
    for table in tables:
        table = table['id']
        if table.find(name)>-1:
            print('deleting: ',table)
            ee.data.deleteAsset(table)
###############################################################
# 14864.693423597679 = 300
# 80871.1376146789 = 50
def uploadTables():
    
    tasks = []
    for area in areas:
        print('Reading in '+area)
        o = open(area,'r')
        geojson = json.load(o)
        o.close()
        nFeatures = len(geojson['features'])
        print(nFeatures)
        size = int(sys.getsizeof(json.dumps(geojson)))
        
        featureSizes = [sys.getsizeof(json.dumps(f)) for f in geojson['features']]
        maxSize = numpy.amax(featureSizes)
        pctl = numpy.percentile(featureSizes,90)
        nFeatureLimitMean = int(4500000/(size/nFeatures))
        nFeatureLimitMax = int(4500000/(maxSize))
        nFeatureLimitPctl = int(3000000/(pctl))
        nFeatureLimit = nFeatureLimitPctl
        print(maxSize,nFeatureLimitMax,nFeatureLimitPctl,nFeatureLimitMean)
        print('{}: {} {} {}'.format(area,size/nFeatures,' bytes/feature. Max features:',nFeatureLimit))
        for i in range(0,nFeatures,nFeatureLimit):
            i2 = i+nFeatureLimit-1
            if i2>nFeatures-1:i2=nFeatures-1
            geojsonT = geojson['features'][i:i2+1]
            fc = ee.FeatureCollection([ee.Feature(f) for f in geojsonT])
            # print(sys.getsizeof(json.dumps(geojsonT)))
            # print(fc.size().getInfo())
            nm = '{}_{}-{}'.format(os.path.splitext(area)[0],i,i2)
            tasks.append(nm)
            print('Exporting: '+nm)
            t = ee.batch.Export.table.toAsset(
                collection=fc,
                description=nm,
                assetId=asset_folder+'/'+nm)
            t.start()
    
    # #     # print(t)
    # #     # Map.addLayer(fc,{},area)
    # # # Map.view()
    # # print(tasks)
    tml.trackTasks2(id_list = tasks)
 
  
###############################################################
uploadTables()
# makeTablesPublic(asset_folder)
# deleteTables(asset_folder,'LTA-')