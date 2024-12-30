const hoverFeatureStyling = {
  strokeColor: "#00FFFF",
  fillColor: "#00FFFF",
  fillOpacity: 0.3,
  strokeOpacity: 1,
  strokeWeight: 3,
};
const notHoverFeatureStyling = {
  strokeColor: "#0FF",
  fillColor: "#0FF",
  fillOpacity: 0.2,
  strokeOpacity: 0,
  strokeWeight: 0,
};
const ciDict = { 90: 1.64, 95: 1.96, 99: 2.58 };
function chartDashboardFeature(
  r,
  layer,
  updateCharts = true,
  deselectOnClick = true
) {
  let featureName = r.properties[layer.viz.dashboardFieldName]
    .toString()
    .replace(/[^A-Za-z0-9]/g, "-");

  if (
    Object.keys(layer.dashboardSelectedFeatures).indexOf(featureName) === -1
  ) {
    layer.dashboardSelectedFeatures[featureName] = {
      geojson: r,
      polyList: [],
      listeners: [],
    };

    function getCoords(c) {
      if (c.type === "Polygon") {
        c.coordinates.map((c2) => {
          let polyCoordsT = c2.map((c3) => {
            return { lng: c3[0], lat: c3[1] };
          });
          layer.dashboardSelectedFeatures[featureName].polyList.push(
            new google.maps.Polygon({
              path: polyCoordsT,
              zIndex: -999,
            })
          );
        });
      } else if (c.type === "MultiPolygon") {
        c.coordinates.map((c2) =>
          getCoords({ type: "Polygon", coordinates: c2 })
        );
      } else if (c.type === "GeometryCollection") {
        c.geometries.map((g) => getCoords(g));
      }
    }
    getCoords(r.geometry);

    layer.dashboardSelectedFeatures[featureName].polyList.map((p) => {
      p.setOptions(notHoverFeatureStyling);
      p.setMap(map);
    });
    layer.dashboardSelectedFeatures[featureName].polyList.map((p) => {
      if (deselectOnClick) {
        google.maps.event.addListener(p, "click", (event) => {
          console.log(`deselection clicked: ${event}`);
          layer.dashboardSelectedFeatures[featureName].polyList.map((p) => {
            p.setMap(null);
          });
          layer.dashboardSelectedFeatures[featureName].listeners.map((l) =>
            google.maps.event.removeListener(l)
          );
          delete layer.dashboardSelectedFeatures[featureName];
          updateDashboardCharts();
          updateDashboardHighlights();
        });
      }
      layer.dashboardSelectedFeatures[featureName].listeners.push(
        google.maps.event.addListener(p, "mouseover", (event) => {
          let selector = `#${
            urlParams.currentlySelectedHighlightTab.split("-tab")[0]
          }----${featureName}`;
          $(selector).addClass("dashboard-row-hover");
          try {
            layer.dashboardSelectedFeatures[featureName].polyList.map((p) =>
              p.setOptions(hoverFeatureStyling)
            );
          } catch (err) {
            console.log(err);
          }
        })
      );
      layer.dashboardSelectedFeatures[featureName].listeners.push(
        google.maps.event.addListener(p, "mouseout", (event) => {
          let selector = `#${
            urlParams.currentlySelectedHighlightTab.split("-tab")[0]
          }----${featureName}`;
          $(selector).removeClass("dashboard-row-hover");
          try {
            layer.dashboardSelectedFeatures[featureName].polyList.map((p) =>
              p.setOptions(notHoverFeatureStyling)
            );
          } catch (err) {
            console.log(err);
          }
        })
      );
    });
  }

  let selectedNames = Object.keys(layer.dashboardSelectedFeatures).join(",");
  if (updateCharts) {
    updateDashboardCharts();
    updateDashboardHighlights();
  }
}

function startDashboardClickLayerSelect() {
  $("#dashboard-download-button").prop("disabled", true);
  google.maps.event.clearListeners(map, "click");

  function updateSelectedDashboardFeatures(event) {
    let pt = ee.Geometry.Point([event.latLng.lng(), event.latLng.lat()]);
    let visibleDashboardLayers = Object.values(layerObj).filter(
      (v) => v.viz.dashboardSummaryLayer && v.visible
    );
    let totalVisible = visibleDashboardLayers.length;
    let totalLoaded = 0;
    $("#loading-spinner-logo").show();
    updateProgress(".progressbar", 0);
    $("#loading-progress-div").show();
    $("#dashboard-results-list>div>.panel-heading").addClass("progress-pulse");

    visibleDashboardLayers.map((layer) => {
      const ft = ee
        .Feature(layer.queryItem.filterBounds(pt).first())
        .simplify(5000, "EPSG:4326");
      ft.evaluate((r, failure) => {
        if (r !== undefined) {
          if (layer.selectedDashboardGEEFeatures === undefined) {
            layer.selectedDashboardGEEFeatures = ee.FeatureCollection([ft]);
          } else {
            layer.selectedDashboardGEEFeatures =
              layer.selectedDashboardGEEFeatures.merge(
                ee.FeatureCollection([ft])
              );
          }
          chartDashboardFeature(r, layer);
        }
        totalLoaded++;
        let pLoaded = (totalLoaded / totalVisible) * 100;
        updateProgress(".progressbar", pLoaded);
        if (pLoaded === 100) {
          $("#loading-spinner-logo").hide();
          $("#dashboard-results-list>div>.panel-heading").removeClass(
            "progress-pulse"
          );
          $("#dashboard-download-button").prop("disabled", false);
        }
      });
    });
  }
  map.addListener("click", function (event) {
    updateSelectedDashboardFeatures(event);
  });
}
function clearAllSelectedDashboardFeatures() {
  let dashboardLayers = Object.values(layerObj).filter(
    (v) => v.viz.dashboardSummaryLayer
  );
  dashboardLayers.map((layer) => {
    Object.keys(layer.dashboardSelectedFeatures).map((fn) => {
      layer.dashboardSelectedFeatures[fn].polyList.map((p) => p.setMap(null));
      layer.dashboardSelectedFeatures[fn].listeners.map((l) =>
        google.maps.event.removeListener(l)
      );
      delete layer.dashboardSelectedFeatures[fn];
    });
  });

  $("#highlights-table-tabs").empty();
  $("#highlights-table-divs").empty();
  updateDashboardCharts();
  try {
    dragBox.polygon.setMap(null);
  } catch (err) {}

  $("#loading-progress-div").hide();
  $("#dashboard-results-list>div>.panel-heading").removeClass("progress-pulse");
}
function stopDashboardClickLayerSelect() {
  google.maps.event.clearListeners(map, "click");
}
let dragSelectedFeatures;
let boxSelectID = 0;

