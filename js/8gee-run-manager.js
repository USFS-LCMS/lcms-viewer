
//----------------------------------------------------------------------------------------------------------------
//                                 Parameters, Definitions, Palettes
//---------------------------------------------------------------------------------------------------------------
var run;

var warningShown = false;

function runBaseLearner(){
 // var startYear = 1984;
// var endYear = 2019;
var studyAreaName = 'USFS LCMS 1984-2020';
var startYear = parseInt(urlParams.startYear);
var endYear = parseInt(urlParams.endYear);
console.log(`${startYear},${endYear}`)
var transform = [30,0,-2361915.0,0,-30,3177735.0];
var lossYearPalette = 'ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02';
var gainYearPalette = 'c5ee93,00a398';//'c5ee93,00a398';//'AFDEA8,80C476,308023,145B09';
var lossMagPalette = 'D00,F5DEB3';
var gainMagPalette = 'F5DEB3,006400';
var lossThresh  = parseFloat(urlParams.lossMagThresh) *-10000;//2000;
var gainThresh = parseFloat(urlParams.gainMagThresh) *10000;//2000;

var crs  = 'EPSG:5070';
var indexName = 'NBR';
var lossYearPalette = 'ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02';
var gainYearPalette = 'c5ee93,00a398';//'AFDEA8,80C476,308023,145B09';
var lossMagPalette = 'D00,F5DEB3';
var gainMagPalette = 'F5DEB3,006400';
var durPalette = 'BD1600,E2F400,0C2780';

// Map: projects/LCMS/CONUS_Products/v20200120

var lt = ee.ImageCollection(ee.FeatureCollection(studyAreaDict[studyAreaName].lt_collections.map(f => ee.ImageCollection(f))).flatten());
// var treeMask = ee.Image('projects/LCMS/CONUS_Products/CONUS_LCMS_ForestMask').translate(15,-15);
      
// var forestMaskQueryDict = {1:'Tree',3:'Woody Wetland',2:'Shrub',0:'Other'};

// Map2.addLayer(treeMask,{min:0,max:3,palette:'a1a1a1,32681e,ffb88c,97ffff',addToClassLegend:true,classLegendDict:{'Tree':'32681e','Woody Wetland':'97ffff','Shrub':'ffb88c','Other':'a1a1a1'},queryDict:forestMaskQueryDict},'Landcover Mask Classes',false,null,null,'Landcover classes of 3 or more years. Any pixel that was tree 3 or more years is tree. Remaining pixels, any pixel that was woody wetland 3 or more years is woody wetland. Remaining pixels, any pixel that was shrub 3 or more years is shrub.  Remaining pixels are other. Both tree and woodywetland classes are included in the tree mask.');


// treeMask = treeMask.eq(1).or(treeMask.eq(3)).selfMask();
// var ltCONUS = ee.ImageCollection('projects/LCMS/CONUS_Products/LT').filter(ee.Filter.stringContains('system:index',indexName)).mosaic();
// var ltR4  = ee.Image(ee.ImageCollection('projects/USFS/LCMS-NFS/R4/Base-Learners/LANDTRENDR-Collection-fmask-allL7')
          // .filter(ee.Filter.eq('band',indexName)).first());
// var composites = ee.ImageCollection('projects/LCMS/CONUS_MEDOID')
//   .select([0,1,2,3,4,5],['blue','green','red','nir','swir1','swir2'])
//   .filter(ee.Filter.stringContains('system:index','ONUS_Medoid_Jun-Sept').not());
var composites = ee.ImageCollection(ee.FeatureCollection(studyAreaDict[studyAreaName].composite_collections.map(f => ee.ImageCollection(f))).flatten())

composites = ee.ImageCollection(ee.List.sequence(startYear,endYear,1).map(function(yr){
    return simpleAddIndices(composites.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis()),10000);
  }));



function getLossGainLT(ltStack,startYear,endYear,startSeg,endSeg,yrsPrefix,fittedPrefix,sign,lossThresh,gainThresh){
  var ltFitted = ltStack.select([fittedPrefix+'.*']).multiply(sign);
  var ltYrs = ltStack.select([yrsPrefix+'.*']);

  var lossYearStack = ee.Image(ee.List.sequence(startSeg,endSeg).iterate(function(i,img){
    var i1 = ee.Number(i).byte().format();
    var i2 = ee.Number(i).byte().add(1).format();
    
    var ltFittedTPre = ltFitted.select([ee.String(fittedPrefix).cat(i1)]);
    var ltFittedTPost = ltFitted.select([ee.String(fittedPrefix).cat(i2)]);
    var diff = ltFittedTPost.subtract(ltFittedTPre);
    var loss = diff.gt(lossThresh).selfMask();
    var gain = diff.lt(-gainThresh).selfMask();
    
    
    var ltYrTPre = ltYrs.select([ee.String(yrsPrefix).cat(i1)]);
    var ltYrTPost = ltYrs.select([ee.String(yrsPrefix).cat(i2)]);
    ltYrTPre = ltYrTPre.updateMask(ltYrTPost.gte(startYear).and(ltYrTPost.lte(endYear)));
    ltYrTPost = ltYrTPost.updateMask(ltYrTPost.gte(startYear).and(ltYrTPost.lte(endYear)));
    
    var lossYear = ltYrTPost.updateMask(loss).rename([ee.String('loss_year_').cat(i1)]);
    var gainYear = ltYrTPost.updateMask(gain).rename([ee.String('gain_year_').cat(i1)]);
    
    var lossMag = diff.updateMask(ltYrTPost.mask().and(loss)).rename([ee.String('loss_mag_').cat(i1)]);
    var gainMag = diff.updateMask(ltYrTPost.mask().and(gain)).rename([ee.String('gain_mag_').cat(i1)]);
    
    var dur = ltYrTPost.subtract(ltYrTPre);
    var lossDur = dur.updateMask(loss).rename([ee.String('loss_dur_').cat(i1)]);
    var gainDur = dur.updateMask(gain).rename([ee.String('gain_dur_').cat(i1)]);
    
    return ee.Image(img).addBands(lossYear).addBands(lossMag).addBands(lossDur).addBands(gainYear).addBands(gainMag).addBands(gainDur);
  },ee.Image(1)));
  lossYearStack = lossYearStack.select(lossYearStack.bandNames().slice(1,null));
 
  var lossYear = lossYearStack.select(['loss_year.*']).reduce(ee.Reducer.max()).rename(['loss_year']);
  var gainYear = lossYearStack.select(['gain_year.*']).reduce(ee.Reducer.max()).rename(['gain_year']);
  var lossMag = lossYearStack.select(['loss_mag.*']).reduce(ee.Reducer.max()).rename(['loss_mag']);
  var gainMag = lossYearStack.select(['gain_mag.*']).reduce(ee.Reducer.max()).rename(['gain_mag']);
  var lossDur = lossYearStack.select(['loss_dur.*']).reduce(ee.Reducer.max()).rename(['loss_dur']);
  var gainDur = lossYearStack.select(['gain_dur.*']).reduce(ee.Reducer.max()).rename(['gain_dur']);
  var out = lossYear.addBands(lossMag).addBands(lossDur).addBands(gainYear).addBands(gainMag).addBands(gainDur);
  return out
}
//////////////////////////////////////////////////////////////////////////
//Simplified method to convert LANDTRENDR stack to annual collection of
//Duration, fitted, magnitude, slope, and diff
//Improved handling of start year delay found in older method
function simpleFit(ltStack,startYear,endYear,indexName){
  if(indexName === undefined || indexName === null){indexName = ''};
  
  //Separate years and fitted values of vertices
  var yrs = ltStack.select('yrs_.*').selfMask();
  var fit = ltStack.select('fit_.*').updateMask(yrs.mask());
  
  //Find the first and last vertex years
  var isStartYear = yrs.reduce(ee.Reducer.firstNonNull());
  var isEndYear = yrs.reduce(ee.Reducer.lastNonNull());
  
  var blankMask = yrs.gte(100000);
  // Map.addLayer(isStartYear,{},'isStartYear');
  // Map.addLayer(isEndYear,{},'isEndYear')
  // Map.addLayer(yrs.reduce(ee.Reducer.firstNonNull()).eq(1986),{},'not start year');
  // Map.addLayer(yrs,{},'yrs');
  // Map.addLayer(fit,{},'fit')
  
  //Iterate across each year to find the values for that year
  var out = ee.ImageCollection(ee.List.sequence(startYear,endYear).map(function(yr){
    yr = ee.Number(yr).int16();
    
    //Find the segment the year belongs to
    //Handle whether the year is the same as the first vertex year
    var startYrMask =  blankMask;
    startYrMask = startYrMask.where(isStartYear.eq(yr),yrs.lte(yr));
    startYrMask = startYrMask.where(isStartYear.lt(yr),yrs.lt(yr));
    
    //Handle whether the year is the same as the last vertex year
    var endYrMask =  blankMask;
    endYrMask = endYrMask.where(isStartYear.eq(yr),yrs.gt(yr));
    endYrMask = endYrMask.where(isStartYear.lt(yr),yrs.gte(yr));
    
    // var startYrMask =yrs.lt(yr);
    // var endYrMask = yrs.gte(yr)
    //Get fitted values for the vertices segment the year is within
    var fitStart = fit.updateMask(startYrMask).reduce(ee.Reducer.lastNonNull());
    var fitEnd = fit.updateMask(endYrMask).reduce(ee.Reducer.firstNonNull());
    
    //Get start and end year for the vertices segment the year is within
    var yearStart = yrs.updateMask(startYrMask).reduce(ee.Reducer.lastNonNull());
    var yearEnd = yrs.updateMask(endYrMask).reduce(ee.Reducer.firstNonNull());
    
    //Get the difference and duration of the segment
    var segDiff = fitEnd.subtract(fitStart);
    var segDur = yearEnd.subtract(yearStart);
    
    //Get the varius annual derivatives
    var tDiff = ee.Image(yr).subtract(yearStart);
    var segSlope = segDiff.divide(segDur);
    var fitDiff = segSlope.multiply(tDiff);
    var fitted = fitStart.add(fitDiff);
    // Map.addLayer(startYrMask,{},'start'+yr.getInfo().toString(),false)
    // Map.addLayer(endYrMask,{},'end'+yr.getInfo().toString(),false)
    // Map.addLayer(fitStart,{},'fitStart'+yr.getInfo().toString(),false)
    // Map.addLayer(fitEnd,{},'fitEnd'+yr.getInfo().toString(),false)
    // Map.addLayer(yearStart,{},'yearStart'+yr.getInfo().toString(),false)
    // Map.addLayer(yearEnd,{},'yearEnd'+yr.getInfo().toString(),false)
    // Map.addLayer(segDur,{},'segDur'+yr.getInfo().toString(),false)
    
    return segDur 
    .addBands(fitted)
    .addBands(segDiff)
    .addBands(segSlope)
    .addBands(fitDiff)
    .rename([indexName +'_LT_dur',indexName +'_LT_fitted',indexName +'_LT_mag',indexName +'_LT_slope',indexName +'_LT_diff'])
    .set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
  }));
  return out;
}

var fittedTS;
var indicesUsed = [];

Object.keys(whichIndices2).map(function(k){
  var indexName = k;
  
  if(whichIndices2[k]){
    indicesUsed.push(k)
    console.log(indexName); 
    var ltCONUST = lt.filter(ee.Filter.eq('band',indexName)).mosaic();

    var lossGainCONUSLT = ee.Image(getLossGainLT(ltCONUST,1984,2021,1,6,'yrs_vert_','fit_vert_',-1,lossThresh,gainThresh));

    var lossYrMask = lossGainCONUSLT.select(['loss_year']);
    lossYrMask = lossYrMask.gte(startYear).and(lossYrMask.lte(endYear)).selfMask();

    var gainYrMask = lossGainCONUSLT.select(['gain_year']);
    gainYrMask = gainYrMask.gte(startYear).and(gainYrMask.lte(endYear)).selfMask();

    lossCONUSLT = lossGainCONUSLT.select(['loss_.*']).mask(lossYrMask);
    gainCONUSLT = lossGainCONUSLT.select(['gain_.*']).mask(gainYrMask);

    // Map2.addExport(lossCONUSLT.addBands(gainCONUSLT).int16().unmask(-32768,false),'LandTrendr Loss Gain Stack '+indexName +' '+ startYear.toString() + ' '+ endYear.toString(),30,false,{})
    Map2.addLayer(lossCONUSLT.select(['loss_year']),{min:startYear,max:endYear,palette:lossYearPalette,layerType:'geeImage'},'LandTrendr Loss Year '+indexName,true);
    Map2.addLayer(lossCONUSLT.select(['loss_mag']).multiply(-0.0001),{max:lossThresh/10000*-1,min:lossThresh*3/10000*-1,palette:lossMagPalette,layerType:'geeImage'},'LandTrendr Loss Mag '+indexName,false);
    Map2.addLayer(lossCONUSLT.select(['loss_dur']),{min:1,max:5,palette:durPalette,legendLabelLeftAfter:'year',legendLabelRightAfter:'years',layerType:'geeImage'},'LandTrendr Loss Dur '+indexName,false);

    Map2.addLayer(gainCONUSLT.select(['gain_year']),{min:startYear,max:endYear,palette:gainYearPalette,layerType:'geeImage'},'LandTrendr Gain Year '+indexName,false);
    Map2.addLayer(gainCONUSLT.select(['gain_mag']),{min:-gainThresh,max:-gainThresh*3,palette:gainMagPalette,layerType:'geeImage'},'LandTrendr Gain Mag '+indexName,false);
    Map2.addLayer(gainCONUSLT.select(['gain_dur']),{min:1,max:5,palette:durPalette,legendLabelLeftAfter:'year',legendLabelRightAfter:'years',layerType:'geeImage'},'LandTrendr Gain Dur '+indexName,false);
    var lossGainNames = ['LandTrendr '+indexName+' Loss','LandTrendr '+indexName+' Gain'];
    var gainLossC = ee.ImageCollection(ee.List.sequence(startYear,endYear).map(function(yr){
      yr = ee.Number(yr).int16();
      var ltLossGainEndYear = lossGainCONUSLT.select(['loss_year','gain_year']);
      var ltLossGainDur = lossGainCONUSLT.select(['loss_dur','gain_dur']);
      var ltLossGainStartYear = ltLossGainEndYear.subtract(ltLossGainDur);
      var ltLossGain = ee.Image([yr,yr]).gte(ltLossGainStartYear).and(ee.Image([yr,yr]).lte(ltLossGainEndYear)).rename(lossGainNames);
      ltLossGain = ltLossGain.unmask(0)
      // var ccdcLoss = CCDCchange.lossYears.eq(yr).reduce(ee.Reducer.max()).rename(['CCDC Loss']);
      // var ccdcGain = CCDCchange.gainYears.eq(yr).reduce(ee.Reducer.max()).rename(['CCDC Gain']);
      return ltLossGain
      // .addBands(ccdcLoss).addBands(ccdcGain)
      .set('system:time_start',ee.Date.fromYMD(yr,6,1).millis())
    
    }));
    var gainLossCCombined = gainLossC.map(function(img){
      var out = ee.Image(0);
      out = out.where(img.select([0]).eq(1),1);
      out = out.where(img.select([1]).eq(1),2);
      return ee.Image(out.copyProperties(img,['system:time_start'])).selfMask();
    })
    // pixelChartCollections['lg-'+indexName] =  {
    //     'label':'LANDTRENDR '+indexName+' Loss Gain Time Series',
    //     'collection':gainLossC,
    //     'xAxisLabel':'Year',
    //     'tooltip':'Query loss and gain for each year',
    //     'colors':chartColorsDict.advancedBeta.slice(4)
    // };
    if(fittedTS === undefined){
      fittedTS = simpleFit(ltCONUST,startYear,endYear,indexName).select(['.*_LT_fitted'])
    }else{
      fittedTS = joinCollections(fittedTS,simpleFit(ltCONUST,startYear,endYear,indexName).select(['.*_LT_fitted']), false);
    };
    
   
    
        // console.log(gainLossCCombined.getInfo())
      // Map2.addTimeLapse(gainLossCCombined,{min:1,max:2,palette:'F80,FF0,80F',addToClassLegend:true,classLegendDict:{'Loss':'F80','Gain':'80F'},years:ee.List.sequence(startYear,endYear).getInfo()},'LANDTRENDR '+indexName+' Loss/Gain Time Lapse');
      }

});
fittedTS = joinCollections(composites.select(indicesUsed,indicesUsed.map(function(nm){return 'Raw_'+nm})),fittedTS, false);
var ltPalette =palettes.niccoli.isol[7].reverse() 
var ltFitColors = ee.List.sequence(0,6,7/indicesUsed.length).getInfo().map(function(i){i = Math.floor(i);return ltPalette[i%7]})
ltFitColors.map(function(c){ltFitColors.push(invertColor(c))})
// console.log(ltFitColors)
// pixelChartCollections['LT_Fit'] =  {
//         'label':'LANDTRENDR Fitted Time Series',
//         'collection':fittedTS,
//         'xAxisLabel':'Year',
//         'tooltip':'Query LANDTRENDR fitted value for each year',
//         'chartColors':ltFitColors
//     };

////////////////////////////////////////////////////////////////////////////////////////

// var ccdc = ee.ImageCollection('projects/CCDC/USA')
//           // .filterBounds(geometry)
//           .mosaic()
//           // .reproject('EPSG:5070',null,30);
var ccdcIndices = Object.keys(whichIndices2).filter(i => whichIndices2[i]);
var ccdcOriginalIndices = Object.keys(whichIndices2).filter(i => whichIndices2[i])
if(ccdcIndices.indexOf('NDVI') == -1){ccdcIndices.push('NDVI')}

var ccdcAnnualBnsFrom = ccdcOriginalIndices.map(function(bn){return bn + '_predicted'});
var ccdcAnnualBnsTo = ccdcOriginalIndices.map(function(bn){return bn + '_CCDC_fitted'});
// console.log(ccdcAnnualBnsFrom)
// console.log(ccdcAnnualBnsTo)
var ccdcIndicesSelector = ['tStart','tEnd','tBreak','changeProb'].concat(ccdcIndices.map(function(i){return i+'_.*'}));
var ccdcIndicesSelectorPrediction = ['tStart','tEnd','tBreak','changeProb'].concat(ccdcOriginalIndices.map(function(i){return i+'_.*'}));
// console.log(ccdcIndicesSelector)

var fraction = 0.6657534246575343;
var tEndExtrapolationPeriod = 1;//Period in years to extrapolate if needed

var ccdcImg = ee.ImageCollection(ee.FeatureCollection(studyAreaDict[studyAreaName].ccdc_collections.map(f => ee.ImageCollection(f).select(ccdcIndicesSelector))).flatten())
// var ccdcImg =  ee.ImageCollection("projects/CCDC/USA_V2")
//           .filter(ee.Filter.eq('spectral', 'SR'))
//           .select(ccdcIndicesSelector);
// var ccdcAK =  ee.ImageCollection('projects/USFS/LCMS-NFS/R10/CoastalAK/Base-Learners/CCDC-Collection')
//             .select(ccdcIndicesSelector)
var f= ee.Image(ccdcImg.first());
ccdcImg = ee.Image(ccdcImg.mosaic().copyProperties(f));

//Fix end date issue
var finalTEnd = ccdcImg.select('tEnd');
finalTEnd = finalTEnd.arraySlice(0,-1,null).rename('tEnd').arrayGet(0).add(tEndExtrapolationPeriod).toArray(0);
var tEnds = ccdcImg.select('tEnd');
tEnds = tEnds.arraySlice(0,0,-1).arrayCat(finalTEnd,0).rename('tEnd');
var keepBands = ccdcImg.bandNames().remove('tEnd');
ccdcImg = ccdcImg.select(keepBands).addBands(tEnds);
//Specify which harmonics to use when predicting the CCDC model
//CCDC exports the first 3 harmonics (1 cycle/yr, 2 cycles/yr, and 3 cycles/yr)
//If you only want to see yearly patterns, specify [1]
//If you would like a tighter fit in the predicted value, include the second or third harmonic as well [1,2,3]
var whichHarmonics = [1,2,3];

//Whether to fill gaps between segments' end year and the subsequent start year to the break date
var fillGaps = true;

//Specify which band to use for loss and gain. 
//This is most important for the loss and gain magnitude since the year of change will be the same for all years
var changeDetectionBandName ='NDVI';//ccdcIndices[0];
//////////////////////////////////////////////////////////////////////
//Pull out some info about the ccdc image
var startJulian = ccdcImg.get('startJulian').getInfo();
var endJulian = ccdcImg.get('endJulian').getInfo();
// var startYear = ccdcImg.get('startYear').getInfo();
// var endYear = ccdcImg.get('endYear').getInfo();

 var changeObj = ccdcChangeDetection(ccdcImg,changeDetectionBandName);
changeObj.highestMag.loss.year = changeObj.highestMag.loss.year.mask(changeObj.highestMag.loss.year.gte(startYear).and(changeObj.highestMag.loss.year.lte(endYear)).selfMask())
changeObj.highestMag.loss.mag = changeObj.highestMag.loss.mag.mask(changeObj.highestMag.loss.year.gte(startYear).and(changeObj.highestMag.loss.year.lte(endYear)).selfMask())
changeObj.highestMag.gain.year = changeObj.highestMag.gain.year.mask(changeObj.highestMag.gain.year.gte(startYear).and(changeObj.highestMag.gain.year.lte(endYear)).selfMask())
changeObj.highestMag.gain.mag = changeObj.highestMag.gain.mag.mask(changeObj.highestMag.gain.year.gte(startYear).and(changeObj.highestMag.gain.year.lte(endYear)).selfMask())

Map2.addLayer(changeObj.highestMag.loss.year,{min:startYear,max:endYear,palette:lossYearPalette,layerType:'geeImage'},'CCDC Loss Year');
Map2.addLayer(changeObj.highestMag.loss.mag,{min:-0.5,max:-0.1,palette:lossMagPalette,layerType:'geeImage'},'CCDC Loss Mag',false);
Map2.addLayer(changeObj.highestMag.gain.year,{min:startYear,max:endYear,palette:gainYearPalette,layerType:'geeImage'},'CCDC Gain Year',false);
Map2.addLayer(changeObj.highestMag.gain.mag,{min:0.05,max:0.2,palette:gainMagPalette,layerType:'geeImage'},'CCDC Gain Mag',false);

var yearImages = simpleGetTimeImageCollection(ee.Number(startYear),ee.Number(endYear+1),1/24);
var predicted = predictCCDC(ccdcImg,yearImages,fillGaps,whichHarmonics).select(ccdcAnnualBnsFrom,ccdcAnnualBnsTo);


var annualImages = simpleGetTimeImageCollection(ee.Number(startYear+fraction),ee.Number(endYear+1+fraction),1);
// console.log(ccdcIndicesSelectorPrediction)
var annualPredicted = predictCCDC(ccdcImg,annualImages,fillGaps,whichHarmonics).select(ccdcAnnualBnsFrom,ccdcAnnualBnsTo).map(function(img){return ee.Image(multBands(img,1,10000)).int16()});
// Map2.addLayer(ee.Image(annualPredicted.filter(ee.Filter.calendarRange(2020,2020,'year')).first()),{},'ccdc 2020')
// Map2.addLayer(ccdcImg,{opacity:0},'CCDC Img')
// var recent = ccdcImg.select('tEnd');
// recent = recent.arraySlice(0,-1,null).rename('tEnd').arrayGet(0)
// var missing2020 = recent.lte(2020+fraction).and(recent.gte(2020));
// Map2.addLayer(missing2020,{min:0,max:1},'missing2020');
// var missing2019 = recent.lte(2019+fraction).and(recent.gte(2019));
// Map2.addLayer(missing2019,{min:0,max:1},'missing2019');
// var missing2018 = recent.lte(2018+fraction).and(recent.gte(2018));
// Map2.addLayer(missing2018,{min:0,max:1},'missing2018');
// Map2.addLayer(annualPredicted,{opacity:0},'annual predicted')
var lossGainLT = ee.Image(getLossGainLT(lt.filter(ee.Filter.eq('band',indexName)).mosaic(),1984,2021,1,6,'yrs_vert_','fit_vert_',-1,lossThresh,gainThresh));
var lossGainLTEndYear = lossGainLT.select(['loss_year','gain_year']).rename(['LT_loss_endYear','LT_gain_endYear']);
var lossGainLTStartYear = lossGainLT.select(['loss_year','gain_year']).subtract( lossGainLT.select(['loss_dur','gain_dur'])).rename(['LT_loss_startYear','LT_gain_startYear']);

var ccdcStartYear = ee.Image.cat([changeObj.highestMag.loss.year,changeObj.highestMag.gain.year]).subtract(1).rename(['CCDC_loss_startYear','CCDC_gain_startYear']);
var ccdcEndYear = ee.Image.cat([changeObj.highestMag.loss.year,changeObj.highestMag.gain.year]).rename(['CCDC_loss_endYear','CCDC_gain_endYear']);

var areaImage = ee.Image.cat([lossGainLTStartYear,ccdcStartYear,lossGainLTEndYear,ccdcEndYear]).unmask(0).int16();
// console.log(areaImage.getInfo());
var scenarios = {'LT & CCDC Loss':[1,0,1,0],
                  'LT Loss':[1,0,0,0],
                  'CCDC Loss':[0,0,1,0],
                  'LT & CCDC Gain':[0,1,0,1],
                  // 'LT Loss & CCDC Gain': [1,0,0,1],
                  // 'LT Gain & CCDC Loss':[0,1,1,0],
                  
                  'LT Gain': [0,1,0,0],
                  
                  'CCDC Gain': [0,0,0,1]};
function getCondYrMsk(yr){
  var yrConstImg = ee.Image.constant(yr).int16();
  var t = areaImage.select([0,1,2,3]).lt(yrConstImg)
  .and(areaImage.select([4,5,6,7]).gte(yrConstImg));
  return t
}
// var t = getCondYrMsk(2016);
// Map2.addLayer(t,{},'t const')
var areaC =ee.ImageCollection(ee.List.sequence(startYear,endYear).map(function(yr){
      yr = ee.Number(yr).int16();
      var yrCondImg = getCondYrMsk(yr);
      var yrImg = ee.ImageCollection(Object.keys(scenarios).map(function(k){
        var t = yrCondImg.eq(ee.Image.constant(scenarios[k]).byte())
                .reduce(ee.Reducer.min());
        return t
      })).toBands().byte();
      yrImg = yrImg
      .rename(Object.keys(scenarios))
      .set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
      return yrImg
    }))


// Map2.addLayer(ee.Image(areaImage),{'opacity':0},'area image')
// Map2.addLayer(areaC,{'opacity':0},'area collection');
// $('#query-label').click();

areaChartCollections['lg-'+indexName] = {'label':'LandTrendr and CCDC Loss/Gain',
                                      'collection':areaC,
                                      'stacked':false,
                                      'steppedLine':false,
                                      'tooltip':'Summarize loss and gain for each year from LandTrendr and CCDC',
                                      'colors':palettes.colorbrewer.RdBu[6],
                                      'xAxisLabel':'Year',
                                      'dateFormat':'YYYY'};


var fraction = ee.Number(ee.Date.fromYMD(1900,9,1).getFraction('year'));
var outBns = ee.Image(predicted.first()).bandNames().map(function(bn){return ee.String(bn).cat('_Annualized')})
predicted = predicted.map(function(img){
  var f = ee.Number(ee.Date(img.get('system:time_start')).getFraction('year'));
  var m = ee.Image(fraction.subtract(f).abs().lt(0.01))
  var masked = img.updateMask(m).rename(outBns);
  
  return masked.addBands(img).copyProperties(img,['system:time_start'])
})
// Map2.addLayer(maskedPredicted.select(['.*_Annualized']),{opacity:0},'CCDC Time Series');

    fittedLTCCDCTS = joinCollections(fittedTS,annualPredicted.map(setSameDate), false);
    // var ltCCDCPalette =palettes.niccoli.isol[7].reverse() 
    // var ltCCDCFitColors = ee.List.sequence(0,6,7/(indicesUsed.length)).getInfo().map(function(i){i = Math.floor(i);return ltPalette[i%7]})
    
    // var ltCCDCFitColorsFull = ltCCDCFitColors;
    // // console.log(ltCCDCFitColorsFull)
    // var opposites = ltCCDCFitColors.map(invertColor)
    // var offsetOpposites = opposites.map(function(hex){return offsetColor(hex,25)});
    // ltCCDCFitColorsFull = ltCCDCFitColorsFull.concat(opposites);
    // ltCCDCFitColorsFull = ltCCDCFitColorsFull.concat(offsetOpposites);
    // ltCCDCFitColorsFull = ltCCDCFitColorsFull.concat(ltCCDCFitColors.map(function(hex){return offsetColor(hex,10)}))
    // console.log(ltCCDCFitColorsFull)
    // ltCCDCFitColorsFull = ltCCDCFitColorsFull.concat(ltCCDCFitColors.map(function(hex){return offsetColor(hex,20)}))
    // console.log(ltCCDCFitColorsFull)
    // ltCCDCFitColors.map(function(c){ltCCDCFitColors.push(invertColor(c))}) 
  // printEE(fittedLTCCDCTS.limit(2));
  // var colorsN = indicesUsed.length;
  // if(colorsN === 1){colorsN = 3}
  pixelChartCollections['LT_CCDC_Fit'] =  {
          'label':'LandTrendr and CCDC Fitted Time Series',
          'collection':fittedLTCCDCTS,
          'xAxisLabel':'Year',
          'tooltip':'Query LandTrendr and CCDC fitted value for each year',
          'chartColors':palettes.colorbrewer.Set1[9]
      };

    var ccdcFitColors = ee.List.sequence(0,6,7/2).getInfo().map(function(i){i = Math.floor(i);return ltPalette[i%7]})
ccdcFitColors.map(function(c){ccdcFitColors.push(invertColor(c))})
pixelChartCollections['ccdcTS'] =  {
        'label':'CCDC Fitted Time Series',
        'collection':predicted,
        'xAxisLabel':'Date',
        'tooltip':'Query CCDC time series',
        'chartColors':ccdcFitColors,
          'semiSimpleDate':true
    };

