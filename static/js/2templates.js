var dropdownI = 1;

var topBannerParams = {
    leftWords: 'LCMS',
    centerWords: 'DATA',
    rightWords:'Explorer'
};
var  studyAreaDropdownLabel = `<h5 class = 'teal p-0 caret nav-link dropdown-toggle ' id = 'studyAreaDropdownLabel'>Bridger-Teton National Forest</h5> `



var staticTemplates = {
	map:`<div class = ' map' id = 'map'> </div>`,

	mainContainer: `<div class = 'container main-container' id = 'main-container'></div>`,
	sidebarLeftToggler:`<div href="#" class="fa fa-bars m-0 px-1 py-2 m-0 sidebar-toggler " onclick = "$('#sidebar-left').toggle('fade')"></div>`,
	sidebarLeftContainer: `<div style = 'position: absolute;left:0%;top:0%;'class = 'col-sm-7 col-md-5 col-lg-4 col-xl-3 sidebar show p-0 m-0 flexcroll  bg-image' id = 'sidebar-left-container' >
					        <div id = 'sidebar-left-header'></div>
					        <div id = 'sidebar-left'></div>
					    </div>`,

	geeSpinner : `<img rel="txtTooltip" data-toggle="tooltip"  title="Background processing is occurring in Google Earth Engine"id='summary-spinner' class="fa fa-spin" src="images/GEE_logo_transparent.png" alt="" style='position:absolute;display: none;right:40%; bottom:40%;width:8rem;height:8rem;z-index:10000000;'>`,


	topBanner:`<h1 id = 'title-banner' data-toggle="tooltip" title="Hooray!" class = 'gray pl-4 pb-0 m-0 text-center' style="font-weight:100;font-family: 'Roboto';">${topBannerParams.leftWords}<span class = 'gray' style="font-weight:1000;font-family: 'Roboto Black', sans-serif;"> ${topBannerParams.centerWords} </span>${topBannerParams.rightWords} </h1>
		        <ul class = 'navbar-nav  px-5  m-0 text-center'   >
		            <li   class="nav-item dropdown navbar-dark navbar-nav nav-link p-0col-12  "  data-toggle="dropdown">
		                <h5 href = '#' onclick = "$('#sidebar-left').show('fade')" class = 'teal p-0 caret nav-link dropdown-toggle ' id='study-area-label'  >Bridger-Teton National Forest</h5> 
		                <div class="dropdown-menu  " >
		                    <study-area-list    id="study-area-list"></study-area-list>
		                </div>
		            </li>
		        </ul>`,
	introModal:`<div class="modal fade "  id="introModal" tabindex="-1" role="dialog" >
                <div class="modal-dialog modal-md " role="document">
                    <div class="modal-content text-dark" style = 'background-color:rgba(230,230,230,0.95);'>
                        <button type="button" class="close p-2 ml-auto text-dark" data-dismiss="modal">&times;</button>
                        <div class = 'modal-header'>
                            <h3 class="mb-0 ">Welcome to the Landscape Change Monitoring System (LCMS) Data Explorer!</h3>
                        </div>

                        <div class="modal-body">
                            <p class="pb-3 ">LCMS is a landscape change detection program developed by the USDA Forest Service. This application is designed to provide a visualization of the Landscape Change products, related geospatial data, and provide a portal to download the data.</p>
                        </div>
                        <div class = 'modal-footer'>
                            <div class="form-check  mr-0">
                                <input type="checkbox" class="form-check-input" id="dontShowAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
                                <label class=" text-uppercase form-check-label " for="dontShowAgainCheckbox" >Don't show again</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`,
	bottomBar:`<div class = 'bottombar' >
				<p class = 'px-2 my-1' style = 'float:left'; id='current-tool-selection'></p>
                <p class = 'px-2 my-1' style = 'float:right;' id='current-mouse-position'  ></p>

                 <a href="http://www.fs.fed.us//" target="_blank" >
                    <img src="images/usfslogo.png" class = 'image-icon-bar'  href="#"  rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Click to learn more the US Forest Service">
                </a>
                <a href="https://www.fs.fed.us/gstc/" target="_blank"  >
                <img src="images/GTAC_Logo.png" class = 'image-icon-bar' alt="GTAC Logo"  href="#" class 'dual-range-slider-container' rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Click to learn more about the Geospatial Technology and Applications Center (GTAC)">
            </a>
              <a href="https://www.redcastleresources.com/" target="_blank"  >
                <img src="images/RCR-logo.jpg"  class = 'image-icon-bar'alt="RedCastle Inc. Logo"  href="#" class 'dual-range-slider-container' rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Click to learn more about RedCastle Resources Inc.">
            </a>
            <a href="https://earthengine.google.com/" target="_blank"  >
                <img src="images/GEE.png"   class = 'image-icon-bar' alt="Powered by Google Earth Engine"  href="#" class 'dual-range-slider-container' rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Click to learn more about Google Earth Engine">
            </a>

        </div>`,

    paramsDiv:`<div class = 'm-1' >
    <variable-radio  onclick1 = toggleAdvancedOff() onclick2 = toggleAdvancedOn() var='analysisMode' title2='Choose which mode:' name2='Advanced' name1='Standard' value2='advanced' value1='easy' type='string' href="#" rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Standard mode provides the core LCMS products based on carefully selected parameters. Advanced mode provides additional LCMS products and parameter options"></variable-radio>
  </div>
  
  <div class="dropdown-divider p-0 m-0" style = 'width:100%'></div>
  
  
      <div  class='dual-range-slider-container px-1' rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Years of LCMS data to include for land cover, land use, loss, and gain">
        <div class='dual-range-slider-name py-2'>Choose analysis year range:</div>
        <div id="slider1" class='dual-range-slider-slider' href = '#'></div>
        <div id='date-range-value1' class='dual-range-slider-value p-2'></div>
    </div>
    
  

  <div class="dropdown-divider"></div>
  <div id='threshold-container' style="display: none;width:100%">

   
        <div  class='dual-range-slider-container px-1' rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Threshold window for detecting loss.  Any loss probability within the specified window will be flagged as loss ">
            <div class='dual-range-slider-name py-2'>Choose loss threshold:</div>
            <div id="slider2" class='dual-range-slider-slider'></div>
            <div id='declineThreshold' class='dual-range-slider-value  p-2'></div>
        </div>
    
    
    <div class="dropdown-divider"></div>
    <div  class='dual-range-slider-container px-1' rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Threshold window for detecting gain.  Any gain probability within the specified window will be flagged as gain ">
        <div class='dual-range-slider-name  py-2'>Choose gain threshold:</div>
        <div id="slider3" class='dual-range-slider-slider'></div>
        <div id='recoveryThreshold' class='dual-range-slider-value  p-2'></div>
    </div>
  
    
    
    </div>

    
  <div id='advanced-radio-container' style="display: none;">
    <div class="dropdown-divider"></div>
  
   <variable-radio var='applyTreeMask' title2='Constrain analysis to areas with trees:' name2='No' name1='Yes' value2='no' value1='yes' type='string' href="#" rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Whether to constrain LCMS products to only treed areas. Any area LCMS classified as tree cover 2 or more years will be considered tree. Will reduce commission errors typical in agricultural and water areas, but may also reduce changes of interest in these areas."></variable-radio>

    <div class="dropdown-divider"></div>
       <variable-radio var='viewBeta' title2='View beta outputs:' name2='Yes' name1='No' value2='yes' value1='no' type='string' href="#" rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Whether to view products that are currently in beta development"></variable-radio>

    <div class="dropdown-divider"></div>
    <variable-radio var='summaryMethod' title2='Summary method:' name2='Highest probability' name1='Most recent year' value2='prob' value1='year' type='string' href="#" rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="How to choose which value for loss and gain to display/export.  Choose the value with the highest probability or from the most recent year above the specified threshold"></variable-radio>
       <div class="dropdown-divider"></div>
       <variable-radio  id = 'whichIndexRadio' var='whichIndex' title2='Index for charting:' name2='NBR' name1='NDVI' value2='NBR' value1='NDVI' type='string' href='#'rel="txtTooltip" data-toggle="tooltip" data-placement="top" title='The vegetation index that will be displayed in the "Query LCMS Time Series" tool' ></variable-radio>
        <div class="dropdown-divider"></div>
    </div>
	<button onclick = 'reRun()' class = 'mb-1 ml-1 btn ' href="#" rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Once finished changing parameters, press this button to refresh maps">Submit</button>`,
downloadDiv :`<label class = 'p-0' for="downloadDropdown">Select product to download:</label>
			<select class="form-control" id = "downloadDropdown" onchange = "downloadSelectedArea()""></select>`,
supportDiv :`<div class = 'p-0 pb-2' >
				<a style = 'color:var(--deep-brown-100)!important;' rel="txtTooltip" data-toggle="tooltip" title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov">
					<br>
					<i class="fa fa-envelope" style = 'color:var(--deep-brown-100)!important;'aria-hidden="true"></i>
					Please contact the LCMS help desk <span href = "mailto: sm.fs.lcms@usda.gov">(sm.fs.lcms@usda.gov)</span> if you have questions or comments about LCMS products, the LCMS program, or feedback on the LCMS Data Explorer</a>
				<div class="dropdown-divider"></div>
				<label class = 'mt-2'>If you turned off tool tips, but want them back:</label>
				<button  class = 'btn  bg-black' onclick = 'showToolTipsAgain()'>Show tooltips</button>
			</div>`,
distanceDiv : `Click on map to measure distance`,
imperialMetricToggle:`<variable-radio var='metricOrImperial' title2='' name2='Metric' name1='Imperial' value2='metric' value1='imperial' type='string' href="#" rel="txtTooltip" data-toggle="tooltip" data-placement="top" title='Toggle between imperial or metric units'></variable-radio>`,
distanceTip : "Click on map to measure distance. Double click to clear measurment and start over.",
areaDiv : `Click on map to measure area`,
areaTip : "Click on map to measure area. Double click to complete polygon, press u to undo most recent point, press d or delete to start over.",
queryDiv : "<div>Double click on map to query values of displayed layers at a location</div>",
queryTip : 'Double click on map to query the values of the visible layers.  Only layers that are turned on will be queried.',
pixelChartDiv : `<div>Double click on map to query LCMS data time series<br></div>`,
pixelChartTip : 'Double click on map to look at the full time series of LCMS outputs for a pixel.',
userDefinedAreaChartDiv : `<div  id="user-defined" >
                                    
                                    <label>Provide name for area selected for charting (optional):</label>
                                    <input type="user-defined-area-name" class="form-control" id="user-defined-area-name" placeholder="Name your charting area!" style='width:80%;'>
                                    
                                    <button  class = 'my-1' onclick='areaChartingTabSelect(whichAreaDrawingMethod);startUserDefinedAreaCharting()'  href="#" rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Click to clear chart and currently defined charting area, or if you messed up while defining your area to chart"><i class="fa fa-trash fa-2x bg-white" aria-hidden="true"></i>
                                    </button>
                        		</div>`,

userDefinedAreaChartTip : 'Click on map to select an area to summarize LCMS products across. Double-click to finish polygon and create graph.',

uploadAreaChartDiv : `<label>Choose a zipped shapefile or geoJSON file to summarize across</label>
                        
                        <input class = 'file-input my-1' type="file" id="areaUpload" name="upload" accept=".zip,.geojson,.json" style="display: inline-block;">
                        `,
uploadAreaChartTip : 'Select zipped shapefile (zip into .zip all files related to the shapefile) or a single .geojson file to summarize LCMS Loss and Gain products across.',
selectAreaChartDiv : `<i rel="txtTooltip" data-toggle="tooltip"  title="Selecting pre-defined summary areas for chosen LCMS study area" id = "select-area-spinner" class="text-dark px-2 fa fa-spin fa-spinner"></i>
                    <select class = 'form-control' style = 'width:100%;'  id='forestBoundaries' onchange='chartChosenArea()'></select>`,
selectAreaChartTip : 'Select from pre-defined areas to summarize LCMS Loss and Gain products across.'



        
}
//////////////////////////////////////////////////////////////////////////////////////////////
function showToolTipsAgain(){
	if(localStorage.showToolTipModal === 'false'){
		localStorage.showToolTipModal = 'true';
		showMessage('Success','Tool tips are re-activated')
	}
	else{
		showMessage('Nothing to change','Tool tips are already active')
	}
	
}
// function getDropdown(id,label){return `<div class="dropdown text-center">
// 					  <button class="btn btn-secondary dropdown-toggle" type="button" id="${id}-label" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
// 					    ${label}
// 					  </button>
// 					  <div id = "${id}" class="dropdown-menu" aria-labelledby="${id}-label"></div>
// 					</div>`}


