function runAlgal() {
  plotRadius = 5;
  queryWindowMode = "sidePane";
  // scale = 10;
  clickBoundsColor = "#0FF";
  transform = [10, 0, -2361915.0, 0, -10, 3177735.0];
  if (algalRunID === 1) {
    localStorage.showToolTipModal = "false";
    $("#query-label").click();
  }

  let ab = ee.ImageCollection("projects/gtac-algal-blooms/assets/outputs/HAB-RF-Images");
  //ab = ab.filter(ee.Filter.eq('studyAreaName',"WY-MT-CO-UT-ID2"))
  ab = ab.filter(ee.Filter.eq("studyAreaName", "WY-GYE"));
  // console.log(ab.first().getInfo())

  ab = ab.filter(ee.Filter.calendarRange(parseInt(urlParams.startYear), parseInt(urlParams.endYear), "year")).filter(ee.Filter.calendarRange(150, 300));

  // Add filter for asset whichModel property (WDEQ vs HCB)
  ab_wdeq = ab.filter(ee.Filter.eq("whichModel", "WDEQ"));
  ab_hcb = ab.filter(ee.Filter.eq("whichModel", "HCB"));

  let algalLegendDict = {
    "Algal Negative": "00D",
    "Algal Positive": "D00",
  };
  // Map.addTimeLapse(ab.select([0]),{'min':1,'max':2,'palette':'00D,D00','classLegendDict':algalLegendDict,'dateFormat':'YYMMdd','advanceInterval':'day'},'Algal Bloom Classification',true)

  // countC = ab.select([0])
  countC_hcb = ab_hcb.select([0]);
  countC_wdeq = ab_wdeq.select([0]);
  //  countNotC = countC.map(img=>img.updateMask(img.lt(25000)))
  //  countC = countC.map(img=>img.updateMask(img.gte(25000)))

  Map.addTimeLapse(
    countC_hcb,
    {
      min: 25000,
      max: 5000000,
      palette: palettes.matplotlib.plasma[7],
      dateFormat: "YYMMdd",
      advanceInterval: "day",
      dateField: "system:time_end",
      legendNumbersWithCommas: true,
    },
    "Cyanobacteria Count-Model 1",
    true,
    "cells/mL"
  );
  Map.addTimeLapse(
    ab_hcb.select([1]),
    {
      min: 200000000,
      max: 1000000000,
      palette: palettes.matplotlib.plasma[7],
      dateFormat: "YYMMdd",
      advanceInterval: "day",
      dateField: "system:time_end",
      legendNumbersWithCommas: true,
    },
    "Cyanobacteria Biovolume-Model 1",
    true,
    "µm3"
  );

  Map.addTimeLapse(
    countC_wdeq,
    {
      min: 1000,
      max: 5000,
      palette: palettes.matplotlib.plasma[7],
      dateFormat: "YYMMdd",
      advanceInterval: "day",
      dateField: "system:time_end",
      legendNumbersWithCommas: true,
    },
    "Cyanobacteria Cell Count-Model 2",
    true,
    "raw cell count"
  );
  Map.addTimeLapse(
    ab_wdeq.select([1]),
    {
      min: 2000000,
      max: 10000000,
      palette: palettes.matplotlib.plasma[7],
      dateFormat: "YYMMdd",
      advanceInterval: "day",
      dateField: "system:time_end",
      legendNumbersWithCommas: true,
    },
    "Cyanobacteria Density-Model 2",
    true,
    "cells/L"
  );

  setTimeout(() => {
    $("#Cyanobacteria-Count-1-name-span").click();
    setTimeout(() => {
      $("#Cyanobacteria-Count-1-forward-button>i").click();
      $("#Cyanobacteria-Count-1-forward-button>i").click();
      // $('#Cyanobacteria-Count--cells-mL--1-forward-button>i').click();
    }, 500);
  }, 5000);
  algalRunID++;
}