// function simpleGetTimeImageCollection(startYear,endYear,step){
// var CCDCchange = getCCDCChange2(ccdc,'B4',-1,'_tBreak','_MAG','_changeProb',ccdcChangeProbThresh,365.25,startYear,endYear);
// Map2.addExport(CCDCchange.lossYears.reduce(ee.Reducer.max()).addBands(CCDCchange.lossMags.reduce(ee.Reducer.max())).addBands(CCDCchange.gainYears.reduce(ee.Reducer.max())).addBands(CCDCchange.gainMags.reduce(ee.Reducer.max())).int16().unmask(-32768,false),'CCDC Loss Gain Stack '+ startYear.toString() + ' '+ endYear.toString() ,30,false,{})
// Map2.addLayer(CCDCchange.lossYears.reduce(ee.Reducer.max()),{min:startYear,max:endYear,palette:lossYearPalette},'CCDC Loss Year',false);
// Map2.addLayer(CCDCchange.lossMags.reduce(ee.Reducer.max()).multiply(-1),{min:200,max:600,palette:lossMagPalette},'CCDC Loss Mag',false);

// Map2.addLayer(CCDCchange.gainYears.reduce(ee.Reducer.max()),{min:startYear,max:endYear,palette:gainYearPalette},'CCDC Gain Year',false);
// Map2.addLayer(CCDCchange.gainMags.reduce(ee.Reducer.max()),{min:1000,max:3000,palette:gainMagPalette},'CCDC Gain Mag',false);

Map2.addTimeLapse(composites,{min:500,max:[4500,6500,4500],gamma:1.6,bands:'swir1,nir,red',years:ee.List.sequence(startYear,endYear).getInfo()},'Composite Time Lapse');

// function getTerraPulseTileFunction(url){
//   return function(coord, zoom) {
//                     var tilesPerGlobe = 1 << zoom;
//                     var x = coord.x % tilesPerGlobe;
//                     if (x < 0) {
//                         x = tilesPerGlobe+x;
//                     }
//                     return url+ zoom + "/" + x + "/-" + coord.y +".png";
//                     }
// } 
// Map2.addLayer(getTerraPulseTileFunction('https://tpts01.terrapulse.com:8090/map/tcc_83_global_2015/'),{layerType:'tileMapService'},'Terra Pulse Tree Cover',true)
// Map2.addLayer(getTerraPulseTileFunction('https://tpts01.terrapulse.com:8090/map/loss_2010_2015_30p/'),{layerType:'tileMapService',addToClassLegend:true,classLegendDict:{'Loss':'F00'}},'Terra Pulse Loss',true)
// var hansen = ee.Image("UMD/hansen/global_forest_change_2019_v1_7").select([0])
// Map2.addLayer(hansen,{min:1,max:90,palette:palettes.crameri.bamako[50].reverse()},'Hansen 2000 Global Tree Cover')


pixelChartCollections['composites'] =  {
    'label':'Composite Time Series',
    'collection':composites.select(['blue','green','red','nir','swir1','swir2'])
};
populatePixelChartDropdown();populateAreaChartDropdown();getLCMSVariables();getSelectLayers(true);
}
function runRaw(){
  getLCMSVariables();
  // Initial load & format of LCMS layers
    var rawC = ee.ImageCollection(collectionDict[studyAreaName][1]);
    var ts = ee.ImageCollection(collectionDict[studyAreaName][5]);
    var boundary = ee.FeatureCollection(collectionDict[studyAreaName][6]);
    var landtrendr_format = collectionDict[studyAreaName][7];

    if(studyAreaName !== 'CNFKP'){
      rawC = rawC.map(function(img){
        var lc = img.select([0]);
        lc = lc.remap([0,1,2,3,4,5,6],[4,5,3,6,2,7,1]).rename(['LC']);
        return img.select([1,2,3,4,5,6]).addBands(lc).select([6,0,1,2,3,4,5]).byte();
      })
    }

    // print(rawC.getInfo());
    var NFSLCMS = rawC
                  // .filter(ee.Filter.stringContains('system:index','DNDSlow-DNDFast'))
                  .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
                  .select([0,1,2,3,4,5,6],['LC','LU','CP','DND','RNR','DND_Slow','DND_Fast'])
                  .map(function(img){return ee.Image(additionBands(img,[0,1,1,0,0,0,0])).clip(boundary)})
                  .map(function(img){return ee.Image(multBands(img,1,[0.1,0.1,0.1,0.01,0.01,0.01,0.01])).float()})
                  .select([0,1,2,3,4,5,6],['Land Cover Class','Land Use Class','Change Process','Loss Probability','Gain Probability','Slow Loss Probability','Fast Loss Probability']);
    

    // print(ts.getInfo());

}
function runAncillary(){

  getLCMSVariables();
  // Map2.addLayer(standardTileURLFunction('http://server.arcgisonline.com/arcgis/rest/services/Specialty/Soil_Survey_Map/MapServer/tile/'),{layerType:'tileMapService'},'SSURGO Soils',false);
  var hi_veg = ee.FeatureCollection('projects/lcms-292214/assets/HI-Ancillary-Data/Vegetation_-_Hawaii_County_VED')
Map2.addLayer(hi_veg,{strokeColor:'808',layerType:'geeVectorImage'},'HI Veg',false,null,null, 'HI Veg data from https://geoportal.hawaii.gov/datasets/8991d678dfc94b5d984df9117ca11ba1');
  

  // Map2.addLayer(superSimpleTileURLFunction('https://image-services-gtac.fs.usda.gov/arcgis/rest/services/ResourcePhoto_Region08/PR_2019_15cm_VNIR/ImageServer/tile/'),{layerType:'tileMapService','addToLegend':false},'PRUSVI 2019 15cm',false);
  // Map2.addLayer(superSimpleTileURLFunction('https://image-services-gtac.fs.usda.gov/arcgis/rest/services/ResourcePhoto_Region08/PR_USACOE_30cm_2010_12_CIR/ImageServer/tile/'),{layerType:'tileMapService','addToLegend':false},'PR 2010 30cm',false)
  
  // var prUSVI_ch_2018 = ee.Image('projects/lcms-292214/assets/R8/PR_USVI/Ancillary/PR_USVI_2018_CHM_1m')
  //                       .set('system:time_start',ee.Date.fromYMD(2018,6,1).millis())
  //                       .rename(['Canopy Height'])
  //                       .selfMask()
  // Map2.addLayer(prUSVI_ch_2018,{min:1,max:15,palette:palettes.crameri.bamako[50].reverse(),legendLabelLeftAfter:'(m)',legendLabelRightAfter:'(m)'},'PRUSVI 2018 Canopy Height',false);
  var nlcd = ee.ImageCollection('USGS/NLCD_RELEASES/2016_REL');


  var nlcdLCMS  = ee.ImageCollection('users/yang/CONUS_NLCD2016');

  function getYear(img){
    var yr = img.id().split('_').get(-1);
    img = img.set('system:time_start',ee.Date.fromYMD(ee.Number.parse(yr),6,1).millis());
    return img;
  }
  nlcdLCMS = nlcdLCMS.map(getYear);


  var nlcdLCMax = 95;//parseInt(nlcd.get('system:visualization_0_max').getInfo());
  var nlcdLCMin = 0;//parseInt(nlcd.get('system:visualization_0_min').getInfo());
  var nlcdLCPalette = ["466b9f", "d1def8", "dec5c5", "d99282", "eb0000", "ab0000", "b3ac9f", "68ab5f", "1c5f2c", "b5c58f", "af963c", "ccb879", "dfdfc2", "d1d182", "a3cc51", "82ba9e", "dcd939", "ab6c28", "b8d9eb", "6c9fb8"];//nlcd.get('system:visualization_0_palette').getInfo().split(',');
  
  var nlcdClassCodes = [11,12,21,22,23,24,31,41,42,43,51,52,71,72,73,74,81,82,90,95];
  var nlcdClassNames = ['Open Water','Perennial Ice/Snow','Developed, Open Space','Developed, Low Intensity','Developed, Medium Intensity','Developed High Intensity','Barren Land (Rock/Sand/Clay)','Deciduous Forest','Evergreen Forest','Mixed Forest','Dwarf Scrub','Shrub/Scrub','Grassland/Herbaceous','Sedge/Herbaceous','Lichens','Moss','Pasture/Hay','Cultivated Crops','Woody Wetlands','Emergent Herbaceous Wetlands'];
  var nlcdFullClassCodes = ee.List.sequence(nlcdLCMin,nlcdLCMax).getInfo();
  var nlcdLCVizDict = {};
  var nlcdLCQueryDict = {};
  var nlcdLegendDict = {};

  var ii = 0
  nlcdFullClassCodes.map(function(i){
    var index = nlcdClassCodes.indexOf(i);
    if(index !== -1){
      nlcdLCQueryDict[i] = nlcdClassNames[ii];
      nlcdLCVizDict[i] = nlcdLCPalette[ii];
      nlcdLegendDict[nlcdClassNames[ii]] = nlcdLCPalette[ii];
      ii++;
    }else{nlcdLCVizDict[i] = '000'}
  })
  var nlcdLegendDictReverse = {};
  Object.keys(nlcdLegendDict).reverse().map(function(k){nlcdLegendDictReverse[k] = nlcdLegendDict[k]});
  
  nlcd = nlcd.map(function(img){return img.set('bns',img.bandNames())});
  function annualMosaicCollection(c){
    var years = c.toList(10000,0).map(function(img){return ee.Date(ee.Image(img).get('system:time_start')).get('year')}).distinct();
    return ee.ImageCollection(years.map(function(yr){return c.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());}))
  }
  var nlcdLC = nlcd.filter(ee.Filter.listContains('bns','landcover')).select(['landcover']);
  nlcdLC = annualMosaicCollection(nlcdLC);
  var nlcdLCYears = nlcdLC.toList(10000,0).map(function(img){return ee.Date(ee.Image(img).get('system:time_start')).get('year')}).distinct();
  
  var nlcdImpv= nlcd.filter(ee.Filter.listContains('bns','impervious')).select(['impervious']);
  nlcdImpv = annualMosaicCollection(nlcdImpv);
  var nlcdImpvYears = nlcdImpv.toList(10000,0).map(function(img){return ee.Date(ee.Image(img).get('system:time_start')).get('year')}).distinct();

  var nlcdTCC= nlcd.filter(ee.Filter.listContains('bns','percent_tree_cover')).select(['percent_tree_cover']);
  nlcdTCC = annualMosaicCollection(nlcdTCC);
  var nlcdTCCYears = nlcdTCC.toList(10000,0).map(function(img){return ee.Date(ee.Image(img).get('system:time_start')).get('year')}).distinct();
  
  // nlcdLCYears.getInfo().map(function(yr){
  //   var nlcdLCYr = nlcdLC.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic();
  //   Map2.addLayer(nlcdLCYr,{min:nlcdLCMin,max:nlcdLCMax,palette:Object.values(nlcdLCVizDict),addToClassLegend: true,classLegendDict:nlcdLegendDictReverse,queryDict: nlcdLCQueryDict},'NLCD Landcover ' + yr.toString(),false);
  // });
  // nlcdImpvYears.getInfo().map(function(yr){
  //   var nlcdImpvYr = nlcdImpv.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic();
  //   Map2.addLayer(nlcdImpvYr,{'min':0,'max':90,'palette':'000,555,FF0,F30,F00'},'NLCD Impervious ' + yr.toString(),false);
  
  // });
  // nlcdTCCYears.getInfo().map(function(yr){
  //   var nlcdTCCYr = nlcdTCC.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic();
  //   Map2.addLayer(nlcdTCCYr,{'min':0,'max':90,'palette':'000,0F0',opacity:0.75},'NLCD Tree Canopy Cover ' + yr.toString(),false);
  
  // });

//Add NAIP to viewer
// var naipYears = ee.List.sequence(2007,2017).getInfo();
// var naip = ee.ImageCollection("USDA/NAIP/DOQQ").select([0,1,2],['R','G','B']);
// naipYears.map(function(yr){
//   var naipT = naip.filter(ee.Filter.calendarRange(yr,yr,'year'));
//   Map2.addLayer(naipT.mosaic(),{'min':25,'max':225,'addToLegend':false},'NAIP ' + yr.toString(),false,'','FFF','The National Agriculture Imagery Program (NAIP) acquired aerial imagery during the '+yr.toString()+' agricultural growing season in the continental U.S.');
// });
var mtbsIDS = getMTBSandIDS('anc','layer-list');  
var mtbs =mtbsIDS[0];
var nwiLegendDict= {'Freshwater- Forested and Shrub wetland':'008836',
                    'Freshwater Emergent wetland':'7fc31c',
                    'Freshwater pond': '688cc0',
                    'Estuarine and Marine wetland':'66c2a5',
                    'Riverine':'0190bf',
                    'Lakes': '13007c',
                    'Estuarine and Marine Deepwater': '007c88',
                    'Other Freshwater wetland':'b28653'
                  }
  var nwi_hi = ee.FeatureCollection("projects/lcms-292214/assets/HI-Ancillary-Data/HI_wetlands");
  nwi_hi = nwi_hi.map(function(f){return f.set('WETLAND_TY_NO',f.get('WETLAND_TY'))});
  var props =nwi_hi.aggregate_histogram('WETLAND_TY_NO').keys();
  var props_nos = ee.List.sequence(1,props.length());
  nwi_hi = nwi_hi.remap(props,props_nos,'WETLAND_TY_NO');
  // var nwi_dict = ee.Dictionary.fromLists(props_nos.map((n)=>ee.Number(n).byte().format()),props).getInfo();
  var nwi_dict = {1: 'Estuarine and Marine Deepwater', 2: 'Estuarine and Marine Wetland', 3: 'Freshwater Emergent Wetland', 4: 'Freshwater Forested/Shrub Wetland', 5: 'Freshwater Pond', 6: 'Lake', 7: 'Riverine'};
  var nwi_palette = ['007c88','66c2a5','7fc31c','008836','688cc0','13007c','0190bf'];
  var nwi_hi_rast = nwi_hi.reduceToImage(['WETLAND_TY_NO'], ee.Reducer.first()).rename(['NWI']).set('system:time_start',ee.Date.fromYMD(2019,6,1).millis());
  // Map2.addLayer(nwi_hi_rast,{layerType:'geeImage',min:1,max:7,palette:nwi_palette,classLegendDict:nwiLegendDict,queryDict:nwi_dict},'NWI');                

    Map2.addLayer([{baseURL:'https://fwsprimary.wim.usgs.gov/server/rest/services/Wetlands_Raster/ImageServer/exportImage?f=image&bbox=',minZoom:2},{baseURL:'https://fwsprimary.wim.usgs.gov/server/rest/services/Wetlands/MapServer/export?dpi=96&transparent=true&format=png8&bbox=',minZoom:11}],{layerType:'dynamicMapService',addToClassLegend: true,classLegendDict:nwiLegendDict},'NWI',true)
esri_lc_dict = {'Water':'008',
                'Trees':'080',
                'Flooded Vegetation':'088',
                'Built Area':'D00',
              }
// Map2.addLayer([{baseURL:'https://env1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer/exportImage?f=image&bbox=',minZoom:0,ending:'&compressionQuality=75&format=jpgpng&mosaicRule=%7B%22ascending%22%3Atrue%2C%22mosaicMethod%22%3A%22esriMosaicNorthwest%22%2C%22mosaicOperation%22%3A%22MT_FIRST%22%7D&renderingRule=%7B%22rasterFunction%22%3A%22Cartographic%20Renderer%20-%20Legend%20and%20Attribute%20Table%22%7D&time=1483272000000'},{baseURL:'https://env1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer/exportImage?f=image&bbox=',minZoom:11,ending:'&compressionQuality=75&format=jpgpng&mosaicRule=%7B%22ascending%22%3Atrue%2C%22mosaicMethod%22%3A%22esriMosaicNorthwest%22%2C%22mosaicOperation%22%3A%22MT_FIRST%22%7D&renderingRule=%7B%22rasterFunction%22%3A%22Cartographic%20Renderer%20-%20Legend%20and%20Attribute%20Table%22%7D&time=1483272000000'}],{layerType:'dynamicMapService',addToClassLegend: true,classLegendDict:nwiLegendDict},'ESRI LC 2017',true)

// Map2.addLayer([{baseURL:'https://env1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer/exportImage?f=image&bbox=',minZoom:0,ending:'&compressionQuality=75&format=jpgpng&mosaicRule=%7B%22ascending%22%3Atrue%2C%22mosaicMethod%22%3A%22esriMosaicNorthwest%22%2C%22mosaicOperation%22%3A%22MT_FIRST%22%7D&renderingRule=%7B%22rasterFunction%22%3A%22Cartographic%20Renderer%20-%20Legend%20and%20Attribute%20Table%22%7D&time=1577880000000'},{baseURL:'https://env1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer/exportImage?f=image&bbox=',minZoom:11,ending:'&compressionQuality=75&format=jpgpng&mosaicRule=%7B%22ascending%22%3Atrue%2C%22mosaicMethod%22%3A%22esriMosaicNorthwest%22%2C%22mosaicOperation%22%3A%22MT_FIRST%22%7D&renderingRule=%7B%22rasterFunction%22%3A%22Cartographic%20Renderer%20-%20Legend%20and%20Attribute%20Table%22%7D&time=1577880000000'}],{layerType:'dynamicMapService',addToClassLegend: true,classLegendDict:nwiLegendDict},'ESRI LC 2021',true)
  // Map2.addLayer([{baseURL:'https://www.fws.gov/wetlandsmapper/rest/services/Wetlands_Raster/ImageServer/exportImage?f=image&bbox=',minZoom:2},{baseURL:'https://www.fws.gov/wetlandsmapper/rest/services/Wetlands_Raster/ImageServer/exportImage?dpi=96&transparent=true&format=png32&layers=show%3A0%2C1&bbox=',minZoom:11}],{layerType:'dynamicMapService',addToClassLegend: true,classLegendDict:nwiLegendDict},'NWI',true)


// addDynamicToMap('https://fwsprimary.wim.usgs.gov/server/rest/services/Wetlands_Raster/ImageServer/exportImage?f=image&bbox=',
//                 'https://fwsprimary.wim.usgs.gov/server/rest/services/Wetlands/MapServer/export?dpi=96&transparent=true&format=png8&bbox=',
//                 8,11,
//                 'NWI',false,'National Wetlands Inventory data as viewed in https://www.fws.gov/wetlands/Data/Mapper.html from zoom levels >= 8')
var years = ee.List.sequence(1984,2022).getInfo();
var dummyNLCDImage = ee.Image(nlcdLC.first());
var cdl = ee.ImageCollection('USDA/NASS/CDL').select([0],['cdl']);



//Denote dca_codes
//From: https://www.fs.fed.us/foresthealth/technology/pdfs/Appendix_E_DCA_20141030.pdf
//DCA codes are divided by 1000
var dca_codes = {
  10:'General Insects',
  11:'Bark Beetles',
  12:'Defoliators',
  13: 'Chewing Insects',
  14:'Sap Feeding Insects',
  15: 'Boring Insects',
  16: 'Seed/Cone/Flower/Fruit Insects',
  17: 'Gallmaker Insects',
  18: 'Insect Predators',
  19: 'General Diseases',
  20: 'Biotic Damage',
  21: 'Root/Butt Diseases',
  22: 'Stem Decays/Cankers',
  23: 'Parsitic/Epiphytic Plants',
  24: 'Decline Complexes/Dieback/Wilts',
  25: 'Foliage Diseases',
  26: 'Stem Rusts',
  27: 'Broom Rusts',
  28: 'Terminal, Shoot, and Twig Insects',
  29: 'Root Insects',
  30: 'Fire',
  40: 'Wild Animals',
  50: 'Abiotic Damage',
  60: 'Competition',
  70: 'Human Activities',
  80: 'Multi-Damage (Insect/Disease)',
  85: 'Plants',
  90: 'Other Damages and Symptoms',
  99: 'No Damage'
};
var damage_codes = {1:'Not Specified',
  2:    'Mortality',
3   :'Crown Discoloration',
4   :'Crown Dieback',
5   :'Topkill',
6   :'Branch Breakage',
7   :'Main stem Broken or Uprooted',
8   :'Branch flagging',
9   :'No damage',
11: 'Mortality - Previously Undocumented',
12: 'Defoliation < 50% of leaves defoliated',
13: 'Defoliation 50-75% of leaves defoliated',
14: 'Defoliation > 75% of leaves defoliated',
18: 'Other Damage (known)',
19: 'Unknown Damage'
};

// var cdl = ee.Image('USDA/NASS/CDL/2014').select([0]);

var d = ee.Image('USDA/NASS/CDL/2014').select([0]).toDictionary();

var cdlNames = ee.List(d.get('cropland_class_names'));
var cdlValues = ee.List(d.get('cropland_class_values'));
var cdlPalette = ee.List(d.get('cropland_class_palette'));
var cdlQueryDict = {};
cdlValues.zip(cdlNames).getInfo().map(function(l){cdlQueryDict[l[0]] = l[1]});
var cdlLegendDict = {};
cdlNames.zip(cdlPalette).getInfo().map(function(l){cdlLegendDict[l[0]] = l[1]});
// var cdl2 = ee.Image('USDA/NASS/CDL/2018').select([0]);
// var palette = cdl2.get('cropland_class_palette').getInfo();

// Map2.addLayer(cdl2,{min:0,max:254,palette:palette,addToClassLegend:true,classLegendDict:cdlLegendDict,queryDict:cdlQueryDict},'CDL')

// Terra-Climate
var pdsiStartYear = 1984;
var pdsiEndYear = 2022;
var terra = ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE')
   .filter(ee.Filter.calendarRange(pdsiStartYear-1, pdsiEndYear,'year'));
var terra_pdsi = terra.select('pdsi').map(function(img) {return img.multiply(0.01).copyProperties(img,['system:time_start']).copyProperties(img)});
var years = ee.List.sequence(pdsiStartYear, pdsiEndYear).getInfo();
var annualPDSI = years.map(function(yr) {
  var startDate = ee.Date.fromYMD(yr-1, 10, 1);
  var endDate = ee.Date.fromYMD(yr, 9, 30);
  var yearPDSI = terra_pdsi.filter(ee.Filter.date(startDate, endDate));
  var meanPDSI = yearPDSI.reduce(ee.Reducer.mean()).set('system:time_start', ee.Date.fromYMD(yr,6,1).millis());
  return ee.Image(meanPDSI);
});
annualPDSI = ee.ImageCollection(annualPDSI);   
annualPDSI = annualPDSI.map(function(img) {
  var t = img;
  img = img.clamp(-5, 5);
  img = img.where(img.lt(-0.5), img.floor())
  img = img.where((img.gte(-0.5)).and(img.lt(0.5)), 0)
  img = img.where(img.gte(0.5), img.ceil())
  return img.add(5).copyProperties(t,['system:time_start']);
});
var pdsiDict = {
  10:'extremely wet',      // 4 +        == 5
  9:'very wet',           // 3-3.99     == 4
  8:'moderately wet',     // 2-2.99     == 3
  7:'slightly wet',       // 1-1.99     == 2
  6:'incipient wet spell',// 0.5-0.99   == 1
  5:'near normal',        // -0.49-0.49 == 0
  4:'incipient dry spell',// -0.99--0.5 == -1
  3:'mild drought',       // -1.99--1   == -2
  2:'moderate drought',   // -2.99--2   == -3
  1:'severe drought',     // -3.99--3   == -4
  0:'extreme drought'}
var idsCollection = mtbsIDS[1].select([1,0],['IDS Type','IDS DCA']);


//PRVI layers
var vi_2007 = ee.Image("projects/lcms-292214/assets/R8/PR_USVI/Ancillary/usvi_land_cover_usvigap_2007")
              .add(50).byte()
              .set('system:time_start',ee.Date.fromYMD(2007,6,1).millis());
              
var pr_1991 = ee.Image('projects/lcms-292214/assets/R8/PR_USVI/Ancillary/LandCover_PR_1991')
              .set('system:time_start',ee.Date.fromYMD(1991,6,1).millis());

var pr_2000 = ee.Image('projects/lcms-292214/assets/R8/PR_USVI/Ancillary/LandCover_PR_2000')
              .set('system:time_start',ee.Date.fromYMD(2000,6,1).millis());

var vi_2000 = ee.Image('projects/lcms-292214/assets/R8/PR_USVI/Ancillary/LandCover_VI_2000')
              .set('system:time_start',ee.Date.fromYMD(2000,6,1).millis());
var mona = ee.Image('projects/lcms-292214/assets/R8/PR_USVI/Ancillary/LandCover_Mona_2008')
              .set('system:time_start',ee.Date.fromYMD(2008,6,1).millis());
var pr_2010 = ee.Image('projects/lcms-292214/assets/R8/PR_USVI/Ancillary/Landcover_2010_PR_CCAP') 
              .add(27).byte()
              .set('system:time_start',ee.Date.fromYMD(2010,6,1).millis());
              


var pr_2000 = ee.ImageCollection([pr_2000,mona,vi_2000]).mosaic()
              .set('system:time_start',ee.Date.fromYMD(2000,6,1).millis());

var prvi_lc_collection = ee.ImageCollection.fromImages(
  [pr_1991, pr_2000, vi_2007, pr_2010]);
prvi_lc_collection = prvi_lc_collection.map(function(img){return img.add(1).copyProperties(img,['system:time_start'])});

