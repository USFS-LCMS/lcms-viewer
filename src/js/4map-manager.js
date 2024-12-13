//Wrapper for mapping functions
///////////////////////////////////////////////////////////////////
//Set up some globals
const mapDiv = document.getElementById("map");

function copyObj(mainObj) {
  let objCopy = {}; // objCopy will store a copy of the mainObj
  let key;

  for (key in mainObj) {
    objCopy[key] = mainObj[key]; // copies each property to the objCopy object
  }
  return objCopy;
}
function copyArray(array) {
  const arrayCopy = [];

  array.map(function (i) {
    arrayCopy.push(i);
  });

  return arrayCopy;
}
///////////////////////////////////////////////////////////////////
//Function to compute range list on client side
function range(start, stop, step) {
  start = parseInt(start);
  stop = parseInt(stop);
  if (typeof stop == "undefined") {
    // one param defined
    stop = start;
    start = 0;
  }
  if (typeof step == "undefined") {
    step = 1;
  }
  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
    return [];
  }
  const result = [];
  for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
    result.push(i);
  }
  return result;
}
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//Make an object out of to lists of keys and values
//From:https://stackoverflow.com/questions/12199051/merge-two-arrays-of-keys-and-values-to-an-object-using-underscore answer 6
const toObj = (ks, vs) =>
  ks.reduce((o, k, i) => {
    o[k] = vs[i];
    return o;
  }, {});
const toDict = toObj;

///////////////////////////////////////////////////////////////////
//Get a column of a 2-d array
function arrayColumn(arr, i) {
  return arr.map(function (r) {
    return r[i];
  });
}
///////////////////////////////////////////////////////////////////
//Convert xyz coords to quad key for map services such as Bing
//Source: http://bcdcspatial.blogspot.com/2012/01/onlineoffline-mapping-map-tiles-and.html
function tileXYZToQuadKey(x, y, z) {
  let quadKey = "";
  for (let i = z; i > 0; i--) {
    let digit = 0;
    let mask = 1 << (i - 1);

    if ((x & mask) != 0) {
      digit = digit + 1;
    }

    if ((y & mask) != 0) {
      digit = digit + 2;
    }

    quadKey = quadKey + digit.toString();
  }
  return quadKey;
}
///////////////////////////////////////////////////////////////////
//Functions for centering map
function centerMap(lng, lat, zoom) {
  map.setCenter({ lat: lat, lng: lng });
  map.setZoom(zoom);
}
function synchronousCenterObject(feature) {
  let bounds = new google.maps.LatLngBounds();
  feature.coordinates[0].map(function (latlng) {
    bounds.extend({ lng: latlng[0], lat: latlng[1] });
  });
  map.fitBounds(bounds);
}
function centerObject(fc, async = true, callback) {
  if (async) {
    try {
      fc.geometry()
        .bounds(100)
        .evaluate((f) => {
          synchronousCenterObject(f);
          if (typeof callback === "function") {
            callback();
          }
        });
    } catch (err) {
      try {
        fc.bounds(100).evaluate((f) => {
          synchronousCenterObject(f);
          if (typeof callback === "function") {
            callback();
          }
        });
      } catch (err) {
        console.log(err);
      }
      console.log(err);
    }
  } else {
    try {
      let f = fc.geometry().bounds(100).getInfo();
      synchronousCenterObject(f);
      if (typeof callback === "function") {
        callback();
      }
    } catch (err) {
      try {
        let f = fc.bounds(100).getInfo();
        synchronousCenterObject(f);
        if (typeof callback === "function") {
          callback();
        }
      } catch (err) {
        console.log(err);
      }
      console.log(err);
    }
  }
}
///////////////////////////////////////////////////////////////////
//Function for creating color ramp generally for a map legend
function createColorRamp(styleName, colorList, width, height) {
  colorList = colorList.map(addColorHash);
  let myCss = "background-image:linear-gradient(to right, ";
  for (let i = 0; i < colorList.length; i++) {
    myCss = myCss + colorList[i].toLowerCase() + ",";
  }
  myCss = myCss.slice(0, -1) + ");";
  return myCss;
}
///////////////////////////////////////////////////////////////////
//Function to convert csv, kml, shp to geoJSON using ogre.adc4gis.com
function convertToGeoJSON(formID) {
  const url = "https://ogre.adc4gis.com/convert";

  const data = new FormData();
  // data.append("sourceSrs","EPSG:5070");

  data.append("targetSrs", "EPSG:4326");
  jQuery.each(jQuery("#" + formID)[0].files, function (i, file) {
    data.append("upload", file);
  });
  const out = $.ajax({
    type: "POST",
    url: url,
    data: data,
    processData: false,
    contentType: false,
    error: function (err) {
      console.log(err);

      $("#summary-spinner").hide();
    },
  });
  return out;
}
function compressGeoJSON(geoJSON, reductionFactor) {
  if (reductionFactor === undefined || reductionFactor === null) {
    reductionFactor = 2;
  }
  geoJSON.features = geoJSON.features.map(function (f) {
    if (f.geometry.type.indexOf("Multi") > -1) {
      f.geometry.coordinates = f.geometry.coordinates.map(function (poly) {
        return poly.map(function (pts) {
          if (pts.length > 100) {
            pts = pts.filter((element, index) => {
              return index % reductionFactor === 0;
            });
          }
          return pts;
        });
      });
    } else {
      f.geometry.coordinates = f.geometry.coordinates.map(function (poly) {
        if (poly.length > 100) {
          poly = poly.filter((element, index) => {
            return index % reductionFactor === 0;
          });
        }
        return poly;
      });
    }
    return f;
  });
  return geoJSON;
}
//////////////////////////////////////////////////////
//Wrappers for printing and printing to console
function printImage(message) {
  print(message);
}
function print(message) {
  console.log(message);
}
function printEE(obj) {
  print("Getting info about ee object");
  console.log(
    obj.getInfo(function (success, failure) {
      if (success !== undefined) {
        console.log(success);
      } else {
        console.log(failure);
      }
    })
  );
}
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
//Wrapper function to add a select layer
function addSelectLayerToMap(
  item,
  viz,
  name,
  visible,
  label,
  fontColor,
  helpBox,
  whichLayerList,
  queryItem
) {
  viz.canQuery = false;
  viz.isSelectLayer = true;
  addToMap(
    item,
    viz,
    name,
    visible,
    label,
    fontColor,
    helpBox,
    "area-charting-select-layer-list",
    queryItem
  );
}
/////////////////////////////////////////////////////
//Functions to manage time lapses
let intervalPeriod = 666.6666666666666;
let timeLapseID;
urlParams.timeLapseFrame = urlParams.timeLapseFrame || 0;
let cumulativeMode = urlParams.cumulativeMode;
function pauseTimeLapse(id) {
  if (id === null || id === undefined) {
    id = timeLapseID;
  }
  timeLapseID = id;
  if (timeLapseObj[timeLapseID].isReady) {
    pauseAll();
    clearActiveButtons();
    $("#" + timeLapseID + "-pause-button").addClass("time-lapse-active");
  }
}

function setFrameOpacity(frame, opacity) {
  let s = $("#" + frame).slider();
  s.slider("option", "value", opacity);
  s.slider("option", "slide").call(s, null, {
    handle: $(".ui-slider-handle", s),
    value: opacity,
  });
}

//Function to show a specific frame
function selectFrame(id, fromYearSlider, advanceOne) {
  if (id === null || id === undefined) {
    id = timeLapseID;
  }
  if (fromYearSlider === null || fromYearSlider === undefined) {
    fromYearSlider = false;
  }
  if (advanceOne === null || advanceOne === undefined) {
    advanceOne = true;
  }
  timeLapseID = id;

  if (timeLapseID !== undefined && timeLapseObj[timeLapseID].isReady) {
    if (Map.turnOffLayersWhenTimeLapseIsOn) {
      turnOffLayers();
    }

    turnOnTimeLapseLayers();
    const slidersT = timeLapseObj[timeLapseID].sliders;
    if (urlParams.timeLapseFrame > slidersT.length - 1) {
      urlParams.timeLapseFrame = 0;
    } else if (urlParams.timeLapseFrame < 0) {
      urlParams.timeLapseFrame = slidersT.length - 1;
    }
    if (timeLapseObj[timeLapseID].layerType !== "tileMapService") {
      if (!eval(cumulativeMode) || urlParams.timeLapseFrame === 0) {
        slidersT.map(function (s) {
          try {
            setFrameOpacity(s, 0);
          } catch (err) {}
        });
      } else {
        slidersT.slice(0, urlParams.timeLapseFrame).map(function (s) {
          try {
            setFrameOpacity(s, timeLapseObj[timeLapseID].opacity);
          } catch (err) {}
        });
      }
    }
    const frame = slidersT[urlParams.timeLapseFrame];
    try {
      if (timeLapseObj[timeLapseID].layerType === "tileMapService") {
        $("#" + timeLapseObj[timeLapseID].lastTurnOn).click();
        timeLapseObj[timeLapseID].lastTurnOn =
          timeLapseObj[timeLapseID].layerVisibleIDs[urlParams.timeLapseFrame];
        $("#" + timeLapseObj[timeLapseID].lastTurnOn).click();
      }
      setFrameOpacity(frame, timeLapseObj[timeLapseID].opacity);
      if (!fromYearSlider) {
        Object.keys(timeLapseObj).map(function (k) {
          const s = $("#" + k + "-year-slider").slider();
          s.slider("option", "value", urlParams.timeLapseFrame);
          $("#" + k + "-year-slider-handle-label").text(
            timeLapseObj[k].yearLookup[urlParams.timeLapseFrame]
          );
        });
      }
    } catch (err) {}
    $("#" + timeLapseID + "-year-label").show();
    $("#time-lapse-year-label").show();
    $("#time-lapse-year-label").html(
      `Time lapse date: ${
        timeLapseObj[timeLapseID].yearLookup[urlParams.timeLapseFrame]
      }`
    );
  }
}
function advanceOneFrame() {
  urlParams.timeLapseFrame++;
  selectFrame();
}
function pauseButtonFunction(id) {
  if (id === null || id === undefined) {
    id = timeLapseID;
  }

  timeLapseID = id;
  if (timeLapseID !== undefined && timeLapseObj[timeLapseID].isReady) {
    clearAllFrames();
    pauseTimeLapse();
    selectFrame();
    alignTimeLapseCheckboxes();
    timeLapseObj[timeLapseID].state = "paused";
  }
}
function pauseAll() {
  Object.keys(timeLapseObj).map(function (k) {
    if (
      timeLapseObj[k].intervalValue !== null &&
      timeLapseObj[k].intervalValue !== undefined
    ) {
      window.clearInterval(timeLapseObj[k].intervalValue);
    }
    timeLapseObj[k].intervalValue = null;
  });
}
function forwardOneFrame(id) {
  timeLapseID = id;
  if (timeLapseObj[timeLapseID].isReady) {
    clearAllFrames();
    pauseTimeLapse();
    advanceOneFrame();
    alignTimeLapseCheckboxes();
  }
}
function backOneFrame(id) {
  timeLapseID = id;
  if (timeLapseObj[timeLapseID].isReady) {
    clearAllFrames();
    pauseTimeLapse();
    urlParams.timeLapseFrame--;
    selectFrame();
    alignTimeLapseCheckboxes();
  }
}
function clearActiveButtons() {
  Object.keys(timeLapseObj).map(function (k) {
    $("#" + k + "-pause-button").removeClass("time-lapse-active");
    $("#" + k + "-play-button").removeClass("time-lapse-active");
    if (k === timeLapseID) {
      $("#" + k + "-stop-button").removeClass("time-lapse-active");
    }
  });
}
function clearAllFrames() {
  turnOffAllNonActiveTimeLapseLayers();

  Object.keys(timeLapseObj).map(function (k) {
    const slidersT = timeLapseObj[k].sliders;
    $("#" + k + "-year-label").hide();
    $("#" + k + "-stop-button").addClass("time-lapse-active");
    $("#" + k + "-pause-button").removeClass("time-lapse-active");
    $("#" + k + "-play-button").removeClass("time-lapse-active");
    timeLapseObj[k].state = "inactive";
    slidersT.map(function (s) {
      try {
        setFrameOpacity(s, 0);
      } catch (err) {}
    });
  });
}
function setSpeed(id, speed) {
  timeLapseID = id;
  intervalPeriod = speed;
  if (timeLapseObj[timeLapseID].isReady) {
    pauseAll();
    playTimeLapse(id);
  }
}
function playTimeLapse(id) {
  if (id === null || id === undefined) {
    id = timeLapseID;
  }

  timeLapseID = id;
  if (timeLapseID !== undefined && timeLapseObj[timeLapseID].isReady) {
    clearAllFrames();
    pauseAll();
    timeLapseObj[timeLapseID].state = "play";
    selectFrame(null, null, false);
    if (
      timeLapseObj[id].intervalValue === null ||
      timeLapseObj[id].intervalValue === undefined
    ) {
      timeLapseObj[id].intervalValue = window.setInterval(
        advanceOneFrame,
        intervalPeriod
      );
    }
    $("#" + id + "-stop-button").removeClass("time-lapse-active");
    $("#" + id + "-pause-button").removeClass("time-lapse-active");
    $("#" + id + "-play-button").addClass("time-lapse-active");
    alignTimeLapseCheckboxes();
  }
}
function stopTimeLapse(id) {
  $("#time-lapse-year-label").empty();
  $("#time-lapse-year-label").hide();
  timeLapseID = null;
  pauseAll();
  clearAllFrames();
}
//Toggle all layers within a specific time lapse layer
function toggleTimeLapseLayers(id) {
  if (id === null || id === undefined) {
    id = timeLapseID;
  }
  const visibleToggles = timeLapseObj[k].layerVisibleIDs;
  visibleToggles.map(function (i) {
    $("#" + i).click();
  });
}
//Toggle all layers within all time lapse layers
function toggleAllTimeLapseLayers() {
  Object.keys(timeLapseObj).map(function (k) {
    toggleTimeLapseLayers(k);
  });
}
//Turn off all layers within all time lapse layers
function turnOffAllTimeLapseLayers() {
  Object.keys(timeLapseObj).map(function (k) {
    turnOffTimeLapseLayers(k);
  });
}
//Turn off all layers within non active time lapses
function turnOffAllNonActiveTimeLapseLayers() {
  Object.keys(timeLapseObj).map(function (k) {
    if (k !== timeLapseID) {
      turnOffTimeLapseLayers(k);
    }
  });
}
function toggleTimeLapseLayers(id) {
  if (id === null || id === undefined) {
    id = timeLapseID;
  }
  if (timeLapseObj[id].isReady) {
    timeLapseObj[id].layerVisibleIDs.map(function (i) {
      $("#" + i).click();
    });
    if (timeLapseObj[id].visible) {
      timeLapseObj[id].visible = false;
    } else {
      timeLapseObj[id].visible = true;
    }
  }
}
function turnOnTimeLapseLayers(id) {
  if (id === null || id === undefined) {
    id = timeLapseID;
  }
  if (timeLapseObj[id].isReady) {
    if (timeLapseObj[id].visible === false) {
      timeLapseObj[id].visible = true;
      if (timeLapseObj[id].layerType !== "tileMapService") {
        timeLapseObj[id].layerVisibleIDs.map(function (i) {
          $("#" + i).click();
        });
      }
    }
    queryObj[id].visible = timeLapseObj[id].visible;
  }
}
function turnOffTimeLapseLayers(id) {
  if (id === null || id === undefined) {
    id = timeLapseID;
  }
  if (timeLapseObj[id].isReady) {
    if (timeLapseObj[id].visible === true) {
      timeLapseObj[id].visible = false;
      if (timeLapseObj[id].layerType !== "tileMapService") {
        timeLapseObj[id].layerVisibleIDs.map(function (i) {
          $("#" + i).click();
        });
      }
    }
    queryObj[id].visible = timeLapseObj[id].visible;
  }
}
//Function to handle tiles getting stuck when requested from GEE
//Currently the best method seems to be to jitter the zoom to re-request the tiles from GEE
let lastJitter;
function jitterZoom(fromButton) {
  if (fromButton === null || fromButton === undefined) {
    fromButton = false;
  }
  if (lastJitter === null || lastJitter === undefined) {
    lastJitter = new Date();
  }
  const tDiff = new Date() - lastJitter;
  let jittered = false;
  if (
    (tDiff > 5000 && geeTileLayersDownloading === 0) ||
    tDiff > 20000 ||
    fromButton
  ) {
    console.log("jittering zoom");
    const z = map.getZoom();
    updateViewList = false;
    map.setZoom(z - 1);
    updateViewList = false;
    map.setZoom(z);
    jittered = true;
    lastJitter = new Date();
  }

  return jittered;
}
//Tidy up time lapse checkboxes
function alignTimeLapseCheckboxes() {
  Object.keys(timeLapseObj).map(function (k) {
    if (timeLapseObj[k].isReady) {
      let checked = false;
      urlParams.layerProps[k].visible = timeLapseObj[k].visible;
      if (timeLapseObj[k].visible) {
        checked = true;
        $("#" + k + "-time-lapse-layer-range-container").slideDown();
        $("#" + k + "-icon-bar").slideDown();
        $("#" + k + "-collapse-label").addClass("time-lapse-label-container");
      } else {
        $("#" + k + "-collapse-label").css(
          "background",
          `-webkit-linear-gradient(left, #FFF, #FFF ${0}%, transparent ${0}%, transparent 100%)`
        );
        $("#" + k + "-time-lapse-layer-range-container").slideUp();
        $("#" + k + "-icon-bar").slideUp();
        $("#" + k + "-collapse-label").removeClass(
          "time-lapse-label-container"
        );
        $("#" + k + "-loading-spinner").hide();
        $("#" + k + "-loading-gear").hide();
      }

      $("#" + k + "-toggle-checkbox").prop("checked", checked);
    }
  });
}
function timeLapseCheckbox(id) {
  const tObj = timeLapseObj[id];
  const v = tObj.visible;

  ga("send", "event", "time-lapse-toggle", id, v);
  if (!v) {
    pauseButtonFunction(id);
  } else {
    stopTimeLapse(id);
  }
  if (areaChart.autoChartingOn && tObj.viz.canAreaChart) {
    areaChart.chartMapExtent();
  }
  alignTimeLapseCheckboxes();
}
function toggleFrames(id) {
  $("#" + id + "-collapse-div").toggle();
}
//Turn off all time lapses
function turnOffTimeLapseCheckboxes() {
  Object.keys(timeLapseObj).map(function (k) {
    if (timeLapseObj[k].isReady) {
      if (timeLapseObj[k].visible) {
        stopTimeLapse(k);
      }
    }
  });
  alignTimeLapseCheckboxes();
}
//Toggle whether to show all layers prior to the current layer or just a single layer
function turnOnCumulativeMode() {
  $(".cumulativeToggler").addClass("time-lapse-active");
  cumulativeMode = true;
  urlParams.cumulativeMode = cumulativeMode;
  selectFrame();
}
function turnOffCumulativeMode() {
  $(".cumulativeToggler").removeClass("time-lapse-active");
  cumulativeMode = false;
  urlParams.cumulativeMode = cumulativeMode;
  selectFrame();
}
function toggleCumulativeMode() {
  if (cumulativeMode) {
    turnOffCumulativeMode();
  } else {
    turnOnCumulativeMode();
  }
}

