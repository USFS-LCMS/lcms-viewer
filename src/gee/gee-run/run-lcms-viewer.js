function runGTAC() {
  if (urlParams.dynamic) {
    runDynamic();
  } else {
    defaultQueryDateFormat = "YYYY";
    //Set up some params
    startYear = parseInt(urlParams.startYear);
    endYear = parseInt(urlParams.endYear);

    analysisMode = urlParams.analysisMode;
    queryClassDict = {};
    var years = range(startYear, endYear + 1);
    summaryMethod = urlParams.summaryMethod.toTitle();
    getLCMSVariables();

    const addLayerFun =
      urlParams.addLCMSTimeLapsesOn === "yes" ? Map.addTimeLapse : Map.addLayer;
    const timeLapseEnding =
      urlParams.addLCMSTimeLapsesOn === "yes" ? " Time-Lapse" : "";

    ga(
      "send",
      "event",
      "lcms-gtac-viewer-run",
      "year_range",
      `${startYear}_${endYear}`
    );
    ga("send", "event", "lcms-gtac-viewer-run", "analysis_mode", analysisMode);
    ga(
      "send",
      "event",
      "lcms-gtac-viewer-run",
      "timelapse_on",
      urlParams.addLCMSTimeLapsesOn
    );
    ga(
      "send",
      "event",
      "lcms-gtac-viewer-run",
      "summary_method",
      summaryMethod
    );
    // setupDownloads(studyAreaName);
    const clientBoundary = clientBoundsDict.CONUS_SEAK;

    const lcmsRun = {};
    const lcmsRunFuns = {};

    //Bring in ref layers
    getHansen();

    let whp = ee
      .ImageCollection(
        "projects/lcms-292214/assets/CONUS-Ancillary-Data/RMRS_Wildfire_Hazard_Potential"
      )
      .mosaic()
      .rename(["whp"]);
    let whpObjInfo = {
      bandNames: ["whp"],

      whp_class_names: [
        "Very Low",
        "Low",
        "Moderate",
        "High",
        "Very High",
        "Non-burnable",
        "Water",
      ],
      whp_class_palette: [
        "38A800",
        "D1FF73",
        "FFFF00",
        "FFAA00",
        "FF0000",
        "B2B2B2",
        "0070FF",
      ],
      whp_class_values: [1, 2, 3, 4, 5, 6, 7],
    };
    whp = whp.set(whpObjInfo);
    Map.addLayer(
      whp,
      { autoViz: true, eeObjInfo: whpObjInfo },
      "Wildfire Hazard Potential 2020",
      false,
      null,
      null,
      "The wildfire hazard potential (WHP) map is a raster geospatial product produced by the USDA Forest Service, Fire Modeling Institute that can help to inform evaluations of wildfire hazard or prioritization of fuels management needs across very large landscapes",
      "reference-layer-list"
    );
    try {
      // getMTBSandIDS();
      let IDS = getIDSCollectionAddToMap("reference-layer-list");

      let idsCollection = IDS[0].select([1, 0], ["IDS Type", "IDS DCA"]);

      getMTBS(true, false, "reference-layer-list", false);
    } catch (err) {
      console.log(err);
    }

    const nwi_obj_info = {
      Wetland_Class_class_names: [
        "Freshwater Forested/Shrub Wetland",
        "Freshwater Emergent Wetland",
        "Freshwater Pond",
        "Estuarine and Marine Wetland",
        "Riverine",
        "Lake",
        "Estuarine and Marine Deepwater",
        "Other",
      ],
      Wetland_Class_class_palette: [
        "008837",
        "7FC31C",
        "688CC0",
        "66C2A5",
        "0190BF",
        "13007C",
        "007C88",
        "B28653",
      ],
      Wetland_Class_class_values: [1, 2, 3, 4, 5, 6, 7, 8],
      bandNames: ["Wetland_Class"],
      study_area: "CONUS",
    };
    const nwi = ee
      .ImageCollection("projects/lcms-292214/assets/Ancillary/NWI")
      .mosaic()
      .set(nwi_obj_info);
    Map.addLayer(
      nwi,
      { autoViz: true, eeObjInfo: nwi_obj_info },
      "National Wetland Inventory",
      false,
      null,
      null,
      "Fish and Wildlife Service National Wetland Inventory Data",
      "reference-layer-list"
    );

    //Set up some params
    startYear = parseInt(urlParams.startYear);
    endYear = parseInt(urlParams.endYear);

    analysisMode = urlParams.analysisMode;
    queryClassDict = {};
    var years = range(startYear, endYear + 1);
    summaryMethod = urlParams.summaryMethod.toTitle();
    getLCMSVariables();

    lcmsRun.thematicChangeYearBuffer = 5;
    lcmsRun.years = range(startYear, endYear + 1);

    lcmsRun.summaryMethodDescriptionDict = {
      Year: "of most recent",
      Prob: "of most probable",
    };
    lcmsRun.minGainProb = [
      studyAreaDict[studyAreaName].conusGainThresh,
      studyAreaDict[studyAreaName].akGainThresh,
    ].min();
    lcmsRun.minSlowLossProb = [
      studyAreaDict[studyAreaName].conusSlowLossThresh,
      studyAreaDict[studyAreaName].akSlowLossThresh,
    ].min();
    lcmsRun.minFastLossProb = [
      studyAreaDict[studyAreaName].conusFastLossThresh,
      studyAreaDict[studyAreaName].akFastLossThresh,
    ].min();
    lcmsRunFuns.getMaskedWYr = function (c, code) {
      return c.map(function (img) {
        const yr = ee.Date(img.get("system:time_start")).get("year");
        const yrImg = ee.Image(yr).int16().rename(["Year"]);
        return img
          .addBands(yrImg)
          .updateMask(img.select([0]).eq(code))
          .copyProperties(img, ["system:time_start"]);
      });
    };

    lcmsRun.lcms = ee
      .ImageCollection(studyAreaDict[studyAreaName].final_collections[0])
      .select(["Change", "Land_Cover", "Land_Use", ".*Probability.*"]);

    lcmsRun.lcms;
    const newBns = lcmsRun.lcms.first().bandNames();

    let lcms_older = ee
      .ImageCollection(studyAreaDict[studyAreaName].older_final_collections[0])
      .select(["Change", "Land_Cover", "Land_Use", ".*Probability.*"])
      .filter(ee.Filter.inList("study_area", ["HAWAII", "PRUSVI"]));

    if (urlParams["2023-9"] === true) {
      const bns = ["Land_Use", "Land_Cover", "Change"];
      bns.map((b) => {
        const bt = b.replaceAll("_", " ");
        levelObj.oldObjInfo.bandNames = [b];
        Map.addLayer(
          lcms_older.select([b]),
          {
            autoViz: true,
            eeObjInfo: levelObj.oldObjInfo,
            labelClasses: "layer-label-lcms",
            labelIconHTML: `<img class="panel-title-svg-xsm" alt="LCMS icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer.svg">`,
          },
          `${bt} v2023.9 (HI and PRUSVI only)`,
          false
        );
      });
    }
    const oldBns = lcms_older
      .first()
      .bandNames()
      .remove("Land_Use_Raw_Probability_Non-Forest-Wetland");

    let olderChangeRemapFrom = [1, 2, 3, 4, 5];
    let olderChangeRemapTo = [15, 12, 13, 14, 16];

    lcms_older = lcms_older
      .map((img) =>
        img
          .addBands(
            img
              .select(["Change"])
              .remap(olderChangeRemapFrom, olderChangeRemapTo)
              .rename(["Change"]),
            null,
            true
          )
          .addBands(
            img
              .select(["Land_Use"])
              .remap([1, 2, 3, 4, 5, 6, 7], [1, 2, 3, 4, 4, 5, 6])
              .rename(["Land_Use"]),
            null,
            true
          )
      )
      .select(oldBns, newBns);
    lcmsRun.lcms = ee.ImageCollection(lcmsRun.lcms).merge(lcms_older);

    lcmsRun.lcms = lcmsRun.lcms.filter(
      ee.Filter.calendarRange(startYear, endYear, "year")
    );
    lcmsRun.f = lcmsRun.lcms
      .filter(ee.Filter.notNull(["Change_class_names"]))
      .first();
    //Mosaic all study areas
    lcmsRun.lcms = ee.List.sequence(startYear, endYear).map(function (yr) {
      const t = lcmsRun.lcms
        .filter(ee.Filter.calendarRange(yr, yr, "year"))
        .mosaic();
      return (
        t
          // .copyProperties(lcmsRun.f)
          .set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis())
      );
    });
    lcmsRun.lcms = ee.ImageCollection(lcmsRun.lcms);

    //Get properties image

    lcmsRun.forProps = lcmsRun.lcms.filter(
      ee.Filter.notNull(["Change_class_names"])
    );

    const lcLevelInfo = levelObj.getLevelNRemap(
      landCoverLevel,
      (bandName = "Land_Cover")
    );
    const luLevelInfo = levelObj.getLevelNRemap(
      landUseLevel,
      (bandName = "Land_Use")
    );
    const cLevelInfo = levelObj.getLevelNRemap(
      changeLevel,
      (bandName = "Change")
    );

    lcmsRun.props = Object.assign(
      {},
      luLevelInfo.viz_dict,
      lcLevelInfo.viz_dict,
      cLevelInfo.viz_dict
    );
    // console.log(lcmsRun.props);

    lcmsRun.props.size = lcmsRun.years.length;

    // let change_attribution_bn = "Change";
    // let lcmsAttr = ee
    //   .ImageCollection(
    //     "projects/lcms-292214/assets/CONUS-LCMS/Landcover-Landuse-Change/v2023-9/v2023-9-Cause_of_Change"
    //   )
    //   .filter(ee.Filter.calendarRange(startYear, endYear, "year"))
    //   .select([0], [change_attribution_bn]);

    // let lastCOCYear = 2023;
    // if (endYear < lastCOCYear) {
    //   lastCOCYear = endYear;
    // }
    // lcmsRun.COCYears = range(startYear, lastCOCYear + 1);
    // let cocObjInfo = {
    //   Cause_of_Change_class_names: [
    //     "Wildfire",
    //     "Prescribed Burn",
    //     "Large Timber Harvest", //"Timber Harvest or other tree loss disturbance agent > 1.5 hectare",
    //     "Small Timber Harvest", //"Timber Harvest or other tree loss disturbance agent < 1.5 hectare",
    //     "Large Timber Harvest Protected", //"Timber Harvest or other tree loss disturbance agent > 1.5 hectare in protected lands",
    //     "Small Timber Harvest Protected", //"Timber Harvest or other tree loss disturbance agent < 1.5 hectare in protected lands",
    //     "Low Magnitude Tree Loss",
    //     "Tropical Cyclone",
    //     "Wind",
    //     "Desiccation",
    //     "Inundation",
    //     "Drought Stress", //, Timber Harvest or other disturbance agent",
    //     "Non-tree Fast Loss", //"Other Fast Disturbance Agent in non-treed landscape",
    //     "Low Mag Stress", //Insect, Disease or Climate Stress low magnitude loss",
    //     "Hi Mag Stress", //"Insect, Disease or Climate Stress high magnitude loss",
    //     "Non-tree Slow Loss", //"Other Slow Loss in non-treed landscape",
    //     "Gain",
    //     "Stable",
    //     "Non-processing area",
    //   ],
    //   Cause_of_Change_class_palette: [
    //     "D54309",
    //     "AD3100",
    //     "FFFF00",
    //     "C6C600",
    //     "B7A18E",
    //     "A48870",
    //     "8B7058",
    //     "FFB6C1",
    //     "FF8397",
    //     "CFD9FA",
    //     "8692BF",
    //     "C2C26D",
    //     "D2D25D",
    //     "F7B99F",
    //     "F39268",
    //     "f07844",
    //     "00A398",
    //     "3d4551",
    //     "1b1716",
    //   ],
    //   Cause_of_Change_class_values: [
    //     1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    //   ],
    //   bandNames: [change_attribution_bn],

    //   size: lcmsRun.COCYears.length,
    // };
    // cocObjInfo.Cause_of_Change_class_values;
    // //  "1.1.1.1.1": [1, "D54599", "Wind"],
    // //     "1.1.1.1.2": [2, "D5ACAC", "Hurricane"],
    // //     "1.1.1.2.1": [3, "2C58A9", "Inundation"],
    // //     "1.1.1.3.1": [4, "D5C33C", "Desiccation"],
    // //     "1.1.1.4.1": [5, "FFCCB4", "Prescribed Fire"],
    // //     "1.1.1.4.2": [6, "D54309", "Wildfire"],
    // //     "1.1.1.5.1": [7, "D5C08B", "Mechanical Land Transformation"],
    // //     "1.1.1.6.1": [8, "D55555", "Tree Removal"],
    // //     "1.1.2.1.1": [9, "F3C165", "Defoliation"],
    // //     "1.1.2.1.2": [10, "F3C199", "Southern Pine Beetle"],
    // //     "1.1.2.1.3": [11, "F39268", "Insect, Disease or Drought Stress"],
    // //     "1.1.1.7.1": [12, "C291D5", "Other Loss"],
    // //     "2.1.1.1.1": [13, "00A398", "Vegetation Growth"],
    // //     "2.2.1.1.1": [14, "3D4551", "Stable"],
    // //     "3.1.1.1.1": [15, "1B1716", "Non-Processing Area Mask"],

    // let cocCrosswalk = [
    //   14, // "Stable -> Stable",
    //   6, // "Wildfire -> Wildfire",
    //   5, // "Prescribed Burn -> Prescribed Fire",
    //   8, // "Large Timber Harvest -> Tree Removal", //"Timber Harvest or other tree loss disturbance agent > 1.5 hectare",
    //   8, // "Small Timber Harvest -> Tree Removal", //"Timber Harvest or other tree loss disturbance agent < 1.5 hectare",
    //   12, // "Large Timber Harvest Protected -> Other Vegetation Loss", //"Timber Harvest or other tree loss disturbance agent > 1.5 hectare in protected lands",
    //   12, // "Small Timber Harvest Protected -> Other Vegetation Loss", //"Timber Harvest or other tree loss disturbance agent < 1.5 hectare in protected lands",
    //   12, // ??? "Low Magnitude Tree Loss -> Other Vegetation Loss",
    //   2, // "Tropical Cyclone -> Hurricane",
    //   1, // "Wind -> Tornado or Wind",
    //   4, // "Desiccation -> Water Desiccation",
    //   3, // "Inundation -> Water Inundation",
    //   11, // ??? "Drought Stress -> Insect, Disease or Drought Stress", //, Timber Harvest or other disturbance agent",
    //   7, // ??? "Non-tree Fast Loss -> Mechanical Land Transformation", //"Other Fast Disturbance Agent in non-treed landscape",
    //   11, // "Low Mag Stress -> Defoliation" can also be 11 (Insect, Disease, or Drought Stress), //Insect, Disease or Climate Stress low magnitude loss",
    //   11, // "Hi Mag Stress -> Insect, Disease or Drought Stress", //"Insect, Disease or Climate Stress high magnitude loss",
    //   11, // ??? "Non-tree Slow Loss -> Insect, Disease or Drought Stress", //"Other Slow Loss in non-treed landscape",
    //   13, // "Gain -> Vegetation Growth",
    //   15, // "Non-processing area -> Non-Processing Area Mask",
    // ];

    // lcmsAttr = lcmsAttr.map((img) => {
    //   return img
    //     .remap(
    //       [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    //       cocCrosswalk,
    //       null,
    //       change_attribution_bn
    //     )
    //     .rename([change_attribution_bn])
    //     .copyProperties(img, ["system:time_start"]);
    // });
    // Map.addLayer(lcmsAttr, {}, "COC");
    // Map.turnOnInspector();
    // lcmsAttr = lcmsAttr.map((img) => {
    //   let out = img.where(img.eq(19).or(img.eq(0)), 20);
    //   out = out.where(img.eq(1), 19).subtract(1);
    //   return out.set(cocObjInfo).copyProperties(img, ["system:time_start"]);
    // });
    // const lcmsAttrCopy = lcmsAttr;
    if (urlParams.causeOfChangeMode === "hide") {
      lcmsRun.lcms = lcmsRun.lcms.map((img) => {
        img = img.updateMask(img.lt(15));
        return img;
      });
    }

    // if (urlParams.beta === true || analysisMode === "advanced") {
    window.tccLayerStyling = {
      labelClasses: "layer-label-tcc",
      labelIconHTML: `<img class="panel-title-svg-xsm" alt="NLCD TCC icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer_tcc.svg">`,
    };
    let minTCCYear = 1985;
    let maxTCCYear = 2023;

    minTCCYear = startYear > minTCCYear ? startYear : minTCCYear;
    maxTCCYear = endYear < maxTCCYear ? endYear : maxTCCYear;
    window.nlcdTCCYrs = range(minTCCYear, maxTCCYear + 1);

    const nlcdTCC2023 = ee
      .ImageCollection("projects/nlcd-tcc/assets/Final_Outputs/2023-5")
      .filter(ee.Filter.calendarRange(minTCCYear, maxTCCYear, "year"));
    const nlcdTCC2021 = ee
      .ImageCollection("USGS/NLCD_RELEASES/2021_REL/TCC/v2021-4")
      .filter(ee.Filter.calendarRange(minTCCYear, maxTCCYear, "year"))
      .filter(ee.Filter.inList("study_area", ["AK", "HAWAII", "PRUSVI"]));
    const tccBns = nlcdTCC2023.first().bandNames();
    const tccDummy = nlcdTCC2023.first();

    window.nlcdTCC = ee.ImageCollection(
      ee.List.sequence(minTCCYear, maxTCCYear, 1).map((yr) =>
        ee
          .ImageCollection(
            ee
              .FeatureCollection([
                fillEmptyCollections(
                  nlcdTCC2023.filter(ee.Filter.calendarRange(yr, yr, "year")),
                  tccDummy
                ),
                fillEmptyCollections(
                  nlcdTCC2021.filter(ee.Filter.calendarRange(yr, yr, "year")),
                  tccDummy
                ),
              ])
              .flatten()
          )
          .mosaic()
          .set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis())
      )
    );

    const studyAreas = ["CONUS"];
    areaChart.addLayer(
      nlcdTCC.select([0, 2]),
      {
        palette: "080,0D0",
        xAxisLabels: nlcdTCCYrs,
        eeObjInfo: {
          bandNames: [
            "Science_Percent_Tree_Canopy_Cover",
            "NLCD_Percent_Tree_Canopy_Cover",
          ],

          size: nlcdTCCYrs.length * studyAreas.length,
        },
      },
      "NLCD TCC"
    );

    let tccMin = 1;
    let tccMax = 80;
    let tccPalette = "FFF,080";
    let tcclegendLabelLeftAfter = "% TCC";
    let tcclegendLabelRightAfter = "% TCC";
    let tccNameEnding = " Time-Lapse";
    let tccLayer = nlcdTCC.select([0, 2]); //.map((img) => img.selfMask());
    let tccDescription = `Annual Tree Canopy Cover from ${minTCCYear} to ${maxTCCYear}. Each value indicates the percentage of the pixel covered by tree canopy.`;
    if (urlParams.addLCMSTimeLapsesOn === "no") {
      tccNameEnding = "";
      tccDescription = `Average Tree Canopy Cover from ${minTCCYear} to ${maxTCCYear} (map). Each value indicates the percentage of the pixel covered by tree canopy. Pixel and Area Tools will show full time series of data from ${minTCCYear} to ${maxTCCYear}.`;
    }
    if (analysisMode === "advanced" && urlParams.addLCMSTimeLapsesOn === "no") {
      addLayerFun(
        tccLayer.filter(
          ee.Filter.calendarRange(
            minTCCYear,
            minTCCYear + lcmsRun.thematicChangeYearBuffer,
            "year"
          )
        ),
        {
          min: tccMin,
          max: tccMax,
          bands: ["NLCD_Percent_Tree_Canopy_Cover"],
          palette: tccPalette,
          selfMask: true,
          legendLabelLeftAfter: tcclegendLabelLeftAfter,
          legendLabelRightAfter: tcclegendLabelRightAfter,
          xAxisLabels: nlcdTCCYrs,
          reducer: ee.Reducer.mean(),
          title: `Average Tree Canopy Cover from ${minTCCYear} to ${
            minTCCYear + lcmsRun.thematicChangeYearBuffer
          } (map). Each value indicates the percentage of the pixel covered by tree canopy. Pixel Tools -> Query Visible Map Layers will show data from ${minTCCYear} to ${
            minTCCYear + lcmsRun.thematicChangeYearBuffer
          } while Pixel Tools -> Query LCMS Time Series and all Area Tools will show full time series of data from ${minTCCYear} to ${maxTCCYear}.`,
          eeObjInfo: {
            bandNames: [
              "Science_Percent_Tree_Canopy_Cover",
              "NLCD_Percent_Tree_Canopy_Cover",
            ],

            size: nlcdTCCYrs.length,
          },
          years: nlcdTCCYrs,
          queryParams: { palette: ["080", "0D0"] },

          labelClasses: tccLayerStyling.labelClasses,
          labelIconHTML: tccLayerStyling.labelIconHTML,
        },
        `TCC Start`,
        false
      );

      addLayerFun(
        tccLayer.filter(
          ee.Filter.calendarRange(
            maxTCCYear - lcmsRun.thematicChangeYearBuffer,
            maxTCCYear,
            "year"
          )
        ),
        {
          min: tccMin,
          max: tccMax,
          bands: ["NLCD_Percent_Tree_Canopy_Cover"],
          palette: tccPalette,
          selfMask: true,
          legendLabelLeftAfter: tcclegendLabelLeftAfter,
          legendLabelRightAfter: tcclegendLabelRightAfter,
          xAxisLabels: nlcdTCCYrs,
          reducer: ee.Reducer.mean(),
          title: `Average Tree Canopy Cover from ${
            maxTCCYear - lcmsRun.thematicChangeYearBuffer
          } to ${maxTCCYear} (map). Each value indicates the percentage of the pixel covered by tree canopy. Pixel Tools -> Query Visible Map Layers will show data from ${
            maxTCCYear - lcmsRun.thematicChangeYearBuffer
          } to ${maxTCCYear} while Pixel Tools -> Query LCMS Time Series and all Area Tools will show full time series of data from ${minTCCYear} to ${maxTCCYear}.`,
          eeObjInfo: {
            bandNames: [
              "Science_Percent_Tree_Canopy_Cover",
              "NLCD_Percent_Tree_Canopy_Cover",
            ],

            size: nlcdTCCYrs.length,
          },
          years: nlcdTCCYrs,
          queryParams: { palette: ["080", "0D0"] },

          labelClasses: tccLayerStyling.labelClasses,
          labelIconHTML: tccLayerStyling.labelIconHTML,
        },
        `TCC End`,
        false
      );
    } else {
      addLayerFun(
        tccLayer,
        {
          min: tccMin,
          max: tccMax,
          bands: ["NLCD_Percent_Tree_Canopy_Cover"],
          palette: tccPalette,
          selfMask: true,
          legendLabelLeftAfter: tcclegendLabelLeftAfter,
          legendLabelRightAfter: tcclegendLabelRightAfter,
          xAxisLabels: nlcdTCCYrs,
          reducer: ee.Reducer.mean(),
          title: tccDescription,
          eeObjInfo: {
            bandNames: [
              "Science_Percent_Tree_Canopy_Cover",
              "NLCD_Percent_Tree_Canopy_Cover",
            ],

            size: nlcdTCCYrs.length,
          },
          years: nlcdTCCYrs,
          queryParams: { palette: ["080", "0D0"] },

          labelClasses: tccLayerStyling.labelClasses,
          labelIconHTML: tccLayerStyling.labelIconHTML,
        },
        `TCC${tccNameEnding}`,
        false
      );
    }

    // if (urlParams.beta === true || analysisMode === "advanced") {
    nlcdTCC = nlcdTCC.select([0]);
    const changeTCCRemap = levelObj.getLevelNRemap(1, "Change");

    lcmsRun.lcmsTCCRemapped = lcmsRun.lcms.map((img) => {
      return img
        .select(["Change"])
        .remap(
          changeTCCRemap.remap_from,
          changeTCCRemap.remap_to,
          null,
          "Change"
        )
        .rename(["Change"]);
    });

    let changeNames = changeTCCRemap.viz_dict.Change_class_names;
    let changeValues = changeTCCRemap.viz_dict.Change_class_values;

    let tccGain = [];
    let tccLoss = [];
    for (let i = 0; i < nlcdTCCYrs.length - 1; i++) {
      const yr1 = nlcdTCCYrs[i];
      const yr2 = nlcdTCCYrs[i + 1];
      // console.log(`${yr1}-${yr2}`);
      const nlcdTCCPre = ee.Image(
        nlcdTCC.filter(ee.Filter.calendarRange(yr1, yr1, "year")).first()
      );
      const nlcdTCCPost = ee.Image(
        nlcdTCC.filter(ee.Filter.calendarRange(yr2, yr2, "year")).first()
      );
      const changePost = lcmsRun.lcmsTCCRemapped
        .filter(ee.Filter.calendarRange(yr2, yr2, "year"))
        .first();

      const diff = nlcdTCCPost
        .subtract(nlcdTCCPre)
        .set("system:time_start", ee.Date.fromYMD(yr2, 6, 1).millis());

      tccGain.push(diff.updateMask(changePost.eq(2)));
      tccLoss.push(diff.updateMask(changePost.eq(1)));
    }
    tccGain = ee.ImageCollection(tccGain);
    tccLoss = ee.ImageCollection(tccLoss);

    Map.addLayer(
      tccLoss,
      {
        reducer: ee.Reducer.sum(),
        min: -70,
        max: -1,
        palette: ["A10018", "D54309", "FAFA4B", "F39268"], //, "C291D5"], //copyArray(palettes.misc.coolwarm[7]).reverse(), //"D00,F5DEB3,006400",
        title:
          "Total of all decreases in Tree Canopy Cover (TCC) that fall within LCMS disturbance or vegetation growth areas",
        legendLabelLeftAfter: "% TCC",
        legendLabelRightAfter: "% TCC",
        labelClasses: tccLayerStyling.labelClasses,
        labelIconHTML: tccLayerStyling.labelIconHTML,
      },
      "TCC Decrease",
      false
    );
    Map.addLayer(
      tccGain,
      {
        reducer: ee.Reducer.sum(),
        min: 1,
        max: 30,
        opacity: 1,
        selfMask: true,
        palette: ["888", "4BAAB3", "00A398", "00EEDE"], //copyArray(palettes.misc.coolwarm[7]).reverse(), //"D00,F5DEB3,006400",
        title:
          "Total of all increases in Tree Canopy Cover (TCC) that fall within LCMS disturbance or vegetation growth areas",
        legendLabelLeftAfter: "% TCC",
        legendLabelRightAfter: "% TCC",
        labelClasses: tccLayerStyling.labelClasses,
        labelIconHTML: tccLayerStyling.labelIconHTML,
      },
      "TCC Increase",
      false
    );
    // addLayerFun(
    //   lcmsAttr,
    //   {
    //     title: `The minimum value of the cause of change from ${startYear} to ${endYear}, assigned using a rule-based classifier within the hierarchy found in the legend`,
    //     autoViz: true,
    //     queryParams: { palette: ["00897b"] },
    //     eeObjInfo: cocObjInfo,
    //     reducer: ee.Reducer.min(),
    //     years: lcmsRun.COCYears,
    //     labelClasses: "layer-label-lcms",
    //     labelIconHTML: `<img class="panel-title-svg-xsm" alt="LCMS icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer.svg">`,
    //   },
    //   `Cause of Change (beta) ${timeLapseEnding}`,
    //   false
    // );
    // lcmsRun.lcmsLinked = lcmsRun.lcms.linkCollection(
    //   lcmsAttr,
    //   [change_attribution_bn],
    //   null,
    //   "system:time_start"
    // );

    lcmsRun.lcmsRemapped = lcmsRun.lcms.map(
      (img) => {
        const change = img
          .select(["Change"])
          .remap(cLevelInfo.remap_from, cLevelInfo.remap_to, null, "Change")
          .rename(["Change"]);

        const lc = img
          .select(["Land_Cover"])
          .remap(
            lcLevelInfo.remap_from,
            lcLevelInfo.remap_to,
            null,
            "Land_Cover"
          )
          .rename(["Land_Cover"]);

        const lu = img
          .select(["Land_Use"])
          .remap(luLevelInfo.remap_from, luLevelInfo.remap_to, null, "Land_Use")
          .rename(["Land_Use"]);
        return ee.Image.cat([change, lc, lu]).set(lcmsRun.props);
      }
      // img
      //   .addBands(
      //     img
      //       .remap(
      //         lcLevelInfo.remap_from,
      //         lcLevelInfo.remap_to,
      //         null,
      //         "Land_Cover"
      //       )
      //       .rename(["Land_Cover"]),
      //     null,
      //     true
      //   )
      //   .addBands(
      //     img
      //       .remap(
      //         luLevelInfo.remap_from,
      //         luLevelInfo.remap_to,
      //         null,
      //         "Land_Use"
      //       )
      //       .rename(["Land_Use"]),
      //     null,
      //     true
      //   )
      //   .addBands(
      //     img
      //       .remap(cLevelInfo.remap_from, cLevelInfo.remap_to, null, "Change")
      //       .rename(["Change"]),
      //     null,
      //     true
      //   )
      //   .set(lcmsRun.props)
    );
    // console.log(cLevelInfo);
    //Bring in time-lapses

    //Mask out stable and non processing area mask for change time-lapse
    const changeClassValues = lcmsRun.props["Change_class_values"];
    let changeVisibility = changeClassValues.map((v) => true);
    changeVisibility[changeVisibility.length - 2] = false;
    changeVisibility[changeVisibility.length - 1] = false;
    // console.log(changeVisibility);
    // const changeClassMin = changeClassValues[0];
    // const changeClassMax = changeClassValues[changeClassValues.length - 1];

    // lcmsRun.tlChange = lcmsRun.lcmsRemapped
    //   .select(["Change"])
    //   .map(function (img) {
    //     return img
    //       .updateMask(img.gt(changeClassMin).and(img.lt(changeClassMax)))
    //       .copyProperties(img);
    //   });
    // lcmsRun.tlLC = lcmsRun.lcms.select(["Land_Cover"]); //.map(function(img){return img.updateMask(img.lt(15)).copyProperties(img)});
    // lcmsRun.tlLU = lcmsRun.lcms.select(["Land_Use"]); //.map(function(img){return img.updateMask(img.lt(7)).copyProperties(img)});

    // if (urlParams.addLCMSTimeLapsesOn === "yes") {
    //   lcmsRun.props.bandNames = ["Change"];
    //   Map.addTimeLapse(
    //     lcmsRun.tlChange,
    //     {
    //       autoViz: true,
    //       eeObjInfo: lcmsRun.props,
    //       years: lcmsRun.years,
    //       labelClasses: "layer-label-lcms",
    //       labelIconHTML: `<img class="panel-title-svg-xsm" alt="LCMS icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer.svg">`,
    //       includeClassValues: false,
    //     },
    //     "Change Time-Lapse",
    //     true
    //   );
    //   // lcmsRun.props.bandNames = ["Land_Cover"];
    //   // Map.addTimeLapse(lcmsRun.tlLC, { autoViz: true, eeObjInfo: lcmsRun.props, years: lcmsRun.years }, "LCMS Land Cover Time-Lapse", false);
    //   // lcmsRun.props.bandNames = ["Land_Use"];
    //   // Map.addTimeLapse(lcmsRun.tlLU, { autoViz: true, eeObjInfo: lcmsRun.props, years: lcmsRun.years }, "LCMS Land Use Time-Lapse", false);
    // }
    //Bring in two periods of land cover and land use if advanced, otherwise just bring in a single mode
    ["Land_Use", "Land_Cover", "Change"].map((b) => {
      let tTitle = b.replaceAll("_", " ");
      lcmsRun.props.bandNames = [b];
      const reducer = b === "Change" ? ee.Reducer.min() : ee.Reducer.mode();
      const reducerName =
        b === "Change" ? "Lowest Change class value" : "Most common";
      const visibilityT = b === "Change" ? true : false;
      if (
        analysisMode === "advanced" &&
        urlParams.addLCMSTimeLapsesOn === "no"
      ) {
        Map.addLayer(
          lcmsRun.lcmsRemapped
            .select([b])
            .filter(
              ee.Filter.calendarRange(
                startYear,
                startYear + lcmsRun.thematicChangeYearBuffer,
                "year"
              )
            ),
          {
            title: `${reducerName} ${tTitle.toLowerCase()} class from ${startYear} to ${
              startYear + lcmsRun.thematicChangeYearBuffer
            } (map). Pixel Tools -> Query Visible Map Layers will show data from ${startYear} to ${
              startYear + lcmsRun.thematicChangeYearBuffer
            } while Pixel Tools -> Query LCMS Time Series and all Area Tools will show full time series of data from ${startYear} to ${endYear}.`,
            autoViz: true,
            labelClasses: "layer-label-lcms",
            labelIconHTML: `<img class="panel-title-svg-xsm" alt="LCMS icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer.svg">`,
            test: 1,
            reducer: reducer,
            eeObjInfo: lcmsRun.props,
            bounds: clientBoundary,
            includeClassValues: false,
          },
          `${tTitle} Start`,
          visibilityT
        );

        Map.addLayer(
          lcmsRun.lcmsRemapped
            .select([b])
            .filter(
              ee.Filter.calendarRange(
                endYear - lcmsRun.thematicChangeYearBuffer,
                endYear,
                "year"
              )
            ),
          {
            title: `${reducerName} ${tTitle.toLowerCase()} class from ${
              endYear - lcmsRun.thematicChangeYearBuffer
            } to ${endYear} (map). Pixel Tools -> Query Visible Map Layers will show data from ${
              endYear - lcmsRun.thematicChangeYearBuffer
            } to ${endYear} while Pixel Tools -> Query LCMS Time Series and all Area Tools will show full time series of data from ${startYear} to ${endYear}.`,
            autoViz: true,
            labelClasses: "layer-label-lcms",
            labelIconHTML: `<img class="panel-title-svg-xsm" alt="LCMS icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer.svg">`,
            reducer: reducer,
            eeObjInfo: lcmsRun.props,
            bounds: clientBoundary,
            includeClassValues: false,
          },
          `${tTitle} End`,
          visibilityT
        );

        // Map.addLayer(lcChangeObj.change.set('bounds',clientBoundary),lcChangeObj.viz,lcLayerName + ' Change' ,false);
        // Map.addLayer(luChangeObj.change.set('bounds',clientBoundary),luChangeObj.viz,luLayerName + ' Change' ,false);
      } else {
        addLayerFun(
          lcmsRun.lcmsRemapped.select([b]),
          {
            title: `${reducerName} ${tTitle.toLowerCase()} class from ${startYear} to ${endYear} (map). Pixel and Area Tools will show full time series of data from ${startYear} to ${endYear}`,
            autoViz: true,
            queryParams: { palette: ["00897b"] },
            labelClasses: "layer-label-lcms",
            labelIconHTML: `<img class="panel-title-svg-xsm" alt="LCMS icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer.svg">`,
            reducer: reducer,
            eeObjInfo: lcmsRun.props,
            bounds: clientBoundary,
            years: lcmsRun.years,
            includeClassValues: false,
          },
          `${tTitle}${timeLapseEnding}`,
          visibilityT
        );
      }
    });

    // }

    // lcmsRun.slowLoss = lcmsRunFuns.getMaskedWYr(
    //   lcmsRun.lcms.select(
    //     ["Change", "Change_Raw_Probability_Slow_Loss"],
    //     ["Change", "Prob"]
    //   ),
    //   2
    // );
    // lcmsRun.slowLossCount = lcmsRun.slowLoss.select(["Year"]).count();
    // lcmsRun.slowLoss = lcmsRun.slowLoss.qualityMosaic(summaryMethod);

    // lcmsRun.fastLoss = lcmsRunFuns.getMaskedWYr(
    //   lcmsRun.lcms.select(
    //     ["Change", "Change_Raw_Probability_Fast_Loss"],
    //     ["Change", "Prob"]
    //   ),
    //   3
    // );
    // lcmsRun.fastLossCount = lcmsRun.fastLoss.select(["Year"]).count();
    // lcmsRun.fastLoss = lcmsRun.fastLoss.qualityMosaic(summaryMethod);

    // lcmsRun.gain = lcmsRunFuns.getMaskedWYr(
    //   lcmsRun.lcms.select(
    //     ["Change", "Change_Raw_Probability_Fast_Loss"],
    //     ["Change", "Prob"]
    //   ),
    //   4
    // );
    // lcmsRun.gainCount = lcmsRun.gain.select(["Year"]).count();
    // lcmsRun.gain = lcmsRun.gain.qualityMosaic(summaryMethod);

    // Map.addLayer(
    //   lcmsRun.fastLoss.select(["Year"]).set("bounds", clientBoundary),
    //   {
    //     title: `Year ${lcmsRun.summaryMethodDescriptionDict[summaryMethod]} rapid vegetation cover loss from an external event such as fire/harvest, or change from water inundation/desiccation, etc. from ${startYear} to ${endYear}.`,
    //     min: startYear,
    //     max: endYear,
    //     palette: declineYearPalette,
    //     labelClasses: "layer-label-lcms",
    //     labelIconHTML: `<img class="panel-title-svg-xsm" alt="LCMS icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer.svg">`,
    //   },
    //   "Fast Loss Year",
    //   false
    // );

    // if (analysisMode === "advanced") {
    //   Map.addLayer(
    //     lcmsRun.fastLoss
    //       .select(["Prob"])
    //       .set("bounds", clientBoundary)
    //       .divide(100),
    //     {
    //       title: `Model confidence ${lcmsRun.summaryMethodDescriptionDict[summaryMethod]} rapid vegetation cover loss from an external event such as fire/harvest, or change from water inundation/desiccation, etc. from ${startYear} to ${endYear}.`,
    //       min: lcmsRun.minFastLossProb,
    //       max: 0.5,
    //       palette: declineProbPalette,
    //       labelClasses: "layer-label-lcms",
    //       labelIconHTML: `<img class="panel-title-svg-xsm" alt="LCMS icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer.svg">`,
    //     },
    //     "Fast Loss Probability",
    //     false
    //   );
    //   Map.addLayer(
    //     lcmsRun.fastLossCount.set("bounds", clientBoundary),
    //     {
    //       title: `Duration of rapid vegetation cover loss from an external event such as fire/harvest, or change from water inundation/desiccation, etc. from ${startYear} to ${endYear}.`,

    //       min: 1,
    //       max: 5,
    //       palette: declineDurPalette,
    //       legendLabelLeft: "Year count =",
    //       legendLabelRight: "Year count >=",
    //       labelClasses: "layer-label-lcms",
    //       labelIconHTML: `<img class="panel-title-svg-xsm" alt="LCMS icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer.svg">`,
    //     },
    //     "Fast Loss Duration",
    //     false
    //   );
    // }

    // Map.addLayer(
    //   lcmsRun.slowLoss.select(["Year"]).set("bounds", clientBoundary),
    //   {
    //     title: `Year ${lcmsRun.summaryMethodDescriptionDict[summaryMethod]} vegetation cover loss from a long-term trend event such as drought, tree mortality from insects or disease, etc. from ${startYear} to ${endYear}.`,
    //     min: startYear,
    //     max: endYear,
    //     palette: declineYearPalette,
    //     labelClasses: "layer-label-lcms",
    //     labelIconHTML: `<img class="panel-title-svg-xsm" alt="LCMS icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer.svg">`,
    //   },
    //   "Slow Loss Year",
    //   false
    // );

    // if (analysisMode === "advanced") {
    //   Map.addLayer(
    //     lcmsRun.slowLoss
    //       .select(["Prob"])
    //       .divide(100)
    //       .set("bounds", clientBoundary),
    //     {
    //       title: `Model confidence ${lcmsRun.summaryMethodDescriptionDict[summaryMethod]} vegetation cover loss from a long-term trend event such as drought, tree mortality from insects or disease, etc. from ${startYear} to ${endYear}.`,
    //       min: lcmsRun.minSlowLossProb,
    //       max: 0.5,
    //       palette: declineProbPalette,
    //       labelClasses: "layer-label-lcms",
    //       labelIconHTML: `<img class="panel-title-svg-xsm" alt="LCMS icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer.svg">`,
    //     },
    //     "Slow Loss Probability",
    //     false
    //   );
    //   Map.addLayer(
    //     lcmsRun.slowLossCount.set("bounds", clientBoundary),
    //     {
    //       title: `Duration of vegetation cover loss from a long-term trend event such as drought, tree mortality from insects or disease, etc. from ${startYear} to ${endYear}.`,

    //       min: 1,
    //       max: 5,
    //       palette: declineDurPalette,
    //       legendLabelLeft: "Year count =",
    //       legendLabelRight: "Year count >=",
    //       labelClasses: "layer-label-lcms",
    //       labelIconHTML: `<img class="panel-title-svg-xsm" alt="LCMS icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer.svg">`,
    //     },
    //     "Slow Loss Duration",
    //     false
    //   );
    // }

    // Map.addLayer(
    //   lcmsRun.gain.select(["Year"]).set("bounds", clientBoundary),
    //   {
    //     title: `Year ${lcmsRun.summaryMethodDescriptionDict[summaryMethod]} vegetation cover gain from ${startYear} to ${endYear}.`,

    //     min: startYear,
    //     max: endYear,
    //     palette: gainYearPaletteA,
    //     labelClasses: "layer-label-lcms",
    //     labelIconHTML: `<img class="panel-title-svg-xsm" alt="LCMS icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer.svg">`,
    //   },
    //   "Gain Year",
    //   false
    // );
    // if (analysisMode === "advanced") {
    //   Map.addLayer(
    //     lcmsRun.gain.select(["Prob"]).set("bounds", clientBoundary),
    //     {
    //       title: `Model confidence ${lcmsRun.summaryMethodDescriptionDict[summaryMethod]} vegetation cover gain from ${startYear} to ${endYear}.`,

    //       min: lcmsRun.minGainProb,
    //       max: 0.8,
    //       palette: recoveryProbPalette,
    //       labelClasses: "layer-label-lcms",
    //       labelIconHTML: `<img class="panel-title-svg-xsm" alt="LCMS icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer.svg">`,
    //     },
    //     "Gain Probability",
    //     false
    //   );

    //   Map.addLayer(
    //     lcmsRun.gainCount.set("bounds", clientBoundary),
    //     {
    //       title: `Vegetation cover gain duration from ${startYear} to ${endYear}.`,

    //       min: 1,
    //       max: 5,
    //       palette: recoveryDurPalette,
    //       legendLabelLeft: "Year count =",
    //       legendLabelRight: "Year count >=",
    //       labelClasses: "layer-label-lcms",
    //       labelIconHTML: `<img class="panel-title-svg-xsm" alt="LCMS icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer.svg">`,
    //     },
    //     "Gain Duration",
    //     false
    //   );
    // }

    //Set up pixel charting change time series
    lcmsRun.whichIndex = "NBR";

    //Bring in composites
    lcmsRun.composites = ee.ImageCollection(
      ee
        .FeatureCollection(
          studyAreaDict[studyAreaName].composite_collections.map((f) =>
            ee.ImageCollection(f)
          )
        )
        .flatten()
    );

    lcmsRun.composites = ee.ImageCollection(
      ee.List.sequence(startYear, endYear, 1).map(function (yr) {
        return getImagesLib.simpleAddIndices(
          lcmsRun.composites
            .filter(ee.Filter.calendarRange(yr, yr, "year"))
            .mosaic()
            .set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis()),
          1
        );
      })
    );
    // Map.addTimeLapse(lcmsRun.composites.limit(5),{min:500,max:5000,bands:'swir1,nir,red'},'Composite Time-Lapse');

    //Set up CCDC
    lcmsRun.ccdcIndicesSelector = [
      "tStart",
      "tEnd",
      "tBreak",
      "changeProb",
      lcmsRun.whichIndex + "_.*",
      "NDVI_.*",
    ];
    lcmsRun.ccdcImg0 = ee.ImageCollection(
      ee
        .FeatureCollection(
          studyAreaDict[studyAreaName].ccdc_single_collections.map((f) =>
            ee.ImageCollection(f).select(lcmsRun.ccdcIndicesSelector)
          )
        )
        .flatten()
    );
    lcmsRun.ccdcImg1 = ee.ImageCollection(
      ee
        .FeatureCollection(
          studyAreaDict[studyAreaName].ccdc_paired_collections.map((f) =>
            ee.ImageCollection(f[0]).select(lcmsRun.ccdcIndicesSelector)
          )
        )
        .flatten()
    );
    lcmsRun.ccdcImg2 = ee.ImageCollection(
      ee
        .FeatureCollection(
          studyAreaDict[studyAreaName].ccdc_paired_collections.map((f) =>
            ee.ImageCollection(f[1]).select(lcmsRun.ccdcIndicesSelector)
          )
        )
        .flatten()
    );

    const f = ee.Image(lcmsRun.ccdcImg1.first());
    lcmsRun.ccdcImg0 = ee.Image(lcmsRun.ccdcImg0.mosaic().copyProperties(f));
    lcmsRun.ccdcImg1 = ee.Image(lcmsRun.ccdcImg1.mosaic().copyProperties(f));
    lcmsRun.ccdcImg2 = ee.Image(lcmsRun.ccdcImg2.mosaic().copyProperties(f));
    lcmsRun.ccdcImg01 = ee.Image(
      ee
        .ImageCollection([lcmsRun.ccdcImg0, lcmsRun.ccdcImg1])
        .mosaic()
        .copyProperties(f)
    );
    lcmsRun.ccdcImg02 = ee.Image(
      ee
        .ImageCollection([lcmsRun.ccdcImg0, lcmsRun.ccdcImg2])
        .mosaic()
        .copyProperties(f)
    );
    // printEE(ccdcImg.bandNames())
    const whichHarmonics = [1, 2, 3];
    const fillGaps = true;

    lcmsRun.annualTimeImages = changeDetectionLib.simpleGetTimeImageCollection(
      startYear,
      endYear,
      245,
      245,
      1
    );
    lcmsRun.fittedCCDC = changeDetectionLib
      .predictCCDC(
        [lcmsRun.ccdcImg01, lcmsRun.ccdcImg02],
        lcmsRun.annualTimeImages,
        fillGaps,
        whichHarmonics
      )
      .select(
        [lcmsRun.whichIndex + "_CCDC_fitted"],
        ["CCDC Fitted " + lcmsRun.whichIndex]
      )
      .map(setSameDate);
    // console.log(lcmsRun.fittedCCDC.getInfo());
    //Set up LANDTRENDR
    lcmsRun.lt = ee
      .ImageCollection(
        ee
          .FeatureCollection(
            studyAreaDict[studyAreaName].lt_collections.map((f) =>
              ee.ImageCollection(f)
            )
          )
          .flatten()
      )
      .filter(ee.Filter.eq("band", lcmsRun.whichIndex))
      .select([0])
      .max();
    // Map.addLayer(lcmsRun.lt,{},'raw lt')
    lcmsRun.fittedAsset = changeDetectionLib
      .simpleLTFit(lcmsRun.lt, 1984, 2024, lcmsRun.whichIndex, true, 9)
      .select(
        [`${lcmsRun.whichIndex}_LT_fitted`],
        ["LANDTRENDR Fitted " + lcmsRun.whichIndex]
      )
      .map((i) => {
        return i.divide(10000).float().copyProperties(i, ["system:time_start"]);
      });
    // Map.addLayer(lcmsRun.fittedAsset,{},'lt fitted')
    //Join raw time series to lt fitted and ccdc fitted
    lcmsRun.changePixelChartCollection = joinCollections(
      lcmsRun.composites.select(
        [lcmsRun.whichIndex],
        ["Raw " + lcmsRun.whichIndex]
      ),
      lcmsRun.fittedAsset,
      false
    );
    lcmsRun.changePixelChartCollection = joinCollections(
      lcmsRun.changePixelChartCollection,
      lcmsRun.fittedCCDC,
      false
    );
    // console.log(lcmsRun.changePixelChartCollection.getInfo())
    //Set up change prob outputs for pixel charting
    lcmsRun.probCollection = lcmsRun.lcms
      .select(
        ["Change_Raw_Probability_.*"],
        ["Slow Loss Probability", "Fast Loss Probability", "Gain Probability"]
      )
      .map(function (img) {
        return img.divide(100).copyProperties(img, ["system:time_start"]);
      });

    lcmsRun.changePixelChartCollection = joinCollections(
      lcmsRun.changePixelChartCollection,
      lcmsRun.probCollection,
      false
    );

    pixelChartCollections["all-loss-gain-" + lcmsRun.whichIndex] = {
      label: "LCMS Change Time Series",
      collection: lcmsRun.changePixelChartCollection, //chartCollection.select(['Raw.*','LANDTRENDR.*','.*Loss Probability','Gain Probability']),
      chartColors: chartColorsDict.allLossGain2,
      tooltip:
        "Chart slow loss, fast loss, gain and the " +
        lcmsRun.whichIndex +
        " vegetation index",
      xAxisLabel: "Year",
      yAxisLabel: "Model Confidence or Index Value",
      fieldsHidden: [true, true, true, false, false, false],
    };
    lcmsRunFuns.addPixelChartClass = function (bn) {
      const bnTitle = bn.replaceAll("_", " ");
      let chartC = lcmsRun.lcms.select([`${bn}_Raw_Probability_.*`]);
      const fromBns = chartC.first().bandNames();
      const toBns = fromBns.map(function (bn) {
        bn = ee.String(bn).split("_");
        return bn.get(bn.length().subtract(1));
      });
      const colors = levelObj.propsHighest[`${bn}_class_palette`];
      chartC = chartC.select(fromBns, toBns);
      pixelChartCollections[bn] = {
        label: `LCMS ${bnTitle} Time Series`,
        collection: chartC, //chartCollection.select(['Raw.*','LANDTRENDR.*','.*Loss Probability','Gain Probability']),
        chartColors: colors,
        tooltip: `Chart ${bnTitle} model confidence for each individual class`,
        xAxisLabel: "Year",
        yAxisLabel: "Model Confidence",
      };
    };

    lcmsRunFuns.addPixelChartClass("Land_Cover");
    lcmsRunFuns.addPixelChartClass("Land_Use");

    //Populate area charting
    // if (urlParams.legacy === true) {
    //   lcmsRun.changeForAreaCharting = formatAreaChartCollection(
    //     lcmsRun.lcms.select(["Change"]).map(function (img) {
    //       return img.unmask(0);
    //     }),
    //     [2, 3, 4, 5],
    //     ["Slow Loss", "Fast Loss", "Gain", "Non-Processing Area Mask"]
    //   );

    //   lcmsRunFuns.addAreaChartClass = function (bn) {
    //     const c = lcmsRun.lcms.select([bn]);

    //     let names = lcmsRun.props[`${bn}_class_names`];
    //     const numbers = lcmsRun.props[`${bn}_class_values`];
    //     const colors = lcmsRun.props[`${bn}_class_palette`];
    //     names = names.map((nm) => nm.replaceAll(" (SEAK Only)", ""));
    //     const areaC = formatAreaChartCollection(c, numbers, names);
    //     // console.log(areaC.first().bandNames().getInfo());
    //     const bnTitle = bn.replaceAll("_", " ");
    //     let fieldsHidden;
    //     if (bn === "Change") {
    //       fieldsHidden = [true, false, false, false, true];
    //     }

    //     // convertToStack(areaC, (xAxisProperty = "year"), (dateFormat = "YYYY"));
    //     areaChartCollections[bn] = {
    //       label: `LCMS ${bnTitle} Annual`,
    //       collection: areaC,
    //       stacked: false,
    //       steppedLine: false,
    //       tooltip: `Summarize ${bnTitle} classes for each year`,
    //       class_names: names,
    //       class_numbers: numbers,
    //       colors: colors,
    //       zonalReducer: ee.Reducer.frequencyHistogram(),
    //       xAxisLabel: "Year",
    //       fieldsHidden: fieldsHidden,
    //       dateFormat: "YYYY",
    //     };
    //   };

    //   const lcmsBnsForCharting = ["Change", "Land_Cover", "Land_Use"];
    //   lcmsBnsForCharting.map((bn) => {
    //     lcmsRunFuns.addAreaChartClass(bn);
    //   });
    //   if (endYear - startYear >= 5) {
    //     //&& urlParams.sankey==='true' || urlParams.beta ==='true' ){
    //     activeStartYear = startYear;
    //     activeEndYear = endYear;
    //     // $('#transition-year-interval-slider-container').show();
    //     setupTransitionPeriodUI();
    //     // $('#transition-periods-container').show();
    //     // updateSankeyPeriods(transitionChartYearInterval);

    //     lcmsBnsForCharting.map((bn) => {
    //       addSankey(lcmsRun, bn);
    //     });
    //   } else if (endYear - startYear < 5) {
    //     //&&(urlParams.sankey==='true' || urlParams.beta ==='true') ){
    //     // $('#transition-year-interval-slider-container').hide();
    //     $("#transition-periods-container").hide();
    //   }
    //   populateAreaChartDropdown();
    // } else {
    // console.log(lcmsRun.lcmsRemapped.getInfo());
    ["Change", "Land_Cover", "Land_Use"].map((bn) => {
      let bnTitle = bn.replace("_", " ");
      lcmsRun.props.bandNames = [bn];
      let visibility;
      let tc;
      if (bn === "Change") {
        visibility = changeVisibility;
        // tc = lcmsAttrCopy.select([bn]);
      }
      // else {
      tc = lcmsRun.lcmsRemapped.select([bn]);

      // }
      areaChart.addLayer(
        tc,
        {
          eeObjInfo: lcmsRun.props,
          visible: visibility,
          xAxisLabels: lcmsRun.years,
        },
        bnTitle + " Annual",
        true
      );
      areaChart.addLayer(
        tc,
        {
          sankey_years: [startYear, endYear],
          sankey: true,
          eeObjInfo: lcmsRun.props,
          visible: visibility,
          xAxisLabels: lcmsRun.years,
          sankeyMinPercentage: 1,
          chartLabelMaxWidth: 10000,
        },
        bnTitle + " Transition",
        false
      );
    });

    // Map.addLayer(
    //   tccLoss.select(["Abrupt Disturbance"]),
    //   {
    //     min: -50,
    //     max: -5,

    //     palette: "D00,F5DEB3",
    //     legendLabelLeftAfter: "% TCC",
    //     legendLabelRightAfter: "% TCC",
    //     labelClasses: tccLayerStyling.labelClasses,
    //     labelIconHTML: tccLayerStyling.labelIconHTML,
    //   },
    //   "TCC Abrupt Disturbance Mag",
    //   true
    // );
    // Map.addLayer(
    //   tccGain.select(["Vegetation Growth"]),
    //   {
    //     min: 0,
    //     max: 50,

    //     palette: "F5DEB3,006400",
    //     legendLabelLeftAfter: "% TCC",
    //     legendLabelRightAfter: "% TCC",
    //     labelClasses: tccLayerStyling.labelClasses,
    //     labelIconHTML: tccLayerStyling.labelIconHTML,
    //   },
    //   "TCC Vegetation Growth Mag",
    //   false
    // );

    // Map.addLayer(lcmsRun.lcms.select([0]),{autoViz:true},'Change')
    //Map.addTimeLapse(lcmsAttr_stack,{min:1,max:16,palette:palette,classLegendDict:attrClassLegendDict,queryDict:attrQueryDict},'LCMS Change Attributes',false)
    // }
    areaChart.populateChartLayerSelect();
    areaChart.setupTransitionPeriodUI();
    // areaChart.startAutoCharting();
    // Map.turnOnAutoAreaCharting();
    // $("#pixel-chart-label").hide();
  }

  // $("#user-defined-area-chart-label").click();
  getSelectLayers(true);
  populatePixelChartDropdown();
  Map.turnOffLayersWhenTimeLapseIsOn = false;
  // Map.turnOnInspector();

  // $('#query-label').click()
  // $('#pixel-chart-label').click();
  // }
}