var prvi_lc_dict = {
  0: {'Name': 'Background/water', 'Color': '476ba1'},           // 1991, 2000 and 2008 PR LC
  1: {'Name': 'High-Medium Density Urban', 'Color': 'ab0000'},
  2: {'Name': 'Low-Medium Density Urban', 'Color': 'd99482'},
  3: {'Name': 'Herbaceous Agriculture - Cultivated Lands', 'Color': 'ffff00'},
  4: {'Name': 'Active Sun Coffee and Mixed Woody Agriculture', 'Color': 'ffcc00'},
  5: {'Name': 'Pasture, Hay or Inactive Agriculture (e.g. abandoned sugar cane)', 'Color': 'ffff66'},
  6: {'Name': 'Pasture, Hay or other Grassy Areas (e.g. soccer fields)', 'Color': 'ffcc66'},
  7: {'Name': 'Drought Deciduous Open Woodland',  'Color': '00cc00'},
  8: {'Name': 'Drought Deciduous Dense Woodland', 'Color': '006600'},
  9: {'Name': 'Deciduous, Evergreen Coastal and Mixed Forest or Shrubland with Succulents', 'Color': '9900ff'},
  10: {'Name': 'Semi-Deciduous and Drought Deciduous Forest on Alluvium and Non-Carbonate Substrates', 'Color': '66ff66'},
  11: {'Name': 'Semi-Deciduous and Drought Deciduous Forest on Karst (includes semi-evergreen forest)', 'Color': '003300'},
  12: {'Name': 'Drought Deciduous, Semi-deciduous and Seasonal Evergreen Forest on Serpentine', 'Color': '66ff33'},
  13: {'Name': 'Seasonal Evergreen and Semi-Deciduous Forest on Karst', 'Color': '3333ff'},
  14: {'Name': 'Seasonal Evergreen and Evergreen Forest', 'Color': '3333cc'},
  15: {'Name': 'Seasonal Evergreen Forest with Coconut Palm', 'Color': '6666ff'},
  16: {'Name': 'Evergreen and Seasonal Evergreen Forest on Karst', 'Color': '333399'},
  17: {'Name': 'Evergreen Forest on Serpentine', 'Color': '6600ff'},
  18: {'Name': 'Elfin, Sierra Palm, Transitional and Tall Cloud Forest', 'Color': '66ffcc'},
  19: {'Name': 'Emergent Wetlands Including Seasonally Flooded Pasture', 'Color': '00ffff'},
  20: {'Name': 'Salt or Mud Flats', 'Color': '999966'},
  21: {'Name': 'Mangrove', 'Color': '006666'},
  22: {'Name': 'Seaonally Flooded Savannahs and Woodlands', 'Color': '006699'},
  23: {'Name': 'Pterocarpus Swamp', 'Color': '0099cc'},
  24: {'Name': 'Tidally Flooded Evergreen Dwarf-Shrubland and Forb Vegetation', 'Color': '33cccc'},
  25: {'Name': 'Quarries', 'Color': '996633'},
  26: {'Name': 'Coastal Sand and Rock', 'Color': 'cc9900'},
  27: {'Name': 'Bare Soil (including bulldozed land)', 'Color': '996600'},
  28: {'Name': 'Water - Permanent', 'Color': '476ba1'},
  29: {'Name': 'Developed, High Intensity','Color': 'f2f2f2'},               // 2010 PR LC CCAP
  30: {'Name': 'Developed, Medium Intensity', 'Color': 'a899a8'},
  31: {'Name': 'Developed, Low Intensity', 'Color': '8e757c'},
  32: {'Name': 'Developed, Open Space', 'Color': 'c1cc38'},
  33: {'Name': 'Cultivated Crops', 'Color': '542100'},
  34: {'Name': 'Pasture/Hay', 'Color': 'c1a04f'},
  35: {'Name': 'Grassland/Herbaceous', 'Color': 'f2ba87'},
  36: {'Name': 'Deciduous Forest', 'Color': '00f200'},
  37: {'Name': 'Evergreen Forest', 'Color': '003a00'},
  38: {'Name': 'Mixed Forest', 'Color': '07a03a'},
  39: {'Name': 'Scrub/Shrub', 'Color': '6d6d00'},
  40: {'Name': 'Palustrine Forested Wetland', 'Color': '005b5b'},
  41: {'Name': 'Palustrine Scrub/Shrub Wetland', 'Color': 'f26d00'},
  42: {'Name': 'Palustrine Emergent Wetland (Persistent)', 'Color': 'f200f2'},
  43: {'Name': 'Estuarine Forested Wetland', 'Color': '3d003d'},
  44: {'Name': 'Estuarine Scrub/Shrub Wetland', 'Color': '6d006d'},
  45: {'Name': 'Estuarine Emergent Wetland', 'Color': 'af00af'},
  46: {'Name': 'Unconsolidated Shore', 'Color': '00f2f2'},
  47: {'Name': 'Barren Land', 'Color': 'f2f200'},
  48: {'Name': 'Open Water', 'Color': '000077'},
  49: {'Name': 'Palustrine Aquatic Bed', 'Color': '0000f2'},
  50: {'Name': 'Ocean','Color': '000000'},                                   // 2007 USVI LC 
  51: {'Name': 'Dry Allucial Evergreen Gallery Forest','Color': '61381c'},
  52: {'Name': 'Dry Alluvial Semideciduous Forest','Color': '783d2e'},
  53: {'Name': 'Dry Alluvial Shrubland', 'Color': '856924'},
  54: {'Name': 'Dry Alluvial Open Shrubland', 'Color': 'dea354'},
  55: {'Name': 'Dry Alluvial Woodland', 'Color': 'db7d24'},
  56: {'Name': 'Dry Limestone Evergreen Gallery Forest', 'Color': '66571a'},
  57: {'Name': 'Dry Limestone Semideciduous Forest', 'Color': '6e593b'},
  58: {'Name': 'Dry Limestone Shrubland', 'Color': '807a26'},
  59: {'Name': 'Dry Limestone Open Shrubland', 'Color': 'ebcf47'},
  60: {'Name': 'Dry Limestone Woodland', 'Color': 'c7a138'},
  61: {'Name': 'Dry Noncalcareous Evergreen Gallery Forest', 'Color': '59591a'},
  62: {'Name': 'Dry Noncalcareous Semideciduous Forest', 'Color': '616e3b'},
  63: {'Name': 'Dry Noncalcareous Shrubland', 'Color': '788026'},
  64: {'Name': 'Dry Noncalcareous Open Shrubland', 'Color': 'bfc969'},
  65: {'Name': 'Dry Noncalcareous Woodland', 'Color': '9ead52'},
  66: {'Name': 'Lowland Moist Alluvial Evergreen Gallery Forest', 'Color': '003d00'},
  67: {'Name': 'Lowland Moist Noncalcareous Evergreen Forest', 'Color': '004d00'},
  68: {'Name': 'Lowland Moist Noncalcareous Evergreen Gallery Forest', 'Color': '2e361c'},
  69: {'Name': 'Lowland Moist Noncalcareous Shrubland', 'Color': '5c630f'},
  70: {'Name': 'Lowland Moist Noncalcareous Open Shrubland', 'Color': '96a33b'},
  71: {'Name': 'Lowland Moist Noncalcareous Woodland', 'Color': '4f5c26'},
  72: {'Name': 'Seasonally Flooded Nonsaline Forest', 'Color': '2e5c54'},
  73: {'Name': 'Seasonally Flooded Nonsaline Shrubland','Color': '3b736b'},
  74: {'Name': 'Seasonally Flooded Saline Forest','Color': '70294a'},
  75: {'Name': 'Seasonally Flooded Saline Shrubland', 'Color': 'a62470'},
  76: {'Name': 'Mangrove Forest and Shrubland', 'Color': '6b2e6b'},
  77: {'Name': 'Dry Grassland and Pastures', 'Color': 'f5f5db'},
  78: {'Name': 'Moist Grassland and Pastures', 'Color': 'd9d978'},
  79: {'Name': 'Seasonally Flooded Herbaceous Nonsaline Wetlands', 'Color': '85c7a1'},
  80: {'Name': 'Seasonally Flooded Herbaceous Saline Wetlands', 'Color': 'e3adba'},
  81: {'Name': 'Emergent Herbaceous Saline Wetlands', 'Color': '5cb582'},
  82: {'Name': 'Emergent Herbaceous Nonsaline Wetlands', 'Color': 'd68594'},
  83: {'Name': 'Hay and Row Crops', 'Color': 'ffbd42'},
  84: {'Name': 'Woody Agriculture and Plantations', 'Color': 'e6a159'},
  85: {'Name': 'Artificial Barrens', 'Color': '6e121c'},
  86: {'Name': 'Fine to Medium Grained Sandy Beaches', 'Color': 'ffff00'},
  87: {'Name': 'Gravel Beaches', 'Color': 'bfbfbf'},
  88: {'Name': 'Mixed Sand and Gravel Beaches', 'Color': 'dbdb00'},
  89: {'Name': 'Riparian and Other Natural Barrens', 'Color': '055e26'},
  90: {'Name': 'Riprap', 'Color': '545457'},
  91: {'Name': 'Rocky Cliffs and Shelves', 'Color': '808080'},
  92: {'Name': 'Salt and Mudflats', 'Color': 'd9d9d9'},
  93: {'Name': 'Maintained Grassland', 'Color': 'c7ded6'},
  94: {'Name': 'Low-density Urban Development', 'Color': 'e00054'},
  95: {'Name': 'Medium-density Urban Development', 'Color': 'bd0000'},
  96: {'Name': 'High-density Urban Development', 'Color': '822447'},
  97: {'Name': 'Aquaculture', 'Color': '0da1f2'},
  98: {'Name': 'Fresh Water', 'Color': '0000ff'},
  99: {'Name': 'Salt Water', 'Color': '360aa6'}
};
var prvi_lc_lookup = {};
var prvi_lc_legend = {};
var prvi_lc_palette = [];
Object.keys(prvi_lc_dict).map(function(k){
  prvi_lc_lookup[parseInt(k)+1] = prvi_lc_dict[k]['Name']
  prvi_lc_legend[prvi_lc_dict[k]['Name']] = prvi_lc_dict[k]['Color']
  prvi_lc_palette.push(prvi_lc_dict[k]['Color'])
})
var prvi_bounds = {
  "geodesic": false,
  "type": "Polygon",
  "coordinates": [
    [
      [
        -67.9754761385265,
        17.64336610970855
      ],
      [
        -64.53643398488734,
        17.64336610970855
      ],
      [
        -64.53643398488734,
        18.54626790365004
      ],
      [
        -67.9754761385265,
        18.54626790365004
      ],
      [
        -67.9754761385265,
        17.64336610970855
      ]
    ]
  ]
};
// Map2.addTimeLapse(prvi_lc_collection.set('bounds',prvi_bounds),{years:[1991, 2000, 2007, 2010],min:1,max:100,palette:prvi_lc_palette,addToClassLegend:true,classLegendDict:prvi_lc_legend}, 'PRVI LC Time Lapse')
// var prvi_winds = ee.ImageCollection('projects/lcms-292214/assets/R8/PR_USVI/Ancillary/Hurricane_Wind_Images');
// var hurricane_years = [2004,2007,2008,2009,2010,2011,2012,2013,2014,2015,2017,2018];//all.aggregate_histogram('year').keys().getInfo();

// prvi_winds = ee.ImageCollection(hurricane_years.map(function(yr){
  // return prvi_winds.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic().addBands(ee.Image(yr).rename(['year'])).float().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
// })
// );

// Map2.addTimeLapse(prvi_winds.select([0]),{years:hurricane_years,min: 30, max: 160, palette: palettes.niccoli.isol[7]}, 'PRVI Wind Time Lapse')

// var maxWinds = prvi_winds.qualityMosaic('Max_Wind_MPH');
// console.log(prvi_lc_lookup)
// print(idsCollection.getInfo())
// var mortType = idsCollection.select(['IDS Mort Type']).max();
// var mortDCA = idsCollection.select(['IDS Mort DCA']).max();
// var defolType = idsCollection.select(['IDS Defol Type']).max();
// var defolDCA = idsCollection.select(['IDS Defol DCA']).max();

// var typeViz = {min:1,max:19,palette:'F00,888,00F',queryDict:damage_codes};
// var dcaViz = {min:10,max:99,palette:'F00,888,00F',queryDict:dca_codes};
// Map2.addLayer(mortType,typeViz,'mortType');
// Map2.addLayer(mortDCA,dcaViz,'mortDCA');
// Map2.addLayer(defolType,typeViz,'defolType');
// Map2.addLayer(defolDCA,dcaViz,'defolDCA')
annualPDSI = batchFillCollection(annualPDSI,years).map(setSameDate);  
idsCollection = batchFillCollection(idsCollection,years).map(setSameDate);  
nlcdLC = batchFillCollection(nlcdLC,years).map(setSameDate);
// nlcdLCMS = batchFillCollection(nlcdLCMS,years)
mtbs = batchFillCollection(mtbs,years).map(setSameDate);
cdl = batchFillCollection(cdl,years).map(setSameDate);
nlcdTCC = batchFillCollection(nlcdTCC,years).map(setSameDate);
nlcdImpv = batchFillCollection(nlcdImpv,years).map(setSameDate);

nwi_hi_rast = batchFillCollection(ee.ImageCollection([nwi_hi_rast]),years).map(setSameDate);
// prvi_lc_collection = batchFillCollection(prvi_lc_collection,years).map(setSameDate);
// prvi_winds = batchFillCollection(prvi_winds.select([0,1,2]),years).map(setSameDate);
// prUSVI_ch_2018 = batchFillCollection(ee.ImageCollection([prUSVI_ch_2018]),years).map(setSameDate);
var forCharting = joinCollections(mtbs.select([0],['MTBS Burn Severity']), annualPDSI.select([0],['PDSI']),false)//cdl.select([0],['Cropland Data']),false);
// forCharting  = joinCollections(forCharting,annualPDSI.select([0],['PDSI']), false);
forCharting  = joinCollections(forCharting,idsCollection, false);
forCharting  = joinCollections(forCharting,nlcdLC.select([0],['NLCD Landcover']), false);
// forCharting  = joinCollections(forCharting,nlcdLCMS.select([0],['NLCD LCMS Landcover']), false);
forCharting  = joinCollections(forCharting,nlcdTCC.select([0],['NLCD % Tree Canopy Cover']), false);
forCharting  = joinCollections(forCharting,nlcdImpv.select([0],['NLCD % Impervious']), false);
// forCharting  = joinCollections(forCharting,prvi_lc_collection.select([0],['PRVI Landcover']), false);
// forCharting  = joinCollections(forCharting,prvi_winds, false);
// forCharting  = joinCollections(forCharting,prUSVI_ch_2018, false);
forCharting  = joinCollections(forCharting,nwi_hi_rast, false);

// console.log(forCharting.first().bandNames().getInfo())

var chartTableDict = {
  'IDS Type':damage_codes,
  'IDS DCA':dca_codes,
  'MTBS Burn Severity':mtbsQueryClassDict,
  'NLCD Landcover':nlcdLCQueryDict,
  'NLCD LCMS Landcover':nlcdLCQueryDict,
  'Cropland Data':cdlQueryDict,
  'PDSI':pdsiDict,
  'PRVI Landcover':prvi_lc_lookup,
  'NWI':nwi_dict
}

forCharting = forCharting.set('chartTableDict',chartTableDict)
chartColors = chartColorsDict.ancillary;
// chartCollection = forCharting;
pixelChartCollections['anc'] =  {
    'label':'Ancillary',
    'collection':forCharting,
    'chartTableDict':chartTableDict
}
populatePixelChartDropdown();
// addChartJS(d,'test1');
}

function applyBitMask(img,bit,bitMaskBandName){
  if(bitMaskBandName === undefined || bitMaskBandName === null){bitMaskBandName = 'QA_PIXEL'}
  var m = img.select([bitMaskBandName]).uint16();
  m = m.bitwiseAnd(ee.Image(1<<bit)).neq(0);
  return img.updateMask(m.not());
}
  ////////////////////////////////////////////////////////////////////////////////
  // Function for finding dark outliers in time series.
  // Original concept written by Carson Stam and adapted by Ian Housman.
  // Adds a band that is a mask of pixels that are dark, and dark outliers.
  function simpleTDOM2(collection,zScoreThresh,shadowSumThresh,contractPixels,
    dilatePixels,shadowSumBands,irMean,irStdDev){
    if(zScoreThresh === undefined || zScoreThresh === null){zScoreThresh = -1}
    if(shadowSumThresh === undefined || shadowSumThresh === null){shadowSumThresh = 0.35}
    if(contractPixels === undefined || contractPixels === null){contractPixels = 1.5}
    if(dilatePixels === undefined || dilatePixels === null){dilatePixels = 3.5}
    if(shadowSumBands === null || shadowSumBands === undefined){
      shadowSumBands = ['nir','swir1'];
    }
    
    
    // Get some pixel-wise stats for the time series
    if(irMean === null || irMean === undefined){
      print('Computing irMean for TDOM');
      irMean = collection.select(shadowSumBands).mean();
    }
    if(irStdDev === null || irStdDev === undefined){
      print('Computing irStdDev for TDOM');
      irStdDev = collection.select(shadowSumBands).reduce(ee.Reducer.stdDev());
    }
    
    // Mask out dark dark outliers
    collection = collection.map(function(img){
      var zScore = img.select(shadowSumBands).subtract(irMean).divide(irStdDev);
      var irSum = img.select(shadowSumBands).reduce(ee.Reducer.sum());
      var TDOMMask = zScore.lt(zScoreThresh).reduce(ee.Reducer.sum()).eq(shadowSumBands.length)
        .and(irSum.lt(shadowSumThresh));
      TDOMMask = TDOMMask.focal_min(contractPixels).focal_max(dilatePixels);
      return img.updateMask(TDOMMask.not());
    });
    
    return collection;
  }

  ////////////////////////////////////////////////////////////////////////////////