//Fill empty collections
function fillEmptyCollections(inCollection, dummyImage) {
  const dummyCollection = ee.ImageCollection([dummyImage.mask(ee.Image(0))]);
  const imageCount = inCollection.toList(1).length();
  return ee.ImageCollection(
    ee.Algorithms.If(imageCount.gt(0), inCollection, dummyCollection)
  );
}
//////////////////////////////////////////////////////////////////////////
//Wrapper function to add a time lapse to the map
function addTimeLapseToMap(
  item,
  viz,
  name,
  visible,
  label,
  fontColor,
  helpBox,
  whichLayerList,
  queryItem
) {
  if (viz === undefined || viz === null) {
    viz = {};
  }
  viz = copyObj(viz);
  if (
    viz !== null &&
    viz !== undefined &&
    viz.serialized !== null &&
    viz.serialized !== undefined &&
    viz.serialized === true
  ) {
    item = ee.Deserializer.decode(item);

    if (
      viz.areaChartParams !== undefined &&
      viz.areaChartParams !== null &&
      viz.areaChartParams.reducer !== undefined &&
      viz.areaChartParams.reducer !== null
    ) {
      viz.areaChartParams.reducer = ee.Deserializer.fromJSON(
        viz.areaChartParams.reducer
      );
    }
    viz.serialized = false;
  }
  viz.labelClasses = viz.labelClasses || "";
  viz.labelIconHTML = viz.labelIconHTML || "";

  if (viz.canAreaChart === undefined || viz.canAreaChart === null) {
    viz.canAreaChart = false;
  }
  //Force time lapses to be turned off on load to speed up loading
  visible = false;
  if (viz.opacity === undefined || viz.opacity === null) {
    viz.opacity = 1;
  }

  if (viz.bands !== undefined && typeof viz.bands === "string") {
    viz.bands = viz.bands.split(",");
  }
  if (viz.palette !== undefined && typeof viz.palette === "string") {
    viz.palette = viz.palette.split(",");
  }

  if (viz.layerType !== "tileMapService") {
    item = ee.ImageCollection(item);
  }

  if (
    viz.layerType !== "tileMapService" &&
    (viz.eeObjInfo === undefined || viz.eeObjInfo === null)
  ) {
    viz.eeObjInfo = getImagesLib.eeObjInfo(item, "ImageCollection");
    viz.dictServerSide = true;
  } else if (
    viz.layerType !== "tileMapService" &&
    Object.keys(viz.eeObjInfo).indexOf("layerType") > -1
  ) {
    viz.dictServerSide = false;
  } else if (viz.layerType !== "tileMapService") {
    viz.eeObjInfo = ee.Dictionary(viz.eeObjInfo);
    viz.dictServerSide = true;
  }

  if (
    viz.autoViz === true &&
    (viz.class_names === undefined || viz.class_names === null)
  ) {
    if (viz.dictServerSide) {
      console.log("start");
      console.log(name);
      viz.eeObjInfo = viz.eeObjInfo.getInfo();
      viz.dictServerSide = false;
    }

    viz = addClassVizDicts(viz);
  }

  if (name == undefined || name == null) {
    name = "Layer " + NEXT_LAYER_ID;
  }
  let checked = "";

  let legendDivID = name.replaceAll(" ", "-") + "-" + NEXT_LAYER_ID.toString();
  legendDivID = legendDivID.replace(/[^A-Za-z0-9]/g, "-");

  if (
    urlParams.layerProps[legendDivID] === undefined ||
    urlParams.layerProps[legendDivID] === null
  ) {
    urlParams.layerProps[legendDivID] = {};
    urlParams.layerProps[legendDivID].visible = false;
    urlParams.layerProps[legendDivID].opacity = viz.opacity || 1;
  } else {
    viz.opacity = urlParams.layerProps[legendDivID].opacity || 1;
  }
  //AutoViz if specified
  if (viz.autoViz) {
    if (viz.dictServerSide) {
      console.log("start");
      console.log(name);
      viz.eeObjInfo = viz.eeObjInfo.getInfo();
      viz.dictServerSide = false;
      console.log(viz);
    }
    if (viz.bands === undefined || viz.bands === null) {
      viz.bands = viz.eeObjInfo.bandNames;
    }

    viz.bands = viz.bands[0];
    dicts = getLookupDicts(
      viz.bands,
      viz.class_values,
      viz.class_names,
      viz.class_palette,
      viz.includeClassValues
    );

    viz.classLegendDict = dicts.classLegendDict;
    viz.queryDict = dicts.queryDict;
  }

  if (viz.mosaic === null || viz.mosaic === undefined) {
    viz.mosaic = false;
  }
  viz.canQuery = false;
  viz.isSelectLayer = false;
  viz.isTimeLapse = true;
  viz.timeLapseID = legendDivID;
  viz.layerType =
    viz.layerType !== "tileMapService" ? "geeImage" : viz.layerType;

  if (viz.dateFormat === null || viz.dateFormat === undefined) {
    viz.dateFormat = "YYYY";
  }
  viz.advanceInterval = viz.advanceInterval || "year";
  if (viz.dateField === null || viz.dateField === undefined) {
    viz.dateField = "system:time_start";
  }

  timeLapseObj[legendDivID] = {};
  if (whichLayerList === null || whichLayerList === undefined) {
    whichLayerList = "layer-list";
  }

  //Pull out years if not provided
  //Years need to be client-side
  //Assumes the provided image collection has time property under system:time_start property
  if (viz.layerType === "tileMapService") {
    viz.years = Object.keys(item);
  } else if (
    viz.layerType !== "tileMapService" &&
    (viz.years === null || viz.years === undefined)
  ) {
    console.log("start computing years");
    viz.years = unique(
      item
        .sort(viz.dateField, true)
        .toList(10000, 0)
        .map(function (img) {
          const d = ee.Date(ee.Image(img).get(viz.dateField));
          return d.format(viz.dateFormat);
        })
        .getInfo()
    );

    console.log("done computing years");
    console.log(viz.years);
  }

  //Set up time laps object entry
  viz.yearsI = range(0, viz.years.length);
  viz.yearLookup = dictFromKeyValues(viz.yearsI, viz.years);
  timeLapseObj[legendDivID].years = viz.years;
  timeLapseObj[legendDivID].yearsI = viz.yearsI;
  timeLapseObj[legendDivID].layerType = viz.layerType;
  timeLapseObj[legendDivID].yearLookup = viz.years;
  timeLapseObj[legendDivID].frames = range(0, viz.years.length - 1);
  timeLapseObj[legendDivID].nFrames = viz.years.length;
  timeLapseObj[legendDivID].loadingLayerIDs = [];
  timeLapseObj[legendDivID].loadingTilesLayerIDs = [];
  timeLapseObj[legendDivID].layerVisibleIDs = [];
  timeLapseObj[legendDivID].sliders = [];
  timeLapseObj[legendDivID].intervalValue = null;
  timeLapseObj[legendDivID].isReady = false;
  timeLapseObj[legendDivID].visible = visible;
  timeLapseObj[legendDivID].state = "inactive";
  timeLapseObj[legendDivID].opacity = viz.opacity * 100;
  const layerContainerTitle =
    "Time lapse layers load multiple map layers throughout time. Once loaded, you can play the time lapse as an animation, or advance through single years using the buttons and sliders provided.  The layers can be displayed as a single year or as a cumulative mosaic of all preceding years using the right-most button.";

  //Set up container for time lapse
  $("#" + whichLayerList).prepend(`
                                <li   title = '${layerContainerTitle}' id = '${legendDivID}-collapse-label' class = 'layer-container not-draggable-layer'>
                                  <div class = 'time-lapse-layer-range-container ' >
                                    <div title = 'Opacity' id='${legendDivID}-opacity-slider' class = 'simple-time-lapse-layer-range-first'>
                                      <div id='${legendDivID}-opacity-slider-handle' class=" time-lapse-slider-handle ui-slider-handle">
                                        <div style = 'display:none;' id='${legendDivID}-opacity-slider-handle-label' class = 'time-lapse-slider-handle-label'>${
    timeLapseObj[legendDivID].opacity / 100
  }</div>
                                      </div>
                                    </div>
                                    <div id='${legendDivID}-time-lapse-layer-range-container' style = 'display:none;'>
                                      <div title = 'Frame Date' id='${legendDivID}-year-slider' class = 'simple-time-lapse-layer-range-first'>
                                        <div id='${legendDivID}-year-slider-handle' class=" time-lapse-slider-handle ui-slider-handle">
                                          <div id='${legendDivID}-year-slider-handle-label' class = 'time-lapse-slider-handle-label'>${
    viz.years[0]
  }</div>
                                        </div>
                                      </div>
                                    
                                      <div title = 'Frame Rate' id='${legendDivID}-speed-slider' class = 'simple-time-lapse-layer-range'>
                                        <div id='${legendDivID}-speed-slider-handle' class=" time-lapse-slider-handle ui-slider-handle">
                                          <div id='${legendDivID}-speed-slider-handle-label' class = 'time-lapse-slider-handle-label'>${(
    1 /
    (intervalPeriod / 1000)
  ).toFixed(1)}fps</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <input  id="${legendDivID}-toggle-checkbox" onchange = 'timeLapseCheckbox("${legendDivID}")' type="checkbox" ${checked}/>
                                  <label  title = 'Activate/deactivate time lapse' id="${legendDivID}-toggle-checkbox-label" style = 'margin-bottom:0px;display:none;'  for="${legendDivID}-toggle-checkbox"></label>

                                  
                                  
                                  
                                  <i id = '${legendDivID}-loading-spinner' title = '${name} time lapse layers loading' class="text-dark fa fa-spinner fa-spin layer-spinner"></i>
                                  <div class = 'layer-label-container'>
                                  <i style = 'display:none;' id = '${legendDivID}-loading-gear' title = '${name} time lapse tiles loading' class="text-dark fa fa-gear fa-spin layer-spinner"></i>
                                  ${viz.labelIconHTML}
                                  <span  id = '${legendDivID}-name-span'  class = 'layer-span ${
    viz.labelClasses
  }'>${name}</span>

                                  <div id = "${legendDivID}-icon-bar" class = 'timelapse-icon-bar' style = 'display:none;'>
                                    <button class = 'btn' title = 'Back one frame' id = '${legendDivID}-backward-button' onclick = 'backOneFrame("${legendDivID}")'><i class="fa fa-backward fa-xs"></i></button>
                                    <button class = 'btn' title = 'Pause animation' id = '${legendDivID}-pause-button' onclick = 'pauseButtonFunction("${legendDivID}")'><i class="fa fa-pause"></i></button>
                                    <button style = 'display:none;' class = 'btn time-lapse-active' title = 'Clear animation' id = '${legendDivID}-stop-button' onclick = 'stopTimeLapse("${legendDivID}")'><i class="fa fa-stop"></i></button>
                                    <button class = 'btn' title = 'Play animation' id = '${legendDivID}-play-button'  onclick = 'playTimeLapse("${legendDivID}")'><i class="fa fa-play"></i></button>
                                    <button class = 'btn' title = 'Forward one frame' id = '${legendDivID}-forward-button' onclick = 'forwardOneFrame("${legendDivID}")'><i class="fa fa-forward"></i></button>
                                    <button style = '' class = 'btn' title = 'Refresh layers if tiles failed to load' id = '${legendDivID}-refresh-tiles-button' onclick = 'jitterZoom(true)'><i class="fa fa-refresh"></i></button>
                                    <button style = 'display:none;' class = 'btn' title = 'Toggle frame visiblity' id = '${legendDivID}-toggle-frames-button' onclick = 'toggleFrames("${legendDivID}")'><i class="fa fa-eye"></i></button>
                                    <button class = 'btn cumulativeToggler' onclick = 'toggleCumulativeMode()' title = 'Click to toggle whether to show a single year or all years in the past along with current year'><img style = 'width:1.4em;filter: invert(100%) brightness(500%)'  src="./src/assets/images/cumulative_icon.png"></button>
                                    <div id = "${legendDivID}-message-div" class = 'pt-2'></div>
                                  </div>
                                  <div>
                                </li>
                                
                                <div id = '${legendDivID}-collapse-div' style = 'display:none;'></div>`);

  //Add legend
  $("#time-lapse-legend-list").append(
    `<div id="legend-${legendDivID}-collapse-div"></div>`
  );
  onclick = 'timeLapseCheckbox("${legendDivID}")';
  const prevent = false;
  const delay = 200;
  $("#" + legendDivID + "-name-span").click(function () {
    setTimeout(function () {
      if (!prevent) {
        timeLapseCheckbox(legendDivID);
      }
    }, delay);
  });

  //Add in layers

  if (viz.layerType === "tileMapService") {
    viz.years = Object.keys(item);

    Object.keys(item).map((yr) => {
      if (yr !== viz.years[0]) {
        viz.addToLegend = false;
        viz.addToClassLegend = false;
      }
      const vizT = Object.assign({}, viz);
      vizT.year = yr;
      addToMap(
        superSimpleTileURLFunction(item[yr]),
        vizT,
        name + " " + yr.toString(),
        false,
        label,
        fontColor,
        helpBox,
        legendDivID + "-collapse-div",
        queryItem
      );
    });
  } else {
    const dummyImage = ee.Image(item.first());
    const cT = [];
    viz.years.map(function (yr) {
      // Get the date
      let img;
      const d = ee.Date.parse(viz.dateFormat, yr.toString());

      // Filter and find the image
      if (viz.dateField !== "system:time_start") {
        img = item.filter(ee.Filter.gte(viz.dateField, d.millis()));
        img = img.filter(
          ee.Filter.lt(
            viz.dateField,
            d.advance(1, viz.advanceInterval).millis()
          )
        );
        img = fillEmptyCollections(img, dummyImage);
      } else {
        // This method fails with different dateFields than system:time_start
        img = fillEmptyCollections(
          item.filterDate(d, d.advance(1, viz.advanceInterval)),
          dummyImage
        );
      }

      if (viz.mosaic) {
        img = ee
          .Image(img.mosaic())
          .set("system:time_start", d.millis())
          .copyProperties(img.first());
      } else {
        img = ee
          .Image(img.first())
          .set("system:time_start", d.millis())
          .copyProperties(img.first());
      }

      cT.push(img);
      if (yr !== viz.years[0]) {
        viz.addToLegend = false;
        viz.addToClassLegend = false;
        viz.classLegendDict = null;
      }
      const vizT = Object.assign({}, viz);
      vizT.year = yr;
      vizT.layerType = "geeImage";
      vizT.canAreaChart = false;
      vizT.legendTitle = name;
      vizT.opacity = 0;

      addToMap(
        ee.Image(img),
        vizT,
        name + " " + yr.toString(),
        false,
        label,
        fontColor,
        helpBox,
        legendDivID + "-collapse-div",
        queryItem
      );
    });

    // Set the time_start (which is used for pixel query charting) to the date used
    // regardless of the dateField so the same dates will appear in the charts and timeLapse
    if (viz.dateField !== "system:time_start" || viz.canAreaChart) {
      item = ee.ImageCollection(cT);
    }
    if (viz.canAreaChart) {
      let vizTT = copyObj(viz);
      vizTT = setupAreaChartParams(vizTT, legendDivID);
      // All a 1:2 layer to area chart object if both line and sankey are specified
      if (vizTT.areaChartParams.sankey && vizTT.areaChartParams.line) {
        let areaChartParamsLine = copyObj(vizTT.areaChartParams);
        areaChartParamsLine.sankey = false;
        areaChartParamsLine.line = true;
        areaChartParamsLine.id = `${vizTT.areaChartParams.id}-----line`;
        areaChart.addLayer(item, areaChartParamsLine, name, visible);

        let areaChartParamsSankey = copyObj(vizTT.areaChartParams);
        areaChartParamsSankey.sankey = true;
        areaChartParamsSankey.line = false;
        areaChartParamsSankey.id = `${vizTT.areaChartParams.id}-----sankey`;

        areaChart.addLayer(item, areaChartParamsSankey, name, visible);
      } else {
        areaChart.addLayer(item, vizTT.areaChartParams, name, visible);
      }
      timeLapseObj[legendDivID].viz = vizTT;
      timeLapseObj[legendDivID].legendDivID = legendDivID;
    } else {
      timeLapseObj[legendDivID].viz = viz;
      timeLapseObj[legendDivID].legendDivID = legendDivID;
    }
  }
  //If its a tile map service, don't wait
  if (viz.layerType === "tileMapService") {
    timeLapseObj[legendDivID].isReady = true;
    $("#" + legendDivID + "-toggle-checkbox-label").show();
    $("#" + legendDivID + "-loading-spinner").hide();
  }

  // Set up query collection
  queryObj[legendDivID] = {
    visible: timeLapseObj[legendDivID].visible,
    queryItem: item,
    queryDict: viz.queryDict,
    queryParams: viz.queryParams || {},
    type: "geeImageCollection",
    name: name,
    queryDateFormat: viz.queryDateFormat,
  };

  //Get all the individual layers' sliders
  timeLapseObj[legendDivID].sliders = timeLapseObj[legendDivID].sliders;

  //Handle the sliders for that time lapse
  //Start with the opacity slider
  //Controls the opacity of all layers within that time lapse
  $("#" + legendDivID + "-opacity-slider").slider({
    min: 0,
    max: 1,
    step: 0.05,
    value: timeLapseObj[legendDivID].opacity / 100,
    slide: function (e, ui) {
      const opacity = ui.value;
      urlParams.layerProps[legendDivID].opacity = opacity;
      const k = legendDivID;
      const s = $("#" + k + "-opacity-slider").slider();
      s.slider("option", "value", ui.value);
      $("#" + k + "-opacity-slider-handle-label").text(opacity);
      timeLapseObj[k].opacity = opacity * 100;
      selectFrame(null, null, false);
      setTimeLapseRangeSliderThumbOpacity(opacity);
    },
  });
  function setTimeLapseRangeSliderThumbOpacity(opacity) {
    $(`#${legendDivID}-opacity-slider`).css(
      "background-color",
      `rgba(55, 46, 44,${opacity})!important`
    );
  }
  //The year slider
  $("#" + legendDivID + "-year-slider").slider({
    min: viz.yearsI[0],
    max: viz.yearsI[viz.yearsI.length - 1],
    step: 1,
    value: viz.yearsI[0],
    slide: function (e, ui) {
      const i = ui.value;
      const yr = viz.yearLookup[i];
      urlParams.timeLapseFrame = i;
      Object.keys(timeLapseObj).map(function (k) {
        const s = $("#" + k + "-year-slider").slider();
        s.slider("option", "value", ui.value);
        $("#" + k + "-year-slider-handle-label").text(yr);
      });
      if (timeLapseObj[legendDivID].isReady) {
        clearAllFrames();
        pauseTimeLapse(legendDivID);
        selectFrame(legendDivID, true, false);
        alignTimeLapseCheckboxes();
      }
    },
  });
  //The speed slider
  $("#" + legendDivID + "-speed-slider").slider({
    min: 0.5,
    max: 3.0,
    step: 0.5,
    value: 1.5,
    slide: function (e, ui) {
      const speed = (1 / ui.value) * 1000;
      Object.keys(timeLapseObj).map(function (k) {
        const s = $("#" + k + "-speed-slider").slider();
        s.slider("option", "value", ui.value);
        $("#" + k + "-speed-slider-handle-label").text(
          `${ui.value.toFixed(1)}fps`
        );
      });
      if (timeLapseObj[legendDivID].isReady) {
        setSpeed(legendDivID, speed);
      }
    },
  });
}
/////////////////////////////////////////////////////
//Wrapper to add an export

