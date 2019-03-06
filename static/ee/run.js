// function run(){

//   function addTimeBand(img){
//   var d = ee.Date(img.get('system:time_start'));
//   var years = d.difference(ee.Date('0000-01-01'), 'year');
//   // var y = d.get('year');
//   // var p = d.getFraction('year');
//   y = ee.Image(years).updateMask(img.mask()).rename('year').float().copyProperties(img,['system:time_start'])

//   return img.addBands(y);
// }

//   // Map2.addREST(standardTileURLFunction('https://landfire.cr.usgs.gov/arcgis/services/Landfire/US_140/MapServer/WCSServer/'),'Hillshade',false,15, 'Hillshade for draping layers over')
// var mtbs = ee.ImageCollection('users/ianhousman/MTBS/Collection');
// mtbs = mtbs.map(function(img){return img.select([0],['burnSeverity']).byte().updateMask(img.neq(0).and(img.neq(6)))});
// var mtbsForViz = mtbs.map(addTimeBand);

// mtbsForViz = mtbsForViz.qualityMosaic('year');
// Map2.addLayer(mtbsForViz.select([0]),{'min':1,'max':6,'palette':'006400,7fffd4,ffff00,ff0000,7fff00,ffffff','opacity':1,'addToLegend':false},'MTBS 1984-2015 Severity Composite',false,null,null,'Burn severity  from Monitoring Trends in Burn Severity project (mtbs.gov). Most recent year burned is displayed. Use double-click charting to chart all years (1984-2015)')
// Map2.addLayer(mtbsForViz.select([1]),{'min':1984,'max':2015,'palette':'9400D3,4B0082,00F,0F0,FF0,FF7F00,F00'},'MTBS 1984-2015 Year of Most Recent Fire',false,'','FFF','Year of most recent fire from Monitoring Trends in Burn Severity project (mtbs.gov). Most recent year burned is displayed. Use double-click charting to chart all years (1984-2015)')


  
// }
var warningShown = false;
function run(){

function multBands(img,distDir,by){
    var out = img.multiply(ee.Image(distDir).multiply(by));
    out  = out.copyProperties(img,['system:time_start'])
              .copyProperties(img);
    return out;
  }
function additionBands(img,howMuch){
    var out = img.add(ee.Image(howMuch));
    out  = out.copyProperties(img,['system:time_start'])
              .copyProperties(img);
    return out;
  }
function simpleAddIndices(in_image){
    in_image = in_image.addBands(in_image.normalizedDifference(['nir', 'red']).select([0],['NDVI']));
    in_image = in_image.addBands(in_image.normalizedDifference(['nir', 'swir2']).select([0],['NBR']));
    in_image = in_image.addBands(in_image.normalizedDifference(['nir', 'swir1']).select([0],['NDMI']));
    in_image = in_image.addBands(in_image.normalizedDifference(['green', 'swir1']).select([0],['NDSI']));
  
    return in_image;
}
/////////////////////////////////////////////////
//Helper function to join two collections- Source: code.earthengine.google.com
    function joinCollections(c1,c2, maskAnyNullValues){
      if(maskAnyNullValues === undefined || maskAnyNullValues === null){maskAnyNullValues = true}
      var MergeBands = function(element) {
        // A function to merge the bands together.
        // After a join, results are in 'primary' and 'secondary' properties.
        return ee.Image.cat(element.get('primary'), element.get('secondary'));
      };

      var join = ee.Join.inner();
      var filter = ee.Filter.equals('system:time_start', null, 'system:time_start');
      var joined = ee.ImageCollection(join.apply(c1, c2, filter));
     
      joined = ee.ImageCollection(joined.map(MergeBands));
      if(maskAnyNullValues){
        joined = joined.map(function(img){return img.mask(img.mask().and(img.reduce(ee.Reducer.min()).neq(0)))});
      }
      return joined;
    }
///////////////////////////////////////////////
function thresholdChange(changeCollection,changeThreshLower,changeThreshUpper,changeDir){
  if(changeDir === undefined || changeDir === null){changeDir = 1}
  var bandNames = ee.Image(changeCollection.first()).bandNames();
  bandNames = bandNames.map(function(bn){return ee.String(bn).cat('_change_year')});
  var change = changeCollection.map(function(img){
    var yr = ee.Date(img.get('system:time_start')).get('year');
    var changeYr = img.multiply(changeDir).gte(changeThreshLower).and(img.multiply(changeDir).lte(changeThreshUpper));
    var yrImage = img.where(img.mask(),yr);
    changeYr = yrImage.updateMask(changeYr).rename(bandNames).int16();
    return img.updateMask(changeYr.mask()).addBands(changeYr);
  });
  return change;
}
function setNoData(image,noDataValue){
  var m = image.mask();
  image = image.mask(ee.Image(1));
  image = image.where(m.not(),noDataValue);
  return image;
}
//////////////////////////////////////////////////////
// var PALETTE = [
//   'b67430', // Barren
//   '78db53', // Grass/forb/herb
//   'F0F',//Impervious
//   'ffb88c', // Shrubs
//   '8cfffc', // Snow/ice
//   '32681e', // Trees
//   '2a74b8'  // Water
// ];


var gnp = ee.FeatureCollection('projects/USFS/LCMS-NFS/R1/FNF/GNP_Admin_Bndy');
var fnf = ee.FeatureCollection('projects/USFS/LCMS-NFS/R1/FNF/FNF_Admin_Bndy');
var bt = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/BT/BT_LCMS_ProjectArea_5km');

var fnfStudyAreas = [['Glacier NP',gnp],
                    ['Flathead  NF',fnf]]

var btStudyAreas = [['Bridger Teton NF',bt]]

var PALETTE = 'b67430,78db53,F0F,ffb88c,8cfffc,32681e,2a74b8'


var declineYearPalette = 'ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02';
var recoveryYearPalette = '54A247,AFDEA8,80C476,308023,145B09';

var declineProbPalette = 'F5DEB3,D00';
var recoveryProbPalette = 'F5DEB3,006400';

var declineDurPalette = 'BD1600,E2F400,0C2780';
var recoveryDurPalette = declineDurPalette;

// var studyAreaName = 'FNF';
var collectionDict = {
  'FNF': ['projects/USFS/LCMS-NFS/R1/Composites/R1-Composite-Collection',
  // 'projects/USFS/LCMS-NFS/R1/FNF/Landcover-Change/Landcover-Change-Collection',
  'projects/USFS/LCMS-NFS/R1/FNF/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection-R1',
  'projects/USFS/LCMS-NFS/R1/Base-Learners/LANDTRENDR-Collection',
  'projects/USFS/LCMS-NFS/R1/Base-Learners/Harmonic-Coefficients',
  fnfStudyAreas,
  'projects/USFS/LCMS-NFS/R1/FNF/TimeSync/FNF_Prob_Checks_TimeSync_Annualized_Table',
  'projects/USFS/LCMS-NFS/R1/FNF/FNF_GNP_Merge_Admin_BND_1k'
  ],

  'BTNF':['projects/USFS/LCMS-NFS/R4/Composites/R4-Composite-Collection',
  'projects/USFS/LCMS-NFS/R4/BT/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection-TRA',
  'projects/USFS/LCMS-NFS/R4/Base-Learners/LANDTRENDR-Collection',
  'projects/USFS/LCMS-NFS/R4/Base-Learners/Harmonic-Coefficients',
  btStudyAreas,
  'projects/USFS/LCMS-NFS/R4/BT/TimeSync/BT_Prob_Checks_TimeSync_Annualized_Table',
  'projects/USFS/LCMS-NFS/R4/BT/TetonRiskExtent'
  ]
  
}

var ts = ee.ImageCollection(collectionDict[studyAreaName][5]);
var boundary = ee.FeatureCollection(collectionDict[studyAreaName][6]);
var NFSLCMS = ee.ImageCollection(collectionDict[studyAreaName][1])
              .filter(ee.Filter.stringContains('system:index','DNDSlow-DNDFast'))
              .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
              .select(['LC','LU','CP','DND','RNR','DND_Slow','DND_Fast'])
              .map(function(img){return ee.Image(additionBands(img,[1,1,1,0,0,0,0])).clip(boundary)})
              .map(function(img){return ee.Image(multBands(img,1,[0.1,0.1,0.1,0.01,0.01,0.01,0.01])).float()})
              .select([0,1,2,3,4,5,6],['Land Cover Class','Land Use Class','Change Process','Loss Probability','Gain Probability','Slow Loss Probability','Fast Loss Probability']);
// var NFSLCMSold = ee.ImageCollection(collectionDict[studyAreaName][1])
//               .filter(ee.Filter.stringContains('system:index','DNDSlow-DNDFast').not())
//               .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
//               .map(function(img){return ee.Image(additionBands(img,[1,1,1,0,0]))})
//               .map(function(img){return ee.Image(multBands(img,1,[0.1,0.1,0.1,0.01,0.01])).float()})
//               .select([0,1,2,3,4],['Land Cover Class','Land Use Class','Change Process','Decline Probability','Recovery Probability']);

var NFSLC =  NFSLCMS.select([0]);
var NFSLU =  NFSLCMS.select([1]);
var NFSCP =  NFSLCMS.select([2]);

var NFSDND = NFSLCMS.select([3]);

// var NFSDNDold = NFSLCMSold.select([3]);

var NFSRNR = NFSLCMS.select([4]);

var NFSDNDSlow = NFSLCMS.select([5]);
var NFSDNDFast = NFSLCMS.select([6]);

var dndThresh = thresholdChange(NFSDND,lowerThresholdDecline,upperThresholdDecline, 1);

// var dndThreshOld = thresholdChange(NFSDNDold,lowerThresholdDecline,upperThresholdDecline, 1)

var rnrThresh = thresholdChange(NFSRNR,lowerThresholdRecovery, upperThresholdRecovery, 1);

var dndSlowThresh = thresholdChange(NFSDNDSlow,lowerThresholdDecline,upperThresholdDecline, 1);
var dndFastThresh = thresholdChange(NFSDNDFast,lowerThresholdDecline,upperThresholdDecline, 1);



//Bring in reference data
var hansen = ee.Image('UMD/hansen/global_forest_change_2017_v1_5');
var hansenLoss = hansen.select(['lossyear']).add(2000).int16();
var hansenGain = hansen.select(['gain']);
hansenLoss = hansenLoss.updateMask(hansenLoss.neq(2000).and(hansenLoss.gte(startYear)).and(hansenLoss.lte(endYear)));
Map2.addLayer(hansenLoss,{'min':startYear,'max':endYear,'palette':declineYearPalette},'Hansen Loss Year',false,null,null,'Hansen Global Forest Change year of loss','reference-layer-list');
Map2.addLayer(hansenGain.updateMask(hansenGain),{'min':1,'max':1,'palette':'0A0',addToClassLegend: true,classLegendDict:{'Forest Gain':'0A0'}},'Hansen Gain',false,null,null,'Hansen Global Forest Change gain','reference-layer-list');

if(studyAreaName === 'FNF'){
 var vmap = ee.FeatureCollection('projects/USFS/LCMS-NFS/R1/FNF/Ancillary/FNF_VMap')//.limit(100000);
var lfCodes  = [3100,3300,4000,5000,7000,7100];
var cCodes = [3100,3300,4001,4002,4003,4004,5000,7000,7100,8601,8602];

var lfNames = ['HERB','SHRUB','TREE','WATER','SPVEG','URBAN'];
var cNames = ['HERB','SHRUB','CTR 10-24.9%','CTR 25-39.9%','CTR 40-59.9%','CTR >= 60%','WATER','SPVEG','URBAN','DTR 10-39.9%','DTR >= 40%'];


var lfColorsHex = 'ffffbe,ffbee8,4c7300,002673,828282,000000';
var cColorsHex = 'ffffbe,ffbee8,ffff00,aaff00,4c7300,734c00,002673,828282,000000,ff73df,ff00c5';
function toDict(keys,values) {
  var l = keys.length;
  var out = new Object();
  for(var i = 0;i< l;i++){
    console.log(i);
    out[keys[i]] = values[i];
  }
    return out;
}
var lfDict = toDict(lfNames,lfColorsHex.split(','));
var cDict = toDict(cNames,cColorsHex.split(','));

var properties = [['LIFEFORM',lfCodes,lfColorsHex,lfDict],['TREECANOPY',cCodes,cColorsHex,cDict]];
var vmapExport = ee.Image('projects/USFS/LCMS-NFS/R1/FNF/Ancillary/VMAP-Lifeform-TreeCanopy');

properties.map(function(prop){
  // var vmapRast = vmap.reduceToImage([prop[0]],ee.Reducer.first());
  var vmapRast = vmapExport.select([prop[0]]);
  vmapRast = vmapRast.remap(prop[1],ee.List.sequence(1,prop[1].length));
  
  Map2.addLayer(vmapRast,{min:1,max:prop[1].length,palette:prop[2],addToClassLegend: true,classLegendDict:prop[3]},'VMAP-'+prop[0],false,null,null,'VMAP layer attribute: '+prop[0],'reference-layer-list')
})

var wb = ee.Image('projects/USFS/LCMS-NFS/R1/FNF/Ancillary/IRPSV102_WHITEBARK');
wb = wb.updateMask(wb)
Map2.addLayer(wb,{min:1,max:1,palette:'080',addToLegend:false},'Whitebark Pine',false,null,null,'Extent of potential Whitebark Pine','reference-layer-list')

var gnpHUC = ee.FeatureCollection('projects/USFS/LCMS-NFS/R1/FNF/Ancillary/GNP_Huc12');
Map2.addLayer(gnpHUC,{palette:'0088FF',addToLegend:false},'GNP HUC 12',false,null,null,null,'reference-layer-list')

}
if(studyAreaName === 'BTNF'){
  
var wbp = ee.Image('projects/USFS/LCMS-NFS/R4/BT/Ancillary/gya_absdmg_wbp_th');
var wbpPalette = 'D40AFA,1168F5,00FA00,FAFA00,FA0000';
var wbpClassDict = {'No canopy damage':'D40AFA',
                    'Low canopy damage':'1168F5',
                    'Low/Moderate canopy damage':'00FA00',
                    'Moderate canopy damage':'FAFA00',
                    'High canopy damage':'FA0000'}
var wbpViz = {'min':1,'max':5,'palette':wbpPalette,addToClassLegend: true,classLegendDict:wbpClassDict}

Map2.addLayer(wbp.updateMask(wbp.neq(0)),wbpViz,'GYA Whitebark Pine Mortality',false,null,null,'Mortality from two date change detection over Whitebark Pine areas of the Greater Yellowstone Area','reference-layer-list');


var canopyCover = ee.Image('projects/USFS/LCMS-NFS/R4/BT/Ancillary/BT_VegExistingMidLevel_CanopyCover_2018');
var treeSize = ee.Image('projects/USFS/LCMS-NFS/R4/BT/Ancillary/BT_VegExistingMidLevel_TreeSize_2018');
var vegType = ee.Image('projects/USFS/LCMS-NFS/R4/BT/Ancillary/BT_VegExistingMidLevel_VegType_2018');

var canopyCoverClassDict = {"Tree Canopy 1 (10-19%)": "f400f4", "Tree Canopy 2 (20-29%)": "9311e2", "Tree Canopy 3 (30-39%)": "0000f4", "Tree Canopy 4 (40-49%)": "00f400", "Tree Canopy 5 (50-59%)": "f4f400", "Tree Canopy 6 (60-69%)": "f49900", "Tree Canopy 7 (70-100%)": "f40000", "Shrub Canopy 1 (10-24%)": "e8e8d1", "Shrub Canopy 2 (25-100%)": "c4a57f", "No Canopy Cover": "b2b2b2"};
var canopyCoverPalette = 'f400f4,9311e2,0000f4,00f400,f4f400,f49900,f40000,e8e8d1,c4a57f,b2b2b2';
var canopyCoverViz = {min:1,max:10,palette:canopyCoverPalette,addToClassLegend: true,classLegendDict:canopyCoverClassDict};

var treeSizeClassDict = {"Tree Size 2  (< 5 dbh)": "0000f9", "Tree Size 3  (5 - 9.9 dbh)": "00f900", "Tree Size 4 (10 - 19.9  dbh)": "f9f900", "Tree Size 5  (20 - 29.9 dbh)": "f99e00", "Tree Size 6  (30.0+  dbh)": "f90000", "Non-Forest": "666666"};
var treeSizePalette = '0000f9,00f900,f9f900,f99e00,f90000,666666';
var treeSizeViz = {min:2,max:7,palette:treeSizePalette,addToClassLegend: true,classLegendDict:treeSizeClassDict};

var vegTypeClassDict = {"Urban/Developed": "6b6b6b", "Water": "0000b5", "Snow/Ice": "a5a5a5", "Barren/Rock": "0c0c0c", "Sparse Vegetation": "d3bf9b", "Alpine Vegetation": "f26df2", "Tall Forbland": "0054c1", "Riparian Herbland": "d81919", "Agriculture": "3d0030", "Grassland/Forbland": "dddd00", "Low/Alkali Sagebrush": "e26b00", "Sagebrush/Bitterbrush Mix": "a33d00", "Mountain Big Sagebrush": "f49b00", "Spiked Big Sagebrush": "f43a00", "Mountain Mahogany": "4f997c", "Mountain Shrubland": "9314e2", "Silver Sagebrush/Shrubby Cinquef": "aa8200", "Willow": "bf0000", "Cottonwood": "930000", "Aspen": "00f9f9", "Aspen/Conifer Mix": "00bfbf", "Rocky Mountain Juniper": "6b00f7", "Limber Pine": "47ad47", "Douglas-fir Mix": "16ed16", "Lodgepole Pine Mix": "7c633d", "Spruce/Subalpine Fir Mix": "005b00", "White Bark Pine": "600000", "White Bark Pine Mix": "280000"};
var vegTypePalette = '6b6b6b,0000b5,a5a5a5,0c0c0c,d3bf9b,f26df2,0054c1,d81919,3d0030,dddd00,e26b00,a33d00,f49b00,f43a00,4f997c,9314e2,aa8200,bf0000,930000,00f9f9,00bfbf,6b00f7,47ad47,16ed16,7c633d,005b00,600000,280000';
var vegTypeViz = {min:1,max:28,palette:vegTypePalette,addToClassLegend: true,classLegendDict:vegTypeClassDict};

Map2.addLayer(canopyCover.updateMask(canopyCover.neq(0)),canopyCoverViz,'VCMQ 2018 Canopy Cover',false,null,null,'Mortality from two date change detection over Whitebark Pine areas of the Greater Yellowstone Area','reference-layer-list');
Map2.addLayer(treeSize.updateMask(treeSize.neq(0)),treeSizeViz,'VCMQ 2018 Tree Size',false,null,null,'Mortality from two date change detection over Whitebark Pine areas of the Greater Yellowstone Area','reference-layer-list');
Map2.addLayer(vegType.updateMask(vegType.neq(0)),vegTypeViz,'VCMQ 2018 Veg Type',false,null,null,'Mortality from two date change detection over Whitebark Pine areas of the Greater Yellowstone Area','reference-layer-list');


}

var idsStartYear = 1997;
  var idsEndYear = 2015
  var idsYears = ee.List.sequence(idsStartYear,idsEndYear).getInfo();

var mortCollection = idsYears.map(function(yr){
  var mort = ee.FeatureCollection('projects/USFS/FHAAST/IDS/IDS_Mort_' + yr.toString());
  mort = mort.reduceToImage(['DAMAGE_TYP'],ee.Reducer.first()).set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
  var yrBand = ee.Image(yr).updateMask(mort.mask()).rename(['year']).int16();
  return mort.rename(['mort_code']).addBands(yrBand);
});
mortCollection = ee.ImageCollection(mortCollection);

Map2.addLayer(mortCollection.select([0]).count(),{'min':1,'max':Math.floor((idsEndYear-idsStartYear)/4),palette:declineYearPalette},'IDS Survey Count',false,null,null, 'Number of times an area was recorded as mortality by the IDS survey','reference-layer-list');
Map2.addLayer(mortCollection.select([1]).max(),{min:startYear,max:endYear,palette:declineYearPalette},'IDS Most Recent Year of Mortality',false,null,null, 'Most recent year an area was recorded as mortality by the IDS survey','reference-layer-list');

var mtbs = ee.ImageCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/MTBS')
          .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
          .map(function(img){return img.updateMask(img.neq(0))});


mtbs = mtbs.map(function(img){return img.select([0],['burnSeverity']).byte()
// .updateMask(img.neq(0).and(img.neq(6)))
});
var mtbsForYear = mtbs.map(function(img){return img.remap([1,2,3,4,5,6],[1,2,3,4,5,1]).rename(['burnSeverity'])});

var mtbsYear = thresholdChange(mtbsForYear,1,10,1).qualityMosaic('burnSeverity').select([1])

var mtbsClassDict = {
  'Unburned to Low': '006400',
  'Low':'7fffd4',
  'Moderate':'ffff00',
  'High':'ff0000',
  'Increased Greenness':'7fff00',
  'Non-Processing Area Mask':'ffffff'
}

var severityViz = {'min':1,'max':6,'palette':'006400,7fffd4,ffff00,ff0000,7fff00,ffffff',addToClassLegend: true,classLegendDict:mtbsClassDict}

Map2.addLayer(mtbs.select([0]).max(),severityViz,'MTBS Severity Composite',false,null,null,'MTBS CONUS burn severity mosaic from 1984-2016','reference-layer-list')
Map2.addLayer(mtbsYear,{min:startYear,max:endYear,palette:declineYearPalette},'MTBS Year of Highest Severity',false,null,null,'MTBS CONUS year of highest mapped burn severity from 1984-2016','reference-layer-list')


var studyAreas = collectionDict[studyAreaName][4];
studyAreas.map(function(studyArea){
  Map2.addLayer(studyArea[1],{palette:'d9d9d9',addToLegend:false},studyArea[0],false,null,null,null,'reference-layer-list')
// 
})


if(summaryMethod === 'year'){
  var dndThreshOut = dndThresh.qualityMosaic('Loss Probability_change_year');//.qualityMosaic('Decline_change');
  // var dndThreshOutOld = dndThreshOld.qualityMosaic('Decline Probability_change_year');//.qualityMosaic('Decline_change');
  

  var rnrThreshOut = rnrThresh.qualityMosaic('Gain Probability_change_year');//.qualityMosaic('Recovery_change');
  
  var dndSlowThreshOut = dndSlowThresh.qualityMosaic('Slow Loss Probability_change_year');//.qualityMosaic('Decline_change');
  var dndFastThreshOut = dndFastThresh.qualityMosaic('Fast Loss Probability_change_year');//.qualityMosaic('Recovery_change');
  

  var threshYearNameEnd = 'Most recent year of ';
  var threshProbNameEnd = 'Probability of most recent year of ';
}
else{
  var dndThreshOut = dndThresh.qualityMosaic('Loss Probability');//.qualityMosaic('Decline_change');
  
  // var dndThreshOutOld = dndThreshOld.qualityMosaic('Decline Probability');//.qualityMosaic('Decline_change');
  

  var rnrThreshOut = rnrThresh.qualityMosaic('Gain Probability');//.qualityMosaic('Recovery_change');
  
  var dndSlowThreshOut = dndSlowThresh.qualityMosaic('Slow Loss Probability');//.qualityMosaic('Decline_change');
  var dndFastThreshOut = dndFastThresh.qualityMosaic('Fast Loss Probability');//.qualityMosaic('Recovery_change');
  

  var threshYearNameEnd = 'Year of highest probability of ';
  var threshProbNameEnd = 'Highest probability of ';
}




var dndCount = dndThresh.select([0]).count();
var rnrCount = rnrThresh.select([0]).count();

var dndSlowCount = dndSlowThresh.select([0]).count();
var dndFastCount = dndFastThresh.select([0]).count();

var composites = ee.ImageCollection(collectionDict[studyAreaName][0])
        .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
        // .filter(ee.Filter.equals('cloudcloudShadowMaskingMethod','fmask'))
        .map(function(img){return multBands(img,1,0.0001)})
        .map(simpleAddIndices)
        // .map(getImageLib.getTasseledCap)
        // .map(getImageLib.simpleAddTCAngles)
        // .select(['NBR']);
if(analysisMode === 'advanced'){
 //Get composites

var lastYearAdded = false;
ee.List.sequence(startYear,endYear,10).getInfo().map(function(yr){
  var c = ee.Image(composites.filter(ee.Filter.calendarRange(yr,yr,'year')).first());
  Map2.addLayer(c,{min:0.05,max:0.4,bands:'swir1,nir,red'},'Landsat Composite '+yr.toString(),false)
  if(yr === endYear){lastYearAdded = true}
})
if(lastYearAdded === false){
  // var c1 = ee.Image(composites.first());
var c2 = ee.Image(composites.sort('system:time_start',false).first());
// Map2.addLayer(c1,{min:0.05,max:0.4,bands:'swir1,nir,red'},'Landsat Composite '+startYear.toString(),false)
Map2.addLayer(c2,{min:0.05,max:0.4,bands:'swir1,nir,red'},'Landsat Composite '+endYear.toString(),false)

}

}

//Get LANDTRENDR fitted values        
var fittedAsset = ee.ImageCollection(collectionDict[studyAreaName][2])
        .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
        .map(function(img){return multBands(img,1,0.0001)})
        .select(['LT_Fitted_'+whichIndex]);



var declineNameEnding = '('+startYear.toString() + '-' + endYear.toString()+') (p >= '+lowerThresholdDecline.toString()+' and p <= '+upperThresholdDecline.toString()+')';
var recoveryNameEnding = '('+startYear.toString() + '-' + endYear.toString()+') (p >= '+lowerThresholdRecovery.toString()+' and p <= '+upperThresholdRecovery.toString()+')';



var lcLayerName =  'Land Cover (mode) '+ startYear.toString() + '-'+ endYear.toString();

var luPalette = "efff6b,ff2ff8,1b9d0c,97ffff,a1a1a1,c2b34a";
var luLayerName =  'Land Use (mode) '+ startYear.toString() + '-'+ endYear.toString();

var landcoverClassLegendDict = {'Barren (0.1 in chart)':'b67430',
                        'Grass/forb/herb (0.2 in chart)':'78db53',
                        'Grass/forb/herb (0.2 in chart)':'78db53',
                        'Impervious (0.3 in chart)':'F0F',
                        'Shrubs (0.4 in chart)':'ffb88c',
                        'Snow/ice (0.5 in chart)':'8cfffc',
                        'Trees (0.6 in chart)':'32681e',
                        'Water (0.7 in chart)':'2a74b8'};

var landuseClassLegendDict = {
  'Agriculture (0.1 in chart)':'efff6b',
  'Developed (0.2 in chart)':'ff2ff8',
  'Forest (0.3 in chart)':'1b9d0c',
  'Non-forest Wetland (0.4 in chart)':'97ffff',
  'Other (0.5 in chart)':'a1a1a1',
  'Rangeland (0.6 in chart)':'c2b34a',

}

// <li><span style='background:#efff6b;'></span>Agriculture (0.1 in chart)</li>
//   <li><span style='background:#ff2ff8;'></span>Developed (0.2 in chart)</li>
//   <li><span style='background:#1b9d0c;'></span>Forest (0.3 in chart)</li>
//   <li><span style='background:#97ffff;'></span>Non-forest Wetland (0.4 in chart)</li>
//   <li><span style='background:#a1a1a1;'></span>Other (0.5 in chart)</li>
//   <li><span style='background:#c2b34a;'></span>Rangeland (0.6 in chart)</li>
// Map2.addLayer(ee.Image(1),{addToClassLegend: true,classLegendDict:classLegendDict },'thisisatest',false)

// Map2.addLayer(NFSCP.max().multiply(10),{min:0,max:4},'Change Process',false);
if(analysisMode === 'advanced'){
  Map2.addLayer(NFSLC.mode().multiply(10),{'palette':PALETTE,'min':1,'max':7,addToClassLegend: true,classLegendDict:landcoverClassLegendDict}, lcLayerName,false); 
  Map2.addLayer(NFSLU.mode().multiply(10),{'palette':luPalette,'min':1,'max':6,addToClassLegend: true,classLegendDict:landuseClassLegendDict}, luLayerName,false); 
}





// Map2.addLayer(dndThreshMostRecent.select([1]),{'min':startYear,'max':endYear,'palette':'FF0,F00'},studyAreaName +' Decline Year',true,null,null,'Year of most recent decline ' +declineNameEnding);
// Map2.addLayer(dndThreshMostRecent.select([0]),{'min':lowerThresholdDecline,'max':upperThresholdDecline,'palette':'FF0,F00'},studyAreaName +' Decline Probability',false,null,null,'Most recent decline ' + declineNameEnding);

Map2.addLayer(dndThreshOut.select([1]),{'min':startYear,'max':endYear,'palette':declineYearPalette},'Loss Year',true,null,null,threshYearNameEnd+'loss ' +declineNameEnding);
// Map2.addLayer(dndThreshOutOld.select([1]),{'min':startYear,'max':endYear,'palette':declineYearPalette },studyAreaName +' Decline Old Year',true,null,null,threshYearNameEnd+'decline ' +declineNameEnding);



// Map2.addLayer(dndThreshOutOld.select([0]),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},studyAreaName +' Decline Old Probability',false,null,null,threshProbNameEnd+ 'decline ' + declineNameEnding);



if(analysisMode === 'advanced'){
Map2.addLayer(dndThreshOut.select([0]),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},'Loss Probability',false,null,null,threshProbNameEnd+ 'loss ' + declineNameEnding);

Map2.addLayer(dndCount,{'min':1,'max':5,'palette':declineDurPalette},'Loss Duration',false,'years',null,'Total duration of loss '+declineNameEnding);
}
if(viewBeta === 'yes'){
Map2.addLayer(dndSlowThreshOut.select([1]),{'min':startYear,'max':endYear,'palette':declineYearPalette },'Slow Loss Year',false,null,null,threshYearNameEnd+'loss ' +declineNameEnding);
Map2.addLayer(dndSlowThreshOut.select([0]),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},'Slow Loss Probability',false,null,null,threshProbNameEnd+ 'loss ' + declineNameEnding);
Map2.addLayer(dndSlowCount,{'min':1,'max':5,'palette':declineDurPalette},'Slow Loss Duration',false,'years',null,'Total duration of loss '+declineNameEnding);

