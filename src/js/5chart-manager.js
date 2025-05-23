function sortFunction(a, b) {
  if (a[0] === b[0]) {
    return 0;
  } else {
    return a[0] < b[0] ? -1 : 1;
  }
}
function downloadURI() {
  if (uri != null && uri != undefined) {
    const link = document.createElement("a");
    link.download = uriName + ".png";
    link.href = uri;
    link.click();
    // delete link;
  }
}

function clearUploadedAreas() {
  if (
    selectionTracker.uploadedLayerIndices === undefined ||
    selectionTracker.uploadedLayerIndices === null
  ) {
    selectionTracker.uploadedLayerIndices = [];
  }

  turnOffUploadedLayers();
  $("#area-charting-shp-layer-list").empty();
}
function clearSelectedAreas() {
  selectionTracker.seletedFeatureLayerIndices.reverse().map(function (index) {
    map.overlayMapTypes.setAt(index, null);
  });
  urlParams.userSelectedAreaChartingAOIs = [];
  setupAreaLayerSelection();
  updateSelectedAreasNameList();
  updateSelectedAreaArea();
}

function removeLastSelectArea() {
  selectionTracker.selectedFeatures = selectionTracker.selectedFeatures.slice(
    0,
    selectionTracker.selectedFeatures.length - 1
  );
  urlParams.userSelectedAreaChartingAOIs =
    urlParams.userSelectedAreaChartingAOIs.slice(
      0,
      urlParams.userSelectedAreaChartingAOIs.length - 1
    );
  updateSelectedAreasNameList();
  updateSelectedAreaArea();
  const lastIndex =
    selectionTracker.seletedFeatureLayerIndices[
      selectionTracker.seletedFeatureLayerIndices.length - 1
    ];
  map.overlayMapTypes.setAt(lastIndex, null);
  selectionTracker.seletedFeatureLayerIndices =
    selectionTracker.seletedFeatureLayerIndices.slice(
      0,
      selectionTracker.seletedFeatureLayerIndices.length - 1
    );
  $("#area-charting-selected-layer-list li:first-child").remove();
}
function updateSelectedAreasNameList() {
  const selectedFeatures = ee
    .FeatureCollection(selectionTracker.selectedFeatures)
    .flatten();

  const namesList = ee.List(
    ee.Dictionary(selectedFeatures.aggregate_histogram("name")).keys()
  );

  namesList.evaluate(function (names, failure) {
    if (failure !== undefined) {
      showMessage("Error", failure);
    } else {
      selectionTracker.selectedNames = names;
    }
  });
}
function updateSelectedAreaArea() {
  const selectedFeatures = ee
    .FeatureCollection(selectionTracker.selectedFeatures)
    .flatten();

  $("#select-features-area-spinner").show();

  const area = selectedFeatures.geometry().area(1000);
  area.evaluate(function (values, failure) {
    if (failure !== undefined) {
      showMessage("Error", failure);
    } else {
      $("#selected-features-area").html(
        (values * 0.0001).formatNumber() +
          " hectares / " +
          (values * 0.000247105).formatNumber() +
          " acres"
      );

      $("#select-features-area-spinner").hide();
    }
  });
}

function chartCacheduserSelectedAreaChartingAOIs() {
  if (
    urlParams.userSelectedAreaChartingAOIs !== undefined &&
    urlParams.userSelectedAreaChartingAOIs !== null &&
    urlParams.userSelectedAreaChartingAOIs.length > 0
  ) {
    urlParams.userSelectedAreaChartingAOIs.map((l) => {
      let selectedFeaturesT = selectedFeaturesJSON[l.layerName].eeObject.filter(
        ee.Filter.inList("system:index", l.ids)
      );

      addSelectedFeaturesToMapWrapper(selectedFeaturesT, l.names, l.layerName);
    });
    updateSelectedAreasNameList();
    updateSelectedAreaArea();
    if (getActiveTools()[0] === "Area Tools-Select an Area on map") {
      chartSelectedAreas(false);
    }
  }
}
function addSelectedFeaturesToMapWrapper(selectedFeaturesT, nms, k) {
  if (simplifyMaxError !== 0) {
    selectedFeaturesT = ee.FeatureCollection(
      selectedFeaturesT.map(function (f) {
        return ee.Feature(f).simplify(simplifyMaxError, crs);
      })
    );
  }
  selectionTracker.selectedFeatures.push(selectedFeaturesT);

  let layerName =
    "Selected " +
    selectedFeaturesJSON[k].layerName +
    " " +
    nms.join("-").replaceAll("&", "-");
  if (simplifyMaxError !== 0) {
    layerName =
      "Simplified (" + simplifyMaxError.toString() + "m)- " + layerName;
  }
  Map.addLayer(
    selectedFeaturesT,
    { layerType: "geeVectorImage", isSelectedLayer: true },
    layerName,
    true,
    null,
    null,
    null,
    "area-charting-selected-layer-list"
  );
}
function setupAreaLayerSelection() {
  google.maps.event.clearListeners(map, "click");
  selectionTracker.selectedFeatures = [];
  selectionTracker.selectedNames = [];
  selectionTracker.seletedFeatureLayerIndices = [];
  urlParams.userSelectedAreaChartingAOIs =
    urlParams.userSelectedAreaChartingAOIs || [];

  $("#selected-features-list").empty();
  $("#area-charting-selected-layer-list").empty();
  chartCacheduserSelectedAreaChartingAOIs();
  map.addListener("click", function (event) {
    if (getActiveTools().indexOf("Area Tools-Select an Area on map") > -1) {
      const coords = [event.latLng.lng(), event.latLng.lat()];

      Object.keys(selectedFeaturesJSON).map(function (k) {
        if (layerObj[selectedFeaturesJSON[k].id].visible) {
          let selectedFeaturesT = selectedFeaturesJSON[k].eeObject.filterBounds(
            ee.Geometry.Point(coords)
          );
          const selectedFeaturesIDs = ee.List(
            selectedFeaturesT.aggregate_array("system:index")
          );
          const namesList = ee.List(selectedFeaturesT.aggregate_array("name"));
          const namesAndIDs = ee.List([selectedFeaturesIDs, namesList, k]);
          namesAndIDs.evaluate(function (nmsIDs, failure) {
            if (failure !== undefined) {
              showMessage("Error", failure);
            } else {
              let nms = nmsIDs[1];
              let IDs = nmsIDs[0];
              let k = nmsIDs[2];

              if (nms.length > 0) {
                console.log("names " + nms);
                urlParams.userSelectedAreaChartingAOIs.push({
                  layerName: k,
                  ids: IDs,
                  names: nms,
                });
                unique(urlParams.userSelectedAreaChartingAOIs);
                addSelectedFeaturesToMapWrapper(selectedFeaturesT, nms, k);
              }
              updateSelectedAreasNameList();
              updateSelectedAreaArea();
            }
          });
        }
      });
    }
  });
}

function updateUserDefinedAreaArea() {
  let area = 0;
  Object.values(udpPolygonObj).map(function (poly) {
    area += google.maps.geometry.spherical.computeArea(poly.getPath());
  });
  $("#user-defined-features-area").html(
    (area * 0.0001).formatNumber() +
      " hectares / " +
      (area * 0.000247105).formatNumber() +
      " acres"
  );
}
function turnOffVectorLayers() {
  $(".vector-layer-checkbox").trigger("turnOffAllVectors");
}
function turnOffLayers() {
  $(".layer-checkbox").trigger("turnOffAll");
}

function turnOffSelectLayers() {
  $(".vector-layer-checkbox").trigger("turnOffAllSelectLayers");
}
function turnOnSelectedLayers() {
  $(".vector-layer-checkbox").trigger("turnOnAllSelectedLayers");
}
function turnOffUploadedLayers() {
  $(".vector-layer-checkbox").trigger("turnOffAllUploadedLayers");
}
function turnOnUploadedLayers() {
  $(".vector-layer-checkbox").trigger("turnOnAllUploadedLayers");
}
function turnOffSelectGeoJSON() {}
function turnOnSelectGeoJSON() {
  Object.keys(selectedFeaturesJSON).map(function (k) {
    selectedFeaturesJSON[k].geoJSON.forEach(function (f) {
      selectedFeaturesJSON[k].geoJSON.setMap(map);
    });
  });
}
$("#user-selected-area-name").on("input", (e) => {
  if ($("#user-selected-area-name").val() === "") {
    delete urlParams.userSelectedAreaChartingAOIName;
  } else {
    urlParams.userSelectedAreaChartingAOIName = $(
      "#user-selected-area-name"
    ).val();
  }
});
$("#user-defined-area-name").on("input", (e) => {
  if ($("#user-defined-area-name").val() === "") {
    delete urlParams.userDefinedAreaChartingAOIName;
  } else {
    urlParams.userDefinedAreaChartingAOIName = $(
      "#user-defined-area-name"
    ).val();
  }
});
function chartSelectedAreas(fromButton = true) {
  const selectedFeatures = ee
    .FeatureCollection(selectionTracker.selectedFeatures)
    .flatten();
  if (Object.keys(areaChart.areaChartObj).length === 0) {
    $("#summary-spinner").slideDown();
  }
  selectedFeatures.size().evaluate(function (size, failure) {
    if (failure !== undefined) {
      showMessage("Error", failure);
    } else if (size !== 0) {
      let title = $("#user-selected-area-name").val();

      if (title === "") {
        title = selectionTracker.selectedNames.join(" - ");
      }

      Map.centerObject(selectedFeatures, false);

      if (Object.keys(areaChart.areaChartObj).length > 0) {
        areaChart.clearCharts();
        areaChart.chartArea(selectedFeatures, title);
      } else {
        $("#summary-spinner").slideUp();
        makeAreaChart(
          selectedFeatures,
          title +
            " " +
            areaChartCollections[whichAreaChartCollection].label +
            " Summary",
          true
        );
      }
    } else if (fromButton === true) {
      showMessage(
        "Error!",
        "Please select area to chart. Turn on any of the layers and click on polygons to select them.  Then hit the <kbd>Chart Selected Areas</kbd> button."
      );
      $("#summary-spinner").slideUp();
    }
  });
}