function dashboardBoxSelect() {
  let visibleDashboardLayers = Object.values(layerObj).filter(
    (v) => v.viz.dashboardSummaryLayer && v.visible
  );
  if (visibleDashboardLayers.length > 0) {
    $("#dashboard-download-button").prop("disabled", true);
    let geeBox;
    boxSelectID++;
    const thisBoxSelectID = boxSelectID;
    if (dashboardAreaSelectionMode === "View-Extent") {
      geeBox = eeBoundsPoly.buffer(10000);
    } else {
      geeBox = ee.Geometry.Polygon(
        dragBox.dragBoxPath.map((c) => [c.lng, c.lat])
      );
      dragBox.stopListening(false);
    }

    $("#summary-area-selection-radio").css("pointer-events", "none");
    $("#loading-spinner-logo").addClass("fa-spin");
    $("#loading-spinner-logo").show();
    $("#dashboard-results-list>div>.panel-heading").addClass("progress-pulse");
    updateProgress(".progressbar", 0);
    $("#loading-progress-div").show();
    const boundsFilter = ee.Filter.bounds(geeBox, 500);

    ee.FeatureCollection(
      visibleDashboardLayers.map((layer) =>
        layer.queryItem.filter(boundsFilter)
      )
    )
      .flatten()
      .size()
      .evaluate((n) => {
        if (n > 0 && thisBoxSelectID === boxSelectID) {
          let i = 1;
          visibleDashboardLayers.map((layer) => {
            let selectedFeatures = layer.queryItem.filter(boundsFilter);

            let selectedAttributes = selectedFeatures
              .toList(10000, 0)
              .map((f) => ee.Feature(f).toDictionary());
            let selectedProj = selectedFeatures.first().geometry().projection();
            selectedFeatures.evaluate((f, failure) => {
              if (failure !== undefined) {
                console.log(`Failure: ${failure}`);
              } else {
                console.log(f);
              }

              let update = false;
              f.features.map((feat) => {
                if (i === n) {
                  update = true;
                }
                chartDashboardFeature(feat, layer, update, false);
                let pLoaded = parseInt((i / n) * 100);
                updateProgress(".progressbar", pLoaded);
                if (pLoaded === 100) {
                  $("#dashboard-download-button").prop("disabled", false);
                  $("#loading-spinner-logo").hide();
                  $("#dashboard-results-list>div>.panel-heading").removeClass(
                    "progress-pulse"
                  );
                  $("#summary-area-selection-radio").css(
                    "pointer-events",
                    "auto"
                  );
                  if (dashboardAreaSelectionMode === "Drag-Box") {
                    dragBox.startListening();
                  }
                }
                i++;
              });
            });
          });
        }
      });
  }
}
function dashboardDragboxLayerSelect() {
  dashboardBoxSelect();
}
let dashboardViewExtentListener;
function stopDashboardViewExtentSelect() {
  google.maps.event.removeListener(dashboardViewExtentListener);
}
function startDashboardViewExtentSelect() {
  dashboardViewExtentListener = google.maps.event.addListener(
    map,
    "idle",
    () => {
      clearAllSelectedDashboardFeatures();
      dashboardBoxSelect();
    }
  );
}
let dashboardPlotlyDownloadURLs;
function makeDashboardCharts(layer, whichOne, annualOrTransition) {
  dashboardPlotlyDownloadURLs = [];

  const colors = {
    Change: ["3d4551", "f39268", "d54309", "00a398", "1B1716"].map(
      (c) => "#" + c
    ),
    Land_Cover: [
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
      "AA7700",
      "d3bf9b",
      "ffffff",
      "4780f3",
      "1B1716",
    ].map((c) => "#" + c),
    Land_Use: [
      "efff6b",
      "ff2ff8",
      "1b9d0c",
      "97ffff",
      "a1a1a1",
      "c2b34a",
      "1B1716",
    ].map((c) => "#" + c),
  };
  const names = {
    Change: [
      "Stable",
      "Slow Loss",
      "Fast Loss",
      "Gain",
      "Non-Processing Area Mask",
    ],
    Land_Cover: [
      "Trees",
      "Tall Shrubs & Trees Mix",
      "Shrubs & Trees Mix",
      "Grass/Forb/Herb & Trees Mix",
      "Barren & Trees Mix",
      "Tall Shrubs",
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
    Land_Use: [
      "Agriculture",
      "Developed",
      "Forest",
      "Non-Forest Wetland",
      "Other",
      "Rangeland or Pasture",
      "Non-Processing Area Mask",
    ],
  };
  const lcNamesSimpleIndices = {
    Trees: [0, 1, 2, 3, 4],
    "Tall-Shrubs": [5],
    Shrubs: [6, 7, 8],
    "Grass-Forb-Herb": [9, 10],
    "Barren-or-Impervious": [11],
    Water: [13],
    "Snow-or-Ice": [12],
  };
  const lcFieldsHidden = [];
  Object.keys(urlParams.lcHighlightClasses).map((lcc) => {
    lcNamesSimpleIndices[lcc].map((i) => {
      lcFieldsHidden.push(!urlParams.lcHighlightClasses[lcc]);
    });
  });
  const fieldsHidden = {
    Change: Object.values(urlParams.changeHighlightClasses).map((v) => !v),
    Land_Use: Object.values(urlParams.luHighlightClasses).map((v) => !v),
    Land_Cover: lcFieldsHidden,
  };
  fieldsHidden.Change.push(true);
  fieldsHidden.Land_Use.push(true);
  fieldsHidden.Land_Cover.push(true);
  let total_area_fieldname = "total_area";
  if (annualOrTransition === "transition") {
    names["Land_Cover"] = [
      "Trees",
      "Tall Shrubs",
      "Shrubs",
      "Grass/Forb/Herb",
      "Barren or Impervious",
      "Snow or Ice",
      "Water",
      "Non-Processing Area Mask",
    ];
    colors["Land_Cover"] = [
      "#005e00",
      "#b30088",
      "#e68a00",
      "#ffff00",
      "#d3bf9b",
      "#ffffff",
      "#4780f3",
      "#1B1716",
    ];
  }

  const stacked = false;
  let fieldNames = names[whichOne].map((w) => whichOne + "---" + w);
  const chartID = `chart-canvas-${layer.id}-${whichOne}-${annualOrTransition}`;
  let colorsI = 0;
  const selectedFeatureNames = Object.keys(layer.dashboardSelectedFeatures);
  let area_names;
  if (selectedFeatureNames.length > 1) {
    area_names =
      "LCMS Summary for " + selectedFeatureNames.length.toString() + " areas";
  } else {
    area_names = selectedFeatureNames.join(", ");
  }

  const name =
    layer.name + " " + area_names + " - " + whichOne.replace("_", " ");
  ///////////////////////////////////////////////////////////////////////
  //Iterate across each field name and add up totals
  //First get 2-d array of all areas for each then sum the columns and divide by total area
  const t1 = new Date();
  let results = {};
  results.features = selectedFeatureNames.map(
    (nm) => layer.dashboardSelectedFeatures[nm].geojson
  );
  let years = results.features[0].properties["years_" + annualOrTransition]
    .split(",")
    .sort();
  if (annualOrTransition === "transition") {
    const tableDict = {};
    fieldNames = Object.keys(results.features[0].properties)
      .filter((v) => v.indexOf(whichOne) > -1)
      .sort();

    fieldNames.map((fn) => {
      let total_area = 0;
      const total = [];
      results.features.map((f) => {
        const t = f.properties[fn].split(",");
        const scale = f.properties.scale;

        total.push(
          f.properties[fn].split(",").map((n) => parseFloat(n) * scale ** 2)
        );
        const total_areaF = parseFloat(f.properties[total_area_fieldname]);
        total_area = total_area + total_areaF * scale ** 2;
      });
      let colSums = [];
      for (let col = 0; col < total[0].length; col++) {
        let colSum = 0;
        for (let row = 0; row < total.length; row++) {
          colSum = colSum + total[row][col];
        }
        colSums.push(colSum);
      }
      //Convert from sq m to chosen area unit
      if (chartFormat === "Percentage") {
        colSums = colSums.map((n) => (n / total_area) * 100);
      } else {
        colSums = colSums.map((n) => n * chartFormatDict[chartFormat].mult);
      }
      if (Math.max(...colSums) > -1) {
        tableDict[fn] = colSums;
      }
    });
    //Clean out existing chart
    $(`#${chartID}`).remove();
    //Add new chart
    $("#charts-collapse-div").append(
      `<div class = "plotly-chart" id="${chartID}"><div>`
    );
    $("#charts-collapse-div").append(
      `<div class = "plotly-chart plotly-chart-download" id="${chartID}-download"><div>`
    );

    //Set up chart object
    // add data
    let yri = 0;
    let data = [];
    const sankey_dict = { source: [], target: [], value: [] };
    const sankeyPalette = [];
    const labels = [];
    const label_code_dict = {};
    let label_code_i = 0;
    const allYears = years.map((yr) => {
      return yr.split("_")[0];
    });
    allYears.push(years[years.length - 1].split("_")[1]);
    allYears.map((yr) => {
      names[whichOne].map((nm) => {
        const outNm = yr + " " + nm;
        labels.push(outNm);
        label_code_dict[outNm] = label_code_i;
        label_code_i++;
      });
      colors[whichOne].map((nm) => {
        sankeyPalette.push(nm);
      });
    });
    years.map((yr) => {
      const startRange = yr.split("_")[0];
      const endRange = yr.split("_")[1];

      Object.keys(tableDict).map((k) => {
        const transitionClass = k.split("---")[1];
        const transitionFromClassI =
          parseInt(transitionClass.split("-")[0]) - 1;
        const transitionFromClassName = names[whichOne][transitionFromClassI];
        const transitionToClassName =
          names[whichOne][parseInt(transitionClass.split("-")[1]) - 1];
        const v = tableDict[k][yri];
        const fromLabel = startRange + " " + transitionFromClassName;
        const toLabel = endRange + " " + transitionToClassName;

        sankey_dict.source.push(label_code_dict[fromLabel]);
        sankey_dict.target.push(label_code_dict[toLabel]);
        sankey_dict.value.push(v);
      });
      yri++;
    });

    sankey_dict.hovertemplate =
      "%{value}" +
      chartFormatDict[chartFormat].label +
      " %{source.label}-%{target.label}<extra></extra>";

    data = {
      type: "sankey",
      orientation: "h",
      node: {
        pad: 10,
        thickness: 20,
        line: {
          color: "black",
          width: 0.5,
        },
        label: labels,
        color: sankeyPalette,
        hovertemplate:
          "%{value}" +
          chartFormatDict[chartFormat].label +
          " %{label}<extra></extra>",
      },

      link: sankey_dict,
    };

    data = [data];

    let plotWidth = $("#charts-collapse-div").width() - 2;
    let plotHeight = parseInt(plotWidth / 1.3);

    const layout = {
      title: `<b>${name}</b>`,
      font: {
        size: 10,
      },
      margin: {
        l: 15,
        r: 15,
        b: 25,
        t: 30,
        pad: 50,
      },
      paper_bgcolor: "#edeae3",
      plot_bgcolor: "#edeae3",
      autosize: false,
      height: plotHeight,
      width: plotWidth,
    };
    const config = {
      toImageButtonOptions: {
        format: "png", // one of png, svg, jpeg, webp
        filename: name,
      },
      scrollZoom: true,
      displayModeBar: false,
    };

    let layout2 = JSON.parse(JSON.stringify(layout));

    layout2.font.size = 20;
    layout2.margin.t = 80;
    layout2.margin.pad = 20;

    Plotly.newPlot(`${chartID}-download`, data, layout2, config).then(
      (chart) => {
        Plotly.toImage(chart, { width: 1200, height: 800 }).then((url) =>
          dashboardPlotlyDownloadURLs.push(url)
        );
      }
    );
    Plotly.newPlot(`${chartID}`, data, layout, config);
  } else if (annualOrTransition === "annual") {
    const startI = years.indexOf(urlParams.startYear.toString());
    const endI = years.indexOf(urlParams.endYear.toString()) + 1;
    years = years.slice(startI, endI);
    if (showPairwiseDiff) {
      years = years.slice(1, years.length);
    }
    fieldNames = fieldNames.filter((v) => v.indexOf(whichOne) > -1).sort();

    const t = fieldNames.map(function (k) {
      let total_area = 0;
      const total = [];

      results.features.map(function (f) {
        try {
          const scale = f.properties.scale;

          total.push(
            f.properties[k]
              .split(",")
              .slice(startI, endI)
              .map((n) => parseFloat(n))
          );
          const total_areaF = parseFloat(f.properties[total_area_fieldname]);
          total_area = total_area + total_areaF;
        } catch (err) {
          console.log("No LCMS summary for: " + f.properties[titleField]);
        }
      });

      let colSums = [];
      for (let col = 0; col < total[0].length; col++) {
        let colSum = 0;
        for (let row = 0; row < total.length; row++) {
          colSum = colSum + total[row][col];
        }
        colSums.push(colSum);
      }

      //Convert from sq m to chosen area unit
      if (chartFormat === "Percentage") {
        colSums = colSums.map((n) => (n / total_area) * 100);
      } else {
        colSums = colSums.map((n) => n * chartFormatDict[chartFormat].mult);
      }

      if (showPairwiseDiff) {
        const pairwiseDiff = [];
        for (let i = 0; i < colSums.length - 1; i++) {
          const left = colSums[i];
          const right = colSums[i + 1];
          pairwiseDiff.push(right - left);
        }
        colSums = pairwiseDiff;
      }
      colSums = colSums.map((n) => n.round(3));

      ///////////////////////////////////////////////////////////////////////
      //Set up chart object
      let fieldHidden;
      try {
        fieldHidden =
          fieldsHidden[whichOne][names[whichOne].indexOf(k.split("---")[1])];
      } catch (err) {
        fieldHidden = false;
      }

      let classColor =
        colors[whichOne][names[whichOne].indexOf(k.split("---")[1])];
      const out = {
        borderColor: classColor,
        data: colSums,
        label: k.split("---")[1],
        pointStyle: "circle",
        pointRadius: 1,
        lineTension: 0,
        borderWidth: 2,
        steppedLine: false,
        showLine: true,
        spanGaps: true,
        hidden: fieldHidden,
        fill: stacked,
        backgroundColor: classColor,
      };
      colorsI++;
      return out;
    });

    //Clean out existing chart
    try {
      chartJSChart.destroy();
    } catch (err) {}
    $(`#${chartID}`).remove();

    let chartWidth = $("#charts-collapse-div").width() - 2;
    let chartHeight = parseInt(chartWidth / 1.5);
    $("#charts-collapse-div").append(
      `<div  class = "chartjs-chart chart-container" ><canvas title='Click on classes on the bottom of this chart to turn them on and off' id="${chartID}"><canvas></div>`
    );
    //Set up chart object
    let chartJSChart = new Chart($(`#${chartID}`), {
      type: "line",
      data: { labels: years, datasets: t },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
          display: true,
          position: "top",
          text: name,
          fontSize: 12,
          wrap: true,
          maxWidth: 50,
        },
        legend: {
          display: true,
          position: "bottom",
          labels: {
            usePointStyle: true,
            fontSize: 10,
            boxWidth: 5,
            padding: 5,
          },
        },
        chartArea: {
          backgroundColor: "#edeae3",
        },
        scales: {
          yAxes: [
            {
              stacked: stacked,
              ticks: { fontSize: 10 },
              scaleLabel: {
                display: true,
                labelString: chartFormatDict[chartFormat].label,
              },
            },
          ],
          xAxes: [
            {
              stacked: stacked,
              ticks: { fontSize: 10 },
              scaleLabel: { display: true, labelString: "Year" },
              maxBarThickness: 100,
            },
          ],
        },
        labels: {
          padding: 0,
        },
      },
    });

    $(".chartjs-chart").css("height", chartHeight);
    $(".chartjs-chart").css("width", chartWidth);
  }
}
let currentHighlightsMoveID = 1;
if (
  urlParams.currentlySelectedHighlightTab == null ||
  urlParams.currentlySelectedHighlightTab == undefined
) {
  urlParams.currentlySelectedHighlightTab;
}
function getHighlightsTabListener() {
  return $("a.nav-link").click((e) => {
    urlParams.currentlySelectedHighlightTab = e.currentTarget.id;
  });
}