Map2.addLayer(dndFastThreshOut.select([1]),{'min':startYear,'max':endYear,'palette':declineYearPalette },'Fast Loss Year',false,null,null,threshYearNameEnd+'loss ' +declineNameEnding);
Map2.addLayer(dndFastThreshOut.select([0]),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},'Fast Loss Probability',false,null,null,threshProbNameEnd+ 'loss ' + declineNameEnding);
Map2.addLayer(dndFastCount,{'min':1,'max':5,'palette':declineDurPalette},'Fast Loss Duration',false,'years',null,'Total duration of loss '+declineNameEnding);

}

Map2.addLayer(rnrThreshOut.select([1]),{'min':startYear,'max':endYear,'palette':recoveryYearPalette},'Gain Year',false,null,null,threshYearNameEnd+'gain '+recoveryNameEnding);
if(analysisMode === 'advanced'){
  Map2.addLayer(rnrThreshOut.select([0]),{'min':lowerThresholdRecovery,'max':upperThresholdRecovery,'palette':recoveryProbPalette},'Gain Probability',false,null,null,threshProbNameEnd+'gain '+recoveryNameEnding);
  Map2.addLayer(rnrCount,{'min':1,'max':5,'palette':recoveryDurPalette},'Gain Duration',false,'years',null,'Total duration of gain '+recoveryNameEnding);
}



