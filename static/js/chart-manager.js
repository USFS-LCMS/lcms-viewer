var center;var globalChartValues;

var chartTextColor = '#FFF';
var cssClassNames = {
'headerRow': 'googleChartTable',
'tableRow': 'googleChartTable',
'oddTableRow': 'googleChartTable',
'selectedTableRow': 'googleChartTable',
'hoverTableRow': 'googleChartTable',
'headerCell': 'googleChartTable',
'tableCell': 'googleChartTable',
'rowNumberCell': 'googleChartTable'};

var expandedWidth = $(window).width()/3;
var expandedHeight = $(window).height()/2;
var chartOptions = {
  title: uriName,
  titleTextStyle: {
	color: chartTextColor
},
  pointSize: 3,
  legend: { position: 'bottom',textStyle:{color: chartTextColor,fontSize:'12'} },
  dataOpacity: 1,
 hAxis:{title:'Year',
 				titleTextStyle:{color: chartTextColor},
				textStyle:{color: chartTextColor}
			},
	vAxis:{textStyle:{color: chartTextColor},titleTextStyle:{color: chartTextColor}},
	legend: {
        textStyle: {
            color: chartTextColor
        }
    },

   // width: 800, 
   height:250,
   bar: {groupWidth: "100%"},
   explorer: {  actions: [] },
    chartArea: {left:'5%',top:'10%',width:'75%',height:'70%'},
    legendArea:{width:'20%'},
   backgroundColor: { fill: "#1B1716" }

};
var tableOptions = {
	// width: 800, 
   // height:350,
    'allowHtml': true,
    'cssClassNames': cssClassNames};

function updateProgress(pct) {
    var elem = document.getElementById("Bar"); 
    elem.style.width = pct + '%'; 
        
}
function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}
function downloadURI() {
	if(uri != null && uri != undefined){
	  var link = document.createElement("a");
	  link.download = uriName + '.png';
	  link.href = uri;
	  link.click();
	  // document.body.removeChild(link);
	    delete link;
}}


var  getQueryImages = function(lng,lat){
	var lngLat = [lng, lat];
	$('.gm-ui-hover-effect').show();
	var outDict = {};
	$('#summary-spinner').slideDown();
	$('#query-container').empty();
	infowindow.setMap(null);
	infowindow.setPosition({lng:lng,lat:lat});
	

	var queryContent =`<h6>Queried values for lng: ${lng.toFixed(3).toString()} lat: ${lat.toFixed(3).toString()}</h6>
						<table class="table table-hover bg-white">
					    <thead>
					      <tr>
					        <th>Layer Name</th>
					        <th>Value</th>
					      </tr>
					    </thead>
					    <tbody>`
	 

	var queryLine = '<h6>Queried values for lng: '+lng.toFixed(3).toString() + ' lat: '+lat.toFixed(3).toString()+ '</h6>';
	// queryContent += queryLine;
	$('#query-container').append(queryLine);
	var keys = Object.keys(queryObj);
	var keysToShow = [];
	keys.map(function(k){
		var q = queryObj[k];
		if(q[0]){keysToShow.push(k);}
	})

	var keyCount = keysToShow.length;
	var keyI = 1;
	
	keysToShow.map(function(k){
		var q = queryObj[k];
	

		if(q[0]){
			var img = ee.Image(q[1]);
			var value = ee.Feature(img.sampleRegions(ee.FeatureCollection([ee.Feature(ee.Geometry.Point(lngLat))]), null, 30, 'EPSG:5070').first()).evaluate(function(value){
				if(value != null){
				value = value['properties'];

				// if(Object.keys(value).length > 1){value = null;show = false;}
				// else{value = Object.values(value)[0];}
				
			};
			
				if(value === null){
					var queryLine = "<div style='width:90%;height:2px;border-radius:5px;margin:2px;background-color:#000'></div>" +k+ ': null <br>';
					queryContent +=`<tr><td>${k}</td><td>null</td></tr>`;
					$('#query-container').append(queryLine);
				}
				else if(Object.keys(value).length === 1 ){
					var queryLine = "<div style='width:90%;height:2px;border-radius:5px;margin:2px;background-color:#000'></div>" +k+ ': '+JSON.stringify(Object.values(value)[0]) + "<br>";
					queryContent +=`<tr><td>${k}</td><td>${JSON.stringify(Object.values(value)[0])}</td></tr>`;
					$('#query-container').append(queryLine);
				}
				else{
					var queryLine = "<div style='width:90%;height:2px;border-radius:5px;margin:2px;background-color:#000'></div>" +k+ ':<br>';
					queryContent += `<tr><td>${k}</td><td>?</td></tr>`;
					// $('#query-container').append(queryLine);
					Object.keys(value).map(function(kt){
						var v = value[kt].toFixed(2).toString();
						var queryLine =  kt+ ': '+v + "<br>";
						queryContent += `<tr><td>${kt}</td><td>${v}</td></tr>`;;
						// $('#query-container').append(queryLine);
					})
				}

			
		
			if(keyI == keyCount){
				map.setOptions({draggableCursor:'help'});
 			map.setOptions({cursor:'help'});
 			$('#summary-spinner').slideUp();

    			queryContent +=`</tbody></table>`;
	          infowindow.setContent(queryContent);
	          infowindow.open(map);
			}
			keyI++;
			})
			
			// outDict[k] = value;

		}
	})
	
	
	
	
};
var fsb;
// var fieldName = 'NAME';
// var fsbPath = 'TIGER/2018/Counties';

