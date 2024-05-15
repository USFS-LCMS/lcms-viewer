////////////////////////////////////////////////////////////////////////////////
//Function for converting line from storm track table to an object
function trackLineToObject(line) {
  var fields = line.split(",");
  var wspd = fields[4].split("m")[0];
  var pres = fields[5].split("m")[0];
  return {
    date: fields[0] + ":" + fields[1],
    lat: parseFloat(fields[2]),
    lon: parseFloat(fields[3]),
    wspd: parseFloat(wspd),
    pres: parseFloat(pres),
    FO: fields[fields.length - 1],
  };
}
////////////////////////////////////////////////////////////////////////////////
function CalcStormMotion(y1, y2, x1, x2, dt) {
  y1 = ee.Number(y1).float();
  y2 = ee.Number(y2).float();
  x1 = ee.Number(x1).float();
  x2 = ee.Number(x2).float();
  dt = ee.Number(dt).float();
  //return storm velocity components in meters per second
  // V = (y2-y1) * 111. *1000/ float(dt)
  var V = y2.subtract(y1).multiply(111).multiply(1000).divide(dt);

  // U = (x2-x1) * math.cos(y1*math.pi/180.) * 111. *1000/ float(dt)
  var U = x2
    .subtract(x1)
    .multiply(y1.multiply(Math.PI / 180).cos())
    .multiply(111 * 1000)
    .divide(dt);
  var out = ee.Dictionary({});
  out = out.set("U", U);
  out = out.set("V", V);
  return ee.Dictionary(out);
}
////////////////////////////////////////////////////////////////////////////////
function getCoordGrid(lng, lat) {
  var crs = "EPSG:5070";
  // var transform = null;//[30,0,-2361915.0,0,-30,3177735.0];
  // var scale = 30;
  var pt = ee.FeatureCollection([ee.Feature(ee.Geometry.Point([lng, lat]))]);
  // Map.addLayer(pt)
  var proj = ee.Projection(crs);

  var coords = ee.Image.pixelCoordinates(proj).float();
  var ptValues = ee.Image.constant(ee.List(ee.Dictionary(coords.reduceRegion(ee.Reducer.first(), pt, 1, crs)).values()));
  coords = coords.subtract(ptValues);
  coords = coords.updateMask(
    coords
      .abs()
      .reduce(ee.Reducer.max())
      .lte(maxDistance * 1000)
  );
  return coords.multiply(ee.Image([1, -1])); //.reproject(crs,null,1);
}
////////////////////////////////////////////////////////////////////////////////
//Function for creating wind fields from a pair of rows from a storm track table
function createHurricaneWindFields(row) {
  row = ee.Feature(row);
  // print(current)
  // print(future)
  // console.log(row.getInfo())
  var current = ee.Dictionary(row.get("current"));
  var future = ee.Dictionary(row.get("future"));

  var currentDate = ee.Date(current.get("date"));
  var futureDate = ee.Date(future.get("date"));

  var tDiff = futureDate.difference(currentDate, "second");

  var CurrentLat = ee.Number(current.get("lat")).float();
  var CurrentLon = ee.Number(current.get("lon")).float();
  var FutureLat = ee.Number(future.get("lat")).float();
  var FutureLon = ee.Number(future.get("lon")).float();

  var MaxWind = ee.Number(current.get("wspd")).float();
  var CentralPressure = ee.Number(current.get("pres")).float();
  var FutureMaxWind = ee.Number(future.get("wspd")).float();
  var FutureCentralPressure = ee.Number(future.get("pres")).float();

  var HurricaneMotion = ee.Dictionary(CalcStormMotion(CurrentLat, FutureLat, CurrentLon, FutureLon, tDiff));
  var HurricaneMotionU = ee.Number(HurricaneMotion.get("U")).float();
  var HurricaneMotionV = ee.Number(HurricaneMotion.get("V")).float();

  var Lat = CurrentLat;
  var Lon = CurrentLon;
  var Wind = MaxWind;
  var Pressure = CentralPressure;

  //Not needed in GEE
  //var xc, yc = convert2grid(Lat,Lon,topo_info)

  // Pc   = Pressure * 100.
  var Pc = ee.Number(Pressure.multiply(100));

  //  Pe = 1013. *100.
  var Pe = ee.Number(101300).float();

  //  if Pe <= Pc:Pe = Pc * 1.05
  Pe = ee.Number(ee.Algorithms.If(Pe.lte(Pc), Pc.multiply(1.05), Pe));

  //deltaP = (Pe-Pc)/100.
  var deltaP = Pe.subtract(Pc).divide(100);
  // deltaP = 49;
  //  Rmax  = ( math.exp(2.636-0.00005086*deltaP**2+0.037842*28.)) * 1000.
  var Rmax = ee
    .Number(2.636)
    .subtract(ee.Number(0.00005086).multiply(deltaP.pow(2)))
    .add(0.037842 * 28)
    .exp()
    .multiply(1000);

  //  HSpd = math.sqrt( HurricaneMotionU**2+HurricaneMotionV**2 )
  var HSpd = HurricaneMotionU.hypot(HurricaneMotionV);

  //  HDir = math.atan2( HurricaneMotionV, HurricaneMotionU )
  var HDir = HurricaneMotionU.atan2(HurricaneMotionV);

  //This is replaced by the getCoordGrid function
  //     for d in range(1,5000):
  //         pts = []
  //         for x in (-d, d):
  //             for y in range(-d,d+1):
  //                 pts.append( (y,x) )
  //         for y in (-d,d):
  //             for x in range(-d+1,d):
  //                 pts.append( (y,x) )
  // var xyGrid =ee.Image([31579.875,-6701.25]).rename(['x','y']).float();// getCoordGrid(Lon,Lat);// ;
  var xyGrid = getCoordGrid(Lon, Lat);

  // Map.addLayer(xyGrid)
  //Set up some constants
  var umin = 1000;
  var r = -1;
  var r0 = 1200 * 1000;
  var a = 0.25;
  var m = 1.6;
  var n = 0.9;

  //No need to iterate here
  //         for py,px in pts:
  //             if 0<xc+px<nx and 0<yc+py<ny:

  //Convert to radius
  //                 r = math.sqrt( py**2+px**2 ) * 30.
  r = xyGrid.pow(2).reduce(ee.Reducer.sum()).sqrt();
  // Map.addLayer(r,{min:0,max:1000})

  function calcVholland(r) {
    //  f1 = (Wind-HSpd)**2
    var f1 = ee.Image(Wind.subtract(HSpd)).pow(2);

    //  f2 = ((r0-r)/(r0-Rmax))**2
    var f2 = ee
      .Image(r0)
      .subtract(r)
      .divide(ee.Image(ee.Number(r0).subtract(Rmax)))
      .pow(2);

    //  f3 = (r/Rmax)**2
    var f3 = r.divide(ee.Image(Rmax)).pow(2);

    // t1n = (1.-a)*(n+m)
    var t1n = ee.Image((1 - a) * (n + m));

    //  t1d = n+  m*     (r/Rmax)**(2.*(n+m))
    var t1d = ee.Image(n).add(ee.Image(m).multiply(r.divide(Rmax).pow(2 * (n + m))));

    //   t2n = a*(1.+2.*m)
    var t2n = ee.Image(a * (1 + 2 * m));

    //  t2d = 1.+2.*m*(r/Rmax)**(2.*(m+1.))
    var t2d = ee.Image(1).add(ee.Image(2 * m).multiply(r.divide(Rmax).pow(2 * (m + 1))));

    // Vholland=math.sqrt(f1*f2*f3*(t1n/t1d+t2n/t2d))
    var Vholland = f1
      .multiply(f2)
      .multiply(f3)
      .multiply(t1n.divide(t1d).add(t2n.divide(t2d)))
      .sqrt();

    return Vholland;
  }
  //   //                 if r > 0:
  //     //                 else:
  // //                     Vholland = 0.

  var vHolland = ee.Image(0).where(r.gt(0), calcVholland(r));

  // Beta = -HDir - math.atan2(py,px)
  var Beta = ee.Image(HDir.multiply(-1)).subtract(xyGrid.select(["x"]).atan2(xyGrid.select(["y"])));
  var rotation = ee.Image(HSpd).multiply(Beta.multiply(-1).sin());

  var u = vHolland.add(rotation).set({
    "system:time_start": currentDate.millis(),
    tDiff: tDiff,
  }); // 0.44704

  // u = u.updateMask(u.gte(windThreshold))
  // var uWrong = vHolland.add(rotationWrong);// 0.44704
  // uWrong = uWrong.updateMask(uWrong.gte(windThreshold))
  // Map.addLayer(u,{min:150,max:160,palette:palettes.cmocean.Speed[7]},'Max Wind');
  // Map.addLayer(uWrong,{min:150,max:160,palette:palettes.cmocean.Speed[7]},'Max Wind Wrong');

  // Map.addLayer(u,{min:0,max:100});
  return u;
  // // umin = min(umin,u)
  // // umin = ee.Image.cat([ee.Image(umin),u]).reduce(ee.Reducer.min());
}
////////////////////////////////////////////////////////////////////////////////
function GALES(WindSpeed, Hgt, CrownDepth, Spacing, ModRupture) {
  if (ModRupture === undefined || ModRupture === null) {
    ModRupture = ee.Image(8500);
  }
  Spacing = ee.Image(Spacing);
  function GALESFun() {
    // Z = 1.3;
    var Z = 1.3;

    // b = 2.*CrownDepth/Hgt
    var b = CrownDepth.divide(Hgt).multiply(2);

    // l = b*CrownDepth/Spacing*0.5
    var l = b.multiply(CrownDepth).divide(Spacing).multiply(0.5);

    // G35 = (1.-math.exp(-math.sqrt(15*l)))/math.sqrt(15*l)
    var G35 = ee.Image(1).subtract(l.multiply(15).sqrt().multiply(-1).exp()).divide(l.multiply(15).sqrt());

    // D = Hgt*(1.-G35)
    var D = Hgt.multiply(ee.Image(1).subtract(G35));

    //UstarRatio = min(0.3, math.sqrt(0.003+0.3*l))
    var UstarRatio = ee.Image.cat([ee.Image(0.3), l.multiply(0.3).add(0.003).sqrt()]).reduce(ee.Reducer.min());

    // PsiH = 0.193
    var PsiH = 0.193;

    // Z0H = G35*math.exp(-0.4/UstarRatio-PsiH)
    var Z0H = G35.multiply(ee.Image(-0.4).divide(UstarRatio).subtract(PsiH).exp());

    // HD = Spacing / Hgt
    var HD = ee.Image(Spacing).divide(Hgt);

    // z0 = Z0H * Hgt
    var z0 = Z0H.multiply(Hgt);

    // BMmean = 0.68*HD-0.0385+(-0.68*HD+0.4785)*(1.7239*HD+0.0316)**(5)
    var BMmean = HD.multiply(0.68)
      .subtract(0.0385)
      .add(HD.multiply(-0.68).add(0.4785).multiply(HD.multiply(1.7239).add(0.0316).pow(5)));

    // BMmax  = 2.7193*HD-0.061+(1.273*HD+0.9701)*(1.1127*HD+0.0311)**5
    var BMmax = HD.multiply(2.7193)
      .subtract(0.061)
      .add(HD.multiply(1.273).add(0.9701).multiply(HD.multiply(1.1127).add(0.0311).pow(5)));

    // G = BMmax/BMmean
    var G = BMmax.divide(BMmean);

    // MOR = ModRupture*6894.757
    var MOR = ModRupture.multiply(6894.757);

    // Mcrit = 0.00358811*MOR
    var Mcrit = MOR.multiply(0.00358811);

    // try:

    //M =(Spacing.multiply(WindSpeed).multiply(0.4)).divide(((Hgt.subtract(D)).divide(z0)).log()).pow(2)
    var M = D.subtract(Z)
      .multiply(1.22)
      .multiply(1.226)
      .multiply(G)
      .multiply(Spacing.multiply(WindSpeed).multiply(0.4).divide(Hgt.subtract(D).divide(z0).log()).pow(2));

    // except:
    //     print(Hgt,Spacing, WindSpeed)
    //     print(D, Z, G, Spacing, WindSpeed, Hgt, z0)
    // if M<0:
    //     print('Negative M: ', BMmax, BMmean, Hgt, Spacing, WindSpeed, CBH)

    // R = M/Mcrit - 1.
    var R = M.divide(Mcrit).subtract(1);

    // return ( int(100. * math.exp(R) / (math.exp(R)+1.) ) - 50) *2
    var out = R.exp().multiply(100).divide(R.exp().add(1)).int32().subtract(50).multiply(2);

    return out;
  }
  // if Spacing > 0  and Hgt > 0: #Hgt > 0 and Spacing > 0 and Hgt - CBH>0:
  // else:
  //     return 0
  var GALESOut = ee.Image(0).where(Spacing.gt(0).and(Hgt.gt(0)), GALESFun());
  GALESOut = GALESOut.updateMask(Hgt.mask().and(WindSpeed.mask()));

  return GALESOut;
}

