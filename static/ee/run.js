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
// var studyAreaName = 'FNF';
var collectionDict = {
  'FNF': ['projects/USFS/LCMS-NFS/R1/FNF/Composites/FNF-Composite-Collection',
  // 'projects/USFS/LCMS-NFS/R1/FNF/Landcover-Change/Landcover-Change-Collection',
  'projects/USFS/LCMS-NFS/R1/FNF/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection',
  'projects/USFS/LCMS-NFS/R1/FNF/Base-Learners/LANDTRENDR-Collection',
  'projects/USFS/LCMS-NFS/R1/FNF/Base-Learners/Harmonic-Coefficients',
  fnfStudyAreas
  ],

  'BT':['projects/USFS/LCMS-NFS/R4/BT/Composites/BT-Composite-Collection',
  'projects/USFS/LCMS-NFS/R4/BT/Change/BT-Change-Collection',
  'projects/USFS/LCMS-NFS/R4/BT/Base-Learners/LANDTRENDR-Collection',
  'projects/USFS/LCMS-NFS/R4/BT/Base-Learners/Harmonic-Coefficients',
  btStudyAreas]
  
}

var NFSLCMS = ee.ImageCollection(collectionDict[studyAreaName][1])
              .filter(ee.Filter.stringContains('system:index','DNDSlow-DNDFast'))
              .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
              .map(function(img){return ee.Image(additionBands(img,[1,1,1,0,0,0,0]))})
              .map(function(img){return ee.Image(multBands(img,1,[0.1,0.1,0.1,0.01,0.01,0.01,0.01])).float()})
              .select([0,1,2,3,4,5,6],['Land Cover Class','Land Use Class','Change Process','Decline Probability','Recovery Probability','Slow Decline Probability','Fast Decline Probability']);
print('length');
print(NFSLCMS.size().getInfo());
var NFSLC =  NFSLCMS.select([0]);
var NFSLU =  NFSLCMS.select([1]);
var NFSCP =  NFSLCMS.select([2]);

var NFSDND = NFSLCMS.select([3]);
var NFSRNR = NFSLCMS.select([4]);

var NFSDNDSlow = NFSLCMS.select([5]);
var NFSDNDFast = NFSLCMS.select([6]);

var dndThresh = thresholdChange(NFSDND,lowerThresholdDecline,upperThresholdDecline, 1)
var rnrThresh = thresholdChange(NFSRNR,lowerThresholdRecovery, upperThresholdRecovery, 1)

var dndSlowThresh = thresholdChange(NFSDNDSlow,lowerThresholdDecline,upperThresholdDecline, 1)
var dndFastThresh = thresholdChange(NFSDNDFast,lowerThresholdDecline,upperThresholdDecline, 1)