function clearQueryGeoJSON() {
  queryGeoJSON.forEach(function (f) {
    queryGeoJSON.remove(f);
  });
}
// Set to infoWindow or sidebarCollapse
let queryWindowMode = "infoWindow";
queryWindowMode = "sidepane";
const getQueryImages = function (lng, lat) {
  const lngLat = [lng, lat];
  $(".gm-ui-hover-effect").show();
  const outDict = {};
  $("#summary-spinner").slideDown();

  const nameEnd =
    " Queried Values for Lng " + lng.toFixed(3) + " Lat " + lat.toFixed(3);
  const queryContent = `<div>
							<h6 class = 'query-output-header-title'>Queried values for<br>lng: ${lng
                .toFixed(3)
                .toString()} lat: ${lat.toFixed(3).toString()}</h6>
							<li id = 'query-list-container'></li>
							
						</div>`;
  if (queryWindowMode === "infoWindow") {
    $("#chart-collapse-label-chart-collapse-div").hide();
    $("#chart-collapse-div").empty();
    $("#legendDiv").css("max-width", "");
    $("#legendDiv").css("max-height", "60%");
    infowindow.setMap(null);
    infowindow.setPosition({ lng: lng, lat: lat });
    infowindow.setOptions({ maxWidth: 350 });
    infowindow.setContent(queryContent);
    infowindow.open(map);
  } else {
    infowindow.setContent("");
    infowindow.setMap(null);
    $("#legendDiv").css("max-width", "");
    // $("#legendDiv").css("max-height", "80%");
    resizePanes();
    $("#chart-collapse-label-chart-collapse-div").show();
    $("#chart-collapse-div").empty();
    $("#chart-collapse-div").append(queryContent);
  }

  let idI = 1;
  function makeQueryTable(value, q, k) {
    const containerID = k + "-container-" + idI.toString();
    idI++;
    $("#query-list-container")
      .append(`<table class="table table-hover bg-white">
												<tbody>
													<tr class = 'bg-black'><th></th></tr>
												</tbody>
											  </table>`);
    if (value === null || value === undefined) {
      $("#query-list-container")
        .append(`<table class="table table-hover bg-white">
												<tbody id = '${containerID}'></tbody>
											  </table>`);
      $("#" + containerID).append(`<tr><th>${q.name}</th><td>null</td></tr>`);
    } else if (q.type === "geeImage") {
      $("#query-list-container")
        .append(`<table class="table table-hover bg-white">
												<tbody id = '${containerID}'></tbody>
											  </table>`);
      let valueKeys = Object.keys(value);
      if (
        valueKeys.length === 4 &&
        valueKeys.indexOf("viz-blue") > -1 &&
        valueKeys.indexOf("viz-green") > -1 &&
        valueKeys.indexOf("viz-red") > -1
      ) {
        let mainKey = valueKeys.filter((f) => f.indexOf("viz-") === -1)[0];
        let tValue = JSON.stringify(value[mainKey]);
        tValue =
          tValue.indexOf(".") > -1 ? parseFloat(tValue) : parseInt(tValue);
        if (q.queryDict !== null && q.queryDict !== undefined) {
          tValue = q.queryDict[tValue];
        } else {
          tValue = smartToFixed(tValue);
        }

        $("#" + containerID).append(
          `<tr><th>${q.name}</th><td>${tValue}</td></tr>`
        );
      } else {
        if (Object.keys(value).length > 1) {
          $("#" + containerID).append(
            `<tr><th colspan=2 style="text-align:left;">${q.name}</th</tr>`
          );
        }

        Object.keys(value).map(function (kt) {
          try {
            let v = value[kt];

            if (Array.isArray(v)) {
              // Limit precision
              v = arraySmartToFixed(v);
              v = JSON.stringify(v);
            } else if (!Number.isInteger(v) && v !== null) {
              v = smartToFixed(v);
            } else if (q.queryDict !== null && q.queryDict !== undefined) {
              const t = q.queryDict[parseInt(v)];
              if (t !== undefined) {
                v = t;
              }
            }

            if (Object.keys(value).length > 1) {
              $("#" + containerID).append(
                `<tr><td>${kt}</td><td>${v}</td></tr>`
              );
            } else {
              $("#" + containerID).append(
                `<tr><th>${q.name}</th><td>${v}</td></tr>`
              );
            }
          } catch (err) {
            console.log(`Click query error: ${err}`);
            $("#" + containerID).append(
              `<tr><td>${kt}</td><td>${JSON.stringify(v)}</td></tr>`
            );
          }
        });
      }
    } else if (q.type === "geeImageCollection") {
      let yAxisLabels = {
        tickfont: { size: yLabelFontSize },
        title: {
          text: q.queryParams.yLabel,
          font: {
            size: 12,
          },
        },
      };

      if (q.queryDict !== undefined && q.queryDict !== null) {
        // Configure best way of showing given labels for queried pixel
        // This tries to avoid over-crowding of labels that happens when there are many long labels
        // within the queried range of values
        const yValues = value.table[0].y.filter((n) => n !== null);
        const yMin = yValues.min();
        const yMax = yValues.max();

        const allYValues = range(yMin, yMax + 1);
        const allYLabels = allYValues.map((v) => {
          if (yValues.indexOf(v) === -1) {
            return " ";
          } else {
            return q.queryDict[v] || v.toString();
          }
        });
        // console.log(allYLabels);
        let yLabelMaxLinesT = yLabelMaxLines;
        let brokenLabels;
        function breakLabels() {
          let totalLines = 0;
          brokenLabels = allYLabels.map((l) => {
            const chunks = l
              .slice(0, yLabelMaxLength)
              .chunk(yLabelBreakLength)
              .slice(0, yLabelMaxLinesT);
            totalLines = totalLines + chunks.length;
            return chunks.join("<br>");
          });
          if (totalLines > yLabelMaxTotalLines && yLabelMaxLinesT > 1) {
            yLabelMaxLinesT = yLabelMaxLinesT - 1;
            breakLabels();
          }
        }
        breakLabels();
        yAxisLabels = {
          ticktext: brokenLabels,
          tickvals: allYValues,
          tickmode: "array",
          tickfont: { size: yLabelFontSize },
        };
      }
      $("#query-list-container").append(
        `<ul class = 'bg-black dropdown-divider'></ul>`
      );
      $("#query-list-container").append(
        `<ul class = 'm-0 p-0 bg-white' id = '${containerID}'></ul>`
      );
      let chartWidthC = 600;
      if (queryWindowMode === "infoWindow") {
        infowindow.setOptions({ maxWidth: 1200 });
        infowindow.open(map);
      } else {
        $("#legendDiv").css("max-width", "575px");
        chartWidthC = 550;
      }
      const plotLayout = {
        plot_bgcolor: "#d6d1ca",
        paper_bgcolor: "#d6d1ca",
        font: {
          family: "Roboto Condensed, sans-serif",
        },
        legend: {
          font: { size: yLabelFontSize },
        },

        margin: {
          l: 50,
          r: 10,
          b: 50,
          t: 50,
          pad: 0,
        },
        width: chartWidthC,
        height: 400,
        title: {
          text: q.name,
        },
        xaxis: {
          tickangle: 45,
          tickformat: q.xTickDateFormat,
          tickfont: { size: yLabelFontSize },
          title: {
            text: value.xLabel,
            font: {
              size: 12,
            },
          },
        },
        yaxis: yAxisLabels,
      };
      const buttonOptions = {
        toImageButtonOptions: {
          filename: q.name + nameEnd,
          width: 900,
          height: 600,
          format: "png",
        },
      };

      Plotly.newPlot(containerID, value.table, plotLayout, buttonOptions);
    } else if (q.type === "geeVectorImage" || q.type === "geeVector") {
      $("#query-list-container")
        .append(`<table class="table table-hover bg-white">
												<tbody id = '${containerID}'></tbody>
											  </table>`);

      const infoKeys = Object.keys(value);
      $("#" + containerID).append(
        `<tr><th>${q.name}</th><th>Attribute Table</th></tr>`
      );

      infoKeys.map(function (name) {
        const valueT = smartToFixed(value[name]);
        $("#" + containerID).append(
          `<tr><th>${name}</th><td>${valueT}</td></tr>`
        );
      });
    }

    if (keyI >= keyCount) {
      map.setOptions({ draggableCursor: "help" });
      map.setOptions({ cursor: "help" });
      $("#summary-spinner").slideUp();
    }
  }
  const keys = Object.keys(queryObj);
  const keysToShow = [];
  keys.map(function (k) {
    const q = queryObj[k];
    if (q.visible) {
      keysToShow.push(k);
    }
  });
  let keyCount = keysToShow.length;
  let keyI = 0;

  if (keyCount === 0) {
    $("#summary-spinner").slideUp();
    showMessage(
      "No Layers to Query!",
      "No visible layers to query. Please turn on any layers you would like to query"
    );
  }
  clearQueryGeoJSON();
  keysToShow.map(function (k) {
    const q = queryObj[k];

    if (q.visible) {
      const clickPt = ee.Geometry.Point(lngLat);
      ga("send", "event", mode, "pixelQuery-" + q.type, q.name);
      if (q.type === "geeImage") {
        const img = ee.Image(q.queryItem);
        img
          .reduceRegion(
            ee.Reducer.first(),
            clickPt,
            scale,
            crs,
            transform,
            true,
            1e13,
            4
          )
          .evaluate(function (values) {
            keyI++;

            makeQueryTable(values, q, k);
          });
      } else if (q.type === "geeImageCollection") {
        let dateFormat = q.queryDateFormat;
        if (dateFormat === null || dateFormat === undefined) {
          dateFormat = defaultQueryDateFormat;
        }
        q.xTickDateFormat = null;
        if (dateFormat.indexOf("HH:mm") > -1) {
          q.xTickDateFormat = "%Y-%m-%d\n%H:%M";
        }
        let c = ee.ImageCollection(q.queryItem);
        const plotBounds = clickPt.buffer(plotRadius).bounds();
        function getCollectionValues(values) {
          keyI++;
          if (values.length > 1) {
            const header = values[0];
            values = values.slice(1);

            let hasTime = false;
            const timeColumnN = header.indexOf("time");
            const idColumnN = header.indexOf("id");

            const ids = arrayColumn(values, idColumnN).filter(
              (v, i, a) => a.indexOf(v) === i
            );
            const expectedLength = ids.length;
            if (values.length > expectedLength) {
              console.log("reducing number of inputs");
              values = values.slice(0, expectedLength);
            }

            hasTime = values[0][timeColumnN] !== null;

            let xColumn;
            let xLabel;
            if (hasTime) {
              xColumn = arrayColumn(values, timeColumnN);
              xLabel = "Time";
            } else {
              xColumn = arrayColumn(values, idColumnN);
              xLabel = "ID";
            }
            const yColumnNames = header.slice(4);
            yColumns = values.map(function (v) {
              return v.slice(4);
            });
            const tableList = yColumnNames.map(function (c, i) {
              let color =
                q.queryParams.palette !== undefined
                  ? q.queryParams.palette[i]
                  : undefined;
              return {
                x: xColumn,
                y: arrayColumn(yColumns, i).map((n) => smartToFixed(n)),
                mode: "lines+markers",
                name: c.slice(0, 50).chunk(15).join("<br>"),
                line: { color: color, width: 1 },
                marker: { size: 3 },
              };
            });

            makeQueryTable({ table: tableList, xLabel: xLabel }, q, k);
          } else {
            console.log("no data");
            makeQueryTable(null, q, k);
          }
        }
        if (
          c.first().propertyNames().getInfo().indexOf("system:time_start") > -1
        ) {
          c = c.sort("system:time_start").map(function (img) {
            return img.set("system:time_start", img.date().format(dateFormat));
          });
        }

        const getRegionCall = c.getRegion(plotBounds, scale, crs, transform);
        getRegionCall.evaluate(function (values, failure) {
          if (values !== undefined && values !== null) {
            getCollectionValues(values);
          } else {
            keyI++;
            makeQueryTable(null, q, k);
          }
          if (failure !== undefined && failure !== null) {
            showMessage("Error", failure);
          }
        });
      } else if (q.type === "geeVectorImage" || q.type === "geeVector") {
        let features;
        try {
          features = q.queryItem.filterBounds(clickPt.buffer(plotRadius));
        } catch (err) {
          features = ee
            .FeatureCollection([q.queryItem])
            .filterBounds(clickPt.buffer(plotRadius));
        }
        features.evaluate(function (values) {
          keyI++;
          if (values !== undefined) {
            queryGeoJSON.addGeoJson(values);

            const features = values.features;

            if (features.length === 0) {
              makeQueryTable(null, q, k);
            } else {
              features.map(function (f) {
                makeQueryTable(f.properties, q, k);
              });
            }
          } else {
            makeQueryTable(null, q, k);
          }
        });
      }
    }
  });
};
let fsb;
function populateChartDropdown(id, collectionDict, whichChartCollectionVar) {
  $("#" + id).empty();
  const keys = Object.keys(collectionDict);
  eval(whichChartCollectionVar + " = keys[0]");
  if (keys.length > 1) {
    Object.keys(collectionDict).map(function (k) {
      addDropdownItem(
        id,
        collectionDict[k].label,
        k,
        collectionDict[k].tooltip
      );
    });
    $("#" + id + "-container").show();
  } else {
    $("#" + id + "-container").hide();
  }
}
function populateAreaChartDropdown() {
  populateChartDropdown(
    "area-collection-dropdown",
    areaChartCollections,
    "whichAreaChartCollection"
  );
}
function populatePixelChartDropdown() {
  populateChartDropdown(
    "pixel-collection-dropdown",
    pixelChartCollections,
    "whichPixelChartCollection"
  );
}

function setupFSB() {
  $("#forestBoundaries").empty();
  $("#forestBoundaries").hide();
  $("#select-area-spinner").show();
  const nfsFieldName = "FORESTNAME";
  let nfs = ee.FeatureCollection(
    "projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Boundaries"
  );

  const npsFieldName = "PARKNAME";
  let nps = ee.FeatureCollection(
    "projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/NPS_Boundaries"
  );

  nfs = nfs.map(function (f) {
    return f.set("label", f.get(nfsFieldName));
  });

  nps = nps.map(function (f) {
    return f.set("label", ee.String(f.get(npsFieldName)).cat(" National Park"));
  });

  fsb = nfs.merge(nps);
  fieldName = "label";

  if (areaChartCollections[whichAreaChartCollection] !== undefined) {
    fsb = fsb.filterBounds(
      areaChartCollections[whichAreaChartCollection].collection.geometry()
    );

    const names = ee.List(
      ee.Dictionary(fsb.aggregate_histogram(fieldName)).keys()
    );
    ee.Dictionary.fromLists(names, names).evaluate(function (d) {
      const mySelect = $("#forestBoundaries");
      let choose;
      mySelect.append(
        $("<option></option>").val(choose).html("Choose an area")
      );
      $.each(d, function (val, text) {
        mySelect.append($("<option></option>").val(val).html(text));
      });
      $("#select-area-spinner").hide();
      $("#forestBoundaries").show();
    });
  }
}