function addExport(eeImage, name, res, Export, metadataParams, noDataValue) {
  const exportElement = {};
  if (res === null || res === undefined) {
    res = 30;
  }
  if (metadataParams === null || metadataParams === undefined) {
    metadataParams = {};
  }
  if (Export === null || Export === undefined) {
    Export = true;
  }
  if (noDataValue === null || noDataValue === undefined) {
    noDataValue = -32768;
  }
  let checked = "";
  if (Export) {
    checked = "checked";
  }
  objType = getImagesLib.getObjType(eeImage);

  const now = Date().split(" ");

  name = name.replace(/[^A-Za-z0-9]/g, "_");
  if (typeof res === "number") {
    exportElement.transform;
    exportElement.res = res;
  } else {
    exportElement.transform = res;
    exportElement.res = res[0];
  }

  exportElement.name = name;

  exportElement.eeImage = eeImage;

  exportElement.Export = Export;
  exportElement.ID = exportID;

  exportImageDict[exportID] = {
    eeImage: eeImage,
    name: name,
    res: exportElement.res,
    transform: exportElement.transform,
    eeType: objType,
    shouldExport: Export,
    metadataParams: metadataParams,
    noDataValue: noDataValue,
    fileFormat: objType === "Image" ? "GEO_TIFF" : "SHP",
  };
  let rightInput =
    objType === "Image"
      ? `<input  id = '${name}-res-${exportID}' class="form-control export-res-input" type="text" value="${exportElement.res}" title = 'Change export spatial resolution (meters) if needed'><p title= 'Change export spatial resolution (meters) if needed' class='form-control export-res-input-label' >m</p>`
      : `<select id = '${name}-format-${exportID}' title= 'Select output format' class="form-control export-format-input form-select ">
          <option title = 'Export ${name} as a ESRI shapefile (will result in multiple files)' value = 'SHP'>Shapefile</option>
          <option class = 'optional-export-format' title = 'Export ${name} as a CSV' value = 'CSV'>CSV</option>
          <option title = 'Export ${name} as a geoJSON' value='GEO_JSON'>geoJSON</option>
          <option title = 'Export ${name} as a KML' value='KML'>KML</option>
          <option class = 'optional-export-format' title = 'Export ${name} as a KMZ' value='KMZ'>KMZ</option>
          <option class = 'optional-export-format' title = 'Export ${name} as a TensorFlow record' value='TF_RECORD_TABLE'>TF Record</option>
        </select>`;
  $("#export-list").append(`<div class = 'input-group'>
                              <span  class="input-group-addon">
                                <input  id = '${name}-checkbox-${exportID}' type="checkbox" ${checked} >
                                <label  style = 'margin-bottom:0px;'  for='${name}-checkbox-${exportID}'></label>
                              </span>
                              
                              <input  id = '${name}-name-${exportID}' class="form-control export-name-input" type="text" value="${exportElement.name}" title = 'Change export name if needed'>
                              ${rightInput}
                            </div>`);
  if (mode === "HiForm-BMP") {
    $(".optional-export-format").hide();
  }
  $("#" + name + "-name-" + exportID.toString()).on("input", function () {
    exportImageDict[exportElement.ID].name = $(this).val();
  });
  if (objType === "Image") {
    $("#" + name + "-res-" + exportID.toString()).on("input", function () {
      const resT = parseInt($(this).val());
      exportImageDict[exportElement.ID].res = resT;
      if (exportElement.transform !== undefined) {
        exportImageDict[exportElement.ID].transform[0] = resT;
        exportImageDict[exportElement.ID].transform[4] = -resT;
      }
    });
  } else {
    $("#" + name + "-format-" + exportID.toString()).on("input", function () {
      console.log($(this).val());
      exportImageDict[exportElement.ID].fileFormat = $(this).val();
    });
  }

  $("#" + name + "-checkbox-" + exportID.toString()).on("change", function () {
    exportImageDict[exportElement.ID].shouldExport = this.checked;
  });

  exportID++;
}
/////////////////////////////////////////////////////
// Function to set up area charting params given viz params from addLayer
function setupAreaChartParams(viz, legendDivID) {
  viz.areaChartParams = viz.areaChartParams || {};
  viz.areaChartParams.sankey = viz.areaChartParams.sankey || false;
  viz.areaChartParams.line =
    viz.areaChartParams.line || viz.areaChartParams.sankey == false;
  viz.areaChartParams.id = legendDivID;
  viz.areaChartParams.dateFormat =
    viz.areaChartParams.dateFormat || viz.dateFormat || "YYYY";
  if (
    (viz.areaChartParams.bandNames === undefined ||
      viz.areaChartParams.bandNames === null) &&
    (viz.bands === undefined || viz.bands === null) &&
    viz.dictServerSide
  ) {
    console.log("start");
    viz.eeObjInfo = viz.eeObjInfo.getInfo();
    viz.dictServerSide = false;
    console.log(viz);
  }
  viz.areaChartParams.bandNames =
    viz.areaChartParams.bandNames || viz.bands || viz.eeObjInfo.bandNames;

  if (
    viz.autoViz &&
    (viz.class_names === undefined || viz.class_names === null) &&
    viz.dictServerSide
  ) {
    console.log("start");
    viz.eeObjInfo = viz.eeObjInfo.getInfo();

    console.log(viz);
    viz.dictServerSide = false;
  }
  if (
    (viz.autoViz && viz.class_names === undefined) ||
    viz.class_names === null
  ) {
    viz = addClassVizDicts(viz);
    viz.areaChartParams.class_dicts_added = true;
  } else if (
    (viz.areaChartParams.palette === undefined ||
      viz.areaChartParams.palette === null) &&
    viz.areaChartParams.reducer !== undefined &&
    viz.areaChartParams.reducer !== null &&
    viz.min !== undefined &&
    viz.min !== null &&
    viz.max !== undefined &&
    viz.max !== null &&
    viz.palette !== undefined &&
    viz.palette !== null
  ) {
    viz.areaChartParams.palette_lookup = toObj(
      range(viz.min, viz.max + 1),
      get_poly_gradient_ct(viz.palette, viz.min, viz.max)
    );
  }
  viz.areaChartParams.class_values = viz.class_values;
  viz.areaChartParams.class_names = viz.class_names;
  viz.areaChartParams.class_palette = viz.class_palette;
  viz.areaChartParams.class_visibility = viz.class_visibility;

  viz.areaChartParams.layerType =
    viz.areaChartParams.layerType || viz.eeObjectType;
  viz.areaChartParams.eeObjInfo = viz.eeObjInfo;
  viz.areaChartParams.dictServerSide = viz.dictServerSide;
  return viz;
}
/////////////////////////////////////////////////////
//Function to add lookup dictionaries from info (assumes info is within an object and named eeObjInfo)
function addClassVizDicts(viz) {
  let cls_names_keys = Object.keys(viz.eeObjInfo).filter(
    (k) => k.indexOf("_class_names") > -1
  );
  if (cls_names_keys.length > 0) {
    let bns = cls_names_keys.map((k) => k.split("_class_names")[0]);

    bns = bns.filter((bn) => viz.eeObjInfo.bandNames.indexOf(bn) > -1);
    if (bns.length >= 1) {
      viz.autoViz = true;
      viz.class_names = {};
      viz.class_values = {};
      viz.class_palette = {};
      viz.class_visibility = {};
      bns.map((bn) => {
        let cns = viz.eeObjInfo[`${bn}_class_names`];
        let cvs = viz.eeObjInfo[`${bn}_class_values`];
        let cp = viz.eeObjInfo[`${bn}_class_palette`];
        let cv = viz.eeObjInfo[`${bn}_class_visibility`];
        if (cns !== undefined) {
          viz.class_names[bn] = viz.class_names[bn] || cns;
          viz.class_values[bn] = viz.class_values[bn] || cvs;
          viz.class_palette[bn] = viz.class_palette[bn] || cp;
          viz.class_visibility[bn] = viz.class_visibility[bn] || cv;
        }
      });
    }
  }
  return viz;
}

/////////////////////////////////////////////////////
//Function to add lookup dictionaries to map viz object
function getLookupDicts(
  bandName,
  class_values,
  class_names,
  class_palette,
  includeClassValues
) {
  let values = class_values[bandName];
  let palette = class_palette[bandName];
  let names = class_names[bandName];
  includeClassValues =
    includeClassValues == true || includeClassValues == undefined
      ? true
      : false;
  let value_name =
    includeClassValues == true
      ? zip(values, names).map((v) => v.join("- "))
      : names;

  legendDict = toObj(value_name, palette);
  queryDict = toObj(values, names);
  return { classLegendDict: legendDict, queryDict: queryDict };
}
const typeLookup = {
  Image: "geeImage",
  ImageCollection: "geeImageCollection",
  Feature: "geeVectorImage",
  FeatureCollection: "geeVectorImage",
  Geometry: "geeVectorImage",
};
const reverseTypeLookup = {};
Object.keys(typeLookup).map((k) => (reverseTypeLookup[typeLookup[k]] = k));

