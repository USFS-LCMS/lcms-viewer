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
    "projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Boundaries"
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

function getIDSCollectionAddToMap() {
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
        ")"
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
        ")"
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
        ")"
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
  if (mtbsSummaryMethod === null || mtbsSummaryMethod === undefined) {
    mtbsSummaryMethod = "Highest-Severity";
  }

  const mtbs_path = "USFS/GTAC/MTBS/annual_burn_severity_mosaics/v1";

  let mtbsEndYear = endYear;
  if (endYear > 2022) {
    mtbsEndYear = 2022;
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
function getMTBSandIDS(studyAreaName, whichLayerList) {
  if (whichLayerList === null || whichLayerList === undefined) {
    whichLayerList = "reference-layer-list";
  }
  const idsCollections = getIDSCollection();
  const mtbs_path = "projects/USFS/DAS/MTBS/BurnSeverityMosaics";
  const nlcd = ee.ImageCollection("USGS/NLCD_RELEASES/2016_REL");
  const nlcd_tcc = ee
    .ImageCollection("USGS/NLCD_RELEASES/2021_REL/TCC/v2021-4")
    .select([0, 2])
    .map((img) => img.selfMask());

  Map.addLayer(
    nlcd_tcc,
    {
      bands: "NLCD_Percent_Tree_Canopy_Cover",
      min: 1,
      max: 90,
      palette: "white,green",
    },
    "NLCD Tree Canopy Cover",
    false,
    null,
    null,
    "NLCD Tree Canopy Cover v2021-4",
    whichLayerList
  );

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

  const mtbs = getMTBSAndNLCD(studyAreaName, whichLayerList).MTBS.collection;
  if (idsCollections !== undefined) {
    return [
      mtbs,
      idsCollections.imageCollection,
      idsCollections.featureCollection,
    ];
  } else {
    return [mtbs, undefined, undefined];
  }
}
function getNAIP(whichLayerList, timeLapse) {
  whichLayerList = whichLayerList || "reference-layer-list";
  timeLapse = timeLapse !== null && timeLapse !== undefined ? timeLapse : false;
  const naip = ee
    .ImageCollection("USDA/NAIP/DOQQ")
    .select([0, 1, 2], ["R", "G", "B"]);
  let naipYears;
  if (timeLapse === true) {
    naipYears = range(2003, 2022 + 1);
    Map.addTimeLapse(
      naip,
      { addToLegend: false, min: 25, max: 225, years: naipYears, mosaic: true },
      "NAIP Time Lapse",
      false,
      null,
      null,
      "The National Agriculture Imagery Program (NAIP) acquired aerial imagery from the " +
        naipYears[0].toString() +
        " to the " +
        naipYears[1].toString() +
        " agricultural growing season in the continental U.S.",
      whichLayerList
    );
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

function setupDropdownTreeDownloads(studyAreaName) {
  const serverLocation = "https://data.fs.usda.gov/geodata/LCMS";

  const study_areas = {
    SEAK: {
      startYear: 1985,
      endYear: 2023,
      version: "2023-9",
      products: {
        Change: ["annual", "summary"],
        Land_Cover: ["annual"],
        Land_Use: ["annual"],
        QA_Bits: ["annual"],
      },
      summary_products: ["Fast_Loss", "Slow_Loss", "Gain"],
    },
    CONUS: {
      startYear: 1985,
      endYear: 2023,
      version: "2023-9",
      products: {
        Change: ["annual", "summary"],
        Land_Cover: ["annual"],
        Land_Use: ["annual"],
        QA_Bits: ["annual"],
      },
      summary_products: ["Fast_Loss", "Slow_Loss", "Gain"],
    },
    PRUSVI: {
      startYear: 1985,
      endYear: 2023,
      version: "2023-9",
      products: {
        Change: ["annual", "summary"],
        Land_Cover: ["annual"],
        Land_Use: ["annual"],
        QA_Bits: ["annual"],
      },
      summary_products: ["Fast_Loss", "Gain"],
    },
    HI: {
      startYear: 1985,
      endYear: 2023,
      version: "2023-9",
      products: {
        Change: ["annual", "summary"],
        Land_Cover: ["annual"],
        Land_Use: ["annual"],
        QA_Bits: ["annual"],
      },
      summary_products: ["Fast_Loss", "Slow_Loss", "Gain"],
    },
  };
  Object.keys(study_areas).map((sa) => {
    Object.keys(study_areas[sa].products).map((product) => {
      study_areas[sa].products[product].map((m) => {
        const id = `${sa}-${product.toLowerCase()}-${m}-downloads`;
        const dropdownID = id + "-d";
        $("#" + id).empty();
        $("#" + id).append(`
              <label  title = 'Choose from list below to download LCMS products. Hold ctrl key to select multiples or shift to select blocks. There can be a small delay before a download will begin, especially over slower networks.' for="${dropdownID}" class = 'download-selection-label'>Select products to download:</label>
                              <select id = "${dropdownID}" size="8" style="height: 100%;" class=" bg-download-select" multiple ></select>
                              <br>
                              <button title = 'Click on this button to start downloads. If you have a popup blocker, you will need the manually click on the download links provided' class = 'btn download-btn' onclick = 'downloadSelectedAreas("${dropdownID}")'>Download</button>
                              <hr>`);

        if (m === "annual") {
          const years = range(
            study_areas[sa].startYear,
            study_areas[sa].endYear + 1
          );
          if (sa != "HI") {
            years.map((yr) => {
              const url = `${serverLocation}/LCMS_${sa}_v${study_areas[sa].version}_${product}_Annual_${yr}.zip`;
              const name = url.substr(url.lastIndexOf("v20") + 8);
              $("#" + dropdownID).append(
                `<option  value = "${url}">${name}</option>`
              );
            });
          } else if (sa == "HI") {
            years.map((yr) => {
              const url = `${serverLocation}/LCMS_HAWAII_v${study_areas[sa].version}_${product}_Annual_${yr}.zip`;
              const name = url.substr(url.lastIndexOf("v20") + 8);
              $("#" + dropdownID).append(
                `<option  value = "${url}">${name}</option>`
              );
            });
          }
          //https://data.fs.usda.gov/geodata/LCMS/LCMS_PRUSVI_v2020-6_Land_Use_Annual_2011.zip
        } else if (m === "summary") {
          if (sa != "HI") {
            study_areas[sa].summary_products.map((summary_product) => {
              const url = `${serverLocation}/LCMS_${sa}_v${study_areas[sa].version}_${product}_${summary_product}_Summary_${study_areas[sa].startYear}_${study_areas[sa].endYear}.zip`;
              const name = url.substr(url.lastIndexOf("v20") + 8);
              $("#" + dropdownID).append(
                `<option  value = "${url}">${name}</option>`
              );
            });
          } else if (sa == "HI") {
            study_areas[sa].summary_products.map((summary_product) => {
              const url = `${serverLocation}/LCMS_HAWAII_v${study_areas[sa].version}_${product}_${summary_product}_Summary_${study_areas[sa].startYear}_${study_areas[sa].endYear}.zip`;
              const name = url.substr(url.lastIndexOf("v20") + 8);
              $("#" + dropdownID).append(
                `<option  value = "${url}">${name}</option>`
              );
            });
          }
          //https://data.fs.usda.gov/geodata/LCMS/LCMS_SEAK_v2022-8_Change_Fast_Loss_Summary_1985_2022.zip
        }
      });
    });
  });
}

function setupDropdownTreeMapDownloads() {
  const att_serverLocation =
    "https://data.fs.usda.gov/geodata/rastergateway/treemap";
  const rds_serverLocation = "https://s3-us-west-2.amazonaws.com/fs.usda.rds";

  const attributes = [
    "ALSTK",
    "BALIVE",
    "CANOPYPCT",
    "CARBON_D",
    "CARBON_DWN",
    "CARBON_L",
    "DRYBIO_D",
    "DRYBIO_L",
    "FLDSZCD",
    "FLDTYPCD",
    "FORTYPCD",
    "GSSTK",
    "QMD_RMRS",
    "SDIPCT_RMRS",
    "STANDHT",
    "STDSZCD",
    "TPA_DEAD",
    "TPA_LIVE",
    "VOLBFNET_L",
    "VOLCFNET_D",
    "VOLCFNET_L",
  ];

  const rds_dict = { 2016: "RDS-2021-0074" };

  const tm_versions = ["2016"];

  tm_versions.map((ver) => {
    const id = `TreeMap${ver}-attribute-downloads`;
    const dropdownID = id + "-d";
    $("#" + id).empty();
    $("#" + id).append(`
      <label  title = 'Choose from list below to download TreeMap products. Hold ctrl key to select multiples or shift to select blocks. There can be a small delay before a download will begin, especially over slower networks.' for="${dropdownID}">Select products to download:</label>
                      <select id = "${dropdownID}" size="8" style="height: 100%;" class=" bg-download-select" multiple ></select>
                      <br>
                      <button title = 'Click on this button to start downloads. If you have a popup blocker, you will need the manually click on the download links provided' class = 'btn' onclick = 'downloadSelectedAreas("${dropdownID}")'>Download</button>
                      <hr>`);
    attributes.map((att) => {
      const url = `${att_serverLocation}/docs/TreeMap${ver}_${att}.zip`;
      $("#" + dropdownID).append(
        `<option  value = "${url}">TreeMap${ver}_${att}</option>`
      );
    });
  });

  tm_versions.map((ver) => {
    const id = `TreeMap${ver}-rds-downloads`;
    const dropdownID = id + "-d";
    $("#" + id).empty();
    $("#" + id).append(`
      <label  title = 'Choose from list below to download TreeMap products. Hold ctrl key to select multiples or shift to select blocks. There can be a small delay before a download will begin, especially over slower networks.' for="${dropdownID}">Select products to download:</label>
                      <br>
                      <select id = "${dropdownID}" size="8" style="height: 3rem;" class=" bg-download-select" multiple ></select>
                      <br>
                      <button title = 'Click on this button to start downloads. If you have a popup blocker, you will need the manually click on the download links provided' class = 'btn' onclick = 'downloadSelectedAreas("${dropdownID}")'>Download</button>
                      <hr>`);
    const url = `${rds_serverLocation}/${rds_dict[ver]}/${rds_dict[ver]}_Data.zip`;
    $("#" + dropdownID).append(
      `<option  value = "${url}">TreeMap${ver}</option>`
    );
  });
}

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
  const counties = ee.FeatureCollection("TIGER/2018/Counties");
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
    "projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_District_Boundaries"
  );
  district_boundaries = district_boundaries.select(["DISTRICTNA"], ["name"]);
  const msas = ee.FeatureCollection(
    "projects/lcms-292214/assets/CONUS-Ancillary-Data/TIGER_Urban_Areas_2018"
  );
  const msas2 = ee.FeatureCollection(
    "projects/lcms-292214/assets/CONUS-Ancillary-Data/TIGER_MSA_2019"
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
    { strokeColor: "08F" },
    "US Counties",
    false,
    null,
    null,
    "US Counties from 2018 TIGER data. Turn on layer and click on any county wanted to include in chart"
  );

  Map.addSelectLayer(
    msas,
    { strokeColor: "88F" },
    "US Census Urban Areas",
    false,
    null,
    null,
    "TIGER, 2018, U.S. Urban Areas (https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_us_ua10_500k.zip). Turn on layer and click on any county wanted to include in chart"
  );

  Map.addSelectLayer(
    nps,
    { strokeColor: "F0F" },
    "National Parks",
    false,
    null,
    null,
    "National Park boundaries. Turn on layer and click on any Park wanted to include in chart"
  );
  Map.addSelectLayer(
    b,
    { strokeColor: "00F" },
    "National Forests",
    false,
    null,
    null,
    "National Forest boundaries. Turn on layer and click on any Forest wanted to include in chart"
  );

  Map.addSelectLayer(
    district_boundaries,
    { strokeColor: "80F" },
    "National Forest Districts",
    false,
    null,
    null,
    "National Forest District boundaries. Turn on layer and click on any Forest wanted to include in chart"
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
      ". Turn on layer and click on any fire wanted to include in chart"
  );
}

function superSimpleGetS2(
  studyArea,
  startDate,
  endDate,
  toaOrSR = "TOA",
  applyCloudScorePlus = true,
  cloudScorePlusThresh = 0.6,
  cloudScorePlusScore = "cs"
) {
  const s2CollectionDict = {
    TOA: "COPERNICUS/S2_HARMONIZED",
    SR: "COPERNICUS/S2_SR_HARMONIZED",
  };
  const sensorBandDict = {
    SR: [
      "B1",
      "B2",
      "B3",
      "B4",
      "B5",
      "B6",
      "B7",
      "B8",
      "B8A",
      "B9",
      "B11",
      "B12",
    ],
    TOA: [
      "B1",
      "B2",
      "B3",
      "B4",
      "B5",
      "B6",
      "B7",
      "B8",
      "B8A",
      "B9",
      "B10",
      "B11",
      "B12",
    ],
  };
  const sensorBandNameDict = {
    SR: [
      "cb",
      "blue",
      "green",
      "red",
      "re1",
      "re2",
      "re3",
      "nir",
      "nir2",
      "waterVapor",
      "swir1",
      "swir2",
    ],
    TOA: [
      "cb",
      "blue",
      "green",
      "red",
      "re1",
      "re2",
      "re3",
      "nir",
      "nir2",
      "waterVapor",
      "cirrus",
      "swir1",
      "swir2",
    ],
  };

  let s2s = ee
    .ImageCollection(s2CollectionDict[toaOrSR])
    .filterDate(startDate, endDate)
    .filterBounds(studyArea);
  s2s = s2s.select(sensorBandDict[toaOrSR], sensorBandNameDict[toaOrSR]);

  const cloudScorePlus = ee
    .ImageCollection("GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED")
    .select([cloudScorePlusScore], ["cloudScorePlus"]);

  s2s = s2s.linkCollection(cloudScorePlus, ["cloudScorePlus"]);
  if (applyCloudScorePlus === true) {
    s2s = s2s.map(function (img) {
      return img.updateMask(
        img.select(["cloudScorePlus"]).gte(cloudScorePlusThresh)
      );
    });
  }
  return s2s;
}
function addNDVI(pre) {
  const ndvi = pre.normalizedDifference(["nir", "red"]).rename("NDVI");
  return pre.addBands(ndvi);
}
