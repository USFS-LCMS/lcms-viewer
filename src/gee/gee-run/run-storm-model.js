////////////////////////////////////////////////////////////////////////////////
function createHurricaneDamageWrapper(rows) {
  console.log("Running storm model");

  // console.log(rows.getInfo())
  //Original Python implementation written by: Scott Goodrick
  //GEE implementation written by: Ian Housman and Robert Chastain
  //////////////////////////////////////////////////////////////
  // var palettes = require('users/gena/packages:palettes');
  let hgt_array = ee.Image(
    "projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/LANDFIRE/lf_evh_us_prvi_2020_2016"
  );
  hgt_array = hgt_array.updateMask(hgt_array.neq(-9999));

  var from = ee.List.sequence(101, 199).getInfo();
  var to = ee.List.sequence(1, 99).getInfo();
  hgt_array = hgt_array.remap(from, to);
  // var year = ee.Feature(rows.first()).get('year').getInfo();
  const year = ee
    .Dictionary(ee.Feature(rows.first()).get("current"))
    .get("year")
    .getInfo();

  // var wind = ee.ImageCollection(rows.map(createHurricaneWindFields)).max();
  // wind = wind.updateMask(wind.gte(30))  ;//(ee.Feature(rows.first()))
  // Map.addLayer(wind,{min:30,max:160,legendLabelLeftAfter:'mph',legendLabelRightAfter:'mph',palette:palettes.niccoli.isol[7]})
  //Define export params
  // var studyArea = geometry;
  // var name = rows[0].name;
  // var year = rows[0].year;
  // // console.log(rows[0]);

  //  if(name === undefined || name === null){
  name = $("#storm-name").val();
  if (name === "") {
    try {
      name = jQuery("#stormTrackUpload")[0]
        .files[0].name.split(".")
        .slice(0, -1)
        .join(".");
    } catch (err) {
      console.log(err);
      name = "Test";
    }
  }
  // }
  // console.log('name');
  // console.log(name);
  // console.log(jQuery('#stormTrackUpload')[0].files[0].name.split('.').slice(0, -1).join('.'))
  // if(year === undefined || year === null){
  //   var year = stormYear;//2018;
  // }
  // var driveFolder = 'GALES-Model-Outputs';
  // // var crs = 'EPSG:32616';

  //Define some other params
  const windThreshold = minWind;

  // // rows = rows.slice(108,160);
  // // var rows = JSON.parse($('#storm-track').val())
  // // rows = rows.slice(120,122);

  //   var left = rows.slice(0,rows.length-1);

  //   var right = rows.slice(1,rows.length);
  //   var paired = ee.List(left).zip(right).getInfo();
  //   // console.log(paired)
  let c = ee.ImageCollection(rows.map(createHurricaneWindFields));
  // var c = ee.ImageCollection("projects/lcms-292214/assets/Ancillary/storm-tracks/JC_20240109_1400_gust_alb84")
  //   }));
  //   // Map.addLayer(c)

  const speeds = [
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48,
    49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67,
    68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86,
    87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104,
    105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119,
    120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134,
    135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149,
    150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164,
    165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179,
    180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194,
    195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209,
    210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224,
    225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239,
    240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254,
    255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269,
    270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284,
    285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299,
    300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314,
    315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329,
    330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344,
    345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359,
    360, 361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374,
    375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389,
    390, 391, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404,
    405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419,
    420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434,
    435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449,
    450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464,
    465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479,
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494,
    495, 496, 497, 498, 499, 500,
  ];
  const categories = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
  ];

  //Set up MOD rupture image
  let modImage = eval($("#mod-image").val());
  let modLookup = $("#mod-lookup").val();
  modLookup = modLookup
    .replace(/\s+/g, "")
    .replace("{", "")
    .replace("}", "")
    .split(",")
    .map((i) => i.split(":").map((n) => parseInt(n)));
  var from = modLookup.map((n) => n[0]);
  var to = modLookup.map((n) => n[1]);
  modImage = modImage.remap(from, to);
  Map.addLayer(
    modImage,
    {
      min: to.min(),
      max: to.max(),
    },
    "MOD Image",
    false
  );
  // console.log(c.limit(2).getInfo())
  c = c.map(function (img) {
    const tDiff = ee
      .Image(ee.Number(img.get("tDiff")))
      .divide(60 * 60)
      .float();
    const cats = img.int16().remap(speeds, categories);
    const damage = GALES(
      img.multiply(0.447),
      hgt_array,
      hgt_array.multiply(0.33),
      5.0,
      modImage
    );
    const damageSum = damage.add(100).clamp(0, 200).multiply(tDiff);
    const windSum = img.multiply(tDiff);
    const catSum = cats.multiply(tDiff);
    const cat1Sum = cats.updateMask(cats.eq(1)).multiply(tDiff);
    const cat2Sum = cats.updateMask(cats.eq(2)).multiply(tDiff);
    const cat3Sum = cats.updateMask(cats.eq(3)).multiply(tDiff);
    const cat4Sum = cats.updateMask(cats.eq(4)).multiply(tDiff);
    const cat5Sum = cats.updateMask(cats.eq(5)).multiply(tDiff);
    return img
      .addBands(damage)
      .addBands(cats)
      .addBands(hgt_array)
      .addBands(damageSum)
      .addBands(windSum)
      .addBands(catSum)
      .addBands(cat1Sum)
      .addBands(cat2Sum)
      .addBands(cat3Sum)
      .addBands(cat4Sum)
      .addBands(cat5Sum)
      .rename([
        "Wind",
        "Damage",
        "Category",
        "Tree Height",
        "Damage_Sum",
        "Wind_Sum",
        "Cat_Sum",
        "Cat1_Sum",
        "Cat2_Sum",
        "Cat3_Sum",
        "Cat4_Sum",
        "Cat5_Sum",
      ])
      .updateMask(img.gte(windThreshold))
      .float();
  });

  // console.log(c.limit(2).getInfo())
  // c  = c.map(function(img){return img.set('system:time_start',ee.Date.fromYMD(ee.Number.parse(img.get('system:index')),6,1).millis())})

  pixelChartCollections["basic"] = {
    label: "Wind and Damage",
    collection: c.select(["Wind", "Damage", "Tree Height"]),
    chartColors: chartColorsDict.coreLossGain,
    tooltip: "Chart wind speed and damage acros time",
    xAxisLabel: "Time",
    yAxisLabel: "Wind Speed (mph) or Damage",
    simplifyDate: false,
  };
  populatePixelChartDropdown();

  const max = c.qualityMosaic("Wind");
  // wind_array = wind_array.updateMask(wind_array.gt(windThreshold));

  // Map.addLayer(hgt_array,{min:1,max:30,legendLabelLeftAfter:'m',legendLabelRightAfter:'m',palette:palettes.crameri.bamako[50].reverse()},'LANDFIRE 2020 Tree Height (m)',false);
  const trackRows = rows.map(function (f) {
    const current = ee.Dictionary(f.get("current"));
    const speed = ee.Number(current.get("wspd"));
    f = f.set(current);
    return f.buffer(speed.multiply(600));
  });
  Map.addLayer(
    trackRows,
    {},
    name + " " + year.toString() + " Storm Track",
    false
  );
  Map.addLayer(
    max.select([0]),
    {
      min: 30,
      max: 160,
      legendLabelLeftAfter: "mph",
      legendLabelRightAfter: "mph",
      palette: palettes.niccoli.isol[7],
    },
    name + " " + year.toString() + " Wind Max",
    false
  );
  //GALES Params
  //Wind speed in mps (Convert from mph to mps)
  //Height in meters
  //Crown height in meters (currently assumes top third of tree height is crown)
  //Tree spacing in meters (currently set to constant of 5m)
  //Modulus of rupture in mks (currently for Loblolly or Long Leaf Pine)
  //MMCrit[j,i] = GALES(0.447*wind_array[j,i], 0.1*hgt_array[j,i], 0.33*0.1*hgt_array[j,i], 5.0, ModRupture=8500.)

  // var wind_array = ee.Image(150);
  // var hgt_array = ee.Image(20);
  // var crown_hgt_array = hgt_array.multiply(0.33);
  // var spacing = 5;
  // var modRupture = 8500
  // GALES(wind_array.multiply(0.447), hgt_array, crown_hgt_array, spacing, modRupture);
  // var GALESOut = GALES(wind_array.multiply(0.447), hgt_array, hgt_array.multiply(0.33), 5.0, 8500);
  Map.addLayer(
    max.select([1]),
    {
      min: -100,
      max: 100,
      palette: palettes.niccoli.isol[7],
    },
    name + " " + year.toString() + " Damage Max",
    false
  );

  const damageSum = c.select(["Damage_Sum"]).sum().int16();
  Map.addLayer(
    damageSum,
    {
      min: 50,
      max: 500,
      palette: palettes.niccoli.isol[7],
    },
    name + " " + year.toString() + " Damage Sum",
    false
  );

  const windSum = c.select(["Wind_Sum"]).sum().int16();
  Map.addLayer(
    windSum,
    {
      min: 50,
      max: 500,
      palette: palettes.niccoli.isol[7],
    },
    name + " " + year.toString() + " Wind Sum",
    false
  );

  const catSum = c.select(["Cat_Sum"]).sum().int16();
  Map.addLayer(
    catSum,
    {
      min: 0,
      max: 10,
      palette: palettes.niccoli.isol[7],
    },
    name + " " + year.toString() + " Cat Sum",
    false
  );

  const cat1Sum = c.select(["Cat1_Sum"]).sum().int16();
  Map.addLayer(
    cat1Sum,
    {
      min: 0,
      max: 10,
      palette: palettes.niccoli.isol[7],
    },
    name + " " + year.toString() + " Cat 1 Sum",
    false
  );

  const cat2Sum = c.select(["Cat2_Sum"]).sum().int16();
  Map.addLayer(
    cat2Sum,
    {
      min: 0,
      max: 10,
      palette: palettes.niccoli.isol[7],
    },
    name + " " + year.toString() + " Cat 2 Sum",
    false
  );

  const cat3Sum = c.select(["Cat3_Sum"]).sum().int16();
  Map.addLayer(
    cat3Sum,
    {
      min: 0,
      max: 10,
      palette: palettes.niccoli.isol[7],
    },
    name + " " + year.toString() + " Cat 3 Sum",
    false
  );

  const cat4Sum = c.select(["Cat4_Sum"]).sum().int16();
  Map.addLayer(
    cat4Sum,
    {
      min: 0,
      max: 10,
      palette: palettes.niccoli.isol[7],
    },
    name + " " + year.toString() + " Cat 4 Sum",
    false
  );

  const cat5Sum = c.select(["Cat5_Sum"]).sum().int16();
  Map.addLayer(
    cat5Sum,
    {
      min: 0,
      max: 10,
      palette: palettes.niccoli.isol[7],
    },
    name + " " + year.toString() + " Cat 5 Sum",
    false
  );

  const windStack = ee.Image.cat([
    max.select([0]).rename(["Wind_Max"]),
    windSum,
    catSum,
    cat1Sum,
    cat2Sum,
    cat3Sum,
    cat4Sum,
    cat5Sum,
  ]).int16();
  const damageStack = ee.Image.cat([
    max.select([1]).rename(["Damage_Max"]),
    damageSum,
  ]).int16();

  //   // Map.addTimeLapse(cl.select([0]),{min:75,max:160,palette:palettes.niccoli.isol[7],years:years},'Wind Time Lapse')
  //   // Map.addTimeLapse(cl.select([1]),{min:-100,max:100,palette:palettes.niccoli.isol[7],years:years},'Damage Time Lapse')

  const trackBounds = trackRows.geometry().bounds();
  const trackBoundsFeatures = trackBounds.getInfo();
  const trackBoundsCoords = trackBoundsFeatures.coordinates[0];
  // console.log(trackBounds.getInfo())

  window.downloadQuickLooks = function () {
    $("#summary-spinner").slideDown();
    windStack
      .clip(trackBounds)
      .unmask(-32768, false)
      .int16()
      .getDownloadURL(
        {
          name: name + "_" + year.toString() + "_Wind_Quick_Look",
          scale: quickLookRes,
          crs: $("#export-crs").val(),
          region: trackBoundsCoords,
        },
        function (url1, failure1) {
          damageStack
            .clip(trackBounds)
            .unmask(-32768, false)
            .int16()
            .getDownloadURL(
              {
                name: name + "_" + year.toString() + "_Damage_Quick_Look",
                scale: quickLookRes,
                crs: $("#export-crs").val(),
                region: trackBoundsCoords,
              },
              function (url2, failure2) {
                $("#summary-spinner").slideUp();

                if (failure1 === undefined) {
                  var failure1Message = "";
                } else {
                  var failure1Message = `<p title = 'If there are errors, you may need to specify a larger "Quick look spatial resolution"'>Errors: ${failure1}</p>`;
                }
                if (failure2 === undefined) {
                  var failure2Message = "";
                } else {
                  var failure2Message = `<p title = 'If there are errors, you may need to specify a larger "Quick look spatial resolution"'>Errors: ${failure2}</p>`;
                }
                showMessage(
                  "Quick Look Outputs Ready",
                  `<hr>
                                  <a  target="_blank" href = '${url1}'>Click to download wind stack</a>
                                  ${failure1Message}
                                  <hr>
                                  <a  target="_blank" href = '${url2}'>Click to download damage stack</a>
                                  ${failure2Message}
                                  `
                );
              }
            );
        }
      );
  };
  Map.addExport(
    max.select([0]).int16(),
    name + "_" + year.toString() + "_Wind_Max",
    30,
    true,
    {}
  );

  Map.addExport(
    windSum,
    name + "_" + year.toString() + "_Wind_Sum",
    30,
    true,
    {}
  );

  Map.addExport(
    catSum,
    name + "_" + year.toString() + "_Cat_Sum",
    30,
    true,
    {}
  );
  Map.addExport(
    cat1Sum,
    name + "_" + year.toString() + "_Cat1_Sum",
    30,
    true,
    {}
  );
  Map.addExport(
    cat2Sum,
    name + "_" + year.toString() + "_Cat2_Sum",
    30,
    true,
    {}
  );
  Map.addExport(
    cat3Sum,
    name + "_" + year.toString() + "_Cat3_Sum",
    30,
    true,
    {}
  );
  Map.addExport(
    cat4Sum,
    name + "_" + year.toString() + "_Cat4_Sum",
    30,
    true,
    {}
  );
  Map.addExport(
    cat5Sum,
    name + "_" + year.toString() + "_Cat5_Sum",
    30,
    true,
    {}
  );

  Map.addExport(
    max.select([1]).int16(),
    name + "_" + year.toString() + "_Damage_Max",
    30,
    true,
    {}
  );
  Map.addExport(
    damageSum,
    name + "_" + year.toString() + "_Damage_Sum",
    30,
    true,
    {}
  );

  // Map.addExport(damageStack,name + '_'+year.toString()+'_Damage_Stack_'+modRupture.toString() ,30,true,{});
  // Map.addExport(damageSum.int16(),name + '_'+year.toString()+'_Damage_Sum_'+modRupture.toString() ,30,true,{});
  Map.addLayer(
    ee.FeatureCollection(
      "projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Boundaries"
    ),
    {},
    "U.S. Forest Service Boundaries",
    false
  );
  // exportArea = null;

  window.addTrackBounds = function () {
    try {
      exportArea.setMap(null);
    } catch (err) {
      console.log(err);
    }
    exportArea = new google.maps.Polygon(exportAreaPolygonOptions);

    trackBoundsCoords.map(function (coords) {
      const path = exportArea.getPath();
      const out = {};
      out.lng = function () {
        return coords[0];
      };
      out.lat = function () {
        return coords[1];
      };
      path.push(out);
    });
    exportArea.setMap(map);
    synchronousCenterObject(trackBoundsFeatures);
  };
  // exportArea = new google.maps.Data({fillOpacity: 0,strokeColor:'#FF0'});
  // exportArea.addGeoJson(ee.Feature(trackBounds).getInfo());
  // exportArea.setMap(map);

  //   // wind_array = wind_array.clip(studyArea).unmask(0,false).byte();
  //   // GALESOut = GALESOut.multiply(100).clip(studyArea).unmask(10001,false).int16();

  //   // var outRegion = studyArea.bounds();//.transform('EPSG:4326', 100);
  //   // print('Exporting:',outRegion);
  //   // Export.image.toDrive(wind_array, name + '-wind', driveFolder, name + '-wind', null, outRegion, scale, crs, transform, 1e13);
  //   // Export.image.toDrive(GALESOut, name + '-GALES', driveFolder, name + '-GALES', null, outRegion, scale, crs, transform, 1e13);
}
///////////////////////////////////////////////////////////
function runStorm() {
  const x = 0; //console.log('here')
  // Map.addExport(ee.Image(1).int16(),'test' ,30,true,{});
  // rows = ee.FeatureCollection(rows.features);

  // createHurricaneDamageWrapper(rows);
  // addExport(ee.Image(1).byte(),'test',30,true,{} )
  // createHurricaneDamageWrapper(rows,true);
  // fetch(".geojson/michael-2018.txt")
  // .then((resp) => console.log(resp.json())) // Transform the data into json
  // .then(function(json) {
  //   console.log(json)

  //   });
}
