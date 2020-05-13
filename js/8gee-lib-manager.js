
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


window.fnfStudyAreas = [['Glacier NP',gnp,'Boundary of Glacier National Park'],
                    ['Flathead  NF',fnf,'Boundary of Flathead National Forest'],
                    ['Flathead LCMS Study Area',fnf_study_area,'Area LCMS model calibration data were collected and applied']]

window.btStudyAreas = [['Grand Teton NP',gtnp,'Boundary of Grand Teton National Park'],
                    ['Bridger-Teton NF',btnf,'Boundary of Bridger-Teton National Forest'],
                    ['Bridger-Teton LCMS Study Area',bt_study_area,'Area LCMS model calibration data were collected and applied with the addition of the Grand Teton National Park with a 5km buffer']]

window.mslStudyAreas = [['Manti-La Sal NF',mlsnf,'Boundary of Manti-La Sal National Forest'],
                      ['Manti-La Sal LCMS Study Area',mls_study_area,'Boundary of Manti-La Sal National Forest buffered by 5km LCMS model calibration data were collected and applied']];
window.R4StudyAreas = [
// ['USFS Intermountain Region LCMS Study Area',R4_unofficial,'Boundary of the USFS Intermountain Region 4 with a 5km buffer and additional areas to include more of the Greater Yellowstone Ecosystem'],
                        ['Monroe Mtn FACTS',ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/Monroe_Mtn_FACTS'),'Monroe Mtn FACTS data'],
                        ['USFS Intermountain Region 4',R4_official,'Boundary of the USFS Intermountain Region 4']];

window.ckStudyAreas = [['HUC8 Boundaries',huc8.filterBounds(ck_study_area),'USGS Watershed Boundary Dataset of Watersheds'],
        ['Kenai Fjords National Park',kfnp,'Boundary of Kenai Fjords National Park'],
        ['Kenai National Wildlife Refuge',kenai_nwr,'Boundary of Kenai National Wildlife Refuge'],
        ['Chugach NF',cnf,'Boundary of Chugach National Forest'],
        ['Chugach-Kenai LCMS Study Area',ck_study_area,'Area LCMS model calibration data were collected and applied']];

studyAreaDict['Flathead National Forest'].studyAreas = fnfStudyAreas;
studyAreaDict['Flathead National Forest'].studyAreaBoundary = fnf_study_area;

studyAreaDict['Bridger-Teton National Forest'].studyAreas = btStudyAreas;
studyAreaDict['Bridger-Teton National Forest'].studyAreaBoundary = bt_study_area;

studyAreaDict['Manti-La Sal National Forest'].studyAreas = mslStudyAreas;
studyAreaDict['Manti-La Sal National Forest'].studyAreaBoundary = mls_study_area;

studyAreaDict['Chugach National Forest - Kenai Peninsula'].studyAreas = ckStudyAreas;
studyAreaDict['Chugach National Forest - Kenai Peninsula'].studyAreaBoundary = ck_study_area;

studyAreaDict['USFS Intermountain Region'].studyAreas = R4StudyAreas;
studyAreaDict['USFS Intermountain Region'].studyAreaBoundary = R4_official;

// var studyAreaName = 'FNF';
// window.collectionDict = {
//   'FNF': [
//           // 'projects/USFS/LCMS-NFS/R1/Composites/R1-Composite-Collection',
//           'projects/USFS/LCMS-NFS/R1/FNF/Composites/Composite-Collection-fmask-allL7',
//           // 'projects/USFS/LCMS-NFS/R1/FNF/Landcover-Change/Landcover-Change-Collection',
//           // 'projects/USFS/LCMS-NFS/R1/FNF/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection-R1',
//           'projects/USFS/LCMS-NFS/R1/FNF/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection-v2019-3',
//           'projects/USFS/LCMS-NFS/R1/FNF/Base-Learners/LANDTRENDR-Collection-fmask-allL7',
//           // 'projects/USFS/LCMS-NFS/R1/Base-Learners/LANDTRENDR-Collection',
//           'projects/USFS/LCMS-NFS/R1/Base-Learners/Harmonic-Coefficients',
//           fnfStudyAreas,
//           'projects/USFS/LCMS-NFS/R1/FNF/TimeSync/FNF_Prob_Checks_TimeSync_Annualized_Table',
//           fnf_study_area,
//          'landtrendr_vertex_format'
//           ],

//   'BTNF':[
//   // 'projects/USFS/LCMS-NFS/R4/Composites/R4-Composite-Collection',
//         'projects/USFS/LCMS-NFS/R4/Composites/Composite-Collection-fmask-allL7',
//         // 'projects/USFS/LCMS-NFS/R4/BT/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection-TRA',
//         'projects/USFS/LCMS-NFS/R4/BT/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection-v2019-3',
//         // 'projects/USFS/LCMS-NFS/R4/Base-Learners/LANDTRENDR-Collection',
//         'projects/USFS/LCMS-NFS/R4/Base-Learners/LANDTRENDR-Collection-fmask-allL7',
//         'projects/USFS/LCMS-NFS/R4/Base-Learners/Harmonic-Coefficients',
//         btStudyAreas,
//         'projects/USFS/LCMS-NFS/R4/BT/TimeSync/BT_Prob_Checks_TimeSync_Annualized_Table',
//         // 'projects/USFS/LCMS-NFS/R4/BT/TetonRiskExtent'
//         bt_study_area,
//         'landtrendr_vertex_format'
//         ],

//   'MLSNF':[
//         // 'projects/USFS/LCMS-NFS/R4/Composites/R4-Composite-Collection',
//         'projects/USFS/LCMS-NFS/R4/Composites/Composite-Collection-fmask-allL7',
//         // 'projects/USFS/LCMS-NFS/R4/MLS/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection',
//         'projects/USFS/LCMS-NFS/R4/MLS/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection-v2019-3',
//         // 'projects/USFS/LCMS-NFS/R4/Base-Learners/LANDTRENDR-Collection',
//         'projects/USFS/LCMS-NFS/R4/Base-Learners/LANDTRENDR-Collection-fmask-allL7',
//         'projects/USFS/LCMS-NFS/R4/Base-Learners/Harmonic-Coefficients',
//         mslStudyAreas,
//         'projects/USFS/LCMS-NFS/R4/MLS/TimeSync/MLS_TimeSync_Annualized_Table',
//         // 'projects/USFS/LCMS-NFS/R4/BT/TetonRiskExtent'
//         mls_study_area,
//         'landtrendr_vertex_format'
//         ],
//     'R4':[
//         // 'projects/USFS/LCMS-NFS/R4/Composites/R4-Composite-Collection',
//         'projects/USFS/LCMS-NFS/R4/Composites/Composite-Collection-fmask-allL7',
//         // 'projects/USFS/LCMS-NFS/R4/MLS/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection',
//         'projects/USFS/LCMS-NFS/R4/Landcover-Landuse-Change/R4_all_epwt_annualized',
//         // 'projects/USFS/LCMS-NFS/R4/Base-Learners/LANDTRENDR-Collection',
//         'projects/USFS/LCMS-NFS/R4/Base-Learners/LANDTRENDR-Collection-fmask-allL7',
//         'projects/USFS/LCMS-NFS/R4/Base-Learners/Harmonic-Coefficients',
//         R4StudyAreas,
//         'projects/USFS/LCMS-NFS/R4/MLS/TimeSync/MLS_TimeSync_Annualized_Table',
//         // 'projects/USFS/LCMS-NFS/R4/BT/TetonRiskExtent'
//         R4_official,
//         'landtrendr_vertex_format'
//         ],
//   'CNFKP':['projects/USFS/LCMS-NFS/R10/CK/Composites/Composite-Collection-cloudScoreTDOM2',
//             'projects/USFS/LCMS-NFS/R10/CK/Landcover-Landuse-Change/Landcover-Landuse-Change-Collection',
//             'projects/USFS/LCMS-NFS/R10/CK/Base-Learners/LANDTRENDR-Collection2019',
//         //'projects/USFS/LCMS-NFS/R4/Base-Learners/LANDTRENDR-Collection',
//         'N/A',
//         ckStudyAreas,
//         'projects/USFS/LCMS-NFS/R10/CK/TimeSync/CK_TimeSync_Annualized_Table',
//         ck_study_area,
//         'landtrendr_vertex_format'
//         ]
  
// }
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
var idsEndYear = 2019;
var idsMinYear = 1997;
var idsMaxYear = 2019;
function getIDSCollection(){
  if(startYear > idsMinYear && startYear <= idsMaxYear){idsStartYear = startYear}
    else{idsStartYear = idsMinYear}
  if(endYear < idsMaxYear && endYear >= idsMinYear){idsEndYear = endYear}  
    else{idsEndYear = idsMaxYear}
  console.log('IDS Years:');console.log(idsStartYear);console.log(idsEndYear);
  var idsFolder = 'projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/IDS';
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
  var nlcdYears = [2001,2004,2006,2008,2011,2013,2016];
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
  var nlcd = ee.ImageCollection('USGS/NLCD').select([0],['NLCD Landcover']);

  var nlcdC = nlcdYears.map(function(nlcdYear){
      // if(nlcdYear >= startYear  && nlcdYear <= endYear){
        var nlcdT = nlcd.filter(ee.Filter.calendarRange(nlcdYear,nlcdYear,'year')).mosaic();
        nlcdT = nlcdT.set('system:time_start',ee.Date.fromYMD(nlcdYear,6,1).millis());
        return nlcdT;
      });
  nlcdC = ee.ImageCollection(nlcdC);
  var chartTableDict = {
    'NLCD Landcover':nlcdLCQueryDict
  }
  nlcdC =  nlcdC.set('bounds',clientBoundsDict.All).set('chartTableDict',chartTableDict);
  return {'collection':nlcdC,'years':nlcdYears,'palette':nlcdLCPalette,'vizDict':nlcdLCVizDict,'queryDict':nlcdLCQueryDict,'legendDict':nlcdLegendDict,'legendDictReverse':nlcdLegendDictReverse,'min':nlcdLCMin,'max':nlcdLCMax}
}
 
function getMTBSAndNLCD(studyAreaName,whichLayerList,showSeverity){
  if(showSeverity === null || showSeverity === undefined){showSeverity = false};
  if(mtbsSummaryMethod === null || mtbsSummaryMethod === undefined){mtbsSummaryMethod = 'Highest-Severity'}
 
    var mtbs_path = 'projects/USFS/DAS/MTBS/BurnSeverityMosaics';
 
  var mtbsEndYear = endYear;
  if(endYear > 2017){mtbsEndYear = 2017}

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
      if(nlcdYear >= startYear  && nlcdYear <= mtbsEndYear){
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
          }
      
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
  var nlcd = ee.ImageCollection('USGS/NLCD');
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
                [2015,2017]];

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
  var hansen = ee.Image('UMD/hansen/global_forest_change_2018_v1_6');
  var hansenClientBoundary = {"type":"Polygon","coordinates":[[[-180,-90],[180,-90],[180,90],[-180,90],[-180,-90]]]};//hansen.geometry().bounds(1000).getInfo();
  // print(hansenClientBoundary);
  var hansenLoss = hansen.select(['lossyear']).add(2000).int16();
  var hansenStartYear = 2001;
  var hansenEndYear = 2018;

  if(startYear > hansenStartYear){hansenStartYear = startYear};
  if(endYear < hansenEndYear){hansenEndYear = endYear};
  var hansenYears = ee.List.sequence(hansenStartYear,hansenEndYear);
  var hansenC =ee.ImageCollection.fromImages(hansenYears.map(function(yr){
    yr = ee.Number(yr);
    var t = ee.Image(yr).updateMask(hansenLoss.eq(yr)).set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
    return t;
  }));
  var hansenYearsCli = hansenYears.getInfo();
  Map2.addTimeLapse(hansenC,{min:startYear,max:endYear,palette:declineYearPalette,years:hansenYearsCli},'Hansen Loss Time Lapse',false,null,null,'Hansen Global Forest Change year of loss',whichLayerList)
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