// function runGTAC() {
//   let lcmsRun = {};
//   lcmsRun.lcms = studyAreaDict[studyAreaName].final_collections;
//   lcmsRun.lcms = ee.ImageCollection(ee.FeatureCollection(lcmsRun.lcms.map((f) => ee.ImageCollection(f).select(["Change", "Land_Cover", "Land_Use", ".*Probability.*"]))).flatten());
//   lcmsRun.lcms = lcmsRun.lcms.filter(ee.Filter.eq("study_area", "CONUS"));
//   lcmsRun.props = lcmsRun.lcms.first().toDictionary().getInfo();
//   console.log(lcmsRun.lcms.getInfo());

//   var lcmsRun = {};
//   lcmsRun.lcms = studyAreaDict[studyAreaName].final_collections;
//   lcmsRun.lcms = ee.ImageCollection(ee.FeatureCollection(lcmsRun.lcms.map((f) => ee.ImageCollection(f).select(["Change", "Land_Cover", "Land_Use", ".*Probability.*"]))).flatten());
//   // Map.addLayer(ee.Image(1))
//   Map.addFeatureView(
//     "USGS/WBD/2017/HUC08_FeatureView",
//     {
//       color: "808080",
//       lineWidth: 1,
//     },
//     "Feature View Test"
//   );
//   console.log(ee.Image(1).getInfo());
//   // Map.addLayer(lcmsRun.lcms.select([0,1,2]),{qusdaseryDateFormat:'YYYY-MM-dd-HH'});