let udp;
const udpList = [];
let whichAreaDrawingMethod;
function areaChartingTabSelect(target) {
  stopAreaCharting();
  stopCharting();

  whichAreaDrawingMethod = target;
  if (target === "#user-defined") {
    startUserDefinedAreaCharting();
  } else if (target === "#shp-defined") {
    startShpDefinedCharting();
  } else if (target === "#pre-defined") {
    $("#pre-defined").slideDown();
  } else if (target === "#user-selected") {
    map.setOptions({ draggableCursor: "pointer" });
    map.setOptions({ cursor: "pointer" });
  }
}

function restartUserDefinedAreaCarting(e) {
  if (e === undefined || e.key == "Delete" || e.key == "Backspace") {
    urlParams.userDefinedAreaChartingAOI = null;
    areaChartingTabSelect(whichAreaDrawingMethod);
    areaChart.clearCharts();
    updateUserDefinedAreaArea();
  }
}
function cacheUserDefinedAreaChartingAOI() {
  let cachedArea = {};
  Object.keys(udpPolygonObj).map((k) => {
    let t = udpPolygonObj[k]
      .getPath()
      .getArray()
      .map((c) => [c.lng().round(6), c.lat().round(6)]);
    if (t.length > 0) {
      cachedArea[k] = t;
    }
  });
  urlParams.userDefinedAreaChartingAOI = cachedArea;
}
function retrieveCachedUserDefinedAreaChartingAOI() {
  if (urlParams.userDefinedAreaChartingAOI) {
    Object.keys(urlParams.userDefinedAreaChartingAOI).map((k) => {
      let coords = urlParams.userDefinedAreaChartingAOI[k].map((c) => {
        return { lng: c[0], lat: c[1] };
      });

      udpPolygonObj[k] = new google.maps.Polygon(udpOptions);
      udpPolygonObj[k].setPath(coords);
      udpPolygonObj[k].setMap(map);
      // udpPolygonObj[k].setEditable(true);
      // udpPolygonObj[k].setDraggable(false);
      udpPolygonNumber = parseInt(k) + 1;
    });
    updateUserDefinedAreaArea();
  }
}
function polyConvert(n, mode = "polyline") {
  const path = udpPolygonObj[n].getPath();
  udpPolygonObj[n].setMap(null);
  if (mode === "polyline") {
    udpPolygonObj[n] = new google.maps.Polyline(udpOptions);
  } else {
    udpPolygonObj[n] = new google.maps.Polygon(udpOptions);
  }

  udpPolygonObj[n].setPath(path);
  udpPolygonObj[n].setMap(map);
}
function undoUserDefinedAreaCharting(e) {
  if (e === undefined || (e.key == "z" && e.ctrlKey)) {
    if (udpPolygonObj[udpPolygonNumber].getPath().getArray().length === 0) {
      udpPolygonNumber--;
      if (udpPolygonNumber < 1) {
        udpPolygonNumber = 1;
        restartUserDefinedAreaCarting();
        showMessage("Error!", "No more vertices to undo");
      }
    }
    polyConvert(udpPolygonNumber, "polyline");
    udpPolygonObj[udpPolygonNumber].getPath().pop(1);

    updateUserDefinedAreaArea();
  }
}
function startUserDefinedAreaCharting() {
  if (urlParams.userDefinedAreaChartingAOI) {
    retrieveCachedUserDefinedAreaChartingAOI();
    chartUserDefinedArea();
  }
  //  else {
  map.setOptions({ draggableCursor: "crosshair" });
  map.setOptions({ disableDoubleClickZoom: true });
  google.maps.event.clearListeners(mapDiv, "dblclick");
  google.maps.event.clearListeners(mapDiv, "click");
  window.addEventListener("keydown", restartUserDefinedAreaCarting);
  window.addEventListener("keydown", undoUserDefinedAreaCharting);
  try {
    udp.setMap(null);
  } catch (err) {}
  udpPolygonObj[udpPolygonNumber] = new google.maps.Polyline(udpOptions);

  udpPolygonObj[udpPolygonNumber].setMap(map);
  google.maps.event.addListener(
    udpPolygonObj[udpPolygonNumber],
    "click",
    updateUserDefinedAreaArea
  );
  google.maps.event.addListener(
    udpPolygonObj[udpPolygonNumber],
    "mouseup",
    updateUserDefinedAreaArea
  );
  google.maps.event.addListener(
    udpPolygonObj[udpPolygonNumber],
    "dragend",
    updateUserDefinedAreaArea
  );

  mapHammer = new Hammer(document.getElementById("map"));
  mapHammer.on("tap", function (event) {
    const path = udpPolygonObj[udpPolygonNumber].getPath();
    const x = event.center.x;
    const y = event.center.y;
    clickLngLat = point2LatLng(x, y);
    path.push(clickLngLat);
    updateUserDefinedAreaArea();
    cacheUserDefinedAreaChartingAOI();
  });

  mapHammer.on("doubletap", function () {
    polyConvert(udpPolygonNumber, "polygon");

    cacheUserDefinedAreaChartingAOI();
    google.maps.event.addListener(
      udpPolygonObj[udpPolygonNumber],
      "click",
      updateUserDefinedAreaArea
    );
    google.maps.event.addListener(
      udpPolygonObj[udpPolygonNumber],
      "mouseup",
      updateUserDefinedAreaArea
    );
    google.maps.event.addListener(
      udpPolygonObj[udpPolygonNumber],
      "dragend",
      updateUserDefinedAreaArea
    );
    udpPolygonNumber++;
    udpPolygonObj[udpPolygonNumber] = new google.maps.Polyline(udpOptions);
    udpPolygonObj[udpPolygonNumber].setMap(map);
    google.maps.event.addListener(
      udpPolygonObj[udpPolygonNumber],
      "click",
      updateUserDefinedAreaArea
    );
    google.maps.event.addListener(
      udpPolygonObj[udpPolygonNumber],
      "mouseup",
      updateUserDefinedAreaArea
    );
    google.maps.event.addListener(
      udpPolygonObj[udpPolygonNumber],
      "dragend",
      updateUserDefinedAreaArea
    );

    updateUserDefinedAreaArea();
  });
  // }
}
function chartUserDefinedArea() {
  try {
    let userArea = [];
    let anythingToChart = false;
    Object.values(udpPolygonObj).map(function (v) {
      const coords = v.getPath().getArray();
      const f = [];
      coords.map(function (coord) {
        f.push([coord.lng(), coord.lat()]);
      });

      if (f.length > 2) {
        userArea.push(ee.Feature(ee.Geometry.Polygon(f)));
        anythingToChart = true;
      }
    });
    if (!anythingToChart) {
      showMessage(
        "Error!",
        "Please draw polygons on map. Double-click to finish drawing polygon. Once all polygons have been drawn, click the <kbd>Chart Selected Areas</kbd> button to create chart."
      );
    } else {
      cacheUserDefinedAreaChartingAOI();
      userArea = ee.FeatureCollection(userArea);
      let udpName = $("#user-defined-area-name").val();
      if (udpName === "") {
        udpName = "User Defined Area " + userDefinedI.toString();
        userDefinedI++;
      }

      Map.centerObject(userArea, false);
      if (Object.keys(areaChart.areaChartObj).length > 0) {
        areaChart.clearCharts();
        areaChart.chartArea(userArea, udpName);
      } else {
        $("#summary-spinner").slideDown();
        makeAreaChart(userArea, udpName, true);
      }
    }
  } catch (err) {
    showMessage("Error", err);
  }
}
function chartChosenArea() {
  $("#summary-spinner").slideDown();
  try {
    udp.setMap(null);
  } catch (err) {}
  map.setOptions({ draggableCursor: "progress" });
  map.setOptions({ cursor: "progress" });

  const chosenArea = $("#forestBoundaries").val();
  const chosenAreaName =
    chosenArea +
    " " +
    areaChartCollections[whichAreaChartCollection].label +
    " Summary";
  const chosenAreaGeo = fsb.filter(ee.Filter.eq(fieldName, chosenArea));

  makeAreaChart(chosenAreaGeo, chosenAreaName);
}
function convertToStack(
  areaChartCollection,
  xAxisProperty = "year",
  dateFormat = "YYYY"
) {
  if (xAxisProperty === "year") {
    areaChartCollection = areaChartCollection.map(function (img) {
      return img.set("year", img.date().format(dateFormat));
    });
  }
  const oBns = areaChartCollection.first().bandNames();
  const xProps = ee.List(
    areaChartCollection
      .toList(10000, 0)
      .map((img) => ee.Image(img).get(xAxisProperty))
  );
  const stack = areaChartCollection.toBands();
  const bns = stack.bandNames();
  const bnsOut = bns.map((bn) => {
    const i = ee.Number.parse(ee.String(bn).split("_").get(0));
    return ee
      .String(xProps.get(i))
      .cat("---")
      .cat(ee.String(bn).split("_").slice(1, null).join("_"));
  });
  return stack.rename(bnsOut).set({ xProps: xProps, bns: oBns });
}

function getAreaSummaryTable(
  areaChartCollection,
  area,
  xAxisProperty,
  multiplier,
  dateFormat,
  crs,
  transform,
  scale,
  kwargs
) {
  if (xAxisProperty === null || xAxisProperty === undefined) {
    xAxisProperty = "year";
  }
  if (multiplier === null || multiplier === undefined) {
    multiplier = 100;
  }
  if (dateFormat === null || dateFormat === undefined) {
    dateFormat = "YYYY";
  }
  if (crs === null || crs === undefined) {
    crs = "EPSG:5070";
  }
  if (transform === null || transform === undefined) {
    transform = null;
  }
  if ((scale === null || scale === undefined) && transform === null) {
    scale = 30;
  }

  // Older area charting method
  if (xAxisProperty === "year") {
    areaChartCollection = areaChartCollection.map(function (img) {
      return img.set("year", img.date().format(dateFormat));
    });
  }
  const bandNames = ee.Image(areaChartCollection.first()).bandNames();

  let areaChartCollectionStack = areaChartCollection.toBands();
  let xLabels = areaChartCollection.aggregate_histogram(xAxisProperty).keys();
  areaChartCollectionStack = areaChartCollectionStack.rename(xLabels);

  return areaChartCollection.toList(10000, 0).map(function (img) {
    img = ee.Image(img);
    let t = img.reduceRegion(
      ee.Reducer.fixedHistogram(0, 2, 2),
      area,
      scale,
      crs,
      transform,
      true,
      1e13,
      4
    );
    const xAxisLabel = img.get(xAxisProperty);
    t = ee.Dictionary(t);
    let sum;
    values = bandNames.map(function (bn) {
      let a = t.get(bn);
      a = ee.Array(a).slice(1, 1, 2).project([0]);
      sum = ee.Number(a.reduce(ee.Reducer.sum(), [0]).get([0]));
      a = ee.Number(a.toList().get(1));
      const pct = a.divide(sum).multiply(multiplier);
      return pct;
    });
    values = ee.List([xAxisLabel]).cat(values);
    return values;
  });
}
const chartFormatDict = {
  Percentage: { mult: "NA", label: "% Area", places: 2, scale: 30 },
  Acres: { mult: 0.222395, label: "Acres", places: 0, scale: 30 },
  Hectares: { mult: 0.09, label: "ha", places: 0, scale: 30 },
};

