
// var array = [["time", "NDVI", "LT_Fitted_NDVI", "Loss Probability", "Gain Probability"],
//             ["1985", 0.5614552605703048, 0.5475, 0, 0.0500],
//             ["1986", 0.5757255936675463, 0.548, 0.019999999552965164, 0.019999999552965164],
//             ["1987", 0.5762711864406779, 0.5485, 0.029999999329447746, 0.019999999552965164],
//             ["1988", 0.5856196783349101, 0.5489, 0, 0.019999999552965164],
//             ["1989", 0.5579150579150579, 0.5494, 0.03999999910593033, 0.029999999329447746],
//             ["1990", 0.5534084809447128, 0.5499, 0.019999999552965164, 0.10000000149011612]];

// var array2 = [["time", "Loss Probability"],
//             ["1985", 0],
//             ["1986", 0.23999999463558197],
//             ["1987", 0.05999999865889549],
//             ["1988", 0.05999999865889549],
//             ["1989", 0.10000000149011612],
//             ["1990", 0.10000000149011612],
//             ["1991", 0],
//             ["1992", 0.10000000149011612],
//             ["1993", 0.10000000149011612],
//              ["1994", 0.05999999865889549],
//              ["1995", 0.07000000029802322],
//              ["1996", 0.10999999940395355]];
// function startCharting(){
//     mapHammer = new Hammer(document.getElementById('map'));
//    // google.maps.event.addDomListener(mapDiv, 'click', function(event) {
//     mapHammer.on("doubletap", function(e) {
//     // google.maps.event.addDomListener(mapDiv,"dblclick", function (e) {
//             $('#summary-spinner').slideDown()
//             map.setOptions({draggableCursor:'progress'});
//             map.setOptions({cursor:'progress'});
            
//             print('Map was double clicked');
//             var x =e.center.x;//clientX;
//             var y = e.center.y;console.log(x);
//             center =point2LatLng(x,y);
//             var icT = ee.ImageCollection(chartCollection.filterBounds(pt));
//     var tryCount = 2;
//     // print(icT.getRegion(pt.buffer(plotRadius),plotScale))
//     try{var allValues = icT.getRegion(pt,null,'EPSG:5070',[30,0,-2361915.0,0,-30,3177735.0]).evaluate();
//         print(allValues)            $('#summary-spinner').slideUp()
// })}
// addChart2(array2,'chart-canvas')