if(summaryMethod === 'year'){
  var dndThreshOut = dndThresh.qualityMosaic('Decline Probability_change_year');//.qualityMosaic('Decline_change');
  var rnrThreshOut = rnrThresh.qualityMosaic('Recovery Probability_change_year');//.qualityMosaic('Recovery_change');
  
  var dndSlowThreshOut = dndSlowThresh.qualityMosaic('Slow Decline Probability_change_year');//.qualityMosaic('Decline_change');
  var dndFastThreshOut = dndFastThresh.qualityMosaic('Fast Decline Probability_change_year');//.qualityMosaic('Recovery_change');
  

  var threshYearNameEnd = 'Most recent year of ';
  var threshProbNameEnd = 'Probability on most recent year of ';
}
else{
  var dndThreshOut = dndThresh.qualityMosaic('Decline Probability');//.qualityMosaic('Decline_change');
  var rnrThreshOut = rnrThresh.qualityMosaic('Recovery Probability');//.qualityMosaic('Recovery_change');
  
  var dndSlowThreshOut = dndSlowThresh.qualityMosaic('Slow Decline Probability');//.qualityMosaic('Decline_change');
  var dndFastThreshOut = dndFastThresh.qualityMosaic('Fast Decline Probability');//.qualityMosaic('Recovery_change');
  

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

var declineYearPalette = 'ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02';
var recoveryYearPalette = '54A247,AFDEA8,80C476,308023,145B09';

var declineProbPalette = 'F5DEB3,D00';
var recoveryProbPalette = 'F5DEB3,006400';

var declineDurPalette = 'BD1600,E2F400,0C2780';
var recoveryDurPalette = declineDurPalette;
//Get LANDTRENDR fitted values        
var fittedAsset = ee.ImageCollection(collectionDict[studyAreaName][2])
        .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
        .map(function(img){return multBands(img,1,0.0001)})
        .select(['LT_Fitted_'+whichIndex]);



var declineNameEnding = '('+startYear.toString() + '-' + endYear.toString()+') (p >= '+lowerThresholdDecline.toString()+' and p <= '+upperThresholdDecline.toString()+')';
var recoveryNameEnding = '('+startYear.toString() + '-' + endYear.toString()+') (p >= '+lowerThresholdRecovery.toString()+' and p <= '+upperThresholdRecovery.toString()+')';



var lcLayerName = studyAreaName + ' Land Cover (mode) '+ startYear.toString() + '-'+ endYear.toString();

var luPalette = "efff6b,ff2ff8,1b9d0c,97ffff,a1a1a1,c2b34a";
var luLayerName = studyAreaName + ' Land Use (mode) '+ startYear.toString() + '-'+ endYear.toString();


// Map2.addLayer(NFSCP.max().multiply(10),{min:0,max:4},'Change Process',false);
if(analysisMode === 'advanced'){
  Map2.addLayer(NFSLC.mode().multiply(10),{'palette':PALETTE,'min':1,'max':7,addToLegend:false}, lcLayerName,false); 
  Map2.addLayer(NFSLU.mode().multiply(10),{'palette':luPalette,'min':1,'max':6,addToLegend:false}, luLayerName,false); 
}



// Map2.addLayer(dndThreshMostRecent.select([1]),{'min':startYear,'max':endYear,'palette':'FF0,F00'},studyAreaName +' Decline Year',true,null,null,'Year of most recent decline ' +declineNameEnding);
// Map2.addLayer(dndThreshMostRecent.select([0]),{'min':lowerThresholdDecline,'max':upperThresholdDecline,'palette':'FF0,F00'},studyAreaName +' Decline Probability',false,null,null,'Most recent decline ' + declineNameEnding);

Map2.addLayer(dndThreshOut.select([1]),{'min':startYear,'max':endYear,'palette':declineYearPalette },studyAreaName +' Decline Year',true,null,null,threshYearNameEnd+'decline ' +declineNameEnding);
Map2.addLayer(dndThreshOut.select([0]),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},studyAreaName +' Decline Probability',false,null,null,threshProbNameEnd+ 'decline ' + declineNameEnding);



if(analysisMode === 'advanced'){
Map2.addLayer(dndCount,{'min':1,'max':5,'palette':declineDurPalette},studyAreaName +' Decline Duration',false,'years',null,'Total duration of decline '+declineNameEnding);
}
if(viewBeta === 'yes'){
Map2.addLayer(dndSlowThreshOut.select([1]),{'min':startYear,'max':endYear,'palette':declineYearPalette },studyAreaName +' Slow Decline Year',false,null,null,threshYearNameEnd+'decline ' +declineNameEnding);
Map2.addLayer(dndSlowThreshOut.select([0]),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},studyAreaName +' Slow Decline Probability',false,null,null,threshProbNameEnd+ 'decline ' + declineNameEnding);
Map2.addLayer(dndSlowCount,{'min':1,'max':5,'palette':declineDurPalette},studyAreaName +' Slow Decline Duration',false,'years',null,'Total duration of decline '+declineNameEnding);

