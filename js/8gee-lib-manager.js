
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
function getLCMSVariables() {
// Loss/Gain Palettes
window.declineYearPalette = 'ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02';
window.recoveryYearPalette = 'AFDEA8,80C476,308023,145B09';

window.declineProbPalette = 'F5DEB3,D00';
window.recoveryProbPalette = 'F5DEB3,006400';

window.declineDurPalette = 'BD1600,E2F400,0C2780';
window.recoveryDurPalette = declineDurPalette;
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

window.gtnp = ee.Feature(nps.filter(ee.Filter.eq('PARKNAME','Grand Teton')).first());
window.gnp = ee.Feature(nps.filter(ee.Filter.eq('PARKNAME','Glacier')).first());
window.kfnp = ee.Feature(nps.filter(ee.Filter.eq('PARKNAME','Kenai Fjords')).first());

window.btnf = ee.Feature(b.filter(ee.Filter.eq('FORESTNAME','Bridger-Teton National Forest')).first());
window.fnf = ee.Feature(b.filter(ee.Filter.eq('FORESTNAME','Flathead National Forest')).first());
window.mlsnf = ee.Feature(b.filter(ee.Filter.eq('FORESTNAME','Manti-La Sal National Forest')).first()); 
window.cnf = ee.Feature(b.filter(ee.Filter.eq('FORESTNAME','Chugach National Forest')).first());

// Other boundaries
window.huc8 = ee.FeatureCollection("USGS/WBD/2017/HUC08");
window.kenai_nwr = ee.FeatureCollection('projects/USFS/LCMS-NFS/AK-Ancillary-Data/Kenai_NWR').filterBounds(ck_study_area);


window.fnfStudyAreas = [['Glacier NP',gnp,'Boundary of Glacier National Park'],
                    ['Flathead  NF',fnf,'Boundary of Flathead National Forest'],
                    ['Flathead LCMS Study Area',fnf_study_area,'Area LCMS model calibration data were collected and applied']]

window.btStudyAreas = [['Grand Teton NP',gtnp,'Boundary of Grand Teton National Park'],
                    ['Bridger-Teton NF',btnf,'Boundary of Bridger-Teton National Forest'],
                    ['Bridger-Teton LCMS Study Area',bt_study_area,'Area LCMS model calibration data were collected and applied with the addition of the Grand Teton National Park with a 5km buffer']]

window.mslStudyAreas = [['Manti-La Sal NF',mlsnf,'Boundary of Manti-La Sal National Forest'],
                      ['Manti-La Sal LCMS Study Area',mls_study_area,'Boundary of Manti-La Sal National Forest buffered by 5km LCMS model calibration data were collected and applied']];

window.ckStudyAreas = [['HUC8 Boundaries',huc8.filterBounds(ck_study_area),'USGS Watershed Boundary Dataset of Watersheds'],
        ['Kenai Fjords National Park',kfnp,'Boundary of Kenai Fjords National Park'],
        ['Kenai National Wildlife Refuge',kenai_nwr,'Boundary of Kenai National Wildlife Refuge'],
        ['Chugach NF',cnf,'Boundary of Chugach National Forest'],
                ['Chugach-Kenai LCMS Study Area',ck_study_area,'Area LCMS model calibration data were collected and applied']];

// var studyAreaName = 'FNF';
window.collectionDict = {
  'FNF': [
          // 'projects/USFS/LCMS-NFS/R1/Composites/R1-Composite-Collection',
          'projects/USFS/LCMS-NFS/R1/FNF/Composites/Composite-Collection-fmask-allL7',
          // 'projects/USFS/LCMS-NFS/R1/FNF/Landcover-Change/Landcover-Change-Collection',
          // 'projects/USFS/LCMS-NFS/R1/FNF/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection-R1',
          'projects/USFS/LCMS-NFS/R1/FNF/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection-v2019-3',
          'projects/USFS/LCMS-NFS/R1/FNF/Base-Learners/LANDTRENDR-Collection-fmask-allL7',
          // 'projects/USFS/LCMS-NFS/R1/Base-Learners/LANDTRENDR-Collection',
          'projects/USFS/LCMS-NFS/R1/Base-Learners/Harmonic-Coefficients',
          fnfStudyAreas,
          'projects/USFS/LCMS-NFS/R1/FNF/TimeSync/FNF_Prob_Checks_TimeSync_Annualized_Table',
          fnf_study_area,
         'landtrendr_vertex_format'
          ],

  'BTNF':[
  // 'projects/USFS/LCMS-NFS/R4/Composites/R4-Composite-Collection',
        'projects/USFS/LCMS-NFS/R4/Composites/Composite-Collection-fmask-allL7',
        // 'projects/USFS/LCMS-NFS/R4/BT/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection-TRA',
        'projects/USFS/LCMS-NFS/R4/BT/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection-v2019-3',
        // 'projects/USFS/LCMS-NFS/R4/Base-Learners/LANDTRENDR-Collection',
        'projects/USFS/LCMS-NFS/R4/Base-Learners/LANDTRENDR-Collection-fmask-allL7',
        'projects/USFS/LCMS-NFS/R4/Base-Learners/Harmonic-Coefficients',
        btStudyAreas,
        'projects/USFS/LCMS-NFS/R4/BT/TimeSync/BT_Prob_Checks_TimeSync_Annualized_Table',
        // 'projects/USFS/LCMS-NFS/R4/BT/TetonRiskExtent'
        bt_study_area,
        'landtrendr_vertex_format'
        ],

  'MLSNF':[
        // 'projects/USFS/LCMS-NFS/R4/Composites/R4-Composite-Collection',
        'projects/USFS/LCMS-NFS/R4/Composites/Composite-Collection-fmask-allL7',
        // 'projects/USFS/LCMS-NFS/R4/MLS/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection',
        'projects/USFS/LCMS-NFS/R4/MLS/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection-v2019-3',
        // 'projects/USFS/LCMS-NFS/R4/Base-Learners/LANDTRENDR-Collection',
        'projects/USFS/LCMS-NFS/R4/Base-Learners/LANDTRENDR-Collection-fmask-allL7',
        'projects/USFS/LCMS-NFS/R4/Base-Learners/Harmonic-Coefficients',
        mslStudyAreas,
        'projects/USFS/LCMS-NFS/R4/MLS/TimeSync/MLS_TimeSync_Annualized_Table',
        // 'projects/USFS/LCMS-NFS/R4/BT/TetonRiskExtent'
        mls_study_area,
        'landtrendr_vertex_format'
        ],

  'CNFKP':['projects/USFS/LCMS-NFS/R10/CK/Composites/Composite-Collection-cloudScoreTDOM2',
            'projects/USFS/LCMS-NFS/R10/CK/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection',
            'projects/USFS/LCMS-NFS/R10/CK/Base-Learners/LANDTRENDR-Collection2019',
        //'projects/USFS/LCMS-NFS/R4/Base-Learners/LANDTRENDR-Collection',
        'N/A',
        ckStudyAreas,
        'projects/USFS/LCMS-NFS/R10/CK/TimeSync/CK_TimeSync_Annualized_Table',
        ck_study_area,
        'landtrendr_vertex_format'
        ]
  
}
}
//----------------------------------------------------------------------------------------------------------------
//                                 Functions
//---------------------------------------------------------------------------------------------------------------
//----------Helper Functions-----------------------------------------
function formatAreaChartCollection(collection,classCodes,classNames,unmask){
  if(unmask === undefined || unmask === null){unmask = false};
  var imageIndexes = ee.List.sequence(0,collection.size().subtract(1)).getInfo();
  var collectionL = collection.toList(100,0);
  classCodes = classCodes.map(function(c){return parseInt(c)})
  // print(classCodes)
  var stack = imageIndexes.map(function(i){
      var ic = ee.Image(collectionL.get(i));
      // var d = ee.Date(ic.get('system:time_start'));
      var img;
      classCodes.map(function(c){
        // console.log(i);console.log(c);
        var m = ic.mask();
        var ci = ic.eq(c).byte().rename(['c_'+ parseInt((c)).toString()]);
        //Unmask if in AK
        if(studyAreaName === 'CNFKP' || unmask){
          ci = ci.mask(ee.Image(1));
          ci = ci.where(m.not(),0);
        }
        
        if(img === undefined){img = ci}
          else{img = img.addBands(ci)};
      })
      // print(img.getInfo())
      img = img.copyProperties(ic);
      img = img.copyProperties(ic,['system:time_start'])
      return ee.Image(img).rename(classNames);
    });
    stack = ee.ImageCollection(stack);
    return stack;
}
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
function fillEmptyCollections(inCollection,dummyImage){                       
  var dummyCollection = ee.ImageCollection([dummyImage.mask(ee.Image(0))]);
  var imageCount = inCollection.toList(1).length();
  return ee.ImageCollection(ee.Algorithms.If(imageCount.gt(0),inCollection,dummyCollection));

}
// --------Add MTBS and IDS Layers-------------------------------
var idsStartYear = 1997;
var idsEndYear = 2015;
function getIDSCollection(){

var idsYears = ee.List.sequence(idsStartYear,idsEndYear).getInfo();

var defolCollection = ee.FeatureCollection('projects/USFS/FHAAST/IDS/IDS_Defol');

  var idsCollection = idsYears.map(function(yr){
    var mort = ee.FeatureCollection('projects/USFS/FHAAST/IDS/IDS_Mort_' + yr.toString());
    // print(mort.first())
    
    var mortDamageType = mort.reduceToImage(['DAMAGE_TYP'],ee.Reducer.first()).rename(['IDS Mort Type']);
    var mortDCA = mort.reduceToImage(['DCA_CODE'],ee.Reducer.first()).rename(['IDS Mort DCA']);
    var mortDCAMod = mortDCA.mod(1000);
    mortDCA = (mortDCA.subtract(mortDCAMod)).divide(1000);
    
    
    var defolCollectionYr =defolCollection.filter(ee.Filter.eq('SURVEY_YEA',yr));
    var defolDamageType = defolCollectionYr.reduceToImage(['DAMAGE_TYP'],ee.Reducer.first()).rename(['IDS Defol Type']);
    var defolDCA = defolCollectionYr.reduceToImage(['DCA_CODE'],ee.Reducer.first()).rename(['IDS Defol DCA']);
    var defolDCAMod = defolDCA.mod(1000);
    defolDCA = (defolDCA.subtract(defolDCAMod)).divide(1000);
    
    var idsStack = mortDamageType.addBands(mortDCA).addBands(defolDamageType).addBands(defolDCA).set('system:time_start',ee.Date.fromYMD(yr,6,1).millis()).byte();
    var idsYearStack = ee.Image([yr,yr,yr,yr]).updateMask([mortDamageType.mask(),mortDCA.mask(),defolDamageType.mask(),defolDCA.mask()]).int16();
    var bns = idsStack.bandNames();
    bns = bns.map(function(bn){return ee.String(bn).cat(' Year')});
    idsYearStack = idsYearStack.rename(bns)
    return idsStack.addBands(idsYearStack)
  });
  idsCollection = ee.ImageCollection(idsCollection);

  return idsCollection
}
function getMTBS(studyAreaName,whichLayerList,showSeverity){
  if(showSeverity === null || showSeverity === undefined){showSeverity = false}
  if(studyAreaName === 'CNFKP'){
    var mtbs_path = 'projects/USFS/DAS/MTBS/BurnSeverityMosaics';
    var mtbsClientBoundary = {"geodesic":false,"type":"Polygon","coordinates":[[[-163.83922691651176,61.8957471095411],[-143.28412464845243,61.8957471095411],[-143.28412464845243,68.23773785333091],[-163.83922691651176,68.23773785333091],[-163.83922691651176,61.8957471095411]]]};
  } else {
    var mtbs_path = 'projects/USFS/DAS/MTBS/BurnSeverityMosaics';
     var mtbsClientBoundary = {"geodesic":false,"type":"Polygon","coordinates":[[[-125.75643073529548,24.088884681079445],[-66.54030227863115,24.088884681079445],[-66.54030227863115,49.98575233937072],[-125.75643073529548,49.98575233937072],[-125.75643073529548,24.088884681079445]]]}
  
  }
  var mtbsEndYear = endYear;
  if(endYear > 2017){mtbsEndYear = 2017}

  var mtbsYears = ee.List.sequence(1984,mtbsEndYear);
  var mtbs = ee.ImageCollection(mtbs_path);
  mtbs = mtbsYears.map(function(yr){
    var mtbsYr = mtbs.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic();
    return mtbsYr.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis())
  })
  mtbs = ee.ImageCollection.fromImages(mtbs);

  // var perims = ee.FeatureCollection('projects/USFS/DAS/MTBS/mtbs_perims_DD').filterBounds(eeBoundsPoly).map(function(f){return f.simplify(100)});

  // console.log(perims.getInfo());
  // Map2.addLayer(perims,{clickQuery:true},'MTBS Perims',false);
  // var mtbsClientBoundary =ee.Image(mtbs.first()).geometry().bounds(1000).getInfo();
 // print(mtbsClientBoundary)
  mtbs = mtbs.filter(ee.Filter.calendarRange(startYear,mtbsEndYear,'year'))
      
  
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

  mtbsQueryClassDict = {};
  var keyI = 1;
  Object.keys(mtbsClassDict).map(function(k){mtbsQueryClassDict[keyI] =k;keyI++;})

  if(chartMTBS === true){
    var mtbsStack = formatAreaChartCollection(mtbs,Object.keys(mtbsQueryClassDict),Object.values(mtbsQueryClassDict),true);
    areaChartCollections['mtbs'] = {'collection':mtbsStack,
                                  'colors':Object.values(mtbsClassDict),
                                  'label':'MTBS Severity',
                                  'stacked':true,
                                  'steppedLine':false,
                                  'chartType':'bar',
                                  'xAxisProperty':'year'}
  }
  if(chartMTBSByNLCD){
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
    
    
    var nlcd = ee.ImageCollection('USGS/NLCD').select([0],['landcover'])
    var mtbsMaxSeverity = mtbs.select([0]).max();

   var nlcdYears = [1992,2001,2004,2006,2008,2011,2013,2016];
   nlcdYears.map(function(nlcdYear){
      if(nlcdYear >= startYear  && nlcdYear <= mtbsEndYear){
        var nlcdT = nlcd.filter(ee.Filter.calendarRange(nlcdYear,nlcdYear,'year')).mosaic();
        var mtbsByNLCD = Object.keys(nlcdLCQueryDict).map(function(k){
          var name = nlcdLCQueryDict[k];
          var out = mtbsMaxSeverity.updateMask(nlcdT.eq(ee.Number.parse(k))).set('nlcd_landcover_class',name);
          return out
         });
         mtbsByNLCD = ee.ImageCollection(mtbsByNLCD);
         var mtbsByNLCDStack = formatAreaChartCollection(mtbsByNLCD,Object.keys(mtbsQueryClassDict),Object.values(mtbsQueryClassDict),true);
          
         // Map2.addLayer(nlcdT,{min:nlcdLCMin,max:nlcdLCMax,palette:Object.values(nlcdLCVizDict),addToClassLegend: true,classLegendDict:nlcdLegendDictReverse,queryDict: nlcdLCQueryDict},'NLCD '+nlcdYear.toString(),false);
          
          areaChartCollections['mtbsNLCD'+nlcdYear.toString()] = {'collection':mtbsByNLCDStack,
                                        'colors':Object.values(mtbsClassDict),
                                        'label':'MTBS Severity by NLCD Class '+nlcdYear.toString(),
                                        'stacked':true,
                                        'steppedLine':false,
                                        'chartType':'bar',
                                        'xAxisProperty':'nlcd_landcover_class',
                                        'xAxisLabel':'NLCD '+nlcdYear.toString() + ' Class'}
          }
      
       })
  }

