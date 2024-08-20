function runDashboard() {
  console.log("running dashboard");
  let tryDirs = [
    "./geojson/",
    "https://storage.googleapis.com/lcms-dashboard-fast/",
  ];
  let tryDirI = 0;
  let fipsDict = ee.Dictionary({
    "01": "AL",
    "02": "AK",
    "04": "AZ",
    "05": "AR",
    "06": "CA",
    "08": "CO",
    "09": "CT",
    10: "DE",
    11: "DC",
    12: "FL",
    13: "GA",
    15: "HI",
    16: "ID",
    17: "IL",
    18: "IN",
    19: "IA",
    20: "KS",
    21: "KY",
    22: "LA",
    23: "ME",
    24: "MD",
    25: "MA",
    26: "MI",
    27: "MN",
    28: "MS",
    29: "MO",
    30: "MT",
    31: "NE",
    32: "NV",
    33: "NH",
    34: "NJ",
    35: "NM",
    36: "NY",
    37: "NC",
    38: "ND",
    39: "OH",
    40: "OK",
    41: "OR",
    42: "PA",
    44: "RI",
    45: "SC",
    46: "SD",
    47: "TN",
    48: "TX",
    49: "UT",
    50: "VT",
    51: "VA",
    53: "WA",
    54: "WV",
    55: "WI",
    56: "WY",
  });
  let addedLayerCount = 0;

  let startYearT = parseInt(urlParams.startYear);
  let endYearT = parseInt(urlParams.endYear);
  let dashboardFolder =
    "projects/lcms-292214/assets/Dashboard-Data/Dashboard-Output-Summary-Areas/2023-9"; //'projects/lcms-292214/assets/Dashboard2';
  const summaries = ee.data
    .getList({
      id: dashboardFolder,
    })
    .map(function (t) {
      return t.id;
    });
  // console.log(summaries.length);
  // window.lcmsTS = ee.FeatureCollection('projects/lcms-292214/assets/CONUS-LCMS/TimeSync/CONUS_TimeSync_Annualized_Table_Merged_secLC_v2');

  huc6_conus = ee
    .FeatureCollection("USGS/WBD/2017/HUC06")
    .filter(
      ee.Filter.inList("states", ["CN", "MX", "AK", "AK,CN", "HI", "AS"]).not()
    );
  // Map.addLayer(huc6_conus,{layerType:'geeVectorImage'},'HUC06')
  let summaryAreas = {
    // "HUC 6": {
    //   path: "HUC06",
    //   color: "00E",
    //   unique_fieldname: "name",
    //   visible: false,
    //   title: "Level 06 hydrological unit codes (watersheds)",
    // },
    Counties: {
      path: "Counties",
      unique_fieldname: "NAME",
      visible: true,
      color: "EFE",
      title: "All counties throughout the US",
    },
    "Census Urban Areas": {
      path: "Census_Metro_Areas",
      unique_fieldname: "NAME10",
      visible: false,
      color: "E2E",
      title: "2018 US Census Bureau Urban Areas",
    },
    // CFLRP: {
    //   path: "CFLRP",
    //   color: "D0D",
    //   unique_fieldname: "PROJECTNAM",
    //   visible: false,
    //   title: "Collaborative Forest Restoration Program areas throughout the US",
    // },
    // "USFS Planning Units": {
    //   path: "LMPU",
    //   unique_fieldname: "LMPU_NAME",
    //   visible: false,
    //   color: "F88",
    //   title: "USFS planning areas",
    // },
    "USFS Forest Districts": {
      path: "Districts",
      unique_fieldname: "DISTRICTNA",
      visible: false,
      color: "FF8",
      title:
        "U.S. Department of Agriculture, Forest Service Forest District boundaries",
    },
    "USFS Forests": {
      path: "Forests",
      unique_fieldname: "FORESTNAME",
      visible: false,
      color: "8F8",
      title: "U.S. Department of Agriculture, Forest Service Forest boundaries",
    },
  };
  if (urlParams.onlyIncludeFacts == true) {
    summaryAreas = {};
  }
  if (
    urlParams.onlyIncludeFacts == true ||
    urlParams.includeFacts == true ||
    urlParams.beta === true
  ) {
    console.log("Including FACTS treatment polygons");
    summaryAreas["FACTS Fuel Treatments"] = {
      path: "FACTS_Fuel_Treatments",
      unique_fieldname: "treat_cat_yr",
      visible: true,
      color: "F8F",
      title: "FACTS Fuel Treatments",
    };
  }
  if (urlParams.layerViz == undefined || urlParams.layerViz == null) {
    urlParams.layerViz = {};
    Object.keys(summaryAreas).map((k) => {
      let kName = k.replaceAll(" ", "-");
      urlParams.layerViz[kName] = summaryAreas[k].visible;
    });
  } else {
    Object.keys(urlParams.layerViz).map((k) => {
      let t;
      if (urlParams.layerViz[k] == "true") {
        urlParams.layerViz[k] = true;
      } else if (urlParams.layerViz[k] == "false") {
        urlParams.layerViz[k] = false;
      }
    });
    Object.keys(summaryAreas).map((k) => {
      let kName = k.replaceAll(" ", "-");
      summaryAreas[k].visible = urlParams.layerViz[kName];
    });
  }

  let layerVizKeys = Object.keys(urlParams.layerViz);

  function loadGEESummaryAreas(summaryAreaObj, name) {
    path = summaryAreaObj.path;
    let summariesT = summaries.filter((f) => f.indexOf(path) > -1);
    // console.log(summariesT)
    summariesT = summariesT.filter((f) => f.indexOf("_wCIWtd_") > -1);
    // console.log(summariesT)
    if (summariesT.length > 0) {
      summariesT = summariesT.map((id) => {
        let f = ee.FeatureCollection(id);
        f = f.map((feat) => feat.set("Path", id));
        return f;
      });
      summariesT = ee.FeatureCollection(summariesT).flatten();
      if (name === "HUC 6") {
        summariesT = summariesT.map((f) =>
          f.set(
            summaryAreaObj.unique_fieldname,
            ee
              .String(f.get("name"))
              .cat(", ")
              .cat(ee.String(f.get("states")))
          )
        );
      }
      if (name === "Counties") {
        summariesT = summariesT.map((f) =>
          f.set(
            summaryAreaObj.unique_fieldname,
            ee
              .String(f.get("NAME"))
              .cat(", ")
              .cat(fipsDict.get(ee.String(f.get("STATEFP"))))
          )
        );
      }
      // if(name === 'FACTS Fuel Treatments'){
      //   summariesT=summariesT.map(f=>f.set(summaryAreaObj.unique_fieldname,ee.String(f.get('ACTIVITY_2')).cat(' - ').cat(ee.String(f.get('FACTS_ID'))).cat(' - ').cat(ee.Date(f.get('ACT_CREATE')).format('YYYY-MM-dd'))))
      // }
      Map.addLayer(
        summariesT,
        {
          strokeColor: summaryAreaObj.color,
          dashboardSummaryLayer: true,
          dashboardFieldName: summaryAreaObj.unique_fieldname,
          dashboardSummaryMode: "hybrid",
          strokeWeight: 1.5,
          title: summaryAreaObj.title,
        },
        name,
        summaryAreaObj.visible
      );
    }
  }

  let lcmsRun = {};
  lcmsRun.lcms = studyAreaDict[studyAreaName].final_collections;
  lcmsRun.lcms = ee.ImageCollection(
    ee
      .FeatureCollection(
        lcmsRun.lcms.map((f) =>
          ee
            .ImageCollection(f)
            .select(["Change", "Land_Cover", "Land_Use", ".*Probability.*"])
        )
      )
      .flatten()
  );

  //Get properties image
  lcmsRun.f = ee.Image(
    lcmsRun.lcms.filter(ee.Filter.notNull(["Change_class_names"])).first()
  );
  lcmsRun.props = lcmsRun.f.getInfo().properties;
  // console.log(lcmsRun.props)

  lcmsRun.lcms = lcmsRun.lcms.filter(
    ee.Filter.calendarRange(startYearT, endYearT, "year")
  );
  // console.log(lcmsRun.lcms.aggregate_histogram ('study_area').getInfo())

  //Mosaic all study areas
  lcmsRun.lcms = ee.List.sequence(startYearT, endYearT).map(function (yr) {
    const t = lcmsRun.lcms
      .filter(ee.Filter.calendarRange(yr, yr, "year"))
      .mosaic();
    return t
      .copyProperties(lcmsRun.f)
      .set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis());
  });
  lcmsRun.lcms = ee.ImageCollection(lcmsRun.lcms);
  let lcms_props = {
    Change_class_names: [
      "Stable",
      "Slow Loss",
      "Fast Loss",
      "Gain",
      "Non-Processing Area Mask",
    ],
    Change_class_palette: ["3d4551", "f39268", "d54309", "00a398", "1b1716"],
    Change_class_values: [1, 2, 3, 4, 5],
    Land_Cover_class_names: [
      "Trees",
      "Tall Shrubs & Trees Mix (SEAK Only)",
      "Shrubs & Trees Mix",
      "Grass/Forb/Herb & Trees Mix",
      "Barren & Trees Mix",
      "Tall Shrubs (SEAK Only)",
      "Shrubs",
      "Grass/Forb/Herb & Shrubs Mix",
      "Barren & Shrubs Mix",
      "Grass/Forb/Herb",
      "Barren & Grass/Forb/Herb Mix",
      "Barren or Impervious",
      "Snow or Ice",
      "Water",
      "Non-Processing Area Mask",
    ],
    Land_Cover_class_palette: [
      "005e00",
      "008000",
      "00cc00",
      "b3ff1a",
      "99ff99",
      "b30088",
      "e68a00",
      "ffad33",
      "ffe0b3",
      "ffff00",
      "aa7700",
      "d3bf9b",
      "ffffff",
      "4780f3",
      "1b1716",
    ],
    Land_Cover_class_values: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    ],
    Land_Use_class_names: [
      "Agriculture",
      "Developed",
      "Forest",
      "Non-Forest Wetland",
      "Other",
      "Rangeland or Pasture",
      "Non-Processing Area Mask",
    ],
    Land_Use_class_palette: [
      "efff6b",
      "ff2ff8",
      "1b9d0c",
      "97ffff",
      "a1a1a1",
      "c2b34a",
      "1b1716",
    ],
    Land_Use_class_values: [1, 2, 3, 4, 5, 6, 7],

    layerType: "Image",
  };
  let firstComparisonLayerI = false;
  ["Land_Cover", "Land_Use"].map((nm) => {
    // console.log(nm)
    let pre = lcmsRun.lcms
      .filter(ee.Filter.calendarRange(startYearT, startYearT + 2, "year"))
      .select([nm])
      .mode()
      .copyProperties(lcmsRun.f);
    let post = lcmsRun.lcms
      .filter(ee.Filter.calendarRange(endYearT - 2, endYearT, "year"))
      .select([nm])
      .mode()
      .copyProperties(lcmsRun.f);
    lcms_props.bandNames = [nm];
    Map.addLayer(
      pre,
      {
        autoViz: true,
        eeObjInfo: lcms_props,
        opacity: 0.3,
        layerType: "geeImage",
      },
      `${nm.replace("_", " ")} ${startYearT}-${startYearT + 2}`,
      firstComparisonLayerI,
      null,
      null,
      `Most common ${nm.replace("_", " ")} class from ${startYearT} to ${
        startYearT + 2
      }`,
      "reference-layer-list"
    );
    Map.addLayer(
      post,
      {
        autoViz: true,
        eeObjInfo: lcms_props,
        opacity: 0.1,
        layerType: "geeImage",
      },
      `${nm.replace("_", " ")} ${endYearT - 2}-${endYearT}`,
      firstComparisonLayerI,
      null,
      null,
      `Most common ${nm.replace("_", " ")} class from ${
        endYearT - 2
      } to ${endYearT}`,
      "reference-layer-list"
    );

    firstComparisonLayerI = false;
  });

  let lossYearPalette = "ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02";
  let gainYearPalette = "c5ee93,00a398";

  let code_dict = {
    2: {
      label: "Slow Loss",
      palette: lossYearPalette,
      visible: true,
    },
    3: {
      label: "Fast Loss",
      palette: lossYearPalette,
      visible: true,
    },
    4: {
      label: "Gain",
      palette: gainYearPalette,
      visible: false,
    },
  };
  Object.keys(code_dict).map((k) => {
    let changeT = lcmsRun.lcms
      .filter(ee.Filter.calendarRange(startYearT, endYearT, "year"))
      .select(["Change"]);
    changeT = changeT
      .map((img) =>
        ee.Image.constant(ee.Number(img.date().get("year")))
          .int16()
          .updateMask(img.eq(ee.Image(parseInt(k))))
      )
      .max();
    Map.addLayer(
      changeT,
      {
        min: startYearT,
        max: endYearT,
        palette: code_dict[k].palette,
        layerType: "geeImage",
      },
      code_dict[k].label,
      code_dict[k].visible,
      null,
      null,
      ``,
      "reference-layer-list"
    );
  });

  Object.keys(summaryAreas).map((k) => {
    loadGEESummaryAreas(summaryAreas[k], k);
  });

  // if no share link in play, then call selectQuestion
  if (!deepLink) {
    selectQuestion(questionDict[urlParams.questionVar]);
  }

  // Keep track of which layers are being viewed
  $(".layer-checkbox,.layer-span").click((event) => {
    setTimeout(() => {
      Object.keys(layerObj).map((k) => {
        let nm = layerObj[k].name.replaceAll(" ", "-");
        if (layerVizKeys.indexOf(nm) > -1) {
          urlParams.layerViz[nm] = layerObj[k].visible;
        }
      });
    }, 1000);
  });
  setTimeout(() => {
    dashboardSelectionModeChange();
    if (dashboardAreaSelectionMode !== "View-Extent") {
      $("#introModal-body").append(
        '<p style="font-weight:bold;font-size:1.5rem;">Click on map to select summary areas</p>'
      );
    }
  }, 100);
}