function addToMap(
  item,
  viz,
  name,
  visible,
  label,
  fontColor,
  helpBox,
  whichLayerList,
  queryItem
) {
  if (viz === undefined || viz === null) {
    viz = {};
  }
  viz = copyObj(viz);
  if (
    viz !== null &&
    viz !== undefined &&
    viz.serialized !== null &&
    viz.serialized !== undefined &&
    viz.serialized === true
  ) {
    item = ee.Deserializer.decode(item);
    if (
      viz.areaChartParams !== undefined &&
      viz.areaChartParams !== null &&
      viz.areaChartParams.reducer !== undefined &&
      viz.areaChartParams.reducer !== null
    ) {
      viz.areaChartParams.reducer = ee.Deserializer.fromJSON(
        viz.areaChartParams.reducer
      );
    }
  }
  viz.labelClasses = viz.labelClasses || "";
  viz.labelIconHTML = viz.labelIconHTML || "";

  const currentGEERunID = geeRunID;
  if (whichLayerList === null || whichLayerList === undefined) {
    whichLayerList = "layer-list";
  }
  if (viz === null || viz === undefined) {
    viz = {};
  }
  if (name === undefined || name === null) {
    name = "Layer " + NEXT_LAYER_ID;
  }
  viz.isTimeLapse = viz.isTimeLapse || false;

  if (
    viz.layerType !== "geoJSONVector" &&
    viz.layerType !== "tileMapService" &&
    viz.layerType !== "dynamicMapService"
  ) {
    if (viz.eeObjInfo === undefined || viz.eeObjInfo === null) {
      let t =
        reverseTypeLookup[viz.layerType] || getImagesLib.getObjType(item, name);
      viz.eeObjInfo = getImagesLib.eeObjInfo(item, t);
      viz.dictServerSide = true;
    } else if (getImagesLib.eeObjServerSide(viz.eeObjInfo) === false) {
      viz.dictServerSide = false;
    } else {
      viz.eeObjInfo = ee.Dictionary(viz.eeObjInfo);
      viz.dictServerSide = true;
    }
  }

  if (
    viz.autoViz === true &&
    (viz.class_names === undefined || viz.class_names === null) &&
    viz.layerType !== "geoJSONVector" &&
    viz.layerType !== "tileMapService" &&
    viz.layerType !== "dynamicMapService"
  ) {
    if (viz.dictServerSide) {
      viz.eeObjInfo = viz.eeObjInfo.getInfo();
      viz.dictServerSide = false;
    }

    viz = addClassVizDicts(viz);
  }

  //Possible layerType: geeVector,geoJSONVector,geeImage,geeImageArray,geeImageCollection,tileMapService,dynamicMapService
  if (viz.layerType === null || viz.layerType === undefined) {
    let eeType = getImagesLib.getObjType(item, "addLayer");

    if (eeType === "Feature") {
      item = ee.FeatureCollection([item]);
      viz.eeObjInfo.layerType = "FeatureCollection";
      eeType = "FeatureCollection";
    } else if (eeType === "Geometry") {
      item = ee.FeatureCollection([ee.Feature(item)]);
      viz.eeObjInfo.layerType = "FeatureCollection";
      // viz.canQuery = false;
      eeType = "FeatureCollection";
    }
    viz.eeObjectType = eeType;
    viz.layerType = typeLookup[eeType];
  } else {
    viz.eeObjectType = reverseTypeLookup[viz.layerType];
  }

  if (viz.layerType === "geoJSONVector") {
    viz.canQuery = false;
  }

  if (viz.layerType === "geeVector" || viz.layerType === "geoJSONVector") {
    if (viz.strokeOpacity === undefined || viz.strokeOpacity === null) {
      viz.strokeOpacity = 1;
    }
    if (viz.fillOpacity === undefined || viz.fillOpacity === null) {
      viz.fillOpacity = 0.2;
    }
    if (viz.fillColor === undefined || viz.fillColor === null) {
      viz.fillColor = "222222";
    }
    if (viz.strokeColor === undefined || viz.strokeColor === null) {
      viz.strokeColor = getColor();
    }
    if (viz.strokeWeight === undefined || viz.strokeWeight === null) {
      viz.strokeWeight = 3;
    }
    viz.opacityRatio = viz.strokeOpacity / viz.fillOpacity;
    if (viz.fillColor.indexOf("#") == -1) {
      viz.fillColor = "#" + viz.fillColor;
    }
    if (viz.strokeColor.indexOf("#") == -1) {
      viz.strokeColor = "#" + viz.strokeColor;
    }

    if (viz.addToClassLegend === undefined || viz.addToClassLegend === null) {
      viz.addToClassLegend = true;
    }
  } else if (viz.layerType === "geeVectorImage") {
    if (viz.styleParams !== undefined && viz.styleParams !== null) {
      viz.styleParams.color = viz.styleParams.color || "000";
      viz.styleParams.fillColor = viz.styleParams.fillColor || "000A";
      viz.styleParams.width = viz.styleParams.width || 2;
      viz.styleParams.lineType = viz.styleParams.lineType || "solid";
      viz.styleParams.pointSize = viz.styleParams.pointSize || 3;
      viz.styleParams.pointShape = viz.styleParams.pointShape || "circle";

      viz.styleParams.color = qcHex(viz.styleParams.color);
      viz.styleParams.fillColor = qcHex(viz.styleParams.fillColor);

      viz.fillColor = viz.styleParams.fillColor;
      viz.strokeColor = viz.styleParams.color;
      viz.strokeWeight = viz.styleParams.width;
      viz.lineType = viz.styleParams.lineType;
    } else {
      viz.fillOpacity = 0;
      if (viz.fillColor === undefined || viz.fillColor === null) {
        viz.fillColor = "222222";
      }
      if (viz.strokeColor === undefined || viz.strokeColor === null) {
        viz.strokeColor = getColor();
      }
      if (viz.strokeWeight === undefined || viz.strokeWeight === null) {
        viz.strokeWeight = 2;
      }
      if (viz.strokeOpacity === undefined || viz.strokeOpacity === null) {
        viz.strokeOpacity = 1;
      }
    }

    if (viz.fillColor.indexOf("#") == -1) {
      viz.fillColor = "#" + viz.fillColor;
    }
    if (viz.strokeColor.indexOf("#") == -1) {
      viz.strokeColor = "#" + viz.strokeColor;
    }

    if (viz.addToClassLegend === undefined || viz.addToClassLegend === null) {
      viz.addToClassLegend = true;
      viz.addToLegend = false;
    }
  }
  if (viz.bands !== undefined && typeof viz.bands === "string") {
    viz.bands = viz.bands.split(",");
  }
  if (viz.palette !== undefined && typeof viz.palette === "string") {
    viz.palette = viz.palette.split(",");
  }

  //Handle legend
  let legendDivID = name.replaceAll(" ", "-") + "-" + NEXT_LAYER_ID.toString();
  legendDivID = legendDivID.replace(/[^A-Za-z0-9]/g, "-");

  // Handle layer visibility caching
  if (viz.isTimeLapse === false) {
    if (
      urlParams.layerProps[legendDivID] === undefined ||
      urlParams.layerProps[legendDivID] === null
    ) {
      urlParams.layerProps[legendDivID] = {};
      urlParams.layerProps[legendDivID].visible =
        visible === undefined ? true : visible;
      urlParams.layerProps[legendDivID].opacity = viz.opacity || 1;
    } else {
      visible = urlParams.layerProps[legendDivID].visible;
      viz.opacity = urlParams.layerProps[legendDivID].opacity;
    }
  }

  // Handle area charting
  if (viz.canAreaChart) {
    viz = setupAreaChartParams(viz, legendDivID);

    // All a 1:2 layer to area chart object if both line and sankey are specified
    if (viz.areaChartParams.sankey && viz.areaChartParams.line) {
      let areaChartParamsLine = copyObj(viz.areaChartParams);
      areaChartParamsLine.sankey = false;
      areaChartParamsLine.line = true;
      areaChartParamsLine.id = `${viz.areaChartParams.id}-----line`;
      areaChart.addLayer(item, areaChartParamsLine, name, visible);

      let areaChartParamsSankey = copyObj(viz.areaChartParams);
      areaChartParamsSankey.sankey = true;
      areaChartParamsSankey.line = false;
      areaChartParamsSankey.id = `${viz.areaChartParams.id}-----sankey`;

      areaChart.addLayer(item, areaChartParamsSankey, name, visible);
    } else {
      areaChart.addLayer(item, viz.areaChartParams, name, visible);
    }
  }
  if (visible == null) {
    visible = true;
  }
  if (viz.opacity == null) {
    viz.opacity = 1;
  }

  const layerObjKeys = Object.keys(layerObj);
  const nameIndex = layerObjKeys.indexOf(legendDivID);
  if (nameIndex != -1) {
    visible = layerObj[legendDivID].visible;
    viz.opacity = layerObj[legendDivID].opacity;
    if (viz.layerType === "geeVector" || viz.layerType === "geoJSONVector") {
      viz.strokeOpacity = layerObj[legendDivID].opacity;
      viz.fillOpacity = viz.strokeOpacity / viz.opacityRatio;
    }
  }

  if (helpBox == null || helpBox === undefined) {
    helpBox = "";
  }
  if (viz.title !== null && viz.title !== undefined) {
    helpBox = viz.title;
  }
  const layer = {};

  layer.ID = NEXT_LAYER_ID;
  NEXT_LAYER_ID += 1;
  layer.layerChildID = layerChildID;
  layerChildID++;
  layer.name = name;
  layer.opacity = viz.opacity;
  viz.opacity = 1;
  layer.map = map;
  layer.helpBoxMessage = helpBox;
  layer.visible = visible;
  layer.label = label;
  layer.fontColor = fontColor;
  layer.helpBox = helpBox;
  layer.legendDivID = legendDivID;
  if (queryItem === null || queryItem === undefined) {
    queryItem = item;
  }
  if (viz.canQuery === null || viz.canQuery === undefined) {
    viz.canQuery = true;
  }
  layer.canQuery = viz.canQuery;
  layer.queryItem = queryItem;
  layer.layerType = viz.layerType;

  //AutoViz if specified
  if (viz.autoViz && viz.isTimeLapse === false) {
    if (viz.dictServerSide) {
      console.log("start");
      console.log(name);
      viz.eeObjInfo = viz.eeObjInfo.getInfo();
      viz.dictServerSide = false;
      viz = addClassVizDicts(viz);
      console.log(viz);
    }
    if (viz.bands === undefined || viz.bands === null) {
      viz.bands = viz.eeObjInfo.bandNames;
    }

    viz.bands = viz.bands[0];
    dicts = getLookupDicts(
      viz.bands,
      viz.class_values,
      viz.class_names,
      viz.class_palette,
      viz.includeClassValues
    );

    viz.classLegendDict = dicts.classLegendDict;
    viz.queryDict = dicts.queryDict;
  }
  //Construct legend
  if (
    viz != null &&
    (viz.bands == null || viz.bands.length == 1) &&
    viz.addToLegend != false &&
    (viz.addToClassLegend === undefined ||
      viz.addToClassLegend === null ||
      viz.addToClassLegend === false) &&
    (viz.classLegendDict == undefined || viz.classLegendDict == null)
  ) {
    addLegendContainer(legendDivID, "legend-" + whichLayerList, false, helpBox);

    const legend = {};

    if (viz.legendTitle !== null && viz.legendTitle !== undefined) {
      legend.name = viz.legendTitle;
    } else {
      legend.name = name;
    }

    legend.labelClasses = viz.labelClasses;
    legend.labelIconHTML = viz.labelIconHTML;

    legend.helpBoxMessage = helpBox;
    let palette;
    if (viz.palette != null) {
      palette = viz.palette;
    } else {
      palette = "000,FFF";
    }
    let paletteList = palette;
    if (typeof palette === "string") {
      paletteList = paletteList.split(",");
    }
    if (paletteList.length == 1) {
      paletteList = [paletteList[0], paletteList[0]];
    }
    paletteList = paletteList.map(function (color) {
      if (color.indexOf("#") > -1) {
        color = color.slice(1);
      }
      return color;
    });
    const colorRamp = createColorRamp(
      "colorRamp" + colorRampIndex.toString(),
      paletteList,
      180,
      20
    );

    legend.colorRamp = colorRamp;

    let legendMinValue = viz.min;
    let legendMaxValue = viz.max;
    if (viz.legendNumbersWithCommas) {
      legendMinValue = legendMinValue.numberWithCommas();
      legendMaxValue = legendMaxValue.numberWithCommas();
    }
    if (label != null && viz.min != null) {
      legend.min = legendMinValue + " " + label;
    } else if (label != null && viz.min == null) {
      legend.min = minLabel;
    } else if (label == null && viz.min != null) {
      legend.min = legendMinValue;
    }

    if (label != null && viz.max != null) {
      legend.max = legendMaxValue + " " + label;
    } else if (label != null && viz.max == null) {
      legend.max = maxLabel;
    } else if (label == null && viz.max != null) {
      legend.max = legendMaxValue;
    }

    if (viz.legendLabelLeft !== null && viz.legendLabelLeft !== undefined) {
      legend.min = viz.legendLabelLeft + " " + legendMinValue;
    }
    if (viz.legendLabelRight !== null && viz.legendLabelRight !== undefined) {
      legend.max = viz.legendLabelRight + " " + legendMaxValue;
    }
    if (
      viz.legendLabelLeftAfter !== null &&
      viz.legendLabelLeftAfter !== undefined
    ) {
      legend.min = legendMinValue + " " + viz.legendLabelLeftAfter;
    }
    if (
      viz.legendLabelRightAfter !== null &&
      viz.legendLabelRightAfter !== undefined
    ) {
      legend.max = legendMaxValue + " " + viz.legendLabelRightAfter;
    }
    if (legend.min == null) {
      legend.min = "min";
    }
    if (legend.max == null) {
      legend.max = "max";
    }

    if (fontColor != null) {
      legend.fontColor = "color:#" + fontColor + ";";
    } else {
      legend.fontColor = "color:#DDD;";
    }
    addColorRampLegendEntry(legendDivID, legend);
  } else if (
    viz != null &&
    ((viz.classLegendDict !== undefined && viz.classLegendDict !== null) ||
      viz.addToClassLegend === true)
  ) {
    addLegendContainer(legendDivID, "legend-" + whichLayerList, false, helpBox);
    const classLegendContainerID = legendDivID + "-class-container";
    let legendClassContainerName;
    if (viz.legendTitle !== null && viz.legendTitle !== undefined) {
      legendClassContainerName = viz.legendTitle;
    } else {
      legendClassContainerName = name;
    }
    const legendObj = {};
    legendObj.labelClasses = viz.labelClasses;
    legendObj.labelIconHTML = viz.labelIconHTML;
    addClassLegendContainer(
      classLegendContainerID,
      legendDivID,
      legendClassContainerName,
      legendObj
    );
    if (
      viz.layerType !== "geeVector" &&
      viz.layerType !== "geoJSONVector" &&
      viz.layerType !== "geeVectorImage"
    ) {
      const legendKeys = Object.keys(viz.classLegendDict);
      legendKeys.map(function (lk) {
        const legend = {};
        legend.name = name;

        legend.helpBoxMessage = helpBox;

        legend.classColor = viz.classLegendDict[lk];
        legend.classStrokeColor = "999";
        legend.classStrokeWeight = 1;
        legend.className = lk;
        legend.lineType = "solid";
        addClassLegendEntry(classLegendContainerID, legend);
      });
    } else {
      const legend = {};
      legend.name = name;
      legend.helpBoxMessage = helpBox;
      let strokeColor = viz.strokeColor.slice(1);
      let fillColor = viz.fillColor.slice(1);

      if (strokeColor.length === 3) {
        strokeColor = strokeColor
          .split("")
          .map(function (i) {
            return i + i;
          })
          .join()
          .replaceAll(",", "");
      }
      if (fillColor.length === 3) {
        fillColor = fillColor
          .split("")
          .map(function (i) {
            return i + i;
          })
          .join()
          .replaceAll(",", "");
      }

      legend.classColor =
        viz.fillOpacity === undefined
          ? fillColor
          : fillColor + Math.floor((viz.fillOpacity / 2) * 255).toString(16);
      legend.classStrokeColor =
        viz.strokeOpacity === undefined
          ? strokeColor
          : strokeColor + Math.floor(viz.strokeOpacity * 255).toString(16);
      legend.classStrokeWeight = viz.strokeWeight;
      legend.className = "";
      legend.lineType = viz.lineType || "solid";

      addClassLegendEntry(classLegendContainerID, legend);
    }

    const title = {};
    title.name = name;
    title.helpBoxMessage = helpBox;
  }

  layer.visible = visible;
  layer.item = item;
  layer.name = name;
  layer.viz = viz;
  layer.whichLayerList = whichLayerList;
  layer.layerId = layerCount;
  layer.currentGEERunID = currentGEERunID;
  //Add the layer
  addLayer(layer);
  layerCount++;

  return layer.id;
}

