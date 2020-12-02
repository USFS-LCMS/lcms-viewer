//Function to combine LCMS change outputs based on the highest confidence
//Can handle each modeled output as a band or individual image using the format param
//Format can equal 'stack' or 'collection'
function combineChange(changeC,year,gain_thresh,slow_loss_thresh,fast_loss_thresh,format,mult){
  year = ee.Number(year).int16();
  
  // print('here')
  if(format !== 'stack'){
      changeC = changeC.filter(ee.Filter.eq('year',year));
    var gain = changeC.filter(ee.Filter.eq('model','RNR')).mosaic();
    var slowLoss = changeC.filter(ee.Filter.eq('model','DND_Slow')).mosaic();
    var fastLoss = changeC.filter(ee.Filter.eq('model','DND_Fast')).mosaic();
    var stack = ee.Image.cat([gain,slowLoss,fastLoss]);

  }else{
    var stack = changeC.filter(ee.Filter.calendarRange(year,year,'year')).mosaic().select(['RNR','DND_Slow','DND_Fast']);
  } 
  stack = stack.multiply(mult);
  var maxConf = stack.reduce(ee.Reducer.max());
  var maxConfMask = stack.eq(maxConf).and(stack.gte(ee.Image([gain_thresh,slow_loss_thresh,fast_loss_thresh]))).selfMask();
  var yearMask = ee.Image([year,year,year]).updateMask(maxConfMask).int16();
  // stack = stack.updateMask(maxConfMask)
  var out = ee.Image.cat([stack,maxConfMask, yearMask]).rename(['Gain_Prob','Slow_Loss_Prob','Fast_Loss_Prob','Gain_Mask','Slow_Loss_Mask','Fast_Loss_Mask','Gain_Year','Slow_Loss_Year','Fast_Loss_Year']);
  return out.set('system:time_start',ee.Date.fromYMD(year,6,1).millis())
}
////////////////////////////////////////////////////////////////////////
function runGTAC(){
  startYear = parseInt(urlParams.startYear);
  endYear = parseInt(urlParams.endYear);
  analysisMode = urlParams.analysisMode;
  queryClassDict = {};
  var years = ee.List.sequence(startYear,endYear).getInfo();
  summaryMethod = urlParams.summaryMethod;
  getLCMSVariables();
  // setupDownloads(studyAreaName);
  var clientBoundary = clientBoundsDict.All;
  
  //Bring in assets
  var conusComposites = ee.ImageCollection(studyAreaDict[studyAreaName].conusComposites)//.filter(ee.Filter.calendarRange(startYear,endYear,'year'));
  var conusChange = ee.ImageCollection(studyAreaDict[studyAreaName].conusChange)//.filter(ee.Filter.calendarRange(startYear,endYear,'year'));;
  var conusLC = ee.ImageCollection(studyAreaDict[studyAreaName].conusLC)//.filter(ee.Filter.calendarRange(startYear,endYear,'year'));;
  var conusLU = ee.ImageCollection(studyAreaDict[studyAreaName].conusLU)//.filter(ee.Filter.calendarRange(startYear,endYear,'year'));;
  var conusLT = ee.ImageCollection(studyAreaDict[studyAreaName].conusLT)//.filter(ee.Filter.calendarRange(startYear,endYear,'year'));;
  var conusCCDC = ee.ImageCollection(studyAreaDict[studyAreaName].conusCCDC).filter(ee.Filter.eq('spectral', 'SR'));

  var akComposites = ee.ImageCollection(studyAreaDict[studyAreaName].akComposites)//.filter(ee.Filter.calendarRange(startYear,endYear,'year'));;
  var akChange = ee.ImageCollection(studyAreaDict[studyAreaName].akChange)//.filter(ee.Filter.calendarRange(startYear,endYear,'year'));;
  var akLC = ee.ImageCollection(studyAreaDict[studyAreaName].akLC)//.filter(ee.Filter.calendarRange(startYear,endYear,'year'));;
  var akLU = ee.ImageCollection(studyAreaDict[studyAreaName].akLU)//.filter(ee.Filter.calendarRange(startYear,endYear,'year'));;
  var akLT = ee.ImageCollection(studyAreaDict[studyAreaName].akLT)//.filter(ee.Filter.calendarRange(startYear,endYear,'year'));;
  var akCCDC = ee.ImageCollection(studyAreaDict[studyAreaName].akCCDC);

  var minGainProb = [studyAreaDict[studyAreaName].conusGainThresh,studyAreaDict[studyAreaName].akGainThresh].min();
  var minSlowLossProb = [studyAreaDict[studyAreaName].conusSlowLossThresh,studyAreaDict[studyAreaName].akSlowLossThresh].min();
  var minFastLossProb = [studyAreaDict[studyAreaName].conusFastLossThresh,studyAreaDict[studyAreaName].akFastLossThresh].min();

  //Bring in composites
  var composites = ee.ImageCollection(conusComposites).merge(ee.ImageCollection(akComposites));

  composites = ee.ImageCollection(ee.List.sequence(startYear,endYear,1).map(function(yr){
    return simpleGetTasseledCap(simpleAddIndices(composites.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis()),1));
  }));