//   // pixelChartCollections['test'] = {'label':'test',
//   //                                 'collection':lcmsRun.lcms,//chartCollection.select(['Raw.*','LANDTRENDR.*','.*Loss Probability','Gain Probability']),
//   //                                 'xAxisLabel':'Year',
//   //                                 'yAxisLabel':'Model Confidence or Index Value'}

//   // populatePixelChartDropdown();
//   // $('#query-label').click();
// }
// var tArea = ee.FeatureCollection([
//   ee.Feature(
//     ee.Geometry.Polygon(
//       [
//         [
//           [-111.45760650206141, 40.648752837173106],
//           [-111.45760650206141, 40.58933585265644],
//           [-111.36078948545985, 40.58933585265644],
//           [-111.36078948545985, 40.648752837173106],
//         ],
//       ],
//       null,
//       false
//     ),
//     {
//       "system:index": "0",
//     }
//   ),
// ]);

function runDynamic() {
  areaChart.clearLayers();

  let lcmsRun = {};
  let lcmap_dict = {
    LC_class_values: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    LC_class_names: [
      "Developed",
      "Cropland",
      "Grass/Shrub",
      "Tree Cover",
      "Water",
      "Wetlands",
      "Ice/Snow",
      "Barren",
      "Class Change",
    ],
    LC_class_palette: [
      "E60000",
      "A87000",
      "E3E3C2",
      "1D6330",
      "476BA1",
      "BAD9EB",
      "FFFFFF",
      "B3B0A3",
      "A201FF",
    ],
  };
  let lcpri = ee
    .ImageCollection("projects/sat-io/open-datasets/LCMAP/LCPRI")
    .select(["b1"], ["LC"]);
  lcpri = lcpri.map((img) => img.set(lcmap_dict));
  // Map.addLayer(lcpri, { autoViz: true, canAreaChart: true, areaChartParams: { line: true, sankey: true } }, "LCMAP LC", true);
  // areaChart.addLayer(lcpri, { sankey: false }, "LCMAP LC Annual", false);
  // areaChart.addLayer(lcpri, { sankey: true }, "LCMAP LC Transition", false);
  lcmsRun.lcms = ee
    .ImageCollection(
      ee
        .FeatureCollection(
          studyAreaDict[studyAreaName].final_collections.map((c) =>
            ee.ImageCollection(c)
          )
        )
        .flatten()
    )
    .select(["Change", "Land_Cover", "Land_Use", ".*Probability.*"]);

  // .filter('study_area=="CONUS"');
  lcmsRun.lcms = lcmsRun.lcms.filter(
    ee.Filter.calendarRange(urlParams.startYear, urlParams.endYear, "year")
  );
  //Get properties image
  // lcmsRun.hasProps = lcmsRun.lcms.filter(
  //   ee.Filter.notNull(["Change_class_names"])
  // );
  // lcmsRun.f = ee.Image(lcmsRun.hasProps.first());
  // lcmsRun.props = {
  //   Change_class_names: [
  //     "Stable",
  //     "Slow Loss",
  //     "Fast Loss",
  //     "Gain",
  //     "Non-Processing Area Mask",
  //   ],
  //   Change_class_palette: ["3d4551", "f39268", "d54309", "00a398", "1b1716"],
  //   Change_class_values: [1, 2, 3, 4, 5],
  //   Land_Cover_class_names: [
  //     "Trees",
  //     "Tall Shrubs & Trees Mix (SEAK Only)",
  //     "Shrubs & Trees Mix",
  //     "Grass/Forb/Herb & Trees Mix",
  //     "Barren & Trees Mix",
  //     "Tall Shrubs (SEAK Only)",
  //     "Shrubs",
  //     "Grass/Forb/Herb & Shrubs Mix",
  //     "Barren & Shrubs Mix",
  //     "Grass/Forb/Herb",
  //     "Barren & Grass/Forb/Herb Mix",
  //     "Barren or Impervious",
  //     "Snow or Ice",
  //     "Water",
  //     "Non-Processing Area Mask",
  //   ],
  //   Land_Cover_class_palette: [
  //     "005e00",
  //     "008000",
  //     "00cc00",
  //     "b3ff1a",
  //     "99ff99",
  //     "b30088",
  //     "e68a00",
  //     "ffad33",
  //     "ffe0b3",
  //     "ffff00",
  //     "aa7700",
  //     "d3bf9b",
  //     "ffffff",
  //     "4780f3",
  //     "1b1716",
  //   ],
  //   Land_Cover_class_values: [
  //     1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  //   ],
  //   Land_Use_class_names: [
  //     "Agriculture",
  //     "Developed",
  //     "Forest",
  //     "Non-Forest Wetland",
  //     "Other",
  //     "Rangeland or Pasture",
  //     "Non-Processing Area Mask",
  //   ],
  //   Land_Use_class_palette: [
  //     "efff6b",
  //     "ff2ff8",
  //     "1b9d0c",
  //     "97ffff",
  //     "a1a1a1",
  //     "c2b34a",
  //     "1b1716",
  //   ],
  //   Land_Use_class_values: [1, 2, 3, 4, 5, 6, 7],
  //   bandNames: [
  //     "Change",
  //     "Land_Cover",
  //     "Land_Use",
  //     "Change_Raw_Probability_Slow_Loss",
  //     "Change_Raw_Probability_Fast_Loss",
  //     "Change_Raw_Probability_Gain",
  //     "Land_Cover_Raw_Probability_Trees",
  //     "Land_Cover_Raw_Probability_Tall-Shrubs-and-Trees-Mix",
  //     "Land_Cover_Raw_Probability_Shrubs-and-Trees-Mix",
  //     "Land_Cover_Raw_Probability_Grass-Forb-Herb-and-Trees-Mix",
  //     "Land_Cover_Raw_Probability_Barren-and-Trees-Mix",
  //     "Land_Cover_Raw_Probability_Tall-Shrubs",
  //     "Land_Cover_Raw_Probability_Shrubs",
  //     "Land_Cover_Raw_Probability_Grass-Forb-Herb-and-Shrubs-Mix",
  //     "Land_Cover_Raw_Probability_Barren-and-Shrubs-Mix",
  //     "Land_Cover_Raw_Probability_Grass-Forb-Herb",
  //     "Land_Cover_Raw_Probability_Barren-and-Grass-Forb-Herb-Mix",
  //     "Land_Cover_Raw_Probability_Barren-or-Impervious",
  //     "Land_Cover_Raw_Probability_Snow-or-Ice",
  //     "Land_Cover_Raw_Probability_Water",
  //     "Land_Use_Raw_Probability_Agriculture",
  //     "Land_Use_Raw_Probability_Developed",
  //     "Land_Use_Raw_Probability_Forest",
  //     "Land_Use_Raw_Probability_Non-Forest-Wetland",
  //     "Land_Use_Raw_Probability_Other",
  //     "Land_Use_Raw_Probability_Rangeland-or-Pasture",
  //   ],

  //   size: 230,
  //   study_area: "CONUS",
  //   year: 1985,
  // }; //getImagesLib.eeObjInfo(lcmsRun.lcms, "ImageCollection").getInfo();

  // console.log(lcmsRun.props);
  // console.log(lcmsRun.lcms.first().bandNames().getInfo());
  // lcmsRun.lcms = ee
  //   .ImageCollection("projects/lcms-292214/assets/Final_Outputs/2022-8/HAWAII")
  //   // .ImageCollection(studyAreaDict[studyAreaName].final_collections[0])
  //   .select(["Change", "Land_Cover", "Land_Use", ".*Probability.*"])
  //   .filter(ee.Filter.calendarRange(1990, 2022, "year"));
  // .filter('study_area=="CONUS"');

  // lcmsRun.lcms = lcmsRun.lcms.map((img) => img.set(lcmsRun.props));
  // console.log(lcmsRun.lcms.aggregate_histogram ('study_area').getInfo())

  //Mosaic all study areas

  const tcc = ee
    .ImageCollection("USGS/NLCD_RELEASES/2021_REL/TCC/v2021-4")
    .select([0, 2]); //.filter(ee.Filter.eq("study_area", "CONUS"));
  // Map.addLayer(
  //   lcmsRun.lcms.select(["Land_Cover"]), //(), //.set(lcmsRun.props),
  //   {
  //     // bands: "Land_Use",
  //     // mosaic: true,
  //     // dateFormat: "YYYY",
  //     // advanceInterval: "day",
  //     autoViz: true,
  //     canAreaChart: true,
  //     areaChartParams: { line: true, sankey: true },
  //   },
  //   "LCMS Land Cover",
  //   true
  // );
  // let changeVisibility = [false, true, true, true, false];
  // Map.addLayer(
  //   lcmsRun.lcms.select(["Change"]), //(), //.set(lcmsRun.props),
  //   {
  //     autoViz: true,
  //     canAreaChart: true,
  //     areaChartParams: {
  //       line: true,
  //       sankey: true,
  //       visible: changeVisibility,
  //       // sankeyTransitionPeriods: [
  //       //   [1990, 1991],
  //       //   [2000, 2005],
  //       // ],
  //     },
  //   },
  //   "LCMS Change",
  //   true
  // );

  // Map.addLayer(
  //   lcmsRun.lcms.select(["Land_Cover"]), //.mode().set(lcmsRun.props),
  //   { autoViz: true, canAreaChart: true, areaChartParams: { line: true, sankey: true } },
  //   "LCMS Land Cover",
  //   true
  // );
  let raw = lcmsRun.lcms.select(["Land_Cover_Raw.*"]);
  let bns = raw.first().bandNames();
  let bnsOut = bns.map((bn) =>
    ee.String(bn).split("Land_Cover_Raw_Probability_").get(1)
  );

  // console.log(bns.getInfo());
  // console.log(bnsOut.getInfo());
  raw = raw.select(bns, bnsOut);
  // Map.addLayer(
  //   raw,
  //   {
  //     queryParams: { palette: lcmsRun.props.Land_Cover_class_palette },
  //     areaChartParams: { palette: lcmsRun.props.Land_Cover_class_palette },
  //     canAreaChart: true,
  //     bands: "Barren-or-Impervious,Trees,Water",
  //     min: 0,
  //     max: 30,
  //     reducer: ee.Reducer.stdDev(),
  //   },
  //   "LCMS Land Cover Raw ",
  //   true
  // );
  // Map.addLayer(lcms.select([2]), { autoViz: true, canAreaChart: true, line: true, sankey: true }, "LCMS Land Use", false);
  // console.log(tcc.first().toDictionary().getInfo());

  // lcmsRun.lcms = lcmsRun.lcms.map((img) => img.set("Change_class_visibility", changeVisibility));
  // console.log(lcmsRun.lcms.first().bandNames().getInfo());

  // Map.addLayer(lcms.select([0]), { autoViz: true, reducer: ee.Reducer.max() }, "LCMS Change", true);

  // areaChart.addLayer(lcms.select([0]), {}, "LCMS Change Annual");
  // areaChart.addLayer(lcms.select([1]), {}, "LCMS Land Cover Annual");
  // areaChart.addLayer(lcms.select([2]), {}, "LCMS Land Use Annual");
  // areaChart.addLayer(lcms.select([0, 1, 2]), { sankey: true }, "LCMS Transition", true);

  // areaChart.addLayer(lcms.select([0, 1, 2]), {}, "LCMS Annual");
  // areaChart.addLayer(lcms.select([1]), {}, "LCMS Cover", true);
  // areaChart.addLayer(lcms.select([2]), {}, "LCMS Use", false);
  // areaChart.addLayer(lcms.select([0, 1, 2]), {}, "LCMS All");
  // areaChart.addLayer(lcms.select([2]), { autoViz: true }, "test");

  // console.log(lcpri.first().bandNames().getInfo());
  // var f = ee.Geometry.Polygon(
  //   [
  //     [
  //       [-105.91375135016187, 40.242613115226675],
  //       [-105.91375135016187, 40.2352749347849],
  //       [-105.86637281012281, 40.2352749347849],
  //       [-105.86637281012281, 40.242613115226675],
  //     ],
  //   ],
  //   null,
  //   false
  // );

  // areaChart.chartArea(f, "test charting");
  let nlcd = ee.ImageCollection("USGS/NLCD_RELEASES/2019_REL/NLCD");
  // console.log(nlcd.first().bandNames().getInfo());
  nlcd = nlcd.select([0]);
  let nlcd_class_names = ee.List(
    nlcd.first().toDictionary().get("landcover_class_names")
  );
  nlcd_class_names = nlcd_class_names.map((nm) => {
    return ee.String(nm).split(": ").get(0);
  });

  // nlcd = nlcd.map((img) => img.set("landcover_class_names", nlcd_class_names));
  // console.log(nlcd_class_names.getInfo());
  // Map.addLayer(nlcd, { sankey: true }, "NLCD");
  // areaChart.sankeyTransitionPeriods = [
  //   [2001, 2004],
  //   [2019, 2019],
  // ];
  // areaChart.addLayer(
  //   nlcd,
  //   {
  //     sankey: true,
  //     sankeyTransitionPeriods: [
  //       [2001, 2004],
  //       [2019, 2019],
  //     ],
  //   },
  //   "NLCD"
  // );
  // areaChart.addLayer(nlcd, { sankey: true }, "NLCD Annual");

  // areaChart.addLayer(tcc, { visible: [true, true], palette: ["080", "0D0"] }, "NLCD TCC");
  // areaChart.addLayer(tcc, { reducer: ee.Reducer.median() }, "NLCD TCC Median");
  // areaChart.populateChartDropdown();

  // areaChart.sankeyTransitionPeriods = [
  //   [1995, 1997],
  //   [2010, 2014],
  //   [2019, 2019],
  // ];

  // getLCMSVariables();
  let mtbsBoundaries = ee.FeatureCollection(
    "USFS/GTAC/MTBS/burned_area_boundaries/v1"
  );
  mtbsBoundaries = mtbsBoundaries.map(function (f) {
    const d = ee.Date(f.get("Ig_Date")).millis();

    return f.set("system:time_start", f.get("Ig_Date"));
  });
  // // perims = ee.FeatureCollection(perims.copyProperties(mtbs,['bounds']));
  // // console.log(perims.get('bounds').getInfo())

  mtbsBoundaries = mtbsBoundaries.filterDate(
    ee.Date.fromYMD(urlParams.startYear, 1, 1),
    ee.Date.fromYMD(urlParams.endYear, 12, 31)
  );
  i = ee.Image([1, 2]);
  // print(i.bandNames().getInfo());
  // Map.addLayer(i, {});

  // lcms = ee
  //   .ImageCollection("USFS/GTAC/LCMS/v2022-8")
  //   .filter('study_area=="CONUS"')
  //   .filter(ee.Filter.calendarRange(urlParams.startYear, urlParams.endYear, "year")); //.select([".*Raw.*"]);

  // lcms = lcms.map((img) => img.set("Change_class_visibility", [false, true, true, true, false]));
  // lcms = lcms.map((img) => img.set("Land_Cover_class_palette", newPalette));
  // console.log(lcms.getInfo());
  // Map.addLayer(lcms.select([1]), {
  //   canAreaChart: true,
  //   areaChartParams: { reducer: ee.Reducer.frequencyHistogram(), sankey: true, showGrid: true, line: true },
  // });
  // console.log("starting");
  // console.log(ee.Algorithms.ObjectType(mtbsBoundaries).getInfo());
  // Map.addLayer(mtbsBoundaries);

  Map.addSelectLayer(
    mtbsBoundaries,
    {
      strokeColor: "00F",
      selectLayerNameProperty: "Incid_Name",
    },
    "MTBS Fire Boundaries",
    false,
    null,
    null,
    "MTBS Fire Boundaries"
  );
  let mFun =
    urlParams.addLCMSTimeLapsesOn == "yes" ? Map.addTimeLapse : Map.addLayer;

  ["Change", "Land_Cover", "Land_Use"].map((c) => {
    let visible;
    if (c === "Change") {
      visible = changeVisibility;
    }
    lcmsRun.props.bandNames = [c];
    mFun(
      lcmsRun.lcms.select([c]),
      {
        autoViz: true,
        canAreaChart: true,
        // dictServerSide: false,
        eeObjInfo: lcmsRun.props,
        areaChartParams: {
          stackedAreaChart: false,
          line: true,
          sankey: true,
          visible: visible,
          sankey_years: [urlParams.startYear, urlParams.endYear],
          xAxisLabels: range(urlParams.startYear, urlParams.endYear + 1),
        },
      },
      c.replaceAll("_", " "),
      false
    );
  });

  let tccInfo = {
    bandNames: [
      "Science_Percent_Tree_Canopy_Cover",
      "NLCD_Percent_Tree_Canopy_Cover",
    ],
    endYear: 2021,

    size: 56,
    startYear: 2008,
    study_area: "AK",
    version: "v2021-4",
    year: 2008,
  };
  // console.log(tcc.first().toDictionary().getInfo());
  Map.addLayer(
    tcc,
    {
      canAreaChart: true,
      reducer: ee.Reducer.stdDev(),
      bands: "NLCD_Percent_Tree_Canopy_Cover",
      min: 0,
      max: 10,
      selfMask: true,
      palette: "DDD,080",
      eeObjInfo: tccInfo,
      areaChartParams: {
        xAxisLabels: range(2008, 2022),
        bandNames: [
          "Science_Percent_Tree_Canopy_Cover",
          "NLCD_Percent_Tree_Canopy_Cover",
        ],
        palette: "080,0D0",
        rangeSlider: true,
      },
    },
    "NLCD TCC",
    true
  );

  let changeClassDict = {
    "Fast Loss": { code: 3, visible: true, palette: lossYearPalette },
    "Slow Loss": { code: 2, visible: true, palette: lossYearPalette },
    Gain: { code: 4, visible: false, palette: "c5ee93,00a398" },
  };

  Object.keys(changeClassDict).map((k) => {
    let changeYear = lcmsRun.lcms
      .select([0])
      .map((img) =>
        ee
          .Image(img.date().get("year"))
          .int16()
          .rename(["year"])
          .updateMask(img.eq(changeClassDict[k].code))
      )
      .max();
    Map.addLayer(
      changeYear,
      {
        min: urlParams.startYear,
        max: urlParams.endYear,
        palette: changeClassDict[k].palette,
        bands: "year",
        canAreaChart: true,

        eeObjInfo: {
          bandNames: ["year"],
        },
        areaChartParams: {
          reducer: ee.Reducer.frequencyHistogram(),
          reducerString: "frequencyHistogram",
          rangeSlider: true,
          shouldUnmask: false,
          bandNames: ["year"],
        },
      },
      k,
      changeClassDict[k].visible
    );
  });
  // areaChart.startAutoCharting();

  // Map.turnOnInspector();
  // chartUserDefinedArea = areaChart.chartUserDefinedArea;
  // Map.turnOnUserDefinedAreaCharting();
  // Map.turnOnSelectionAreaCharting();

  // getSelectLayers(true);
  // Map.turnOnInspector();
  // Map.addLayer(lcms);
  // Map.turnOnInspector();
  // Map.addLayer(f, {}, "area");
  // Map.centerObject(f);
  // areaChart.addLayer(lcmsRun.lcms);

  // areaChart.populateChartLayerSelect();
  // Map.turnOnInspector()
  Map.turnOnAutoAreaCharting();
  $("#pixel-chart-label").hide();
  //   // console.log(lcms.first().select([".*_Raw_Prob.*"]).bandNames().getInfo());
  //   //   // const mapId = lcms.getMap({ min: 0, max: 60 });
  //   //   // const tileSource = new ee.layers.EarthEngineTileSource(mapId);

  //   //   // .map(img=>img.updateMask(img.gt(1)));
  //   Map.addLayer(
  //     lcms.select([0]),
  //     {
  //       //
  //       autoViz: true,
  //     },
  //     "Change"
  //   );
  //   Map.addLayer(
  //     lcms.select([1]),
  //     {
  //       //
  //       autoViz: true,
  //     },
  //     "Land Cover"
  //   );
  //   Map.addTimeLapse(
  //     lcms.select([2]).limit(3),
  //     {
  //       //
  //       autoViz: true,
  //     },
  //     "Land Use"
  //   );

  //   Map.addLayer(ee.Image(1), {}, "blank img");
  //   // console.log(lcms.mosaic().getMap())
  //   var monitoring_sites = ee.FeatureCollection("projects/gtac-lamda/assets/giant-sequoia-monitoring/Inputs/Trees_of_Special_Interest");
  //   Map.addLayer(
  //     monitoring_sites.map((f) => {
  //       return ee.Feature(f).buffer(300 / 2);
  //     }),
  //     {
  //       strokeColor: "FF0",
  //       fillColor: "0FF",
  //       fillOpacity: 1,
  //
  //     },
  //     "Monitoring Sites 150",
  //     true,
  //     null,
  //     null,
  //     "Trees of special interest 150"
  //   );
  //   Map.addLayer(
  //     monitoring_sites.map((f) => {
  //       return ee.Feature(f).buffer(50);
  //     }),
  //     {
  //       strokeColor: "F0F",
  //       fillColor: "0F0",
  //       fillOpacity: 1,
  //
  //     },
  //     "Monitoring Sites 50",
  //     true,
  //     null,
  //     null,
  //     "Trees of special interest 50"
  //   );
  //   Map.addLayer(
  //     lcms.select([".*_Raw_Prob.*"]),
  //     {
  //       //
  //       // autoViz: true,
  //     },
  //     "Probs"
  //   );
  //   // Map.addLayer(ee.FeatureCollection("projects/lcms-292214/assets/R8/PR_USVI/Ancillary/prusvi_boundary_buff2mile"), {}, "prusvi");

  //   Map.turnOnInspector();
  // var c = [];
  // range(0,1000).map(n=>c.push(ee.Image([n,n+1,n+2]).divide(1000).float()));
  // c = ee.ImageCollection(c);
  // console.log(c.size().getInfo())
  // Map.addLayer(c,{},'test')
  // Map.addLayer(lcms.select(['Land_Cover_Raw_Probability_Trees']),{'min':20,'max':80,'palette':['Ffff00','BlUe','green','green']},'lcms')
  //   var comps = ee.ImageCollection('projects/lcms-tcc-shared/assets/CONUS/Composites/Composite-Collection-yesL7')
  //   .select(['swir2','nir','red'])
  //   Map.addTimeLapse(comps.filter(ee.Filter.calendarRange(2000,2005,'year')),{mosaic:true,'queryDateFormat':'YYYY-MM-dd HH:mm'})//,{min:500,max:3500,bands:'swir2,nir,red'});
  //   Map.addLayer(comps.filter(ee.Filter.calendarRange(2021,2021,'year')).mosaic().divide(10000),{min:500,max:3500,bands:'swir2,nir,red'});
  //   Map.addLayer(comps.filter(ee.Filter.calendarRange(2021,2021,'year')),{min:500,max:3500,bands:'swir2,nir,red'});
  //   var ls = getImagesLib.getProcessedLandsatScenes(geometry,2015,2019,190,250).select(['swir2','red','NBR','NDVI','nir']);
  //   Map.addLayer(ls.sort('system:time_start',false),getImagesLib.vizParamsFalse,'LS')
  // Map.addLayer(ee.Image(1).multiply(0.001111111111111111111111),{palette:'lightblue',min:0,max:1,classLegendDict:{'test1':'lightblue'}})
  // Map.turnOnInspector();
  // Map.setTitle('test');
  // Map.setQueryCRS('EPSG:32611')
  // Map.setQueryTransform( [60, 0, -2361915, 0, -60, 3177735]);
  // Map.setQueryPrecision(4,0.01)
  // Map.setQueryDateFormat('YYYY-MM-dd HH:mm');
  // Map.setQueryBoxColor('#F00')

  //   // Map.addLayer(ee.Image([1,2,3]).toArray().addBands(ee.Image(1)));
  //   // Map.addLayer(ee.Image([1,2,3]).toArray());
  //   // Map.addLayer(ee.Image(1));
  //   // Map.addLayer(ee.Image([1,2,4]).float(),{queryDict:{1:'there',2:'hi',3:'you'}});
  //   // Map.addLayer(ee.Image('projects/rcr-gee/assets/lcms-training/lcms-training_module-3_landTrendr/LT_Raw_NDVI_yrs1984-2022_jds152-151'))
  // Map.addLayer(ee.ImageCollection('projects/rcr-gee/assets/lcms-training/lcms-training_module-3_CCDC').mosaic().multiply(10000).float())
  //   // var sa = ee.FeatureCollection('projects/lcms-292214/assets/R8/PR_USVI/Ancillary/prusvi_boundary');
  //   // Map.addLayer(sa)
  //   var props = ee.ImageCollection("USFS/GTAC/LCMS/v2022-8").first().toDictionary().getInfo();
  //   var tLcms = ee.ImageCollection('projects/rcr-gee/assets/lcms-training/lcms-training_module-6_assembledLCMSOutputs')
  //   tLcms = tLcms.map(img=> img.set(props))
  //   Map.addTimeLapse(tLcms.select(['Change']).limit(2),{autoViz:true})
  //   Map.addTimeLapse(tLcms.select(['Land_Cover']).limit(2),{autoViz:true})
  //   Map.addLayer(tLcms.select(['Land_Use']),{autoViz:true})

  //   var dataset = ee.ImageCollection('USGS/NLCD_RELEASES/2021_REL/NLCD');

  //   Map.addLayer(dataset.select([0]),{'autoViz':true},'NLCD')

  //   var lcms = ee.ImageCollection(studyAreaDict[studyAreaName].final_collections[0]).filter('study_area=="CONUS"');
  //   Map.addTimeLapse(lcms.select(['.*Probability.*']),{reducer:ee.Reducer.max(),min:0,max:30,classLegendDict:{'Non-Tree No Change':'000','Tree No Change':'0E0','Non-Tree Fast Loss':'E00','Tree Gain':'0FF','Tree Fast Loss':'FF0','Tree Fast Loss + Gain':'FFF'},bands:'Change_Raw_Probability_Fast_Loss,Land_Cover_Raw_Probability_Trees,Change_Raw_Probability_Gain'},'LCMS Change Composite')
  //   Map.addLayer(lcms.select(['Land_Cover']),{'autoViz':true,reducer:ee.Reducer.mode()},'LCMS',false)
  //   setTimeout(()=>{$('#query-label').click()},1000)
  //  s2s = getImagesLib.getProcessedSentinel2Scenes(geometry,2022,2022,190,250);
  //  console.log(s2s.size().getInfo())
  //  var lt = ee.ImageCollection(ee.FeatureCollection(studyAreaDict[studyAreaName].lt_collections.map(f => ee.ImageCollection(f))).flatten()).select([0]);
  //  Map.addLayer(lt.filter(ee.Filter.eq('band','NBR')).max())
  //  var ltStack = cdl.batchSimpleLTFit(lt,urlParams.startYear+20,urlParams.endYear,null,'band',true,6)
  //  print(ltStack.first().getInfo())
  //  Map.addTimeLapse(ltStack.limit(2),{min:getImagesLib.vizParamsFalse10k.min,max:getImagesLib.vizParamsFalse10k.max,bands:'swir1_LT_fitted,nir_LT_fitted,red_LT_fitted',gamma:getImagesLib.vizParamsFalse10k.gamma})
  //  Map.addLayer(s2s.median(),getImagesLib.vizParamsFalse,'test')
  //  Map.centerObject(geometry)
}