// var fieldName = 'name';
// var fsbPath = 'USGS/WBD/2017/HUC10';

// var fieldName = 'FORESTNAME';
// var fsbPath = 'projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Boundaries';


// var fieldName = 'PARKNAME';
// var fsbPath = 'projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/NPS_Boundaries';
function setupFSB(){
  $('#forestBoundaries').empty()
  // var fsb = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Boundaries');
  // var fieldName = 'FORESTNAME';

  	var nfsFieldName = 'FORESTNAME';
	var nfs = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Boundaries');


	var npsFieldName = 'PARKNAME';
	var nps = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/NPS_Boundaries');

	nfs = nfs.map(function(f){return f.set('label',f.get(nfsFieldName))});


	nps = nps.map(function(f){return f.set('label',ee.String(f.get(npsFieldName)).cat(' National Park'))});

	fsb = nfs.merge(nps);
	fieldName = 'label';
 

  fsb = fsb.filterBounds(areaChartCollection.geometry());

  var names = ee.List(ee.Dictionary(fsb.aggregate_histogram(fieldName)).keys());
  ee.Dictionary.fromLists(names, names).evaluate(function(d){
  	// print('d');print(d);
  	 var mySelect = $('#forestBoundaries');
	  var choose;
	  mySelect.append($('<option></option>').val(choose).html('Choose an area'))
	  $.each(d, function(val,text) {
	     
	      mySelect.append($('<option></option>').val(val).html(text)
	      );
	  });
  })
 	
 
};
var udp;
var udpList = [];
var whichAreaDrawingMethod;

function startAreaCharting(){
	console.log('starting area charting');
	// $('#areaChartingTabs').slideDown();
	$("#charting-parameters").slideDown();
	if(whichAreaDrawingMethod === '#user-defined'){console.log('starting user defined area charting');startUserDefinedAreaCharting();}
  	else if(whichAreaDrawingMethod === '#shp-defined'){$('#areaUpload').slideDown();startShpDefinedCharting();}
  	else if(whichAreaDrawingMethod === '#pre-defined'){$('#pre-defined').slideDown();}

}
function areaChartingTabSelect(target){
	stopAreaCharting();
	stopCharting();
	// $('#charting-container').slideDown();
	// $("#charting-parameters").slideDown();
	
   
	whichAreaDrawingMethod = target;
  	console.log(target);
  	if(target === '#user-defined'){startUserDefinedAreaCharting();}
  	else if(target === '#shp-defined'){startShpDefinedCharting();}
  	else if(target === '#pre-defined'){$('#pre-defined').slideDown();}
  	// startAreaCharting();
}
// function listenForUserDefinedAreaCharting(){
//   $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  	
//   var target = $(e.target).attr("href") // activated tab

//   console.log(target);
//   areaChartingTabSelect(target);
//   });
        