function expandChart() {
  console.log("expanding");
  $("#curve_chart_big").slideDown();
  $("#curve_chart_big_modal").modal();
  closeChart();
}
let currentChartID = 0;
function cancelMakeAreaChart() {
  currentChartID++;
  $("#summary-spinner").slideUp();
}
function makeAreaChart(area, name, userDefined) {
  let maxError = 500;
  currentChartID++;
  const thisChartID = currentChartID;
  areaGeoJson = null;
  if (userDefined === undefined || userDefined === null) {
    userDefined = false;
  }

  areaChartingCount++;
  const fColor = randomColor().slice(1, 7);

  area = area.set("source", "LCMS_data_explorer");
  0;
  centerObject(area);
  area = area.geometry();

  if (areaChartCollections[whichAreaChartCollection].type === "transition") {
    $("#summary-spinner").slideDown();
    let startYear = areaChartCollections[whichAreaChartCollection].collection
      .sort("system:time_start")
      .first()
      .date()
      .get("year")
      .getInfo();
    let endYear = areaChartCollections[whichAreaChartCollection].collection
      .sort("system:time_start", false)
      .first()
      .date()
      .get("year")
      .getInfo();

    let transitionPeriods = getTransitionRowData();
    if (transitionPeriods !== null) {
      let transitionClasses = getTransitionClasses(
        areaChartCollections[whichAreaChartCollection].collection,
        transitionPeriods,
        areaChartCollections[whichAreaChartCollection].values,
        areaChartCollections[whichAreaChartCollection].bandName
      );

      let bounds = area.bounds(maxError, crs).transform(crs, maxError);

      let img = ee.Image(transitionClasses).clip(area);

      let table = img.reduceRegion(
        ee.Reducer.fixedHistogram(0, 3, 3),
        bounds,
        scale,
        crs,
        transform,
        true,
        1e13,
        4
      );

      table.evaluate((t, failure) => {
        if (failure !== undefined && currentChartID === thisChartID) {
          showMessage("Charting Error", failure);
        } else if (currentChartID === thisChartID) {
          const total_area = Object.values(t)[0]
            .slice(0, 2)
            .map((i) => i[1])
            .reduce((a, b) => a + b, 0);

          const sankey_dict = { source: [], target: [], value: [] };
          let sankeyPalette = [];
          let labels = [];
          let raw_labels = [];
          let label_code_dict = {};
          let label_code_i = 0;
          let years = [];
          let geojsonT = {};
          Object.keys(t).map((k) =>
            years.push(
              k.split("---")[0].split("--")[0],
              k.split("---")[1].split("--")[0]
            )
          );
          Object.keys(t).map((k) =>
            raw_labels.push(
              k.split("---")[0].split("--")[1],
              k.split("---")[1].split("--")[1]
            )
          );
          years = unique(years);
          raw_labels = unique(raw_labels)
            .map((n) => parseInt(n))
            .sort((a, b) => {
              return a - b;
            });

          years.map((yr) => {
            areaChartCollections[whichAreaChartCollection].names.map((nm) => {
              const outNm = yr + " " + nm;
              labels.push(outNm);
              label_code_dict[outNm] = label_code_i;
              label_code_i++;
            });
            areaChartCollections[whichAreaChartCollection].colors.map((nm) => {
              sankeyPalette.push(nm);
            });
          });

          let mult;
          if (areaChartFormat === "Percentage") {
            mult = (1 / total_area) * 100;
          } else {
            mult = chartFormatDict[areaChartFormat].mult;
          }
          let dataMatrix = [];
          let yri = 1;
          years.slice(0, years.length - 1).map((yr) => {
            let startYearPair = yr;
            let endYearPair = years[yri];
            yri++;
            let dataMatrixHeader = [""];
            raw_labels.map((l) =>
              dataMatrixHeader.push(
                endYearPair +
                  " " +
                  areaChartCollections[whichAreaChartCollection].names[l - 1]
              )
            );
            dataMatrix.push(dataMatrixHeader);

            raw_labels.map((from) => {
              let row = [
                startYearPair +
                  " " +
                  areaChartCollections[whichAreaChartCollection].names[
                    from - 1
                  ],
              ];
              raw_labels.map((to) => {
                let k = `${startYearPair}--${from}---${endYearPair}--${to}`;
                let v = t[k][1][1] * mult;
                row.push(v);
              });
              dataMatrix.push(row);
            });
            dataMatrix.push([""]);
          });
          dataMatrix = dataMatrix.slice(0, dataMatrix.length - 1);

          dataTable = dataMatrix;

          Object.keys(t).map((k) => {
            const startRange = k.split("---")[0].split("--")[0];
            const endRange = k.split("---")[1].split("--")[0];

            const transitionFromClassI =
              parseInt(k.split("---")[0].split("--")[1]) - 1;
            const transitionToClassI =
              parseInt(k.split("---")[1].split("--")[1]) - 1;
            const transitionFromClassName =
              areaChartCollections[whichAreaChartCollection].names[
                transitionFromClassI
              ];
            const transitionToClassName =
              areaChartCollections[whichAreaChartCollection].names[
                transitionToClassI
              ];
            const v = t[k][1][1] * mult;

            const fromLabel = startRange + " " + transitionFromClassName;
            const toLabel = endRange + " " + transitionToClassName;

            geojsonT[k] = v;
            sankey_dict.source.push(label_code_dict[fromLabel]);
            sankey_dict.target.push(label_code_dict[toLabel]);
            sankey_dict.value.push(v);
          });

          function getSankeyPlot(
            canvasID,
            thickness = 20,
            nodePad = 25,
            fontSize = 10
          ) {
            sankey_dict.hovertemplate =
              "%{value}" +
              chartFormatDict[areaChartFormat].label +
              " %{source.label}-%{target.label}<extra></extra>";

            let data = {
              type: "sankey",
              orientation: "h",
              node: {
                pad: nodePad,
                thickness: thickness,
                line: {
                  color: "black",
                  width: 0.5,
                },
                label: labels,
                color: sankeyPalette,
                hovertemplate:
                  "%{value}" +
                  chartFormatDict[areaChartFormat].label +
                  " %{label}<extra></extra>",
              },

              link: sankey_dict,
            };
            console.log(labels);
            console.log(sankeyPalette);
            console.log(sankey_dict);
            data = [data];

            const layout = {
              title: name,
              font: {
                size: fontSize,
              },
              autosize: true,
              margin: {
                l: 25,
                r: 25,
                b: 25,
                t: 50,
                pad: 4,
              },
              paper_bgcolor: "#DDD",
              plot_bgcolor: "#DDD",
            };
            const config = {
              toImageButtonOptions: {
                format: "png", // one of png, svg, jpeg, webp
                filename: name,
                width: 1000,
                height: 600,
              },
              scrollZoom: true,
              displayModeBar: false,
            };
            return Plotly.newPlot(canvasID, data, layout, config);
          }

          configChartModal("Plotly");
          getSankeyPlot(
            "chart-canvas",
            (thickness = 20),
            (nodePad = 25),
            (fontSize = 10)
          );

          plotlyDownloadChartObject = getSankeyPlot(
            "chart-download-canvas",
            (thickness = 40),
            (nodePad = 20),
            (fontSize = 20)
          );

          $("#chart-download-dropdown").empty();
          $("#chart-modal-footer").append(`<div class="dropdown">
												<div class=" dropdown-toggle"  id="chartDownloadDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
													Download
												</div>
												<div id = 'chart-download-dropdown' class="dropdown-menu px-2" aria-labelledby="chartDownloadDropdown">
													<a class="dropdown-item" href="#" onclick = "downloadPlotly(plotlyDownloadChartObject,'${name}.png')">PNG</a>
													<a class="dropdown-item" href="#" onclick = "exportToCsv('${name}.csv', dataTable)">CSV</a>
												</div>
												</div>
												
												</div>
												<div class="dropdown">
												<div class=" dropdown-toggle"  id="chartTypeDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
													Chart Type
												</div>
												<div id = 'chart-type-dropdown' class="dropdown-menu px-2" aria-labelledby="chartTypeDropdown">
													<a class="dropdown-item" href="#" onclick = "toggleChartTable('chart');">Sankey Chart</a>
													<a class="dropdown-item" href="#" onclick = "toggleChartTable('table')">Table</a>
												</div>
												</div>
												
												`);

          const chartTableHTML = htmlTable(dataTable);
          $("#chart-table").append(chartTableHTML);
          toggleChartTable(localStorage.tableOrChart);
          area.evaluate(function (i, failure) {
            areaGeoJson = i;
            areaGeoJson["properties"] = geojsonT;
            if (
              failure === undefined &&
              areaGeoJson !== undefined &&
              areaGeoJson !== null
            ) {
              $("#chart-download-dropdown").append(
                `<a class="dropdown-item" href="#" onclick = "exportJSON('${name}.geojson', areaGeoJson)">geoJSON</a>`
              );
            } else {
              showMessage(
                "Error",
                "Could not convert summary area to geoJSON " + failure
              );
            }
          });
          ga(
            "send",
            "event",
            mode,
            "sankeyAreaChart",
            whichAreaChartCollection
          );
          $("#chart-modal").modal();
        }
        $("#summary-spinner").slideUp();
      });
    } else {
      $("#summary-spinner").slideUp();
    }
  } else {
    const areaChartCollection =
      areaChartCollections[whichAreaChartCollection].collection;
    let xAxisProperty =
      areaChartCollections[whichAreaChartCollection].xAxisProperty;
    let xAxisLabel = areaChartCollections[whichAreaChartCollection].xAxisLabel;
    let yAxisLabel = areaChartCollections[whichAreaChartCollection].yAxisLabel;
    const dateFormat =
      areaChartCollections[whichAreaChartCollection].dateFormat;
    if (xAxisProperty === null || xAxisProperty == undefined) {
      xAxisProperty = "year";
    }
    if (xAxisLabel === null || xAxisLabel == undefined) {
      xAxisLabel = null;
    }
    if (yAxisLabel === null || yAxisLabel == undefined) {
      yAxisLabel = "% Area";
    }
    yAxisLabel = areaChartFormatDict[areaChartFormat].label;
    const totalArea = area.area(1000);
    if (["Acres", "Hectares"].indexOf(areaChartFormat) > -1) {
      multiplier = totalArea.multiply(
        areaChartFormatDict[areaChartFormat].mult
      );
    } else {
      multiplier = areaChartFormatDict[areaChartFormat].mult;
    }

    let bandNames = ee.Image(areaChartCollection.first()).bandNames().getInfo();
    bandNames = bandNames.map(function (bn) {
      return (
        bn.replaceAll("_", " ") +
        " " +
        areaChartFormatDict[areaChartFormat].label
      );
    });
    bandNames.unshift(xAxisProperty);

    let table = getAreaSummaryTable(
      areaChartCollection,
      area,
      xAxisProperty,
      multiplier,
      dateFormat,
      crs,
      transform,
      scale,
      areaChartCollections[whichAreaChartCollection]
    );

    let iteration = 0;
    const maxIterations = 60;
    const success = false;
    const maxTime = 10000;
    const startTime = new Date();
    let tableT;
    function evalTable() {
      table.evaluate(function (tableT, failure) {
        const endTime = new Date();
        const dt = endTime - startTime;

        if (
          failure !== undefined &&
          iteration < maxIterations &&
          currentChartID === thisChartID &&
          dt < maxTime
        ) {
          evalTable();
        } else if (failure === undefined && currentChartID === thisChartID) {
          tableT.unshift(bandNames);
          console.log(tableT);
          $("#summary-spinner").slideUp();
          const stackedAreaChart =
            areaChartCollections[whichAreaChartCollection].stacked;
          const steppedLine =
            areaChartCollections[whichAreaChartCollection].steppedLine;
          const colors = areaChartCollections[whichAreaChartCollection].colors;
          let chartType =
            areaChartCollections[whichAreaChartCollection].chartType;
          const fieldsHidden =
            areaChartCollections[whichAreaChartCollection].fieldsHidden;
          if (chartType === null || chartType === undefined) {
            chartType = "line";
          }
          ga("send", "event", mode, "areaChart", whichAreaChartCollection);
          addChartJS(
            tableT,
            name,
            chartType,
            stackedAreaChart,
            steppedLine,
            colors,
            xAxisLabel,
            yAxisLabel,
            fieldsHidden
          );

          area.evaluate(function (i, failure) {
            areaGeoJson = i;
            areaGeoJson[name] = tableT;
            if (
              failure === undefined &&
              areaGeoJson !== undefined &&
              areaGeoJson !== null
            ) {
              $("#chart-download-dropdown").append(
                `<a class="dropdown-item" href="#" onclick = "exportJSON('${name}.geojson', areaGeoJson)">geoJSON</a>`
              );
            } else {
              showMessage(
                "Error",
                "Could not convert summary area to geoJSON " + failure
              );
            }
          });
          // }
          areaChartingCount--;
        } else if (failure !== undefined) {
          $("#summary-spinner").slideUp();
          if (
            failure.indexOf(
              "Dictionary.toArray: Unable to convert dictionary to array"
            ) > -1 ||
            failure.indexOf("Array: Parameter 'values' is required.") > -1
          ) {
            failure =
              "Most likely selected area does not overlap with selected LCMS study area<br>Please select area that overlaps with products<br>Raw Error Message:<br>" +
              failure;
          }
          showMessage(
            '<i class="text-dark text-uppercase fa fa-exclamation-triangle"></i> Error! Try again',
            failure
          );
        }
        iteration++;
      });
    }
    evalTable();
  }
}
function fixGeoJSONZ(f) {
  console.log("getting rid of z");
  f.features = f.features.map(function (f) {
    if (f.geometry.type.indexOf("Multi") === -1) {
      f.geometry.coordinates = f.geometry.coordinates.map(function (c) {
        return c.map(function (i) {
          return i.slice(0, 2);
        });
      });
    } else {
      f.geometry.coordinates = f.geometry.coordinates.map(function (c1) {
        return c1.map(function (c2) {
          return c2.map(function (i) {
            return i.slice(0, 2);
          });
        });
      });
    }

    return f;
  });
  console.log(f);

  return f;
}
function runShpDefinedCharting() {
  clearUploadedAreas();
  if (jQuery("#areaUpload")[0].files.length > 0) {
    try {
      udp.setMap(null);
    } catch (err) {
      console.log(err);
    }

    $("#summary-spinner").slideDown();

    const name = jQuery("#areaUpload")[0].files[0].name.split(".")[0];

    map.setOptions({ draggableCursor: "progress" });
    map.setOptions({ cursor: "progress" });

    convertToGeoJSON("areaUpload").done(function (convertedRaw) {
      console.log("successfully converted to JSON");
      console.log(convertedRaw);
      console.log("compressing geoJSON");
      const converted = compressGeoJSON(convertedRaw, uploadReductionFactor);
      console.log(converted);
      //First try assuming the geoJSON has spatial info
      let area;
      try {
        area = ee.FeatureCollection(
          converted.features.map(function (t) {
            return ee.Feature(t).dissolve(100, ee.Projection("EPSG:4326"));
          })
        );
        console.log("N features to summarize ");
        const nFeatures = area.size().getInfo();
        console.log(nFeatures);
        if (nFeatures == 0) {
          showMessage(
            "No Features Found",
            "Found " +
              nFeatures.toString() +
              " in provided file. Please select a file with features."
          );
          $("#summary-spinner").hide();
          return;
        }
      } catch (err) {
        //Fix it if not
        err = err.toString();
        console.log("Error");
        console.log(err);
        if (err.indexOf("Error: Invalid GeoJSON geometry:") > -1) {
          try {
            let area = ee.FeatureCollection(
              fixGeoJSONZ(converted).features.map(function (t) {
                return ee.Feature(t).dissolve(100, ee.Projection("EPSG:4326"));
              })
            );
            console.log("N features to summarize ");
            console.log(area.size().getInfo());
          } catch (err) {
            err = err.toString();
            console.log(err);
            if (err.indexOf("413") > -1) {
              showMessage(
                '<i class="text-dark text-uppercase fa fa-exclamation-triangle"></i> Error Ingesting Study Area!',
                'Provided vector has too many vertices.<br>Try increasing the "Vertex Reduction Factor" slider by one and then rerunning.'
              );
            } else {
              showMessage(
                '<i class="text-dark text-uppercase fa fa-exclamation-triangle"></i> Error Ingesting Study Area!',
                err
              );
            }
            $("#summary-spinner").hide();
            return;
          }
        } else {
          if (err.indexOf("413") > -1) {
            showMessage(
              '<i class="text-dark text-uppercase fa fa-exclamation-triangle"></i> Error Ingesting Study Area!',
              'Provided vector has too many vertices.<br>Try increasing the "Vertex Reduction Factor" slider by one and then rerunning.'
            );
          } else {
            showMessage(
              '<i class="text-dark text-uppercase fa fa-exclamation-triangle"></i> Error Ingesting Study Area!',
              err
            );
          }
          $("#summary-spinner").hide();
          return;
        }
      }

      Map.addLayer(
        area,
        { isUploadedLayer: true },
        name,
        true,
        null,
        null,
        name + " for area summarizing",
        "area-charting-shp-layer-list"
      );
      Map.centerObject(area, false);
      $("#summary-spinner").slideUp();
      if (Object.keys(areaChart.areaChartObj).length > 0) {
        areaChart.clearCharts();
        areaChart.chartArea(area, name);
      } else {
        makeAreaChart(area, name);
      }
    });
  } else {
    showMessage(
      "No Summary Area Selected",
      "Please select a .zip shapefile or a .geojson file to summarize across"
    );
  }
}
// new function based on runShpDefinedCharting that is for adding a user defined shp, geojson, etc without doing any charting -EH
function runShpDefinedAddLayer() {
  if (jQuery("#areaUpload")[0].files.length > 0) {
    const name = jQuery("#areaUpload")[0].files[0].name.split(".")[0];

    map.setOptions({ draggableCursor: "progress" });
    map.setOptions({ cursor: "progress" });

    convertToGeoJSON("areaUpload").done(function (convertedRaw) {
      console.log("successfully converted to JSON");
      console.log(convertedRaw);

      if (
        convertedRaw.features.map(function (f) {
          f.geometry.type == "Point" || "MultiPoint";
        })
      ) {
        Map.addLayer(
          convertedRaw.features.map((pts) => {
            return ee.Feature(pts).buffer(8);
          }),
          { layerType: "geeVectorImage" },
          name,
          true,
          null,
          null,
          name,
          "reference-layer-list"
        );
      } else {
        Map.addLayer(
          convertedRaw,
          { layerType: "geoJSONVector" },
          name,
          true,
          null,
          null,
          name,
          "reference-layer-list"
        );
      }
    });
  } else {
    showMessage(
      "No Summary Area Selected",
      "Please select a .zip shapefile or a .geojson file to add to viewer"
    );
  }
}
function startShpDefinedCharting() {
  turnOnUploadedLayers();
  if (
    selectionTracker.uploadedLayerIndices === undefined ||
    selectionTracker.uploadedLayerIndices === null
  ) {
    selectionTracker.uploadedLayerIndices = [];
  }
}
function stopAreaCharting() {
  window.removeEventListener("keydown", restartUserDefinedAreaCarting);
  window.removeEventListener("keydown", undoUserDefinedAreaCharting);

  try {
    Object.keys(udpPolygonObj).map(function (k) {
      udpPolygonObj[k].setMap(null);
    });
    udpPolygonObj = {};
    udpPolygonNumber = 1;
    updateUserDefinedAreaArea();
  } catch (err) {}

  $("#areaUpload").unbind("change");
  $("#summary-spinner").slideUp();
}

