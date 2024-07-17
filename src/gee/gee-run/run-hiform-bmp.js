
function runHiForm2() {
    console.log("here");
   
    var geometry = ee.Geometry.Polygon([
      [
        [-144.3255524330655, 60.61876843815859],
        [-144.353018253378, 60.68876359853027],
        [-144.5233063393155, 60.70758247382545],
        [-144.528799503378, 60.597200855879905],
      ],
    ]);
   
    let comp = getImagesLib
      .getProcessedSentinel2Scenes(geometry, 2024, 2024, 160, 190)
      .median();
   
    Map.addLayer(comp, getImagesLib.vizParamsFalse, "Comp");
   
    Map.centerObject(geometry);
   
    Map.addExport(
      comp
   
        .select(["blue", "green", "red", "nir", "swir1", "swir2"])
        .multiply(10000)
        .int16(),
      "comp_test",
      30,
      false,
      {},
      -32768
    );
   
    Map.addExport(geometry, "geo_test", null, false);
   
    let threshs = [0, 0.2, 0.5, 0.8];
    let categorires = [];
    let ti = 1;
    threshs.map((t) => {
      categorires.push(
        ee
          .Image(0)
          .where(comp.select(["NDVI"]).gte(t), ti)
          .byte()
      );
      ti++;
    });
    categorires = ee.ImageCollection(categorires).max().selfMask();
   
    Map.addLayer(
      categorires,
      { min: 1, max: 5, palette: "F00,080" },
      "NDVI Categories"
    );
    Map.turnOnInspector();
    let v = categorires.reduceToVectors({
      geometry: geometry,
      scale: 20,
      crs: "EPSG:32608",
      bestEffort: true,
      maxPixels: 1e13,
      tileScale: 4,
      geometryInNativeProjection: true,
    });
   
    Map.addExport(v, "ndvi_categories", null, true);
    Map.addLayer(v, {}, "NDVI Categories Vectors");
    Map.addLayer(geometry, {}, "Study Area");
  }


function runHiForm() {

    var region8_fps = ["01", "05", "12", "13", "21", "22", "28", "37", "40", "45", "47", "48", "51"]
    var region8 = ee.FeatureCollection('TIGER/2018/Counties').filter(ee.Filter.inList("STATEFP", region8_fps));
    // var generalized_counties = ee.FeatureCollection('users/timberharvestmap/cb_2022_us_county_5m_southeast');
    Map.addLayer(region8, {strokeColor: 'FFF', strokeWeight: 1.5, layerType:'geeVectorImage'}, 'US Counties', true);


    ///// Add Reference Layers to HiForm Related Layers List

    // Streams
    // var streams = ee.Image('users/timberharvestmap/nhd_ga');  // change this 'ga' to your 2-letter state abbrev, lowercase
    //{palette: ['0700d6']}
    //var streams = ee.ImageCollection("GLCF/GLS_WATER");
    //Map.addLayer(streams, {}, 'Streams', false, null, null, `Test`, "related-layer-list");

    // % Slope
    var dataset = ee.Image('USGS/3DEP/10m');
    var elevation = dataset.select('elevation');
    var slope = ee.Terrain.slope(elevation);
    var percent_slope = slope.divide(180).multiply(Math.PI).tan().multiply(100).rename('percent').round();
    var slopeVisParam = {
        min: 0.0,
        max: 100,
        bands: ["percent"],
        opacity: 1,
        palette: ["9aa15d", "b9cc6c", "d6e21f", "fff705", "ffd611", "ffb613", "ff8b13", "ff6e08", "ff500d", "ff0000", "de0101", "c21301", "970000", "6a0b0b", "4f5854", "77857f", "9bada5", "ac90af", "8d62c4", "582897"],
        addToLegend: true,
        layerType: "geeImage"
    }
    Map.addLayer(percent_slope, slopeVisParam, `Percent Slope`, false, null, null, `Test`, "related-layer-list");

    // Hillshade
    var dataset = ee.Image('USGS/3DEP/10m');
    var elevation = dataset.select('elevation');
    var hillshade = ee.Terrain.hillshade(elevation);
    var hillshadeVisParam = {
        min: 0.0,
        max: 255.0,
        gamma: 0.50,
        opacity: 0.50
    }
    Map.addLayer(hillshade, hillshadeVisParam, `Hillshade`, false, null, null, `Test`, "related-layer-list");

    // Floodplain

    var floodplains = ee.Image('users/timberharvestmap/floodplains_eastern_epaeast');
    Map.addLayer(floodplains, {palette: ['0700d6']}, 'Floodplains (Bottomland Hardwoods)', false, null, null, `Test`, "related-layer-list");

}