function runLT(){
  // var startYear = 1984;
  // var endYear   = 2019;
  startYear = parseInt(urlParams.startYear);
  endYear = parseInt(urlParams.endYear);
  startJulian = parseInt(urlParams.startJulian);
  endJulian = parseInt(urlParams.endJulian);
  yearBuffer = parseInt(urlParams.yearBuffer);
  minObs = parseInt(urlParams.minObs);
  LTSortBy = urlParams.LTSortBy;
  lossMagThresh = parseFloat(urlParams.lossMagThresh);
  lossSlopeThresh = parseFloat(urlParams.lossSlopeThresh);
  gainMagThresh = parseFloat(urlParams.gainMagThresh);
  gainSlopeThresh = parseFloat(urlParams.gainSlopeThresh);
  howManyToPull = parseInt(urlParams.howManyToPull);
  maxSegments = parseInt(urlParams.maxSegments);
  /////////////////////////////////////////////////////////////////
  //Function for only adding common indices
  function simpleAddIndices(in_image){
      in_image = in_image.addBands(in_image.normalizedDifference(['nir', 'red']).select([0],['NDVI']));
      in_image = in_image.addBands(in_image.normalizedDifference(['nir', 'swir2']).select([0],['NBR']));
      in_image = in_image.addBands(in_image.normalizedDifference(['nir', 'swir1']).select([0],['NDMI']));
      in_image = in_image.addBands(in_image.normalizedDifference(['green', 'swir1']).select([0],['NDSI']));
    
      return in_image;
  }
  function simpleGetTasseledCap(image) {
 
  var bands = ee.List(['blue','green','red','nir','swir1','swir2']);
  // // Kauth-Thomas coefficients for Thematic Mapper data
  // var coefficients = ee.Array([
  //   [0.3037, 0.2793, 0.4743, 0.5585, 0.5082, 0.1863],
  //   [-0.2848, -0.2435, -0.5436, 0.7243, 0.0840, -0.1800],
  //   [0.1509, 0.1973, 0.3279, 0.3406, -0.7112, -0.4572],
  //   [-0.8242, 0.0849, 0.4392, -0.0580, 0.2012, -0.2768],
  //   [-0.3280, 0.0549, 0.1075, 0.1855, -0.4357, 0.8085],
  //   [0.1084, -0.9022, 0.4120, 0.0573, -0.0251, 0.0238]
  // ]);
  
  //Crist 1985 coeffs - TOA refl (http://www.gis.usu.edu/~doug/RS5750/assign/OLD/RSE(17)-301.pdf)
  var coefficients = ee.Array([[0.2043, 0.4158, 0.5524, 0.5741, 0.3124, 0.2303],
                    [-0.1603, -0.2819, -0.4934, 0.7940, -0.0002, -0.1446],
                    [0.0315, 0.2021, 0.3102, 0.1594, -0.6806, -0.6109]]);
  // Make an Array Image, with a 1-D Array per pixel.
  var arrayImage1D = image.select(bands).toArray();
  
  // Make an Array Image with a 2-D Array per pixel, 6x1.
  var arrayImage2D = arrayImage1D.toArray(1);
  
  var componentsImage = ee.Image(coefficients)
    .matrixMultiply(arrayImage2D)
    // Get rid of the extra dimensions.
    .arrayProject([0])
    // Get a multi-band image with TC-named bands.
    .arrayFlatten(
      [['brightness', 'greenness', 'wetness']])
    .float();
  
  return image.addBands(componentsImage);
  }
  ///////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  //Only adds tc bg angle as in Powell et al 2009
  //https://www.sciencedirect.com/science/article/pii/S0034425709003745?via%3Dihub
  function simpleAddTCAngles(image){
    // Select brightness, greenness, and wetness bands
    var brightness = image.select(['brightness']);
    var greenness = image.select(['greenness']);
    var wetness = image.select(['wetness']);
    
    // Calculate Tasseled Cap angles and distances
    var tcAngleBG = brightness.atan2(greenness).divide(Math.PI).rename('tcAngleBG');
    
    return image.addBands(tcAngleBG);
  }
  ///////////////////////////////////////////////////////////////////////////////
  function addYearBand(img){
    var d = ee.Date(img.get('system:time_start'));
    var y = d.get('year');
    
    var db = ee.Image.constant(y).rename(['year']).float();
    db = db;//.updateMask(img.select([0]).mask())
    return img.addBands(db).float();
  }
  // Helper function to apply an expression and linearly rescale the output.
  // Used in the landsatCloudScore function below.
  function rescale(img, exp, thresholds) {
    return img.expression(exp, {img: img})
      .subtract(thresholds[0]).divide(thresholds[1] - thresholds[0]);
  }
  ////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  // Function for computing the mean squared difference medoid from an image 
  // collection
  function medoidMosaicMSD(inCollection,medoidIncludeBands) {
    // Find band names in first image
    var f = ee.Image(inCollection.first());
    var bandNames = f.bandNames();
    //var bandNumbers = ee.List.sequence(1,bandNames.length());
    
    if (medoidIncludeBands === undefined || medoidIncludeBands === null) {
      medoidIncludeBands = bandNames;
    }
    // Find the median
    var median = inCollection.select(medoidIncludeBands).median();
    
    // Find the squared difference from the median for each image
    var medoid = inCollection.map(function(img){
      var diff = ee.Image(img).select(medoidIncludeBands).subtract(median)
        .pow(ee.Image.constant(2));
      // img = addFullYearJulianDayBand(img);
      return diff.reduce('sum').addBands(img);
    });
    // When exported as CSV, this provides a weighted list of the scenes being included in the composite
    // Map.addLayer(medoid,{},'Medoid Image Collection Scenes') 
    
    // bandNames = bandNames.cat(['yearJulian']);
    var bandNumbers = ee.List.sequence(1, bandNames.length());
    // Minimize the distance across all bands
    medoid = ee.ImageCollection(medoid)
      .reduce(ee.Reducer.min(bandNames.length().add(1)))
      .select(bandNumbers,bandNames);
    
    return medoid;
  }

////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  // Compute a cloud score and adds a band that represents the cloud mask.  
  // This expects the input image to have the common band names: 
  // ["red", "blue", etc], so it can work across sensors.
  function landsatCloudScore(img) {
    // Compute several indicators of cloudiness and take the minimum of them.
    var score = ee.Image(1.0);
    // Clouds are reasonably bright in the blue band.
    score = score.min(rescale(img, 'img.blue', [0.1, 0.3]));
   
    // Clouds are reasonably bright in all visible bands.
    score = score.min(rescale(img, 'img.red + img.green + img.blue', [0.2, 0.8]));
     
    // Clouds are reasonably bright in all infrared bands.
    score = score.min(
      rescale(img, 'img.nir + img.swir1 + img.swir2', [0.3, 0.8]));

    // Clouds are reasonably cool in temperature.
    score = score.min(rescale(img,'img.temp', [300, 290]));

    // However, clouds are not snow.
    var ndsi = img.normalizedDifference(['green', 'swir1']);
    score = score.min(rescale(ndsi, 'img', [0.8, 0.6]));
    
   
    score = score.multiply(100).byte();
    score = score.clamp(0,100);
    return score;
  }
  function applyLandsatCloudScore(img){
    var cloudScoreThresh = 20;
    var cs = landsatCloudScore(img);
    var cloudMask = cs.lt(cloudScoreThresh);
    return img.updateMask(cloudMask);
  }
  ///////////////////////////////////////////////////////////////////////////
  //Function to handle empty collections that will cause subsequent processes to fail
  //If the collection is empty, will fill it with an empty image
  function fillEmptyCollections(inCollection,dummyImage){                       
    var dummyCollection = ee.ImageCollection([dummyImage.mask(ee.Image(0))]);
    var imageCount = inCollection.toList(1).length();
    return ee.ImageCollection(ee.Algorithms.If(imageCount.gt(0),inCollection,dummyCollection));

  }
  //////////////////////////////////////////////////////////////////////////////////
  //Direction of  a decrease in photosynthetic vegetation- add any that are missing
  var changeDirDict = {
  "blue":1,"green":1,"red":1,"nir":-1,"swir1":1,"swir2":1,"temp":1,
  "NDVI":-1,"NBR":-1,"NDMI":-1,"NDSI":1,
  "brightness":1,"greenness":-1,"wetness":-1,"fourth":-1,"fifth":1,"sixth":-1,

  "ND_blue_green":-1,"ND_blue_red":-1,"ND_blue_nir":1,"ND_blue_swir1":-1,"ND_blue_swir2":-1,
  "ND_green_red":-1,"ND_green_nir":1,"ND_green_swir1":-1,"ND_green_swir2":-1,"ND_red_swir1":-1,
  "ND_red_swir2":-1,"ND_nir_red":-1,"ND_nir_swir1":-1,"ND_nir_swir2":-1,"ND_swir1_swir2":-1,
  "R_swir1_nir":1,"R_red_swir1":-1,"EVI":-1,"SAVI":-1,"IBI":1,
  "tcAngleBG":-1,"tcAngleGW":-1,"tcAngleBW":-1,"tcDistBG":1,"tcDistGW":1,"tcDistBW":1,
  'NIRv':-1
  };
  ///////////////////////////////////////////////////////////////
  //Function to convert an image array object to collection
  function arrayToTimeSeries(tsArray,yearsArray,possibleYears,bandName){
      //Set up dummy image for handling null values
      var noDateValue = -32768;
      var dummyImage = ee.Image(noDateValue).toArray();
      
      //Ierate across years
      var tsC = possibleYears.map(function(yr){
        yr = ee.Number(yr);
        
        //Pull out given year
        var yrMask = yearsArray.eq(yr);
      
        //Mask array for that given year
        var masked = tsArray.arrayMask(yrMask);
        
        
        //Find null pixels
        var l = masked.arrayLength(0);
        
        //Fill null values and convert to regular image
        masked = masked.where(l.eq(0),dummyImage).arrayGet([-1]);
        
        //Remask nulls
        masked = masked.updateMask(masked.neq(noDateValue)).rename([bandName])      
          .set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
          
        return masked;
      
      
    });
    return ee.ImageCollection(tsC);
    }

  //////////////////////////////////////////////////////////////////////////////////////////
  // Function to prep data following our workflows. Will have to run Landtrendr and convert to stack after.
  function prepTimeSeriesForLandTrendr(ts,indexName, run_params){
    var maxSegments = ee.Number(run_params.maxSegments);
    //var startYear = ee.Date(ts.first().get('system:time_start')).get('year');
    //var endYear = ee.Date(ts.sort('system:time_start',false).first().get('system:time_start')).get('year');

     //Get single band time series and set its direction so that a loss in veg is going up
    ts = ts.select([indexName]);
    var distDir = changeDirDict[indexName];
    var tsT = ts.map(function(img){return multBands(img, 1, distDir)});
    
    //Find areas with insufficient data to run LANDTRENDR
    var countMask = tsT.count().unmask().gte(maxSegments.add(1));

    tsT = tsT.map(function(img){
      var m = img.mask();
      //Allow areas with insufficient data to be included, but then set to a dummy value for later masking
      m = m.or(countMask.not());
      img = img.mask(m);
      img = img.where(countMask.not(),-32768);
      return img});

    run_params.timeSeries = tsT;
    var runMask = countMask.rename('insufficientDataMask');
    var prepDict = {
      'run_params': run_params,
      'runMask':    runMask,
      'distDir':    distDir
    }
    
    return prepDict;  
  }
  //////////////////////////////////////////////
  //Function to join raw time series with fitted time series from LANDTRENDR
  //Takes the rawTs as an imageCollection, lt is the first band of the output from LANDTRENDR, and the distDir
  //is the direction of change for a loss in vegeation for the chosen band/index
  function getRawAndFittedLT(rawTs,lt,startYear,endYear,indexName,distDir){
    if(indexName === undefined || indexName === null){indexName = 'Band'}
    if(distDir === undefined || distDir === null){distDir = -1}
    
    //Pop off years and fitted values
    var ltYear = lt.arraySlice(0,0,1).arrayProject([1]);
    var ltFitted = lt.arraySlice(0,2,3).arrayProject([1]);
    
    //Flip fitted values if needed
    if(distDir == -1){ltFitted = ltFitted.multiply(-1)}
    
    //Convert array to an imageCollection
    var fittedCollection = arrayToTimeSeries(ltFitted,ltYear,ee.List.sequence(startYear,endYear),'LT_Fitted_'+indexName);
    
    //Join raw time series with fitted
    var joinedTS = joinCollections(rawTs,fittedCollection,false);
    
    return joinedTS;
    

  }
  //Adapted version for converting sorted array to image

function getLTStack(LTresult,maxVertices,bandNames) {
  var nBands = bandNames.length;
  var emptyArray = [];                              // make empty array to hold another array whose length will vary depending on maxSegments parameter    
  var vertLabels = [];                              // make empty array to hold band names whose length will vary depending on maxSegments parameter 
  var iString;                                      // initialize variable to hold vertex number
  for(var i=1;i<=maxVertices;i++){     // loop through the maximum number of vertices in segmentation and fill empty arrays
    iString = i.toString();                         // define vertex number as string 
    vertLabels.push(iString);               // make a band name for given vertex
    emptyArray.push(-32768);                             // fill in emptyArray
  }
  //Set up empty array list
  var emptyArrayList = [];
  ee.List.sequence(1,nBands).getInfo().map(function(i){emptyArrayList.push(emptyArray)});
  var zeros = ee.Image(ee.Array(emptyArrayList));        // make an image to fill holes in result 'LandTrendr' array where vertices found is not equal to maxSegments parameter plus 1
                               
  
  var lbls = [bandNames, vertLabels,]; // labels for 2 dimensions of the array that will be cast to each other in the final step of creating the vertice output 
  
          // slices out the 4th row of a 4 row x N col (N = number of years in annual stack) matrix, which identifies vertices - contains only 0s and 1s, where 1 is a vertex (referring to spectral-temporal segmentation) year and 0 is not
  
  var ltVertStack = LTresult       // uses the sliced out isVert row as a mask to only include vertice in this data - after this a pixel will only contain as many "bands" are there are vertices for that pixel - min of 2 to max of 7. 
                      .addBands(zeros)              // ...adds the 3 row x 7 col 'zeros' matrix as a band to the vertOnly array - this is an intermediate step to the goal of filling in the vertOnly data so that there are 7 vertice slots represented in the data - right now there is a mix of lengths from 2 to 7
                      .toArray(1)                   // ...concatenates the 3 row x 7 col 'zeros' matrix band to the vertOnly data so that there are at least 7 vertice slots represented - in most cases there are now > 7 slots filled but those will be truncated in the next step
                      .arraySlice(1, 0, maxVertices) // ...before this line runs the array has 3 rows and between 9 and 14 cols depending on how many vertices were found during segmentation for a given pixel. this step truncates the cols at 7 (the max verts allowed) so we are left with a 3 row X 7 col array
                      .arrayFlatten(lbls, '');      // ...this takes the 2-d array and makes it 1-d by stacking the unique sets of rows and cols into bands. there will be 7 bands (vertices) for vertYear, followed by 7 bands (vertices) for rawVert, followed by 7 bands (vertices) for fittedVert, according to the 'lbls' list
  
  return ltVertStack.updateMask(ltVertStack.neq(-32768));                               // return the stack
};

  ////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function to convert from raw Landtrendr Output OR Landtrendr/VerdetVertStack output to Loss & Gain Space
// format = 'rawLandtrendr' (Landtrendr only) or 'vertStack' (Verdet or Landtrendr)
// If using vertStack format, this will not work if there are masked values in the vertStack. Must use getImagesLib.setNoData prior to 
// calling this function
// Have to apply LandTrendr changeDirection to both Verdet and Landtrendr before applying convertToLossGain()
function convertToLossGain(ltStack, format, lossMagThresh, lossSlopeThresh, gainMagThresh, gainSlopeThresh, 
                            slowLossDurationThresh, chooseWhichLoss, chooseWhichGain, howManyToPull){
  // if(lossMagThresh === undefined || lossMagThresh === null){lossMagThresh =-0.15}
  // if(lossSlopeThresh === undefined || lossSlopeThresh === null){lossSlopeThresh =-0.1}
  // if(gainMagThresh === undefined || gainMagThresh === null){gainMagThresh =0.1}
  // if(gainSlopeThresh === undefined || gainSlopeThresh === null){gainSlopeThresh =0.1}
  // if(slowLossDurationThresh === undefined || slowLossDurationThresh === null){slowLossDurationThresh =3}
  // if(chooseWhichLoss === undefined || chooseWhichLoss === null){chooseWhichLoss ='largest'}
  // if(chooseWhichGain === undefined || chooseWhichGain === null){chooseWhichGain ='largest'}
  // if(howManyToPull === undefined || howManyToPull === null){howManyToPull =2}
  // if(format === undefined || format === null){format = 'raw'}
  
  if (format == 'rawLandTrendr'){
    print('Converting LandTrendr from raw output to Gain & Loss')
    //Pop off vertices
    var vertices = ltStack.arraySlice(0,3,4);
    
    //Mask out any non-vertex values
    ltStack = ltStack.arrayMask(vertices);
    ltStack = ltStack.arraySlice(0,0,3);
    
    //Get the pair-wise difference and slopes of the years
    var left = ltStack.arraySlice(1,0,-1);
    var right = ltStack.arraySlice(1,1,null);
    var diff  = left.subtract(right);
    var slopes = diff.arraySlice(0,2,3).divide(diff.arraySlice(0,0,1)).multiply(-1);  
    var duration = diff.arraySlice(0,0,1).multiply(-1);
    var fittedMag = diff.arraySlice(0,2,3);
    //Set up array for sorting
    var forSorting = right.arraySlice(0,0,1).arrayCat(duration,0).arrayCat(fittedMag,0).arrayCat(slopes,0);
    
  }else if(format == 'vertStack'){
    print('Converting LandTrendr OR Verdet from vertStack format to Gain & Loss');
    
    var baseMask = ltStack.select([0]).mask(); //Will fail on completely masked pixels. Have to work around and then remask later.
    var ltStack = ltStack.unmask(255); // Set masked pixels to 255
    
    var yrs = ltStack.select('yrs.*').toArray();
    var yrMask = yrs.eq(-32768).or(yrs.eq(32767)).or(yrs.eq(0)).not();
    yrs = yrs.arrayMask(yrMask);
    var fit = ltStack.select('fit.*').toArray().arrayMask(yrMask);
    var both = yrs.arrayCat(fit,1).matrixTranspose();

    var left = both.arraySlice(1,0,-1);
    var right = both.arraySlice(1,1,null);
    var diff = left.subtract(right);
    var fittedMag = diff.arraySlice(0,1,2);
    var duration = diff.arraySlice(0,0,1).multiply(-1);
    var slopes = fittedMag.divide(duration);
    var forSorting = right.arraySlice(0,0,1).arrayCat(duration,0).arrayCat(fittedMag,0).arrayCat(slopes,0);
    forSorting = forSorting.updateMask(baseMask);

  }
  
  //Apply thresholds
  var magLossMask =  forSorting.arraySlice(0,2,3).lte(lossMagThresh);
  var slopeLossMask = forSorting.arraySlice(0,3,4).lte(lossSlopeThresh);
  var lossMask = magLossMask.or(slopeLossMask);  
  var magGainMask =  forSorting.arraySlice(0,2,3).gte(gainMagThresh);
  var slopeGainMask = forSorting.arraySlice(0,3,4).gte(gainSlopeThresh);
  var gainMask = magGainMask.or(slopeGainMask);
  
  //Mask any segments that do not meet thresholds
  var forLossSorting = forSorting.arrayMask(lossMask);
  var forGainSorting = forSorting.arrayMask(gainMask);
  
  //Dictionaries for choosing the column and direction to multiply the column for sorting
  //Loss and gain are handled differently for sorting magnitude and slope (largest/smallest and steepest/mostgradual)
  var lossColumnDict = {'newest':[0,-1],
                    'oldest':[0,1],
                    'largest':[2,1],
                    'smallest':[2,-1],
                    'steepest':[3,1],
                    'mostGradual':[3,-1],
                    'shortest':[1,1],
                    'longest':[1,-1]
                  };

  var gainColumnDict = {'newest':[0,-1],
                    'oldest':[0,1],
                    'largest':[2,-1],
                    'smallest':[2,1],
                    'steepest':[3,-1],
                    'mostGradual':[3,1],
                    'shortest':[1,1],
                    'longest':[1,-1]
                  };

  //Pull the respective column and direction
  var lossSortValue = lossColumnDict[chooseWhichLoss];
  var gainSortValue = gainColumnDict[chooseWhichGain];

  //Pull the sort column and multiply it
  var lossSortBy = forLossSorting.arraySlice(0,lossSortValue[0],lossSortValue[0]+1).multiply(lossSortValue[1]);
  var gainSortBy = forGainSorting.arraySlice(0,gainSortValue[0],gainSortValue[0]+1).multiply(gainSortValue[1]);

  //Sort the loss and gain and slice off the first column
  var lossAfterForSorting = forLossSorting.arraySort(lossSortBy);
  var gainAfterForSorting = forGainSorting.arraySort(gainSortBy);

  //Convert array to image stck
  var lossStack = getLTStack(lossAfterForSorting,howManyToPull,['loss_yr_','loss_dur_','loss_mag_','loss_slope_']);
  var gainStack = getLTStack(gainAfterForSorting,howManyToPull,['gain_yr_','gain_dur_','gain_mag_','gain_slope_']);
  
  var lossGainDict = {  'lossStack': lossStack,
                        'gainStack': gainStack
  };
  
  return lossGainDict;
}
  //////////////////////////////////////////////////////////////////////////////////
//Function for running LT, thresholding the segments for both loss and gain, sort them, and convert them to an image stack
// July 2019 LSC: replaced some parts of workflow with functions in changeDetectionLib
function simpleLANDTRENDR(ts,startYear,endYear,indexName){//, run_params,lossMagThresh,lossSlopeThresh,gainMagThresh,gainSlopeThresh,slowLossDurationThresh,chooseWhichLoss,chooseWhichGain,addToMap,howManyToPull){
  
  // if(indexName === undefined || indexName === null){indexName = 'NBR'}
  // if(run_params === undefined || run_params === null){
    var run_params = {'maxSegments':maxSegments,
      'spikeThreshold':         0.9,
      'vertexCountOvershoot':   3,
      'preventOneYearRecovery': true,
      'recoveryThreshold':      0.25,
      'pvalThreshold':          0.05,
      'bestModelProportion':    0.75,
      'minObservationsNeeded':  6
    };
    var addToMap =true;
    // var howManyToPull =3;
    var slowLossDurationThresh =3;
  // }
  // if(lossMagThresh === undefined || lossMagThresh === null){lossMagThresh =lossMagThresh}
  // if(lossSlopeThresh === undefined || lossSlopeThresh === null){lossSlopeThresh =lossSlopeThresh}
  // if(gainMagThresh === undefined || gainMagThresh === null){gainMagThresh =gainMagThresh}
  // if(gainSlopeThresh === undefined || gainSlopeThresh === null){gainSlopeThresh =gainSlopeThresh}
  // if(slowLossDurationThresh === undefined || slowLossDurationThresh === null){slowLossDurationThresh =3}
  // if(chooseWhichLoss === undefined || chooseWhichLoss === null){chooseWhichLoss =LTSortBy}
  // if(chooseWhichGain === undefined || chooseWhichGain === null){chooseWhichGain =LTSortBy}
  // if(addToMap === undefined || addToMap === null){addToMap =true}
  // if(howManyToPull === undefined || howManyToPull === null){howManyToPull =2}
  
  var prepDict = prepTimeSeriesForLandTrendr(ts, indexName, run_params);
 
  run_params = prepDict.run_params; // added composite time series prepped above
  var countMask = prepDict.runMask; // count mask for pixels without enough data
  var distDir = changeDirDict[indexName];

  //Run LANDTRENDR
  var rawLt = ee.Algorithms.TemporalSegmentation.LandTrendr(run_params);
  
  var lt = rawLt.select([0]);
  //Remask areas with insufficient data that were given dummy values
  lt = lt.updateMask(countMask);
  
  //Get joined raw and fitted LANDTRENDR for viz
  var joinedTS = getRawAndFittedLT(ts, lt, startYear, endYear, indexName, distDir);
  var chartCollectionT= joinedTS.select(['.*'+indexName]);
  // Convert LandTrendr to Loss & Gain space
  
  var lossGainDict = convertToLossGain(lt, 'rawLandTrendr', lossMagThresh, lossSlopeThresh, gainMagThresh, gainSlopeThresh, 
                                        slowLossDurationThresh, LTSortBy, LTSortBy, howManyToPull);

  var lossStack = lossGainDict.lossStack;
  var gainStack = lossGainDict.gainStack;

  //Convert to byte/int16 to save space
  var lossThematic = lossStack.select(['.*_yr_.*']).int16().addBands(lossStack.select(['.*_dur_.*']).byte());
  var lossContinuous = lossStack.select(['.*_mag_.*','.*_slope_.*']).multiply(10000).int16();
  lossStack = lossThematic.addBands(lossContinuous);
  
  var gainThematic = gainStack.select(['.*_yr_.*']).int16().addBands(gainStack.select(['.*_dur_.*']).byte());
  var gainContinuous = gainStack.select(['.*_mag_.*','.*_slope_.*']).multiply(10000).int16();
  gainStack = gainThematic.addBands(gainContinuous);
  
  if(addToMap){
    var lossYearPalette = 'ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02';
    var gainYearPalette = 'c5ee93,00a398';//'AFDEA8,80C476,308023,145B09';

    var lossMagPalette = 'D00,F5DEB3';
    var gainMagPalette = 'F5DEB3,006400';

    var changeDurationPalette = 'BD1600,E2F400,0C2780';
    
    //Set up viz params
    var vizParamsLossYear = {'min':startYear,'max':endYear,'palette':lossYearPalette,layerType:'geeImage'};
    var vizParamsLossMag = {'min':-0.8 ,'max':lossMagThresh,'palette':lossMagPalette,layerType:'geeImage'};
    
    var vizParamsGainYear = {'min':startYear,'max':endYear,'palette':gainYearPalette,layerType:'geeImage'};
    var vizParamsGainMag = {'min':gainMagThresh,'max':0.8,'palette':gainMagPalette,layerType:'geeImage'};
    
    var vizParamsDuration = {'min':1,'max':5,'palette':changeDurationPalette,layerType:'geeImage',legendLabelLeftAfter:'year',legendLabelRightAfter:'years'};
  
    // Map.addLayer(lt,{},'Raw LT',false);
    // Map.addLayer(joinedTS,{},'Time Series',false);
    var nameDict = {1:'first',2:'second',3:'third',4:'fourth',5:'fifth'}
    ee.List.sequence(1,howManyToPull).getInfo().map(function(i){
     
      var lossStackI = lossStack.select(['.*_'+i.toString()]);
      var gainStackI = gainStack.select(['.*_'+i.toString()]);
      
      var shouldExport = true;var shouldShowLossYear = false;
      if(i >1){shouldExport = false}
        else{shouldShowLossYear = true}
      

      var iName = nameDict[i]
      Map2.addExport(lossStackI.int16(),indexName +'_LANDTRENDR_Loss_Stack_'+iName+'_'+LTSortBy+'_change' ,30,shouldExport,{});
      Map2.addExport(gainStackI.int16(),indexName +'_LANDTRENDR_Gain_Stack_'+iName+'_'+LTSortBy+'_change' ,30,shouldExport,{});

      Map2.addLayer(lossStackI.select(['loss_yr.*']),vizParamsLossYear,indexName +' '+iName+ ' '+LTSortBy+' Loss Year',shouldShowLossYear);
      Map2.addLayer(lossStackI.select(['loss_mag.*']).divide(10000),vizParamsLossMag,indexName +' '+iName+ ' '+LTSortBy+' Loss Magnitude',false);
      Map2.addLayer(lossStackI.select(['loss_dur.*']),vizParamsDuration,indexName +' '+iName+ ' '+LTSortBy+' Loss Duration',false);
      
      Map2.addLayer(gainStackI.select(['gain_yr.*']),vizParamsGainYear,indexName +' '+iName+ ' '+LTSortBy+' Gain Year',false);
      Map2.addLayer(gainStackI.select(['gain_mag.*']).divide(10000),vizParamsGainMag,indexName +' '+iName+ ' '+LTSortBy+' Gain Magnitude',false);
      Map2.addLayer(gainStackI.select(['gain_dur.*']),vizParamsDuration,indexName +' '+iName+ ' '+LTSortBy+' Gain Duration',false);
    });
  }
  var outStack = lossStack.addBands(gainStack);
  
  //Add indexName to bandnames
  var bns = outStack.bandNames();
  var outBns = bns.map(function(bn){return ee.String(indexName).cat('_LT_').cat(bn)});
  outStack = outStack.select(bns,outBns);
  
  return [rawLt,outStack,chartCollectionT];
}



//////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////
  var hansen = ee.Image('UMD/hansen/global_forest_change_2021_v1_9').select(['lossyear']).selfMask().add(2000);
  Map2.addLayer(hansen,{min:startYear,max:endYear,palette:'ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02'},'Hansen Loss Year',false);

  
  //Bring in CONUS ccdc
  // var ccdc = ee.ImageCollection('projects/CCDC/USA')
            // .filterBounds(geometry)
            // .mosaic();
  // console.log(ccdc.getInfo());
  // Map.addLayer(ccdc.select('.*tStart').divide(365.25))
  // Map.addLayer(ccdc.select('.*tEnd').divide(365.25))
  // ee.List.sequence(1,3).getInfo().map(function(i){
  //   i = i.toString();
  //   ['tStart','tEnd'].map(function(ending){
  //     var v = ccdc.select(['S'+i+'_.*'+ending]).divide(365.25);
  //     var vMin = ccdc.select(['.*'+ending]).reduce(ee.Reducer.min()).divide(365.25);
  //     var vMax = ccdc.select(['.*'+ending]).reduce(ee.Reducer.max()).divide(365.25);
      
  //     v = v.updateMask(v.gt(vMin).and(v.lt(vMax)).and(forestMask))
  //     Map2.addLayer(v,{min:1985,max:2018,palette:'ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02'},ending + ' '+i,false);
  //   })
  // })
  ////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  var aoi = eeBoundsPoly;
  var descriptiveBandNames = ['blue','green','red','nir','swir1','temp', 'swir2','QA_PIXEL'];
  var landsat_C2_L2_rescale_dict = {
  'C1':{'refl_mult':0.0001,'refl_add':0,'temp_mult':0.1,'temp_add':0},
  'C2':{'refl_mult':0.0000275,'refl_add':-0.2,'temp_mult':0.00341802,'temp_add':149.0},
  };
  //////////////////////////////////////////////////////////////////
  // Method for rescaling reflectance and surface temperature data to 0-1 and Kelvin respectively
  // This was adapted from the method provided by Google for rescaling Collection 2:
  // https://code.earthengine.google.com/?scriptPath=Examples%3ADatasets%2FLANDSAT_LC08_C02_T1_L2
  function applyScaleFactors(image,landsatCollectionVersion){
    var factor_dict = landsat_C2_L2_rescale_dict[landsatCollectionVersion];
    var opticalBands = image.select('blue','green','red','nir','swir1','swir2').multiply(factor_dict['refl_mult']).add(factor_dict['refl_add']).float();
    var thermalBands = image.select('temp').multiply(factor_dict['temp_mult']).add(factor_dict['temp_add']).float();
    return image.addBands(opticalBands, null, true)
                .addBands(thermalBands, null, true);
  }
   var l5 = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
                .filterBounds(aoi)
                .filter(ee.Filter.calendarRange(startYear-yearBuffer,endYear+yearBuffer,'year'))
                .filter(ee.Filter.calendarRange(startJulian,endJulian))
                .filter(ee.Filter.lte('WRS_ROW',120))
                .select(['SR_B1','SR_B2','SR_B3','SR_B4','SR_B5','ST_B6','SR_B7','QA_PIXEL'],descriptiveBandNames);
   var l7SLCOn = ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')
                .filterBounds(aoi)
                .filterDate(ee.Date.fromYMD(1998,1,1),ee.Date.fromYMD(2003,5,31).advance(1,'day'))
                .filter(ee.Filter.calendarRange(startYear-yearBuffer,endYear+yearBuffer,'year'))
                .filter(ee.Filter.calendarRange(startJulian,endJulian))
                .filter(ee.Filter.lte('WRS_ROW',120))
                .select(['SR_B1','SR_B2','SR_B3','SR_B4','SR_B5','ST_B6','SR_B7','QA_PIXEL'],descriptiveBandNames);
    var l7SLCOff = ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')
                .filterBounds(aoi)
                .filterDate(ee.Date.fromYMD(2003,6,1),ee.Date.fromYMD(3000,1,1))
                .filter(ee.Filter.calendarRange(startYear-yearBuffer,endYear+yearBuffer,'year'))
                .filter(ee.Filter.calendarRange(startJulian,endJulian))
                .filter(ee.Filter.lte('WRS_ROW',120))
                .select(['SR_B1','SR_B2','SR_B3','SR_B4','SR_B5','ST_B6','SR_B7','QA_PIXEL'],descriptiveBandNames);
    var l8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
                .filterBounds(aoi)
                .filter(ee.Filter.calendarRange(startYear-yearBuffer,endYear+yearBuffer,'year'))
                .filter(ee.Filter.calendarRange(startJulian,endJulian))
                .filter(ee.Filter.lte('WRS_ROW',120))
                .select(['SR_B2','SR_B3','SR_B4','SR_B5','SR_B6','ST_B10','SR_B7','QA_PIXEL'],descriptiveBandNames);
    var l9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
                .filterBounds(aoi)
                .filter(ee.Filter.calendarRange(startYear-yearBuffer,endYear+yearBuffer,'year'))
                .filter(ee.Filter.calendarRange(startJulian,endJulian))
                .filter(ee.Filter.lte('WRS_ROW',120))
                .select(['SR_B2','SR_B3','SR_B4','SR_B5','SR_B6','ST_B10','SR_B7','QA_PIXEL'],descriptiveBandNames);
    var platformObj = {'L5':l5,'L7-SLC-On':l7SLCOn,'L7-SLC-Off':l7SLCOff,'L8':l8,'L9':l9}
    var imgs;

    Object.keys(urlParams.whichPlatforms).map(function(k){
      // console.log(k);console.log(whichPlatforms[k]);console.log(platformObj[k].getInfo())
      if(urlParams.whichPlatforms[k] || urlParams.whichPlatforms[k] === 'true'){
        if(imgs === undefined){imgs = platformObj[k];
        }else{imgs = imgs.merge(platformObj[k])
        }
      }
    })
    

    imgs = imgs.map(function(img){return applyScaleFactors(img,'C2')
    });
    
    Object.keys(whichCloudMasks).map(function(k){
      if(whichCloudMasks[k]){
        if(k  === 'cloudScore'){
          console.log('applying cloudScore');
          imgs = imgs.map(applyLandsatCloudScore);
        }
        else if(k  === 'fMask-Cloud'){
          console.log('applying Fmask cloud');
          imgs = imgs.map(function(img){return applyBitMask(img,3)});
        }
        else if(k  === 'fMask-Cloud-Shadow'){
          console.log('applying Fmask cloud shadow');
          imgs = imgs.map(function(img){return applyBitMask(img,4)});
        }
        else if(k  === 'fMask-Snow'){
          console.log('applying Fmask snow');
         
          imgs = imgs.map(function(img){return applyBitMask(img,5)});
        }
        else if(k  === 'TDOM'){
          console.log('applying TDOM');
          imgs = simpleTDOM2(imgs);
        }
        
      }
    })
    

    
    imgs = imgs.map(simpleAddIndices).map(simpleGetTasseledCap).map(simpleAddTCAngles)
    
    var dummyImage = ee.Image(imgs.first());
  //Build an image collection that includes only one image per year, subset to a single band or index (you can include other bands - the first will be segmented, the others will be fit to the vertices). Note that we are using a mock function to reduce annual image collections to a single image - this can be accomplished many ways using various best-pixel-compositing methods.
  var years = [];
  for(var year = startYear; year <= endYear; year++) {
      var imgsT = imgs.filter(ee.Filter.calendarRange(year-yearBuffer,year+yearBuffer,'year'));
      imgsT = fillEmptyCollections(imgsT,dummyImage);
      var count = imgsT.select([0]).count();
      var img;
      if(urlParams.compMethod === 'Median'){
        img = imgsT.median();
      }else{
        img = medoidMosaicMSD(imgsT,['nir','swir1','swir2']);
      };
      
      img = img.updateMask(count.gte(minObs)).set('system:time_start',ee.Date.fromYMD(year,6,1).millis());
      var nameEnd = (year-yearBuffer).toString() + '-'+ (year+yearBuffer).toString();
    // print(year);
    // if(year%5 ==0 || year === startYear || year === endYear){
    //   Map2.addLayer(img,{min:0.1,max:[0.4,0.6,0.4],bands:'swir2,nir,red'},'Composite '+nameEnd,false);
    // }
    Map2.addExport(img.select(['blue','green','red','nir','swir1','swir2']).multiply(10000).int16(),'Landsat_Composite_'+ nameEnd,30,false,{});
    var tempCollection = ee.ImageCollection([img]);         

    if(year == startYear) {
      var srCollection = tempCollection;
    } else {
      srCollection = srCollection.merge(tempCollection);
    }
    years.push(year)
  };
  // console.log(srCollection.getInfo());
  // Map2.addLayer(srCollection.select(['NDVI','NBR']),{min:0.2,max:0.6,opacity:0},'Landsat Time Series',false);
  if(urlParams.maskWater === 'Yes'){
    var jrcWater = ee.Image("JRC/GSW1_1/GlobalSurfaceWater").select([4]).gt(50);

    jrcWater = jrcWater.updateMask(jrcWater.neq(0)).reproject('EPSG:4326',null,30);

    Map2.addLayer(jrcWater,{min:0,max:1,'palette':'000,00F',addToClassLegend:true,classLegendDict:{'Water 50% time or more 1984-2018':'00F'},queryDict: {1:'Water 50% time or more 1984-2018'},layerType:'geeImage'},'JRC Water',false);
    srCollection = srCollection.map(function(img){return img.updateMask(jrcWater.mask().not())})
  }
  srCollection = srCollection.map(addYearBand);
  
  // print(ee.Image(srCollection.first()).bandNames().getInfo())
  var indexList = [];
  Object.keys(whichIndices).map(function(index){if(whichIndices[index]){indexList.push(index)}})

  var chartCollectionT;
  indexList.map(function(indexName){
    var LTStack = simpleLANDTRENDR(srCollection,startYear,endYear,indexName);
    if(chartCollectionT === undefined){
      chartCollectionT = LTStack[2];
    }else{chartCollectionT = joinCollections(chartCollectionT,LTStack[2],false)}
  });
  // Map2.addTimeLapse(srCollection,{min:0.05,max:0.5,bands:'swir1,nir,red'},'Composite Time Lapse');
  // chartCollection = chartCollectionT;
  pixelChartCollections['landsat'] = {'label':'landsat','collection':chartCollectionT};
  populatePixelChartDropdown();
  // var distDir = -1;
  // 
  // var ts = srCollection.select([indexName]);
  // ts = ts.map(function(img){return multBands(img,-1,1)});
  // run_params.timeSeries = ts; 
  // var lt = ee.Algorithms.TemporalSegmentation.LandTrendr(run_params);

  // //Convert to collection
  // var rawLT = lt.select([0]);
  // var ltYear = rawLT.arraySlice(0,0,1).arrayProject([1]);
  // var ltFitted = rawLT.arraySlice(0,2,3).arrayProject([1]);
  // if(distDir === -1){
  //   ltFitted = ltFitted.multiply(-1);
  // }
  // fittedCollection = arrayToTimeSeries(ltFitted,ltYear,ee.List.sequence(startYear,endYear),'LT_Fitted_'+indexName);

  // var lossGainDict = convertToLossGain(lt, 'rawLandTrendr');
  // var lossStack = lossGainDict.lossStack;
  // var gainStack = lossGainDict.gainStack;

  // print(lossStack.getInfo());
  // chartCollection = joinCollections(srCollection.select([indexName]),fittedCollection,false);
  // console.log(fittedCollection.getInfo());
  // print(srCollection.getInfo());
// Append the image collection to the LandTrendr run parameter dictionary
// run_params.timeSeries = srCollection;
// Run the LandTrendr algorithm
// var LTresult = ee.Algorithms.TemporalSegmentation.LandTrendr(run_params);
// Map2.addTimeLapse(srCollection,{min:0.1,max:[0.4,0.6,0.4],bands:'swir2,nir,red',years:years},'Composite Time Lapse')
  
}
var mtbsC;
function runMTBS(){
  startYear = parseInt(urlParams.startYear);
  endYear = parseInt(urlParams.endYear);
  chartMTBS = true;
  chartMTBSByNLCD = true;
  chartMTBSByAspect = true;
  getLCMSVariables();

  ga('send', 'event', 'mtbs-viewer-run', 'year_range', `${startYear}_${endYear}`);

  var mtbsAndNLCD = getMTBSAndNLCD('anc','layer-list',true);
  
  var nlcdLCObj = mtbsAndNLCD.NLCD;
  mtbsC = mtbsAndNLCD.MTBS.collection; 
  getNAIP();
  var yearsCli = ee.List.sequence(startYear,endYear).getInfo();
  // ee.List.sequence(0,1000,1000).getInfo().map(function(start){
  //   var stop = start + 999;
  //   var nameEnd = start.toString()+'_'+stop.toString();
  //   fetch('./geojson/mtbs_perims_'+nameEnd+'.json')
  //   .then((resp) => resp.json()) // Transform the data into json
  //     .then(function(json) {
        
  //       // console.log(json)      
  //   Map2.addLayer(json,{layerType:'geoJSONVector',strokeColor:'#F00',clickQuery:true},'MTBS Perims '+nameEnd,true)
  //     // Create and append the li's to the ul
  //   })
  // })
  var perims = ee.FeatureCollection("USFS/GTAC/MTBS/burned_area_boundaries/v1");//ee.FeatureCollection('projects/USFS/DAS/MTBS/mtbs_perims_DD');
  var inFields  = ['Incid_Name','Incid_Type','Event_ID','irwinID','Ignition Date','BurnBndAc','Asmnt_Type'];
  var outFields = ['Incident Name','Incident Type','MTBS Event ID','IRWIN ID','Ignition Date','Acres','Assessment Type'];
  perims = perims.map(function(f){
    var d = ee.Date(f.get('Ig_Date'));
    var formatted = d.format('YYYY-MM-dd');
    return f.set({'Year':d.get('year'),'Ignition Date':formatted});
  })

  perims = perims.filter(ee.Filter.gte('Year',startYear));
  perims = perims.filter(ee.Filter.lte('Year',endYear));
  
  perims = perims.select(inFields,outFields);
  // perims = perims.map(function(f){
  //   f = ee.Feature(f);
  //   var d = ee.Number(f.get('StartDay')).format('%02d');
  //   var m = ee.Number(f.get('StartMonth')).format('%02d');
  //   var y = ee.Number(f.get('Year')).format();
  //   var out = y.cat('-').cat(m).cat('-').cat(d);
  //   return f.select(['Fire_Name','Fire_ID','Fire_Type','Acres'],['1_Fire_Name','2_Fire_ID','3_Fire_Type','4_Acres']).set('5_Start_Date',out);
  // });
  // perims = ee.FeatureCollection(perims);
  perims = perims.set('bounds',clientBoundsDict.All);
  // console.log(perims.get('bounds').getInfo())
  
  // var perimYear = perims.reduceToImage(['Year'], ee.Reducer.first())
  // var perims = ee.Image().paint(perims,null,2);
  // Map2.addLayer(perimYear,{min:1984,max:2018,palette:'FF0,F00'},'perims year')
  Map2.addLayer(perims,{strokeColor:'00F',layerType:'geeVectorImage'},'MTBS Burn Perimeters',true,null,null,'Delineated perimeters of each MTBS mapped fire from '+startYear.toString()+'-'+endYear.toString()+'. Areas can have multiple mapped fires.')
  
  // var years = ee.List.sequence(startYear,mtbs)
  

  var chartTableDict = ee.Dictionary(nlcdLCObj.collection.get('chartTableDict')).combine(mtbsC.get('chartTableDict')).getInfo();
  
  var nlcdLCFilled =  batchFillCollection(nlcdLCObj.collection,ee.List.sequence(startYear,endYear).getInfo()).map(setSameDate);
  var forCharting = joinCollections(mtbsC,nlcdLCFilled, false);
  var timeLapseSeverityViz = JSON.parse(JSON.stringify(mtbsAndNLCD.MTBSSeverityViz));
  timeLapseSeverityViz.years = yearsCli;
  Map2.addTimeLapse(mtbsC,timeLapseSeverityViz,'MTBS Burn Severity Time Lapse',false);
  // forCharting = forCharting.set('chartTableDict',chartTableDict);
  // forCharting = forCharting.set('legends',chartTableDict) 
  // nlcdLC = batchFillCollection(nlcdLCObj.collection,years).map(setSameDate);
  // chartCollection =forCharting;
  pixelChartCollections['mtbs'] = {'label':'MTBS Time Series',
                                    'collection':forCharting,
                                    'chartTableDict':chartTableDict,
                                    'legends':chartTableDict}
  populateAreaChartDropdown();
  populatePixelChartDropdown();

  getSelectLayers();
  // toggleCumulativeMode();
  // Map2.addSelectLayer(resolveEcoRegions,{strokeColor:'0F0',layerType:'geeVectorImage'},'Select Which EcoRegion',false,null,null,'Ecoregion selection');
  // Map2.addSelectLayer(huc4,{strokeColor:'00F',layerType:'geeVectorImage'},'Select Which HUC 4',false,null,null,'HUC 4 selection');
  // $('#select-area-interactive-chart-label').click();
  // $('#tools-collapse-label-label').click();
}


