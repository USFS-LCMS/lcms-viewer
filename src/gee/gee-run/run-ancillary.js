function runAncillary() {
  getLCMSVariables();

  ////////////////////////////////////////
  ////////// Load Ancillary Data Layers
  /////////////////////////////////////////

  // AK Vegetation Layers
  ////////////////////////////////////////////

  // LCMS v2022-8 Coastal Alaska

  const ak_land_cover = ee
    .ImageCollection("USFS/GTAC/LCMS/v2022-8")
    .filterDate("2016", "2017") // range: [1985, 2022]
    .filter('study_area == "SEAK"')
    .first()
    .select("Land_Cover");

  Map.addLayer(
    ak_land_cover,
    { autoViz: true },
    "AK LandCover - LCMS 2016",
    false
  );

  // Alaska Wetlands layer from University of Alaska

  const ak_wetland_uaa = ee.Image(
    "projects/lcms-292214/assets/R10/AK/Ancillary/AlaskaWetlandComposite_20240613"
  );

  const ak_wetland_uaa_dict = {
    1: "Estuarine and Marine Deepwater",
    2: "Estuarine and Marine Wetland",
    3: "Freshwater Bryophyte",
    4: "Freshwater Emergent Wetland",
    5: "Freshwater Forested/Shrub Wetland",
    6: "Freshwater Pond",
    7: "Lake",
    8: "Riverine",
    9: "Upland",
  };

  const ak_wetland_uaa_palette = [
    "007d88",
    "63c9a9",
    "d8f03b",
    "7fcb11",
    "00892f",
    "658dc7",
    "07007c",
    "0000c6",
    "e6e1da",
  ];

  const ak_wetland_uaa_LegendDict = {
    "Estuarine and Marine Deepwater": "007d88",
    "Estuarine and Marine Wetland": "63c9a9",
    "Freshwater Bryophyte": "d8f03b",
    "Freshwater Emergent Wetland": "7fcb11",
    "Freshwater Forested/Shrub Wetland": "00892f",
    "Freshwater Pond": "658dc7",
    Lake: "07007c",
    Riverine: "0000c6",
    Upland: "e6e1da",
  };

  Map.addLayer(
    ak_wetland_uaa,
    {
      min: 1,
      max: 9,
      palette: ak_wetland_uaa_palette,
      classLegendDict: ak_wetland_uaa_LegendDict,
      queryDict: ak_wetland_uaa_dict,
    },
    "AK Wetlands (UAA)",
    false
  );

  // Alaska Vegetation Composite from University of Alaska

  // Alaska Wetlands layer from University of Alaska

  const ak_vegetation_uaa = ee.Image(
    "projects/lcms-292214/assets/R10/AK/Ancillary/AlaskaVegetationCompositeReclass_20240623"
  );

  const ak_vegetation_uaa_dict = {
    1: "Algal Bed (Freshwater) (S. Alaska)",
    2: "Algal Bed (Tidal-Subtidal) (S. Alaska)",
    3: "Bareground",
    4: "Bareground (Beach or Tide Flat) (S. Alaska)",
    5: "Deciduous Forest (Open-Closed)",
    6: "Deciduous Forest (Open-Closed) (Seasonally Flooded) (S. Alaska)",
    7: "Deciduous Forest (Woodland-Closed) (S. Alaska)",
    8: "Dwarf Shrub",
    9: "Dwarf Shrub (S. Alaska)",
    10: "Dwarf Shrub or Dwarf Shrub-Lichen",
    11: "Dwarf Shrub, or Herbaceous (Mesic) (S. Alaska)",
    12: "Dwarf Shrub-Lichen",
    13: "Fire Scar",
    14: "Freshwater or Saltwater",
    15: "Hemlock (Woodland-Closed)",
    16: "Hemlock-Sitka Spruce (Woodland-Closed)",
    17: "Herbaceous (Aquatic)",
    18: "Herbaceous (Aquatic) (S. Alaska)",
    19: "Herbaceous (Marsh) (Int. Alaska, Cook Inlet Basin)",
    20: "Herbaceous (Marsh) (N. and W. Alaska)",
    21: "Herbaceous (Mesic)",
    22: "Herbaceous (Mesic) (Int. Alaska, Cook Inlet Basin)",
    23: "Herbaceous (Mesic) (N. and W. Alaska)",
    24: "Herbaceous (Mesic) (N. and W. Alaska) or Tussock Tundra (Herbaceous)",
    25: "Herbaceous (Mesic) (S. Alaska)",
    26: "Herbaceous (Peatland) (S. Alaska)",
    27: "Herbaceous (Tidal) (S. Alaska)",
    28: "Herbaceous (Wet) (Int. Alaska, Cook Inlet Basin)",
    29: "Herbaceous (Wet) (N. and W. Alaska)",
    30: "Herbaceous (Wet) (N. and W. Alaska) or Herbaceous (Marsh) (N. and W. Alaska)",
    31: "Herbaceous (Wet-Marsh) (S. Alaska)",
    32: "Herbaceous (Wet-Marsh) (Tidal)",
    33: "Herbaceous (Wet-Marsh), or Herbaceous (Tidal), or Herbaceous (Peatland) (S. Alaska)",
    34: "Ice-Snow",
    35: "Lichen",
    36: "Low Shrub",
    37: "Low Shrub (Peatland) (S. Alaska)",
    38: "Low Shrub (Tidal) (S. Alaska)",
    39: "Low Shrub or Tall Shrub (Open-Closed)",
    40: "Low Shrub/Lichen",
    41: "Low-Tall Shrub (S. Alaska)",
    42: "Moss",
    43: "Moss (Peatland) (S. Alaska)",
    44: "Moss (S. Alaska)",
    45: "Needleleaf Forest (Open-Closed) (Seasonally Flooded) (S. Alaska)",
    46: "Needleleaf Forest (Woodland-Closed) (S. Alaska)",
    47: "Needleleaf Forest (Woodland-Open) (Peatland) (S. Alaska)",
    48: "Saltwater",
    49: "Sitka Spruce (Woodland-Closed)",
    50: "Sparse Vegetation (Int. Alaska, Cook Inlet Basin)",
    51: "Sparse Vegetation (N. and W. Alaska)",
    52: "Tall Shrub (Open-Closed)",
    53: "Tussock Tundra (Low shrub or Herbaceous)",
    54: "Urban, Agriculture, Road",
    55: "White Spruce or Black Spruce (Open-Closed)",
    56: "White Spruce or Black Spruce (Woodland)",
    57: "White Spruce or Black Spruce-Deciduous (Open-Closed)",
    58: "White Spruce or Black Spruce/Lichen (Woodland-Open)",
  };

  const ak_vegetation_uaa_palette = [
    "adffff",
    "adffff",
    "4f4f4f",
    "4f4f4f",
    "ffb340",
    "c49735",
    "c9401e",
    "ff8cff",
    "ff6bff",
    "ffd9ff",
    "ffc7e1",
    "ffe6ff",
    "black",
    "0077ff",
    "287300",
    "1ca600",
    "adffff",
    "adffff",
    "adffff",
    "96e3fa",
    "61bdff",
    "fcfc35",
    "ffff8c",
    "ffffcc",
    "c1fdff",
    "5effff",
    "86d5eb",
    "adffff",
    "a1ffbb",
    "59ffc2",
    "adffff",
    "00c7bd",
    "00a199",
    "white",
    "ffd6e6",
    "ffcfcf",
    "ffbaba",
    "cc9b9b",
    "f712ff",
    "ffd8cf",
    "859e9a",
    "ffcff0",
    "eabaff",
    "ffbae7",
    "04de17",
    "02ba14",
    "009e10",
    "54a7ff",
    "007308",
    "bfbfbf",
    "e3e3e3",
    "ff0808",
    "bec251",
    "black",
    "009c68",
    "6e7d60",
    "ffb114",
    "daff73",
  ];

  const ak_vegetation_uaa_LegendDict = {
    "Algal Bed (Freshwater) (S. Alaska)": "adffff",
    "Algal Bed (Tidal-Subtidal) (S. Alaska)": "adffff",
    Bareground: "4f4f4f",
    "Bareground (Beach or Tide Flat) (S. Alaska)": "4f4f4f",
    "Deciduous Forest (Open-Closed)": "ffb340",
    "Deciduous Forest (Open-Closed) (Seasonally Flooded) (S. Alaska)": "c49735",
    "Deciduous Forest (Woodland-Closed) (S. Alaska)": "c9401e",
    "Dwarf Shrub": "ff8cff",
    "Dwarf Shrub (S. Alaska)": "ff6bff",
    "Dwarf Shrub or Dwarf Shrub-Lichen": "ffd9ff",
    "Dwarf Shrub, or Herbaceous (Mesic) (S. Alaska)": "ffc7e1",
    "Dwarf Shrub-Lichen": "ffe6ff",
    "Fire Scar": "black",
    "Freshwater or Saltwater": "0077ff",
    "Hemlock (Woodland-Closed)": "287300",
    "Hemlock-Sitka Spruce (Woodland-Closed)": "1ca600",
    "Herbaceous (Aquatic)": "adffff",
    "Herbaceous (Aquatic) (S. Alaska)": "adffff",
    "Herbaceous (Marsh) (Int. Alaska, Cook Inlet Basin)": "adffff",
    "Herbaceous (Marsh) (N. and W. Alaska)": "96e3fa",
    "Herbaceous (Mesic)": "61bdff",
    "Herbaceous (Mesic) (Int. Alaska, Cook Inlet Basin)": "fcfc35",
    "Herbaceous (Mesic) (N. and W. Alaska)": "ffff8c",
    "Herbaceous (Mesic) (N. and W. Alaska) or Tussock Tundra (Herbaceous)":
      "ffffcc",
    "Herbaceous (Mesic) (S. Alaska)": "c1fdff",
    "Herbaceous (Peatland) (S. Alaska)": "5effff",
    "Herbaceous (Tidal) (S. Alaska)": "86d5eb",
    "Herbaceous (Wet) (Int. Alaska, Cook Inlet Basin)": "adffff",
    "Herbaceous (Wet) (N. and W. Alaska)": "a1ffbb",
    "Herbaceous (Wet) (N. and W. Alaska) or Herbaceous (Marsh) (N. and W. Alaska)":
      "59ffc2",
    "Herbaceous (Wet-Marsh) (S. Alaska)": "adffff",
    "Herbaceous (Wet-Marsh) (Tidal)": "00c7bd",
    "Herbaceous (Wet-Marsh), or Herbaceous (Tidal), or Herbaceous (Peatland) (S. Alaska)":
      "00a199",
    "Ice-Snow": "white",
    Lichen: "ffd6e6",
    "Low Shrub": "ffcfcf",
    "Low Shrub (Peatland) (S. Alaska)": "ffbaba",
    "Low Shrub (Tidal) (S. Alaska)": "cc9b9b",
    "Low Shrub or Tall Shrub (Open-Closed)": "f712ff",
    "Low Shrub/Lichen": "ffd8cf",
    "Low-Tall Shrub (S. Alaska)": "859e9a",
    Moss: "ffcff0",
    "Moss (Peatland) (S. Alaska)": "eabaff",
    "Moss (S. Alaska)": "ffbae7",
    "Needleleaf Forest (Open-Closed) (Seasonally Flooded) (S. Alaska)":
      "04de17",
    "Needleleaf Forest (Woodland-Closed) (S. Alaska)": "02ba14",
    "Needleleaf Forest (Woodland-Open) (Peatland) (S. Alaska)": "009e10",
    Saltwater: "54a7ff",
    "Sitka Spruce (Woodland-Closed)": "007308",
    "Sparse Vegetation (Int. Alaska, Cook Inlet Basin)": "bfbfbf",
    "Sparse Vegetation (N. and W. Alaska)": "e3e3e3",
    "Tall Shrub (Open-Closed)": "ff0808",
    "Tussock Tundra (Low shrub or Herbaceous)": "bec251",
    "Urban, Agriculture, Road": "black",
    "White Spruce or Black Spruce (Open-Closed)": "009c68",
    "White Spruce or Black Spruce (Woodland)": "6e7d60",
    "White Spruce or Black Spruce-Deciduous (Open-Closed)": "ffb114",
    "White Spruce or Black Spruce/Lichen (Woodland-Open)": "daff73",
  };

  Map.addLayer(
    ak_vegetation_uaa,
    {
      min: 1,
      max: 58,
      palette: ak_vegetation_uaa_palette,
      classLegendDict: ak_vegetation_uaa_LegendDict,
      queryDict: ak_vegetation_uaa_dict,
    },
    "AK Vegetation (UAA)",
    false
  );

  const canopyHeight = ee
    .ImageCollection(
      "projects/meta-forest-monitoring-okw37/assets/CanopyHeight"
    )
    .mosaic();
  Map.addLayer(
    canopyHeight,
    {
      min: 0,
      max: 25,
      palette: ["f0fcfc", "5ec962", "21918c", "3b528b", "440154"],
    },
    "Canopy Height [in meters]",
    0
  );

  const treenotree = canopyHeight.updateMask(canopyHeight.lte(6));
  const tallShrubs = treenotree.updateMask(canopyHeight.gte(1));
  Map.addLayer(
    tallShrubs,
    {
      min: 0,
      max: 1,
      palette: ["yellow"], //'ed7953',
    },
    "Canopy height (1-6 meters)",
    0
  );

  // AK Existing veg -  KenaiVegVectorMapService2019 - Tall Shrub Canopy Cover (ID: 3)

  //   var KPLegendDict = {
  //     "Freshwater- Forested and Shrub wetland": "008836",
  //     "Freshwater Emergent wetland": "7fc31c",
  //     "Freshwater pond": "688cc0",
  //     "Estuarine and Marine wetland": "66c2a5",
  //     "Riverine": "0190bf",
  //     "Lakes": "13007c",
  //     "Estuarine and Marine Deepwater": "007c88",
  //     "Other Freshwater wetland": "b28653",
  //   };

  //   // add R10 Kenai Peninsula 2017 layer
  //   Map2.addLayer([{baseURL:'https://apps.fs.usda.gov/fsgisx02/rest/services/r10/KenaiVegVectorMapService2019/MapServer/3',minZoom:0},{baseURL:'https://apps.fs.usda.gov/fsgisx02/rest/services/r10/KenaiVegVectorMapService2019/MapServer/3',minZoom:12}],{layerType:'imageService',addToClassLegend: true
  //   //,classLegendDict:KPLegendDict
  // },'AK Kenai Tall Shrub % Cover 2017',false)

  //   var KPLegendDict = {
  //     "Freshwater- Forested and Shrub wetland": "008836",
  //     "Freshwater Emergent wetland": "7fc31c",
  //     "Freshwater pond": "688cc0",
  //     "Estuarine and Marine wetland": "66c2a5",
  //     "Riverine": "0190bf",
  //     "Lakes": "13007c",
  //     "Estuarine and Marine Deepwater": "007c88",
  //     "Other Freshwater wetland": "b28653",
  //   };

  //   // add R10 Kenai Peninsula 2017 layer
  //   Map2.addLayer([{baseURL:'https://apps.fs.usda.gov/fsgisx02/rest/services/r10/KenaiVegVectorMapService2019/MapServer/3',minZoom:0},{baseURL:'https://apps.fs.usda.gov/fsgisx02/rest/services/r10/KenaiVegVectorMapService2019/MapServer/3',minZoom:12}],{layerType:'imageService',addToClassLegend: true
  //   //,classLegendDict:KPLegendDict
  // },'AK Kenai Tall Shrub % Cover 2017',false)

  // Hawaii Vegetation Layers
  //////////////////////////////////////////////////////

  // var hi_veg_polys = ee.FeatureCollection("projects/lcms-292214/assets/HI-Ancillary-Data/Vegetation_-_Hawaii_County_VED");
  // Map.addLayer(
  //   hi_veg_polys,
  //   { strokeColor: "808", layerType: "geeVectorImage" },
  //   "HI Veg Polys",
  //   false,
  //   null,
  //   null,
  //   "HI Veg data from https://geoportal.hawaii.gov/datasets/8991d678dfc94b5d984df9117ca11ba1"
  // );

  const hi_veg_ccap = ee.Image(
    "projects/lcms-292214/assets/R5/Hawaii/Ancillary/hi_hawaii_2010_ccap_hires_landcover_20150120"
  );

  const hi_veg_ccap_dict = {
    0: "Background",
    1: "Unclassified",
    2: "Developed, Impervious",
    5: "Developed, Open Space",
    6: "Cultivated Crops",
    7: "Pasture/Hay",
    8: "Grassland/Herbaceous",
    9: "Deciduous Forest",
    10: "Evergreen Forest",
    11: "Mixed Forest",
    12: "Shrub/Scrub",
    13: "Palustrine Forested Wetland",
    14: "Palustrine Scrub/Shrub Wetland",
    15: "Palustrine Emergent Wetland (Persistent)",
    16: "Estuarine Forested Wetland",
    17: "Estuarine Scrub/Shrub Wetland",
    18: "Estuarine Emergent Wetland",
    19: "Unconsolidated Shore",
    20: "Barren Land",
    24: "Tundra",
    25: "Perennial Ice/Snow",
  };

  const hi_veg_ccap_palette = [
    "ffffff", //1
    "ffffff", //2
    "ffffff",
    "ffffff",
    "cccc00", //5
    "521f00",
    "c3a04a",
    "f7ba83",
    "02eb02", //9 - deciduous forest
    "013700", // 10 - evergreen forest
    "08a038", // 11- mixed forest
    "6b6d01",
    "005c5a",
    "f56c01",
    "f501f5", //15
    "3a003a",
    "6a006a",
    "b500b4",
    "00f2f6",
    "f7f301", //20
  ];

  const hi_veg_ccap_LegendDict = {
    "Developed, Impervious": "ffffff", //2
    "Developed, Open Space": "cccc00", //5
    "Cultivated Crops": "521f00",
    "Pasture/Hay": "c1a04f",
    "Grassland/Herbaceous": "f7ba83",
    "Deciduous Forest": "02eb02",
    "Evergreen Forest": "013700", //10
    "Mixed Forest": "08a038",
    "Shrub/Scrub": "6b6d01",
    "Palustrine Forested Wetland": "005c5a",
    "Palustrine Scrub/Shrub Wetland": "f56c01",
    "Persistent Emergent Wetland": "f501f5", //15
    "Estuarine Forested Wetland": "3a003a",
    "Estuarine Scrub/Shrub Wetland": "6a006a",
    "Estuarine Emergent Wetland": "b500b4",
    "Unconsolidated Shore": "00f2f6",
    "Barren Land": "f7f301", // 20
  };

  Map.addLayer(
    hi_veg_ccap,
    {
      min: 1,
      max: 20,
      palette: hi_veg_ccap_palette,
      classLegendDict: hi_veg_ccap_LegendDict,
      queryDict: hi_veg_ccap_dict,
    },
    "HI Veg NOAA CCAP 2010",
    false
  );

  // Hawaii Wetland data
  ///////////////////////////////////////////////
  let nwi_hi = ee.FeatureCollection(
    "projects/lcms-292214/assets/R5/Hawaii/Ancillary/HI_wetlands"
  );
  nwi_hi = nwi_hi.map(function (f) {
    return f.set("WETLAND_TY_NO", f.get("WETLAND_TY"));
  });
  const props = nwi_hi.aggregate_histogram("WETLAND_TY_NO").keys();
  const props_nos = ee.List.sequence(1, props.length());
  nwi_hi = nwi_hi.remap(props, props_nos, "WETLAND_TY_NO");
  let nwi_hi_rast = nwi_hi
    .reduceToImage(["WETLAND_TY_NO"], ee.Reducer.first())
    .rename(["NWI"])
    .set("system:time_start", ee.Date.fromYMD(2019, 6, 1).millis());
  //Map.addLayer(nwi_hi_rast, {  min: 1, max: 7, palette: nwi_palette, classLegendDict: nwiLegendDict, queryDict: nwi_dict }, "HI NWI", false);

  // Standard Ancillary Data Layers - CONUS
  ////////////////////////////////////////////////////////////////////

  // NCLD
  /////////////
  let nlcd = ee.ImageCollection("USGS/NLCD_RELEASES/2016_REL");

  let nlcdLCMS = ee.ImageCollection("users/yang/CONUS_NLCD2016");

  function getYear(img) {
    const yr = img.id().split("_").get(-1);
    img = img.set(
      "system:time_start",
      ee.Date.fromYMD(ee.Number.parse(yr), 6, 1).millis()
    );
    return img;
  }
  nlcdLCMS = nlcdLCMS.map(getYear);

  const nlcdLCMax = 95; //parseInt(nlcd.get('system:visualization_0_max').getInfo());
  const nlcdLCMin = 0; //parseInt(nlcd.get('system:visualization_0_min').getInfo());
  const nlcdLCPalette = [
    "466b9f",
    "d1def8",
    "dec5c5",
    "d99282",
    "eb0000",
    "ab0000",
    "b3ac9f",
    "68ab5f",
    "1c5f2c",
    "b5c58f",
    "af963c",
    "ccb879",
    "dfdfc2",
    "d1d182",
    "a3cc51",
    "82ba9e",
    "dcd939",
    "ab6c28",
    "b8d9eb",
    "6c9fb8",
  ]; //nlcd.get('system:visualization_0_palette').getInfo().split(',');

  const nlcdClassCodes = [
    11, 12, 21, 22, 23, 24, 31, 41, 42, 43, 51, 52, 71, 72, 73, 74, 81, 82, 90,
    95,
  ];
  const nlcdClassNames = [
    "Open Water",
    "Perennial Ice/Snow",
    "Developed, Open Space",
    "Developed, Low Intensity",
    "Developed, Medium Intensity",
    "Developed High Intensity",
    "Barren Land (Rock/Sand/Clay)",
    "Deciduous Forest",
    "Evergreen Forest",
    "Mixed Forest",
    "Dwarf Scrub",
    "Shrub/Scrub",
    "Grassland/Herbaceous",
    "Sedge/Herbaceous",
    "Lichens",
    "Moss",
    "Pasture/Hay",
    "Cultivated Crops",
    "Woody Wetlands",
    "Emergent Herbaceous Wetlands",
  ];
  const nlcdFullClassCodes = range(nlcdLCMin, nlcdLCMax + 1);
  const nlcdLCVizDict = {};
  const nlcdLCQueryDict = {};
  const nlcdLegendDict = {};

  let ii = 0;
  nlcdFullClassCodes.map(function (i) {
    const index = nlcdClassCodes.indexOf(i);
    if (index !== -1) {
      nlcdLCQueryDict[i] = nlcdClassNames[ii];
      nlcdLCVizDict[i] = nlcdLCPalette[ii];
      nlcdLegendDict[nlcdClassNames[ii]] = nlcdLCPalette[ii];
      ii++;
    } else {
      nlcdLCVizDict[i] = "000";
    }
  });
  const nlcdLegendDictReverse = {};
  Object.keys(nlcdLegendDict)
    .reverse()
    .map(function (k) {
      nlcdLegendDictReverse[k] = nlcdLegendDict[k];
    });

  nlcd = nlcd.map(function (img) {
    return img.set("bns", img.bandNames());
  });
  function annualMosaicCollection(c) {
    const years = c
      .toList(10000, 0)
      .map(function (img) {
        return ee.Date(ee.Image(img).get("system:time_start")).get("year");
      })
      .distinct();
    return ee.ImageCollection(
      years.map(function (yr) {
        return c
          .filter(ee.Filter.calendarRange(yr, yr, "year"))
          .mosaic()
          .set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis());
      })
    );
  }
  let nlcdLC = nlcd
    .filter(ee.Filter.listContains("bns", "landcover"))
    .select(["landcover"]);
  nlcdLC = annualMosaicCollection(nlcdLC);
  const nlcdLCYears = nlcdLC
    .toList(10000, 0)
    .map(function (img) {
      return ee.Date(ee.Image(img).get("system:time_start")).get("year");
    })
    .distinct();

  let nlcdImpv = nlcd
    .filter(ee.Filter.listContains("bns", "impervious"))
    .select(["impervious"]);
  nlcdImpv = annualMosaicCollection(nlcdImpv);
  const nlcdImpvYears = nlcdImpv
    .toList(10000, 0)
    .map(function (img) {
      return ee.Date(ee.Image(img).get("system:time_start")).get("year");
    })
    .distinct();

  let nlcdTCC = nlcd
    .filter(ee.Filter.listContains("bns", "percent_tree_cover"))
    .select(["percent_tree_cover"]);
  nlcdTCC = annualMosaicCollection(nlcdTCC);
  const nlcdTCCYears = nlcdTCC
    .toList(10000, 0)
    .map(function (img) {
      return ee.Date(ee.Image(img).get("system:time_start")).get("year");
    })
    .distinct();

  // nlcdLCYears.getInfo().map(function(yr){
  //   var nlcdLCYr = nlcdLC.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic();
  //   Map.addLayer(nlcdLCYr,{min:nlcdLCMin,max:nlcdLCMax,palette:Object.values(nlcdLCVizDict),addToClassLegend: true,classLegendDict:nlcdLegendDictReverse,queryDict: nlcdLCQueryDict},'NLCD Landcover ' + yr.toString(),false);
  // });
  // nlcdImpvYears.getInfo().map(function(yr){
  //   var nlcdImpvYr = nlcdImpv.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic();
  //   Map.addLayer(nlcdImpvYr,{'min':0,'max':90,'palette':'000,555,FF0,F30,F00'},'NLCD Impervious ' + yr.toString(),false);

  // });
  // nlcdTCCYears.getInfo().map(function(yr){
  //   var nlcdTCCYr = nlcdTCC.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic();
  //   Map.addLayer(nlcdTCCYr,{'min':0,'max':90,'palette':'000,0F0',opacity:0.75},'NLCD Tree Canopy Cover ' + yr.toString(),false);
  // });

  //Add NAIP to viewer
  // var naipYears = ee.List.sequence(2007,2017).getInfo();
  // var naip = ee.ImageCollection("USDA/NAIP/DOQQ").select([0,1,2],['R','G','B']);
  // naipYears.map(function(yr){
  //   var naipT = naip.filter(ee.Filter.calendarRange(yr,yr,'year'));
  //  Map.addLayer(naipT.mosaic(),{'min':25,'max':225,'addToLegend':false},'NAIP ' + yr.toString(),false,'','FFF','The National Agriculture Imagery Program (NAIP) acquired aerial imagery during the '+yr.toString()+' agricultural growing season in the continental U.S.');
  //  Map.addLayer(naipT.mosaic(),{'min':25,'max':225,'addToLegend':false},'NAIP ' + yr.toString(),false, 0.5);
  // });

  // MTBS
  /////////////////////////////////////////////////////

  const mtbsIDS = getMTBSandIDS("anc", "layer-list");
  let mtbs = mtbsIDS[0];

  // NWI
  /////////////////////////////////////////////////

  const nwiLegendDict = {
    "Freshwater- Forested and Shrub wetland": "008836",
    "Freshwater Emergent wetland": "7fc31c",
    "Freshwater pond": "688cc0",
    "Estuarine and Marine wetland": "66c2a5",
    Riverine: "0190bf",
    Lakes: "13007c",
    "Estuarine and Marine Deepwater": "007c88",
    "Other Freshwater wetland": "b28653",
  };

  // var nwi_dict = ee.Dictionary.fromLists(props_nos.map((n)=>ee.Number(n).byte().format()),props).getInfo();
  const nwi_dict = {
    1: "Estuarine and Marine Deepwater",
    2: "Estuarine and Marine Wetland",
    3: "Freshwater Emergent Wetland",
    4: "Freshwater Forested/Shrub Wetland",
    5: "Freshwater Pond",
    6: "Lake",
    7: "Riverine",
  };
  const nwi_palette = [
    "007c88",
    "66c2a5",
    "7fc31c",
    "008836",
    "688cc0",
    "13007c",
    "0190bf",
  ];

  Map.addLayer(
    nwi_hi_rast,
    {
      min: 1,
      max: 7,
      palette: nwi_palette,
      classLegendDict: nwiLegendDict,
      queryDict: nwi_dict,
    },
    "HI NWI",
    false
  );

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
    "NWI",
    false
  );

  // addDynamicToMap('https://fwsprimary.wim.usgs.gov/server/rest/services/Wetlands_Raster/ImageServer/exportImage?f=image&bbox=',
  //                 'https://fwsprimary.wim.usgs.gov/server/rest/services/Wetlands/MapServer/export?dpi=96&transparent=true&format=png8&bbox=',
  //                 8,11,
  //                 'NWI',false,'National Wetlands Inventory data as viewed in https://www.fws.gov/wetlands/Data/Mapper.html from zoom levels >= 8')

  // ESRI Land cover
  /////////////////////////////////////////////////

  esri_lc_dict = {
    Water: "008",
    Trees: "080",
    "Flooded Vegetation": "088",
    "Built Area": "D00",
  };
  // Map.addLayer([{baseURL:'https://env1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer/exportImage?f=image&bbox=',minZoom:0,ending:'&compressionQuality=75&format=jpgpng&mosaicRule=%7B%22ascending%22%3Atrue%2C%22mosaicMethod%22%3A%22esriMosaicNorthwest%22%2C%22mosaicOperation%22%3A%22MT_FIRST%22%7D&renderingRule=%7B%22rasterFunction%22%3A%22Cartographic%20Renderer%20-%20Legend%20and%20Attribute%20Table%22%7D&time=1483272000000'},{baseURL:'https://env1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer/exportImage?f=image&bbox=',minZoom:11,ending:'&compressionQuality=75&format=jpgpng&mosaicRule=%7B%22ascending%22%3Atrue%2C%22mosaicMethod%22%3A%22esriMosaicNorthwest%22%2C%22mosaicOperation%22%3A%22MT_FIRST%22%7D&renderingRule=%7B%22rasterFunction%22%3A%22Cartographic%20Renderer%20-%20Legend%20and%20Attribute%20Table%22%7D&time=1483272000000'}],{layerType:'dynamicMapService',addToClassLegend: true,classLegendDict:nwiLegendDict},'ESRI LC 2017',true)

  // Map.addLayer([{baseURL:'https://env1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer/exportImage?f=image&bbox=',minZoom:0,ending:'&compressionQuality=75&format=jpgpng&mosaicRule=%7B%22ascending%22%3Atrue%2C%22mosaicMethod%22%3A%22esriMosaicNorthwest%22%2C%22mosaicOperation%22%3A%22MT_FIRST%22%7D&renderingRule=%7B%22rasterFunction%22%3A%22Cartographic%20Renderer%20-%20Legend%20and%20Attribute%20Table%22%7D&time=1577880000000'},{baseURL:'https://env1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer/exportImage?f=image&bbox=',minZoom:11,ending:'&compressionQuality=75&format=jpgpng&mosaicRule=%7B%22ascending%22%3Atrue%2C%22mosaicMethod%22%3A%22esriMosaicNorthwest%22%2C%22mosaicOperation%22%3A%22MT_FIRST%22%7D&renderingRule=%7B%22rasterFunction%22%3A%22Cartographic%20Renderer%20-%20Legend%20and%20Attribute%20Table%22%7D&time=1577880000000'}],{layerType:'dynamicMapService',addToClassLegend: true,classLegendDict:nwiLegendDict},'ESRI LC 2021',true)
  // Map.addLayer(standardTileURLFunction('http://server.arcgisonline.com/arcgis/rest/services/Specialty/Soil_Survey_Map/MapServer/tile/'),{layerType:'tileMapService'},'SSURGO Soils',false);

  //var years = ee.List.sequence(1984, 2022).getInfo();
  //var dummyNLCDImage = ee.Image(nlcdLC.first());

  //Denote dca_codes
  ///////////////////////////////////////////////////////////
  //From: https://www.fs.fed.us/foresthealth/technology/pdfs/Appendix_E_DCA_20141030.pdf
  //DCA codes are divided by 1000
  const dca_codes = {
    10: "General Insects",
    11: "Bark Beetles",
    12: "Defoliators",
    13: "Chewing Insects",
    14: "Sap Feeding Insects",
    15: "Boring Insects",
    16: "Seed/Cone/Flower/Fruit Insects",
    17: "Gallmaker Insects",
    18: "Insect Predators",
    19: "General Diseases",
    20: "Biotic Damage",
    21: "Root/Butt Diseases",
    22: "Stem Decays/Cankers",
    23: "Parsitic/Epiphytic Plants",
    24: "Decline Complexes/Dieback/Wilts",
    25: "Foliage Diseases",
    26: "Stem Rusts",
    27: "Broom Rusts",
    28: "Terminal, Shoot, and Twig Insects",
    29: "Root Insects",
    30: "Fire",
    40: "Wild Animals",
    50: "Abiotic Damage",
    60: "Competition",
    70: "Human Activities",
    80: "Multi-Damage (Insect/Disease)",
    85: "Plants",
    90: "Other Damages and Symptoms",
    99: "No Damage",
  };
  const damage_codes = {
    1: "Not Specified",
    2: "Mortality",
    3: "Crown Discoloration",
    4: "Crown Dieback",
    5: "Topkill",
    6: "Branch Breakage",
    7: "Main stem Broken or Uprooted",
    8: "Branch flagging",
    9: "No damage",
    11: "Mortality - Previously Undocumented",
    12: "Defoliation < 50% of leaves defoliated",
    13: "Defoliation 50-75% of leaves defoliated",
    14: "Defoliation > 75% of leaves defoliated",
    18: "Other Damage (known)",
    19: "Unknown Damage",
  };

  // print(idsCollection.getInfo())
  // var mortType = idsCollection.select(['IDS Mort Type']).max();
  // var mortDCA = idsCollection.select(['IDS Mort DCA']).max();
  // var defolType = idsCollection.select(['IDS Defol Type']).max();
  // var defolDCA = idsCollection.select(['IDS Defol DCA']).max();

  // var typeViz = {min:1,max:19,palette:'F00,888,00F',queryDict:damage_codes};
  // var dcaViz = {min:10,max:99,palette:'F00,888,00F',queryDict:dca_codes};
  // Map.addLayer(mortType,typeViz,'mortType');
  // Map.addLayer(mortDCA,dcaViz,'mortDCA');
  // Map.addLayer(defolType,typeViz,'defolType');
  // Map.addLayer(defolDCA,dcaViz,'defolDCA')

  // Cropland  // Cropland Data Layers
  ////////////////////////////////////////

  // var cdl = ee.Image('USDA/NASS/CDL/2014').select([0]);
  let cdl = ee.ImageCollection("USDA/NASS/CDL").select([0], ["cdl"]);

  const d = ee.Image("USDA/NASS/CDL/2014").select([0]).toDictionary();

  const cdlNames = ee.List(d.get("cropland_class_names"));
  const cdlValues = ee.List(d.get("cropland_class_values"));
  const cdlPalette = ee.List(d.get("cropland_class_palette"));
  const cdlQueryDict = {};
  // cdlValues
  //   .zip(cdlNames)
  //   .getInfo()
  //   .map(function (l) {
  //     cdlQueryDict[l[0]] = l[1];
  //   });
  // var cdlLegendDict = {};
  // cdlNames
  //   .zip(cdlPalette)
  //   .getInfo()
  //   .map(function (l) {
  //     cdlLegendDict[l[0]] = l[1];
  //   });
  // var cdl2 = ee.Image('USDA/NASS/CDL/2018').select([0]);
  // var palette = cdl2.get('cropland_class_palette').getInfo();

  // Map.addLayer(cdl2,{min:0,max:254,palette:palette,addToClassLegend:true,classLegendDict:cdlLegendDict,queryDict:cdlQueryDict},'CDL')

  // Terra-Climate
  ////////////////////////////////////////////////////////////
  const pdsiStartYear = 1984;
  const pdsiEndYear = 2023;
  const terra = ee
    .ImageCollection("IDAHO_EPSCOR/TERRACLIMATE")
    .filter(ee.Filter.calendarRange(pdsiStartYear - 1, pdsiEndYear, "year"));
  const terra_pdsi = terra.select("pdsi").map(function (img) {
    return img
      .multiply(0.01)
      .copyProperties(img, ["system:time_start"])
      .copyProperties(img);
  });
  const years = range(pdsiStartYear, pdsiEndYear + 1);
  let annualPDSI = years.map(function (yr) {
    const startDate = ee.Date.fromYMD(yr - 1, 10, 1);
    const endDate = ee.Date.fromYMD(yr, 9, 30);
    const yearPDSI = terra_pdsi.filter(ee.Filter.date(startDate, endDate));
    const meanPDSI = yearPDSI
      .reduce(ee.Reducer.mean())
      .set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis());
    return ee.Image(meanPDSI);
  });
  annualPDSI = ee.ImageCollection(annualPDSI);
  annualPDSI = annualPDSI.map(function (img) {
    const t = img;
    img = img.clamp(-5, 5);
    img = img.where(img.lt(-0.5), img.floor());
    img = img.where(img.gte(-0.5).and(img.lt(0.5)), 0);
    img = img.where(img.gte(0.5), img.ceil());
    return img.add(5).copyProperties(t, ["system:time_start"]);
  });
  const pdsiDict = {
    10: "extremely wet", // 4 +        == 5
    9: "very wet", // 3-3.99     == 4
    8: "moderately wet", // 2-2.99     == 3
    7: "slightly wet", // 1-1.99     == 2
    6: "incipient wet spell", // 0.5-0.99   == 1
    5: "near normal", // -0.49-0.49 == 0
    4: "incipient dry spell", // -0.99--0.5 == -1
    3: "mild drought", // -1.99--1   == -2
    2: "moderate drought", // -2.99--2   == -3
    1: "severe drought", // -3.99--3   == -4
    0: "extreme drought",
  };
  let idsCollection = mtbsIDS[1].select([1, 0], ["IDS Type", "IDS DCA"]);

  //PRVI layers
  ///////////////////////////////////

  // Map.addLayer(superSimpleTileURLFunction('https://image-services-gtac.fs.usda.gov/arcgis/rest/services/ResourcePhoto_Region08/PR_2019_15cm_VNIR/ImageServer/tile/'),{layerType:'tileMapService','addToLegend':false},'PRUSVI 2019 15cm',false);
  // Map.addLayer(superSimpleTileURLFunction('https://image-services-gtac.fs.usda.gov/arcgis/rest/services/ResourcePhoto_Region08/PR_USACOE_30cm_2010_12_CIR/ImageServer/tile/'),{layerType:'tileMapService','addToLegend':false},'PR 2010 30cm',false)

  // var prUSVI_ch_2018 = ee.Image('projects/lcms-292214/assets/R8/PR_USVI/Ancillary/PR_USVI_2018_CHM_1m')
  //                       .set('system:time_start',ee.Date.fromYMD(2018,6,1).millis())
  //                       .rename(['Canopy Height'])
  //                       .selfMask()
  // Map.addLayer(prUSVI_ch_2018,{min:1,max:15,palette:palettes.crameri.bamako[50].reverse(),legendLabelLeftAfter:'(m)',legendLabelRightAfter:'(m)'},'PRUSVI 2018 Canopy Height',false);

  const vi_2007 = ee
    .Image(
      "projects/lcms-292214/assets/R8/PR_USVI/Ancillary/usvi_land_cover_usvigap_2007"
    )
    .add(50)
    .byte()
    .set("system:time_start", ee.Date.fromYMD(2007, 6, 1).millis());

  const pr_1991 = ee
    .Image("projects/lcms-292214/assets/R8/PR_USVI/Ancillary/LandCover_PR_1991")
    .set("system:time_start", ee.Date.fromYMD(1991, 6, 1).millis());

  var pr_2000 = ee
    .Image("projects/lcms-292214/assets/R8/PR_USVI/Ancillary/LandCover_PR_2000")
    .set("system:time_start", ee.Date.fromYMD(2000, 6, 1).millis());

  const vi_2000 = ee
    .Image("projects/lcms-292214/assets/R8/PR_USVI/Ancillary/LandCover_VI_2000")
    .set("system:time_start", ee.Date.fromYMD(2000, 6, 1).millis());
  const mona = ee
    .Image(
      "projects/lcms-292214/assets/R8/PR_USVI/Ancillary/LandCover_Mona_2008"
    )
    .set("system:time_start", ee.Date.fromYMD(2008, 6, 1).millis());
  const pr_2010 = ee
    .Image(
      "projects/lcms-292214/assets/R8/PR_USVI/Ancillary/Landcover_2010_PR_CCAP"
    )
    .add(27)
    .byte()
    .set("system:time_start", ee.Date.fromYMD(2010, 6, 1).millis());

  var pr_2000 = ee
    .ImageCollection([pr_2000, mona, vi_2000])
    .mosaic()
    .set("system:time_start", ee.Date.fromYMD(2000, 6, 1).millis());

  let prvi_lc_collection = ee.ImageCollection.fromImages([
    pr_1991,
    pr_2000,
    vi_2007,
    pr_2010,
  ]);
  prvi_lc_collection = prvi_lc_collection.map(function (img) {
    return img.add(1).copyProperties(img, ["system:time_start"]);
  });

  const prvi_lc_dict = {
    0: { Name: "Background/water", Color: "476ba1" }, // 1991, 2000 and 2008 PR LC
    1: { Name: "High-Medium Density Urban", Color: "ab0000" },
    2: { Name: "Low-Medium Density Urban", Color: "d99482" },
    3: { Name: "Herbaceous Agriculture - Cultivated Lands", Color: "ffff00" },
    4: {
      Name: "Active Sun Coffee and Mixed Woody Agriculture",
      Color: "ffcc00",
    },
    5: {
      Name: "Pasture, Hay or Inactive Agriculture (e.g. abandoned sugar cane)",
      Color: "ffff66",
    },
    6: {
      Name: "Pasture, Hay or other Grassy Areas (e.g. soccer fields)",
      Color: "ffcc66",
    },
    7: { Name: "Drought Deciduous Open Woodland", Color: "00cc00" },
    8: { Name: "Drought Deciduous Dense Woodland", Color: "006600" },
    9: {
      Name: "Deciduous, Evergreen Coastal and Mixed Forest or Shrubland with Succulents",
      Color: "9900ff",
    },
    10: {
      Name: "Semi-Deciduous and Drought Deciduous Forest on Alluvium and Non-Carbonate Substrates",
      Color: "66ff66",
    },
    11: {
      Name: "Semi-Deciduous and Drought Deciduous Forest on Karst (includes semi-evergreen forest)",
      Color: "003300",
    },
    12: {
      Name: "Drought Deciduous, Semi-deciduous and Seasonal Evergreen Forest on Serpentine",
      Color: "66ff33",
    },
    13: {
      Name: "Seasonal Evergreen and Semi-Deciduous Forest on Karst",
      Color: "3333ff",
    },
    14: { Name: "Seasonal Evergreen and Evergreen Forest", Color: "3333cc" },
    15: {
      Name: "Seasonal Evergreen Forest with Coconut Palm",
      Color: "6666ff",
    },
    16: {
      Name: "Evergreen and Seasonal Evergreen Forest on Karst",
      Color: "333399",
    },
    17: { Name: "Evergreen Forest on Serpentine", Color: "6600ff" },
    18: {
      Name: "Elfin, Sierra Palm, Transitional and Tall Cloud Forest",
      Color: "66ffcc",
    },
    19: {
      Name: "Emergent Wetlands Including Seasonally Flooded Pasture",
      Color: "00ffff",
    },
    20: { Name: "Salt or Mud Flats", Color: "999966" },
    21: { Name: "Mangrove", Color: "006666" },
    22: { Name: "Seaonally Flooded Savannahs and Woodlands", Color: "006699" },
    23: { Name: "Pterocarpus Swamp", Color: "0099cc" },
    24: {
      Name: "Tidally Flooded Evergreen Dwarf-Shrubland and Forb Vegetation",
      Color: "33cccc",
    },
    25: { Name: "Quarries", Color: "996633" },
    26: { Name: "Coastal Sand and Rock", Color: "cc9900" },
    27: { Name: "Bare Soil (including bulldozed land)", Color: "996600" },
    28: { Name: "Water - Permanent", Color: "476ba1" },
    29: { Name: "Developed, High Intensity", Color: "f2f2f2" }, // 2010 PR LC CCAP
    30: { Name: "Developed, Medium Intensity", Color: "a899a8" },
    31: { Name: "Developed, Low Intensity", Color: "8e757c" },
    32: { Name: "Developed, Open Space", Color: "c1cc38" },
    33: { Name: "Cultivated Crops", Color: "542100" },
    34: { Name: "Pasture/Hay", Color: "c1a04f" },
    35: { Name: "Grassland/Herbaceous", Color: "f2ba87" },
    36: { Name: "Deciduous Forest", Color: "00f200" },
    37: { Name: "Evergreen Forest", Color: "003a00" },
    38: { Name: "Mixed Forest", Color: "07a03a" },
    39: { Name: "Scrub/Shrub", Color: "6d6d00" },
    40: { Name: "Palustrine Forested Wetland", Color: "005b5b" },
    41: { Name: "Palustrine Scrub/Shrub Wetland", Color: "f26d00" },
    42: { Name: "Palustrine Emergent Wetland (Persistent)", Color: "f200f2" },
    43: { Name: "Estuarine Forested Wetland", Color: "3d003d" },
    44: { Name: "Estuarine Scrub/Shrub Wetland", Color: "6d006d" },
    45: { Name: "Estuarine Emergent Wetland", Color: "af00af" },
    46: { Name: "Unconsolidated Shore", Color: "00f2f2" },
    47: { Name: "Barren Land", Color: "f2f200" },
    48: { Name: "Open Water", Color: "000077" },
    49: { Name: "Palustrine Aquatic Bed", Color: "0000f2" },
    50: { Name: "Ocean", Color: "000000" }, // 2007 USVI LC
    51: { Name: "Dry Allucial Evergreen Gallery Forest", Color: "61381c" },
    52: { Name: "Dry Alluvial Semideciduous Forest", Color: "783d2e" },
    53: { Name: "Dry Alluvial Shrubland", Color: "856924" },
    54: { Name: "Dry Alluvial Open Shrubland", Color: "dea354" },
    55: { Name: "Dry Alluvial Woodland", Color: "db7d24" },
    56: { Name: "Dry Limestone Evergreen Gallery Forest", Color: "66571a" },
    57: { Name: "Dry Limestone Semideciduous Forest", Color: "6e593b" },
    58: { Name: "Dry Limestone Shrubland", Color: "807a26" },
    59: { Name: "Dry Limestone Open Shrubland", Color: "ebcf47" },
    60: { Name: "Dry Limestone Woodland", Color: "c7a138" },
    61: { Name: "Dry Noncalcareous Evergreen Gallery Forest", Color: "59591a" },
    62: { Name: "Dry Noncalcareous Semideciduous Forest", Color: "616e3b" },
    63: { Name: "Dry Noncalcareous Shrubland", Color: "788026" },
    64: { Name: "Dry Noncalcareous Open Shrubland", Color: "bfc969" },
    65: { Name: "Dry Noncalcareous Woodland", Color: "9ead52" },
    66: {
      Name: "Lowland Moist Alluvial Evergreen Gallery Forest",
      Color: "003d00",
    },
    67: {
      Name: "Lowland Moist Noncalcareous Evergreen Forest",
      Color: "004d00",
    },
    68: {
      Name: "Lowland Moist Noncalcareous Evergreen Gallery Forest",
      Color: "2e361c",
    },
    69: { Name: "Lowland Moist Noncalcareous Shrubland", Color: "5c630f" },
    70: { Name: "Lowland Moist Noncalcareous Open Shrubland", Color: "96a33b" },
    71: { Name: "Lowland Moist Noncalcareous Woodland", Color: "4f5c26" },
    72: { Name: "Seasonally Flooded Nonsaline Forest", Color: "2e5c54" },
    73: { Name: "Seasonally Flooded Nonsaline Shrubland", Color: "3b736b" },
    74: { Name: "Seasonally Flooded Saline Forest", Color: "70294a" },
    75: { Name: "Seasonally Flooded Saline Shrubland", Color: "a62470" },
    76: { Name: "Mangrove Forest and Shrubland", Color: "6b2e6b" },
    77: { Name: "Dry Grassland and Pastures", Color: "f5f5db" },
    78: { Name: "Moist Grassland and Pastures", Color: "d9d978" },
    79: {
      Name: "Seasonally Flooded Herbaceous Nonsaline Wetlands",
      Color: "85c7a1",
    },
    80: {
      Name: "Seasonally Flooded Herbaceous Saline Wetlands",
      Color: "e3adba",
    },
    81: { Name: "Emergent Herbaceous Saline Wetlands", Color: "5cb582" },
    82: { Name: "Emergent Herbaceous Nonsaline Wetlands", Color: "d68594" },
    83: { Name: "Hay and Row Crops", Color: "ffbd42" },
    84: { Name: "Woody Agriculture and Plantations", Color: "e6a159" },
    85: { Name: "Artificial Barrens", Color: "6e121c" },
    86: { Name: "Fine to Medium Grained Sandy Beaches", Color: "ffff00" },
    87: { Name: "Gravel Beaches", Color: "bfbfbf" },
    88: { Name: "Mixed Sand and Gravel Beaches", Color: "dbdb00" },
    89: { Name: "Riparian and Other Natural Barrens", Color: "055e26" },
    90: { Name: "Riprap", Color: "545457" },
    91: { Name: "Rocky Cliffs and Shelves", Color: "808080" },
    92: { Name: "Salt and Mudflats", Color: "d9d9d9" },
    93: { Name: "Maintained Grassland", Color: "c7ded6" },
    94: { Name: "Low-density Urban Development", Color: "e00054" },
    95: { Name: "Medium-density Urban Development", Color: "bd0000" },
    96: { Name: "High-density Urban Development", Color: "822447" },
    97: { Name: "Aquaculture", Color: "0da1f2" },
    98: { Name: "Fresh Water", Color: "0000ff" },
    99: { Name: "Salt Water", Color: "360aa6" },
  };
  const prvi_lc_lookup = {};
  const prvi_lc_legend = {};
  const prvi_lc_palette = [];
  Object.keys(prvi_lc_dict).map(function (k) {
    prvi_lc_lookup[parseInt(k) + 1] = prvi_lc_dict[k]["Name"];
    prvi_lc_legend[prvi_lc_dict[k]["Name"]] = prvi_lc_dict[k]["Color"];
    prvi_lc_palette.push(prvi_lc_dict[k]["Color"]);
  });
  const prvi_bounds = {
    geodesic: false,
    type: "Polygon",
    coordinates: [
      [
        [-67.9754761385265, 17.64336610970855],
        [-64.53643398488734, 17.64336610970855],
        [-64.53643398488734, 18.54626790365004],
        [-67.9754761385265, 18.54626790365004],
        [-67.9754761385265, 17.64336610970855],
      ],
    ],
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

  // Batch Fill Collections
  ///////////////////////////////////////////////////////

  annualPDSI = batchFillCollection(annualPDSI, years).map(setSameDate);
  idsCollection = batchFillCollection(idsCollection, years).map(setSameDate);
  nlcdLC = batchFillCollection(nlcdLC, years).map(setSameDate);
  // nlcdLCMS = batchFillCollection(nlcdLCMS,years)
  mtbs = batchFillCollection(mtbs, years).map(setSameDate);
  cdl = batchFillCollection(cdl, years).map(setSameDate);
  nlcdTCC = batchFillCollection(nlcdTCC, years).map(setSameDate);
  nlcdImpv = batchFillCollection(nlcdImpv, years).map(setSameDate);

  nwi_hi_rast = batchFillCollection(
    ee.ImageCollection([nwi_hi_rast]),
    years
  ).map(setSameDate);

  // Format for Charting
  /////////////////////////////////////////

  // prvi_lc_collection = batchFillCollection(prvi_lc_collection,years).map(setSameDate);
  // prvi_winds = batchFillCollection(prvi_winds.select([0,1,2]),years).map(setSameDate);
  // prUSVI_ch_2018 = batchFillCollection(ee.ImageCollection([prUSVI_ch_2018]),years).map(setSameDate);
  let forCharting = joinCollections(
    mtbs.select([0], ["MTBS Burn Severity"]),
    annualPDSI.select([0], ["PDSI"]),
    false
  ); //cdl.select([0],['Cropland Data']),false);
  // forCharting  = joinCollections(forCharting,annualPDSI.select([0],['PDSI']), false);
  forCharting = joinCollections(forCharting, idsCollection, false);
  forCharting = joinCollections(
    forCharting,
    nlcdLC.select([0], ["NLCD Landcover"]),
    false
  );
  // forCharting  = joinCollections(forCharting,nlcdLCMS.select([0],['NLCD LCMS Landcover']), false);
  forCharting = joinCollections(
    forCharting,
    nlcdTCC.select([0], ["NLCD % Tree Canopy Cover"]),
    false
  );
  forCharting = joinCollections(
    forCharting,
    nlcdImpv.select([0], ["NLCD % Impervious"]),
    false
  );
  // forCharting  = joinCollections(forCharting,prvi_lc_collection.select([0],['PRVI Landcover']), false);
  // forCharting  = joinCollections(forCharting,prvi_winds, false);
  // forCharting  = joinCollections(forCharting,prUSVI_ch_2018, false);
  forCharting = joinCollections(forCharting, nwi_hi_rast, false);

  // console.log(forCharting.first().bandNames().getInfo())

  const chartTableDict = {
    "IDS Type": damage_codes,
    "IDS DCA": dca_codes,
    "MTBS Burn Severity": mtbsQueryClassDict,
    "NLCD Landcover": nlcdLCQueryDict,
    "NLCD LCMS Landcover": nlcdLCQueryDict,
    "Cropland Data": cdlQueryDict,
    PDSI: pdsiDict,
    "PRVI Landcover": prvi_lc_lookup,
    NWI: nwi_dict,
  };

  forCharting = forCharting.set("chartTableDict", chartTableDict);
  chartColors = chartColorsDict.ancillary;
  // chartCollection = forCharting;
  pixelChartCollections["anc"] = {
    label: "Ancillary",
    collection: forCharting,
    chartTableDict: chartTableDict,
  };
  populatePixelChartDropdown();

  // Bring in wayback

  turnOffLayersWhenTimeLapseIsOn = false; // Makes it so time lapses are shown with other layers
  let wayback = new esri_wayback();
  wayback.addWaybackUIContainer();
  wayback.initialize();
  // addChartJS(d,'test1');
}
