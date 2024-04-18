function runLAMDA() {
  var getDate = function (name, jd_split_string, day_index) {
    var yr = name.split(jd_split_string)[0];
    yr = parseInt(yr.slice(yr.length - 4, yr.length));
    var days = name.split(jd_split_string)[1].split("_")[0].split("-");
    var day = parseInt(days[day_index]);
    // console.log(days)
    // console.log(days[days.length-1])
    var d = ee.Date.fromYMD(yr, 1, 1).advance(day - 1, "day");
    return d.millis();
  };
  var year = parseInt(urlParams.year);
  $("#layer-list-collapse-label-label:first-child").html("LAMDA Data: " + year.toString());

  var bucketName = "lamda-products";
  var study_areas = ["CONUS", "AK"];
  var output_types = ["Z", "TDD"];
  Map.setQueryTransform([240, 0, -2361915, 0, -240, 3177735]);
  var output_type_stretch = {
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
    });
  }
  function makeTS(json) {
    //  json = json.items;
    var continuous_palette_chastain = ["a83800", "ff5500", "e0e0e0", "a4ff73", "38a800"];
    // console.log(json[0]);
    var selectedYear = year.toString();
    json = json.filter((f) => f.name.indexOf("ay" + selectedYear) > -1 || f.name.indexOf(selectedYear + "_jd") > -1);
    var names = json.map((nm) => nm.name);
    names = names.filter((nm) => nm.indexOf(".tif") == nm.length - 4);
    // var eight_bits= names.filter(i => i.indexOf('_8bit')>-1)
    var persistence = names.filter((i) => i.indexOf("_persistence") > -1);
    var raws = names.filter((i) => i.indexOf("_8bit") == -1 && i.indexOf("_persistence") == -1);

    // var eight_bit_days = [];
    // eight_bits.map(function(nm){
    //   var d = nm.split('_jd')[1].split('_')[0].split('-')[0];
    //   if(eight_bit_days.indexOf(d) === -1){eight_bit_days.push(d)}
    // });
    var persistence_days = [];
    persistence.map(function (nm) {
      var d = nm.split("_jds")[1].split("_")[0].split("-")[0];
      if (persistence_days.indexOf(d) === -1) {
        persistence_days.push(d);
      }
    });
    var raw_days = [];
    raws.map(function (nm) {
      var d = nm.split("_jd")[1].split("_")[0].split("-")[0];
      if (raw_days.indexOf(d) === -1) {
        raw_days.push(d);
      }
    });
    // console.log(eight_bit_days);
    console.log(`Persistence days: ${persistence_days.sort()}`);
    console.log(`Raw days: ${raw_days}`);

    // console.log(names);
    //  study_areas.map(function(study_area){
    //    var joined;
    output_types.map(function (output_type) {
      var raw_viz = {
        min: output_type_stretch[output_type]["stretch"] * -1,
        max: output_type_stretch[output_type]["stretch"],
        canAreaChart: true,
        areaChartParams: { minZoomSpecifiedScale: 9 },
        palette: continuous_palette_chastain,
        dateFormat: "YY-MM-dd",
        advanceInterval: "day",
        legendLabelLeftAfter: output_type_stretch[output_type]["legendLabel"],
        legendLabelRightAfter: output_type_stretch[output_type]["legendLabel"],
      };

      var eight_bit_viz = {
        min: 0,
        max: 254,
        canAreaChart: true,
        areaChartParams: { minZoomSpecifiedScale: 9 },
        palette: continuous_palette_chastain,
        dateFormat: "YY-MM-dd",
        advanceInterval: "day",
      };

      var persistence_values = [1, 2, 3];
      var persistence_names = ["1 Detection", "2 Detections", "3 or More Detections"];
      var persistence_palette = "ffaa00,e10000,e100c5".split(",");
      var persistence_viz = {
        // min: 1,
        // max: 3,
        // opacity: 1,
        canAreaChart: true,
        autoViz: true,
        // palette: "ffaa00,e10000,e100c5",
        dateFormat: "YY-MM-dd",
        advanceInterval: "day",
        areaChartParams: { shouldUnmask: true, minZoomSpecifiedScale: 9 },
        // classLegendDict: {
        //   "1 Detection": "ffaa00",
        //   "2 Detections": "e10000",
        //   "3 or More Detections": "e100c5",
        // },
      };
      var persistenceT = persistence.filter((n) => n.indexOf(output_type) > -1);
      var rawsT = raws.filter((n) => n.indexOf(output_type) > -1);
      console.log(rawsT);
      if (rawsT.length > 0) {
        var raw_c = ee
          .ImageCollection(
            raw_days.map(function (raw_day) {
              var t = rawsT.filter((n) => n.indexOf("_jd" + raw_day) > -1);
              var img = ee
                .ImageCollection(
                  t.map(function (nm) {
                    return ee.Image.loadGeoTIFF(`gs://${bucketName}/${nm}`).divide(output_type_stretch[output_type]["scale_factor"]);
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

        var persistence_c = ee.ImageCollection.fromImages(
          persistence_days.map(function (persistence_day) {
            var t = persistenceT.filter((n) => n.indexOf("_jds" + persistence_day) > -1);
            // console.log(`${persistence_day} ${t}`)
            var img = ee
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
        Map.addTimeLapse(persistence_c, persistence_viz, `${output_type} persistence`);
      }
    });

    // Map.turnOnInspector();
    Map.turnOnAutoAreaCharting();
    //    // pixelChartCollections[`${study_area}-pixel-charting`] =  {
    //      //     'label':`${study_area} Time Series`,
    //      //     'collection':joined,
    //      //     'xAxisLabel':'Date',
    //      //     'tooltip':'Query LAMDA raw time series',
    //      //     'chartColors':['a83800','ff5500'],
    //      //     'semiSimpleDate':true
    //      // };
    //  })
    // populatePixelChartDropdown();
    // setTimeout(function(){$('#close-modal-button').click();$('#CONUS-Z-8-bit-timelapse-1-name-span').click()}, 2500);
  }
  listFiles().done((json) => makeTS(json.items));
}