function hiform_bmp_process() {

    var geometry = urlParams.selectedCounty;
    var geoBounds = geometry.geometry().bounds();

    console.log("Running HiForm BMP Process with Parameters")
    console.log(urlParams.preDate1, urlParams.preDate2, urlParams.postDate1, urlParams.postDate2)

    /////////////////////////////////////////////////////////
    // Load a Sentinel2 pre-disturbance image
    /////////////////////////////////////////////////////////

    // var pre = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
    //     //.filterDate('2022-05-21', '2022-08-21')
    //     .filterDate(urlParams.preDate1, urlParams.preDate2)
    //     .filterBounds(geoBounds);

    // console.log(pre.size().getInfo())
    var preDate1 = new Date(urlParams.preDate1)
    var preDate2 = new Date(urlParams.preDate2)

    preStartJulian = parseInt(ee.Date(urlParams.preDate1).format('DDD').getInfo())
    preEndJulian = parseInt(ee.Date(urlParams.preDate2).format('DDD').getInfo())
    
    console.log(preDate1.getYear() + 1900, preDate2.getYear() + 1900, preStartJulian, preEndJulian)

    var pre = getImagesLib.getProcessedSentinel2Scenes({
        studyArea: geoBounds,
        startYear: preDate1.getYear() + 1900,
        endYear: preDate2.getYear() + 1900,
        startJulian: preStartJulian,
        endJulian: preEndJulian,
        convertToDailyMosaics: false,
        applyTDOM: false,
        applyCloudScorePlus: true,
        applyCloudProbability: false,
        toaOrSA: urlParams.correctionTypeOption
      });

    // Add NDVI and DATE as separate bands to image layer stack
    var addNDVI = function(pre) {
        var ndvi = pre.normalizedDifference(['nir', 'red']).rename('NDVI');
        return pre.addBands(ndvi);
    };

    function addDate(pre){
        var date = ee.Date(pre.get('system:time_start'));
        var dateString = date.format('yyyyMMdd');
        var dateNumber = ee.Number.parse(dateString);
        var dateBand = ee.Image(dateNumber).uint32().rename('date');
    return pre.addBands(dateBand);}

    var pre2 = pre.map(addNDVI).map(addDate); 

    // "greenest" is for max ndvi value compositing of multiple dates
    var greenest_pre2 = pre2.qualityMosaic('NDVI');

    // Perform clip on larger extent 'bounds' image to geometry or shapefile 
    var greenest_pre2_clip = greenest_pre2.clip(geometry);

    // Display the 'pre' date raster with random colors
    // Map.addLayer(greenest_pre2_clip.select('date').randomVisualizer(), {addToLegend: false, layerType: 'geeImage'}, 'Pre Date Raster', false);
    
    //  Display pre products
    Map.addLayer(greenest_pre2_clip, vizParamsTrue, 'Pre Natural Color Composite', false);

    /////////////////////////////////////////////////////////
    // Load a Sentinel2 post-disturbance image
    /////////////////////////////////////////////////////////

    // var post = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
    //     //.filterDate('2023-07-21', '2023-09-21') //  1yr growing season baseline, DEFAULT
    //     // .filterDate('2022-05-01', '2022-06-21') //  within growing season baseline, display the pre natural color to look for cloud contamination
    //     .filterDate(urlParams.postDate1, urlParams.postDate2)
    //     .filterBounds(geoBounds);

    var postDate1 = new Date(urlParams.postDate1)
    var postDate2 = new Date(urlParams.postDate2)

    postStartJulian = parseInt(ee.Date(urlParams.postDate1).format('DDD').getInfo())
    postEndJulian = parseInt(ee.Date(urlParams.postDate2).format('DDD').getInfo())
    

    var post = getImagesLib.getProcessedSentinel2Scenes({
        studyArea: geoBounds,
        startYear: postDate1.getYear() + 1900,
        endYear: postDate2.getYear() + 1900,
        startJulian: postStartJulian,
        endJulian: postEndJulian,
        convertToDailyMosaics: false,
        applyTDOM: false,
        applyCloudScorePlus: true,
        applyCloudProbability: false,
        toaOrSA: urlParams.correctionTypeOption
        });

    // Add NDVI and DATE as separate bands to image layer stack
    var addNDVI = function(post) {
    var ndvi = post.normalizedDifference(['nir', 'red']).rename('NDVI');
    return post.addBands(ndvi);
    };

    function addDate(img){
        var date = ee.Date(img.get('system:time_start'));
        var dateString = date.format('yyyyMMdd');
        var dateNumber = ee.Number.parse(dateString);
        var dateBand = ee.Image(dateNumber).uint32().rename('date');
    return img.addBands(dateBand);}

    var post2 = post.map(addNDVI).map(addDate); 

    // Make a "greenest" pixel composite.
    var greenest_post2 = post2.qualityMosaic('NDVI');

    // Perform clip on larger extent 'bounds' image to geometry or shapefile
    var greenest_post2_clip = greenest_post2.clip(geometry); 

    // Display the 'post' date raster with random colors
    // Map.addLayer(greenest_post2_clip.select('date').randomVisualizer(), {addToLegend: false, layerType: 'geeImage'}, 'Post Date Raster', false);


    //  Display post products
    Map.addLayer(greenest_post2_clip, vizParamsTrue, 'Post Natural Color Composite', false); 
    
    Map.addExport(
        greenest_post2_clip.select(['red', 'blue', 'green']).multiply(10000).int16(),
        `Post_Natural_Color_Composite`,
        10,
        false,
        {}
      );
    
    
    // /////////////////////////////////////////////////////////
    // // Calculate Absolute NDVI Change
    // ////////////////////////////////////////////////////////

    // //    Perform absolute change NDVI image differencing
    var postMINUSpre = (greenest_post2_clip.subtract(greenest_pre2_clip));

    ////////   ABS NDVI CHANGE rescale to signed integer 8bit (-127 - 127) to reduce file size
    var absNDVIc = (postMINUSpre.select('NDVI'));
    //print (pcNDVI,'pcNDVI');

    var absNDVIc_x100 = absNDVIc.multiply(100); 

    //print(absNDVIc_x100,'absNDVIc_x100');

    var absNDVIc_x100sint8 = absNDVIc_x100.int8();
    //Map.addLayer(absNDVIc_x100sint8, {min: -38, max:19}, 'absNDVIc_x100sint8', false);

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //////  ASSIGN PRIOR GROWING SEASON PERIOD FOR SUMMER MAX COMPOSITING
    //////////////////////////////////////////////////////////////////////////////////////////////////////

    // var gsmax = ee.ImageCollection('COPERNICUS/S2_HARMONIZED') 
    // //var gsmax = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') 
    // //var gsavg = ee.ImageCollection('COPERNICUS/S2_HARMONIZED') // use average/mean on single dates


    // .filterDate('2022-05-01', '2022-09-21')
    // //.filterDate('2020-06-01', '2020-09-21')

    //.filterBounds(geoBounds);

    var gsmax = getImagesLib.getProcessedSentinel2Scenes({
        studyArea: geoBounds,
        startYear: 2022,
        endYear: 2022,
        startJulian: 121,
        endJulian: 244,
        convertToDailyMosaics: false,
        applyTDOM: false,
        applyCloudScorePlus: true,
        applyCloudProbability: false,
        toaOrSA: urlParams.correctionTypeOption
        });

    //print(gsmax,"gsmax");
    //print(gsavg,"gsavg");

    // Add NDVI and DATE as separate bands to image layer stack(s)
    var addNDVI = function(gsmax) {
    var ndvi = gsmax.normalizedDifference(['B8', 'B4']).rename('NDVI');
    return gsmax.addBands(ndvi);
    };

    // var addNDVI = function(gsavg) {
    //   var ndvi = gsavg.normalizedDifference(['B8', 'B4']).rename('NDVI');
    //   return gsavg.addBands(ndvi);
    // };

    function addDate(img){
    var date = ee.Date(img.get('system:time_start'));
    var dateString = date.format('yyyyMMdd');
    var dateNumber = ee.Number.parse(dateString);
    var dateBand = ee.Image.constant(dateNumber).uint32().rename('date');
    return img.addBands(dateBand);}

    var withNDVIDATE_gsmax = gsmax.map(addDate); 
    //var withNDVIDATE_gsavg = gsavg.map(addNDVI).map(addDate); 

    // Lists 'collection return' to console with NDVI and DATE band added
    //print (withNDVIDATE_gsmax, 'withNDVIDATE_gsmax');
    //print (withNDVIDATE_gsavg, 'withNDVIDATE_gsavg');

    // "greenest" is for max ndvi value compositing of multiple dates
    var greenest_withNDVIDATE_gsmax = withNDVIDATE_gsmax.qualityMosaic('NDVI');

    // var greenest_withNDVIDATE_gsavg = withNDVIDATE_gsavg.mean();
    // print (greenest_withNDVIDATE_gsavg, 'greenest_withNDVIDATE_gsavg');
    // print (greenest_withNDVI_gsmax_winter, 'greenest_withNDVI_gsmax_winter');

    //Map.addLayer(greenest_withNDVIDATE_gsmax_winter.select(['B8', 'B4', 'B3']), {min: 341, max: 3649}, 'gsmax CIR gsmax-clip'); 

    // Perform clip on larger extent 'bounds' image to geometry or shapefile 
    var greenest_withNDVIDATE_gsmax_clip = greenest_withNDVIDATE_gsmax.clip(geometry);

    //Map.addLayer(greenest_withNDVIDATE_gsavg_clip.select(['B8', 'B4', 'B3']), {}, 'cir gsavg ndvi mean clip'); 

    // //  Display the the date raster
    // //Map.addLayer(greenest_withNDVIDATE_gsmax_winter_clip.select('date').randomVisualizer(), {}, 'gsmax date raster random colors');
    // //Map.addLayer(withNDVI_gsmax_winter_clip.select(['NDVI']), {min: -0.57, max: 0.78}, 'withNDVIDATE_gsmax_winter_clip NDVI b&w');
    // // Map.addLayer(greenest_withNDVIDATE_gsmax_clip.select(['B4', 'B3', 'B2']), {min: 100, max: 1500}, 'gsmax TCC', false); 

    // //Export.image.toDrive({image: greenest_withNDVIDATE_gsmax_winter_clip.select(['B2', 'B3', 'B4', 'B8']),description: 'name',region:geometry,'scale':10, 'maxPixels':1e13});

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////   ASSIGN PRIOR WINTER SEASON PERIOD FOR THE LEAF-OFF SEASON MAX
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    // var winmax = ee.ImageCollection('COPERNICUS/S2_HARMONIZED') 
    // //var winmax = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')

    // .filterDate('2022-01-01', '2022-03-15')
    // //.filterDate('2020-01-01', '2020-03-01')  

    // .filterBounds(geoBounds);


    var winmax = getImagesLib.getProcessedSentinel2Scenes({
        studyArea: geoBounds,
        startYear: 2022,
        endYear: 2022,
        startJulian: 1,
        endJulian: 74,
        convertToDailyMosaics: false,
        applyTDOM: false,
        applyCloudScorePlus: true,
        applyCloudProbability: false,
        toaOrSA: urlParams.correctionTypeOption
        });

    //print(winmax,"winmax");

    ////// Add NDVI as a band named NDVI to image layer stacks
    var addNDVI = function(winmax) {
    var ndvi = winmax.normalizedDifference(['B8', 'B4']).rename('NDVI');
    return winmax.addBands(ndvi);
    };

    function addDate(img){
    var date = ee.Date(img.get('system:time_start'));
    var dateString = date.format('yyyyMMdd');
    var dateNumber = ee.Number.parse(dateString);
    var dateBand = ee.Image.constant(dateNumber).uint32().rename('date');
    return img.addBands(dateBand);}

    var withNDVIDATE_winmax = winmax.map(addDate); 


    // // Lists 'collection return' to console with NDVI layer added to band stack
    //print (withNDVIDATE_winmax, 'withNDVIDATE_winmax'); 

    // Make a "greenest" pixel composite.
    var greenest_withNDVIDATE_winmax = withNDVIDATE_winmax.qualityMosaic('NDVI');
    //var greenest_withNDVIDATE_winavg = withNDVIDATE_winavg.mean();

    // print (greenest_withNDVI_winmax, 'withNDVI_winmax');

    // Perform clip on larger extent 'bounds' image to geometry or shapefile 
    var greenest_withNDVIDATE_winmax_clip = greenest_withNDVIDATE_winmax.clip(geoBounds); 

    // Display the date raster with random colors.
    //Map.addLayer(greenest_withNDVIDATE_winmax_winter_clip.select('date').randomVisualizer(), {}, 'winmax date');

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // // CALCULATE ABSOLUTE NDVI RANGE - SUMMER TO WINTER
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////

    //    Perform absolute change NDVI image differencing
    var gsmaxMINUSwinmax = (greenest_withNDVIDATE_gsmax_clip.subtract(greenest_withNDVIDATE_winmax_clip));
    //print(gsmaxMINUSwinmax,'gsmaxMINUSwinmax');

    var ADD_gsmaxMINUSwinmax = (greenest_withNDVIDATE_gsmax_clip.add(greenest_withNDVIDATE_winmax_clip));
    //print(ADD_gsmaxMINUSwinmax,'ADD_gsmaxMINUSwinmax');

    var mean_ST = ADD_gsmaxMINUSwinmax.multiply(0.5);
    //print(mean_ST,'mean_ST');

    //rescale NDVI

    var mean_ST2 = (mean_ST.select('NDVI'));
    var mean_ST2_x100 = mean_ST2.multiply(100); 
    var mean_ST2_x100sint8 = mean_ST2_x100.int8();
    //print(mean_ST2_x100sint8,'mean_ST2_x100sint8');

    ////Map.addLayer(mean_ST2_x100sint8.select('NDVI'), imageVisParam3, 'mean_ST2_x100sint8');
    //Map.addLayer(mean_ST.select(['B4', 'B3', 'B2']), {min: 360, max: 2160, gamma: 1.5}, 'meanST nat color', false); 
    //Map.addLayer(mean_ST2_x100sint8.select('NDVI'), {}, 'find bin break mean_ST2_x100sint8', false);

    var mean_ST2_x100sint8_binned = mean_ST2_x100sint8.select(['NDVI']).gte(45);
    //Map.addLayer(mean_ST2_x100sint8_binned, {}, 'binned break', false);

    var mean_ST2_x100sint8_binnedMASK = mean_ST2_x100sint8_binned.mask(mean_ST2_x100sint8_binned);
    // print(mean_ST2_x100sint8_binnedMASK,'mean_ST2_x100sint8_binnedMASK');
    // Map.addLayer(mean_ST2_x100sint8_binnedMASK, {}, 'mean_ST2_x100sint8_binnedMASK', false);

    //////   rescale to signed integer 8bit (-127 - 127) to reduce file size
    var range = (gsmaxMINUSwinmax.select('NDVI'));

    var range_x100 = range.multiply(100); 
    //print(range_x100,'range_x100');

    var range_x100sint8 = range_x100.int8();
    //print(range_x100sint8,'range_x100sint8');

    //Map.addLayer(range_x100sint8, {min: -7, max: 58}, 'range_x100sint8');

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var sld_intervals = get_sld_intervals()

    ////////////////////////////////////////////////////////////////////
    // bring in 2019 NLCD - define 4 forest classes = forest2019
    ///////////////////////////////////////////////////////////////////

    var dataset = ee.ImageCollection('USGS/NLCD_RELEASES/2019_REL/NLCD');
    var nlcd2019 = dataset.filter(ee.Filter.eq('system:index', '2019')).first();
    var nlcd_2019_landcover_img = nlcd2019.select('landcover');

    var forest2019 =  nlcd_2019_landcover_img.eq(41).or(nlcd_2019_landcover_img.eq(42)).or(nlcd_2019_landcover_img.eq(43)).or(nlcd_2019_landcover_img.eq(90));
    var pineforest2019 =  nlcd_2019_landcover_img.eq(42).or(nlcd_2019_landcover_img.eq(43));
    var hwdforest2019 =  nlcd_2019_landcover_img.eq(41).or(nlcd_2019_landcover_img.eq(90));

    // all 4-forest classes
    var nlcd_wild = nlcd_2019_landcover_img.eq(41).or(nlcd_2019_landcover_img.eq(42)).or(nlcd_2019_landcover_img.eq(43)).or(nlcd_2019_landcover_img.eq(90));
    var nlcd_wild_mask = nlcd_wild.mask(nlcd_wild);
    var mST = mean_ST2_x100sint8_binned;
    var mST_mask = mean_ST2_x100sint8_binned.mask(mean_ST2_x100sint8_binned);
    // var evgrn_range_x100sint8_mask = evgrn_range_x100sint8.mask(evgrn_range_x100sint8);
    // var dec_range_x100sint8_mask = dec_range_x100sint8.mask(dec_range_x100sint8);

    // var eg_2masks = nlcd_wild.mask(nlcd_wild).mask(evgrn_range_x100sint8.mask(evgrn_range_x100sint8));
    // var eg_3masks = eg_2masks.mask(mST);
    // var dec_2masks = nlcd_wild.mask((nlcd_wild).mask(dec_range_x100sint8.mask(dec_range_x100sint8)));
    // var dec_3masks = dec_2masks.mask(mST);

    // Map.addLayer(slope.mask(forest2019).clip(geometry), {min: 0, max: 60, palette: [ 
    //       '3ae237', 'b5e22e', 'd6e21f', 'fff705', 'ffd611', 'ffb613', 'ff8b13',
    //     'ff6e08', 'ff500d', 'ff0000', 'de0101', 'c21301', '0602ff', '235cb1',
    //     '307ef3', '269db1', '30c8e2', '32d3ef', '3be285', '3ff38f', '86e26f'
    //   ],
    // }, 'forested slopes ', false);

    // Map.addLayer(eg_3masks, {}, 'eg_3masks', false);
    // Map.addLayer(dec_3masks, {}, 'dec_3masks', false);
    // Map.addLayer(absNDVIc_x100sint8.sldStyle(sld_intervals).mask(eg_3masks), {}, 'abs eg_3masks', false);
    // Map.addLayer(absNDVIc_x100sint8.sldStyle(sld_intervals).mask(dec_3masks), {}, 'abs dec_3masks', false);

    // masking all 4-forest classes with meanST
    var nlcd4_mST_mask = nlcd_wild.mask(nlcd_wild).mask(mean_ST2_x100sint8_binned.mask(mean_ST2_x100sint8_binned));
    // Map.addLayer(nlcd_wild_mask, {}, 'nlcd_wild', false);
    // Map.addLayer(mST_mask, {}, 'mST_mask', false);
    // Map.addLayer(nlcd4_mST_mask, {}, 'nlcd4_mST_mask', false);

    //////////////////////////////////////
    ////  ABSOLUTE CHANGE
    //////////////////////////////////////
    Map.addLayer(absNDVIc_x100sint8.sldStyle(sld_intervals).clip(geoBounds), {layerType : 'geeImage'}, 'All-Lands NDVI Change', false);

    //Map.addLayer(absNDVIc_x100sint8.sldStyle(sld_intervals).mask(forest2019).clip(geometry), {}, 'forest ABS change', false);
    Map.addLayer(absNDVIc_x100sint8.sldStyle(sld_intervals).mask(nlcd4_mST_mask).clip(geoBounds), {layerType : 'geeImage'}, 'Forest NDVI Change', false);

    ////  Export forest-masked, photo-like RGB raster, pre-colorized, not editable on desktop
    //TODO: EXPORTING Export.image.toDrive({image: absNDVIc_x100sint8.sldStyle(sld_intervals).mask(nlcd4_mST_mask).clip(geometry), description: 'S2TOA_2bins_severeANDmoderate_1yrNDVIchange_092122_RGB_pre052121_072121_post072122_092122_v030923',region:geometry,'scale':10, 'maxPixels':1e13}); 

    ////  Export forest-masked, continuous value raster, requires color map, editable on desktop, threshold/isolate ndvi change values
    //Export.image.toDrive({image: absNDVIc_x100sint8.sldStyle(sld_intervals).mask(nlcd4_mST_mask).clip(geometry), description: 'S2SR_Harvests_HarrisCo_GA_1yrNDVIchange_092122_sINT8bit_pre072121_092121_post072122_092122_v030723',region:geometry,'scale':10, 'maxPixels':1e13}); 
    //    filename suggestion: sensor_subject_location_state_temporal_productformat_predates_postdates_versiondate

    // mask by Seasonal Thresholding (ST)
    //Map.addLayer(absNDVIc_x100sint8.sldStyle(sld_intervals).mask(dec_range_x100sint8).clip(geometry), {}, 'dec forest departure by ST', false);
    //Map.addLayer(absNDVIc_x100sint8.sldStyle(sld_intervals).mask(evgrn_range_x100sint8).clip(geometry), {}, 'evgrn-mixed forest departure by ST', false);

    // Export hybrid-forest-masked, photo-like RGB composite, pre-colorized
    //Export.image.toDrive({image: absNDVIc_x100sint8.sldStyle(sld_intervals).mask(decforest_mask).clip(geometry), description: 'S2TOA_H_Sally_091620_DecForest20162006_dNDVI_RGB_pre071520_091520_post091720_100420_v100620',region:geometry,'scale':10, 'maxPixels':1e13}); 
    //Export.image.toDrive({image: absNDVIc_x100sint8.sldStyle(sld_intervals).mask(evgrnforest_mask).clip(geometry), description: 'S2TOA_H_Sally_091620_EvgrnForest20162006_dNDVI_RGB_pre071520_091520_post091720_100420_v100620',region:geometry,'scale':10, 'maxPixels':1e13}); 
    //    filename suggestion -                               sensor-state-event-evdate-product-format-preimage-postimage-versiondate



    //////////////////////////////////////////////////////////////// 
    //////  MEDIUM-SEVERITY NDVI-departure value 'Thresholding of DN' (TDN) - can be applied to non-masked or masked, DN or RGB products
    ////////////////////////////////////////////////////////////////

    var forchange2 = absNDVIc_x100sint8.mask(nlcd4_mST_mask).clip(geoBounds); // DEFAULT, reports both evergreen and deciduous harvest combined
    // var forchange = absNDVIc_x100sint8.mask(eg_3masks).clip(geometry); // for evergreen harvest output
    // var forchange = absNDVIc_x100sint8.mask(dec_3masks).clip(geometry); // for deciduous harvest output, to make active remove the //, and comment-out line 876 with // at beginning of line

    //var forchange_tdn = forchange.mask(forchange.select(['NDVI']).lte(-20));
    var forchange_tdn2 = forchange2.mask((forchange2.select(['NDVI']).lte(-7)).and(forchange2.select(['NDVI']).gte(-19)));
    
    var tholdmask2 = forchange_tdn2.select(['NDVI']).lte(-7).and(forchange_tdn2.select(['NDVI']).gte(-19));
    //print(tholdmask,'tholdmask');
    //Map.addLayer(tholdmask2.clip(geometry), {}, 'Forest Thold mask', false); 

    // // Compute the number of pixels in each patch.
    // //var patchsize = tholdmask.connectedPixelCount(100, false);
    var patchsize2 = tholdmask2.connectedPixelCount(200, false);  // default 100
    // //Map.addLayer(patchsize, {palette: ['000000', 'FFFFFF']}, 'patch size qualifier', false);
    // var mmu = 50;
    // // var mmu2 = mmu+5;
    // // print(mmu2,'mmu2');

    // var patchsize = tholdmask.connectedPixelCount(mmu, false);
    //Map.addLayer(forchange_tdn.sldStyle(sld_intervals), {}, 'Forest Thold change RGB', false); 
    // Map.addLayer(forchange_tdn.mask().clip(geometry), {}, 'Forest Thold change'); 

    // Get rid of any patches that are less than 36 pixels.
    var patchsizeLarge2 = patchsize2.gte(200);  // 40pix = 1ac, 50pix = 0.5 ha
    patchsizeLarge2 = patchsizeLarge2.updateMask(patchsizeLarge2);
    // Map.addLayer(patchsizeLarge, {palette: ['000000', 'FFFFFF']}, 'patch size large binary', false);
    // print(patchsizeLarge,'patchsizeLarge');

    //////////////////////////////////////////////////////////////// 
    //////  Polygonize thresholding DN product
    ////////////////////////////////////////////////////////////////

    var zones2 = forchange_tdn2.lte(-7).and(forchange_tdn2.select(['NDVI']).gte(-19)).mask(patchsizeLarge2);
    zones2 = zones2.updateMask(zones2.neq(0));
    //print(zones,'zones');

    // Convert the zones of the thresholded change to vectors
    var vectors2 = zones2.addBands((forchange_tdn2)).reduceToVectors({
    geometry: geometry,
    crs: forchange_tdn2.projection(),
    scale: 10,
    geometryType: 'polygon',
    eightConnected: false,
    labelProperty: 'zone',
    reducer: ee.Reducer.mean(),
    maxPixels:1e13
    });

    //Map.addLayer(vectors2, {palette: 'FF2400'}, 'moderate NDVI change (black filled poly)', false);

    //  Add perim outlines to the map as img
    var fp2 = ee.FeatureCollection(vectors2);
    var empty2 = ee.Image().byte();
    var outline2 = empty2.paint({
        featureCollection: fp2, 
        color: 2,
        width: 1
    });
    Map.addLayer(vectors2, {strokeColor: '3DED97', strokeWeight: 1}, 'Moderate NDVI Change');

    Map.addExport(vectors2, "Moderate_NDVI_Change (Green Outline)", null, true);

    //Map.addLayer(vectors, {}, 'pslrg polyon vectors as fc');

    //Export.table.toDrive({collection: vectors, description: 'polys_large_patch_pine_thold', fileFormat: 'SHP'}); 

    // export polygon shapefile to google drive
    // TODO: EXISTING Export.table.toDrive({collection: vectors2, description: 'moderate_NDVI_change_polygons_SHAPEFILE', fileFormat: 'SHP'}); 
    // Export.table.toDrive({collection: vectors, description: 'al_autauga_2022_eg_harvest_3masks2_n20dNDVI_pt5ha_polys', fileFormat: 'SHP'}); 
    // Export.table.toDrive({collection: vectors, description: 'gfcD5_2022_dec_harvest_3masks2_n20dNDVI_pt5ha_polys', fileFormat: 'SHP'}); 

    // Compute centroids of each polygon

    var centroids2 = vectors2.map(function(f) {
    return f.centroid({maxError:1})});
    //Map.addLayer(centroids2, {color: 'green', layerType: 'geeImage'}, 'moderate NDVI decline (green points)', false);

    //print(centroids,'centroids');

    // Transform coordinates into properties in the table.
    var centroidsExport2 = centroids2.map(function (feature) {
    // Get geometry
    var coordinates2 = feature.geometry()
                            // Transform it to the desired EPSG code. Here WGS 84
                            .transform('epsg:4326')
                            // Get coordinates as a list
                            .coordinates();
    // Get both entries of coordinates and set them as new properties
    var resul2 = feature.set('long', coordinates2.get(0), 
                        'lat', coordinates2.get(1));
    // Remove geometry                   
    return resul2.setGeometry(null);
    });

    // TODO: EXISTING Export.table.toDrive({collection: centroids2, description: 'moderate_NDVI_change_centroids_SHAPEFILE', fileFormat: 'SHP'}); 
    // TODO: EXISTING Export.table.toDrive({collection: centroidsExport2,  selectors: ['lat', 'long'], description: 'moderate_NDVI_change_centroids_TEXTFILE', fileFormat: 'CSV'}); 

    //////////////////////////////////////////////////////////////// 
    //////  HIGH-SEVERITY NDVI-departure value 'Thresholding of DN' (TDN) - can be applied to non-masked or masked, DN or RGB products
    ////////////////////////////////////////////////////////////////

    var forchange = absNDVIc_x100sint8.mask(nlcd4_mST_mask).clip(geometry); // DEFAULT, reports both evergreen and deciduous harvest combined
    // var forchange = absNDVIc_x100sint8.mask(eg_3masks).clip(geometry); // for evergreen harvest output
    // var forchange = absNDVIc_x100sint8.mask(dec_3masks).clip(geometry); // for deciduous harvest output, to make active remove the //, and comment-out line 876 with // at beginning of line

    var forchange_tdn = forchange.mask(forchange.select(['NDVI']).lte(-20));
    // // var forchange_tdn = forchange.mask((forchange.select(['NDVI']).lt(-3)).and(forchange.select(['NDVI']).gt(-128)));
    
    var tholdmask = forchange_tdn.select(['NDVI']).lte(-20);
    //print(tholdmask,'tholdmask');
    //Map.addLayer(tholdmask.clip(geometry), {}, 'Forest Thold mask', false); 

    // // Compute the number of pixels in each patch.
    // //var patchsize = tholdmask.connectedPixelCount(100, false);
    var patchsize = tholdmask.connectedPixelCount(100, false);  // default 100
    // //Map.addLayer(patchsize, {palette: ['000000', 'FFFFFF']}, 'patch size qualifier', false);
    // var mmu = 50;
    // // var mmu2 = mmu+5;
    // // print(mmu2,'mmu2');

    // var patchsize = tholdmask.connectedPixelCount(mmu, false);
    //Map.addLayer(forchange_tdn.sldStyle(sld_intervals), {}, 'Forest Thold change RGB', false); 
    // Map.addLayer(forchange_tdn.mask().clip(geometry), {}, 'Forest Thold change'); 

    // Get rid of any patches that are less than 36 pixels.
    var patchsizeLarge = patchsize.gte(100);  // 40pix = 1ac, 50pix = 0.5 ha
    patchsizeLarge = patchsizeLarge.updateMask(patchsizeLarge);
    // Map.addLayer(patchsizeLarge, {palette: ['000000', 'FFFFFF']}, 'patch size large binary', false);
    // print(patchsizeLarge,'patchsizeLarge');

    //////////////////////////////////////////////////////////////// 
    //////  Polygonize thresholding DN product
    ////////////////////////////////////////////////////////////////

    var zones = forchange_tdn.lte(-20).mask(patchsizeLarge);
    zones = zones.updateMask(zones.neq(0));
    //print(zones,'zones');

    // Convert the zones of the thresholded change to vectors
    var vectors = zones.addBands((forchange_tdn)).reduceToVectors({
        geometry: geometry,
        crs: forchange_tdn.projection(),
        scale: 10,
        geometryType: 'polygon',
        eightConnected: false,
        labelProperty: 'zone',
        reducer: ee.Reducer.mean(),
        maxPixels: 1e13,
        tileScale: 4,
        geometryInNativeProjection: true,
    });

    //Map.addLayer(vectors, {palette: 'FF2400'}, 'severe NDVI change (clear cut?) (black filled poly)', false);

    //  Add perim outlines to the map as img
    var fp = ee.FeatureCollection(vectors);
    var empty = ee.Image().byte();
    var outline = empty.paint({
        featureCollection: fp, 
        color: 2,
        width: 1
    });
    //Map.addLayer(outline.clip(geometry), {palette: 'FF2400'}, 'severe NDVI change (red outline poly)');
    Map.addLayer(vectors, {strokeColor: 'FF2400', strokeWeight: 1}, 'Severe NDVI Change');
    
    Map.addExport(vectors, "Severe_NDVI_Change (Red Outline)", null, true);

    //Map.addLayer(vectors, {}, 'pslrg polyon vectors as fc');

    //Export.table.toDrive({collection: vectors, description: 'polys_large_patch_pine_thold', fileFormat: 'SHP'}); 

    // export polygon shapefile to google drive
    // TODO: EXISTING Export.table.toDrive({collection: vectors, description: 'severe_NDVI_change_polygons_SHAPEFILE', fileFormat: 'SHP'}); 
    // Export.table.toDrive({collection: vectors, description: 'al_autauga_2022_eg_harvest_3masks2_n20dNDVI_pt5ha_polys', fileFormat: 'SHP'}); 
    // Export.table.toDrive({collection: vectors, description: 'gfcD5_2022_dec_harvest_3masks2_n20dNDVI_pt5ha_polys', fileFormat: 'SHP'}); 

    // Compute centroids of each polygon

    var centroids = vectors.map(function(f) {
    return f.centroid({maxError:1})});
    //Map.addLayer(centroids, {color: 'red'}, 'severe NDVI change (red points)', false);

    //print(centroids,'centroids');

    // Transform coordinates into properties in the table.
    var centroidsExport = centroids.map(function (feature) {
    // Get geometry
    var coordinates = feature.geometry()
                            // Transform it to the desired EPSG code. Here WGS 84
                            .transform('epsg:4326')
                            // Get coordinates as a list
                            .coordinates();
    // Get both entries of coordinates and set them as new properties
    var resul = feature.set('long', coordinates.get(0), 
                        'lat', coordinates.get(1));
    // Remove geometry                   
    return resul.setGeometry(null);
    });

    // TODO: EXISTING Export.table.toDrive({collection: centroids, description: 'severe_NDVI_change_centroids_SHAPEFILE', fileFormat: 'SHP'}); 
    // TODO: EXISTING Export.table.toDrive({collection: centroidsExport,  selectors: ['lat', 'long'], description: 'severe_NDVI_change_centroids_TEXTFILE', fileFormat: 'CSV'});

    
}




