///////////////////////////////////////////

function getLCMSVariables() {
  // Loss/Gain Palettes
  window.declineYearPalette =
    "ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02";
  window.recoveryYearPalette = "AFDEA8,80C476,308023,145B09";

  window.declineProbPalette = "F5DEB3,D00";
  window.recoveryProbPalette = "F5DEB3,006400";

  window.declineDurPalette = "BD1600,E2F400,0C2780";
  window.recoveryDurPalette = declineDurPalette;

  window.gainYearPaletteA = "c5ee93,00a398";
  window.changePaletteFull = [
    "#3d4551",
    "#f39268",
    "#d54309",
    "#00a398",
    "#222222",
  ];
  window.changePalette = ["f39268", "d54309", "00a398"];
  window.whichIndices = ["NBR"];

  // LCMS Project Boundaries
  window.bt_study_area = ee.FeatureCollection(
    "projects/USFS/LCMS-NFS/R4/BT/GTNP_admin_bndy_5km_buffer_GTNP_Merge"
  );
  window.fnf_study_area = ee.FeatureCollection(
    "projects/USFS/LCMS-NFS/R1/FNF/FNF_GNP_Merge_Admin_BND_1k"
  );
  window.mls_study_area = ee.FeatureCollection(
    "projects/USFS/LCMS-NFS/R4/MLS/MLS_LCMS_ProjectArea_5km"
  );
  window.ck_study_area = ee
    .FeatureCollection("projects/USFS/LCMS-NFS/R10/CK/CK_LCMS_ProjectArea")
    .map(function (f) {
      return f.convexHull(1000);
    });

  // Forest Service and Park Service Boundaries
  window.usfs_regions = ee.FeatureCollection(
    "projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Region_Boundaries"
  );
  window.b = ee.FeatureCollection(
    "projects/lcms-292214/assets/Dashboard-Data/Dashboard-Input-Summary-Areas/2024-10/S_USA-AdministrativeForest_3-26-25"
  );
  window.nps = ee.FeatureCollection(
    "projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/NPS_Boundaries"
  );
  window.otherLands = ee.FeatureCollection(
    "projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/OtherNationalDesignatedArea"
  );
  window.gtnp = ee.Feature(
    nps.filter(ee.Filter.eq("PARKNAME", "Grand Teton")).first()
  );
  window.gnp = ee.Feature(
    nps.filter(ee.Filter.eq("PARKNAME", "Glacier")).first()
  );
  window.kfnp = ee.Feature(
    nps.filter(ee.Filter.eq("PARKNAME", "Kenai Fjords")).first()
  );

  window.btnf = ee.Feature(
    b
      .filter(ee.Filter.eq("FORESTNAME", "Bridger-Teton National Forest"))
      .first()
  );
  window.fnf = ee.Feature(
    b.filter(ee.Filter.eq("FORESTNAME", "Flathead National Forest")).first()
  );
  window.mlsnf = ee.Feature(
    b.filter(ee.Filter.eq("FORESTNAME", "Manti-La Sal National Forest")).first()
  );
  window.cnf = ee.Feature(
    b.filter(ee.Filter.eq("FORESTNAME", "Chugach National Forest")).first()
  );

  window.R4_unofficial = ee.FeatureCollection(
    "projects/USFS/LCMS-NFS/R4/R4_LCMS_ProjectArea_5km"
  );
  window.R4_official = usfs_regions.filter(ee.Filter.eq("REGION", "04"));
  // Other boundaries
  window.huc8 = ee.FeatureCollection("USGS/WBD/2017/HUC08");
  window.kenai_nwr = ee
    .FeatureCollection("projects/USFS/LCMS-NFS/AK-Ancillary-Data/Kenai_NWR")
    .filterBounds(ck_study_area);
}

function formatAreaChartCollection(collection, classCodes, classNames, unmask) {
  if (unmask === undefined || unmask === null) {
    unmask = true;
  }
  function unstacker(img, code) {
    return img.eq(parseInt(code));
  }
  function codeWrapper(img) {
    t = ee
      .ImageCollection(
        classCodes.map(function (code) {
          return unstacker(img, code);
        })
      )
      .toBands();
    return t
      .rename(classNames)
      .copyProperties(img, ["system:time_start"])
      .copyProperties(img);
  }
  out = ee.ImageCollection(collection.map(codeWrapper));

  if (unmask) {
    out = ee.ImageCollection(
      out.map(function (img) {
        return img.unmask(0, false);
      })
    );
  }
  return ee.ImageCollection(out);
}
function getTransitionClasses(
  collection,
  periods,
  values,
  summary_band_name,
  viz = { autoViz: true }
) {
  collection = collection.select(summary_band_name);
  let stackC = [];
  let value_combos = [];
  values.map((i1) => values.map((i2) => value_combos.push([i1, i2])));
  for (let i = 0; i < periods.length - 1; i++) {
    const startPeriod = periods[i];
    const endPeriod = periods[i + 1];

    const startPeriod_str = startPeriod.join("-");
    const endPeriod_str = endPeriod.join("-");

    const start = collection
      .filter(ee.Filter.calendarRange(startPeriod[0], startPeriod[1], "year"))
      .mode();
    const end = collection
      .filter(ee.Filter.calendarRange(endPeriod[0], endPeriod[1], "year"))
      .mode();

    let stack = [];
    let bandNames = [];
    value_combos.map((value_combo) => {
      const start_value = value_combo[0];
      const end_value = value_combo[1];

      const t = start.eq(start_value).and(end.eq(end_value));
      const str_combo = `${startPeriod_str}--${start_value}---${endPeriod_str}--${end_value}`;
      stack.push(t);
      bandNames.push(str_combo);
    });

    stack = ee.ImageCollection(stack).toBands().int16().rename(bandNames);

    stackC.push(stack);
  }
  stackC = ee.Image.cat(stackC);
  return stackC;
}
function addSankey(lcmsRun, bn) {
  const values = lcmsRun.props[bn + "_class_values"];
  const names = lcmsRun.props[bn + "_class_names"];
  const palette = lcmsRun.props[bn + "_class_palette"];
  const bnTitle = bn.replaceAll("_", " ");

  areaChartCollections[`${bn}-transition`] = {
    label: `LCMS ${bnTitle} Transition`,
    type: "transition",
    collection: lcmsRun.lcms,
    bandName: bn,
    tooltip: `Summarize ${bnTitle} transition classes from different periods of time. Results are displayed using a Sankey diagram.`,
    values: values,
    colors: palette,
    names: names,
  };
}