// }
// listenForUserDefinedAreaCharting();
var userDefinedI = 1;
function startUserDefinedAreaCharting(){
	console.log('start clicking');
	
	udpList = [];
	// $('#areaChartingTabs').slideDown();

	// $('#user-defined').slideDown();
	
	// $('#areaUpload').slideDown();
	map.setOptions({draggableCursor:'crosshair'});
    map.setOptions({disableDoubleClickZoom: true });
    google.maps.event.clearListeners(mapDiv, 'dblclick');
    google.maps.event.clearListeners(mapDiv, 'click');
    var fColor = randomColor();
    var udpOptions = {
              strokeColor:fColor,
                fillOpacity:0.2,
              strokeOpacity: 1,
              strokeWeight: 3,
              draggable: true,
              editable: true,
              geodesic:true,
              polyNumber: 1
            };
     var udpPolyOptions = {
              strokeColor:fColor,
                fillOpacity:0.2,
              strokeOpacity: 1,
              strokeWeight: 3,
              draggable: false,
              editable: false,
              geodesic:true,
              polyNumber: 1
            };
   try{
   	udp.setMap(null);
   }catch(err){console.log(err)};
   
   udp = new google.maps.Polyline(udpOptions);

   udp.setMap(map);

   mapHammer = new Hammer(document.getElementById('map'));
   // google.maps.event.addDomListener(mapDiv, 'click', function(event) {
        mapHammer.on("tap", function(event) {
        

        var path = udp.getPath();
        var x =event.center.x;
        var y = event.center.y;
        clickLngLat =point2LatLng(x,y);
        udpList.push([clickLngLat.lng(),clickLngLat.lat()])
        path.push(clickLngLat);
        
    
    });
   
	mapHammer.on("doubletap", function() {

        var path = udp.getPath();
        udp.setMap(null);
        udp = new google.maps.Polygon(udpPolyOptions);
        udp.setPath(path);
        udp.setMap(map);
        google.maps.event.clearListeners(mapDiv, 'dblclick');
    	google.maps.event.clearListeners(mapDiv, 'click');
    	map.setOptions({draggableCursor:'hand'});
 		map.setOptions({cursor:'hand'});
 		mapHammer.destroy()
 		// var geoJson = {'type':'Polygon',
			// 	'geometry':[udpList]};
		try{
			var userArea = ee.FeatureCollection([ee.Feature(ee.Geometry.Polygon(udpList))]);


		$('#summary-spinner').slideDown()
		// $('#areaUpload').slideDown();
	  	
	  	// $("#charting-parameters").slideDown();
	  	var udpName = $('#user-defined-area-name').val();
	  	if(udpName === ''){udpName = 'User Defined Area '+userDefinedI.toString();userDefinedI++;}
		// Map2.addLayer(userArea,{},udpName,false)
		// console.log(userArea.getInfo());
		console.log('hhhhhhhhhhhhhhhhhheeeeeeeeeeeeeeeeeellllllllllllll')
		makeAreaChart(userArea,udpName,true);
		}
		catch(err){areaChartingTabSelect(whichAreaDrawingMethod);showMessage('Error',err);}
		

	});
    // google.maps.event.addDomListener(mapDiv, 'dblclick', function() {
      
    // });

}