// function runDynamic() {
//   var lcms = ee.ImageCollection("USFS/GTAC/LCMS/v2022-8"); //.filter('study_area=="CONUS"');
//   Map.addLayer(
//     lcms.select([1]).mode(), //.set(lcms.first().toDictionary()),
//     {
//       // autoViz: true,
//       canAreaChart: true,
//       areaChartParams: { reducer: ee.Reducer.min() },
//     },
//     "LCMS Land Cover"
//   );

//   // areaChart.addLayer(lcms.select([0, 1]), {}, "LCMS");
//   // areaChart.addLayer(lcms.select(["Change_Raw_Probability.*"]), {}, "LCMS Change Prob");
//   // # Map.turnOnInspector()
//   // areaChart.populateChartLayerSelect();

//   var composites = ee.ImageCollection("projects/lcms-tcc-shared/assets/CONUS/Composites/Composite-Collection-yesL7");

//   let viz = {}; //vizParamsFalse10k;
//   viz["canAreaChart"] = true;
//   // viz["areaChartParams"] = { bandNames: "blue,green,red,nir,swir1,swir2" };

//   let years = range(1985, 1990);
//   composites = ee.ImageCollection(
//     years.map((yr) => {
//       let t = composites.filter(ee.Filter.calendarRange(yr, yr, "year")).mosaic().set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis());
//       return t;
//     })
//   );
//   // Map.addTimeLapse(composites, viz, "LCMS Composites");
//   // areaChart.turnOnAutoAreaCharting();
//   Map.turnOnAutoAreaCharting();
//   // Map.turnOnAutoAreaCharting();
//   //   var c = ee.ImageCollection("projects/lcms-292214/assets/Paper/Rasters_v2022-8/StandReplacing");