////////////////////////////////////////////////////////////////////////////////
function createHurricaneDamageWrapper(rows) {
  console.log("Running storm model");

  // console.log(rows.getInfo())
  //Original Python implementation written by: Scott Goodrick
  //GEE implementation written by: Ian Housman and Robert Chastain
  //////////////////////////////////////////////////////////////
  // var palettes = require('users/gena/packages:palettes');
  var hgt_array = ee.Image("projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/LANDFIRE/lf_evh_us_prvi_2020_2016");
  hgt_array = hgt_array.updateMask(hgt_array.neq(-9999));

  var from = ee.List.sequence(101, 199).getInfo();
  var to = ee.List.sequence(1, 99).getInfo();
  hgt_array = hgt_array.remap(from, to);
  // var year = ee.Feature(rows.first()).get('year').getInfo();
  var year = ee.Dictionary(ee.Feature(rows.first()).get("current")).get("year").getInfo();

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
      name = jQuery("#stormTrackUpload")[0].files[0].name.split(".").slice(0, -1).join(".");
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
  var windThreshold = minWind;

  // // rows = rows.slice(108,160);
  // // var rows = JSON.parse($('#storm-track').val())
  // // rows = rows.slice(120,122);

  //   var left = rows.slice(0,rows.length-1);

  //   var right = rows.slice(1,rows.length);
  //   var paired = ee.List(left).zip(right).getInfo();
  //   // console.log(paired)
  var c = ee.ImageCollection(rows.map(createHurricaneWindFields));
  // var c = ee.ImageCollection("projects/lcms-292214/assets/Ancillary/storm-tracks/JC_20240109_1400_gust_alb84")
  //   }));
  //   // Map.addLayer(c)

  var speeds = [
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65,
    66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101,
    102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130,
    131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159,
    160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188,
    189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217,
    218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246,
    247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275,
    276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304,
    305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333,
    334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362,
    363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391,
    392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420,
    421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449,
    450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478,
    479, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 496, 497, 498, 499, 500,
  ];
  var categories = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
  ];

  //Set up MOD rupture image
  var modImage = eval($("#mod-image").val());
  var modLookup = $("#mod-lookup").val();
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
      layerType: "geeImage",
      min: to.min(),
      max: to.max(),
    },
    "MOD Image",
    false
  );
  // console.log(c.limit(2).getInfo())
  c = c.map(function (img) {
    var tDiff = ee
      .Image(ee.Number(img.get("tDiff")))
      .divide(60 * 60)
      .float();
    var cats = img.int16().remap(speeds, categories);
    var damage = GALES(img.multiply(0.447), hgt_array, hgt_array.multiply(0.33), 5.0, modImage);
    var damageSum = damage.add(100).clamp(0, 200).multiply(tDiff);
    var windSum = img.multiply(tDiff);
    var catSum = cats.multiply(tDiff);
    var cat1Sum = cats.updateMask(cats.eq(1)).multiply(tDiff);
    var cat2Sum = cats.updateMask(cats.eq(2)).multiply(tDiff);
    var cat3Sum = cats.updateMask(cats.eq(3)).multiply(tDiff);
    var cat4Sum = cats.updateMask(cats.eq(4)).multiply(tDiff);
    var cat5Sum = cats.updateMask(cats.eq(5)).multiply(tDiff);
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

  var max = c.qualityMosaic("Wind");
  // wind_array = wind_array.updateMask(wind_array.gt(windThreshold));

  // Map.addLayer(hgt_array,{min:1,max:30,legendLabelLeftAfter:'m',legendLabelRightAfter:'m',palette:palettes.crameri.bamako[50].reverse()},'LANDFIRE 2020 Tree Height (m)',false);
  var trackRows = rows.map(function (f) {
    var current = ee.Dictionary(f.get("current"));
    var speed = ee.Number(current.get("wspd"));
    f = f.set(current);
    return f.buffer(speed.multiply(600));
  });
  Map.addLayer(
    trackRows,
    {
      layerType: "geeVectorImage",
    },
    name + " " + year.toString() + " Storm Track",
    false
  );
  Map.addLayer(
    max.select([0]),
    {
      layerType: "geeImage",
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

  var damageSum = c.select(["Damage_Sum"]).sum().int16();
  Map.addLayer(
    damageSum,
    {
      layerType: "geeImage",
      min: 50,
      max: 500,
      palette: palettes.niccoli.isol[7],
    },
    name + " " + year.toString() + " Damage Sum",
    false
  );

  var windSum = c.select(["Wind_Sum"]).sum().int16();
  Map.addLayer(
    windSum,
    {
      layerType: "geeImage",
      min: 50,
      max: 500,
      palette: palettes.niccoli.isol[7],
    },
    name + " " + year.toString() + " Wind Sum",
    false
  );

  var catSum = c.select(["Cat_Sum"]).sum().int16();
  Map.addLayer(
    catSum,
    {
      layerType: "geeImage",
      min: 0,
      max: 10,
      palette: palettes.niccoli.isol[7],
    },
    name + " " + year.toString() + " Cat Sum",
    false
  );

  var cat1Sum = c.select(["Cat1_Sum"]).sum().int16();
  Map.addLayer(
    cat1Sum,
    {
      layerType: "geeImage",
      min: 0,
      max: 10,
      palette: palettes.niccoli.isol[7],
    },
    name + " " + year.toString() + " Cat 1 Sum",
    false
  );

  var cat2Sum = c.select(["Cat2_Sum"]).sum().int16();
  Map.addLayer(
    cat2Sum,
    {
      layerType: "geeImage",
      min: 0,
      max: 10,
      palette: palettes.niccoli.isol[7],
    },
    name + " " + year.toString() + " Cat 2 Sum",
    false
  );

  var cat3Sum = c.select(["Cat3_Sum"]).sum().int16();
  Map.addLayer(
    cat3Sum,
    {
      layerType: "geeImage",
      min: 0,
      max: 10,
      palette: palettes.niccoli.isol[7],
    },
    name + " " + year.toString() + " Cat 3 Sum",
    false
  );

  var cat4Sum = c.select(["Cat4_Sum"]).sum().int16();
  Map.addLayer(
    cat4Sum,
    {
      layerType: "geeImage",
      min: 0,
      max: 10,
      palette: palettes.niccoli.isol[7],
    },
    name + " " + year.toString() + " Cat 4 Sum",
    false
  );

  var cat5Sum = c.select(["Cat5_Sum"]).sum().int16();
  Map.addLayer(
    cat5Sum,
    {
      layerType: "geeImage",
      min: 0,
      max: 10,
      palette: palettes.niccoli.isol[7],
    },
    name + " " + year.toString() + " Cat 5 Sum",
    false
  );

  var windStack = ee.Image.cat([max.select([0]).rename(["Wind_Max"]), windSum, catSum, cat1Sum, cat2Sum, cat3Sum, cat4Sum, cat5Sum]).int16();
  var damageStack = ee.Image.cat([max.select([1]).rename(["Damage_Max"]), damageSum]).int16();

  //   // Map.addTimeLapse(cl.select([0]),{min:75,max:160,palette:palettes.niccoli.isol[7],years:years},'Wind Time Lapse')
  //   // Map.addTimeLapse(cl.select([1]),{min:-100,max:100,palette:palettes.niccoli.isol[7],years:years},'Damage Time Lapse')

  var trackBounds = trackRows.geometry().bounds();
  var trackBoundsFeatures = trackBounds.getInfo();
  var trackBoundsCoords = trackBoundsFeatures.coordinates[0];
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
  Map.addExport(max.select([0]).int16(), name + "_" + year.toString() + "_Wind_Max", 30, true, {});

  Map.addExport(windSum, name + "_" + year.toString() + "_Wind_Sum", 30, true, {});

  Map.addExport(catSum, name + "_" + year.toString() + "_Cat_Sum", 30, true, {});
  Map.addExport(cat1Sum, name + "_" + year.toString() + "_Cat1_Sum", 30, true, {});
  Map.addExport(cat2Sum, name + "_" + year.toString() + "_Cat2_Sum", 30, true, {});
  Map.addExport(cat3Sum, name + "_" + year.toString() + "_Cat3_Sum", 30, true, {});
  Map.addExport(cat4Sum, name + "_" + year.toString() + "_Cat4_Sum", 30, true, {});
  Map.addExport(cat5Sum, name + "_" + year.toString() + "_Cat5_Sum", 30, true, {});

  Map.addExport(max.select([1]).int16(), name + "_" + year.toString() + "_Damage_Max", 30, true, {});
  Map.addExport(damageSum, name + "_" + year.toString() + "_Damage_Sum", 30, true, {});

  // Map.addExport(damageStack,name + '_'+year.toString()+'_Damage_Stack_'+modRupture.toString() ,30,true,{});
  // Map.addExport(damageSum.int16(),name + '_'+year.toString()+'_Damage_Sum_'+modRupture.toString() ,30,true,{});
  Map.addLayer(
    ee.FeatureCollection("projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Boundaries"),
    {
      layerType: "geeVectorImage",
    },
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
      var path = exportArea.getPath();
      var out = {};
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
  var x = 0; //console.log('here')
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