function updateDashboardHighlights(limit = 10) {
  currentHighlightsMoveID++;
  let thisHighlightsMoveID = currentHighlightsMoveID;
  let isFirst = true;
  let chartWhich = Object.keys(productHighlightClasses)
    .filter((k) => productHighlightClasses[k])
    .map((i) => i.replaceAll("-", "_"));

  let available_years = range(startYear, endYear + 1);
  let startYearI = available_years.indexOf(parseInt(urlParams.startYear));
  let endYearI = available_years.indexOf(parseInt(urlParams.endYear));

  let dashboardLayersToHighlight = Object.values(layerObj).filter(
    (v) => v.viz.dashboardSummaryLayer && v.visible
  );

  $("#highlights-table-tabs").empty();
  $("#highlights-table-divs").empty();
  let totalToLoad = 0;
  let totalLoaded = 0;
  let classesToHighlight = 0;
  let firstID;
  if (dashboardLayersToHighlight.length > 0) {
    dashboardLayersToHighlight.map((f) => {
      fc = Object.values(f.dashboardSelectedFeatures).map((f) => f.geojson);
      let fieldName = f.viz.dashboardFieldName;
      Object.keys(highlightLCMSProducts).map((k) => {
        if (chartWhich.indexOf(k) > -1) {
          let product_name = k.replaceAll("_", " ");
          let tab_name = f.name;
          let classes = highlightLCMSProducts[k];
          classesToHighlight = classesToHighlight + classes.length;
          if (classes.length > 0) {
            classes.map((cls) => {
              const class_name = `${k}---${cls}`;
              const ts_class_name = `TS---${k}---${cls}`;
              let t = [];
              let ft = fc.map((f) => {
                let props = f.properties;

                let tsProps = props[ts_class_name].split(",");

                // From http://www.stat.yale.edu/Courses/1997-98/101/catinf.htm
                // Advised in Olofsson et al 2014 Equations 10 and 11
                let tsCounts = props["TS_counts"].split(",");
                let attributes = props[class_name].split(",");
                let totalArea = parseFloat(props["total_area"]);
                let startAtr,
                  endAtr,
                  startCILow,
                  startCIHigh,
                  endCILow,
                  endCIHigh;

                let startTSProp = parseFloat(tsProps[startYearI]);
                let endTSProp = parseFloat(tsProps[endYearI]);
                let startTSCount = parseFloat(tsCounts[startYearI]);
                let endTSCount = parseFloat(tsCounts[endYearI]);

                let ci = ciDict[ciLevel];
                let startCI =
                  ci *
                  Math.sqrt((startTSProp * (1 - startTSProp)) / startTSCount);
                let endCI =
                  ci * Math.sqrt((endTSProp * (1 - endTSProp)) / endTSCount);

                if (chartFormat === "Percentage") {
                  startAtr =
                    (parseFloat(attributes[startYearI]) / totalArea) * 100;
                  endAtr = (parseFloat(attributes[endYearI]) / totalArea) * 100;

                  startCI = startCI * 100;
                  endCI = endCI * 100;

                  startTSProp = startTSProp * 100;
                  endTSProp = endTSProp * 100;
                } else {
                  startAtr =
                    parseFloat(attributes[startYearI]) *
                    chartFormatDict[chartFormat].mult;
                  endAtr =
                    parseFloat(attributes[endYearI]) *
                    chartFormatDict[chartFormat].mult;

                  startCI =
                    totalArea * chartFormatDict[chartFormat].mult * startCI;
                  endCI = totalArea * chartFormatDict[chartFormat].mult * endCI;

                  startTSProp =
                    totalArea * chartFormatDict[chartFormat].mult * startTSProp;
                  endTSProp =
                    totalArea * chartFormatDict[chartFormat].mult * endTSProp;
                }

                let isSig = false;
                if (startTSProp === 0) {
                  startCI = "NA";
                  startCILow = "NA";
                  startCIHigh = "NA";
                }
                if (endTSProp === 0) {
                  endCI = "NA";
                  endCILow = "NA";
                  endCIHigh = "NA";
                }
                if (startTSProp > 0 && endTSProp > 0) {
                  startCILow = startAtr - startCI;
                  startCIHigh = startAtr + startCI;

                  endCILow = endAtr - endCI;
                  endCIHigh = endAtr + endCI;

                  if (startCILow > endCIHigh || startCIHigh < endCILow) {
                    isSig = true;
                  }
                }
                if (startCI !== "NA") {
                  startCI = startCI.toFixed(
                    chartFormatDict[chartFormat].places
                  );
                }
                if (endCI !== "NA") {
                  endCI = endCI.toFixed(chartFormatDict[chartFormat].places);
                }

                let diff = endAtr - startAtr;
                let rel = (diff / startAtr) * 100;

                t.push([
                  props[fieldName],
                  startAtr
                    .toFixed(chartFormatDict[chartFormat].places)
                    .numberWithCommas(),
                  startTSProp
                    .toFixed(chartFormatDict[chartFormat].places)
                    .numberWithCommas(),
                  startCI.numberWithCommas(),
                  endAtr
                    .toFixed(chartFormatDict[chartFormat].places)
                    .numberWithCommas(),
                  endTSProp
                    .toFixed(chartFormatDict[chartFormat].places)
                    .numberWithCommas(),
                  endCI.numberWithCommas(),
                  diff
                    .toFixed(chartFormatDict[chartFormat].places)
                    .numberWithCommas(),
                  rel.toFixed(chartFormatDict[chartFormat].places),
                  isSig,
                ]);
              });

              let nmT = `${f.viz.dashboardFieldName}`;
              let startYrAbbrv = urlParams.startYear.toString().slice(2, 4);
              let endYrAbbrv = urlParams.endYear.toString().slice(2, 4);

              function parseResults(t, header) {
                totalLoaded++;
                let pLoaded = (totalLoaded / totalToLoad) * 100;
                let nRows = t.length;
                let areasN = "areas";
                if (nRows === 1) {
                  areasN = "area";
                }
                let clsID = cls.replaceAll("/", "-");
                clsID = clsID.replaceAll(" ", "-");
                let navID = `${f.legendDivID}----${k}----${clsID}`;
                let isActive = "";
                if (isFirst) {
                  isActive = " show active";
                }
                $("#highlights-table-tabs")
                  .append(`<li class="nav-item" role="presentation" title='Click to show sorted table of ${tab_name}-${cls} change from ${urlParams.startYear}-${urlParams.endYear}'>
																			<a
																			class="nav-link ${isActive}"
																			id="${navID}-tab"
																			data-toggle="tab"
																			href="#${navID}-table-container"
																			role="tab"
																			aria-controls="${navID}-table_wrapper"
																			aria-selected="${isFirst}">${tab_name}-${cls}</a>
																		</li>`);

                $("#highlights-table-divs")
                  .append(`<div id = "${navID}-table-container">
									<table
									class="table table-hover report-table"
									id="${navID}-table"
									role="tabpanel"
									tablename="${tab_name}-LCMS ${k.replaceAll("_", " ")} ${cls}"
									aria-labelledby="${navID}-tab"
								  ></table>
								  <div id = "${navID}-boxplots"></div>
								  </div>`);

                isFirst = false;

                $(`#${navID}-table`)
                  .append(`<thead><tr class = ' highlights-table-section-title'>
									
									<th>
										Name (bold = sig ${ciLevel}% CI)
									</th>
									<th>
										${urlParams.startYear} ${chartFormatDict[chartFormat].label}
									</th>
									
									<th>
										${urlParams.endYear} ${chartFormatDict[chartFormat].label}
									</th>
									
									<th title ="Change between '${startYrAbbrv} and '${endYrAbbrv}">
										Change ${chartFormatDict[chartFormat].label}
									</th>
									
									
									</tr></thead>`);
                let rowI = 1;

                t.map((tr) => {
                  let sigClass = "highlights-insig";
                  let sigStar = "";
                  let sigTitle = `No significant change detected (${ciLevel}% CI)`;
                  if (tr[9]) {
                    sigClass = "highlights-sig";
                    sigStar = "*";
                    sigTitle = `Significant change detected (${ciLevel}% CI)`;
                  }

                  $(`#${navID}-table`)
                    .append(`<tr id = '${navID}----${tr[0].replace(
                    /[^A-Za-z0-9]/g,
                    "-"
                  )}' class = 'highlights-row' title= '${sigTitle}'>
									<th class = 'highlights-entry ${sigClass}'>${tr[0]}</th>
									<td class = 'highlights-entry ${sigClass}'>${tr[1]} &plusmn ${tr[3]}</td>
									
									<td class = 'highlights-entry ${sigClass}'>${tr[4]} &plusmn ${tr[6]}</td>
									
									<td class = 'highlights-entry ${sigClass}'>${tr[7]}</td>
									
									
									</tr>`);

                  rowI++;
                });

                let downloadName = `LCMS_Change_Summaries_${tab_name}_${cls}_${urlParams.startYear}-${urlParams.endYear}`;
                $(document).ready(function () {
                  $(`#${navID}-table`).DataTable({
                    fixedHeader: false,
                    paging: false,
                    searching: true,
                    order: [[3, highlightsSortingDict[cls]]],
                    responsive: true,
                    dom: "Bfrtip",
                    buttons: [
                      {
                        extend: "copyHtml5",
                        title: downloadName.replaceAll("_", " "),
                        messageBottom:
                          staticTemplates.dashboardHighlightsDisclaimerText,
                      },
                      {
                        extend: "csvHtml5",
                        title: downloadName.replaceAll("_", " "),
                        messageBottom:
                          staticTemplates.dashboardHighlightsDisclaimerText,
                      },
                      {
                        extend: "excelHtml5",
                        title: downloadName.replaceAll("_", " "),
                        messageBottom:
                          staticTemplates.dashboardHighlightsDisclaimerText,
                      },
                      {
                        extend: "pdfHtml5",
                        title: downloadName.replaceAll("_", " "),
                        messageBottom:
                          staticTemplates.dashboardHighlightsDisclaimerText,
                      },
                      {
                        extend: "print",
                        title: downloadName.replaceAll("_", " "),
                        messageBottom:
                          staticTemplates.dashboardHighlightsDisclaimerText,
                      },
                    ],
                  });
                  $(`#${navID}-table-container`).addClass(
                    `tab-pane fade bg-white highlights-table ${isActive}`
                  );
                });
              }
              if (t.length > 0) {
                parseResults(t, "Change");
              }
            });
          }
        }
      });
    });
  }

  getHighlightsTabListener();
  if (
    urlParams.currentlySelectedHighlightTab !== null &&
    urlParams.currentlySelectedHighlightTab !== undefined
  ) {
    $(`#${urlParams.currentlySelectedHighlightTab}`).click();
  } else {
    if ($("a.nav-link").length > 0) {
      urlParams.currentlySelectedHighlightTab = $("a.nav-link")[0].id;
    }
  }
  resizeDashboardPanes();
  function getFeatures(id) {
    return layerObj[id.split("----")[0]].dashboardSelectedFeatures[
      id.split("----")[3]
    ].polyList;
  }
  $(".dataTable.table>tbody>tr").on("mousemove", function (e) {
    let highlightFeatures = getFeatures(e.currentTarget.id);
    highlightFeatures.map((f) => {
      f.setOptions(hoverFeatureStyling);
    });
  });

  // Any time the mouse leaves the table, get rid of any marker
  $(".dataTable.table>tbody>tr").on("mouseleave", function (e) {
    let highlightFeatures = getFeatures(e.currentTarget.id);
    highlightFeatures.map((f) => {
      f.setOptions(notHoverFeatureStyling);
    });
  });
  $(".dataTable.table>tbody>tr").on("dblclick", function (e) {
    console.log("double clicked");
    let highlightFeatures = getFeatures(e.currentTarget.id);
    let bounds = new google.maps.LatLngBounds();
    highlightFeatures.map((f) => {
      let coords = f.getPath().getArray();
      coords.map((coord) => {
        bounds.extend(coord);
      });
    });
    map.fitBounds(bounds);
  });
}

