///////////////////////////////////////////////////////
// Function to add Treemap attributes to map
function runTreeMap() {
  // All attributes collection
  // Each attribute is an individual image
  // This collection is set up with a time property for future ability to have a time series of TreeMap outputs
  const attrC = ee.ImageCollection(
    "projects/treemap-386222/assets/Final_Outputs/TreeMap_2016"
  );
  const attrStack = ee.Image("USFS/GTAC/TreeMap/v2016/TreeMap2016");

  // All attributes available
  // This list is currently only used for reference to creat the thematic and continuous lists below
  const attrs = [
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

  // Set the first layer to visible
  var visible = true;

  // Set up palettes - reverse those we want reversed
  palettes.cmocean.Tempo[7].reverse();
  palettes.crameri.bamako[50].reverse();
  palettes.crameri.bamako[25].reverse();
  palettes.crameri.lajolla[10].reverse();
  palettes.crameri.imola[50].reverse();

  // Set up the thematic and continuous attributes
  // Thematic have a numeric and name field specified - the name field is pulled from the json version
  // of the attribute table that is brought in when the TreeMap page is initially loaded (./geojson/TreeMap2016.tif.vat.json)
  //var thematicAttrs = [
  //                     ['FORTYPCD','ForTypName','Algorithm Forest Type Name'],
  //                     ['FLDTYPCD','FldTypName','Field Forest Type Name']
  //                    ];
  const thematicAttrs = [
    [
      "FORTYPCD",
      "ForTypName",
      "FORTYPCD: Algorithm Forest Type Code",
      "This is the forest type used for reporting purposes. It is primarily derived using a computer algorithm, except when less than 25 percent of the plot samples a particular forest condition or in a few other cases.",
    ],
    [
      "FLDTYPCD",
      "FldTypName",
      "FLDTYPCD: Field Forest Type Code",
      "A code indicating the forest type, assigned by the field crew, based on the tree species or species groups forming a plurality of all live stocking. The field crew assesses the forest type based on the acre of forest land around the plot, in addition to the species sampled on the condition.",
    ],
  ];

  // Continuous have the syntax: [attribute name, palette, lower stretch percentile, upper stretch percentile, descriptive name]
  // Attributes appear in legend in reverse order from how they appear here
  const chartPaletteDict = {
    live1: "#5AE0B0",
    live2: "#68A18C",
    dead1: "#E05334",
    dead2: "#C15D53",
    other1: "#5EE159",
    other2: "#5A8CE0",
    other3: "#E0AF4A",
  };
  const chartLayerDict = {
    Total_Volume_Attributes: {
      bandNames: {
        VOLCFNET_L: "Volume, Live - cubic ft",
        VOLCFNET_D: "Volume, Standing Dead - cubic ft",
        VOLBFNET_L: "Volume, Live - sawlog-board-ft",
      },
      palette: [
        chartPaletteDict.live1,
        chartPaletteDict.dead1,
        chartPaletteDict.live2,
      ],
      visible: false,
      scalar: 0.222395,
    },
    Total_Trees_Attributes: {
      bandNames: {
        TPA_DEAD: "Dead Trees Total",
        TPA_LIVE: "Live Trees Total",
      },
      palette: [chartPaletteDict.dead1, chartPaletteDict.live1],
      visible: false,
      scalar: 0.222395,
    },
    Total_Dry_Biomass_Attributes: {
      bandNames: {
        DRYBIO_D: "Dry Standing Dead Tree Biomass, Above Ground - tons",
        DRYBIO_L: "Dry Standing Live Tree Biomass, Above Ground - tons",
      },
      palette: [chartPaletteDict.dead1, chartPaletteDict.live1],
      visible: false,
      scalar: 0.222395,
    },
    Total_Carbon_Attributes: {
      bandNames: {
        CARBON_D: "Carbon, Standing Dead - tons",
        CARBON_DWN: "Carbon, Down Dead - tons",
        CARBON_L: "Carbon, Live Above Ground - tons",
      },
      palette: [
        chartPaletteDict.dead1,
        chartPaletteDict.dead2,
        chartPaletteDict.live1,
      ],
      visible: true,
      scalar: 0.222395,
    },
    Stand_Density_Attributes: {
      bandNames: {
        QMD_RMRS: "Stand Quadratic Mean Diameter - in",
        SDIPCT_RMRS: "Stand Density Index - percent of maximum",
      },
      palette: [chartPaletteDict.other1, chartPaletteDict.other2],
      visible: false,
    },
    Live_Tree_Attributes: {
      bandNames: {
        STANDHT: "Height of Dominant Trees - ft",
        BALIVE: "Live Tree Basal Area - square ft",
      },
      palette: [chartPaletteDict.other1, chartPaletteDict.live1],
      visible: true,
    },
    Percent_Attributes: {
      bandNames: {
        GSSTK: "Growing-Stock Stocking - percent",
        ALSTK: "All-Live-Tree Stocking - percent",
        CANOPYPCT: "Live Canopy Cover - percent",
      },
      palette: [
        chartPaletteDict.other1,
        chartPaletteDict.live1,
        chartPaletteDict.live2,
      ],
      visible: true,
    },
  };
  const continuousAttrs = [
    // volume
    [
      "VOLCFNET_L",
      palettes.crameri.imola[50],
      0.05,
      0.95,
      "VOLCFNET_L: Volume, Live (ft³/acre)",
      "Calculated via the following FIA query: Sum VOLCFNET*TPA_UNADJ WHERE (((COND.COND_STATUS_CD)=1) AND ((TREE.STATUSCD)=1))",
    ],
    [
      "VOLCFNET_D",
      palettes.crameri.imola[50],
      0.05,
      0.95,
      "VOLCFNET_D: Volume, Standing Dead (ft³/acre)",
      "Calculated via the following FIA query: Sum VOLCFNET*TPA_UNADJ WHERE (((COND.COND_STATUS_CD)=1) AND ((TREE.STATUSCD)=2) AND ((TREE.DIA)>=5) AND ((TREE.STANDING_DEAD_CD)=1))",
    ],
    [
      "VOLBFNET_L",
      palettes.crameri.imola[50],
      0.05,
      0.95,
      "VOLBFNET_L: Volume, Live (sawlog-board-ft/acre)",
      "Calculated via the following FIA query: Sum VOLBFNET * TPA_UNADJ WHERE (((TREE.TREECLCD)=2) AND ((COND.COND_STATUS_CD)=1) AND ((TREE.STATUSCD)=1))",
    ],

    // trees per acre
    [
      "TPA_DEAD",
      palettes.crameri.bamako[10],
      0.25,
      0.7,
      "TPA_DEAD: Dead Trees Per Acre",
      "Number of dead standing trees per acre (DIA >= 5”). Calculated via the following FIA query: Sum TREE.TPA_UNADJ WHERE (((COND.COND_STATUS_CD)=1) AND ((TREE.STATUSCD)=2) AND ((TREE.DIA)>=5) AND ((TREE.STANDING_DEAD_CD)=1))",
    ],
    [
      "TPA_LIVE",
      palettes.crameri.bamako[25],
      0.2,
      0.8,
      "TPA_LIVE: Live Trees Per Acre",
      'Number of live trees per acre (DIA > 1"). Calculated via the following FIA query: Sum TREE.TPA_UNADJ WHERE (((COND.COND_STATUS_CD)=1) AND ((TREE.STATUSCD)=1) AND ((TREE.DIA)>=1))',
    ],

    // dry biomass
    [
      "DRYBIO_D",
      palettes.crameri.lajolla[25],
      0.1,
      0.9,
      "DRYBIO_D: Dry Standing Dead Tree Biomass, Above Ground (tons/acre)",
      "Calculated via the following FIA query: Sum (DRYBIO_BOLE, DRYBIO_TOP, DRYBIO_STUMP, DRYBIO_SAPLING, DRYBIO_WDLD_SPP) /2000*TPA_UNADJ WHERE (((COND.COND_STATUS_CD)=1) AND ((TREE.STATUSCD)=2) AND ((TREE.DIA)>=5) AND ((TREE.STANDING_DEAD_CD)=1))",
    ],
    [
      "DRYBIO_L",
      palettes.crameri.lajolla[10],
      0.05,
      0.95,
      "DRYBIO_L: Dry Live Tree Biomass, Above Ground (tons/acre)",
      "Dry Live Tree Biomass, Above Ground. Calculated via the following FIA query: Sum (DRYBIO_BOLE, DRYBIO_TOP, DRYBIO_STUMP, DRYBIO_SAPLING, DRYBIO_WDLD_SPP) /2000*TPA_UNADJ WHERE (((COND.COND_STATUS_CD)=1) AND ((TREE.STATUSCD)=1))",
    ],

    // carbon
    [
      "CARBON_D",
      palettes.crameri.lajolla[25],
      0.05,
      0.95,
      "CARBON_D: Carbon, Standing Dead (tons/acre)",
      "Calculated via the following FIA query: Sum (DRYBIO_BOLE, DRYBIO_TOP, DRYBIO_STUMP, DRYBIO_SAPLING, DRYBIO_WDLD_SPP) / 2 /2000*TPA_UNADJ WHERE (((COND.COND_STATUS_CD)=1) AND ((TREE.STATUSCD)=2) AND ((TREE.DIA)>=5) AND ((TREE.STANDING_DEAD_CD)=1))",
    ],
    [
      "CARBON_DWN",
      palettes.crameri.lajolla[25],
      0.05,
      0.95,
      "CARBON_DWN: Carbon, Down Dead (tons/acre)",
      "Carbon (tons per acre) of woody material >3 inches in diameter on the ground, and stumps and their roots >3 inches in diameter. Estimated from models based on geographic area, forest type, and live tree carbon density (Smith and Heath 2008).",
    ],
    [
      "CARBON_L",
      palettes.crameri.lajolla[10],
      0.05,
      0.95,
      "CARBON_L: Carbon, Live Above Ground (tons/acre)",
      "Calculated via the following FIA query: Sum (DRYBIO_BOLE, DRYBIO_TOP, DRYBIO_STUMP, DRYBIO_SAPLING, DRYBIO_WDLD_SPP) / 2 /2000*TPA_UNADJ WHERE (((COND.COND_STATUS_CD)=1) AND ((TREE.STATUSCD)=1))",
    ],

    // stand density
    [
      "QMD_RMRS",
      palettes.crameri.bamako[25],
      0.05,
      0.95,
      "QMD_RMRS: Stand Quadratic Mean Diameter (in)",
      "Rocky Mountain Research Station. The quadratic mean diameter, or the diameter of the tree of average basal area, on the condition. Based on live trees ≥1.0 inch d.b.h./d.r.c. Only collected by certain FIA work units.",
    ],
    [
      "SDIPCT_RMRS",
      palettes.crameri.bamako[25],
      0.05,
      0.95,
      "SDIPCT_RMRS: Stand Density Index (percent of maximum)",
      "Rocky Mountain Research Station. A relative measure of stand density for live trees (≥1.0 inch d.b.h./d.r.c.) on the condition, expressed as a percentage of the maximum stand density index (SDI). Only collected by certain FIA work units.",
    ],

    // live tree variables
    [
      "STANDHT",
      palettes.crameri.bamako[50],
      0.1,
      0.9,
      "STANDHT: Height of Dominant Trees (ft)",
      "Derived from the Forest Vegetation Simulator.",
    ],
    [
      "BALIVE",
      palettes.crameri.bamako[50],
      0.05,
      0.95,
      "BALIVE: Live Tree Basal Area (ft²)",
      "Basal area in square feet per acre of all live trees ≥1.0 inch d.b.h./d.r.c. sampled in the condition.",
    ],
  ];

  const ordinalAttrs = [
    [
      "STDSZCD",
      palettes.custom.standsize[4],
      0,
      1,
      "STDSZCD: Algorithm Stand-Size Class Code",
      "A classification of the predominant (based on stocking) diameter class of live trees within the condition assigned using an algorithm.",
    ], // ranges from 1-5
    [
      "FLDSZCD",
      palettes.custom.fieldsize[6],
      0,
      1,
      "FLDSZCD: Field Stand-Size Class Code",
      "Field-assigned classification of the predominant (based on stocking) diameter class of live trees within the condition.",
    ], // ranges from 0-5
  ];

  const percentAttrs = [
    // have two attributes: palette and name. default range is 0-100
    [
      "GSSTK",
      palettes.crameri.bamako[50],
      "GSSTK: Growing-Stock Stocking (percent)",
      "The sum of stocking percent values of all growing-stock trees on the condition.",
    ],
    [
      "ALSTK",
      palettes.crameri.bamako[50],
      "ALSTK: All-Live-Tree Stocking (percent)",
      "The sum of stocking percent values of all live trees on the condition.",
    ],
    [
      "CANOPYPCT",
      palettes.crameri.bamako[50],
      "CANOPYPCT: Live Canopy Cover (percent)",
      "Derived from the Forest Vegetation Simulator.",
    ],
  ];

  // Function to get a thematic attribute image service
  function getThematicAttr_Colors(attr) {
    // Pull the attribute image
    let attrImg = attrStack.select(attr[0]); //attrC.filter(ee.Filter.eq("attribute", attr[0])).first();

    // Get the numbers and names from the attribute table
    const numbers = treeMapLookup[attr[0]];
    const names = treeMapLookup[attr[1]];

    // Zip the numbers to the names, find the unique pairs and sort them
    const zippedValuesNames = unique(zip(numbers, names));
    zippedValuesNames.sort();

    // Pull apart the sorted unique pairs
    const uniqueValues = zippedValuesNames.map((r) => r[0]);
    const uniqueNames = zippedValuesNames.map((r) => r[1]);

    // Set up visualization parameters
    const viz = {};
    viz.autoViz = true;
    viz.includeClassValues = false;
    // // First set up a dictionary so when user queries pixel, the name is returned instead of the value
    // viz["queryDict"] = dict(zippedValuesNames);

    // // Set the min and max value for the renderer
    // viz["min"] = uniqueValues[0];
    // viz["max"] = uniqueValues[uniqueValues.length - 1];

    // Get all the unique colors for the legend and colors with blanks as black in the palette
    let colors = [];
    let palette = [];

    Map.setQueryPrecision(0.1, 3);
    range(uniqueValues[0], uniqueValues[uniqueValues.length - 1] + 1).map(
      (i) => {
        if (uniqueValues.indexOf(i) > -1) {
          const valueNameT = uniqueNames[uniqueValues.indexOf(i)];
          const nameIndex = forestTypeLookup.names.indexOf(valueNameT);
          c = forestTypeLookup.palette[nameIndex]; // refers to forest type palette .json brought in in html

          // If the hex color starts with a #, remove the #
          if (c[0] === "#") {
            c = c.slice(1);
          }
          colors.push(c);
          palette.push(c);
        } else {
          palette.push("000");
        }
      }
    );
    let props = {};
    props[`${attr[0]}_class_values`] = uniqueValues;
    props[`${attr[0]}_class_names`] = uniqueNames;
    props[`${attr[0]}_class_palette`] = colors;
    props.bandNames = [attr[0]];
    viz.eeObjInfo = props;
    attrImg = attrImg.set(props);
    // Specify the palette and the legend dictionary with the unique names and colors
    // viz["palette"] = palette;
    // viz["classLegendDict"] = dict(zip(uniqueNames, colors));
    viz["title"] = `${attr[2]} || ${attr[3]}`;
    // viz["canAreaChart"] = true;
    const areaChartParams = {
      barChartMaxClasses: 20,
      // chartLabelMaxLength: 25,
      eeObjInfo: props,
      chartDecimalProportion: 0.005,
      chartPrecision: 3,
      chartLabelMaxWidth: 400,
      chartLabelFontSize: 10,
      minZoomSpecifiedScale: 4,
    };
    return [attrImg, viz, attr[2], areaChartParams];
  }

  // Function to get a continuous attribute image service
  function getContinuousAttr(attr) {
    // Pull the attribute image
    const attrImg = attrStack.select(attr[0]); // attrC.filter(ee.Filter.eq("attribute", attr[0])).first();

    // Get the numbers and unique numbers for that attribute
    const numbers = treeMapLookup[attr[0]];
    let uniqueValues = asc(unique(numbers));

    // Filter out any value that is non RMRS (-99)
    uniqueValues = uniqueValues.filter((n) => n !== -99);

    // Set up renderer
    const viz = {};

    // Compute the nth percentile for the min max
    viz["min"] = parseInt(quantile(uniqueValues, attr[2]));
    viz["max"] = parseInt(quantile(uniqueValues, attr[3]));
    viz["palette"] = attr[1];
    viz["title"] = `${attr[4]} || ${attr[5]}`;

    return [attrImg, viz, attr[4]];
  }

  // function to apply unique values to Ordinal attribute
  function getOrdinalAttr(attr) {
    // Pull the attribute image
    let attrImg = attrStack.select(attr[0]); // attrC.filter(ee.Filter.eq("attribute", attr[0])).first();

    // Get the numbers and unique numbers for that attribute
    const numbers = treeMapLookup[attr[0]];
    let uniqueValues = asc(unique(numbers));

    // Filter out any value that is non RMRS (-99)
    uniqueValues = uniqueValues.filter((n) => n !== -99);

    // Set up renderer
    const viz = { autoViz: true };
    viz["title"] = `${attr[4]} || ${attr[5]}`;
    let props = {};
    props[`${attr[0]}_class_values`] = uniqueValues;
    props[`${attr[0]}_class_names`] = uniqueValues;
    props[`${attr[0]}_class_palette`] = attr[1];
    props.bandNames = [attr[0]];
    viz.eeObjInfo = props;
    viz.includeClassValues = false;
    attrImg = attrImg.set(props);

    const areaChartParams = {
      barChartMaxClasses: 20,
      // chartLabelMaxLength: 25,
      eeObjInfo: props,
      chartDecimalProportion: 0.005,
      chartPrecision: 3,
      chartLabelMaxWidth: 400,
      chartLabelFontSize: 10,
      minZoomSpecifiedScale: 4,
    };
    return [attrImg, viz, attr[4], areaChartParams];
  }

  // Removes all items of a given value from an array
  function removeItemAll(arr, value) {
    let i = 0;
    while (i < arr.length) {
      if (arr[i] === value) {
        arr.splice(i, 1);
      } else {
        ++i;
      }
    }
    return arr;
  }

  // function to apply to show percentage attributes as a range from 0-100
  function getPercentAttr(attr) {
    // Pull the attribute image
    const attrImg = attrStack.select(attr[0]); // attrC.filter(ee.Filter.eq("attribute", attr[0])).first();

    // Get the numbers and unique numbers for that attribute
    const numbers = treeMapLookup[attr[0]];
    let uniqueValues = asc(unique(numbers));

    // Filter out any value that is non RMRS (-99)
    uniqueValues = uniqueValues.filter((n) => n !== -99);

    // Set up renderer
    const viz = {};

    // Compute the nth percentile for the min max
    viz["min"] = 0;
    viz["max"] = 100;
    viz["palette"] = attr[1];
    viz["title"] = `${attr[2]} || ${attr[3]}`;
    // viz["canAreaChart"] = true;
    return [attrImg, viz, attr[2], 255];
  }

  // Function to get a continuous attribute image service and use standard deviation as the min/max
  function getContinuousAttrSD(attr) {
    // Pull the attribute image
    const attrImg = attrStack.select(attr[0]); // attrC.filter(ee.Filter.eq("attribute", attr[0])).first();

    // Get the numbers and unique numbers for that attribute
    const numbers = treeMapLookup[attr[0]];
    let uniqueValues = asc(unique(numbers));

    // Filter out any value that is non RMRS (-99)
    uniqueValues = uniqueValues.filter((n) => n !== -99);

    // Set up renderer
    const viz = {};

    // Compute the SD spread for the min max
    const sd_n = parseFloat(attr[2]);
    const median_n = parseFloat(quantile(uniqueValues, 0.5));
    const mean_n = parseInt(mean(uniqueValues));

    viz["min"] = 0;
    viz["max"] = mean_n;
    //viz['min'] = 0;
    //viz['max'] = parseInt(uniqueValues.median());
    viz["palette"] = attr[1];
    viz["title"] = `${attr[3]} (${attr[0]}) attribute image layer`;

    return [attrImg, viz, attr[3]];
  }

  //// Sort and add layers to the map
  // Create an array of all the layer visualization arrays returned by the respective functions
  const metaArray = ordinalAttrs
    .map(getOrdinalAttr)
    .concat(
      percentAttrs
        .map(getPercentAttr)
        .concat(
          thematicAttrs
            .map(getThematicAttr_Colors)
            .concat(continuousAttrs.map(getContinuousAttr))
        )
    );
  // const metaArray = thematicAttrs.map(getThematicAttr_Colors);
  // const metaArray = percentAttrs.map(getPercentAttr);
  // console.log(metaArray);
  // Sort the meta array by the second index of each subarray
  metaArray.sort(function (a, b) {
    const nameA = a[1].title.toUpperCase(); // Ignore case
    const nameB = b[1].title.toUpperCase(); // Ignore case
    if (nameA < nameB) {
      return 1;
    }
    if (nameA > nameB) {
      return -1;
    }

    // Names must be equal
    return 0;
  });

  // Loop through sorted metaArray and add each layer to the map
  for (let layer of metaArray) {
    if (layer[2].includes("FLDTYPCD")) {
      var visible = true;
    } else {
      var visible = false;
    }

    Map.addLayer(layer[0], layer[1], layer[2], visible);

    Map.addExport(
      layer[0].float(),
      layer[2],
      [30, 0, -2361915, 0, -30, 3177735],
      false,
      {},
      -32768
    );
    if (layer.length === 4 && typeof layer[3] === "object") {
      areaChart.addLayer(layer[0], layer[3], layer[2].split(": ")[1], visible);
    }
  }
  ////

  // Function to convert json TreeMap lookup to a query-friendly format
  // Makes a dictionary for each CN that has an html table of all attributes
  function makeTreeMapQueryLookup() {
    let values = treeMapLookup.Value;
    let keys = Object.keys(treeMapLookup).filter((k) => k !== "Value");
    let queryDict = {};

    for (let i = 0; i < values.length; i++) {
      let value = treeMapLookup.Value[i];
      let t = "<ul>";
      keys.map((k) => {
        let v = treeMapLookup[k][i];
        if (!!(v % 1)) {
          v = v.toFixed(4);
        }
        t += `<tr><th>${k}</th><td>${v}</td></tr>`;
      });
      t += "</ul>";
      queryDict[value] = t;
    }
    return queryDict;
  }
  rawQueryDict = makeTreeMapQueryLookup();

  // Bring in raw TreeMap layer and add it to the map
  rawTreeMap = attrStack.select("Value"); // attrC.filter(ee.Filter.eq("attribute", "Value")).first(); //ee.Image('projects/lcms-292214/assets/CONUS-Ancillary-Data/TreeMap_RDS_2016');
  Object.keys(chartLayerDict).map((k) => {
    const chartLayerTObj = chartLayerDict[k];
    const attrsBandNames = Object.keys(chartLayerDict[k].bandNames);
    const attrsLongNames = Object.values(chartLayerDict[k].bandNames);
    const reducer =
      chartLayerTObj.scalar === undefined
        ? ee.Reducer.mean()
        : ee.Reducer.sum();
    const reducerString =
      chartLayerTObj.scalar === undefined ? "Mean" : "Total";
    const scalar =
      chartLayerTObj.scalar === undefined ? 1 : chartLayerTObj.scalar;
    // console.log(`${k}-${scalar}`);
    let attrStackT = attrStack
      .select(attrsBandNames, attrsLongNames)
      .multiply(scalar);
    areaChart.addLayer(
      attrStackT,
      {
        palette: chartLayerTObj.palette,
        eeObjInfo: {
          bandNames: attrsLongNames,
        },
        chartDecimalProportion: 0.005,
        chartPrecision: 3,
        chartLabelMaxWidth: 400,
        chartLabelFontSize: 10,
        minZoomSpecifiedScale: 4,
        reducer: reducer,
        reducerString: reducerString,
      },
      k.replaceAll("_", " "),
      chartLayerTObj.visible
    );
    // console.log(attrStackT.bandNames().getInfo());
  });

  Map.addLayer(
    rawTreeMap.randomVisualizer(),
    {
      queryDict: rawQueryDict,
      addToLegend: false,
      opacity: 0,
      title: `Raw TreeMap Identifier dataset values. This dataset is useful to see spatial groupings of individual modeled plot values. When queried, all attributes are provided for the queried pixel.`,
    },
    "TreeMap ID"
  );
  Map.addExport(
    rawTreeMap.int32(),
    "TreeMap ID",
    [30, 0, -2361915, 0, -30, 3177735],
    false,
    {},
    0
  );
  queryWindowMode = "sidePane";

  getLCMSVariables();
  getSelectLayers(true);
  areaChart.populateChartLayerSelect();
  // Map.turnOnAutoAreaCharting();
  // Map.turnOnInspector();
  urlParams.activeTool = urlParams.activeTool || "Pixel_Query";
  $(".export-res-input").hide();
  $(".export-res-input-label").hide();
}