function runTest(){
//   var tcc = ee.ImageCollection("projects/LCMS/TCC/Grids")

// tcc = ee.List.sequence(1984,2018).map(function(yr){
//   var t = tcc.filter(ee.Filter.eq('year',yr)).mosaic();
// //   // Map.addLayer(t,{min:20,max:80,palette:'000,0F0'},yr.toString(),false)
//   return t.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis()).byte()
// })
// tcc = ee.ImageCollection(tcc).select([0],['Tree Canopy Cover']);
// var longStudyAreaName = 'Science Team CONUS'
// var whichIndex = 'NBR'
// var lcms  = ee.ImageCollection(studyAreaDict[longStudyAreaName].lcmsCollection).map(function(img){return img.translate(15,-15)});
  
  
  
// // //   /////////////////////////////////////////
//   lcms = ee.List.sequence(startYear,endYear).map(function(yr){

//     var lcmsT = lcms.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
//     lcmsT = lcmsT.unmask(0);
//     // lcmsT = ee.IDSmage(multBands(lcmsT,1,[0.01])).float()
//     return lcmsT.rename(['Loss Probability']).byte();
//   });
//   lcms = ee.ImageCollection.fromImages(lcms);

// var joined = joinCollections(tcc,lcms,false);

// var ltCONUS = ee.ImageCollection(studyAreaDict[longStudyAreaName].ltCollection)
//                 .filter(ee.Filter.eq('timeSeries',whichIndex)).mosaic();
  
//     var yrNames = ee.List.sequence(1,11).map(function(i){return ee.String('yrs_').cat(ee.Number(i).byte().format())});
//     var fitNames = ee.List.sequence(1,11).map(function(i){return ee.String('fit_').cat(ee.Number(i).byte().format())});

//     var ltCONUSYr = ltCONUS.select(['doy.*'],yrNames);
//     var ltCONUSFit = ltCONUS.select(['ftv.*'],fitNames);

//     ltCONUS = ltCONUSYr.addBands(ltCONUSFit);
//     var ltCONUSCT =fitStackToCollection(ltCONUS, 10, startYear, endYear).select(['fitted'],[whichIndex + '_LT_Fitted']).map(function(img){return multBands(img,-1,0.1)});
    

//     joined = joinCollections(joined,ltCONUSCT,false);

//     var composites = ee.ImageCollection(studyAreaDict[longStudyAreaName].compositeCollection)
//       .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
//       .select([0,1,2,3,4,5],['blue','green','red','nir','swir1','swir2'])
//       .filter(ee.Filter.stringContains('system:index','ONUS_Medoid_Jun-Sept').not());
//     // Map2.addTimeLapse(rnrThresh.limit(8).select([0]),{min:lowerThresholdRecovery,max:100,palette:'080,0F0'},'Gain')
//   var raw = composites.map(simpleAddIndices).select([whichIndex],[whichIndex + '_Composite']).map(function(img){
//     img = multBands(img,1,100)
//     return setSameDate(img)});

//   joined = joinCollections(joined,raw,false);
// var lossYear = lcms.map(function(img){
//     var yr = ee.Number(ee.Date(img.get('system:time_start')).get('year'));
//     return ee.Image(yr).updateMask(img.gte(30)).int16();
//   }).max()

// var lossYearPalette = 'ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02';
// // Map2.addLayer(lossYear,{min:startYear,max:endYear,palette:lossYearPalette},'Loss Year')
// // pixelChartCollections['test'] = {'label':'Test','collection':joined,'colors':['0F0','FF0']}
// var ccdcImg = ee.Image('users/iwhousman/test/ChangeCollection/CCDC-Test3');
// Map2.addLayer(ccdcImg);
// var t  = ee.Image(ee.Array([[1,2,3],[4,5,6]]));
// console.log(t.getInfo());
// Map2.addLayer(t);
// Map2.addLayer(lossYear)
// console.log(lossYear.arrayDimensions())
// console.log(lossYear.getInfo().bands[0].dimensions)
// populatePixelChartDropdown();
// Map2.addTimeLapse(tcc,{min:0,max:100,palette:palettes.crameri.bamako[50].reverse()},'TCC Time Lapse')
//   // Map2.addLayer(ee.Image(1).clip(eeBoundsPoly),{},'Test Image',false);
//   // var values = [1,2,3,4,3,2];
//   // var c = ee.ImageCollection(values.map(function(i){return ee.Image(i).byte()}))
  
//   // Map2.addLayer(c,{},'Test Collection wo time',false);
//   // var c = ee.ImageCollection(values.map(function(i){return ee.Image([i,i+1,i+2]).byte().set('system:time_start',ee.Date.fromYMD(2000,i,1).millis())}));
  
//   // // Map2.addLayer(c,{},'Test Collection w time',false);
//   // var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
//   //         // .filter(ee.Filter.calendarRange(190,250))
//   //         .filterBounds(eeBoundsPoly).select([1,2,3,4,5,7,6,'pixel_qa'],['blue','green','red','nir','swir1','temp','swir2','pixel_qa']);
//   // l8 = l8.map(cFmaskCloud).map(cFmaskCloudShadow)
//   // Map2.addLayer(l8.select(['blue','green','red','nir','swir1','swir2']),{min:500,max:3500,bands:'swir2,nir,red'},'l8');
//   // Map2.addLayer(l8.select(['blue','green','red','nir','swir1','swir2']).sort('system:time_start',false).mosaic(),{min:500,max:3500,bands:'swir2,nir,red'},'l82');
  
//   // var composites = ee.ImageCollection('projects/USFS/LCMS-NFS/R1/FNF/Composites/Composite-Collection-fmask-allL7')
//   // Map2.addLayer(composites,{min:500,max:3500,bands:'swir2,nir,red'},'composites',false);
//   // // Map2.addLayer(composites.mosaic(),{min:500,max:3500,bands:'swir2,nir,red'},'composites2',false);
//   // // var perims = ee.FeatureCollection('projects/USFS/DAS/MTBS/mtbs_perims_DD');
//   // // Map2.addLayer(perims,{strokeColor:'00F',layerType:'geeVectorImage'},'MTBS Burn Perimeters',false,null,null,'Delineated perimeters of each MTBS mapped fire from '+startYear.toString()+'-'+endYear.toString()+'. Areas can have multiple mapped fires.')
//   // // Map2.addSerializedLayer('{"type":"Invocation","arguments":{"value":1},"functionName":"Image.constant"}',{},'testSerial');
//   var r4Runs = {
//     // 'PR':{'collection':'projects/USFS/LCMS-NFS/R4/Landcover-Landuse-Change/R4_all_pr_annualized',
//     // 'thresholds' : {'loss': 0.35, 'slowLoss': 0.35, 'fastLoss': 0.6, 'gain': 0.35} },
//     // 'Equal':{'collection':'projects/USFS/LCMS-NFS/R4/Landcover-Landuse-Change/R4_all_equal_annualized',
//     // 'thresholds':{'loss': 0.35, 'slowLoss': 0.3, 'fastLoss': 0.5, 'gain': 0.45}},
    
//     'EPWT':{'collection':'projects/USFS/LCMS-NFS/R4/Landcover-Landuse-Change/R4_all_epwt_annualized',
//     'thresholds':{'loss': 0.35, 'slowLoss': 0.3, 'fastLoss': 0.45, 'gain': 0.4}},
//     // 'EPM':{'collection':'projects/USFS/LCMS-NFS/R4/Landcover-Landuse-Change/R4_all_epm_annualized',
//     // 'thresholds':{'loss': 0.35, 'slowLoss': 0.3, 'fastLoss': 0.4, 'gain': 0.35}}
//   };
  var runs = {
    // 'PR':{'collection':'projects/USFS/LCMS-NFS/R4/Landcover-Landuse-Change/R4_all_pr_annualized',
    // 'thresholds' : {'loss': 0.35, 'slowLoss': 0.35, 'fastLoss': 0.6, 'gain': 0.35} },
    // 'Equal':{'collection':'projects/USFS/LCMS-NFS/R4/Landcover-Landuse-Change/R4_all_equal_annualized',
    // 'thresholds':{'loss': 0.35, 'slowLoss': 0.3, 'fastLoss': 0.5, 'gain': 0.45}},
    
    'SEAK_Vert':
    {'collection':'projects/lcms-292214/assets/R10/CoastalAK/Landcover-Landuse-Change/LC-LU-DND-RNR-DNDSlow-DNDFast-VertexFormat',
    'thresholds':{'loss': 0.38333333333333336, 'slowLoss': 0.68, 'fastLoss': 0.31, 'gain': 0.35},
    'treeMask':ee.Image('projects/lcms-292214/assets/R10/CoastalAK/Landcover-Landuse-Change/Landcover_Probability_Treemask_Stack').reduce(ee.Reducer.max()).selfMask()
  },
    'SEAK_Ann':
    {'collection':'projects/lcms-292214/assets/R10/CoastalAK/Landcover-Landuse-Change/LC-LU-DND-RNR-DNDSlow-DNDFast-AnnualizedFormat',
    'thresholds':{'loss': 0.24, 'slowLoss': 0.15, 'fastLoss': 0.22, 'gain': 0.25},
    'treeMask':ee.Image('projects/lcms-292214/assets/R10/CoastalAK/Landcover-Landuse-Change/Landcover_Probability_Treemask_Stack').reduce(ee.Reducer.max()).selfMask()
  },
    // 'EPM':{'collection':'projects/USFS/LCMS-NFS/R4/Landcover-Landuse-Change/R4_all_epm_annualized',
    // 'thresholds':{'loss': 0.35, 'slowLoss': 0.3, 'fastLoss': 0.4, 'gain': 0.35}}
  };
//   var composites = ee.ImageCollection('projects/USFS/LCMS-NFS/R4/Composites/Composite-Collection-fmask-allL7');

  // var chartColorsT;
  // var areaChartColors;
//   var colorOffset = 15;
//   var colorOffsetDir = 1;
//   chartColors = chartColors.concat(chartColors.map(function(c){return LightenDarkenColor(c,-20)}))
//                 .concat(chartColors.map(function(c){return LightenDarkenColor(c,30)}))
  getLCMSVariables();

//   var areaCollection;
//   var chartCollectionT;
  var clientBoundary = clientBoundsDict.Alaska;


  Object.keys(runs).map(function(k){
//     if(chartColorsT === undefined){
//       chartColorsT = chartColorsDict.test;
//       areaChartColors = chartColorsDict.testArea;
//       }else{
//         chartColorsT = chartColorsT.concat(chartColorsDict.test.map(function(c){return LightenDarkenColor(c,colorOffset*colorOffsetDir)}));
//         areaChartColors = areaChartColors.concat(chartColorsDict.testArea.map(function(c){return LightenDarkenColor(c,colorOffset*colorOffsetDir)}));
        
//       };
//       colorOffset +=30;
//       if(colorOffsetDir === 1){colorOffsetDir = -1}
//         else{colorOffsetDir = 1}
//       // console.log(colorOffset)
//       // console.log(areaChartColors)
   

//     // $('#layer-list').prepend(`<div class = 'dropdown-divider'></div>`)
    var rawC = ee.ImageCollection(runs[k].collection);
    
    Map2.addLayer(rawC,{'opacity':0},k + ' Raw',false);

    var thresholds = runs[k].thresholds;
    var treeMask = runs[k].treeMask;
    var lowerThresholdDecline =thresholds.loss;
    var lowerThresholdSlowDecline = thresholds.slowLoss;
    var lowerThresholdFastDecline = thresholds.fastLoss;
    var lowerThresholdRecovery = thresholds.gain;
    var startYear = 1985;
    var endYear = 2020;
    var NFSLCMS = rawC
                  // .filter(ee.Filter.stringContains('system:index','DNDSlow-DNDFast'))
                  .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
                  .select(['LC','LU','DND','RNR','DND_Slow','DND_Fast'])
                  .map(function(img){return ee.Image(additionBands(img,[0,1,0,0,0,0]))})
                  .map(function(img){return ee.Image(multBands(img,1,[0.1,0.1,0.01,0.01,0.01,0.01])).float()})
                  .select([0,1,2,3,4,5],['Land Cover Class','Land Use Class','Loss Probability','Gain Probability','Slow Loss Probability','Fast Loss Probability']);
//     // var NFSLCMSold = ee.ImageCollection(collectionDict[studyAreaName][1])
//     //               .filter(ee.Filter.stringContains('system:index','DNDSlow-DNDFast').not())
//     //               .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
//     //               .map(function(img){return ee.Image(additionBands(img,[1,1,1,0,0]))})
//     //               .map(function(img){return ee.Image(multBands(img,1,[0.1,0.1,0.1,0.01,0.01])).float()})
//     //               .select([0,1,2,3,4],['Land Cover Class','Land Use Class','Change Process','Decline Probability','Recovery Probability']);
//     var rawCT = NFSLCMS.select([0,1,2,3,4,5],[k+'_LC',k+'_LU',k+'_Loss',k+'_Gain',k+'_Slow_Loss',k+'_Fast_Loss']).map(function(img){return img.unmask()})
//     if(chartCollectionT === undefined){
//       chartCollectionT = rawCT;
//     }
//     else{
//       chartCollectionT = joinCollections(chartCollectionT,rawCT,false)
//     }
//     var lcJSON = JSON.parse(NFSLCMS.get('landcoverJSON').getInfo());
//     var luJSON = JSON.parse(NFSLCMS.get('landuseJSON').getInfo());
    
//     var lcJSONFlipped = {};
//     var luJSONFlipped = {};
//     Object.keys(lcJSON).map(function(k){lcJSONFlipped[lcJSON[k]['name']] = parseInt(k)});
//     Object.keys(luJSON).map(function(k){luJSONFlipped[luJSON[k]['name']] = parseInt(k)});


     //----------Other Housekeeping & Prep for adding layers
    var declineNameEnding = '('+startYear.toString() + '-' + endYear.toString()+') (p >= '+lowerThresholdDecline.toString()+' and p <= '+upperThresholdDecline.toString()+')';
    var slowDeclineNameEnding = '('+startYear.toString() + '-' + endYear.toString()+') (p >= '+lowerThresholdSlowDecline.toString()+' and p <= '+upperThresholdDecline.toString()+')';
    var fastDeclineNameEnding = '('+startYear.toString() + '-' + endYear.toString()+') (p >= '+lowerThresholdFastDecline.toString()+' and p <= '+upperThresholdDecline.toString()+')';
    var recoveryNameEnding = '('+startYear.toString() + '-' + endYear.toString()+') (p >= '+lowerThresholdRecovery.toString()+' and p <= '+upperThresholdRecovery.toString()+')';

//     var lcLayerName =  'Land Cover (mode) '+ startYear.toString() + '-'+ endYear.toString();

//     // var luPalette = "efff6b,ff2ff8,1b9d0c,97ffff,a1a1a1,c2b34a";
//     var luLayerName =  'Land Use (mode) '+ startYear.toString() + '-'+ endYear.toString();
    
   
//     var landcoverClassLegendDict = {};var landcoverClassChartDict = {}
//     var lcPalette = Object.values(lcJSON).map(function(v){return v['color']});
//     var lcValues = Object.keys(lcJSON).map(function(i){return parseInt(i)});
   
//     Object.keys(lcJSON).map(function(k){landcoverClassLegendDict[lcJSON[k]['name']] = lcJSON[k]['color']});
//     Object.keys(lcJSON).map(function(k){landcoverClassChartDict[lcJSON[k]['name']] = k/10.});

//     var landuseClassLegendDict = {};var landuseClassChartDict = {}
//     var luPalette = Object.values(luJSON).map(function(v){return v['color']});
//     var luValues = Object.keys(luJSON).map(function(i){return parseInt(i)});
   
//     Object.keys(luJSON).map(function(k){landuseClassLegendDict[luJSON[k]['name']] = luJSON[k]['color']});
//     Object.keys(luJSON).map(function(k){landuseClassChartDict[luJSON[k]['name']] = k/10.});

// var landcoverClassQueryDict = {};
//     Object.keys(landcoverClassChartDict).map(function(k){landcoverClassQueryDict[parseInt(landcoverClassChartDict[k]*10)] =k});
//     var landuseClassQueryDict = {};
//     Object.keys(landuseClassChartDict).map(function(k){landuseClassQueryDict[parseInt(landuseClassChartDict[k]*10)] =k})
//     var landcoverClassQueryDictDecimal = {};
//     Object.keys(landcoverClassQueryDict).map(function(k){landcoverClassQueryDictDecimal[k/10]= landcoverClassQueryDict[k]});
//     var landuseClassQueryDictDecimal = {};
//     Object.keys(landuseClassQueryDict).map(function(k){landuseClassQueryDictDecimal[k/10]= landuseClassQueryDict[k]});
//     var chartTableDict = {
//     'Land Cover Class':landcoverClassQueryDictDecimal,
//     'Land Use Class':landuseClassQueryDictDecimal
    

  

//     var rawLC = rawC
//                 .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
//                 .select([0],['LC']);
//     var rawLU = rawC
//                 .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
//                 .select([1],['LU'])
//                 .map(function(img){return ee.Image(additionBands(img,[1]))});

//     var NFSLCMSForCharting = NFSLCMS;
//     var minTreeNumber = 3;
//     var applyTreeMask = 'no'
//     if(applyTreeMask === 'yes'){
//       console.log('Applying tree mask');
//       // var waterMask = rawLC.map(function(img){return img.eq(6)}).sum().gt(10);
//       // waterMask = waterMask.mask(waterMask).clip(boundary);
      
//       if((endYear-startYear) < minTreeNumber){minTreeNumber = endYear-startYear+1}
//        if (studyAreaName == 'CNFKP'){
//             var treeMask = rawLC.map(function(img){return img.eq(lcJSONFlipped.Trees).or(img.eq(lcJSONFlipped['Tall Shrub']))}).sum().gte(minTreeNumber);
//           }else{
//             var treeMask = rawLC.map(function(img){return img.eq(lcJSONFlipped.Trees)}).sum().gte(minTreeNumber);
//           }
//       //var treeMask = rawLC.map(function(img){return img.eq(lcJSONFlipped.Trees)}).sum().gte(minTreeNumber);
//       treeMask = treeMask.mask(treeMask).clip(boundary);
      
//       NFSLCMS = NFSLCMS.map(function(img){return img.updateMask(ee.Image([1,1]).addBands(treeMask).addBands(treeMask).addBands(treeMask).addBands(treeMask))});

//     }
    
//     var NFSLC =  NFSLCMS.select([0]);
//     var NFSLU =  NFSLCMS.select([1]);
//     //var NFSCP =  NFSLCMS.select([2]);

    var NFSDND = NFSLCMS.select([2]);

    // var NFSDNDold = NFSLCMSold.select([3]);

    var NFSRNR = NFSLCMS.select([3]);

    var NFSDNDSlow = NFSLCMS.select([4]);
    var NFSDNDFast = NFSLCMS.select([5]);

     
    // Apply Thresholds to change layers
    var dndThresh = thresholdChange(NFSDND,lowerThresholdDecline,upperThresholdDecline, 1);

    // var dndThreshOld = thresholdChange(NFSDNDold,lowerThresholdDecline,upperThresholdDecline, 1)

    var rnrThresh = thresholdChange(NFSRNR,lowerThresholdRecovery, upperThresholdRecovery, 1);

    
    
    var dndSlowThresh = thresholdChange(NFSDNDSlow,lowerThresholdSlowDecline,upperThresholdDecline, 1);
    var dndFastThresh = thresholdChange(NFSDNDFast,lowerThresholdFastDecline,upperThresholdDecline, 1);

//     var threshImage = ee.Image([lowerThresholdFastDecline,lowerThresholdSlowDecline,lowerThresholdRecovery]);
//     var lossGain = NFSLCMS.select([5,4,3]).map(function(img){
//       return img.updateMask(img.gte(threshImage))
//     })
//     lossGain = lossGain.map(function(img){
//       var maxProb = img.reduce(ee.Reducer.max());
//       var out = ee.Image([1,2,3]).mask(img.eq(maxProb)).reduce(ee.Reducer.min())
      
//       out = out.copyProperties(img,['system:time_start']);
//       return out
//     })

//     // Map2.addTimeLapse(composites.limit(4),{min:500,max:[3500,5500,3500],bands:'swir2,nir,red',opacity:0.5},'Composites Time Lapse',false);
//     // Map2.addTimeLapse(lossGain.limit(4),{min:1,max:3,palette:'F80,FF0,80F',addToClassLegend:true,classLegendDict:{'Fast Loss':'F80','Slow Loss':'FF0','Gain':'80F'}},'Loss/Gain Time Lapse',false); 
//     // Map2.addTimeLapse(lossGain.limit(5),{min:1,max:2,palette:'F80,80F',addToClassLegend:true,classLegendDict:{'Loss':'F80','Gain':'80F'}},'Loss/Gain Time Lapse',false); 
     
//     var yrs = [1989,1990,1991,1992,1993,1994,2000,2001,2002,2005,2019]
//     var l = yrs.map(function(yr){return dndThresh.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis())})
//     l = ee.ImageCollection(l);
//     var g = yrs.map(function(yr){return rnrThresh.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis())})
//     g = ee.ImageCollection(g);
//     // print(c.getInfo())
//     // Map2.addTimeLapse(l.select([0]),{min:lowerThresholdDecline,max:1,palette:'FF0,F00'},'Loss');
//     Map2.addLayer(l.select([0]).max(),{min:lowerThresholdDecline,max:1,palette:'FF0,F00'},'Loss');
//     // Map2.addLayer(dndThresh.select([0]).max(),{min:lowerThresholdDecline,max:1,palette:'FF0,F00'},'Loss');
//     // Map2.addTimeLapse(rnrThresh.select([0]),{min:lowerThresholdRecovery,max:1,palette:'080,0F0'},'Gain');
//     // Map2.addTimeLapse(dndThresh.limit(5).select([0]),{min:lowerThresholdDecline,max:100,palette:'FF0,F00'},'Loss');
//     // Map2.addTimeLapse(rnrThresh.limit(5).select([0]),{min:lowerThresholdRecovery,max:100,palette:'080,0F0'},'Gain')
//     var stacked = joinCollections(dndThresh.select([0]),rnrThresh.select([0]), false);
//     stacked = joinCollections(stacked,dndSlowThresh.select([0]), false);
//     stacked = joinCollections(stacked,dndFastThresh.select([0]), false);
//     stacked = stacked.map(function(img){return img.mask()}).select([0,1,2,3],[k+'_Loss',k+'_Gain',k+'_Slow_Loss',k+'_Fast_Loss'])
//     if(areaCollection === undefined){
//       areaCollection = stacked;
//     }else{areaCollection = joinCollections(areaCollection,stacked, false);}
    
    var summaryMethod = 'year';
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
//     else{
//       var dndThreshOut = dndThresh.qualityMosaic('Loss Probability');//.qualityMosaic('Decline_change');
      
//       // var dndThreshOutOld = dndThreshOld.qualityMosaic('Decline Probability');//.qualityMosaic('Decline_change');
      

//       var rnrThreshOut = rnrThresh.qualityMosaic('Gain Probability');//.qualityMosaic('Recovery_change');
      
//       var dndSlowThreshOut = dndSlowThresh.qualityMosaic('Slow Loss Probability');//.qualityMosaic('Decline_change');
//       var dndFastThreshOut = dndFastThresh.qualityMosaic('Fast Loss Probability');//.qualityMosaic('Recovery_change');
      

//       var threshYearNameEnd = 'Year of highest probability of ';
//       var threshProbNameEnd = 'Highest probability of ';
//       var exportSummaryMethodNameEnd = 'Highest Probability';
//     }

    var dndCount = dndThresh.select([0]).count();
    var rnrCount = rnrThresh.select([0]).count();

    var dndSlowCount = dndSlowThresh.select([0]).count();
    var dndFastCount = dndFastThresh.select([0]).count();
    // Map2.addLayer(NFSLC.mode().multiply(10),{queryDict:landcoverClassQueryDict,'palette':lcPalette,'min':lcValues[0],'max':lcValues[lcValues.length-1],addToClassLegend: true,classLegendDict:landcoverClassLegendDict},  k+' '+lcLayerName,false); 
    // Map2.addLayer(NFSLU.mode().multiply(10),{queryDict:landuseClassQueryDict,'palette':luPalette,'min':1,'max':6,addToClassLegend: true,classLegendDict:landuseClassLegendDict}, k+' '+luLayerName,false); 
    var treeClassLegendDict = {};
    treeClassLegendDict['Tree (3 or more consecutive years)'] = '32681e';
      Map2.addLayer(treeMask,{min:1,max:1,palette:'32681e',addToClassLegend: true,classLegendDict:treeClassLegendDict,queryDict:{1:'Tree (3 or more consecutive years)'}},k+' Tree Mask',false);
      Map2.addLayer(dndThreshOut.select([1]).updateMask(treeMask).set('bounds',clientBoundary),{'min':startYear,'max':endYear,'palette':declineYearPalette},k+' Loss Year',true,null,null,k+ ' '+threshYearNameEnd+'loss ' +declineNameEnding);


        Map2.addLayer(dndThreshOut.select([0]).updateMask(treeMask).set('bounds',clientBoundary),{'min':lowerThresholdDecline,'max':upperThresholdDecline ,'palette':declineProbPalette},k+ ' Loss Probability',false,null,null,k + ' ' +threshProbNameEnd+ 'loss ' + declineNameEnding);
        
        
      
      Map2.addLayer(dndFastThreshOut.select([1]).updateMask(treeMask).set('bounds',clientBoundary),{'min':startYear,'max':endYear,'palette':declineYearPalette },k+' Fast Loss Year',false,null,null,k+ ' '+threshYearNameEnd+'loss ' +fastDeclineNameEnding);
      // Map2.addLayer(ee.Image(1),{min:1,max:1,palette:'F00'})
  //     var years = ee.List.sequence(startYear,endYear).getInfo();
  //     var baseURL = 'https:\/\/storage.googleapis.com\/lcms-data-repository\/LCMS_R4_v2019-04_Loss_Gain_'
  //     //F80,e8edc4,54278f
  //     // Map2.addTimeLapse(baseURL,{timeLapseType :'tileMapService',years:years,addToClassLegend:true,classLegendDict:{'Fast Loss':'F80','Slow Loss':'e8edc4','Gain':'54278f'}},'Loss Gain Pre Computed Test')
  //     // getHansen('layer-list')
      Map2.addLayer(dndFastThreshOut.select([0]).updateMask(treeMask).set('bounds',clientBoundary),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},k+' Fast Loss Probability',false,null,null,k + ' ' +threshProbNameEnd+ 'loss ' + fastDeclineNameEnding);

      Map2.addLayer(dndSlowThreshOut.select([1]).updateMask(treeMask).set('bounds',clientBoundary),{'min':startYear,'max':endYear,'palette':declineYearPalette },k+' Slow Loss Year',false,null,null,k+ ' '+threshYearNameEnd+'loss ' +slowDeclineNameEnding);
      Map2.addLayer(dndSlowThreshOut.select([0]).updateMask(treeMask).set('bounds',clientBoundary),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},k+' Slow Loss Probability',false,null,null,k+ ' ' +threshProbNameEnd+ 'loss ' + slowDeclineNameEnding);

      Map2.addLayer(rnrThreshOut.select([1]).updateMask(treeMask).set('bounds',clientBoundary),{'min':startYear,'max':endYear,'palette':recoveryYearPalette},k+' Gain Year',false,null,null,k+ ' '+threshYearNameEnd+'gain '+recoveryNameEnding);
      Map2.addLayer(rnrThreshOut.select([0]).updateMask(treeMask).set('bounds',clientBoundary),{'min':lowerThresholdRecovery,'max':upperThresholdRecovery,'palette':recoveryProbPalette},k+ ' Gain Probability',false,null,null,k + ' ' +threshProbNameEnd+'gain '+recoveryNameEnding);
        
      // Map2.addLayer(ee.Image(1),{min:1,max:1,palette:'F00'})
    });
  // areaChartCollections['lg'] = {'label':'LCMS Runs',
                                    // 'collection':areaCollection,
                                    // 'stacked':false,
                                    // 'steppedLine':false,
                                    // 'colors':areaChartColors};
  // pixelChartCollections['test'] = {'label':'Test','collection':chartCollectionT,'colors':chartColorsT}
  // chartCollection =chartCollectionT;
  // chartColors = chartColorsT
  // Map2.addLayer(chartCollection,{opacity:0.5},'chartCollection',true);
  // Map2.addLayer(areaCollection,{opacity:0.5},'areaCollection',true);

   // getSelectLayers();
   // populateAreaChartDropdown();   
   // populatePixelChartDropdown();
   // Map2.addLayer(ee.Image('USGS/NLCD/NLCD2016').select([0]),{'min':1,'max':90,'palette':'000,0F0'},'NLCD Landcover 2016')    

// })
  var composites = ee.ImageCollection('projects/lcms-292214/assets/R10/CoastalAK/Composites/Composite-Collection');
  Map2.addTimeLapse(composites,{min:500,max:7000,bands:'swir2,nir,red',gamma:1.6},'SEAK Composites',false)
}
function runIDS(){
  var studyAreaName = 'USFS LCMS 1984-2020';
  var idsColor = '0EE'
  ga('send', 'event', 'lcms-gtac-ids-viewer-run', 'year_range', `${idsMinYear}_${idsMaxYear}`);
  getLCMSVariables();
  var lcmsC = studyAreaDict[studyAreaName].final_collections
  lcmsC = ee.ImageCollection(ee.FeatureCollection(lcmsC.map(f => ee.ImageCollection(f))).flatten()).select(['Change','Change_Raw.*'])

  var years  = ee.List.sequence(idsMinYear,idsMaxYear);

  lcmsC = years.map(function(yr){
    var t = lcmsC.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic()
    return t.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis())
  });
  lcmsC = ee.ImageCollection(lcmsC)
  // var years  = ee.List.sequence(2010,2013);
  // var idsFolder = 'projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/IDS';
  var idsFolder = 'projects/lcms-292214/assets/CONUS-Ancillary-Data/IDS';
  var ids = ee.data.getList({id:idsFolder}).map(function(t){return t.id});
  console.log(ids)
  ids = ids.map(function(id){
    var idsT = ee.FeatureCollection(id);
    return idsT;
  });
  ids = ee.FeatureCollection(ids).flatten();
  // Map2.addLayer(ids,{strokeColor:'0DD',strokeWeight:1,layerType:'geeVectorImage'},'IDS Polygons',false,null,null,'IDS Polygons');
  ids = ids.map(function(f){return f.set('constant',1)})
  var idsLCMS = ee.ImageCollection(years.map(function(yr){
    yr = ee.Number(yr).int16();
    var idsT = ids.filter(ee.Filter.eq('SURVEY_YEA',yr));
    idsT = ee.Image().paint(idsT,null,1.5).visualize({min:1,max:1,palette:idsColor}).unmask(256);
    // Map2.addLayer(idsT,{},'IDS ' +yr.getInfo().toString(),false)
    var lcmsT = lcmsC.filter(ee.Filter.calendarRange(yr,yr,'year')).first().select(['Change']);

    lcmsT = lcmsT.updateMask(lcmsT.gte(2).and(lcmsT.lte(4)))
    lcmsT = lcmsT.visualize({min:2,max:4,palette:changePalette}).unmask(256);
    var out = idsT.where(lcmsT.neq(256).and(idsT.eq(256)),lcmsT);
    out = ee.Image(out.updateMask(out.neq(256))).byte();
    
    return out.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis()).float()
  }));
  
