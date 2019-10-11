
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
    var landtrendr_format = collectionDict[studyAreaName][7];

    // Initial load & format of LCMS Layers
    var rawC = ee.ImageCollection(collectionDict[studyAreaName][1]);
 

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
    
    var lcJSONFlipped = {};
    Object.keys(lcJSON).map(function(k){
                              // print(k);
                              lcJSONFlipped[lcJSON[k]['name']] = parseInt(k)
                            });
   
    var rawLC = rawC
                .filter(ee.Filter.calendarRange(startYear,endYear,'year'))
                .select([0],['LC']);

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
        
        Map2.addLayer(vmapRast,{queryDict: prop[4],min:1,max:prop[1].length,palette:prop[2],addToClassLegend: true,classLegendDict:prop[3]},'VMAP-'+prop[0],false,null,null,'VMAP layer attribute: '+prop[0],'reference-layer-list')
      })

      var wb = ee.Image('projects/USFS/LCMS-NFS/R1/FNF/Ancillary/IRPSV102_WHITEBARK');
      wb = wb.updateMask(wb)
      Map2.addLayer(wb,{queryDict: {1:'Whitebark Pine Range'},min:1,max:1,palette:'080',addToClassLegend: true,classLegendDict:{'':'080'}},'Whitebark Pine Range',false,null,null,'Extent of potential Whitebark Pine','reference-layer-list')

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

      Map2.addLayer(wbp.updateMask(wbp.neq(0)),wbpViz,'GYA Whitebark Pine Mortality',false,null,null,'Mortality from two date change detection over Whitebark Pine areas of the Greater Yellowstone Area','reference-layer-list');


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
      
      Map2.addLayer(canopyCover.updateMask(canopyCover.neq(0)),canopyCoverViz,'VCMQ 2018 Canopy Cover',false,null,null,'2018 updated VCMQ (mid-level vegetation cover map) canopy cover classes','reference-layer-list');
      Map2.addLayer(treeSize.updateMask(treeSize.neq(0)),treeSizeViz,'VCMQ 2018 Tree Size',false,null,null,'2018 updated VCMQ (mid-level vegetation cover map) tree size classes','reference-layer-list');
      Map2.addLayer(vegType.updateMask(vegType.neq(0)),vegTypeViz,'VCMQ 2018 Veg Type',false,null,null,'2018 updated VCMQ (mid-level vegetation cover map) vegetation type classes','reference-layer-list');

      var lynxPalette = '080,ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02';

      var lynxHab = ee.Image('projects/USFS/LCMS-NFS/R4/BT/Ancillary/LynxHab/WildlifeBtLynxHab2017');
      lynxHab = lynxHab.where(lynxHab.eq(0),1970);
      var lynxClassDict = {'Suitable':'080','Unsuitable 1987':'ffffe5','Unsuitable 2017':'cc4c02'};
     
      lynxClassQueryDict['1970'] = 'Suitable 1987-2018';
      ee.List.sequence(1987,2018).getInfo().map(function(k){lynxClassQueryDict[k] =k;})
      Map2.addLayer(lynxHab,{queryDict:lynxClassQueryDict,min:1970,max:2017,palette:lynxPalette,addToClassLegend: true,classLegendDict:lynxClassDict},'B-T Lynx Habitat Unsuitability Year',false,null,null,'Lynx habitat suitability 2017.  Years are years Lynx habitat became unsuitable.','reference-layer-list');

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
      var kenaiVegTypeClassQueryDict = {}; var CRvegTypeClassQueryDict = {};
      //Kenai Veg Map
      var kenaiVegType = ee.Image('projects/USFS/LCMS-NFS/R10/CK/Ancillary/Kenai_VegMap');
      var kenaiVegTypeClassDict = {"1: Black Spruce": "4e5e38", "2: Black Spruce Peatland": "87751e", "3: Mountain Hemlock": "007800", "4: Mountain Hemlock-Lutz Spruce": "0f5e4f", "5: Mountain Hemlock-Sitka Spruce": "005e00", "6: Sitka Spruce": "003800", "7: White/Lutz Spruce": "215c4f", "8: Alaska Paper Birch (and Kenai Birch": "87f38c", "9: Black Cottonwood (and Balsam Poplar": "b0ff8c", "10: Quaking Aspen": "d4ffc0", "11: Black Spruce-Broadleaf": "0b9721", "12: White/Lutz Spruce-Birch": "45a138", "13: White/Lutz Spruce-Cottonwood": "66b52b", "14: White/Lutz Spruce-Aspen": "38a89e", "15: Alder": "ff0000", "16: Willow": "9c2e23", "17: Alder-Willow": "a30000", "18: Low Shrub Peatland": "d1852e", "19: Low Shrub Willow-Dwarf Birch": "ab3a11", "20: Wet Willow (Sweetgale)": "f0d1ab", "21: Dryas Dwarf Shrub": "ffe3e8", "22: Dwarf Shrub-Lichen": "ff73de", "23: Ericaceous Dwarf Shrub": "9e1eee", "24: Sedge Peatland": "fa9402", "25: Aquatic Herbaceous": "c0e8ff", "26: Dry Herbaceous": "ffffc0", "27: Mesic Herbaceous": "ffff00", "28: Wet Herbaceous": "e6e600", "29: Sparse Vegetation": "686868", "30: Barren": "cccccc", "31: Water": "4780f3", "32: Snow/Ice": "ffffff", "33: Developed": "000000"};
      var kenaiVegTypeClassDict2 = {};
      Object.keys(kenaiVegTypeClassDict).map(function(k){kenaiVegTypeClassDict2[k.split(': ')[1]] = kenaiVegTypeClassDict[k]});
      var keyI = 1;
      Object.keys(kenaiVegTypeClassDict2).map(function(k){kenaiVegTypeClassQueryDict[keyI] =k;keyI++;})
      
      var kenaiVegTypePalette = '4e5e38,87751e,007800,0f5e4f,005e00,003800,215c4f,87f38c,b0ff8c,d4ffc0,0b9721,45a138,66b52b,38a89e,ff0000,9c2e23,a30000,d1852e,ab3a11,f0d1ab,ffe3e8,ff73de,9e1eee,fa9402,c0e8ff,ffffc0,ffff00,e6e600,686868,cccccc,4780f3,ffffff,000000';
      var kenaiVegTypeViz = {queryDict:kenaiVegTypeClassQueryDict,min: 1, max: 33, palette: kenaiVegTypePalette, addToClassLegend: true, classLegendDict: kenaiVegTypeClassDict2};
      Map2.addLayer(kenaiVegType.updateMask(kenaiVegType.neq(0)),kenaiVegTypeViz,'Kenai Veg Type 2017',false,null,null,'2017 Kenai Peninsula vegetation dominance classes','reference-layer-list');

      // Copper River Veg Map  
      var CRvegType = ee.Image('projects/USFS/LCMS-NFS/R10/CK/Ancillary/CopperRiverDelta_VegMap');//.setDefaultProjection(crs, transform, scale);
      var CRvegTypeClassDict = {"1: Western Hemlock": "3db370", "2: Sitka Spruce": "006300", "3: Black Cottonwood": "c9ff70", "4: Sitka Spruce - Black Cottonwood": "75ed00", "5: Sitka Alder": "f8644f", "6: Willow": "781212", "7: Sitka Alder - Willow Mix": "e02a3e", "8: Sweetgale": "ffd480", "9: Dry Graminoid": "8acc66", "10: Mesic Wet Herbaceous": "78c2c4", "11: Aquatic Herbaceous": "9efade", "12: Sparse/Unvegetated": "dfcbaf", "13: Water": "457dc7", "14: Snow/Ice": "ffffff", "15: Developed": "000000"};
      var CRvegTypeClassDict2 = {};
      Object.keys(CRvegTypeClassDict).map(function(k){CRvegTypeClassDict2[k.split(': ')[1]] = CRvegTypeClassDict[k]});
      var keyI = 1;
      Object.keys(CRvegTypeClassDict2).map(function(k){CRvegTypeClassQueryDict[keyI] =k;keyI++;})
      
      var CRvegTypePalette = '3db370,006300,c9ff70,75ed00,f8644f,781212,e02a3e,ffd480,8acc66,78c2c4,9efade,dfcbaf,457dc7,ffffff,000000';
      var CRvegTypeViz = {queryDict:CRvegTypeClassQueryDict,min: 1, max: 15, palette: CRvegTypePalette, addToClassLegend: true, classLegendDict:CRvegTypeClassDict2};  
      Map2.addLayer(CRvegType.updateMask(CRvegType.neq(0)), CRvegTypeViz, 'Copper River Delta Veg Type 2010', false, null, null, '2010 Copper River Delta vegetation dominance classes','reference-layer-list');
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

    var luPalette = "efff6b,ff2ff8,1b9d0c,97ffff,a1a1a1,c2b34a";
    var luLayerName =  'Land Use (mode) '+ startYear.toString() + '-'+ endYear.toString();
    
   
    var landcoverClassLegendDict = {};var landcoverClassChartDict = {}
    var lcPalette = Object.values(lcJSON).map(function(v){return v['color']});
    var lcValues = Object.keys(lcJSON).map(function(i){return parseInt(i)});
    // print(lcValues);
    Object.keys(lcJSON).map(function(k){landcoverClassLegendDict[lcJSON[k]['name']] = lcJSON[k]['color']});
    Object.keys(lcJSON).map(function(k){landcoverClassChartDict[lcJSON[k]['name']] = k/10.});
    // console.log(lcPalette);console.log(landcoverClassChartDict)
    // var landcoverClassLegendDict = {'Barren':'b67430',
    //                         'Grass/forb/herb':'78db53',
    //                         'Impervious':'F0F',
    //                         'Shrubs':'ffb88c',
    //                         'Snow/ice':'8cfffc',
    //                         'Trees':'32681e',
    //                         'Water':'2a74b8'};

    var landuseClassLegendDict = {
      'Agriculture':'efff6b',
      'Developed':'ff2ff8',
      'Forest':'1b9d0c',
      'Non-forest Wetland':'97ffff',
      'Other':'a1a1a1',
      'Rangeland':'c2b34a',

    }

    // var landcoverClassChartDict={
    //   'Barren':0.1,
    //   'Grass/forb/herb':0.2,
    //   'Impervious':0.3,
    //   'Shrubs': 0.4,
    //   'Snow/ice': 0.5,
    //   'Trees': 0.6,
    //   'Water': 0.7
    // }
    var landuseClassChartDict={
      'Agriculture': 0.1,
      'Developed' : 0.2,
      'Forest' : 0.3,
      'Non-forest Wetland' : 0.4,
      'Other' : 0.5,
      'Rangeland':0.6
    }

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
        Map2.addLayer(maskCount,{'min':1,'max':33,'palette':'0C2780,E2F400,BD1600'}, 'Number of Missing Data Years',false)
        //Map2.addLayer(missingYears,{'opacity': 0}, 'Number of Missing Data Years',false)
    }
      Map2.addLayer(NFSLC.mode().multiply(10),{queryDict:landcoverClassQueryDict,'palette':lcPalette,'min':lcValues[0],'max':lcValues[lcValues.length-1],addToClassLegend: true,classLegendDict:landcoverClassLegendDict}, lcLayerName,false); 
      Map2.addLayer(NFSLU.mode().multiply(10),{queryDict:landuseClassQueryDict,'palette':luPalette,'min':1,'max':6,addToClassLegend: true,classLegendDict:landuseClassLegendDict}, luLayerName,false); 
      if(applyTreeMask === 'yes'){
        // Map2.addLayer(waterMask,{min:1,max:1,palette:'2a74b8'},'Water Mask',false);
        var treeClassLegendDict = {};
        treeClassLegendDict['Tree ('+minTreeNumber+' or more years)'] = '32681e';

        Map2.addLayer(treeMask,{min:1,max:1,palette:'32681e',addToClassLegend: true,classLegendDict:treeClassLegendDict},'Tree Mask',false,null,null,'Mask of areas LCMS classified as tree cover for '+minTreeNumber.toString()+' or more years');
     
      }
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
    var interestedClasses =  [24,21,25,26,27,28,82,72,62,52,12,42,14,15,16,17,18,81,71,61,51,41,45,46,47,48,84,74,64,54,56,57,58,85,75,65,67,68,86,76,78,87];
    var lcChangeClassWords = ["Snow/Ice to Barren" , "Snow/Ice to Water" , "Snow/Ice to Grass/Forb/Herb" , "Snow/Ice to Shrubs" , "Snow/Ice to Tall Shrubs" , "Snow/Ice to Tree" , "Tree to Snow/Ice" , "Tall Shrubs to Snow/Ice" , "Shrubs to Snow/Ice" , "Grass/Forb/Herb to Snow/Ice" , "Water to Snow/Ice" , "Barren to Snow/Ice" , "Water to Barren" , "Water to Grass/Forb/Herb" , "Water to Shrubs" , "Water to Tall Shrubs" , "Water to Tree" , "Tree to Water" , "Tall Shrubs to Water" , "Shrubs to Water" , "Grass/Forb/Herb to Water" , "Barren to Water" , "Barren to Grass/Forb/Herb" , "Barren to Shrubs" , "Barren to Tall Shrubs" , "Barren to Tree" , "Tree to Barren" , "Tall Shrubs to Barren" , "Shrubs to Barren" , "Grass/Forb/Herb to Barren" , "Grass/Forb/Herb to Shrubs" , "Grass/Forb/Herb to Tall Shrubs" , "Grass/Forb/Herb to Tree" , "Tree to Grass/Forb/Herb" , "Tall Shrubs to Grass/Forb/Herb" , "Shrubs to Grass/Forb/Herb" , "Shrubs to Tall Shrubs" , "Shrubs to Tree" , "Tree to Shrubs" , "Tall Shrubs to Shrubs" , "Tall Shrubs to Tree" , "Tree to Tall Shrubs"];
    var vegetationChangeClassDict = toObj(interestedClasses,lcChangeClassWords);
    // console.log(vegetationChangeClassDict);
    queryClassDict['lcChangeMatrix'] = vegetationChangeClassDict;
    queryClassDict['Vegetation Change'] = vegetationChangeClassDict;
    if(viewBeta === 'yes'){

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
      Map2.addLayer(vegChangeMag,{min:-5,max:5,palette:vegChangePalette},
         'Vegetation Change',false,null,null, 
         'Magnitude of vegetation cover change related to the difference between the most common landcover for the first and last 5 years of the analysis period.',null,lcChangeMatrix);

      // Snow change layer
      if (studyAreaName == 'CNFKP'){
        var snowValues = ee.List([1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
        var snowChangeMask = lcChangeMatrix.remap(interestedClasses, snowValues, 0);
        var snowChangeMag = lcChangeMag.updateMask(snowChangeMask);
        var snowChangePalette = '3e45c1,4575b4,74add1,abd9e9,e0f3f8,ffffbf,fee090,fdae61,f46d43,d73027,a50026'
        Map2.addLayer(snowChangeMag,{min:-5,max:5,palette:snowChangePalette},
           'Snow Cover Change',false,null,null, 
           'Magnitude of snow cover change related to the difference between the most common landcover for the first and last 5 years of the analysis period.');
      }

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

    var steppedLineLC = false;
    if(studyAreaName === 'CNFKP'){steppedLineLC = 'before';}
    
    var lcStack =formatAreaChartCollection(rawLC,lcValues,Object.keys(landcoverClassChartDict))
    // var lcClassCodes = lcValues;
    // var imageIndexes = ee.List.sequence(0,rawLC.size().subtract(1)).getInfo();
    // var rawLCL = rawLC.toList(100,0);
    // var lcStack = imageIndexes.map(function(i){
    //   var lcc = ee.Image(rawLCL.get(i));
    //   var d = ee.Date(lcc.get('system:time_start'));
    //   var img;
    //   lcClassCodes.map(function(c){
    //     // console.log(i);console.log(c);
    //     var m = lcc.mask();
    //     var ci = lcc.eq(c).byte().rename(['lc_'+ parseInt((c)).toString()]);
    //     //Unmask if in AK
    //     if(studyAreaName === 'CNFKP'){
    //       ci = ci.mask(ee.Image(1));
    //       ci = ci.where(m.not(),0);
    //     }
        
    //     if(img === undefined){img = ci}
    //       else{img = img.addBands(ci)};
    //   })
    //   return img.set('system:time_start',d).rename(Object.keys(landcoverClassChartDict));
    // });
    // lcStack = ee.ImageCollection(lcStack);
    // console.log(Object.keys(landcoverClassChartDict))
    // Map2.addLayer(lcStack.mode(),{},'lcmode')
    // lcStack = lcStack.select(lcClassCodes,Object.keys(landcoverClassChartDict));
    // print(lcStack.getInfo())
    // Map2.addLayer(lcStack.mosaic(),{},'lcStack');

    forCharting = joinCollections(forCharting,NFSLCMS, false);
    chartCollection =forCharting;
    if(analysisMode === 'advanced'){
     chartCollection = chartCollection.set('legends',{'Land Cover Class': JSON.stringify(landcoverClassChartDict),'Land Use Class:':JSON.stringify(landuseClassChartDict)}) 
    }


    var lossGainAreaCharting = joinCollections(dndThresh,rnrThresh,false).select(['.*_change_year']);
    var lossGainAreaChartingGeo = lossGainAreaCharting.geometry();
    lossGainAreaCharting =lossGainAreaCharting.map(function(img){
      return img.mask().clip(lossGainAreaChartingGeo)
    });
    lossGainAreaCharting = lossGainAreaCharting.select([0,1],['Loss','Gain']);
    
    
    // areaChartCollection = forAreaCharting;
    // stackedAreaChart = false;
    // areaChartCollections = {};
    var lColors = declineYearPalette.split(',');
    var gColors = recoveryYearPalette.split(',');
    var lColor = lColors[lColors.length-1];
    var gColor = gColors[gColors.length-1];; 
    areaChartCollections['lg'] = {'label':'LCMS Loss/Gain',
                                  'collection':lossGainAreaCharting,
                                  'stacked':false,
                                  'steppedLine':false,
                                  'colors':[lColor,gColor]};
    if(analysisMode === 'advanced'){
      areaChartCollections['lc'] = {'label':'LCMS Landcover',
                                  'collection':lcStack,
                                  'stacked':true,
                                  'steppedLine':steppedLineLC,
                                  'colors':Object.values(landcoverClassLegendDict)};
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
  var hansen = ee.Image('UMD/hansen/global_forest_change_2018_v1_6');
  var hansenLoss = hansen.select(['lossyear']).add(2000).int16();
  var hansenGain = hansen.select(['gain']);
  hansenLoss = hansenLoss.updateMask(hansenLoss.neq(2000).and(hansenLoss.gte(startYear)).and(hansenLoss.lte(endYear)));
  Map2.addLayer(hansenLoss,{'min':startYear,'max':endYear,'palette':declineYearPalette},'Hansen Loss Year',false,null,null,'Hansen Global Forest Change year of loss','reference-layer-list');
  Map2.addLayer(hansenGain.updateMask(hansenGain),{'min':1,'max':1,'palette':'0A0',addToClassLegend: true,classLegendDict:{'Forest Gain':'0A0'}},'Hansen Gain',false,null,null,'Hansen Global Forest Change gain','reference-layer-list');

  getMTBSandIDS(studyAreaName);
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
  var tcc = ee.Image('USGS/NLCD/NLCD2011').select([3]);
  var lc = ee.Image('USGS/NLCD/NLCD2011').select([0]);
  Map2.addLayer(tcc,{min:30,max:80,palette:'000,0F0','opacity':0.5},'tcc',true,null,null,'test');
  Map2.addLayer(lc,{min:1,max:90,palette:'000,0F0','opacity':0.4},'lc',false,null,null,'test2');
  Map2.addLayer(ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/BT/GTNP_admin_bndy_5km_buffer_GTNP_Merge'),{},'bt study area');
}

