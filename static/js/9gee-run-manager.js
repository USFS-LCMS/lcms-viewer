
//----------------------------------------------------------------------------------------------------------------
//                                 Parameters, Definitions, Palettes
//---------------------------------------------------------------------------------------------------------------
var run;

var warningShown = false;

//------------Main Function to Run National Forest Products------------------------------------------------
function runUSFS(){
    queryClassDict = {};
    

    getLCMSVariables();
    setupDownloads(studyAreaName);

  
    

    // Paths / definitions
    var ts = ee.ImageCollection(collectionDict[studyAreaName][5]);
    var boundary = ee.FeatureCollection(collectionDict[studyAreaName][6]);
    var clientBoundary = boundary.geometry().bounds().getInfo();
    var landtrendr_format = collectionDict[studyAreaName][7];

    // Initial load & format of LCMS Layers
    var rawC = ee.ImageCollection(collectionDict[studyAreaName][1]);
 

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
                  .map(function(img){return ee.Image(additionBands(img,[0,1,0,0,0,0])).clip(boundary)})
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

    var NFSLCMSForCharting = NFSLCMS;
    var minTreeNumber = 3;
    if(applyTreeMask === 'yes'){
      console.log('Applying tree mask');
      // var waterMask = rawLC.map(function(img){return img.eq(6)}).sum().gt(10);
      // waterMask = waterMask.mask(waterMask).clip(boundary);
      
      if((endYear-startYear) < minTreeNumber){minTreeNumber = endYear-startYear+1}
       if (studyAreaName == 'CNFKP'){
            var treeMask = rawLC.map(function(img){return img.eq(lcJSONFlipped.Trees).or(img.eq(lcJSONFlipped['Tall Shrub']))}).sum().gte(minTreeNumber);
          }else{
            var treeMask = rawLC.map(function(img){return img.eq(lcJSONFlipped.Trees)}).sum().gte(minTreeNumber);
          }
      //var treeMask = rawLC.map(function(img){return img.eq(lcJSONFlipped.Trees)}).sum().gte(minTreeNumber);
      treeMask = treeMask.mask(treeMask).clip(boundary);
      
      NFSLCMS = NFSLCMS.map(function(img){return img.updateMask(ee.Image([1,1]).addBands(treeMask).addBands(treeMask).addBands(treeMask).addBands(treeMask))});

    }
    
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

    var dndSlowThresh = thresholdChange(NFSDNDSlow,lowerThresholdDecline,upperThresholdDecline, 1);
    var dndFastThresh = thresholdChange(NFSDNDFast,lowerThresholdDecline,upperThresholdDecline, 1);

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
      Map2.addLayer(gnpHUC,{strokeColor:'#0088FF',addToLegend:false},'GNP HUC 12',false,null,null,null,'reference-layer-list')

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
      var kenaiVegTypeBoundary =kenaiVegType.geometry().bounds(1000).getInfo();
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
      var CRvegTypeBoundary =CRvegType.geometry().bounds(1000).getInfo();
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
    
    getMTBSandIDS(studyAreaName);
    var studyAreas = collectionDict[studyAreaName][4];
    studyAreas.map(function(studyArea){
      Map2.addLayer(studyArea[1],null,studyArea[0],false,null,null,studyArea[2],'reference-layer-list')
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
    var composites = ee.ImageCollection(collectionDict[studyAreaName][0])
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
    
    if(analysisMode === 'advanced'){
      var lastYearAdded = false;
      ee.List.sequence(startYear,endYear,10).getInfo().map(function(yr){
        var c = ee.Image(composites.filter(ee.Filter.calendarRange(yr,yr,'year')).first());
        Map2.addLayer(c.set('bounds',clientBoundary),{min:0.05,max:0.4,bands:'swir1,nir,red'},'Landsat Composite '+yr.toString(),false)
        if(yr === endYear){lastYearAdded = true}
      })

      if(lastYearAdded === false){
        // var c1 = ee.Image(composites.first());
        var c2 = ee.Image(composites.sort('system:time_start',false).first());
        // Map2.addLayer(c1,{min:0.05,max:0.4,bands:'swir1,nir,red'},'Landsat Composite '+startYear.toString(),false)
        Map2.addLayer(c2.set('bounds',clientBoundary),{min:0.05,max:0.4,bands:'swir1,nir,red'},'Landsat Composite '+endYear.toString(),false)
      }
    }

    //------LANDTRENDR-------- 
    print(landtrendr_format)
    if (landtrendr_format == 'landtrendr_vertex_format'){
      var LTstackCollection = ee.ImageCollection(collectionDict[studyAreaName][2]).filter(ee.Filter.eq('band',whichIndex))
      var landtrendr = convertStack_To_DurFitMagSlope(LTstackCollection, 'LT');
      var fittedAsset = landtrendr.map(function(img){return LT_VT_multBands(img, 0.0001)})
                              .select([whichIndex+'_LT_fitted'],['LANDTRENDR Fitted '+ whichIndex]);
      // var fittedAsset = ee.ImageCollection(collectionDict[studyAreaName][2])
      //     .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
      //     .map(function(img){return multBands(img,1,0.0001)})
      //     .select(['LT_Fitted_'+whichIndex]);
    } else {      
      var fittedAsset = ee.ImageCollection(collectionDict[studyAreaName][2])
          .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
          .map(function(img){return multBands(img,1,0.0001)})
          .select(['LT_Fitted_'+whichIndex],['LANDTRENDR Fitted '+ whichIndex]);
    }

    //----------Other Housekeeping & Prep for adding layers
    var declineNameEnding = '('+startYear.toString() + '-' + endYear.toString()+') (p >= '+lowerThresholdDecline.toString()+' and p <= '+upperThresholdDecline.toString()+')';
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
    if(analysisMode === 'advanced'){
      if (studyAreaName == 'CNFKP'){
        Map2.addLayer(maskCount.set('bounds',clientBoundary),{'min':1,'max':33,'palette':'0C2780,E2F400,BD1600'}, 'Number of Missing Data Years',false)
        //Map2.addLayer(missingYears,{'opacity': 0}, 'Number of Missing Data Years',false)
    }
      Map2.addLayer(NFSLC.mode().multiply(10),{queryDict:landcoverClassQueryDict,'palette':lcPalette,'min':lcValues[0],'max':lcValues[lcValues.length-1],addToClassLegend: true,classLegendDict:landcoverClassLegendDict}, lcLayerName,false); 
      Map2.addLayer(NFSLU.mode().multiply(10),{queryDict:landuseClassQueryDict,'palette':luPalette,'min':1,'max':6,addToClassLegend: true,classLegendDict:landuseClassLegendDict}, luLayerName,false); 
      if(applyTreeMask === 'yes'){
        // Map2.addLayer(waterMask,{min:1,max:1,palette:'2a74b8'},'Water Mask',false);
        var treeClassLegendDict = {};
        treeClassLegendDict['Tree ('+minTreeNumber+' or more years)'] = '32681e';

        Map2.addLayer(treeMask.set('bounds',clientBoundary),{min:1,max:1,palette:'32681e',addToClassLegend: true,classLegendDict:treeClassLegendDict},'Tree Mask',false,null,null,'Mask of areas LCMS classified as tree cover for '+minTreeNumber.toString()+' or more years');
     
      }
    }
    

     
    // Map2.addLayer(dndThreshMostRecent.select([1]),{'min':startYear,'max':endYear,'palette':'FF0,F00'},studyAreaName +' Decline Year',true,null,null,'Year of most recent decline ' +declineNameEnding);
    // Map2.addLayer(dndThreshMostRecent.select([0]),{'min':lowerThresholdDecline,'max':upperThresholdDecline,'palette':'FF0,F00'},studyAreaName +' Decline Probability',false,null,null,'Most recent decline ' + declineNameEnding);

    Map2.addLayer(dndThreshOut.select([1]).set('bounds',clientBoundary),{'min':startYear,'max':endYear,'palette':declineYearPalette},'Loss Year',true,null,null,threshYearNameEnd+'loss ' +declineNameEnding);
    // if (studyAreaName == 'CNFKP' && analysisMode == 'advanced'){
    //   Map2.addLayer(dndThreshOutUnMasked.select([1]).set('bounds',clientBoundary),{'min':startYear,'max':endYear,'palette':declineYearPalette},'Loss Year Unmasked',false,null,null,threshYearNameEnd+'loss ' +declineNameEnding);
    // }
    // Map2.addLayer(dndThreshOutOld.select([1]),{'min':startYear,'max':endYear,'palette':declineYearPalette },studyAreaName +' Decline Old Year',true,null,null,threshYearNameEnd+'decline ' +declineNameEnding);
    // Map2.addLayer(dndThreshOutOld.select([0]),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},studyAreaName +' Decline Old Probability',false,null,null,threshProbNameEnd+ 'decline ' + declineNameEnding);

    if(analysisMode === 'advanced'){
      Map2.addLayer(dndThreshOut.select([0]).set('bounds',clientBoundary),{'min':lowerThresholdDecline,'max':upperThresholdDecline ,'palette':declineProbPalette},'Loss Probability',false,null,null,threshProbNameEnd+ 'loss ' + declineNameEnding);
      Map2.addLayer(dndCount.set('bounds',clientBoundary),{'min':1,'max':5,'palette':declineDurPalette},'Loss Duration',false,'years',null,'Total duration of loss '+declineNameEnding);
    }

    Map2.addLayer(rnrThreshOut.select([1]).set('bounds',clientBoundary),{'min':startYear,'max':endYear,'palette':recoveryYearPalette},'Gain Year',false,null,null,threshYearNameEnd+'gain '+recoveryNameEnding);
    if(analysisMode === 'advanced'){
      Map2.addLayer(rnrThreshOut.select([0]).set('bounds',clientBoundary),{'min':lowerThresholdRecovery,'max':upperThresholdRecovery,'palette':recoveryProbPalette},'Gain Probability',false,null,null,threshProbNameEnd+'gain '+recoveryNameEnding);
      Map2.addLayer(rnrCount.set('bounds',clientBoundary),{'min':1,'max':5,'palette':recoveryDurPalette},'Gain Duration',false,'years',null,'Total duration of gain '+recoveryNameEnding);
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

      Map2.addLayer(dndSlowThreshOut.select([1]).set('bounds',clientBoundary),{'min':startYear,'max':endYear,'palette':declineYearPalette },'Slow Loss Year',false,null,null,threshYearNameEnd+'loss ' +declineNameEnding);
      Map2.addLayer(dndSlowThreshOut.select([0]).set('bounds',clientBoundary),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},'Slow Loss Probability',false,null,null,threshProbNameEnd+ 'loss ' + declineNameEnding);
      Map2.addLayer(dndSlowCount.set('bounds',clientBoundary),{'min':1,'max':5,'palette':declineDurPalette},'Slow Loss Duration',false,'years',null,'Total duration of loss '+declineNameEnding);

      Map2.addLayer(dndFastThreshOut.select([1]).set('bounds',clientBoundary),{'min':startYear,'max':endYear,'palette':declineYearPalette },'Fast Loss Year',false,null,null,threshYearNameEnd+'loss ' +declineNameEnding);
      Map2.addLayer(dndFastThreshOut.select([0]).set('bounds',clientBoundary),{'min':lowerThresholdDecline,'max':0.8,'palette':declineProbPalette},'Fast Loss Probability',false,null,null,threshProbNameEnd+ 'loss ' + declineNameEnding);
      Map2.addLayer(dndFastCount.set('bounds',clientBoundary),{'min':1,'max':5,'palette':declineDurPalette},'Fast Loss Duration',false,'years',null,'Total duration of loss '+declineNameEnding);

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

      Map2.addLayer(canyonsProjectArea,{'strokeColor':'#AA0'},'Canyons Project Area',false,null,null,'','reference-layer-list');
      Map2.addLayer(johnsonCreekProjectArea,{'strokeColor':'#AA0'},'Johnson Creek Project Area',false,null,null,'','reference-layer-list');
      Map2.addLayer(sageGrouseHomeRanges,{'strokeColor':'#ff6700'},'Sage Grouse Home Ranges',false,null,null,'','reference-layer-list');
      Map2.addLayer(sageGrouseSeasonalHabitat,{'strokeColor':'#ff6700'},'Sage Grouse Seasonal Habitat',false,null,null,'','reference-layer-list');

      var huc6 = ee.FeatureCollection("USGS/WBD/2017/HUC06").filterBounds(mls_study_area);
      var huc10 = ee.FeatureCollection("USGS/WBD/2017/HUC10").filterBounds(mls_study_area);

      Map2.addLayer(huc6,{'strokeColor':'#0000ff'},'HUC06 Boundaries',false,null,null,'USGS Watershed Boundary Dataset of Basins','reference-layer-list');
      Map2.addLayer(huc10,{'strokeColor':'#0000ff'},'HUC10 Boundaries',false,null,null,'USGS Watershed Boundary Dataset of Watersheds','reference-layer-list');

      var grazingAllotments = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/MLS_Allotments');
      var pastures = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/MLS/Ancillary/MLS_Pastures');

      Map2.addLayer(grazingAllotments,{},'Allotment Boundaries',false,null,null,'','reference-layer-list'); //'RMU Dataset - area boundaries of livestock grazing allotments' 'min':1,'max':1,'palette':'#ff0000'
      Map2.addLayer(pastures,{'strokeColor':'#ffbf00'},'Pasture Boundaries',false,null,null,'RMU Dataset - area boundaries of pastures within livestock grazing allotments','reference-layer-list');
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
    //Set up charting
    var forCharting = joinCollections(composites.select([whichIndex],['Raw ' + whichIndex]),fittedAsset, false);
    

    if(analysisMode !== 'advanced' ){
      NFSLCMS =  NFSLCMS.select(['Loss Probability','Gain Probability']);
      NFSLCMSForCharting = NFSLCMSForCharting.select(['Loss Probability','Gain Probability']);
      chartColors = chartColorsDict.standard;

    }
    // else if(analysisMode !== 'advanced' && viewBeta === 'yes'){
    //   NFSLCMS =  NFSLCMS.select(['Loss Probability','Gain Probability','Slow Loss Probability','Fast Loss Probability']);
    //   NFSLCMSForCharting = NFSLCMSForCharting.select(['Loss Probability','Gain Probability','Slow Loss Probability','Fast Loss Probability']);
    //   chartColors = chartColorsDict.beta;
    // }
    else if(analysisMode == 'advanced' && viewBeta === 'no'){
      NFSLCMS =  NFSLCMS.select(['Land Cover Class','Land Use Class','Loss Probability','Gain Probability']);
      NFSLCMSForCharting = NFSLCMSForCharting.select(['Land Cover Class','Land Use Class','Loss Probability','Gain Probability']);
      chartColors = chartColorsDict.advanced;
    }
    else{
      NFSLCMS =  NFSLCMS.select(['Land Cover Class','Land Use Class','Loss Probability','Gain Probability','Slow Loss Probability','Fast Loss Probability']);
      NFSLCMSForCharting = NFSLCMSForCharting.select(['Land Cover Class','Land Use Class','Loss Probability','Gain Probability','Slow Loss Probability','Fast Loss Probability']);
      chartColors = chartColorsDict.advancedBeta;
    }

    var steppedLineLC = false;
    if(studyAreaName === 'CNFKP'){steppedLineLC = 'before';}
    
    var lcStack =formatAreaChartCollection(rawLC,lcValues,Object.keys(landcoverClassChartDict))
    var luStack =formatAreaChartCollection(rawLU,luValues,Object.keys(landuseClassChartDict))
    

    forCharting = joinCollections(forCharting,NFSLCMSForCharting, false);
    chartCollection =forCharting;

    var landcoverClassQueryDictDecimal = {};
    Object.keys(landcoverClassQueryDict).map(function(k){landcoverClassQueryDictDecimal[k/10]= landcoverClassQueryDict[k]});
    var landuseClassQueryDictDecimal = {};
    Object.keys(landuseClassQueryDict).map(function(k){landuseClassQueryDictDecimal[k/10]= landuseClassQueryDict[k]});
    var chartTableDict = {
    'Land Cover Class':landcoverClassQueryDictDecimal,
    'Land Use Class':landuseClassQueryDictDecimal
    

  }

  chartCollection = chartCollection.set('chartTableDict',chartTableDict)
    if(analysisMode === 'advanced'){
     chartCollection = chartCollection.set('legends',{'Land Cover Class': JSON.stringify(landcoverClassChartDict),'Land Use Class:':JSON.stringify(landuseClassChartDict)}) 
    }


    var lossGainAreaCharting = joinCollections(dndThresh,rnrThresh,false).select(['.*_change_year']);
    

    if(analysisMode === 'advanced' && viewBeta === 'yes'){
      lossGainAreaCharting = joinCollections(lossGainAreaCharting,dndSlowThresh,false).select(['.*_change_year']);
      lossGainAreaCharting = joinCollections(lossGainAreaCharting,dndFastThresh,false).select(['.*_change_year']);
      lossGainAreaCharting = lossGainAreaCharting.select([0,1,2,3],['Loss','Gain','Slow Loss','Fast Loss'])
    }else{lossGainAreaCharting = lossGainAreaCharting.select([0,1],['Loss','Gain'])};

    var lossGainAreaChartingGeo = lossGainAreaCharting.geometry();
    lossGainAreaCharting =lossGainAreaCharting.map(function(img){
      return img.mask().clip(lossGainAreaChartingGeo)
    });
    
    
    
    // areaChartCollection = forAreaCharting;
    // stackedAreaChart = false;
    // areaChartCollections = {};
    // var lColors = declineYearPalette.split(',');
    // var gColors = recoveryYearPalette.split(',');
    // var lColor = lColors[lColors.length-1];
    // var gColor = gColors[gColors.length-1];
    // var slColor = '808';//lColors[2];
    // var flColor = 'f58231';//lColors[5];
    areaChartCollections['lg'] = {'label':'LCMS Loss/Gain',
                                  'collection':lossGainAreaCharting,
                                  'stacked':false,
                                  'steppedLine':false,
                                  'colors':chartColorsDict.advancedBeta.slice(4)};
    if(analysisMode === 'advanced'){
      areaChartCollections['lc'] = {'label':'LCMS Landcover',
                                  'collection':lcStack,
                                  'stacked':true,
                                  'steppedLine':steppedLineLC,
                                  'colors':Object.values(landcoverClassLegendDict)};
      areaChartCollections['lu'] = {'label':'LCMS Landuse',
                                  'collection':luStack,
                                  'stacked':true,
                                  'steppedLine':steppedLineLC,
                                  'colors':Object.values(landuseClassLegendDict)};
    }
    
    
    
    populateAreaChartDropdown();
    // if(endYear === 2018 && warningShown === false){warningShown = true;showTip('<i class="text-dark fa fa-exclamation-triangle"></i> CAUTION','Including decline detected the last year of the time series (2018) can lead to high commission error rates.  Use with caution!')}

}; // End runUSFS()


//------------------------------Main Function to Run CONUS Product----------------------------------------------------------

function runCONUS(){

  getLCMSVariables();
  queryClassDict = {};
  setupDownloads(studyAreaName);
  //Bring in reference data
  getHansen();
  getMTBSandIDS(studyAreaName);



  
   var lossProb = ee.ImageCollection('projects/USFS/LCMS-NFS/CONUS-LCMS/vCONUS-2019-1').map(function(img){return img.unmask()})
      .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
      .map(function(img){return img.rename(['Loss Probability'])})
      .map(function(img){return ee.Image(multBands(img,1,[0.01])).float()});
    
   
    var clientBoundary = lossProb.geometry().bounds(1000).getInfo();


    if(applyTreeMask === 'yes'){
      console.log('Applying tree mask');
      var treeMask = ee.Image('users/yang/CONUS_NLCD2016/CONUS_LCMS_ForestMask');
      var forestMaskQueryDict = {1:'Tree',3:'Woody Wetland',2:'Shrub',0:'Other'};
      Map2.addLayer(treeMask.set('bounds',clientBoundary),{min:0,max:3,palette:'a1a1a1,32681e,ffb88c,97ffff',addToClassLegend:true,classLegendDict:{'Tree':'32681e','Woody Wetland':'97ffff','Shrub':'ffb88c','Other':'a1a1a1'},queryDict:forestMaskQueryDict},'Landcover Mask Classes',false,null,null,'Landcover classes of 3 or more years. Any pixel that was tree 3 or more years is tree. Remaining pixels, any pixel that was woody wetland 3 or more years is woody wetland. Remaining pixels, any pixel that was shrub 3 or more years is shrub.  Remaining pixels are other. Both tree and woodywetland classes are included in the tree mask.');
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
    
     

  }

  

  var declineNameEnding = '('+startYear.toString() + '-' + endYear.toString()+') (p >= '+lowerThresholdDecline.toString()+' and p <= '+upperThresholdDecline.toString()+')';

  Map2.addLayer(dndThreshOut.select([1]).set('bounds',clientBoundary),{'min':startYear,'max':endYear,'palette':declineYearPalette},'Loss Year',true,null,null,threshYearNameEnd+'loss ' +declineNameEnding);
  // Map2.addLayer(dndThreshOutOld.select([1]),{'min':startYear,'max':endYear,'palette':declineYearPalette },studyAreaName +' Decline Old Year',true,null,null,threshYearNameEnd+'decline ' +declineNameEnding);



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
  chartCollection =lossProb;
  var forAreaCharting = dndThresh.select(["Loss Probability_change_year"]);
  var forAreaChartingGeo = forAreaCharting.geometry();
  forAreaCharting = forAreaCharting.map(function(img){return img.mask().clip(forAreaChartingGeo)}).select([0],['Loss'])

  // areaChartCollections = {};
  areaChartCollections['lg'] = {'label':'LCMS Loss',
                                'stacked':false,
                                'steppedLine':false,
                                'collection':forAreaCharting,
                                'colors':['F00']};
  
  populateAreaChartDropdown();

  // if(endYear === 2018 && warningShown === false){warningShown = true;showTip('<i class="text-dark fa fa-exclamation-triangle"></i> CAUTION','Including decline detected the last year of the time series (2018) can lead to high commission error rates.  Use with caution!')}

} // end runCONUS()
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
    

    print(ts.getInfo());
}
function runSimple(){
  getLCMSVariables();
  Map2.addLayer(standardTileURLFunction('http://server.arcgisonline.com/arcgis/rest/services/Specialty/Soil_Survey_Map/MapServer/tile/'),{layerType:'tileMapService'},'SSURGO Soils',false)
  
  var nlcd = ee.ImageCollection('USGS/NLCD');


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
getMTBSandIDS('anc','layer-list');  
var nwiLegendDict= {'Freshwater- Forested and Shrub wetland':'008836',
                    'Freshwater Emergent wetland':'7fc31c',
                    'Freshwater pond': '688cc0',
                    'Estuarine and Marine wetland':'66c2a5',
                    'Riverine':'0190bf',
                    'Lakes': '13007c',
                    'Estuarine and Marine Deepwater': '007c88',
                    'Other Freshwater wetland':'b28653'
                  }
    Map2.addLayer([{baseURL:'https://fwspublicservices.wim.usgs.gov/server/rest/services/Wetlands_Raster/ImageServer/exportImage?f=image&bbox=',minZoom:2},
                   {baseURL:'https://fwspublicservices.wim.usgs.gov/server/rest/services/Wetlands/MapServer/export?dpi=96&transparent=true&format=png32&layers=show%3A0%2C1&bbox=',minZoom:11}],{layerType:'dynamicMapService',addToClassLegend: true,classLegendDict:nwiLegendDict},'NWI',true)
// addDynamicToMap('https://fwsprimary.wim.usgs.gov/server/rest/services/Wetlands_Raster/ImageServer/exportImage?f=image&bbox=',
//                 'https://fwsprimary.wim.usgs.gov/server/rest/services/Wetlands/MapServer/export?dpi=96&transparent=true&format=png8&bbox=',
//                 8,11,
//                 'NWI',false,'National Wetlands Inventory data as viewed in https://www.fws.gov/wetlands/Data/Mapper.html from zoom levels >= 8')
var years = ee.List.sequence(1984,2019).getInfo();
var dummyNLCDImage = ee.Image(nlcdLC.first());
var cdl = ee.ImageCollection('USDA/NASS/CDL').select([0],['cdl']);


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
var pdsiEndYear = 2019;
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
var idsCollection = getIDSCollection().select([0,1,2,3]);
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
nlcdLCMS = batchFillCollection(nlcdLCMS,years)
mtbs = batchFillCollection(mtbs,years).map(setSameDate);
cdl = batchFillCollection(cdl,years).map(setSameDate);
nlcdTCC = batchFillCollection(nlcdTCC,years).map(setSameDate);
nlcdImpv = batchFillCollection(nlcdImpv,years).map(setSameDate);

var forCharting = joinCollections(mtbs.select([0],['MTBS Burn Severity']), cdl.select([0],['Cropland Data']),false);
forCharting  = joinCollections(forCharting,annualPDSI.select([0],['PDSI']), false);
forCharting  = joinCollections(forCharting,idsCollection, false);
forCharting  = joinCollections(forCharting,nlcdLC.select([0],['NLCD Landcover']), false);
forCharting  = joinCollections(forCharting,nlcdLCMS.select([0],['NLCD LCMS Landcover']), false);
forCharting  = joinCollections(forCharting,nlcdTCC.select([0],['NLCD % Tree Canopy Cover']), false);
forCharting  = joinCollections(forCharting,nlcdImpv.select([0],['NLCD % Impervious']), false);



// console.log(forCharting.getInfo())

var chartTableDict = {
  'IDS Mort Type':damage_codes,
  'IDS Mort DCA':dca_codes,
  'IDS Defol Type':damage_codes,
  'IDS Defol DCA':dca_codes,
  'MTBS Burn Severity':mtbsQueryClassDict,
  'NLCD Landcover':nlcdLCQueryDict,
  'NLCD LCMS Landcover':nlcdLCQueryDict,
  'Cropland Data':cdlQueryDict,
  'PDSI':pdsiDict
}

forCharting = forCharting.set('chartTableDict',chartTableDict)
chartColors = chartColorsDict.ancillary;
chartCollection = forCharting;
// addChartJS(d,'test1');
}


function runLT(){
  // var startYear = 1984;
  // var endYear   = 2019;
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
    var joinedTS = joinCollections(rawTs,fittedCollection);
    
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
  chartCollection= joinedTS.select(['.*'+indexName]);
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
    var gainYearPalette = 'AFDEA8,80C476,308023,145B09';

    var lossMagPalette = 'D00,F5DEB3';
    var gainMagPalette = 'F5DEB3,006400';

    var changeDurationPalette = 'BD1600,E2F400,0C2780';
    
    //Set up viz params
    var vizParamsLossYear = {'min':startYear,'max':endYear,'palette':lossYearPalette};
    var vizParamsLossMag = {'min':-0.8*10000 ,'max':lossMagThresh*10000,'palette':lossMagPalette};
    
    var vizParamsGainYear = {'min':startYear,'max':endYear,'palette':gainYearPalette};
    var vizParamsGainMag = {'min':gainMagThresh*10000,'max':0.8*10000,'palette':gainMagPalette};
    
    var vizParamsDuration = {'min':1,'max':5,'palette':changeDurationPalette};
  
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
      Map2.addLayer(lossStackI.select(['loss_mag.*']),vizParamsLossMag,indexName +' '+iName+ ' '+LTSortBy+' Loss Magnitude',false);
      Map2.addLayer(lossStackI.select(['loss_dur.*']),vizParamsDuration,indexName +' '+iName+ ' '+LTSortBy+' Loss Duration',false);
      
      Map2.addLayer(gainStackI.select(['gain_yr.*']),vizParamsGainYear,indexName +' '+iName+ ' '+LTSortBy+' Gain Year',false);
      Map2.addLayer(gainStackI.select(['gain_mag.*']),vizParamsGainMag,indexName +' '+iName+ ' '+LTSortBy+' Gain Magnitude',false);
      Map2.addLayer(gainStackI.select(['gain_dur.*']),vizParamsDuration,indexName +' '+iName+ ' '+LTSortBy+' Gain Duration',false);
    });
  }
  var outStack = lossStack.addBands(gainStack);
  
  //Add indexName to bandnames
  var bns = outStack.bandNames();
  var outBns = bns.map(function(bn){return ee.String(indexName).cat('_LT_').cat(bn)});
  outStack = outStack.select(bns,outBns);
  
  return [rawLt,outStack];
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
                .select([0,1,2,3,4,5,6,'pixel_qa'],['blue','green','red','nir','swir1','temp','swir2','pixel_qa']);
    var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
                .filterBounds(aoi)
                .filter(ee.Filter.calendarRange(startYear-yearBuffer,endYear+yearBuffer,'year'))
                .filter(ee.Filter.calendarRange(startJulian,endJulian))
                .select([1,2,3,4,5,7,6,'pixel_qa'],['blue','green','red','nir','swir1','temp','swir2','pixel_qa']);
    var imgs = l5.merge(l8);

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
      }
    })
    

    
    imgs = imgs.map(simpleAddIndices).map(simpleGetTasseledCap).map(simpleAddTCAngles)
    var dummyImage = ee.Image(imgs.first());
  //Build an image collection that includes only one image per year, subset to a single band or index (you can include other bands - the first will be segmented, the others will be fit to the vertices). Note that we are using a mock function to reduce annual image collections to a single image - this can be accomplished many ways using various best-pixel-compositing methods.
  for(var year = startYear; year <= endYear; year++) {
      var imgsT = imgs.filter(ee.Filter.calendarRange(year-yearBuffer,year+yearBuffer,'year'));
      imgsT = fillEmptyCollections(imgsT,dummyImage);
      var img = imgsT.median().set('system:time_start',ee.Date.fromYMD(year,6,1).millis());
      var nameEnd = (year-yearBuffer).toString() + '-'+ (year+yearBuffer).toString();
    // print(year);
    if(year%5 ==0 || year === startYear || year === endYear){
      Map2.addLayer(img,{min:0.05,max:0.35,bands:'swir1,nir,red'},'Composite '+nameEnd,false);
    }
    Map2.addExport(img.select(['blue','green','red','nir','swir1','swir2']).multiply(10000).int16(),'Landsat_Composite_'+ nameEnd,30,false,{});
    var tempCollection = ee.ImageCollection([img]);         

    if(year == startYear) {
      var srCollection = tempCollection;
    } else {
      srCollection = srCollection.merge(tempCollection);
    }
  };

  if(maskWater === 'Yes'){
    var jrcWater = ee.Image("JRC/GSW1_1/GlobalSurfaceWater").select([4]).gt(50);

    jrcWater = jrcWater.updateMask(jrcWater.neq(0)).reproject('EPSG:4326',null,30);

    Map2.addLayer(jrcWater,{min:0,max:1,'palette':'000,00F',addToClassLegend:true,classLegendDict:{'Water 50% time or more 1984-2018':'00F'},queryDict: {1:'Water 50% time or more 1984-2018'}},'JRC Water',false);
    srCollection = srCollection.map(function(img){return img.updateMask(jrcWater.mask().not())})
  }
  srCollection = srCollection.map(addYearBand);
  
  // print(ee.Image(srCollection.first()).bandNames().getInfo())
  var indexList = [];
  Object.keys(whichIndices).map(function(index){
    if(whichIndices[index]){
      // var trendName = index+' Linear Trend '+startYear.toString() + '-' + endYear.toString();
      indexList.push(index);
      // var trend = srCollection.select(['year',index]).reduce(ee.Reducer.linearFit()).select([0]);
      // Map2.addExport(trend.multiply(10000).int16(),trendName ,30,true,{});
    
      // Map2.addLayer(trend,{min:-0.05,max:0.05,palette:'F00,888,00F'},trendName,false);
      // var classes = ee.Image(0);
      // classes = classes.where(trend.lte(-0.005),1)
      // classes = classes.where(trend.gte(0.005),2)
      // classes = classes.mask(classes.neq(0))
      // Map2.addLayer(classes,{min:1,max:2,palette:'F00,0F0',addToClassLegend:true,classLegendDict: {'Loss':'F00','Gain':'0F0'}},index+' Change Category '+startYear.toString() + '-' + endYear.toString(),false)
    
    }
    // chartCollection = srCollection.select(indexList)
  
  })

  
  indexList.map(function(indexName){
    var LTStack = simpleLANDTRENDR(srCollection,startYear,endYear,indexName)[1];
    
  })
  
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

}
