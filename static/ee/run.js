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

//----------------------------------------------------------------------------------------------------------------
//                                 Parameters, Definitions, Palettes
//---------------------------------------------------------------------------------------------------------------
var run;

var warningShown = false;

// Land Cover
var PALETTE = 'b67430,78db53,F0F,ffb88c,8cfffc,32681e,2a74b8'
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

// Loss/Gain Palettes
var declineYearPalette = 'ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02';
var recoveryYearPalette = '54A247,AFDEA8,80C476,308023,145B09';

var declineProbPalette = 'F5DEB3,D00';
var recoveryProbPalette = 'F5DEB3,006400';

var declineDurPalette = 'BD1600,E2F400,0C2780';
var recoveryDurPalette = declineDurPalette;

//----------------------------------------------------------------------------------------------------------------
//                                 Functions
//---------------------------------------------------------------------------------------------------------------
//----------Helper Functions-----------------------------------------
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

function setNoData(image,noDataValue){
  var m = image.mask();
  image = image.mask(ee.Image(1));
  image = image.where(m.not(),noDataValue);
  return image;
}

function addYearBand(img){
  var d = ee.Date(img.get('system:time_start'));
  var y = d.get('year');
  
  var db = ee.Image.constant(y).rename(['year']).float();
  db = db.updateMask(img.select([0]).mask())
  return img.addBands(db).float();
}

// --------Add MTBS and IDS Layers-------------------------------
function getMTBSandIDS(studyAreaName){

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
  
  if(studyAreaName === 'CNFKP'){
    var mtbs_path = 'projects/USFS/LCMS-NFS/AK-Ancillary-Data/MTBS';
  } else {
    var mtbs_path = 'projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/MTBS';
  }
    
  mtbs = ee.ImageCollection(mtbs_path)
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

  Map2.addLayer(mortCollection.select([0]).count(),{'min':1,'max':Math.floor((idsEndYear-idsStartYear)/4),palette:declineYearPalette},'IDS Survey Count',false,null,null, 'Number of times an area was recorded as mortality by the IDS survey','reference-layer-list');
  Map2.addLayer(mortCollection.select([1]).max(),{min:startYear,max:endYear,palette:declineYearPalette},'IDS Most Recent Year of Mortality',false,null,null, 'Most recent year an area was recorded as mortality by the IDS survey','reference-layer-list');

  Map2.addLayer(mtbs.select([0]).max(),severityViz,'MTBS Severity Composite',false,null,null,'MTBS CONUS burn severity mosaic from 1984-2016','reference-layer-list')
  Map2.addLayer(mtbsYear,{min:startYear,max:endYear,palette:declineYearPalette},'MTBS Year of Highest Severity',false,null,null,'MTBS CONUS year of highest mapped burn severity from 1984-2016','reference-layer-list')  
}


//---------------Apply thresholds to loss and gain-------------------------------------------------------
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

//---------------LandTrendr Functions-------------------------------------------------------
function LT_VT_multBands(img, multBy){
    var fitted = img.select('.*_fitted').multiply(multBy);
    var slope = img.select('.*_slope').multiply(multBy);
    var diff = img.select('.*_diff').multiply(multBy);
    var mag = img.select('.*_mag').multiply(multBy);
    var dur = img.select('.*_dur');
    var out = dur.addBands(fitted).addBands(slope).addBands(diff).addBands(mag);
    out  = out.copyProperties(img,['system:time_start'])
              .copyProperties(img);
    return ee.Image(out);
}

function convertStack_To_DurFitMagSlope(stackCollection, VTorLT){
  stackCollection = ee.ImageCollection(stackCollection);
  var stackList = stackCollection.first().bandNames();
  if (stackList.getInfo().indexOf('rmse') >= 0){
    stackList = stackList.remove('rmse');
    stackCollection = stackCollection.select(stackList);
  }  

  // Prep parameters for fitStackToCollection
  var maxSegments = stackCollection.first().get('maxSegments');
  var startYear = stackCollection.first().get('startYear');
  var endYear = stackCollection.first().get('endYear');
  var indexList = ee.Dictionary(stackCollection.aggregate_histogram('band')).keys().getInfo();
  
  //Set up output collection to populate
  var outputCollection; var stack;
  //Iterate across indices
  indexList.map(function(indexName){  
    stack = stackCollection.filter(ee.Filter.eq('band',indexName)).first();
    
    //Convert to image collection
    var yrDurMagSlopeCleaned = fitStackToCollection(stack, 
      maxSegments, 
      startYear, 
      endYear
    ); 

    //Rename
    var bns = ee.Image(yrDurMagSlopeCleaned.first()).bandNames();
    var outBns = bns.map(function(bn){return ee.String(indexName).cat('_'+VTorLT+'_').cat(bn)});  
    yrDurMagSlopeCleaned = yrDurMagSlopeCleaned.select(bns,outBns);
    
    if(outputCollection === undefined){
      outputCollection = yrDurMagSlopeCleaned;
    }else{
      outputCollection = joinCollections(outputCollection,yrDurMagSlopeCleaned,false);
    }  
  });
  return outputCollection;
}

function fitStackToCollection(stack, maxSegments, startYear, endYear){
  
  //Parse into annual fitted, duration, magnitude, and slope images
  //Iterate across each possible segment and find its fitted end value, duration, magnitude, and slope
  var yrDurMagSlope = ee.FeatureCollection(ee.List.sequence(1,maxSegments).map(function(i){
    i = ee.Number(i);

    //Set up slector for left and right side of segments
    var stringSelectLeft = ee.String('.*_').cat(i.byte().format());
    var stringSelectRight = ee.String('.*_').cat((i.add(1)).byte().format());
    
    //Get the left and right bands into separate images
    var stackLeft = stack.select([stringSelectLeft]);
    var stackRight = stack.select([stringSelectRight]);
    
    //Select off the year bands
    var segYearsLeft = stackLeft.select(['yrs_.*']).rename(['year_left']);
    var segYearsRight = stackRight.select(['yrs_.*']).rename(['year_right']);
    
    //Select off the fitted bands 
    var segFitLeft = stackLeft.select(['fit_.*']).rename(['fitted'])
    var segFitRight = stackRight.select(['fit_.*']).rename(['fitted'])
    
    //Compute duration, magnitude, and then slope
    var segDur = segYearsRight.subtract( segYearsLeft).rename(['dur']);
    var segMag = segFitRight.subtract( segFitLeft).rename(['mag']);
    var segSlope = segMag.divide(segDur).rename(['slope']);

    //Iterate across each year to see if the year is within a given segment
    //All annualizing is done from the right vertex backward
    //The first year of the time series is inserted manually with an if statement
    //Ex: If the first segment goes from 1984-1990 and the second from 1990-1997, the duration, magnitude,and slope
    //values from the first segment will be given to 1984-1990, while the second segment (and any subsequent segment)
    //the duration, magnitude, and slope values will be given from 1991-1997
    var annualizedCollection = ee.FeatureCollection(ee.List.sequence(startYear,endYear).map(function(yr){
      yr = ee.Number(yr);
      var yrImage = ee.Image(yr);

      //Find if the year is the first and include the left year if it is
      //Otherwise, do not include the left year
      yrImage = ee.Algorithms.If(yr.eq(startYear),
                  yrImage.updateMask(segYearsLeft.lte(yr).and(segYearsRight.gte(yr))),
                  yrImage.updateMask(segYearsLeft.lt(yr).and(segYearsRight.gte(yr))));
    
      yrImage = ee.Image(yrImage).rename(['yr']).int16();
      
      //Mask out the duration, magnitude, slope, and fit raster for the given year mask
      var yrDur = segDur.updateMask(yrImage);
      var yrMag = segMag.updateMask(yrImage);
      var yrSlope = segSlope.updateMask(yrImage);
      var yrFit = segFitRight.subtract(yrSlope.multiply(segYearsRight.subtract(yr))).updateMask(yrImage);
      
      //Get the difference from the 
      var diffFromLeft =yrFit.subtract(segFitLeft).updateMask(yrImage).rename(['diff']);
      // var relativeDiffFromLeft = diffFromLeft.divide(segMag.abs()).updateMask(yrImage).rename(['rel_yr_diff_left']).multiply(10000);
      
      // var diffFromRight =yrFit.subtract(segFitRight).updateMask(yrImage).rename(['yr_diff_right']);
      // var relativeDiffFromRight = diffFromRight.divide(segMag.abs()).updateMask(yrImage).rename(['rel_yr_diff_right']).multiply(10000)
      //Stack it up
      var out = yrDur.addBands(yrFit).addBands(yrMag).addBands(yrSlope)
                .addBands(diffFromLeft);
      out = out.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
      return out;
    }));
    return annualizedCollection;
  }));
  
  //Convert to an image collection
  yrDurMagSlope = ee.ImageCollection(yrDurMagSlope.flatten());
  
  //Collapse each given year to the single segment with data
  var yrDurMagSlopeCleaned = ee.ImageCollection.fromImages(ee.List.sequence(startYear,endYear).map(function(yr){
    var yrDurMagSlopeT = yrDurMagSlope.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic();
    return yrDurMagSlopeT.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
  }));
  return yrDurMagSlopeCleaned;
}