function batchFillCollection(c, expectedYears) {
  const actualYears = c
    .toList(10000, 0)
    .map(function (img) {
      return ee.Date(ee.Image(img).get("system:time_start")).get("year");
    })
    .distinct()
    .getInfo();
  const missingYears = expectedYears.filter(function (x) {
    return actualYears.indexOf(x) == -1;
  });
  const dummyImage = ee.Image(c.first()).mask(ee.Image(0));
  const missingCollection = missingYears.map(function (yr) {
    return dummyImage.set(
      "system:time_start",
      ee.Date.fromYMD(yr, 1, 1).millis()
    );
  });
  const out = c.merge(missingCollection).sort("system:time_start");
  return out;
}
function setSameDate(img, month = 6, day = 1) {
  const yr = img.date().get("year");
  return img.set("system:time_start", ee.Date.fromYMD(yr, month, day).millis());
}

// --------Add MTBS and IDS Layers-------------------------------
let idsStartYear = 1997;
let idsEndYear = 2023;
let idsMinYear = 1997;
let idsMaxYear = 2023;
function getIDSCollection() {
  if (startYear > idsMinYear && startYear <= idsMaxYear) {
    idsStartYear = startYear;
  } else {
    idsStartYear = idsMinYear;
  }
  if (endYear < idsMaxYear && endYear >= idsMinYear) {
    idsEndYear = endYear;
  } else {
    idsEndYear = idsMaxYear;
  }

  const idsFolder = "projects/lcms-292214/assets/CONUS-Ancillary-Data/IDS";
  try {
    let ids = ee.data.getList({ id: idsFolder }).map(function (t) {
      return t.id;
    });

    ids = ids.map(function (id) {
      const idsT = ee.FeatureCollection(id);
      return idsT;
    });
    ids = ee.FeatureCollection(ids).flatten();
    ids = ids
      .filter(
        ee.Filter.and(
          ee.Filter.gte("SURVEY_YEA", idsStartYear),
          ee.Filter.lte("SURVEY_YEA", idsEndYear)
        )
      )
      .set("bounds", clientBoundsDict.CONUS);

    const years = ee.List.sequence(idsStartYear, idsEndYear);
    let dcaCollection = years.map(function (yr) {
      const idsYr = ids.filter(ee.Filter.eq("SURVEY_YEA", yr));
      const dcaYr = idsYr
        .reduceToImage(["DCA_CODE"], ee.Reducer.first())
        .divide(1000);
      const dtYr = idsYr.reduceToImage(["DAMAGE_TYP"], ee.Reducer.first());
      return dcaYr
        .addBands(dtYr)
        .int16()
        .set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis())
        .rename(["Damage_Agent", "Damage_Type"]);
    });
    dcaCollection = ee.ImageCollection.fromImages(dcaCollection);

    return { imageCollection: dcaCollection, featureCollection: ids };
  } catch (err) {
    console.log(err);
  }
}

function getIDSCollectionAddToMap(whichLayerList = "layer-list") {
  const idsCollections = getIDSCollection();

  if (idsCollections !== undefined) {
    const idsYr = idsCollections.featureCollection
      .reduceToImage(["SURVEY_YEA"], ee.Reducer.max())
      .set("bounds", clientBoundsDict.CONUS);
    const idsCount = idsCollections.featureCollection
      .reduceToImage(["SURVEY_YEA"], ee.Reducer.count())
      .selfMask()
      .set("bounds", clientBoundsDict.CONUS);
    Map.addLayer(
      idsCount,
      {
        min: 1,
        max: Math.ceil((idsEndYear - idsStartYear) / 2) + 1,
        palette: declineYearPalette,
      },
      "IDS Survey Count",
      false,
      null,
      null,
      "Number of times an area was included in the IDS survey (" +
        idsStartYear.toString() +
        "-" +
        idsEndYear.toString() +
        ")",
      whichLayerList
    );
    Map.addLayer(
      idsYr,
      {
        min: startYear,
        max: endYear,
        palette: declineYearPalette,
      },
      "IDS Most Recent Year Surveyed",
      false,
      null,
      null,
      "Most recent year an area was included in the IDS survey (" +
        idsStartYear.toString() +
        "-" +
        idsEndYear.toString() +
        ")",
      whichLayerList
    );
    Map.addLayer(
      idsCollections.featureCollection.set("bounds", clientBoundsDict.CONUS),
      { styleParams: { color: "0FF", lineType: "dashed" } },
      "IDS Polygons",
      false,
      null,
      null,
      "Polygons from the IDS survey (" +
        idsStartYear.toString() +
        "-" +
        idsEndYear.toString() +
        ")",
      whichLayerList
    );
  }

  if (idsCollections !== undefined) {
    return [idsCollections.imageCollection, idsCollections.featureCollection];
  }
}

function getAspectObj() {
  const dem = ee.Image("USGS/SRTMGL1_003");
  const aspect = ee.Terrain.aspect(dem).int16();
  const aspectBinWidth = 90;
  let aspectBreaks = range(0, 360 + 1, aspectBinWidth).slice(0, -1);
  let from = [];
  let to = [];
  const lookupDict = ee.Dictionary({});
  let lookupNames = [
    "Northeast (0" +
      String.fromCharCode(176) +
      "-89" +
      String.fromCharCode(176) +
      ")",
    "Southeast (90" +
      String.fromCharCode(176) +
      "-179" +
      String.fromCharCode(176) +
      ")",
    "Southwest (180" +
      String.fromCharCode(176) +
      "-269" +
      String.fromCharCode(176) +
      ")",
    "Northwest (270" +
      String.fromCharCode(176) +
      "-359" +
      String.fromCharCode(176) +
      ")",
  ];
  let lookupNumbers = ee.List([]);
  let colorDict = ee.Dictionary({});

  aspectBreaks.map(function (b) {
    b = ee.Number(b);
    const s = b;
    const e = b.add(aspectBinWidth).subtract(1);
    const toValue = e.add(s).divide(2).round();
    const toValueStr = ee.Number(toValue).int16().format();
    const fromT = ee.List.sequence(s, e);
    const toT = ee.List.repeat(toValue, aspectBinWidth);
    lookupNumbers = lookupNumbers.cat([toValueStr]);
    from.push(fromT);
    to.push(toT);
    colorDict = colorDict.set(toValueStr, randomColor());
  });

  from = ee.List(from).flatten();
  to = ee.List(to).flatten();

  const aspectLookupDict = ee.Dictionary.fromLists(lookupNumbers, lookupNames);
  const aspectBinned = aspect.remap(from, to);

  return {
    image: aspectBinned,
    lookupDict: aspectLookupDict,
    colorDict: colorDict,
  };
}
function getNLCDObj() {
  const nlcdYears = [2001, 2004, 2006, 2008, 2011, 2013, 2016, 2019];
  const nlcdLCMax = 95;
  const nlcdLCMin = 0;
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
  ];

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
  const nlcd = ee
    .ImageCollection("USGS/NLCD_RELEASES/2019_REL/NLCD")
    .select(["landcover"], ["NLCD Landcover"])

    .sort("system:time_start");
  let nlcdC = nlcdYears.map(function (nlcdYear) {
    let nlcdT = nlcd
      .filter(ee.Filter.calendarRange(nlcdYear, nlcdYear, "year"))
      .mosaic();
    nlcdT = nlcdT.set(
      "system:time_start",
      ee.Date.fromYMD(nlcdYear, 6, 1).millis()
    );
    return nlcdT;
  });
  nlcdC = ee.ImageCollection(nlcdC);

  const chartTableDict = {
    "NLCD Landcover": nlcdLCQueryDict,
  };
  nlcdC = nlcdC
    .set("bounds", clientBoundsDict.All)
    .set("chartTableDict", chartTableDict);
  return {
    collection: nlcdC,
    years: nlcdYears,
    palette: nlcdLCPalette,
    vizDict: nlcdLCVizDict,
    queryDict: nlcdLCQueryDict,
    legendDict: nlcdLegendDict,
    legendDictReverse: nlcdLegendDictReverse,
    min: nlcdLCMin,
    max: nlcdLCMax,
  };
}