//   //   Map.addLayer(
//   //     c,
//   //     {
//   //       canAreaChart: true,
//   //       min: 0,
//   //       max: 0.1,
//   //       reducer: ee.Reducer.stdDev(),
//   //       areaChartParams: {
//   //         palette: "08F,D80",
//   //         reducer: ee.Reducer.frequencyHistogram(),
//   //       },
//   //     },
//   //     "Stand Replacing"
//   //   );

//   //   Map.turnOnAutoAreaCharting();
// }
// runGTAC = function () {
//   let g = ee.FeatureCollection([
//     ee.Feature(
//       ee.Geometry.Polygon(
//         [
//           [
//             [-108.647265625, 40.96720543432847],
//             [-108.647265625, 38.740972056860564],
//             [-105.658984375, 38.740972056860564],
//             [-105.658984375, 40.96720543432847],
//           ],
//         ],
//         null,
//         false
//       ),
//       {
//         test: 1,
//         test2: 2,
//         "system:index": "0",
//       }
//     ),
//   ]);
//   let c = ee.FeatureCollection([
//     ee.Feature(ee.Geometry.Point([-111.6383210849765, 40.95922517540228]), {
//       test1: 1,
//       test2: 2,
//       "system:index": "0",
//     }),
//     ee.Feature(ee.Geometry.Point([-111.63831873804361, 40.95922441582453]), {
//       test1: 1,
//       test2: 2,
//       "system:index": "1",
//     }),
//     ee.Feature(ee.Geometry.Point([-111.63831572055847, 40.9592249222097]), {
//       test1: 1,
//       test2: 2,
//       "system:index": "2",
//     }),
//     ee.Feature(ee.Geometry.Point([-111.63832041442424, 40.95922340305422]), {
//       test1: 1,
//       test2: 2,
//       "system:index": "3",
//     }),
//     ee.Feature(ee.Geometry.Point([-111.63829828619987, 40.959219605165345]), {
//       test1: 1,
//       test2: 2,
//       "system:index": "4",
//     }),
//   ]);

//   Map.addLayer(
//     g,
//     {
//       styleParams: {
//         color: "0FF",
//         pointSize: 5,
//         pointShape: "o",
//         width: 2,
//         fillColor: "FF00FF88",
//         lineType: "dashed",
//       },
//     },
//     "Polygon Style"
//   );
//   Map.addLayer(
//     g,
//     {
//       styleParams: {
//         color: "0FF",
//         pointSize: 5,
//         pointShape: "o",
//         width: 2,
//         fillColor: "FF00FF88",
//         lineType: "dashed",
//       },
//     },
//     "Polygon Old"
//   );

//   Map.addLayer(
//     c,
//     {
//       styleParams: {
//         color: "8F0F",
//         fillColor: "FF0F",
//         lineType: "dashed",
//         pointSize: 30,
//         width: 5,
//       },
//     },
//     "Pt"
//   );

//   Map.turnOnInspector();
// };

// runGTAC = function () {
//   let lcms = ee
//     .ImageCollection("USFS/GTAC/LCMS/v2023-9")
//     .filter("study_area=='CONUS'")
//     .limit(10);

//   Map.addTimeLapse(lcms, { autoViz: true });
// };