//------------Main Function to Run National Forest Products------------------------------------------------
function runUSFS(){

    // LCMS Project Boundaries
    // var fnf = ee.FeatureCollection('projects/USFS/LCMS-NFS/R1/FNF/FNF_Admin_Bndy');
    // var bt_study_area = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/BT/BT_LCMS_ProjectArea_5km');
    var bt_study_area = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/BT/GTNP_admin_bndy_5km_buffer_GTNP_Merge');
    var fnf_study_area = ee.FeatureCollection('projects/USFS/LCMS-NFS/R1/FNF/FNF_GNP_Merge_Admin_BND_1k');
    var mls_study_area = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/MLS/MLS_LCMS_ProjectArea_5km');
    var ck_study_area = ee.FeatureCollection('projects/USFS/LCMS-NFS/R10/CK/CK_LCMS_ProjectArea');

    // Forest Service and Park Service Boundaries
    var b = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Boundaries');
    var nps = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/NPS_Boundaries');

    var gtnp = ee.Feature(nps.filter(ee.Filter.eq('PARKNAME','Grand Teton')).first());
    var gnp = ee.Feature(nps.filter(ee.Filter.eq('PARKNAME','Glacier')).first());
    var kfnp = ee.Feature(nps.filter(ee.Filter.eq('PARKNAME','Kenai Fjords')).first());

    var btnf = ee.Feature(b.filter(ee.Filter.eq('FORESTNAME','Bridger-Teton National Forest')).first());
    var fnf = ee.Feature(b.filter(ee.Filter.eq('FORESTNAME','Flathead National Forest')).first());
    var mlsnf = ee.Feature(b.filter(ee.Filter.eq('FORESTNAME','Manti-La Sal National Forest')).first()); 
    var cnf = ee.Feature(b.filter(ee.Filter.eq('FORESTNAME','Chugach National Forest')).first());

    // Other boundaries
    var huc10 = ee.FeatureCollection("USGS/WBD/2017/HUC10");
    var kenai_nwr = ee.FeatureCollection('projects/USFS/LCMS-NFS/AK-Ancillary-Data/Kenai_NWR').filterBounds(ck_study_area);


    var fnfStudyAreas = [['Glacier NP',gnp,'Boundary of Glacier National Park'],
                        ['Flathead  NF',fnf,'Boundary of Flathead National Forest'],
                        ['Flathead LCMS Study Area',fnf_study_area,'Outline over which LCMS model calibration data were collected and applied']]

    var btStudyAreas = [['Grand Teton NP',gtnp,'Boundary of Grand Teton National Park'],
                        ['Bridger-Teton NF',btnf,'Boundary of Bridger-Teton National Forest'],
                        ['Bridger-Teton LCMS Study Area',bt_study_area,'Outline over which LCMS model calibration data were collected and applied with the addition of the Grand Teton National Park with a 5km buffer']]

    var mslStudyAreas = [['Manti-La Sal NF',mlsnf,'Boundary of Manti-La Sal National Forest'],
                          ['Manti-La Sal LCMS Study Area',mls_study_area,'Boundary of Manti-La Sal National Forest buffered by 5km over which LCMS model calibration data were collected and applied']];
    
    var ckStudyAreas = [['HUC10 Boundaries',huc10.filterBounds(ck_study_area),'USGS Watershed Boundary Dataset of Watersheds'],
    				['Kenai Fjords National Park',kfnp,'Boundary of Kenai Fjords National Park'],
    				['Kenai National Wildlife Refuge',kenai_nwr,'Boundary of Kenai National Wildlife Refuge'],
    				['Chugach NF',cnf,'Boundary of Chugach National Forest'],
                    ['Chugach-Kenai LCMS Study Area',ck_study_area,'Outline over which LCMS model calibration data were collected and applied']];

    // var studyAreaName = 'FNF';
    var collectionDict = {
      'FNF': ['projects/USFS/LCMS-NFS/R1/Composites/R1-Composite-Collection',
              // 'projects/USFS/LCMS-NFS/R1/FNF/Landcover-Change/Landcover-Change-Collection',
              'projects/USFS/LCMS-NFS/R1/FNF/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection-R1',
              'projects/USFS/LCMS-NFS/R1/Base-Learners/LANDTRENDR-Collection',
              'projects/USFS/LCMS-NFS/R1/Base-Learners/Harmonic-Coefficients',
              fnfStudyAreas,
              'projects/USFS/LCMS-NFS/R1/FNF/TimeSync/FNF_Prob_Checks_TimeSync_Annualized_Table',
              fnf_study_area,
             'landtrendr_stack_format'
              ],

      'BTNF':['projects/USFS/LCMS-NFS/R4/Composites/R4-Composite-Collection',
            'projects/USFS/LCMS-NFS/R4/BT/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection-TRA',
            'projects/USFS/LCMS-NFS/R4/Base-Learners/LANDTRENDR-Collection',
            'projects/USFS/LCMS-NFS/R4/Base-Learners/Harmonic-Coefficients',
            btStudyAreas,
            'projects/USFS/LCMS-NFS/R4/BT/TimeSync/BT_Prob_Checks_TimeSync_Annualized_Table',
            // 'projects/USFS/LCMS-NFS/R4/BT/TetonRiskExtent'
            bt_study_area,
            'landtrendr_stack_format'
            ],

      'MLSNF':['projects/USFS/LCMS-NFS/R4/Composites/R4-Composite-Collection',
            'projects/USFS/LCMS-NFS/R4/MLS/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection',
            'projects/USFS/LCMS-NFS/R4/Base-Learners/LANDTRENDR-Collection',
            'projects/USFS/LCMS-NFS/R4/Base-Learners/Harmonic-Coefficients',
            mslStudyAreas,
            'projects/USFS/LCMS-NFS/R4/MLS/TimeSync/MLS_TimeSync_Annualized_Table',
            // 'projects/USFS/LCMS-NFS/R4/BT/TetonRiskExtent'
            mls_study_area,
            'landtrendr_stack_format'
            ],

      'CNFKP':['projects/USFS/LCMS-NFS/R10/CK/Composites/Composite-Collection-cloudScoreTDOM',
            'projects/USFS/LCMS-NFS/R10/CK/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection-newTuning',
            'projects/USFS/LCMS-NFS/R10/CK/Base-Learners/LANDTRENDR-Collection',
            //'projects/USFS/LCMS-NFS/R4/Base-Learners/LANDTRENDR-Collection',
            'N/A',
            ckStudyAreas,
            'projects/USFS/LCMS-NFS/R10/CK/TimeSync/CK_TimeSync_Annualized_Table',
            ck_study_area,
            'landtrendr_vertex_format'
            ]
      
    }

    var downloadDict = {
    'FNF':['lcms-output-bucket/LCMS_FNF_v2019-1_Highest_Prob_Gain_Prob.tif',
            'lcms-output-bucket/LCMS_FNF_v2019-1_Highest_Prob_Gain_Year.tif',
            'lcms-output-bucket/LCMS_FNF_v2019-1_Highest_Prob_Loss_Prob.tif',
            'lcms-output-bucket/LCMS_FNF_v2019-1_Highest_Prob_Loss_Year.tif',
            'lcms-output-bucket/LCMS_FNF_v2019-1_Landcover_Stack.tif',
            'lcms-output-bucket/LCMS_FNF_v2019-1_Landuse_Stack.tif',
            'lcms-output-bucket/LCMS_FNF_v2019-1_Most_Recent_Gain_Prob.tif',
            'lcms-output-bucket/LCMS_FNF_v2019-1_Most_Recent_Gain_Year.tif',
            'lcms-output-bucket/LCMS_FNF_v2019-1_Most_Recent_Loss_Prob.tif',
            'lcms-output-bucket/LCMS_FNF_v2019-1_Most_Recent_Loss_Year.tif',
            'lcms-output-bucket/LCMS_FNF_v2019-1_Raw_Gain_Prob_Stack.tif',
            'lcms-output-bucket/LCMS_FNF_v2019-1_Raw_Loss_Prob_Stack.tif',
            'lcms-output-bucket/LCMS_FNF_v2019-1_Thresholded_Gain_Prob_Stack.tif',
            'lcms-output-bucket/LCMS_FNF_v2019-1_Thresholded_Gain_Year_Stack.tif',
            'lcms-output-bucket/LCMS_FNF_v2019-1_Thresholded_Loss_Prob_Stack.tif',
            'lcms-output-bucket/LCMS_FNF_v2019-1_Thresholded_Loss_Year_Stack.tif'],
    'BTNF':['lcms-output-bucket/LCMS_BTNF_v2019-1_Highest_Prob_Gain_Prob.tif',
            'lcms-output-bucket/LCMS_BTNF_v2019-1_Highest_Prob_Gain_Year.tif',
            'lcms-output-bucket/LCMS_BTNF_v2019-1_Highest_Prob_Loss_Prob.tif',
            'lcms-output-bucket/LCMS_BTNF_v2019-1_Highest_Prob_Loss_Year.tif',
            'lcms-output-bucket/LCMS_BTNF_v2019-1_Landcover_Stack.tif',
            'lcms-output-bucket/LCMS_BTNF_v2019-1_Landuse_Stack.tif',
            'lcms-output-bucket/LCMS_BTNF_v2019-1_Most_Recent_Gain_Prob.tif',
            'lcms-output-bucket/LCMS_BTNF_v2019-1_Most_Recent_Gain_Year.tif',
            'lcms-output-bucket/LCMS_BTNF_v2019-1_Most_Recent_Loss_Prob.tif',
            'lcms-output-bucket/LCMS_BTNF_v2019-1_Most_Recent_Loss_Year.tif',
            'lcms-output-bucket/LCMS_BTNF_v2019-1_Raw_Gain_Prob_Stack.tif',
            'lcms-output-bucket/LCMS_BTNF_v2019-1_Raw_Loss_Prob_Stack.tif',
            'lcms-output-bucket/LCMS_BTNF_v2019-1_Thresholded_Gain_Prob_Stack.tif',
            'lcms-output-bucket/LCMS_BTNF_v2019-1_Thresholded_Gain_Year_Stack.tif',
            'lcms-output-bucket/LCMS_BTNF_v2019-1_Thresholded_Loss_Prob_Stack.tif',
            'lcms-output-bucket/LCMS_BTNF_v2019-1_Thresholded_Loss_Year_Stack.tif'],
    'MLSNF':['lcms-output-bucket/LCMS_MLSNF_v2019-1_Highest_Prob_Gain_Prob.tif',
            'lcms-output-bucket/LCMS_MLSNF_v2019-1_Highest_Prob_Gain_Year.tif',
            'lcms-output-bucket/LCMS_MLSNF_v2019-1_Highest_Prob_Loss_Prob.tif',
            'lcms-output-bucket/LCMS_MLSNF_v2019-1_Highest_Prob_Loss_Year.tif',
            'lcms-output-bucket/LCMS_MLSNF_v2019-1_Landcover_Stack.tif',
            'lcms-output-bucket/LCMS_MLSNF_v2019-1_Landuse_Stack.tif',
            'lcms-output-bucket/LCMS_MLSNF_v2019-1_Most_Recent_Gain_Prob.tif',
            'lcms-output-bucket/LCMS_MLSNF_v2019-1_Most_Recent_Gain_Year.tif',
            'lcms-output-bucket/LCMS_MLSNF_v2019-1_Most_Recent_Loss_Prob.tif',
            'lcms-output-bucket/LCMS_MLSNF_v2019-1_Most_Recent_Loss_Year.tif',
            'lcms-output-bucket/LCMS_MLSNF_v2019-1_Raw_Gain_Prob_Stack.tif',
            'lcms-output-bucket/LCMS_MLSNF_v2019-1_Raw_Loss_Prob_Stack.tif',
            'lcms-output-bucket/LCMS_MLSNF_v2019-1_Thresholded_Gain_Prob_Stack.tif',
            'lcms-output-bucket/LCMS_MLSNF_v2019-1_Thresholded_Gain_Year_Stack.tif',
            'lcms-output-bucket/LCMS_MLSNF_v2019-1_Thresholded_Loss_Prob_Stack.tif',
            'lcms-output-bucket/LCMS_MLSNF_v2019-1_Thresholded_Loss_Year_Stack.tif'],
    'CNFKP':['lcms-output-bucket/LCMS_CNFKP_v2019-2_Highest_Prob_Gain_Prob.tif',
            'lcms-output-bucket/LCMS_CNFKP_v2019-2_Highest_Prob_Gain_Year.tif',
            'lcms-output-bucket/LCMS_CNFKP_v2019-2_Highest_Prob_Loss_Prob.tif',
            'lcms-output-bucket/LCMS_CNFKP_v2019-2_Highest_Prob_Loss_Year.tif',
            'lcms-output-bucket/LCMS_CNFKP_v2019-2_Landcover_Stack.tif',
            'lcms-output-bucket/LCMS_CNFKP_v2019-2_Landuse_Stack.tif',
            'lcms-output-bucket/LCMS_CNFKP_v2019-2_Most_Recent_Gain_Prob.tif',
            'lcms-output-bucket/LCMS_CNFKP_v2019-2_Most_Recent_Gain_Year.tif',
            'lcms-output-bucket/LCMS_CNFKP_v2019-2_Most_Recent_Loss_Prob.tif',
            'lcms-output-bucket/LCMS_CNFKP_v2019-2_Most_Recent_Loss_Year.tif',
            'lcms-output-bucket/LCMS_CNFKP_v2019-2_Raw_Gain_Prob_Stack.tif',
            'lcms-output-bucket/LCMS_CNFKP_v2019-2_Raw_Loss_Prob_Stack.tif',
            'lcms-output-bucket/LCMS_CNFKP_v2019-2_Thresholded_Gain_Prob_Stack.tif',
            'lcms-output-bucket/LCMS_CNFKP_v2019-2_Thresholded_Gain_Year_Stack.tif',
            'lcms-output-bucket/LCMS_CNFKP_v2019-2_Thresholded_Loss_Prob_Stack.tif',
            'lcms-output-bucket/LCMS_CNFKP_v2019-2_Thresholded_Loss_Year_Stack.tif'] 
    }

    // Prep downloads
    var downloads = downloadDict[studyAreaName];
    downloads.map(function(d){
      var url = 'https://storage.cloud.google.com/' + d;
      var name = d.substr(d.lastIndexOf('/') + 1);
      addDownload(url,name);

    })

    // Paths / definitions
    var ts = ee.ImageCollection(collectionDict[studyAreaName][5]);
    var boundary = ee.FeatureCollection(collectionDict[studyAreaName][6]);
    var landtrendr_format = collectionDict[studyAreaName][7];

    // Initial load & format of LCMS layers
    var NFSLCMS = ee.ImageCollection(collectionDict[studyAreaName][1])
                  // .filter(ee.Filter.stringContains('system:index','DNDSlow-DNDFast'))
                  .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
                  .select([0,1,2,3,4,5,6],['LC','LU','CP','DND','RNR','DND_Slow','DND_Fast'])
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

    // Apply Thresholds to change layers
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

    //------------Add Layers specific to each study area----------------------------------------
    // FNF Layers:
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
    // End FNF Layers

    // BTNF Layers:
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

      Map2.addLayer(canopyCover.updateMask(canopyCover.neq(0)),canopyCoverViz,'VCMQ 2018 Canopy Cover',false,null,null,'2018 updated VCMQ (mid-level vegetation cover map) canopy cover classes','reference-layer-list');
      Map2.addLayer(treeSize.updateMask(treeSize.neq(0)),treeSizeViz,'VCMQ 2018 Tree Size',false,null,null,'2018 updated VCMQ (mid-level vegetation cover map) tree size classes','reference-layer-list');
      Map2.addLayer(vegType.updateMask(vegType.neq(0)),vegTypeViz,'VCMQ 2018 Veg Type',false,null,null,'2018 updated VCMQ (mid-level vegetation cover map) vegetation type classes','reference-layer-list');

      var lynxPalette = '080,ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02';

      var lynxHab = ee.Image('projects/USFS/LCMS-NFS/R4/BT/Ancillary/LynxHab/WildlifeBtLynxHab2017');
      lynxHab = lynxHab.where(lynxHab.eq(0),1970);
      var lynxClassDict = {'Suitable':'080','Unsuitable 1987':'ffffe5','Unsuitable 2017':'cc4c02'}
      Map2.addLayer(lynxHab,{min:1970,max:2017,palette:lynxPalette,addToClassLegend: true,classLegendDict:lynxClassDict},'BT Lynx Habitat Unsuitability Year',false,null,null,'Lynx habitat suitability 2017.  Years are years Lynx habitat became unsuitable.','reference-layer-list');

    }
    // End BTNF Layers

    // MLSNF Layers:
    if(studyAreaName === 'MLSNF'){

      var canopyCover = ee.Image('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/MLSFL_CC_Filtered_QMbuffer_2017_03_08_t').clip(boundary);
      var treeSize = ee.Image('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/MLSFL_TS_Filtered_QMbuffer_2017_03_08_t').clip(boundary);
      var vegType = ee.Image('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/MLSFL_VT_Filtered_QMbuffer_2017_03_08_t').clip(boundary);

      var canopyCoverClassDict = {"1: (10 - 19%)": "93ff93", "2: (10 - 19%)": "93ff93", "3: (10 - 19%)": "93ff93", "4: (10 - 19%)": "93ff93", "5: (10 - 19%)": "93ff93", "6: (10 - 19%)": "93ff93", "7: (10 - 19%)": "93ff93", "8: (10 - 19%)": "93ff93", "9: (10 - 19%)": "93ff93", "10: (10 - 19%)": "93ff93", "11: (20 - 39%)": "2dff2d", "12: (20 - 39%)": "2dff2d", "13: (20 - 39%)": "2dff2d", "14: (20 - 39%)": "2dff2d", "15: (20 - 39%)": "2dff2d", "16: (20 - 39%)": "2dff2d", "17: (20 - 39%)": "2dff2d", "18: (20 - 39%)": "2dff2d", "19: (20 - 39%)": "2dff2d", "20: (20 - 39%)": "2dff2d", "21: (20 - 39%)": "00ad00", "22: (20 - 39%)": "00ad00", "23: (20 - 39%)": "00ad00", "24: (20 - 39%)": "00ad00", "25: (20 - 39%)": "00ad00", "26: (20 - 39%)": "00ad00", "27: (20 - 39%)": "00ad00", "28: (20 - 39%)": "00ad00", "29: (20 - 39%)": "00ad00", "30: (20 - 39%)": "00ad00", "31: (40 -49%)": "428e63", "32: (40 -49%)": "428e63", "33: (40 -49%)": "428e63", "34: (40 -49%)": "428e63", "35: (40 -49%)": "428e63", "36: (40 -49%)": "428e63", "37: (40 -49%)": "428e63", "38: (40 -49%)": "428e63", "39: (40 -49%)": "428e63", "40: (40 -49%)": "428e63", "41: (50 - 59%)": "385b99", "42: (50 - 59%)": "385b99", "43: (50 - 59%)": "385b99", "44: (50 - 59%)": "385b99", "45: (50 - 59%)": "385b99", "46: (50 - 59%)": "385b99", "47: (50 - 59%)": "385b99", "48: (50 - 59%)": "385b99", "49: (50 - 59%)": "385b99", "50: (50 - 59%)": "385b99", "51: (60% +)": "0759fc", "52: (60% +)": "0759fc", "53: (60% +)": "0759fc", "54: (60% +)": "0759fc", "55: (60% +)": "0759fc", "56: (60% +)": "0759fc", "57: (60% +)": "0759fc", "58: (60% +)": "0759fc", "59: (60% +)": "0759fc", "60: (60% +)": "0759fc", "61: (60% +)": "1c9ee8", "62: (60% +)": "1c9ee8", "63: (60% +)": "1c9ee8", "64: (60% +)": "1c9ee8", "65: (60% +)": "1c9ee8", "66: (60% +)": "1c9ee8", "67: (60% +)": "1c9ee8", "68: (60% +)": "1c9ee8", "69: (60% +)": "1c9ee8", "70: (60% +)": "1c9ee8", "71: (60% +)": "a360ea", "72: (60% +)": "a360ea", "73: (60% +)": "a360ea", "74: (60% +)": "a360ea", "75: (60% +)": "a360ea", "76: (60% +)": "a360ea", "77: (60% +)": "a360ea", "78: (60% +)": "a360ea", "79: (60% +)": "a360ea", "80: (60% +)": "a360ea", "81: (60% +)": "fc4ff2", "82: (60% +)": "fc4ff2", "83: (60% +)": "fc4ff2", "84: (60% +)": "fc4ff2", "85: (60% +)": "fc4ff2", "86: Non Tree": "ffff00", "87: Non Tree": "ffa300", "88: Non Tree": "ff0000", "89: Non Tree": "bfbfbf"};
      var canopyCoverPalette = '93ff93,93ff93,93ff93,93ff93,93ff93,93ff93,93ff93,93ff93,93ff93,93ff93,2dff2d,2dff2d,2dff2d,2dff2d,2dff2d,2dff2d,2dff2d,2dff2d,2dff2d,2dff2d,00ad00,00ad00,00ad00,00ad00,00ad00,00ad00,00ad00,00ad00,00ad00,00ad00,428e63,428e63,428e63,428e63,428e63,428e63,428e63,428e63,428e63,428e63,385b99,385b99,385b99,385b99,385b99,385b99,385b99,385b99,385b99,385b99,0759fc,0759fc,0759fc,0759fc,0759fc,0759fc,0759fc,0759fc,0759fc,0759fc,1c9ee8,1c9ee8,1c9ee8,1c9ee8,1c9ee8,1c9ee8,1c9ee8,1c9ee8,1c9ee8,1c9ee8,a360ea,a360ea,a360ea,a360ea,a360ea,a360ea,a360ea,a360ea,a360ea,a360ea,fc4ff2,fc4ff2,fc4ff2,fc4ff2,fc4ff2,ffff00,ffa300,ff0000,bfbfbf';
      var canopyCoverViz = {min:1,max:89,palette:canopyCoverPalette,addToClassLegend: true,classLegendDict:canopyCoverClassDict};

      var treeSizeClassDict = {"1: (0 - 4.9\"\" dbh)": "a5f984", "2: (5 - 11.9\"\" dbh)": "3ddb3d", "3: (12 - 17.9\"\" dbh)": "008900", "4: (18 - 23.9\"\" dbh)": "2196af", "5: (24\"\"+ dbh)": "056dce", "6: (0 - 5.9\"\" drc)": "f2ea5e", "7: (6 - 11.9\"\" drc)": "e0ba56", "8: (12 - 17.9\"\" drc)": "cc751e", "9: (18\"\"+ drc)": "b2022b", "10: Non Tree": "bfbfbf"};
      var treeSizePalette = 'a5f984,3ddb3d,008900,2196af,056dce,f2ea5e,e0ba56,cc751e,b2022b,bfbfbf';
      var treeSizeViz = {min:1,max:10,palette:treeSizePalette,addToClassLegend: true,classLegendDict:treeSizeClassDict};

      var vegTypeClassDict = {"1: Aspen": "00ffff", "2: Aspen/Conifer": "04c0aa", "3: Douglas-fir Mix": "005f00", "4: Ponderosa Pine": "c0ffc0", "5: Ponderosa Pine Mix": "9acc9a", "6: Ponderosa Pine/Woodland": "678967", "7: White Fir": "7fff00", "8: White Fir Mix": "2caf00", "9: Spruce/Fir": "6a59cc", "10: Bristlecone Pine/Limber Pine": "9fb7d2", "11: Mountain Mahogany": "bc6af7", "12: Pinyon-Juniper": "ccb791", "13: Rocky Mountain Juniper Mix": "846a5e", "14: Gambel Oak": "ffedc0", "15: Mountain Big Sagebrush": "ffcc66", "16: Wyoming/Basin Big Sagebrush": "d2914c", "17: Silver Sagebrush": "d25e11", "18: Black Sagebrush": "873700", "19: Mountain Shrubland": "4f84f8", "20: Alpine Vegetation": "ffa7b7", "21: Upland Herbaceous": "ffff00", "22: Riparian Woody": "cc0000", "23: Riparian Herbaceous": "ff2b2b", "24: Agriculture": "ff39ff", "25: Barren/Sparse Vegetation": "bcbcbc", "26: Developed": "676767", "27: Water": "195ef7"};
      var vegTypePalette = '00ffff,04c0aa,005f00,c0ffc0,9acc9a,678967,7fff00,2caf00,6a59cc,9fb7d2,bc6af7,ccb791,846a5e,ffedc0,ffcc66,d2914c,d25e11,873700,4f84f8,ffa7b7,ffff00,cc0000,ff2b2b,ff39ff,bcbcbc,676767,195ef7';
      var vegTypeViz = {min:1,max:27,palette:vegTypePalette,addToClassLegend: true,classLegendDict:vegTypeClassDict};

      Map2.addLayer(canopyCover.updateMask(canopyCover.neq(0)),canopyCoverViz,'VCMQ 2014 Canopy Cover',false,null,null,'2014 updated VCMQ (mid-level vegetation cover map) canopy cover classes','reference-layer-list');
      Map2.addLayer(treeSize.updateMask(treeSize.neq(0)),treeSizeViz,'VCMQ 2014 Tree Size',false,null,null,'2014 updated VCMQ (mid-level vegetation cover map) tree size classes','reference-layer-list');
      Map2.addLayer(vegType.updateMask(vegType.neq(0)),vegTypeViz,'VCMQ 2014 Veg Type',false,null,null,'2014 updated VCMQ (mid-level vegetation cover map) vegetation type classes','reference-layer-list');

      //**
      // Moved Unfilled Polygons to below LCMS Layers so they will draw on top of everything.
      //**
    }
    // End MLSNF Layers

    // CNFKP Layers:
    if(studyAreaName === 'CNFKP'){

      //Kenai Veg Map
      var kenaiVegType = ee.Image('projects/USFS/LCMS-NFS/R10/CK/Ancillary/Kenai_VegMap');
      var kenaiVegTypeClassDict = {"1: Black Spruce": "4e5e38", "2: Black Spruce Peatland": "87751e", "3: Mountain Hemlock": "007800", "4: Mountain Hemlock-Lutz Spruce": "0f5e4f", "5: Mountain Hemlock-Sitka Spruce": "005e00", "6: Sitka Spruce": "003800", "7: White/Lutz Spruce": "215c4f", "8: Alaska Paper Birch (and Kenai Birch": "87f38c", "9: Black Cottonwood (and Balsam Poplar": "b0ff8c", "10: Quaking Aspen": "d4ffc0", "11: Black Spruce-Broadleaf": "0b9721", "12: White/Lutz Spruce-Birch": "45a138", "13: White/Lutz Spruce-Cottonwood": "66b52b", "14: White/Lutz Spruce-Aspen": "38a89e", "15: Alder": "ff0000", "16: Willow": "9c2e23", "17: Alder-Willow": "a30000", "18: Low Shrub Peatland": "d1852e", "19: Low Shrub Willow-Dwarf Birch": "ab3a11", "20: Wet Willow (Sweetgale)": "f0d1ab", "21: Dryas Dwarf Shrub": "ffe3e8", "22: Dwarf Shrub-Lichen": "ff73de", "23: Ericaceous Dwarf Shrub": "9e1eee", "24: Sedge Peatland": "fa9402", "25: Aquatic Herbaceous": "c0e8ff", "26: Dry Herbaceous": "ffffc0", "27: Mesic Herbaceous": "ffff00", "28: Wet Herbaceous": "e6e600", "29: Sparse Vegetation": "686868", "30: Barren": "cccccc", "31: Water": "4780f3", "32: Snow/Ice": "ffffff", "33: Developed": "000000"};
      var kenaiVegTypePalette = '4e5e38,87751e,007800,0f5e4f,005e00,003800,215c4f,87f38c,b0ff8c,d4ffc0,0b9721,45a138,66b52b,38a89e,ff0000,9c2e23,a30000,d1852e,ab3a11,f0d1ab,ffe3e8,ff73de,9e1eee,fa9402,c0e8ff,ffffc0,ffff00,e6e600,686868,cccccc,4780f3,ffffff,000000';
      var kenaiVegTypeViz = {min: 1, max: 33, palette: kenaiVegTypePalette, addToClassLegend: true, classLegendDict: kenaiVegTypeClassDict};
      Map2.addLayer(kenaiVegType.updateMask(kenaiVegType.neq(0)),kenaiVegTypeViz,'Kenai Veg Type 2017',false,null,null,'2017 Kenai Peninsula vegetation dominance classes','reference-layer-list');

      // Copper River Veg Map  
      var CRvegType = ee.Image('projects/USFS/LCMS-NFS/R10/CK/Ancillary/CopperRiverDelta_VegMap');//.setDefaultProjection(crs, transform, scale);
      var CRvegTypeClassDict = {"1: Western Hemlock": "3db370", "2: Sitka Spruce": "006300", "3: Black Cottonwood": "c9ff70", "4: Sitka Spruce - Black Cottonwood": "75ed00", "5: Sitka Alder": "f8644f", "6: Willow": "781212", "7: Sitka Alder - Willow Mix": "e02a3e", "8: Sweetgale": "ffd480", "9: Dry Graminoid": "8acc66", "10: Mesic Wet Herbaceous": "78c2c4", "11: Aquatic Herbaceous": "9efade", "12: Sparse/Unvegetated": "dfcbaf", "13: Water": "457dc7", "14: Snow/Ice": "ffffff", "15: Developed": "000000"};
      var CRvegTypePalette = '3db370,006300,c9ff70,75ed00,f8644f,781212,e02a3e,ffd480,8acc66,78c2c4,9efade,dfcbaf,457dc7,ffffff,000000';
      var CRvegTypeViz = {min: 1, max: 15, palette: CRvegTypePalette, addToClassLegend: true, classLegendDict:CRvegTypeClassDict};  
      Map2.addLayer(CRvegType.updateMask(CRvegType.neq(0)), CRvegTypeViz, 'Copper River Delta Veg Type 2010', false, null, null, '2010 Copper River Delta vegetation dominance classes','reference-layer-list');
    }
    // End CNFKP Layers

    //----------------Prep Universal Layers & Add Some------------------------------------------------------
    getMTBSandIDS(studyAreaName);

    var studyAreas = collectionDict[studyAreaName][4];
    studyAreas.map(function(studyArea){
      Map2.addLayer(studyArea[1],{palette:'d9d9d9',addToLegend:false},studyArea[0],false,null,null,studyArea[2],'reference-layer-list')
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
      var exportSummaryMethodNameEnd = 'Most Recent';
    }
    else{
      var dndThreshOut = dndThresh.qualityMosaic('Loss Probability');//.qualityMosaic('Decline_change');
      
      // var dndThreshOutOld = dndThreshOld.qualityMosaic('Decline Probability');//.qualityMosaic('Decline_change');
      

      var rnrThreshOut = rnrThresh.qualityMosaic('Gain Probability');//.qualityMosaic('Recovery_change');
      
      var dndSlowThreshOut = dndSlowThresh.qualityMosaic('Slow Loss Probability');//.qualityMosaic('Decline_change');
      var dndFastThreshOut = dndFastThresh.qualityMosaic('Fast Loss Probability');//.qualityMosaic('Recovery_change');
      

      var threshYearNameEnd = 'Year of highest probability of ';
      var threshProbNameEnd = 'Highest probability of ';
      var exportSummaryMethodNameEnd = 'Highest Probability';
    }

    var dndCount = dndThresh.select([0]).count();
    var rnrCount = rnrThresh.select([0]).count();

    var dndSlowCount = dndSlowThresh.select([0]).count();
    var dndFastCount = dndFastThresh.select([0]).count();

    if (studyAreaName == 'CNFKP'){
    	// Create mask for water, barren, and snow surfaces from land cover layers
		var lcMode = NFSLC.mode().multiply(10).round();
		var lcMask = lcMode.neq(1).and(lcMode.neq(7)).and(lcMode.neq(5));

		// Apply mask, keeping a copy of the original layers
		var dndThreshOutUnMasked = dndThreshOut;
		var rnrThreshOutUnMasked = rnrThreshOut;
		var dndSlowThreshOutUnMasked = dndSlowThreshOut;
		var dndFastThreshOutUnMasked = dndFastThreshOut;
		dndThreshOut = dndThreshOut.updateMask(lcMask);
		rnrThreshOut = rnrThreshOut.updateMask(lcMask);
		dndSlowThreshOut = dndSlowThreshOut.updateMask(lcMask);
		dndFastThreshOut = dndFastThreshOut.updateMask(lcMask);

		// Calculate # of missing years per pixel
		var missingYears = NFSDND.map(function(img){return addYearBand(img.unmask()).select('year').updateMask(img.mask().not())}).toArray().arrayProject([0]); // This will give array of missing years
		var dndMask = NFSDND.map(function(img){return img.mask().not().unmask()});
		var maskCount = ee.Image(dndMask.reduce(ee.Reducer.sum())).rename('Number of Missing Years');
		maskCount = maskCount.clip(boundary);
		
    }

    //---Composites--------
    var composites = ee.ImageCollection(collectionDict[studyAreaName][0])
            .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
            // .filter(ee.Filter.equals('cloudcloudShadowMaskingMethod','fmask'))
            .map(function(img){return multBands(img,1,0.0001)})
            .map(simpleAddIndices)
            .select(['blue','green','red','nir','swir1','swir2','NDVI','NBR']);
            // .map(getImageLib.getTasseledCap)
            // .map(getImageLib.simpleAddTCAngles)
            // .select(['NBR']);

    if(analysisMode === 'advanced'){
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

    //------LANDTRENDR-------- 
    print(landtrendr_format)
    if (landtrendr_format == 'landtrendr_vertex_format'){
      var LTstackCollection = ee.ImageCollection(collectionDict[studyAreaName][2]).filter(ee.Filter.eq('band',whichIndex))
      var landtrendr = convertStack_To_DurFitMagSlope(LTstackCollection, 'LT');
      var fittedAsset = landtrendr.map(function(img){return LT_VT_multBands(img, 0.0001)})
                              .select(whichIndex+'_LT_fitted');
      // var fittedAsset = ee.ImageCollection(collectionDict[studyAreaName][2])
      //     .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
      //     .map(function(img){return multBands(img,1,0.0001)})
      //     .select(['LT_Fitted_'+whichIndex]);
    } else {      
      var fittedAsset = ee.ImageCollection(collectionDict[studyAreaName][2])
          .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
          .map(function(img){return multBands(img,1,0.0001)})
          .select(['LT_Fitted_'+whichIndex]);
    }

    //----------Other Housekeeping & Prep for adding layers
    var declineNameEnding = '('+startYear.toString() + '-' + endYear.toString()+') (p >= '+lowerThresholdDecline.toString()+' and p <= '+upperThresholdDecline.toString()+')';
    var recoveryNameEnding = '('+startYear.toString() + '-' + endYear.toString()+') (p >= '+lowerThresholdRecovery.toString()+' and p <= '+upperThresholdRecovery.toString()+')';

    var lcLayerName =  'Land Cover (mode) '+ startYear.toString() + '-'+ endYear.toString();

    var luPalette = "efff6b,ff2ff8,1b9d0c,97ffff,a1a1a1,c2b34a";
    var luLayerName =  'Land Use (mode) '+ startYear.toString() + '-'+ endYear.toString();

    var landcoverClassLegendDict = {'Barren (0.1 in chart)':'b67430',
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

    //-----------------------------------Add LCMS Layers-------------------------------------------
    // Map2.addLayer(NFSCP.max().multiply(10),{min:0,max:4},'Change Process',false);
    if(analysisMode === 'advanced'){
      if (studyAreaName == 'CNFKP'){
	      Map2.addLayer(maskCount,{'min':1,'max':33,'palette':'0C2780,E2F400,BD1600'}, 'Number of Missing Data Years',false)
	      //Map2.addLayer(missingYears,{'opacity': 0}, 'Number of Missing Data Years',false)
	  }
      Map2.addLayer(NFSLC.mode().multiply(10),{'palette':PALETTE,'min':1,'max':7,addToClassLegend: true,classLegendDict:landcoverClassLegendDict}, lcLayerName,false); 
      Map2.addLayer(NFSLU.mode().multiply(10),{'palette':luPalette,'min':1,'max':6,addToClassLegend: true,classLegendDict:landuseClassLegendDict}, luLayerName,false); 
    }

    // Map2.addLayer(dndThreshMostRecent.select([1]),{'min':startYear,'max':endYear,'palette':'FF0,F00'},studyAreaName +' Decline Year',true,null,null,'Year of most recent decline ' +declineNameEnding);
    // Map2.addLayer(dndThreshMostRecent.select([0]),{'min':lowerThresholdDecline,'max':upperThresholdDecline,'palette':'FF0,F00'},studyAreaName +' Decline Probability',false,null,null,'Most recent decline ' + declineNameEnding);

    Map2.addLayer(dndThreshOut.select([1]),{'min':startYear,'max':endYear,'palette':declineYearPalette},'Loss Year',true,null,null,threshYearNameEnd+'loss ' +declineNameEnding);
    if (studyAreaName == 'CNFKP' && analysisMode == 'advanced'){
    	Map2.addLayer(dndThreshOutUnMasked.select([1]),{'min':startYear,'max':endYear,'palette':declineYearPalette},'Loss Year Unmasked',false,null,null,threshYearNameEnd+'loss ' +declineNameEnding);
    }
    // Map2.addLayer(dndThreshOutOld.select([1]),{'min':startYear,'max':endYear,'palette':declineYearPalette },studyAreaName +' Decline Old Year',true,null,null,threshYearNameEnd+'decline ' +declineNameEnding);
    // Map2.addLayer(dndThreshOutOld.select([0]),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},studyAreaName +' Decline Old Probability',false,null,null,threshProbNameEnd+ 'decline ' + declineNameEnding);

    if(analysisMode === 'advanced'){
      Map2.addLayer(dndThreshOut.select([0]),{'min':lowerThresholdDecline,'max':upperThresholdDecline ,'palette':declineProbPalette},'Loss Probability',false,null,null,threshProbNameEnd+ 'loss ' + declineNameEnding);
      Map2.addLayer(dndCount,{'min':1,'max':5,'palette':declineDurPalette},'Loss Duration',false,'years',null,'Total duration of loss '+declineNameEnding);
    }

    Map2.addLayer(rnrThreshOut.select([1]),{'min':startYear,'max':endYear,'palette':recoveryYearPalette},'Gain Year',false,null,null,threshYearNameEnd+'gain '+recoveryNameEnding);
    if(analysisMode === 'advanced'){
      Map2.addLayer(rnrThreshOut.select([0]),{'min':lowerThresholdRecovery,'max':upperThresholdRecovery,'palette':recoveryProbPalette},'Gain Probability',false,null,null,threshProbNameEnd+'gain '+recoveryNameEnding);
      Map2.addLayer(rnrCount,{'min':1,'max':5,'palette':recoveryDurPalette},'Gain Duration',false,'years',null,'Total duration of gain '+recoveryNameEnding);
    }

    if(viewBeta === 'yes'){

      var lcFirstFive = NFSLC.filter(ee.Filter.calendarRange(startYear,startYear+5-1,'year')).mode().multiply(100);
      var lcLastFive = NFSLC.filter(ee.Filter.calendarRange(endYear-5+1,endYear,'year')).mode().multiply(10);
      var lcChangeMatrix = lcFirstFive.add(lcLastFive);

      var interestedClasses = [21,41,42,61,62,64, 12,14,16,24,26,46];
      var interestedChangeClasses = ee.Image(interestedClasses);
      lcChangeMatrix =interestedChangeClasses.updateMask(interestedChangeClasses.eq(lcChangeMatrix)).reduce(ee.Reducer.max());
      lcChangeMatrix = lcChangeMatrix.remap(interestedClasses,[-1,-2,-1,-3,-2,-1,1,2,3,1,2,1])
      Map2.addLayer(lcChangeMatrix,{min:-3,max:3,palette:"b2182b,ef8a62,fddbc7,f7f7f7,d1e5f0,67a9cf,2166ac"},'Landcover Change Matrix',false);

      Map2.addLayer(dndSlowThreshOut.select([1]),{'min':startYear,'max':endYear,'palette':declineYearPalette },'Slow Loss Year',false,null,null,threshYearNameEnd+'loss ' +declineNameEnding);
      Map2.addLayer(dndSlowThreshOut.select([0]),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},'Slow Loss Probability',false,null,null,threshProbNameEnd+ 'loss ' + declineNameEnding);
      Map2.addLayer(dndSlowCount,{'min':1,'max':5,'palette':declineDurPalette},'Slow Loss Duration',false,'years',null,'Total duration of loss '+declineNameEnding);

      Map2.addLayer(dndFastThreshOut.select([1]),{'min':startYear,'max':endYear,'palette':declineYearPalette },'Fast Loss Year',false,null,null,threshYearNameEnd+'loss ' +declineNameEnding);
      Map2.addLayer(dndFastThreshOut.select([0]),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},'Fast Loss Probability',false,null,null,threshProbNameEnd+ 'loss ' + declineNameEnding);
      Map2.addLayer(dndFastCount,{'min':1,'max':5,'palette':declineDurPalette},'Fast Loss Duration',false,'years',null,'Total duration of loss '+declineNameEnding);

    }

    // Additional Layers for MLSNF
    if(studyAreaName === 'MLSNF'){
      var landslides = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/Landslides');
      var canyonsProjectArea = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/Canyons_ProjectArea');
      var johnsonCreekProjectArea = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/JohnsonCreek_ProjectArea');

      var sageGrouseHomeRanges = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/MLNF_GreaterSageGrouse_HomeRanges');
      var sageGrouseSeasonalHabitat = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/MLNF_GreaterSageGrouse_SeasonalHabitat');

      var nizhoniFire = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/Nizhoni_FirePerimeter');
      var seeleyFire = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/Seeley_FirePerimeter');

      Map2.addLayer(canyonsProjectArea,{'min':1,'max':1,'palette':'AA0'},'Canyons Project Area',false,null,null,'','reference-layer-list');
      Map2.addLayer(johnsonCreekProjectArea,{'min':1,'max':1,'palette':'AA0'},'Johnson Creek Project Area',false,null,null,'','reference-layer-list');
      Map2.addLayer(sageGrouseHomeRanges,{'min':1,'max':1,'palette':'#ff6700'},'Sage Grouse Home Ranges',false,null,null,'','reference-layer-list');
      Map2.addLayer(sageGrouseSeasonalHabitat,{'min':1,'max':1,'palette':'#ff6700'},'Sage Grouse Seasonal Habitat',false,null,null,'','reference-layer-list');

      var huc6 = ee.FeatureCollection("USGS/WBD/2017/HUC06").filterBounds(mls_study_area);
      var huc10 = ee.FeatureCollection("USGS/WBD/2017/HUC10").filterBounds(mls_study_area);

      Map2.addLayer(huc6,{'min':1,'max':1,'palette':'#0000ff'},'HUC06 Boundaries',false,null,null,'USGS Watershed Boundary Dataset of Basins','reference-layer-list');
      Map2.addLayer(huc10,{'min':1,'max':1,'palette':'#0000ff'},'HUC10 Boundaries',false,null,null,'USGS Watershed Boundary Dataset of Watersheds','reference-layer-list');

      var grazingAllotments = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/MLS_Allotments');
      var pastures = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/MLS_Pastures');

      Map2.addLayer(grazingAllotments,{},'Allotment Boundaries',false,null,null,'','reference-layer-list'); //'RMU Dataset - area boundaries of livestock grazing allotments' 'min':1,'max':1,'palette':'#ff0000'
      Map2.addLayer(pastures,{'min':1,'max':1,'palette':'#ffbf00'},'Pasture Boundaries',false,null,null,'RMU Dataset - area boundaries of pastures within livestock grazing allotments','reference-layer-list');
      // print(pastures.getInfo())
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



    // var dur_meta_str;var lu_meta_str;var prob_meta_str;var year_meta_str;
    if(analysisMode === 'advanced'){
    Map2.addExport(lcForExport,'LCMS ' +studyAreaName +' v2019-1 Land Cover MODE '+ startYear.toString() + '-'+ endYear.toString() ,30,false,{'studyAreaName':studyAreaName,'version':'v2019.1','summaryMethod':summaryMethod,'whichOne':'Landcover MODE','startYear':startYear,'endYear':endYear,'min':1,'max':7});
    Map2.addExport(luForExport,'LCMS ' +studyAreaName +' v2019-1 Land Use MODE '+ startYear.toString() + '-'+ endYear.toString() ,30,false,{'studyAreaName':studyAreaName,'version':'v2019.1','summaryMethod':summaryMethod,'whichOne':'Landuse MODE','startYear':startYear,'endYear':endYear,'min':1,'max':6});
    }

    Map2.addExport(dndYearForExport,'LCMS ' +studyAreaName +' v2019-1 '+exportSummaryMethodNameEnd+' Loss Year '+ startYear.toString() + '-'+ endYear.toString(),30,false,{'studyAreaName':studyAreaName,'version':'v2019.1','summaryMethod':summaryMethod,'whichOne':'Loss Year','startYear':startYear,'endYear':endYear,'min':startYear,'max':endYear});

    if(analysisMode === 'advanced'){
    Map2.addExport(dndSevForExport,'LCMS ' +studyAreaName +' v2019-1 '+exportSummaryMethodNameEnd+' Loss Probability '+ startYear.toString() + '-'+ endYear.toString(),30,false,{'studyAreaName':studyAreaName,'version':'v2019.1','summaryMethod':summaryMethod,'whichOne':'Loss Probability','startYear':startYear,'endYear':endYear,'min':0,'max':100});

    Map2.addExport(dndCountForExport,'LCMS ' +studyAreaName +' v2019-1 Loss Duration '+ startYear.toString() + '-'+ endYear.toString(),30,false,{'studyAreaName':studyAreaName,'version':'v2019.1','summaryMethod':summaryMethod,'whichOne':'Loss Duration','startYear':startYear,'endYear':endYear,'min':0,'max':endYear-startYear});

    }

    Map2.addExport(rnrYearForExport,'LCMS ' +studyAreaName +' v2019-1 '+exportSummaryMethodNameEnd+' Gain Year '+ startYear.toString() + '-'+ endYear.toString(),30,false,{'studyAreaName':studyAreaName,'version':'v2019.1','summaryMethod':summaryMethod,'whichOne':'Gain Year','startYear':startYear,'endYear':endYear,'min':startYear,'max':endYear});

    if(analysisMode === 'advanced'){
      Map2.addExport(rnrSevForExport,'LCMS ' +studyAreaName +' v2019-1 '+exportSummaryMethodNameEnd+' Gain Probability '+ startYear.toString() + '-'+ endYear.toString(),30,false,{'studyAreaName':studyAreaName,'version':'v2019.1','summaryMethod':summaryMethod,'whichOne':'Gain Probability','startYear':startYear,'endYear':endYear,'min':0,'max':100});

      Map2.addExport(rnrCountForExport,'LCMS ' +studyAreaName +' v2019-1 Gain Duration '+ startYear.toString() + '-'+ endYear.toString(),30,false,{'studyAreaName':studyAreaName,'version':'v2019.1','summaryMethod':summaryMethod,'whichOne':'Gain Duration','startYear':startYear,'endYear':endYear,'min':0,'max':endYear-startYear});

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

    var forAreaCharting = joinCollections(dndThresh,rnrThresh,false).select(['.*_change_year'])
    var forAreaChartingGeo = forAreaCharting.geometry();
    forAreaCharting =forAreaCharting.map(function(img){

      return img.mask().clip(forAreaChartingGeo)});
    chartCollection =forCharting;
    areaChartCollection = forAreaCharting;



    if(endYear === 2018 && warningShown === false){warningShown = true;showMessage('!!Caution!!','Including decline detected the last year of the time series (2018) can lead to high commission error rates.  Use with caution!')}

}; // End runUSFS()

//------------------------------Main Function to Run CONUS Product----------------------------------------------------------
function runCONUS(){
	//Bring in reference data
	var hansen = ee.Image('UMD/hansen/global_forest_change_2018_v1_6');
	var hansenLoss = hansen.select(['lossyear']).add(2000).int16();
	var hansenGain = hansen.select(['gain']);
	hansenLoss = hansenLoss.updateMask(hansenLoss.neq(2000).and(hansenLoss.gte(startYear)).and(hansenLoss.lte(endYear)));
	Map2.addLayer(hansenLoss,{'min':startYear,'max':endYear,'palette':declineYearPalette},'Hansen Loss Year',false,null,null,'Hansen Global Forest Change year of loss','reference-layer-list');
	Map2.addLayer(hansenGain.updateMask(hansenGain),{'min':1,'max':1,'palette':'0A0',addToClassLegend: true,classLegendDict:{'Forest Gain':'0A0'}},'Hansen Gain',false,null,null,'Hansen Global Forest Change gain','reference-layer-list');


	 var lossProb = ee.ImageCollection('projects/USFS/LCMS-NFS/CONUS-LCMS/vCONUS-2019-1').map(function(img){return img.unmask()})
	    .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
	    .map(function(img){return img.rename(['Loss Probability'])})
	    .map(function(img){return ee.Image(multBands(img,1,[0.01])).float()});
	 var dndThresh = thresholdChange(lossProb,lowerThresholdDecline,upperThresholdDecline, 1);
	 
	if(summaryMethod === 'year'){
	  var dndThreshOut = dndThresh.qualityMosaic('Loss Probability_change_year');//.qualityMosaic('Decline_change');
	  

	  var threshYearNameEnd = 'Most recent year of ';
	  var threshProbNameEnd = 'Probability of most recent year of ';
	  var exportSummaryMethodNameEnd = 'Most Recent';
	}
	else{
	  var dndThreshOut = dndThresh.qualityMosaic('Loss Probability');//.qualityMosaic('Decline_change');
	  
	   

	}

	getMTBSandIDS(studyAreaName);

	var declineNameEnding = '('+startYear.toString() + '-' + endYear.toString()+') (p >= '+lowerThresholdDecline.toString()+' and p <= '+upperThresholdDecline.toString()+')';

	Map2.addLayer(dndThreshOut.select([1]),{'min':startYear,'max':endYear,'palette':declineYearPalette},'Loss Year',true,null,null,threshYearNameEnd+'loss ' +declineNameEnding);
	// Map2.addLayer(dndThreshOutOld.select([1]),{'min':startYear,'max':endYear,'palette':declineYearPalette },studyAreaName +' Decline Old Year',true,null,null,threshYearNameEnd+'decline ' +declineNameEnding);



	// Map2.addLayer(dndThreshOutOld.select([0]),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},studyAreaName +' Decline Old Probability',false,null,null,threshProbNameEnd+ 'decline ' + declineNameEnding);
	var dndYearForExport = dndThreshOut.select([1]).int16();//.subtract(1970).byte();


	Map2.addExport(dndYearForExport,'LCMS ' +studyAreaName +' vCONUS-2019-1 '+exportSummaryMethodNameEnd+' Loss Year '+ startYear.toString() + '-'+ endYear.toString(),30,false,{'studyAreaName':studyAreaName,'version':'vCONUS.2019.1','summaryMethod':summaryMethod,'whichOne':'Loss Year','startYear':startYear,'endYear':endYear,'min':startYear,'max':endYear});



	if(analysisMode === 'advanced'){
	Map2.addLayer(dndThreshOut.select([0]),{'min':lowerThresholdDecline,'max':upperThresholdDecline ,'palette':declineProbPalette},'Loss Probability',false,null,null,threshProbNameEnd+ 'loss ' + declineNameEnding);

	var dndCount = dndThresh.select([0]).count();
	Map2.addLayer(dndCount,{'min':1,'max':5,'palette':declineDurPalette},'Loss Duration',false,'years',null,'Total duration of loss '+declineNameEnding);

	var dndSevForExport = dndThreshOut.select([0]).multiply(100).add(1).byte();
	dndSevForExport = dndSevForExport.where(dndSevForExport.eq(101),100);
	var dndCountForExport = dndCount.byte();
	Map2.addExport(dndSevForExport,'LCMS ' +studyAreaName +' vCONUS-2019-1 '+exportSummaryMethodNameEnd+' Loss Probability '+ startYear.toString() + '-'+ endYear.toString(),30,false,{'studyAreaName':studyAreaName,'version':'vCONUS.2019.1','summaryMethod':summaryMethod,'whichOne':'Loss Probability','startYear':startYear,'endYear':endYear,'min':0,'max':100});

	Map2.addExport(dndCountForExport,'LCMS ' +studyAreaName +' vCONUS-2019-1 Loss Duration '+ startYear.toString() + '-'+ endYear.toString(),30,false,{'studyAreaName':studyAreaName,'version':'vCONUS.2019.1','summaryMethod':summaryMethod,'whichOne':'Loss Duration','startYear':startYear,'endYear':endYear,'min':0,'max':endYear-startYear});

	}
	chartCollection =lossProb;
	var forAreaCharting = dndThresh.select(["Loss Probability_change_year"]);
	var forAreaChartingGeo = forAreaCharting.geometry();
	forAreaCharting = forAreaCharting.map(function(img){return img.mask().addBands(ee.Image(0).rename(["Gain Probability_change_year"])).clip(forAreaChartingGeo)})
	areaChartCollection = forAreaCharting;

	if(endYear === 2018 && warningShown === false){warningShown = true;showMessage('!!Caution!!','Including decline detected the last year of the time series (2018) can lead to high commission error rates.  Use with caution!')}

} // end runCONUS()

