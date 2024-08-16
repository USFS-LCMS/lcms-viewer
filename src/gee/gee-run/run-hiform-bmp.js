function runHiForm() {
  var region8_fps = [
    "01",
    "05",
    "12",
    "13",
    "21",
    "22",
    "28",
    "37",
    "40",
    "45",
    "47",
    "48",
    "51",
  ];
  var region8 = ee
    .FeatureCollection("TIGER/2018/Counties")
    .filter(ee.Filter.inList("STATEFP", region8_fps));
  // var generalized_counties = ee.FeatureCollection('users/timberharvestmap/cb_2022_us_county_5m_southeast');
  Map.addLayer(
    region8,
    { strokeColor: "FFF", strokeWeight: 1.5, canQuery: false },
    "US Counties",
    true,
    null,
    null,
    "US Counties to select from",
    "county-selection-layer-list"
  );

  ///// Add Reference Layers to HiForm Related Layers List

  // Streams
  // var streams = ee.Image('users/timberharvestmap/nhd_ga');  // change this 'ga' to your 2-letter state abbrev, lowercase
  //{palette: ['0700d6']}
  //var streams = ee.ImageCollection("GLCF/GLS_WATER");
  //Map.addLayer(streams, {}, 'Streams', false, null, null, `Test`, "related-layer-list");

  // % Slope
  var dataset = ee.Image("USGS/3DEP/10m");
  var elevation = dataset.select("elevation");
  var slope = ee.Terrain.slope(elevation);
  var percent_slope = slope
    .divide(180)
    .multiply(Math.PI)
    .tan()
    .multiply(100)
    .rename(["percent"])
    .round();
  var slopeVisParam = {
    min: 0.0,
    max: 100,

    opacity: 1,
    palette: [
      "9aa15d",
      "b9cc6c",
      "d6e21f",
      "fff705",
      "ffd611",
      "ffb613",
      "ff8b13",
      "ff6e08",
      "ff500d",
      "ff0000",
      "de0101",
      "c21301",
      "970000",
      "6a0b0b",
      "4f5854",
      "77857f",
      "9bada5",
      "ac90af",
      "8d62c4",
      "582897",
    ],
  };
  Map.addLayer(
    percent_slope.select(["percent"]),
    slopeVisParam,
    `Percent Slope`,
    false,
    null,
    null,
    `USGS 3DEP 10m percent slope`,
    "related-layer-list"
  );

  // Hillshade
  var dataset = ee.Image("USGS/3DEP/10m");
  var elevation = dataset.select("elevation");
  var hillshade = ee.Terrain.hillshade(elevation);
  var hillshadeVisParam = {
    min: 0.0,
    max: 255.0,
    gamma: 0.5,
    opacity: 0.5,
  };
  Map.addLayer(
    hillshade,
    hillshadeVisParam,
    `Hillshade`,
    false,
    null,
    null,
    `USGS 3DEP 10m hillshade`,
    "related-layer-list"
  );

  // Floodplain

  var floodplains = ee.Image(
    "users/timberharvestmap/floodplains_eastern_epaeast"
  );
  Map.addLayer(
    floodplains,
    {
      palette: "0700d6",
      classLegendDict: { Floodplain: "0700d6" },
      opacity: 0.25,
    },
    "Floodplains (Bottomland Hardwoods)",
    false,
    null,
    null,
    `EPA Eastern bottomland hardwood floodplains`,
    "related-layer-list"
  );

  var nwiLegendDict = {
    "Freshwater- Forested and Shrub wetland": "008836",
    "Freshwater Emergent wetland": "7fc31c",
    "Freshwater pond": "688cc0",
    "Estuarine and Marine wetland": "66c2a5",
    Riverine: "0190bf",
    Lakes: "13007c",
    "Estuarine and Marine Deepwater": "007c88",
    "Other Freshwater wetland": "b28653",
  };

  Map.addLayer(
    [
      {
        baseURL:
          "https://fwsprimary.wim.usgs.gov/server/rest/services/Wetlands_Raster/ImageServer/exportImage?f=image&bbox=",
        minZoom: 2,
      },
      {
        baseURL:
          "https://fwsprimary.wim.usgs.gov/server/rest/services/Test/Wetlands_gdb_split/MapServer/export?dpi=96&transparent=true&format=png8&bbox=",
        minZoom: 11,
      },
    ],
    {
      layerType: "dynamicMapService",
      addToClassLegend: true,
      classLegendDict: nwiLegendDict,
    },
    "National Wetland Inventory",
    false,
    null,
    null,
    "Fish and Wildlife Service National Wetland Inventory Data",
    "related-layer-list"
  );

  //Initial Set Up
  handleAoiSelectionType(selectOption);

  if (
    urlParams.selectedState !== undefined &&
    urlParams.selectedCounty !== undefined
  ) {
    let state = allStates.filter(
      (s) => s.STUSPS === urlParams.selectedState
    )[0];

    $("#state-select").val(state.NAME).prop("selected", true);
    populateCountiesDropdown(state.NAME);
    $("#county-select").val(urlParams.selectedCounty).prop("selected", true);
    setSelectedCounty(
      urlParams.selectedCounty,
      state.STATEFP,
      urlParams.selectedState
    );
  }

  if (urlParams.postDate1 !== undefined) {
    $("#post-date-one").val(urlParams.postDate1);
  }
  if (urlParams.postDate2 !== undefined) {
    $("#post-date-two").val(urlParams.postDate2);
  }
  if (urlParams.preDate1 !== undefined) {
    $("#pre-date-one").val(urlParams.preDate1);
  }
  if (urlParams.preDate2 !== undefined) {
    $("#pre-date-two").val(urlParams.preDate2);
  }

  toggleProcessButton();
  if ($("#process-button").attr("disabled") === undefined) {
    handleProcess();
  }
}
chartPrecision = 3;
chartDecimalProportion = 0.00001;
function hiform_bmp_process() {
  let runStartTime = new Date();

  function addDateBand(img) {
    var d = ee.Number.parse(img.date().format("YYYYMMdd"));
    d = ee.Image(d).uint32();
    return img.addBands(d.rename("Date"));
  }

  let clsLegendDict = {
    "0.26 to 2.00": "#000096",
    "0.11 to 0.25": "#0000FF",
    "0.60 to 0.10": "#0070FF",
    "-0.30 to 0.50": "#6EBFFF",
    "-0.40 to -0.60": "#D2D2D2",
    "-0.70 to -0.90": "#FFFFBE",
    "-0.10 to -0.12": "#FFFF00",
    "-0.13 to -0.15": "#FFD37F",
    "-0.16 to -0.18": "#FFAA00",
    "-0.19 to -0.21": "#E64C00",
    "-0.22 to -0.25": "#A80000",
    "-0.26 to -0.29": "#730000",
    "-0.30 to -0.33": "#343434",
    "-0.34 to -0.37": "#4C0073",
    "-0.38 to -2.00": "#8400A8",
  };

  let ndviRamp = {
    bands: "NDVI",
    min: -0.38,
    max: 0.26,
    classLegendDict: clsLegendDict,
    palette: ndvi_palette,
  };
  let geometry = window.selectedFeature;
  let geoBounds = geometry.geometry().bounds();

  console.log("Running HiForm BMP Process with Parameters");
  console.log(
    urlParams.preDate1,
    urlParams.preDate2,
    urlParams.postDate1,
    urlParams.postDate2
  );

  let pre = superSimpleGetS2(
    geoBounds,
    urlParams.preDate1,
    advanceDate(urlParams.preDate2, 1),
    correctionTypeOption,
    true
  );

  let post = superSimpleGetS2(
    geoBounds,
    urlParams.postDate1,
    advanceDate(urlParams.postDate2, 1),
    correctionTypeOption,
    true
  );

  let sizes = ee.List([pre.limit(1).size(), post.limit(1).size()]);
  let nImages = sizes.getInfo();
  let errorMessage = "";
  if (nImages[0] === 0) {
    errorMessage = `No Sentinel-2 images found for pre dates ${urlParams.preDate1} - ${urlParams.preDate2}. Please select a wider pre date range.<br>`;
  }
  if (nImages[1] === 0) {
    errorMessage += `No Sentinel-2 images found for post dates ${urlParams.postDate1} - ${urlParams.postDate2}. Please select a wider post date range.`;
  }

  if (errorMessage !== "") {
    setTimeout(
      () => showMessage("Error!", errorMessage, "image-empty-error-modal"),
      200
    );
  } else {
    window.exportCRS = pre.first().select(["blue"]).projection().getInfo()[
      "crs"
    ];

    pre = pre.map(addNDVI).map(addDateBand);
    let preCount = pre.select(["NDVI"]).count().rename(["Pre_Count"]);

    pre = pre.qualityMosaic("NDVI").clip(geometry).clip(geoBounds);

    post = post.map(addNDVI).map(addDateBand);

    let postCount = post.select(["NDVI"]).count().rename(["Post_Count"]);
    console.log(preCount.bandNames().getInfo());
    post = post.qualityMosaic("NDVI").clip(geometry).clip(geoBounds);

    Map.addLayer(
      pre.select(["Date"]).randomVisualizer(),
      { addToLegend: false },
      "Pre Date Used",
      false,
      null,
      null,
      `Pre date used in composite from ${urlParams.preDate1} to ${urlParams.preDate2} across ${urlParams.selectedCounty}, ${urlParams.selectedState}`
    );
    // console.log(pre.bandNames().getInfo());
    Map.addLayer(
      post.select(["Date"]).randomVisualizer(),
      { addToLegend: false },
      "Post Date Used",
      false,
      null,
      null,
      `Post date used in composite from ${urlParams.postDate1} to ${urlParams.postDate2} across ${urlParams.selectedCounty}, ${urlParams.selectedState}`
    );
    let preWClouds = superSimpleGetS2(
      geoBounds,
      urlParams.preDate1,
      advanceDate(urlParams.preDate2, 1),
      correctionTypeOption,
      false
    );

    let postWClouds = superSimpleGetS2(
      geoBounds,
      urlParams.postDate1,
      advanceDate(urlParams.postDate2, 1),
      correctionTypeOption,
      false
    );
    postWClouds = postWClouds.map(addNDVI).map(addDateBand);
    preWClouds = preWClouds.map(addNDVI).map(addDateBand);

    Map.addLayer(
      preWClouds
        .qualityMosaic("NDVI")
        .clip(geometry)
        .select(["blue", "green", "red", "NDVI", "Date"]),
      vizParamsTrue10k,
      "Pre With Clouds Natural Color Composite",
      false,
      null,
      null,
      `No cloud masking natural color max NDVI composite from ${urlParams.preDate1} to ${urlParams.preDate2} across ${urlParams.selectedCounty}, ${urlParams.selectedState}`
    );
    Map.addLayer(
      postWClouds
        .qualityMosaic("NDVI")
        .clip(geometry)
        .select(["blue", "green", "red", "NDVI", "Date"]),
      vizParamsTrue10k,
      "Post With Clouds Natural Color Composite",
      false,
      null,
      null,
      `No cloud masking natural color max NDVI composite from ${urlParams.postDate1} to ${urlParams.postDate2} across ${urlParams.selectedCounty}, ${urlParams.selectedState}`
    );
    var diff = post
      .float()
      .subtract(pre.float())
      .select(["NDVI"])
      .addBands(pre.select(["Date"], ["Pre Date"]))
      .addBands(post.select(["Date"], ["Post Date"]))
      .clip(geoBounds);

    Map.addLayer(
      diff,
      ndviRamp,
      "All-Lands NDVI Change",
      false,
      null,
      null,
      `NDVI change magnitude between ${urlParams.preDate1} - ${urlParams.preDate2} and ${urlParams.postDate1} - ${urlParams.postDate2} across ${urlParams.selectedCounty}, ${urlParams.selectedState}`
    );

    ////////////////////////////////////////////////////////////////////
    // bring in 2021 NLCD - define 4 forest classess
    ///////////////////////////////////////////////////////////////////

    var nlcd_landcover_img = ee
      .Image("USGS/NLCD_RELEASES/2021_REL/NLCD/2021")
      .select(["landcover"]);

    // all 4-forest classes
    var nlcd_wild = nlcd_landcover_img
      .eq(41)
      .or(nlcd_landcover_img.eq(42))
      .or(nlcd_landcover_img.eq(43))
      .or(nlcd_landcover_img.eq(90));

    diff = diff.updateMask(nlcd_wild).clip(geoBounds);

    Map.addLayer(
      diff,
      ndviRamp,
      "Forest NDVI Change",
      false,
      null,
      null,
      `NDVI forest change magnitude between ${urlParams.preDate1} - ${urlParams.preDate2} and ${urlParams.postDate1} - ${urlParams.postDate2} across ${urlParams.selectedCounty}, ${urlParams.selectedState}`
    );

    var mod_change = diff.select(["NDVI"]);
    mod_change = mod_change.lte(-0.07).and(mod_change.gte(-0.19)).selfMask();

    var severe_change = diff.select(["NDVI"]);
    severe_change = severe_change.lt(-0.19).selfMask();

    let mod_change_mmu = 200;
    let severe_change_mmu = 100;

    var mod_change_patch_size_mask = mod_change
      .connectedPixelCount(mod_change_mmu, false)
      .gte(mod_change_mmu);
    var severe_change_patch_size_mask = severe_change
      .connectedPixelCount(severe_change_mmu, false)
      .gte(severe_change_mmu);

    mod_change = mod_change.updateMask(mod_change_patch_size_mask);
    severe_change = severe_change
      .selfMask()
      .updateMask(severe_change_patch_size_mask);

    //Convert the zones of the thresholded change to vectors
    var mod_change_vectors = mod_change
      .addBands(diff.select(["NDVI"]))
      .reduceToVectors({
        geometry: geoBounds,
        crs: exportCRS,
        scale: 10,
        geometryType: "polygon",
        eightConnected: false,
        labelProperty: "zone",
        reducer: ee.Reducer.mean(),
        maxPixels: 1e13,
      });

    var severe_change_vectors = severe_change
      .addBands(diff.select(["NDVI"], ["Post-Pre_NDVI"]))
      .addBands(pre.select(["cloudScorePlus"], ["Pre_CloudScorePlus"]))
      .addBands(post.select(["cloudScorePlus"], ["Post_CloudScorePlus"]))
      .addBands(preCount)
      .addBands(postCount)
      .reduceToVectors({
        geometry: geoBounds,
        crs: exportCRS,
        scale: 10,
        geometryType: "polygon",
        eightConnected: false,
        labelProperty: "zone",
        reducer: ee.Reducer.mean(),
        maxPixels: 1e13,
      });

    Map.addLayer(
      mod_change_vectors,
      { strokeColor: "3DED97", strokeWeight: 1.5 },
      "Moderate NDVI Change",
      true,
      null,
      null,
      `Moderate NDVI change between ${urlParams.preDate1} - ${urlParams.preDate2} and ${urlParams.postDate1} - ${urlParams.postDate2} across ${urlParams.selectedCounty}, ${urlParams.selectedState}`
    );
    Map.addLayer(
      severe_change_vectors,
      { strokeColor: "FF2400", strokeWeight: 1.5 },
      "Severe NDVI Change",
      true,
      null,
      null,
      `Severe NDVI change between ${urlParams.preDate1} - ${urlParams.preDate2} and ${urlParams.postDate1} - ${urlParams.postDate2} across ${urlParams.selectedCounty}, ${urlParams.selectedState}`
    );

    Map.addExport(
      mod_change_vectors,
      `Moderate_NDVI_Change ${urlParams.selectedCounty}-${urlParams.selectedState}`,
      null,
      true
    );

    Map.addExport(
      severe_change_vectors,
      `Severe_NDVI_Change ${urlParams.selectedCounty}-${urlParams.selectedState} `,
      null,
      true
    );
    Map.addExport(
      diff.select(["NDVI"]).multiply(10000).int16(),
      `Forest NDVI Change ${urlParams.selectedCounty}-${urlParams.selectedState}`,
      10,
      false,
      {}
    );
    Map.addExport(
      post.select(["red", "green", "blue", "nir"]).int16(),
      `Post_Composite ${urlParams.selectedCounty}-${urlParams.selectedState}`,
      10,
      false,
      {}
    );

    let preMask = pre.select([0]).mask();
    let postMask = post.select([0]).mask();
    let combinedMasks = preMask
      .and(postMask)
      .not()
      .selfMask()
      .clip(geometry)
      .clip(geoBounds);
    // console.log(combinedMasks.geometry().getInfo());
    Map.addLayer(
      combinedMasks,
      {
        min: 1,
        max: 1,
        opacity: 0.6,
        palette: "#000",
        classLegendDict: { "": "#000" },
        queryDict: {
          1: "Cloud or cloud shadow - no clear pixels available for mapping",
        },
      },
      "Clouds (underlying area not mapped)",
      true,
      null,
      null,
      "Any pixel that was always masked as cloud or cloud shadow by the cloudScore+ algorithm."
    );

    setTimeout(() => {
      Map.turnOnInspector();
      Map.setQueryScale(10);
      Map.setQueryCRS(exportCRS);
    }, 500);
  }
  let runEndTime = new Date();
  let runTime = (runEndTime - runStartTime) / 1000;
  console.log(`HiForm Run time: ${runTime} seconds`);
}
