function ingestStormTrack() {
  if (jQuery("#stormTrackUpload")[0].files.length > 0) {
    const fr = new FileReader();
    fr.onload = function () {
      let rows = fr.result.split("\n");
      rows = rows.filter((row) => row.split("\t").length > 5);
      rows = rows.map(function (row) {
        row = row.split("\t");
        const out = {};
        out.type = "Feature";
        out.geometry = {};
        out.geometry.type = "Point";
        out.geometry.coordinates = [parseFloat(row[3]), parseFloat(row[2])];

        out.properties = {};
        out.properties.lat = parseFloat(row[2]);
        out.properties.lon = parseFloat(row[3]);
        out.properties.wspd = parseFloat(row[4]);
        out.properties.pres = parseFloat(row[5]);
        out.properties.category = row[6];
        out.properties.date = new Date(row[0] + " " + row[1]).getTime();
        out.properties.year = new Date(row[0] + " " + row[1]).getFullYear();
        return out;
      });

      let iterations = refinementIterations;
      const initialN = rows.length;
      while (iterations > 0 && rows.length * 2 < 1500) {
        console.log("Refining");
        console.log(refinementIterations);
        rows = refineFeatures(rows, [
          "lat",
          "lon",
          "wspd",
          "pres",
          "date",
          "year",
        ]);
        console.log(rows.length);
        iterations--;
      }
      setTimeout(function () {
        showMessage(
          "Track ingestion finished",
          "Refined " +
            (refinementIterations - iterations).toString() +
            "/" +
            refinementIterations.toString() +
            " iterations.<br>Total number of raw track points is: " +
            initialN.toString() +
            "<br>Total number of refined track points is: " +
            rows.length.toString()
        );
      }, 1000);

      const rowsLeft = rows.slice(0, rows.length - 1);
      const rowsRight = rows.slice(1);
      let zipped = range(0, rowsLeft.length).map(function (i) {
        const out = {};
        out.type = "Feature";
        out.geometry = rowsLeft[i].geometry;

        out.properties = {};

        out.properties.current = rowsLeft[i].properties;
        out.properties.future = rowsRight[i].properties;

        return out;
      });

      $("#summary-spinner").slideUp();

      createHurricaneDamageWrapper(ee.FeatureCollection(zipped));
    };

    fr.readAsText(jQuery("#stormTrackUpload")[0].files[0]);
  } else {
    $("#summary-spinner").hide();
    showMessage(
      "No storm track provided",
      'Please download storm track from <a href="https://www.wunderground.com/hurricane" target="_blank">here</a> . Copy and paste the storm track coordinates into a text editor. Save the table. Then upload that table above.'
    );
  }
}

function refineFeatures(features, interpProps) {
  const left = features.slice(0, features.length - 1);
  const right = features.slice(1, features.length);
  let f = [left[0]];
  left.forEach(function (fl, i) {
    const fr = right[i];
    const coordsL = fl.geometry.coordinates;
    const coordsR = fr.geometry.coordinates;

    const fm = JSON.parse(JSON.stringify(fl));
    fm.geometry.coordinates = [
      (coordsL[0] + coordsR[0]) / 2.0,
      (coordsL[1] + coordsR[1]) / 2.0,
    ];

    interpProps.map(function (prop) {
      let lProp = fl.properties[prop];
      let rProp = fr.properties[prop];
      let m = (rProp + lProp) / 2.0;
      fm.properties[prop] = m;
    });
    f.push([fm, fr]);
  });
  f = f.flat();
  // console.log(f);
  // console.log(left);
  return f;
}

