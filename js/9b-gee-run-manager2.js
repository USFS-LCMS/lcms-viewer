//Function to combine LCMS change outputs based on the highest confidence
//Can handle each modeled output as a band or individual image using the format param
//Format can equal 'stack' or 'collection'
function combineChange(changeC,year,gain_thresh,slow_loss_thresh,fast_loss_thresh,format,mult){
  year = ee.Number(year).int16();
  var dummyImage = ee.Image(changeC.first());
  // print('here')
  if(format !== 'stack'){
      changeC = changeC.filter(ee.Filter.eq('year',year));
    var gain = changeC.filter(ee.Filter.eq('model','RNR')).mosaic();
    var slowLoss = changeC.filter(ee.Filter.eq('model','DND_Slow')).mosaic();
    var fastLoss = changeC.filter(ee.Filter.eq('model','DND_Fast')).mosaic();
    var stack = ee.Image.cat([slowLoss,fastLoss,gain]);

  }else{
    var stack = changeC
                .filter(ee.Filter.calendarRange(year,year,'year'))
                .filter(ee.Filter.neq('model','STABLE'))
                .mosaic().select(['DND_Slow','DND_Fast','RNR']);
  } 
  stack = stack.multiply(mult);
  var maxConf = stack.reduce(ee.Reducer.max());
  var maxConfMask = stack.eq(maxConf).and(stack.gte(ee.Image([slow_loss_thresh,fast_loss_thresh,gain_thresh]))).selfMask();
  var yearMask = ee.Image([year,year,year]).updateMask(maxConfMask).int16();
  // stack = stack.updateMask(maxConfMask)
  var maxClass = ee.Image([1,2,3]).updateMask(maxConfMask).reduce(ee.Reducer.max()).rename(['maxClass']);
  var out = ee.Image.cat([stack,maxConfMask, yearMask,maxClass]).rename(['Slow_Loss_Prob','Fast_Loss_Prob','Gain_Prob','Slow_Loss_Mask','Fast_Loss_Mask','Gain_Mask','Slow_Loss_Year','Fast_Loss_Year','Gain_Year','maxClass']);
  return out.set('system:time_start',ee.Date.fromYMD(year,6,1).millis())
}
///////////////////////////////////////////
function combineLandCover(lcC,year,numbers,names,format,mult){
  var dummyImage = ee.Image(lcC.first());

  year = ee.Number(year).int16();
  if(format !== 'stack'){
      lcC = lcC.filter(ee.Filter.eq('year',year));
      
      lcC = ee.ImageCollection(names.map(function(nm){
       
        return fillEmptyCollections(lcC.filter(ee.Filter.eq('model',nm)),dummyImage).mosaic()
      })).toBands().rename(names)

  

  }else{
    var lcC = lcC.filter(ee.Filter.calendarRange(year,year,'year')).mosaic().select(names);
  }
  lcC = lcC.multiply(mult);
  var maxConf = lcC.reduce(ee.Reducer.max());
  var maxConfMask = lcC.eq(maxConf).selfMask();
  var maxClass = ee.Image(numbers).updateMask(maxConfMask).reduce(ee.Reducer.max()).rename(['maxClass']);
  return lcC.addBands(maxClass).set('system:time_start',ee.Date.fromYMD(year,6,1).millis())
}
////////////////////////////////////////////////////////////////////////
function runGTAC(){
  //Set up some params
  startYear = parseInt(urlParams.startYear);
  endYear = parseInt(urlParams.endYear);
  analysisMode = urlParams.analysisMode;
  queryClassDict = {};
  var years = ee.List.sequence(startYear,endYear).getInfo();
  summaryMethod = urlParams.summaryMethod.toTitle();
  getLCMSVariables();
  // getMTBSandIDS();
  getHansen()
  // setupDownloads(studyAreaName);
  var clientBoundary = clientBoundsDict.CONUS_SEAK;
  
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
    return simpleAddIndices(composites.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis()),1);
  }));

  //Combine different change outputs
  var combinedChange = ee.ImageCollection(years.map(function(yr){

    var akCombined = combineChange(akChange,yr,studyAreaDict[studyAreaName].akGainThresh,studyAreaDict[studyAreaName].akSlowLossThresh,studyAreaDict[studyAreaName].akFastLossThresh,'stack',0.01);

    var conusCombined = combineChange(conusChange,yr,studyAreaDict[studyAreaName].conusGainThresh,studyAreaDict[studyAreaName].conusSlowLossThresh,studyAreaDict[studyAreaName].conusFastLossThresh,'collection',0.01);
    return ee.ImageCollection([akCombined,conusCombined]).mosaic().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis())
    
    }));

  //Summarize change
  var summaryMethodDescriptionDict = {'Year':'of most recent year of','Prob' : 'of highest model confidence of'}

  var combinedGain = combinedChange.select(['Gain.*']).qualityMosaic('Gain_'+summaryMethod);
  var combinedSlowLoss = combinedChange.select(['Slow_Loss_.*']).qualityMosaic('Slow_Loss_'+ summaryMethod);
  var combinedFastLoss = combinedChange.select(['Fast_Loss_.*']).qualityMosaic('Fast_Loss_'+ summaryMethod);

   //Set up land cover and land use
  var lcClassDict = studyAreaDict[studyAreaName].lcClassDict
  var luClassDict = studyAreaDict[studyAreaName].luClassDict

  var lcNumbers = Object.keys(lcClassDict).map(function(n){return parseInt(n)});
  var lcModelNames = lcNumbers.map(function(key){return lcClassDict[key]['modelName']});
  var lcLegendNames = lcNumbers.map(function(key){return lcClassDict[key]['legendName']});
  var lcLegendColors = lcNumbers.map(function(key){return lcClassDict[key]['color']});

  var luNumbers = Object.keys(luClassDict).map(function(n){return parseInt(n)});
  var luModelNames = luNumbers.map(function(key){return luClassDict[key]['modelName']});
  var luLegendNames = luNumbers.map(function(key){return luClassDict[key]['legendName']});
  var luLegendColors = luNumbers.map(function(key){return luClassDict[key]['color']});
  
  var lcLegendDict = {};var lcQueryDict = {};var luLegendDict = {};var luQueryDict = {};
  lcNumbers.map(function(k){lcLegendDict[lcClassDict[k].legendName] = lcClassDict[k].color});
  lcNumbers.map(function(k){lcQueryDict[k] = lcClassDict[k].legendName});
  luNumbers.map(function(k){luLegendDict[luClassDict[k].legendName] = luClassDict[k].color});
  luNumbers.map(function(k){luQueryDict[k] = luClassDict[k].legendName});

  var combinedLC = ee.ImageCollection(years.map(function(yr){
    var conusCombined = combineLandCover(conusLC,yr,lcNumbers,lcModelNames,'collection',0.01);
    var akCombined = combineLandCover(akLC,yr,lcNumbers,lcModelNames,'stack',0.01);
    return ee.ImageCollection([akCombined,conusCombined]).mosaic().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis())
  })).select(lcModelNames.concat(['maxClass']),lcLegendNames.concat(['maxClass']));

  var combinedLU = ee.ImageCollection(years.map(function(yr){
    var conusCombined = combineLandCover(conusLU,yr,luNumbers,luModelNames,'collection',0.01);
    var akCombined = combineLandCover(akLU,yr,luNumbers,luModelNames,'stack',0.01);
    return ee.ImageCollection([akCombined,conusCombined]).mosaic().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis())
  })).select(luModelNames.concat(['maxClass']),luLegendNames.concat(['maxClass']));

  var lcLayerName =  'Land Cover (mode) '+ startYear.toString() + '-'+ endYear.toString();
  var luLayerName =  'Land Use (mode) '+ startYear.toString() + '-'+ endYear.toString();
    
  Map2.addLayer(combinedLU.select(['maxClass']).mode().set('bounds',clientBoundary),{min:luNumbers.min(),max:luNumbers.max(),palette:luLegendColors,addToClassLegend:true,classLegendDict:luLegendDict,queryDict:luQueryDict},luLayerName,false);
  Map2.addLayer(combinedLC.select(['maxClass']).mode().set('bounds',clientBoundary),{min:lcNumbers.min(),max:lcNumbers.max(),palette:lcLegendColors,addToClassLegend:true,classLegendDict:lcLegendDict,queryDict:lcQueryDict},lcLayerName,false);


  //Bring change layers into viewer
  Map2.addLayer(combinedSlowLoss.select(['Slow_Loss_Year']).set('bounds',clientBoundary),{title: 'Year '+ summaryMethodDescriptionDict[summaryMethod] +' vegetation cover loss from a long-term trend disturbance event such as drought, tree mortality from insects or disease, etc.',min: startYear, max: endYear, palette: declineYearPalette},`Slow Disturbance Year`)

  if(analysisMode === 'advanced'){
    Map2.addLayer(combinedSlowLoss.select(['Slow_Loss_Prob']).updateMask(combinedSlowLoss.select(['Slow_Loss_Year']).mask()).set('bounds',clientBoundary),{title: 'Model confidence '+ summaryMethodDescriptionDict[summaryMethod] +' vegetation cover loss from a long-term trend disturbance event such as drought, tree mortality from insects or disease, etc.',min: minSlowLossProb, max: 0.8, palette: declineProbPalette},'Slow Disturbance Probability',false);
    Map2.addLayer(combinedChange.select(['Slow_Loss_Year']).reduce(ee.Reducer.count()).set('bounds',clientBoundary),{title: 'Duration of vegetation cover loss from a long-term trend disturbance event such as drought, tree mortality from insects or disease, etc.',min: 1, max: 5, palette: declineDurPalette},'Slow Disturbance Duration',false);
  }

  Map2.addLayer(combinedFastLoss.select(['Fast_Loss_Year']).set('bounds',clientBoundary),{title: 'Year '+ summaryMethodDescriptionDict[summaryMethod] +' rapid vegetation cover change/loss from an external event such as fire/harvest, water inundation or desiccation, etc.', min: startYear, max: endYear, palette: declineYearPalette},'Fast Disturbance Year');

  if(analysisMode === 'advanced'){
  Map2.addLayer(combinedFastLoss.select(['Fast_Loss_Prob']).updateMask(combinedFastLoss.select(['Fast_Loss_Year']).mask()).set('bounds',clientBoundary),{title: 'Model confidence '+ summaryMethodDescriptionDict[summaryMethod] +' rapid vegetation cover change/loss from an external event such as fire/harvest, water inundation or desiccation, etc.',min: minFastLossProb, max: 0.8, palette: declineProbPalette},'Fast Disturbance Probability',false);
    Map2.addLayer(combinedChange.select(['Fast_Loss_Year']).reduce(ee.Reducer.count()).set('bounds',clientBoundary),{title: 'Duration of rapid vegetation cover change/loss from an external event such as fire/harvest, water inundation or desiccation, etc.', min: 1, max: 5, palette: declineDurPalette},'Fast Disturbance Duration',false);
  }

  Map2.addLayer(combinedGain.select(['Gain_Year']).set('bounds',clientBoundary),{title: 'Year '+ summaryMethodDescriptionDict[summaryMethod] +' post disturbance vegetation cover gain.',min: startYear, max: endYear, palette: gainYearPaletteA},'Growth Year',false);
  // Map2.addLayer(combinedGain.select(['Gain_Year']).set('bounds',clientBoundary),{title: 'Year '+ summaryMethodDescriptionDict[summaryMethod] +' post disturbance vegetation cover gain.',min: startYear, max: endYear, palette: gainYearPaletteB},'Growth Year b',false);
  if(analysisMode === 'advanced'){
  Map2.addLayer(combinedGain.select(['Gain_Prob']).updateMask(combinedGain.select(['Gain_Year']).mask()).set('bounds',clientBoundary),{title: 'Model confidence '+ summaryMethodDescriptionDict[summaryMethod] +' post disturbance vegetation cover gain.', min: minGainProb, max: 0.8, palette: recoveryProbPalette},'Growth Probability',false);
    Map2.addLayer(combinedChange.select(['Gain_Year']).reduce(ee.Reducer.count()).set('bounds',clientBoundary),{title: 'Post disturbance vegetation cover gain duration.', min: 1, max: 5, palette: recoveryDurPalette},'Growth Duration',false);
  }
  var combinedChangeC = combinedChange.select(['maxClass']);//.map(function(img){return img.unmask(0)})
  Map2.addTimeLapse(combinedChangeC.filter(ee.Filter.calendarRange(startYear,endYear,'year')),{min:0,max:3,palette:changePalette,addToClassLegend: true,classLegendDict:{'Stable':changePalette[0],'Slow Disturbance':changePalette[1],'Fast Disturbance':changePalette[2],'Growth':changePalette[3]},queryDict: {0:'Stable',1:'Slow Disturbance',2:'Fast Disturbance',3:'Growth'},'years':years},'LCMS Change Time Lapse',false);
   
  //Set up pixel charting change time series
  var whichIndex = 'NBR';

  //Set up CCDC
  var ccdcIndicesSelector = ['tStart','tEnd','tBreak','changeProb',whichIndex+'_.*','NDVI_.*'];
  akCCDC = akCCDC.select(ccdcIndicesSelector);
  conusCCDC = conusCCDC.select(ccdcIndicesSelector);
  var f= ee.Image(conusCCDC.first());
  var ccdcImg = ee.Image(conusCCDC.merge(akCCDC).mosaic().copyProperties(f));
  var whichHarmonics = [1,2,3];
  var fillGaps = true;
  var fraction = 0.6657534246575343;
  var annualImages = simpleGetTimeImageCollection(ee.Number(startYear+fraction),ee.Number(endYear+1+fraction),1);
  var fittedCCDC = predictCCDC(ccdcImg,annualImages,fillGaps,whichHarmonics).select([whichIndex+'_predicted'],['CCDC Fitted '+whichIndex]).map(setSameDate);
  
  //Set up LANDTRENDR
  var lt = conusLT.filter(ee.Filter.eq('band',whichIndex)).merge(akLT.filter(ee.Filter.eq('band',whichIndex))).mosaic();
  var fittedAsset = ltStackToFitted(lt,1984,2020).filter(ee.Filter.calendarRange(startYear,endYear,'year')).select(['fit'],['LANDTRENDR Fitted '+ whichIndex]);
 
  //Join raw time series to lt fitted and ccdc fitted
  var changePixelChartCollection = joinCollections(composites.select([whichIndex],['Raw '+whichIndex]),fittedAsset,false);
  changePixelChartCollection = joinCollections(changePixelChartCollection,fittedCCDC,false);

  //Set up change prob outputs for pixel charting
  var probCollection = combinedChange.select(['.*_Prob']).select(['Slow_Loss_Prob','Fast_Loss_Prob','Gain_Prob'],['Slow Disturbance Probability','Fast Disturbance Probability','Growth Probability'])
  changePixelChartCollection = joinCollections(changePixelChartCollection,probCollection,false);

  pixelChartCollections['all-loss-gain-'+whichIndex] = {'label':'LCMS Change Time Series',
                                  'collection':changePixelChartCollection,//chartCollection.select(['Raw.*','LANDTRENDR.*','.*Loss Probability','Gain Probability']),
                                  'chartColors':chartColorsDict.allLossGain2,
                                  'tooltip':'Chart slow disturbance, fast disturbance, growth and the '+whichIndex + ' vegetation index',
                                  'xAxisLabel':'Year',
                                  'yAxisLabel':'Model Confidence or Index Value',
                                  'fieldsHidden':[true,true,true,false,false,false]}
  var lcForPixelCharting = combinedLC;
  var bns = ee.Image(combinedLC.first()).bandNames();
  bns = bns.slice(0,bns.length().subtract(1));
  lcForPixelCharting = lcForPixelCharting.select(bns) ;                       
  pixelChartCollections['land-cover'] = {'label':'LCMS Land Cover Time Series',
                                  'collection':lcForPixelCharting,//chartCollection.select(['Raw.*','LANDTRENDR.*','.*Loss Probability','Gain Probability']),
                                  'chartColors':lcLegendColors,
                                  'tooltip':'Chart land cover model confidence for each individual class',
                                  'xAxisLabel':'Year',
                                  'yAxisLabel':'Model Confidence'}
  
  var luForPixelCharting = combinedLU;
  var bns = ee.Image(combinedLU.first()).bandNames();
  bns = bns.slice(0,bns.length().subtract(1));
  luForPixelCharting = luForPixelCharting.select(bns) ;                       
  pixelChartCollections['land-use'] = {'label':'LCMS Land Use Time Series',
                                  'collection':luForPixelCharting,//chartCollection.select(['Raw.*','LANDTRENDR.*','.*Loss Probability','Gain Probability']),
                                  'chartColors':luLegendColors,
                                  'tooltip':'Chart land use model confidence for each individual class',
                                  'xAxisLabel':'Year',
                                  'yAxisLabel':'Model Confidence'}

  var changeForAreaCharting = combinedChange.select(['.*_Mask']).map(function(img){
    var change = img.unmask().select([0,1,2],['Slow Disturbance','Fast Disturbance','Growth']);
    var notChange = img.mask().reduce(ee.Reducer.max()).not().rename(['Stable'])
    return notChange.addBands(change).copyProperties(img,['system:time_start']);
  })
  var lcForAreaCharting = formatAreaChartCollection(combinedLC.select(['maxClass']),lcNumbers,lcLegendNames);
  var luForAreaCharting = formatAreaChartCollection(combinedLU.select(['maxClass']),luNumbers,luLegendNames);
  
  getSelectLayers(true);
  
   areaChartCollections['change'] = {'label':'LCMS Change',
                                  'collection':changeForAreaCharting,
                                  'stacked':false,
                                  'steppedLine':false,
                                  'tooltip':'Summarize change classes for each year',
                                  'colors':chartColorsDict.allLossGain2Area,
                                  'xAxisLabel':'Year'};
   areaChartCollections['lc'] = {'label':'LCMS Land Cover',
                                  'collection':lcForAreaCharting,
                                  'stacked':true,
                                  'steppedLine':false,
                                  'tooltip':'Summarize land cover classes for each year',
                                  'colors':lcLegendColors,
                                  'xAxisLabel':'Year'};
     areaChartCollections['lu'] = {'label':'LCMS Land Use',
                                  'collection':luForAreaCharting,
                                  'stacked':true,
                                  'steppedLine':false,
                                  'tooltip':'Summarize land use classes for each year',
                                  'colors':luLegendColors,
                                  'xAxisLabel':'Year'};
  
  populatePixelChartDropdown();
    populateAreaChartDropdown();
    $('#summary-spinner').hide();

}