// Map2.addLayer(studyArea,{palette:'d9d9d9',addToLegend:false},studyAreaName + ' Boundary',true,null,null,'Boundary used for all analysis for the '+studyAreaName,'reference-layer-list')
// Map2.addLayer(gnp,{palette:'d9d9d9',addToLegend:false},'Glacier National Park Boundary',true,null,null,'Boundary of Glacier National Park','reference-layer-list')

///////////////////////////////////////////////////////
//Add exports
var lcForExport = NFSLC.mode().multiply(10).byte();
// lcForExport = setNoData(lcForExport,0).byte();
var luForExport = ee.Image(NFSLU.mode().multiply(10).byte());

var dndYearForExport = dndThreshOut.select([1]).int16();//.subtract(1970).byte();
var dndSevForExport = dndThreshOut.select([0]).multiply(100).add(1).byte();
dndSevForExport = dndSevForExport.where(dndSevForExport.eq(101),100);
var dndCountForExport = dndCount.byte();

var rnrYearForExport = rnrThreshOut.select([1]).int16();//.subtract(1970).byte();
var rnrSevForExport = rnrThreshOut.select([0]).multiply(100).add(1).byte();
rnrSevForExport = rnrSevForExport.where(rnrSevForExport.eq(101),100);
var rnrCountForExport = rnrCount.byte();