function chartChosenArea(){
  $('#charting-container').slideDown();
    $("#charting-parameters").slideDown();
    $('#summary-spinner').slideDown();
    try{
   	udp.setMap(null);
   }catch(err){console.log(err)};
    map.setOptions({draggableCursor:'progress'});
			map.setOptions({cursor:'progress'});
  // var fsb = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Boundaries');
  // var fieldName = 'FORESTNAME';

 
  var chosenArea = $('#forestBoundaries').val();
  var chosenAreaGeo = fsb.filter(ee.Filter.eq(fieldName,chosenArea));

  makeAreaChart(chosenAreaGeo,chosenArea);
  console.log('Charting ' + chosenArea);
}
function getLossGainTable(areaChartCollection,area){
	var test = ee.Image(areaChartCollection.first());
	test= test.reduceRegion(ee.Reducer.fixedHistogram(0, 2, 2),area,null,null,null,true,1e13,2);
	// print(test.getInfo());
	return areaChartCollection.toList(10000,0).map(function(img){
						img = ee.Image(img);
				    // img = ee.Image(img).clip(area);
				    var t = img.reduceRegion(ee.Reducer.fixedHistogram(0, 2, 2),area,null,null,null,true,1e13,2);
				    var year = ee.Number(ee.Date(img.get('system:time_start')).get('year')).format();
				    t = ee.Dictionary(t).toArray().slice(1,1,2).project([0]);
				    var lossT = t.slice(0,2,null);
				    var gainT = t.slice(0,0,2);
				    var lossSum = lossT.reduce(ee.Reducer.sum(),[0]).get([0]);
				    var gainSum = gainT.reduce(ee.Reducer.sum(),[0]).get([0]);
				    var lossPct = ee.Number.parse(lossT.get([1]).divide(lossSum).multiply(100).format('%.2f'));
				    var gainPct = ee.Number.parse(gainT.get([1]).divide(gainSum).multiply(100).format('%.2f'));
				    return [year,lossPct,gainPct];//ee.List([lossSum]);
				})
}
var areaChartingCount = 0;var areaGeoJson;
function expandChart(){
	console.log('expanding');
	$('#curve_chart_big').slideDown();
	$('#curve_chart_big_modal').modal();
	closeChart();
}
function makeAreaChart(area,name,userDefined){
	console.log('making chart');console.log(userDefined);
	if(userDefined === undefined || userDefined === null){userDefined = false};
	areaChartingCount++;
	// closeChart();
	// document.getElementById('curve_chart_big').style.display = 'none';
	var fColor = randomColor().slice(1,7);
	if(userDefined === false){
		
		Map2.addLayer(area,{'palette':fColor,addToClassLegend: true,classLegendDict:{'':fColor}},name,true,null,null,name + ' for summarizing','reference-layer-list');
	}
	
	updateProgress(50);
	area = area.set('source','LCMS_data_explorer');
	areaGeoJson = area.getInfo();
	centerObject(area);
	area = area.geometry();

	var table = getLossGainTable(areaChartCollection,area);
	// var bandNames = ee.Image(1).rename(['Year']).addBands(ee.Image(areaChartCollection.first())).bandNames().getInfo().map(function(i){return i.replaceAll('_',' ')});
	var iteration = 0;
	var maxIterations = 60;
	var success = false;
	
	var tableT;
	function evalTable(){
		table.evaluate(function(tableT, failure){
			print(iteration);
			print(tableT);
			print(failure);
			print(areaChartingCount);
			if(failure !== undefined && iteration < maxIterations && failure.indexOf('aggregations') > -1){evalTable()}
			else if(failure === undefined) {
				tableT.unshift(['year','Loss','Gain']);
				$('#summary-spinner').slideUp();
				addChartJS(tableT,name);
				areaChartingTabSelect(whichAreaDrawingMethod);
				map.setOptions({draggableCursor:'hand'});
				map.setOptions({cursor:'hand'});
				
				areaChartingCount--;
			}
			else{
				$('#summary-spinner').slideUp()
				map.setOptions({draggableCursor:'hand'});
				map.setOptions({cursor:'hand'});
				
				areaChartingTabSelect(whichAreaDrawingMethod);
				if(failure.indexOf('Dictionary.toArray: Unable to convert dictionary to array')>-1){
					failure = 'Most likely selected area does not overlap with selected LCMS study area<br>Please select area that overlaps with products<br>Raw Error Message:<br>'+failure;
				}
				showMessage('Error! Try again',failure)};
			iteration ++;
		

		
			
	});
		
	}
	evalTable();
	
	


	
}
function fixGeoJSONZ(f){
	console.log('getting rid of z');
	f.features = f.features.map(function(f){
    f.geometry.coordinates = f.geometry.coordinates.map(function(c){
    															return c.map(function(i){
    																return i.slice(0,2)})
																		});
    return f;
  });
	console.log(f);

	return f
}

function startShpDefinedCharting(){
	$('#shp-defined').slideDown();
	$('#areaUpload').slideDown();
	$('#areaUpload').change(function(){
		if(jQuery('#areaUpload')[0].files.length > 0){

		try{
		   	udp.setMap(null);
		   }catch(err){console.log(err)};
		$('#summary-spinner').slideDown()
		$('#areaUpload').slideDown();
	  $('#charting-container').slideDown();
	  $("#charting-parameters").slideDown();
		console.log('it changed');
		updateProgress(10);
		document.getElementById('curve_chart').style.display = 'none';
		
			var name = jQuery('#areaUpload')[0].files[0].name.split('.')[0];
			map.setOptions({draggableCursor:'progress'});
			map.setOptions({cursor:'progress'});
			convertToGeoJSON('areaUpload').done(function(converted){
					console.log('successfully converted to JSON');
					console.log(converted);
					updateProgress(30);

					//First try assuming the geoJSON has spatial info
					try{
						var area =ee.FeatureCollection(converted.features.map(function(t){return ee.Feature(t).dissolve(100,ee.Projection('EPSG:4326'))}));
					} 
					//Fix it if not
					catch(err){
						err = err.toString();
						console.log('Error');console.log(err);
						if(err.indexOf('Error: Invalid GeoJSON geometry:') > -1){
							var area =ee.FeatureCollection(fixGeoJSONZ(converted).features.map(function(t){return ee.Feature(t).dissolve(100,ee.Projection('EPSG:4326'))}))	
						}
						else{
							console.log('what to do');
						}
						
					};
					// var area  =ee.FeatureCollection(converted.features.map(function(t){return ee.Feature(t).dissolve(100,ee.Projection('EPSG:4326'))}));//.geometry()//.dissolve(1000,ee.Projection('EPSG:4326'));
					makeAreaChart(area,name);
					

				})
	}
		
	})
};
function stopAreaCharting(){
	console.log('stopping area charting');
	try{
   	udp.setMap(null);
   }catch(err){console.log(err)};
 //   $('#areaChartingTabs').slideUp();
	// $('#areaUpload').unbind('change')
	// $("#charting-parameters").slideUp();
	// $('#user-defined').slideUp();
	// $('#shp-defined').slideUp();
	// $('#pre-defined').slideUp();
	$('#summary-spinner').slideUp();
	// // $('#areaUpload').slideUp();
	// google.maps.event.clearListeners(mapDiv, 'dblclick');
 //    google.maps.event.clearListeners(mapDiv, 'click');
	// updateProgress(1);
	// closeChart();

};

