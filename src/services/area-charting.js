function exportToCsv2(areaObjID, bn, filename) {
  // console.log(filename);
  let table = areaChart.areaChartObj[areaObjID].tableExportData[bn];
  // console.log(table);
  var blob = new Blob([table], { type: "text/csv;charset=utf-8;" });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      ga("send", "event", mode, "new-area-chart-chartDownload", "csv");
    }
  }
}
//////////////////////////////////////////////////////////////////////////
function downloadPlotlyAreaChartWrapper(areaObjID, bn, filename) {
  console.log(areaChart.areaChartObj[areaObjID].plots[bn]);
  downloadPlotly(areaChart.areaChartObj[areaObjID].plots[bn], filename, false);
}
//////////////////////////////////////////////////////////////////////////
function areaChartCls() {
  setupTransitionPeriodUI();
  this.areaChartID = 1;
  this.makeChartID = 0;
  this.outstandingAddLayers = 0;
  this.chartLayerSelectFromMapLayers = true; //Whether to only chart visible area chart enabled layers

  this.areaChartObj = {};
  this.outstandingChartRequests = {};
  this.maxOutStandingChartRequests = {};
  this.chartContainerID = "chart-collapse-div";
  this.layerSelectContainerID = "area-chart-params-div";
  this.layerSelectID = "area-chart-layer-select";
  this.listeners = [];

  this.plot_bgcolor = "#D6D1CA";
  this.plot_font = "Roboto Condensed, sans-serif";
  this.autoChartingOn = false;
  this.firstRun = true;

  this.sankeyTransitionPeriodYearBuffer = 2;

  //////////////////////////////////////////////////////////////////////////
  // Function for cleanup of all area chart layers and output divs
  this.clearLayers = function () {
    this.areaChartObj = {};
    this.areaChartID = 1;
    // this.makeChartID = 0;
    this.clearCharts();
  };
  //////////////////////////////////////////////////////////////////////////
  // Add chart layer object
  this.addLayer = function (eeLayer, params = {}, name, shouldChart = true) {
    if (params !== null && params !== undefined && params.serialized !== null && params.serialized !== undefined && params.serialized === true) {
      eeLayer = ee.Deserializer.decode(eeLayer);

      if (params.reducer !== undefined && params.reducer !== null) {
        params.reducer = ee.Deserializer.fromJSON(params.reducer);
      }
      params.serialized = false;
    }

    // this.outstandingAddLayers++;
    // setTimeout(() => {
    $("#map-defined-area-chart-label").show();

    $("#area-collection-dropdown-container").hide();
    let obj = {};
    obj.name = name || `Area-Layer-${this.areaChartID}`;
    obj.id = params.id || obj.name.replaceAll(" ", "-") + "-" + this.areaChartID.toString();
    obj.id = obj.id.replace(/[^A-Za-z0-9]/g, "-");

    if (params.dictServerSide !== undefined && params.dictServerSide !== null) {
      obj.dictServerSide = params.dictServerSide;
    } else {
      obj.dictServerSide = true;
    }

    params.eeObjInfo = params.eeObjInfo || getImagesLib.eeObjInfo(eeLayer, obj.layerType);
    // console.log(params.eeObjInfo);
    if (params.layerType === undefined || params.layerType === null) {
      if (obj.dictServerSide === true) {
        console.log("start");
        params.eeObjInfo = params.eeObjInfo.getInfo();
        obj.dictServerSide = false;
        console.log(params.eeObjInfo);
      }
      obj.layerType = params.eeObjInfo.layerType;
    } else {
      obj.layerType = params.layerType;
    }

    eeLayer = obj.layerType === "ImageCollection" ? ee.ImageCollection(eeLayer) : ee.Image(eeLayer);
    // console.log(obj.layerType);
    if (obj.layerType !== "ImageCollection" && obj.layerType !== "Image") {
      setTimeout(
        () =>
          showMessage(
            "Area Chart addLayer Error",
            `Cannot add ee object type ${obj.layerType} as an area chart layer.<br>Accepted types are ee.ImageCollection and ee.Image`
          ),
        500
      );
    } else if (obj.layerType === "Image" && params.sankey === true) {
      setTimeout(
        () =>
          showMessage(
            "Area Chart addLayer Error",
            `Cannot add ee object type "${obj.layerType}" as an area chart layer sankey : true.<br>Accepted sankey GEE object types are "ImageCollection"`
          ),
        500
      );
    } else {
      // let bandNames = obj.layerType === "ImageCollection" ? eeLayer.first().bandNames() : eeLayer.bandNames();
      // let dict = obj.layerType === "ImageCollection" ? eeLayer.first().toDictionary() : eeLayer.toDictionary();

      if (params.bandNames === undefined || params.bandNames === null) {
        if (obj.dictServerSide) {
          console.log("start");
          params.eeObjInfo = params.eeObjInfo.getInfo();
          obj.dictServerSide = false;
          console.log(params);
        }
        obj.bandNames = params.eeObjInfo.bandNames;
      } else {
        obj.bandNames = params.bandNames;
      }

      obj.bandNames = typeof obj.bandNames === "string" ? obj.bandNames.split(",") : obj.bandNames;

      if ((params.class_names === undefined || params.class_names === null) && params.class_dicts_added !== true) {
        if (obj.dictServerSide) {
          console.log("start");
          params.eeObjInfo = params.eeObjInfo.getInfo();
          obj.dictServerSide = false;
          console.log(params);
        }
        params = addClassVizDicts(params);
      }
      obj.rangeSlider = params.rangeSlider === true ? {} : null;
      obj.item = eeLayer.select(obj.bandNames);
      obj.class_names = params.class_names || null;
      obj.class_values = params.class_values || null;
      obj.class_palette = params.class_palette || null;
      obj.class_visibility = params.class_visibility || null;
      if (params.showGrid === undefined || params.showGrid === null) {
        params.showGrid = true;
      }
      obj.showGrid = params.showGrid;
      if (obj.class_names !== null) {
        obj.bandNames = Object.keys(obj.class_names);
        obj.item = obj.item.select(obj.bandNames);
      }
      obj.palette = params.palette; // || Array(obj.bandNames.length).fill(null);
      if (typeof obj.palette === "string") {
        obj.palette = obj.palette.split(",");
      }
      obj.palette_lookup = params.palette_lookup;
      obj.chartType = params.chartType || "line";
      obj.stackedAreaChart = params.stackedAreaChart || false;
      obj.steppedLine = params.steppedLine || false;
      obj.label = obj.name;

      obj.xAxisLabel = params.xAxisLabel || obj.layerType === "ImageCollection" ? "Year" : "";
      obj.xAxisLabels = params.xAxisLabels;

      obj.xAxisProperty = params.xAxisProperty || obj.layerType === "ImageCollection" ? "year" : "system:index";
      obj.size = obj.layerType === "ImageCollection" ? obj.item.size().getInfo() : 1;

      obj.dateFormat = params.dateFormat || "YYYY";
      obj.chartLabelFontSize = params.chartLabelFontSize || 10;
      obj.chartAxisTitleFontSize = params.chartAxisTitleFontSize || 12;
      obj.chartLabelMaxWidth = params.chartLabelMaxWidth || 15;
      obj.chartLabelMaxLength = params.chartLabelMaxLength || 50;
      obj.chartWidth = params.chartWidth;
      obj.chartHeight = params.chartHeight;
      obj.xTickDateFormat = params.xTickDateFormat || null;
      obj.chartDecimalProportion = params.chartDecimalProportion;
      obj.chartPrecision = params.chartPrecision;
      obj.scale = params.scale || null;
      obj.transform = params.transform || [30, 0, -2361915, 0, -30, 3177735];
      obj.crs = params.crs || crs;
      obj.autoScale = params.autoScale || true; // Whether to set the reducer resolution to a larger number below a specified zoom (next param)
      obj.minZoomSpecifiedScale = params.minZoomSpecifiedScale || 11; // Above this zoom level, it won't change the scale/transform of teh reducer
      obj.maxAutoScale = 2 ** 6; // Max n scale can be multiplied by (ideally 2**n)
      obj.sankeyTransitionPeriods = params.sankeyTransitionPeriods;
      obj.plots = {};
      obj.tableExportData = {};
      obj.splitStr = "----";

      // .map((yr) => parseInt(yr));
      // Control for setting only one of scale or transform - defaults to transform (since it snaps)
      if (params.scale !== undefined && params.scale !== null && params.transform !== undefined && params.transform !== null) {
        obj.scale = null;
      }
      obj.chartScale = scale;
      obj.shouldChart = shouldChart;
      obj.sankey = params.sankey || false;
      obj.line = params.line || obj.sankey == false;

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

        if (obj.sankeyTransitionPeriods === undefined || obj.sankeyTransitionPeriods === null) {
          let firstYear = ee.Number.parse(obj.item.sort("system:time_start").first().date().format(obj.dateFormat));
          let lastYear = ee.Number.parse(obj.item.sort("system:time_start", false).first().date().format(obj.dateFormat));
          obj.sankey_years = ee.List([firstYear, lastYear]).getInfo();
        }
        // else {
        //   obj.sankey_years = [obj.sankeyTransitionPeriods[0][0], obj.sankeyTransitionPeriods[obj.sankeyTransitionPeriods.length - 1][1]];
        // }
        // console.log(obj.sankey_years);

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
      } else {
        if (obj.xAxisLabels === undefined || obj.xAxisLabels === null) {
          if (obj.dictServerSide) {
            console.log("start");
            params.eeObjInfo = params.eeObjInfo.getInfo();
            obj.dictServerSide = false;
            console.log(params.eeObjInfo);
          }
          if (Object.keys(params.eeObjInfo).indexOf(obj.xAxisProperty) === -1) {
            console.log("need to add x axis property value");
            if (obj.layerType === "ImageCollection") {
              // console.log(params.eeObjInfo);
              obj.item = obj.item.map(function (img) {
                return img.set("year", img.date().format(obj.dateFormat));
              });
              // obj.xAxisLabels = obj.item.aggregate_histogram(obj.xAxisProperty).keys().getInfo();

              // obj.item = tempItem;
              // console.log("here");
              // console.log(obj.xAxisLabels);
            } else {
              obj.item = obj.item.set("year", obj.item.date().format(obj.dateFormat));
              // obj.xAxisLabels = [obj.item.get(obj.xAxisProperty).getInfo()];
              // obj.item = tempItem;
            }
          }

          if (obj.layerType === "ImageCollection") {
            obj.xAxisLabels = obj.item.aggregate_histogram(obj.xAxisProperty).keys().getInfo();
          } else {
            obj.xAxisLabels = [obj.item.get(obj.xAxisProperty).getInfo()];
          }
        }
        obj.xAxisLabels = obj.xAxisLabels.map((l) => (isNaN(parseInt(l)) ? l : parseInt(l)));
        // console.log(obj.xAxisLabels);
        if (obj.layerType === "ImageCollection") {
          obj.stackBandNames = [];
          obj.xAxisLabels.map((xLabel) => {
            obj.bandNames.map((bn) => {
              obj.stackBandNames.push(`${xLabel}${obj.splitStr}${bn}`);
            });
          });
          // Mosaic if many :1 image to xAxisLabel exists
          if (obj.size > obj.xAxisLabels.length) {
            console.log("Mosaicking for single image per x label");
            // console.log(obj.xAxisLabels);
            // console.log(obj.size);
            // console.log(obj.item.first().getInfo());
            // console.log(obj.xAxisProperty);
            let temp = [];

            obj.xAxisLabels.map((l) => {
              // l = isNaN(parseInt(l)) ? l : parseInt(l);
              let t = obj.item.filter(ee.Filter.eq(obj.xAxisProperty, l));
              let f = t.first();
              t = t.mosaic().copyProperties(f).set(obj.xAxisProperty, l);
              temp.push(t);
            });
            obj.size = temp.length;
            obj.item = ee.ImageCollection(temp);
            // console.log(obj.item.getInfo());
          }
        } else {
          obj.stackBandNames = obj.bandNames;
        }

        // console.log(obj.stackBandNames);
      }

      if (obj.class_names !== null && Object.keys(obj.class_names).length > 0) {
        obj.isThematic = true;
        obj.reducer = params.reducer || ee.Reducer.frequencyHistogram();
      } else {
        obj.isThematic = false;
        obj.reducer = params.reducer || ee.Reducer.mean();
      }
      obj.visible = params.visible;
      obj.reducerString = obj.reducer.getInfo().type.split("Reducer.")[1];
      obj.isThematic = obj.reducerString === "frequencyHistogram" ? true : obj.isThematic;
      obj.yAxisLabel = obj.yAxisLabel || obj.reducerString === "frequencyHistogram" ? undefined : obj.reducerString.toTitle();

      this.areaChartObj[obj.id] = obj;
      this.areaChartID++;
      this.outstandingAddLayers--;
      // if (this.outstandingAddLayers === 0) {
      this.autoSankeyTransitionPeriods();
      // }
      // console.log(this.outstandingAddLayers);
    }
    // }, 500);
  };
  //////////////////////////////////////////////////////////////////////////
  // Function to figure out the best transition periods for the user interface based on the intersection of provided datasets where sankeyTransitionPeriods were not provided
  this.autoSankeyTransitionPeriods = function () {
    let all_sankey_years = Object.values(this.areaChartObj).filter((v) => v.sankey_years !== undefined);
    if (all_sankey_years.length > 0) {
      all_sankey_years = Object.values(all_sankey_years).map((v) => v.sankey_years);
      let start = all_sankey_years.map((v) => v[0]).min();
      let end = all_sankey_years.map((v) => v[1]).max();
      $("#first-transition-row td input:first").val(start);
      $("#first-transition-row td input:last").val(start + this.sankeyTransitionPeriodYearBuffer);
      $("#last-transition-row td input:first").val(end - this.sankeyTransitionPeriodYearBuffer);
      $("#last-transition-row td input:last").val(end);
    }
  };
  //////////////////////////////////////////////////////////////////////////
  // Function to figure out an optimal resolution for a given map zoom level
  this.autoSetScale = function (scaleT, transformT, minZoomSpecifiedScale, maxAutoScale) {
    scaleT = scaleT || transformT[0];
    let scaleMult = 1 / ((1 << map.getZoom()) / (1 << minZoomSpecifiedScale));
    scaleMult = scaleMult < 1 ? 1 : scaleMult;
    scaleMult = scaleMult > maxAutoScale ? maxAutoScale : scaleMult;
    scaleT = scaleT * scaleMult;

    let nominalScale = scaleT;
    if (transformT !== undefined && transformT !== null) {
      transformT[0] = scaleT;
      transformT[4] = -scaleT;
      scaleT = null;
    }
    // console.log([scaleMult, scaleT, transformT, nominalScale]);
    return [scaleT, transformT, scaleMult, nominalScale];
  };
  //////////////////////////////////////////////////////////////////////////
  // Function to get the current map bounds json string
  this.getMapExtentCoordsStr = function () {
    return Object.values(map.getBounds().toJSON()).map(smartToFixed).join(",");
  };
  //////////////////////////////////////////////////////////////////////////
  // Function to start area charting whenever the map moves
  this.startAutoCharting = function (idleDelay = 2000) {
    this.setupChartProgress();
    let idleEventID = 0;
    this.mapCoordsStr = this.getMapExtentCoordsStr();
    this.listeners.push(
      google.maps.event.addListener(map, "idle", () => {
        let nowCoords = this.getMapExtentCoordsStr();
        if (nowCoords !== this.mapCoordsStr) {
          this.clearCharts();
          $("#query-spinner-img").addClass("fa-spin");
          updateProgress(".progressbar", 0);
          this.mapCoordsStr = nowCoords;
          idleEventID++;
          let idleEventIDT = idleEventID;
          setTimeout(() => {
            if (idleEventID === idleEventIDT) {
              // console.log(idleEventID, idleEventIDT);

              this.chartMapExtent();
            } else {
              console.log("not idle long enough");
              console.log(idleEventID, idleEventIDT);
            }
          }, idleDelay);
        } else {
          console.log("Map has not really moved");
        }
      })
    );
    this.autoChartingOn = true;
    this.chartMapExtent();
  };
  //////////////////////////////////////////////////////////////////////////
  // Function to stop auto charting - cleans up outputs, listeners, and ui elements
  this.stopAutoCharting = function () {
    this.clearCharts();
    this.teardownChartProgress();
    this.listeners.map((e) => google.maps.event.removeListener(e));
    this.listeners = [];
    this.autoChartingOn = false;
  };
  //////////////////////////////////////////////////////////////////////////
  // Clears all charts from container div (selected by id)
  this.clearCharts = function () {
    $(`#${this.chartContainerID}`).empty();
  };
  //////////////////////////////////////////////////////////////////////////
  // Wrapper to chart the current map extent
  this.chartMapExtent = function (name = "") {
    let mapCoords = Object.values(map.getBounds().toJSON()).map(smartToFixed).join(",");
    this.clearCharts();
    this.chartArea(eeBoundsPoly, `${name} (${mapCoords})`);
  };
  //////////////////////////////////////////////////////////////////////////
  // Returns the ui elements for downloading png and csv outputs
  this.getDownloadButtonGroup = function (id, bn, outFilename) {
    return `<div class="btn-group" role="group" >
  <button type="button" class="btn btn-secondary" onclick = "exportToCsv2('${id}','${bn}','${outFilename}.csv')" title = "Click to download ${outFilename}.csv tabular data">CSV</button>
  
  <button type="button" class="btn btn-secondary" onclick = "downloadPlotlyAreaChartWrapper('${id}','${bn}','${outFilename}.png')" title = "Click to download ${outFilename}.png graph data">PNG</button>
</div>`;
    //   return `<div href="#" class = 'btn area-chart-download-btn' title = "Click to download ${outFilename}" onclick = "downloadPlotlyAreaChartWrapper('${id}','${bn}','${outFilename}.png')"><img alt="Downloads icon" src="./src/assets/Icons_svg/dowload_ffffff.svg"><img alt="Downloads icon" src="./src/assets/Icons_svg/graph_ffffff.svg"></div>`;
  };
  //////////////////////////////////////////////////////////////////////////
  // Function to handle creating a sankey chart from given prepared dictionary
  this.makeSankeyChart = function (sankey_dict, labels, colors, bn, name, selectedObj, csvData, thickness = 35, nodePad = 25) {
    sankey_dict.hovertemplate = "%{value}" + chartFormatDict[areaChartFormat].label + " %{source.label}-%{target.label}<extra></extra>";
    let yAxisLabel = selectedObj.yAxisLabel || chartFormatDict[areaChartFormat].label;
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
        // opacity: 0.5,
        hovertemplate: "%{value}" + yAxisLabel + " %{label}<extra></extra>",
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
        size: selectedObj.chartLabelFontSize,
        family: this.plot_font,
      },
      plot_bgcolor: this.plot_bgcolor,
      paper_bgcolor: this.plot_bgcolor,

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
      scrollZoom: false,
      displayModeBar: false,
    };
    // return Plotly.newPlot(canvasID, data, layout, config);
    let outFilename = `${name}`;
    // let downloadCSVButton = this.getDownloadCSVButton(selectedObj.id, outFilename);
    // let
    let tempGraphDivID = `${this.chartContainerID}-${selectedObj.id}-${bn}`;
    // console.log(bn);
    let downloadButtons = this.getDownloadButtonGroup(selectedObj.id, bn, outFilename);
    $(`#${this.chartContainerID}`).append(`<div id = ${tempGraphDivID}></div>${downloadButtons}<div class = 'hl'></div>`);
    var graphDiv = document.getElementById(tempGraphDivID);
    selectedObj.plots[bn] = Plotly.newPlot(graphDiv, data, plotLayout, config);
  };

  this.makeChart = function (table, name, colors, visible, selectedObj) {
    // let selectedObj = this.areaChartObj[whichAreaChartCollection];
    let outFilename = `${selectedObj.name} Summary ${name}`;
    if (selectedObj.chartDecimalProportion !== undefined && selectedObj.chartDecimalProportion !== null) {
      chartDecimalProportion = selectedObj.chartDecimalProportion;
    }
    if (selectedObj.chartPrecision !== undefined && selectedObj.chartPrecision !== null) {
      chartPrecision = selectedObj.chartPrecision;
    }
    let csvTable = [table[0].map((s) => s.replace(/[^A-Za-z0-9]/g, "-"))];
    if (selectedObj.layerType === "ImageCollection") {
      csvTable = csvTable.concat(table.slice(1).map((r) => r.slice(0, 1).concat(r.slice(1).map((n) => smartToFixed(n)))));
    } else {
      csvTable = csvTable.concat(table.slice(1).map((r) => r.map((n) => smartToFixed(n))));
    }

    selectedObj.tableExportData["line"] = csvTable.map((r) => r.join(",")).join("\n");
    // Set up table

    // console.log(downloadButton);
    // exportToCsv(outFilename + ".csv", table);
    let yAxisLabel = selectedObj.yAxisLabel || chartFormatDict[areaChartFormat].label;
    if (selectedObj.layerType === "ImageCollection") {
      let xColumn = arrayColumn(table, 0).slice(1);
      let iOffset = selectedObj.layerType === "ImageCollection" ? 1 : 0;
      let header = table[0];
      table = table.slice(1);
      // console.log(header);
      let yColumns = range(1, header.length);

      // console.log(yColumns);
      // console.log(xColumn);
      var data = yColumns.map((i) => {
        let c = colors !== undefined ? colors[i - iOffset] : null;
        return {
          x: xColumn,
          y: arrayColumn(table, i).map(smartToFixed),
          // mode: "lines",
          visible: visible[i - 1],
          name: header[i].slice(0, selectedObj.chartLabelMaxLength).chunk(selectedObj.chartLabelMaxWidth).join("<br>"),
          line: { color: c },
        };
      });
    } else {
      // console.log(colors);
      colors = colors.indexOf(null) > -1 ? colors.map((c) => randomColor()) : colors;
      table[0] = table[0].map((n) => n.slice(0, selectedObj.chartLabelMaxLength).chunk(selectedObj.chartLabelMaxWidth).join("<br>"));
      var data = [
        {
          x: table[0],
          y: table[1],
          type: "bar",
          name: selectedObj.name,
          marker: {
            color: colors,
          },
        },
      ];
    }
    // console.log(data);
    var plotLayout = {
      plot_bgcolor: this.plot_bgcolor,
      paper_bgcolor: this.plot_bgcolor,
      font: {
        family: this.plot_font,
      },
      legend: {
        font: { size: selectedObj.chartLabelFontSize },
      },

      margin: {
        l: 50,
        r: 10,
        b: 50,
        t: 50,
        pad: 0,
      },
      width: selectedObj.chartWidth,
      height: selectedObj.chartHeight,
      title: {
        text: outFilename,
      },
      xaxis: {
        tickangle: 45,
        showgrid: selectedObj.showGrid,
        rangeslider: selectedObj.rangeSlider,
        tickformat: selectedObj.xTickDateFormat,
        tickfont: { size: selectedObj.chartLabelFontSize },
        title: {
          text: selectedObj.xAxisLabel,
          font: {
            size: selectedObj.chartAxisTitleFontSize,
          },
        },
      },
      yaxis: {
        tickfont: { size: selectedObj.chartLabelFontSize },
        title: {
          text: yAxisLabel,
          font: {
            size: selectedObj.chartAxisTitleFontSize,
          },
        },
      },
    };
    var buttonOptions = {
      toImageButtonOptions: {
        filename: outFilename,
        width: 900,
        height: 600,
        format: "png",
      },
      scrollZoom: false,
      displayModeBar: false,
    };

    let tempGraphDivID = `${this.chartContainerID}-${selectedObj.id}`;
    // let downloadCSVButton = this.getDownloadCSVButton(selectedObj.id, outFilename);
    let downloadButtons = this.getDownloadButtonGroup(selectedObj.id, "line", outFilename);
    $(`#${this.chartContainerID}`).append(`<div id = ${tempGraphDivID}></div>
    ${downloadButtons}<div class = 'hl'></div>`);
    var graphDiv = document.getElementById(tempGraphDivID);
    selectedObj.plots["line"] = Plotly.newPlot(graphDiv, data, plotLayout, buttonOptions);
  };
  this.setupChartProgress = function () {
    if (Object.keys(this.areaChartObj).length > 0) {
      $("#chart-collapse-label-chart-collapse-div").show();
      $("#legendDiv").css("max-width", "575px");
      $("#legendDiv").css("max-height", window.innerHeight - convertRemToPixels(1) + 1);
      if (this.firstRun) {
        $("#area-collection-dropdown-container").hide();

        $("#query-spinner").append(
          `<img  id = 'query-spinner-img' alt= "Google Earth Engine logo spinner" title="Background processing is occurring in Google Earth Engine" class="fa" src="./src/assets/images/GEE_logo_transparent.png"  style='height:2rem;'><div class="progressbar progress-pulse"  id='query-progressbar' title='Percent of layers that have finished downloading chart summary data'>
        <span  style="width: 0% ;padding-top:0.15rem;">0%</span>
        </div>
        <span id = 'summary-spinner-message'></span>`
        );
        this.firstRun = false;
      }
    }
  };
  this.teardownChartProgress = function () {
    $("#query-spinner-img").remove();
    $("#query-progressbar").remove();
    $("#legendDiv").css("max-width", "");
    $("#legendDiv").css("max-height", "60%");
    $("#chart-collapse-div").empty();
    $("#chart-collapse-label-chart-collapse-div").hide();
    this.firstRun = true;
  };
  //////////////////////////////////////////////////////////////////////////
  // Primary function to handle charting a given area
  // Handles preparing ee image and collection objects for both line and sankey charts, gets the zonal
  // summaries, and manipulates the numbers for charting
  this.chartArea = function (area, name = "") {
    // Get selected objects either from visible map layers or checkboxes
    let selectedChartLayers;
    if (this.chartLayerSelectFromMapLayers) {
      selectedChartLayers = [];

      Object.values(layerObj)
        .concat(Object.values(timeLapseObj))
        .filter((e) => e.viz.canAreaChart)
        .map((o) => {
          let objT = o.viz.areaChartParams; //this.areaChartObj[o.legendDivID];
          // console.log(objT);
          if (objT.line && objT.sankey) {
            selectedChartLayers.push([`${o.legendDivID}-----line`, o.visible]);
            selectedChartLayers.push([`${o.legendDivID}-----sankey`, o.visible]);
          } else {
            selectedChartLayers.push([o.legendDivID, o.visible]);
          }
        });
      // console.log(selectedChartLayers);
      selectedChartLayers = Object.fromEntries(selectedChartLayers.filter(([k, v]) => v));
    } else {
      selectedChartLayers = Object.fromEntries(Object.entries(checkboxSelectedChartLayers).filter(([k, v]) => v));
    }
    selectedChartLayers = Object.keys(selectedChartLayers);
    let selectedChartObjs = Object.values(this.areaChartObj).filter((v) => selectedChartLayers.indexOf(v.id) > -1);
    // console.log(selectedChartLayers);
    this.makeChartID++;
    this.outstandingChartRequests[this.makeChartID] = 0;
    this.maxOutStandingChartRequests[this.makeChartID] = 0;
    if (selectedChartObjs.length === 0) {
      this.maxOutStandingChartRequests[this.makeChartID] = 1;
    }
    this.updateProgress();

    selectedChartObjs.map((selectedObj) => {
      let scaleT = structuredClone(selectedObj.scale);
      let transformT = structuredClone(selectedObj.transform);
      let scaleMult = 1;
      let nominalScale = scaleT || transformT[0];
      if (selectedObj.autoScale) {
        // console.log("here");
        // console.log(selectedObj.autoScale);
        // console.log(scaleT, transformT);
        let scaleTransform = this.autoSetScale(scaleT, transformT, selectedObj.minZoomSpecifiedScale, selectedObj.maxAutoScale);
        scaleT = scaleTransform[0];
        transformT = scaleTransform[1];
        scaleMult = scaleTransform[2];
        nominalScale = scaleTransform[3];
      }
      // console.log(scaleT, transformT, scaleMult);
      // console.log(selectedObj);
      // $("#summary-spinner").slideDown();

      let makeChartID = this.makeChartID;

      if (selectedObj.sankey) {
        selectedObj.bandNames.map((bn) => {
          this.outstandingChartRequests[this.makeChartID]++;
          this.maxOutStandingChartRequests[this.makeChartID]++;
          let itemBn = selectedObj.item.select(bn);
          let dummyImage = itemBn.first();
          let sankeyC = [];
          let transitionBns = [];
          let sankeyTransitionPeriods = selectedObj.sankeyTransitionPeriods || getTransitionRowData();
          if (sankeyTransitionPeriods !== null && sankeyTransitionPeriods !== undefined) {
            range(0, sankeyTransitionPeriods.length - 1).map((transitionPeriodI) => {
              let sankeyTransitionPeriod1 = sankeyTransitionPeriods[transitionPeriodI];
              let sankeyTransitionPeriod2 = sankeyTransitionPeriods[transitionPeriodI + 1];
              // console.log(sankeyTransitionPeriod1, sankeyTransitionPeriod2);
              let itemBnTransitionPeriod1 = itemBn
                .filter(ee.Filter.calendarRange(sankeyTransitionPeriod1[0], sankeyTransitionPeriod1[1], "year"))
                .mode();
              let itemBnTransitionPeriod2 = itemBn
                .filter(ee.Filter.calendarRange(sankeyTransitionPeriod2[0], sankeyTransitionPeriod2[1], "year"))
                .mode();
              let transitionImg = ee.Image(0);

              selectedObj.sankey_class_values[bn].map((sankey_class_values_pair) => {
                // console.log(sankey_class_values_pair);
                outClass = parseInt(`${sankey_class_values_pair[0]}0990${sankey_class_values_pair[1]}`);
                // console.log(outClass);
                transitionImg = transitionImg.where(
                  itemBnTransitionPeriod1.eq(sankey_class_values_pair[0]).and(itemBnTransitionPeriod2.eq(sankey_class_values_pair[1])),
                  outClass
                );
              });
              let transitionBn = `${sankeyTransitionPeriod1.join("-")}---${sankeyTransitionPeriod2.join("-")}`;
              transitionBns.push(transitionBn);
              transitionImg = transitionImg.set("system:index", transitionBn).rename(`${bn}`);
              sankeyC.push(transitionImg);
              // console.log([sankeyTransitionPeriod, itemBnTransitionPeriod.size().getInfo()]);
            });
            sankeyC = ee.ImageCollection(sankeyC).toBands().rename(transitionBns);

            sankeyC.reduceRegion(selectedObj.reducer, area, scaleT, selectedObj.crs, transformT, true, 1e13, 4).evaluate((counts, failure) => {
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
                    // color: [],
                    // colorScale:[]
                    // link_color:[]
                    // opacity:[]
                  };
                  let labels = [];
                  let colors = [];
                  let outCSV = [];

                  selectedObj.class_names[bn].map((l) => labels.push(`${sankeyTransitionPeriods[0].join("-")} ${l}`));
                  selectedObj.class_palette[bn].map((c) => colors.push(c));

                  Object.keys(counts).map((transitionPeriod) => {
                    // console.log(transitionPeriod);
                    let offset1 = (transitionPeriodI - 1) * selectedObj.class_names[bn].length;
                    let offset2 = transitionPeriodI * selectedObj.class_names[bn].length;
                    //Append labels and colors
                    selectedObj.class_names[bn].map((l) => labels.push(`${sankeyTransitionPeriods[transitionPeriodI].join("-")} ${l}`));
                    selectedObj.class_palette[bn].map((c) => colors.push(c));

                    let countsTransitionPeriod = counts[transitionPeriod];
                    let values = Object.values(countsTransitionPeriod);
                    let pixelTotal = sum(values);
                    let mult;
                    if (areaChartFormat === "Percentage") {
                      mult = (1 / pixelTotal) * 100;
                    } else {
                      mult = chartFormatDict[areaChartFormat].mult * scaleMult;
                    }
                    values = values.map((v) => smartToFixed(v * mult));
                    let classes = Object.keys(countsTransitionPeriod).map((cls) => cls.split("0990").map((n) => parseInt(n)));
                    // console.log(classes);
                    let vi = 0;
                    let countLookup = {};
                    classes.map((cls) => {
                      // console.log(cls);
                      let class_valueI1 = selectedObj.class_values[bn].indexOf(cls[0]);
                      let color_value1 = selectedObj.class_palette[bn][class_valueI1];
                      let class_valueI2 = selectedObj.class_values[bn].indexOf(cls[1]);
                      let color_value2 = selectedObj.class_palette[bn][class_valueI2];
                      sankey_dict.source.push(class_valueI1 + offset1);
                      sankey_dict.target.push(class_valueI2 + offset2);
                      sankey_dict.value.push(values[vi]);
                      // console.log(color_value1,color_value2)
                      // console.log(blendColors(color_value1,color_value2))
                      // console.log(selectedObj.plot_bgcolor)
                      // sankey_dict.color.push('rgba(55,46,44,0.5)');

                      // sankey_dict.colorScale.push([[0, 'rgb(0,0,255)'], [1, 'rgb(255,0,0)']]);
                      countLookup[`${selectedObj.class_names[bn][class_valueI1]}---${selectedObj.class_names[bn][class_valueI2]}`] = values[vi];
                      vi++;
                    });
                    // console.log(countLookup);
                    outCSV.push(
                      [""].concat(selectedObj.class_names[bn].map((nm) => `${nm.replace(/[^A-Za-z0-9]/g, "-")} ${transitionPeriod.split("---")[1]} `))
                    );
                    selectedObj.class_names[bn].map((nm1) => {
                      let line = [`${nm1.replace(/[^A-Za-z0-9]/g, "-")} ${transitionPeriod.split("---")[0]}`];
                      selectedObj.class_names[bn].map((nm2) => {
                        let v = countLookup[`${nm1}---${nm2}`];
                        v = v !== undefined ? v : 0;
                        line.push(v);
                      });
                      outCSV.push(line);
                    });
                    outCSV.push([""]);

                    // selectedObj.class_names[bn].map((nm)

                    transitionPeriodI++;
                  });
                  // console.log(outCSV);
                  outCSV = outCSV.map((r) => r.join(",")).join("\n");
                  selectedObj.tableExportData[bn] = outCSV;
                  labels = labels.map((l) => l.slice(0, selectedObj.chartLabelMaxLength).chunk(selectedObj.chartLabelMaxWidth).join("<br>"));
                  this.makeSankeyChart(
                    sankey_dict,
                    labels,
                    colors,
                    bn,
                    `${selectedObj.name} Sankey ${bn.replaceAll("_", " ")} ${name} (${nominalScale}m)`,
                    selectedObj,
                    outCSV
                  );
                  // console.log(labels);
                  // console.log(colors);
                  // console.log(sankey_dict);
                  this.outstandingChartRequests[this.makeChartID]--;

                  this.updateProgress();
                } else {
                  console.log(`Chart id moved on: Returned ID = ${makeChartID}, Current ID = ${this.makeChartID}`);
                }
              }
            });
          } else {
            this.outstandingChartRequests[this.makeChartID]--;

            this.updateProgress();
          }
        });
      } else {
        this.outstandingChartRequests[this.makeChartID]++;
        this.maxOutStandingChartRequests[this.makeChartID]++;
        let areaChartCollectionStack = selectedObj.layerType === "ImageCollection" ? selectedObj.item.toBands() : selectedObj.item;

        // console.log(visible);
        // console.log(header);
        // console.log(areaChartCollectionStack.bandNames().getInfo());
        areaChartCollectionStack = areaChartCollectionStack.rename(selectedObj.stackBandNames);
        // console.log(areaChartCollectionStack.bandNames().getInfo());
        // this.getZonalStats(areaChartCollectionStack, area, selectedObj.reducer);

        areaChartCollectionStack
          .reduceRegion(selectedObj.reducer, area, scaleT, selectedObj.crs, transformT, true, 1e13, 4)
          .evaluate((counts, failure) => {
            if (makeChartID === this.makeChartID) {
              if (failure !== undefined) {
                showMessage("Area Charting Error", `Encountered the following error while summarizing ${selectedObj.name}<br>${failure}`);
              } else {
                // console.log(counts);
                let header = selectedObj.layerType === "ImageCollection" ? [selectedObj.xAxisLabel] : [];

                // Pull auto viz attributes if available
                let colors = [];
                let visible = [];
                if (selectedObj.isThematic === true) {
                  selectedObj.class_namesT = {};
                  selectedObj.bandNames.map((bn) => {
                    let bnL = bn.replace(/[^A-Za-z0-9]/g, "-");
                    let nameStart = `${bnL}-`;
                    let class_namesT;
                    if (selectedObj.class_names !== null) {
                      class_namesT = selectedObj.class_names[bn];
                    } else if (counts[bn] !== undefined) {
                      class_namesT = Object.keys(counts[bn]);
                    } else {
                      let bnsT = Object.keys(counts).filter((k) => k.indexOf(bn) > -1);
                      class_namesT = [];
                      bnsT.map((bnT) => (class_namesT = class_namesT.concat(Object.keys(counts[bnT]))));
                      class_namesT = unique(class_namesT);
                      // console.log(class_namesT);
                      selectedObj.class_namesT[bn] = class_namesT;
                    }
                    let class_paletteT;
                    if (selectedObj.class_palette !== null) {
                      class_paletteT = selectedObj.class_palette[bn];
                    } else if (selectedObj.palette !== undefined && selectedObj.palette !== null) {
                      class_paletteT = selectedObj.palette;
                    } else if (selectedObj.palette_lookup !== undefined && selectedObj.palette_lookup !== null) {
                      class_paletteT = class_namesT.map((cn) => selectedObj.palette_lookup[cn]);
                    } else {
                      class_paletteT = class_namesT.map((c) => null);
                    }
                    // console.log(class_paletteT);
                    if (selectedObj.bandNames.length == 1) {
                      nameStart = "";
                    }
                    class_namesT.map((cn) => {
                      cd = cn.replace(/[^A-Za-z0-9]/g, "-");
                      header.push(`${nameStart}${cn}`);
                    });
                    class_paletteT.map((color) => {
                      color = color !== null && color[0] !== "#" ? `#${color}` : color;
                      colors.push(color);
                    });
                    if (selectedObj.class_visibility !== null && selectedObj.class_visibility[bn] !== undefined) {
                      selectedObj.class_visibility[bn].map((v) => {
                        visible.push(v == true ? v : "legendonly");
                      });
                    } else if (selectedObj.visible !== undefined) {
                      selectedObj.visible.map((v) => {
                        visible.push(v == true ? v : "legendonly");
                      });
                    } else {
                      class_namesT.map((cn) => {
                        visible.push(true);
                      });
                    }
                  });
                } else {
                  colors = selectedObj.palette;
                  visible =
                    selectedObj.visible === undefined
                      ? selectedObj.bandNames.map((bn) => true)
                      : selectedObj.visible.map((v) => (v === true ? v : "legendonly"));
                  selectedObj.bandNames.map((bn) => header.push(bn.replace(/[^A-Za-z0-9]/g, "-")));
                }
                let outTable = [header];
                if (selectedObj.layerType === "ImageCollection") {
                  selectedObj.xAxisLabels.map((xLabel) => {
                    let row = [xLabel];

                    if (selectedObj.isThematic) {
                      selectedObj.bandNames.map((bn) => {
                        let countsT = counts[`${xLabel}${selectedObj.splitStr}${bn}`];
                        let values = selectedObj.class_values !== null ? selectedObj.class_values[bn] : selectedObj.class_namesT[bn];
                        let names = selectedObj.class_names !== null ? selectedObj.class_names[bn] : selectedObj.class_namesT[bn];
                        let pixelTotal = sum(Object.values(countsT)) || 0;
                        if (areaChartFormat === "Percentage") {
                          mult = (1 / pixelTotal) * 100;
                        } else {
                          mult = chartFormatDict[areaChartFormat].mult * scaleMult;
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
                        let countsT = counts[`${xLabel}${selectedObj.splitStr}${bn}`];
                        row.push(countsT);
                      });
                    }
                    // console.log(row);
                    outTable.push(row);
                  });
                } else {
                  // console.log(header);
                  let row = [];

                  if (selectedObj.isThematic) {
                    selectedObj.bandNames.map((bn) => {
                      let countsT = counts[bn];
                      let values = selectedObj.class_values !== null ? selectedObj.class_values[bn] : Object.keys(countsT);
                      let names = selectedObj.class_names !== null ? selectedObj.class_names[bn] : Object.keys(countsT);
                      let pixelTotal = sum(Object.values(countsT)) || 0;
                      if (areaChartFormat === "Percentage") {
                        mult = (1 / pixelTotal) * 100;
                      } else {
                        mult = chartFormatDict[areaChartFormat].mult * scaleMult;
                      }

                      values.map((v) => {
                        let tv = countsT[v] || 0;
                        row.push(tv * mult);
                      });
                    });
                  } else {
                    selectedObj.bandNames.map((bn) => {
                      let countsT = counts[bn];
                      row.push(countsT);
                    });
                  }
                  outTable.push(row);
                }
                // console.log(outTable);
                this.outstandingChartRequests[this.makeChartID]--;
                this.updateProgress();
                // console.log(this.outstandingChartRequests);
                // console.log(colors);
                this.makeChart(outTable, `${name} (${nominalScale}m)`, colors, visible, selectedObj);
              }
            } else {
              console.log(`Chart id moved on: Returned ID = ${makeChartID}, Current ID = ${this.makeChartID}`);
            }
          });
      }
    });
  };
  //////////////////////////////////////////////////////////////////////////
  // If checkbox layer selection is used, instantiate it with this function to populate the checkboxes
  this.populateChartLayerSelect = function () {
    this.chartLayerSelectFromMapLayers = false;
    let selectedObj = {};
    let labels = [];
    Object.keys(this.areaChartObj).map((k) => {
      let obj = this.areaChartObj[k];
      selectedObj[obj.id] = obj.shouldChart;
      labels.push(obj.name);
    });

    addCheckboxes(this.layerSelectContainerID, this.layerSelectID, "Chart Layers", "checkboxSelectedChartLayers", selectedObj, labels);

    $("#" + this.layerSelectID).change(() => {
      if (this.autoChartingOn) {
        this.chartMapExtent();
      }
    });

    $("#area-summary-format").change(() => {
      console.log("change");
      if (this.autoChartingOn) {
        this.chartMapExtent();
      }
    });
  };
  //////////////////////////////////////////////////////////////////////////
  // Function to manage progress spinner and bar
  this.updateProgress = function () {
    let p = 0;
    if (this.maxOutStandingChartRequests[this.makeChartID] > 0) {
      p = parseInt((1 - this.outstandingChartRequests[this.makeChartID] / this.maxOutStandingChartRequests[this.makeChartID]) * 100);
    }

    updateProgress(".progressbar", p);

    if (p === 100) {
      $("#query-spinner-img").removeClass("fa-spin");
      // $(".hl").last().remove();
    } else {
      $("#query-spinner-img").addClass("fa-spin");
    }
  };
}
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
let areaChart = new areaChartCls();
$("#map-defined-area-chart-label").hide();
