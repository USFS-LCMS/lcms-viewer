
//----------------------------------------------------------------------------------------------------------------
//                                 Parameters, Definitions, Palettes
//---------------------------------------------------------------------------------------------------------------
var run;

var warningShown = false;

//------------Main Function to Run National Forest Products------------------------------------------------
function runUSFS(){
    startYear = parseInt(urlParams.startYear);
    endYear = parseInt(urlParams.endYear);
    analysisMode = urlParams.analysisMode;
    queryClassDict = {};
    summaryMethod = urlParams.summaryMethod;
    var years = ee.List.sequence(startYear,endYear).getInfo();

    getLCMSVariables();
    setupDownloads(studyAreaName);

  
    

    // Paths / definitions
    // var ts = ee.ImageCollection(collectionDict[studyAreaName][5]);
    var boundary = ee.FeatureCollection(studyAreaDict[longStudyAreaName].studyAreaBoundary);
    
    
    if(localStorage.studyAreaBounds === undefined || localStorage.studyAreaBounds === null){
      localStorage.studyAreaBounds = JSON.stringify({});
    }
    var cachedBounds = JSON.parse(localStorage.studyAreaBounds);
    if(cachedBounds[studyAreaName] === null || cachedBounds[studyAreaName] === undefined){
      console.log('finding bounds');
      cachedBounds[studyAreaName] = boundary.geometry().bounds().getInfo();
      localStorage.studyAreaBounds= JSON.stringify(cachedBounds);
       console.log('found bounds');
    }
    var clientBoundary = cachedBounds[studyAreaName];
   
    
   
    var landtrendr_format = studyAreaDict[longStudyAreaName].ltFormat;

    // Initial load & format of LCMS Layers
    var rawC = ee.ImageCollection(studyAreaDict[longStudyAreaName].lcmsCollection);
  

    // if(studyAreaName !== 'CNFKP' && studyAreaName !== 'FNF'){
    //   rawC = rawC.map(function(img){
    //     var lc = img.select([0]);
    //     lc = lc.remap([0,1,2,3,4,5,6],[4,5,3,6,2,7,1]).rename(['LC']);
    //     return img.select([1,2,3,4,5,6]).addBands(lc).select([6,0,1,2,3,4,5]).byte();
    //   })
    // }

    // print(rawC.getInfo());
    var NFSLCMS = rawC
                  // .filter(ee.Filter.stringContains('system:index','DNDSlow-DNDFast'))
                  .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
                  .select(['LC','LU','DND','RNR','DND_Slow','DND_Fast'])
                  .map(function(img){return ee.Image(additionBands(img,[0,1,0,0,0,0]))})
                  .map(function(img){return ee.Image(multBands(img,1,[0.1,0.1,0.01,0.01,0.01,0.01])).float()})
                  .select([0,1,2,3,4,5],['Land Cover Class','Land Use Class','Loss Probability','Gain Probability','Slow Loss Probability','Fast Loss Probability']);
    // var NFSLCMSold = ee.ImageCollection(collectionDict[studyAreaName][1])
    //               .filter(ee.Filter.stringContains('system:index','DNDSlow-DNDFast').not())
    //               .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
    //               .map(function(img){return ee.Image(additionBands(img,[1,1,1,0,0]))})
    //               .map(function(img){return ee.Image(multBands(img,1,[0.1,0.1,0.1,0.01,0.01])).float()})
    //               .select([0,1,2,3,4],['Land Cover Class','Land Use Class','Change Process','Decline Probability','Recovery Probability']);

    var lcJSON = JSON.parse(NFSLCMS.get('landcoverJSON').getInfo());
    var luJSON = JSON.parse(NFSLCMS.get('landuseJSON').getInfo());
    
    var lcJSONFlipped = {};
    var luJSONFlipped = {};
    Object.keys(lcJSON).map(function(k){lcJSONFlipped[lcJSON[k]['name']] = parseInt(k)});
    Object.keys(luJSON).map(function(k){luJSONFlipped[luJSON[k]['name']] = parseInt(k)});
    var rawLC = rawC
                .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
                .select([0],['LC']);
    var rawLU = rawC
                .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
                .select([1],['LU'])
                .map(function(img){return ee.Image(additionBands(img,[1]))});

    var rawCForPixelCharting = rawC
                              .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
                              .select([0,1,2,3,4,5],['Land Cover Class','Land Use Class','Loss Probability','Gain Probability','Slow Loss Probability','Fast Loss Probability'])
                              .map(function(img){return img.add(ee.Image([0,1,0,0,0,0]))
                                                            .multiply(ee.Image([0.1,0.1,0.01,0.01,0.01,0.01]))
                                                            .float()
                                                              .copyProperties(img,['system:time_start'])
                                                            })
    var NFSLCMSForCharting = rawCForPixelCharting;//NFSLCMS;
    var minTreeNumber = 3;
    if((endYear-startYear) < minTreeNumber){minTreeNumber = endYear-startYear+1}
      
    if(studyAreaDict[longStudyAreaName].lcmsSecondaryLandcoverCollection !== undefined && studyAreaDict[longStudyAreaName].lcmsSecondaryLandcoverCollection !== null){
      var lc2Dict = studyAreaDict[longStudyAreaName].lcmsSecondaryLandcoverDict;

      var nameList = Object.values(lc2Dict).map(function(v){return v.modelName}); 
      var legendList = Object.values(lc2Dict).map(function(v){return v.legendName}); 
      // console.log(JSON.stringify(ee.Dictionary.fromLists(ee.List(legendList.map(function(s){return s.replaceAll(' ','_').toLowerCase()})),ee.List(nameList)).getInfo()))
      var colorList = Object.values(lc2Dict).map(function(v){return v.color});
      var valueList = Object.keys(lc2Dict).map(function(k){return parseInt(k)});

      var classesImg = ee.Image(valueList);
      var lc2Lookup = {};var lc2LegendDict = {};var lc2ChartLegendDict = {};var lc2ChartLookupDict = {};
      Object.keys(lc2Dict).map(function(k){lc2Lookup[k] = lc2Dict[k].modelName});
      Object.values(lc2Dict).map(function(v){lc2LegendDict[v.legendName] = v.color});
      Object.keys(lc2Dict).map(function(k){lc2ChartLegendDict[lc2Dict[k].legendName] = k/10.});
      Object.keys(lc2Dict).map(function(k){lc2ChartLookupDict[k/10.] = lc2Dict[k].legendName});

     // var tDict = JSON.parse('{"Trees":"005e00","Trees/Shrubs Mix":"008000","Trees/Grass Mix":"b3ff1a","Trees/Barren Mix":"99ff99","Shrubs":"e68a00","Shrubs/Grass Mix":"ffad33","Shrubs/Barren Mix":"ffe0b3","Grass":"FFFF00","Grass/Barren Mix":"AA7700","Barren or Impervious":"d3bf9b","Snow/Ice":"ffffff","Water":"4780f3"}')
     // var ttDictList = ['Trees','Shrubs','Grass','Barren or Impervious','Snow/Ice','Water']
     // var ttDict = {};
     // ttDictList.map(k => ttDict[k] = tDict[k]);
     // console.log(ttDict)
     //  Map2.addLayer(ee.Image(1),{addToClassLegend: true,classLegendDict:tDict},'test',true)
     //  Map2.addLayer(ee.Image(1),{addToClassLegend: true,classLegendDict:ttDict},'test',true)
      var lc2 = ee.ImageCollection(studyAreaDict[longStudyAreaName].lcmsSecondaryLandcoverCollection);
     
      var landcoverByYears = ee.ImageCollection(ee.List.sequence(startYear,endYear).map(function(year){
      
        var landcoverOneYear = ee.Image(lc2.filter(ee.Filter.calendarRange(year, year, 'year')).toBands()).byte();
    
        // Pull the correct bands, simplify the band names, and order so that it matches the dictionary order and specified values
        var landcoverOneYearBandNames = landcoverOneYear.bandNames().map(function(thisName){ return ee.String(thisName).split('_').get(1)});
                landcoverOneYear = landcoverOneYear.select(landcoverOneYear.bandNames(), landcoverOneYearBandNames)
                                              .select(nameList,legendList)
                                              // .set('year', year)
                                              .set('system:time_start', ee.Date.fromYMD(year,6,1).millis());
            return landcoverOneYear;//.clip(geometry);  
        }));

      var landcoverMaxByYears = landcoverByYears.map(function(img){
        
        var maxClass = img.reduce(ee.Reducer.max());
        var isMaxClass = img.eq(maxClass);
        return classesImg.updateMask(isMaxClass).reduce(ee.Reducer.max()).copyProperties(img,['system:time_start'])
      });

      var isTree = landcoverMaxByYears.map(function(img){return img.lte(studyAreaDict[longStudyAreaName].lcmsSecondaryLandcoverTreeClassMax).unmask().copyProperties(img,['system:time_start'])});
      // isTree = isTree.toArray();
      var firstYearTreeStack = 1986;var lastYearTreeStack = 2018;
      if(startYear < firstYearTreeStack && endYear < firstYearTreeStack){
        var startYearTreeStack = firstYearTreeStack;var endYearTreeStack = firstYearTreeStack;
      }else if(startYear > lastYearTreeStack && endYear > lastYearTreeStack){
        var startYearTreeStack = lastYearTreeStack;var endYearTreeStack = lastYearTreeStack;
      }else{
        var startYearTreeStack = startYear;var endYearTreeStack = endYear;
      }
      if(startYear <firstYearTreeStack){startYearTreeStack = firstYearTreeStack}
      if(endYear > lastYearTreeStack){endYearTreeStack = lastYearTreeStack}
      // console.log(startYearTreeStack);console.log(endYearTreeStack)
      var possibleYears = ee.List.sequence(startYearTreeStack,endYearTreeStack).map(function(yr){return ee.String('Tree_').cat(ee.Number(yr).int16().format())});
     
      var treeMaskStack = ee.Image(studyAreaDict[longStudyAreaName].lcmsSecondaryLandcoverTreemask);
      var treeMask = treeMaskStack.select(possibleYears).reduce(ee.Reducer.max()).selfMask();

      
    }else{
      if (studyAreaName == 'CNFKP'){
            var isTree = rawLC.map(function(img){return img.eq(lcJSONFlipped.Trees).or(img.eq(lcJSONFlipped['Tall Shrub'])).unmask().copyProperties(img,['system:time_start'])});//.sum().gte(minTreeNumber);
      }else{
        var isTree = rawLC.map(function(img){return img.eq(lcJSONFlipped.Trees).unmask().copyProperties(img,['system:time_start'])});//.sum().gte(minTreeNumber);
      }
  var yearBuffer = Math.floor(minTreeNumber/2.);
  print(yearBuffer)
    var treeMask = ee.ImageCollection.fromImages(ee.List.sequence(startYear + yearBuffer,endYear - yearBuffer).map(function(yr){
      yr = ee.Number(yr);
      var startYearT = yr.subtract(yearBuffer);var endYearT =yr.add(yearBuffer);
      var treesT = isTree.filter(ee.Filter.calendarRange(startYearT,endYearT,'year')).min();
      return treesT.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis())
       })).max().selfMask();
    // console.log(treeMask.getInfo());
    }
    // var isTreeStack = isTree.toBands();
    // var isTreeStackBns = isTreeStack.bandNames();
    // var bnsLeft = isTreeStackBns.slice(0,-2);
    // var bnsCenter = isTreeStackBns.slice(1,-1);
    // var bnsRight = isTreeStackBns.slice(2,null);
    // var isTreeConsecutive = isTreeStack.select(bnsLeft).and(isTreeStack.select(bnsCenter)).and(isTreeStack.select(bnsRight))
    // // var isTreeStackLeft = 
    // Map2.addLayer(isTreeConsecutive.reduce(ee.Reducer.max()).selfMask(),{min:1,max:1,palette:'080'},'Tree mask')
    
    if( applyTreeMask === 'yes' || analysisMode == 'standard'){
      console.log('Applying tree mask');
      // var waterMask = rawLC.map(function(img){return img.eq(6)}).sum().gt(10);
      // waterMask = waterMask.mask(waterMask).clip(boundary);
      
      var treeMaskStackImage = ee.Image([1,1]).addBands(treeMask).addBands(treeMask).addBands(treeMask).addBands(treeMask)
      
      NFSLCMS = NFSLCMS.map(function(img){return img.updateMask(treeMaskStackImage)});

    }
    
    // var lowerThresholdImage = ee.Image([lowerThresholdDecline,lowerThresholdRecovery,lowerThresholdSlowLoss,lowerThresholdFastLoss]);
    // var upperThresholdImage = ee.Image([upperThresholdDecline,upperThresholdRecovery,upperThresholdSlowLoss,upperThresholdFastLoss]);
    // // Map2.addLayer(lowerThresholdImage);
    // // Map2.addLayer(upperThresholdImage);
    // var bandNumbers = [2,3,4,5];
    // var bandNames = ['Loss Probability','Gain Probability','Slow Loss Probability','Fast Loss Probability'];
    // var yearBandNames = bandNames.map(function(s){return s + '-Year'});
    // var allBandNames = ee.List(bandNames).cat(yearBandNames);
    // var rawThresholded = ee.ImageCollection(rawC.select(bandNumbers,bandNames)
    //                     .map(function(img){
    //                           var t = img.get('system:time_start');
    //                           img = img.divide(100);
    //                           var threshed = img.gte(lowerThresholdImage).and(img.lte(upperThresholdImage));
    //                           var yr = ee.Number(ee.Date(t).get('year'));
    //                           var yearImage = ee.Image.constant(ee.List.repeat(yr,4)).updateMask(threshed)
    //                           return yearImage;//img.updateMask(threshed)//.addBands(yearImage).rename(allBandNames).set('system:time_start',t)
    //                       }));
    // console.log(rawThresholded.getInfo())
    // Map2.addLayer(rawThresholded)

    var NFSLC =  NFSLCMS.select([0]);
    var NFSLU =  NFSLCMS.select([1]);
    //var NFSCP =  NFSLCMS.select([2]);

    var NFSDND = NFSLCMS.select([2]);

    // var NFSDNDold = NFSLCMSold.select([3]);

    var NFSRNR = NFSLCMS.select([3]);

    var NFSDNDSlow = NFSLCMS.select([4]);
    var NFSDNDFast = NFSLCMS.select([5]);

    // Apply Thresholds to change layers
    var dndThresh = thresholdChange(NFSDND,lowerThresholdDecline,upperThresholdDecline, 1);

    // var dndThreshOld = thresholdChange(NFSDNDold,lowerThresholdDecline,upperThresholdDecline, 1)

    var rnrThresh = thresholdChange(NFSRNR,lowerThresholdRecovery, upperThresholdRecovery, 1);

    var dndSlowThresh = thresholdChange(NFSDNDSlow,lowerThresholdSlowLoss,upperThresholdSlowLoss, 1);
    var dndFastThresh = thresholdChange(NFSDNDFast,lowerThresholdFastLoss,upperThresholdFastLoss, 1);

    //Bring in reference data
    getHansen();
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
     
      var lfDict = toDict(lfNames,lfColorsHex.split(','));
      var cDict = toDict(cNames,cColorsHex.split(','));

      lfQueryClassDict = {};cQueryClassDict = {};
      var keyI = 1;
      lfNames.map(function(k){lfQueryClassDict[keyI] =k;keyI++;})
      var keyI = 1;
      cNames.map(function(k){cQueryClassDict[keyI] =k;keyI++;})
      // queryClassDict['VMAP-LIFEFORM'] =lfQueryClassDict;queryClassDict['VMAP-TREECANOPY'] =cQueryClassDict;

      var properties = [['LIFEFORM',lfCodes,lfColorsHex,lfDict,lfQueryClassDict],['TREECANOPY',cCodes,cColorsHex,cDict,cQueryClassDict]];
      var vmapExport = ee.Image('projects/USFS/LCMS-NFS/R1/FNF/Ancillary/VMAP-Lifeform-TreeCanopy');

      properties.map(function(prop){
        // var vmapRast = vmap.reduceToImage([prop[0]],ee.Reducer.first());
        var vmapRast = vmapExport.select([prop[0]]);
        vmapRast = vmapRast.remap(prop[1],ee.List.sequence(1,prop[1].length));
        
        Map2.addLayer(vmapRast.set('bounds',clientBoundary),{queryDict: prop[4],min:1,max:prop[1].length,palette:prop[2],addToClassLegend: true,classLegendDict:prop[3]},'VMAP-'+prop[0],false,null,null,'VMAP layer attribute: '+prop[0],'reference-layer-list')
      })

      var wb = ee.Image('projects/USFS/LCMS-NFS/R1/FNF/Ancillary/IRPSV102_WHITEBARK');
      wb = wb.updateMask(wb)
      Map2.addLayer(wb.set('bounds',clientBoundary),{queryDict: {1:'Whitebark Pine Range'},min:1,max:1,palette:'080',addToClassLegend: true,classLegendDict:{'':'080'}},'Whitebark Pine Range',false,null,null,'Extent of potential Whitebark Pine','reference-layer-list')

      var gnpHUC = ee.FeatureCollection('projects/USFS/LCMS-NFS/R1/FNF/Ancillary/GNP_Huc12');
      Map2.addLayer(gnpHUC,{strokeColor:'#0088FF','layerType':'geeVector'},'GNP HUC 12',false,null,null,null,'reference-layer-list')

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
      var wbpClassQueryDict = {};var canopyCoverClassQueryDict = {};var treeSizeClassQueryDict = {};var vegTypeClassQueryDict = {};
      var lynxClassQueryDict = {};
      var keyI = 1;
      Object.keys(wbpClassDict).map(function(k){wbpClassQueryDict[keyI] =k;keyI++;})
      
      var wbpViz = {'queryDict':wbpClassQueryDict,'min':1,'max':5,'palette':wbpPalette,addToClassLegend: true,classLegendDict:wbpClassDict}

      Map2.addLayer(wbp.updateMask(wbp.neq(0)).set('bounds',clientBoundary),wbpViz,'GYA Whitebark Pine Mortality',false,null,null,'Mortality from two date change detection over Whitebark Pine areas of the Greater Yellowstone Area','reference-layer-list');


      var canopyCover = ee.Image('projects/USFS/LCMS-NFS/R4/BT/Ancillary/BT_VegExistingMidLevel_CanopyCover_2018');
      var treeSize = ee.Image('projects/USFS/LCMS-NFS/R4/BT/Ancillary/BT_VegExistingMidLevel_TreeSize_2018');
      var vegType = ee.Image('projects/USFS/LCMS-NFS/R4/BT/Ancillary/BT_VegExistingMidLevel_VegType_2018');

      var canopyCoverClassDict = {"Tree Canopy 1 (10-19%)": "f400f4", "Tree Canopy 2 (20-29%)": "9311e2", "Tree Canopy 3 (30-39%)": "0000f4", "Tree Canopy 4 (40-49%)": "00f400", "Tree Canopy 5 (50-59%)": "f4f400", "Tree Canopy 6 (60-69%)": "f49900", "Tree Canopy 7 (70-100%)": "f40000", "Shrub Canopy 1 (10-24%)": "e8e8d1", "Shrub Canopy 2 (25-100%)": "c4a57f", "No Canopy Cover": "b2b2b2"};
      var canopyCoverPalette = 'f400f4,9311e2,0000f4,00f400,f4f400,f49900,f40000,e8e8d1,c4a57f,b2b2b2';
      var keyI = 1;
      Object.keys(canopyCoverClassDict).map(function(k){canopyCoverClassQueryDict[keyI] =k;keyI++;})
      var canopyCoverViz = {queryDict:canopyCoverClassQueryDict,min:1,max:10,palette:canopyCoverPalette,addToClassLegend: true,classLegendDict:canopyCoverClassDict};
      
      var treeSizeClassDict = {"Tree Size 2  (< 5 dbh)": "0000f9", "Tree Size 3  (5 - 9.9 dbh)": "00f900", "Tree Size 4 (10 - 19.9  dbh)": "f9f900", "Tree Size 5  (20 - 29.9 dbh)": "f99e00", "Tree Size 6  (30.0+  dbh)": "f90000", "Non-Forest": "666666"};
      var treeSizePalette = '0000f9,00f900,f9f900,f99e00,f90000,666666';
      var keyI = 2;
      Object.keys(treeSizeClassDict).map(function(k){treeSizeClassQueryDict[keyI] =k;keyI++;})
      var treeSizeViz = {queryDict:treeSizeClassQueryDict,min:2,max:7,palette:treeSizePalette,addToClassLegend: true,classLegendDict:treeSizeClassDict};
      
      var vegTypeClassDict = {"Urban/Developed": "6b6b6b", "Water": "0000b5", "Snow/Ice": "a5a5a5", "Barren/Rock": "0c0c0c", "Sparse Vegetation": "d3bf9b", "Alpine Vegetation": "f26df2", "Tall Forbland": "0054c1", "Riparian Herbland": "d81919", "Agriculture": "3d0030", "Grassland/Forbland": "dddd00", "Low/Alkali Sagebrush": "e26b00", "Sagebrush/Bitterbrush Mix": "a33d00", "Mountain Big Sagebrush": "f49b00", "Spiked Big Sagebrush": "f43a00", "Mountain Mahogany": "4f997c", "Mountain Shrubland": "9314e2", "Silver Sagebrush/Shrubby Cinquef": "aa8200", "Willow": "bf0000", "Cottonwood": "930000", "Aspen": "00f9f9", "Aspen/Conifer Mix": "00bfbf", "Rocky Mountain Juniper": "6b00f7", "Limber Pine": "47ad47", "Douglas-fir Mix": "16ed16", "Lodgepole Pine Mix": "7c633d", "Spruce/Subalpine Fir Mix": "005b00", "White Bark Pine": "600000", "White Bark Pine Mix": "280000"};
      var vegTypePalette = '6b6b6b,0000b5,a5a5a5,0c0c0c,d3bf9b,f26df2,0054c1,d81919,3d0030,dddd00,e26b00,a33d00,f49b00,f43a00,4f997c,9314e2,aa8200,bf0000,930000,00f9f9,00bfbf,6b00f7,47ad47,16ed16,7c633d,005b00,600000,280000';
      var keyI = 1;
      Object.keys(vegTypeClassDict).map(function(k){vegTypeClassQueryDict[keyI] =k;keyI++;})
      queryClassDict['VCMQ 2018 Veg Type'] = vegTypeClassQueryDict;
      var vegTypeViz = {queryDict:vegTypeClassQueryDict,min:1,max:28,palette:vegTypePalette,addToClassLegend: true,classLegendDict:vegTypeClassDict};
      
      Map2.addLayer(canopyCover.updateMask(canopyCover.neq(0)).set('bounds',clientBoundary),canopyCoverViz,'VCMQ 2018 Canopy Cover',false,null,null,'2018 updated VCMQ (mid-level vegetation cover map) canopy cover classes','reference-layer-list');
      Map2.addLayer(treeSize.updateMask(treeSize.neq(0)).set('bounds',clientBoundary),treeSizeViz,'VCMQ 2018 Tree Size',false,null,null,'2018 updated VCMQ (mid-level vegetation cover map) tree size classes','reference-layer-list');
      Map2.addLayer(vegType.updateMask(vegType.neq(0)).set('bounds',clientBoundary),vegTypeViz,'VCMQ 2018 Veg Type',false,null,null,'2018 updated VCMQ (mid-level vegetation cover map) vegetation type classes','reference-layer-list');

      var lynxPalette = '080,ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02';

      var lynxHab = ee.Image('projects/USFS/LCMS-NFS/R4/BT/Ancillary/LynxHab/WildlifeBtLynxHab2017');
      lynxHab = lynxHab.where(lynxHab.eq(0),1970);
      var lynxClassDict = {'Suitable':'080','Unsuitable 1987':'ffffe5','Unsuitable 2017':'cc4c02'};
     
      lynxClassQueryDict['1970'] = 'Suitable 1987-2018';
      ee.List.sequence(1987,2018).getInfo().map(function(k){lynxClassQueryDict[k] =k;})
      Map2.addLayer(lynxHab.set('bounds',clientBoundary),{queryDict:lynxClassQueryDict,min:1970,max:2017,palette:lynxPalette,addToClassLegend: true,classLegendDict:lynxClassDict},'B-T Lynx Habitat Unsuitability Year',false,null,null,'Lynx habitat suitability 2017.  Years are years Lynx habitat became unsuitable.','reference-layer-list');

    }
    // End BTNF Layers

    // MLSNF Layers:
    if(studyAreaName === 'MLSNF'){

      var canopyCover = ee.Image('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/MLSFL_CC_Filtered_QMbuffer_2017_03_08_t').clip(boundary);
      var treeSize = ee.Image('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/MLSFL_TS_Filtered_QMbuffer_2017_03_08_t').clip(boundary);
      var vegType = ee.Image('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/MLSFL_VT_Filtered_QMbuffer_2017_03_08_t').clip(boundary);

      var canopyCoverClassQueryDict = {};var treeSizeClassQueryDict = {};var vegTypeClassQueryDict = {}; 

      var canopyCoverClassDict = {"1: (10 - 19%)": "93ff93", "2: (10 - 19%)": "93ff93", "3: (10 - 19%)": "93ff93", "4: (10 - 19%)": "93ff93", "5: (10 - 19%)": "93ff93", "6: (10 - 19%)": "93ff93", "7: (10 - 19%)": "93ff93", "8: (10 - 19%)": "93ff93", "9: (10 - 19%)": "93ff93", "10: (10 - 19%)": "93ff93", "11: (20 - 39%)": "2dff2d", "12: (20 - 39%)": "2dff2d", "13: (20 - 39%)": "2dff2d", "14: (20 - 39%)": "2dff2d", "15: (20 - 39%)": "2dff2d", "16: (20 - 39%)": "2dff2d", "17: (20 - 39%)": "2dff2d", "18: (20 - 39%)": "2dff2d", "19: (20 - 39%)": "2dff2d", "20: (20 - 39%)": "2dff2d", "21: (20 - 39%)": "00ad00", "22: (20 - 39%)": "00ad00", "23: (20 - 39%)": "00ad00", "24: (20 - 39%)": "00ad00", "25: (20 - 39%)": "00ad00", "26: (20 - 39%)": "00ad00", "27: (20 - 39%)": "00ad00", "28: (20 - 39%)": "00ad00", "29: (20 - 39%)": "00ad00", "30: (20 - 39%)": "00ad00", "31: (40 -49%)": "428e63", "32: (40 -49%)": "428e63", "33: (40 -49%)": "428e63", "34: (40 -49%)": "428e63", "35: (40 -49%)": "428e63", "36: (40 -49%)": "428e63", "37: (40 -49%)": "428e63", "38: (40 -49%)": "428e63", "39: (40 -49%)": "428e63", "40: (40 -49%)": "428e63", "41: (50 - 59%)": "385b99", "42: (50 - 59%)": "385b99", "43: (50 - 59%)": "385b99", "44: (50 - 59%)": "385b99", "45: (50 - 59%)": "385b99", "46: (50 - 59%)": "385b99", "47: (50 - 59%)": "385b99", "48: (50 - 59%)": "385b99", "49: (50 - 59%)": "385b99", "50: (50 - 59%)": "385b99", "51: (60% +)": "0759fc", "52: (60% +)": "0759fc", "53: (60% +)": "0759fc", "54: (60% +)": "0759fc", "55: (60% +)": "0759fc", "56: (60% +)": "0759fc", "57: (60% +)": "0759fc", "58: (60% +)": "0759fc", "59: (60% +)": "0759fc", "60: (60% +)": "0759fc", "61: (60% +)": "1c9ee8", "62: (60% +)": "1c9ee8", "63: (60% +)": "1c9ee8", "64: (60% +)": "1c9ee8", "65: (60% +)": "1c9ee8", "66: (60% +)": "1c9ee8", "67: (60% +)": "1c9ee8", "68: (60% +)": "1c9ee8", "69: (60% +)": "1c9ee8", "70: (60% +)": "1c9ee8", "71: (60% +)": "a360ea", "72: (60% +)": "a360ea", "73: (60% +)": "a360ea", "74: (60% +)": "a360ea", "75: (60% +)": "a360ea", "76: (60% +)": "a360ea", "77: (60% +)": "a360ea", "78: (60% +)": "a360ea", "79: (60% +)": "a360ea", "80: (60% +)": "a360ea", "81: (60% +)": "fc4ff2", "82: (60% +)": "fc4ff2", "83: (60% +)": "fc4ff2", "84: (60% +)": "fc4ff2", "85: (60% +)": "fc4ff2", "86: Non Tree": "ffff00", "87: Non Tree": "ffa300", "88: Non Tree": "ff0000", "89: Non Tree": "bfbfbf"};
      // var canopyCoverClassDict2 = {};
      // Object.keys(canopyCoverClassDict).map(function(k){canopyCoverClassDict2[k.split(': ')[1]] = canopyCoverClassDict[k]});

      var canopyCoverPalette = '93ff93,93ff93,93ff93,93ff93,93ff93,93ff93,93ff93,93ff93,93ff93,93ff93,2dff2d,2dff2d,2dff2d,2dff2d,2dff2d,2dff2d,2dff2d,2dff2d,2dff2d,2dff2d,00ad00,00ad00,00ad00,00ad00,00ad00,00ad00,00ad00,00ad00,00ad00,00ad00,428e63,428e63,428e63,428e63,428e63,428e63,428e63,428e63,428e63,428e63,385b99,385b99,385b99,385b99,385b99,385b99,385b99,385b99,385b99,385b99,0759fc,0759fc,0759fc,0759fc,0759fc,0759fc,0759fc,0759fc,0759fc,0759fc,1c9ee8,1c9ee8,1c9ee8,1c9ee8,1c9ee8,1c9ee8,1c9ee8,1c9ee8,1c9ee8,1c9ee8,a360ea,a360ea,a360ea,a360ea,a360ea,a360ea,a360ea,a360ea,a360ea,a360ea,fc4ff2,fc4ff2,fc4ff2,fc4ff2,fc4ff2,ffff00,ffa300,ff0000,bfbfbf';
      var keyI = 1;
      Object.keys(canopyCoverClassDict).map(function(k){canopyCoverClassQueryDict[keyI] =k;keyI++;})
      var canopyCoverViz = {queryDict:canopyCoverClassQueryDict,min:1,max:89,palette:canopyCoverPalette,addToClassLegend: true,classLegendDict:canopyCoverClassDict};
      
      var treeSizeClassDict = {"1: (0 - 4.9\"\" dbh)": "a5f984", "2: (5 - 11.9\"\" dbh)": "3ddb3d", "3: (12 - 17.9\"\" dbh)": "008900", "4: (18 - 23.9\"\" dbh)": "2196af", "5: (24\"\"+ dbh)": "056dce", "6: (0 - 5.9\"\" drc)": "f2ea5e", "7: (6 - 11.9\"\" drc)": "e0ba56", "8: (12 - 17.9\"\" drc)": "cc751e", "9: (18\"\"+ drc)": "b2022b", "10: Non Tree": "bfbfbf"};
      var treeSizeClassDict2 = {};
      Object.keys(treeSizeClassDict).map(function(k){treeSizeClassDict2[k.split(': ')[1]] = treeSizeClassDict[k]});
      
      var treeSizePalette = 'a5f984,3ddb3d,008900,2196af,056dce,f2ea5e,e0ba56,cc751e,b2022b,bfbfbf';
      var keyI = 1;
      Object.keys(treeSizeClassDict2).map(function(k){treeSizeClassQueryDict[keyI] =k;keyI++;})
      var treeSizeViz = {queryDict:treeSizeClassQueryDict,min:1,max:10,palette:treeSizePalette,addToClassLegend: true,classLegendDict:treeSizeClassDict2};
      
      var vegTypeClassDict = {"1: Aspen": "00ffff", "2: Aspen/Conifer": "04c0aa", "3: Douglas-fir Mix": "005f00", "4: Ponderosa Pine": "c0ffc0", "5: Ponderosa Pine Mix": "9acc9a", "6: Ponderosa Pine/Woodland": "678967", "7: White Fir": "7fff00", "8: White Fir Mix": "2caf00", "9: Spruce/Fir": "6a59cc", "10: Bristlecone Pine/Limber Pine": "9fb7d2", "11: Mountain Mahogany": "bc6af7", "12: Pinyon-Juniper": "ccb791", "13: Rocky Mountain Juniper Mix": "846a5e", "14: Gambel Oak": "ffedc0", "15: Mountain Big Sagebrush": "ffcc66", "16: Wyoming/Basin Big Sagebrush": "d2914c", "17: Silver Sagebrush": "d25e11", "18: Black Sagebrush": "873700", "19: Mountain Shrubland": "4f84f8", "20: Alpine Vegetation": "ffa7b7", "21: Upland Herbaceous": "ffff00", "22: Riparian Woody": "cc0000", "23: Riparian Herbaceous": "ff2b2b", "24: Agriculture": "ff39ff", "25: Barren/Sparse Vegetation": "bcbcbc", "26: Developed": "676767", "27: Water": "195ef7"};
      var vegTypeClassDict2 = {};
      Object.keys(vegTypeClassDict).map(function(k){vegTypeClassDict2[k.split(': ')[1]] = vegTypeClassDict[k]});
      
      var vegTypePalette = '00ffff,04c0aa,005f00,c0ffc0,9acc9a,678967,7fff00,2caf00,6a59cc,9fb7d2,bc6af7,ccb791,846a5e,ffedc0,ffcc66,d2914c,d25e11,873700,4f84f8,ffa7b7,ffff00,cc0000,ff2b2b,ff39ff,bcbcbc,676767,195ef7';
      var keyI = 1;
      Object.keys(vegTypeClassDict2).map(function(k){vegTypeClassQueryDict[keyI] =k;keyI++;})
      var vegTypeViz = {queryDict:vegTypeClassQueryDict,min:1,max:27,palette:vegTypePalette,addToClassLegend: true,classLegendDict:vegTypeClassDict2};
      
      Map2.addLayer(canopyCover.updateMask(canopyCover.neq(0)).set('bounds',clientBoundary),canopyCoverViz,'VCMQ 2014 Canopy Cover',false,null,null,'2014 updated VCMQ (mid-level vegetation cover map) canopy cover classes','reference-layer-list');
      Map2.addLayer(treeSize.updateMask(treeSize.neq(0)).set('bounds',clientBoundary),treeSizeViz,'VCMQ 2014 Tree Size',false,null,null,'2014 updated VCMQ (mid-level vegetation cover map) tree size classes','reference-layer-list');
      Map2.addLayer(vegType.updateMask(vegType.neq(0)).set('bounds',clientBoundary),vegTypeViz,'VCMQ 2014 Veg Type',false,null,null,'2014 updated VCMQ (mid-level vegetation cover map) vegetation type classes','reference-layer-list');

      //**
      // Moved Unfilled Polygons to below LCMS Layers so they will draw on top of everything.
      //**
    }
    // End MLSNF Layers

    // CNFKP Layers:
    if(studyAreaName === 'CNFKP'){
      var kenaiVegTypeClassQueryDict = {}; var CRvegTypeClassQueryDict = {};
      //Kenai Veg Map
      var kenaiVegType = ee.Image('projects/USFS/LCMS-NFS/R10/CK/Ancillary/Kenai_VegMap');
      var kenaiVegTypeBoundary ={"geodesic":false,"type":"Polygon","coordinates":[[[-152.28716571806967,59.069538598321934],[-148.46724086550446,59.069538598321934],[-148.46724086550446,61.083356927132535],[-152.28716571806967,61.083356927132535],[-152.28716571806967,59.069538598321934]]]};//kenaiVegType.geometry().bounds(1000).getInfo();
      var kenaiVegTypeClassDict = {"1: Black Spruce": "4e5e38", "2: Black Spruce Peatland": "87751e", "3: Mountain Hemlock": "007800", "4: Mountain Hemlock-Lutz Spruce": "0f5e4f", "5: Mountain Hemlock-Sitka Spruce": "005e00", "6: Sitka Spruce": "003800", "7: White/Lutz Spruce": "215c4f", "8: Alaska Paper Birch (and Kenai Birch": "87f38c", "9: Black Cottonwood (and Balsam Poplar": "b0ff8c", "10: Quaking Aspen": "d4ffc0", "11: Black Spruce-Broadleaf": "0b9721", "12: White/Lutz Spruce-Birch": "45a138", "13: White/Lutz Spruce-Cottonwood": "66b52b", "14: White/Lutz Spruce-Aspen": "38a89e", "15: Alder": "ff0000", "16: Willow": "9c2e23", "17: Alder-Willow": "a30000", "18: Low Shrub Peatland": "d1852e", "19: Low Shrub Willow-Dwarf Birch": "ab3a11", "20: Wet Willow (Sweetgale)": "f0d1ab", "21: Dryas Dwarf Shrub": "ffe3e8", "22: Dwarf Shrub-Lichen": "ff73de", "23: Ericaceous Dwarf Shrub": "9e1eee", "24: Sedge Peatland": "fa9402", "25: Aquatic Herbaceous": "c0e8ff", "26: Dry Herbaceous": "ffffc0", "27: Mesic Herbaceous": "ffff00", "28: Wet Herbaceous": "e6e600", "29: Sparse Vegetation": "686868", "30: Barren": "cccccc", "31: Water": "4780f3", "32: Snow/Ice": "ffffff", "33: Developed": "000000"};
      var kenaiVegTypeClassDict2 = {};
      Object.keys(kenaiVegTypeClassDict).map(function(k){kenaiVegTypeClassDict2[k.split(': ')[1]] = kenaiVegTypeClassDict[k]});
      var keyI = 1;
      Object.keys(kenaiVegTypeClassDict2).map(function(k){kenaiVegTypeClassQueryDict[keyI] =k;keyI++;})
      
      var kenaiVegTypePalette = '4e5e38,87751e,007800,0f5e4f,005e00,003800,215c4f,87f38c,b0ff8c,d4ffc0,0b9721,45a138,66b52b,38a89e,ff0000,9c2e23,a30000,d1852e,ab3a11,f0d1ab,ffe3e8,ff73de,9e1eee,fa9402,c0e8ff,ffffc0,ffff00,e6e600,686868,cccccc,4780f3,ffffff,000000';
      var kenaiVegTypeViz = {queryDict:kenaiVegTypeClassQueryDict,min: 1, max: 33, palette: kenaiVegTypePalette, addToClassLegend: true, classLegendDict: kenaiVegTypeClassDict2};
      Map2.addLayer(kenaiVegType.updateMask(kenaiVegType.neq(0)).set('bounds',kenaiVegTypeBoundary),kenaiVegTypeViz,'Kenai Veg Type 2017',false,null,null,'2017 Kenai Peninsula vegetation dominance classes','reference-layer-list');

      // Copper River Veg Map  
      var CRvegType = ee.Image('projects/USFS/LCMS-NFS/R10/CK/Ancillary/CopperRiverDelta_VegMap');//.setDefaultProjection(crs, transform, scale);
      var CRvegTypeBoundary ={"geodesic":false,"type":"Polygon","coordinates":[[[-146.08862317790675,59.78251540939132],[-143.82386409934708,59.78251540939132],[-143.82386409934708,60.692575655008945],[-146.08862317790675,60.692575655008945],[-146.08862317790675,59.78251540939132]]]};//CRvegType.geometry().bounds(1000).getInfo();
      var CRvegTypeClassDict = {"1: Western Hemlock": "3db370", "2: Sitka Spruce": "006300", "3: Black Cottonwood": "c9ff70", "4: Sitka Spruce - Black Cottonwood": "75ed00", "5: Sitka Alder": "f8644f", "6: Willow": "781212", "7: Sitka Alder - Willow Mix": "e02a3e", "8: Sweetgale": "ffd480", "9: Dry Graminoid": "8acc66", "10: Mesic Wet Herbaceous": "78c2c4", "11: Aquatic Herbaceous": "9efade", "12: Sparse/Unvegetated": "dfcbaf", "13: Water": "457dc7", "14: Snow/Ice": "ffffff", "15: Developed": "000000"};
      var CRvegTypeClassDict2 = {};
      Object.keys(CRvegTypeClassDict).map(function(k){CRvegTypeClassDict2[k.split(': ')[1]] = CRvegTypeClassDict[k]});
      var keyI = 1;
      Object.keys(CRvegTypeClassDict2).map(function(k){CRvegTypeClassQueryDict[keyI] =k;keyI++;})
      
      var CRvegTypePalette = '3db370,006300,c9ff70,75ed00,f8644f,781212,e02a3e,ffd480,8acc66,78c2c4,9efade,dfcbaf,457dc7,ffffff,000000';
      var CRvegTypeViz = {queryDict:CRvegTypeClassQueryDict,min: 1, max: 15, palette: CRvegTypePalette, addToClassLegend: true, classLegendDict:CRvegTypeClassDict2};  
      Map2.addLayer(CRvegType.updateMask(CRvegType.neq(0)).set('bounds',CRvegTypeBoundary), CRvegTypeViz, 'Copper River Delta Veg Type 2010', false, null, null, '2010 Copper River Delta vegetation dominance classes','reference-layer-list');
    }
    // End CNFKP Layers

    //----------------Prep Universal Layers & Add Some------------------------------------------------------
    mtbsSummaryMethodDict = {'year':'Most-Recent','prob':'Highest-Severity'};
    mtbsSummaryMethod = mtbsSummaryMethodDict[summaryMethod]
    getMTBSandIDS(studyAreaName);
    var studyAreas = studyAreaDict[longStudyAreaName].studyAreas;
    studyAreas.map(function(studyArea){
      Map2.addLayer(studyArea[1],{layerType:'geeVector',canQuery:false},studyArea[0],false,null,null,studyArea[2],'reference-layer-list')
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
    // var lcMode = NFSLC.mode().multiply(10).round();
    // var lcMask = lcMode.neq(1).and(lcMode.neq(7)).and(lcMode.neq(5));

    // // Apply mask, keeping a copy of the original layers
    // var dndThreshOutUnMasked = dndThreshOut;
    // var rnrThreshOutUnMasked = rnrThreshOut;
    // var dndSlowThreshOutUnMasked = dndSlowThreshOut;
    // var dndFastThreshOutUnMasked = dndFastThreshOut;
    // dndThreshOut = dndThreshOut.updateMask(lcMask);
    // rnrThreshOut = rnrThreshOut.updateMask(lcMask);
    // dndSlowThreshOut = dndSlowThreshOut.updateMask(lcMask);
    // dndFastThreshOut = dndFastThreshOut.updateMask(lcMask);

    // Calculate # of missing years per pixel
    var missingYears = NFSLC.map(function(img){return addYearBand(img.unmask()).select('year').updateMask(img.mask().not())}).toArray().arrayProject([0]); // This will give array of missing years
    var dndMask = NFSLC.map(function(img){return img.mask().not().unmask()});
    var maskCount = ee.Image(dndMask.reduce(ee.Reducer.sum())).rename('Number of Missing Years');
    maskCount = maskCount.clip(boundary);
    
    }

    //---Composites--------
    var composites = ee.ImageCollection(studyAreaDict[longStudyAreaName].compositeCollection)
            .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
            // .filter(ee.Filter.equals('cloudcloudShadowMaskingMethod','fmask'))
            .map(function(img){return multBands(img,1,0.0001)})
            .map(simpleAddIndices)
            .select(['blue','green','red','nir','swir1','swir2','NDVI','NBR']);
            // .map(getImageLib.getTasseledCap)
            // .map(getImageLib.simpleAddTCAngles)
            // .select(['NBR']);

    // var ts = composites.select(['NBR']);
    // ts = ts.map(addYearBand).select([1,0]);
    // var trend = ts.reduce(ee.Reducer.linearFit()).select([0]);
    
    // var subtleGain = trend.gt(0.001)//.and(trend.lte(0.03));

    // subtleGain = trend.updateMask(subtleGain);
    // Map2.addLayer(subtleGain,{'min':-0.05,'max':0.05,'palette':'F00,888,00F'},'Subtle Gain')
    // Map2.addLayer(trend,{'min':-0.05,'max':0.05,'palette':'F00,888,00F'},'Trend')
    


    //----------Other Housekeeping & Prep for adding layers
    var declineNameEnding = '('+startYear.toString() + '-' + endYear.toString()+') (p >= '+lowerThresholdDecline.toString()+' and p <= '+upperThresholdDecline.toString()+')';
    var slowLossNameEnding = '('+startYear.toString() + '-' + endYear.toString()+') (p >= '+lowerThresholdSlowLoss.toString()+' and p <= '+upperThresholdSlowLoss.toString()+')';
    var fastLossNameEnding = '('+startYear.toString() + '-' + endYear.toString()+') (p >= '+lowerThresholdFastLoss.toString()+' and p <= '+upperThresholdFastLoss.toString()+')';
    
    var recoveryNameEnding = '('+startYear.toString() + '-' + endYear.toString()+') (p >= '+lowerThresholdRecovery.toString()+' and p <= '+upperThresholdRecovery.toString()+')';

    var lcLayerName =  'Land Cover (mode) '+ startYear.toString() + '-'+ endYear.toString();

    // var luPalette = "efff6b,ff2ff8,1b9d0c,97ffff,a1a1a1,c2b34a";
    var luLayerName =  'Land Use (mode) '+ startYear.toString() + '-'+ endYear.toString();
    
   
    var landcoverClassLegendDict = {};var landcoverClassChartDict = {}
    var lcPalette = Object.values(lcJSON).map(function(v){return v['color']});
    var lcValues = Object.keys(lcJSON).map(function(i){return parseInt(i)});
   
    Object.keys(lcJSON).map(function(k){landcoverClassLegendDict[lcJSON[k]['name']] = lcJSON[k]['color']});
    Object.keys(lcJSON).map(function(k){landcoverClassChartDict[lcJSON[k]['name']] = k/10.});

    var landuseClassLegendDict = {};var landuseClassChartDict = {}
    var luPalette = Object.values(luJSON).map(function(v){return v['color']});
    var luValues = Object.keys(luJSON).map(function(i){return parseInt(i)});
   
    Object.keys(luJSON).map(function(k){landuseClassLegendDict[luJSON[k]['name']] = luJSON[k]['color']});
    Object.keys(luJSON).map(function(k){landuseClassChartDict[luJSON[k]['name']] = k/10.});
    // console.log(lcPalette);console.log(landcoverClassChartDict)
    // var landcoverClassLegendDict = {'Barren':'b67430',
    //                         'Grass/forb/herb':'78db53',
    //                         'Impervious':'F0F',
    //                         'Shrubs':'ffb88c',
    //                         'Snow/ice':'8cfffc',
    //                         'Trees':'32681e',
    //                         'Water':'2a74b8'};

    // var landuseClassLegendDict = {
    //   'Agriculture':'efff6b',
    //   'Developed':'ff2ff8',
    //   'Forest':'1b9d0c',
    //   'Non-forest Wetland':'97ffff',
    //   'Other':'a1a1a1',
    //   'Rangeland':'c2b34a',

    // }

    // var landcoverClassChartDict={
    //   'Barren':0.1,
    //   'Grass/forb/herb':0.2,
    //   'Impervious':0.3,
    //   'Shrubs': 0.4,
    //   'Snow/ice': 0.5,
    //   'Trees': 0.6,
    //   'Water': 0.7
    // }
    // var landuseClassChartDict={
    //   'Agriculture': 0.1,
    //   'Developed' : 0.2,
    //   'Forest' : 0.3,
    //   'Non-forest Wetland' : 0.4,
    //   'Other' : 0.5,
    //   'Rangeland':0.6
    // }

    var landcoverClassQueryDict = {};
    Object.keys(landcoverClassChartDict).map(function(k){landcoverClassQueryDict[parseInt(landcoverClassChartDict[k]*10)] =k});
    var landuseClassQueryDict = {};
    Object.keys(landuseClassChartDict).map(function(k){landuseClassQueryDict[parseInt(landuseClassChartDict[k]*10)] =k})
    // console.log(landcoverClassQueryDict);console.log(landuseClassQueryDict);
    // <li><span style='background:#efff6b;'></span>Agriculture (0.1 in chart)</li>
    //   <li><span style='background:#ff2ff8;'></span>Developed (0.2 in chart)</li>
    //   <li><span style='background:#1b9d0c;'></span>Forest (0.3 in chart)</li>
    //   <li><span style='background:#97ffff;'></span>Non-forest Wetland (0.4 in chart)</li>
    //   <li><span style='background:#a1a1a1;'></span>Other (0.5 in chart)</li>
    //   <li><span style='background:#c2b34a;'></span>Rangeland (0.6 in chart)</li>
    // Map2.addLayer(ee.Image(1),{addToClassLegend: true,classLegendDict:classLegendDict },'thisisatest',false)

    //-----------------------------------Add LCMS Layers-------------------------------------------
    // Map2.addLayer(NFSCP.max().multiply(10),{min:0,max:4},'Change Process',false);
    Map2.addLayer(NFSLU.mode().multiply(10).clip(boundary).set('bounds',clientBoundary),{queryDict:landuseClassQueryDict,'palette':luPalette,'min':1,'max':6,addToClassLegend: true,classLegendDict:landuseClassLegendDict}, luLayerName,false);
    if(studyAreaDict[longStudyAreaName].lcmsSecondaryLandcoverCollection !== undefined && studyAreaDict[longStudyAreaName].lcmsSecondaryLandcoverCollection !== null){
      Map2.addLayer(landcoverMaxByYears.mode().clip(boundary).set('bounds',clientBoundary),{min:valueList[0],max:valueList[valueList.length-1],palette:colorList,addToClassLegend:true,classLegendDict:lc2LegendDict,queryDict:lc2Lookup},lcLayerName,false);
    
    }else{
      // print(landcoverClassQueryDict)
      // print(lcPalette);
      // print(landcoverClassLegendDict)
      // lcPalette = lcPalette.filter(i => i !== 'F0F')
      // lcValues = lcValues.filter(i => i !== 3)
      // lcPalette['Barren']
      // delete landcoverClassQueryDict[3]
      // delete landcoverClassLegendDict['Impervious']
      Map2.addLayer(NFSLC.mode().multiply(10).clip(boundary).set('bounds',clientBoundary),{queryDict:landcoverClassQueryDict,'palette':lcPalette,'min':lcValues[0],'max':lcValues[lcValues.length-1],addToClassLegend: true,classLegendDict:landcoverClassLegendDict}, lcLayerName+'test',false); 
  
    }

    if(analysisMode === 'advanced'){
      if (studyAreaName == 'CNFKP'){
        Map2.addLayer(maskCount.clip(boundary).set('bounds',clientBoundary),{'min':1,'max':33,'palette':'0C2780,E2F400,BD1600'}, 'Number of Missing Data Years',false)
        //Map2.addLayer(missingYears,{'opacity': 0}, 'Number of Missing Data Years',false)
    }
      
     if(applyTreeMask === 'yes'){
        // Map2.addLayer(waterMask,{min:1,max:1,palette:'2a74b8'},'Water Mask',false);
        var treeClassLegendDict = {};
        treeClassLegendDict['Tree ('+minTreeNumber+' or more consecutive years)'] = '32681e';

        Map2.addLayer(treeMask.clip(boundary).set('bounds',clientBoundary),{min:1,max:1,palette:'32681e',addToClassLegend: true,classLegendDict:treeClassLegendDict,queryDict:{1:'Tree ('+minTreeNumber+' or more consecutive years)'}},'Tree Mask',false,null,null,'Mask of areas LCMS classified as tree cover for '+minTreeNumber.toString()+' or more consecutive years from '+startYear.toString() + ' to '  + endYear.toString());
     
      } 
      
    }
    

     
    // Map2.addLayer(dndThreshMostRecent.select([1]),{'min':startYear,'max':endYear,'palette':'FF0,F00'},studyAreaName +' Decline Year',true,null,null,'Year of most recent decline ' +declineNameEnding);
    // Map2.addLayer(dndThreshMostRecent.select([0]),{'min':lowerThresholdDecline,'max':upperThresholdDecline,'palette':'FF0,F00'},studyAreaName +' Decline Probability',false,null,null,'Most recent decline ' + declineNameEnding);
   
    Map2.addLayer(dndThreshOut.select([1]).clip(boundary).set('bounds',clientBoundary),{'min':startYear,'max':endYear,'palette':declineYearPalette},'Loss Year',true,null,null,threshYearNameEnd+'loss ' +declineNameEnding);
    // Map2.addTimeLapse(dndThresh.select([0]),{min:lowerThresholdDecline,max:upperThresholdDecline,palette:declineProbPalette},'Loss Prob Time Lapse',false); 
    var threshImage = ee.Image([lowerThresholdFastLoss,lowerThresholdSlowLoss,lowerThresholdRecovery]);
    var lossGain = NFSLCMS.select([5,4,3]).map(function(img){
      return img.updateMask(img.gte(threshImage))
    })
    lossGain = lossGain.map(function(img){
      var maxProb = img.reduce(ee.Reducer.max());
      var out = ee.Image([1,2,3]).mask(img.eq(maxProb)).reduce(ee.Reducer.min())
      
      out = out.copyProperties(img,['system:time_start']);
      return out
    })

    
    // if (studyAreaName == 'CNFKP' && analysisMode == 'advanced'){
    //   Map2.addLayer(dndThreshOutUnMasked.select([1]).set('bounds',clientBoundary),{'min':startYear,'max':endYear,'palette':declineYearPalette},'Loss Year Unmasked',false,null,null,threshYearNameEnd+'loss ' +declineNameEnding);
    // }
    // Map2.addLayer(dndThreshOutOld.select([1]),{'min':startYear,'max':endYear,'palette':declineYearPalette },studyAreaName +' Decline Old Year',true,null,null,threshYearNameEnd+'decline ' +declineNameEnding);
    // Map2.addLayer(dndThreshOutOld.select([0]),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},studyAreaName +' Decline Old Probability',false,null,null,threshProbNameEnd+ 'decline ' + declineNameEnding);

    if(analysisMode === 'advanced'){
      Map2.addLayer(dndThreshOut.select([0]).clip(boundary).set('bounds',clientBoundary),{'min':lowerThresholdDecline,'max':upperThresholdDecline ,'palette':declineProbPalette},'Loss Probability',false,null,null,threshProbNameEnd+ 'loss ' + declineNameEnding);
      Map2.addLayer(dndCount.clip(boundary).set('bounds',clientBoundary),{'min':1,'max':5,'palette':declineDurPalette},'Loss Duration',false,'years',null,'Total duration of loss '+declineNameEnding);
    }

    if(studyAreaDict[longStudyAreaName].addFastSlow){
      Map2.addLayer(dndSlowThreshOut.select([1]).clip(boundary).set('bounds',clientBoundary),{'min':startYear,'max':endYear,'palette':declineYearPalette },'Slow Loss Year',false,null,null,threshYearNameEnd+'slow loss ' +slowLossNameEnding);
      if(analysisMode === 'advanced'){
        Map2.addLayer(dndSlowThreshOut.select([0]).clip(boundary).set('bounds',clientBoundary),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},'Slow Loss Probability',false,null,null,threshProbNameEnd+ 'slow loss ' + slowLossNameEnding);
        Map2.addLayer(dndSlowCount.clip(boundary).set('bounds',clientBoundary),{'min':1,'max':5,'palette':declineDurPalette},'Slow Loss Duration',false,'years',null,'Total duration of slow loss '+slowLossNameEnding);
      }
    }
    
    if(studyAreaDict[longStudyAreaName].addFastSlow){
      Map2.addLayer(dndFastThreshOut.select([1]).clip(boundary).set('bounds',clientBoundary),{'min':startYear,'max':endYear,'palette':declineYearPalette },'Fast Loss Year',false,null,null,threshYearNameEnd+'fast loss ' +fastLossNameEnding);
    if(analysisMode === 'advanced'){
      Map2.addLayer(dndFastThreshOut.select([0]).clip(boundary).set('bounds',clientBoundary),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},'Fast Loss Probability',false,null,null,threshProbNameEnd+ 'fast loss ' + fastLossNameEnding);
      Map2.addLayer(dndFastCount.clip(boundary).set('bounds',clientBoundary),{'min':1,'max':5,'palette':declineDurPalette},'Fast Loss Duration',false,'years',null,'Total duration of fast loss '+fastLossNameEnding);
      }
    }
      
    Map2.addLayer(rnrThreshOut.select([1]).clip(boundary).set('bounds',clientBoundary),{'min':startYear,'max':endYear,'palette':recoveryYearPalette},'Gain Year',false,null,null,threshYearNameEnd+'gain '+recoveryNameEnding);
    // Map2.addTimeLapse(rnrThresh.select([0]),{min:lowerThresholdRecovery,max:upperThresholdRecovery,palette:recoveryProbPalette},'Gain Prob Time Lapse',false); 
    
    if(analysisMode === 'advanced'){
      Map2.addLayer(rnrThreshOut.select([0]).clip(boundary).set('bounds',clientBoundary),{'min':lowerThresholdRecovery,'max':upperThresholdRecovery,'palette':recoveryProbPalette},'Gain Probability',false,null,null,threshProbNameEnd+'gain '+recoveryNameEnding);
      Map2.addLayer(rnrCount.clip(boundary).set('bounds',clientBoundary),{'min':1,'max':5,'palette':recoveryDurPalette},'Gain Duration',false,'years',null,'Total duration of gain '+recoveryNameEnding);
    }
    var interestedClasses =  [24,21,25,26,27,28,82,72,62,52,12,42,14,15,16,17,18,81,71,61,51,41,45,46,47,48,84,74,64,54,56,57,58,85,75,65,67,68,86,76,78,87];
    var lcChangeClassWords = ["Snow/Ice to Barren" , "Snow/Ice to Water" , "Snow/Ice to Grass/Forb/Herb" , "Snow/Ice to Shrubs" , "Snow/Ice to Tall Shrubs" , "Snow/Ice to Tree" , "Tree to Snow/Ice" , "Tall Shrubs to Snow/Ice" , "Shrubs to Snow/Ice" , "Grass/Forb/Herb to Snow/Ice" , "Water to Snow/Ice" , "Barren to Snow/Ice" , "Water to Barren" , "Water to Grass/Forb/Herb" , "Water to Shrubs" , "Water to Tall Shrubs" , "Water to Tree" , "Tree to Water" , "Tall Shrubs to Water" , "Shrubs to Water" , "Grass/Forb/Herb to Water" , "Barren to Water" , "Barren to Grass/Forb/Herb" , "Barren to Shrubs" , "Barren to Tall Shrubs" , "Barren to Tree" , "Tree to Barren" , "Tall Shrubs to Barren" , "Shrubs to Barren" , "Grass/Forb/Herb to Barren" , "Grass/Forb/Herb to Shrubs" , "Grass/Forb/Herb to Tall Shrubs" , "Grass/Forb/Herb to Tree" , "Tree to Grass/Forb/Herb" , "Tall Shrubs to Grass/Forb/Herb" , "Shrubs to Grass/Forb/Herb" , "Shrubs to Tall Shrubs" , "Shrubs to Tree" , "Tree to Shrubs" , "Tall Shrubs to Shrubs" , "Tall Shrubs to Tree" , "Tree to Tall Shrubs"];
    var vegetationChangeClassDict = toObj(interestedClasses,lcChangeClassWords);
    // console.log(vegetationChangeClassDict);
    queryClassDict['lcChangeMatrix'] = vegetationChangeClassDict;
    queryClassDict['Vegetation Change'] = vegetationChangeClassDict;
    if(viewBeta === 'yes' && analysisMode === 'advanced'){

      var lcFirstFive = NFSLC.filter(ee.Filter.calendarRange(startYear,startYear+5-1,'year'));
      var lcLastFive = NFSLC.filter(ee.Filter.calendarRange(endYear-5+1,endYear,'year')); 

      // Get "variety" of landcover classes and number of years of data to mask out unreliable pixels
      var earlyHist = lcFirstFive.reduce(ee.Reducer.autoHistogram(8,0.1)).arraySlice(1,1);
      var earlyVariety = earlyHist.arrayMask(earlyHist.neq(0)).arrayLength(0);
      var lateHist = lcLastFive.reduce(ee.Reducer.autoHistogram(8,0.1)).arraySlice(1,1);
      var lateVariety = lateHist.arrayMask(lateHist.neq(0)).arrayLength(0);
      var firstMask = lcFirstFive.count().gt(2).and(earlyVariety.lte(2));
      var lastMask = lcLastFive.count().gt(2).and(lateVariety.lte(2));
      // Map2.addLayer(firstMask,{},'firstMask')

      var lcFirstFiveMode = lcFirstFive.mode().multiply(100).updateMask(firstMask);
      var lcLastFiveMode = lcLastFive.mode().multiply(10).updateMask(lastMask);
      var lcChangeMatrix = lcFirstFiveMode.add(lcLastFiveMode); 



      var interestedChangeClasses = ee.Image(interestedClasses);
      var posNegValues = ee.List([1,1,2,3,4,5,-5,-4,-3,-2,-1,-1,1,2,3,4,5,-5,-4,-3,-2,-1,1,2,3,4,-4,-3,-2,-1,1,2,3,-3,-2,-1,1,2,-2,-1,1,-1]);
      lcChangeMatrix =interestedChangeClasses.updateMask(interestedChangeClasses.eq(lcChangeMatrix)).reduce(ee.Reducer.max());
      // Map2.addLayer(lcChangeMatrix, {}, 'lcChangeMatrix', false, null, null, '') // Take this out when finalized - just for debugging the pixel inspector words
      var lcChangeMag = lcChangeMatrix.remap(interestedClasses, posNegValues,0);
      
      // Original landcover change matrix:
      //var interestedClasses = [21,41,42,61,62,64, 12,14,16,24,26,46]; original values
      //var interestedChangeClasses = ee.Image(interestedClasses);
      //lcChangeMatrix = lcChangeMatrix.remap(interestedClasses,[-1,-2,-1,-3,-2,-1,1,2,3,1,2,1]) 
      // Map2.addLayer(lcChangeMatrix,{min:-3,max:3,palette:"b2182b,ef8a62,fddbc7,f7f7f7,d1e5f0,67a9cf,2166ac"},
      //   'Landcover Change Magnitude',false,null,null, 
      //   'Magnitude of vegetation cover related to the difference between the most common landcover for the first and last 5 years of the analysis period.');

      // Vegetation change layer
      var vegValues = ee.List([0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]); 
      var vegChangeMask = lcChangeMatrix.remap(interestedClasses, vegValues, 0);
      var vegChangeMag = lcChangeMag.updateMask(vegChangeMask);
      var vegChangePalette = 'a50026,d73027,f46d43,fdae61,fee090,ffffbf,e0f3f8,abd9e9,74add1,4575b4,3e45c1';
      Map2.addLayer(vegChangeMag.set('bounds',clientBoundary),{min:-5,max:5,palette:vegChangePalette},
         'Vegetation Change',false,null,null, 
         'Magnitude of vegetation cover change related to the difference between the most common landcover for the first and last 5 years of the analysis period.',null,lcChangeMatrix);

      // Snow change layer
      if (studyAreaName == 'CNFKP'){
        var snowValues = ee.List([1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
        var snowChangeMask = lcChangeMatrix.remap(interestedClasses, snowValues, 0);
        var snowChangeMag = lcChangeMag.updateMask(snowChangeMask);
        var snowChangePalette = '3e45c1,4575b4,74add1,abd9e9,e0f3f8,ffffbf,fee090,fdae61,f46d43,d73027,a50026'
        Map2.addLayer(snowChangeMag.set('bounds',clientBoundary),{min:-5,max:5,palette:snowChangePalette},
           'Snow Cover Change',false,null,null, 
           'Magnitude of snow cover change related to the difference between the most common landcover for the first and last 5 years of the analysis period.');
      }
    }
    
    if(analysisMode === 'advanced'){
      Map2.addTimeLapse(composites,{min:0.05,max:0.4,bands:'swir1,nir,red',years:years},'Landsat Composite Time Lapse',false);
      var lastYearAdded = false;
      // ee.List.sequence(startYear,endYear,10).getInfo().map(function(yr){
      //   var c = ee.Image(composites.filter(ee.Filter.calendarRange(yr,yr,'year')).first());
      //   Map2.addLayer(c.set('bounds',clientBoundary),{min:0.05,max:0.4,bands:'swir1,nir,red'},'Landsat Composite '+yr.toString(),false)
      //   if(yr === endYear){lastYearAdded = true}
      // })

      // if(lastYearAdded === false){
      //   // var c1 = ee.Image(composites.first());
      //   var c2 = ee.Image(composites.sort('system:time_start',false).first());
      //   // Map2.addLayer(c1,{min:0.05,max:0.4,bands:'swir1,nir,red'},'Landsat Composite '+startYear.toString(),false)
      //   Map2.addLayer(c2.set('bounds',clientBoundary),{min:0.05,max:0.4,bands:'swir1,nir,red'},'Landsat Composite '+endYear.toString(),false)
      // }
    }
        Map2.addTimeLapse(lossGain,{min:1,max:3,palette:'F80,FF0,80F',addToClassLegend:true,classLegendDict:{'Fast Loss':'F80','Slow Loss':'FF0','Gain':'80F'},years:years},'Loss/Gain Time Lapse',false); 
    if(studyAreaDict[longStudyAreaName].lcmsSecondaryLandcoverCollection !== undefined && studyAreaDict[longStudyAreaName].lcmsSecondaryLandcoverCollection !== null){
      Map2.addTimeLapse(landcoverMaxByYears,{min:valueList[0],max:valueList[valueList.length-1],palette:colorList,addToClassLegend:true,classLegendDict:lc2LegendDict,queryDict:lc2Lookup,years:years},'Land Cover Time Lapse',false);
    }else{
     Map2.addTimeLapse(NFSLC.map(function(img){return img.multiply(10).copyProperties(img,['system:time_start'])}),{queryDict:landcoverClassQueryDict,'palette':lcPalette,'min':lcValues[0],'max':lcValues[lcValues.length-1],addToClassLegend: true,classLegendDict:landcoverClassLegendDict},'Land Cover Time Lapse',false);
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

      Map2.addLayer(canyonsProjectArea,{'strokeColor':'#AA0','layerType':'geeVector'},'Canyons Project Area',false,null,null,'','reference-layer-list');
      Map2.addLayer(johnsonCreekProjectArea,{'strokeColor':'#AA0','layerType':'geeVector'},'Johnson Creek Project Area',false,null,null,'','reference-layer-list');
      Map2.addLayer(sageGrouseHomeRanges,{'strokeColor':'#ff6700','layerType':'geeVector'},'Sage Grouse Home Ranges',false,null,null,'','reference-layer-list');
      Map2.addLayer(sageGrouseSeasonalHabitat,{'strokeColor':'#ff6700','layerType':'geeVector'},'Sage Grouse Seasonal Habitat',false,null,null,'','reference-layer-list');

      var huc6 = ee.FeatureCollection("USGS/WBD/2017/HUC06").filterBounds(mls_study_area);
      var huc10 = ee.FeatureCollection("USGS/WBD/2017/HUC10").filterBounds(mls_study_area);

      Map2.addLayer(huc6,{'strokeColor':'#0000ff','layerType':'geeVector'},'HUC06 Boundaries',false,null,null,'USGS Watershed Boundary Dataset of Basins','reference-layer-list');
      Map2.addLayer(huc10,{'strokeColor':'#0000ff','layerType':'geeVector'},'HUC10 Boundaries',false,null,null,'USGS Watershed Boundary Dataset of Watersheds','reference-layer-list');

      var grazingAllotments = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/MLS_Allotments');
      var pastures = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/MLS_Pastures');

      Map2.addLayer(grazingAllotments,{'layerType':'geeVector'},'Allotment Boundaries',false,null,null,'','reference-layer-list'); //'RMU Dataset - area boundaries of livestock grazing allotments' 'min':1,'max':1,'palette':'#ff0000'
      Map2.addLayer(pastures,{'strokeColor':'#ffbf00','layerType':'geeVector'},'Pasture Boundaries',false,null,null,'RMU Dataset - area boundaries of pastures within livestock grazing allotments','reference-layer-list');
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

    Map2.addExport(dndYearForExport,'LCMS ' +studyAreaName +' v2019-1 '+exportSummaryMethodNameEnd+' Loss Year '+ startYear.toString() + '-'+ endYear.toString(),30,true,{'studyAreaName':studyAreaName,'version':'v2019.1','summaryMethod':summaryMethod,'whichOne':'Loss Year','startYear':startYear,'endYear':endYear,'min':startYear,'max':endYear});

    if(analysisMode === 'advanced'){
    Map2.addExport(dndSevForExport,'LCMS ' +studyAreaName +' v2019-1 '+exportSummaryMethodNameEnd+' Loss Probability '+ startYear.toString() + '-'+ endYear.toString(),30,false,{'studyAreaName':studyAreaName,'version':'v2019.1','summaryMethod':summaryMethod,'whichOne':'Loss Probability','startYear':startYear,'endYear':endYear,'min':0,'max':100});

    Map2.addExport(dndCountForExport,'LCMS ' +studyAreaName +' v2019-1 Loss Duration '+ startYear.toString() + '-'+ endYear.toString(),30,false,{'studyAreaName':studyAreaName,'version':'v2019.1','summaryMethod':summaryMethod,'whichOne':'Loss Duration','startYear':startYear,'endYear':endYear,'min':0,'max':endYear-startYear});

    }

    Map2.addExport(rnrYearForExport,'LCMS ' +studyAreaName +' v2019-1 '+exportSummaryMethodNameEnd+' Gain Year '+ startYear.toString() + '-'+ endYear.toString(),30,false,{'studyAreaName':studyAreaName,'version':'v2019.1','summaryMethod':summaryMethod,'whichOne':'Gain Year','startYear':startYear,'endYear':endYear,'min':startYear,'max':endYear});

    if(analysisMode === 'advanced'){
      Map2.addExport(rnrSevForExport,'LCMS ' +studyAreaName +' v2019-1 '+exportSummaryMethodNameEnd+' Gain Probability '+ startYear.toString() + '-'+ endYear.toString(),30,false,{'studyAreaName':studyAreaName,'version':'v2019.1','summaryMethod':summaryMethod,'whichOne':'Gain Probability','startYear':startYear,'endYear':endYear,'min':0,'max':100});

      Map2.addExport(rnrCountForExport,'LCMS ' +studyAreaName +' v2019-1 Gain Duration '+ startYear.toString() + '-'+ endYear.toString(),30,false,{'studyAreaName':studyAreaName,'version':'v2019.1','summaryMethod':summaryMethod,'whichOne':'Gain Duration','startYear':startYear,'endYear':endYear,'min':0,'max':endYear-startYear});

    }
    
    // if(analysisMode !== 'advanced' ){
    //   NFSLCMS =  NFSLCMS.select(['Loss Probability','Gain Probability']);
    //   NFSLCMSForCharting = NFSLCMSForCharting.select(['Loss Probability','Gain Probability']);
    //   chartColors = chartColorsDict.standard;

    // }
    // // else if(analysisMode !== 'advanced' && viewBeta === 'yes'){
    // //   NFSLCMS =  NFSLCMS.select(['Loss Probability','Gain Probability','Slow Loss Probability','Fast Loss Probability']);
    // //   NFSLCMSForCharting = NFSLCMSForCharting.select(['Loss Probability','Gain Probability','Slow Loss Probability','Fast Loss Probability']);
    // //   chartColors = chartColorsDict.beta;
    // // }
    // else if(analysisMode == 'advanced' && viewBeta === 'no'){
    //   NFSLCMS =  NFSLCMS.select(['Land Cover Class','Land Use Class','Loss Probability','Gain Probability']);
    //   NFSLCMSForCharting = NFSLCMSForCharting.select(['Land Cover Class','Land Use Class','Loss Probability','Gain Probability']);
    //   chartColors = chartColorsDict.advanced;
    // }
    // else{
      NFSLCMS =  NFSLCMS.select(['Land Cover Class','Land Use Class','Loss Probability','Gain Probability','Slow Loss Probability','Fast Loss Probability']);
      NFSLCMSForCharting = NFSLCMSForCharting.select(['Land Cover Class','Land Use Class','Loss Probability','Gain Probability','Slow Loss Probability','Fast Loss Probability']);
      // chartColors = chartColorsDict.advancedBeta;
    // }

    var steppedLineLC = false;
    if(studyAreaName === 'CNFKP'){steppedLineLC = true;}
    
    var lcStack =formatAreaChartCollection(rawLC,lcValues,Object.keys(landcoverClassChartDict))
    var luStack =formatAreaChartCollection(rawLU,luValues,Object.keys(landuseClassChartDict))
    


    var landcoverClassQueryDictDecimal = {};
    Object.keys(landcoverClassQueryDict).map(function(k){landcoverClassQueryDictDecimal[k/10]= landcoverClassQueryDict[k]});
    var landuseClassQueryDictDecimal = {};
    Object.keys(landuseClassQueryDict).map(function(k){landuseClassQueryDictDecimal[k/10]= landuseClassQueryDict[k]});
    var chartTableDict = {
    'Land Cover Class':landcoverClassQueryDictDecimal,
    'Land Use Class':landuseClassQueryDictDecimal
    

  }
  
  whichIndices.map(function(whichIndex){
     //------LANDTRENDR-------- 
    print(landtrendr_format)
    if (landtrendr_format == 'landtrendr_vertex_format'){
      var LTstackCollection = ee.ImageCollection(studyAreaDict[longStudyAreaName].ltCollection).filter(ee.Filter.eq('band',whichIndex))
      // var landtrendr = convertStack_To_DurFitMagSlope(LTstackCollection, 'LT');
      // var fittedAsset = landtrendr.map(function(img){return LT_VT_multBands(img, 0.0001)})
      //                         .select([whichIndex+'_LT_fitted'],['LANDTRENDR Fitted '+ whichIndex]);
    
      var fittedAsset = ltStackToFitted(LTstackCollection.mosaic(),startYear,endYear).select(['fit'],['LANDTRENDR Fitted '+ whichIndex]);;
      // console.log(fittedAsset.getInfo())
      // var fittedAsset = ee.ImageCollection(collectionDict[studyAreaName][2])
      //     .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
      //     .map(function(img){return multBands(img,1,0.0001)})
      //     .select(['LT_Fitted_'+whichIndex]);
    } else {      
      var fittedAsset = ee.ImageCollection(studyAreaDict[longStudyAreaName].ltCollection)
          .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
          .map(function(img){return multBands(img,1,0.0001)})
          .select(['LT_Fitted_'+whichIndex],['LANDTRENDR Fitted '+ whichIndex]);
    }

    //Set up charting
    var rawIndices = whichIndices.map(function(s){return 'Raw '+ s})
    var forCharting = joinCollections(composites.select([whichIndex],['Raw '+whichIndex]),fittedAsset, false);
    

    forCharting = joinCollections(forCharting,NFSLCMSForCharting, false);
    chartCollection =forCharting;
    // console.log(chartCollection.getInfo())
    pixelChartCollections['basic-'+whichIndex] = {'label':'Standard Loss/Gain ',
                                    'collection':chartCollection.select(['Raw.*','LANDTRENDR.*','Loss Probability','Gain Probability']),
                                    'chartColors':chartColorsDict.coreLossGain,
                                    'tooltip':'Chart loss, gain and the '+whichIndex + ' vegetation index',
                                    'xAxisLabel':'Year',
                                    'yAxisLabel':'Model Confidence or Index Value'}
    pixelChartCollections['all-loss-gain-'+whichIndex] = {'label':'Advanced Loss/Gain',
                                    'collection':chartCollection.select(['Raw.*','LANDTRENDR.*','.*Loss Probability','Gain Probability']),
                                    'chartColors':chartColorsDict.allLossGain,
                                    'tooltip':'Chart loss, slow loss, fast loss, gain and the '+whichIndex + ' vegetation index',
                                    'xAxisLabel':'Year',
                                    'yAxisLabel':'Model Confidence or Index Value'}

    
    if(studyAreaDict[longStudyAreaName].lcmsSecondaryLandcoverCollection !== undefined && studyAreaDict[longStudyAreaName].lcmsSecondaryLandcoverCollection !== null){
    
      
      var landcoverMaxByYearsForCharting = landcoverMaxByYears.map(function(img){return img.multiply(0.1).rename(['Land Cover Class']).copyProperties(img,['system:time_start'])})
      forCharting = joinCollections(forCharting.select([0,1,3,4,5,6,7]),landcoverMaxByYearsForCharting, false).select([0,1,7,2,3,4,5,6]);
      // console.log(forCharting.getInfo())
      chartTableDict['Land Cover Class'] = lc2ChartLookupDict
      pixelChartCollections['all-'+whichIndex] = {'label':'Advanced Loss/Gain and Land Cover/Land Use',
                                    'collection':forCharting,
                                    'chartColors':chartColorsDict.advancedBeta,
                                    'tooltip':'Chart loss, slow loss, fast loss, gain, land cover, land use, and the '+whichIndex + ' vegetation index',
                                    'xAxisLabel':'Year',
                                    'yAxisLabel':'Model Confidence, Class, or Index Value',
                                    'chartTableDict':chartTableDict,
                                    'legends':{'Land Cover Class': JSON.stringify(lc2ChartLegendDict),'Land Use Class:':JSON.stringify(landuseClassChartDict)},
                                    
                                  }
        }else{
          pixelChartCollections['all-'+whichIndex] = {'label':'Advanced Loss/Gain and Land Cover/Land Use',
                                    'collection':chartCollection,
                                    'chartColors':chartColorsDict.advancedBeta,
                                    'tooltip':'Chart loss, slow loss, fast loss, gain, land cover, land use, and the '+whichIndex + ' vegetation index',
                                    'chartTableDict':chartTableDict,
                                    'legends':{'Land Cover Class': JSON.stringify(landcoverClassChartDict),'Land Use Class:':JSON.stringify(landuseClassChartDict)},
                                    'xAxisLabel':'Year',
                                    'yAxisLabel':'Model Confidence, Class, or Index Value'}
        }
    
  })
      
  // chartCollection = chartCollection.set('chartTableDict',chartTableDict)
  //   if(analysisMode === 'advanced'){
  //    chartCollection = chartCollection.set('legends',{'Land Cover Class': JSON.stringify(landcoverClassChartDict),'Land Use Class:':JSON.stringify(landuseClassChartDict)}) 
  //   }


    var lossGainAreaCharting = joinCollections(dndThresh,rnrThresh,false).select(['.*_change_year']);
    

    // if(analysisMode === 'advanced' && viewBeta === 'yes'){
      var lossGainSlowFastAreaCharting = joinCollections(lossGainAreaCharting,dndSlowThresh,false).select(['.*_change_year']);
      lossGainSlowFastAreaCharting = joinCollections(lossGainSlowFastAreaCharting,dndFastThresh,false).select(['.*_change_year']);
      lossGainSlowFastAreaCharting = lossGainSlowFastAreaCharting.select([0,1,2,3],['Loss','Gain','Slow Loss','Fast Loss'])
    // }else{
      lossGainAreaCharting = lossGainAreaCharting.select([0,1],['Loss','Gain'])
    // };
    // console.log(lossGainSlowFastAreaCharting.getInfo());
    var lossGainAreaChartingGeo = lossGainAreaCharting.geometry();
    lossGainAreaCharting =lossGainAreaCharting.map(function(img){
      return img.mask()//.clip(lossGainAreaChartingGeo)
    });
    lossGainSlowFastAreaCharting =lossGainSlowFastAreaCharting.map(function(img){
      return img.mask()//.clip(lossGainAreaChartingGeo)
    });
    
    

    getSelectLayers();
    
    areaChartCollections['lg'] = {'label':'Standard Loss/Gain',
                                  'collection':lossGainAreaCharting,
                                  'stacked':false,
                                  'steppedLine':false,
                                  'tooltip':'Summarize loss and gain for each year',
                                  'colors':chartColorsDict.advancedBeta.slice(4),
                                  'xAxisLabel':'Year'};
    areaChartCollections['lgSF'] = {'label':'Advanced Loss/Gain',
                                  'collection':lossGainSlowFastAreaCharting,
                                  'stacked':false,
                                  'steppedLine':false,
                                  'tooltip':'Summarize loss, slow loss, fast loss, and gain for each year',
                                  'colors':chartColorsDict.advancedBeta.slice(4),
                                  'xAxisLabel':'Year'};
    
    if(studyAreaDict[longStudyAreaName].lcmsSecondaryLandcoverCollection !== undefined && studyAreaDict[longStudyAreaName].lcmsSecondaryLandcoverCollection !== null){
    
      var landcoverMaxByYearsStack =formatAreaChartCollection(landcoverMaxByYears,valueList,legendList);

      pixelChartCollections['secondarylc'] = {'label':'Land Cover Probability',
                                    'collection':landcoverByYears,
                                    'chartColors':colorList,
                                    'tooltip':'Chart the raw modelled probability of each land cover class for each year',
                                    'xAxisLabel':'Year',
                                    'yAxisLabel':'Model Confidence'}
   
      areaChartCollections['lc2'] = {'label':'Land Cover',
                                  'collection':landcoverMaxByYearsStack,
                                  'stacked':true,
                                  'steppedLine':steppedLineLC,
                                  'tooltip':'Summarize land cover classes for each year',
                                  'colors':colorList,
                                  'xAxisLabel':'Year'};
    }
    else{
      areaChartCollections['lc'] = {'label':'Land Cover',
                                  'collection':lcStack,
                                  'stacked':true,
                                  'steppedLine':steppedLineLC,
                                  'tooltip':'Summarize land cover classes for each year',
                                  'colors':Object.values(landcoverClassLegendDict),
                                  'xAxisLabel':'Year'};
    }        

      areaChartCollections['lu'] = {'label':'Land Use',
                                  'collection':luStack,
                                  'stacked':true,
                                  'steppedLine':steppedLineLC,
                                  'tooltip':'Summarize land use classes for each year',
                                  'colors':Object.values(landuseClassLegendDict),
                                  'xAxisLabel':'Year'};            
    populatePixelChartDropdown();
    populateAreaChartDropdown();
    // if(endYear === 2018 && warningShown === false){warningShown = true;showTip('<i class="text-dark fa fa-exclamation-triangle"></i> CAUTION','Including decline detected the last year of the time series (2018) can lead to high commission error rates.  Use with caution!')}

}; // End runUSFS()


//------------------------------Main Function to Run CONUS Product----------------------------------------------------------

function runCONUS(){
  startYear = parseInt(urlParams.startYear);
  endYear = parseInt(urlParams.endYear);
  analysisMode = urlParams.analysisMode;
  summaryMethod = urlParams.summaryMethod;
  getLCMSVariables();
  queryClassDict = {};
  setupDownloads(studyAreaName);
  //Bring in reference data
  getHansen();
  mtbsSummaryMethodDict = {'year':'Most-Recent','prob':'Highest-Severity'};
  mtbsSummaryMethod = mtbsSummaryMethodDict[summaryMethod]
  var mtbsAndIDS = getMTBSandIDS(studyAreaName);
  
  var ltCONUSC;
  whichIndices.map(function(whichIndex){
    var ltCONUS = ee.ImageCollection(studyAreaDict[longStudyAreaName].ltCollection)
                .filter(ee.Filter.eq('timeSeries',whichIndex)).mosaic();
  
    var yrNames = ee.List.sequence(1,11).map(function(i){return ee.String('yrs_').cat(ee.Number(i).byte().format())});
    var fitNames = ee.List.sequence(1,11).map(function(i){return ee.String('fit_').cat(ee.Number(i).byte().format())});

    var ltCONUSYr = ltCONUS.select(['doy.*'],yrNames);
    var ltCONUSFit = ltCONUS.select(['ftv.*'],fitNames);

    ltCONUS = ltCONUSYr.addBands(ltCONUSFit);
    var ltCONUSCT =fitStackToCollection(ltCONUS, 10, startYear, endYear).select(['fitted'],[whichIndex + '_LT_Fitted']).map(function(img){return multBands(img,-1,0.001)});
    if(ltCONUSC === undefined){
      ltCONUSC = ltCONUSCT
    }else{ltCONUSC = joinCollections(ltCONUSC,ltCONUSCT,false)}
  })
 
  var composites = ee.ImageCollection(studyAreaDict[longStudyAreaName].compositeCollection)
      .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
      .select([0,1,2,3,4,5],['blue','green','red','nir','swir1','swir2'])
      .filter(ee.Filter.stringContains('system:index','ONUS_Medoid_Jun-Sept').not());
    // Map2.addTimeLapse(rnrThresh.limit(8).select([0]),{min:lowerThresholdRecovery,max:100,palette:'080,0F0'},'Gain')
  var raw = composites.map(simpleAddIndices).select(whichIndices).map(setSameDate);

  var raw = joinCollections(raw,ltCONUSC,false);

  var years = ee.List.sequence(startYear,endYear);
  var yearsCli = years.getInfo()
  
  // var lt = ee.ImageCollection('projects/LCMS/CONUS_Products/LT');
  // var lt = ee.ImageCollection('projects/LCMS/CONUS_Products/LT20191231');
  
  // var lcms  = ee.ImageCollection('projects/LCMS/CONUS_Products/v20191209');
  // var lcms  = ee.ImageCollection('projects/LCMS/CONUS_Products/v20191231').map(function(img){return img.translate(15,-15)});
  var lcms  = ee.ImageCollection(studyAreaDict[longStudyAreaName].lcmsCollection).map(function(img){return img.translate(15,-15)});
  
  
  
  /////////////////////////////////////////
  lcms = years.map(function(yr){
    var lcmsT = lcms.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
    lcmsT = lcmsT.unmask(0);
    lcmsT = ee.Image(multBands(lcmsT,1,[0.01])).float()
    return lcmsT.rename(['Loss Probability']);
  });
  lcms = ee.ImageCollection.fromImages(lcms);
 
   var lossProb = lcms
   //    // .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
   //    // .map(function(img){return img})
   //    .map(function(img){return ee.Image(multBands(img,1,[0.01])).float()});
    
   
    var clientBoundary = clientBoundsDict.CONUS;//lossProb.geometry().bounds(1000).getInfo();


    if(applyTreeMask === 'yes' || analysisMode == 'standard'){
      console.log('Applying tree mask');
      // var treeMask = ee.Image('users/yang/CONUS_NLCD2016/CONUS_LCMS_ForestMask').translate(15,-15);
      // var treeMask = ee.Image('projects/LCMS/CONUS_Products/CONUS_LCMS_ForestMask');
      
      var forestMaskQueryDict = {1:'Tree',3:'Woody Wetland',2:'Shrub',0:'Other'};
      // Map2.addLayer(treeMask.set('bounds',clientBoundary),{min:0,max:3,palette:'a1a1a1,32681e,ffb88c,97ffff',addToClassLegend:true,classLegendDict:{'Tree':'32681e','Woody Wetland':'97ffff','Shrub':'ffb88c','Other':'a1a1a1'},queryDict:forestMaskQueryDict},'Landcover Mask Classes Old',false,null,null,'Landcover classes of 3 or more years. Any pixel that was tree 3 or more years is tree. Remaining pixels, any pixel that was woody wetland 3 or more years is woody wetland. Remaining pixels, any pixel that was shrub 3 or more years is shrub.  Remaining pixels are other. Both tree and woodywetland classes are included in the tree mask.');
      
      // var treeMask = ee.Image('users/yang/CONUS_NLCD2016/CONUS_LCMS_ForestMask');
      var treeMask = ee.Image('projects/LCMS/CONUS_Products/CONUS_LCMS_ForestMask').translate(15,-15);
      
      var forestMaskQueryDict = {1:'Tree',3:'Woody Wetland',2:'Shrub',0:'Other'};
     if(analysisMode === 'advanced'){
      Map2.addLayer(treeMask.set('bounds',clientBoundary),{min:0,max:3,palette:'a1a1a1,32681e,ffb88c,97ffff',addToClassLegend:true,classLegendDict:{'Tree':'32681e','Woody Wetland':'97ffff','Shrub':'ffb88c','Other':'a1a1a1'},queryDict:forestMaskQueryDict},'Landcover Mask Classes',false,null,null,'Landcover classes of 3 or more years. Any pixel that was tree 3 or more years is tree. Remaining pixels, any pixel that was woody wetland 3 or more years is woody wetland. Remaining pixels, any pixel that was shrub 3 or more years is shrub.  Remaining pixels are other. Both tree and woodywetland classes are included in the tree mask.');
     }
      
      treeMask = treeMask.eq(1).or(treeMask.eq(3)).selfMask();
      var treeClassLegendDict = {};
      treeClassLegendDict['Tree (3 or more years)'] = '32681e';

      // Map2.addLayer(treeMask.set('bounds',clientBoundary),{min:1,max:1,palette:'32681e',addToClassLegend: true,classLegendDict:treeClassLegendDict},'Tree Mask',false,null,null,'Mask of areas LCMS classified as tree cover for 3 or more years');
      lossProb = lossProb.map(function(img){return img.updateMask(treeMask)})
    }

    var dndThresh = thresholdChange(lossProb,lowerThresholdDecline,upperThresholdDecline, 1);
    
  if(summaryMethod === 'year'){
    var dndThreshOut = dndThresh.qualityMosaic('Loss Probability_change_year');//.qualityMosaic('Decline_change');
    

    var threshYearNameEnd = 'Most recent year of ';
    var threshProbNameEnd = 'Probability of most recent year of ';
    var exportSummaryMethodNameEnd = 'Most Recent';
  }
  else{
    var dndThreshOut = dndThresh.qualityMosaic('Loss Probability');//.qualityMosaic('Decline_change');
    
    var threshYearNameEnd = 'Year of highest probability of ';
    var threshProbNameEnd = 'Highest probability of ';
    var exportSummaryMethodNameEnd = 'Highest Probability';

  }

  

  var declineNameEnding = '('+startYear.toString() + '-' + endYear.toString()+') (p >= '+lowerThresholdDecline.toString()+' and p <= '+upperThresholdDecline.toString()+')';

  Map2.addLayer(dndThreshOut.select([1]).set('bounds',clientBoundary),{'min':startYear,'max':endYear,'palette':declineYearPalette},'Loss Year',true,null,null,threshYearNameEnd+'loss ' +declineNameEnding);
  // Map2.addLayer(dndThreshOutOld.select([1]),{'min':startYear,'max':endYear,'palette':declineYearPalette },studyAreaName +' Decline Old Year',true,null,null,threshYearNameEnd+'decline ' +declineNameEnding);

  Map2.addTimeLapse(dndThresh.select([1]),{min:startYear,max:endYear,palette:declineYearPalette,years:yearsCli},'Loss Year Time Lapse',false);
  if(analysisMode === 'advanced'){
    // ee.List.sequence(startYear,endYear,1).getInfo().map(function(yr){
    //   if(yr%5 == 0 || yr === startYear || yr === endYear){
    //     var composite = composites.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic();
    //     Map2.addLayer(composite.set('bounds',clientBoundary),{min:500,max:[3500,5500,3500],bands:'swir2,nir,red'},'Landsat Composite '+yr.toString(),false)
    //   }  
    // });
    Map2.addTimeLapse(composites,{min:500,max:[3500,5500,3500],bands:'swir2,nir,red',years:yearsCli},'Composites Time Lapse',false);
  
  }
  // Map2.addLayer(dndThreshOutOld.select([0]),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},studyAreaName +' Decline Old Probability',false,null,null,threshProbNameEnd+ 'decline ' + declineNameEnding);
  var dndYearForExport = dndThreshOut.select([1]).int16();//.subtract(1970).byte();


  Map2.addExport(dndYearForExport,'LCMS ' +studyAreaName +' vCONUS-2019-1 '+exportSummaryMethodNameEnd+' Loss Year '+ startYear.toString() + '-'+ endYear.toString(),30,false,{'studyAreaName':studyAreaName,'version':'vCONUS.2019.1','summaryMethod':summaryMethod,'whichOne':'Loss Year','startYear':startYear,'endYear':endYear,'min':startYear,'max':endYear});



  if(analysisMode === 'advanced'){
  Map2.addLayer(dndThreshOut.select([0]).set('bounds',clientBoundary),{'min':lowerThresholdDecline,'max':upperThresholdDecline ,'palette':declineProbPalette},'Loss Probability',false,null,null,threshProbNameEnd+ 'loss ' + declineNameEnding);

  var dndCount = dndThresh.select([0]).count();
  Map2.addLayer(dndCount.set('bounds',clientBoundary),{'min':1,'max':5,'palette':declineDurPalette},'Loss Duration',false,'years',null,'Total duration of loss '+declineNameEnding);

  var dndSevForExport = dndThreshOut.select([0]).multiply(100).add(1).byte();
  dndSevForExport = dndSevForExport.where(dndSevForExport.eq(101),100);
  var dndCountForExport = dndCount.byte();
  Map2.addExport(dndSevForExport,'LCMS ' +studyAreaName +' vCONUS-2019-1 '+exportSummaryMethodNameEnd+' Loss Probability '+ startYear.toString() + '-'+ endYear.toString(),30,false,{'studyAreaName':studyAreaName,'version':'vCONUS.2019.1','summaryMethod':summaryMethod,'whichOne':'Loss Probability','startYear':startYear,'endYear':endYear,'min':0,'max':100});

  Map2.addExport(dndCountForExport,'LCMS ' +studyAreaName +' vCONUS-2019-1 Loss Duration '+ startYear.toString() + '-'+ endYear.toString(),30,false,{'studyAreaName':studyAreaName,'version':'vCONUS.2019.1','summaryMethod':summaryMethod,'whichOne':'Loss Duration','startYear':startYear,'endYear':endYear,'min':0,'max':endYear-startYear});

  }
  chartCollection = joinCollections(raw,lossProb,false);
  var forAreaCharting = dndThresh.select(["Loss Probability_change_year"],['Loss']);
  
  forAreaCharting = forAreaCharting.map(function(img){return img.mask()})
  
  //Bring in AZ sad data
  var az_sad_accumlative_bounds = {"geodesic":false,"type":"Polygon","coordinates":[[[-113.91098712647988,31.45169750161665],[-108.8813128720895,31.45169750161665],[-108.8813128720895,36.844119954348365],[-113.91098712647988,36.844119954348365],[-113.91098712647988,31.45169750161665]]]};
  var az_sad_fhp_bounds = {"geodesic":false,"type":"Polygon","coordinates":[[[-112.24920059931354,34.38791770067013],[-111.08942723165458,34.38791770067013],[-111.08942723165458,35.543658110630254],[-112.24920059931354,35.543658110630254],[-112.24920059931354,34.38791770067013]]]};
  var az_ads_2019_bounds= {"geodesic":false,"type":"Polygon","coordinates":[[[-113.91848427979691,31.376322382702632],[-109.04556497153769,31.376322382702632],[-109.04556497153769,36.86844802806162],[-113.91848427979691,36.86844802806162],[-113.91848427979691,31.376322382702632]]]};
  
  var nm_sad_bounds = {
  "geodesic": false,
  "type": "Polygon",
  "coordinates": [
    [
      [
        -109.27704677806874,
        32.68652248686129
      ],
      [
        -104.31938201771926,
        32.68652248686129
      ],
      [
        -104.31938201771926,
        37.00436725159395
      ],
      [
        -109.27704677806874,
        37.00436725159395
      ],
      [
        -109.27704677806874,
        32.68652248686129
      ]
    ]
  ]
};
    addSubCollapse('reference-layer-list','fhp-label','fhp-div','FHP Layers', '',false,'')
    $('#fhp-label').prop('title','Various layers for Forest Health Protection applications. Most layers are Aerial Detection Survey-based data')
  $('#reference-layer-list').append(`<div class = 'dropdown-divider'></div`)
    var ids = mtbsAndIDS[2].map(function(f){return f.set('name',f.get('DAMAGE_ARE'))}).set('bounds',clientBoundsDict.CONUS);

   //HOST_CODE = 746 AND (DAMAGE_TYPE_CODE = 2 OR DAMAGE_TYPE_CODE = 4) AND DCA_CODE <> 30000
  //This query for aspen mortality/decline includes crown dieback which has also been used and I think would be appropriate to include. It will capture all agents except specifically excluding fire (30000) and will be composed primarily of three "DCAs" or Damage Casual Agents, 24000 = Wilts, 24008 = Decline complex, and 29002 = Sudden aspen decline.
  var aspen_mort_dieback = ids.filter(ee.Filter.and(ee.Filter.eq('HOST_CODE',746),ee.Filter.or(ee.Filter.eq('DAMAGE_TYP',2),ee.Filter.eq('DAMAGE_TYP',4)),ee.Filter.neq('DCA_CODE',30000))).set('bounds',clientBoundsDict.CONUS);
  Map2.addLayer(aspen_mort_dieback,{strokeColor:'0D0',layerType : 'geeVectorImage'}, 'IDS Aspen Mortality/Dieback',false,null,null,'Aspen mortality/decline includes crown dieback which has also been used and I think would be appropriate to include. It will capture all agents except specifically excluding fire (30000) and will be composed primarily of three "DCAs" or Damage Casual Agents, 24000 = Wilts, 24008 = Decline complex, and 29002 = Sudden aspen decline. SQL = HOST_CODE = 746 AND (DAMAGE_TYPE_CODE = 2 OR DAMAGE_TYPE_CODE = 4) AND DCA_CODE <> 30000','fhp-div');

  //HOST_CODE = 746 AND (DAMAGE_TYPE_CODE = 1 OR DAMAGE_TYPE_CODE = 12 OR DAMAGE_TYPE_CODE = 13 OR DAMAGE_TYPE_CODE = 14)
  //This query will capture all agents mapped as causing defoliation to aspen including, but not limited to 12900 (general defoliator code), 25036 (Marssonina/Black leaf spot), and 80001 (older multi-agent aspen defoliation code).
  var aspen_defoliation = ids.filter(ee.Filter.and(ee.Filter.eq('HOST_CODE',746),ee.Filter.or(ee.Filter.eq('DAMAGE_TYP',12),ee.Filter.eq('DAMAGE_TYP',13),ee.Filter.eq('DAMAGE_TYP',14)))).set('bounds',clientBoundsDict.CONUS)
  Map2.addLayer(aspen_defoliation,{strokeColor:'00D',layerType : 'geeVectorImage'}, 'IDS Aspen Defoliation',false,null,null,'All agents mapped as causing defoliation to aspen including, but not limited to 12900 (general defoliator code), 25036 (Marssonina/Black leaf spot), and 80001 (older multi-agent aspen defoliation code). SQL = HOST_CODE = 746 AND (DAMAGE_TYPE_CODE = 1 OR DAMAGE_TYPE_CODE = 12 OR DAMAGE_TYPE_CODE = 13 OR DAMAGE_TYPE_CODE = 14)','fhp-div');

  var az_sad_accumlative = ee.FeatureCollection('projects/USFS/LCMS-NFS/R3/SAD/AZ_accumlative_aspen_decline').set('bounds',az_sad_accumlative_bounds);

  var az_sad_fhp = ee.FeatureCollection('projects/USFS/LCMS-NFS/R3/SAD/Aspen_layer_2017_FHPmapped_Final').set('bounds',az_sad_fhp_bounds);
  var az_ads_2019 = ee.FeatureCollection('projects/USFS/LCMS-NFS/R3/SAD/AZ_ADS__Damage_2019').set('bounds',az_ads_2019_bounds);
  // console.log(JSON.stringify(az_ads_2019.geometry().bounds().getInfo()))
  Map2.addLayer(az_sad_accumlative,{strokeColor:'00F',layerType:'geeVectorImage'},'AZ SAD Accumlative',false,null,null,null,'fhp-div');
  Map2.addLayer(az_sad_fhp,{strokeColor:'F0F',layerType:'geeVectorImage'},'AZ Aspen Polygons',false,null,null,null,'fhp-div');
  Map2.addLayer(az_ads_2019,{strokeColor:'0FF',layerType:'geeVectorImage'},'AZ ADS 2019',false,null,null,null,'fhp-div');
  

  var nmSAD = ee.List.sequence(2011,2018).getInfo().map(function(yr){
    yr = yr.toString();
    var fc = ee.FeatureCollection('projects/USFS/LCMS-NFS/R3/SAD/NM_Aspen_Mort_'+yr);
    return fc;
  });


  nmSAD = ee.FeatureCollection(nmSAD).flatten().set('bounds',nm_sad_bounds);
  // nmSADYrMin = nmSAD.reduceToImage(['Year'],ee.Reducer.min());
  // nmSADYrMax = nmSAD.reduceToImage(['Year'],ee.Reducer.max());
  // nmSADYrCount = nmSAD.reduceToImage(['Year'],ee.Reducer.count());
  // Map2.addLayer(nmSADYrMin,{min:2011,max:2018},'nm yr min',false);
  // Map2.addLayer(nmSADYrMax,{min:2011,max:2018},'nm yr max',false);
  // Map2.addLayer(nmSADYrCount,{min:1,max:7},'nm yr count',false);
  
  Map2.addLayer(nmSAD,{strokeColor:'808',layerType:'geeVectorImage'},'NM Aspen Mort 2011-2018',false,null,null,null,'fhp-div');
  Map2.addLayer(chartCollection,{opacity:0},'LCMS CONUS Time Series',false,null,null,null,'fhp-div');
  az_sad_accumlative = az_sad_accumlative.map(function(f){return f.set('name',f.get('OBJECTID'))}).set('bounds',az_sad_accumlative_bounds);
  az_sad_fhp = az_sad_fhp.map(function(f){return f.set('name',f.get('MODIFIED_D'))}).set('bounds',az_sad_fhp_bounds);
  az_ads_2019 = az_ads_2019.map(function(f){return f.set('name',f.get('MODIFIED_D'))}).set('bounds',az_ads_2019_bounds);
  nmSAD = nmSAD.map(function(f){return f.set('name',f.get('OBJECTID'))}).set('bounds',nm_sad_bounds);
  

 
  //Add select layers
  Map2.addSelectLayer(aspen_mort_dieback,{strokeColor:'0D0',layerType : 'geeVectorImage'}, 'IDS Aspen Mortality/Dieback',false,null,null,'Aspen mortality/decline includes crown dieback which has also been used and I think would be appropriate to include. It will capture all agents except specifically excluding fire (30000) and will be composed primarily of three "DCAs" or Damage Casual Agents, 24000 = Wilts, 24008 = Decline complex, and 29002 = Sudden aspen decline. SQL = HOST_CODE = 746 AND (DAMAGE_TYPE_CODE = 2 OR DAMAGE_TYPE_CODE = 4) AND DCA_CODE <> 30000','fhp-div');
  Map2.addSelectLayer(aspen_defoliation,{strokeColor:'00D',layerType : 'geeVectorImage'}, 'IDS Aspen Defoliation',false,null,null,'All agents mapped as causing defoliation to aspen including, but not limited to 12900 (general defoliator code), 25036 (Marssonina/Black leaf spot), and 80001 (older multi-agent aspen defoliation code). SQL = HOST_CODE = 746 AND (DAMAGE_TYPE_CODE = 1 OR DAMAGE_TYPE_CODE = 12 OR DAMAGE_TYPE_CODE = 13 OR DAMAGE_TYPE_CODE = 14)','fhp-div');

  var states = ee.FeatureCollection('TIGER/2018/States');
  var az = states.filter(ee.Filter.eq('NAME','Arizona'));
  var nm = states.filter(ee.Filter.eq('NAME','New Mexico'));
  // var r3 = usfs_regions.filter(ee.Filter.eq('REGION','03'))
  var aspen_mort_dieback_az = aspen_mort_dieback.filterBounds(az).union().map(function(f){return f.set('name','AZ Aspen Dieback/Mortality')});
  var aspen_mort_dieback_nm = aspen_mort_dieback.filterBounds(nm).union().map(function(f){return f.set('name','NM Aspen Dieback/Mortality')});

  var aspen_defol_az = aspen_defoliation.filterBounds(az).union().map(function(f){return f.set('name','AZ Aspen Defoliation')});
  var aspen_defol_nm = aspen_defoliation.filterBounds(nm).union().map(function(f){return f.set('name','NM Aspen Defoliation')});

  Map2.addSelectLayer(aspen_mort_dieback_az,{strokeColor:'F0F',layerType:'geeVectorImage'},'AZ Aspen Dieback/Mortality Single Poly',false,null,null,'AZ Aspen Dieback/Mortality Single Poly. Turn on layer and click on any area wanted to include in chart');
  Map2.addSelectLayer(aspen_mort_dieback_nm,{strokeColor:'FF0',layerType:'geeVectorImage'},'NM Aspen Dieback/Mortality Single Poly',false,null,null,'NM Aspen Dieback/Mortality Single Poly. Turn on layer and click on any area wanted to include in chart');
  Map2.addSelectLayer(aspen_defol_az,{strokeColor:'F0F',layerType:'geeVectorImage'},'AZ Aspen Defoliation Single Poly',false,null,null,'AZ Aspen Defoliation Single Poly. Turn on layer and click on any area wanted to include in chart');
  Map2.addSelectLayer(aspen_defol_nm,{strokeColor:'FF0',layerType:'geeVectorImage'},'NM Aspen Defoliation Single Poly',false,null,null,'NM Aspen Defoliation Single Poly. Turn on layer and click on any area wanted to include in chart');

  Map2.addSelectLayer(az_sad_accumlative,{strokeColor:'F0F',layerType:'geeVectorImage'},'AZ SAD Accumlative',false,null,null,'AZ SAD Accumlative. Turn on layer and click on any area wanted to include in chart');
  Map2.addSelectLayer(az_sad_fhp,{strokeColor:'00F',layerType:'geeVectorImage'},'AZ Aspen Polygons',false,null,null,'AZ Aspen Polygons. Turn on layer and click on any area wanted to include in chart');
  Map2.addSelectLayer(az_ads_2019,{strokeColor:'0FF',layerType:'geeVectorImage'},'AZ ADS 2019',false,null,null,'AZ ADS 2019. Turn on layer and click on any area wanted to include in chart');
  Map2.addSelectLayer(nmSAD,{strokeColor:'808',layerType:'geeVectorImage'},'NM Aspen Mort 2011-2018',false,null,null,'NM Aspen Mort 2011-2018. Turn on layer and click on any area wanted to include in chart');
 
  Map2.addSelectLayer(ids,{strokeColor:'D0D',layerType:'geeVectorImage'},'IDS Polygons',false,null,null,'IDS Select Polygons. Turn on layer and click on any area wanted to include in chart');


  getSelectLayers();
  // areaChartCollections = {};
  areaChartCollections['lg'] = {'label':'Loss',
                                'stacked':false,
                                'steppedLine':false,
                                'collection':forAreaCharting,
                                'colors':['F00'],
                            	 'xAxisLabel':'Year'};
  whichIndices.map(function(whichIndex){
    pixelChartCollections[whichIndex] = {'label':'Loss',
                                    'collection':chartCollection.select([whichIndex+'.*','Loss Probability']),
                                    'colors':chartColorsDict.coreLossGain,
                                    'xAxisLabel':'Year',
                                    'yAxisLabel':'Model Confidence or Index Value'}
  })
  

                                    // console.log(ee.Image(chartCollection.select(['NDVI.*','Loss Probability']).first()).bandNames().getInfo())
  populatePixelChartDropdown();
  populateAreaChartDropdown();

  // if(endYear === 2018 && warningShown === false){warningShown = true;showTip('<i class="text-dark fa fa-exclamation-triangle"></i> CAUTION','Including decline detected the last year of the time series (2018) can lead to high commission error rates.  Use with caution!')}

} // end runCONUS()
function runBaseLearner(){
 // var startYear = 1984;
// var endYear = 2019;
var studyAreaName = 'USFS LCMS 1984-2020';
var startYear = parseInt(urlParams.startYear);
var endYear = parseInt(urlParams.endYear);

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
    yr = ee.Number(yr);
    
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
var indicesUsed = []
Object.keys(whichIndices2).map(function(k){
  var indexName = k;
  
  if(whichIndices2[k]){
    indicesUsed.push(k)
    console.log(indexName); 
    var ltCONUST = lt.filter(ee.Filter.eq('band',indexName)).mosaic();

    var lossGainCONUSLT = ee.Image(getLossGainLT(ltCONUST,1984,2020,1,6,'yrs_vert_','fit_vert_',-1,lossThresh,gainThresh));

    var lossYrMask = lossGainCONUSLT.select(['loss_year']);
    lossYrMask = lossYrMask.gte(startYear).and(lossYrMask.lte(endYear)).selfMask();

    var gainYrMask = lossGainCONUSLT.select(['gain_year']);
    gainYrMask = gainYrMask.gte(startYear).and(gainYrMask.lte(endYear)).selfMask();

    lossCONUSLT = lossGainCONUSLT.select(['loss_.*']).mask(lossYrMask);
    gainCONUSLT = lossGainCONUSLT.select(['gain_.*']).mask(gainYrMask);

    Map2.addExport(lossCONUSLT.addBands(gainCONUSLT).int16().unmask(-32768,false),'LandTrendr Loss Gain Stack '+indexName +' '+ startYear.toString() + ' '+ endYear.toString(),30,false,{})
    Map2.addLayer(lossCONUSLT.select(['loss_year']),{min:startYear,max:endYear,palette:lossYearPalette},'LandTrendr Loss Year '+indexName,true);
    Map2.addLayer(lossCONUSLT.select(['loss_mag']).multiply(-0.0001),{max:lossThresh/10000*-1,min:lossThresh*3/10000*-1,palette:lossMagPalette},'LandTrendr Loss Mag '+indexName,false);
    Map2.addLayer(lossCONUSLT.select(['loss_dur']),{min:1,max:5,palette:durPalette,legendLabelLeftAfter:'year',legendLabelRightAfter:'years'},'LandTrendr Loss Dur '+indexName,false);

    Map2.addLayer(gainCONUSLT.select(['gain_year']),{min:startYear,max:endYear,palette:gainYearPalette},'LandTrendr Gain Year '+indexName,false);
    Map2.addLayer(gainCONUSLT.select(['gain_mag']),{min:-gainThresh,max:-gainThresh*3,palette:gainMagPalette},'LandTrendr Gain Mag '+indexName,false);
    Map2.addLayer(gainCONUSLT.select(['gain_dur']),{min:1,max:5,palette:durPalette,legendLabelLeftAfter:'year',legendLabelRightAfter:'years'},'LandTrendr Gain Dur '+indexName,false);

    var gainLossC = ee.ImageCollection(ee.List.sequence(startYear,endYear).getInfo().map(function(yr){
      var ltLossGainEndYear = lossGainCONUSLT.select(['loss_year','gain_year']);
      var ltLossGainDur = lossGainCONUSLT.select(['loss_dur','gain_dur']);
      var ltLossGainStartYear = ltLossGainEndYear.subtract(ltLossGainDur);
      var ltLossGain = ee.Image([yr,yr]).gte(ltLossGainStartYear).and(ee.Image([yr,yr]).lte(ltLossGainEndYear)).rename(['LandTrendr '+indexName+' Loss','LandTrendr '+indexName+' Gain']);
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
    
    
    areaChartCollections['lg-'+indexName] = {'label':'LandTrendr '+indexName+' Loss/Gain',
                                      'collection':gainLossC,
                                      'stacked':false,
                                      'steppedLine':false,
                                      'tooltip':'Summarize loss and gain for each year',
                                      'colors':chartColorsDict.advancedBeta.slice(4),
                                      'xAxisLabel':'Year'};
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

Map2.addLayer(changeObj.highestMag.loss.year,{min:startYear,max:endYear,palette:lossYearPalette},'CCDC Loss Year');
Map2.addLayer(changeObj.highestMag.loss.mag,{min:-0.5,max:-0.1,palette:lossMagPalette},'CCDC Loss Mag',false);
Map2.addLayer(changeObj.highestMag.gain.year,{min:startYear,max:endYear,palette:gainYearPalette},'CCDC Gain Year',false);
Map2.addLayer(changeObj.highestMag.gain.mag,{min:0.05,max:0.2,palette:gainMagPalette},'CCDC Gain Mag',false);

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
  Map2.addLayer(nwi_hi_rast,{layerType:'geeImage',min:1,max:7,palette:nwi_palette,classLegendDict:nwiLegendDict,queryDict:nwi_dict},'NWI');                

    Map2.addLayer([{baseURL:'https://fwsprimary.wim.usgs.gov/server/rest/services/Wetlands_Raster/ImageServer/exportImage?f=image&bbox=',minZoom:2},{baseURL:'https://fwsprimary.wim.usgs.gov/server/rest/services/Wetlands/MapServer/export?dpi=96&transparent=true&format=png8&bbox=',minZoom:11}],{layerType:'dynamicMapService',addToClassLegend: true,classLegendDict:nwiLegendDict},'NWI2',true)
esri_lc_dict = {'Water':'008',
                'Trees':'080',
                'Flooded Vegetation':'088',
                'Built Area':'D00',
              }
Map2.addLayer([{baseURL:'https://env1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer/exportImage?f=image&bbox=',minZoom:0},{baseURL:'https://env1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer/exportImage?f=image&bbox=',minZoom:11}],{layerType:'dynamicMapService',addToClassLegend: true,classLegendDict:nwiLegendDict},'ESRI LC',true)
  // Map2.addLayer([{baseURL:'https://www.fws.gov/wetlandsmapper/rest/services/Wetlands_Raster/ImageServer/exportImage?f=image&bbox=',minZoom:2},{baseURL:'https://www.fws.gov/wetlandsmapper/rest/services/Wetlands_Raster/ImageServer/exportImage?dpi=96&transparent=true&format=png32&layers=show%3A0%2C1&bbox=',minZoom:11}],{layerType:'dynamicMapService',addToClassLegend: true,classLegendDict:nwiLegendDict},'NWI',true)


// addDynamicToMap('https://fwsprimary.wim.usgs.gov/server/rest/services/Wetlands_Raster/ImageServer/exportImage?f=image&bbox=',
//                 'https://fwsprimary.wim.usgs.gov/server/rest/services/Wetlands/MapServer/export?dpi=96&transparent=true&format=png8&bbox=',
//                 8,11,
//                 'NWI',false,'National Wetlands Inventory data as viewed in https://www.fws.gov/wetlands/Data/Mapper.html from zoom levels >= 8')
var years = ee.List.sequence(1984,2019).getInfo();
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
var pdsiEndYear = 2020;
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
// forCharting  = joinCollections(forCharting,idsCollection, false);
forCharting  = joinCollections(forCharting,nlcdLC.select([0],['NLCD Landcover']), false);
// forCharting  = joinCollections(forCharting,nlcdLCMS.select([0],['NLCD LCMS Landcover']), false);
forCharting  = joinCollections(forCharting,nlcdTCC.select([0],['NLCD % Tree Canopy Cover']), false);
forCharting  = joinCollections(forCharting,nlcdImpv.select([0],['NLCD % Impervious']), false);
// forCharting  = joinCollections(forCharting,prvi_lc_collection.select([0],['PRVI Landcover']), false);
// forCharting  = joinCollections(forCharting,prvi_winds, false);
// forCharting  = joinCollections(forCharting,prUSVI_ch_2018, false);
forCharting  = joinCollections(forCharting,nwi_hi_rast, false);

// console.log(forCharting.getInfo())

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

var fmaskBitDict = {'cloud' : 32, 'shadow': 8,'snow':16};

  // LSC updated 4/15/19 to add medium and high confidence cloud masks
  // Supported fmaskClass options: 'cloud', 'shadow', 'snow', 'high_confidence_cloud', 'med_confidence_cloud'
  function cFmask(img,fmaskClass){
    var m;
    var qa = img.select('pixel_qa').int16();
    if (fmaskClass == 'high_confidence_cloud'){
      m = qa.bitwiseAnd(1 << 6).neq(0).and(qa.bitwiseAnd(1 << 7).neq(0))
    }else if (fmaskClass == 'med_confidence_cloud'){
      m = qa.bitwiseAnd(1 << 7).neq(0)
    }else{
      m = qa.bitwiseAnd(fmaskBitDict[fmaskClass]).neq(0);
    }
    return img.updateMask(m.not());
  }

  function cFmaskCloud(img){
    return cFmask(img,'cloud');
  }
  function cFmaskCloudShadow(img){
    return cFmask(img,'shadow');
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
  var hansen = ee.Image('UMD/hansen/global_forest_change_2018_v1_6').select(['lossyear']).selfMask().add(2000);
  Map2.addLayer(hansen,{min:1985,max:2018,palette:'ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02'},'Hansen Forest Loss',false);

  
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
  
   var l5 = ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
                .filterBounds(aoi)
                .filter(ee.Filter.calendarRange(startYear-yearBuffer,endYear+yearBuffer,'year'))
                .filter(ee.Filter.calendarRange(startJulian,endJulian))
                .filter(ee.Filter.lte('WRS_ROW',120))
                .select([0,1,2,3,4,5,6,'pixel_qa'],['blue','green','red','nir','swir1','temp','swir2','pixel_qa']);
   var l7SLCOn = ee.ImageCollection('LANDSAT/LE07/C01/T1_SR')
                .filterBounds(aoi)
                .filterDate(ee.Date.fromYMD(1998,1,1),ee.Date.fromYMD(2003,5,31).advance(1,'day'))
                .filter(ee.Filter.calendarRange(startYear-yearBuffer,endYear+yearBuffer,'year'))
                .filter(ee.Filter.calendarRange(startJulian,endJulian))
                .filter(ee.Filter.lte('WRS_ROW',120))
                .select([0,1,2,3,4,5,6,'pixel_qa'],['blue','green','red','nir','swir1','temp','swir2','pixel_qa']);
    var l7SLCOff = ee.ImageCollection('LANDSAT/LE07/C01/T1_SR')
                .filterBounds(aoi)
                .filterDate(ee.Date.fromYMD(2003,6,1),ee.Date.fromYMD(3000,1,1))
                .filter(ee.Filter.calendarRange(startYear-yearBuffer,endYear+yearBuffer,'year'))
                .filter(ee.Filter.calendarRange(startJulian,endJulian))
                .filter(ee.Filter.lte('WRS_ROW',120))
                .select([0,1,2,3,4,5,6,'pixel_qa'],['blue','green','red','nir','swir1','temp','swir2','pixel_qa']);
    var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
                .filterBounds(aoi)
                .filter(ee.Filter.calendarRange(startYear-yearBuffer,endYear+yearBuffer,'year'))
                .filter(ee.Filter.calendarRange(startJulian,endJulian))
                .filter(ee.Filter.lte('WRS_ROW',120))
                .select([1,2,3,4,5,7,6,'pixel_qa'],['blue','green','red','nir','swir1','temp','swir2','pixel_qa']);
    var platformObj = {'L5':l5,'L7-SLC-On':l7SLCOn,'L7-SLC-Off':l7SLCOff,'L8':l8}
    var imgs;

    Object.keys(urlParams.whichPlatforms).map(function(k){
      // console.log(k);console.log(whichPlatforms[k]);console.log(platformObj[k].getInfo())
      if(urlParams.whichPlatforms[k] || urlParams.whichPlatforms[k] === 'true'){
        if(imgs === undefined){imgs = platformObj[k];
        }else{imgs = imgs.merge(platformObj[k])
        }
      }
    })
    

    imgs = imgs.map(function(img){
      var out =img.multiply( ee.Image([0.0001,0.0001,0.0001,0.0001,0.0001,0.1,0.0001,1]));
      out  = out.copyProperties(img,['system:time_start']);
      return out;
    });
     
    Object.keys(whichCloudMasks).map(function(k){
      if(whichCloudMasks[k]){
        if(k  === 'cloudScore'){
          console.log('applying cloudScore');
          imgs = imgs.map(applyLandsatCloudScore);
        }
        else if(k  === 'fMask-Cloud'){
          console.log('applying Fmask cloud');
          imgs = imgs.map(cFmaskCloud);
        }
        else if(k  === 'fMask-Cloud-Shadow'){
          console.log('applying Fmask cloud shadow');
          imgs = imgs.map(cFmaskCloudShadow)
        }
        else if(k  === 'fMask-Snow'){
          console.log('applying Fmask snow');
         
          imgs = imgs.map(function(img){return cFmask(img,'snow')});
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
  var perims = ee.FeatureCollection('projects/gtac-mtbs/assets/perimeters/mtbs_perims_DD');//ee.FeatureCollection('projects/USFS/DAS/MTBS/mtbs_perims_DD');
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
  toggleCumulativeMode();
  // Map2.addSelectLayer(resolveEcoRegions,{strokeColor:'0F0',layerType:'geeVectorImage'},'Select Which EcoRegion',false,null,null,'Ecoregion selection');
  // Map2.addSelectLayer(huc4,{strokeColor:'00F',layerType:'geeVectorImage'},'Select Which HUC 4',false,null,null,'HUC 4 selection');

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
function runFHP(){
  var studyAreaName = 'USFS LCMS 1984-2020'
  ga('send', 'event', 'lcms-gtac-fhp-viewer-run', 'year_range', `${idsMinYear}_${idsMaxYear}`);
  getLCMSVariables();
  var lcms  = ee.ImageCollection(studyAreaDict['Science Team CONUS'].lcmsCollection).map(function(img){return img.translate(15,-15)});
  var lcmsCONUS = ee.ImageCollection(studyAreaDict[studyAreaName].conusChangeFinal);
  var lcmsSEAK = ee.ImageCollection(studyAreaDict[studyAreaName].akChangeFinal);

  var akChange = ee.ImageCollection(studyAreaDict[studyAreaName].akChange)
  var conusChange = ee.ImageCollection(studyAreaDict[studyAreaName].conusChange)//.filter(ee.Filter.calendarRange(startYear,endYear,'year'));;
  var conusSA = ee.FeatureCollection(studyAreaDict[studyAreaName].conusSA);
  var akSA = ee.FeatureCollection(studyAreaDict[studyAreaName].akSA);
  
  var lossYearPalette = 'ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02';

  var years  = ee.List.sequence(idsMinYear,idsMaxYear);
  // var years  = ee.List.sequence(2010,2013);
  // var idsFolder = 'projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/IDS';
  var idsFolder = 'projects/lcms-292214/assets/CONUS-Ancillary-Data/IDS';
  var ids = ee.data.getList({id:idsFolder}).map(function(t){return t.id});
 
  ids = ids.map(function(id){
    var idsT = ee.FeatureCollection(id);
    return idsT;
  });
  ids = ee.FeatureCollection(ids).flatten();
  Map2.addLayer(ids,{strokeColor:'0DD',strokeWeight:1,layerType:'geeVectorImage'},'IDS Polygons',true,null,null,'IDS Polygons');
  ids = ids.map(function(f){return f.set('constant',1)})
  var idsLCMS = ee.ImageCollection(years.map(function(yr){
    yr = ee.Number(yr).int16();
    var idsT = ids.filter(ee.Filter.eq('SURVEY_YEA',yr));
    idsT = ee.Image().paint(idsT,null,1).visualize({min:1,max:1,palette:'0FF'});
    // console.log(yr);
    // console.log(idsT.limit(100).size().getInfo())
    var lcmsT = lcms.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic().gte(30);
    var lcmsCONUST = ee.Image(lcmsCONUS.filter(ee.Filter.calendarRange(yr,yr,'year')).first());
    var lcmsSEAKT = ee.Image(lcmsSEAK.filter(ee.Filter.calendarRange(yr,yr,'year')).first());
    var lcmsT = ee.ImageCollection([lcmsCONUST,lcmsSEAKT]).mosaic()
    lcmsT = lcmsT.updateMask(lcmsT.gte(2).and(lcmsT.lte(4)))
    lcmsT = lcmsT.visualize({min:2,max:4,palette:changePalette});//,addToClassLegend: true,classLegendDict:{'Slow Loss':changePalette[0],'Fast Loss':changePalette[1],'Gain':changePalette[2]}})
    // var yrImg = ee.Image(yr).mask(lcmsT).visualize({min:idsMinYear,max:idsMaxYear,palette:lossYearPalette}).unmask(-32768);
    
    var out = lcmsT.unmask(-32768);
    out = out.where(idsT.mask(),idsT);
    out = out.mask(out.neq(-32768))
    // out = out.visualize({min:1,max:2,palette:'FF0,0FF'})
    return out.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis()).byte()
  }));
  var lcmsChangeClasses = ee.ImageCollection(years.map(function(yr){
    var lcmsCONUST = ee.Image(lcmsCONUS.filter(ee.Filter.calendarRange(yr,yr,'year')).first());
    var lcmsSEAKT = ee.Image(lcmsSEAK.filter(ee.Filter.calendarRange(yr,yr,'year')).first());
    var lcmsT = ee.ImageCollection([lcmsCONUST,lcmsSEAKT]).mosaic()
    lcmsT = lcmsT.updateMask(lcmsT.gte(2).and(lcmsT.lte(4)))
    return lcmsT.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis()).byte()
  }))
  var idsLCMSTS = ee.ImageCollection(years.map(function(yr){
    var idsT = ids.filter(ee.Filter.eq('SURVEY_YEA',yr));
    // console.log(yr);
    // console.log(idsT.limit(100).size().getInfo())
    // var lcmsT = lcms.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic().divide(100).unmask(0);
    var akCombined = combineChange(akChange,yr,studyAreaDict[studyAreaName].akGainThresh,studyAreaDict[studyAreaName].akSlowLossThresh,studyAreaDict[studyAreaName].akFastLossThresh,'stack',0.01).clip(akSA.geometry().bounds());

    var conusCombined = combineChange(conusChange,yr,studyAreaDict[studyAreaName].conusGainThresh,studyAreaDict[studyAreaName].conusSlowLossThresh,studyAreaDict[studyAreaName].conusFastLossThresh,'collection',0.01).clip(conusSA.geometry().bounds());

    var lcmsT = ee.ImageCollection.fromImages(ee.List([conusCombined,akCombined])).mosaic().select(['.*_Prob']).unmask(0);
    idsT = idsT.reduceToImage(['constant'],ee.Reducer.first());
    var out = lcmsT.addBands(idsT).rename(['LCMS Slow Loss Probability','LCMS Fast Loss Probability','LCMS Gain Probability','IDS Polygon']);
 
    // out = out.visualize({min:1,max:2,palette:'FF0,0FF'})
    return out.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis()).float()
  }));
  
var lcmsChangeClassesForArea = formatAreaChartCollection(lcmsChangeClasses,[2,3,4],['Slow Loss','Fast Loss','Gain']);
  var idsLCMSTSForArea = ee.ImageCollection(years.map(function(yr){
    var idsT = ids.filter(ee.Filter.eq('SURVEY_YEA',yr));
    // console.log(yr);
    // console.log(idsT.limit(100).size().getInfo())
    var lcmsT = ee.Image(lcmsChangeClassesForArea.filter(ee.Filter.calendarRange(yr,yr,'year')).first());
    idsT = idsT.reduceToImage(['constant'],ee.Reducer.first()).unmask(0);
    var out = lcmsT.addBands(idsT).rename(['LCMS Slow Loss','LCMS Fast Loss','LCMS Gain','IDS Polygon']);
 
    // out = out.visualize({min:1,max:2,palette:'FF0,0FF'})
    return out.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis()).float()
  }));

  // Map2.addLayer(idsLCMSTS)
  var classLegendDict = {};
  // var lossYearPaletteStart = lossYearPalette.split(',')[0];
  // var lossYearPaletteEnd = lossYearPalette.split(',')[lossYearPalette.split(',').length-1];
  // classLegendDict['LCMS Loss '+idsMinYear.toString()] = lossYearPaletteStart;
  // classLegendDict['LCMS Loss '+idsMaxYear.toString()] = lossYearPaletteEnd;
  classLegendDict['Slow Loss']= changePalette[0]
  classLegendDict['Fast Loss']= changePalette[1]
  classLegendDict['Gain']= changePalette[2]
  classLegendDict['IDS Polygons'] = '0FF';

  Map2.addTimeLapse(idsLCMS,{years:years.getInfo(),addToClassLegend:true,classLegendDict:classLegendDict},'LCMS Change and IDS Time Lapse');
  
  Map2.addSelectLayer(ids,{strokeColor:'D0D',layerType:'geeVectorImage'},'IDS Polygons',false,null,null,'IDS Select Polygons. Turn on layer and click on any area wanted to include in chart');
  getSelectLayers();
  pixelChartCollections['test'] = {'label':'LCMS and IDS Time Series','collection':idsLCMSTS,'chartColors':['f39268','d54309','00a398','0FF']};

  areaChartCollections['test'] = {'label':'LCMS and IDS Time Series',
                                  'collection':idsLCMSTSForArea,
                                  'stacked':false,
                                  'steppedLine':false,
                                  'tooltip':'Summarize loss IDS each year',
                                  'colors':['f39268','d54309','00a398','0FF'],
                                  'xAxisLabel':'Year'};
   populatePixelChartDropdown();populateAreaChartDropdown();
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
  coords = coords.updateMask(coords.lte(maxDistance*1000))
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
    Map2.addLayer(modImage,{min:to.min(),max:to.max()},'MOD Image',false)
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
    Map2.addLayer(trackRows,{},name + ' ' +year.toString()+' Storm Track',false);
    Map2.addLayer(max.select([0]),{min:30,max:160,legendLabelLeftAfter:'mph',legendLabelRightAfter:'mph',palette:palettes.niccoli.isol[7]},name+' ' +year.toString()+' Wind Max',false);
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
    Map2.addLayer(damageSum,{min:50,max:500,palette:palettes.niccoli.isol[7]},name +' ' +year.toString()+' Damage Sum',false)
    
    var windSum = c.select(['Wind_Sum']).sum().int16();
    Map2.addLayer(windSum,{min:50,max:500,palette:palettes.niccoli.isol[7]},name +' ' +year.toString()+' Wind Sum',false)
    
    var catSum = c.select(['Cat_Sum']).sum().int16();
    Map2.addLayer(catSum,{min:0,max:10,palette:palettes.niccoli.isol[7]},name +' ' +year.toString()+' Cat Sum',false)
    
    var cat1Sum = c.select(['Cat1_Sum']).sum().int16();
    Map2.addLayer(cat1Sum,{min:0,max:10,palette:palettes.niccoli.isol[7]},name +' ' +year.toString()+' Cat 1 Sum',false)
    
    var cat2Sum = c.select(['Cat2_Sum']).sum().int16();
    Map2.addLayer(cat2Sum,{min:0,max:10,palette:palettes.niccoli.isol[7]},name +' ' +year.toString()+' Cat 2 Sum',false)
    
    var cat3Sum = c.select(['Cat3_Sum']).sum().int16();
    Map2.addLayer(cat3Sum,{min:0,max:10,palette:palettes.niccoli.isol[7]},name +' ' +year.toString()+' Cat 3 Sum',false)
    
    var cat4Sum = c.select(['Cat4_Sum']).sum().int16();
    Map2.addLayer(cat4Sum,{min:0,max:10,palette:palettes.niccoli.isol[7]},name +' ' +year.toString()+' Cat 4 Sum',false)
    
    var cat5Sum = c.select(['Cat5_Sum']).sum().int16();
    Map2.addLayer(cat5Sum,{min:0,max:10,palette:palettes.niccoli.isol[7]},name +' ' +year.toString()+' Cat 5 Sum',false)
    
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
  console.log('here')
 
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
  