// function addDropdownItem(id,label,onclick){
// 	$('#' + id).append(`<button onclick = '${onclick}' class="dropdown-item" type="button">${label}</button>`)
// }
function addDropdown(containerID,dropdownID,dropdownLabel,variable,tooltip){
	if(tooltip === undefined || tooltip === null){tooltip = ''}
	$('#' + containerID).append(`<div id="${dropdownID}-container" class="form-group" data-toggle="tooltip" data-placement="top" title="${tooltip}">
								  <label for="${dropdownID}">${dropdownLabel}:</label>
								  <select class="form-control" id="${dropdownID}"></select>
								</div>`)
	
	  $("select#"+dropdownID).on("change", function(value) {
	  	// console.log('it changed');
	  	// console.log($(this).val());
	  	eval(`window.${variable} = $(this).val()`);
	  });
	
}
function addDropdownItem(dropdownID,label,value){
	$('#'+dropdownID).append(`<option value = "${value}">${label}</option>`)
}
	
//////////////////////////////////////////////////////////////////////////////////////////////

const setRadioValue =function(variable,value){
	console.log(value)
	window[variable] = value;
	};
function getRadio(id,label,name1,name2,variable,value1,value2){
	
	
	return `<div class = 'container'><div id = '${id}-row' class = 'row'>
		<label class="col-sm-4">${label}</label>
		<div class = 'col-sm-8'>
		<div  id = '${id}' class="toggle_radio">

	  	
	    <input type="radio" checked class="toggle_option first_toggle" id="first_toggle${id}" name="toggle_option" onclick="setRadioValue('${variable}','${value1}')"  >
	    <input type="radio"  class="toggle_option second_toggle" id="second_toggle${id}" name="toggle_option" onclick="setRadioValue('${variable}','${value2}')"  >
	    
	    <label for="first_toggle${id}"><p>${name1}</p></label>
	    <label for="second_toggle${id}"><p>${name2}</p></label>
	    
	    <div class="toggle_option_slider">
	    </div>
	    </div>
 
	</div>
	</div>
	</div>`
	}