var lcmsChangeClassesForArea = formatAreaChartCollection(lcmsC.select(['Change']),[2,3,4],['Slow Loss','Fast Loss','Gain']);

  var idsLCMSTSForArea = ee.ImageCollection(years.map(function(yr){
    var idsT = ids.filter(ee.Filter.eq('SURVEY_YEA',yr));
//     // console.log(yr);
//     // console.log(idsT.limit(100).size().getInfo())
    var lcmsT = ee.Image(lcmsChangeClassesForArea.filter(ee.Filter.calendarRange(yr,yr,'year')).first());
    idsT = idsT.reduceToImage(['constant'],ee.Reducer.first()).unmask(0);
    var out = lcmsT.addBands(idsT).rename(['LCMS Slow Loss','LCMS Fast Loss','LCMS Gain','IDS Polygon']);
 
//     // out = out.visualize({min:1,max:2,palette:'FF0,0FF'})
    return out.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis()).float()
  }));

//   // Map2.addLayer(idsLCMSTS)
  var classLegendDict = {};
  classLegendDict['Slow Loss']= changePalette[0]
  classLegendDict['Fast Loss']= changePalette[1]
  classLegendDict['Gain']= changePalette[2]
  classLegendDict['IDS Polygons'] = idsColor;

  Map2.addTimeLapse(idsLCMS,{years:years.getInfo(),addToClassLegend:true,classLegendDict:classLegendDict,min:0,max:255},'LCMS Change and IDS Time Lapse',true);
  
  Map2.addSelectLayer(ids,{strokeColor:'D0D',layerType:'geeVectorImage'},'IDS Polygons',false,null,null,'IDS Select Polygons. Turn on layer and click on any area wanted to include in chart');
  getSelectLayers();
  lcmsC = lcmsC.select(['Change_Raw.*'],['Slow Loss Prob','Fast Loss Prob','Gain Prob'])
  var idsLCMSTS = years.map(function(yr){
    var lcmsT = lcmsC.filter(ee.Filter.calendarRange(yr,yr,'year')).first().divide(100);
    var idsT = ids.filter(ee.Filter.eq('SURVEY_YEA',yr));
    idsT = idsT.reduceToImage(['constant'],ee.Reducer.first()).unmask(0).rename(['IDS Polygon']);
    return lcmsT.addBands(idsT).float().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis()).float()
  });
  idsLCMSTS = ee.ImageCollection(idsLCMSTS);
  pixelChartCollections['test'] = {'label':'LCMS and IDS Time Series',
                                  'collection':idsLCMSTS,
                                  'chartColors':['f39268','d54309','00a398',idsColor],
                                  'xAxisLabel':'Year',
                                  'yAxisLabel':'LCMS Model Confidence or IDS Polygon'};

  areaChartCollections['test'] = {'label':'LCMS and IDS Time Series',
                                  'collection':idsLCMSTSForArea,
                                  'stacked':false,
                                  'steppedLine':false,
                                  'tooltip':'Summarize loss IDS each year',
                                  'colors':['f39268','d54309','00a398',idsColor],
                                  'xAxisLabel':'Year'};
   populatePixelChartDropdown();
populateAreaChartDropdown();
$('#LCMS-Change-and-IDS-Time-Lapse-1-name-span').click()
}
///////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//Function for converting line from storm track table to an object
function trackLineToObject(line){
  var fields = line.split(',');
  var wspd = fields[4].split('m')[0];
  var pres = fields[5].split('m')[0];
  return {'date':fields[0]+':'+fields[1],
          'lat':parseFloat(fields[2]),
          'lon':parseFloat(fields[3]),
          'wspd':parseFloat(wspd),
          'pres':parseFloat(pres),
          'FO':fields[fields.length-1]
    
  };
}
////////////////////////////////////////////////////////////////////////////////
function CalcStormMotion(y1,y2,x1,x2,dt){
  y1 = ee.Number(y1).float();
  y2 = ee.Number(y2).float();
  x1 = ee.Number(x1).float();
  x2 = ee.Number(x2).float();
  dt = ee.Number(dt).float();
  //return storm velocity components in meters per second
  // V = (y2-y1) * 111. *1000/ float(dt)
  var V = (y2.subtract(y1)).multiply(111).multiply(1000).divide(dt);

  // U = (x2-x1) * math.cos(y1*math.pi/180.) * 111. *1000/ float(dt)
  var U = (x2.subtract(x1)).multiply((y1.multiply(Math.PI/180)).cos()).multiply(111 *1000).divide(dt);
  var out = ee.Dictionary({});
  out = out.set('U',U);
  out = out.set('V',V)
  return ee.Dictionary(out);
}
////////////////////////////////////////////////////////////////////////////////
function getCoordGrid(lng,lat){
  var crs = 'EPSG:5070';
  // var transform = null;//[30,0,-2361915.0,0,-30,3177735.0];
  // var scale = 30;
  var pt = ee.FeatureCollection([ee.Feature(ee.Geometry.Point([lng,lat]))]);
  // Map.addLayer(pt)
  var proj = ee.Projection(crs);
  
  var coords = ee.Image.pixelCoordinates(proj).float();
  var ptValues = ee.Image.constant(ee.List(ee.Dictionary(coords.reduceRegion(ee.Reducer.first(), pt, 1, crs)).values()));
  coords = coords.subtract(ptValues);
  coords = coords.updateMask(coords.abs().reduce(ee.Reducer.max()).lte(maxDistance*1000))
  return coords.multiply(ee.Image([1,-1]));//.reproject(crs,null,1);
}
////////////////////////////////////////////////////////////////////////////////
//Function for creating wind fields from a pair of rows from a storm track table
function createHurricaneWindFields(row){
  row = ee.Feature(row);
  // print(current)
  // print(future)
  // console.log(row.getInfo())
  var current = ee.Dictionary(row.get('current'));
  var future = ee.Dictionary(row.get('future'));

  var currentDate = ee.Date(current.get('date'));
  var futureDate = ee.Date(future.get('date'));
  
    
  var tDiff = futureDate.difference(currentDate,'second');
  
  var CurrentLat = ee.Number(current.get('lat')).float();
  var CurrentLon = ee.Number(current.get('lon')).float();
  var FutureLat = ee.Number(future.get('lat')).float();
  var FutureLon = ee.Number(future.get('lon')).float();
  
  var MaxWind = ee.Number(current.get('wspd')).float();
  var CentralPressure =ee.Number(current.get('pres')).float();
  var FutureMaxWind = ee.Number(future.get('wspd')).float();
  var FutureCentralPressure =ee.Number(future.get('pres')).float();


  var HurricaneMotion = ee.Dictionary(CalcStormMotion(CurrentLat,FutureLat,CurrentLon,FutureLon,tDiff));
  var HurricaneMotionU = ee.Number(HurricaneMotion.get('U')).float();
  var HurricaneMotionV = ee.Number(HurricaneMotion.get('V')).float();
  
  var Lat = CurrentLat;
  var Lon = CurrentLon;
  var Wind = MaxWind;
  var Pressure = CentralPressure;
  
  //Not needed in GEE
  //var xc, yc = convert2grid(Lat,Lon,topo_info)

  // Pc   = Pressure * 100.
  var Pc   = ee.Number(Pressure.multiply(100));
  
  //  Pe = 1013. *100.
  var Pe = ee.Number(101300).float();
  
  //  if Pe <= Pc:Pe = Pc * 1.05
  Pe = ee.Number(ee.Algorithms.If(Pe.lte(Pc),Pc.multiply(1.05),Pe));
  
  //deltaP = (Pe-Pc)/100.
  var deltaP = (Pe.subtract(Pc)).divide(100.);
  // deltaP = 49;
  //  Rmax  = ( math.exp(2.636-0.00005086*deltaP**2+0.037842*28.)) * 1000.
  var Rmax = ((ee.Number(2.636).subtract(ee.Number(0.00005086).multiply(deltaP.pow(2))).add(0.037842*28)).exp()).multiply(1000)
  


  //  HSpd = math.sqrt( HurricaneMotionU**2+HurricaneMotionV**2 )
  var HSpd = HurricaneMotionU.hypot(HurricaneMotionV)

  //  HDir = math.atan2( HurricaneMotionV, HurricaneMotionU )
  var HDir = HurricaneMotionU.atan2(HurricaneMotionV);

  //This is replaced by the getCoordGrid function
  //     for d in range(1,5000):
  //         pts = []
  //         for x in (-d, d):
  //             for y in range(-d,d+1):
  //                 pts.append( (y,x) )
  //         for y in (-d,d):
  //             for x in range(-d+1,d):
  //                 pts.append( (y,x) )
  // var xyGrid =ee.Image([31579.875,-6701.25]).rename(['x','y']).float();// getCoordGrid(Lon,Lat);// ;
  var xyGrid =getCoordGrid(Lon,Lat);

  // Map.addLayer(xyGrid)
  //Set up some constants
  var umin = 1000;
  var r = -1;
  var r0 = 1200*1000;
  var a = 0.25;
  var m =1.6;
  var n = 0.9;
  
  //No need to iterate here
  //         for py,px in pts:
  //             if 0<xc+px<nx and 0<yc+py<ny:
  
  //Convert to radius
  //                 r = math.sqrt( py**2+px**2 ) * 30.
  r = xyGrid.pow(2).reduce(ee.Reducer.sum()).sqrt();
  // Map.addLayer(r,{min:0,max:1000})
  
  function calcVholland(r){
    //  f1 = (Wind-HSpd)**2
    var f1 = ee.Image(Wind.subtract(HSpd)).pow(2);
   
    //  f2 = ((r0-r)/(r0-Rmax))**2
    var f2 = ((ee.Image(r0).subtract(r)).divide(ee.Image(ee.Number(r0).subtract(Rmax)))).pow(2);
    
    //  f3 = (r/Rmax)**2
    var f3 = (r.divide(ee.Image(Rmax))).pow(2);
    
    // t1n = (1.-a)*(n+m)
    var t1n = ee.Image((1-a)*(n+m));
    
    //  t1d = n+  m*     (r/Rmax)**(2.*(n+m))
    var t1d = ee.Image(n).add(ee.Image(m).multiply((r.divide(Rmax)).pow(2*(n+m))));
  
    //   t2n = a*(1.+2.*m)
    var t2n = ee.Image(a*(1+2*m));
    
    //  t2d = 1.+2.*m*(r/Rmax)**(2.*(m+1.))
    var t2d = ee.Image(1).add(ee.Image(2*m).multiply((r.divide(Rmax)).pow(2*(m+1))));
  
    // Vholland=math.sqrt(f1*f2*f3*(t1n/t1d+t2n/t2d))
    var Vholland=(f1.multiply(f2).multiply(f3).multiply(t1n.divide(t1d).add(t2n.divide(t2d)))).sqrt();
    
    return Vholland;
  }
  //   //                 if r > 0:
  //     //                 else:
  // //                     Vholland = 0.
 
  var vHolland = ee.Image(0).where(r.gt(0),calcVholland(r));
  
  // Beta = -HDir - math.atan2(py,px)
  var Beta = ee.Image(HDir.multiply(-1)).subtract(xyGrid.select(['x']).atan2(xyGrid.select(['y'])));
  var rotation = (ee.Image(HSpd).multiply((Beta.multiply(-1)).sin()));

  var u = vHolland.add(rotation).set({'system:time_start':currentDate.millis(),
  'tDiff':tDiff});;// 0.44704
  
  // u = u.updateMask(u.gte(windThreshold))
  // var uWrong = vHolland.add(rotationWrong);// 0.44704
  // uWrong = uWrong.updateMask(uWrong.gte(windThreshold))
  // Map.addLayer(u,{min:150,max:160,palette:palettes.cmocean.Speed[7]},'Max Wind');
  // Map.addLayer(uWrong,{min:150,max:160,palette:palettes.cmocean.Speed[7]},'Max Wind Wrong');
  
  // Map2.addLayer(u,{min:0,max:100});
  return u
  // // umin = min(umin,u)
  // // umin = ee.Image.cat([ee.Image(umin),u]).reduce(ee.Reducer.min());
}
////////////////////////////////////////////////////////////////////////////////
function GALES(WindSpeed, Hgt, CrownDepth, Spacing, ModRupture){
  if(ModRupture === undefined || ModRupture === null){ModRupture = ee.Image(8500)}
  Spacing = ee.Image(Spacing);
  function GALESFun(){
    
    // Z = 1.3;
    var Z = 1.3;
    
    // b = 2.*CrownDepth/Hgt
    var b = CrownDepth.divide(Hgt).multiply(2);
    
    // l = b*CrownDepth/Spacing*0.5
    var l = b.multiply(CrownDepth).divide(Spacing).multiply(0.5);
    
    // G35 = (1.-math.exp(-math.sqrt(15*l)))/math.sqrt(15*l)
    var G35 = (ee.Image(1).subtract(l.multiply(15).sqrt().multiply(-1).exp())).divide((l.multiply(15)).sqrt());
  
    // D = Hgt*(1.-G35)
    var D = Hgt.multiply(ee.Image(1).subtract(G35));
    
    //UstarRatio = min(0.3, math.sqrt(0.003+0.3*l))
    var UstarRatio = ee.Image.cat([ee.Image(0.3),((l.multiply(0.3)).add(0.003)).sqrt()]).reduce(ee.Reducer.min());
   
    // PsiH = 0.193
    var PsiH = 0.193;
    
    // Z0H = G35*math.exp(-0.4/UstarRatio-PsiH)
    var Z0H = G35.multiply(((ee.Image(-0.4).divide(UstarRatio)).subtract(PsiH)).exp());
    
    // HD = Spacing / Hgt
    var HD = ee.Image(Spacing).divide(Hgt);
    
    // z0 = Z0H * Hgt
    var z0 = Z0H.multiply(Hgt);
   
    // BMmean = 0.68*HD-0.0385+(-0.68*HD+0.4785)*(1.7239*HD+0.0316)**(5)
    var BMmean = HD.multiply(0.68).subtract(0.0385).add(((HD.multiply(-0.68)).add(0.4785)).multiply(((HD.multiply(1.7239)).add(0.0316)).pow(5)));
   
    // BMmax  = 2.7193*HD-0.061+(1.273*HD+0.9701)*(1.1127*HD+0.0311)**5
    var BMmax = HD.multiply(2.7193).subtract(0.061).add(((HD.multiply(1.273)).add(0.9701)).multiply(((HD.multiply(1.1127)).add(0.0311)).pow(5)));
    
    // G = BMmax/BMmean
    var G = BMmax.divide(BMmean);
    
    // MOR = ModRupture*6894.757
    var MOR = ModRupture.multiply(6894.757);
    
    // Mcrit = 0.00358811*MOR
    var Mcrit = MOR.multiply(0.00358811);

    // try:
    
    //M =(Spacing.multiply(WindSpeed).multiply(0.4)).divide(((Hgt.subtract(D)).divide(z0)).log()).pow(2)
    var M = (D.subtract(Z)).multiply(1.22).multiply(1.226).multiply(G).multiply((Spacing.multiply(WindSpeed).multiply(0.4)).divide(((Hgt.subtract(D)).divide(z0)).log()).pow(2))
   
    // except:
    //     print(Hgt,Spacing, WindSpeed)
    //     print(D, Z, G, Spacing, WindSpeed, Hgt, z0)
    // if M<0:
    //     print('Negative M: ', BMmax, BMmean, Hgt, Spacing, WindSpeed, CBH)
    
    // R = M/Mcrit - 1.
    var R = M.divide(Mcrit).subtract(1);
   
    // return ( int(100. * math.exp(R) / (math.exp(R)+1.) ) - 50) *2
    var out = ((R.exp().multiply(100).divide((R.exp().add(1)))).int32().subtract(50)).multiply(2);
   
    return out;
  }
    // if Spacing > 0  and Hgt > 0: #Hgt > 0 and Spacing > 0 and Hgt - CBH>0:
    // else:
    //     return 0
    var GALESOut = ee.Image(0).where(Spacing.gt(0).and(Hgt.gt(0)),GALESFun());
    GALESOut = GALESOut.updateMask(Hgt.mask().and(WindSpeed.mask()));
    
    return GALESOut;
    
}
    
////////////////////////////////////////////////////////////////////////////////
function createHurricaneDamageWrapper(rows){
  console.log('Running storm model');

  // console.log(rows.getInfo())
  //Original Python implementation written by: Scott Goodrick
  //GEE implementation written by: Ian Housman and Robert Chastain
  //////////////////////////////////////////////////////////////
  // var palettes = require('users/gena/packages:palettes');
  var hgt_array = ee.Image('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/LANDFIRE/lf_evh_us_prvi_2020_2016');
  hgt_array = hgt_array.updateMask(hgt_array.neq(-9999));
  
  var from = ee.List.sequence(101,199).getInfo();
  var to = ee.List.sequence(1,99).getInfo();
  hgt_array= hgt_array.remap(from,to);
  // var year = ee.Feature(rows.first()).get('year').getInfo();
  var year = ee.Dictionary(ee.Feature(rows.first()).get('current')).get('year').getInfo();

  // var wind = ee.ImageCollection(rows.map(createHurricaneWindFields)).max();
  // wind = wind.updateMask(wind.gte(30))  ;//(ee.Feature(rows.first()))
  // Map2.addLayer(wind,{min:30,max:160,legendLabelLeftAfter:'mph',legendLabelRightAfter:'mph',palette:palettes.niccoli.isol[7]})
  //Define export params
  // var studyArea = geometry;
  // var name = rows[0].name;
  // var year = rows[0].year;
  // // console.log(rows[0]);
 
 //  if(name === undefined || name === null){
    name = $('#storm-name').val();
    if(name === ''){
      try{
        name = jQuery('#stormTrackUpload')[0].files[0].name.split('.').slice(0, -1).join('.')
      }catch(err){
        console.log(err);
        name = 'Test'
      }
      
    }
  // }
 // console.log('name');
 // console.log(name);
 // console.log(jQuery('#stormTrackUpload')[0].files[0].name.split('.').slice(0, -1).join('.'))
  // if(year === undefined || year === null){
  //   var year = stormYear;//2018;
  // }
  // var driveFolder = 'GALES-Model-Outputs';
  // // var crs = 'EPSG:32616';


  //Define some other params
  var windThreshold = minWind;


  // // rows = rows.slice(108,160);
  // // var rows = JSON.parse($('#storm-track').val())
  // // rows = rows.slice(120,122);


  //   var left = rows.slice(0,rows.length-1);

  //   var right = rows.slice(1,rows.length);
  //   var paired = ee.List(left).zip(right).getInfo();
  //   // console.log(paired)
    var c = ee.ImageCollection(rows.map(createHurricaneWindFields));
  //   }));
  //   // Map.addLayer(c)

  var speeds = [30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499,500];
  var categories = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5];

    //Set up MOD rupture image
    var modImage = eval($('#mod-image').val());
    var modLookup = $('#mod-lookup').val();
    modLookup = modLookup.replace(/\s+/g, '').replace('{','').replace('}','').split(',').map(i => i.split(':').map(n => parseInt(n)));
    var from = modLookup.map(n => n[0]);
    var to = modLookup.map(n => n[1]);
    modImage = modImage.remap(from,to)
    Map2.addLayer(modImage,{layerType:'geeImage',min:to.min(),max:to.max()},'MOD Image',false)
 // console.log(c.limit(2).getInfo())
    c = c.map(function(img){
      var tDiff = ee.Image(ee.Number(img.get('tDiff'))).divide(60*60).float()
      var cats = img.int16().remap(speeds,categories);
      var damage = GALES(img.multiply(0.447), hgt_array, hgt_array.multiply(0.33), 5.0, modImage);
      var damageSum = damage.add(100).clamp(0,200).multiply(tDiff);
      var windSum = img.multiply(tDiff);
      var catSum = cats.multiply(tDiff);
      var cat1Sum = cats.updateMask(cats.eq(1)).multiply(tDiff);
      var cat2Sum = cats.updateMask(cats.eq(2)).multiply(tDiff);
      var cat3Sum = cats.updateMask(cats.eq(3)).multiply(tDiff);
      var cat4Sum = cats.updateMask(cats.eq(4)).multiply(tDiff);
      var cat5Sum = cats.updateMask(cats.eq(5)).multiply(tDiff);
      return img.addBands(damage)
      .addBands(cats)
      .addBands(hgt_array)
      .addBands(damageSum)
      .addBands(windSum)
      .addBands(catSum)
      .addBands(cat1Sum)
      .addBands(cat2Sum)
      .addBands(cat3Sum)
      .addBands(cat4Sum)
      .addBands(cat5Sum)
      .rename(['Wind','Damage','Category','Tree Height','Damage_Sum','Wind_Sum','Cat_Sum','Cat1_Sum','Cat2_Sum','Cat3_Sum','Cat4_Sum','Cat5_Sum']).updateMask(img.gte(windThreshold)).float();
    });
    
    // console.log(c.limit(2).getInfo())
    // c  = c.map(function(img){return img.set('system:time_start',ee.Date.fromYMD(ee.Number.parse(img.get('system:index')),6,1).millis())})
   
    pixelChartCollections['basic'] = {'label':'Wind and Damage',
                                      'collection':c.select(['Wind','Damage','Tree Height']),
                                      'chartColors':chartColorsDict.coreLossGain,
                                      'tooltip':'Chart wind speed and damage acros time',
                                      'xAxisLabel':'Time',
                                      'yAxisLabel':'Wind Speed (mph) or Damage',
                                      'simplifyDate':false}
    populatePixelChartDropdown();
    
    
    var max = c.qualityMosaic('Wind')
    // wind_array = wind_array.updateMask(wind_array.gt(windThreshold));

    // Map2.addLayer(hgt_array,{min:1,max:30,legendLabelLeftAfter:'m',legendLabelRightAfter:'m',palette:palettes.crameri.bamako[50].reverse()},'LANDFIRE 2020 Tree Height (m)',false);
    var trackRows = rows.map(function(f){
      var current = ee.Dictionary(f.get('current'));
      var speed = ee.Number(current.get('wspd'))
      f = f.set(current)
      return f.buffer(speed.multiply(600))
    })
    Map2.addLayer(trackRows,{layerType:'geeVectorImage'},name + ' ' +year.toString()+' Storm Track',false);
    Map2.addLayer(max.select([0]),{layerType:'geeImage', min:30,max:160,legendLabelLeftAfter:'mph',legendLabelRightAfter:'mph',palette:palettes.niccoli.isol[7]},name+' ' +year.toString()+' Wind Max',false);
    //GALES Params
    //Wind speed in mps (Convert from mph to mps)
    //Height in meters
    //Crown height in meters (currently assumes top third of tree height is crown)
    //Tree spacing in meters (currently set to constant of 5m)
    //Modulus of rupture in mks (currently for Loblolly or Long Leaf Pine)
    //MMCrit[j,i] = GALES(0.447*wind_array[j,i], 0.1*hgt_array[j,i], 0.33*0.1*hgt_array[j,i], 5.0, ModRupture=8500.)
    
    // var wind_array = ee.Image(150);
    // var hgt_array = ee.Image(20);
    // var crown_hgt_array = hgt_array.multiply(0.33);
    // var spacing = 5;
    // var modRupture = 8500
    // GALES(wind_array.multiply(0.447), hgt_array, crown_hgt_array, spacing, modRupture);
    // var GALESOut = GALES(wind_array.multiply(0.447), hgt_array, hgt_array.multiply(0.33), 5.0, 8500);
    Map2.addLayer(max.select([1]),{min:-100,max:100,palette:palettes.niccoli.isol[7]},name +' ' +year.toString()+' Damage Max',false);
    
    var damageSum = c.select(['Damage_Sum']).sum().int16();
    Map2.addLayer(damageSum,{layerType:'geeImage',min:50,max:500,palette:palettes.niccoli.isol[7]},name +' ' +year.toString()+' Damage Sum',false)
    
    var windSum = c.select(['Wind_Sum']).sum().int16();
    Map2.addLayer(windSum,{layerType:'geeImage',min:50,max:500,palette:palettes.niccoli.isol[7]},name +' ' +year.toString()+' Wind Sum',false)
    
    var catSum = c.select(['Cat_Sum']).sum().int16();
    Map2.addLayer(catSum,{layerType:'geeImage',min:0,max:10,palette:palettes.niccoli.isol[7]},name +' ' +year.toString()+' Cat Sum',false)
    
    var cat1Sum = c.select(['Cat1_Sum']).sum().int16();
    Map2.addLayer(cat1Sum,{layerType:'geeImage',min:0,max:10,palette:palettes.niccoli.isol[7]},name +' ' +year.toString()+' Cat 1 Sum',false)
    
    var cat2Sum = c.select(['Cat2_Sum']).sum().int16();
    Map2.addLayer(cat2Sum,{layerType:'geeImage',min:0,max:10,palette:palettes.niccoli.isol[7]},name +' ' +year.toString()+' Cat 2 Sum',false)
    
    var cat3Sum = c.select(['Cat3_Sum']).sum().int16();
    Map2.addLayer(cat3Sum,{layerType:'geeImage',min:0,max:10,palette:palettes.niccoli.isol[7]},name +' ' +year.toString()+' Cat 3 Sum',false)
    
    var cat4Sum = c.select(['Cat4_Sum']).sum().int16();
    Map2.addLayer(cat4Sum,{layerType:'geeImage',min:0,max:10,palette:palettes.niccoli.isol[7]},name +' ' +year.toString()+' Cat 4 Sum',false)
    
    var cat5Sum = c.select(['Cat5_Sum']).sum().int16();
    Map2.addLayer(cat5Sum,{layerType:'geeImage',min:0,max:10,palette:palettes.niccoli.isol[7]},name +' ' +year.toString()+' Cat 5 Sum',false)
    
    var windStack = ee.Image.cat([max.select([0]).rename(['Wind_Max']),windSum,catSum,cat1Sum,cat2Sum,cat3Sum,cat4Sum,cat5Sum]).int16();
    var damageStack = ee.Image.cat([max.select([1]).rename(['Damage_Max']),damageSum]).int16();

  //   // Map2.addTimeLapse(cl.select([0]),{min:75,max:160,palette:palettes.niccoli.isol[7],years:years},'Wind Time Lapse')
  //   // Map2.addTimeLapse(cl.select([1]),{min:-100,max:100,palette:palettes.niccoli.isol[7],years:years},'Damage Time Lapse')
    
    var trackBounds = trackRows.geometry().bounds();
    var trackBoundsFeatures = trackBounds.getInfo()
    var trackBoundsCoords =trackBoundsFeatures.coordinates[0];
    // console.log(trackBounds.getInfo())

    window.downloadQuickLooks = function(){
      $('#summary-spinner').slideDown();
      windStack.clip(trackBounds).unmask(-32768,false).int16().getDownloadURL({name:name +'_'+year.toString()+'_Wind_Quick_Look',
                        scale:quickLookRes,
                        crs:$('#export-crs').val(),
                        region:trackBoundsCoords},
                        function(url1,failure1){
                          damageStack.clip(trackBounds).unmask(-32768,false).int16().getDownloadURL({name:name+'_'+year.toString()+'_Damage_Quick_Look',
                            scale:quickLookRes,
                            crs:$('#export-crs').val(),
                            region:trackBoundsCoords},
                            function(url2,failure2){
                               $('#summary-spinner').slideUp();
                               if(failure1 === undefined){failure1 = 'No errors'};
                               if(failure2 === undefined){failure2 = 'No errors'};
                              showMessage('Quick Look Outputs Ready',
                                `<hr>
                                <a  target="_blank" href = '${url1}'>Click to download wind stack</a>
                                <p title = 'If there are errors, you may need to specify a larger "Quick look spatial resolution"'>Errors: ${failure1}</p>
                                <hr>
                                <a  target="_blank" href = '${url2}'>Click to download damage stack</a>
                                <p title = 'If there are errors, you may need to specify a larger "Quick look spatial resolution"'>Errors: ${failure2}</p>
                                `)
                             
                            })
                          
                        });
    }
    Map2.addExport(max.select([0]).int16(),name + '_'+year.toString()+'_Wind_Max' ,30,true,{});

    Map2.addExport(windSum,name + '_'+year.toString()+'_Wind_Sum' ,30,true,{});
    
    Map2.addExport(catSum,name + '_'+year.toString()+'_Cat_Sum' ,30,true,{});
    Map2.addExport(cat1Sum,name + '_'+year.toString()+'_Cat1_Sum' ,30,true,{});
    Map2.addExport(cat2Sum,name + '_'+year.toString()+'_Cat2_Sum' ,30,true,{});
    Map2.addExport(cat3Sum,name + '_'+year.toString()+'_Cat3_Sum' ,30,true,{});
    Map2.addExport(cat4Sum,name + '_'+year.toString()+'_Cat4_Sum' ,30,true,{});
    Map2.addExport(cat5Sum,name + '_'+year.toString()+'_Cat5_Sum' ,30,true,{});
    
    Map2.addExport(max.select([1]).int16(),name + '_'+year.toString()+'_Damage_Max' ,30,true,{});
    Map2.addExport(damageSum,name + '_'+year.toString()+'_Damage_Sum'  ,30,true,{});
    
    // Map2.addExport(damageStack,name + '_'+year.toString()+'_Damage_Stack_'+modRupture.toString() ,30,true,{});
    // Map2.addExport(damageSum.int16(),name + '_'+year.toString()+'_Damage_Sum_'+modRupture.toString() ,30,true,{});
    Map2.addLayer(ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Boundaries'),{layerType:'geeVectorImage'},'USFS Boundaries',false);
     // exportArea = null;
   
     
    window.addTrackBounds = function(){
        try{
      exportArea.setMap(null);
    }catch(err){
      console.log(err);
    }
    exportArea = new google.maps.Polygon(exportAreaPolygonOptions);

    trackBoundsCoords.map(function(coords){
      var path = exportArea.getPath();
        var out = {};
        out.lng = function(){return coords[0]}
        out.lat = function(){return coords[1]}
        path.push(out);
    })
    exportArea.setMap(map);
    synchronousCenterObject(trackBoundsFeatures);
    }
    // exportArea = new google.maps.Data({fillOpacity: 0,strokeColor:'#FF0'});
    // exportArea.addGeoJson(ee.Feature(trackBounds).getInfo());
    // exportArea.setMap(map);
    
  //   // wind_array = wind_array.clip(studyArea).unmask(0,false).byte();
  //   // GALESOut = GALESOut.multiply(100).clip(studyArea).unmask(10001,false).int16();
    
  //   // var outRegion = studyArea.bounds();//.transform('EPSG:4326', 100);
  //   // print('Exporting:',outRegion);
  //   // Export.image.toDrive(wind_array, name + '-wind', driveFolder, name + '-wind', null, outRegion, scale, crs, transform, 1e13);
  //   // Export.image.toDrive(GALESOut, name + '-GALES', driveFolder, name + '-GALES', null, outRegion, scale, crs, transform, 1e13);

  
}
///////////////////////////////////////////////////////////
function runStorm(){
  var x = 0;//console.log('here')
  // Map2.addExport(ee.Image(1).int16(),'test' ,30,true,{});
  // rows = ee.FeatureCollection(rows.features);
     
  // createHurricaneDamageWrapper(rows);
 // addExport(ee.Image(1).byte(),'test',30,true,{} )
 // createHurricaneDamageWrapper(rows,true);
// fetch(".geojson/michael-2018.txt")
  // .then((resp) => console.log(resp.json())) // Transform the data into json
    // .then(function(json) {
    //   console.log(json)
      
    //   });
    } 
  