function getMTBSAndNLCD(studyAreaName, whichLayerList, showSeverity) {
  if (showSeverity === null || showSeverity === undefined) {
    showSeverity = false;
  }

  const mtbs_path = "USFS/GTAC/MTBS/annual_burn_severity_mosaics/v1";

  let mtbsEndYear = endYear;
  if (endYear > 2024) {
    mtbsEndYear = 2024;
  }

  const mtbsYears = ee.List.sequence(1984, mtbsEndYear);
  mtbs = ee.ImageCollection(mtbs_path);
  mtbs = mtbsYears.map(function (yr) {
    const mtbsYr = mtbs
      .filter(ee.Filter.calendarRange(yr, yr, "year"))
      .mosaic();
    return mtbsYr.set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis());
  });
  mtbs = ee.ImageCollection.fromImages(mtbs);

  mtbs = mtbs.filter(ee.Filter.calendarRange(startYear, mtbsEndYear, "year"));

  mtbs = mtbs.map(function (img) {
    return img.select([0], ["burnSeverity"]).byte();
  });

  mtbs = mtbs.map(function (img) {
    const severityRemapped = img
      .remap([1, 2, 3, 4, 5, 6], [1, 3, 4, 5, 2, 1])
      .rename(["burnSeverityRemap"]);
    let burned = img
      .remap([1, 2, 3, 4, 5, 6], [0, 1, 1, 1, 0, 0])
      .rename(["burnedNotBurned"]);
    burned = burned.selfMask();
    const burnYear = ee
      .Image(ee.Date(img.get("system:time_start")).get("year"))
      .updateMask(severityRemapped.mask())
      .rename("burnYear");
    return img
      .addBands(severityRemapped)
      .addBands(burned)
      .addBands(burned.multiply(-1).rename(["burnYearNegative"]))
      .addBands(burnYear)
      .int16();
  });

  mtbs = ee.ImageCollection(mtbs);

  const mtbsSummaryDict = {
    "Highest-Severity": "burnSeverityRemap",
    "Most-Recent": "burnYear",
    Oldest: "burnYearNegative",
  };
  window.mtbsSummaryMethod = window.mtbsSummaryMethod || "Highest-Severity";
  const mtbsSummarized = mtbs.qualityMosaic(mtbsSummaryDict[mtbsSummaryMethod]);
  const mtbsCount = mtbs.select([2]).count();

  const mtbsClassDict = {
    "Unburned to Low": "006400",
    Low: "7fffd4",
    Moderate: "ffff00",
    High: "ff0000",
    "Increased Greenness": "7fff00",
    "Non-Processing Area Mask": "ffffff",
  };

  mtbsQueryClassDict = {};
  let keyI = 1;
  Object.keys(mtbsClassDict).map(function (k) {
    mtbsQueryClassDict[keyI] = k;
    keyI++;
  });

  if (chartMTBS === true) {
    let mtbsStack = formatAreaChartCollection(
      mtbs.select([0]),
      Object.keys(mtbsQueryClassDict),
      Object.values(mtbsQueryClassDict),
      true
    );
    areaChartCollections["mtbs"] = {
      collection: mtbsStack,
      colors: Object.values(mtbsClassDict),
      label: "MTBS Burn Severity by Year",
      stacked: true,
      steppedLine: false,
      chartType: "bar",
      xAxisProperty: "year",
      tooltip: "Chart the MTBS burn severity by year",
    };
    areaChartCollections["mtbs_burn_mosaic"] = {
      collection: ee.ImageCollection([
        mtbs
          .select([2])
          .mosaic()
          .unmask(0)
          .rename(["Burned"])
          .set(
            "Burned",
            "All Mapped Burned Area (Total of Low, Moderate, and High Severity) " +
              startYear.toString() +
              "-" +
              endYear.toString()
          ),
      ]),
      colors: ["#CC5500"],
      label:
        "MTBS Burned Area Total " +
        startYear.toString() +
        "-" +
        endYear.toString(),
      stacked: true,
      steppedLine: false,
      chartType: "bar",
      xAxisProperty: "Burned",
      tooltip:
        "Chart the union of all burned areas (areas with low, moderate, or high severity) " +
        startYear.toString() +
        "-" +
        endYear.toString(),
    };
    areaChartCollections["mtbs_burn_severity_mosaic"] = {
      collection: ee.ImageCollection([
        mtbsStack
          .max()
          .unmask(0)
          .set(
            "Burned",
            "Burn Severity Total " +
              startYear.toString() +
              "-" +
              endYear.toString()
          ),
      ]),
      colors: Object.values(mtbsClassDict),
      label:
        "MTBS Burn Severity Total " +
        startYear.toString() +
        "-" +
        endYear.toString(),
      stacked: true,
      steppedLine: false,
      chartType: "bar",
      xAxisProperty: "Burned",
      tooltip:
        "Chart the union of burn severity " +
        startYear.toString() +
        "-" +
        endYear.toString() +
        ". The maximum severity is used when fires overlap. ",
    };
  }
  let mtbsMaxSeverity = mtbs.select([0]).max();
  let nlcdObj;
  if (chartMTBSByNLCD) {
    nlcdObj = getNLCDObj();

    Map.addTimeLapse(
      nlcdObj.collection,
      {
        min: nlcdObj.min,
        max: nlcdObj.max,
        palette: Object.values(nlcdObj.vizDict),
        addToClassLegend: true,
        classLegendDict: nlcdObj.legendDictReverse,
        queryDict: nlcdObj.queryDict,
        years: nlcdObj.years,
      },
      "NLCD Land Cover Time Lapse",
      false,
      null,
      null,
      "NLCD landcover classes ",
      "reference-layer-list"
    );

    nlcdObj.years.map(function (nlcdYear) {
      const nlcdT = nlcdObj.collection
        .filter(ee.Filter.calendarRange(nlcdYear, nlcdYear, "year"))
        .mosaic();
      let mtbsByNLCD = Object.keys(nlcdObj.queryDict).map(function (k) {
        const name = nlcdObj.queryDict[k];
        const out = mtbsMaxSeverity
          .updateMask(nlcdT.eq(ee.Number.parse(k)))
          .set("nlcd_landcover_class", name);
        return out;
      });
      mtbsByNLCD = ee.ImageCollection(mtbsByNLCD);
      let mtbsByNLCDStack = formatAreaChartCollection(
        mtbsByNLCD,
        Object.keys(mtbsQueryClassDict),
        Object.values(mtbsQueryClassDict),
        true
      );

      areaChartCollections["mtbsNLCD" + nlcdYear.toString()] = {
        collection: mtbsByNLCDStack,
        colors: Object.values(mtbsClassDict),
        label: "MTBS Burn Severity by NLCD Class " + nlcdYear.toString(),
        stacked: true,
        steppedLine: false,
        chartType: "bar",
        xAxisProperty: "nlcd_landcover_class",
        xAxisLabel: "NLCD " + nlcdYear.toString() + " Class",
        tooltip:
          "Chart MTBS burn severity by each NLCD " +
          nlcdYear.toString() +
          " landcover class",
      };
      // }
    });
  }
  if (chartMTBSByAspect) {
    const aspectObj = getAspectObj();
    const aspectBinned = aspectObj.image;
    const aspectLookupDict = aspectObj.lookupDict.getInfo();
    let mtbsByAspect = Object.keys(aspectLookupDict).map(function (k) {
      const name = aspectLookupDict[k];
      const out = mtbsMaxSeverity
        .updateMask(aspectBinned.eq(ee.Number.parse(k)))
        .set("Aspect_Bin", name);
      return out;
    });
    mtbsByAspect = ee.ImageCollection(mtbsByAspect);
    const mtbsByAspectStack = formatAreaChartCollection(
      mtbsByAspect,
      Object.keys(mtbsQueryClassDict),
      Object.values(mtbsQueryClassDict),
      true
    );

    areaChartCollections["mtbsAspect"] = {
      collection: mtbsByAspectStack,
      colors: Object.values(mtbsClassDict),
      label: "MTBS Burn Severity by Aspect",
      stacked: true,
      steppedLine: false,
      chartType: "bar",
      xAxisProperty: "Aspect_Bin",
      xAxisLabel: "Aspect Bin",
      tooltip: "Chart MTBS burn severity by aspect quadrants.",
    };
  }

  const severityViz = {
    queryDict: mtbsQueryClassDict,
    min: 1,
    max: 6,
    palette: "006400,7fffd4,ffff00,ff0000,7fff00,ffffff",
    addToClassLegend: true,
    classLegendDict: mtbsClassDict,
  };
  Map.addLayer(
    mtbsSummarized.select([0]).set("bounds", clientBoundsDict.All),
    severityViz,
    "MTBS Burn Severity",
    showSeverity,
    null,
    null,
    "MTBS " +
      mtbsSummaryMethod +
      " burn severity mosaic from " +
      startYear.toString() +
      "-" +
      mtbsEndYear.toString(),
    whichLayerList
  );
  Map.addLayer(
    mtbsSummarized.select([4]).set("bounds", clientBoundsDict.All),
    {
      min: startYear,
      max: endYear,
      palette: declineYearPalette,
    },
    "MTBS Burn Year",
    false,
    null,
    null,
    "MTBS " +
      mtbsSummaryMethod +
      " burn year from " +
      startYear.toString() +
      "-" +
      mtbsEndYear.toString(),
    whichLayerList
  );
  Map.addLayer(
    mtbsCount.set("bounds", clientBoundsDict.All),
    {
      min: 1,
      max: 5,
      palette: declineDurPalette.split(",").reverse().join(","),
      legendLabelLeft: "Count =",
      legendLabelRight: "Count >=",
    },
    "MTBS Burn Count",
    false,
    null,
    null,
    "MTBS number of burns mapped for a given area from " +
      startYear.toString() +
      "-" +
      mtbsEndYear.toString() +
      " with a burn serverity class of low, moderate, or high",
    whichLayerList
  );

  const chartTableDict = {
    "Burn Severity": mtbsQueryClassDict,
  };
  return {
    NLCD: nlcdObj,
    MTBS: {
      collection: mtbs
        .set("bounds", clientBoundsDict.All)
        .select([0], ["Burn Severity"])
        .set("chartTableDict", chartTableDict),
    },
    MTBSSeverityViz: severityViz,
  };
}
// function getMTBSandIDS(studyAreaName, whichLayerList) {
//   if (whichLayerList === null || whichLayerList === undefined) {
//     whichLayerList = "reference-layer-list";
//   }
//   const idsCollections = getIDSCollection();
//   const mtbs_path = "projects/USFS/DAS/MTBS/BurnSeverityMosaics";
//   const nlcd = ee.ImageCollection("USGS/NLCD_RELEASES/2016_REL");
//   const nlcd_tcc = ee
//     .ImageCollection("USGS/NLCD_RELEASES/2021_REL/TCC/v2021-4")
//     .select([0, 2])
//     .map((img) => img.selfMask());