function getDiv(containerID,divID,label,variable,value){
	eval(`var ${variable} = ${value}`)
	console.log('hello');
	console.log(eval(variable));
	var div = `<div id = "${divID}">${label}</div>`;
	$('#'+containerID).append(div);
	$('#'+ divID).click(function(){eval(`${variable}++`);console.log(eval(variable));$('#'+divID).append(eval(variable));})

}

function getToggle(containerID,toggleID,onLabel,offLabel,onValue,offValue,variable,checked){
	if(checked === undefined || checked === null || checked === 'true' || checked === 'checked'){
		checked = true;
	}
	else if(checked === 'false' || checked === ''){
		checked = false;
	}

	// var value;
	var valueDict = {true:onValue,false:offValue};
	// if(!checked){checked = true};
	// if(checked === 'on'|| checked === 'true'|| checked === true){checked = 'checked';value = onValue}
	// if(checked === 'off'|| checked === 'false' || checked === false){checked = '';value = offValue}

	eval(`window.${variable} = valueDict[checked]`)
	var toggle = `<input id = "${toggleID}" class = 'p-0 m-0' type="checkbox"  data-toggle="toggle" data-on="${onLabel}" data-off="${offLabel}" data-onstyle="toggle-on" data-offstyle="toggle-off"><br>`;
	$('#'+containerID).append(toggle);
	if(checked){
		$('#'+toggleID).bootstrapToggle('on')
	}
	$('#'+containerID).click(function(){
		var value = $('#'+toggleID).prop('checked');
		console.log(value);
		eval(`window.${variable} = valueDict[${value}]`)
	// 	value = valueDict[value];
	// 	console.log(valueDict);console.log(value)
		// eval(`window.${variable} = ${value}`)
	})
}