if(analysisMode === 'advanced'){
Map2.addExport(lcForExport,studyAreaName +' LCMS Beta Land Cover mode '+ startYear.toString() + '-'+ endYear.toString() ,30,10,120,10,false,{'palette':PALETTE,'min':1,'max':7});
Map2.addExport(luForExport,studyAreaName +' LCMS Beta Land Use mode '+ startYear.toString() + '-'+ endYear.toString() ,30,10,120,10,false,{'palette':luPalette,'min':1,'max':6});
}

Map2.addExport(dndYearForExport,studyAreaName +' LCMS Beta Loss Year '+ startYear.toString() + '-'+ endYear.toString(),30,10,120,10,false,{'min':startYear-1970,'max':endYear-1970,'palette':declineYearPalette});

if(analysisMode === 'advanced'){
Map2.addExport(dndSevForExport,studyAreaName +' LCMS Beta Loss Probability '+ startYear.toString() + '-'+ endYear.toString(),30,10,120,10,false,{'min':lowerThresholdDecline*100,'max':upperThresholdDecline*100,'palette':declineProbPalette});

Map2.addExport(dndCountForExport,studyAreaName +' LCMS Beta Loss Duration '+ startYear.toString() + '-'+ endYear.toString(),30,10,120,10,false,{'min':1,'max':5,'palette':declineDurPalette});

}