//   Map.addLayer(
//     nlcd_tcc,
//     {
//       bands: "NLCD_Percent_Tree_Canopy_Cover",
//       min: 1,
//       max: 90,
//       palette: "white,green",
//     },
//     "NLCD Tree Canopy Cover",
//     false,
//     null,
//     null,
//     "NLCD Tree Canopy Cover v2021-4",
//     whichLayerList
//   );

//   if (idsCollections !== undefined) {
//     const idsYr = idsCollections.featureCollection
//       .reduceToImage(["SURVEY_YEA"], ee.Reducer.max())
//       .set("bounds", clientBoundsDict.CONUS);
//     const idsCount = idsCollections.featureCollection
//       .reduceToImage(["SURVEY_YEA"], ee.Reducer.count())
//       .selfMask()
//       .set("bounds", clientBoundsDict.CONUS);
//     Map.addLayer(
//       idsCount,
//       {
//         min: 1,
//         max: Math.ceil((idsEndYear - idsStartYear) / 2) + 1,
//         palette: declineYearPalette,
//       },
//       "IDS Survey Count",
//       false,
//       null,
//       null,
//       "Number of times an area was included in the IDS survey (" +
//         idsStartYear.toString() +
//         "-" +
//         idsEndYear.toString() +
//         ")",
//       whichLayerList
//     );
//     Map.addLayer(
//       idsYr,
//       {
//         min: startYear,
//         max: endYear,
//         palette: declineYearPalette,
//       },
//       "IDS Most Recent Year Surveyed",
//       false,
//       null,
//       null,
//       "Most recent year an area was included in the IDS survey (" +
//         idsStartYear.toString() +
//         "-" +
//         idsEndYear.toString() +
//         ")",
//       whichLayerList
//     );
//     Map.addLayer(
//       idsCollections.featureCollection.set("bounds", clientBoundsDict.CONUS),
//       { styleParams: { color: "0FF", lineType: "dashed" } },
//       "IDS Polygons",
//       false,
//       null,
//       null,
//       "Polygons from the IDS survey (" +
//         idsStartYear.toString() +
//         "-" +
//         idsEndYear.toString() +
//         ")",
//       whichLayerList
//     );
//   }