function updateDistanceColor(jscolor) {
    distancePolylineOptions.strokeColor = '#' + jscolor;
    if(distancePolyline !== undefined){
        distancePolyline.setOptions(distancePolylineOptions);
    }
}
function updateUDPColor(jscolor) {
    udpOptions.strokeColor = '#' + jscolor;
    if(udp !== undefined){
        udp.setOptions(udpOptions);
    }
}
function addColorPicker(containerID,pickerID,updateFunction){
    $('#'+containerID).append(`<p id = '${pickerID}' class = 'pt-2'>Choose color:<input class="jscolor {onFineChange:'${updateFunction}(this)'}" value="${distancePolylineOptions.strokeColor}"></p>`)
}

function addModal(containerID,modalID,bodyOnly){
	if(bodyOnly === null || bodyOnly === undefined){bodyOnly = false};
	if(containerID === null || containerID === undefined){containerID = 'main-container'};
	if(modalID === null || modalID === undefined){modalID = 'modal-id'};
	$('#'+modalID).remove();
	if(bodyOnly){
	$('#'+ containerID).append(`<div id = "${modalID}" class="modal fade " role="dialog">
            	<div class="modal-dialog modal-md ">
            		<div class="modal-content bg-white">
            			
	            		<div style = ' border-bottom: 0 none;'class="modal-header pb-0" id ="${modalID}-header">
	            			<button style = 'float:right;' type="button" class="close text-dark" data-dismiss="modal">&times;</button>
	            		</div>
	      				<div id ="${modalID}-body" class="modal-body bg-white " ></div>
			          	
        			</div>
        		</div> 
        	</div>`
        	)
	}else{
	$('#'+ containerID).append(`
            <div id = "${modalID}" class="modal fade " role="dialog">
            	<div class="modal-dialog modal-lg ">
            		<div class="modal-content bg-black">
            		<button type="button" class="close p-2 ml-auto" data-dismiss="modal">&times;</button>
	            		<div class="modal-header py-0" id ="${modalID}-header"></div>
	      				<div id ="${modalID}-body" class="modal-body " style = 'background:#DDD;' ></div>
			          	<div class="modal-footer" id ="${modalID}-footer"></div>
        			</div>
        		</div> 
        	</div>`
        	)
	}
}
function addModalTitle(modalID,title){
	if(modalID === null || modalID === undefined){modalID = 'modal-id'};
	// $('#'+modalID+' .modal-title').html('');
	$('#'+modalID+' .modal-header').prepend(`<h4 class="modal-title" id = '${modalID}-title'>${title}</h4>`);

}

