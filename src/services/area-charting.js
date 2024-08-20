function exportToCsv2(areaObjID, bn, filename) {
  let table = areaChart.areaChartObj[areaObjID].tableExportData[bn];
  const blob = new Blob([table], { type: "text/csv;charset=utf-8;" });
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
      ga("send", "event", mode, "new-area-chart-chartDownload", "csv");
    }
  }
}
//////////////////////////////////////////////////////////////////////////
function downloadPlotlyAreaChartWrapper(areaObjID, bn, filename) {
  console.log(areaChart.areaChartObj[areaObjID].plots[bn]);
  downloadPlotly(
    areaChart.areaChartObj[areaObjID].plots[bn].plot,
    filename,
    true,
    2,
    areaChart.areaChartObj[areaObjID].plots[bn].containerID
  );
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
  this.areaChartingOn = false;
  this.autoChartingOn = false;
  this.firstRun = true;
  this.chartHWRatio = 0.7;
  this.sankeyTransitionPeriodYearBuffer = 0;

  //////////////////////////////////////////////////////////////////////////
  // Function for cleanup of all area chart layers and output divs
  this.clearLayers = function () {
    this.clearChartLayerSelect();
    this.areaChartObj = {};
    this.areaChartID = 1;
    // this.makeChartID = 0;
    this.clearCharts();
  };
  //////////////////////////////////////////////////////////////////////////
  // Add chart layer object
  this.addLayer = function (eeLayer, params = {}, name, shouldChart = true) {
    if (
      params !== null &&
      params !== undefined &&
      params.serialized !== null &&
      params.serialized !== undefined &&
      params.serialized === true
    ) {
      eeLayer = ee.Deserializer.decode(eeLayer);

      if (params.reducer !== undefined && params.reducer !== null) {
        params.reducer = ee.Deserializer.fromJSON(params.reducer);
      }
      params.serialized = false;
    }

    $("#map-defined-area-chart-label").show();

    $("#area-collection-dropdown-container").hide();
    let obj = {};
    obj.name = name || `Area-Layer-${this.areaChartID}`;
    obj.id =
      params.id ||
      obj.name.replaceAll(" ", "-") + "-" + this.areaChartID.toString();
    obj.id = obj.id.replace(/[^A-Za-z0-9]/g, "-");
    params.layerType =
      params.layerType ||
      getImagesLib.getObjType(eeLayer, "area chart add layer");
    params.eeObjInfo =
      params.eeObjInfo || getImagesLib.eeObjInfo(eeLayer, params.layerType);

    obj.dictServerSide = eeObjServerSide(params.eeObjInfo);

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

    eeLayer =
      obj.layerType === "ImageCollection"
        ? ee.ImageCollection(eeLayer)
        : ee.Image(eeLayer);

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

      obj.bandNames =
        typeof obj.bandNames === "string"
          ? obj.bandNames.split(",")
          : obj.bandNames;

      if (
        (params.class_names === undefined || params.class_names === null) &&
        params.class_dicts_added !== true
      ) {
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
      obj.palette = params.palette;
      if (typeof obj.palette === "string") {
        obj.palette = obj.palette.split(",");
      }
      obj.palette_lookup = params.palette_lookup;
      obj.chartType = params.chartType || "line";
      obj.stackedAreaChart = params.stackedAreaChart == true ? 0 : undefined;
      obj.steppedLine = params.steppedLine == true ? true : false;
      obj.label = obj.name;
      obj.shouldUnmask = params.shouldUnmask == true ? true : false;
      obj.unmaskValue = params.unmaskValue || 0;
      obj.xAxisLabel =
        params.xAxisLabel || obj.layerType === "ImageCollection" ? "Year" : "";
      obj.xAxisLabels = params.xAxisLabels;

      obj.xAxisProperty =
        params.xAxisProperty || obj.layerType === "ImageCollection"
          ? "year"
          : "system:index";

      obj.size = 1;
      if (obj.layerType === "ImageCollection") {
        obj.size =
          params.eeObjInfo.size !== undefined
            ? params.eeObjInfo.size
            : obj.item.size().getInfo();
      }

      obj.dateFormat = params.dateFormat || "YYYY";
      obj.chartTitleFontSize = params.chartTitleFontSize || 10;
      obj.chartLabelFontSize = params.chartLabelFontSize || 10;
      obj.chartAxisTitleFontSize = params.chartAxisTitleFontSize || 10;
      obj.chartLabelMaxWidth = params.chartLabelMaxWidth || 16;
      obj.chartLabelMaxLength = params.chartLabelMaxLength || 50;
      obj.chartWidth = params.chartWidth;
      obj.chartHeight = params.chartHeight;
      obj.xTickDateFormat = params.xTickDateFormat || null;
      obj.chartDecimalProportion = params.chartDecimalProportion;
      obj.chartPrecision = params.chartPrecision;
      obj.scale = params.scale || scale;
      obj.transform = params.transform || transform;
      obj.crs = params.crs || crs;
      obj.autoScale = params.autoScale || true; // Whether to set the reducer resolution to a larger number below a specified zoom (next param)
      obj.minZoomSpecifiedScale = params.minZoomSpecifiedScale || 11; // Above this zoom level, it won't change the scale/transform of teh reducer
      obj.maxAutoScale = 2 ** 6; // Max n scale can be multiplied by (ideally 2**n)
      obj.sankeyTransitionPeriods = params.sankeyTransitionPeriods;
      obj.sankeyMinPercentage =
        params.sankeyMinPercentage !== undefined
          ? params.sankeyMinPercentage
          : 0.5;
      obj.barChartMaxClasses = params.barChartMaxClasses || 20;
      obj.plots = {};
      obj.tableExportData = {};
      obj.splitStr = "----";

      // Control for setting only one of scale or transform - defaults to transform (since it snaps)
      if (
        params.scale !== undefined &&
        params.scale !== null &&
        params.transform !== undefined &&
        params.transform !== null
      ) {
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

        if (
          obj.sankeyTransitionPeriods === undefined ||
          obj.sankeyTransitionPeriods === null
        ) {
          let first_last_years = obj.item.reduceColumns(ee.Reducer.minMax(), [
            "system:time_start",
          ]);
          first_last_years = ee
            .Dictionary(first_last_years)
            .values()
            .map((n) => ee.Date(n).format(obj.dateFormat))
            .sort();

          obj.sankey_years = params.sankey_years || first_last_years.getInfo();
        }

        obj.bandNames.map((bn) => {
          let bn_sankey_class_names = [];
          let bn_sankey_class_values = [];
          let bn_sankey_class_palette = [];
          range(0, obj.class_names[bn].length).map((i1) => {
            range(0, obj.class_names[bn].length).map((i2) => {
              bn_sankey_class_names.push([
                obj.class_names[bn][i1],
                obj.class_names[bn][i2],
              ]);
              bn_sankey_class_values.push([
                obj.class_values[bn][i1],
                obj.class_values[bn][i2],
              ]);
              bn_sankey_class_palette.push([
                obj.class_palette[bn][i1],
                obj.class_palette[bn][i2],
              ]);
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
          if (
            obj.layerType === "ImageCollection" &&
            Object.keys(params.eeObjInfo).indexOf(obj.xAxisProperty) === -1
          ) {
            console.log("need to add x axis property value");

            obj.item = obj.item.map(function (img) {
              return img.set("year", img.date().format(obj.dateFormat));
            });
          }

          if (obj.layerType === "ImageCollection") {
            obj.xAxisLabels = obj.item
              .aggregate_histogram(obj.xAxisProperty)
              .keys()
              .getInfo();
          } else {
            obj.xAxisLabels = [""];
          }
        }
        obj.xAxisLabels = obj.xAxisLabels.map((l) =>
          isNaN(parseInt(l)) || (typeof l === "string" && l.indexOf("-") > -1)
            ? l
            : parseInt(l)
        );

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

            let temp = [];

            obj.xAxisLabels.map((l) => {
              let t = obj.item.filter(ee.Filter.eq(obj.xAxisProperty, l));
              let f = t.first();
              t = t.mosaic().copyProperties(f).set(obj.xAxisProperty, l);
              temp.push(t);
            });
            obj.size = temp.length;
            obj.item = ee.ImageCollection(temp);
          }
        } else {
          obj.stackBandNames = obj.bandNames;
        }
      }

      if (obj.class_names !== null && Object.keys(obj.class_names).length > 0) {
        obj.isThematic = true;
        if (params.reducer !== undefined && params.reducer !== null) {
          obj.reducer = params.reducer;
          obj.reducerString =
            params.reducerString ||
            obj.reducer.getInfo().type.split("Reducer.")[1];
        } else {
          obj.reducer = ee.Reducer.frequencyHistogram();
          obj.reducerString = "frequencyHistogram";
        }
      } else {
        obj.isThematic = false;
        if (params.reducer !== undefined && params.reducer !== null) {
          obj.reducer = params.reducer;
          obj.reducerString =
            params.reducerString ||
            obj.reducer.getInfo().type.split("Reducer.")[1];
        } else {
          obj.reducer = ee.Reducer.mean();
          obj.reducerString = "mean";
        }
      }
      obj.visible = params.visible;

      obj.isThematic =
        obj.reducerString === "frequencyHistogram" ? true : obj.isThematic;
      obj.yAxisLabel =
        obj.yAxisLabel || obj.reducerString === "frequencyHistogram"
          ? undefined
          : obj.reducerString.toTitle();

      this.areaChartObj[obj.id] = obj;
      this.areaChartID++;
      this.outstandingAddLayers--;

      this.autoSankeyTransitionPeriods();
    }
  };
  //////////////////////////////////////////////////////////////////////////
  // Function to figure out the best transition periods for the user interface based on the intersection of provided datasets where sankeyTransitionPeriods were not provided
  this.autoSankeyTransitionPeriods = function () {
    let all_sankey_years = Object.values(this.areaChartObj).filter(
      (v) => v.sankey_years !== undefined
    );
    if (all_sankey_years.length > 0) {
      all_sankey_years = Object.values(all_sankey_years).map(
        (v) => v.sankey_years
      );
      activeStartYear = all_sankey_years.map((v) => v[0]).min();
      activeEndYear = all_sankey_years.map((v) => v[1]).max();

      $("#first-transition-row td input:first").val(activeStartYear);
      $("#first-transition-row td input:last").val(
        activeStartYear + this.sankeyTransitionPeriodYearBuffer
      );
      $("#last-transition-row td input:first").val(
        activeEndYear - this.sankeyTransitionPeriodYearBuffer
      );
      $("#last-transition-row td input:last").val(activeEndYear);
    }
  };
  //////////////////////////////////////////////////////////////////////////
  // Function to figure out an optimal resolution for a given map zoom level
  this.autoSetScale = function (
    scaleT,
    transformT,
    minZoomSpecifiedScale,
    maxAutoScale
  ) {
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
  this.getMapExtentCoordsStr = function (
    joinStr = ",",
    coordOrder = ["west", "north", "east", "south"]
  ) {
    let coordJSON = map.getBounds().toJSON();
    return coordOrder
      .map((k) => coordJSON[k])
      .map(smartToFixed)
      .join(joinStr);
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
    let mapCoords = Object.values(map.getBounds().toJSON())
      .map(smartToFixed)
      .join(",");
    this.clearCharts();
    this.chartArea(eeBoundsPoly, `${name} (${mapCoords})`);
  };
  //////////////////////////////////////////////////////////////////////////
  // Returns the ui elements for downloading png and csv outputs
  this.getDownloadButtonGroup = function (id, bn, outFilename) {
    return `<div class="btn-group areaChart-download-btn-group" role="group" >
  <button type="button" class="btn btn-secondary" onclick = "exportToCsv2('${id}','${bn}','${outFilename}.csv')" title = "Click to download ${outFilename}.csv tabular data">CSV</button>
  
  <button type="button" class="btn btn-secondary" onclick = "downloadPlotlyAreaChartWrapper('${id}','${bn}','${outFilename}.png')" title = "Click to download ${outFilename}.png chart">PNG</button>
</div>`;
  };
  //////////////////////////////////////////////////////////////////////////
  // Function to handle creating a sankey chart from given prepared dictionary
  this.makeSankeyChart = function (
    sankey_dict,
    labels,
    colors,
    bn,
    name,
    selectedObj,
    csvData,
    thickness = 35,
    nodePad = 15
  ) {
    sankey_dict.hovertemplate =
      "%{value}" +
      chartFormatDict[areaChartFormat].label +
      "<br>%{source.label}<br>%{target.label}<extra></extra>";
    let yAxisLabel =
      selectedObj.yAxisLabel || chartFormatDict[areaChartFormat].label;
    var data = {
      type: "sankey",
      textfont: { size: selectedObj.chartLabelFontSize },
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

        opacity: 0.5,
        hovertemplate: "%{value}" + yAxisLabel + "<br>%{label}<extra></extra>",
      },

      link: sankey_dict,
    };

    var data = [data];

    const plotLayout = {
      title: name,
      font: {
        size: selectedObj.chartTitleFontSize,
        family: this.plot_font,
      },
      plot_bgcolor: this.plot_bgcolor,
      paper_bgcolor: this.plot_bgcolor,

      autosize: true,
      width: this.chartWidth,
      height: this.chartHeight,
      margin: {
        l: 25,
        r: 25,
        b: 25,
        t: 50,
        pad: 0,
      },
    };
    const config = {
      toImageButtonOptions: {
        format: "png", // one of png, svg, jpeg, webp
        filename: name.replaceAll("<br>", " "),
        width: 1000,
        height: 600,
      },
      scrollZoom: false,
      displayModeBar: false,
    };

    let outFilename = name.replaceAll("<br>", " ");

    let tempGraphDivID = `${this.chartContainerID}-${selectedObj.id}-${bn}`;

    let downloadButtons = this.getDownloadButtonGroup(
      selectedObj.id,
      bn,
      outFilename
    );
    $(`#${this.chartContainerID}`).append(
      `<div id = ${tempGraphDivID}></div>${downloadButtons}<div class = 'hl'></div>`
    );
    const graphDiv = document.getElementById(tempGraphDivID);
    selectedObj.plots[bn] = {
      containerID: tempGraphDivID,
      plot: Plotly.newPlot(graphDiv, data, plotLayout, config),
    };
  };

  this.makeChart = function (table, name, colors, visible, selectedObj) {
    let outFilename = `${selectedObj.name} ${name}`;
    let chartTitle = `${selectedObj.name}<br>${name}`;
    if (
      selectedObj.chartDecimalProportion !== undefined &&
      selectedObj.chartDecimalProportion !== null
    ) {
      chartDecimalProportion = selectedObj.chartDecimalProportion;
    }
    if (
      selectedObj.chartPrecision !== undefined &&
      selectedObj.chartPrecision !== null
    ) {
      chartPrecision = selectedObj.chartPrecision;
    }
    let csvTable = [table[0].map((s) => s.replace(/[^A-Za-z0-9]/g, "-"))];
    if (selectedObj.layerType === "ImageCollection") {
      csvTable = csvTable.concat(
        table
          .slice(1)
          .map((r) =>
            r.slice(0, 1).concat(r.slice(1).map((n) => smartToFixed(n)))
          )
      );
    } else {
      csvTable = csvTable.concat(
        table.slice(1).map((r) => r.map((n) => smartToFixed(n)))
      );
    }

    selectedObj.tableExportData["line"] = csvTable
      .map((r) => r.join(","))
      .join("\n");
    // Set up table

    let yAxisLabel =
      selectedObj.yAxisLabel || chartFormatDict[areaChartFormat].label;
    if (selectedObj.layerType === "ImageCollection") {
      let xColumn = arrayColumn(table, 0).slice(1);
      let iOffset = selectedObj.layerType === "ImageCollection" ? 1 : 0;
      let header = table[0];
      table = table.slice(1);

      let yColumns = range(1, header.length);

      var data = yColumns.map((i) => {
        let c = colors !== undefined ? colors[i - iOffset] : null;
        return {
          x: xColumn,
          y: arrayColumn(table, i).map(smartToFixed),

          stackgroup: selectedObj.stackedAreaChart,
          mode: "lines+markers",
          visible: visible[i - 1],
          name: header[i]
            .slice(0, selectedObj.chartLabelMaxLength)
            .chunk(selectedObj.chartLabelMaxWidth)
            .join("<br>"),
          line: { color: c, width: 1 },
          marker: { size: 3 },
        };
      });
    } else {
      colors = colors || [randomColor()];
      colors =
        colors.indexOf(null) > -1 ? colors.map((c) => randomColor()) : colors;
      table[0] = table[0].map((n) =>
        n
          .slice(0, selectedObj.chartLabelMaxLength)
          .chunk(selectedObj.chartLabelMaxWidth)
          .join("<br>")
      );

      if (selectedObj.shouldUnmask) {
        table[0] = table[0].slice();
      }
      if (table[0].length > selectedObj.barChartMaxClasses) {
        let totalClases = table[0].length;
        let pctlCut = 1 - selectedObj.barChartMaxClasses / totalClases;
        let values = copyArray(table[1]);
        let min = quantile(values, pctlCut);
        let z = zip(table[0], table[1]);
        z = cbind(z, colors);

        z = z.filter((r) => r[1] > min);
        table = [];
        table.push(z.map((r) => r[0]));
        table.push(z.map((r) => r[1]));
        colors = z.map((r) => r[2]);
      }
      console.log(table);
      console.log(colors);
      var data = [
        {
          x: table[0],
          y: table[1],
          stackgroup: selectedObj.stackedAreaChart,
          type: "bar",
          name: selectedObj.name,
          marker: {
            color: colors,
          },
        },
      ];
    }

    const plotLayout = {
      plot_bgcolor: this.plot_bgcolor,
      paper_bgcolor: this.plot_bgcolor,
      font: {
        family: this.plot_font,
        size: selectedObj.chartTitleFontSize,
      },
      legend: {
        font: { size: selectedObj.chartLabelFontSize },
      },

      margin: {
        l: 35,
        r: 25,
        b: 50,
        t: 50,
        pad: 0,
      },
      width: this.chartWidth,
      height: this.chartHeight,
      title: {
        text: chartTitle,
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
    const buttonOptions = {
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

    let downloadButtons = this.getDownloadButtonGroup(
      selectedObj.id,
      "line",
      outFilename
    );
    $(`#${this.chartContainerID}`).append(`<div id = ${tempGraphDivID}></div>
    ${downloadButtons}<div class = 'hl'></div>`);
    const graphDiv = document.getElementById(tempGraphDivID);
    selectedObj.plots["line"] = {
      containerID: tempGraphDivID,
      plot: Plotly.newPlot(graphDiv, data, plotLayout, buttonOptions),
    };
  };
  this.setupChartProgress = function () {
    if (Object.keys(this.areaChartObj).length > 0) {
      $("#chart-collapse-label-chart-collapse-div").show();
      $("#legendDiv").css("max-width", "575px");
      $("#legendDiv").css(
        "max-height",
        window.innerHeight - convertRemToPixels(1) + 1
      );
      if (this.firstRun) {
        $("#area-collection-dropdown-container").hide();

        $("#query-spinner").append(`
        <div id="areaChart-progress-container" >
        <span style="display: flex;">
        <img id="query-spinner-img" class="fa-spin progress-spinner"  src="./src/assets/images/GEE_logo_transparent.png" height="${convertRemToPixels(
          0.8
        )}" alt="GEE logo image">
        
        <div class="progressbar progress-pulse" id="query-progressbar" title="'Percent of layers that have finished downloading chart summary data">
            <span style="width: 100%;">100%</span>
        </div>
        
        
        </span>
        
        
        
        </div>`);
        $("#areaChart-progress-container").width(
          $("#chart-collapse-label-label").width() -
            $("#areaChart-progress-container").width()
        );
        this.firstRun = false;
        this.areaChartingOn = true;
      }
    }
  };
  this.teardownChartProgress = function () {
    $("#areaChart-progress-container").remove();

    $("#legendDiv").css("max-width", "");
    $("#legendDiv").css("max-height", "60%");
    $("#chart-collapse-div").empty();
    $("#chart-collapse-label-chart-collapse-div").hide();
    this.firstRun = true;
    this.areaChartingOn = false;
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
          let objT = o.viz.areaChartParams;

          if (objT.line && objT.sankey) {
            selectedChartLayers.push([`${o.legendDivID}-----line`, o.visible]);
            selectedChartLayers.push([
              `${o.legendDivID}-----sankey`,
              o.visible,
            ]);
          } else {
            selectedChartLayers.push([o.legendDivID, o.visible]);
          }
        });

      selectedChartLayers = Object.fromEntries(
        selectedChartLayers.filter(([k, v]) => v)
      );
    } else {
      selectedChartLayers = Object.fromEntries(
        Object.entries(checkboxSelectedChartLayers).filter(([k, v]) => v)
      );
    }
    selectedChartLayers = Object.keys(selectedChartLayers);
    let selectedChartObjs = Object.values(this.areaChartObj).filter(
      (v) => selectedChartLayers.indexOf(v.id) > -1
    );

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
      let divWidth =
        $("#" + getWalkThroughCollapseContainerID()).width() -
        convertRemToPixels(2);
      this.chartWidth = selectedObj.chartWidth || divWidth;
      this.chartHeight =
        selectedObj.chartHeight || parseInt(divWidth * this.chartHWRatio);
      if (selectedObj.autoScale) {
        let scaleTransform = this.autoSetScale(
          scaleT,
          transformT,
          selectedObj.minZoomSpecifiedScale,
          selectedObj.maxAutoScale
        );
        scaleT = scaleTransform[0];
        transformT = scaleTransform[1];
        scaleMult = scaleTransform[2];
        nominalScale = scaleTransform[3];
      }

      let makeChartID = this.makeChartID;

      if (selectedObj.sankey) {
        selectedObj.bandNames.map((bn) => {
          this.outstandingChartRequests[this.makeChartID]++;
          this.maxOutStandingChartRequests[this.makeChartID]++;
          let itemBn = selectedObj.item.select(bn);
          let dummyImage = itemBn.first();
          let sankeyC = [];
          let transitionBns = [];
          let sankeyTransitionPeriods =
            selectedObj.sankeyTransitionPeriods || getTransitionRowData();
          if (
            sankeyTransitionPeriods !== null &&
            sankeyTransitionPeriods !== undefined
          ) {
            range(0, sankeyTransitionPeriods.length - 1).map(
              (transitionPeriodI) => {
                let sankeyTransitionPeriod1 =
                  sankeyTransitionPeriods[transitionPeriodI];
                let sankeyTransitionPeriod2 =
                  sankeyTransitionPeriods[transitionPeriodI + 1];
                let itemBnTransitionPeriod1 = itemBn
                  .filter(
                    ee.Filter.calendarRange(
                      sankeyTransitionPeriod1[0],
                      sankeyTransitionPeriod1[1],
                      "year"
                    )
                  )
                  .mode();
                let itemBnTransitionPeriod2 = itemBn
                  .filter(
                    ee.Filter.calendarRange(
                      sankeyTransitionPeriod2[0],
                      sankeyTransitionPeriod2[1],
                      "year"
                    )
                  )
                  .mode();
                let transitionImg = ee.Image(0);

                selectedObj.sankey_class_values[bn].map(
                  (sankey_class_values_pair) => {
                    outClass = parseInt(
                      `${sankey_class_values_pair[0]}0990${sankey_class_values_pair[1]}`
                    );

                    transitionImg = transitionImg.where(
                      itemBnTransitionPeriod1
                        .eq(sankey_class_values_pair[0])
                        .and(
                          itemBnTransitionPeriod2.eq(
                            sankey_class_values_pair[1]
                          )
                        ),
                      outClass
                    );
                  }
                );
                let transitionBn = `${sankeyTransitionPeriod1.join(
                  "-"
                )}---${sankeyTransitionPeriod2.join("-")}`;
                transitionBns.push(transitionBn);
                transitionImg = transitionImg
                  .set("system:index", transitionBn)
                  .rename(`${bn}`);
                sankeyC.push(transitionImg);
              }
            );
            sankeyC = ee
              .ImageCollection(sankeyC)
              .toBands()
              .rename(transitionBns);

            sankeyC
              .reduceRegion(
                selectedObj.reducer,
                area,
                scaleT,
                selectedObj.crs,
                transformT,
                true,
                1e13,
                4
              )
              .evaluate((counts, failure) => {
                if (failure !== undefined) {
                  showMessage(
                    "Area Charting Error",
                    `Encountered the following error while summarizing ${selectedObj.name}<br>${failure}`
                  );
                } else {
                  if (
                    this.areaChartingOn === true &&
                    this.makeChartID === this.makeChartID
                  ) {
                    let transitionPeriodI = 1;

                    let sankey_dict = {
                      source: [],
                      target: [],
                      value: [],
                    };
                    let labels = [];
                    let colors = [];
                    let outCSV = [];

                    selectedObj.class_names[bn].map((l) => {
                      let sankeyTransitionPeriod = sankeyTransitionPeriods[0];
                      sankeyTransitionPeriod =
                        sankeyTransitionPeriod[0] === sankeyTransitionPeriod[1]
                          ? sankeyTransitionPeriod[0]
                          : sankeyTransitionPeriod.join("-");
                      labels.push(`${sankeyTransitionPeriod} ${l}`);
                    });
                    selectedObj.class_palette[bn].map((c) => colors.push(c));

                    Object.keys(counts).map((transitionPeriod) => {
                      let offset1 =
                        (transitionPeriodI - 1) *
                        selectedObj.class_names[bn].length;
                      let offset2 =
                        transitionPeriodI * selectedObj.class_names[bn].length;
                      //Append labels and colors
                      selectedObj.class_names[bn].map((l) => {
                        let sankeyTransitionPeriod =
                          sankeyTransitionPeriods[transitionPeriodI];
                        sankeyTransitionPeriod =
                          sankeyTransitionPeriod[0] ===
                          sankeyTransitionPeriod[1]
                            ? sankeyTransitionPeriod[0]
                            : sankeyTransitionPeriod.join("-");
                        labels.push(`${sankeyTransitionPeriod} ${l}`);
                      });
                      selectedObj.class_palette[bn].map((c) => colors.push(c));

                      let countsTransitionPeriod = counts[transitionPeriod];
                      let rawValues = Object.values(countsTransitionPeriod);
                      let pixelTotal = sum(rawValues);
                      let mult;
                      if (areaChartFormat === "Percentage") {
                        mult = (1 / pixelTotal) * 100;
                      } else {
                        mult =
                          chartFormatDict[areaChartFormat].mult * scaleMult;
                      }
                      let values = rawValues.map((v) => smartToFixed(v * mult));
                      let classes = Object.keys(countsTransitionPeriod).map(
                        (cls) => cls.split("0990").map((n) => parseInt(n))
                      );

                      let vi = 0;
                      let countLookup = {};
                      classes.map((cls) => {
                        let class_valueI1 = selectedObj.class_values[
                          bn
                        ].indexOf(cls[0]);
                        let color_value1 =
                          selectedObj.class_palette[bn][class_valueI1];
                        let class_valueI2 = selectedObj.class_values[
                          bn
                        ].indexOf(cls[1]);
                        let color_value2 =
                          selectedObj.class_palette[bn][class_valueI2];
                        if (
                          (rawValues[vi] / pixelTotal) * 100 >=
                          selectedObj.sankeyMinPercentage
                        ) {
                          sankey_dict.source.push(class_valueI1 + offset1);
                          sankey_dict.target.push(class_valueI2 + offset2);
                          sankey_dict.value.push(values[vi]);
                        }

                        countLookup[
                          `${selectedObj.class_names[bn][class_valueI1]}---${selectedObj.class_names[bn][class_valueI2]}`
                        ] = values[vi];
                        vi++;
                      });

                      outCSV.push(
                        [""].concat(
                          selectedObj.class_names[bn].map((nm) => {
                            let tp = transitionPeriod.split("---")[1];
                            let tps = tp.split("-");
                            tp = tps[0] === tps[1] ? tps[0] : tp;
                            return `${nm.replace(/[^A-Za-z0-9]/g, "-")} ${tp} `;
                          })
                        )
                      );
                      selectedObj.class_names[bn].map((nm1) => {
                        let tp = transitionPeriod.split("---")[0];
                        let tps = tp.split("-");
                        tp = tps[0] === tps[1] ? tps[0] : tp;
                        let line = [
                          `${nm1.replace(/[^A-Za-z0-9]/g, "-")} ${tp}`,
                        ];
                        selectedObj.class_names[bn].map((nm2) => {
                          let v = countLookup[`${nm1}---${nm2}`];
                          v = v !== undefined ? v : 0;
                          line.push(v);
                        });
                        outCSV.push(line);
                      });
                      outCSV.push([""]);

                      transitionPeriodI++;
                    });

                    outCSV = outCSV.map((r) => r.join(",")).join("\n");
                    selectedObj.tableExportData[bn] = outCSV;
                    labels = labels.map((l) =>
                      l
                        .slice(0, selectedObj.chartLabelMaxLength)
                        .chunk(selectedObj.chartLabelMaxWidth)
                        .join("<br>")
                    );
                    let bnNameTitle = bn.replaceAll("_", " ") + " ";
                    if (
                      selectedObj.bandNames.length === 1 ||
                      selectedObj.name.indexOf(bnNameTitle) > -1
                    ) {
                      bnNameTitle = "";
                    }
                    this.makeSankeyChart(
                      sankey_dict,
                      labels,
                      colors,
                      bn,
                      `${selectedObj.name} ${bnNameTitle}<br>${name} (${nominalScale}m)`,
                      selectedObj,
                      outCSV
                    );

                    this.outstandingChartRequests[this.makeChartID]--;

                    this.updateProgress();
                  } else {
                    console.log(
                      `Chart id moved on: Returned ID = ${makeChartID}, Current ID = ${this.makeChartID}`
                    );
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
        let areaChartCollectionStack =
          selectedObj.layerType === "ImageCollection"
            ? selectedObj.item.toBands()
            : selectedObj.item;

        areaChartCollectionStack = areaChartCollectionStack.rename(
          selectedObj.stackBandNames
        );

        if (selectedObj.shouldUnmask) {
          areaChartCollectionStack = areaChartCollectionStack.unmask(
            selectedObj.unmaskValue
          );
        }

        areaChartCollectionStack
          .reduceRegion(
            selectedObj.reducer,
            area,
            scaleT,
            selectedObj.crs,
            transformT,
            true,
            1e13,
            4
          )
          .evaluate((counts, failure) => {
            if (this.areaChartingOn && makeChartID === this.makeChartID) {
              if (failure !== undefined) {
                showMessage(
                  "Area Charting Error",
                  `Encountered the following error while summarizing ${selectedObj.name}<br>${failure}`
                );
              } else {
                let header =
                  selectedObj.layerType === "ImageCollection"
                    ? [selectedObj.xAxisLabel]
                    : [];

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
                      let bnsT = Object.keys(counts).filter(
                        (k) => k.indexOf(bn) > -1
                      );
                      class_namesT = [];
                      bnsT.map(
                        (bnT) =>
                          (class_namesT = class_namesT.concat(
                            Object.keys(counts[bnT])
                          ))
                      );
                      class_namesT = unique(class_namesT);

                      selectedObj.class_namesT[bn] = class_namesT;
                    }
                    let class_paletteT;
                    if (selectedObj.class_palette !== null) {
                      class_paletteT = selectedObj.class_palette[bn];
                    } else if (
                      selectedObj.palette !== undefined &&
                      selectedObj.palette !== null
                    ) {
                      class_paletteT = selectedObj.palette;
                    } else if (
                      selectedObj.palette_lookup !== undefined &&
                      selectedObj.palette_lookup !== null
                    ) {
                      class_paletteT = class_namesT.map(
                        (cn) => selectedObj.palette_lookup[cn]
                      );
                    } else {
                      class_paletteT = class_namesT.map((c) => null);
                    }

                    if (selectedObj.bandNames.length == 1) {
                      nameStart = "";
                    }
                    class_namesT.map((cn) => {
                      cd = cn.replace(/[^A-Za-z0-9]/g, "-");
                      header.push(`${nameStart}${cn}`);
                    });
                    class_paletteT.map((color) => {
                      color =
                        color !== null &&
                        color !== undefined &&
                        color[0] !== "#"
                          ? `#${color}`
                          : color;
                      colors.push(color);
                    });
                    if (
                      selectedObj.class_visibility !== null &&
                      selectedObj.class_visibility[bn] !== undefined
                    ) {
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
                      : selectedObj.visible.map((v) =>
                          v === true ? v : "legendonly"
                        );
                  selectedObj.bandNames.map((bn) =>
                    header.push(bn.replace(/[^A-Za-z0-9]/g, "-"))
                  );
                }
                let outTable = [header];
                if (selectedObj.layerType === "ImageCollection") {
                  selectedObj.xAxisLabels.map((xLabel) => {
                    let row = [xLabel];

                    if (selectedObj.isThematic) {
                      selectedObj.bandNames.map((bn) => {
                        let countsT =
                          counts[`${xLabel}${selectedObj.splitStr}${bn}`];
                        let values =
                          selectedObj.class_values !== null
                            ? selectedObj.class_values[bn]
                            : selectedObj.class_namesT[bn];
                        let names =
                          selectedObj.class_names !== null
                            ? selectedObj.class_names[bn]
                            : selectedObj.class_namesT[bn];
                        let pixelTotal = sum(Object.values(countsT)) || 0;
                        if (areaChartFormat === "Percentage") {
                          mult = (1 / pixelTotal) * 100;
                        } else {
                          mult =
                            chartFormatDict[areaChartFormat].mult * scaleMult;
                        }

                        values.map((v) => {
                          let tv = countsT[v] || 0;
                          row.push(tv * mult);
                        });
                      });
                    } else {
                      selectedObj.bandNames.map((bn) => {
                        let countsT =
                          counts[`${xLabel}${selectedObj.splitStr}${bn}`];
                        row.push(countsT);
                      });
                    }

                    outTable.push(row);
                  });
                } else {
                  let row = [];

                  if (selectedObj.isThematic) {
                    selectedObj.bandNames.map((bn) => {
                      let countsT = counts[bn];
                      let values =
                        selectedObj.class_values !== null
                          ? selectedObj.class_values[bn]
                          : Object.keys(countsT);
                      let names =
                        selectedObj.class_names !== null
                          ? selectedObj.class_names[bn]
                          : Object.keys(countsT);
                      let pixelTotal = sum(Object.values(countsT)) || 0;
                      if (areaChartFormat === "Percentage") {
                        mult = (1 / pixelTotal) * 100;
                      } else {
                        mult =
                          chartFormatDict[areaChartFormat].mult * scaleMult;
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

                this.outstandingChartRequests[this.makeChartID]--;
                this.updateProgress();

                this.makeChart(
                  outTable,
                  `${name} (${nominalScale}m)`,
                  colors,
                  visible,
                  selectedObj
                );
              }
            } else {
              console.log(
                `Chart id moved on: Returned ID = ${makeChartID}, Current ID = ${this.makeChartID}`
              );
            }
          });
      }
    });
  };
  //////////////////////////////////////////////////////////////////////////
  this.clearChartLayerSelect = function () {
    $("#" + this.layerSelectID).remove();
  };
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

    addCheckboxes(
      this.layerSelectContainerID,
      this.layerSelectID,
      "Area Chart Layers",
      "checkboxSelectedChartLayers",
      selectedObj,
      labels,
      "Choose which layers to include in area summary charts",
      "prepend"
    );

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
    if (this.areaChartingOn) {
      let p = 0;
      if (this.maxOutStandingChartRequests[this.makeChartID] > 0) {
        p = parseInt(
          (1 -
            this.outstandingChartRequests[this.makeChartID] /
              this.maxOutStandingChartRequests[this.makeChartID]) *
            100
        );
      }

      updateProgress(".progressbar", p);

      if (p === 100) {
        $("#query-spinner-img").removeClass("fa-spin");
      } else {
        $("#query-spinner-img").addClass("fa-spin");
      }
    }
  };
}
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
let areaChart = new areaChartCls();
$("#map-defined-area-chart-label").hide();
