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
function downloadPlotlyAreaChartWrapper(areaObjID, bn, filename) {
  console.log(areaChart.areaChartObj[areaObjID].plots[bn]);
  downloadPlotly(areaChart.areaChartObj[areaObjID].plots[bn], filename, false);
}
function areaChartCls() {
  this.areaChartID = 1;
  this.makeChartID = 0;

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
  this.sankeyTransitionPeriods = [
    [urlParams.startYear, urlParams.startYear + this.sankeyTransitionPeriodYearBuffer],
    [2001, 2001 + this.sankeyTransitionPeriodYearBuffer],
    [urlParams.endYear - this.sankeyTransitionPeriodYearBuffer, urlParams.endYear],
  ];
  // Function for cleanup of all area chart layers and output divs
  this.clearLayers = function () {
    this.areaChartObj = {};
    this.areaChartID = 1;
    // this.makeChartID = 0;
    this.clearCharts;
  };
  // Add chart layer object
  this.addLayer = function (eeLayer, params = {}, name, shouldChart = true) {
    let obj = {};
    obj.name = name || `Area-Layer-${this.areaChartID}`;
    obj.id = obj.name.replaceAll(" ", "-") + "-" + this.areaChartID.toString();
    obj.id = obj.id.replace(/[^A-Za-z0-9]/g, "-");

    // if (params.autoViz) {
    let bandNames = eeLayer.first().bandNames();
    let dict = eeLayer.first().toDictionary();
    dict = dict.set("bandNames", bandNames).getInfo();
    obj.bandNames = params.bandNames || dict.bandNames;

    //   console.log(dict);
    params.class_names = params.class_names || {};
    params.class_values = params.class_values || {};
    params.class_palette = params.class_palette || {};
    params.class_visibility = params.class_visibility || {};
    // obj.bandNames = [];
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
      // obj.bandNames.push(bn);
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
    obj.autoScale = params.autoScale || true;
    obj.minZoomSpecifiedScale = params.minZoomSpecifiedScale || 13; // Above this zoom level, it won't change the scale/transform
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
    } else {
      if (obj.xAxisProperty === "year") {
        let tempItem = obj.item.map(function (img) {
          return img.set("year", img.date().format(obj.dateFormat));
        });
        obj.xAxisLabels = tempItem.aggregate_histogram(obj.xAxisProperty).keys().getInfo();
      } else {
        obj.xAxisLabels = obj.item.aggregate_histogram(obj.xAxisProperty).keys().getInfo();
      }

      obj.stackBandNames = [];
      obj.xAxisLabels.map((xLabel) => {
        obj.bandNames.map((bn) => {
          obj.stackBandNames.push(`${xLabel}${obj.splitStr}${bn}`);
        });
      });
      // console.log(obj.stackBandNames);
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
  this.autoSetScale = function (scaleT, transformT, minZoomSpecifiedScale) {
    scaleT = scaleT || transformT[0];
    let scaleMult = 1 / ((1 << map.getZoom()) / (1 << minZoomSpecifiedScale));
    scaleMult = scaleMult < 1 ? 1 : scaleMult;
    scaleT = scaleT * scaleMult;
    // console.log([scaleMult, scaleT]);
    if (transformT !== undefined && transformT !== null) {
      transformT[0] = scaleT;
      transformT[4] = -scaleT;
      scaleT = null;
    }
    return [scaleT, transformT, scaleMult];
  };

  this.getMapExtentCoordsStr = function () {
    return Object.values(map.getBounds().toJSON()).map(smartToFixed).join(",");
  };
  this.startAutoCharting = function () {
    this.mapCoordsStr = this.getMapExtentCoordsStr();
    this.listeners.push(
      google.maps.event.addListener(map, "idle", () => {
        let nowCoords = this.getMapExtentCoordsStr();
        if (nowCoords !== this.mapCoordsStr) {
          this.mapCoordsStr = nowCoords;
          setTimeout(this.chartMapExtent(), 500);
        } else {
          console.log("Map has not really moved");
        }
      })
    );
    this.autoChartingOn = true;
    this.chartMapExtent();
  };
  this.stopAutoCharting = function () {
    this.listeners.map((e) => google.maps.event.removeListener(e));
    this.autoChartingOn = false;
  };

  // this.populateChartDropdown = function () {
  // populateChartDropdown("area-collection-dropdown", this.areaChartObj, "whichAreaChartCollection"); //populateChartDropdown(id, collectionDict, whichChartCollectionVar);
  // };
  this.clearCharts = function () {
    $(`#${this.chartContainerID}`).empty();
    // $(`#${this.chartContainerID}`).append(`<div id="chart-download-canvas" style="display:none;"></div>`);
  };
  this.chartMapExtent = function (name = "") {
    let mapCoords = Object.values(map.getBounds().toJSON()).map(smartToFixed).join(",");
    this.clearCharts();
    this.chartArea(eeBoundsPoly, `${name} (${mapCoords})`);
  };

  this.getDownloadButtonGroup = function (id, bn, outFilename) {
    return `<div class="btn-group" role="group" >
  <button type="button" class="btn btn-secondary" onclick = "exportToCsv2('${id}','${bn}','${outFilename}.csv')" title = "Click to download ${outFilename}.csv tabular data">CSV</button>
  
  <button type="button" class="btn btn-secondary" onclick = "downloadPlotlyAreaChartWrapper('${id}','${bn}','${outFilename}.png')" title = "Click to download ${outFilename}.png graph data">PNG</button>
</div>`;
    //   return `<div href="#" class = 'btn area-chart-download-btn' title = "Click to download ${outFilename}" onclick = "downloadPlotlyAreaChartWrapper('${id}','${bn}','${outFilename}.png')"><img alt="Downloads icon" src="./src/assets/Icons_svg/dowload_ffffff.svg"><img alt="Downloads icon" src="./src/assets/Icons_svg/graph_ffffff.svg"></div>`;
  };

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
    $(`#${this.chartContainerID}`).append(`<div id = ${tempGraphDivID}></div>${downloadButtons}<hr>`);
    var graphDiv = document.getElementById(tempGraphDivID);
    selectedObj.plots[bn] = Plotly.newPlot(graphDiv, data, plotLayout, config);
  };

  this.makeLineChart = function (table, name, colors, visible, selectedObj) {
    // let selectedObj = this.areaChartObj[whichAreaChartCollection];
    let outFilename = `${selectedObj.name} Summary ${name}`;
    if (selectedObj.chartDecimalProportion !== undefined && selectedObj.chartDecimalProportion !== null) {
      chartDecimalProportion = selectedObj.chartDecimalProportion;
    }
    if (selectedObj.chartPrecision !== undefined && selectedObj.chartPrecision !== null) {
      chartPrecision = selectedObj.chartPrecision;
    }
    let csvTable = [table[0].map((s) => s.replace(/[^A-Za-z0-9]/g, "-"))];
    csvTable = csvTable.concat(table.slice(1).map((r) => r.slice(0, 1).concat(r.slice(1).map((n) => smartToFixed(n)))));
    selectedObj.tableExportData["line"] = csvTable.map((r) => r.join(",")).join("\n");
    // Set up table

    // console.log(downloadButton);
    // exportToCsv(outFilename + ".csv", table);
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
        name: header[i].slice(0, selectedObj.chartLabelMaxLength).chunk(selectedObj.chartLabelMaxWidth).join("<br>"),
        line: { color: colors[i - 1] },
      };
    });
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
    ${downloadButtons}<hr>`);
    var graphDiv = document.getElementById(tempGraphDivID);
    selectedObj.plots["line"] = Plotly.newPlot(graphDiv, data, plotLayout, buttonOptions);
  };

  this.chartArea = function (area, name = "Default Name") {
    if (this.firstRun) {
      $("#query-spinner").append(
        `<img  id = 'query-spinner-img' alt= "Google Earth Engine logo spinner" title="Background processing is occurring in Google Earth Engine" class="fa" src="./src/assets/images/GEE_logo_transparent.png"  style='height:2rem;'><div class="progressbar progress-pulse"  id='query-progressbar px-2' title='Percent of layers that have finished downloading chart summary data'>
        <span  style="width: 0% ;padding-top:0.15rem;">0%</span>
        </div>
        <span id = 'summary-spinner-message'></span>`
      );
      this.firstRun = false;
    }
    this.makeChartID++;
    this.outstandingChartRequests[this.makeChartID] = 0;
    this.maxOutStandingChartRequests[this.makeChartID] = 0;
    if (Object.values(selectedChartLayers).filter((v) => v == true).length > 0) {
      this.updateProgress();
    }

    $("#chart-collapse-label-chart-collapse-div").show();
    $("#legendDiv").css("max-width", "575px");
    $("#legendDiv").css("max-height", window.innerHeight - convertRemToPixels(1) + 1);

    // console.log(area);
    Object.keys(selectedChartLayers).map((k) => {
      // console.log(k);
      let selectedObj = Object.fromEntries(Object.entries(this.areaChartObj).filter(([k2, v]) => v.name == k && selectedChartLayers[k] === true));
      selectedObj = Object.values(selectedObj)[0];

      if (selectedObj !== undefined) {
        let scaleT = structuredClone(selectedObj.scale);
        let transformT = structuredClone(selectedObj.transform);
        let scaleMult = 1;
        if (selectedObj.autoScale) {
          // console.log("here");
          // console.log(selectedObj.autoScale);
          // console.log(scaleT, transformT);
          let scaleTransform = this.autoSetScale(scaleT, transformT, selectedObj.minZoomSpecifiedScale);
          scaleT = scaleTransform[0];
          transformT = scaleTransform[1];
          scaleMult = scaleTransform[2];
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
            let sankeyTransitionPeriods = selectedObj.sankeyTransitionPeriods || this.sankeyTransitionPeriods;
            range(0, sankeyTransitionPeriods.length - 1).map((transitionPeriodI) => {
              let sankeyTransitionPeriod1 = sankeyTransitionPeriods[transitionPeriodI];
              let sankeyTransitionPeriod2 = sankeyTransitionPeriods[transitionPeriodI + 1];
              // console.log(sankeyTransitionPeriod1, sankeyTransitionPeriod2);
              let itemBnTransitionPeriod1 = itemBn.filter(ee.Filter.calendarRange(sankeyTransitionPeriod1[0], sankeyTransitionPeriod1[1], "year")).mode();
              let itemBnTransitionPeriod2 = itemBn.filter(ee.Filter.calendarRange(sankeyTransitionPeriod2[0], sankeyTransitionPeriod2[1], "year")).mode();
              let transitionImg = ee.Image(0);

              selectedObj.sankey_class_values[bn].map((sankey_class_values_pair) => {
                // console.log(sankey_class_values_pair);
                outClass = parseInt(`${sankey_class_values_pair[0]}0990${sankey_class_values_pair[1]}`);
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
                      let class_valueI2 = selectedObj.class_values[bn].indexOf(cls[1]);
                      sankey_dict.source.push(class_valueI1 + offset1);
                      sankey_dict.target.push(class_valueI2 + offset2);
                      sankey_dict.value.push(values[vi]);
                      countLookup[`${selectedObj.class_names[bn][class_valueI1]}---${selectedObj.class_names[bn][class_valueI2]}`] = values[vi];
                      vi++;
                    });
                    // console.log(countLookup);
                    outCSV.push([""].concat(selectedObj.class_names[bn].map((nm) => `${nm.replace(/[^A-Za-z0-9]/g, "-")} ${transitionPeriod.split("---")[1]} `)));
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
                  this.makeSankeyChart(sankey_dict, labels, colors, bn, `${selectedObj.name} Sankey ${bn.replaceAll("_", " ")} ${name}`, selectedObj, outCSV);
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
          });
        } else {
          this.outstandingChartRequests[this.makeChartID]++;
          this.maxOutStandingChartRequests[this.makeChartID]++;
          let areaChartCollectionStack = selectedObj.item.toBands();

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
          areaChartCollectionStack = areaChartCollectionStack.rename(selectedObj.stackBandNames);
          // console.log(areaChartCollectionStack.bandNames().getInfo());
          // this.getZonalStats(areaChartCollectionStack, area, selectedObj.reducer);

          areaChartCollectionStack.reduceRegion(selectedObj.reducer, area, scaleT, selectedObj.crs, transformT, true, 1e13, 4).evaluate((counts, failure) => {
            if (makeChartID === this.makeChartID) {
              if (failure !== undefined) {
                showMessage("Area Charting Error", `Encountered the following error while summarizing ${selectedObj.name}<br>${failure}`);
              } else {
                // console.log(counts);
                let outTable = [header];
                selectedObj.xAxisLabels.map((xLabel) => {
                  let row = [xLabel];

                  if (selectedObj.isThematic) {
                    selectedObj.bandNames.map((bn) => {
                      let countsT = counts[`${xLabel}${selectedObj.splitStr}${bn}`];
                      let values = selectedObj.class_values[bn];
                      let names = selectedObj.class_names[bn];
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
                // console.log(outTable);
                this.outstandingChartRequests[this.makeChartID]--;
                this.updateProgress();
                // console.log(this.outstandingChartRequests);
                this.makeLineChart(outTable, name, colors, visible, selectedObj);
              }
            } else {
              console.log(`Chart id moved on: Returned ID = ${makeChartID}, Current ID = ${this.makeChartID}`);
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
  this.updateProgress = function () {
    let p = 0;
    if (this.maxOutStandingChartRequests[this.makeChartID] > 0) {
      p = parseInt((1 - this.outstandingChartRequests[this.makeChartID] / this.maxOutStandingChartRequests[this.makeChartID]) * 100);
    }

    updateProgress(".progressbar", p);
    // console.log(p);
    if (p === 100) {
      $("#query-spinner-img").removeClass("fa-spin");
    } else {
      $("#query-spinner-img").addClass("fa-spin");
    }
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