///////////////////////////////////////////////////////////
function runLAMDA(){
  var getDate = function(name,jd_split_string,day_index){
    var yr = name.split(jd_split_string)[0]
    yr = parseInt(yr.slice(yr.length-4,yr.length))
    var days = name.split(jd_split_string)[1].split('_')[0].split('-');
    var day = parseInt(days[day_index ]);
    // console.log(days)
    // console.log(days[days.length-1])
    var d = ee.Date.fromYMD(yr,1,1).advance(day-1,'day')
    return d.millis()
   }
   var year = parseInt(urlParams.year);
   $('#layer-list-collapse-label-label:first-child').html('LAMDA Data: '+year.toString());

  var bucketName = 'lamda-products';
  var study_areas = ['CONUS','AK'];
  var output_types = ['Z','TDD'];
  var output_type_stretch = {'Z':{'scale_factor':1000,
                  'stretch' : -2.5*-2,
                  'legendLabel':'stdDev'

                  },
                'TDD':{'scale_factor':10000,
                  'stretch' : -0.05*-2,
                  'legendLabel':'/yr'
                  }
              }

  
        function listFiles(nextPageToken=null){
          let url = `https://storage.googleapis.com/storage/v1/b/${bucketName}/o?maxResults=100000`;
          if(nextPageToken!== null){
            url = `${url}?pageToken=${nextPageToken}`
          }
          return $.ajax({
            type: 'GET',
            url: url
          })
        }
        function makeTS(json){
          //  json = json.items;
          var continuous_palette_chastain = ['a83800','ff5500','e0e0e0','a4ff73','38a800'];
            // console.log(json[0]);
            var selectedYear = year.toString()
            json = json.filter((f)=> f.name.indexOf('ay'+selectedYear)>-1 || f.name.indexOf(selectedYear + '_jd')>-1);
              var names = json.map(nm => nm.name)
              names = names.filter(nm => nm.indexOf('.tif')==nm.length-4)
              // var eight_bits= names.filter(i => i.indexOf('_8bit')>-1)
              var persistence = names.filter(i => i.indexOf('_persistence')>-1)
              var raws = names.filter(i => i.indexOf('_8bit')==-1 && i.indexOf('_persistence')==-1);
              
              // var eight_bit_days = [];
              // eight_bits.map(function(nm){
              //   var d = nm.split('_jd')[1].split('_')[0].split('-')[0];
              //   if(eight_bit_days.indexOf(d) === -1){eight_bit_days.push(d)}
              // });
              var persistence_days = [];
              persistence.map(function(nm){
                var d = nm.split('_jds')[1].split('_')[0].split('-')[0];
                if(persistence_days.indexOf(d) === -1){persistence_days.push(d)}
              });
              var raw_days = [];
              raws.map(function(nm){
                var d = nm.split('_jd')[1].split('_')[0].split('-')[0];
                if(raw_days.indexOf(d) === -1){raw_days.push(d)}
              });
              // console.log(eight_bit_days);
              console.log(`Persistence days: ${persistence_days.sort()}`);
              console.log(`Raw days: ${raw_days}`);
              
              
              // console.log(names);
             //  study_areas.map(function(study_area){
             //    var joined;
              output_types.map(function(output_type){
                  var raw_viz = {'min':output_type_stretch[output_type]['stretch']*-1,'max':output_type_stretch[output_type]['stretch'],'palette':continuous_palette_chastain,'dateFormat':'YYMMdd','advanceInterval':'day',legendLabelLeftAfter:output_type_stretch[output_type]['legendLabel'],legendLabelRightAfter:output_type_stretch[output_type]['legendLabel']};
             
                var eight_bit_viz = {'min':0,'max':254,'palette':continuous_palette_chastain,'dateFormat':'YYMMdd','advanceInterval':'day'};
                var persistence_viz = {'min':1,'max':3,'opacity':1,'palette':'ffaa00,e10000,e100c5','dateFormat':'YYMMdd','advanceInterval':'day','classLegendDict':{'1 Detection':'ffaa00','2 Detections':'e10000','3 or More Detections':'e100c5'}};
                var persistenceT = persistence.filter(n => n.indexOf(output_type) > -1)
                var rawsT = raws.filter(n => n.indexOf(output_type) > -1);
            
                if(rawsT.length > 0){
                  var raw_c = ee.ImageCollection(raw_days.map(function(raw_day){
                    var t = rawsT.filter(n => n.indexOf('_jd'+raw_day)>-1);
                    var img = ee.ImageCollection(t.map(function(nm){
                      return  ee.Image.loadGeoTIFF(`gs://${bucketName}/${nm}`).divide(output_type_stretch[output_type]['scale_factor']);
                    })).mosaic().set('system:time_start',getDate(t[0],'_jd',0));
                    return img;
                  })).select([0],[`LAMDA ${output_type}`]);
         

                Map2.addTimeLapse(raw_c, raw_viz,`${output_type} raw`)
                    

                }
         
                if(persistenceT.length>0){
                  var persistence_c = ee.ImageCollection.fromImages(persistence_days.map(function(persistence_day){
                    var t = persistenceT.filter(n => n.indexOf('_jds'+persistence_day)>-1);
                    // console.log(`${persistence_day} ${t}`)
                    var img = ee.ImageCollection(t.map(function(nm){
                      return  ee.Image.loadGeoTIFF(`gs://${bucketName}/${nm}`);
                    })).mosaic().selfMask().set('system:time_start',getDate(t[0],'_jds',2));
                    // console.log(output_type+' '+persistence_day);console.log(t);
                    // Map2.addLayer(img,persistence_viz,`${output_type} ${persistence_day} persistence`,false);
                    return img;
                  })).select([0],[`LAMDA ${output_type}`]);
         
             //      var persistence_c = persistence.map(function(t){
             //          var img = ee.Image.loadGeoTIFF(`gs://${bucketName}/${t}`)
             //          img = img.selfMask()
             //          img = img.set('system:time_start',getDate(t,'_jds',2))
             //          return img
             //        })
             //        persistence_c = ee.ImageCollection.fromImages(persistence_c)
                  Map2.addTimeLapse(persistence_c,persistence_viz,`${output_type} persistence`)
                  
                }
                
                })
             //    // pixelChartCollections[`${study_area}-pixel-charting`] =  {
             //      //     'label':`${study_area} Time Series`,
             //      //     'collection':joined,
             //      //     'xAxisLabel':'Date',
             //      //     'tooltip':'Query LAMDA raw time series',
             //      //     'chartColors':['a83800','ff5500'],
             //      //     'semiSimpleDate':true
             //      // };
             //  })
              // populatePixelChartDropdown();
              // setTimeout(function(){$('#close-modal-button').click();$('#CONUS-Z-8-bit-timelapse-1-name-span').click()}, 2500);
        }
        listFiles().done(json=>makeTS(json.items))
}
///////////////////////////////////////////////////////////
function runDashboard(){
  console.log('running dashboard');
  let tryDirs = ['./geojson/','https://storage.googleapis.com/lcms-dashboard-fast/'];
  let tryDirI = 0;
let fipsDict = ee.Dictionary({'01':'AL',
'02':'AK',
'04':'AZ',
'05':'AR',
'06':'CA',
'08':'CO',
'09':'CT',
'10':'DE',
'11':'DC',
'12':'FL',
'13':'GA',
'15':'HI',
'16':'ID',
'17':'IL',
'18':'IN',
'19':'IA',
'20':'KS',
'21':'KY',
'22':'LA',
'23':'ME',
'24':'MD',
'25':'MA',
'26':'MI',
'27':'MN',
'28':'MS',
'29':'MO',
'30':'MT',
'31':'NE',
'32':'NV',
'33':'NH',
'34':'NJ',
'35':'NM',
'36':'NY',
'37':'NC',
'38':'ND',
'39':'OH',
'40':'OK',
'41':'OR',
'42':'PA',
'44':'RI',
'45':'SC',
'46':'SD',
'47':'TN',
'48':'TX',
'49':'UT',
'50':'VT',
'51':'VA',
'53':'WA',
'54':'WV',
'55':'WI',
'56':'WY'});
let addedLayerCount=0;

let startYearT = parseInt(urlParams.startYear);
let endYearT = parseInt(urlParams.endYear);
let dashboardFolder = 'projects/lcms-292214/assets/Dashboard-Data/Dashboard-Output-Summary-Areas/2022-8';//'projects/lcms-292214/assets/Dashboard2';
var summaries = ee.data.getList({id:dashboardFolder}).map(function(t){return t.id});
// console.log(summaries.length)
// window.lcmsTS = ee.FeatureCollection('projects/lcms-292214/assets/CONUS-LCMS/TimeSync/CONUS_TimeSync_Annualized_Table_Merged_secLC_v2');

huc6_conus = ee.FeatureCollection("USGS/WBD/2017/HUC06")
    .filter(ee.Filter.inList('states',['CN','MX','AK','AK,CN','HI','AS']).not())
// Map2.addLayer(huc6_conus,{layerType:'geeVectorImage'},'HUC06')
var summaryAreas = {
  'HUC 6':{'path':'HUC06','color':'00E','unique_fieldname':'name','visible':false,'title':'Level 06 hydrological unit codes (watersheds)'},
  'Counties':{'path':'Counties','unique_fieldname':'NAME','visible':true,'color':'EFE','title':'All counties throughout the US'},
  'Census Urban Areas':{'path':'Census_Metro_Areas','unique_fieldname':'NAME10','visible':false,'color':'E2E','title':'2018 US Census Bureau Urban Areas'},
  'CFLRP':{'path':'CFLRP','color':'D0D','unique_fieldname':'PROJECTNAM','visible':false, 'title':'Collaborative Forest Restoration Program areas throughout the US'},
  'USFS Planning Units':{'path':'LMPU','unique_fieldname':'LMPU_NAME','visible':false,'color':'F88', 'title':'USFS planning areas'} , 
  'USFS Forest Districts':{'path':'Districts','unique_fieldname':'DISTRICTNA','visible':false,'color':'FF8','title':'USFS Forest District boundaries'},
  'USFS Forests':{'path':'Forests','unique_fieldname':'FORESTNAME','visible':false,'color':'8F8','title':'USFS Forest boundaries'}
  
}
if(urlParams.onlyIncludeFacts==true){
  summaryAreas = {};
}
if(urlParams.onlyIncludeFacts == true || urlParams.includeFacts == true || urlParams.beta === true){
  console.log('Including FACTS treatment polygons');
  summaryAreas['FACTS Fuel Treatments'] = {'path':'FACTS_Fuel_Treatments','unique_fieldname':'treat_cat_yr','visible':true,'color':'F8F','title':'FACTS Fuel Treatments'}
}
if(urlParams.layerViz == undefined || urlParams.layerViz == null){
  urlParams.layerViz = {};
  Object.keys(summaryAreas).map(k=>{
    let kName = k.replaceAll(' ','-');
    urlParams.layerViz[kName]=summaryAreas[k].visible;
  })
}else{
  Object.keys(urlParams.layerViz).map(k=>{
    let t;
    if(urlParams.layerViz[k] == 'true'){urlParams.layerViz[k]=true}
    else if(urlParams.layerViz[k] == 'false'){urlParams.layerViz[k]=false}
  });
  Object.keys(summaryAreas).map(k=>{
    let kName = k.replaceAll(' ','-')
    summaryAreas[k].visible = urlParams.layerViz[kName]
  })
}

let layerVizKeys = Object.keys(urlParams.layerViz);

function loadGEESummaryAreas(summaryAreaObj,name){
    path = summaryAreaObj.path
    let summariesT = summaries.filter(f=>f.indexOf(path)>-1);
    // console.log(summariesT)
    summariesT = summariesT.filter(f=>f.indexOf('_wCIWtd_')>-1);
    // console.log(summariesT)
    if(summariesT.length>0){
      summariesT = summariesT.map(id=>{
        var f = ee.FeatureCollection(id)
        f = f.map(feat=>feat.set('Path',id));
        return f
      });
      summariesT = ee.FeatureCollection(summariesT).flatten();
      if(name==='HUC 6'){
        summariesT=summariesT.map(f=>f.set(summaryAreaObj.unique_fieldname,ee.String(f.get('name')).cat(', ').cat(ee.String(f.get('states')))))
      }
      if(name==='Counties'){
        summariesT=summariesT.map(f=>f.set(summaryAreaObj.unique_fieldname,ee.String(f.get('NAME')).cat(', ').cat(fipsDict.get(ee.String(f.get('STATEFP'))))))
      }
      // if(name === 'FACTS Fuel Treatments'){
      //   summariesT=summariesT.map(f=>f.set(summaryAreaObj.unique_fieldname,ee.String(f.get('ACTIVITY_2')).cat(' - ').cat(ee.String(f.get('FACTS_ID'))).cat(' - ').cat(ee.Date(f.get('ACT_CREATE')).format('YYYY-MM-dd'))))
      // }
      Map2.addLayer(summariesT,{strokeColor:summaryAreaObj.color,layerType:'geeVectorImage',dashboardSummaryLayer:true,dashboardFieldName:summaryAreaObj.unique_fieldname,dashboardSummaryMode:'hybrid',strokeWeight:1.5,title:summaryAreaObj.title},name,summaryAreaObj.visible);
  }
}

    
let lcmsRun={}
lcmsRun.lcms = studyAreaDict[studyAreaName].final_collections
  lcmsRun.lcms = ee.ImageCollection(ee.FeatureCollection(lcmsRun.lcms.map(f => ee.ImageCollection(f).select(['Change','Land_Cover','Land_Use','.*Probability.*']))).flatten())

  //Get properties image
  lcmsRun.f = ee.Image(lcmsRun.lcms.filter(ee.Filter.notNull(['Change_class_names'])).first());
  lcmsRun.props = lcmsRun.f.getInfo().properties;
  // console.log(lcmsRun.props)

  lcmsRun.lcms = lcmsRun.lcms.filter(ee.Filter.calendarRange(startYearT,endYearT,'year'));
  // console.log(lcmsRun.lcms.aggregate_histogram ('study_area').getInfo())
  

  
  //Mosaic all study areas
  lcmsRun.lcms = ee.List.sequence(startYearT,endYearT).map(function(yr){
    var t = lcmsRun.lcms.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic()
    return t.copyProperties(lcmsRun.f).set('system:time_start',ee.Date.fromYMD(yr,6,1).millis())
  });
  lcmsRun.lcms = ee.ImageCollection(lcmsRun.lcms)  

  
  let firstComparisonLayerI=false;
  ['Land_Cover','Land_Use'].map(nm=>{
    // console.log(nm)
    let pre= lcmsRun.lcms.filter(ee.Filter.calendarRange(startYearT,startYearT+2,'year')).select([nm]).mode().copyProperties(lcmsRun.f);
    let post= lcmsRun.lcms.filter(ee.Filter.calendarRange(endYearT-2,endYearT,'year')).select([nm]).mode().copyProperties(lcmsRun.f);

    Map2.addLayer(pre,{'autoViz':true,opacity:0.3,layerType:'geeImage'},`${nm.replace('_',' ')} ${startYearT}-${startYearT+2}`,firstComparisonLayerI,null,null,`Most common ${nm.replace('_',' ')} class from ${startYearT} to ${startYearT+2}`,'reference-layer-list');
    Map2.addLayer(post,{'autoViz':true,opacity:0.1,layerType:'geeImage'},`${nm.replace('_',' ')} ${endYearT-2}-${endYearT}`,firstComparisonLayerI,null,null,`Most common ${nm.replace('_',' ')} class from ${endYearT-2} to ${endYearT}`,'reference-layer-list');

    firstComparisonLayerI = false;
  })
  
  let lossYearPalette = 'ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02';
  let gainYearPalette = 'c5ee93,00a398';

    let code_dict = {2:{label:'Slow Loss',palette:lossYearPalette,visible:true},
                    3:{label:'Fast Loss',palette:lossYearPalette,visible:true},
                    4:{label:'Gain',palette:gainYearPalette,visible:false}};
    Object.keys(code_dict).map(k=>{
      let changeT = lcmsRun.lcms.filter(ee.Filter.calendarRange(startYearT,endYearT,'year')).select(['Change'])
      changeT = changeT.map(img=>ee.Image.constant(ee.Number(img.date().get('year'))).int16().updateMask(img.eq(ee.Image(parseInt(k))))).max()
      Map2.addLayer(changeT,{min:startYearT,max:endYearT,palette:code_dict[k].palette,layerType:'geeImage'},code_dict[k].label,code_dict[k].visible,null,null,``,'reference-layer-list');
     
    })
  
  
  
  Object.keys(summaryAreas).map(k=>{
    loadGEESummaryAreas(summaryAreas[k],k)
  });

  // if no share link in play, then call selectQuestion
  if(!deepLink){
    selectQuestion(questionDict[urlParams.questionVar]);
  }
  
  // Keep track of which layers are being viewed
  $('.layer-checkbox,.layer-span').click(event=>{
    setTimeout(()=>{
      Object.keys(layerObj).map(k=>{
        let nm = layerObj[k].name.replaceAll(' ','-');
        if(layerVizKeys.indexOf(nm)>-1){
          urlParams.layerViz[nm]=layerObj[k].visible;
        }
      })}
    ,1000)
    
  })
  

}

