function runLAMDA1() {
  const getDate = function (name, jd_split_string, day_index) {
    let yr = name.split(jd_split_string)[0];
    yr = parseInt(yr.slice(yr.length - 4, yr.length));
    const days = name.split(jd_split_string)[1].split("_")[0].split("-");
    const day = parseInt(days[day_index]);
    // console.log(days)
    // console.log(days[days.length-1])
    const d = ee.Date.fromYMD(yr, 1, 1).advance(day - 1, "day");
    return d.millis();
  };
  const year = parseInt(urlParams.endYear);
  $("#layer-list-collapse-label-label:first-child").html(
    "LAMDA Data: " + year.toString()
  );

  const bucketName = "lamda-products";
  const study_areas = ["CONUS", "AK"];
  const output_types = ["Z", "TDD"];
  Map.setQueryTransform([240, 0, -2361915, 0, -240, 3177735]);
  const output_type_stretch = {
    Z: {
      scale_factor: 1000,
      stretch: -2.5 * -2,
      legendLabel: "stdDev",
    },
    TDD: {
      scale_factor: 10000,
      stretch: -0.05 * -2,
      legendLabel: "/yr",
    },
  };

  function listFiles(nextPageToken = null) {
    let url = `https://storage.googleapis.com/storage/v1/b/${bucketName}/o?maxResults=100000`;
    if (nextPageToken !== null) {
      url = `${url}?pageToken=${nextPageToken}`;
    }
    return $.ajax({
      type: "GET",
      url: url,
      async: false,
    }).responseText;
  }
  function makeTS(json) {
    areaChart.clearLayers();
    //  json = json.items;
    const continuous_palette_chastain = [
      "a83800",
      "ff5500",
      "e0e0e0",
      "a4ff73",
      "38a800",
    ];
    // console.log(json[0]);
    const selectedYear = year.toString();
    json = json.filter(
      (f) =>
        f.name.indexOf("ay" + selectedYear) > -1 ||
        f.name.indexOf(selectedYear + "_jd") > -1
    );
    let names = json.map((nm) => nm.name);
    names = names.filter((nm) => nm.indexOf(".tif") == nm.length - 4);
    // var eight_bits= names.filter(i => i.indexOf('_8bit')>-1)
    const persistence = names.filter((i) => i.indexOf("_persistence") > -1);
    const raws = names.filter(
      (i) => i.indexOf("_8bit") == -1 && i.indexOf("_persistence") == -1
    );

    // var eight_bit_days = [];
    // eight_bits.map(function(nm){
    //   var d = nm.split('_jd')[1].split('_')[0].split('-')[0];
    //   if(eight_bit_days.indexOf(d) === -1){eight_bit_days.push(d)}
    // });
    const persistence_days = [];
    const persisetence_days_center = [];
    persistence.map(function (nm) {
      const d = nm.split("_jds")[1].split("_")[0].split("-")[0];
      const d2 = nm.split("_jds")[1].split("_")[0].split("-")[2];
      if (persistence_days.indexOf(d) === -1) {
        persistence_days.push(d);
        persisetence_days_center.push(d2);
      }
    });
    const raw_days = [];
    raws.map(function (nm) {
      const d = nm.split("_jd")[1].split("_")[0].split("-")[0];
      if (raw_days.indexOf(d) === -1) {
        raw_days.push(d);
      }
    });
    // console.log(eight_bit_days);
    console.log(`Persistence days: ${persisetence_days_center}`);
    console.log(`Raw days: ${raw_days}`);

    let persistence_dates = persisetence_days_center
      .map((d) => formatDT2(new Date.fromDayofYear(d, year)))
      .sort();
    let raw_dates = raw_days
      .map((d) => formatDT2(new Date.fromDayofYear(d, year)))
      .sort();
    console.log(persistence_dates);
    console.log(raw_dates);
    // console.log(names);
    //  study_areas.map(function(study_area){
    //    var joined;
    const rawObjInfo = {
      Z: {
        bandNames: ["LAMDA Z"],
      },
      TDD: {
        bandNames: ["LAMDA TDD"],
      },
    };
    const persistence_values = [1, 2, 3];
    const persistence_names = [
      "1 Detection",
      "2 Detections",
      "3 or More Detections",
    ];
    const persistence_palette = "ffaa00,e10000,e100c5".split(",");

    const persistenceObjInfo = {
      Z: {
        LAMDA_Z_class_names: persistence_names,
        LAMDA_Z_class_palette: persistence_palette,
        LAMDA_Z_class_values: persistence_values,
        bandNames: ["LAMDA_Z"],
      },
      TDD: {
        LAMDA_TDD_class_names: persistence_names,
        LAMDA_TDD_class_palette: persistence_palette,
        LAMDA_TDD_class_values: persistence_values,
        bandNames: ["LAMDA_TDD"],
      },
    };

    output_types.map(function (output_type) {
      const raw_viz = {
        min: output_type_stretch[output_type]["stretch"] * -1,
        max: output_type_stretch[output_type]["stretch"],
        canAreaChart: true,
        dictServerSide: false,
        eeObjInfo: rawObjInfo[output_type],
        areaChartParams: { minZoomSpecifiedScale: 9, xAxisLabels: raw_dates },
        palette: continuous_palette_chastain,
        dateFormat: "YY-MM-dd",
        years: raw_dates,
        advanceInterval: "day",
        legendLabelLeftAfter: output_type_stretch[output_type]["legendLabel"],
        legendLabelRightAfter: output_type_stretch[output_type]["legendLabel"],
      };

      const eight_bit_viz = {
        min: 0,
        max: 254,
        canAreaChart: true,
        dictServerSide: false,
        eeObjInfo: rawObjInfo[output_type],
        areaChartParams: { minZoomSpecifiedScale: 9, xAxisLabels: raw_dates },
        palette: continuous_palette_chastain,
        dateFormat: "YY-MM-dd",
        years: raw_dates,
        advanceInterval: "day",
      };

      const persistence_viz = {
        canAreaChart: true,
        autoViz: true,
        dictServerSide: false,
        eeObjInfo: persistenceObjInfo[output_type],
        dateFormat: "YY-MM-dd",
        years: persistence_dates,
        advanceInterval: "day",
        areaChartParams: {
          shouldUnmask: true,
          minZoomSpecifiedScale: 9,
          xAxisLabels: persistence_dates,
        },
      };

      const persistenceT = persistence.filter(
        (n) => n.indexOf(output_type) > -1
      );
      const rawsT = raws.filter((n) => n.indexOf(output_type) > -1);
      console.log(rawsT);
      if (rawsT.length > 0) {
        const raw_c = ee
          .ImageCollection(
            raw_days.map(function (raw_day) {
              const t = rawsT.filter((n) => n.indexOf("_jd" + raw_day) > -1);
              const img = ee
                .ImageCollection(
                  t.map(function (nm) {
                    return ee.Image.loadGeoTIFF(
                      `gs://${bucketName}/${nm}`
                    ).divide(output_type_stretch[output_type]["scale_factor"]);
                  })
                )
                .mosaic()
                .set("system:time_start", getDate(t[0], "_jd", 0));
              return img;
            })
          )
          .select([0], [`LAMDA ${output_type}`]);

        Map.addTimeLapse(raw_c, raw_viz, `${output_type} raw`);
      }

      if (persistenceT.length > 0) {
        let bn = `LAMDA_${output_type}`;
        let vizProps = {};
        vizProps[`${bn}_class_names`] = persistence_names;
        vizProps[`${bn}_class_values`] = persistence_values;
        vizProps[`${bn}_class_palette`] = persistence_palette;

        const persistence_c = ee.ImageCollection.fromImages(
          persistence_days.map(function (persistence_day) {
            const t = persistenceT.filter(
              (n) => n.indexOf("_jds" + persistence_day) > -1
            );
            // console.log(`${persistence_day} ${t}`);
            const img = ee
              .ImageCollection(
                t.map(function (nm) {
                  return ee.Image.loadGeoTIFF(`gs://${bucketName}/${nm}`);
                })
              )
              .mosaic()
              .selfMask()
              .set("system:time_start", getDate(t[0], "_jds", 2))
              .set(vizProps);
            // console.log(output_type+' '+persistence_day);console.log(t);
            // Map.addLayer(img,persistence_viz,`${output_type} ${persistence_day} persistence`,false);
            return img;
          })
        ).select([0], [bn]);

        //      var persistence_c = persistence.map(function(t){
        //          var img = ee.Image.loadGeoTIFF(`gs://${bucketName}/${t}`)
        //          img = img.selfMask()
        //          img = img.set('system:time_start',getDate(t,'_jds',2))
        //          return img
        //        })
        //        persistence_c = ee.ImageCollection.fromImages(persistence_c)
        Map.addTimeLapse(
          persistence_c,
          persistence_viz,
          `${output_type} persistence`
        );
      }
    });

    // Map.turnOnInspector();
    Map.turnOnAutoAreaCharting();
  }
  let json = JSON.parse(listFiles());
  makeTS(json.items);
}

