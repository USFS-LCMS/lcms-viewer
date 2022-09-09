import json,glob,os
import geeViz.getImagesLib as getImagesLib
import geeViz.taskManagerLib as tml
ee = getImagesLib.ee
Map = getImagesLib.Map
Map.clearMap()
############################################################################
areas = glob.glob('*.geojson')
asset_folder = 'projects/lcms-292214/assets/Dashboard'
nFeatureLimit = 50
############################################################################
#Make all assets public
def makeTablesPublic(table_dir):
  tables = ee.data.getList({'id':table_dir})
  for table in tables:
      table = table['id']
      print('Making public: ',table)
      ee.data.setAssetAcl(table, json.dumps({u'writers': [], u'all_users_can_read': True, u'readers': []}))
###############################################################
def uploadTables():
    
    tasks = []
    for area in areas[2:]:
        print('Reading in '+area)
        o = open(area,'r')
        geojson = json.load(o)
        o.close()
        nFeatures = len(geojson['features'])
        print(nFeatures)
        for i in range(0,nFeatures,nFeatureLimit):
            i2 = i+nFeatureLimit-1
            if i2>nFeatures-1:i2=nFeatures-1
            
            fc = ee.FeatureCollection([ee.Feature(f) for f in geojson['features'][i:i2+1]])
            print(fc.size().getInfo())
            nm = '{}_{}-{}'.format(os.path.splitext(area)[0],i,i2)
            tasks.append(nm)
            print('Exporting: '+nm)
            t = ee.batch.Export.table.toAsset(
                collection=fc,
                description=nm,
                assetId=asset_folder+'/'+nm)
            t.start()
    
    #     # print(t)
    #     # Map.addLayer(fc,{},area)
    # # Map.view()
    # print(tasks)
    tml.trackTasks2(id_list = tasks)
        # t.start()
        # print(fc.size().getInfo())
  
###############################################################
# uploadTables()
makeTablesPublic(asset_folder)