//   const mtbs = getMTBSAndNLCD(studyAreaName, whichLayerList).MTBS.collection;
//   if (idsCollections !== undefined) {
//     return [
//       mtbs,
//       idsCollections.imageCollection,
//       idsCollections.featureCollection,
//     ];
//   } else {
//     return [mtbs, undefined, undefined];
//   }
// }
function getNAIP(whichLayerList, timeLapse) {
  whichLayerList = whichLayerList || "reference-layer-list";
  timeLapse = timeLapse !== null && timeLapse !== undefined ? timeLapse : false;
  const naip = ee
    .ImageCollection("USDA/NAIP/DOQQ")
    .select([0, 1, 2], ["R", "G", "B"]);
  let naipYears;
  if (timeLapse === true) {
    naipYears = range(2003, 2024 + 1);
    // Map.addTimeLapse(
    //   naip,
    //   { addToLegend: false, min: 25, max: 225, years: naipYears, mosaic: true },
    //   "NAIP Time Lapse",
    //   false,
    //   null,
    //   null,
    //   "The National Agriculture Imagery Program (NAIP) acquired aerial imagery from the " +
    //     naipYears[0].toString() +
    //     " to the " +
    //     naipYears[1].toString() +
    //     " agricultural growing season in the continental U.S.",
    //   whichLayerList
    // );
  } else {
    naipYears = [
      [2003, 2007],
      [2008, 2008],
      [2009, 2011],
      [2012, 2014],
      [2015, 2017],
      [2018, 2020],
      [2021, 2022],
    ];
    naipYears.map(function (yr) {
      const naipT = naip
        .filter(ee.Filter.calendarRange(yr[0], yr[1], "year"))
        .mosaic()
        .byte()
        .set("bounds", clientBoundsDict.CONUS);

      Map.addLayer(
        naipT,
        { addToLegend: false, min: 25, max: 225 },
        `NAIP ${yr[0]}-${yr[1]}`,
        false,
        null,
        null,
        "The National Agriculture Imagery Program (NAIP) acquired aerial imagery from " +
          yr[0].toString() +
          " to the " +
          yr[1].toString() +
          " agricultural growing season in the continental U.S.",
        whichLayerList
      );
    });
  }
}
function getHansen(whichLayerList) {
  if (whichLayerList === null || whichLayerList === undefined) {
    whichLayerList = "reference-layer-list";
  }
  const hansen = ee
    .Image("UMD/hansen/global_forest_change_2023_v1_11")
    .reproject("EPSG:4326", null, 30);

  const hansenClientBoundary = {
    type: "Polygon",
    coordinates: [
      [
        [-180, -90],
        [180, -90],
        [180, 90],
        [-180, 90],
        [-180, -90],
      ],
    ],
  };
  let hansenLoss = hansen.select(["lossyear"]).selfMask().add(2000).int16();
  let hansenStartYear = 2001;
  let hansenEndYear = 2023;

  if (startYear > hansenStartYear) {
    hansenStartYear = startYear;
  }
  if (endYear < hansenEndYear) {
    hansenEndYear = endYear;
  }

  const hansenGain = hansen.select(["gain"]);
  hansenLoss = hansenLoss.updateMask(
    hansenLoss.gte(startYear).and(hansenLoss.lte(endYear))
  );
  Map.addLayer(
    hansenLoss.set("bounds", hansenClientBoundary),
    {
      min: startYear,
      max: endYear,
      palette: declineYearPalette,
    },
    "Hansen Loss Year",
    false,
    null,
    null,
    "Hansen Global Forest Change year of loss",
    whichLayerList
  );
  Map.addLayer(
    hansenGain.updateMask(hansenGain).set("bounds", hansenClientBoundary),
    {
      min: 1,
      max: 1,
      palette: "0A0",
      addToClassLegend: true,

      classLegendDict: { "Forest Gain": "0A0" },
    },
    "Hansen Gain",
    false,
    null,
    null,
    "Hansen Global Forest Change gain",
    whichLayerList
  );
}
function getNLCD() {
  const nlcd = ee.ImageCollection("USGS/NLCD_RELEASES/2016_REL").select([0]);

  const nlcdForClasses = ee.Image("USGS/NLCD_RELEASES/2016_REL/2011");
  const names = nlcdForClasses.get("landcover_class_names");
  const palette = nlcdForClasses.get("landcover_class_palette");
  const values = nlcdForClasses
    .get("landcover_class_values")
    .getInfo()
    .map(function (i) {
      return i.toString();
    });

  const classDict = ee.Dictionary.fromLists(values, palette).getInfo();
  print(classDict);
  const years = nlcd
    .toList(1000)
    .map(function (i) {
      i = ee.Image(i);
      const d = ee.Date(i.get("system:time_start"));
      const y = d.get("year");
      return y;
    })
    .getInfo();
  const yearsU = [];
  years.map(function (y) {
    if (yearsU.indexOf(y) == -1) {
      yearsU.push(y);
    }
  });

  let nlcdMosaic = yearsU.map(function (y) {
    const nlcdT = nlcd.filter(ee.Filter.calendarRange(y, y, "year")).mosaic();
    return nlcdT.set("system:time_start", ee.Date.fromYMD(y, 6, 1).millis());
  });
  nlcdMosaic = ee.ImageCollection(nlcdMosaic);
  Map.addLayer(
    nlcdMosaic.mode(),
    { addToClassLegend: true, classLegendDict: classDict },
    "NLCD"
  );
}