function clearModal(modalID){
	if(modalID === null || modalID === undefined){modalID = 'modal-id'};
	// $('#'+modalID).empty();

	$('#'+modalID+'-title .modal-title').html('')
	$('#'+modalID+'-header').html('');
	$('#'+modalID+'-body').html('');
	$('#'+modalID+'-footer').html('');
	$('.modal').modal('hide');
	$('.modal-backdrop').remove()
}

function showMessage(title,message,modalID,show){
	if(title === undefined || title === null){title = ''}
	if(message === undefined || message === null){message = ''}
	if(show === undefined || show === null){show = true}
	if(modalID === undefined || modalID === null){modalID = 'error-modal'}
	
	clearModal(modalID);
	addModal('main-container',modalID,true);
	addModalTitle(modalID,title);
	$('#'+modalID+'-body').append(message);
	if(show){$('#'+modalID).modal();}

};

function showTip(title,message){
	showMessage('','<span class = "font-weight-bold text-uppercase" >'+ title +' </span><span>' +message + '</span>','tip-modal',false)

	$('#tip-modal-body').append(`<form class="form-inline pt-3 pb-0">
								  
								  <div class="checkbox">
								    <label class = 'text-uppercase form-check-label '>
								    	<input type="checkbox"   id="dontShowTipAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
								    Turn off tips</label>
								  </div>
								  
								</form>`)
	// .append(`
	// 							<div class="form-check  pt-3 pb-0">
 //                                 <input type="checkbox" class="form-check-input" id="dontShowTipAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
 //                                 <label class=" text-uppercase form-check-label " for="dontShowTipAgainCheckbox" >Turn off tips</label>
 //                             </div>`)
	if(localStorage.showToolTipModal == undefined || localStorage.showToolTipModal == "undefined"){
	  localStorage.showToolTipModal = 'true';
	  }
	if(localStorage.showToolTipModal === 'true'){
	  $('#tip-modal').modal().show();
	}
	$('#dontShowTipAgainCheckbox').change(function(){
	  console.log(this.checked)
	  localStorage.showToolTipModal  = !this.checked;
});
	// var modalID = 'tip-modal'
	//  // clearModal(modalID)
 //  	$('#'+modalID).empty();

 //  $('#main-container').append(`<div class="modal fade "  id="${modalID}" tabindex="-1" role="dialog" >
 //                <div class="modal-dialog modal-md " role="document">
 //                    <div class="modal-content text-dark" style = 'background-color:rgba(230,230,230,0.95);'>
 //                        <button type="button" class="close p-2 ml-auto" data-dismiss="modal">&times;</button>
                  

 //                        <div id = '${modalID}-body' class="modal-body">
 //                            <h3 class="mb-0 ">${title}</h3><p class="pb-3 ">${message}</p>
 //                        </div>
 //                        <div id = '${modalID}-footer' class = 'modal-footer'>
 //                            <div class="form-check  mr-0">
 //                                <input type="checkbox" class="form-check-input" id="dontShowAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
 //                                <label class=" text-uppercase form-check-label " for="dontShowAgainCheckbox" >Don't show again</label>
 //                            </div>
 //                        </div>
 //                    </div>
 //                </div>
 //            </div>`)
 //  $('#tip-modal').modal();
}
function addStudyAreaToDropdown(name,toolTip){
  var sa = document.createElement("variable-study-area");
  sa.name = name;
  sa.tooltip = toolTip;
  var saList = document.querySelector("study-area-list");
    saList.insertBefore(sa,saList.firstChild);
    
    // $('#studyAreaDropdownList').append('<a class="dropdown-item" onclick = "dropdownUpdateStudyArea("Bridger-Teton National Forest")"  href="#" data-toggle="tooltip" data-placement="top" title="'+toolTip+'">'+name+'</a>')
 }
 function addToggle(containerDivID,toggleID,title,onLabel,offLabel,on,variable,valueOn,valueOff,onChangeFunction,tooltip){
    var valueDict = {true:valueOn,false:valueOff};
    var checked;
    if(tooltip === undefined || tooltip === null){tooltip = ''}
    if(on === null || on === undefined || on === 'checked' || on === 'true'){on = true;checked = 'checked';}
    else {on = false;checked = ''};
    // console.log('on');console.log(on);console.log(valueDict[on]);
    eval(`window.${variable} = valueDict[on];`);
    // try{
    // 	eval(`${onChangeFunction}`);
    // }catch(err){
    // 	console.log('Adding toggle error: ' + err);
    // }
    
    $('#'+containerDivID).append(`<div data-toggle="tooltip" data-placement="top" title="${tooltip}" >${title}<input  id = "${toggleID}" data-onstyle="dark" data-offstyle="light" data-style="border" type="checkbox" data-on="${onLabel}" data-off="${offLabel}"  ${checked} data-toggle="toggle" data-width="100" data-onstyle="dark" data-offstyle="light" data-style="border" data-size="small" ></div>`)
    $('#'+toggleID).change(function(){
        var value = valueDict[$('#'+toggleID).prop('checked')];
        eval(`window.${variable} = value;`);
        eval(`${onChangeFunction}`); 
    })
}
 //////////////////////////////////////////////