//////////////////////////////////////////////////////
//Wrapper for bringing in a tile map service
function standardTileURLFunction(url, xThenY, fileExtension, token) {
  if (xThenY === null || xThenY === undefined) {
    xThenY = false;
  }
  if (token === null || token === undefined) {
    token = "";
  } else {
    token = "?token=" + token;
  }
  if (fileExtension === null || fileExtension === undefined) {
    fileExtension = ".png";
  }

  return function (coord, zoom) {
    // "Wrap" x (logitude) at 180th meridian properly
    // NB: Don't touch coord.x because coord param is by reference, and changing its x property breakes something in Google's lib
    const tilesPerGlobe = 1 << zoom;
    let x = coord.x % tilesPerGlobe;
    console.log(coord, zoom, x);
    if (x < 0) {
      x = tilesPerGlobe + x;
    }
    // Wrap y (latitude) in a like manner if you want to enable vertical infinite scroll
    // return "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/" + zoom + "/" + x + "/" + coord.y + "?access_token=pk.eyJ1IjoiaWhvdXNtYW4iLCJhIjoiY2ltcXQ0cnljMDBwNHZsbTQwYXRtb3FhYiJ9.Sql6G9QR_TQ-OaT5wT6f5Q"
    if (xThenY) {
      return url + zoom + "/" + x + "/" + coord.y + fileExtension + token;
    } else {
      return url + zoom + "/" + coord.y + "/" + x + fileExtension + token;
    }
  };
}
function superSimpleTileURLFunction(url) {
  return function (coord, zoom) {
    return url + zoom + "/" + coord.y + "/" + coord.x;
  };
}
/////////////////////////////////////////////////////
//Function to add ee object ot map
function addRESTToMap(
  tileURLFunction,
  name,
  visible,
  maxZoom,
  helpBox,
  whichLayerList
) {
  const viz = {};
  const item = ee.Image();
  if (whichLayerList === null || whichLayerList === undefined) {
    whichLayerList = "layer-list";
  }

  if (name === null || name === undefined) {
    name = "Layer " + NEXT_LAYER_ID;
  }

  if (visible === null || visible === undefined) {
    visible = true;
  }
  if (maxZoom === null || maxZoom === undefined) {
    maxZoom = 18;
  }
  if (helpBox == null) {
    helpBox = "";
  }
  const layer = document.createElement("REST-layer");
  layer.tileURLFunction = tileURLFunction;
  layer.ID = NEXT_LAYER_ID;
  NEXT_LAYER_ID += 1;
  layer.layerChildID = layerChildID;
  layerChildID++;
  layer.name = name;
  layer.map = map;
  layer.helpBoxMessage = helpBox;
  layer.visible = visible;
  layer.helpBox = helpBox;
  layer.maxZoom = maxZoom;

  layer.visible = visible;
  layer.item = item;
  layer.name = name;

  const layerList = document.querySelector(whichLayerList);

  layerList.insertBefore(layer, layerList.firstChild);
  layerCount++;
  item.getMap(viz, function (eeLayer) {
    layer.setLayer(eeLayer);
  });
}
//////////////////////////////////////////////////////
//Function to convert xy space in the dom to the map
function point2LatLng(x, y) {
  let out;
  try {
    const m = document.getElementById("map");
    x = x - m.offsetLeft;
    y = y - m.offsetTop;

    const topRight = map
      .getProjection()
      .fromLatLngToPoint(map.getBounds().getNorthEast());
    const bottomLeft = map
      .getProjection()
      .fromLatLngToPoint(map.getBounds().getSouthWest());
    const scale = Math.pow(2, map.getZoom());
    const worldPoint = new google.maps.Point(
      x / scale + bottomLeft.x,
      y / scale + topRight.y
    );
    out = map.getProjection().fromPointToLatLng(worldPoint);
  } catch (err) {
    out = null;
  }

  return out;
}
//////////////////////////////////////////////////////
function Xcoord4326To3857(x) {
  x = (x * 20037508.34) / 180;

  return x;
}
function Ycoord4326To3857(y) {
  y = Math.log(Math.tan(((90 + y) * Math.PI) / 360)) / (Math.PI / 180);
  y = (y * 20037508.34) / 180;
  return y;
}
//Wrapper function to get a dynamic map service
function getGroundOverlay(baseUrl, minZoom, ending) {
  if (map.getZoom() >= minZoom) {
    if (ending === undefined || ending === null) {
      ending = "";
    }
    const mapHeight = $("#map").height();
    const mapWidth = $("#map").width();

    const bounds = map.getBounds().toJSON();

    const south = Ycoord4326To3857(bounds.south);
    const north = Ycoord4326To3857(bounds.north);
    const east = Xcoord4326To3857(bounds.east);
    const west = Xcoord4326To3857(bounds.west);

    const url = `${baseUrl}${west}%2C${south}%2C${east}%2C${north}&bboxSR=3857&imageSR=3857&size=${mapWidth}%2C${mapHeight}${ending}`;

    return url;
  } else {
    url = "../src/assets/images/blank.png";

    return url;
  }
}
//////////////////////////////////////////////////////
/////////////////////////////////////////////////////
//Function to add dynamic object mapping service to map
function addDynamicToMap(
  baseUrl1,
  baseUrl2,
  ending1,
  ending2,
  minZoom1,
  minZoom2,
  name,
  visible,
  helpBox,
  whichLayerList
) {
  if (whichLayerList === null || whichLayerList === undefined) {
    whichLayerList = "layer-list";
  }
  const viz = {};
  const item = ee.Image();
  if (name === null || name === undefined) {
    name = "Layer " + NEXT_LAYER_ID;
  }
  if (visible === null || visible === undefined) {
    visible = true;
  }
  if (helpBox == null) {
    helpBox = "";
  }

  const layer = document.createElement("dynamic-layer");

  layer.ID = NEXT_LAYER_ID;
  NEXT_LAYER_ID += 1;
  layer.layerChildID = layerChildID;
  layerChildID++;
  layer.name = name;
  layer.map = map;
  layer.helpBoxMessage = helpBox;
  layer.visible = visible;
  layer.helpBox = helpBox;

  layer.visible = visible;
  layer.item = item;
  layer.name = name;

  const layerList = document.querySelector(whichLayerList);

  layerList.insertBefore(layer, layerList.firstChild);
  layerCount++;
  layer.startUp();
}
//Function to add a gee feature to the map
function addFeatureToMap(
  item,
  viz,
  name,
  visible,
  label,
  fontColor,
  helpBox,
  whichLayerList,
  queryItem
) {
  console.log("adding feature: " + name);
  item.evaluate(function (v) {
    const layer = new google.maps.Data({ fillOpacity: 0, strokeColor: "#F00" });
    layer.addGeoJson(v);
    layer.setMap(map);
  });
}
const featureViewObj = {};
function addFeatureView(
  assetId,
  visParams,
  name,
  visible,
  maxZoom,
  helpBox,
  whichLayerList
) {
  ee.data.getFeatureViewTilesKey(
    {
      assetId: assetId,
      visParams: visParams,
    },
    function (tokens) {
      console.log(tokens);
      const url =
        "https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/featureViews/" +
        tokens.token +
        "/tiles/";

      tileURLFunction = function (coord, zoom) {
        return url + zoom + "/" + coord.x + "/" + coord.y;
      };
      addToMap(tileURLFunction, { layerType: "tileMapService" }, name, visible);
    }
  );

  let legendDivID = name.replaceAll(" ", "-") + "-" + NEXT_LAYER_ID.toString();
  legendDivID = legendDivID.replace(/[^A-Za-z0-9]/g, "-");

  NEXT_LAYER_ID++;
  featureViewObj[legendDivID] = {
    name: name,
    assetId: assetId,
  };
}
/////////////////////////////////////////////////////////////////////////////////////
//Set up Map2 object
function mp() {
  this.addLayer = function (
    item,
    viz,
    name,
    visible,
    label,
    fontColor,
    helpBox,
    whichLayerList,
    queryItem
  ) {
    return addToMap(
      item,
      viz,
      name,
      visible,
      label,
      fontColor,
      helpBox,
      whichLayerList,
      queryItem
    );
  };
  this.removeLayer = function (layerId) {
    if (layerId) {
      map.overlayMapTypes.setAt(layerObj[layerId].layerId, null);
      $(`#${layerId}-container-${layerObj[layerId].ID}`).remove();
      $(`#${layerId}`).remove();

      if (layerObj[layerId].canQuery) {
        console.log(`${layerId}-${layerObj[layerId].ID}`);
        delete queryObj[`${layerId}-${layerObj[layerId].ID}`];
      }
      delete layerObj[layerId];
    }
  };
  this.addSerializedLayer = function (
    item,
    viz,
    name,
    visible,
    label,
    fontColor,
    helpBox,
    whichLayerList,
    queryItem
  ) {
    viz.serialized = true;
    addToMap(
      item,
      viz,
      name,
      visible,
      label,
      fontColor,
      helpBox,
      whichLayerList,
      queryItem
    );
  };
  this.selectLayerAdded = false;
  this.hideSelectLayerAreaCharting = function () {
    $("#select-area-interactive-chart-label").hide();
  };
  this.hideSelectLayerAreaCharting();
  this.showSelectLayerAreaCharting = function () {
    $("#select-area-interactive-chart-label").show();
  };
  this.addSelectLayer = function (
    item,
    viz,
    name,
    visible,
    label,
    fontColor,
    helpBox,
    whichLayerList,
    queryItem
  ) {
    this.selectLayerAdded = true;
    this.showSelectLayerAreaCharting();
    addSelectLayerToMap(
      item,
      viz,
      name,
      visible,
      label,
      fontColor,
      helpBox,
      whichLayerList,
      queryItem
    );
  };
  this.addSerializedSelectLayer = function (
    item,
    viz,
    name,
    visible,
    label,
    fontColor,
    helpBox,
    whichLayerList,
    queryItem
  ) {
    viz.serialized = true;
    this.selectLayerAdded = true;
    this.showSelectLayerAreaCharting();
    addSelectLayerToMap(
      item,
      viz,
      name,
      visible,
      label,
      fontColor,
      helpBox,
      whichLayerList,
      queryItem
    );
  };
  this.addTimeLapse = function (
    item,
    viz,
    name,
    visible,
    label,
    fontColor,
    helpBox,
    whichLayerList,
    queryItem
  ) {
    addTimeLapseToMap(
      item,
      viz,
      name,
      visible,
      label,
      fontColor,
      helpBox,
      whichLayerList,
      queryItem
    );
  };
  this.addSerializedTimeLapse = function (
    item,
    viz,
    name,
    visible,
    label,
    fontColor,
    helpBox,
    whichLayerList,
    queryItem
  ) {
    viz.serialized = true;
    addTimeLapseToMap(
      item,
      viz,
      name,
      visible,
      label,
      fontColor,
      helpBox,
      whichLayerList,
      queryItem
    );
  };
  this.addREST = function (
    tileURLFunction,
    name,
    visible,
    maxZoom,
    helpBox,
    whichLayerList
  ) {
    addRESTToMap(
      tileURLFunction,
      name,
      visible,
      maxZoom,
      helpBox,
      whichLayerList
    );
  };
  this.addExport = function (
    eeImage,
    name,
    res,
    Export,
    metadataParams,
    noDataValue
  ) {
    addExport(eeImage, name, res, Export, metadataParams, noDataValue);
  };
  this.addPlot = function (nameLngLat) {
    addPlot(nameLngLat);
  };
  this.addFeatureView = function (
    assetId,
    visParams,
    name,
    visible,
    maxZoom,
    helpBox,
    whichLayerList
  ) {
    addFeatureView(
      assetId,
      visParams,
      name,
      visible,
      maxZoom,
      helpBox,
      whichLayerList
    );
  };
  this.centerObject = function (fc, async = true, callback) {
    centerObject(fc, async, callback);
  };
  this.setCenter = function (lng, lat, zoom) {
    centerMap(lng, lat, zoom);
  };
  this.setTitle = function (title) {
    $("#title-banner").html(title);
    document.title = title;
  };
  this.turnOnInspector = function () {
    let activeTools = getActiveTools();
    if (activeTools.indexOf("Pixel Tools-Query Visible Map Layers") == -1) {
      $("#query-label").click();
    }
  };
  this.turnOffInspector = function () {
    let activeTools = getActiveTools();
    if (activeTools.indexOf("Pixel Tools-Query Visible Map Layers") > -1) {
      $("#query-label").click();
    }
  };
  this.turnOnAutoAreaCharting = function () {
    let activeTools = getActiveTools();
    if (activeTools.indexOf("Area Tools-Map Extent Area Tool") == -1) {
      $("#map-defined-area-chart-label").click();
    }
  };
  this.turnOffAutoAreaCharting = function () {
    let activeTools = getActiveTools();
    if (activeTools.indexOf("Area Tools-Map Extent Area Tool") > -1) {
      $("#map-defined-area-chart-label").click();
    }
  };
  this.turnOnUserDefinedAreaCharting = function () {
    let activeTools = getActiveTools();
    if (activeTools.indexOf("Area Tools-User Defined Area Tool") == -1) {
      $("#user-defined-area-chart-label").click();
    }
  };
  this.turnOffUserDefinedAreaCharting = function () {
    let activeTools = getActiveTools();
    if (activeTools.indexOf("Area Tools-User Defined Area Tool") > -1) {
      $("#user-defined-area-chart-label").click();
    }
  };
  this.turnOnSelectionAreaCharting = function () {
    let activeTools = getActiveTools();
    if (activeTools.indexOf("Area Tools-Select an Area on map") == -1) {
      $("#select-area-interactive-chart-label").click();
    }
  };
  this.turnOffSelectionAreaCharting = function () {
    let activeTools = getActiveTools();
    if (activeTools.indexOf("Area Tools-Select an Area on map") > -1) {
      $("#select-area-interactive-chart-label").click();
    }
  };
  this.turnOnTimeSeriesCharting = function () {
    let activeTools = getActiveTools();
    if (activeTools.indexOf(`Pixel Tools-Query ${mode} Time Series`) == -1) {
      $("#pixel-chart-label").click();
    }
  };
  this.turnOffTimeSeriesCharting = function () {
    let activeTools = getActiveTools();
    if (activeTools.indexOf(`Pixel Tools-Query ${mode} Time Series`) > -1) {
      $("#pixel-chart-label").click();
    }
  };
  this.setQueryCRS = function (newCrs) {
    crs = newCrs;
  };
  this.setQueryScale = function (newScale) {
    transform = null;
    scale = newScale;
    plotRadius = newScale / 2;
  };
  this.setQueryTransform = function (newTransform) {
    scale = null;
    transform = newTransform;
    plotRadius = transform[0] / 2;
  };
  this.setQueryPrecision = function (
    newChartPrecision = 3,
    newChartDecimalProportion = 0.25
  ) {
    chartPrecision = newChartPrecision;
    chartDecimalProportion = newChartDecimalProportion;
  };
  this.setQueryDateFormat = function (newDefaultQueryDateFormat) {
    defaultQueryDateFormat = newDefaultQueryDateFormat;
  };
  this.setQueryBoxColor = function (color) {
    if (isHexColor(color) && color[0] !== "#") {
      color = "#" + color;
    }

    clickBoundsColor = color;
  };
  this.canReorderLayers = true;
  this.showSpinner = function () {
    $("#summary-spinner").show();
  };
  this.hideSpinner = function () {
    $("#summary-spinner").hide();
  };

  this.turnOffLayersWhenTimeLapseIsOn = true;
}

const Map2 = new mp();
Object.keys(Map2).map((k) => (Map[k] = Map2[k]));

if (urlParams.addLayer === "false" || urlParams.addLayer === false) {
  Object.keys(Map2)
    .filter((k) => k.indexOf("add") > -1)
    .map((k) => {
      Map2[k] = function () {};
    });
  Object.keys(Map)
    .filter((k) => k.indexOf("add") > -1)
    .map((k) => {
      Map[k] = function () {};
    });
}

