var dropdownI = 1;

var topBannerParams = {
    leftWords: 'LCMS',
    centerWords: 'DATA',
    rightWords:'Explorer'
};
var  studyAreaDropdownLabel = `<h5 class = 'teal p-0 caret nav-link dropdown-toggle ' id = 'studyAreaDropdownLabel'>Bridger-Teton National Forest</h5> `

// const markup = `
// <div class="beer">
//     <h2>${beer.name}</h2>
//     <p class="brewery">${beer.brewery}</p>
// </div>
// `;
//////////////////////////////////////////////////////////////////////////////////////////////
var staticTemplates = {
	topBanner:`<h1 id = 'title-banner' data-toggle="tooltip" title="Hooray!" 
					class = 'gray pl-4 pb-0 m-0 text-center' style="font-weight:100;font-family: 'Roboto';">
					${topBannerParams.leftWords}
					<span class = 'gray' style="font-weight:1000;font-family: 'Roboto Black', sans-serif;"> ${topBannerParams.centerWords} </span>
					${topBannerParams.rightWords} </h1>`
}
//////////////////////////////////////////////////////////////////////////////////////////////
function getDropdown(id,label){return `// <div class="dropdown text-center">
					  <button class="btn btn-secondary dropdown-toggle" type="button" id="${id}-label" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					    ${label}
					  </button>
					  <div id = "${id}" class="dropdown-menu" aria-labelledby="${id}-label"></div>
					</div>`}


function addDropdownItem(id,label,onclick){
	$('#' + id).append(`<button onclick = ${onclick} class="dropdown-item" type="button">${label}</button>`)
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



function addModal(containerID,modalID){
	if(containerID === null || containerID === undefined){containerID = 'main-container'};
	if(modalID === null || modalID === undefined){modalID = 'modal-id'};
	$('#'+ containerID).append(`
            <div id = "${modalID}" class="modal fade " role="dialog">
            	<div class="modal-dialog modal-lg ">
            		<div class="modal-content bg-black">
            		<button type="button" class="close p-2 ml-auto" data-dismiss="modal">&times;</button>
	            		<div class="modal-header py-0" id ="${modalID}-header"></div>
	      				<div id ="${modalID}-body" class="modal-body bg-white" ></div>
			          	<div class="modal-footer" id ="${modalID}-footer"></div>
        			</div>
        		</div> 
        	</div>`
        	)
}
function addModalTitle(modalID,title){
	if(modalID === null || modalID === undefined){modalID = 'modal-id'};
	// $('#'+modalID+' .modal-title').html('');
	$('#'+modalID+' .modal-header').append(`<h4 class="modal-title" id = 'chart-title'>${title}</h4>`);

}

function clearModal(modalID){
	if(modalID === null || modalID === undefined){modalID = 'modal-id'};
	$('#'+modalID+' .modal-title').html('')
	$('#'+modalID+'-body').html('');
	$('#'+modalID+'-footer').html('');
}

function addStudyAreaToDropdown(name,toolTip){
  var sa = document.createElement("variable-study-area");
  sa.name = name;
  sa.tooltip = toolTip;
  var saList = document.querySelector("study-area-list");
    saList.insertBefore(sa,saList.firstChild);
    
    // $('#studyAreaDropdownList').append('<a class="dropdown-item" onclick = "dropdownUpdateStudyArea("Bridger-Teton National Forest")"  href="#" data-toggle="tooltip" data-placement="top" title="'+toolTip+'">'+name+'</a>')
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
	if(show === true || show === 'true' || show === 'show'){show = 'show';collapsed = ''; }else{show = '';collapsed='collapsed'}
	var collapseTitleDiv = `<div   class="panel-heading px-4 py-2 " role="tab" id="${collapseLabelID}" onclick = '${onclick}'>
	<h5 class="panel-title  ${collapsed}" data-toggle="collapse"  href="#${collapseID}" aria-expanded="false" aria-controls="${collapseID}"> <a class = 'collapse-title' >
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

	var collapseDiv =`<div id="${collapseID}" class="panel-collapse collapse panel-body ${show} px-2 py-0" role="tabpanel" aria-labelledby="${collapseLabelID}"></div>`;
	$('#'+containerID).append(collapseTitleDiv);
	$('#'+containerID).append(collapseDiv);
}

function addAccordianContainer(parentContainerID,accordianContainerID){
  $('#' + parentContainerID).append(`<div class="accordion" id="${accordianContainerID}"></div>`);
    
}
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
      <div id="${accordianCardBodyID}" class=" panel-collapse collapse panel-body px-4 py-0 collapse ${show}" aria-labelledby="${accordianCardHeaderID}"
        data-parent="#${accordianContainerID}">
        <div rel="txtTooltip" data-toggle="tooltip"  title="${toolTip}">${accordianCardBodyContent}</div>
      </div>
    </div>`)
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