//Functio to add tab to list
function addTab(tabTitle,tabListID, divListID,tabID, divID,tabOnClick,divHTML,tabToolTip,selected){  
  if(!tabToolTip){tabToolTip = ''};
  var show;
  if(selected || selected === 'true'){show = 'active show'}else{show = ''};

  $("#" + tabListID ).append(`<li class="nav-item"><a onclick = '${tabOnClick}' class="nav-link text-left text-dark tab-nav-link ${show}" id="'+tabID+'" data-toggle="tab" href="#${divID}" role="tab" aria-controls="${divID}" aria-selected="false" rel="txtTooltip" data-toggle="tooltip"  title="${tabToolTip}">${tabTitle}</a></li>`);

  $('#'+divListID).append($(`<div class="tab-pane fade ${show}" id="${divID}" role="tabpanel" aria-labelledby="${tabID}" rel="txtTooltip" data-toggle="tooltip"  title="${tabToolTip}"></div>`).append(divHTML))

    };
/////////////////////////////////////////////////////////////////////////////////////////////
function addTabContainer(containerID,tabListID,divListID){
	$('#'+ containerID).append(`<ul class="pb-1 nav nav-tabs flex-column nav-justified md-tabs" id="${tabListID}" role="tablist">  
    </ul>
    <div class = 'tab-content card' id = '${divListID}'>
    </div>`);
}
// function addAccordianContainer(containerID,tabListID,divListID){
// 	$('#'+ containerID).append(`<ul class="pb-1 nav nav-tabs flex-column nav-justified md-tabs" id="${tabListID}" role="tablist">  
//     </ul>
//     <div class = 'tab-content card' id = '${divListID}'>
//     </div>`);
// }
function addCollapse(containerID,collapseLabelID,collapseID,collapseLabel, collapseLabelIcon,show,onclick,toolTip){
	var collapsed;
	if(toolTip === undefined || toolTip === null){toolTip = ''}
	if(show === true || show === 'true' || show === 'show'){show = 'show';collapsed = ''; }else{show = '';collapsed='collapsed'}
	var collapseTitleDiv = `<div   rel="txtTooltip" data-toggle="tooltip"  title="${toolTip}" class="panel-heading px-3 py-2 " role="tab" id="${collapseLabelID}" onclick = '${onclick}'>
	<h5 class="p-0 m-0 panel-title  ${collapsed}" data-toggle="collapse"  href="#${collapseID}" aria-expanded="false" aria-controls="${collapseID}"> <a class = 'collapse-title' >
	${collapseLabelIcon} ${collapseLabel} </a></h5></div>`;

	var collapseDiv =`<div id="${collapseID}" class="panel-collapse collapse panel-body ${show} px-5 py-0" role="tabpanel" aria-labelledby="${collapseLabelID}"></div>`;
	$('#'+containerID).append(collapseTitleDiv);
	$('#'+containerID).append(collapseDiv);
}