function runAlgal(){
  plotRadius=5;
  queryWindowMode = 'sidePane';
  // scale = 10;
  clickBoundsColor = '#0FF'
  transform=[10,0,-2361915.0,0,-10,3177735.0]
  if(algalRunID===1){
    localStorage.showToolTipModal= 'false';
    $('#query-label').click();
  }
  
  let ab = ee.ImageCollection('projects/gtac-algal-blooms/assets/outputs/HAB-RF-Images');
  //ab = ab.filter(ee.Filter.eq('studyAreaName',"WY-MT-CO-UT-ID2"))
  ab = ab.filter(ee.Filter.eq('studyAreaName','WY-GYE'))
  // console.log(ab.first().getInfo())
 
  ab = ab.filter(ee.Filter.calendarRange(parseInt(urlParams.startYear),parseInt(urlParams.endYear),'year'))
      .filter(ee.Filter.calendarRange(150,300))

  // Add filter for asset whichModel property (WDEQ vs HCB)
  ab_wdeq = ab.filter(ee.Filter.eq('whichModel','WDEQ'));
  ab_hcb = ab.filter(ee.Filter.eq('whichModel','HCB'));

  let algalLegendDict={'Algal Negative':'00D','Algal Positive':'D00'};
  // Map2.addTimeLapse(ab.select([0]),{'min':1,'max':2,'palette':'00D,D00','classLegendDict':algalLegendDict,'dateFormat':'YYMMdd','advanceInterval':'day'},'Algal Bloom Classification',true)

   // countC = ab.select([0]) 
   countC_hcb = ab_hcb.select([0]); 
   countC_wdeq = ab_wdeq.select([0]);
  //  countNotC = countC.map(img=>img.updateMask(img.lt(25000)))
  //  countC = countC.map(img=>img.updateMask(img.gte(25000)))

    Map2.addTimeLapse(countC_hcb,{'min':25000,'max':5000000,'palette':palettes.matplotlib.plasma[7],'dateFormat':'YYMMdd','advanceInterval':'day','dateField':'system:time_end',legendNumbersWithCommas:true},'Cyanobacteria Count-Model 1',true,'cells/mL');
    Map2.addTimeLapse(ab_hcb.select([1]),{'min':200000000,'max':1000000000,'palette':palettes.matplotlib.plasma[7],'dateFormat':'YYMMdd','advanceInterval':'day','dateField':'system:time_end',legendNumbersWithCommas:true},'Cyanobacteria Biovolume-Model 1',true,'µm3');
    
    Map2.addTimeLapse(countC_wdeq,{'min':1000,'max':5000,'palette':palettes.matplotlib.plasma[7],'dateFormat':'YYMMdd','advanceInterval':'day','dateField':'system:time_end',legendNumbersWithCommas:true},'Cyanobacteria Cell Count-Model 2',true,'raw cell count');
    Map2.addTimeLapse(ab_wdeq.select([1]),{'min':2000000,'max':10000000,'palette':palettes.matplotlib.plasma[7],'dateFormat':'YYMMdd','advanceInterval':'day','dateField':'system:time_end',legendNumbersWithCommas:true},'Cyanobacteria Density-Model 2',true,'cells/L');

    setTimeout(()=>{$('#Cyanobacteria-Count-1-name-span').click();
      setTimeout(()=>{$('#Cyanobacteria-Count-1-forward-button>i').click();
      $('#Cyanobacteria-Count-1-forward-button>i').click();
      // $('#Cyanobacteria-Count--cells-mL--1-forward-button>i').click();
    },500);
    },5000)
    algalRunID++;
}
///////////////////////////////////////////////////////
// Function to add Treemap attributes to map
function runTreeMap(){
  // All attributes collection 
  // Each attribute is an individual image
  // This collection is set up with a time property for future ability to have a time series of TreeMap outputs
  var attrC = ee.ImageCollection('projects/treemap-386222/assets/Final_Outputs/TreeMap_2016');

  // All attributes available
  // This list is currently only used for reference to creat the thematic and continuous lists below
  var attrs = ['ALSTK', 'BALIVE', 'CANOPYPCT', 'CARBON_D', 'CARBON_DWN', 'CARBON_L', 'DRYBIO_D', 'DRYBIO_L', 'FLDSZCD', 'FLDTYPCD', 'FORTYPCD', 'GSSTK', 'QMD_RMRS', 'SDIPCT_RMR', 'STANDHT', 'STDSZCD', 'TPA_DEAD', 'TPA_LIVE', 'VOLBFNET_L', 'VOLCFNET_D', 'VOLCFNET_L'];

  // Set the first layer to visible
  var visible = true;

  // Set up palettes - reverse those we want reversed 
  palettes.cmocean.Tempo[7].reverse();
  palettes.crameri.bamako[50].reverse();
  palettes.crameri.bamako[25].reverse();
  palettes.crameri.lajolla[10].reverse();
  palettes.crameri.imola[50].reverse();
  
  // Set up the thematic and continuous attributes
  // Thematic have a numeric and name field specified - the name field is pulled from the json version 
  // of the attribute table that is brought in when the TreeMap page is initially loaded (./geojson/TreeMap2016.tif.vat.json)
  //var thematicAttrs = [
  //                     ['FORTYPCD','ForTypName','Algorithm Forest Type Name'],
  //                     ['FLDTYPCD','FldTypName','Field Forest Type Name'] 
  //                    ];
  var thematicAttrs = [
                       ['FORTYPCD','ForTypName','FORTYPCD: Algorithm Forest Type Code', 'This is the forest type used for reporting purposes. It is primarily derived using a computer algorithm, except when less than 25 percent of the plot samples a particular forest condition or in a few other cases.'],
                       ['FLDTYPCD','FldTypName','FLDTYPCD: Field Forest Type Code', 'A code indicating the forest type, assigned by the field crew, based on the tree species or species groups forming a plurality of all live stocking. The field crew assesses the forest type based on the acre of forest land around the plot, in addition to the species sampled on the condition.'] 
                      ];

  // Continuous have the syntax: [attribute name, palette, lower stretch percentile, upper stretch percentile, descriptive name]
  // Attributes appear in legend in reverse order from how they appear here
  var continuousAttrs = [
                                                    
                          // volume
                          ['VOLCFNET_L',palettes.crameri.imola[50],0.05,0.95,'VOLCFNET_L: Volume, Live (ft³/acre)', 'Calculated via the following FIA query: Sum VOLCFNET*TPA_UNADJ WHERE (((COND.COND_STATUS_CD)=1) AND ((TREE.STATUSCD)=1))'],
                          ['VOLCFNET_D',palettes.crameri.imola[50],0.05,0.95,'VOLCFNET_D: Volume, Standing Dead (ft³/acre)', 'Calculated via the following FIA query: Sum VOLCFNET*TPA_UNADJ WHERE (((COND.COND_STATUS_CD)=1) AND ((TREE.STATUSCD)=2) AND ((TREE.DIA)>=5) AND ((TREE.STANDING_DEAD_CD)=1))'],
                          ['VOLBFNET_L',palettes.crameri.imola[50],0.05,0.95,'VOLBFNET_L: Volume, Live (sawlog-board-ft/acre)', 'Calculated via the following FIA query: Sum VOLBFNET * TPA_UNADJ WHERE (((TREE.TREECLCD)=2) AND ((COND.COND_STATUS_CD)=1) AND ((TREE.STATUSCD)=1))'],
                          
                          // trees per acre
                          ['TPA_DEAD',palettes.crameri.bamako[10],0.25,0.7,'TPA_DEAD: Dead Trees Per Acre', 'Number of dead standing trees per acre (DIA >= 5”). Calculated via the following FIA query: Sum TREE.TPA_UNADJ WHERE (((COND.COND_STATUS_CD)=1) AND ((TREE.STATUSCD)=2) AND ((TREE.DIA)>=5) AND ((TREE.STANDING_DEAD_CD)=1))'],
                          ['TPA_LIVE',palettes.crameri.bamako[25],0.2,0.8,'TPA_LIVE: Live Trees Per Acre', 'Number of live trees per acre (DIA > 1"). Calculated via the following FIA query: Sum TREE.TPA_UNADJ WHERE (((COND.COND_STATUS_CD)=1) AND ((TREE.STATUSCD)=1) AND ((TREE.DIA)>=1))'],
                          
                          // dry biomass
                          ['DRYBIO_D',palettes.crameri.lajolla[25],0.1,0.9,'DRYBIO_D: Dry Standing Dead Tree Biomass, Above Ground (tons/acre)', 'Calculated via the following FIA query: Sum (DRYBIO_BOLE, DRYBIO_TOP, DRYBIO_STUMP, DRYBIO_SAPLING, DRYBIO_WDLD_SPP) /2000*TPA_UNADJ WHERE (((COND.COND_STATUS_CD)=1) AND ((TREE.STATUSCD)=2) AND ((TREE.DIA)>=5) AND ((TREE.STANDING_DEAD_CD)=1))'],
                          ['DRYBIO_L',palettes.crameri.lajolla[10],0.05,0.95,'DRYBIO_L: Dry Live Tree Biomass, Above Ground (tons/acre)', 'Dry Live Tree Biomass, Above Ground. Calculated via the following FIA query: Sum (DRYBIO_BOLE, DRYBIO_TOP, DRYBIO_STUMP, DRYBIO_SAPLING, DRYBIO_WDLD_SPP) /2000*TPA_UNADJ WHERE (((COND.COND_STATUS_CD)=1) AND ((TREE.STATUSCD)=1))'],
                          
                          // carbon
                          ['CARBON_D',palettes.crameri.lajolla[25],0.05, 0.95,'CARBON_D: Carbon, Standing Dead (tons/acre)', 'Calculated via the following FIA query: Sum (DRYBIO_BOLE, DRYBIO_TOP, DRYBIO_STUMP, DRYBIO_SAPLING, DRYBIO_WDLD_SPP) / 2 /2000*TPA_UNADJ WHERE (((COND.COND_STATUS_CD)=1) AND ((TREE.STATUSCD)=2) AND ((TREE.DIA)>=5) AND ((TREE.STANDING_DEAD_CD)=1))'],
                          ['CARBON_DWN',palettes.crameri.lajolla[25],0.05, 0.95,'CARBON_DWN: Carbon, Down Dead (tons/acre)', 'Carbon (tons per acre) of woody material >3 inches in diameter on the ground, and stumps and their roots >3 inches in diameter. Estimated from models based on geographic area, forest type, and live tree carbon density (Smith and Heath 2008).'],
                          ['CARBON_L',palettes.crameri.lajolla[10],0.05, 0.95,'CARBON_L: Carbon, Live Above Ground (tons/acre)', 'Calculated via the following FIA query: Sum (DRYBIO_BOLE, DRYBIO_TOP, DRYBIO_STUMP, DRYBIO_SAPLING, DRYBIO_WDLD_SPP) / 2 /2000*TPA_UNADJ WHERE (((COND.COND_STATUS_CD)=1) AND ((TREE.STATUSCD)=1))'],
                          
                          // stand density
                          ['QMD_RMRS',palettes.crameri.bamako[25],0.05,0.95,'QMD_RMRS: Stand Quadratic Mean Diameter (in)', 'Rocky Mountain Research Station. The quadratic mean diameter, or the diameter of the tree of average basal area, on the condition. Based on live trees ≥1.0 inch d.b.h./d.r.c. Only collected by certain FIA work units.'],
                          ['SDIPCT_RMR',palettes.crameri.bamako[25],0.05,0.95,'SDIPCT_RMRS: Stand Density Index (percent of maximum)', 'Rocky Mountain Research Station. A relative measure of stand density for live trees (≥1.0 inch d.b.h./d.r.c.) on the condition, expressed as a percentage of the maximum stand density index (SDI). Only collected by certain FIA work units.'],
                        
                          // live tree variables
                          ['STANDHT',palettes.crameri.bamako[50],0.1,0.90,'STANDHT: Height of Dominant Trees (ft)', 'Derived from the Forest Vegetation Simulator.'],
                          ['BALIVE',palettes.crameri.bamako[50],0.05,0.95,'BALIVE: Live Tree Basal Area (ft²)', 'Basal area in square feet per acre of all live trees ≥1.0 inch d.b.h./d.r.c. sampled in the condition.'] 
                        ];

  var ordinalAttrs = [
                          
                          ['STDSZCD',palettes.custom.standsize[4],0,1,'STDSZCD: Algorithm Stand-Size Class Code', 'A classification of the predominant (based on stocking) diameter class of live trees within the condition assigned using an algorithm.'], // ranges from 1-5
                          ['FLDSZCD',palettes.custom.fieldsize[6],0,1,'FLDSZCD: Field Stand-Size Class Code', 'Field-assigned classification of the predominant (based on stocking) diameter class of live trees within the condition.'], // ranges from 0-5

  ]

  var percentAttrs = [    // have two attributes: palette and name. default range is 0-100
                          ['GSSTK',palettes.crameri.bamako[50],'GSSTK: Growing-Stock Stocking (percent)', 'The sum of stocking percent values of all growing-stock trees on the condition.'],
                          ['ALSTK',palettes.crameri.bamako[50],'ALSTK: All-Live-Tree Stocking (percent)', 'The sum of stocking percent values of all live trees on the condition.'],
                          ['CANOPYPCT',palettes.crameri.bamako[50],'CANOPYPCT: Live Canopy Cover (percent)', 'Derived from the Forest Vegetation Simulator.'],

  ]       
  
// Function to get a thematic attribute image service  
function getThematicAttr_Colors(attr){
  // Pull the attribute image
  var attrImg = attrC.filter(ee.Filter.eq('attribute',attr[0])).first();

  // Get the numbers and names from the attribute table
  var numbers = treeMapLookup[attr[0]];
  var names = treeMapLookup[attr[1]];

  // Zip the numbers to the names, find the unique pairs and sort them
  var zippedValuesNames = unique(zip(numbers,names));
  zippedValuesNames.sort();

  // Pull apart the sorted unique pairs
  var uniqueValues = zippedValuesNames.map(r=>r[0]);
  var uniqueNames = zippedValuesNames.map(r=>r[1]);

  // Set up visualization parameters
  var viz = {};

  // First set up a dictionary so when user queries pixel, the name is returned instead of the value
  viz['queryDict'] = dict(zippedValuesNames);

  // Set the min and max value for the renderer
  viz['min'] = uniqueValues[0];
  viz['max'] = uniqueValues[uniqueValues.length-1];
  
  // Get all the unique colors for the legend and colors with blanks as black in the palette 
  let colors = []
  let palette = []

  range(viz['min'],viz['max']+1).map(i=>{
    if(uniqueValues.indexOf(i)>-1){ 
      var valueNameT = uniqueNames[uniqueValues.indexOf(i)];
      var nameIndex = forestTypeLookup.names.indexOf(valueNameT);
      c = forestTypeLookup.palette[nameIndex];             // refers to forest type palette .json brought in in html

      // If the hex color starts with a #, remove the #
      if(c[0] === '#'){
        c = c.slice(1);
      }
      colors.push(c);
      palette.push(c);
    }else{
      palette.push('000');
  }

});

  // Specify the palette and the legend dictionary with the unique names and colors
  viz['palette']=palette;
  viz['classLegendDict'] = dict(zip(uniqueNames,colors));
  viz['title']=`${attr[2]} || ${attr[3]}`;
  
  // Add the layer to the map
  Map2.addLayer(attrImg,viz,attr[2],visible);

  //Set so subsequent layers are not visible by default
  visible = false;
}                

  // Function to get a continuous attribute image service
  function getContinuousAttr(attr){
    // Pull the attribute image
    var attrImg = attrC.filter(ee.Filter.eq('attribute',attr[0])).first();

    // Get the numbers and unique numbers for that attribute
    var numbers = treeMapLookup[attr[0]];
    var uniqueValues = asc(unique(numbers));

    // Filter out any value that is non RMRS (-99)
    uniqueValues = uniqueValues.filter(n=>n!==-99);

    // Set up renderer
    var viz = {};
    
    // Compute the nth percentile for the min max
    viz['min'] = parseInt(quantile(uniqueValues,attr[2]));
    viz['max'] = parseInt(quantile(uniqueValues,attr[3]));
    viz['palette'] = attr[1];
    viz['title']=`${attr[4]} || ${attr[5]}`;
    Map2.addLayer(attrImg,viz,attr[4],false);
  }

    // function to apply unique values to Ordinal attribute
    function getOrdinalAttr(attr){

      // Pull the attribute image
      var attrImg = attrC.filter(ee.Filter.eq('attribute',attr[0])).first();
  
      // Get the numbers and unique numbers for that attribute
      var numbers = treeMapLookup[attr[0]];
      var uniqueValues = asc(unique(numbers));
  
      // Filter out any value that is non RMRS (-99)
      uniqueValues = uniqueValues.filter(n=>n!==-99);
  
      // Set up renderer
      var viz = {};
      
      // Compute the nth percentile for the min max
      viz['min'] = parseInt(quantile(uniqueValues,attr[2]));
      viz['max'] = parseInt(quantile(uniqueValues,attr[3]));
      viz['palette'] = attr[1];
      
      // set up legend - for values and palette
        // Remove '000000' values from palette
      var removed_nulls_palette = removeItemAll(JSON.parse(JSON.stringify(attr[1])), '000000')
      console.log(removed_nulls_palette)
      viz['classLegendDict'] = dict(zip(uniqueValues,removed_nulls_palette));
      viz['title']=`${attr[4]} || ${attr[5]}`;
      
      Map2.addLayer(attrImg,viz,attr[4],false);
    }

    // Removes all items of a given value from an array
    function removeItemAll(arr, value) {
      var i = 0;
      while (i < arr.length) {
        if (arr[i] === value) {
          arr.splice(i, 1);
        } else {
          ++i;
        }
      }
      return arr;
    }

  // function to apply to show percentage attributes as a range from 0-100
  function getPercentAttr(attr){

    // Pull the attribute image
    var attrImg = attrC.filter(ee.Filter.eq('attribute',attr[0])).first();

    // Get the numbers and unique numbers for that attribute
    var numbers = treeMapLookup[attr[0]];
    var uniqueValues = asc(unique(numbers));

    // Filter out any value that is non RMRS (-99)
    uniqueValues = uniqueValues.filter(n=>n!==-99);

    // Set up renderer
    var viz = {};
    
    // Compute the nth percentile for the min max
    viz['min'] = 0;
    viz['max'] = 100;
    viz['palette'] = attr[1];
    viz['title']=`${attr[2]} || ${attr[3]}`;
    Map2.addLayer(attrImg,viz,attr[2],false);

  }

  // Function to get a continuous attribute image service and use standard deviation as the min/max
  function getContinuousAttrSD(attr){
    // Pull the attribute image
    var attrImg = attrC.filter(ee.Filter.eq('attribute',attr[0])).first();

    // Get the numbers and unique numbers for that attribute
    var numbers = treeMapLookup[attr[0]];
    var uniqueValues = asc(unique(numbers));

    // Filter out any value that is non RMRS (-99)
    uniqueValues = uniqueValues.filter(n=>n!==-99);

    // Set up renderer
    var viz = {};
    
    // Compute the SD spread for the min max
    var sd_n = parseFloat(attr[2]);
    var median_n = parseFloat(quantile(uniqueValues, .5));
    var mean_n = parseInt(mean(uniqueValues))


    viz['min'] = 0;
    viz['max'] = mean_n;
    //viz['min'] = 0;
    //viz['max'] = parseInt(uniqueValues.median());
    viz['palette'] = attr[1];
    viz['title']=`${attr[3]} (${attr[0]}) attribute image layer`;
    Map2.addLayer(attrImg,viz,attr[3],false);
  }

  // Add each ordinal attribute to the map
  ordinalAttrs.map(getOrdinalAttr);

  // Add each continuous attribute to the map
  continuousAttrs.map(getContinuousAttr);
  
  // Add each percent attribute to the map
  percentAttrs.map(getPercentAttr)

  // Iterate across each thematic attribute and bring it into the map
  thematicAttrs.map(getThematicAttr_Colors);

  
  // Function to convert json TreeMap lookup to a query-friendly format
  // Makes a dictionary for each CN that has an html table of all attributes
  function makeTreeMapQueryLookup(){
    let values = treeMapLookup.Value;
    let keys = Object.keys(treeMapLookup).filter(k=>k!=='Value');
    let queryDict = {};

    for (var i=0;i<values.length;i++){
      let value = treeMapLookup.Value[i];
      let t = '<ul>';
      keys.map(k=>{
        let v = treeMapLookup[k][i];
        if(!!(v % 1)){
          v = v.toFixed(4);
        }
        t+=`<tr><th>${k}</th><td>${v}</td></tr>`
      });
      t+='</ul>'
      queryDict[value]=t
    }
    return queryDict
  }
  rawQueryDict= makeTreeMapQueryLookup();

  // Bring in raw TreeMap layer and add it to the map
  rawTreeMap = attrC.filter(ee.Filter.eq('attribute','Value')).first();//ee.Image('projects/lcms-292214/assets/CONUS-Ancillary-Data/TreeMap_RDS_2016');
  
  Map2.addLayer(rawTreeMap.randomVisualizer(),{queryDict:rawQueryDict,addToLegend:false,opacity:0,title: `Raw TreeMap Identifier dataset values. This dataset is useful to see spatial groupings of individual modeled plot values. When queried, all attributes are provided for the queried pixel.`},'TreeMap ID')
  
  queryWindowMode = 'sidePane';
  $('#query-label').click();
}
///////////////////////////////////////////////////////////
// Sequoia run function
if(mode === 'sequoia-view'){
  var seq_mon_query_clicked=false;
  var site_highlights_dict = {};
  var exports;
}
function runSequoia(){
  // First get a unique id url with all the parameters used to make the outputs
  TweetThis(preURL='',postURL='',openInNewTab=false,showMessageBox=false,onlyURL=true);
  
  // Empty any existing table if it exists and add a spinner to let user know the table is being computed
  $('#table-collapse-div').empty();
  $('#table-collapse-div').append(`<div id="sequoia-mon-loading-div" style="">
  <p>
    <img style="width:2rem;" class="image-icon fa-spin mr-1" alt="Google Earth Engine logo spinner" src="images/GEE_logo_transparent.png">
    Summarizing Giant Sequoia Monitoring Sites
   </p>
  </div>`);

  // Callback function that gets run after getImagesLib js is loaded
  function runSequoiaLibLoadedCallback(){
    // Make the default GEE Playground scripts exports object name shortened version of getImagesLib - gil
    var gil = exports;

    // Pull in date params
    var preStartYear =parseInt(urlParams.preStartYear),
    preEndYear=parseInt(urlParams.preEndYear),
    postYear=parseInt(urlParams.postYear),
    startJulian=parseInt(urlParams.startJulian),
    endJulian =parseInt(urlParams.endJulian);

    // Format julian days to MM/dd syntax
    startJulianFormatted = formatDTJulian(Date.fromDayofYear(startJulian));//ee.Date.parse('YYYY-DDD',`2003-${startJulian}`).format('MM/dd').getInfo()
    endJulianFormatted = formatDTJulian(Date.fromDayofYear(endJulian));//ee.Date.parse('YYYY-DDD',`2003-${endJulian}`).format('MM/dd').getInfo()

    //Send run event for Google Analytics
    ga('send', 'event', 'sequoia-view-run', 'date_params', `${preStartYear}-${preEndYear}__${postYear}__${startJulianFormatted}-${endJulianFormatted}`);
    // Bring in the monitoring sites
    var monitoring_sites = ee.FeatureCollection('projects/gtac-lamda/assets/giant-sequoia-monitoring/Inputs/Trees_of_Special_Interest');
    
    // Bring in the TCH NAIP-based change outputs for projection and snap raster
    var tchC = ee.ImageCollection('projects/gtac-lamda/assets/giant-sequoia-monitoring/Inputs/TCH')  
        .filter(ee.Filter.stringContains('system:index','v3shadows_extract_gfch'))
    
    var projection = tchC.first().projection().getInfo()
    crs = projection.crs;
    transform = projection.transform;
    scale=null;
    plotRadius=transform[0]/2.;

    // Make studyArea 
    // Hard coded to the bounds of the monitoring sites unless someone defines the urlParam useMapBoundsAsStudyArea
    var studyArea;
    if(urlParams.useMapBoundsAsStudyArea === undefined || urlParams.useMapBoundsAsStudyArea !== true){
      studyArea = monitoring_sites.geometry().bounds(500,crs)
    }else{
      studyArea = eeBoundsPoly;
    }
    
    // Center on study area if no previous stored map view is found
    if(localStorage.settings ===undefined){
      centerObject(studyArea)
    }

    var tdomBuffer = 1;
    if(urlParams.cloudMaskMethod['CloudScore+']){tdomBuffer = 0}
    // Get S2 images for union of date periods
    var s2s = gil.getProcessedSentinel2Scenes({studyArea:studyArea,
      startYear:preStartYear-tdomBuffer,
      endYear:postYear+tdomBuffer,
      startJulian:startJulian,endJulian:endJulian,
      convertToDailyMosaics : false,
      applyTDOM:urlParams.cloudMaskMethod['S2Cloudless-TDOM'],
      applyCloudScorePlus:urlParams.cloudMaskMethod['CloudScore+'],
      applyCloudProbability:urlParams.cloudMaskMethod['S2Cloudless-TDOM']
    });
    
    // Filter out pre and post images
    var preS2s = s2s.filter(ee.Filter.calendarRange(preStartYear,preEndYear,'year'));
    var postS2s = s2s.filter(ee.Filter.calendarRange(postYear,postYear,'year'));
    
    // Compute median composites and their difference
    var preComp = preS2s.median();
    var postComp = postS2s.median();
    var compDiff = postComp.subtract(preComp);
    
    // Pull in the change heuristic params
    var changeBands = Object.keys(urlParams.diffThreshs);
    var changeThresholds = Object.values(urlParams.diffThreshs);

    // Define which monitoring sites table fields to include in output table and which to use as label for mouse hover on a table row
    var monitoringSitesPropertyNames = ['Tree_Name','Status','Grove'];
    var labelProperty = 'Tree_Name';

    // Pull in the LCMS land cover classes to be included in the tree mask
    var lcms_land_cover_tree_classes = Object.values(lcmsTreeMaskClasses).insert(1,false).map((e,i)=>{return [i+1,e]}).filter(row=>row[1]).map(n=>n[0]);
    
    // If no LCMS tree classes are selected, don't apply the mask
    var applyLCMSTreeMask = true;
    if(lcms_land_cover_tree_classes.length === 0){
      applyLCMSTreeMask = false;
    }
    
    // Get the LCMS tree mask if any LCMS tree classes are selected
    if(applyLCMSTreeMask){
      var lcmsTreeMask = ee.ImageCollection('USFS/GTAC/LCMS/v2022-8')
                    .filter(ee.Filter.calendarRange(preStartYear-1,postYear,'year'))
                    .select(['Land_Cover'])
                    .map(img=>img.eq(lcms_land_cover_tree_classes)).max().reduce(ee.Reducer.max())
    
      Map2.addLayer(lcmsTreeMask.selfMask(),{palette:'0A0',classLegendDict:{'LCMS Tree Mask':'0A0'}},'LCMS Tree Mask',false);
    
    }
    
    // Make band names so pre, post, and diff can be stacked
    var preBns = preComp.select(changeBands).bandNames().map( bn=>ee.String(bn).cat(`_Comp_Pre`));
    var postBns = postComp.select(changeBands).bandNames().map( bn=>ee.String(bn).cat(`_Comp_Post`));
    var diffBns = compDiff.select(changeBands).bandNames().map( bn=>ee.String(bn).cat(`_Comp_Diff`));
    
    // Set up download name
    let tableDownloadName = `Giant_Sequoia_Monitoring_Sites_Sentinel2_Change_Table_pre${preStartYear}-${preEndYear}__post${postYear}_dates${startJulianFormatted}-${endJulianFormatted}`;

    // Apply change thresholds by bands specified
    var changeHeuristic = compDiff.select(changeBands).lt(changeThresholds).reduce(ee.Reducer.mode()).rename(['Potential_Loss']);
    
    // Stack all bands to be included in table
    var stack = ee.Image.cat([preComp.select(changeBands).rename(preBns),
                              postComp.select(changeBands).rename(postBns),
                              compDiff.select(changeBands).rename(diffBns),changeHeuristic])
    if(applyLCMSTreeMask){
      stack = stack.updateMask(lcmsTreeMask);
    }
                              
    
    // Compute the mean for the radius of a Giant Sequoia for each site
    stack.focalMean(urlParams.treeDiameter/2.,'circle','meters').reduceRegions(
      monitoring_sites,
      ee.Reducer.first(), 
      null, 
      crs,
      transform, 
     4).evaluate((t,failure)=>{
      console.log(failure)
      console.log('Finished summarizing monitoring sites')
      // showMessage('Finished summarizing monitoring sites',JSON.stringify(t))

      //Set up output table
      $('#table-collapse-div').append(`<div id = "monitoring-sites-table-container">
									<table
									class="table table-hover report-table"
									id="monitoring-sites-table"
									role="tabpanel"
									tablename="Giant Sequoia Monitoring Sites"
                  title="Double click on any row to zoom to location on map"
									></table>
								</div>`);

      // Find the property names of only the spectral bands
      var spectralProps = Object.keys(t.features[0].properties).filter(p=>changeBands.indexOf(p.split('_')[0])>-1);
      
      // The location properties
      var locProps = ['Longitude','Latitude'];
      
      // Concat all column names for the header
      var allProps = monitoringSitesPropertyNames.concat(['Potential_Loss']).concat(spectralProps).concat(locProps)
      
      // Add in the table header
      $(`#monitoring-sites-table`).append(`<thead><tr class = ' highlights-table-section-title' id='mon-sites-table-header'></tr></thead>`);

      // Add columns within the header for each of the props concatenated above
      allProps.map(prop=>{
        $('#mon-sites-table-header').append(`<td class = 'highlights-entry '>${prop.replaceAll('_',' ')}</td>`)
      })

      // Set up hover icon
      const svgMarker = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "#FF834C",
        fillOpacity: 0.2,
        strokeWeight: 1,
        strokeColor:'#FF834C',
        scale:10
      };
      var monSiteMarker = new google.maps.Marker({icon:svgMarker});

      var siteID = 1;

      // Iterate across each feature and set up the table row
      t.features.map(f=>{
        var rowID = `seq-mon-site-${siteID}`
        $(`#monitoring-sites-table`).append(`<tr class = 'highlights-row' id='${rowID}'></tr>`);
        
        // Add the props of the site itself
        monitoringSitesPropertyNames.map(prop=>{
          $(`#${rowID}`).append(`<td class = 'highlights-entry '>${f.properties[prop]}</td>`);
        });
        var potLossDict={null:'',0:'No',1:'Yes'}
        // Add in the potential loss column value
        var potLossV = f.properties['Potential_Loss'];
        // if(potLossV===null){potLossV=''}
        $(`#${rowID}`).append(`<td class = 'highlights-entry '>${potLossDict[potLossV]}</td>`);

        // Add any spectral properties
        spectralProps.map(prop=>{
          var v = f.properties[prop];
          if(v===null){v=''}
          else{v=parseFloat(v.toFixed(4))}
          $(`#${rowID}`).append(`<td class = 'highlights-entry '>${v}</td>`);
        });

        // Add the location properties
        locProps.map(prop=>{
          var v = f.properties[prop];
          $(`#${rowID}`).append(`<td class = 'highlights-entry '>${v}</td>`);
        });

        // Set up the location and label for hover and double click events on the table
        site_highlights_dict[rowID] = [f.properties.Longitude,f.properties.Latitude,f.properties[labelProperty]];

        siteID++;
      });

      // Once the table is loaded, set up listeners for table to map behaviors
      $(document).ready(()=>{

        
        // As the mouse moves over the table, set a marker and label at that location on the map
        $("#monitoring-sites-table").on('mousemove', 'tr', function (e) {
          try{
            var loc = site_highlights_dict[e.currentTarget.id];
          monSiteMarker.setPosition({ lat: loc[1], lng: loc[0] });
          monSiteMarker.setLabel({text: loc[2], color: "#FFF",fontSize: '0.9rem',className:'gm-marker-label'})
          monSiteMarker.setMap(map);
          }catch(err){
            monSiteMarker.setMap(null);
          }
      });
      // Any time the mouse leaves the table, get rid of any marker
      $("#monitoring-sites-table").on('mouseleave', 'tr', function (e) {
        monSiteMarker.setMap(null);
       });

       // When the table row is double clicked, zoom there on the map
       $("#monitoring-sites-table").on('dblclick', 'tr', function (e) {
        var loc = site_highlights_dict[e.currentTarget.id];
        map.setCenter({ lat: loc[1], lng: loc[0] });
        map.setZoom(18);
       });
       
       // Cast the datatable as a DataTable object
          $(`#monitoring-sites-table`).DataTable({
            // fixedHeader: true,
          paging: false,
          searching: true,
          order: [3],
          responsive:true,
          dom: 'Bfrtip',
          buttons: [
            // {
            // 	extend: 'colvis',
            // 	title: 'Data export'
            // },
            {
              extend: 'copyHtml5',
              title: tableDownloadName,
              messageBottom: `Source: ${fullShareURL}`
            },
            {
              extend: 'csvHtml5',
              title: tableDownloadName,
              messageBottom: `Source: ${fullShareURL}`
            },
            {
              extend: 'excelHtml5',
              title: tableDownloadName,
              messageBottom: `Source: ${fullShareURL}`
            },
            {
              extend: 'pdfHtml5',
              title: tableDownloadName,
              messageBottom: `Source: ${fullShareURL}`
            },
            {
              extend: 'print',
              title: tableDownloadName,
              messageBottom: `Source: ${fullShareURL}`
            },
          ] 
        });
        // Change appearance of table container
        $(`#monitoring-sites-table-container`).addClass(`bg-white highlights-table`);
        
        // Set hover text
        $('.dt-buttons.btn-group.flex-wrap').prop('title','Download this table to any of these formats for local/offline use');
        $('#monitoring-sites-table_filter').prop('title','Filter named Giant Sequoias here');
        // Hide the table loading spinner
        $('#sequoia-mon-loading-div').hide();
      
        // Listen for downloading of table and log event
        $('#monitoring-sites-table_wrapper>div.dt-buttons>button.buttons-html5 ').on('click',(e)=>{
          ga('send','event','sequoia-monarch-table-download', e.target.innerText,tableDownloadName);
         });
        });
     });
    
    // Bring in MTBS data : start MTBS data in 2012 at onset of 2012-2016 drought period
    var mtbs = ee.ImageCollection("USFS/GTAC/MTBS/annual_burn_severity_mosaics/v1")
    .filter(ee.Filter.calendarRange(preStartYear-5,postYear,'year'))
    .map(img=>{
      return img.updateMask(img.gte(2).and(img.lte(4)))
    })
    var mtbsYr = mtbs.map(img=>{
    return ee.Image(img.date().get('year')).updateMask(img).int16()
    }).max();

    // Bring in SEKI assets as FeatureCollections
    var sekiNorthTAO = ee.FeatureCollection('projects/gtac-lamda/assets/giant-sequoia-monitoring/Ancillary/SEKI_NORTH_2016_SPECIES_AND_MORTALITY_V7_TAO_SEGI');
    var sekiLiveTrees = ee.FeatureCollection('projects/gtac-lamda/assets/giant-sequoia-monitoring/Ancillary/SEKI_VEG_SequoiaTrees_pt_Alive');
    var tharpsSequoias = ee.FeatureCollection('projects/gtac-lamda/assets/giant-sequoia-monitoring/Ancillary/Tharps_Burn_Project_Sequoias');
    var sierraGroves = ee.FeatureCollection('projects/gtac-lamda/assets/giant-sequoia-monitoring/Ancillary/VEG_SequoiaGroves_Public_py');

    // Add MTBS layers to Reference data
    Map2.addLayer(mtbs.count(),{min:1,max:4,palette:'BD1600,E2F400,0C2780'},`MTBS Burn Count ${preStartYear-5}-${postYear}`,false,null,null,`Number of mapped MTBS burns from ${preStartYear-5} to ${postYear} with low, moderate, or high severity`,'reference-layer-list');
    Map2.addLayer(mtbsYr,{min:preStartYear-5,max:postYear,palette:'ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02'},`MTBS Most Recent Burn Year ${preStartYear-5}-${postYear}`,false,null,null,`Most recent mapped MTBS burn from ${preStartYear-5} to ${postYear} with low, moderate, or high severity`,'reference-layer-list');
    Map2.addLayer(mtbs.max(),{min:2,max:4,palette:'7fffd4,FF0,F00',queryDict:{2:'Low',3:'Moderate',4:'High'},classLegendDict:{'Low':'7fffd4','Moderate':'FF0','High':'F00'}},`MTBS Max Severity ${preStartYear-5}-${postYear}`,false,null,null,`Highest severity mapped MTBS burn from ${preStartYear-5} to ${postYear} with low, moderate, or high severity`,'reference-layer-list');
    
    // Add SEKI vector layers to Reference Data
    Map2.addLayer(sierraGroves,{strokeColor:'953822','layerType':'geeVector'},`Sequoia Groves of the Sierra Nevada`,false,null,null,null,'reference-layer-list'); //{'strokeColor':'953822'} =dark reddish brown
    Map2.addLayer(sekiNorthTAO,{strokeColor:'10755c'},`Tree Approximate Objects (TAO)`,false,null,null,`LiDAR-derived TAO for SEKI north; SEGI trees only.`,'reference-layer-list'); //{'strokeColor':'10755c'} =dark teal
    Map2.addLayer(sekiLiveTrees.map(f=>{return ee.Feature(f).buffer(urlParams.treeDiameter/2.)}),{strokeColor:'85bd04'},`SEKI Live Sequoia Trees`,false,null,null,`Sequoia trees from the Sequoia and Kings Canyon National Parks (SEKI) Sequoia Tree Inventory Project (STI).`,'reference-layer-list',false); //'strokeColor':'85bd04'=light green
    Map2.addLayer(tharpsSequoias.map(f=>{return ee.Feature(f).buffer(urlParams.treeDiameter/2.)}),{strokeColor:'eb7a38'},`Tharps Burn Project Sequoias`,false,null,null,`SEGI trees of the Tharps Burn Project`,'reference-layer-list'); // {'strokeColor':'eb7a38'} =orange

    // Add the analysis layers to the map
    Map2.addLayer(preComp,urlParams.compVizParams,`Pre Composite ${preStartYear}-${preEndYear} ${startJulianFormatted}-${endJulianFormatted}`,false);
    Map2.addLayer(postComp,urlParams.compVizParams,`Post Composite ${postYear} ${startJulianFormatted}-${endJulianFormatted}`,false);
    
    Map2.addLayer(compDiff,urlParams.diffVizParams,'Pre-Post Composite',false)

    var changeHeuristicForMap = changeHeuristic.selfMask();
    if(applyLCMSTreeMask){
      changeHeuristicForMap =changeHeuristicForMap.updateMask(lcmsTreeMask);
    }
    Map2.addLayer(changeHeuristicForMap,{palette:'E20',classLegendDict:{'Loss':'E20'},queryDict:{1:'Yes','null':'No'}},`Potential Loss ${preStartYear}-${preEndYear} to ${postYear}`);

    Map2.addLayer(monitoring_sites.map(f=>{return ee.Feature(f).buffer(urlParams.treeDiameter/2.)}),{'strokeColor':'FF0','layerType':'geeVector'},'Monitoring Sites',true,null,null,'Trees of special interest');
           
    Map2.addLayer(studyArea,{},'Study Area',false);

    if(urlParams.canExport){
      var exportBands = ['blue','green','red','nir','swir1','swir2'];
      changeBands.map(bn=>{
        if(exportBands.indexOf(bn)===-1){
          exportBands.push(bn);
        };
        
      });
      Map2.addExport(preComp.select(exportBands).multiply(10000).int16(),`S2_Composite_yrs${preStartYear}-${preEndYear}_jds${startJulian}-${endJulian}` ,10,true,{});
      Map2.addExport(postComp.select(exportBands).multiply(10000).int16(),`S2_Composite_yr${postYear}_jds${startJulian}-${endJulian}` ,10,true,{});
      Map2.addExport(compDiff.select(exportBands).multiply(10000).int16(),`S2_Composite_Diff_preYrs${preStartYear}-${preEndYear}_postYr${postYear}_jds${startJulian}-${endJulian}` ,10,true,{});
      Map2.addExport(changeHeuristicForMap.byte(),`S2_Change_preYrs${preStartYear}-${preEndYear}_postYr${postYear}_jds${startJulian}-${endJulian}` ,10,true,{},255);
    }

    if(!seq_mon_query_clicked){
      localStorage.showToolTipModal = 'false';
      $('#query-label').click();
      seq_mon_query_clicked=true;
    }
  }

  // If getImagesLib exports object doesn't exist yet, load it and call the callback once loaded
  // If it's already loaded, just call the callback
  if(exports===undefined){
    loadJS("./js/getImagesLib.js", true,runSequoiaLibLoadedCallback);
  }else{
    runSequoiaLibLoadedCallback();
  }
  
  
  
}