function startQuery() {
  areaGeoJson = null;
  try {
    udp.setMap(null);
  } catch (err) {
    console.log(err);
  }
  if (queryWindowMode !== "infoWindow") {
    $("#chart-collapse-label-chart-collapse-div").show();
  }
  google.maps.event.clearListeners(mapDiv, "dblclick");
  google.maps.event.clearListeners(mapDiv, "click");

  map.setOptions({ draggableCursor: "help" });
  map.setOptions({ cursor: "help" });
  mapHammer = new Hammer(document.getElementById("map"));
  mapHammer.on("doubletap", function (e) {
    if (exportAreaDrawingActive == false) {
      $("#summary-spinner").slideDown();
      map.setOptions({ draggableCursor: "progress" });
      map.setOptions({ cursor: "progress" });

      print("Map was double clicked");
      const x = e.center.x;
      const y = e.center.y;
      center = point2LatLng(x, y);

      const pt = ee.Geometry.Point([center.lng(), center.lat()]);
      const plotBounds = pt.buffer(plotRadius).bounds();
      addClickMarker(plotBounds);

      marker.setMap(map);

      getQueryImages(center.lng(), center.lat());
    }
  });
}
function stopQuery() {
  try {
    mapHammer.destroy();
    map.setOptions({ draggableCursor: "" });
    map.setOptions({ cursor: "" });

    google.maps.event.clearListeners(mapDiv, "dblclick");
    map.setOptions({ cursor: "hand" });
    infowindow.setMap(null);
    marker.setMap(null);
    $("#legendDiv").css("max-width", "");
    $("#chart-collapse-div").empty();
    $("#chart-collapse-label-chart-collapse-div").hide();
  } catch (err) {}
}
function getImageCollectionValuesForCharting(pt) {
  const icT = ee.ImageCollection(chartCollection.filterBounds(pt));
  const tryCount = 2;
  try {
    const allValues = icT.getRegion(pt, scale, crs, transform).evaluate();
    print(allValues);
    return allValues;
  } catch (err) {
    showMessage(
      '<i class="text-dark text-uppercase fa fa-exclamation-triangle"></i> Charting error',
      err.message
    );
  }
}
Date.prototype.yyyymmdd = function () {
  const mm = this.getMonth() + 1; // is zero-based
  const dd = this.getDate();

  return [this.getFullYear(), !mm[1] && "0", mm, !dd[1] && "0", dd].join(""); // padding
};
function getDataTable(pt) {
  let values = getImageCollectionValuesForCharting(pt);
  globalChartValues = values;
  let startColumn;
  if (chartIncludeDate) {
    startColumn = 3;
  } else {
    startColumn = 4;
  }
  const header = values[0].slice(startColumn);

  values = values
    .slice(1)
    .map(function (v) {
      return v.slice(startColumn);
    })
    .sort(sortFunction);

  print(values);
  if (chartIncludeDate) {
    values = values.map(function (v) {
      const d = [new Date(v[0])];
      v.slice(1).map(function (vt) {
        d.push(vt);
      });
      return d;
    });
  }

  const forChart = [header];
  values.map(function (v) {
    forChart.push(v);
  });

  return forChart;
}

//////////////////////////////////////////////////////////////////
//ChartJS code
function downloadChartJS(chart, name) {
  const link = document.createElement("a");
  link.download = name;
  link.href = chart.toBase64Image();
  link.click();
  // delete link;
  ga("send", "event", mode, getActiveTools()[0] + "-chartDownload", "png");
}

