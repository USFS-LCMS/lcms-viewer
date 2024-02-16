function areaChartCls() {
  this.areaChartID = 1;
  this.makeChartID = 0;
  this.areaChartObj = {};
  this.outstandingChartRequests = 0;
  this.chartContainerID = "chart-collapse-div";
  this.layerSelectContainerID = "area-chart-params-div";
  this.layerSelectID = "area-chart-layer-select";
  this.listeners = [];
  this.autoScale = true;

  this.sankeyTransitionPeriodYearBuffer = 2;
  this.sankeyTransitionPeriods = [
    [urlParams.startYear, urlParams.startYear + this.sankeyTransitionPeriodYearBuffer],
    [2000 - this.sankeyTransitionPeriodYearBuffer, 2000],
    [urlParams.endYear - this.sankeyTransitionPeriodYearBuffer, urlParams.endYear],
  ];

  // Add chart layer object
  this.addLayer = function (eeLayer, params = {}, name, shouldChart = true) {
    let obj = {};
    obj.name = name || `Area-Layer-${this.areaChartID}`;
    obj.id = obj.name.replaceAll(" ", "-") + "-" + this.areaChartID.toString();
    obj.id = obj.id.replace(/[^A-Za-z0-9]/g, "-");
    obj.bandNames = params.bandNames || eeLayer.first().bandNames().getInfo();

    // if (params.autoViz) {
    let bandNames = eeLayer.first().bandNames();
    let dict = eeLayer.first().toDictionary();
    dict = dict.set("bandNames", bandNames).getInfo();
    //   console.log(dict);
    params.class_names = params.class_names || {};
    params.class_values = params.class_values || {};
    params.class_palette = params.class_palette || {};
    params.class_visibility = params.class_visibility || {};
    obj.bandNames = [];
    dict.bandNames.map((bn) => {
      let cns = dict[`${bn}_class_names`];
      let cvs = dict[`${bn}_class_values`];
      let cp = dict[`${bn}_class_palette`];
      let cv = dict[`${bn}_class_visibility`];
      if (cns !== undefined) {
        params.class_names[bn] = params.class_names[bn] || cns;
        params.class_values[bn] = params.class_values[bn] || cvs;
        params.class_palette[bn] = params.class_palette[bn] || cp;
        params.class_visibility[bn] = params.class_visibility[bn] || cv;
      }

      // else {
      // params.class_names = null;
      // params.class_values = null;
      // params.class_palette = null;
      // }
      obj.bandNames.push(bn);
    });
    // } else {
    // }
    eeLayer = eeLayer.select(obj.bandNames);
    obj.item = eeLayer.select(obj.bandNames);
    obj.class_names = params.class_names || null;
    obj.class_values = params.class_values || null;
    obj.class_palette = params.class_palette || null;
    obj.class_visibility = params.class_visibility || null;
    obj.palette = params.palette || Array(obj.bandNames.length).fill(null);
    obj.chartType = params.chartType || "line";
    obj.stackedAreaChart = params.stackedAreaChart || false;
    obj.steppedLine = params.steppedLine || false;
    obj.label = obj.name;

    obj.xAxisLabel = params.xAxisLabel || "Year";
    obj.xAxisProperty = params.xAxisProperty || "year";
    obj.dateFormat = params.dateFormat || "YYYY";
    obj.yLabelFontSize = params.yLabelFontSize || 12;
    obj.chartWidthC = params.chartWidthC || 600;
    obj.xTickDateFormat = params.xTickDateFormat || null;
    obj.chartDecimalProportion = params.chartDecimalProportion;
    obj.chartPrecision = params.chartPrecision;
    obj.scale = params.scale || scale;
    obj.transform = params.transform || transform;
    obj.crs = params.crs || crs;

    // Control for setting only one of scale or transform - defaults to transform (since it snaps)
    if (params.scale !== undefined && params.scale !== null && params.transform !== undefined && params.transform !== null) {
      obj.scale = null;
    }
    obj.chartScale = scale;
    obj.shouldChart = shouldChart;
    obj.sankey = params.sankey || false;

    if (obj.scale === undefined || obj.scale === null) {
      obj.chartScale = obj.transform[0];
    }
    if (obj.dateFormat.indexOf("HH:mm") > -1) {
      obj.xTickDateFormat = "%Y-%m-%d\n%H:%M";
    }

    // Set up class name, value, color pairwise combos for each band if sankey
    if (obj.sankey) {
      obj.sankey_class_names = {};
      obj.sankey_class_values = {};
      obj.sankey_class_palette = {};

      obj.bandNames.map((bn) => {
        let bn_sankey_class_names = [];
        let bn_sankey_class_values = [];
        let bn_sankey_class_palette = [];
        range(0, obj.class_names[bn].length).map((i1) => {
          range(0, obj.class_names[bn].length).map((i2) => {
            bn_sankey_class_names.push([obj.class_names[bn][i1], obj.class_names[bn][i2]]);
            bn_sankey_class_values.push([obj.class_values[bn][i1], obj.class_values[bn][i2]]);
            bn_sankey_class_palette.push([obj.class_palette[bn][i1], obj.class_palette[bn][i2]]);
          });
        });
        obj.sankey_class_names[bn] = bn_sankey_class_names;
        obj.sankey_class_values[bn] = bn_sankey_class_values;
        obj.sankey_class_palette[bn] = bn_sankey_class_palette;
      });
    }
    if (Object.keys(obj.class_names).length > 0) {
      obj.isThematic = true;
      obj.reducer = params.reducer || ee.Reducer.frequencyHistogram();
    } else {
      obj.isThematic = false;
      obj.reducer = params.reducer || ee.Reducer.mean();
      obj.visible = params.visible;
      obj.yAxisLabel = obj.reducer.getInfo().type.split(".")[1].toTitle();
    }

    this.areaChartObj[obj.id] = obj;
    this.areaChartID++;
  };
  this.autoSetScale = function (scale) {
    return scale * this.getAutoScale();
  };
  this.getAutoScale = function () {
    let zoom = map.getZoom();
    console.log(1 / zoom);
    if (zoom < 11) {
      return 5;
    } else {
      return 1;
    }
  };

  this.startAutoCharting = function () {
    this.listeners.push(
      google.maps.event.addListener(map, "idle", () => {
        this.chartMapExtent();
      })
    );
    this.chartMapExtent();
  };
  this.stopAutoCharting = function () {
    this.listeners.map((e) => google.maps.event.removeListener(e));
  };

  // this.populateChartDropdown = function () {
  // populateChartDropdown("area-collection-dropdown", this.areaChartObj, "whichAreaChartCollection"); //populateChartDropdown(id, collectionDict, whichChartCollectionVar);
  // };
  this.clearCharts = function () {
    $(`#${this.chartContainerID}`).empty();
  };
  this.chartMapExtent = function (name = "") {
    let mapCoords = Object.values(map.getBounds().toJSON()).map(smartToFixed).join(",");
    this.clearCharts();
    this.chartArea(eeBoundsPoly, `${name} ${mapCoords}`);
  };

  this.makeSankeyChart = function (sankey_dict, labels, colors, bn, name, selectedObj, thickness = 20, nodePad = 25, fontSize = 10) {
    $("#chart-collapse-label-chart-collapse-div").show();
    $("#legendDiv").css("max-width", "575px");
    $("#legendDiv").css("max-height", window.innerHeight - convertRemToPixels(1) + 1);

    sankey_dict.hovertemplate = "%{value}" + chartFormatDict[areaChartFormat].label + " %{source.label}-%{target.label}<extra></extra>";

    var data = {
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
        color: colors,
        hovertemplate: "%{value}" + chartFormatDict[areaChartFormat].label + " %{label}<extra></extra>",
      },

      link: sankey_dict,
    };
    // console.log(labels);
    // console.log(colors);
    // console.log(sankey_dict);
    var data = [data];

    // let h = parseInt($('#chart-modal-body').width()*0.5);
    // let w = $('#chart-modal-body').width();
    // console.log(h);console.log(w);
    var plotLayout = {
      title: name,
      font: {
        size: fontSize,
        family: "Roboto Condensed, sans-serif",
      },
      plot_bgcolor: "#D6D1CA",
      paper_bgcolor: "#D6D1CA",

      autosize: true,
      margin: {
        l: 25,
        r: 25,
        b: 25,
        t: 50,
        pad: 4,
      },
    };
    var config = {
      toImageButtonOptions: {
        format: "png", // one of png, svg, jpeg, webp
        filename: name,
        width: 1000,
        height: 600,
      },
      scrollZoom: true,
      displayModeBar: true,
    };
    // return Plotly.newPlot(canvasID, data, layout, config);
    let tempGraphDivID = `${this.chartContainerID}-${selectedObj.id}-${bn}`;
    // console.log(bn);
    $(`#${this.chartContainerID}`).append(`<div id = ${tempGraphDivID}></div><hr>`);
    var graphDiv = document.getElementById(tempGraphDivID);
    Plotly.newPlot(graphDiv, data, plotLayout, config);
  };
  this.makeChart = function (table, name, colors, visible, selectedObj) {
    // let selectedObj = this.areaChartObj[whichAreaChartCollection];

    if (selectedObj.chartDecimalProportion !== undefined && selectedObj.chartDecimalProportion !== null) {
      chartDecimalProportion = selectedObj.chartDecimalProportion;
    }
    if (selectedObj.chartPrecision !== undefined && selectedObj.chartPrecision !== null) {
      chartPrecision = selectedObj.chartPrecision;
    }
    $("#chart-collapse-label-chart-collapse-div").show();
    $("#legendDiv").css("max-width", "575px");
    $("#legendDiv").css("max-height", window.innerHeight - convertRemToPixels(1) + 1);
    let xColumn = arrayColumn(table, 0).slice(1);
    let header = table.slice(0, 1)[0];
    table = table.slice(1);
    // console.log(header);
    let yColumns = range(1, header.length);
    let yAxisLabel = selectedObj.yAxisLabel || chartFormatDict[areaChartFormat].label;
    // console.log(yColumns);
    // console.log(xColumn);
    var data = yColumns.map((i) => {
      return {
        x: xColumn,
        y: arrayColumn(table, i).map(smartToFixed),
        type: "scatter",
        visible: visible[i - 1],
        name: header[i],
        line: { color: colors[i - 1] },
      };
    });
    // console.log(data);

    var plotLayout = {
      plot_bgcolor: "#D6D1CA",
      paper_bgcolor: "#D6D1CA",
      font: {
        family: "Roboto Condensed, sans-serif",
      },
      legend: {
        font: { size: selectedObj.yLabelFontSize },
      },

      margin: {
        l: 50,
        r: 10,
        b: 50,
        t: 50,
        pad: 0,
      },
      width: selectedObj.chartWidthC,
      height: 400,
      title: {
        text: `${selectedObj.name} Summary (${name})`,
      },
      xaxis: {
        tickangle: 45,
        tickformat: selectedObj.xTickDateFormat,
        tickfont: { size: selectedObj.yLabelFontSize },
        title: {
          text: selectedObj.xAxisLabel,
          font: {
            size: 12,
          },
        },
      },
      yaxis: { tickfont: { size: yLabelFontSize }, title: { text: yAxisLabel } },
    };
    var buttonOptions = {
      toImageButtonOptions: {
        filename: name,
        width: 900,
        height: 600,
        format: "png",
      },
    };

    let tempGraphDivID = `${this.chartContainerID}-${selectedObj.id}`;
    $(`#${this.chartContainerID}`).append(`<div id = ${tempGraphDivID}></div><hr>`);
    var graphDiv = document.getElementById(tempGraphDivID);
    Plotly.newPlot(graphDiv, data, plotLayout, buttonOptions);
  };

  this.chartArea = function (area, name = "Default Name") {
    this.makeChartID++;
    this.outstandingChartRequests = 0;
    let splitStr = "----";
    // console.log(area);
    Object.keys(selectedChartLayers).map((k) => {
      // console.log(k);
      let selectedObj = Object.fromEntries(Object.entries(this.areaChartObj).filter(([k2, v]) => v.name == k && selectedChartLayers[k] === true));
      selectedObj = Object.values(selectedObj)[0];
      if (selectedObj !== undefined) {
        // console.log(selectedObj);
        $("#summary-spinner").slideDown();
        // // Older area charting method
        if (selectedObj.xAxisProperty === "year") {
          selectedObj.item = selectedObj.item.map(function (img) {
            return img.set("year", img.date().format(selectedObj.dateFormat));
          });
        }
        let makeChartID = this.makeChartID;

        if (selectedObj.sankey) {
          selectedObj.bandNames.map((bn) => {
            this.outstandingChartRequests++;
            let itemBn = selectedObj.item.select(bn);
            let sankeyC = [];
            let transitionBns = [];
            range(0, this.sankeyTransitionPeriods.length - 1).map((transitionPeriodI) => {
              let sankeyTransitionPeriod1 = this.sankeyTransitionPeriods[transitionPeriodI];
              let sankeyTransitionPeriod2 = this.sankeyTransitionPeriods[transitionPeriodI + 1];
              // console.log(sankeyTransitionPeriod1, sankeyTransitionPeriod2);
              let itemBnTransitionPeriod1 = itemBn.filter(ee.Filter.calendarRange(sankeyTransitionPeriod1[0], sankeyTransitionPeriod1[1], "year")).mode();
              let itemBnTransitionPeriod2 = itemBn.filter(ee.Filter.calendarRange(sankeyTransitionPeriod2[0], sankeyTransitionPeriod2[1], "year")).mode();
              let transitionImg = ee.Image(0);

              selectedObj.sankey_class_values[bn].map((sankey_class_values_pair) => {
                // console.log(sankey_class_values_pair);
                outClass = parseInt(`${sankey_class_values_pair[0]}009900${sankey_class_values_pair[1]}`);
                // console.log(outClass);
                transitionImg = transitionImg.where(itemBnTransitionPeriod1.eq(sankey_class_values_pair[0]).and(itemBnTransitionPeriod2.eq(sankey_class_values_pair[1])), outClass);
              });
              let transitionBn = `${sankeyTransitionPeriod1.join("-")}---${sankeyTransitionPeriod2.join("-")}`;
              transitionBns.push(transitionBn);
              transitionImg = transitionImg.set("system:index", transitionBn).rename(`${bn}`);
              sankeyC.push(transitionImg);
              // console.log([sankeyTransitionPeriod, itemBnTransitionPeriod.size().getInfo()]);
            });
            sankeyC = ee.ImageCollection(sankeyC).toBands().rename(transitionBns);

            sankeyC.reduceRegion(selectedObj.reducer, area, selectedObj.scale, selectedObj.crs, selectedObj.transform, true, 1e13, 4).evaluate((counts, failure) => {
              if (failure !== undefined) {
                showMessage("Area Charting Error", `Encountered the following error while summarizing ${selectedObj.name}<br>${failure}`);
              } else {
                // console.log(counts);
                if (makeChartID === this.makeChartID) {
                  let transitionPeriodI = 1;

                  let sankey_dict = {
                    source: [],
                    target: [],
                    value: [],
                  };
                  let labels = [];
                  let colors = [];
                  selectedObj.class_names[bn].map((l) => labels.push(`${this.sankeyTransitionPeriods[0].join("-")} ${l}`));
                  selectedObj.class_palette[bn].map((c) => colors.push(c));

                  Object.keys(counts).map((transitionPeriod) => {
                    // console.log(transitionPeriod);
                    let offset1 = (transitionPeriodI - 1) * selectedObj.class_names[bn].length;
                    let offset2 = transitionPeriodI * selectedObj.class_names[bn].length;
                    //Append labels and colors
                    selectedObj.class_names[bn].map((l) => labels.push(`${this.sankeyTransitionPeriods[transitionPeriodI].join("-")} ${l}`));
                    selectedObj.class_palette[bn].map((c) => colors.push(c));

                    let countsTransitionPeriod = counts[transitionPeriod];
                    let values = Object.values(countsTransitionPeriod);
                    let pixelTotal = sum(values);
                    let mult;
                    if (areaChartFormat === "Percentage") {
                      mult = (1 / pixelTotal) * 100;
                    } else {
                      mult = chartFormatDict[areaChartFormat].mult;
                    }
                    values = values.map((v) => v * mult);
                    let classes = Object.keys(countsTransitionPeriod).map((cls) => cls.split("009900").map((n) => parseInt(n)));
                    // console.log(classes);
                    let vi = 0;
                    classes.map((cls) => {
                      // console.log(cls);
                      sankey_dict.source.push(selectedObj.class_values[bn].indexOf(cls[0]) + offset1);
                      sankey_dict.target.push(selectedObj.class_values[bn].indexOf(cls[1]) + offset2);
                      sankey_dict.value.push(values[vi]);
                      vi++;
                    });

                    transitionPeriodI++;
                  });
                  this.makeSankeyChart(sankey_dict, labels, colors, bn, `${selectedObj.name} Sankey ${bn.replaceAll("_", " ")} ${name}`, selectedObj);
                  // console.log(labels);
                  // console.log(colors);
                  // console.log(sankey_dict);
                  this.outstandingChartRequests--;
                  if (this.outstandingChartRequests === 0) {
                    $("#summary-spinner").slideUp();
                  }
                } else {
                  console.log("chart id moved on");
                }
              }
            });
          });
        } else {
          this.outstandingChartRequests++;
          let areaChartCollectionStack = selectedObj.item.toBands();
          let xLabels = selectedObj.item.aggregate_histogram(selectedObj.xAxisProperty).keys().getInfo();

          // console.log(xLabels);
          let stackBandNames = [];
          xLabels.map((xLabel) => {
            selectedObj.bandNames.map((bn) => {
              stackBandNames.push(`${xLabel}${splitStr}${bn}`);
            });
          });
          let header = [selectedObj.xAxisLabel];

          // Pull auto viz attributes if available
          let colors = [];
          let visible = [];
          if (selectedObj.isThematic === true) {
            selectedObj.bandNames.map((bn) => {
              let bnL = bn.replace(/[^A-Za-z0-9]/g, "-");
              let nameStart = `${bnL}-`;
              if (selectedObj.bandNames.length == 1) {
                nameStart = "";
              }
              selectedObj.class_names[bn].map((cn) => {
                cd = cn.replace(/[^A-Za-z0-9]/g, "-");
                header.push(`${nameStart}${cn}`);
              });
              selectedObj.class_palette[bn].map((color) => {
                colors.push(color);
              });
              if (selectedObj.class_visibility[bn] !== undefined) {
                selectedObj.class_visibility[bn].map((v) => {
                  visible.push(v == true ? v : "legendonly");
                });
              } else {
                selectedObj.class_names[bn].map((cn) => {
                  visible.push(true);
                });
              }
            });
          } else {
            colors = selectedObj.palette;
            visible = selectedObj.visible === undefined ? selectedObj.bandNames.map((bn) => true) : selectedObj.visible.map((v) => (v === true ? v : "legendonly"));
            selectedObj.bandNames.map((bn) => header.push(bn.replace(/[^A-Za-z0-9]/g, "-")));
          }
          // console.log(visible);
          // console.log(header);
          areaChartCollectionStack = areaChartCollectionStack.rename(stackBandNames);
          // console.log(areaChartCollectionStack.bandNames().getInfo());
          // this.getZonalStats(areaChartCollectionStack, area, selectedObj.reducer);

          areaChartCollectionStack.reduceRegion(selectedObj.reducer, area, selectedObj.scale, selectedObj.crs, selectedObj.transform, true, 1e13, 4).evaluate((counts, failure) => {
            if (makeChartID === this.makeChartID) {
              if (failure !== undefined) {
                showMessage("Area Charting Error", `Encountered the following error while summarizing ${selectedObj.name}<br>${failure}`);
              } else {
                // console.log(counts);
                let outTable = [header];
                xLabels.map((xLabel) => {
                  let row = [xLabel];

                  if (selectedObj.isThematic) {
                    selectedObj.bandNames.map((bn) => {
                      let countsT = counts[`${xLabel}${splitStr}${bn}`];
                      let values = selectedObj.class_values[bn];
                      let names = selectedObj.class_names[bn];
                      let pixelTotal = sum(Object.values(countsT)) || 0;
                      if (areaChartFormat === "Percentage") {
                        mult = (1 / pixelTotal) * 100;
                      } else {
                        mult = chartFormatDict[areaChartFormat].mult;
                      }
                      // console.log(mult);
                      // console.log(selectedObj.chartScale);
                      // console.log(chartFormatDict[areaChartFormat].scale);
                      //   let value_name_dict = dictFromKeyValues(values, names);
                      //   console.log();
                      values.map((v) => {
                        let tv = countsT[v] || 0;
                        row.push(tv * mult);
                      });
                    });
                  } else {
                    selectedObj.bandNames.map((bn) => {
                      let countsT = counts[`${xLabel}${splitStr}${bn}`];
                      row.push(countsT);
                    });
                  }
                  // console.log(row);
                  outTable.push(row);
                });
                // console.log(outTable);
                this.outstandingChartRequests--;
                if (this.outstandingChartRequests === 0) {
                  $("#summary-spinner").slideUp();
                }
                // console.log(this.outstandingChartRequests);
                this.makeChart(outTable, name, colors, visible, selectedObj);
              }
            } else {
              console.log("chart id moved on");
            }
          });
        }
      }
    });
  };

  this.populateChartLayerSelect = function () {
    let selectedObj = {};
    Object.keys(this.areaChartObj).map((k) => {
      let obj = this.areaChartObj[k];
      selectedObj[obj.name] = obj.shouldChart;
    });

    addCheckboxes(this.layerSelectContainerID, this.layerSelectID, "Chart Layers", "selectedChartLayers", selectedObj);
  };

  this.chartUserDefinedArea = function () {
    try {
      var userArea = [];
      var anythingToChart = false;
      Object.values(udpPolygonObj).map(function (v) {
        var coords = v.getPath().getArray();
        var f = [];
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
        userArea = ee.FeatureCollection(userArea);
        var udpName = $("#user-defined-area-name").val();
        if (udpName === "") {
          udpName = "User Defined Area " + userDefinedI.toString();
          userDefinedI++;
        }
        // var addon = " " + areaChartCollections[whichAreaChartCollection].label + " Summary";
        // udpName += addon;
        this.clearCharts();

        this.chartArea(userArea, udpName);
      }
    } catch (err) {
      showMessage("Error", err);
    }
  };
}

let areaChart = new areaChartCls();