function startQuery(){
	try{
   	udp.setMap(null);
   }catch(err){console.log(err)};
	google.maps.event.clearListeners(mapDiv, 'dblclick');
    google.maps.event.clearListeners(mapDiv, 'click');
	map.setOptions({draggableCursor:'help'});
 			map.setOptions({cursor:'help'});
 	mapHammer = new Hammer(document.getElementById('map'));
   mapHammer.on("doubletap", function(e) {
	// google.maps.event.addDomListener(mapDiv,"dblclick", function (e) {
			$('#summary-spinner').slideDown()
			map.setOptions({draggableCursor:'progress'});
			map.setOptions({cursor:'progress'});
			
			print('Map was double clicked');
			var x =e.center.x;//clientX;
        	var y = e.center.y;console.log(x);
        	center =point2LatLng(x,y);

			// center = e.latLng;
			marker.setMap(null);
			marker=new google.maps.Circle({
  				center:{lat:center.lat(),lng:center.lng()},
  				radius:plotRadius,
  				strokeColor: '#FF0',
  				fillOpacity:0
  				});

			marker.setMap(map);

			getQueryImages(center.lng(),center.lat());

		})
	document.getElementById('query-container').style.display = 'block';
}
function stopQuery(){
	print('stopping');
	mapHammer.destroy();
	map.setOptions({draggableCursor:'hand'});
	map.setOptions({cursor:'hand'});
	$('#query-container').text('Double click on map to query values of displayed layers at a location');
	google.maps.event.clearListeners(mapDiv, 'dblclick');
	map.setOptions({cursor:'hand'});
	document.getElementById('query-container').style.display = 'none';
}
function getImageCollectionValuesForCharting(pt){
	
	// var timeSeries = years.map(function(yr){
	// 	var imageT = l5s.filterDate(ee.Date.fromYMD(yr,1,1),ee.Date.fromYMD(yr,12,31)).median().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
	// 	return imageT
	// })
	// timeSeries = ee.ImageCollection.fromImages(timeSeries);
	var icT = ee.ImageCollection(chartCollection.filterBounds(pt));
	var tryCount = 2;
	// print(icT.getRegion(pt.buffer(plotRadius),plotScale))
	try{var allValues = icT.getRegion(pt,null,'EPSG:5070',[30,0,-2361915.0,0,-30,3177735.0]).evaluate();
		print(allValues)
		return allValues}
	catch(err){showMessage('Charting error',err.message)};//reRun();setTimeout(function(){icT.getRegion(pt.buffer(plotRadius),plotScale).getInfo();},5000)}
	

}
Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(), !mm[1] && '0', mm, !dd[1] && '0', dd].join(''); // padding
};
function getDataTable(pt){
	// var chartScale = plotScale;
	// var chartPtSize = plotRadius;
	// addToMap(pt.buffer(chartPtSize));

	
	var values = getImageCollectionValuesForCharting(pt);
	globalChartValues	 = values;
	// var values = imageCollectionForCharting.getRegion(pt.buffer(chartPtSize),chartScale).getInfo();
	
	if(chartIncludeDate){var startColumn = 3}else{var startColumn = 4};
	var header = values[0].slice(startColumn);

	values = values.slice(1).map(function(v){return v.slice(startColumn)}).sort(sortFunction);




	print(values)
	if(chartIncludeDate){
	values = values.map(function(v){
			  var d = [new Date(v[0])];
			  v.slice(1).map(function(vt){d.push(vt)})
			  return d})
	}

	var forChart = [header];
	values.map(function(v){forChart.push(v)});
	
	return forChart
}

function changeChartType(newType,showExpanded){
	if(!showExpanded){showExpanded = false};
	newType.checked = true;
	$(newType).checked = true;
	chartType = newType.value;
	uriName = 'LCMS_Product_Time_Series_for_lng_' +center.lng().toFixed(4).toString() + '_' + center.lat().toFixed(4).toString(); //+ ' Res: ' +plotScale.toString() + '(m) Radius: ' + plotRadius	.toString() + '(m)';
	csvName = uriName + '.csv'
	document.getElementById('curve_chart').style.display = 'none';
	setTimeout(function(){updateProgress(80);},0);
	Chart(showExpanded);
}