function addSubCollapse(containerID,collapseLabelID,collapseID,collapseLabel, collapseLabelIcon,show,onclick){
	var collapsed;
	if(show === true || show === 'true' || show === 'show'){show = 'show';collapsed = ''; }else{show = '';collapsed='collapsed'}


	var collapseTitleDiv = `<div   class="panel-heading px-0 py-2 " role="tab" id="${collapseLabelID}" onclick = '${onclick}'>
	<h5 class="sub-panel-title ${collapsed}" data-toggle="collapse"  href="#${collapseID}" aria-expanded="false" aria-controls="${collapseID}"> <a class = 'collapse-title' >
	${collapseLabelIcon} ${collapseLabel} </a></h5></div>`;

	var collapseDiv =`<div id="${collapseID}" class="panel-collapse collapse panel-body ${show} px-1 py-0" role="tabpanel" aria-labelledby="${collapseLabelID}"></div>`;
	$('#'+containerID).append(collapseTitleDiv);
	$('#'+containerID).append(collapseDiv);
}

function addAccordianContainer(parentContainerID,accordianContainerID){
  $('#' + parentContainerID).append(`<div class="accordion" id="${accordianContainerID}"></div>`);
    
}
var panelCollapseI = 1;
function addAccordianCard(accordianContainerID,accordianCardHeaderID, accordianCardBodyID,accordianCardHeaderContent,accordianCardBodyContent,show,onclick,toolTip){
  var collapsed;
  if(toolTip === undefined || toolTip === null){toolTip = '';}
  if(show === true || show === 'true' || show === 'show'){show = 'show';collapsed = ''; }else{show = '';collapsed='collapsed'}
  $('#' + accordianContainerID).append(`
    <div>
      <div class=" px-0 py-2 sub-panel-title ${collapsed}" id="${accordianCardHeaderID}" data-toggle="collapse" data-target="#${accordianCardBodyID}"
        aria-expanded="false" aria-controls="${accordianCardBodyID}" onclick = '${onclick}'>
      <a class = 'collapse-title' rel="txtTooltip" data-toggle="tooltip"  title="${toolTip}"  >
        ${accordianCardHeaderContent} </a>
      </div>
      <div id="${accordianCardBodyID}" class="panel-collapse-${panelCollapseI} super-panel-collapse panel-collapse collapse panel-body pl-3 py-0  ${show} bg-black" aria-labelledby="${accordianCardHeaderID}"
        data-parent="#${accordianContainerID}">
        <div rel="txtTooltip" data-toggle="tooltip"  title="${toolTip}">${accordianCardBodyContent}</div>
      </div>
    </div>`)
  // $('#'+accordianCardBodyID+'.super-panel-collapse').on('hidden.bs.collapse', function () {
  	// find the children and close them
  	// $(!this).find('.show').collapse('hide');
  	// console.log('hello')
  	// $('.panel-collapse.show.collapse.toggle-collapse').collapse('hide');
  	// stopAllTools();
	// });
  panelCollapseI++;
}