function get_sld_intervals() {
    return sld_intervals = 
    '<RasterSymbolizer>' +
    '<ColorMap type="intervals" extended="false" >' +
    '<ColorMapEntry color="#000096" quantity="127" />' + //R 0;G 0 ;B 150; verydarkblue
    '<ColorMapEntry color="#000096" quantity="126" />' +
    '<ColorMapEntry color="#000096" quantity="125" />' +
    '<ColorMapEntry color="#000096" quantity="124" />' +
    '<ColorMapEntry color="#000096" quantity="123" />' +
    '<ColorMapEntry color="#000096" quantity="122" />' +
    '<ColorMapEntry color="#000096" quantity="121" />' +
    '<ColorMapEntry color="#000096" quantity="120" />' +
    '<ColorMapEntry color="#000096" quantity="119" />' +
    '<ColorMapEntry color="#000096" quantity="118" />' +
    '<ColorMapEntry color="#000096" quantity="117" />' +
    '<ColorMapEntry color="#000096" quantity="116" />' +
    '<ColorMapEntry color="#000096" quantity="115" />' +
    '<ColorMapEntry color="#000096" quantity="114" />' +
    '<ColorMapEntry color="#000096" quantity="113" />' +
    '<ColorMapEntry color="#000096" quantity="112" />' +
    '<ColorMapEntry color="#000096" quantity="111" />' +
    '<ColorMapEntry color="#000096" quantity="110" />' +
    '<ColorMapEntry color="#000096" quantity="109" />' +
    '<ColorMapEntry color="#000096" quantity="108" />' +
    '<ColorMapEntry color="#000096" quantity="107" />' +
    '<ColorMapEntry color="#000096" quantity="106" />' +
    '<ColorMapEntry color="#000096" quantity="105" />' +
    '<ColorMapEntry color="#000096" quantity="104" />' +
    '<ColorMapEntry color="#000096" quantity="103" />' +
    '<ColorMapEntry color="#000096" quantity="102" />' +
    '<ColorMapEntry color="#000096" quantity="101" />' +
    '<ColorMapEntry color="#000096" quantity="100" />' +
    '<ColorMapEntry color="#000096" quantity="99" />' +
    '<ColorMapEntry color="#000096" quantity="98" />' +
    '<ColorMapEntry color="#000096" quantity="97" />' +
    '<ColorMapEntry color="#000096" quantity="96" />' +
    '<ColorMapEntry color="#000096" quantity="95" />' +
    '<ColorMapEntry color="#000096" quantity="94" />' +
    '<ColorMapEntry color="#000096" quantity="93" />' +
    '<ColorMapEntry color="#000096" quantity="99" />' +
    '<ColorMapEntry color="#000096" quantity="98" />' +
    '<ColorMapEntry color="#000096" quantity="97" />' +
    '<ColorMapEntry color="#000096" quantity="96" />' +
    '<ColorMapEntry color="#000096" quantity="95" />' +
    '<ColorMapEntry color="#000096" quantity="94" />' +
    '<ColorMapEntry color="#000096" quantity="93" />' +
    '<ColorMapEntry color="#000096" quantity="92" />' +
    '<ColorMapEntry color="#000096" quantity="91" />' +
    '<ColorMapEntry color="#000096" quantity="90" />' +
    '<ColorMapEntry color="#000096" quantity="89" />' +
    '<ColorMapEntry color="#000096" quantity="88" />' +
    '<ColorMapEntry color="#000096" quantity="87" />' +
    '<ColorMapEntry color="#000096" quantity="86" />' +
    '<ColorMapEntry color="#000096" quantity="85" />' +
    '<ColorMapEntry color="#000096" quantity="84" />' +
    '<ColorMapEntry color="#000096" quantity="83" />' +
    '<ColorMapEntry color="#000096" quantity="82" />' +
    '<ColorMapEntry color="#000096" quantity="81" />' +
    '<ColorMapEntry color="#000096" quantity="80" />' +
    '<ColorMapEntry color="#000096" quantity="79" />' +
    '<ColorMapEntry color="#000096" quantity="78" />' +
    '<ColorMapEntry color="#000096" quantity="77" />' +
    '<ColorMapEntry color="#000096" quantity="76" />' +
    '<ColorMapEntry color="#000096" quantity="75" />' +
    '<ColorMapEntry color="#000096" quantity="73" />' +
    '<ColorMapEntry color="#000096" quantity="72" />' +
    '<ColorMapEntry color="#000096" quantity="71" />' +'<ColorMapEntry color="#000096" quantity="70" />' + //R 0;G 0 ;B 150; verydarkblue
    '<ColorMapEntry color="#000096" quantity="69" />' + 
    '<ColorMapEntry color="#000096" quantity="68" />' +
    '<ColorMapEntry color="#000096" quantity="67" />' +
    '<ColorMapEntry color="#000096" quantity="66" />' +
    '<ColorMapEntry color="#000096" quantity="65" />' +
    '<ColorMapEntry color="#000096" quantity="64" />' +
    '<ColorMapEntry color="#000096" quantity="63" />' +
    '<ColorMapEntry color="#000096" quantity="62" />' +
    '<ColorMapEntry color="#000096" quantity="62" />' +
    '<ColorMapEntry color="#000096" quantity="61" />' +
    '<ColorMapEntry color="#000096" quantity="60" />' +
    '<ColorMapEntry color="#000096" quantity="59" />' +
    '<ColorMapEntry color="#000096" quantity="58" />' +
    '<ColorMapEntry color="#000096" quantity="57" />' +
    '<ColorMapEntry color="#000096" quantity="56" />' +
    '<ColorMapEntry color="#000096" quantity="55" />' +
    '<ColorMapEntry color="#000096" quantity="54" />' +
    '<ColorMapEntry color="#000096" quantity="53" />' +
    '<ColorMapEntry color="#000096" quantity="52" />' +
    '<ColorMapEntry color="#000096" quantity="52" />' +
    '<ColorMapEntry color="#000096" quantity="51" />' +
    '<ColorMapEntry color="#000096" quantity="50" />' +
    '<ColorMapEntry color="#000096" quantity="49" />' +
    '<ColorMapEntry color="#000096" quantity="48" />' +
    '<ColorMapEntry color="#000096" quantity="47" />' +
    '<ColorMapEntry color="#000096" quantity="46" />' +
    '<ColorMapEntry color="#000096" quantity="45" />' +
    '<ColorMapEntry color="#000096" quantity="44" />' +
    '<ColorMapEntry color="#000096" quantity="43" />' +
    '<ColorMapEntry color="#000096" quantity="42" />' +
    '<ColorMapEntry color="#000096" quantity="42" />' +
    '<ColorMapEntry color="#000096" quantity="41" />' +
    '<ColorMapEntry color="#000096" quantity="40" />' +
    '<ColorMapEntry color="#000096" quantity="39" />' +
    '<ColorMapEntry color="#000096" quantity="38" />' +
    '<ColorMapEntry color="#000096" quantity="37" />' +
    '<ColorMapEntry color="#000096" quantity="36" />' +
    '<ColorMapEntry color="#000096" quantity="35" />' +
    '<ColorMapEntry color="#000096" quantity="34" />' +
    '<ColorMapEntry color="#000096" quantity="33" />' +
    '<ColorMapEntry color="#000096" quantity="32" />' +
    '<ColorMapEntry color="#000096" quantity="31" />' +
    '<ColorMapEntry color="#000096" quantity="30" />' +
    '<ColorMapEntry color="#000096" quantity="29" />' +
    '<ColorMapEntry color="#000096" quantity="28" />' +
    '<ColorMapEntry color="#000096" quantity="27" />' +
    '<ColorMapEntry color="#000096" quantity="26" />' +
    '<ColorMapEntry color="#0000FF" quantity="25" />' + //R 0;G 0 ;B 255; darkblue
    '<ColorMapEntry color="#0000FF" quantity="24" />' +
    '<ColorMapEntry color="#0000FF" quantity="23" />' +
    '<ColorMapEntry color="#0000FF" quantity="22" />' +
    '<ColorMapEntry color="#0000FF" quantity="22" />' +
    '<ColorMapEntry color="#0000FF" quantity="21" />' +
    '<ColorMapEntry color="#0000FF" quantity="20" />' + 
    '<ColorMapEntry color="#0000FF" quantity="19" />' +
    '<ColorMapEntry color="#0000FF" quantity="18" />' +
    '<ColorMapEntry color="#0000FF" quantity="17" />' +
    '<ColorMapEntry color="#0000FF" quantity="16" />' +
    '<ColorMapEntry color="#0000FF" quantity="15" />' +
    '<ColorMapEntry color="#0000FF" quantity="14" />' +
    '<ColorMapEntry color="#0000FF" quantity="13" />' +
    '<ColorMapEntry color="#0000FF" quantity="12" />' +
    '<ColorMapEntry color="#0000FF" quantity="11" />' +
    '<ColorMapEntry color="#0070FF" quantity="10" />' + //R 0;G 112 ;B 255; mediumblue
    '<ColorMapEntry color="#0070FF" quantity="09" />' +
    '<ColorMapEntry color="#0070FF" quantity="08" />' +
    '<ColorMapEntry color="#0070FF" quantity="07" />' +
    '<ColorMapEntry color="#0070FF" quantity="06" />' +
    '<ColorMapEntry color="#6EBFFF" quantity="05" />' + //R 110;G 190 ;B 255; lightblue
    '<ColorMapEntry color="#6EBFFF" quantity="04" />' +
    '<ColorMapEntry color="#6EBFFF" quantity="03" />' +
    '<ColorMapEntry color="#6EBFFF" quantity="02" />' +
    '<ColorMapEntry color="#6EBFFF" quantity="01" />' +
    '<ColorMapEntry color="#6EBFFF" quantity="00" />' +
    
    '<ColorMapEntry color="#6EBFFF" quantity="-01" />' +  // original, opt light blue to -3
    '<ColorMapEntry color="#6EBFFF" quantity="-02" />' +  // SPB - suggest use % dNDVI and blues to -1, greys begin at -2
    '<ColorMapEntry color="#6EBFFF" quantity="-03" />' +  // 
    
    // '<ColorMapEntry color="#ECECEC" quantity="-01" />' +  // optional light grey start at -1
    // '<ColorMapEntry color="#ECECEC" quantity="-02" />' +
    // '<ColorMapEntry color="#ECECEC" quantity="-03" />' +
    
    ////////  LEGEND GRAPHICS  /////////////////////////////////////////////////
    // https://drive.google.com/drive/folders/1GhX4BUNjrA6FWehs1aXi1Gl_fAqf_c5f?usp=sharing
    /////////////////////////////////////////////////////////////////////////
    
    '<ColorMapEntry color="#D2D2D2" quantity="-04" />' + //R 210;G 210;B 210; lightgrey
    '<ColorMapEntry color="#D2D2D2" quantity="-05" />' +
    '<ColorMapEntry color="#D2D2D2" quantity="-06" />' +
    '<ColorMapEntry color="#FFFFBE" quantity="-07" />' + //R 255;G 255;B 190; buffyellow
    '<ColorMapEntry color="#FFFFBE" quantity="-08" />' +
    '<ColorMapEntry color="#FFFFBE" quantity="-09" />' +
    '<ColorMapEntry color="#FFFF00" quantity="-10" />' + //R 255;G 255;B 0; brightyellow
    '<ColorMapEntry color="#FFFF00" quantity="-11" />' +
    '<ColorMapEntry color="#FFFF00" quantity="-12" />' +
    '<ColorMapEntry color="#FFD37F" quantity="-13" />' + //R 255;G 211;B 127; lightorange
    '<ColorMapEntry color="#FFD37F" quantity="-14" />' +
    '<ColorMapEntry color="#FFD37F" quantity="-15" />' +
    '<ColorMapEntry color="#FFAA00" quantity="-16" />' + //R 255;G 170;B 0; redorange
    '<ColorMapEntry color="#FFAA00" quantity="-17" />' +
    '<ColorMapEntry color="#FFAA00" quantity="-18" />' +
    '<ColorMapEntry color="#E64C00" quantity="-19" />' + //R 230;G 76;B 0; darkred
    '<ColorMapEntry color="#E64C00" quantity="-20" />' +
    '<ColorMapEntry color="#E64C00" quantity="-21" />' +
    '<ColorMapEntry color="#A80000" quantity="-22" />' + //R 168;G 0;B 0; verydarkred
    '<ColorMapEntry color="#A80000" quantity="-23" />' +
    '<ColorMapEntry color="#A80000" quantity="-24" />' +
    '<ColorMapEntry color="#A80000" quantity="-25" />' +
    '<ColorMapEntry color="#730000" quantity="-26" />' + //R 115;G 0;B 0; beet
    '<ColorMapEntry color="#730000" quantity="-27" />' +
    '<ColorMapEntry color="#730000" quantity="-28" />' +
    '<ColorMapEntry color="#730000" quantity="-29" />' +
    '<ColorMapEntry color="#343434" quantity="-30" />' + //R 52;G 52;B 52; slate
    '<ColorMapEntry color="#343434" quantity="-31" />' +
    '<ColorMapEntry color="#343434" quantity="-32" />' +
    '<ColorMapEntry color="#343434" quantity="-33" />' +
    '<ColorMapEntry color="#4C0073" quantity="-34" />' + //R 76;G 0;B 115; darkpurple
    '<ColorMapEntry color="#4C0073" quantity="-35" />' +
    '<ColorMapEntry color="#4C0073" quantity="-36" />' +
    '<ColorMapEntry color="#4C0073" quantity="-37" />' +
    '<ColorMapEntry color="#8400A8" quantity="-38" />' + //R 132;G 0;B 168; purple
    '<ColorMapEntry color="#8400A8" quantity="-39" />' +
    '<ColorMapEntry color="#8400A8" quantity="-40" />' +
    '<ColorMapEntry color="#8400A8" quantity="-41" />' +
    '<ColorMapEntry color="#8400A8" quantity="-42" />' +
    '<ColorMapEntry color="#8400A8" quantity="-43" />' +
    '<ColorMapEntry color="#8400A8" quantity="-44" />' +
    '<ColorMapEntry color="#8400A8" quantity="-45" />' +
    '<ColorMapEntry color="#8400A8" quantity="-46" />' +
    '<ColorMapEntry color="#8400A8" quantity="-47" />' +
    '<ColorMapEntry color="#8400A8" quantity="-48" />' +
    '<ColorMapEntry color="#8400A8" quantity="-49" />' +
    '<ColorMapEntry color="#8400A8" quantity="-50" />' +
    '<ColorMapEntry color="#8400A8" quantity="-51" />' +
    '<ColorMapEntry color="#8400A8" quantity="-52" />' +
    '<ColorMapEntry color="#8400A8" quantity="-53" />' +
    '<ColorMapEntry color="#8400A8" quantity="-54" />' +
    '<ColorMapEntry color="#8400A8" quantity="-55" />' +
    '<ColorMapEntry color="#8400A8" quantity="-56" />' +
    '<ColorMapEntry color="#8400A8" quantity="-57" />' +
    '<ColorMapEntry color="#8400A8" quantity="-58" />' +
    '<ColorMapEntry color="#8400A8" quantity="-59" />' +
    '<ColorMapEntry color="#8400A8" quantity="-60" />' +
    '<ColorMapEntry color="#8400A8" quantity="-61" />' +
    '<ColorMapEntry color="#8400A8" quantity="-62" />' +
    '<ColorMapEntry color="#8400A8" quantity="-63" />' +
    '<ColorMapEntry color="#8400A8" quantity="-64" />' +
    '<ColorMapEntry color="#8400A8" quantity="-65" />' +
    '<ColorMapEntry color="#8400A8" quantity="-66" />' +
    '<ColorMapEntry color="#8400A8" quantity="-67" />' +
    '<ColorMapEntry color="#8400A8" quantity="-68" />' +
    '<ColorMapEntry color="#8400A8" quantity="-69" />' +
    '<ColorMapEntry color="#8400A8" quantity="-70" />' +
    '<ColorMapEntry color="#8400A8" quantity="-71" />' +
    '<ColorMapEntry color="#8400A8" quantity="-72" />' +
    '<ColorMapEntry color="#8400A8" quantity="-73" />' +
    '<ColorMapEntry color="#8400A8" quantity="-75" />' +
    '<ColorMapEntry color="#8400A8" quantity="-76" />' +
    '<ColorMapEntry color="#8400A8" quantity="-77" />' +
    '<ColorMapEntry color="#8400A8" quantity="-78" />' +
    '<ColorMapEntry color="#8400A8" quantity="-79" />' +
    '<ColorMapEntry color="#8400A8" quantity="-80" />' +
    '<ColorMapEntry color="#8400A8" quantity="-81" />' +
    '<ColorMapEntry color="#8400A8" quantity="-82" />' +
    '<ColorMapEntry color="#8400A8" quantity="-83" />' +
    '<ColorMapEntry color="#8400A8" quantity="-84" />' +
    '<ColorMapEntry color="#8400A8" quantity="-85" />' +
    '<ColorMapEntry color="#8400A8" quantity="-86" />' +
    '<ColorMapEntry color="#8400A8" quantity="-87" />' +
    '<ColorMapEntry color="#8400A8" quantity="-88" />' +
    '<ColorMapEntry color="#8400A8" quantity="-89" />' +
    '<ColorMapEntry color="#8400A8" quantity="-90" />' +
    '<ColorMapEntry color="#8400A8" quantity="-91" />' +
    '<ColorMapEntry color="#8400A8" quantity="-92" />' +
    '<ColorMapEntry color="#8400A8" quantity="-93" />' +
    '<ColorMapEntry color="#8400A8" quantity="-94" />' +
    '<ColorMapEntry color="#8400A8" quantity="-95" />' +
    '<ColorMapEntry color="#8400A8" quantity="-96" />' +
    '<ColorMapEntry color="#8400A8" quantity="-97" />' +
    '<ColorMapEntry color="#8400A8" quantity="-98" />' +
    '<ColorMapEntry color="#8400A8" quantity="-99" />' +
    '<ColorMapEntry color="#8400A8" quantity="-93" />' +
    '<ColorMapEntry color="#8400A8" quantity="-94" />' +
    '<ColorMapEntry color="#8400A8" quantity="-95" />' +
    '<ColorMapEntry color="#8400A8" quantity="-96" />' +
    '<ColorMapEntry color="#8400A8" quantity="-97" />' +
    '<ColorMapEntry color="#8400A8" quantity="-98" />' +
    '<ColorMapEntry color="#8400A8" quantity="-99" />' +
    '<ColorMapEntry color="#8400A8" quantity="-100" />' +
    '<ColorMapEntry color="#8400A8" quantity="-101" />' +
    '<ColorMapEntry color="#8400A8" quantity="-102" />' +
    '<ColorMapEntry color="#8400A8" quantity="-103" />' +
    '<ColorMapEntry color="#8400A8" quantity="-104" />' +
    '<ColorMapEntry color="#8400A8" quantity="-105" />' +
    '<ColorMapEntry color="#8400A8" quantity="-106" />' +
    '<ColorMapEntry color="#8400A8" quantity="-107" />' +
    '<ColorMapEntry color="#8400A8" quantity="-108" />' +
    '<ColorMapEntry color="#8400A8" quantity="-109" />' +
    '<ColorMapEntry color="#8400A8" quantity="-110" />' +
    '<ColorMapEntry color="#8400A8" quantity="-111" />' +
    '<ColorMapEntry color="#8400A8" quantity="-112" />' +
    '<ColorMapEntry color="#8400A8" quantity="-113" />' +
    '<ColorMapEntry color="#8400A8" quantity="-114" />' +
    '<ColorMapEntry color="#8400A8" quantity="-115" />' +
    '<ColorMapEntry color="#8400A8" quantity="-116" />' +
    '<ColorMapEntry color="#8400A8" quantity="-117" />' +
    '<ColorMapEntry color="#8400A8" quantity="-118" />' +
    '<ColorMapEntry color="#8400A8" quantity="-119" />' +
    '<ColorMapEntry color="#8400A8" quantity="-120" />' +
    '<ColorMapEntry color="#8400A8" quantity="-121" />' +
    '<ColorMapEntry color="#8400A8" quantity="-122" />' +
    '<ColorMapEntry color="#8400A8" quantity="-123" />' +
    '<ColorMapEntry color="#8400A8" quantity="-124" />' +
    '<ColorMapEntry color="#8400A8" quantity="-125" />' +
    '<ColorMapEntry color="#8400A8" quantity="-126" />' +
    '<ColorMapEntry color="#8400A8" quantity="-127" />' +
    '</ColorMap>' +
    '</RasterSymbolizer>';
}