////////////////////////////////////////////////////////////////////////////////
//Function for converting line from storm track table to an object
function trackLineToObject(line) {
  const fields = line.split(",");
  const wspd = fields[4].split("m")[0];
  const pres = fields[5].split("m")[0];
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
  const V = y2.subtract(y1).multiply(111).multiply(1000).divide(dt);

  // U = (x2-x1) * math.cos(y1*math.pi/180.) * 111. *1000/ float(dt)
  const U = x2
    .subtract(x1)
    .multiply(y1.multiply(Math.PI / 180).cos())
    .multiply(111 * 1000)
    .divide(dt);
  let out = ee.Dictionary({});
  out = out.set("U", U);
  out = out.set("V", V);
  return ee.Dictionary(out);
}
////////////////////////////////////////////////////////////////////////////////
function getCoordGrid(lng, lat) {
  const crs = "EPSG:5070";
  // var transform = null;//[30,0,-2361915.0,0,-30,3177735.0];
  // var scale = 30;
  const pt = ee.FeatureCollection([ee.Feature(ee.Geometry.Point([lng, lat]))]);
  // Map.addLayer(pt)
  const proj = ee.Projection(crs);

  let coords = ee.Image.pixelCoordinates(proj).float();
  const ptValues = ee.Image.constant(
    ee.List(
      ee
        .Dictionary(coords.reduceRegion(ee.Reducer.first(), pt, 1, crs))
        .values()
    )
  );
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
  const current = ee.Dictionary(row.get("current"));
  const future = ee.Dictionary(row.get("future"));

  const currentDate = ee.Date(current.get("date"));
  const futureDate = ee.Date(future.get("date"));

  const tDiff = futureDate.difference(currentDate, "second");

  const CurrentLat = ee.Number(current.get("lat")).float();
  const CurrentLon = ee.Number(current.get("lon")).float();
  const FutureLat = ee.Number(future.get("lat")).float();
  const FutureLon = ee.Number(future.get("lon")).float();

  const MaxWind = ee.Number(current.get("wspd")).float();
  const CentralPressure = ee.Number(current.get("pres")).float();
  const FutureMaxWind = ee.Number(future.get("wspd")).float();
  const FutureCentralPressure = ee.Number(future.get("pres")).float();

  const HurricaneMotion = ee.Dictionary(
    CalcStormMotion(CurrentLat, FutureLat, CurrentLon, FutureLon, tDiff)
  );
  const HurricaneMotionU = ee.Number(HurricaneMotion.get("U")).float();
  const HurricaneMotionV = ee.Number(HurricaneMotion.get("V")).float();

  const Lat = CurrentLat;
  const Lon = CurrentLon;
  const Wind = MaxWind;
  const Pressure = CentralPressure;

  //Not needed in GEE
  //var xc, yc = convert2grid(Lat,Lon,topo_info)

  // Pc   = Pressure * 100.
  const Pc = ee.Number(Pressure.multiply(100));

  //  Pe = 1013. *100.
  let Pe = ee.Number(101300).float();

  //  if Pe <= Pc:Pe = Pc * 1.05
  Pe = ee.Number(ee.Algorithms.If(Pe.lte(Pc), Pc.multiply(1.05), Pe));

  //deltaP = (Pe-Pc)/100.
  const deltaP = Pe.subtract(Pc).divide(100);
  // deltaP = 49;
  //  Rmax  = ( math.exp(2.636-0.00005086*deltaP**2+0.037842*28.)) * 1000.
  const Rmax = ee
    .Number(2.636)
    .subtract(ee.Number(0.00005086).multiply(deltaP.pow(2)))
    .add(0.037842 * 28)
    .exp()
    .multiply(1000);

  //  HSpd = math.sqrt( HurricaneMotionU**2+HurricaneMotionV**2 )
  const HSpd = HurricaneMotionU.hypot(HurricaneMotionV);

  //  HDir = math.atan2( HurricaneMotionV, HurricaneMotionU )
  const HDir = HurricaneMotionU.atan2(HurricaneMotionV);

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
  const xyGrid = getCoordGrid(Lon, Lat);

  // Map.addLayer(xyGrid)
  //Set up some constants
  const umin = 1000;
  let r = -1;
  const r0 = 1200 * 1000;
  const a = 0.25;
  const m = 1.6;
  const n = 0.9;

  //No need to iterate here
  //         for py,px in pts:
  //             if 0<xc+px<nx and 0<yc+py<ny:

  //Convert to radius
  //                 r = math.sqrt( py**2+px**2 ) * 30.
  r = xyGrid.pow(2).reduce(ee.Reducer.sum()).sqrt();
  // Map.addLayer(r,{min:0,max:1000})

  function calcVholland(r) {
    //  f1 = (Wind-HSpd)**2
    const f1 = ee.Image(Wind.subtract(HSpd)).pow(2);

    //  f2 = ((r0-r)/(r0-Rmax))**2
    const f2 = ee
      .Image(r0)
      .subtract(r)
      .divide(ee.Image(ee.Number(r0).subtract(Rmax)))
      .pow(2);

    //  f3 = (r/Rmax)**2
    const f3 = r.divide(ee.Image(Rmax)).pow(2);

    // t1n = (1.-a)*(n+m)
    const t1n = ee.Image((1 - a) * (n + m));

    //  t1d = n+  m*     (r/Rmax)**(2.*(n+m))
    const t1d = ee
      .Image(n)
      .add(ee.Image(m).multiply(r.divide(Rmax).pow(2 * (n + m))));

    //   t2n = a*(1.+2.*m)
    const t2n = ee.Image(a * (1 + 2 * m));

    //  t2d = 1.+2.*m*(r/Rmax)**(2.*(m+1.))
    const t2d = ee
      .Image(1)
      .add(ee.Image(2 * m).multiply(r.divide(Rmax).pow(2 * (m + 1))));

    // Vholland=math.sqrt(f1*f2*f3*(t1n/t1d+t2n/t2d))
    const Vholland = f1
      .multiply(f2)
      .multiply(f3)
      .multiply(t1n.divide(t1d).add(t2n.divide(t2d)))
      .sqrt();

    return Vholland;
  }
  //   //                 if r > 0:
  //     //                 else:
  // //                     Vholland = 0.

  const vHolland = ee.Image(0).where(r.gt(0), calcVholland(r));

  // Beta = -HDir - math.atan2(py,px)
  const Beta = ee
    .Image(HDir.multiply(-1))
    .subtract(xyGrid.select(["x"]).atan2(xyGrid.select(["y"])));
  const rotation = ee.Image(HSpd).multiply(Beta.multiply(-1).sin());

  const u = vHolland.add(rotation).set({
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
    const Z = 1.3;

    // b = 2.*CrownDepth/Hgt
    const b = CrownDepth.divide(Hgt).multiply(2);

    // l = b*CrownDepth/Spacing*0.5
    const l = b.multiply(CrownDepth).divide(Spacing).multiply(0.5);

    // G35 = (1.-math.exp(-math.sqrt(15*l)))/math.sqrt(15*l)
    const G35 = ee
      .Image(1)
      .subtract(l.multiply(15).sqrt().multiply(-1).exp())
      .divide(l.multiply(15).sqrt());

    // D = Hgt*(1.-G35)
    const D = Hgt.multiply(ee.Image(1).subtract(G35));

    //UstarRatio = min(0.3, math.sqrt(0.003+0.3*l))
    const UstarRatio = ee.Image.cat([
      ee.Image(0.3),
      l.multiply(0.3).add(0.003).sqrt(),
    ]).reduce(ee.Reducer.min());

    // PsiH = 0.193
    const PsiH = 0.193;

    // Z0H = G35*math.exp(-0.4/UstarRatio-PsiH)
    const Z0H = G35.multiply(
      ee.Image(-0.4).divide(UstarRatio).subtract(PsiH).exp()
    );

    // HD = Spacing / Hgt
    const HD = ee.Image(Spacing).divide(Hgt);

    // z0 = Z0H * Hgt
    const z0 = Z0H.multiply(Hgt);

    // BMmean = 0.68*HD-0.0385+(-0.68*HD+0.4785)*(1.7239*HD+0.0316)**(5)
    const BMmean = HD.multiply(0.68)
      .subtract(0.0385)
      .add(
        HD.multiply(-0.68)
          .add(0.4785)
          .multiply(HD.multiply(1.7239).add(0.0316).pow(5))
      );

    // BMmax  = 2.7193*HD-0.061+(1.273*HD+0.9701)*(1.1127*HD+0.0311)**5
    const BMmax = HD.multiply(2.7193)
      .subtract(0.061)
      .add(
        HD.multiply(1.273)
          .add(0.9701)
          .multiply(HD.multiply(1.1127).add(0.0311).pow(5))
      );

    // G = BMmax/BMmean
    const G = BMmax.divide(BMmean);

    // MOR = ModRupture*6894.757
    const MOR = ModRupture.multiply(6894.757);

    // Mcrit = 0.00358811*MOR
    const Mcrit = MOR.multiply(0.00358811);

    // try:

    //M =(Spacing.multiply(WindSpeed).multiply(0.4)).divide(((Hgt.subtract(D)).divide(z0)).log()).pow(2)
    const M = D.subtract(Z)
      .multiply(1.22)
      .multiply(1.226)
      .multiply(G)
      .multiply(
        Spacing.multiply(WindSpeed)
          .multiply(0.4)
          .divide(Hgt.subtract(D).divide(z0).log())
          .pow(2)
      );

    // except:
    //     print(Hgt,Spacing, WindSpeed)
    //     print(D, Z, G, Spacing, WindSpeed, Hgt, z0)
    // if M<0:
    //     print('Negative M: ', BMmax, BMmean, Hgt, Spacing, WindSpeed, CBH)

    // R = M/Mcrit - 1.
    const R = M.divide(Mcrit).subtract(1);

    // return ( int(100. * math.exp(R) / (math.exp(R)+1.) ) - 50) *2
    const out = R.exp()
      .multiply(100)
      .divide(R.exp().add(1))
      .int32()
      .subtract(50)
      .multiply(2);

    return out;
  }
  // if Spacing > 0  and Hgt > 0: #Hgt > 0 and Spacing > 0 and Hgt - CBH>0:
  // else:
  //     return 0
  let GALESOut = ee.Image(0).where(Spacing.gt(0).and(Hgt.gt(0)), GALESFun());
  GALESOut = GALESOut.updateMask(Hgt.mask().and(WindSpeed.mask()));

  return GALESOut;
}