function addSubAccordianCard(accordianContainerID,accordianCardHeaderID, accordianCardBodyID,accordianCardHeaderContent,accordianCardBodyContent,show,onclick,toolTip){
  var collapsed;
  if(toolTip === undefined || toolTip === null){toolTip = '';}
  if(show === true || show === 'true' || show === 'show'){show = 'show';collapsed = ''; }else{show = '';collapsed='collapsed'}
  $('#' + accordianContainerID).append(`
    <div>
      <div class=" px-0 py-2 sub-sub-panel-title ${collapsed}" id="${accordianCardHeaderID}" data-toggle="collapse" data-target="#${accordianCardBodyID}"
        aria-expanded="false" aria-controls="${accordianCardBodyID}" onclick = '${onclick}'>
      <a class = 'collapse-title' rel="txtTooltip" data-toggle="tooltip"  title="${toolTip}"  >
        ${accordianCardHeaderContent} </a>
      </div>
      <div id="${accordianCardBodyID}" class="panel-collapse-${panelCollapseI} toggle-collapse panel-collapse collapse panel-body pl-3 py-0  ${show} bg-black" aria-labelledby="${accordianCardHeaderID}"
        data-parent="#${accordianContainerID}">
        <div rel="txtTooltip" data-toggle="tooltip"  title="${toolTip}">${accordianCardBodyContent}</div>
      </div>
    </div>`)
 //  $('.panel-collapse.toggle-collapse').on('hidden.bs.collapse', function () {
 //  	console.log('hello')
 //  	// find the children and close them
 //  	$(this).find('.show').collapse('hide');
 //  	// $('.panel-collapse.show.collapse.toggle-collapse').collapse('hide');
	// });
  
  panelCollapseI++;
}
function addLegendContainer(legendContainerID,containerID,show){
	if(containerID === undefined || containerID === null){containerID = 'legend-collapse-div'}
	if(show === undefined || show === null){show = true}
	if(show){show = 'block'}
	else{show = 'none'}
	$('#' + containerID).append(`<div style = 'display:${show};' id = '${legendContainerID}'></div>`);
}

function addClassLegendContainer(classLegendContainerID,legendContainerID,classLegendTitle){
	$('#'+legendContainerID).append(`<div  class='legend-title'>${classLegendTitle}</div>
    								<div class='legend-scale'>
        								<ul id = "${classLegendContainerID}" class='legend-labels'>
            								
        								</ul>
    								</div>`)
}
function addClassLegendEntry(classLegendContainerID,title,color){
	$('#'+classLegendContainerID).append(`<li ><span style='background:${color};'></span>${title}</li>`)
}