Map2.addExport(rnrYearForExport,studyAreaName +' LCMS Beta Gain Year '+ startYear.toString() + '-'+ endYear.toString(),30,10,120,10,false,{'min':startYear-1970,'max':endYear-1970,'palette':recoveryYearPalette});

if(analysisMode === 'advanced'){
  Map2.addExport(rnrSevForExport,studyAreaName +' LCMS Beta Gain Probability '+ startYear.toString() + '-'+ endYear.toString(),30,10,120,10,false,{'min':lowerThresholdRecovery*100,'max':upperThresholdRecovery*100,'palette':recoveryProbPalette});

  Map2.addExport(rnrCountForExport,studyAreaName +' LCMS Beta Gain Duration '+ startYear.toString() + '-'+ endYear.toString(),30,10,120,10,false,{'min':1,'max':5,'palette':recoveryDurPalette});

}
//Set up charting
var forCharting = joinCollections(composites.select([whichIndex]),fittedAsset, false);

if(analysisMode !== 'advanced' && viewBeta === 'no'){
  NFSLCMS =  NFSLCMS.select(['Loss Probability','Gain Probability']);

}
else if(analysisMode !== 'advanced' && viewBeta === 'yes'){
  NFSLCMS =  NFSLCMS.select(['Loss Probability','Gain Probability','Slow Loss Probability','Fast Loss Probability']);

}
else if(analysisMode == 'advanced' && viewBeta === 'no'){
  NFSLCMS =  NFSLCMS.select(['Land Cover Class','Land Use Class','Loss Probability','Gain Probability']);

}
else{
  NFSLCMS =  NFSLCMS.select(['Land Cover Class','Land Use Class','Loss Probability','Gain Probability','Slow Loss Probability','Fast Loss Probability']);

}
forCharting = joinCollections(forCharting,NFSLCMS, false);

chartCollection =forCharting;

if(endYear === 2018 && warningShown === false){warningShown = true;showMessage('!!Caution!!','Including decline detected the last year of the time series (2018) can lead to high commission error rates.  Use with caution!')}

};