Map2.addLayer(dndFastThreshOut.select([1]),{'min':startYear,'max':endYear,'palette':declineYearPalette },studyAreaName +' Fast Decline Year',false,null,null,threshYearNameEnd+'decline ' +declineNameEnding);
Map2.addLayer(dndFastThreshOut.select([0]),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},studyAreaName +' Fast Decline Probability',false,null,null,threshProbNameEnd+ 'decline ' + declineNameEnding);
Map2.addLayer(dndFastCount,{'min':1,'max':5,'palette':declineDurPalette},studyAreaName +' Fast Decline Duration',false,'years',null,'Total duration of decline '+declineNameEnding);

}


Map2.addLayer(rnrThreshOut.select([1]),{'min':startYear,'max':endYear,'palette':recoveryYearPalette},studyAreaName +' Recovery Year',false,null,null,threshYearNameEnd+'recovery '+recoveryNameEnding);
Map2.addLayer(rnrThreshOut.select([0]),{'min':lowerThresholdRecovery,'max':upperThresholdRecovery,'palette':recoveryProbPalette},studyAreaName +' Recovery Probability',false,null,null,threshProbNameEnd+'recovery '+recoveryNameEnding);

if(analysisMode === 'advanced'){
Map2.addLayer(rnrCount,{'min':1,'max':5,'palette':recoveryDurPalette},studyAreaName +' Recovery Duration',false,'years',null,'Total duration of recovery '+recoveryNameEnding);
}



//Bring in reference data
var hansen = ee.Image('UMD/hansen/global_forest_change_2016_v1_4').select(['lossyear']).add(2000).int16();
hansen = hansen.updateMask(hansen.neq(2000).and(hansen.gte(startYear)).and(hansen.lte(endYear)));
Map2.addLayer(hansen,{'min':startYear,'max':endYear,'palette':declineYearPalette},'Hansen Decline Year',false,null,null,'Hansen Global Forest Change year of change','reference-layer-list');

var vmap = ee.FeatureCollection('projects/USFS/LCMS-NFS/R1/FNF/Ancillary/FNF_VMap')//.limit(100000);
var lfCodes  = [3100,3300,4000,5000,7000,7100];
var cCodes = [3100,3300,4001,4002,4003,4004,5000,7000,7100,8601,8602];

// var lfNames = ['HERB','SHRUB','TREE','WATER','SPVEG','URBAN'];
// var cNames = ['HERB','SHRUB','CTR 10-24.9%','CTR 25-39.9%','CTR 40-59.9%','CTR >= 60%','WATER','SPVEG','URBAN','DTR 10-39.9%','DTR >= 40%'];

var lfColorsHex = 'ffffbe,ffbee8,4c7300,002673,828282,000000';
var cColorsHex = 'ffffbe,ffbee8,ffff00,aaff00,4c7300,734c00,002673,828282,000000,ff73df,ff00c5';

var properties = [['LIFEFORM',lfCodes,lfColorsHex],['TREECANOPY',cCodes,cColorsHex]];
var vmapExport = ee.Image('projects/USFS/LCMS-NFS/R1/FNF/Ancillary/VMAP-Lifeform-TreeCanopy');

properties.map(function(prop){
  // var vmapRast = vmap.reduceToImage([prop[0]],ee.Reducer.first());
  var vmapRast = vmapExport.select([prop[0]]);
  vmapRast = vmapRast.remap(prop[1],ee.List.sequence(1,prop[1].length));
  
  Map2.addLayer(vmapRast,{min:1,max:prop[1].length,palette:prop[2],addToLegend :false},'VMAP-'+prop[0],false,null,null,'VMAP layer attribute: '+prop[0],'reference-layer-list')
})

var wb = ee.Image('projects/USFS/LCMS-NFS/R1/FNF/Ancillary/IRPSV102_WHITEBARK');
wb = wb.updateMask(wb)
Map2.addLayer(wb,{min:1,max:1,palette:'080',addToLegend:false},'Whitebark Pine',false,null,null,'Extent of potential Whitebark Pine','reference-layer-list')