// print(mtbsStack.getInfo());
  var severityViz = {'queryDict': mtbsQueryClassDict,'min':1,'max':6,'palette':'006400,7fffd4,ffff00,ff0000,7fff00,ffffff',addToClassLegend: true,classLegendDict:mtbsClassDict}
  Map2.addLayer(mtbs.select([0]).max().set('bounds',mtbsClientBoundary),severityViz,'MTBS Severity Composite',showSeverity,null,null,'MTBS CONUS burn severity mosaic from '+startYear.toString() + '-' + mtbsEndYear.toString(),whichLayerList)
  Map2.addLayer(mtbsYear.set('bounds',mtbsClientBoundary),{min:startYear,max:endYear,palette:declineYearPalette},'MTBS Year of Highest Severity',false,null,null,'MTBS CONUS year of highest mapped burn severity from '+startYear.toString() + '-' + mtbsEndYear.toString(),whichLayerList)  
  var chartTableDict = {
    'Burn Severity':mtbsQueryClassDict
  }
  return mtbs.set('bounds',mtbsClientBoundary).select([0],['Burn Severity']).set('chartTableDict',chartTableDict);
}
function getMTBSandIDS(studyAreaName,whichLayerList){
  if(whichLayerList === null || whichLayerList === undefined){whichLayerList = 'reference-layer-list'};
  var idsCollection = getIDSCollection();
  if(studyAreaName === 'CNFKP'){
    var mtbs_path = 'projects/USFS/DAS/MTBS/BurnSeverityMosaics';
    var mtbsClientBoundary = {"geodesic":false,"type":"Polygon","coordinates":[[[-163.83922691651176,61.8957471095411],[-143.28412464845243,61.8957471095411],[-143.28412464845243,68.23773785333091],[-163.83922691651176,68.23773785333091],[-163.83922691651176,61.8957471095411]]]};
  } else {
    var mtbs_path = 'projects/USFS/DAS/MTBS/BurnSeverityMosaics';
     var mtbsClientBoundary = {"geodesic":false,"type":"Polygon","coordinates":[[[-125.75643073529548,24.088884681079445],[-66.54030227863115,24.088884681079445],[-66.54030227863115,49.98575233937072],[-125.75643073529548,49.98575233937072],[-125.75643073529548,24.088884681079445]]]}
  
  }
  

  // var ned = ee.Image('USGS/NED');
  // var hillshade = ee.Terrain.hillshade(ned);
  // Map2.addLayer(hillshade,{min:0,max:255},'hillshade')
  var nlcd = ee.ImageCollection('USGS/NLCD');
  // Map2.addLayer(ee.Image(0),{min:0,max:0,palette:'000',opacity:0.8});
  var tcc = nlcd.filter(ee.Filter.calendarRange(2011,2011,'year')).select(['percent_tree_cover']).mosaic();
  // tcc = tcc.mask(tcc.neq(0));
  Map2.addLayer(tcc,{min:10,max:70,palette:'000,2d7d1f'},'NLCD Tree Canopy Cover 2011',false,null,null, 'NLCD 2011 Tree Canopy Cover',whichLayerList);

  

  
  Map2.addLayer(idsCollection.select(['IDS Mort Type']).count().set('bounds',mtbsClientBoundary),{'min':1,'max':Math.floor((idsEndYear-idsStartYear)/4),palette:declineYearPalette},'IDS Mortality Survey Count',false,null,null, 'Number of times an area was recorded as mortality by the IDS survey',whichLayerList);
  Map2.addLayer(idsCollection.select(['IDS Mort Type Year']).max().set('bounds',mtbsClientBoundary),{min:startYear,max:endYear,palette:declineYearPalette},'IDS Most Recent Year of Mortality',false,null,null, 'Most recent year an area was recorded as mortality by the IDS survey',whichLayerList);
  
  Map2.addLayer(idsCollection.select(['IDS Defol Type']).count().set('bounds',mtbsClientBoundary),{'min':1,'max':Math.floor((idsEndYear-idsStartYear)/4),palette:declineYearPalette},'IDS Defoliation Survey Count',false,null,null, 'Number of times an area was recorded as defoliation by the IDS survey',whichLayerList);
  Map2.addLayer(idsCollection.select(['IDS Defol Type Year']).max().set('bounds',mtbsClientBoundary),{min:startYear,max:endYear,palette:declineYearPalette},'IDS Most Recent Year of Defoliation',false,null,null, 'Most recent year an area was recorded as defoliation by the IDS survey',whichLayerList);
  var mtbs =getMTBS(studyAreaName,whichLayerList)
  return [mtbs,idsCollection]
}
function getHansen(whichLayerList){
  if(whichLayerList === null || whichLayerList === undefined){whichLayerList = 'reference-layer-list'};
  var hansen = ee.Image('UMD/hansen/global_forest_change_2018_v1_6');
  var hansenClientBoundary = {"type":"Polygon","coordinates":[[[-180,-90],[180,-90],[180,90],[-180,90],[-180,-90]]]};//hansen.geometry().bounds(1000).getInfo();
  // print(hansenClientBoundary);
  var hansenLoss = hansen.select(['lossyear']).add(2000).int16();
  var hansenGain = hansen.select(['gain']);
  hansenLoss = hansenLoss.updateMask(hansenLoss.neq(2000).and(hansenLoss.gte(startYear)).and(hansenLoss.lte(endYear)));
  Map2.addLayer(hansenLoss.set('bounds',hansenClientBoundary),{'min':startYear,'max':endYear,'palette':declineYearPalette},'Hansen Loss Year',false,null,null,'Hansen Global Forest Change year of loss',whichLayerList);
  Map2.addLayer(hansenGain.updateMask(hansenGain).set('bounds',hansenClientBoundary),{'min':1,'max':1,'palette':'0A0',addToClassLegend: true,classLegendDict:{'Forest Gain':'0A0'}},'Hansen Gain',false,null,null,'Hansen Global Forest Change gain',whichLayerList);

}
function getNLCD(){
  var nlcd = ee.ImageCollection('USGS/NLCD').select([0]);

  var nlcdForClasses = ee.Image('USGS/NLCD/NLCD2011');
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

function setupDownloads(studyAreaName){
  // Prep downloads
    var downloads = lcmsDownloadDict[studyAreaName];
    if(downloads !== undefined){
      downloads.map(function(url){
      var name = url.substr(url.lastIndexOf('/') + 1);
      addDownload(url,name);

      })
    }
    else{addDownload('','No downloads available for chosen study area')}
}


