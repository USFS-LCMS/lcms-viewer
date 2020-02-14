import ee,json
from collections import OrderedDict
ee.Initialize()

assets = ['projects/USFS/LCMS-NFS/R1/FNF/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection-R1',\
            'projects/USFS/LCMS-NFS/R4/BT/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection-TRA',\
            'projects/USFS/LCMS-NFS/R4/MLS/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection']
assetsAK = ['projects/USFS/LCMS-NFS/R10/CK/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection']


lcJSONdict = OrderedDict()
lcJSONdict['1'] = {'name': 'Water', 'color': '2a74b8'}
lcJSONdict['2'] = {'name': 'Snow/ice', 'color': '8cfffc'}
lcJSONdict['3'] = {'name': 'Impervious', 'color': 'F0F'}
lcJSONdict['4'] = {'name': 'Barren', 'color': 'b67430'}
lcJSONdict['5'] = {'name': 'Grass/forb/herb', 'color': '78db53'}
lcJSONdict['6'] = {'name': 'Shrubs', 'color': 'ffb88c'}
lcJSONdict['7'] = {'name': 'Trees', 'color': '32681e'}
# lcJSONdict['8'] = {'name': 'Trees', 'color': '32681e'} 
for asset in assets:
    ee.data.setAssetProperties(asset, {'landcoverJSON':json.dumps(lcJSONdict)})

lcJSONdictAK = OrderedDict()
lcJSONdictAK['1'] = {'name': 'Water', 'color': '2a74b8'}
lcJSONdictAK['2'] = {'name': 'Snow/ice', 'color': '8cfffc'}
lcJSONdictAK['3'] = {'name': 'Impervious', 'color': 'F0F'}
lcJSONdictAK['4'] = {'name': 'Barren', 'color': 'b67430'}
lcJSONdictAK['5'] = {'name': 'Grass/forb/herb', 'color': '78db53'}
lcJSONdictAK['6'] = {'name': 'Shrubs', 'color': 'ffb88c'}
lcJSONdictAK['7'] = {'name': 'Tall Shrub', 'color': 'ff0000'}
lcJSONdictAK['8'] = {'name': 'Trees', 'color': '32681e'} 
for asset in assetsAK:
    ee.data.setAssetProperties(asset, {'landcoverJSON':json.dumps(lcJSONdictAK)})