////////////////////////////////////////////////////////////////////////
//Some helper functions
function sleep(delay) {
  const start = new Date().getTime();
  while (new Date().getTime() < start + delay);
}
function stringToBoolean(string) {
  switch (string.toLowerCase().trim()) {
    case "true":
    case "yes":
    case "1":
      return true;
    case "false":
    case "no":
    case "0":
    case null:
      return false;
    default:
      return Boolean(string);
  }
}
////////////////////////////////////////////////////////////////////////
function setGEERunID() {
  geeRunID = new Date().getTime();
}
////////////////////////////////////////////////////////////////////////
//Function to rerun all GEE code
//Clears out current map, exports, and legends and then reruns
function reRun() {
  // $('#summary-spinner').show();
  if (staticTemplates.loadingModal[mode] === undefined) {
    if (mode === "MTBS") {
      showMessage(
        "",
        staticTemplates.loadingModal["all"]("mtbs-logo.png", "Updating")
      );
    } else if (
      mode === "STORM" ||
      mode === "Bloom-Mapper" ||
      mode === "sequoia-view" ||
      mode === "HiForm-BMP"
    ) {
      showMessage("", staticTemplates.loadingModal["all"]("", "Updating"));
    } else {
      showMessage(
        "",
        staticTemplates.loadingModal["all"]("lcms-icon.png", "Updating")
      );
    }
  } else {
    showMessage("Loading Updated Layers", staticTemplates.loadingModal[mode]);
  }

  // Retain transition rows
  urlParams.transitionChartingYears = getTransitionRowData(false);

  setGEERunID();

  //Clean out current map, legend, etc
  clearSelectedAreas();
  clearUploadedAreas();
  layerChildID = 0;
  layerCount = 0;
  geeTileLayersDownloading = 0;
  updateGEETileLayersLoading();

  stopTimeLapse();
  queryObj = {};
  areaChartCollections = {};
  pixelChartCollections = {};
  timeLapseObj = {};
  dashboardObj = {};
  intervalPeriod = 666.6666666;
  timeLapseID = null;
  urlParams.timeLapseFrame = 0;
  cumulativeMode = urlParams.cumulativeMode;
  NEXT_LAYER_ID = 1;
  clearSelectedAreas();
  selectedFeaturesGeoJSON = {};
  [
    "layer-list",
    "reference-layer-list",
    "area-charting-select-layer-list",
    "fhp-div",
    "time-lapse-legend-list",
    "related-layer-list",
    "county-selection-layer-list",
  ].map(function (l) {
    $("#" + l).empty();
    $("#legend-" + l).empty();
  });

  $("#export-list").empty();
  Object.values(featureObj).map(function (f) {
    f.setMap(null);
  });
  featureObj = {};

  map.overlayMapTypes.clear();
  refreshNumber++;

  exportImageDict = {};
  try {
    clearDownloadDropdown();
  } catch (err) {}
  try {
    areaChart.clearLayers();
  } catch (err) {}
  google.maps.event.clearListeners(mapDiv, "click");

  //Rerun the GEE code
  setTimeout(function () {
    run();
    if (mode !== "lcms-dashboard") {
      $(".modal").modal("hide");
      $(".modal-backdrop").remove();
    }

    setupAreaLayerSelection();
    smartAddLabelOverlay();

    if (areaChart.autoChartingOn === true) {
      areaChart.chartMapExtent("", true);
    }
  }, 1500);
}
////////////////////////////////////////////////////////////////////////
// Taken from: https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const out = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return out;
  };
}
const randomN = mulberry32(1);
////////////////////////////
// Function to handle adding a hash before a hex color or add nothing if it's a color name
function isHexColor(color, regexp = /^[0-9a-fA-F]+$/) {
  return regexp.test(color);
}
function addColorHash(color) {
  if (isHexColor(color)) {
    return `#${color}`;
  } else {
    return color;
  }
}
////////////////////////////
function getRandomInt(min, max) {
  return Math.floor(randomN() * (max - min + 1)) + min;
}
function padLeft(nr, n, str) {
  return Array(n - String(nr).length + 1).join(str || "0") + nr;
}
function rgbToHex(r, g, b) {
  if (typeof r == "object") {
    const colors = r;
    r = colors[0];
    g = colors[1];
    b = colors[2];
  }
  return "#" + ("00000" + ((r << 16) | (g << 8) | b).toString(16)).slice(-6);
}

function qcHex(hex) {
  if (hex.indexOf("#") === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + "FF";
  } else if (hex.length === 4) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  } else if (hex.length === 6) {
    hex = `${hex}FF`;
  }
  return hex;
}
//Taken from: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
  let result;
  hex = qcHex(hex);
  result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: parseInt(result[4], 16),
      }
    : null;
}
function blendColors(color1, color2, weight = 0.5) {
  // Convert the hex colors to RGB values.
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  console.log(color1);
  console.log(color2);
  console.log(rgb1);
  console.log(rgb2);
  // Calculate the blended RGB values.
  const blendedRgb = {
    r: rgb1.r * weight + rgb2.r * (1 - weight),
    g: rgb1.g * weight + rgb2.g * (1 - weight),
    b: rgb1.b * weight + rgb2.b * (1 - weight),
  };

  // Convert the blended RGB values to a hex color.
  return rgbToHex(blendedRgb.r, blendedRgb.g, blendedRgb.b);
}
function offsetColor(hex, offset) {
  obj = hexToRgb(hex);
  obj.r = (obj.r + offset) % 255;
  obj.g = (obj.g + offset) % 255;
  obj.b = (obj.b + offset) % 255;
  return rgbToHex(obj.r, obj.g, obj.b);
}
function invertColor(hex) {
  if (hex.indexOf("#") === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error("Invalid HEX color.");
  }
  // invert color components
  const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
    g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
    b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
  // pad each with zeros and return
  return "#" + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
  len = len || 2;
  const zeros = new Array(len).join("0");
  return (zeros + str).slice(-len);
}
function randomColor(mins = [100, 100, 100], maxes = [200, 200, 255]) {
  const r = getRandomInt(mins[0], maxes[0]);
  const g = getRandomInt(mins[1], maxes[1]);
  const b = getRandomInt(mins[2], maxes[2]);
  const c = rgbToHex(r, g, b);
  return c;
}
function getChartColor() {
  const color = chartColors[chartColorI % chartColors.length];
  chartColorI++;
  return color;
}
function randomRGBColor() {
  const r = getRandomInt(100, 225);
  const g = getRandomInt(100, 225);
  const b = getRandomInt(100, 225);

  return [r, g, b];
}
function randomColors(n) {
  const out = [];
  while (n > 0) {
    out.push(randomColor());
    n = n - 1;
  }
  return out;
}
//////////////////////////////////
// Get a linearly interpolated color ramp of n colors
function linear_gradient(start_hex, finish_hex = "#FFFFFF", n = 10) {
  // returns a gradient list of (n) colors between
  // two hex colors. start_hex and finish_hex
  // should be the full six-digit color string,
  // inlcuding the number sign ("#FFFFFF")
  // Starting and ending colors in RGB form
  s = Object.values(hexToRgb(start_hex));
  f = Object.values(hexToRgb(finish_hex));

  // Initilize a list of the output colors with the starting color
  RGB_list = [s];
  // Calcuate a color at each evenly spaced value of t from 1 to n
  range(1, n).map((t) => {
    // Interpolate RGB vector for color at the current value of t

    curr_vector = range(0, 3).map((j) => {
      return parseInt(s[j] + (parseFloat(t) / (n - 1)) * (f[j] - s[j]));
    });
    // Add it to our list of output colors
    RGB_list.push(curr_vector);
  });
  let hex_list = RGB_list.map(rgbToHex);

  return hex_list;
}
// Get 1 or more gradients between pairs of given colors for a total of n colors
function polylinear_gradient(colors, n) {
  // returns a list of colors forming linear gradients between
  // all sequential pairs of colors. "n" specifies the total
  // number of desired output colors
  // The number of colors per individual linear gradient
  n_out = parseInt(parseFloat(n) / (colors.length - 1)) + 1;

  // If we don't have an even number of color values, we will remove equally spaced values at the end.
  apply_offset = false;
  if (n % n_out !== 0) {
    apply_offset = true;
    n_out = n_out + 1;
  }

  // returns dictionary defined by color_dict()
  gradient_dict = linear_gradient(colors[0], colors[1], n_out);

  if (colors.length > 2) {
    range(1, colors.length - 1).map((col) => {
      next = linear_gradient(colors[col], colors[col + 1], n_out).slice(1);
      gradient_dict = gradient_dict.concat(next);

      // Exclude first point to avoid duplicates
    });
  }

  // // Remove equally spaced values here.
  if (apply_offset === true) {
    offset = gradient_dict.length - n;
    sliceval = [];

    range(1, offset + 1).map((i) =>
      sliceval.push(
        parseInt((gradient_dict.length * i) / parseFloat(offset + 2))
      )
    );

    let out = [];
    for (const [index, element] of gradient_dict.entries()) {
      if (sliceval.indexOf(index) === -1) {
        out.push(element);
      }
    }
    gradient_dict = out;
  }
  return gradient_dict;
}
// Get a linearly interpolated set of colors from a given set of colors, spanning between a min and max (inclusive)
function get_poly_gradient_ct(palette, min, max) {
  // Take a palette and a set of min and max stretch values to get a 1:1 value to color hex list

  // Args:
  //     palette (list): A list of hex code colors that will be interpolated

  //     min (int): The min value for the stretch

  //     max (int): The max value for the stretch

  // Returns:
  //     list: A list of linearly interpolated hex codes where there is 1:1 color to value from min-max (inclusive)

  ramp = polylinear_gradient(palette, max - min + 1);
  return ramp;
}

//////////////////////////////////
//Taken from: https://sashat.me/2017/01/11/list-of-20-simple-distinct-colors/
const colorList = [
  "#e6194b",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#46f0f0",
  "#f032e6",
  "#bcf60c",
  "#fabebe",
  "#008080",
  "#e6beff",
  "#9a6324",
  "#fffac8",
  "#800000",
  "#aaffc3",
  "#808000",
  "#ffd8b1",
  "#000075",
  "#808080",
  "#ffffff",
  "#000000",
];
let colorMod = colorList.length;
function getColor() {
  const currentColor = colorList[colorMod % colorList.length];
  colorMod++;
  return currentColor;
}
//Taken from: https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function LightenDarkenColor(col, amt) {
  let usePound = false;
  if (col[0] == "#") {
    col = col.slice(1);
    usePound = true;
  }
  const num = parseInt(col, 16);

  let r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  let b = ((num >> 8) & 0x00ff) + amt;

  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  let g = (num & 0x0000ff) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}
/////////////////////////////////////////////////////
//Area measurement
function startArea() {
  if (polyOn === false) {
    polyOn = true;
  }
  areaPolygonOptions.polyNumber = polyNumber;
  map.setOptions({ draggableCursor: "crosshair" });
  map.setOptions({ disableDoubleClickZoom: true });
  // Construct the polygon.
  areaPolygonObj[polyNumber] = new google.maps.Polyline(areaPolygonOptions);
  areaPolygonObj[polyNumber].setMap(map);

  updateArea = function () {
    let unitName;
    let unitMultiplier;
    const keys = Object.keys(areaPolygonObj);

    let totalArea = 0;
    let totalWithArea = 0;
    let outString = "";
    function areaWrapper(key) {
      const pathT = areaPolygonObj[key].getPath().getArray();

      if (pathT.length > 0) {
        clickCoords = clickLngLat;

        area = google.maps.geometry.spherical.computeArea(
          areaPolygonObj[key].getPath()
        );

        const unitNames = unitNameDict[metricOrImperialArea].area;
        const unitMultipliers = unitMultiplierDict[metricOrImperialArea].area;
        if (area > 0) {
          totalWithArea++;
        }
        totalArea = totalArea + area;

        if (totalArea >= 1000) {
          unitName = unitNames[1];
          unitMultiplier = unitMultipliers[1];
        } else {
          unitName = unitNames[0];
          unitMultiplier = unitMultipliers[0];
        }
      }
    }
    keys.map(areaWrapper);
    const pixelProp = totalArea / 9;

    totalArea = totalArea * unitMultiplier;
    totalArea = totalArea.formatNumber();
    let polyString = "polygon";
    if (keys.length > 1) {
      polyString = "polygons";
    }
    let areaContent =
      totalWithArea.toString() +
      " " +
      polyString +
      " <br>" +
      totalArea +
      " " +
      unitName;
    if (mode === "Ancillary") {
      areaContent += "<br>" + pixelProp.formatNumber() + " % pixel";
    }
    infowindow.setContent(areaContent);
    infowindow.setPosition(clickCoords);

    infowindow.open(map);
    $(".gm-ui-hover-effect").hide();
  };

  startListening();
}
function setToPolygon(id) {
  if (id == undefined || id == null) {
    id = polyNumber;
  }
  console.log("Setting " + id.toString() + " to polygon");
  areaPolygonOptions.strokeColor = areaPolygonObj[id].strokeColor;
  const path = areaPolygonObj[id].getPath();
  areaPolygonObj[id].setMap(null);
  areaPolygonObj[id] = new google.maps.Polygon(areaPolygonOptions);
  areaPolygonObj[id].setPath(path);
  areaPolygonObj[id].setMap(map);
}
function setToPolyline(id) {
  if (id == undefined || id == null) {
    id = polyNumber;
  }
  areaPolygonOptions.strokeColor = areaPolygonObj[id].strokeColor;
  const path = areaPolygonObj[polyNumber].getPath();
  areaPolygonObj[id].setMap(null);
  areaPolygonObj[id] = new google.maps.Polyline(areaPolygonOptions);
  areaPolygonObj[id].setPath(path);
  areaPolygonObj[id].setMap(map);
}

//Start listening for area measuring
function startListening() {
  mapHammer = new Hammer(document.getElementById("map"));

  mapHammer.on("tap", function (event) {
    const path = areaPolygonObj[polyNumber].getPath();
    const x = event.center.x;
    const y = event.center.y;
    clickLngLat = point2LatLng(x, y);
    path.push(clickLngLat);
    updateArea();
  });
  mapHammer.on("doubletap", function () {
    setToPolygon();
    resetPolygon();
  });

  google.maps.event.addListener(
    areaPolygonObj[polyNumber],
    "click",
    updateArea
  );
  google.maps.event.addListener(
    areaPolygonObj[polyNumber],
    "mouseup",
    updateArea
  );
  google.maps.event.addListener(
    areaPolygonObj[polyNumber],
    "dragend",
    updateArea
  );
  google.maps.event.addListener(
    areaPolygonObj[polyNumber].getPath(),
    "set_at",
    updateArea
  );

  window.addEventListener("keydown", resetPolys);
  window.addEventListener("keydown", deleteLastAreaVertex);
}
//Clear and restart area measuring
function resetPolys(e) {
  if (
    e === undefined ||
    e.key === "Delete" ||
    e.key === "d" ||
    e.key === "Backspace"
  ) {
    stopArea();
    startArea();
  }
}
//Undo last vertex
function undoAreaMeasuring() {
  if (areaPolygonObj[polyNumber].getPath().length > 0) {
    areaPolygonObj[polyNumber].getPath().pop(1);
    updateArea();
  } else if (polyNumber > 1) {
    stopListening();
    polyNumber = polyNumber - 1;
    setToPolyline();
    startListening();
  }
}
function undoDistanceMeasuring() {
  distancePolyline.getPath().pop(1);
  updateDistance();
}
function deleteLastAreaVertex(e) {
  if (e.key == "z" && e.ctrlKey) {
    undoAreaMeasuring();
  }
}
function deleteLastDistanceVertex(e) {
  if (e.key == "z" && e.ctrlKey) {
    undoDistanceMeasuring();
  }
}
function activatePoly(poly) {
  console.log(poly.polyNumber);
}
function stopListening() {
  try {
    mapHammer.destroy();
    google.maps.event.clearListeners(areaPolygonObj[polyNumber], "dblclick");
    google.maps.event.clearListeners(areaPolygonObj[polyNumber], "click");
    google.maps.event.clearListeners(mapDiv, "click");
    google.maps.event.clearListeners(areaPolygonObj[polyNumber], "mouseup");
    google.maps.event.clearListeners(areaPolygonObj[polyNumber], "dragend");
    window.removeEventListener("keydown", resetPolys);
    window.removeEventListener("keydown", deleteLastAreaVertex);
  } catch (err) {}
}
function clearPoly(id) {
  areaPolygonObj[id].setMap(null);
  areaPolygonObj[id].setPath([]);
  updateArea();
  google.maps.event.clearListeners(areaPolygonObj[id], "click");
}
function clearPolys() {
  stopListening();
  const keys = Object.keys(areaPolygonObj);
  keys.map(function (k) {
    areaPolygonObj[k].setMap(null);
  });
  areaPolygonObj = {};
  polyNumber = 1;
  polyOn = false;
}
function stopArea() {
  try {
    mapHammer.destroy();
  } catch (err) {}
  map.setOptions({ disableDoubleClickZoom: true });

  clearPolys();
  infowindow.setMap(null);
  map.setOptions({ draggableCursor: "" });
}

function resetPolygon() {
  stopListening();
  const keys = Object.keys(areaPolygonObj);
  const lastKey = keys[keys.length - 1];
  console.log("last key " + lastKey.toString());
  polyNumber = parseInt(lastKey);
  polyNumber++;
  startArea();
}
function newPolygon() {
  stopArea();
}
///////////////////////////////////////////////////////////////////////////////////
//Distance measuring functions
function startDistance() {
  map.setOptions({ draggableCursor: "crosshair" });
  try {
    distancePolyline.destroy();
  } catch (err) {}

  distancePolyline = new google.maps.Polyline(distancePolylineOptions);
  distancePolyline.setMap(map);
  map.setOptions({ disableDoubleClickZoom: true });

  google.maps.event.addListener(distancePolyline, "click", updateDistance);
  mapHammer = new Hammer(document.getElementById("map"));
  mapHammer.on("doubletap", resetPolyline);
  mapHammer.on("tap", function (event) {
    const x = event.center.x;
    const y = event.center.y;
    const path = distancePolyline.getPath();
    clickLngLat = point2LatLng(x, y);
    path.push(clickLngLat);
    updateDistance();
  });
  google.maps.event.addListener(distancePolyline, "mouseup", updateDistance);
  google.maps.event.addListener(distancePolyline, "dragend", updateDistance);
  google.maps.event.addListener(
    distancePolyline.getPath(),
    "set_at",
    updateDistance
  );
  window.addEventListener("keydown", deleteLastDistanceVertex);
  window.addEventListener("keydown", resetPolyline);
}

function stopDistance() {
  try {
    window.removeEventListener("keydown", deleteLastDistanceVertex);
    window.removeEventListener("keydown", resetPolyline);
    mapHammer.destroy();
    map.setOptions({ disableDoubleClickZoom: true });
    google.maps.event.clearListeners(distancePolyline, "click");
    google.maps.event.clearListeners(mapDiv, "click");
    google.maps.event.clearListeners(distancePolyline, "mouseup");
    google.maps.event.clearListeners(distancePolyline, "dragend");
    if (infowindow != undefined) {
      infowindow.setMap(null);
    }
    distancePolyline.setMap(null);
    map.setOptions({ draggableCursor: "" });
    infowindow.setMap(null);
  } catch (err) {}
}
function resetPolyline(e) {
  if (
    e === undefined ||
    e.key === undefined ||
    e.key == "Delete" ||
    e.key == "d" ||
    e.key == "Backspace"
  ) {
    stopDistance();
    startDistance();
  }
}
updateDistance = function () {
  distance = google.maps.geometry.spherical.computeLength(
    distancePolyline.getPath()
  );
  const pathT = distancePolyline.getPath().j;
  clickCoords = clickLngLat; //pathT[pathT.length-1];
  const unitNames = unitNameDict[metricOrImperialDistance].distance;
  const unitMultipliers = unitMultiplierDict[metricOrImperialDistance].distance;
  let unitName, unitMultiplier;
  if (distance >= 1000) {
    unitName = unitNames[1];
    unitMultiplier = unitMultipliers[1];
  } else {
    unitName = unitNames[0];
    unitMultiplier = unitMultipliers[0];
  }
  distance = distance * unitMultiplier;
  if (distance >= 0) {
    const distanceContent = distance.formatNumber() + " " + unitName;
    infowindow.setContent(distanceContent);
    infowindow.setPosition(clickCoords);

    infowindow.open(map);
    $(".gm-ui-hover-effect").hide();
  }
};

////////////////////////////////////////////////////////////////
//Setup drag box selection object
function addDragBox() {
  const dragBox = {};
  dragBox.polygon = new google.maps.Polygon({
    strokeColor: "#FF0",
    fillColor: "#0DD",
    fillOpacity: 0,
    strokeOpacity: 1,
    strokeWeight: 1.5,
    zIndex: 999,
  });
  dragBox.setColor = function (color) {
    dragBox.polygon.setOptions({
      strokeColor: color,
    });
  };
  dragBox.onStartFunctions = [];
  dragBox.onStopFunctions = [];
  dragBox.addOnStartFunction = function (fun) {
    dragBox.onStartFunctions.push(fun);
  };
  dragBox.addOnStopFunction = function (fun) {
    dragBox.onStopFunctions.push(fun);
  };
  dragBox.listeners = { click: [], mousemove: [] };
  dragBox.dragBoxPath = [];
  dragBox.clickI = 0;
  dragBox.startDragBoxLocation, dragBox.currentDragLocation;
  dragBox.stop = function (e) {
    dragBox.listeners.mousemove.map((e) => google.maps.event.removeListener(e));
    dragBox.listeners.mousemove = [];
    if (dragBox.polygon.getPath().getArray().length === 0) {
      dragBox.start();
    } else {
      dragBox.onStopFunctions.map((fun) => fun());
    }
  };
  dragBox.expand = function (e) {
    dragBox.currentDragLocation = { lng: e.latLng.lng(), lat: e.latLng.lat() };
    let second = {
      lng: dragBox.startDragBoxLocation.lng,
      lat: dragBox.currentDragLocation.lat,
    };
    let fourth = {
      lat: dragBox.startDragBoxLocation.lat,
      lng: dragBox.currentDragLocation.lng,
    };
    dragBox.dragBoxPath = [
      dragBox.startDragBoxLocation,
      second,
      dragBox.currentDragLocation,
      fourth,
    ];
    dragBox.polygon.setPath(dragBox.dragBoxPath);
  };
  dragBox.start = function (e) {
    dragBox.onStartFunctions.map((fun) => fun());
    dragBox.polygon.setMap(null);
    dragBox.startDragBoxLocation = { lng: e.latLng.lng(), lat: e.latLng.lat() };
    dragBox.polygon.setPath([
      dragBox.startDragBoxLocation,
      dragBox.startDragBoxLocation,
      dragBox.startDragBoxLocation,
    ]);
    dragBox.polygon.setMap(map);

    Object.keys(dragBox.listenTo).map((k) => {
      dragBox.listeners.mousemove.push(
        google.maps.event.addListener(
          dragBox.listenTo[k],
          "mousemove",
          dragBox.expand
        )
      );
    });
  };
  dragBox.click = function (e) {
    if (
      mode !== "lcms-dashboard" ||
      dashboardAreaSelectionMode === "Drag-Box"
    ) {
      if (dragBox.clickI % 2 === 0) {
        dragBox.start(e);
      } else {
        dragBox.stop(e);
      }
      dragBox.clickI++;
    }
  };
  dragBox.listenTo = { box: dragBox.polygon };
  dragBox.addListenTo = function (obj, nm) {
    dragBox.listenTo[nm] = obj;
  };
  dragBox.startListening = function () {
    Object.keys(dragBox.listenTo).map((k) => {
      dragBox.listeners.click.push(
        google.maps.event.addListener(
          dragBox.listenTo[k],
          "click",
          dragBox.click
        )
      );
    });
  };
  dragBox.stopListening = function (hide = true) {
    if (hide) {
      dragBox.polygon.setMap(null);
    }

    dragBox.listeners.click.map((e) => google.maps.event.removeListener(e));
    dragBox.listeners.mousemove.map((e) => google.maps.event.removeListener(e));
    dragBox.listeners = { click: [], mousemove: [] };
  };
  dragBox.getEEBox = function () {
    return googleMapPolygonToGEEPolygon(dragBox.polygon);
  };
  return dragBox;
}
function googleMapPolygonToGEEPolygon(googleMapPolygon) {
  let path = googleMapPolygon.getPath().getArray();
  path = path.map(function (p) {
    return [p.lng(), p.lat()];
  });
  const geePolygon = ee.FeatureCollection([
    ee.Feature(ee.Geometry.Polygon(path)),
  ]);

  return geePolygon;
}
// ////////////////////////////////////////////////////////////////
// //Setup study areas and run functions
// function dropdownUpdateStudyArea(whichOne) {
//   $("#summary-spinner").show();
//   resetStudyArea(whichOne);
//   const coords = studyAreaDict[whichOne].center;
//   centerMap(coords[1], coords[0], coords[2]);
//   if (mode === "Ancillary") {
//     run = runAncillary;
//   } else if (mode === "LT") {
//     run = runLT;
//   } else if (
//     mode === "LCMS" ||
//     (mode === "LCMS-pilot" && studyAreaDict[longStudyAreaName].isPilot == false)
//   ) {
//     run = runGTAC;
//     run = function () {};
//   } else if (mode === "LCMS-pilot") {
//     run = runUSFS;
//   } else if (mode === "STORM") {
//     run = runStorm;
//   } else if (mode === "LAMDA") {
//     run = runLAMDA;
//   } else if (mode === "TreeMap") {
//     run = runTreeMap;
//   } else if (mode === "lcms-base-learner") {
//     run = runBaseLearner;
//   } else if (mode === "sequoia-view") {
//     run = runSequoia;
//   } else if (mode === "HiForm-BMP") {
//     run = runHiForm;
//   } else if (studyAreaName === "CONUS") {
//     run = runCONUS;
//   } else {
//     run = runUSFS;
//   }

//   reRun();
// }
// //Function to set study area
// const resetStudyArea = function (whichOne) {
//   localStorage.setItem("cachedStudyAreaName", whichOne);
//   urlParams.studyAreaName = whichOne;
//   $("#studyAreaDropdown").val(whichOne);
//   $("#study-area-label").text(whichOne);
//   console.log("changing study area");
//   console.log(whichOne);
//   lowerThresholdDecline = studyAreaDict[whichOne].lossThresh;
//   if (
//     studyAreaDict[whichOne].lossSlowThresh !== undefined &&
//     studyAreaDict[whichOne].lossSlowThresh !== null
//   ) {
//     lowerThresholdSlowLoss = studyAreaDict[whichOne].lossSlowThresh;
//   } else {
//     lowerThresholdSlowLoss = lowerThresholdDecline;
//   }
//   if (
//     studyAreaDict[whichOne].lossFastThresh !== undefined &&
//     studyAreaDict[whichOne].lossFastThresh !== null
//   ) {
//     lowerThresholdFastLoss = studyAreaDict[whichOne].lossFastThresh;
//   } else {
//     lowerThresholdFastLoss = lowerThresholdDecline;
//   }

//   upperThresholdDecline = 1;
//   upperThresholdSlowLoss = 1;
//   upperThresholdFastLoss = 1;
//   lowerThresholdRecovery = studyAreaDict[whichOne].gainThresh;
//   upperThresholdRecovery = 1;

//   startYear = studyAreaDict[whichOne].startYear;
//   endYear = studyAreaDict[whichOne].endYear;

//   setUpRangeSlider(
//     "lowerThresholdDecline",
//     0,
//     1,
//     lowerThresholdDecline,
//     0.05,
//     "decline-threshold-slider",
//     "null"
//   );
//   setUpRangeSlider(
//     "lowerThresholdRecovery",
//     0,
//     1,
//     lowerThresholdRecovery,
//     0.05,
//     "recovery-threshold-slider",
//     "null"
//   );

//   setUpRangeSlider(
//     "lowerThresholdSlowLoss",
//     0,
//     1,
//     lowerThresholdSlowLoss,
//     0.05,
//     "slow-loss-threshold-slider",
//     "null"
//   );
//   setUpRangeSlider(
//     "lowerThresholdFastLoss",
//     0,
//     1,
//     lowerThresholdFastLoss,
//     0.05,
//     "fast-loss-threshold-slider",
//     "null"
//   );

//   setUpDualRangeSlider(
//     "urlParams.startYear",
//     "urlParams.endYear",
//     minYear,
//     maxYear,
//     urlParams.startYear,
//     urlParams.endYear,
//     1,
//     "analysis-year-slider",
//     "analysis-year-slider-update",
//     "null"
//   );

