
// Land Cover
// var PALETTE = 'b67430,78db53,F0F,ffb88c,8cfffc,32681e,2a74b8'
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
//Function to combine LCMS change outputs based on the highest confidence
//Can handle each modeled output as a band or individual image using the format param
//Format can equal 'stack' or 'collection'
function combineChange(changeC,year,gain_thresh,slow_loss_thresh,fast_loss_thresh,format,mult, trackNoData){
  if(trackNoData === null || trackNoData === undefined){trackNoData = false}
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
  var processingMask = stack.mask().reduce(ee.Reducer.min());

 
  var maxConf = stack.reduce(ee.Reducer.max());
  var maxConfMask = stack.eq(maxConf).and(stack.gte(ee.Image([slow_loss_thresh,fast_loss_thresh,gain_thresh]))).selfMask();
  var yearMask = ee.Image([year,year,year]).updateMask(maxConfMask).int16();
  var maxClass = ee.Image([1,2,3]).updateMask(maxConfMask).reduce(ee.Reducer.max()).rename(['maxClass']);

  var out = ee.Image.cat([stack,maxConfMask, yearMask,maxClass,processingMask]).rename(['Slow_Loss_Prob','Fast_Loss_Prob','Gain_Prob','Slow_Loss_Mask','Fast_Loss_Mask','Gain_Mask','Slow_Loss_Year','Fast_Loss_Year','Gain_Year','maxClass','processingMask']);
  return out.set('system:time_start',ee.Date.fromYMD(year,6,1).millis())
}
///////////////////////////////////////////
function combineLandCover(lcC,year,numbers,names,format,mult){
  var dummyImage = ee.Image(lcC.first());
  var probNames =  names.map(function(bn){return bn + '_Prob'})
  var mskNames = names.map(function(bn){return bn + '_Mask'});
  year = ee.Number(year).int16();
  if(format !== 'stack'){
      lcC = lcC.filter(ee.Filter.eq('year',year));
      
      lcC = ee.ImageCollection(names.map(function(nm){
       
        return fillEmptyCollections(lcC.filter(ee.Filter.eq('model',nm)),dummyImage).mosaic()
      })).toBands().rename(probNames)

  

  }else{
    var lcC = lcC.filter(ee.Filter.calendarRange(year,year,'year')).mosaic().select(names,probNames);
  }
  lcC = lcC.multiply(mult);
  // var processingMask = lcC.mask().reduce(ee.Reducer.min());
  var maxConf = lcC.reduce(ee.Reducer.max());
  var maxConfMask = lcC.eq(maxConf).rename(mskNames);
  var maxClass = ee.Image(numbers).updateMask(maxConfMask).reduce(ee.Reducer.max()).rename(['maxClass']);
  // maxClass = maxClass.unmask(numbers.max()+1,false);
  return (lcC.addBands(maxConfMask).addBands(maxClass)).set('system:time_start',ee.Date.fromYMD(year,6,1).millis())
}
function getLCMSVariables() {
// Loss/Gain Palettes
window.declineYearPalette = 'ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02';
window.recoveryYearPalette = 'AFDEA8,80C476,308023,145B09';

window.declineProbPalette = 'F5DEB3,D00';
window.recoveryProbPalette = 'F5DEB3,006400';

window.declineDurPalette = 'BD1600,E2F400,0C2780';
window.recoveryDurPalette = declineDurPalette;

// window.gainYearPaletteA = 'c5ee93,0f6460';
window.gainYearPaletteA = 'c5ee93,00a398';
// window.gainYearPaletteB = 'e0e0ff,4a50c4';
// window.changePaletteFull = ['3d4551','f39268','d54309','00a398','ffbe2e'];
// window.changePaletteFull = ['372E2C','f39268','d54309','00a398','372E2C','1B1716DD'];
window.changePaletteFull =['#3d4551','#f39268','#d54309','#00a398','#222222']
// window.changePaletteFull = ['3d4551','f39268','d54309','0f6460','ffbe2e'];
window.changePalette = ['f39268','d54309','00a398'];
window.whichIndices = ['NBR'];

// LCMS Project Boundaries
// var fnf = ee.FeatureCollection('projects/USFS/LCMS-NFS/R1/FNF/FNF_Admin_Bndy');
// var bt_study_area = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/BT/BT_LCMS_ProjectArea_5km');
window.bt_study_area = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/BT/GTNP_admin_bndy_5km_buffer_GTNP_Merge');
window.fnf_study_area = ee.FeatureCollection('projects/USFS/LCMS-NFS/R1/FNF/FNF_GNP_Merge_Admin_BND_1k');
window.mls_study_area = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/MLS/MLS_LCMS_ProjectArea_5km');
window.ck_study_area = ee.FeatureCollection('projects/USFS/LCMS-NFS/R10/CK/CK_LCMS_ProjectArea').map(function(f){return f.convexHull(1000)});

// Forest Service and Park Service Boundaries
window.usfs_regions = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Region_Boundaries');
window.b = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Boundaries');
window.nps = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/NPS_Boundaries');
window.otherLands = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/OtherNationalDesignatedArea');
window.gtnp = ee.Feature(nps.filter(ee.Filter.eq('PARKNAME','Grand Teton')).first());
window.gnp = ee.Feature(nps.filter(ee.Filter.eq('PARKNAME','Glacier')).first());
window.kfnp = ee.Feature(nps.filter(ee.Filter.eq('PARKNAME','Kenai Fjords')).first());

window.btnf = ee.Feature(b.filter(ee.Filter.eq('FORESTNAME','Bridger-Teton National Forest')).first());
window.fnf = ee.Feature(b.filter(ee.Filter.eq('FORESTNAME','Flathead National Forest')).first());
window.mlsnf = ee.Feature(b.filter(ee.Filter.eq('FORESTNAME','Manti-La Sal National Forest')).first()); 
window.cnf = ee.Feature(b.filter(ee.Filter.eq('FORESTNAME','Chugach National Forest')).first());

window.R4_unofficial = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/R4_LCMS_ProjectArea_5km');
window.R4_official =usfs_regions.filter(ee.Filter.eq('REGION','04'));
// Other boundaries
window.huc8 = ee.FeatureCollection("USGS/WBD/2017/HUC08");
window.kenai_nwr = ee.FeatureCollection('projects/USFS/LCMS-NFS/AK-Ancillary-Data/Kenai_NWR').filterBounds(ck_study_area);

}
function computeThematicChange(c,numbers,legendColors, legendDict,queryDict,startYear,endYear){
    var period = 3;
    var changeColor = '7d2702'
    var cEarly = c.filter(ee.Filter.calendarRange(startYear,startYear+period,'year')).mode();
    var cLate = c.filter(ee.Filter.calendarRange(endYear-period,endYear,'year')).mode();
    var cNeq = cEarly.neq(cLate);

    var pairs = [];
    numbers.map(function(n1){
      numbers.map(function(n2){
        if(n1 !== n2){pairs.push(parseInt(n1.toString()+n2.toString()))}
      })
    });
    console.log(pairs)
    var cChange = cLate;
    cChange = cChange.where(cNeq,numbers.max()+1);
    changeLegendColors = copyArray(legendColors);
    changeLegendColors.push(changeColor);
    cChange = cChange.updateMask(cChange.eq(numbers.max()+1));
    changeLegendDict = copyObj(legendDict);
    changeLegendDict['Conversion/Change'] = changeColor;

    var changeViz = {title: `Most common class from ${startYear} to ${endYear} with change added.`,layerType : 'geeImage',min:numbers.min(),max:numbers.max()+1,palette:changeLegendColors,addToClassLegend:true,classLegendDict:changeLegendDict,queryDict:queryDict};
    return {'change':cChange,'viz':changeViz}
  }
