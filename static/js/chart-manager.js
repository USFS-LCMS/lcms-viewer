var center;var globalChartValues;
var mapDiv = document.getElementById('map');
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
}
}
var  getQueryImages = function(lng,lat){
	var lngLat = [lng, lat];
	var outDict = {};
	$('#summary-spinner').slideDown();
	$('#query-container').empty();
	$('#query-container').append('<h5>Queried values for lng: '+lng.toFixed(3).toString() + ' lat: '+lat.toFixed(3).toString()+ '</h5>');
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
				$('#query-container').append("<div style='width:90%;height:2px;border-radius:5px;margin:2px;background-color:#000'></div>" +k+ ': null <br>');
				}
				else if(Object.keys(value).length === 1 ){
				$('#query-container').append("<div style='width:90%;height:2px;border-radius:5px;margin:2px;background-color:#000'></div>" +k+ ': '+JSON.stringify(Object.values(value)[0]) + "<br>");
				}
				else{
					$('#query-container').append("<div style='width:90%;height:2px;border-radius:5px;margin:2px;background-color:#000'></div>" +k+ ':<br>');
					Object.keys(value).map(function(kt){
						var v = value[kt].toFixed(2).toString();
						$('#query-container').append( kt+ ': '+v + "<br>");
					})
				}

			
		
			if(keyI == keyCount){
				map.setOptions({draggableCursor:'help'});
 			map.setOptions({cursor:'help'});
 			$('#summary-spinner').slideUp();
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
	$('#charting-container').slideDown();
	$("#charting-parameters").slideDown();
	
   
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

	$('#user-defined').slideDown();
	
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
	  	
	  	$("#charting-parameters").slideDown();
	  	var udpName = $('#user-defined-area-name').val();
	  	if(udpName === ''){udpName = 'User Defined Area '+userDefinedI.toString();userDefinedI++;}
		// Map2.addLayer(userArea,{},udpName,false)
		// console.log(userArea.getInfo());
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
function makeAreaChart(area,name,target,userDefined){
	if(!userDefined){userDefined = false};
	areaChartingCount++;
	closeChart();
	document.getElementById('curve_chart_big').style.display = 'none';
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
				
				updateProgress(80);
				areaGeoJson.properties.LCMSSummary = tableT;
				 document.getElementById('curve_chart').style.display = 'inline-block';
				 document.getElementById('curve_chart_big').style.display = 'inline-block';
				  print(tableT)
				  var dataTable = [['Year','Loss %','Gain %']].concat(tableT);
				  var name_for_filenames = name.replaceAll(' ','_');
				  uriName = name_for_filenames + ' LCMS_Loss_and_Gain_Summary';
				  var title = name + ' LCMS Loss and Gain Summary';
				  csvName = uriName + '.csv'
				  geoJsonName = uriName + '.geojson'

				 dataTableT = null;
				dataTableT = CopyAnArray (dataTable);



			
				var chartOptionsT = JSON.parse(JSON.stringify(chartOptions));
				chartOptionsT.hAxis.title = 'Time';
				chartOptionsT.vAxis.title = 'Percent of Area';
				chartOptionsT.title = title;

				var chartOptionsTBig = JSON.parse(JSON.stringify(chartOptionsT));
				chartOptionsTBig.width = expandedWidth;
				chartOptionsTBig.height= expandedHeight;
			
				var data = google.visualization.arrayToDataTable(dataTableT);
				var dataBig	 = google.visualization.arrayToDataTable(dataTableT);
				var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
				var chartBig = new google.visualization.LineChart(document.getElementById('curve_chart_big'));
				chartBig.draw(dataBig, chartOptionsTBig);

				
				chart.draw(data, chartOptionsT);
				

				// $('#curve_chart_big').append('<br><br>');
				// $("#curve_chart_big").append('<button class="button" onclick="downloadURI();" style= "position:inline-block;">Download PNG');
				// $("#curve_chart_big").append('<button class="button" onclick="exportToCsv(csvName, dataTableT);" style= "position:inline-block;">Download CSV');
				// $("#curve_chart_big").append('<button class="button" onclick="exportJSON(geoJsonName, areaGeoJson);" style= "position:inline-block;">Download GeoJSON');
				// $("#curve_chart_big").append('<button class="button" onclick="areaChartingTabSelect(whichAreaDrawingMethod);" style= "position:absolute;right:0%;top:0%;">X');
				
				// google.visualization.events.addListener(chartBig, 'ready', function () {

				    uri = chartBig.getImageURI();
				    document.getElementById('curve_chart_big').style.display = 'none';
				    updateProgress(90)
					$('#summary-spinner').slideUp();
				
				
				// var exportCSVTooltip = 
				var bottomBarSmall = '<div style = "position:inline-block;">\
				<a href="#"><i class="fa fa-cloud-download bg-black" onclick="exportToCsv(csvName, dataTableT);" style= "position:inline-block;">Table</i></a>\
				<a href="#"><i class="fa fa-cloud-download bg-black" onclick="exportJSON(geoJsonName, areaGeoJson);" style= "position:inline-block;">GeoJSON</i></a>\
				<a href="#"><i class="fa fa-expand bg-black ml-auto" onclick="expandChart();" style= "position:inline-block;"></i></a>\
				<a href="#"><i class="fa fa-trash bg-black  ml-auto"  onclick="areaChartingTabSelect(whichAreaDrawingMethod);" style= position:inline-block;"></i></a>\
				</div>';

				var bottomBarLarge = '<a href="#"><i class="fa fa-cloud-download bg-black" onclick="downloadURI();" >Graph</i></a>\
				<a href="#"><i class="fa fa-cloud-download bg-black" onclick="exportToCsv(csvName, dataTableT);" >Table</i></a>\
				<a href="#"><i class="fa fa-cloud-download bg-black" onclick="exportJSON(geoJsonName, areaGeoJson);" >GeoJSON</i></a>';
				$('#curve_chart').append(bottomBarSmall);
				$('#curve_chart_big_footer').append(bottomBarLarge);
				
				// $("#curve_chart").append('<button class="button" onclick="expandChart();" style= "position:inline-block;">Expand Chart');
				// $("#curve_chart").append('<button class="button" onclick="closeChart();" style= "position:inline-block;float:right;">Close Chart');

				updateProgress(100);
				map.setOptions({draggableCursor:'hand'});
				map.setOptions({cursor:'hand'});
				
				areaChartingCount--;
			}
			else{
				$('#summary-spinner').slideUp()
				map.setOptions({draggableCursor:'hand'});
				map.setOptions({cursor:'hand'});
				updateProgress(0);
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
   $('#areaChartingTabs').slideUp();
	$('#areaUpload').unbind('change')
	$("#charting-parameters").slideUp();
	$('#user-defined').slideUp();
	$('#shp-defined').slideUp();
	$('#pre-defined').slideUp();
	$('#summary-spinner').slideUp();
	// $('#areaUpload').slideUp();
	google.maps.event.clearListeners(mapDiv, 'dblclick');
    google.maps.event.clearListeners(mapDiv, 'click');
	updateProgress(1);
	closeChart();

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

function Chart(showExpanded){
	if(!showExpanded){showExpanded = false};
	document.getElementById('curve_chart').style.display = 'none';
	document.getElementById('curve_chart_big').style.display = 'none';
	// updateProgress(75);
	
			var chartOptionsT;
			// chartType = 'Table'
			setTimeout(function(){updateProgress(80);},0);
			dataTableT = null;
			dataTableT = CopyAnArray (dataTable)
			if(chartType === 'Histogram' || chartType === 'ScatterChart' && dataTable[0][0] === 'time'){
				dataTableT = dataTableT.map(function(row){return row.slice(1)})
			} 
			else if(chartType === 'Table'){
			if(tableConverter != null && tableConverter != undefined){
				dataTableT	= tableConverter(dataTableT)
			}
			
				}
			// else{dataTableT = dataTableT.slice(0)};
			chartOptionsT = JSON.parse(JSON.stringify(chartOptions));
			if(chartType === 'Histogram'){chartOptionsT.hAxis.title = 'Value'}
				else if(chartType === 'ScatterChart'){chartOptionsT.hAxis.title = dataTableT[0][0];chartOptionsT.opacity = 0.1}
				else if(chartType === 'Table'){chartOptionsT = tableOptions}
				else{chartOptionsT.hAxis.title = 'Time'};
			chartOptionsT.title = uriName.replaceAll('_',' ');
			var chartOptionsTBig = JSON.parse(JSON.stringify(chartOptionsT));
			// chartOptionsTBig.width = expandedWidth;
			chartOptionsTBig.height= expandedHeight;

			
			var data = google.visualization.arrayToDataTable(dataTableT);
			var dataBig	 = google.visualization.arrayToDataTable(dataTableT);
	       	console.log('data');
	       	console.log(dataTableT);
	       	$('#summary-spinner').slideUp();
	        document.getElementById('curve_chart').style.display = 'inline-block';
	       	document.getElementById('curve_chart_big').style.display = 'inline-block';

	        eval("var chart = new google.visualization."+chartType+"(document.getElementById('curve_chart'));")
	        eval("var chartBig = new google.visualization."+chartType+"(document.getElementById('curve_chart_big'));")


	        
	       google.visualization.events.addListener(chartBig, 'ready', function () {
    		if(chartType != 'Table'){uri = chartBig.getImageURI();}

    		// printImage(imageUri);
    		// downloadURI( "helloWorld.png");
    		// do something with the image URI, like:
    		
			});
	       setTimeout(function(){updateProgress(90);},0);
	        chart.draw(data, chartOptionsT);
	        chartBig.draw(dataBig, chartOptionsTBig);
	        setTimeout(function(){updateProgress(100);},0);
			
			$('#curve_chart').append('<br><br>')

 	       	if(chartType != 'Table'){$("#curve_chart").append('<button class="button" onclick="downloadURI();" style= "position:inline-block;">Download PNG')}
 	       	$("#curve_chart").append('<button class="button" onclick="exportToCsv(csvName, dataTableT);" style= "position:inline-block;">Download CSV')
 	       	// $('#curve_chart').append('<p></p>')
 	       	if(chartTypeOptions){
 	       		chartTypes.map(function(ct){
 	       			$("#curve_chart").append('<input class="button" type="button"  value = "'+ct+'" onclick = "changeChartType(this);" >')
 	       		})
 	       		// $("#curve_chart").append(
 	       		// 					'<input class="button" type="button"  value = "LineChart" onclick = "changeChartType(this);" >\n\
 	       		// 					<input class="button" type="button" value = "ScatterChart" onclick = "changeChartType(this);" >\n\
 	       		// 					<input class="button" type="button" value = "Histogram" onclick = "changeChartType(this);" >\n\
 	       		// 					<input class="button" type="button" value = "Table" onclick = "changeChartType(this);" >\n\
 	       		// 					<input class="button" type="button"  value = "ColumnChart" onclick = "changeChartType(this);">')
 	       
 	       	}
 	       	$("#curve_chart").append('<button class="button" onclick="expandChart();" style= "position:inline-block;">Expand Chart');
 	       	$("#curve_chart").append('<button class="button" onclick="closeChart();" style= "position:inline-block;float:right;">Close Chart')
 	       	
 	       	$('#curve_chart_big').append('<br><br>')

 	       	if(chartType != 'Table'){$("#curve_chart_big").append('<button class="button" onclick="downloadURI();" style= "position:inline-block;">Download PNG')}
 	       	$("#curve_chart_big").append('<button class="button" onclick="exportToCsv(csvName, dataTableT);" style= "position:inline-block;">Download CSV')
 	       	// $('#curve_chart').append('<p></p>')
 	       	if(chartTypeOptions){
 	       		chartTypes.map(function(ct){
 	       			$("#curve_chart_big").append('<input class="button" type="button"  value = "'+ct+'" onclick = "changeChartType(this,true);" >')
 	       		})
 	       		
 	       
 	       	}
 	       	$("#curve_chart_big").append('<button class="button" onclick="closeBigChart();" style= "position:absolute;right:0%;top:0%;">X');
 	       	if(showExpanded){
				document.getElementById('curve_chart').style.display = 'none';
 	       	}else{
 	       		document.getElementById('curve_chart_big').style.display = 'none';
 	       	}
 	       	
 			map.setOptions({draggableCursor:'help'});
 			map.setOptions({cursor:'help'});
			// $("#curve_chart").append('<variable-range id = "graphControls" name="Chart plot radius (m)" var="plotRadius" default="15" min="30" max="300" step = "30"></variable-range>');
 	       	// $("input[name='gender']").change(function(){this.checked = true;changeChartType(this);})
 	       	// $("#curve_chart").append('<label class="radio-inline"><input type="radio" name="chartTypeR">Option 2</label>')
 	       	// $("#curve_chart").append('<label class="radio-inline"><input type="radio" name="chartTypeR">Option 3</label>')

	        // $('#download-spinner').css({'visibility': 'hidden'});
        // updateProgress(100);
}
function chartIt(){

		// modal.style.display = "block";

		// $('#download-spinner').css({'visibility': 'visible'});
         // $('#download-spinner').attr('src', 'images/spinnerGT5.gif');
         
    
    	
    	


		var pt = ee.Geometry.Point([center.lng(),center.lat()]);
		var icT = ee.ImageCollection(chartCollection.filterBounds(pt));
		
		icT.getRegion(pt.buffer(plotRadius),plotScale).evaluate(
			function(values){
					// globalChartValues	 = values;
	// var values = imageCollectionForCharting.getRegion(pt.buffer(chartPtSize),chartScale).getInfo();
	
	if(chartIncludeDate){var startColumn = 3}else{var startColumn = 4};
	print('Extracted values:',values)
	try{
		if(values !== undefined){
			var header = values[0].slice(startColumn);
			values = values.slice(1).map(function(v){return v.slice(startColumn)}).sort(sortFunction);
			if(chartIncludeDate){
				values = values.map(function(v){
				  // var d = [new Date(v[0])];
				  // v.slice(1).map(function(vt){d.push(vt)})
				  v[0] = (new Date(v[0]).getYear()+1900).toString();
				  return v;
				})
			}

			var forChart = [header];
			values.map(function(v){forChart.push(v)});
			dataTable	=forChart;
			uriName =  'LCMS_Product_Time_Series_for_lng_' +center.lng().toFixed(4).toString() + '_' + center.lat().toFixed(4).toString();// + ' Res: ' +plotScale.toString() + '(m) Radius: ' + plotRadius	.toString() + '(m)';
			csvName = uriName + '.csv'
		
			Chart();	
		}
		else{showMessage('Error!','Clicked outside area with available LCMS products. Double click within selected LCMS product area');$('#summary-spinner').slideUp();}
		


	}
	catch(err){

	}

})}
// var cT = 
var marker=new google.maps.Circle({
  				center:{lat:45,lng:-111},
  				radius:5
  				});
function drawChart() {
		// if(chartType.toLowerCase() === 'histogram'){chartIncludeDate = false};
		// document.getElementById('charting-parameters').style.display = 'inline-block';
		// $("#charting-container").slideDown();
		// $("#charting-parameters").slideDown();
		// $("#whichIndexForChartingRadio").slideDown();

		 map.setOptions({draggableCursor:'help'});
		google.maps.event.addDomListener(mapDiv,"dblclick", function (e) {
			closeChart();
			$('#summary-spinner').slideDown();
			document.getElementById('curve_chart').style.display = 'none';
			document.getElementById('curve_chart_big').style.display = 'none';
			print('Map was double clicked');
			var x =e.clientX;
        	var y = e.clientY;console.log(x);
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

			map.setOptions({draggableCursor:'progress'});
			updateProgress(25)
			var p = 25
			// interval2(function(){updateProgress(p);p= p + 10}, 1000, 5)
			setTimeout(function(){chartIt();updateProgress(75);},3000);
			
			// ee.data.newTaskId(null,move);
			// ee.data.newTaskId(null,chartIt);
		
		});
		
		
      }

function closeChart(){
	updateProgress(1);
	$('#curve_chart').slideUp();

	
}
function closeBigChart(){
	$('#curve_chart_big').slideUp();
	
}
function stopCharting(){
	// document.getElementById('charting-parameters').style.display = 'none';
	$("#charting-parameters").slideUp();
	$("#whichIndexForChartingRadio").slideUp();
	marker.setMap(null);
	google.maps.event.clearListeners(mapDiv, 'dblclick');
	map.setOptions({draggableCursor:'hand'});
	updateProgress(1);
	closeChart();
	closeBigChart();
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