//////////////////////////////////////////////////////////////////
//ChartJS code
function downloadChartJS(chart,name){
	var link = document.createElement("a");
	link.download = name;
	link.href = chart.toBase64Image();
	link.click();
	delete link;
}

Chart.pluginService.register({
    beforeDraw: function (chart, easing) {
        if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
            var helpers = Chart.helpers;
            var ctx = chart.chart.ctx;
            var chartArea = chart.chartArea;

            ctx.save();
            ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
            ctx.fillRect(chartArea.left-60, chartArea.top-30, chartArea.right - chartArea.left+60, chartArea.bottom - chartArea.top+150);
            ctx.restore();
        }
    }
});
var chartJSChart;
addModal('main-container','chart-modal');//addModalTitle('chart-modal','test');$('#chart-modal-body').append('hello');$('#chart-modal').modal();
function addChartJS(dt,title,chartType,canvasWidth,canvasHeight){
	dataTable = dt;
	if(chartType === null || chartType === undefined){chartType = 'line'};
	if(canvasWidth === null || canvasWidth === undefined){canvasWidth = '1200'};
	if(canvasHeight === null || canvasHeight === undefined){canvasHeight = '600'};
	console.log(dt);
	// $('#'+modalID).html('');
	clearModal('chart-modal');
	// if(title !== null && title !== undefined){addModalTitle('chart-modal',title)}
	

    $('#chart-modal-body').append(`<canvas id="chart-canvas" width="${canvasWidth}" height="${canvasHeight}"></canvas>`);
    var data = dt.slice(1);
    console.log(data);
    var firstColumn = arrayColumn(data,0);
    console.log(firstColumn)
    var columnN = dt[1].length;
    var columns = range(1,columnN);
    
    var datasets = columns.map(function(i){
        var col = arrayColumn(dt,i);
        var label = col[0];
        var data = col.slice(1);
        var color = randomRGBColor()
        return {'label':label,pointStyle: chartType,'data':data,'fill':false,'borderColor':`rgb(${color[0]},${color[1]},${color[2]})`,'lineTension':0}
        // console.log(label);console.log(data)
    })
    console.log(datasets)
    chartJSChart = new Chart($('#chart-canvas'),{"type":chartType,
	    "data":{"labels":firstColumn,
	    "datasets":datasets},"options":{
	    	 title: {
	            display: true,
	            position:'top',
	            text: title.replaceAll('_',' ')
	        },
	        legend:{
	        	display:true,
	        	position:'bottom',
	        	
	        	labels : {
	        		usePointStyle: true,
            
        }
	        },
	        chartArea: {
		        backgroundColor: '#D6D1CA'
		    }
    	}	
	});

	  // $('#chart-modal-footer').append(`<div class="dropdown">
			// 							  <div class=" dropdown-toggle"  id="chartDownloadDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
			// 							    Chart Type
			// 							  </div>
			// 							  <div class="dropdown-menu" aria-labelledby="chartDownloadDropdown" id = 'chart-type-dropdown-list'></div>
			// 							</div>`)
	  // var chartTypes = ['Bar','Line','Pie','Radar'];
	  // chartTypes.map(function(t){
	  	// $('#chart-type-dropdown-list').append(`<a class="dropdown-item" href="#" onclick = "change('${t}'.toLowerCase())">${t}</a>`)
	  // })
	    
	    $('#chart-modal-footer').append(`<div class="dropdown">
										  <div class=" dropdown-toggle"  id="chartDownloadDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
										    Download
										  </div>
										  <div class="dropdown-menu" aria-labelledby="chartDownloadDropdown">
										    <a class="dropdown-item" href="#" onclick = "downloadChartJS(chartJSChart,'${title}.png')">PNG</a>
										    <a class="dropdown-item" href="#" onclick = "exportToCsv('${title}.csv', dataTable)">CSV</a>
										   
										  </div>
										</div>`)
	    $('#chart-modal').modal();
}
function change(newType) {
  var config = chartJSChart.config;
  chartJSChart.destroy();
  config.type = newType;
  chartJSChart = new Chart($('#chart-canvas'), config);
};
function chartToTable(chart) {
	var dataset = chart.config.data;
	var title = chart.options.title.text;

    var html = '<table>';
    html += '<thead><tr><th style="width:120px;"></th>';
    
    var columnCount = 0;
    jQuery.each(dataset.datasets, function (idx, item) {
        html += '<th style="background-color:' + item.fillColor + ';">' + item.label + '</th>';
        columnCount += 1;
    });

    html += '</tr></thead>';

    jQuery.each(dataset.labels, function (idx, item) {
        html += '<tr><td>' + item + '</td>';
        for (i = 0; i < columnCount; i++) {
            html += '<td style="background-color:' + dataset.datasets[i].fillColor + ';">' + (dataset.datasets[i].data[idx] === '0' ? '-' : dataset.datasets[i].data[idx]) + '</td>';
        }
        html += '</tr>';
    });

    html += '</tr><tbody></table>';
    showMessage(title,html)
    // return html;
};