//   const coords = studyAreaDict[whichOne].center;
//   studyAreaName = studyAreaDict[whichOne].name;
//   if (studyAreaName === "CONUS") {
//     run = runCONUS;
//   } else if (
//     mode === "LCMS" ||
//     (mode === "LCMS-pilot" && studyAreaDict[longStudyAreaName].isPilot == false)
//   ) {
//     run = runGTAC;
//   } else {
//     run = runUSFS;
//   }
//   if (studyAreaDict[whichOne].addFastSlow) {
//     $("#fast-slow-threshold-container").show();
//   } else {
//     $("#fast-slow-threshold-container").hide();
//   }
//   if (studyAreaDict[whichOne].addGainThresh) {
//     $("#recovery-threshold-slider-container").show();
//   } else {
//     $("#recovery-threshold-slider-container").hide();
//   }
//   $("#export-crs").val(studyAreaDict[whichOne].crs);
// };
///////////////////////////////////////////////////////////
//Taken from https://developers.google.com/maps/documentation/javascript/examples/places-searchbox
function initSearchBox() {
  // Create the search box and link it to the UI element.
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", function () {
    searchBox.setBounds(map.getBounds());
  });

  let markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", function () {
    const places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function (marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    let bounds = new google.maps.LatLngBounds();
    const formattedAddresses = [];
    places.forEach(function (place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      formattedAddresses.push(place.formatted_address);
      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25),
      };

      // Create a marker for each place.
      markers.push(
        new google.maps.Marker({
          map: map,
          icon: icon,
          title: place.name,
          position: place.geometry.location,
        })
      );

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    const boundsBounds = {
      south: [-85, 85],
      west: [-179, 179],
      north: [-85, 85],
      east: [-179, 179],
    };

    bounds = bounds.toJSON();

    Object.keys(bounds).map(function (key) {
      const coord = bounds[key];
      const min = boundsBounds[key][0];
      const max = boundsBounds[key][1];
      if (coord < min) {
        bounds[key] = min;
        showMessage(
          "Search coords tip!",
          "Search coords format is lat lng (e.g. 45 -111)"
        );
      }
      if (coord > max) {
        bounds[key] = max;
        showMessage(
          "Search coords tip!",
          "Search coords format is lat lng (e.g. 45 -111)"
        );
      }
    });
    console.log(bounds);
    console.log(formattedAddresses.join(","));
    ga(
      "send",
      "event",
      "places-search",
      JSON.stringify(bounds),
      formattedAddresses.join(",")
    );
    map.fitBounds(bounds);
  });
}
/////////////////////////////////////////////////////////////////
//Set up info window
function getInfoWindow(xOffset, yOffset) {
  if (xOffset == null || xOffset === undefined) {
    xOffset = 30;
  }
  if (yOffset == null || yOffset === undefined) {
    yOffset = -30;
  }
  return new google.maps.InfoWindow({
    content: "",
    maxWidth: 300,
    pixelOffset: new google.maps.Size(xOffset, yOffset, "rem", "rem"),
    close: false,
  });
}
//Functions for tracking views and going forward and backward map views
function trackView() {
  if (updateViewList) {
    viewList = viewList.slice(0, viewIndex);
    viewList.push({
      lng: urlParams.lng,
      lat: urlParams.lat,
      zoom: urlParams.zoom,
    });
    viewIndex = viewList.length;
    checkViewIndex();
  }
}
//See if there are any remaining views
function checkViewIndex() {
  if (viewIndex <= 1) {
    viewIndex = 1;
    $("#back-view-button").prop("disabled", true);
  } else {
    $("#back-view-button").prop("disabled", false);
  }

  if (viewIndex >= viewList.length) {
    viewIndex = viewList.length;
    $("#forward-view-button").prop("disabled", true);
  } else {
    $("#forward-view-button").prop("disabled", false);
  }
}
function setView(view) {
  updateViewList = false;
  map.setCenter(view);
  map.setZoom(view.zoom);
}
function backView() {
  viewIndex--;
  checkViewIndex();
  setView(viewList[viewIndex - 1]);
}
function forwardView() {
  viewIndex++;
  checkViewIndex();
  setView(viewList[viewIndex - 1]);
}
////////////////////////////////////////////////////////////////
// Create an overlay to display map labels only
let labelOverlayAdded = false;
function addLabelOverlay() {
  map.overlayMapTypes.setAt(Object.keys(layerObj).length, labelsMapType);
  labelOverlayAdded = true;
}
function removeLabelOverlay() {
  map.overlayMapTypes.removeAt(Object.keys(layerObj).length);
  labelOverlayAdded = false;
}
function smartAddLabelOverlay() {
  if (urlParams.addLabelOverlay !== false) {
    if (map.mapTypeId === "satellite") {
      removeLabelOverlay();
    } else {
      addLabelOverlay();
    }
  }
}
function toggleLabelOverlay() {
  if (labelOverlayAdded) {
    removeLabelOverlay();
  } else {
    addLabelOverlay();
  }
}
let labelsMapType;
let geeAuthenticated = false;
//Initialize map
function initialize() {
  labelsMapType = new google.maps.StyledMapType([
    {
      elementType: "geometry.fill",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      elementType: "geometry.stroke",
      stylers: [
        {
          weight: 0.01,
        },
      ],
    },
  ]);

  const mapTypeIds = ["roadmap", "satellite", "hybrid", "terrain"];
  if (
    urlParams.mapTypeId === undefined ||
    (urlParams.mapTypeId === null &&
      urlParams.mapTypeId.indexOf(urlParams.mapTypeIds) === -1)
  ) {
    urlParams.mapTypeId = "hybrid";
  }
  //Set up map options
  const mapOptions = {
    center: null,
    zoom: null,
    minZoom: 2,
    disableDefaultUI: false,
    disableDoubleClickZoom: true,
    mapTypeId: urlParams.mapTypeId,
    streetViewControl: true,
    fullscreenControl: false,
    mapTypeControlOptions: {
      position: google.maps.ControlPosition.TOP_RIGHT,
      mapTypeIds: mapTypeIds,
    },

    streetViewControlOptions: {
      position: google.maps.ControlPosition.RIGHT_TOP,
    },
    scaleControlOptions: { position: google.maps.ControlPosition.RIGHT_TOP },
    zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_TOP },
    tilt: 0,
    controlSize: 20,
    scaleControl: true,
    clickableIcons: false,
    cursor: "pointer",
  };

  let center = new google.maps.LatLng(initialCenter[0], initialCenter[1]);
  let zoom = initialZoomLevel; //8;

  let settings = null;

  //Set up caching of study area
  if (typeof Storage !== "undefined") {
    cachedStudyAreaName = localStorage.getItem("cachedStudyAreaName");

    if (
      urlParams.studyAreaName !== null &&
      urlParams.studyAreaName !== undefined
    ) {
      cachedStudyAreaName = decodeURIComponent(urlParams.studyAreaName);
    } else if (
      cachedStudyAreaName === null ||
      cachedStudyAreaName === undefined
    ) {
      cachedStudyAreaName = defaultStudyArea;
    }
    studyAreaName = studyAreaDict[cachedStudyAreaName].name;
    longStudyAreaName = cachedStudyAreaName;

    $("#study-area-label").text(longStudyAreaName);
    $("#study-area-label").fitText(1.8);

    if (studyAreaSpecificPage == true) {
      cachedSettingskey = studyAreaName + "-settings";
    }
    settings = JSON.parse(localStorage.getItem(cachedSettingskey));
    layerObj = null;
  }

  if (settings != null && settings.center != null && settings.zoom != null) {
    center = settings.center;
    zoom = settings.zoom;
  }
  if (layerObj === null) {
    layerObj = {};
  }

  if (
    urlParams.lng !== undefined &&
    urlParams.lng !== null &&
    urlParams.lat !== undefined &&
    urlParams.lat !== null
  ) {
    print("Setting center from URL");
    mapOptions.center = {
      lng: parseFloat(urlParams.lng),
      lat: parseFloat(urlParams.lat),
    };
  } else {
    mapOptions.center = center;
  }
  if (urlParams.zoom !== undefined && urlParams.zoom !== null) {
    print("Setting zoom from URL");
    mapOptions.zoom = parseInt(urlParams.zoom);
  } else {
    mapOptions.zoom = zoom;
  }
  urlParams.lng = mapOptions.center.lng;
  urlParams.lat = mapOptions.center.lat;
  urlParams.zoom = mapOptions.zoom;
  // trackView()
  map = new google.maps.Map(document.getElementById("map"), mapOptions);

  //Listen for street view use
  //Adapted from: https://stackoverflow.com/questions/7251738/detecting-google-maps-streetview-mode
  const thePanorama = map.getStreetView();
  google.maps.event.addListener(thePanorama, "visible_changed", function () {
    if (thePanorama.getVisible()) {
      console.log("street view in use");
      $("#sidebar-left-container").hide();
      $(".sidebar-toggler").hide();
      $("#legendDiv").hide();
      $("#bottombar").hide();
      $("#dashboard-results-container").hide();
      $("#dashboard-highlights-container").hide();
      // Display your street view visible UI
    } else {
      console.log("street view not in use");
      $("#sidebar-left-container").show();
      $(".sidebar-toggler").show();
      $("#legendDiv").show();
      $("#bottombar").show();
      $("#dashboard-results-container").show();
      $("#dashboard-highlights-container").show();
      // Display your original UI
    }
  });
  marker = new google.maps.Circle({
    center: { lat: 45, lng: -111 },
    radius: 5,
  });

  infowindow = getInfoWindow();

  queryGeoJSON = new google.maps.Data();
  queryGeoJSON.setMap(map);
  queryGeoJSON.setStyle({ strokeColor: "#FF0" });

  //Add search box
  initSearchBox();

  placeholderID = 1;

  //Set up cursor info in bottom bar
  function updateMousePositionAndZoom(cLng, cLat, zoom, elevation) {
    $("#current-mouse-position").html(
      "Lng: " +
        cLng +
        ", Lat: " +
        cLat +
        ", " +
        elevation +
        " Zoom: " +
        zoom +
        ", 1:" +
        zoomDict[zoom]
    );
  }

  //Set up elevation api

  let lastElevation = 0;
  let elevationCheckTime = 0;

  function getElevation(center) {
    mouseLat = center.lat().toFixed(4).toString();
    mouseLng = center.lng().toFixed(4).toString();
    try {
      const elevation = ee
        .Image("USGS/SRTMGL1_003")
        .reduceRegion(
          ee.Reducer.first(),
          ee.Geometry.Point([center.lng(), center.lat()])
        )
        .get("elevation");
      elevation.evaluate(function (thisElevation) {
        if (thisElevation !== undefined && thisElevation !== null) {
          thisElevationFt = parseInt(thisElevation * 3.28084);
          lastElevation =
            "Elevation: " +
            thisElevation.toString() +
            "(m), " +
            thisElevationFt.toString() +
            "(ft),";
        } else {
          thisElevationFt = "NA";
          lastElevation = "Elevation: NA,";
        }

        updateMousePositionAndZoom(mouseLng, mouseLat, zoom, lastElevation);
      });
    } catch (err) {
      const thisElevationFt = "NA";
      lastElevation = "Elevation: NA,";
      updateMousePositionAndZoom(mouseLng, mouseLat, zoom, lastElevation);
    }
  }

  //Listen for mouse movement and update bottom bar
  map.addListener("mousemove", function (event) {
    const center = event.latLng;
    if (center !== null) {
      const zoom = map.getZoom();

      mouseLat = center.lat().toFixed(4).toString();
      mouseLng = center.lng().toFixed(4).toString();
      const now = new Date().getTime();
      const dt = now - elevationCheckTime;

      if (dt > 1000) {
        getElevation(center);
        elevationCheckTime = now;
      } else {
        updateMousePositionAndZoom(mouseLng, mouseLat, zoom, lastElevation);
      }
    }
  });
  function trackViewChange() {
    zoom = map.getZoom();
    const mapCenter = map.getCenter();
    const mapCenterLng = mapCenter.lng();
    const mapCenterLat = mapCenter.lat();
    urlParams.lng = mapCenterLng;
    urlParams.lat = mapCenterLat;
    urlParams.zoom = zoom;

    trackView();

    const coords = Object.values(map.getBounds().toJSON());
    updateMousePositionAndZoom(mouseLng, mouseLat, zoom, lastElevation);
    try {
      eeBoundsPoly = ee.Geometry.Rectangle(
        [coords[1], coords[0], coords[3], coords[2]],
        null,
        false
      );
    } catch (err) {
      const x = 1;
    }
    if (typeof Storage == "undefined") return;
    localStorage.setItem(
      cachedSettingskey,
      JSON.stringify({
        center: { lat: mapCenterLat, lng: mapCenterLng },
        zoom: zoom,
      })
    );
    updateViewList = true;
  }
  //Listen for zoom change and update bottom bar
  google.maps.event.addListener(map, "maptypeid_changed", function () {
    console.log("map type id changed");
    urlParams.mapTypeId = map.mapTypeId;
    smartAddLabelOverlay();
  });

  //Keep track of map bounds and zoom changes
  google.maps.event.addListener(map, "idle", trackViewChange);

  //Specify proxy server location
  //Proxy server used for EE and GCS auth
  //RCR appspot proxy costs $$
  //Initialize GEE
  function showSplash() {
    setTimeout(function () {
      if (localStorage["showIntroModal-" + mode] === "true") {
        $("#introModal").modal().show();
      } else {
        if (staticTemplates.loadingModal[mode] === undefined) {
          if (mode === "MTBS") {
            showMessage(
              "",
              staticTemplates.loadingModal["all"]("mtbs-logo.png", "Creating")
            );
          } else if (
            mode === "STORM" ||
            mode === "Bloom-Mapper" ||
            mode === "sequoia-view" ||
            mode === "TreeMap" ||
            mode === "HiForm-BMP"
          ) {
            showMessage(
              "",
              staticTemplates.loadingModal["all"](
                "logos_usda-fs_bn-dk-01.svg",
                "Creating"
              )
            );
          } else if (mode === "lcms-dashboard") {
            showMessage(
              "",
              staticTemplates.loadingModal["all"](
                "lcms-icon.png",
                "Loading",
                "LCMS summary areas"
              )
            );
          } else {
            showMessage(
              "",
              staticTemplates.loadingModal["all"]("lcms-icon.png", "Creating")
            );
          }
        } else {
          showMessage("Loading", staticTemplates.loadingModal[mode]);
        }
      }

      $("#dontShowAgainCheckbox").change(function () {
        localStorage["showIntroModal-" + mode] = !this.checked;
        $("#show-splash-radio-label").click();
      });
    }, 500);
  }
  function loadGEELibraries() {
    let geeModules = [
      "./src/gee/gee-libraries/getImagesLib.js",
      "./src/gee/gee-libraries/changeDetectionLib.js",
    ];
    batchLoad(geeModules, eeInitSuccessCallback);
  }
  function eeInitSuccessCallback() {
    //Set up the correct GEE run function
    geeAuthenticated = true;
    showSplash();
    ee.data.setDefaultWorkloadTag(`${mode}---viewer-exports`.toLowerCase());
    if (geeAuthenticated) {
      $("#main-container").append(staticTemplates.introModal[mode]);
    }
    if (cachedStudyAreaName === null) {
      $("#study-area-label").text(defaultStudyArea);
    }
    if (mode === "Ancillary") {
      run = runAncillary;
    } else if (
      mode === "LCMS" ||
      (mode === "LCMS-pilot" &&
        studyAreaDict[longStudyAreaName].isPilot == false)
    ) {
      run = runGTAC;
    } else if (mode === "LT") {
      run = runLT;
    } else if (mode === "MTBS") {
      run = runMTBS;
    } else if (mode === "TEST") {
      run = runTest;
    } else if (mode === "IDS") {
      run = runIDS;
    } else if (mode === "geeViz") {
      run = runGeeViz;
    } else if (mode === "LAMDA") {
      run = runLAMDA;
    } else if (mode === "STORM") {
      run = runStorm;
    } else if (mode === "lcms-base-learner") {
      run = runBaseLearner;
    } else if (mode === "TreeMap") {
      run = runTreeMap;
    } else if (mode === "lcms-dashboard") {
      run = runDashboard;
      map.setOptions({
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          position: google.maps.ControlPosition.TOP_CENTER,
          style: google.maps.MapTypeControlStyle.SMALL,
        },
        streetViewControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
        },
        scaleControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
        },
        zoomControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          style: google.maps.ZoomControlStyle.SMALL,
        },
        draggableCursor: "",
      });
    } else if (mode === "Bloom-Mapper") {
      run = runAlgal;
    } else if (mode === "sequoia-view") {
      run = runSequoia;
    } else if (mode === "HiForm-BMP") {
      run = runHiForm;
    } else if (studyAreaName === "CONUS") {
      longStudyAreaName = cachedStudyAreaName;
      run = runCONUS;
    } else if (cachedStudyAreaName != null) {
      longStudyAreaName = cachedStudyAreaName;
      resetStudyArea(cachedStudyAreaName);
    } else {
      run = runUSFS;
    }

    //Bring in downloads if needed
    if (mode === "LCMS") {
      setupDropdownTreeDownloads(studyAreaName);
      populateLCMSDownloads();
    }
    if (mode === "TreeMap") {
      setupDropdownTreeMapDownloads();
      populateDownloads();
    }
    setGEERunID();

    setTimeout(function () {
      let loaded = false;
      let loadTryCount = 0;
      const maxLoadTryCount = 1;
      let geeRunError;
      function loadRun() {
        try {
          let runStartTime = new Date();
          run();
          urlParams.activeTool = urlParams.activeTool || undefined;
          if (
            urlParams.activeTool !== undefined &&
            getActiveTools().length === 0
          ) {
            $(toolFunctionsFlat[urlParams.activeTool]).click();
          }
          let runEndTime = new Date();
          let runTime = (runEndTime - runStartTime) / 1000;
          console.log(`Run time: ${runTime} seconds`);
          loaded = true;

          if (mode === "geeViz") {
            areaChart.autoHideAreaTools();
          }
        } catch (err) {
          geeRunError = err;
          console.log(err);
          console.log(
            "Failed to load GEE run function. Waiting 0.5 second   to retry"
          );
          loadTryCount++;
        }
      }
      while (loaded === false && loadTryCount < maxLoadTryCount) {
        loadRun();
        if (loaded === false) {
          sleepFor(500);
        }
        // Add drag listeners
        if (Map.canReorderLayers) {
          ["layer-list", "reference-layer-list", "related-layer-list"].map(
            (l) => addLayerSortListener(`#${l}`)
          );
        }
      }

      setupAreaLayerSelection();

      //Bring in plots of they're turned on
      if (plotsOn) {
        addPlotCollapse();
        loadAllPlots();
      }

      if (localStorage["showIntroModal-" + mode] !== "true") {
        $(".modal").modal("hide");
        $(".modal-backdrop").remove();
      } else {
        $("#intro-modal-loading-div").hide();
        $("#summary-spinner").hide();
      }

      if (!loaded) {
        showMessage("GEE Script Error", geeRunError);
      }

      smartAddLabelOverlay();
    }, 1500);
  }
  function eeInitFailureCallback(failure) {
    console.log(`Failed to authenticate to GEE: ${failure}`);
    if (mode === "LCMS") {
      setupDropdownTreeDownloads(studyAreaName);
      populateLCMSDownloads();
    }

    ga("send", "event", mode + "-gee-auth-error", "failure", "failure");

    if (
      mode === "geeViz" &&
      urlParams.accessToken !== null &&
      urlParams.accessToken !== undefined &&
      urlParams.accessToken !== "null" &&
      urlParams.accessToken !== "None"
    ) {
      const formatSeconds = (s) => new Date(s).toISOString().substr(11, 8);
      let authTokenAge = formatSeconds(
        new Date() - new Date(urlParams.accessTokenCreationTime)
      );
      showMessage("geeViz Loading Error", `Error Message: <i>${failure}</i>`);
      console.log(failure.toString());
      if (
        failure.toString().indexOf("invalid authentication credentials") > -1
      ) {
        appendMessage2(
          "<hr>Access Token Error",
          `There seems to be an issue with the access token.<br>
          The access token used is ${authTokenAge} old.<br>
        This token should be valid for about an hour or so
        If the access token is invalid, most likely it's expired. First, try rerunning the geeViz code to create a new token.`
        );
      }
      if (urlParams.projectID === "None") {
        appendMessage2(
          "<hr>Project ID Needed",
          'Your Google Cloud Platform project ID is "None". This can happen with some legacy accounts. Sometimes this can cause issues authenticating to GEE. Try to force set the project ID using <i>ee.Initialize(project="SomeProjectID")</i> prior to importing any geeViz modules.'
        );
      }
      if (failure.toString().indexOf("not found or deleted") > -1) {
        appendMessage2(
          "<hr>Cannot Find Project",
          `It appears the Google Cloud Platform project ID you provided (<i>${urlParams.projectID}</i>) cannot be found. Please initialize to GEE using a different project ID using <i>ee.Initialize(project="SomeProjectID")</i> prior to initializing geeViz.`
        );
      }
      if (
        failure
          .toString()
          .indexOf("Caller does not have required permission to use project") >
        -1
      ) {
        appendMessage2(
          "<hr>Cannot access Project",
          `It appears the Google Cloud Platform project ID you provided (<i>${urlParams.projectID}</i>) cannot be accessed. Please initialize to GEE using a different project ID using <i>ee.Initialize(project="SomeProjectID")</i> or re-authenticate to this project using <i>ee.Authenticate(force=True)</i> prior to initializing geeViz.`
        );
      }
    } else {
      showMessage("Map Loading Error", staticTemplates["authErrorMessage"]);
    }
  }
  let initCount = 1;
  function eeInit() {
    console.log(`Initializing GEE try number: ${initCount}`);

    ee.initialize(
      authProxyAPIURL,
      geeAPIURL,
      () => {
        loadGEELibraries();
      },
      (failure) => {
        eeInitFailureCallback(failure);
      },
      null,
      projectID
    );

    initCount++;
  }
  eeInit();
}
///////////////////////////////////////////////////////////////
//Wait to initialize
//Adapted from: https://stackoverflow.com/questions/32808613/how-to-wait-till-the-google-maps-api-has-loaded-before-loading-a-google-maps-ove
let mapWaitCount = 0;
const mapWaitMax = 3;
//Handle failed attempts to load gmaps api
function map_load() {
  // if you need any param
  mapWaitCount++;
  // if api is loaded
  if (typeof google !== "undefined") {
    initialize();
  }
  // try again if until maximum allowed attempt
  else if (mapWaitCount < mapWaitMax) {
    console.log("Waiting attempt #" + mapWaitCount); // just log
    setTimeout(function () {
      map_load();
    }, 1000);
  }
  // if failed after maximum attempt, not mandatory
  else if (mapWaitCount >= mapWaitMax) {
    console.log("Failed to load google api");
  }
}
$(document).ready(map_load);

/////////////////////////////////////////////////////