function scalePlotlyChart(data, layout, scale = 2) {
  try {
    layout.font.size = parseInt(layout.font.size * scale);
  } catch (err) {}
  try {
    layout.legend.font.size = parseInt(layout.legend.font.size * scale);
  } catch (err) {}
  try {
    layout.xaxis.title.font.size = parseInt(
      layout.xaxis.title.font.size * scale
    );
  } catch (err) {}
  try {
    layout.xaxis.tickfont.size = parseInt(layout.xaxis.tickfont.size * scale);
  } catch (err) {}
  try {
    layout.yaxis.title.font.size = parseInt(
      layout.yaxis.title.font.size * scale
    );
  } catch (err) {}
  try {
    layout.yaxis.tickfont.size = parseInt(layout.yaxis.tickfont.size * scale);
  } catch (err) {}

  if (layout.margin !== undefined) {
    ["l", "r", "b", "t", "pad"].map((k) => {
      try {
        layout.margin[k] = parseInt(layout.margin[k] * scale);
      } catch (err) {}
    });
  }

  let outData = [];
  data.map((d) => {
    try {
      d.textfont.size = parseInt(d.textfont.size * scale);
    } catch (err) {}
    try {
      d.node.pad = parseInt(d.node.pad * scale);
    } catch (err) {}
    try {
      d.node.thickness = parseInt(d.node.thickness * scale);
    } catch (err) {}
    try {
      d.line.width = parseInt(d.line.width * scale);
    } catch (err) {}
    try {
      d.marker.size = parseInt(d.marker.size * scale);
    } catch (err) {}
    outData.push(d);
  });

  return [outData, layout];
}
function downloadPlotly(
  plotlyDownloadChartObject,
  name,
  useBiggerFrame = true,
  scale = 2,
  chartContainerID = "chart-download-canvas"
) {
  const currentChart = document.getElementById(chartContainerID);

  let width = currentChart.layout.width;
  let height = currentChart.layout.height;

  if (useBiggerFrame) {
    width = width * scale;
    height = height * scale;
    let dataLayout = scalePlotlyChart(
      currentChart.data,
      currentChart.layout,
      scale
    );
    Plotly.update(currentChart, dataLayout[0], dataLayout[1]);
  }
  Plotly.downloadImage(chartContainerID, {
    format: "png",
    width: width,
    height: height,
    filename: name,
  });
  ga(
    "send",
    "event",
    mode,
    getActiveTools()[0] + "-plotly-chartDownload",
    "png"
  );
  if (useBiggerFrame) {
    let dataLayout = scalePlotlyChart(
      currentChart.data,
      currentChart.layout,
      1 / scale
    );
    Plotly.update(currentChart, dataLayout[0], dataLayout[1]);
  }
}
Chart.pluginService.register({
  beforeDraw: function (chart, easing) {
    if (
      chart.config.options.chartArea &&
      chart.config.options.chartArea.backgroundColor
    ) {
      const helpers = Chart.helpers;
      const ctx = chart.chart.ctx;
      const chartArea = chart.chartArea;

      ctx.save();
      ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
      ctx.fillRect(
        chartArea.left - 90,
        chartArea.top - 40,
        chartArea.right - chartArea.left + 190,
        chartArea.bottom - chartArea.top + 350
      );
      ctx.restore();
    }
  },
});
const dataToTable = function (dataset) {
  let html = "<table>";
  html += '<thead><tr><th style="width:120px;">#</th>';

  let columnCount = 0;
  jQuery.each(dataset.datasets, function (idx, item) {
    html +=
      '<th style="background-color:' +
      item.fillColor +
      ';">' +
      item.label +
      "</th>";
    columnCount += 1;
  });

  html += "</tr></thead>";

  jQuery.each(dataset.labels, function (idx, item) {
    html += "<tr><td>" + item + "</td>";
    for (i = 0; i < columnCount; i++) {
      html +=
        '<td style="background-color:' +
        dataset.datasets[i].fillColor +
        ';">' +
        (dataset.datasets[i].data[idx] === "0"
          ? "-"
          : dataset.datasets[i].data[idx]) +
        "</td>";
    }
    html += "</tr>";
  });

  html += "</tr><tbody></table>";

  return html;
};
let chartJSChart;
window.plotlyDownloadChartObject;
let chartType;
if (
  localStorage.tableOrChart === undefined ||
  localStorage.tableOrChart === null
) {
  localStorage.tableOrChart = "chart";
}

addModal("main-container", "chart-modal");
function configChartModal(chartPlatform = "chartJS") {
  const h = $(document).height();
  const w = $(document).width();
  if (h / w > 1) {
    canvasHeight = "90%";
    canvasWidth = "100%";
  } else {
    canvasHeight = "50%";
    canvasWidth = "100%";
  }

  clearModal("chart-modal");

  $("#chart-modal-body").append(
    `<div id = 'chart-modal-graph-table-container' class = 'flexcroll chart-table-graph-container'></div>`
  );

  if (chartPlatform === "chartJS") {
    $("#chart-modal-graph-table-container")
      .append(`<div id = 'chart-modal-graph-container' class = 'pb-2'>
	    													<canvas id="chart-canvas" width="${canvasWidth}" height = "${canvasHeight}" ></canvas>
	    												</div>`);
  } else {
    $("#chart-modal-graph-table-container")
      .append(`<div id = 'chart-modal-graph-container' class = 'pb-2'>
	    													<div id="chart-canvas"></div>
	    													<div id="chart-download-canvas" style="display:none;"></div>
	    												</div>`);
  }

  $("#chart-modal-graph-table-container").append(
    `<div id="chart-table" style = 'display:none;' width="${canvasWidth}" height = "${canvasHeight}" ></div>`
  );
}
function addChartJS(
  dt,
  title,
  chartType,
  stacked,
  steppedLine,
  colors,
  xAxisLabel,
  yAxisLabel,
  fieldsHidden
) {
  let displayXAxis = true;
  let displayYAxis = true;
  if (fieldsHidden === null || fieldsHidden === undefined) {
    fieldsHidden = null;
  }
  if (xAxisLabel === null || xAxisLabel === undefined) {
    xAxisLabel = "";
    displayXAxis = false;
  }
  if (yAxisLabel === null || yAxisLabel === undefined) {
    yAxisLabel = "";
    displayYAxis = false;
  }
  if (colors === null || colors === undefined) {
    colors = chartColors;
  }
  if (chartType === null || chartType === undefined) {
    chartType = "line";
  }
  if (stacked === null || stacked === undefined) {
    stacked = false;
  }
  if (steppedLine === undefined || steppedLine == null) {
    steppedLine = false;
  }

  dataTable = dataTableNumbersToNames(dt);
  configChartModal();
  const data = dt.slice(1);
  const firstColumn = arrayColumn(data, 0);
  const columnN = dt[1].length;
  const columns = range(1, columnN);
  const datasets = columns.map(function (i) {
    let fieldHidden = false;
    if (fieldsHidden !== null) {
      fieldHidden = fieldsHidden[i - 1];
    }
    const col = arrayColumn(dt, i);
    const label = col[0];
    let data = col.slice(1);
    data = data.map(function (i) {
      let out;
      try {
        out = i.toFixed(6);
      } catch (err) {
        out = i;
      }

      return out;
    });

    let color = colors[(i - 1) % colors.length];
    if (color.indexOf("#") === -1) {
      color = "#" + color;
    }
    const out = {
      label: label,
      pointStyle: "circle",
      pointRadius: 1,
      data: data,
      fill: false,
      borderColor: color,
      lineTension: 0,
      borderWidth: 2,
      steppedLine: steppedLine,
      showLine: true,
      spanGaps: true,
      hidden: fieldHidden,
    };
    if (stacked) {
      out["fill"] = true;
      out["backgroundColor"] = color;
    }
    return out;
  });
  chartColorI = 0;
  try {
    chartJSChart.destroy();
  } catch (err) {}
  chartJSChart = new Chart($("#chart-canvas"), {
    type: chartType,
    data: { labels: firstColumn, datasets: datasets },
    options: {
      title: {
        display: true,
        position: "top",
        text: title.replaceAll("_", " "),
        fontSize: 16,
      },
      legend: {
        display: true,
        position: "bottom",

        labels: {
          boxWidth: 5,
          usePointStyle: true,
        },
      },
      chartArea: {
        backgroundColor: "#DDD",
      },
      scales: {
        yAxes: [
          {
            stacked: stacked,
            scaleLabel: { display: displayYAxis, labelString: yAxisLabel },
          },
        ],
        xAxes: [
          {
            stacked: stacked,
            scaleLabel: { display: displayXAxis, labelString: xAxisLabel },
            maxBarThickness: 100,
          },
        ],
      },
    },
  });

  $("#chart-download-dropdown").empty();
  $("#chart-modal-footer").append(`<div class="dropdown">
										  <div class=" dropdown-toggle"  id="chartDownloadDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
										    Download
										  </div>
										  <div id = 'chart-download-dropdown' class="dropdown-menu px-2" aria-labelledby="chartDownloadDropdown">
										    <a class="dropdown-item" href="#" onclick = "downloadChartJS(chartJSChart,'${title}.png')">PNG</a>
										    <a class="dropdown-item" href="#" onclick = "exportToCsv('${title}.csv', dataTable)">CSV</a>
										  </div>
										</div>
										
										</div>
										<div class="dropdown">
										  <div class=" dropdown-toggle"  id="chartTypeDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
										    Chart Type
										  </div>
										  <div id = 'chart-type-dropdown' class="dropdown-menu px-2" aria-labelledby="chartTypeDropdown">
										    <a class="dropdown-item" href="#" onclick = "toggleChartTable('chart');change('line',false,${steppedLine});">Line</a>
										    <a class="dropdown-item" href="#" onclick = "toggleChartTable('chart');change('line',true,${steppedLine});">Stacked Line</a>
										    <a class="dropdown-item" href="#" onclick = "toggleChartTable('chart');change('bar',false,${steppedLine});">Bar</a>
										    <a class="dropdown-item" href="#" onclick = "toggleChartTable('chart');change('bar',true,${steppedLine});">Stacked Bar</a>
										    <a class="dropdown-item" href="#" onclick = "toggleChartTable('table')">Table</a>
										  </div>
										</div>
										`);

  const chartTableHTML = htmlTable(dataTable);
  $("#chart-table").append(chartTableHTML);
  toggleChartTable(localStorage.tableOrChart);
  $("#chart-modal").modal();
}

