import ee,json
from collections import OrderedDict
ee.Initialize()

perims  = ee.FeatureCollection('projects/USFS/DAS/MTBS/mtbs_perims_DD').map(lambda f: f.simplify(100))
# perimsL = perims.toList(10000000)
chunkSize = 1000
total = perims.size().getInfo()
chunks = total/chunkSize
remainder = total%chunkSize
years = ee.List.sequence(1984,2019).getInfo()

print(years)
# for i in range(0,total,chunkSize):
# 	start = i
# 	stop = i+chunkSize-1
# 	print(start,stop)
# 	perimsLT = ee.FeatureCollection(perims.toList(chunkSize,start))
# 	out = perimsLT.getInfo()
# 	o = open('mtbs_perims_'+str(start)+'_'+str(stop)+'.json','w')
# 	o.write(json.dumps(out))
# 	o.close()
    # ee.data.setAssetProperties(asset, {'landcoverJSON':json.dumps(lcJSONdictAK)})