//---------------Apply thresholds to loss and gain-------------------------------------------------------
function thresholdChange(
  changeCollection,
  changeThreshLower,
  changeThreshUpper,
  changeDir
) {
  if (changeDir === undefined || changeDir === null) {
    changeDir = 1;
  }
  let bandNames = ee.Image(changeCollection.first()).bandNames();
  bandNames = bandNames.map(function (bn) {
    return ee.String(bn).cat("_change_year");
  });
  const change = changeCollection.map(function (img) {
    const yr = ee.Date(img.get("system:time_start")).get("year");
    let changeYr = img
      .multiply(changeDir)
      .gte(changeThreshLower)
      .and(img.multiply(changeDir).lte(changeThreshUpper));
    const yrImage = img.where(img.mask(), yr);
    changeYr = yrImage.updateMask(changeYr).rename(bandNames).int16();
    return img.updateMask(changeYr.mask()).addBands(changeYr);
  });
  return change;
}
///////////////////////////////////////////////////////
function getSelectLayers(short) {
  let perims = ee.FeatureCollection("USFS/GTAC/MTBS/burned_area_boundaries/v1"); //ee.FeatureCollection('projects/USFS/DAS/MTBS/mtbs_perims_DD');
  perims = perims.map(function (f) {
    const d = ee.Date(f.get("Ig_Date")).millis();

    return f.set("system:time_start", f.get("Ig_Date"));
  });

  perims = perims.filterDate(
    ee.Date.fromYMD(startYear, 1, 1),
    ee.Date.fromYMD(endYear, 12, 31)
  );

  const huc4 = ee.FeatureCollection("USGS/WBD/2017/HUC04");
  const huc8 = ee.FeatureCollection("USGS/WBD/2017/HUC08");
  const huc12 = ee.FeatureCollection("USGS/WBD/2017/HUC12");
  const wdpa = ee.FeatureCollection("WCMC/WDPA/current/polygons");
  const wilderness = wdpa.filter(ee.Filter.eq("DESIG", "Wilderness"));
  const counties = ee.FeatureCollection(
    "projects/lcms-292214/assets/Dashboard-Data/Dashboard-Input-Summary-Areas/2024-10/tl_2024_us_county_wNames"
  );
  const tiles = ee.FeatureCollection("users/jdreynolds33/Zones_New");
  const bia = ee.FeatureCollection(
    "projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/bia_bounds_2017"
  );
  let ecoregions_subsections = ee.FeatureCollection(
    "projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/Baileys_Ecoregions_Subsections"
  );
  ecoregions_subsections = ecoregions_subsections.select(
    ["MAP_UNIT_N"],
    ["NAME"],
    true
  );
  let ecoregions = ee.FeatureCollection(
    "projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/Baileys_Ecoregions"
  );
  ecoregions = ecoregions.select(["SECTION"], ["NAME"]);
  const ecoregionsEPAL4 = ee.FeatureCollection("EPA/Ecoregions/2013/L4");
  let district_boundaries = ee.FeatureCollection(
    "projects/lcms-292214/assets/Dashboard-Data/Dashboard-Input-Summary-Areas/2024-10/S_USA-RangerDistrict_3-26-25"
  );
  district_boundaries = district_boundaries.select(["DISTRICTNA"], ["name"]);
  const msas = ee.FeatureCollection(
    "projects/lcms-292214/assets/Dashboard-Data/Dashboard-Input-Summary-Areas/2024-10/TIGER_Urban_Areas_2024"
  );

  if (short === null || short === undefined || short === false) {
    Map.addSelectLayer(
      bia,
      { strokeColor: "0F0" },
      "BIA Boundaries",
      false,
      null,
      null,
      "BIA boundaries. Turn on layer and click on any area wanted to include in chart"
    );

    Map.addSelectLayer(
      huc12,
      { strokeColor: "00F" },
      "HUC 12",
      false,
      null,
      null,
      "HUC 12 watershed boundaries. Turn on layer and click on any HUC 12 wanted to include in chart"
    );

    Map.addSelectLayer(
      ecoregions,
      { strokeColor: "8F8" },
      "Baileys Ecoregions Sections",
      false,
      null,
      null,
      "Baileys ecoregion sections. Turn on layer and click on any ecoregion wanted to include in chart"
    );

    Map.addSelectLayer(
      ecoregions_subsections,
      { strokeColor: "8F0" },
      "Baileys Ecoregions Subsections",
      false,
      null,
      null,
      "Baileys ecoregions subsections. Turn on layer and click on any ecoregion wanted to include in chart"
    );
    Map.addSelectLayer(
      ee.FeatureCollection("EPA/Ecoregions/2013/L3"),
      { strokeColor: "8F8" },
      "Level 3 EPA Ecoregions",
      false,
      null,
      null,
      "Omernik and Griffith 2014 Level 3 EPA Ecoregions. Turn on layer and click on any ecoregion wanted to include in chart"
    );
    Map.addSelectLayer(
      ee.FeatureCollection("EPA/Ecoregions/2013/L4"),
      { strokeColor: "8FD" },
      "Level 4 EPA Ecoregions",
      false,
      null,
      null,
      "Omernik and Griffith 2014 Level 4 EPA Ecoregions. Turn on layer and click on any ecoregion wanted to include in chart"
    );

    Map.addSelectLayer(
      otherLands,
      { strokeColor: "DD0" },
      "Other Designated Lands",
      false,
      null,
      null,
      "A boundary within which National Forest System land parcels have managment or use limits placed on them by legal authority. Examples are: National Recreation Area, National Monument, and National Game Refuge. Turn on layer and click on any Park wanted to include in chart"
    );
    Map.addSelectLayer(
      ee.FeatureCollection("TIGER/2018/States"),
      { strokeColor: "AD0" },
      "US States and Territories",
      false,
      null,
      null,
      "2018 TIGER state and territory boundaries for the United States. Turn on layer and click on any state/territory wanted to include in chart"
    );
  }

  Map.addSelectLayer(
    counties,
    { strokeColor: "08F", selectLayerNameProperty: "FULL_NAME" },
    "US Counties",
    false,
    null,
    null,
    "TIGER, 2024, U.S. Counties (https://www2.census.gov/geo/tiger/TIGER2024/COUNTY/tl_2024_us_county.zip). Turn on layer and click on any county to include in chart"
  );

  Map.addSelectLayer(
    msas,
    { strokeColor: "88F", selectLayerNameProperty: "NAME20" },
    "US Census Urban Areas",
    false,
    null,
    null,
    "TIGER, 2024, U.S. Urban Areas (https://www2.census.gov/geo/tiger/TIGER2024/UAC20/tl_2024_us_uac20.zip). Turn on layer and click on any urban area to include in chart"
  );

  Map.addSelectLayer(
    nps,
    { strokeColor: "F0F", selectLayerNameProperty: "PARKNAME" },
    "National Parks",
    false,
    null,
    null,
    "National Park boundaries. Turn on layer and click on any Park to include in chart"
  );
  Map.addSelectLayer(
    b,
    { strokeColor: "00F", selectLayerNameProperty: "FORESTNAME" },
    "National Forests",
    false,
    null,
    null,
    "National Forest boundaries. Turn on layer and click on any Forest to include in chart"
  );

  Map.addSelectLayer(
    district_boundaries,
    { strokeColor: "80F", selectLayerNameProperty: "name" },
    "National Forest Districts",
    false,
    null,
    null,
    "National Forest District boundaries. Turn on layer and click on any District to include in chart"
  );
  Map.addSelectLayer(
    perims,
    {
      strokeColor: "808",

      selectLayerNameProperty: "Incid_Name",
    },
    "MTBS Fires",
    false,
    null,
    null,
    "Delineated perimeters of each MTBS mapped fire from " +
      startYear.toString() +
      "-" +
      endYear.toString() +
      ". Turn on layer and click on any fire to include in chart"
  );
}