function toggleChartTable(showWhich) {
  if (showWhich === "table") {
    $("#chart-modal-graph-container").hide();
    $("#chart-table").show();
    localStorage.tableOrChart = "table";
  } else if (showWhich === "chart") {
    $("#chart-modal-graph-container").show();
    $("#chart-table").hide();
    localStorage.tableOrChart = "chart";
  } else {
    $("#chart-modal-graph-container").show();
    $("#chart-table").show();
    localStorage.tableOrChart = "both";
  }
}
function change(newType, stacked, steppedLine) {
  if (stacked === undefined || stacked == null) {
    stacked = false;
  }
  if (steppedLine === undefined || steppedLine == null) {
    steppedLine = false;
  }

  const config = chartJSChart.config;
  chartJSChart.destroy();
  config.type = newType;

  const currentScales = config.options.scales;
  currentScales.xAxes[0].stacked = stacked;
  currentScales.yAxes[0].stacked = stacked;
  config.options.scales = currentScales;
  let datasets;
  if (stacked) {
    datasets = config.data.datasets;
    datasets = datasets.map(function (dataset) {
      dataset["fill"] = true;
      dataset["backgroundColor"] = dataset["borderColor"];
      dataset["steppedLine"] = steppedLine;
      return dataset;
    });
    config.data.datasets = datasets;
  } else {
    datasets = config.data.datasets;
    datasets = datasets.map(function (dataset) {
      dataset["fill"] = false;
      dataset["steppedLine"] = false;
      return dataset;
    });
    config.data.datasets = datasets;
  }

  chartJSChart = new Chart($("#chart-canvas"), config);
}
let chartTableDict;
const testTable = JSON.parse(
  '[["id","longitude","latitude","time","Raw NDVI","LANDTRENDR Fitted NDVI","Land Cover Class","Land Use Class","Loss Probability","Gain Probability"],["Landsat_Fmask_allL7_SR_medoid_1984_1986_190_250_1_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1985",-109.74183328494144,42.94571387213776,486432000000,0.6041558441558442,0.61475,0.699999988079071,0.30000001192092896,0,0],["Landsat_Fmask_allL7_SR_medoid_1985_1987_190_250_2_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1986",-109.74183328494144,42.94571387213776,517968000000,0.6490280777537797,0.6148,0.699999988079071,0.30000001192092896,0,0],["Landsat_Fmask_allL7_SR_medoid_1986_1988_190_250_3_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1987",-109.74183328494144,42.94571387213776,549504000000,0.6315240083507307,0.61485,0.699999988079071,0.30000001192092896,0,0],["Landsat_Fmask_allL7_SR_medoid_1987_1989_190_250_4_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1988",-109.74183328494144,42.94571387213776,581126400000,0.6315240083507307,0.6149,0.699999988079071,0.30000001192092896,0,0],["Landsat_Fmask_allL7_SR_medoid_1988_1990_190_250_5_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1989",-109.74183328494144,42.94571387213776,612662400000,0.6353887399463807,0.61495,0.699999988079071,0.30000001192092896,0,0],["Landsat_Fmask_allL7_SR_medoid_1989_1991_190_250_6_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1990",-109.74183328494144,42.94571387213776,644198400000,0.6176795580110498,0.615,0.699999988079071,0.30000001192092896,0,0],["Landsat_Fmask_allL7_SR_medoid_1990_1992_190_250_7_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1991",-109.74183328494144,42.94571387213776,675734400000,0.5684689236988377,0.61505,0.699999988079071,0.30000001192092896,0,0],["Landsat_Fmask_allL7_SR_medoid_1991_1993_190_250_8_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1992",-109.74183328494144,42.94571387213776,707356800000,0.5684689236988377,0.6151,0.699999988079071,0.30000001192092896,0.019999999552965164,0],["Landsat_Fmask_allL7_SR_medoid_1992_1994_190_250_9_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1993",-109.74183328494144,42.94571387213776,738892800000,0.6082029141932002,0.61515,0.699999988079071,0.30000001192092896,0.019999999552965164,0],["Landsat_Fmask_allL7_SR_medoid_1993_1995_190_250_10_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1994",-109.74183328494144,42.94571387213776,770428800000,0.5819209039548022,0.6152000000000001,0.699999988079071,0.30000001192092896,0.05000000074505806,0],["Landsat_Fmask_allL7_SR_medoid_1994_1996_190_250_11_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1995",-109.74183328494144,42.94571387213776,801964800000,0.6067796610169491,0.6152500000000001,0.699999988079071,0.30000001192092896,0.05000000074505806,0],["Landsat_Fmask_allL7_SR_medoid_1995_1997_190_250_12_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1996",-109.74183328494144,42.94571387213776,833587200000,0.6067796610169491,0.6153000000000001,0.699999988079071,0.30000001192092896,0.019999999552965164,0],["Landsat_Fmask_allL7_SR_medoid_1996_1998_190_250_13_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1997",-109.74183328494144,42.94571387213776,865123200000,0.6450617283950617,0.6153500000000001,0.699999988079071,0.30000001192092896,0.03999999910593033,0.009999999776482582],["Landsat_Fmask_allL7_SR_medoid_1997_1999_190_250_14_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1998",-109.74183328494144,42.94571387213776,896659200000,0.6450617283950617,0.6154000000000001,0.699999988079071,0.30000001192092896,0.019999999552965164,0],["Landsat_Fmask_allL7_SR_medoid_1998_2000_190_250_15_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1999",-109.74183328494144,42.94571387213776,928195200000,0.6054347826086957,0.61545,0.699999988079071,0.30000001192092896,0.07999999821186066,0],["Landsat_Fmask_allL7_SR_medoid_1999_2001_190_250_16_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2000",-109.74183328494144,42.94571387213776,959817600000,0.6196961760083813,0.6155,0.699999988079071,0.30000001192092896,0.10999999940395355,0],["Landsat_Fmask_allL7_SR_medoid_2000_2002_190_250_17_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2001",-109.74183328494144,42.94571387213776,991353600000,0.625,0.61555,0.699999988079071,0.30000001192092896,0.20999999344348907,0],["Landsat_Fmask_allL7_SR_medoid_2001_2003_190_250_18_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2002",-109.74183328494144,42.94571387213776,1022889600000,0.625,0.6156,0.699999988079071,0.30000001192092896,0.3700000047683716,0],["Landsat_Fmask_allL7_SR_medoid_2002_2004_190_250_19_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2003",-109.74183328494144,42.94571387213776,1054425600000,0.5976331360946746,0.61565,0.699999988079071,0.30000001192092896,0.30000001192092896,0],["Landsat_Fmask_allL7_SR_medoid_2003_2005_190_250_20_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2004",-109.74183328494144,42.94571387213776,1086048000000,0.6184004181913225,0.6157,0.699999988079071,0.30000001192092896,0.23999999463558197,0],["Landsat_Fmask_allL7_SR_medoid_2004_2006_190_250_21_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2005",-109.74183328494144,42.94571387213776,1117584000000,0.6023643202579259,0.6050375,0.699999988079071,0.30000001192092896,0.3799999952316284,0],["Landsat_Fmask_allL7_SR_medoid_2005_2007_190_250_22_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2006",-109.74183328494144,42.94571387213776,1149120000000,0.5668202764976958,0.594375,0.699999988079071,0.30000001192092896,0.3100000023841858,0],["Landsat_Fmask_allL7_SR_medoid_2006_2008_190_250_23_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2007",-109.74183328494144,42.94571387213776,1180656000000,0.5428024868483978,0.5837125000000001,0.699999988079071,0.30000001192092896,0.7099999785423279,0],["Landsat_Fmask_allL7_SR_medoid_2007_2009_190_250_24_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2008",-109.74183328494144,42.94571387213776,1212278400000,0.6413103831204887,0.5730500000000001,0.699999988079071,0.30000001192092896,0.5099999904632568,0],["Landsat_Fmask_allL7_SR_medoid_2008_2010_190_250_25_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2009",-109.74183328494144,42.94571387213776,1243814400000,0.5547407019381875,0.5623875,0.699999988079071,0.30000001192092896,0.8799999952316284,0],["Landsat_Fmask_allL7_SR_medoid_2009_2011_190_250_26_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2010",-109.74183328494144,42.94571387213776,1275350400000,0.5532495903877663,0.551725,0.699999988079071,0.30000001192092896,0.550000011920929,0],["Landsat_Fmask_allL7_SR_medoid_2010_2012_190_250_27_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2011",-109.74183328494144,42.94571387213776,1306886400000,0.5532495903877663,0.5410625,0.699999988079071,0.30000001192092896,0.5199999809265137,0],["Landsat_Fmask_allL7_SR_medoid_2011_2013_190_250_28_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2012",-109.74183328494144,42.94571387213776,1338508800000,0.5121196493037647,0.5304,0.699999988079071,0.30000001192092896,0.7799999713897705,0.019999999552965164],["Landsat_Fmask_allL7_SR_medoid_2012_2014_190_250_29_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2013",-109.74183328494144,42.94571387213776,1370044800000,0.5759870200108166,0.5492714285714286,0.699999988079071,0.30000001192092896,0.10999999940395355,0.15000000596046448],["Landsat_Fmask_allL7_SR_medoid_2013_2015_190_250_30_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2014",-109.74183328494144,42.94571387213776,1401580800000,0.5555555555555556,0.5681428571428572,0.699999988079071,0.30000001192092896,0.17000000178813934,0.09000000357627869],["Landsat_Fmask_allL7_SR_medoid_2014_2016_190_250_31_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2015",-109.74183328494144,42.94571387213776,1433116800000,0.6195835678109173,0.5870142857142857,0.699999988079071,0.30000001192092896,0.07999999821186066,0.029999999329447746],["Landsat_Fmask_allL7_SR_medoid_2015_2017_190_250_32_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2016",-109.74183328494144,42.94571387213776,1464739200000,0.6360619469026548,0.6058857142857144,0.699999988079071,0.30000001192092896,0.14000000059604645,0.14000000059604645],["Landsat_Fmask_allL7_SR_medoid_2016_2018_190_250_33_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2017",-109.74183328494144,42.94571387213776,1496275200000,0.6152263374485596,0.6247571428571429,0.699999988079071,0.30000001192092896,0.05000000074505806,0.11999999731779099],["Landsat_Fmask_allL7_SR_medoid_2017_2019_190_250_34_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2018",-109.74183328494144,42.94571387213776,1527811200000,0.656484727090636,0.6436285714285715,0.699999988079071,0.30000001192092896,0.17000000178813934,0.1899999976158142],["Landsat_Fmask_allL7_SR_medoid_2018_2020_190_250_35_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2019",-109.74183328494144,42.94571387213776,1559347200000,0.6271186440677967,0.6625,0.699999988079071,0.30000001192092896,0.1599999964237213,0.3199999928474426]]'
);
function dataTableNumbersToNames(dataTable) {
  if (
    pixelChartCollections[whichPixelChartCollection].chartTableDict !== null &&
    pixelChartCollections[whichPixelChartCollection].chartTableDict !==
      undefined
  ) {
    chartTableDict =
      pixelChartCollections[whichPixelChartCollection].chartTableDict;
  } else {
    chartTableDict = null;
  }

  const header = dataTable[0];
  header[0] = header[0].toProperCase();
  const outTable = [header];
  dataTable.slice(1).map(function (r) {
    const row = [];
    jQuery.each(r, function (i, value) {
      const label = header[i];

      let tableValue;

      if (
        chartTableDict !== null &&
        chartTableDict[label] !== null &&
        chartTableDict[label] !== undefined &&
        value !== undefined
      ) {
        const keys = Object.keys(chartTableDict[label]);
        const whichKey = keys.filter(function (k) {
          return Math.abs(k - value) < 0.0001;
        });

        tableValue = chartTableDict[label][whichKey];
        if (tableValue === null || tableValue === undefined) {
          try {
            value = value.formatNumber();
          } catch (err) {}
          tableValue = value;
        }
      } else {
        try {
          value = value.toFixed(6);
        } catch (err) {}
        tableValue = value;
      }
      if (tableValue === null) {
        tableValue = "";
      }
      row.push(tableValue);
    });
    outTable.push(row);
  });
  return outTable;
}
function htmlTable(table) {
  let html =
    '<div class = "flexcroll chart-table text-black"><table class="table  table-hover">';
  html += "<thead><tr>";
  const header = dataTable[0];

  header.map(function (label) {
    html += '<th  class = "chart-table-first-row bg-black">' + label + "</th>";
  });
  html += "</tr></thead>";

  table.slice(1).map(function (r) {
    html += "<tr>";
    html += '<td class = "chart-table-first-column bg-black">' + r[0] + "</td>";
    let columnI = 1;
    r.slice(1).map(function (value) {
      html += "<td>" + value + "</td>";
      columnI++;
    });
    html += "</tr>";
  });
  html += "</tr><tbody></table></div>";
  return html;
}