function formatAreaChartCollection(collection,classCodes,classNames,unmask){
  if(unmask === undefined || unmask === null){unmask = true};
  function unstacker(img,code){
    return img.eq(parseInt(code))
  }
  function codeWrapper(img){
    t = ee.ImageCollection( classCodes.map(function(code){return unstacker(img,code)})).toBands()
    return t.rename(classNames).copyProperties(img,['system:time_start']).copyProperties(img)
  }
  out = ee.ImageCollection(collection.map(codeWrapper))

  if(unmask){
    out = ee.ImageCollection(out.map(function(img){return img.unmask(0,false)}));
  }
  return ee.ImageCollection(out)
}
function multBands(img,distDir,by){
    var out = img.multiply(ee.Image(distDir).multiply(by));
    out  = out.copyProperties(img,['system:time_start'])
              .copyProperties(img);formatAreaChartCollection
    return out;
}

function additionBands(img,howMuch){
    var out = img.add(ee.Image(howMuch));
    out  = out.copyProperties(img,['system:time_start'])
              .copyProperties(img);
    return out;
}

function simpleAddIndices(in_image,mult){
  if(mult === undefined || mult === null){mult = 1}
    in_image = in_image.addBands(in_image.normalizedDifference(['nir', 'red']).select([0],['NDVI']).multiply(mult));
    in_image = in_image.addBands(in_image.normalizedDifference(['nir', 'swir2']).select([0],['NBR']).multiply(mult));
    in_image = in_image.addBands(in_image.normalizedDifference(['nir', 'swir1']).select([0],['NDMI']).multiply(mult));
    in_image = in_image.addBands(in_image.normalizedDifference(['green', 'swir1']).select([0],['NDSI']).multiply(mult));  
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
function batchFillCollection(c,expectedYears){
  var actualYears = c.toList(10000,0).map(function(img){return ee.Date(ee.Image(img).get('system:time_start')).get('year')}).distinct().getInfo();
  var missingYears = expectedYears.filter(function(x){return actualYears.indexOf(x)==-1})
  var dummyImage = ee.Image(c.first()).mask(ee.Image(0));
  var missingCollection = missingYears.map(function(yr){return dummyImage.set('system:time_start',ee.Date.fromYMD(yr,1,1).millis())});
  var out = c.merge(missingCollection).sort('system:time_start');
  return out;//.map(function(img){return img.unmask(255)});
}
function setSameDate(img){
  var yr = ee.Date(img.get('system:time_start')).get('year');
  return img.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
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
function fillEmptyCollections(inCollection,dummyImage){                       
  var dummyCollection = ee.ImageCollection([dummyImage.mask(ee.Image(0))]);
  var imageCount = inCollection.toList(1).length();
  return ee.ImageCollection(ee.Algorithms.If(imageCount.gt(0),inCollection,dummyCollection));

}
// --------Add MTBS and IDS Layers-------------------------------
var idsStartYear = 1997;
var idsEndYear = 2020;
var idsMinYear = 1997;
var idsMaxYear = 2020;
function getIDSCollection(){
  if(startYear > idsMinYear && startYear <= idsMaxYear){idsStartYear = startYear}
    else{idsStartYear = idsMinYear}
  if(endYear < idsMaxYear && endYear >= idsMinYear){idsEndYear = endYear}  
    else{idsEndYear = idsMaxYear}
  // console.log('IDS Years:');console.log(idsStartYear);console.log(idsEndYear);
  // var idsFolder = 'projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/IDS';
  var idsFolder = 'projects/lcms-292214/assets/CONUS-Ancillary-Data/IDS';
  var ids = ee.data.getList({id:idsFolder}).map(function(t){return t.id});
 
  ids = ids.map(function(id){
    var idsT = ee.FeatureCollection(id);
    return idsT;
  });
  ids = ee.FeatureCollection(ids).flatten();
  ids = ids.filter(ee.Filter.and(ee.Filter.gte('SURVEY_YEA',idsStartYear),ee.Filter.lte('SURVEY_YEA',idsEndYear))).set('bounds',clientBoundsDict.CONUS);

  var years = ee.List.sequence(idsStartYear,idsEndYear);
  var dcaCollection = years.map(function(yr){
    var idsYr = ids.filter(ee.Filter.eq('SURVEY_YEA',yr));
    var dcaYr = idsYr.reduceToImage(['DCA_CODE'],ee.Reducer.first()).divide(1000);
    var dtYr = idsYr.reduceToImage(['DAMAGE_TYP'],ee.Reducer.first());
    return dcaYr.addBands(dtYr).int16().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis()).rename(['Damage_Agent','Damage_Type']);   
  });
  dcaCollection = ee.ImageCollection.fromImages(dcaCollection);
  // console.log(dcaCollection.size().getInfo())
  return {'imageCollection':dcaCollection,'featureCollection':ids}
}
function getAspectObj(){
  var dem = ee.Image('USGS/SRTMGL1_003');
  var aspect = ee.Terrain.aspect(dem).int16();
  var aspectBinWidth = 90;
  var aspectBreaks = ee.List.sequence(0,360,aspectBinWidth).slice(0,-1);
  var from = [];
  var to =  [];
  var lookupDict = ee.Dictionary({});
  var lookupNames = ['Northeast (0'+String.fromCharCode(176)+'-89'+String.fromCharCode(176)+')','Southeast (90'+String.fromCharCode(176)+'-179'+String.fromCharCode(176)+')','Southwest (180'+String.fromCharCode(176)+'-269'+String.fromCharCode(176)+')','Northwest (270'+String.fromCharCode(176)+'-359'+String.fromCharCode(176)+')'];
  var lookupNumbers = ee.List([]);
  var colorDict = ee.Dictionary({})

  aspectBreaks.getInfo().map(function(b){
    b = ee.Number(b);
    var s = b;
    var e = b.add(aspectBinWidth).subtract(1);
    var toValue = (e.add(s)).divide(2).round();
    var toValueStr = ee.Number(toValue).int16().format()
    var fromT = ee.List.sequence(s,e);
    var toT = ee.List.repeat(toValue,aspectBinWidth);
    lookupNumbers = lookupNumbers.cat([toValueStr]);
    from.push(fromT);
    to.push(toT);
    colorDict =colorDict.set(toValueStr,randomColor())
    
  });
  
  from = ee.List(from).flatten();
  to = ee.List(to).flatten();

  var aspectLookupDict = ee.Dictionary.fromLists(lookupNumbers,lookupNames);
  var aspectBinned = aspect.remap(from,to)
  // Map2.addLayer(aspectBinned,{min:0,max:360},'Aspect Binned');
  return {'image':aspectBinned,'lookupDict':aspectLookupDict,'colorDict':colorDict}
}
function getNLCDObj(){
  var nlcdYears = [2001,2004,2006,2008,2011,2013,2016,2019];
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
  // console.log(nlcdLCQueryDict);
  var nlcdLegendDictReverse = {};
  Object.keys(nlcdLegendDict).reverse().map(function(k){nlcdLegendDictReverse[k] = nlcdLegendDict[k]});
  var nlcd = ee.ImageCollection("USGS/NLCD_RELEASES/2019_REL/NLCD").select(['landcover'],['NLCD Landcover'])
            // .map(function(img){return img.set('system:time_start',ee.Date.fromYMD(ee.Number.parse(img.id()),6,1).millis())})
            .sort('system:time_start');
  var nlcdC = nlcdYears.map(function(nlcdYear){
      // if(nlcdYear >= startYear  && nlcdYear <= endYear){
        var nlcdT = nlcd.filter(ee.Filter.calendarRange(nlcdYear,nlcdYear,'year')).mosaic();
        nlcdT = nlcdT.set('system:time_start',ee.Date.fromYMD(nlcdYear,6,1).millis());
        return nlcdT;
      });
  nlcdC = ee.ImageCollection(nlcdC);
  // console.log(nlcdC.getInfo());
  var chartTableDict = {
    'NLCD Landcover':nlcdLCQueryDict
  }
  nlcdC =  nlcdC.set('bounds',clientBoundsDict.All).set('chartTableDict',chartTableDict);
  return {'collection':nlcdC,'years':nlcdYears,'palette':nlcdLCPalette,'vizDict':nlcdLCVizDict,'queryDict':nlcdLCQueryDict,'legendDict':nlcdLegendDict,'legendDictReverse':nlcdLegendDictReverse,'min':nlcdLCMin,'max':nlcdLCMax}
}
 
function getMTBSAndNLCD(studyAreaName,whichLayerList,showSeverity){
  if(showSeverity === null || showSeverity === undefined){showSeverity = false};
  if(mtbsSummaryMethod === null || mtbsSummaryMethod === undefined){mtbsSummaryMethod = 'Highest-Severity'}
 
    var mtbs_path = 'projects/gtac-mtbs/assets/burn_severity_mosaics/MTBS';//'projects/USFS/DAS/MTBS/BurnSeverityMosaics';
 
  var mtbsEndYear = endYear;
  if(endYear > 2020){mtbsEndYear = 2020}

  var mtbsYears = ee.List.sequence(1984,mtbsEndYear);
  var mtbs = ee.ImageCollection(mtbs_path);
  mtbs = mtbsYears.map(function(yr){
    var mtbsYr = mtbs.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic();
    return mtbsYr.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis())
  })
  mtbs = ee.ImageCollection.fromImages(mtbs);


  mtbs = mtbs.filter(ee.Filter.calendarRange(startYear,mtbsEndYear,'year'))
      
  
  mtbs = mtbs.map(function(img){return img.select([0],['burnSeverity']).byte()
    // .updateMask(img.neq(0).and(img.neq(6)))
    });


  var mtbs = mtbs.map(function(img){
    var severityRemapped = img.remap([1,2,3,4,5,6],[1,3,4,5,2,1]).rename(['burnSeverityRemap']);
    var burned = img.remap([1,2,3,4,5,6],[0,1,1,1,0,0]).rename(['burnedNotBurned']);
    burned = burned.selfMask();
    var burnYear = ee.Image(ee.Date(img.get('system:time_start')).get('year')).updateMask(severityRemapped.mask()).rename('burnYear');
    return img.addBands(severityRemapped).addBands(burned).addBands(burned.multiply(-1).rename(['burnYearNegative'])).addBands(burnYear).int16();
  });
 
  mtbs = ee.ImageCollection(mtbs);

  var mtbsSummaryDict = {'Highest-Severity':'burnSeverityRemap',"Most-Recent":'burnYear',"Oldest":'burnYearNegative'}
  var mtbsSummarized = mtbs.qualityMosaic(mtbsSummaryDict[mtbsSummaryMethod]);
  var mtbsCount = mtbs.select([2]).count();
  // var mtbsDistinct = mtbs.select([0]).reduce(ee.Reducer.countDistinct());
  // var multipleSame = mtbsCount.gt(1).and(mtbsDistinct.gt(1))
  // multipleSame = multipleSame.selfMask()
  // Map2.addLayer(mtbsDistinct,{min:1,max:3,palette:'00F,F00'},'Distinct',false);
  // Map2.addLayer(multipleSame,{min:1,max:1,palette:'F00'},'multipleSame',false);
  var mtbsClassDict = {
    'Unburned to Low': '006400',
    'Low':'7fffd4',
    'Moderate':'ffff00',
    'High':'ff0000',
    'Increased Greenness':'7fff00',
    'Non-Processing Area Mask':'ffffff'
  }

  mtbsQueryClassDict = {};
  var keyI = 1;
  Object.keys(mtbsClassDict).map(function(k){mtbsQueryClassDict[keyI] =k;keyI++;})

  if(chartMTBS === true){
    var mtbsStack = formatAreaChartCollection(mtbs.select([0]),Object.keys(mtbsQueryClassDict),Object.values(mtbsQueryClassDict),true);
    // console.log(mtbs.select([0]).getInfo())
    // console.log(Object.keys(mtbsQueryClassDict),Object.values(mtbsQueryClassDict))
    // Map2.addLayer(mtbsStack,{},'mtbs stack')
    areaChartCollections['mtbs'] = {'collection':mtbsStack,
                                  'colors':Object.values(mtbsClassDict),
                                  'label':'MTBS Burn Severity by Year',
                                  'stacked':true,
                                  'steppedLine':false,
                                  'chartType':'bar',
                                  'xAxisProperty':'year',
                                  'tooltip':'Chart the MTBS burn severity by year'}
    areaChartCollections['mtbs_burn_mosaic'] = {'collection':ee.ImageCollection([mtbs.select([2]).mosaic().unmask(0).rename(['Burned']).set('Burned','All Mapped Burned Area (Total of Low, Moderate, and High Severity) ' +startYear.toString() + '-' + endYear.toString())]),
                                  'colors':['#CC5500'],
                                  'label':'MTBS Burned Area Total '+startYear.toString() + '-' + endYear.toString(),
                                  'stacked':true,
                                  'steppedLine':false,
                                  'chartType':'bar',
                                  'xAxisProperty':'Burned',
                                  'tooltip':'Chart the union of all burned areas (areas with low, moderate, or high severity) ' +startYear.toString() + '-' + endYear.toString()}
    areaChartCollections['mtbs_burn_severity_mosaic'] = {'collection':ee.ImageCollection([mtbsStack.max().unmask(0).set('Burned','Burn Severity Total ' +startYear.toString() + '-' + endYear.toString())]),
                                  'colors':Object.values(mtbsClassDict),
                                  'label':'MTBS Burn Severity Total '+startYear.toString() + '-' + endYear.toString(),
                                  'stacked':true,
                                  'steppedLine':false,
                                  'chartType':'bar',
                                  'xAxisProperty':'Burned',
                                  'tooltip':'Chart the union of burn severity ' +startYear.toString() + '-' + endYear.toString()+'. The maximum severity is used when fires overlap. '}
  }
  var mtbsMaxSeverity = mtbs.select([0]).max();
  if(chartMTBSByNLCD){
    
    
   var nlcdObj = getNLCDObj();
  
   // {'collection':nlcdC,'years':nlcdYears,'palette':nlcdLCPalette,'vizDict':nlcdLCVizDict,'queryDict':nlcdLCQueryDict,'legendDict':nlcdLegendDict,'legendDictReverse':nlcdLegendDictReverse}
   // var nlcd = nlcdObj.collection;
   // var nlcdYears = nlcdObj.years;

    

   Map2.addTimeLapse(nlcdObj.collection,{min:nlcdObj.min,max:nlcdObj.max,palette:Object.values(nlcdObj.vizDict),addToClassLegend: true,classLegendDict:nlcdObj.legendDictReverse,queryDict: nlcdObj.queryDict,years:nlcdObj.years},'NLCD Land Cover Time Lapse',false,null,null,'NLCD landcover classes ','reference-layer-list');
          
   nlcdObj.years.map(function(nlcdYear){
      // if(nlcdYear >= startYear  && nlcdYear <= mtbsEndYear){
        var nlcdT = nlcdObj.collection.filter(ee.Filter.calendarRange(nlcdYear,nlcdYear,'year')).mosaic();
        var mtbsByNLCD = Object.keys(nlcdObj.queryDict).map(function(k){
          var name = nlcdObj.queryDict[k];
          var out = mtbsMaxSeverity.updateMask(nlcdT.eq(ee.Number.parse(k))).set('nlcd_landcover_class',name);
          return out
         });
         mtbsByNLCD = ee.ImageCollection(mtbsByNLCD);
         var mtbsByNLCDStack = formatAreaChartCollection(mtbsByNLCD,Object.keys(mtbsQueryClassDict),Object.values(mtbsQueryClassDict),true);
          
         // Map2.addLayer(nlcdT.set('bounds',clientBoundsDict.All),{min:nlcdObj.min,max:nlcdObj.max,palette:Object.values(nlcdObj.vizDict),addToClassLegend: true,classLegendDict:nlcdObj.legendDictReverse,queryDict: nlcdObj.queryDict},'NLCD '+nlcdYear.toString(),false,null,null,'NLCD landcover classes for '+nlcdYear.toString(),'reference-layer-list');
          
          areaChartCollections['mtbsNLCD'+nlcdYear.toString()] = {'collection':mtbsByNLCDStack,
                                        'colors':Object.values(mtbsClassDict),
                                        'label':'MTBS Burn Severity by NLCD Class '+nlcdYear.toString(),
                                        'stacked':true,
                                        'steppedLine':false,
                                        'chartType':'bar',
                                        'xAxisProperty':'nlcd_landcover_class',
                                        'xAxisLabel':'NLCD '+nlcdYear.toString() + ' Class',
                                        'tooltip':'Chart MTBS burn severity by each NLCD '+nlcdYear.toString() + ' landcover class'}
          // }
      
       })
  }
  if(chartMTBSByAspect){
    var aspectObj = getAspectObj();
    var aspectBinned = aspectObj.image;
    var aspectLookupDict = aspectObj.lookupDict.getInfo();
    // var aspectColorDict = aspectObj.colorDict.getInfo();
    var mtbsByAspect = Object.keys(aspectLookupDict).map(function(k){
          var name = aspectLookupDict[k];
          var out = mtbsMaxSeverity.updateMask(aspectBinned.eq(ee.Number.parse(k))).set('Aspect_Bin',name);
          return out
         });
         mtbsByAspect = ee.ImageCollection(mtbsByAspect);
         var mtbsByAspectStack = formatAreaChartCollection(mtbsByAspect,Object.keys(mtbsQueryClassDict),Object.values(mtbsQueryClassDict),true);
         // console.log(mtbsByAspectStack.getInfo())
          // print(mtbsByAspectStack.getInfo())
    //      Map2.addLayer(nlcdT.set('bounds',clientBoundsDict.All),{min:nlcdObj.min,max:nlcdObj.max,palette:Object.values(nlcdObj.vizDict),addToClassLegend: true,classLegendDict:nlcdObj.legendDictReverse,queryDict: nlcdObj.queryDict},'NLCD '+nlcdYear.toString(),false,null,null,'NLCD landcover classes for '+nlcdYear.toString(),'reference-layer-list');
          
          areaChartCollections['mtbsAspect'] = {'collection':mtbsByAspectStack,
                                        'colors':Object.values(mtbsClassDict),
                                        'label':'MTBS Burn Severity by Aspect',
                                        'stacked':true,
                                        'steppedLine':false,
                                        'chartType':'bar',
                                        'xAxisProperty':'Aspect_Bin',
                                        'xAxisLabel':'Aspect Bin',
                                        'tooltip':'Chart MTBS burn severity by aspect quadrants.'}
  }

// print(mtbsStack.getInfo());
  var severityViz = {layerType:'geeImage','queryDict': mtbsQueryClassDict,'min':1,'max':6,'palette':'006400,7fffd4,ffff00,ff0000,7fff00,ffffff',addToClassLegend: true,classLegendDict:mtbsClassDict}
  Map2.addLayer(mtbsSummarized.select([0]).set('bounds',clientBoundsDict.All),severityViz,'MTBS Burn Severity',showSeverity,null,null,'MTBS '+mtbsSummaryMethod+' burn severity mosaic from '+startYear.toString() + '-' + mtbsEndYear.toString(),whichLayerList)
  Map2.addLayer(mtbsSummarized.select([4]).set('bounds',clientBoundsDict.All),{min:startYear,max:endYear,palette:declineYearPalette,layerType:'geeImage'},'MTBS Burn Year',false,null,null,'MTBS '+mtbsSummaryMethod+' burn year from '+startYear.toString() + '-' + mtbsEndYear.toString(),whichLayerList)  
  Map2.addLayer(mtbsCount.set('bounds',clientBoundsDict.All),{layerType:'geeImage',min:1,max:5,palette:declineDurPalette.split(',').reverse().join(','),legendLabelLeft:'Count =',legendLabelRight:'Count >='},'MTBS Burn Count',false,null,null,'MTBS number of burns mapped for a given area from '+startYear.toString() + '-' + mtbsEndYear.toString() + ' with a burn serverity class of low, moderate, or high',whichLayerList)  
  
  var chartTableDict = {
    'Burn Severity':mtbsQueryClassDict
  }
  return {'NLCD':nlcdObj,
  'MTBS':{'collection':mtbs.set('bounds',clientBoundsDict.All).select([0],['Burn Severity']).set('chartTableDict',chartTableDict)},
  'MTBSSeverityViz':severityViz};
}
function getMTBSandIDS(studyAreaName,whichLayerList){
  if(whichLayerList === null || whichLayerList === undefined){whichLayerList = 'reference-layer-list'};
  var idsCollections = getIDSCollection();
  
    var mtbs_path = 'projects/USFS/DAS/MTBS/BurnSeverityMosaics';
   
  

  // var ned = ee.Image('USGS/NED');
  // var hillshade = ee.Terrain.hillshade(ned);
  // Map2.addLayer(hillshade,{min:0,max:255},'hillshade')
  var nlcd = ee.ImageCollection('USGS/NLCD_RELEASES/2016_REL');
  // Map2.addLayer(ee.Image(0),{min:0,max:0,palette:'000',opacity:0.8});
  [2016].map(function(yr){
    var tcc = nlcd.filter(ee.Filter.calendarRange(yr,yr,'year')).select(['percent_tree_cover']).mosaic();
  Map2.addLayer(tcc.updateMask(tcc.gte(1)).set('bounds',clientBoundsDict.CONUS),{min:1,max:90,palette:palettes.crameri.bamako[50].reverse()},'NLCD Tree Canopy Cover '+yr.toString(),false,null,null, 'NLCD '+yr.toString()+' Tree Canopy Cover',whichLayerList);

  })
  
  
  var idsYr = idsCollections.featureCollection.reduceToImage(['SURVEY_YEA'],ee.Reducer.max()).set('bounds',clientBoundsDict.CONUS);
  var idsCount = idsCollections.featureCollection.reduceToImage(['SURVEY_YEA'],ee.Reducer.count()).selfMask().set('bounds',clientBoundsDict.CONUS);
  Map2.addLayer(idsCount,{'min':1,'max':Math.ceil((idsEndYear-idsStartYear)/2)+1,palette:declineYearPalette},'IDS Survey Count',false,null,null, 'Number of times an area was included in the IDS survey ('+idsStartYear.toString()+'-'+idsEndYear.toString()+')',whichLayerList);
  Map2.addLayer(idsYr,{min:startYear,max:endYear,palette:declineYearPalette},'IDS Most Recent Year Surveyed',false,null,null, 'Most recent year an area was included in the IDS survey ('+idsStartYear.toString()+'-'+idsEndYear.toString()+')',whichLayerList);
  Map2.addLayer(idsCollections.featureCollection.set('bounds',clientBoundsDict.CONUS),{strokeColor:'0FF',layerType:'geeVectorImage'},'IDS Polygons',false,null,null, 'Polygons from the IDS survey ('+idsStartYear.toString()+'-'+idsEndYear.toString()+')',whichLayerList);
  
  // Map2.addLayer(idsCollection.select(['IDS Mort Type']).count().set('bounds',clientBoundsDict.All),{'min':1,'max':Math.floor((idsEndYear-idsStartYear)/4),palette:declineYearPalette},'IDS Mortality Survey Count',false,null,null, 'Number of times an area was recorded as mortality by the IDS survey',whichLayerList);
  // Map2.addLayer(idsCollection.select(['IDS Mort Type Year']).max().set('bounds',clientBoundsDict.All),{min:startYear,max:endYear,palette:declineYearPalette},'IDS Most Recent Year of Mortality',false,null,null, 'Most recent year an area was recorded as mortality by the IDS survey',whichLayerList);
  
  // Map2.addLayer(idsCollection.select(['IDS Defol Type']).count().set('bounds',clientBoundsDict.All),{'min':1,'max':Math.floor((idsEndYear-idsStartYear)/4),palette:declineYearPalette},'IDS Defoliation Survey Count',false,null,null, 'Number of times an area was recorded as defoliation by the IDS survey',whichLayerList);
  // Map2.addLayer(idsCollection.select(['IDS Defol Type Year']).max().set('bounds',clientBoundsDict.All),{min:startYear,max:endYear,palette:declineYearPalette},'IDS Most Recent Year of Defoliation',false,null,null, 'Most recent year an area was recorded as defoliation by the IDS survey',whichLayerList);
  
  var mtbs =getMTBSAndNLCD(studyAreaName,whichLayerList).MTBS.collection
  return [mtbs,idsCollections.imageCollection,idsCollections.featureCollection]
}
function getNAIP(whichLayerList){
  if(whichLayerList === null || whichLayerList === undefined){whichLayerList = 'reference-layer-list'};
  var naipYears = [[2003,2007],
                [2008,2008],
                [2009,2011],
                [2012,2014],
                [2015,2017],
                [2018,2020]];

  var naip = ee.ImageCollection("USDA/NAIP/DOQQ").select([0,1,2],['R','G','B']);
  // naip = naip.map(function(img){
  //   var y = ee.Date(img.get('system:time_start')).get('year');
  //   y = ee.Image(y).rename(['NAIP Year']);
  //   var out = img.addBands(y).copyProperties(img,['system:time_start']);
  //   return out

  // })
  naipYears.map(function(yr){
    
    var naipT = naip.filter(ee.Filter.calendarRange(yr[0],yr[1],'year')).mosaic().byte().set('bounds',clientBoundsDict.CONUS);
   
    Map2.addLayer(naipT,{'addToLegend':false,'min':25,'max':225,'layerType':'geeImage'},'NAIP ' + yr[0].toString()+ '-'+yr[1].toString(),false,null,null,'The National Agriculture Imagery Program (NAIP) acquired aerial imagery from the '+yr[0].toString()+' to the ' + yr[1].toString() +' agricultural growing season in the continental U.S.',whichLayerList);
  });

}
function getHansen(whichLayerList){
  if(whichLayerList === null || whichLayerList === undefined){whichLayerList = 'reference-layer-list'};
  var hansen = ee.Image("UMD/hansen/global_forest_change_2020_v1_8").reproject('EPSG:4326',null,30);

  var hansenClientBoundary = {"type":"Polygon","coordinates":[[[-180,-90],[180,-90],[180,90],[-180,90],[-180,-90]]]};//hansen.geometry().bounds(1000).getInfo();
  // print(hansenClientBoundary);
  var hansenLoss = hansen.select(['lossyear']).selfMask().add(2000).int16();
  var hansenStartYear = 2001;
  var hansenEndYear = 2020;

  if(startYear > hansenStartYear){hansenStartYear = startYear};
  if(endYear < hansenEndYear){hansenEndYear = endYear};
  // console.log([hansenStartYear,hansenEndYear])
  // var hansenYears = ee.List.sequence(hansenStartYear,hansenEndYear);
  // var hansenC =ee.ImageCollection.fromImages(hansenYears.map(function(yr){
  //   yr = ee.Number(yr);
  //   var t = ee.Image(yr).updateMask(hansenLoss.eq(yr)).set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
  //   return t;
  // }));
  // var hansenYearsCli = hansenYears.getInfo();
  // Map2.addTimeLapse(hansenC,{min:startYear,max:endYear,palette:declineYearPalette,years:hansenYearsCli},'Hansen Loss Time Lapse',false,null,null,'Hansen Global Forest Change year of loss',whichLayerList)
  var hansenGain = hansen.select(['gain']);
  hansenLoss = hansenLoss.updateMask(hansenLoss.gte(startYear).and(hansenLoss.lte(endYear)));
  Map2.addLayer(hansenLoss.set('bounds',hansenClientBoundary),{'min':startYear,'max':endYear,'palette':declineYearPalette},'Hansen Loss Year',false,null,null,'Hansen Global Forest Change year of loss',whichLayerList);
  Map2.addLayer(hansenGain.updateMask(hansenGain).set('bounds',hansenClientBoundary),{'min':1,'max':1,'palette':'0A0',addToClassLegend: true,classLegendDict:{'Forest Gain':'0A0'}},'Hansen Gain',false,null,null,'Hansen Global Forest Change gain',whichLayerList);

}
function getNLCD(){
  var nlcd = ee.ImageCollection('USGS/NLCD_RELEASES/2016_REL').select([0]);

  var nlcdForClasses = ee.Image('USGS/NLCD_RELEASES/2016_REL/2011');
  var names = nlcdForClasses.get('landcover_class_names');
  var palette = nlcdForClasses.get('landcover_class_palette');
  var values = nlcdForClasses.get('landcover_class_values').getInfo().map(function(i){return i.toString()});

  var classDict = ee.Dictionary.fromLists(values, palette).getInfo();
  print(classDict);
  var years = nlcd.toList(1000).map(function(i){
    i = ee.Image(i);
    var d = ee.Date(i.get('system:time_start'));
    var y = d.get('year');
    return y;
  }).getInfo();
  var yearsU = [];
  years.map(function(y){if(yearsU.indexOf(y) == -1){yearsU.push(y)}});

  var nlcdMosaic = yearsU.map(function(y){
    var nlcdT = nlcd.filter(ee.Filter.calendarRange(y,y,'year')).mosaic();
    return nlcdT.set('system:time_start',ee.Date.fromYMD(y,6,1).millis());
  });
  nlcdMosaic = ee.ImageCollection(nlcdMosaic);
  Map2.addLayer(nlcdMosaic.mode(),{addToClassLegend: true,classLegendDict:classDict},'NLCD');
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
function ltStackToFitted(ltStack,startYear,endYear){
  ltStack = ltStack.updateMask(ltStack.neq(0));
  var yearImg = ltStack.select(['yrs_vert_.*']);
  var fitImg = ltStack.select(['fit_vert_.*']).multiply(0.0001);
  
  var segLength = yearImg.bandNames().length();
  var segList = ee.List.sequence(0,segLength.subtract(1));
  var segListLeft = segList.slice(0,-1);
  var segListRight = segList.slice(1,null);
  
  var yearImgLeft = yearImg.select(segListLeft);
  var yearImgRight = yearImg.select(segListRight);
  
  var fitImgLeft = fitImg.select(segListLeft);
  var fitImgRight = fitImg.select(segListRight);
  
  var fitImgDiff = fitImgRight.subtract(fitImgLeft);
  var yearImgDiff = yearImgRight.subtract(yearImgLeft);
  
  var slope = fitImgDiff.divide(yearImgDiff);
  
  var out = ee.List.sequence(startYear+1,endYear).map(function(yr){
    yr = ee.Number(yr);
    var yearMaskLeft= yearImgLeft.lte(yr);
    var yearMaskRight= yearImgRight.gte(yr);
    var startVertexYear = yearImgLeft.updateMask(yearMaskLeft).reduce(ee.Reducer.max());
    var endVertexYear = yearImgRight.updateMask(yearMaskRight).reduce(ee.Reducer.min());
    
    var segDur = endVertexYear.subtract(startVertexYear);
    var segMag = fitImgDiff.updateMask(yearImgRight.eq(endVertexYear)).reduce(ee.Reducer.firstNonNull());
    
    var slopeT = slope.updateMask(yearImgRight.eq(endVertexYear)).reduce(ee.Reducer.firstNonNull());
    var fitImgRightT= fitImgRight.updateMask(yearImgRight.eq(endVertexYear)).reduce(ee.Reducer.firstNonNull());
    var yearDiffFromStart = ee.Image(yr).subtract(startVertexYear);
    var yearDiffFromEnd = endVertexYear.subtract(yr);
    
    var diffFromVertexStart = yearDiffFromStart.multiply(slopeT);
    var diffFromVertexEnd = yearDiffFromEnd.multiply(slopeT);
    
    var fitted = fitImgRightT.subtract(diffFromVertexEnd);
    return segDur.rename(['dur']).addBands(fitted.rename('fit')).addBands(segMag.rename(['mag'])).addBands(slopeT.rename(['slope'])).addBands(diffFromVertexStart.rename(['diff'])).set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
  });
  out = ee.ImageCollection.fromImages(out);
  return out;
}
function setupDownloads(studyAreaName){
  // Prep downloads
  console.log('setting up downloads')
    var saDict = lcmsDownloadDict[studyAreaName]
    if(saDict !== undefined){
      var downloads = saDict['downloads'];
      var description = saDict['description'];
      downloads.map(function(url){
        var name = url.substr(url.lastIndexOf('/') + 1);
        addDownload(url,name);
      });
      $('#product-descriptions').attr('href',description);
      $('#product-descriptions').attr('title','Click here for a detailed description of products available for download for chosen area');
    }else{
      addDownload('','No downloads available for chosen study area');
      $('#product-descriptions').attr('href',null);
      $('#product-descriptions').attr('title','No product description available for chosen study area');
    }
    

}
function setupDropdownTreeDownloads(studyAreaName){
  var studyAreas = ['CONUS','SEAK','PRUSVI'];
  var products = {'change':['annual','summary'],'land_cover':['annual'],'land_use':['annual'],'qa_bits':['annual']};
  var saDict = lcmsDownloadDict[studyAreaName]
  if(saDict !== undefined){
    var downloads = saDict['downloads'];
    studyAreas.map(function(sa){
      Object.keys(products).map(function(product){
        products[product].map(function(m){
          try{
            var download_list = downloads[sa][product][m];
            // console.log(download_list)
            var id = `${sa}-${product}-${m}-downloads`;
            var dropdownID = id + '-d';
            // console.log(dropdownID)
            $('#'+id).empty();
            // console.log(id)
            $('#'+id).append(`
              <label  title = 'Choose from list below to download LCMS products. Hold ctrl key to select multiples or shift to select blocks. There can be a small delay before a download will begin, especially over slower networks.' for="${dropdownID}">Select products to download:</label>
                              <select id = "${dropdownID}" size="8" style="height: 100%;" class=" bg-download-select" multiple ></select>
                              <br>
                              <button title = 'Click on this button to start downloads. If you have a popup blocker, you will need the manually click on the download links provided' class = 'btn' onclick = 'downloadSelectedAreas("${dropdownID}")'>Download</button>
                              <hr>`)
            download_list.map(function(url){
              var name = url.substr(url.lastIndexOf('v20') + 8);
              $('#'+dropdownID).append(`<option  value = "${url}">${name}</option>`);
            })
          }catch(err){console.log(err)}
        })
      })
    })
  }
  // $('select').selectpicker();
  // var saDict = lcmsDownloadDict[studyAreaName]
  //   if(saDict !== undefined){
  //     var downloads = saDict['downloads'];
  //     console.log(downloads)
  //     var description = saDict['description'];
  //     // downloads.map(function(url){
  //     //   var name = url.substr(url.lastIndexOf('/') + 1);
  //     //   addDownload(url,name);
  //     // });
  //     // $('#product-descriptions').attr('href',description);
  //     // $('#product-descriptions').attr('title','Click here for a detailed description of products available for download for chosen area');
  //   }else{
  //     addDownload('','No downloads available for chosen study area');
  //     $('#product-descriptions').attr('href',null);
  //     $('#product-descriptions').attr('title','No product description available for chosen study area');
  //   }
}

/////////////////////////////////////////////////////////////////////////////
//-------------------- BEGIN CCDC Helper Functions -------------------//
/////////////////////////////////////////////////////////////////////////////
//Function to predict a CCDC harmonic model at a given time
//The whichHarmonics options are [1,2,3] - denoting which harmonics to include
//Which bands is a list of the names of the bands to predict across
function simpleCCDCPrediction(img,timeBandName,whichHarmonics,whichBands){
  //Unit of each harmonic (1 cycle)
  var omega = ee.Number(2.0).multiply(Math.PI);
  
  //Pull out the time band in the yyyy.ff format
  var tBand = img.select([timeBandName]);
  
  //Pull out the intercepts and slopes
  var intercepts = img.select(['.*_INTP']);
  var slopes = img.select(['.*_SLP']).multiply(tBand);
  
  //Set up the omega for each harmonic for the given time band
  var tOmega = ee.Image(whichHarmonics).multiply(omega).multiply(tBand);
  var cosHarm = tOmega.cos();
  var sinHarm = tOmega.sin();
  
  //Set up which harmonics to select
  var harmSelect = whichHarmonics.map(function(n){return ee.String('.*').cat(ee.Number(n).format())});
  
  //Select the harmonics specified
  var sins = img.select(['.*_SIN.*']);
  sins = sins.select(harmSelect);
  var coss = img.select(['.*_COS.*']);
  coss = coss.select(harmSelect);
  
  //Set up final output band names
  var outBns = whichBands.map(function(bn){return ee.String(bn).cat('_predicted')});
  
  //Iterate across each band and predict value
  var predicted = ee.ImageCollection(whichBands.map(function(bn){
    bn = ee.String(bn);
    return ee.Image([intercepts.select(bn.cat('_.*')),
                    slopes.select(bn.cat('_.*')),
                    sins.select(bn.cat('_.*')).multiply(sinHarm),
                    coss.select(bn.cat('_.*')).multiply(cosHarm)
                    ]).reduce(ee.Reducer.sum());
  })).toBands().rename(outBns);
  return img.addBands(predicted);
}
/////////////////////////////////////////////////////////////
//Wrapper to predict CCDC values from a collection containing a time image and ccdc coeffs
//It is also assumed that the time format is yyyy.ff where the .ff is the proportion of the year
//The whichHarmonics options are [1,2,3] - denoting which harmonics to include
function simpleCCDCPredictionWrapper(c,timeBandName,whichHarmonics){
  var whichBands = ee.Image(c.first()).select(['.*_INTP']).bandNames().map(function(bn){return ee.String(bn).split('_').get(0)});
  whichBands = ee.Dictionary(whichBands.reduce(ee.Reducer.frequencyHistogram())).keys().getInfo();
  var out = c.map(function(img){return simpleCCDCPrediction(img,timeBandName,whichHarmonics,whichBands)});
  return out;
}
////////////////////////////////////////////////////////////////////////////////////////
function simpleGetTimeImageCollection(startYear,endYear,step){
  var yearImages = ee.ImageCollection(ee.List.sequence(startYear,endYear,step).map(function(n){
    n = ee.Number(n);
    var img = ee.Image(n).float().rename(['year']);
    var y = n.int16();
    var fraction = n.subtract(y);
    var d = ee.Date.fromYMD(y,1,1).advance(fraction,'year').millis();
    return img.set('system:time_start',d);
  }));
  return yearImages
}
////////////////////////////////////////////////////////////////////////////////////////
//Function to get the coeffs corresponding to a given date on a pixel-wise basis
//The raw CCDC image is expected
//It is also assumed that the time format is yyyy.ff where the .ff is the proportion of the year
function getCCDCSegCoeffs(timeImg,ccdcImg,fillGaps){
  var coeffKeys = ['.*_coefs'];
  var tStartKeys = ['tStart'];
  var tEndKeys = ['tEnd'];
  var tBreakKeys = ['tBreak'];
  
  //Get coeffs and find how many bands have coeffs
  var coeffs = ccdcImg.select(coeffKeys);
  var bns = coeffs.bandNames();
  var nBns = bns.length();
  var harmonicTag = ee.List(['INTP','SLP','COS1','SIN1','COS2','SIN2','COS3','SIN3']);

   
  //Get coeffs, start and end times
  coeffs = coeffs.toArray(2);
  var tStarts = ccdcImg.select(tStartKeys);
  var tEnds = ccdcImg.select(tEndKeys);
  var tBreaks = ccdcImg.select(tBreakKeys);
  
  //If filling to the tBreak, use this
  tStarts = ee.Image(ee.Algorithms.If(fillGaps,tStarts.arraySlice(0,0,1).arrayCat(tBreaks.arraySlice(0,0,-1),0),tStarts));
  tEnds = ee.Image(ee.Algorithms.If(fillGaps,tBreaks.arraySlice(0,0,-1).arrayCat(tEnds.arraySlice(0,-1,null),0),tEnds));
  
  
  //Set up a mask for segments that the time band intersects
  var tMask = tStarts.lt(timeImg).and(tEnds.gte(timeImg)).arrayRepeat(1,1).arrayRepeat(2,1);
  coeffs = coeffs.arrayMask(tMask).arrayProject([2,1]).arrayTranspose(1,0).arrayFlatten([bns,harmonicTag]);
  
  //If time band doesn't intersect any segments, set it to null
  coeffs = coeffs.updateMask(coeffs.reduce(ee.Reducer.max()).neq(0));
  
  return timeImg.addBands(coeffs);
}
////////////////////////////////////////////////////////////////////////////////////////
//      Functions for Annualizing CCDC:

////////////////////////////////////////////////////////////////////////////////////////
//Wrapper function for predicting CCDC across a set of time images
function predictCCDC(ccdcImg,timeImgs,fillGaps,whichHarmonics){//,fillGapBetweenSegments,addRMSE,rmseImg,nRMSEs){
  var timeBandName = ee.Image(timeImgs.first()).select([0]).bandNames().get(0);
  // Add the segment-appropriate coefficients to each time image
  timeImgs = timeImgs.map(function(img){return getCCDCSegCoeffs(img,ccdcImg,fillGaps)});

  //Predict across each time image
  return simpleCCDCPredictionWrapper(timeImgs,timeBandName,whichHarmonics);
}
////////////////////////////////////////////////////////////////////////////////////////
//Function for getting change years and magnitudes for a specified band from CCDC outputs
//Only change from the breaks is extracted
//As of now, if a segment has a high slope value, this method will not extract that 
function ccdcChangeDetection(ccdcImg,bandName){
  var magKeys = ['.*_magnitude'];
  var tBreakKeys = ['tBreak'];
  var changeProbKeys = ['changeProb'];
  var changeProbThresh = 1;
  //Pull out pieces from CCDC output
  var magnitudes = ccdcImg.select(magKeys);
  var breaks = ccdcImg.select(tBreakKeys);
  
  // Map.addLayer(breaks.arrayLength(0),{min:1,max:10});
  var changeProbs = ccdcImg.select(changeProbKeys);
  var changeMask = changeProbs.gte(changeProbThresh);
  magnitudes = magnitudes.select(bandName + '.*');

  
  //Sort by magnitude and years
  var breaksSortedByMag = breaks.arraySort(magnitudes);
  var magnitudesSortedByMag = magnitudes.arraySort();
  var changeMaskSortedByMag = changeMask.arraySort(magnitudes);
  
  var breaksSortedByYear = breaks.arraySort();
  var magnitudesSortedByYear = magnitudes.arraySort(breaks);
  var changeMaskSortedByYear = changeMask.arraySort(breaks);
  
  //Get the loss and gain years and magnitudes for each sorting method
  var highestMagLossYear = breaksSortedByMag.arraySlice(0,0,1).arrayFlatten([['loss_year']]);
  var highestMagLossMag = magnitudesSortedByMag.arraySlice(0,0,1).arrayFlatten([['loss_mag']]);
  var highestMagLossMask = changeMaskSortedByMag.arraySlice(0,0,1).arrayFlatten([['loss_mask']]);
  
  highestMagLossYear = highestMagLossYear.updateMask(highestMagLossMag.lt(0).and(highestMagLossMask));
  highestMagLossMag = highestMagLossMag.updateMask(highestMagLossMag.lt(0).and(highestMagLossMask));
  
  var highestMagGainYear = breaksSortedByMag.arraySlice(0,-1,null).arrayFlatten([['gain_year']]);
  var highestMagGainMag = magnitudesSortedByMag.arraySlice(0,-1,null).arrayFlatten([['gain_mag']]);
  var highestMagGainMask = changeMaskSortedByMag.arraySlice(0,-1,null).arrayFlatten([['gain_mask']]);
  
  highestMagGainYear = highestMagGainYear.updateMask(highestMagGainMag.gt(0).and(highestMagGainMask));
  highestMagGainMag = highestMagGainMag.updateMask(highestMagGainMag.gt(0).and(highestMagGainMask));
  
  var mostRecentLossYear = breaksSortedByYear.arraySlice(0,0,1).arrayFlatten([['loss_year']]);
  var mostRecentLossMag = magnitudesSortedByYear.arraySlice(0,0,1).arrayFlatten([['loss_mag']]);
  var mostRecentLossMask = changeMaskSortedByYear.arraySlice(0,0,1).arrayFlatten([['loss_mask']]);
  
  mostRecentLossYear = mostRecentLossYear.updateMask(mostRecentLossMag.lt(0).and(mostRecentLossMask));
  mostRecentLossMag = mostRecentLossMag.updateMask(mostRecentLossMag.lt(0).and(mostRecentLossMask));
  
  var mostRecentGainYear = breaksSortedByYear.arraySlice(0,-1,null).arrayFlatten([['gain_year']]);
  var mostRecentGainMag = magnitudesSortedByYear.arraySlice(0,-1,null).arrayFlatten([['gain_mag']]);
  var mostRecentGainMask = changeMaskSortedByYear.arraySlice(0,-1,null).arrayFlatten([['gain_mask']]);
  
  mostRecentGainYear = mostRecentGainYear.updateMask(mostRecentGainMag.gt(0).and(mostRecentGainMask));
  mostRecentGainMag = mostRecentGainMag.updateMask(mostRecentGainMag.gt(0).and(mostRecentGainMask));
  
  return {mostRecent:{
    loss:{year:mostRecentLossYear,
          mag: mostRecentLossMag
        },
    gain:{year:mostRecentGainYear,
          mag: mostRecentGainMag
        }
    },
    highestMag:{
    loss:{year:highestMagLossYear,
          mag: highestMagLossMag
        },
    gain:{year:highestMagGainYear,
          mag: highestMagGainMag
        }
    }    
  };
  
}

function getSelectLayers(short){
  var perims = ee.FeatureCollection('projects/gtac-mtbs/assets/perimeters/mtbs_perims_DD');//ee.FeatureCollection('projects/USFS/DAS/MTBS/mtbs_perims_DD');
  perims = perims.map(function(f){
    var d = ee.Date(f.get('Ig_Date'));
    
    return f.set({'Year':d.get('year')})
  })
  // perims = ee.FeatureCollection(perims.copyProperties(mtbs,['bounds']));
  // console.log(perims.get('bounds').getInfo())
  perims = perims.filter(ee.Filter.gte('Year',startYear));
  perims = perims.filter(ee.Filter.lte('Year',endYear));
  var huc4 = ee.FeatureCollection('USGS/WBD/2017/HUC04');
  var huc8 = ee.FeatureCollection('USGS/WBD/2017/HUC08');
  var huc12 = ee.FeatureCollection('USGS/WBD/2017/HUC12');
  var wdpa = ee.FeatureCollection("WCMC/WDPA/current/polygons");
  var wilderness = wdpa.filter(ee.Filter.eq('DESIG', 'Wilderness'));
  var counties = ee.FeatureCollection('TIGER/2018/Counties');
  var tiles  = ee.FeatureCollection("users/jdreynolds33/Zones_New");
  var bia = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/bia_bounds_2017');
  var ecoregions_subsections = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/Baileys_Ecoregions_Subsections');
  ecoregions_subsections = ecoregions_subsections.select(['MAP_UNIT_N'], ['NAME'], true);
  var ecoregions = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/Baileys_Ecoregions');
  ecoregions = ecoregions.select(['SECTION'],['NAME'])
  var ecoregionsEPAL4 = ee.FeatureCollection('EPA/Ecoregions/2013/L4');
  var district_boundaries = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_District_Boundaries');
  district_boundaries = district_boundaries.select(['DISTRICTNA'],['name']);
  var msas = ee.FeatureCollection('projects/lcms-292214/assets/CONUS-Ancillary-Data/TIGER_Urban_Areas_2018');
  var msas2 = ee.FeatureCollection('projects/lcms-292214/assets/CONUS-Ancillary-Data/TIGER_MSA_2019')
  if(short === null || short === undefined || short === false){
    // Map2.addSelectLayer(tiles,{strokeColor:'BB0',layerType:'geeVectorImage'},'TCC Processing Tiles',false,null,null,'TCC Processing Tiles. Turn on layer and click on any area wanted to include in chart');

    Map2.addSelectLayer(bia,{strokeColor:'0F0',layerType:'geeVectorImage'},'BIA Boundaries',false,null,null,'BIA boundaries. Turn on layer and click on any area wanted to include in chart');

    Map2.addSelectLayer(huc12,{strokeColor:'00F',layerType:'geeVectorImage'},'HUC 12',false,null,null,'HUC 12 watershed boundaries. Turn on layer and click on any HUC 12 wanted to include in chart');
    
    Map2.addSelectLayer(ecoregions,{strokeColor:'8F8',layerType:'geeVectorImage'},"Baileys Ecoregions Sections",false,null,null,'Baileys ecoregion sections. Turn on layer and click on any ecoregion wanted to include in chart');
    
    Map2.addSelectLayer(ecoregions_subsections,{strokeColor:'8F0',layerType:'geeVectorImage'},"Baileys Ecoregions Subsections",false,null,null,'Baileys ecoregions subsections. Turn on layer and click on any ecoregion wanted to include in chart');
    Map2.addSelectLayer(ee.FeatureCollection("EPA/Ecoregions/2013/L3"),{strokeColor:'8F8',layerType:'geeVectorImage'},"Level 3 EPA Ecoregions",false,null,null,'Omernik and Griffith 2014 Level 3 EPA Ecoregions. Turn on layer and click on any ecoregion wanted to include in chart');
    Map2.addSelectLayer(ee.FeatureCollection("EPA/Ecoregions/2013/L4"),{strokeColor:'8FD',layerType:'geeVectorImage'},"Level 4 EPA Ecoregions",false,null,null,'Omernik and Griffith 2014 Level 4 EPA Ecoregions. Turn on layer and click on any ecoregion wanted to include in chart');
    
    
    // Map2.addSelectLayer(usfs_regions,{strokeColor:'0F0',layerType:'geeVectorImage'},'National Forest Regions',false,null,null,'National Forest regional boundaries. Turn on layer and click on any Region wanted to include in chart');

    
    // Map2.addSelectLayer(wilderness,{strokeColor:'80F',layerType:'geeVectorImage'},'Wilderness',false,null,null,'Wilderness boundaries. Turn on layer and click on any winderness wanted to include in chart');
    
    // Map2.addSelectLayer(b,{strokeColor:'00F',layerType:'geeVectorImage'},'National Forests2',false,null,null,'National Forest boundaries. Turn on layer and click on any Forest wanted to include in chart');
    
    // Map2.addSelectLayer(nps,{strokeColor:'F0F',layerType:'geeVectorImage'},'National Parks',false,null,null,'National Park boundaries. Turn on layer and click on any Park wanted to include in chart');

    

    Map2.addSelectLayer(otherLands,{strokeColor:'DD0',layerType:'geeVectorImage'},'Other Designated Lands',false,null,null,'A boundary within which National Forest System land parcels have managment or use limits placed on them by legal authority. Examples are: National Recreation Area, National Monument, and National Game Refuge. Turn on layer and click on any Park wanted to include in chart');
    Map2.addSelectLayer(ee.FeatureCollection("TIGER/2018/States"),{strokeColor:'AD0',layerType:'geeVectorImage'},'US States and Territories',false,null,null,'2018 TIGER state and territory boundaries for the United States. Turn on layer and click on any state/territory wanted to include in chart');
  }
  Map2.addSelectLayer(counties,{strokeColor:'08F',layerType:'geeVectorImage'},'US Counties',false,null,null,'US Counties from 2018 TIGER data. Turn on layer and click on any county wanted to include in chart');

  Map2.addSelectLayer(msas,{strokeColor:'88F',layerType:'geeVectorImage'},'US Census Urban Areas',false,null,null,'TIGER, 2018, U.S. Urban Areas (https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_us_ua10_500k.zip). Turn on layer and click on any county wanted to include in chart');
  // Map2.addSelectLayer(msas2,{strokeColor:'88F',layerType:'geeVectorImage'},'US Census Urban Areas',false,null,null,'TIGER, 2018, U.S. MSAs  (https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_us_ua10_500k.zip). Turn on layer and click on any county wanted to include in chart');
  Map2.addSelectLayer(nps,{strokeColor:'F0F',layerType:'geeVectorImage'},'National Parks',false,null,null,'National Park boundaries. Turn on layer and click on any Park wanted to include in chart');
  Map2.addSelectLayer(b,{strokeColor:'00F',layerType:'geeVectorImage'},'National Forests',false,null,null,'National Forest boundaries. Turn on layer and click on any Forest wanted to include in chart');
  
  Map2.addSelectLayer(district_boundaries,{strokeColor:'80F',layerType:'geeVectorImage'},'National Forest Districts',false,null,null,'National Forest District boundaries. Turn on layer and click on any Forest wanted to include in chart');
  Map2.addSelectLayer(perims,{strokeColor:'808',layerType:'geeVectorImage'},'MTBS Fires',false,null,null,'Delineated perimeters of each MTBS mapped fire from '+startYear.toString()+'-'+endYear.toString()+'. Turn on layer and click on any fire wanted to include in chart');
  
}