var combinedChange = ee.ImageCollection(years.map(function(yr){

  var akCombined = combineChange(akChange,yr,studyAreaDict[studyAreaName].akGainThresh,studyAreaDict[studyAreaName].akSlowLossThresh,studyAreaDict[studyAreaName].akFastLossThresh,'stack',0.01);

  var conusCombined = combineChange(conusChange,yr,studyAreaDict[studyAreaName].conusGainThresh,studyAreaDict[studyAreaName].conusSlowLossThresh,studyAreaDict[studyAreaName].conusFastLossThresh,'collection',0.01);
  return ee.ImageCollection([akCombined,conusCombined]).mosaic().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis())
  
  }));
  // printEE(combinedChange)
// if(summaryMethod)
if(summaryMethod === 'year'){
  var combinedGain = combinedChange.select(['Gain.*']).qualityMosaic('Gain_Year');
  var combinedSlowLoss = combinedChange.select(['Slow_Loss_.*']).qualityMosaic('Slow_Loss_Year');
  var combinedFastLoss = combinedChange.select(['Fast_Loss_.*']).qualityMosaic('Fast_Loss_Year');
}else{
  var combinedGain = combinedChange.select(['Gain.*']).qualityMosaic('Gain_Prob');
  var combinedSlowLoss = combinedChange.select(['Slow_Loss_.*']).qualityMosaic('Slow_Loss_Prob');
  var combinedFastLoss = combinedChange.select(['Fast_Loss_.*']).qualityMosaic('Fast_Loss_Prob');
}

Map2.addLayer(combinedSlowLoss.select(['Slow_Loss_Year']).set('bounds',clientBoundary),{min: startYear, max: endYear, palette: declineYearPalette},'Slow Tree Loss Year')

if(analysisMode === 'advanced'){
  Map2.addLayer(combinedSlowLoss.select(['Slow_Loss_Prob']).updateMask(combinedSlowLoss.select(['Slow_Loss_Year']).mask()).set('bounds',clientBoundary),{min: minSlowLossProb, max: 80, palette: declineProbPalette},'Slow Tree Loss Probability',false);
  Map2.addLayer(combinedChange.select(['Slow_Loss_Year']).reduce(ee.Reducer.count()).set('bounds',clientBoundary),{min: 1, max: 5, palette: declineDurPalette},'Slow Tree Loss Duration',false);
  
}
Map2.addLayer(combinedFastLoss.select(['Fast_Loss_Year']).set('bounds',clientBoundary),{min: startYear, max: endYear, palette: declineYearPalette},'Fast Tree Loss Year');