function updateDashboardCharts() {
  let lastScrollLeft = dashboardScrollLeft;
  let lastScrollTop = dashboardScrollTop[dashboardResultsLocation];
  turnOffScrollMonitoring();
  $("#charts-collapse-div").empty();
  let visible, chartModes;
  chartWhich = Object.keys(productHighlightClasses)
    .filter((k) => productHighlightClasses[k])
    .map((i) => i.replaceAll("-", "_"));
  chartModes = Object.keys(annualTransition)
    .filter((k) => annualTransition[k])
    .map((k) => k.toLowerCase());

  let dashboardLayersToChart = Object.values(layerObj).filter(
    (v) =>
      v.viz.dashboardSummaryLayer &&
      v.visible &&
      Object.keys(v.dashboardSelectedFeatures).length > 0
  );
  if (dashboardLayersToChart.length > 0) {
    chartWhich.map((w) => {
      dashboardLayersToChart.map((layer) => {
        chartModes.map((chartMode) => makeDashboardCharts(layer, w, chartMode));
      });
    });
    $(dashboardScrollDict[dashboardResultsLocation]).scrollTop(lastScrollTop);
    turnOnScrollMonitoring();
  }
}

//////////////////////////////////////////////////
// Dashboard template setup
class report {
  constructor() {
    this.clear = function () {
      this.doc = new jspdf.jsPDF("portrait");
      this.h = this.doc.internal.pageSize.height;
      this.w = this.doc.internal.pageSize.width;
      this.margin = 10;

      //header
      //header color block
      const fontSize = 12;
      this.doc.setFontSize(fontSize);
      this.currentY = this.margin;
      this.widthPng = 36;
    };
    this.addReportHeader = function () {
      this.clear();

      //header logo image
      const usdaLogo = new Image();
      usdaLogo.src = "./src/assets/images/logos_usda-fs_bn-dk-01.PNG"; //"./src/assets/images/usdalogo.png";
      this.doc.addImage(usdaLogo, "PNG", 5, 4, 16 * 2, 13); //, 15);

      const lcmsLogo = new Image();
      lcmsLogo.src = "./src/assets/images/lcms-icon.png";

      //header text
      this.currentY = 9;
      this.widthPng = 36;
      this.doc.setFontSize(18);
      this.doc.text(
        this.margin + this.widthPng,
        this.currentY,
        "Forest Service"
      );
      this.doc.setFontSize(12);
      this.currentY += 7;
      this.doc.text(
        this.margin + this.widthPng,
        this.currentY,
        "U.S. DEPARTMENT OF AGRICULTURE"
      );
      this.currentY += 5;

      this.doc.line(
        this.margin / 2,
        this.currentY,
        this.w - this.margin / 2,
        this.currentY
      );
      this.currentY += 5;
      this.doc.text(
        this.margin / 2,
        this.currentY,
        `Geospatial Technology and Applications Center | ${new Date().toStringFormat()}`
      );
      this.currentY += 5;
      this.doc.setFontSize(10);
      this.doc.text(
        this.margin / 2,
        this.currentY,
        `LCMS Data Version: v2023.9 | Dashboard Version: 2024.1`
      );

      this.currentY += 3;
      this.doc.setFillColor(55, 46, 44);

      this.doc.rect(0, this.currentY, 600, 20, "F"); //x, y, w, h, style

      this.doc.setFontSize(22);

      this.doc.setTextColor(0, 137, 123);
      this.doc.setFont(undefined, "bold");
      this.currentY += 3;
      this.doc.addImage(
        lcmsLogo,
        "PNG",
        this.margin / 2,
        this.currentY,
        13,
        13
      ); //x,y,w,h
      this.currentY += 10;
      this.doc.text(
        this.margin + 15,
        this.currentY,
        "LANDSCAPE CHANGE MONITORING SYSTEM"
      ); //x,y,text
      let lineHeight =
        this.doc.getLineHeight("LANDSCAPE CHANGE MONITORING SYSTEM") /
        this.doc.internal.scaleFactor;
      let lines = 1; // splitted text is a string array
      let blockHeight = lines * lineHeight;
      this.currentY += blockHeight + 10;
      this.doc.setFont(undefined, "normal");

      this.doc.setFontSize(26);
      this.doc.setFont(undefined, "normal");
      this.doc.setTextColor(0, 0, 0); //8,124,124)
      const question = "How is our landscape changing?"; //change to document.getElementById("options-dropdown").value;//
      const wrapQuestion = this.doc.splitTextToSize(question, 180);
      this.doc.text(this.margin, this.currentY, wrapQuestion);

      lineHeight = 12; //doc.getLineHeight(question) / doc.internal.scaleFactor
      lines = wrapQuestion.length; // splitted text is a string array
      blockHeight = lines * lineHeight;
      this.currentY += blockHeight;
    };
    this.checkForRoom = function (additional = 0) {
      if (this.currentY + this.margin + additional > this.h) {
        console.log(
          `Adding page: y=${this.currentY},margin=${this.margin},additional=${additional},pageH=${this.h}`
        );
        this.doc.addPage();
        this.currentY = this.margin;
      }
    };
    this.getTextHeight = function (text, fontSize = 12) {
      this.doc.setFontSize(fontSize);

      let textWrap = this.doc.splitTextToSize(text, this.w - 2 * this.margin);
      let textBlockHeight = this.doc.getTextDimensions(textWrap).h;
      return textBlockHeight;
    };
    this.addText = function (text, fontSize = 12, link = null) {
      console.log(`Adding text: ${text}`);

      this.doc.setFontSize(fontSize);

      let textWrap = this.doc.splitTextToSize(text, this.w - 2 * this.margin);
      let textBlockHeight = this.doc.getTextDimensions(textWrap).h;
      let textHeight = this.doc.getTextDimensions(text).h;
      this.checkForRoom(textBlockHeight);
      this.currentY += textHeight;
      if (link === null || link === undefined) {
        this.doc.text(this.margin, this.currentY, textWrap);
        this.currentY += textBlockHeight;
      } else {
        this.doc.setTextColor(0, 137, 123);
        this.doc.textWithLink(text, this.margin, this.currentY, { url: link });
        this.currentY += textHeight;
        this.doc.setTextColor(0, 0, 0);
      }
    };
    this.addBySelector = function (
      selector,
      preceedingText = null,
      preceedingTextFontSize = 18,
      maxWidth = null,
      callback = null
    ) {
      const d = document.querySelector(selector);
      const aspectRatio = d.clientHeight / d.clientWidth;
      let imgW;
      if (maxWidth === null || maxWidth === undefined) {
        imgW = this.w - this.margin * 2;
      } else {
        imgW = maxWidth;
      }

      const h = imgW * aspectRatio;
      const margin = this.margin;

      if (preceedingText !== null && preceedingText !== undefined) {
        let textHeight = this.getTextHeight(
          preceedingText,
          preceedingTextFontSize
        );
        this.checkForRoom(textHeight + margin + h);
        this.addText(preceedingText, preceedingTextFontSize);
      } else {
        this.checkForRoom(h);
      }

      const that = this;
      const currentY = this.currentY;

      html2canvas(d, {
        useCORS: true,
        allowTaint: false,
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        console.log([margin, currentY, imgW, h, aspectRatio]);

        that.doc.addImage(imgData, "PNG", margin, currentY, imgW, h);
        that.currentY += h;
        that.checkForRoom();
        callback();
      });
    };
    this.outstandingCharts = 0;
    this.addChartJS = function (id) {
      const that = this;
      that.outstandingCharts++;
      console.log(`Adding chart: ${id}`);

      const canvas0 = document.getElementById(id);
      let chartHeight = canvas0.height;
      let chartWidth = canvas0.width;
      let aspectRatio = chartHeight / chartWidth;
      let chartW = this.w - this.margin * 4;
      let chartH = chartW * aspectRatio;
      this.checkForRoom(chartH + this.margin);
      //for some reason changing this first chart to a png (not jpeg) fixes issue with black chart background
      let dataURL = canvas0.toDataURL("image/jpg", 1.0);
      let link = document.createElement("a");
      link.download = id;
      link.href = dataURL;
      this.doc.addImage(
        dataURL,
        "JPG",
        this.margin * 2,
        this.currentY,
        chartW,
        chartH,
        { compresion: "NONE" }
      );
      this.currentY = this.currentY + chartH + this.margin;
      that.outstandingCharts--;
    };
    this.addPlotlyPlots = function () {
      let chartHeight = 400;
      let chartWidth = 600;
      let aspectRatio = chartHeight / chartWidth;
      let chartW = this.w - this.margin * 4;
      let chartH = chartW * aspectRatio;
      dashboardPlotlyDownloadURLs.map((dataURL) => {
        this.checkForRoom(chartH + this.margin);
        this.doc.addImage(
          dataURL,
          "PNG",
          this.margin * 2,
          this.currentY,
          chartW,
          chartH,
          { compresion: "NONE" }
        );
        this.currentY = this.currentY + chartH + this.margin;
      });
    };
    this.addTables = function () {
      let that = this;

      $(".report-table").each(function () {
        that.currentY = that.currentY + that.margin;
        that.addText($(this).attr("tablename").replaceAll("-", " - "));
        that.doc.autoTable({
          html: `#${this.id}`,
          useCss: true,
          startY: that.currentY,
          margin: { left: that.margin, right: that.margin },
        });
        that.currentY = that.doc.lastAutoTable.finalY;
      });
    };
    this.addPageNumbers = function (fontSize = 10) {
      const pageCount = this.doc.internal.getNumberOfPages();
      console.log(`Page count: ${pageCount}`);
      const w = this.doc.internal.pageSize.width;
      const h = this.doc.internal.pageSize.height;
      let fs = this.doc.getFontSize();
      this.doc.setFontSize(fontSize);

      range(1, pageCount + 1).map((pn) => {
        this.doc.setPage(pn);
        this.doc.text(`${pn} of ${pageCount}`, w / 2, h - 10, {
          align: "center",
        });
      });
      this.doc.setFontSize(fs);
    };
    this.download = function (outFilename) {
      this.doc.save(outFilename + ".pdf");
    };
  }
}