function addNDVI(pre) {
  const ndvi = pre.normalizedDifference(["nir", "red"]).rename("NDVI");
  return pre.addBands(ndvi);
}

function getAnnualNLCD(
  addToMap = true,
  addToAreaCharting = true,
  whichLayerList = "layer-list",
  visible = true
) {
  let minNLCDYear = 1985;
  let maxNLCDYear = 2023;
  let startYear = urlParams.startYear || minNLCDYear;
  let endYear = urlParams.endYear || maxNLCDYear;
  minNLCDYear = startYear >= minNLCDYear ? startYear : minNLCDYear;
  maxNLCDYear = endYear <= maxNLCDYear ? endYear : maxNLCDYear;
  const nlcdYearsCli = range(minNLCDYear, maxNLCDYear + 1);
  const landCoverVizProps = {
    LC_class_values: [
      11, 12, 21, 22, 23, 24, 31, 41, 42, 43, 52, 71, 81, 82, 90, 95,
    ],
    LC_class_palette: [
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
      "ccb879",
      "dfdfc2",
      "dcd939",
      "ab6c28",
      "b8d9eb",
      "6c9fb8",
    ],
    LC_class_names: [
      "Open Water",
      "Perennial Ice/Snow",
      "Developed, Open Space",
      "Developed, Low Intensity",
      "Developed, Medium Intensity",
      "Developed, High Intensity",
      "Barren Land",
      "Deciduous Forest",
      "Evergreen Forest",
      "Mixed Forest",
      "Shrub/Scrub",
      "Grassland/Herbaceous",
      "Pasture/Hay",
      "Cultivated Crops",
      "Woody Wetlands",
      "Emergent Herbaceous Wetlands",
    ],
    bandNames: ["LC"],
    layerType: "ImageCollection",
    size: nlcdYearsCli.length,
  };
  const queryDict = toObj(
    landCoverVizProps.LC_class_values,
    landCoverVizProps.LC_class_names
  );
  // const combinedVizProps = {
  //   LC_class_values: landCoverVizProps.LC_class_values,
  //   LC_class_palette: landCoverVizProps.LC_class_palette,
  //   LC_class_names: landCoverVizProps.LC_class_names,
  //   bandNames: ["LC", "Severity"],
  //   layerType: landCoverVizProps.layerType,
  //   size: landCoverVizProps.size,
  //   Severity_class_names: mtbsSeverityObjInfo.Severity_class_names,
  //   Severity_class_palette: mtbsSeverityObjInfo.Severity_class_palette,
  //   Severity_class_values: mtbsSeverityObjInfo.Severity_class_values,
  // };
  let nlcd_landcover = ee.ImageCollection(
    "projects/sat-io/open-datasets/USGS/ANNUAL_NLCD/LANDCOVER"
  );
  let nlcd_fractional_impervious_surface = ee.ImageCollection(
    "projects/sat-io/open-datasets/USGS/ANNUAL_NLCD/FRACTIONAL_IMPERVIOUS_SURFACE"
  );
  const lc_vizParams = {
    reducer: ee.Reducer.mode(),
    autoViz: true,
    // canAreaChart: True,
    // areaChartParams: { line: True, sankey: True, sankeyMinPercentage: 0.1 },
  };

  nlcd_landcover = nlcd_landcover.map((img) => {
    let out = img.rename("LC").set(landCoverVizProps);
    const yr = out.date().get("year");
    out = out.set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis());
    return out;
  });
  if (addToMap) {
    Map.addLayer(
      nlcd_landcover,
      {
        autoViz: true,
        years: nlcdYearsCli,
        eeObjInfo: landCoverVizProps,
        includeClassValues: false,
      },
      "Annual NLCD",
      false,
      null,
      null,
      "NLCD landcover classes ",
      "reference-layer-list"
    );
  }
  if (addToAreaCharting) {
    areaChart.addLayer(
      nlcd_landcover,
      {
        eeObjInfo: landCoverVizProps,
        line: true,
        xAxisLabels: nlcdYearsCli,
      },
      "NLCD Annual",
      true
    );
    areaChart.addLayer(
      nlcd_landcover,
      {
        eeObjInfo: landCoverVizProps,
        xAxisLabels: nlcdYearsCli,
        sankey: true,
      },
      "NLCD Tranition",
      false
    );
  }
  return {
    imageCollectionLandCover: nlcd_landcover,
    imageCollectionImpervious: nlcd_fractional_impervious_surface,
    years: nlcdYearsCli,
    info: landCoverVizProps,
    queryDict: queryDict,
  };
}
function getMTBS(
  addToMap = true,
  addToAreaCharting = true,
  whichLayerList = "layer-list",
  visible = true
) {
  startYear = parseInt(urlParams.startYear) || 1984;
  endYear = parseInt(urlParams.endYear) || 2024;

  window.mtbsLayerStyling = {
    labelClasses: "layer-label-mtbs",
    labelIconHTML: `<img class="panel-title-svg-xsm" alt="MTBS icon" src="./src/assets/images/mtbs-logo.png">`,
  };

  const yearsCli = range(startYear, endYear + 1);
  const mtbsSeverityObjInfo = {
    Severity_class_names: [
      "Non-Mapping Area",
      "Increased Greenness",
      "Unburned to Low",
      "Low",
      "Moderate",
      "High",
    ],
    Severity_class_palette: [
      "ffffff",
      "7fff00",
      "006400",
      "7fffd4",
      "ffff00",
      "ff0000",
    ],
    Severity_class_values: [1, 2, 3, 4, 5, 6],
    bandNames: ["Severity"],
    layerType: "ImageCollection",
    size: yearsCli.length,
  };
  const queryDict = toObj(
    mtbsSeverityObjInfo.Severity_class_values,
    mtbsSeverityObjInfo.Severity_class_names
  );
  let mtbsSeverity = ee.ImageCollection(
    "USFS/GTAC/MTBS/annual_burn_severity_mosaics/v1"
  );
  mtbsSeverity = ee.ImageCollection(
    yearsCli.map((yr) => {
      let mtbsSeverityYr = mtbsSeverity
        .filter(ee.Filter.calendarRange(yr, yr, "year"))
        .mosaic()
        .set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis());

      return mtbsSeverityYr;
    })
  );

  mtbsSeverity = mtbsSeverity.map(function (img) {
    const severityRemapped = img
      .remap([1, 2, 3, 4, 5, 6], [3, 4, 5, 6, 2, 1])
      .rename(["Severity"]);
    let burned = img
      .remap([1, 2, 3, 4, 5, 6], [0, 1, 1, 1, 0, 0])
      .rename(["burnedNotBurned"]);
    burned = burned.selfMask();
    const burnYear = ee
      .Image(img.date().get("year"))
      .updateMask(severityRemapped.mask())
      .rename("burnYear");
    return severityRemapped
      .addBands(burned)
      .addBands(burned.multiply(-1).rename(["burnYearNegative"]))
      .addBands(burnYear)
      .int16()
      .copyProperties(img, ["system:time_start"])
      .set(mtbsSeverityObjInfo);
  });
  const mtbsSummaryDict = {
    "Highest-Severity": "Severity",
    "Most-Recent": "burnYear",
    Oldest: "burnYearNegative",
  };
  window.mtbsSummaryMethod = window.mtbsSummaryMethod || "Highest-Severity";
  const mtbsSummarized = mtbsSeverity
    .qualityMosaic(mtbsSummaryDict[mtbsSummaryMethod])
    .set(mtbsSeverityObjInfo);
  const mtbsCount = mtbsSeverity.select([1]).count();

  //
  // Use the GEE built-in properties for symbology by setting the properties as follows

  let perims = ee.FeatureCollection("USFS/GTAC/MTBS/burned_area_boundaries/v1"); //ee.FeatureCollection('projects/USFS/DAS/MTBS/mtbs_perims_DD');
  const inFields = [
    "Incid_Name",
    "Incid_Type",
    "Event_ID",
    "irwinID",
    "Ignition Date",
    "BurnBndAc",
    "Asmnt_Type",
  ];
  const outFields = [
    "Incident Name",
    "Incident Type",
    "MTBS Event ID",
    "IRWIN ID",
    "Ignition Date",
    "Acres",
    "Assessment Type",
  ];
  perims = perims.map(function (f) {
    const d = ee.Date(f.get("Ig_Date"));
    const formatted = d.format("YYYY-MM-dd");
    return f.set({
      Year: d.get("year"),
      "Ignition Date": formatted,
    });
  });

  perims = perims.filter(ee.Filter.gte("Year", startYear));
  perims = perims.filter(ee.Filter.lte("Year", endYear));

  perims = perims.select(inFields, outFields);
  perims = perims.set("bounds", clientBoundsDict.All);

  if (addToMap) {
    Map.addLayer(
      ee.ImageCollection([mtbsSummarized.select(["Severity"])]),
      {
        autoViz: true,
        queryItem: mtbsSeverity.select(["Severity"]),
        eeObjInfo: mtbsSeverityObjInfo,
        includeClassValues: false,
        labelClasses: mtbsLayerStyling.labelClasses,
        labelIconHTML: mtbsLayerStyling.labelIconHTML,
      },
      "MTBS Burn Severity",
      visible,
      null,
      null,
      "MTBS " +
        mtbsSummaryMethod +
        " burn severity mosaic from " +
        startYear.toString() +
        "-" +
        endYear.toString(),
      whichLayerList
    );
    Map.addLayer(
      mtbsSummarized.select([3]).set("bounds", clientBoundsDict.All),
      {
        min: startYear,
        max: endYear,
        palette: declineYearPalette,
        labelClasses: mtbsLayerStyling.labelClasses,
        labelIconHTML: mtbsLayerStyling.labelIconHTML,
      },
      "MTBS Burn Year",
      false,
      null,
      null,
      "MTBS " +
        mtbsSummaryMethod +
        " burn year from " +
        startYear.toString() +
        "-" +
        endYear.toString(),
      whichLayerList
    );
    Map.addLayer(
      mtbsCount.set("bounds", clientBoundsDict.All),
      {
        min: 1,
        max: 5,
        palette: declineDurPalette.split(",").reverse().join(","),
        legendLabelLeft: "Count =",
        legendLabelRight: "Count >=",
        labelClasses: mtbsLayerStyling.labelClasses,
        labelIconHTML: mtbsLayerStyling.labelIconHTML,
      },
      "MTBS Burn Count",
      false,
      null,
      null,
      "MTBS number of burns mapped for a given area from " +
        startYear.toString() +
        "-" +
        endYear.toString() +
        " with a burn serverity class of low, moderate, or high",
      whichLayerList
    );
    Map.addLayer(
      perims,
      {
        styleParams: {
          color: "00D",
          fillColor: "0000",
          width: 1.5,
          lineType: "dashed",
        },
        labelClasses: mtbsLayerStyling.labelClasses,
        labelIconHTML: mtbsLayerStyling.labelIconHTML,
      },
      "MTBS Burn Perimeters",
      visible,
      null,
      null,
      "Delineated perimeters of each MTBS mapped fire from " +
        startYear.toString() +
        "-" +
        endYear.toString() +
        ". Areas can have multiple mapped fires.",
      whichLayerList
    );
  }

  if (addToAreaCharting) {
    areaChart.addLayer(
      mtbsSeverity,
      {
        eeObjInfo: mtbsSeverityObjInfo,
        visible: [false, false, true, true, true, true],
        xAxisLabels: yearsCli,
        shouldUnmask: true,
        chartType: "stacked-bar",
      },
      "MTBS Annual Severity",
      true
    );
  }
  // let mtbsNLCD = mtbsSeverity.linkCollection(
  //   nlcd_landcover,
  //   ["LC"],
  //   null,
  //   "system:time_start"
  // );
  // mtbsNLCD = mtbsNLCD.map((img) => img.set(combinedVizProps));
  // console.log(mtbsNLCD.getInfo());
  // areaChart.addLayer(
  //   mtbsNLCD,
  //   {
  //     eeObjInfo: combinedVizProps,
  //     xAxisLabels: yearsCli,
  //     shouldUnmask: true,
  //     chartType: "stacked-bar",
  //   },
  //   "MTBS Severity + NLCD Annual",
  //   true
  // );
  return {
    imageCollection: mtbsSeverity,
    perims: perims,
    info: mtbsSeverityObjInfo,
    queryDict: queryDict,
  }; //return the image collection and the severity image for use in other functions
}