if(analysisMode === 'advanced'){
Map2.addLayer(combinedFastLoss.select(['Fast_Loss_Prob']).updateMask(combinedFastLoss.select(['Fast_Loss_Year']).mask()).set('bounds',clientBoundary),{min: minFastLossProb, max: 80, palette: declineProbPalette},'Fast Tree Loss Probability',false);
  Map2.addLayer(combinedChange.select(['Fast_Loss_Year']).reduce(ee.Reducer.count()).set('bounds',clientBoundary),{min: 1, max: 5, palette: declineDurPalette},'Fast Tree Loss Duration',false);
}
Map2.addLayer(combinedGain.select(['Gain_Year']).set('bounds',clientBoundary),{min: startYear, max: endYear, palette: recoveryYearPalette},'Tree Gain Year',false);
if(analysisMode === 'advanced'){
Map2.addLayer(combinedGain.select(['Gain_Prob']).updateMask(combinedGain.select(['Gain_Year']).mask()).set('bounds',clientBoundary),{min: minGainProb, max: 80, palette: recoveryProbPalette},'Tree Gain Probability',false);
  Map2.addLayer(combinedChange.select(['Gain_Year']).reduce(ee.Reducer.count()).set('bounds',clientBoundary),{min: 1, max: 5, palette: recoveryDurPalette},'Tree Gain Duration',false);
}

    var whichIndex = whichIndices[0];
    var ccdcIndicesSelector = ['tStart','tEnd','tBreak','changeProb','NBR_.*','NDVI_.*'];

    akCCDC = akCCDC.select(ccdcIndicesSelector);
    conusCCDC = conusCCDC.select(ccdcIndicesSelector);
    var f= ee.Image(conusCCDC.first());
    var ccdcImg = ee.Image(conusCCDC.merge(akCCDC).mosaic().copyProperties(f));
    var whichHarmonics = [1,2,3];
    var fillGaps = true;
    var fraction = 0.6657534246575343;
    var annualImages = simpleGetTimeImageCollection(ee.Number(startYear+fraction),ee.Number(endYear+1+fraction),1);

    var fittedCCDC = predictCCDC(ccdcImg,annualImages,fillGaps,whichHarmonics).select(['NBR_predicted'],['CCDC Fitted NBR']).map(setSameDate);
    

    var lt = conusLT.filter(ee.Filter.eq('band',whichIndex)).merge(akLT.filter(ee.Filter.eq('band',whichIndex))).mosaic()

    var fittedAsset = ltStackToFitted(lt,1984,2020).filter(ee.Filter.calendarRange(startYear,endYear,'year')).select(['fit'],['LANDTRENDR Fitted '+ whichIndex]);
   
    var changePixelChartCollection = joinCollections(composites.select([whichIndex],['Raw '+whichIndex]),fittedAsset,false);
    changePixelChartCollection = joinCollections(changePixelChartCollection,fittedCCDC,false);

    var probCollection = combinedChange.select(['.*_Prob']).select(['Fast_Loss_Prob','Slow_Loss_Prob','Gain_Prob'],['Fast Tree Loss Probability','Slow Tree Loss Probability','Tree Gain Probability'])
    changePixelChartCollection = joinCollections(changePixelChartCollection,probCollection,false)
    pixelChartCollections['all-loss-gain-'+whichIndex] = {'label':'LCMS Change Time Series',
                                    'collection':changePixelChartCollection,//chartCollection.select(['Raw.*','LANDTRENDR.*','.*Loss Probability','Gain Probability']),
                                    'chartColors':chartColorsDict.allLossGain2,
                                    'tooltip':'Chart slow loss, fast loss, gain and the '+whichIndex + ' vegetation index',
                                    'xAxisLabel':'Year',
                                    'yAxisLabel':'Model Confidence or Index Value'}

    populatePixelChartDropdown();
    // populateAreaChartDropdown();
}