var mtbs = ee.ImageCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/MTBS')
          .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
          .map(function(img){return img.updateMask(img.neq(0))});


mtbs = mtbs.map(function(img){return img.select([0],['burnSeverity']).byte()
// .updateMask(img.neq(0).and(img.neq(6)))
});
var mtbsForYear = mtbs.map(function(img){return img.remap([1,2,3,4,5,6],[1,2,3,4,5,1]).rename(['burnSeverity'])});

var mtbsYear = thresholdChange(mtbsForYear,1,10,1).qualityMosaic('burnSeverity').select([1])

var severityViz = {'min':1,'max':6,'palette':'006400,7fffd4,ffff00,ff0000,7fff00,ffffff',addToLegend : false}

Map2.addLayer(mtbs.select([0]).max(),severityViz,'MTBS Severity Composite',false,null,null,'MTBS CONUS burn severity mosaic from 1984-2016','reference-layer-list')
Map2.addLayer(mtbsYear,{min:startYear,max:endYear,palette:declineYearPalette},'MTBS Year of Highest Severity',false,null,null,'MTBS CONUS year of highest mapped burn severity from 1984-2016','reference-layer-list')


var studyAreas = collectionDict[studyAreaName][4];
studyAreas.map(function(studyArea){
  Map2.addLayer(studyArea[1],{palette:'d9d9d9',addToLegend:false},studyArea[0],true,null,null,null,'reference-layer-list')
// 
})

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

Map2.addExport(dndYearForExport,studyAreaName +' LCMS Beta Decline Year '+ startYear.toString() + '-'+ endYear.toString(),30,10,120,10,false,{'min':startYear-1970,'max':endYear-1970,'palette':declineYearPalette});
Map2.addExport(dndSevForExport,studyAreaName +' LCMS Beta Decline Probability '+ startYear.toString() + '-'+ endYear.toString(),30,10,120,10,false,{'min':lowerThresholdDecline*100,'max':upperThresholdDecline*100,'palette':declineProbPalette});

if(analysisMode === 'advanced'){
Map2.addExport(dndCountForExport,studyAreaName +' LCMS Beta Decline Duration '+ startYear.toString() + '-'+ endYear.toString(),30,10,120,10,false,{'min':1,'max':5,'palette':declineDurPalette});

}

Map2.addExport(rnrYearForExport,studyAreaName +' LCMS Beta Recovery Year '+ startYear.toString() + '-'+ endYear.toString(),30,10,120,10,false,{'min':startYear-1970,'max':endYear-1970,'palette':recoveryYearPalette});
Map2.addExport(rnrSevForExport,studyAreaName +' LCMS Beta Recovery Probability '+ startYear.toString() + '-'+ endYear.toString(),30,10,120,10,false,{'min':lowerThresholdRecovery*100,'max':upperThresholdRecovery*100,'palette':recoveryProbPalette});

if(analysisMode === 'advanced'){
Map2.addExport(rnrCountForExport,studyAreaName +' LCMS Beta Recovery Duration '+ startYear.toString() + '-'+ endYear.toString(),30,10,120,10,false,{'min':1,'max':5,'palette':recoveryDurPalette});

}
//Set up charting
var forCharting = joinCollections(composites.select([whichIndex]),fittedAsset, false);

if(analysisMode !== 'advanced' && viewBeta === 'no'){
  NFSLCMS =  NFSLCMS.select(['Decline Probability','Recovery Probability']);

}
if(analysisMode !== 'advanced' && viewBeta === 'yes'){
  NFSLCMS =  NFSLCMS.select(['Decline Probability','Recovery Probability','Slow Decline Probability','Fast Decline Probability']);

}
forCharting = joinCollections(forCharting,NFSLCMS, false);
chartCollection =forCharting;

};