runLAMDA2 = function () {
  let yrStr =
    urlParams.startYear === urlParams.endYear
      ? urlParams.startYear
      : `${urlParams.startYear}-${urlParams.endYear}`;
  $("#layer-list-collapse-label-label:first-child").html(
    `LAMDA Data: ${yrStr}`
  );

  Map.setQueryTransform([240, 0, -2361915, 0, -240, 3177735]);
  const output_type_stretch = {
    Z: {
      scale_factor: 1000,
      stretch: -2.5 * -2,
      legendLabel: "stdDev",
    },
    TDD: {
      scale_factor: 10000,
      stretch: -0.05 * -2,
      legendLabel: "/yr",
    },
  };
  const continuous_palette_chastain = [
    "a83800",
    "ff5500",
    "e0e0e0",
    "a4ff73",
    "38a800",
  ];

  urlParams.timelapse =
    urlParams.timelapse === undefined ? true : urlParams.timelapse;
  let addToMapFunction = Map.addTimeLapse;
  if (urlParams.timelapse === false) {
    addToMapFunction = Map.addLayer;
  }

  let tdd_p = ee
    .ImageCollection("projects/gtac-lamda/assets/lamda-outputs/tdd_persistence")
    .filter(
      ee.Filter.calendarRange(urlParams.startYear, urlParams.endYear, "year")
    )
    .filter(ee.Filter.calendarRange(urlParams.startJulian, urlParams.endJulian))
    .sort("system:time_start");
  let z_p = ee
    .ImageCollection("projects/gtac-lamda/assets/lamda-outputs/z_persistence")
    .filter(
      ee.Filter.calendarRange(urlParams.startYear, urlParams.endYear, "year")
    )
    .filter(ee.Filter.calendarRange(urlParams.startJulian, urlParams.endJulian))
    .sort("system:time_start");
  let tdd_r = ee
    .ImageCollection("projects/gtac-lamda/assets/lamda-outputs/tdd_raw")
    .filter(
      ee.Filter.calendarRange(urlParams.startYear, urlParams.endYear, "year")
    )
    .filter(ee.Filter.calendarRange(urlParams.startJulian, urlParams.endJulian))
    .sort("system:time_start");
  let z_r = ee
    .ImageCollection("projects/gtac-lamda/assets/lamda-outputs/z_raw")
    .filter(
      ee.Filter.calendarRange(urlParams.startYear, urlParams.endYear, "year")
    )
    .filter(ee.Filter.calendarRange(urlParams.startJulian, urlParams.endJulian))
    .sort("system:time_start");

  let persistence_dates = tdd_p
    .aggregate_histogram("system:time_start")
    .keys()
    .map((d) => ee.Date(ee.Number.parse(d)).format("YY-MM-dd"));

  let raw_dates = tdd_r
    .aggregate_histogram("system:time_start")
    .keys()
    .map((d) => ee.Date(ee.Number.parse(d)).format("YY-MM-dd"));

  let all_dates = ee
    .Dictionary({
      persistence: persistence_dates,
      raw: raw_dates,
    })
    .getInfo();
  persistence_dates = all_dates.persistence;
  raw_dates = all_dates.raw;
  console.log(all_dates);

  const persistence_values = [1, 2, 3];
  const persistence_names = [
    "1 Detection",
    "2 Detections",
    "3 or More Detections",
  ];
  const persistence_palette = "ffaa00,e10000,e100c5".split(",");

  const persistenceObjInfo = {
    Z: {
      LAMDA_Z_class_names: persistence_names,
      LAMDA_Z_class_palette: persistence_palette,
      LAMDA_Z_class_values: persistence_values,
      bandNames: ["LAMDA_Z"],
    },
    TDD: {
      LAMDA_TDD_class_names: persistence_names,
      LAMDA_TDD_class_palette: persistence_palette,
      LAMDA_TDD_class_values: persistence_values,
      bandNames: ["LAMDA_TDD"],
    },
  };
  const rawObjInfo = {
    Z: {
      bandNames: ["LAMDA_Z"],
    },
    TDD: {
      bandNames: ["LAMDA_TDD"],
    },
  };
  function getPersistenceViz(output_type) {
    return {
      canAreaChart: true,
      autoViz: true,
      dictServerSide: false,
      eeObjInfo: persistenceObjInfo[output_type],
      dateFormat: "YY-MM-dd",
      reducer: ee.Reducer.max(),
      years: persistence_dates,
      advanceInterval: "day",
      areaChartParams: {
        shouldUnmask: true,
        minZoomSpecifiedScale: 9,
        xAxisLabels: persistence_dates,
      },
    };
  }
  function getRawViz(output_type) {
    return {
      min: output_type_stretch[output_type]["stretch"] * -1,
      max: output_type_stretch[output_type]["stretch"],
      canAreaChart: true,
      dictServerSide: false,
      eeObjInfo: rawObjInfo[output_type],
      areaChartParams: { minZoomSpecifiedScale: 9, xAxisLabels: raw_dates },
      palette: continuous_palette_chastain,
      dateFormat: "YY-MM-dd",
      years: raw_dates,
      queryParams: { yLabel: "N Standard Deviations", palette: ["00bfa5"] },
      reducer: ee.Reducer.min(),
      advanceInterval: "day",
      legendLabelLeftAfter: output_type_stretch[output_type]["legendLabel"],
      legendLabelRightAfter: output_type_stretch[output_type]["legendLabel"],
    };
  }
  const tddPViz = getPersistenceViz("TDD");
  const zPViz = getPersistenceViz("Z");

  const tddRViz = getRawViz("TDD");
  const zRViz = getRawViz("Z");

  function mosaicC(collection, dates, props, scale = 1, selfMask = true) {
    return ee.ImageCollection(
      dates.map((d) => {
        const d1 = ee.Date("20" + d);
        const d2 = d1.advance(1, "day");
        let img = collection
          .filterDate(d1, d2)
          .mosaic()
          .divide(scale)
          .set("system:time_start", d1.millis())
          .set(props)
          .set("year", d);
        if (selfMask) {
          img = img.selfMask();
        }
        return img;
      })
    );
  }
  tdd_p = mosaicC(tdd_p, persistence_dates, persistenceObjInfo.TDD).map((i) =>
    i.byte()
  );
  z_p = mosaicC(z_p, persistence_dates, persistenceObjInfo.Z).map((i) =>
    i.byte()
  );

  z_r = mosaicC(
    z_r,
    raw_dates,
    rawObjInfo.Z,
    output_type_stretch.Z.scale_factor,
    false
  );
  tdd_r = mosaicC(
    tdd_r,
    raw_dates,
    rawObjInfo.TDD,
    output_type_stretch.TDD.scale_factor,
    false
  );

  addToMapFunction(tdd_r, tddRViz, "TDD Raw", false);
  addToMapFunction(tdd_p, tddPViz, "TDD Persistence", false);
  addToMapFunction(z_r, zRViz, "Z Raw", false);
  addToMapFunction(z_p, zPViz, "Z Persistence", false);

  Map.turnOnInspector();
  // Map.turnOnAutoAreaCharting();
};

let runLAMDA = runLAMDA2;
if (urlParams.legacy === true) {
  runLAMDA = runLAMDA1;
}