function makeDashboardReport() {
  $("body").prop("disabled", true);
  $("#lcms-spinner").prop("title", "Downloading report");
  $("#lcms-spinner").show();
  map.setOptions({
    zoomControl: false,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
  });
  let sidebarTogglerClicked = false;
  const collapseClicked = [];
  const needsOpenList = ["legend-collapse", "charts-collapse"];
  if ($("#sidebar-left").css("display") === "none") {
    toggleSidebar();
    sidebarTogglerClicked = true;
  }
  needsOpenList.map((needsOpen) => {
    if (!$(`#${needsOpen}-div`).hasClass("show")) {
      $(`#${needsOpen}-label-label`).click();
      collapseClicked.push(needsOpen);
    }
  });
  const dashboardReport = new report();
  dashboardReport.addReportHeader();
  storeParams(false, false);
  // TweetThis((preURL = ""), (postURL = ""), (openInNewTab = false), (showMessageBox = false), (onlyURL = true));
  setTimeout(() => {
    dashboardReport.addText(`Resources`, 18);
    dashboardReport.addText(
      `Source LCMS Dashboard instance used to create this report`,
      12,
      fullShareURL
    );
    dashboardReport.addText(
      `For any questions, contact the LCMS Helpdesk`,
      12,
      "mailto: sm.fs.lcms@usda.gov"
    );
    dashboardReport.currentY += 2;
    dashboardReport.addText(`Background`, 18);
    dashboardReport.addText(
      `LCMS is a remote sensing-based system for mapping and monitoring landscape change across the United States, produced by the USDA Forest Service. LCMS provides a "best available" map of landscape change that leverages advances in time series-based change detection techniques, Landsat data availability, cloud-based computing power, and big data analysis methods.`,
      12
    );
    dashboardReport.addText(
      `LCMS produces annual maps depicting change (vegetation cover loss and gain), land cover, and land use from 1985 to present that can be used to assist with a wide range of land management applications. With the help of Regional and National Forest staffs, we have identified many applications of LCMS data, including forest planning and revision, updating existing vegetation maps, assessing landscape conditions, supporting post-fire recovery, meeting some broad-scale monitoring requirements, and many others.`,
      12
    );
    dashboardReport.addText(
      `This report was generated from the LCMS Dashboard 2024.1 version. The LCMS Dashboard is intended to simplify the use of LCMS data by providing pre-computed summaries for various areas of interest throughout the United States. The LCMS Dashboard is currently under review. We would appreciate any feedback you may have. See the helpdesk link below.`,
      12
    );
    dashboardReport.addText(
      `Detailed methods can be found here`,
      12,
      "https://data.fs.usda.gov/geodata/rastergateway/LCMS/LCMS_v2023-9_Methods.pdf"
    );

    dashboardReport.addText(
      `${staticTemplates.dashboardHighlightsDisclaimerText}`,
      10
    );

    function allTheRest() {
      dashboardReport.currentY += dashboardReport.margin;
      dashboardReport.addText(`Chart Results`, 18);
      dashboardReport.addText(
        `The following charts depict the ${chartFormat.toLowerCase()} of all selected summary areas for a given summary area set for each class from ${
          urlParams.startYear
        } to ${
          urlParams.endYear
        } (See tables below for names of summary areas included in these charts). These charts can be useful to identify broad trends of change within and between different classes.`,
        12
      );

      $("#charts-collapse-div canvas").each(function () {
        let id = $(this).attr("id");
        if (id !== undefined && id.indexOf("chart-canvas") > -1) {
          dashboardReport.addChartJS(id);
        }
      });
      dashboardReport.addPlotlyPlots();
      dashboardReport.addText(`Tabular Results`, 18);
      dashboardReport.addText(
        `The following tables depict the ${chartFormat.toLowerCase()} of each summary area that LCMS identified as a given class in the ${
          urlParams.startYear
        } and ${
          urlParams.endYear
        }. The "Change" column is computed by subtracting the first year from the last year.`,
        12
      );
      dashboardReport.addText(
        `While model-based estimates of change, land cover, and land use can be useful, it is difficult to know if a change is statistically significant. The LCMS Science Team is currently researching methods for computing significance from model-based outputs. In the meantime, in order to provide confidence intervals for the tables in this report, we are using our reference sample and traditional confidence interval computation methods.`,
        12
      );

      dashboardReport.addText(
        `First, since our reference sample was a stratified random sample, we consider the weight of each point as the proportion of the strata it was drawn from divided by proportion of the total samples we drew from that strata. This way, if a strata is over-sampled, each sample gets a lower weight and visa versa.`,
        12
      );
      dashboardReport.addText(
        `Since N is generally > 30, we are using a Z test to test for significant differences. The critical values for confidence levels are as follows (Z Test): 0.9: 1.64, 0.95: 1.96, 0.99: 2.58.`,
        12
      );
      dashboardReport.addText(
        `For each year, all reference points that fall within a given summary area for that year, as well as the year prior and year after, plus a 210km buffer, are tabulated for the strata weighted proportion of each class. This allows for confidence intevals for a given class for a given area to then be computed as follows:`,
        12
      );
      dashboardReport.addText(
        `ci =critical value*sqrt((TS Weighted Proportion*(1-TS Weighted Proportion))/TS Weighted Total).`,
        12
      );
      dashboardReport.addText(
        `Based on Olofsson et al 2014 Equations 10 and 11.`,
        12,
        window.location.href.split("/dashboard.html")[0] +
          "/literature/Olofsson_et_al_2014.pdf"
      );
      dashboardReport.addText(
        `This number is then added and subtracted from each amount for each class. If an amount of a given class in the first year does not intersect the amount in the last year, it is highlighted as being a signficant change in the tables below. Many summary areas had insufficient reference samples in some classes for some years to compute confidence intervals. In those instances, the confidence interval is denoted as "NA" and a significance test cannot be performed.`,
        12
      );
      dashboardReport.addTables();
      let reportName = `LCMS_Change_Report_${urlParams.startYear}-${
        urlParams.endYear
      }_${new Date().toStringFormat()}`;
      dashboardReport.addPageNumbers();

      dashboardReport.download(reportName);
      $("body").prop("disabled", false);
      $("#lcms-spinner").hide();
      showSurveyModal("dashboardReportDownload");

      if (sidebarTogglerClicked) {
        toggleSidebar();
      }
      collapseClicked.map((k) => {
        $(`#${k}-label-label`).click();
      });

      map.setOptions({
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
      });
    }
    function addLegend() {
      dashboardReport.addBySelector(
        "#legend-collapse-div",
        null,
        12,
        60,
        allTheRest
      );
    }

    dashboardReport.doc.addPage();
    dashboardReport.currentY = dashboardReport.margin;
    dashboardReport.addBySelector("#map", "Overview Map", 18, null, addLegend);
  }, 500);
}

function moveDashboardResults(location = "left") {
  if (dashboardResultsLocation !== location) {
    const outLoc = dashboardMoveLocationDict[location];

    moveCollapse("charts-collapse", outLoc);
    moveCollapse("tables-collapse", outLoc);

    if (location == "right") {
      $("#dashboard-results-container-right").show();
      $("#dashboard-results-sidebar-toggler").show();
      moveElement(
        "#dashboard-download-button",
        "#dashboard-download-button-container"
      );
    } else {
      $("#dashboard-results-container-right").hide();
      $("#dashboard-results-sidebar-toggler").hide();
      moveElement("#dashboard-download-button", "#sidebar-left-header");
    }
    dashboardResultsLocation = location;
    turnOffScrollMonitoring();
    turnOnScrollMonitoring();
  }
  updateDashboardCharts();
}
function toggleDashboardResultsLocation() {
  if (dashboardResultsLocation === "right") {
    moveDashboardResults("left");
  } else {
    moveDashboardResults("right");
  }
}