let d = [
  [
    "time",
    "NDVI",
    "NDVI_LT_fitted",
    "Land Cover Class",
    "Land Use Class",
    "Loss Probability",
    "Gain Probability",
  ],
  [
    "1985",
    0.6456953642384106,
    null,
    0.6000000238418579,
    0.30000001192092896,
    0.019999999552965164,
    0,
  ],
  [
    "1986",
    0.6456953642384106,
    0.6573789473684211,
    0.6000000238418579,
    0.30000001192092896,
    0,
    0,
  ],
  [
    "1987",
    0.6456953642384106,
    0.6598578947368421,
    0.6000000238418579,
    0.30000001192092896,
    0,
    0,
  ],
  [
    "1988",
    0.6934156378600823,
    0.6623368421052632,
    0.6000000238418579,
    0.30000001192092896,
    0,
    0,
  ],
  [
    "1989",
    0.6934156378600823,
    0.6648157894736842,
    0.6000000238418579,
    0.30000001192092896,
    0,
    0,
  ],
  [
    "1990",
    0.6934156378600823,
    0.6672947368421053,
    0.6000000238418579,
    0.30000001192092896,
    0,
    0,
  ],
  ["1991", null, 0.6697736842105264, null, null, null, null],
  ["1992", null, 0.6722526315789473, null, null, null, null],
  ["1993", null, 0.6747315789473685, null, null, null, null],
  [
    "1994",
    0.6439862542955326,
    0.6772105263157895,
    0.6000000238418579,
    0.30000001192092896,
    0,
    0,
  ],
  [
    "1995",
    0.6439862542955326,
    0.6796894736842105,
    0.6000000238418579,
    0.30000001192092896,
    0,
    0,
  ],
  [
    "1996",
    0.6439862542955326,
    0.6821684210526316,
    0.6000000238418579,
    0.30000001192092896,
    0,
    0,
  ],
  ["1997", null, 0.6846473684210527, null, null, null, null],
  [
    "1998",
    0.7261107729762629,
    0.6871263157894737,
    0.6000000238418579,
    0.30000001192092896,
    0.1599999964237213,
    0,
  ],
  [
    "1999",
    0.7261107729762629,
    0.6896052631578948,
    0.6000000238418579,
    0.30000001192092896,
    0.07999999821186066,
    0,
  ],
  [
    "2000",
    0.6856763925729443,
    0.6920842105263157,
    0.6000000238418579,
    0.30000001192092896,
    0.09000000357627869,
    0,
  ],
  [
    "2001",
    0.6856763925729443,
    0.6945631578947369,
    0.6000000238418579,
    0.30000001192092896,
    0.07000000029802322,
    0,
  ],
  [
    "2002",
    0.7016229712858926,
    0.6970421052631579,
    0.6000000238418579,
    0.30000001192092896,
    0.05000000074505806,
    0,
  ],
  [
    "2003",
    0.6268958543983821,
    0.6995210526315789,
    0.6000000238418579,
    0.30000001192092896,
    0,
    0,
  ],
  [
    "2004",
    0.766839378238342,
    0.7020000000000001,
    0.6000000238418579,
    0.30000001192092896,
    0,
    0,
  ],
  ["2005", 0.1652502360717658, 0.1652, 0.10000000149011612, 0.5, 0.75, 0],
  [
    "2006",
    0.37468030690537085,
    0.21481538461538469,
    0.10000000149011612,
    0.6000000238418579,
    0.07999999821186066,
    0.07999999821186066,
  ],
  [
    "2007",
    0.37468030690537085,
    0.26443076923076925,
    0.4000000059604645,
    0.6000000238418579,
    0.09000000357627869,
    0.05999999865889549,
  ],
  [
    "2008",
    0.44536882972823066,
    0.3140461538461539,
    0.10000000149011612,
    0.5,
    0.12999999523162842,
    0.12999999523162842,
  ],
  [
    "2009",
    0.3751962323390895,
    0.3636615384615385,
    0.4000000059604645,
    0.6000000238418579,
    0.019999999552965164,
    0.07999999821186066,
  ],
  [
    "2010",
    0.3751962323390895,
    0.41327692307692304,
    0.4000000059604645,
    0.6000000238418579,
    0,
    0.10999999940395355,
  ],
  [
    "2011",
    0.4737417943107221,
    0.4628923076923077,
    0.4000000059604645,
    0.6000000238418579,
    0.05999999865889549,
    0.07999999821186066,
  ],
  [
    "2012",
    0.5301810865191147,
    0.5125076923076924,
    0.4000000059604645,
    0.6000000238418579,
    0.12999999523162842,
    0.10000000149011612,
  ],
  [
    "2013",
    0.5709251101321586,
    0.562123076923077,
    0.4000000059604645,
    0.6000000238418579,
    0.05000000074505806,
    0.8399999737739563,
  ],
  [
    "2014",
    0.569609507640068,
    0.6117384615384616,
    0.4000000059604645,
    0.30000001192092896,
    0,
    0.6499999761581421,
  ],
  [
    "2015",
    0.6380090497737556,
    0.6613538461538462,
    0.4000000059604645,
    0.6000000238418579,
    0.019999999552965164,
    0.8700000047683716,
  ],
  [
    "2016",
    0.7084615384615386,
    0.7109692307692308,
    0.4000000059604645,
    0.30000001192092896,
    0,
    0.75,
  ],
  [
    "2017",
    0.7672530446549392,
    0.7605846153846154,
    0.4000000059604645,
    0.30000001192092896,
    0,
    0.6499999761581421,
  ],
];
d = [
  [
    "time",
    "landcover",
    "burnSeverity",
    "cdl",
    "percent_tree_cover",
    "impervious",
    "IDS Mort Type",
    "IDS Mort DCA",
    "IDS Defol Type",
    "IDS Defol DCA",
    "IDS Mort Type Year",
    "IDS Mort DCA Year",
    "IDS Defol Type Year",
    "IDS Defol DCA Year",
  ],
  [1984, , , , , , , , , , , , ,],
  [1985, , , , , , , , , , , , ,],
  [1986, , , , , , , , , , , , ,],
  [1987, , , , , , , , , , , , ,],
  [1988, , , , , , , , , , , , ,],
  [1989, , , , , , , , , , , , ,],
  [1990, , , , , , , , , , , , ,],
  [1991, , , , , , , , , , , , ,],
  [1992, 43, , , , , , , , , , , ,],
  [1993, , , , , , , , , , , , ,],
  [1994, , , , , , , , , , , , ,],
  [1995, , , , , , , , , , , , ,],
  [1996, , , , , , , , , , , , ,],
  [1997, , , , , , , , , , , , ,],
  [1998, , , , , , , , , , , , ,],
  [1999, , , , , , , , , , , , ,],
  [2000, , , , , , , , , , , , ,],
  [2001, 43, , , , 0, , , , , , , ,],
  [2002, , , , , , , , , , , , ,],
  [2003, , , , , , , , , , , , ,],
  [2004, 43, , , , , , , , , , , ,],
  [2005, , , , , , 2, 11, , , 2005, 2005, ,],
  [2005, , , , , , 2, 11, , , 2005, 2005, ,],
  [2006, 43, , , , 0, , , , , , , ,],
  [2007, , , , , , 2, 80, , , 2007, 2007, ,],
  [2007, , , , , , 2, 80, , , 2007, 2007, ,],
  [2008, 43, , 143, , , , , , , , , ,],
  [2009, , , 143, , , , , , , , , ,],
  [2010, , , 143, , , , , , , , , ,],
  [2011, 43, , 142, 65, 0, , , , , , , ,],
  [2012, , , 143, , , , , , , , , ,],
  [2013, 43, , 143, , , , , , , , , ,],
  [2014, , , 143, , , , , , , , , ,],
  [2015, , , 141, , , , , , , , , ,],
  [2016, 43, , 143, , 0, , , , , , , ,],
  [2017, , , 143, , , , , , , , , ,],
  [2018, , , 143, , , , , , , , , ,],
];
// addChartJS(d,'test1');

function addClickMarker(plotBounds) {
  plotBounds.evaluate(function (plotBounds) {
    const coords = plotBounds.coordinates[0];

    marker.setMap(null);
    marker = new google.maps.Rectangle({
      bounds: {
        north: coords[0][1],
        south: coords[2][1],
        east: coords[1][0],
        west: coords[0][0],
      },
      strokeColor: clickBoundsColor,
      fillOpacity: 0,
    });
    marker.setMap(map);
  });
}
function getEveryOther(values) {
  return values.filter((i) => values.indexOf(i) % 2 == 0);
}

function makeLegend(legendDicts) {
  $("#chart-modal-graph-container").append(
    `<div id = 'chart-legend' style = 'font-size:0.7em;' class = 'text-dark'></div>`
  );
  Object.keys(legendDicts).map(function (k) {
    const title = k;
    let legendDict;
    try {
      legendDict = JSON.parse(legendDicts[k]);
    } catch (err) {
      legendDict = legendDicts[k];
    }

    let legendID = title.replaceAll(" ", "-");
    legendID = legendID.replaceAll(":", "") + "-legend";
    $("#chart-legend").append(`<div  class = 'px-2' id='${legendID}'>
										<div class = 'p-0'>${title}</div>
										<table  style = 'display:inline-block;vertical-align:top' class = 'table-bordered' id = '${legendID}-table'></table>
									</div>`);

    $("#" + legendID + "-table").append(
      `<tr id = '${legendID}-table-names'></tr>`
    );
    $("#" + legendID + "-table").append(
      `<tr id = '${legendID}-table-values'></tr>`
    );
    Object.keys(legendDict).map(function (k) {
      $("#" + legendID + "-table-names").append(`<td>${k}</td>`);
    });
    Object.keys(legendDict).map(function (k) {
      $("#" + legendID + "-table-values").append(`<td>${legendDict[k]}</td>`);
    });
  });
}

function startPixelChartCollection() {
  map.setOptions({ draggableCursor: "help" });
  mapHammer = new Hammer(document.getElementById("map"));

  mapHammer.on("doubletap", function (event) {
    chartCollection =
      pixelChartCollections[whichPixelChartCollection].collection;

    areaGeoJson = null;
    $("#summary-spinner").slideDown();
    map.setOptions({ draggableCursor: "progress" });
    const x = event.center.x;
    const y = event.center.y;
    center = point2LatLng(x, y);

    const pt = ee.Geometry.Point([center.lng(), center.lat()]);
    const plotBounds = pt.buffer(plotRadius).bounds();
    addClickMarker(plotBounds);
    const icT = ee.ImageCollection(chartCollection.filterBounds(pt));

    uriName =
      pixelChartCollections[whichPixelChartCollection].label.replaceAll(
        " ",
        "_"
      ) +
      "_lng_" +
      center.lng().toFixed(4).toString() +
      "_lat_" +
      center.lat().toFixed(4).toString();
    chartTitle =
      pixelChartCollections[whichPixelChartCollection].label +
      " (lng: " +
      center.lng().toFixed(4).toString() +
      " lat: " +
      center.lat().toFixed(4).toString() +
      ")";

    csvName = uriName + ".csv";

    function chartValues(values) {
      let startColumn;
      if (chartIncludeDate) {
        startColumn = 3;
      } else {
        startColumn = 4;
      }

      const header = values[0].slice(startColumn);
      values = values
        .slice(1)
        .map(function (v) {
          return v.slice(startColumn);
        })
        .sort(sortFunction);

      values = arraySmartToFixed(values);
      if (chartIncludeDate) {
        values = values.map(function (v) {
          const d = v[0];
          let y;
          if (
            pixelChartCollections[whichPixelChartCollection].simplifyDate ===
            false
          ) {
            y = new Date(d).toGMTString();
          } else if (
            pixelChartCollections[whichPixelChartCollection].semiSimpleDate ===
            true
          ) {
            y = `${new Date(d).getFullYear()}-${
              new Date(d).getMonth() + 1
            }-${new Date(d).getDate()}`;
          } else {
            y = (new Date(d).getYear() + 1900).toString();
          }

          v[0] = y;
          return v;
        });
      }

      values.unshift(header);

      $("#summary-spinner").slideUp();
      map.setOptions({ draggableCursor: "help" });
      ga("send", "event", mode, "pixelChart", whichPixelChartCollection);
      addChartJS(
        values,
        chartTitle,
        "line",
        false,
        false,
        pixelChartCollections[whichPixelChartCollection].chartColors,
        pixelChartCollections[whichPixelChartCollection].xAxisLabel,
        pixelChartCollections[whichPixelChartCollection].yAxisLabel,
        pixelChartCollections[whichPixelChartCollection].fieldsHidden
      );

      if (
        pixelChartCollections[whichPixelChartCollection].legends !== null &&
        pixelChartCollections[whichPixelChartCollection].legends !== undefined
      ) {
        makeLegend(pixelChartCollections[whichPixelChartCollection].legends);
        toggleChartTable(localStorage.tableOrChart);
      }
    }
    let getRegionWrapperCallLimit = 2;
    let getRegionCallCount = 0;
    function getRegionWrapper() {
      icT
        .getRegion(plotBounds, scale, crs, transform)
        .evaluate(function (values, failure) {
          $("#summary-spinner").slideUp();
          if (failure !== undefined && failure !== null) {
            showMessage(
              '<i class="text-dark text-uppercase fa fa-exclamation-triangle"></i> Error! Try again',
              failure
            );
          }
          if (values !== undefined && values !== null && values.length > 1) {
            const expectedLength = icT.size().getInfo() + 1;
            if (values.length > expectedLength) {
              console.log("reducing number of inputs");
              values = values.slice(0, expectedLength);
            }
            chartValues(values);
          } else if (values.length == 1) {
            console.log(values);
            console.log("Values length == 1. Trying again");
            getRegionCallCount++;
            if (getRegionCallCount < getRegionWrapperCallLimit) {
              getRegionWrapper();
            }
          } else {
            console.log(values);
            showMessage("Charting Error", "Unknown Error<br>Try again");
          }
        });
    }
    getRegionWrapper();
  });
}

function stopCharting() {
  try {
    mapHammer.destroy();
  } catch (err) {}
  try {
    map.setOptions({ draggableCursor: "" });
    $("#summary-spinner").slideUp();
    infowindow.setMap(null);
    marker.setMap(null);
  } catch (err) {}
}

function exportJSON(filename, json) {
  json = JSON.stringify(json);

  const blob = new Blob([json], { type: "application/json" });
  let url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  if (link.download !== undefined) {
    // feature detection
    // Browsers that support HTML5 download attribute
    url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    ga(
      "send",
      "event",
      mode,
      getActiveTools()[0] + "-chartDownload",
      "geoJSON"
    );
  }
}

function exportToCsv(filename, rows) {
  const processRow = function (row) {
    let finalVal = "";
    for (let j = 0; j < row.length; j++) {
      let innerValue =
        row[j] === null || row[j] === undefined ? "" : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }

      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ",";
      finalVal += result;
    }
    return finalVal + "\n";
  };

  let csvFile = "";
  for (let i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  const blob = new Blob([csvFile], { type: "text/csv;charset=utf-8;" });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      ga("send", "event", mode, getActiveTools()[0] + "-chartDownload", "csv");
    }
  }
}