var d =
[["time", "NDVI", "NDVI_LT_fitted", "Land Cover Class", "Land Use Class", "Loss Probability", "Gain Probability"]
,["1985", 0.6456953642384106, null, 0.6000000238418579, 0.30000001192092896, 0.019999999552965164, 0]
,["1986", 0.6456953642384106, 0.6573789473684211, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["1987", 0.6456953642384106, 0.6598578947368421, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["1988", 0.6934156378600823, 0.6623368421052632, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["1989", 0.6934156378600823, 0.6648157894736842, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["1990", 0.6934156378600823, 0.6672947368421053, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["1991", null, 0.6697736842105264, null, null, null, null]
,["1992", null, 0.6722526315789473, null, null, null, null]
,["1993", null, 0.6747315789473685, null, null, null, null]
,["1994", 0.6439862542955326, 0.6772105263157895, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["1995", 0.6439862542955326, 0.6796894736842105, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["1996", 0.6439862542955326, 0.6821684210526316, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["1997", null, 0.6846473684210527, null, null, null, null]
,["1998", 0.7261107729762629, 0.6871263157894737, 0.6000000238418579, 0.30000001192092896, 0.1599999964237213, 0]
,["1999", 0.7261107729762629, 0.6896052631578948, 0.6000000238418579, 0.30000001192092896, 0.07999999821186066, 0]
,["2000", 0.6856763925729443, 0.6920842105263157, 0.6000000238418579, 0.30000001192092896, 0.09000000357627869, 0]
,["2001", 0.6856763925729443, 0.6945631578947369, 0.6000000238418579, 0.30000001192092896, 0.07000000029802322, 0]
,["2002", 0.7016229712858926, 0.6970421052631579, 0.6000000238418579, 0.30000001192092896, 0.05000000074505806, 0]
,["2003", 0.6268958543983821, 0.6995210526315789, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["2004", 0.766839378238342, 0.7020000000000001, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["2005", 0.1652502360717658, 0.1652, 0.10000000149011612, 0.5, 0.75, 0]
,["2006", 0.37468030690537085, 0.21481538461538469, 0.10000000149011612, 0.6000000238418579, 0.07999999821186066, 0.07999999821186066]
,["2007", 0.37468030690537085, 0.26443076923076925, 0.4000000059604645, 0.6000000238418579, 0.09000000357627869, 0.05999999865889549]
,["2008", 0.44536882972823066, 0.3140461538461539, 0.10000000149011612, 0.5, 0.12999999523162842, 0.12999999523162842]
,["2009", 0.3751962323390895, 0.3636615384615385, 0.4000000059604645, 0.6000000238418579, 0.019999999552965164, 0.07999999821186066]
,["2010", 0.3751962323390895, 0.41327692307692304, 0.4000000059604645, 0.6000000238418579, 0, 0.10999999940395355]
,["2011", 0.4737417943107221, 0.4628923076923077, 0.4000000059604645, 0.6000000238418579, 0.05999999865889549, 0.07999999821186066]
,["2012", 0.5301810865191147, 0.5125076923076924, 0.4000000059604645, 0.6000000238418579, 0.12999999523162842, 0.10000000149011612]
,["2013", 0.5709251101321586, 0.562123076923077, 0.4000000059604645, 0.6000000238418579, 0.05000000074505806, 0.8399999737739563]
,["2014", 0.569609507640068, 0.6117384615384616, 0.4000000059604645, 0.30000001192092896, 0, 0.6499999761581421]
,["2015", 0.6380090497737556, 0.6613538461538462, 0.4000000059604645, 0.6000000238418579, 0.019999999552965164, 0.8700000047683716]
,["2016", 0.7084615384615386, 0.7109692307692308, 0.4000000059604645, 0.30000001192092896, 0, 0.75]
,["2017", 0.7672530446549392, 0.7605846153846154, 0.4000000059604645, 0.30000001192092896, 0, 0.6499999761581421]]
// addChartJS(d,'test1')

var marker=new google.maps.Circle({
  				center:{lat:45,lng:-111},
  				radius:5
  				});
function addClickMarker(center){
	marker.setMap(null);
	marker=new google.maps.Circle({
			center:{lat:center.lat(),lng:center.lng()},
			radius:plotRadius,
			strokeColor: '#FF0',
			fillOpacity:0
			});
	marker.setMap(map);
}
function getEveryOther(values){
			return values.filter(i => values.indexOf(i)%2 ==0)
		}

function startPixelChartCollection() {

	map.setOptions({draggableCursor:'help'});
	mapHammer = new Hammer(document.getElementById('map'));
   
    mapHammer.on("doubletap", function(event) {
    	$('#summary-spinner').slideDown();
    	map.setOptions({draggableCursor:'progress'});
        var x =event.center.x;
        var y = event.center.y;
        center =point2LatLng(x,y);
    	addClickMarker(center)
        
		var pt = ee.Geometry.Point([center.lng(),center.lat()]);
		var icT = ee.ImageCollection(chartCollection.filterBounds(pt));
		
		uriName =  'LCMS_Product_Time_Series_for_lng_' +center.lng().toFixed(4).toString() + '_lat_' + center.lat().toFixed(4).toString();
		csvName = uriName + '.csv'
		

		function chartValues(values){
			
			if(chartIncludeDate){var startColumn = 3}else{var startColumn = 4};
			print('Extracted values:');
			print(values);
			var header = values[0].slice(startColumn);
			values = values.slice(1).map(function(v){return v.slice(startColumn)}).sort(sortFunction);
			if(chartIncludeDate){
				values = values.map(function(v){
				  // var d = [new Date(v[0])];
				  // v.slice(1).map(function(vt){d.push(vt)})
				  var d = v[0];
				  var y = (new Date(d).getYear()+1900).toString();
				  // v = v.map(function(i){if(i === null){return i}else{return i.toFixed(3)}})
				  v[0] = y;
				  return v;
				})
			}
			values = values.map(function(v)
				{return v.map(function(i){
				if(i === null || i === undefined){return i}
				else if(i%1!==0){return i.toFixed(3)}
				else if(i%1==0){return parseInt(i)}
				else{return i}
				})
			});
			values.unshift(header);
			$('#summary-spinner').slideUp();
			map.setOptions({draggableCursor:'help'});
			addChartJS(values,uriName);
			
		
   		}
		icT.getRegion(pt.buffer(plotRadius),plotScale).evaluate(function(values){
			$('#summary-spinner').slideUp();
			if(values === undefined ||  values === null){
				showMessage('Error','Error encountered while charting.<br>Most likely clicked outside study area data extent<br>Try charting an area within the selected study area');
			}
			else if(values.length > 1){
				if(values.length > icT.size().getInfo()+1){
					console.log('reducing number of inputs');
					values = getEveryOther(values);
				}
				chartValues(values);
			}
			else{

				showMessage('Charting Error','Unknown Error');
			}
		})
	})

		
		
      }

// function closeChart(){
// 	updateProgress(1);
// 	$('#curve_chart').slideUp();

	
// }
// function closeBigChart(){
// 	$('#curve_chart_big').slideUp();
	
// }
function stopCharting(){
	// document.getElementById('charting-parameters').style.display = 'none';
	// $("#charting-parameters").slideUp();
	// $("#whichIndexForChartingRadio").slideUp();
	// marker.setMap(null);
	// google.maps.event.clearListeners(mapDiv, 'dblclick');
	map.setOptions({draggableCursor:'hand'});
	$('#summary-spinner').slideUp();
	infowindow.setMap(null);
	// updateProgress(1);
	// closeChart();
	// closeBigChart();
	try{
		mapHammer.destroy();
	}catch(err){
		console.log(err)
	}
	

}
function exportJSON(filename,json){
	json = JSON.stringify(json);

	var blob = new Blob([json], { type: "application/json" });
	var url  = URL.createObjectURL(blob);

	var link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
function exportToCsv(filename, rows) {
        var processRow = function (row) {
            var finalVal = '';
            for (var j = 0; j < row.length; j++) {
                var innerValue = row[j] === null || row[j] === undefined ? '' : row[j].toString();
                if (row[j] instanceof Date) {
                    innerValue = row[j].toLocaleString();
                };
                var result = innerValue.replace(/"/g, '""');
                if (result.search(/("|,|\n)/g) >= 0)
                    result = '"' + result + '"';
                if (j > 0)
                    finalVal += ',';
                finalVal += result;
            }
            return finalVal + '\n';
        };

        var csvFile = '';
        for (var i = 0; i < rows.length; i++) {
            csvFile += processRow(rows[i]);
        }

        var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }