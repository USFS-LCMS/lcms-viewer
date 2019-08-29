var widgetsOn = true;
      var layersOn = true;
      var legendOn = true;
      var chartingOn = false;
      var distanceOn = false;
      var areaOn = false;
      var drawing = false;
      var plotsOn = true;
      var helpOn = false;
      var queryOn = false;
      var areaChartingOn = false;
      var studyAreaName = 'BTNF'
      function toggleHelp(){
        if (helpOn) {
          $("#help-window").slideUp();
          

          helpOn = false;
        } else {
          $("#help-window").slideDown();
         

          helpOn = true;
        }
      }
      function toggleWidgets() {
        if (widgetsOn) {
          $("#tool-area").slideUp();
          $("#shape-edit-container").slideUp();
          $("#export-container").slideUp();
          // $("#parameters-tools-layers").css('min-width','25%');

          widgetsOn = false;
        } else {
          $("#tool-area").slideDown();
          $("#shape-edit-container").slideDown();
          $("#export-container").slideDown();
          // $("#parameters-tools-layers").css('min-width','35%');

          widgetsOn = true;
        }
      }

        function toggleLayers() {
        if (layersOn) {
          $("#layers-container").slideUp();
          

          layersOn = false;
        } else {
          $("#layers-container").slideDown();

          layersOn = true;
        }
      }
      function togglePlotList() {
        if (plotsOn) {
          $("#plot-container").slideUp();
          

          plotsOn = false;
        } else {
          $("#plot-container").slideDown();

          plotsOn = true;
        }
      }

      function toggleLegend() {
        if (legendOn) {

          $("#legend").slideUp();
          legendOn = false;
        } else {
          $("#legend").slideDown();

          legendOn = true;
        }
      }

      function toggleCharting() {
        if (chartingOn) {
          stopCharting();
          chartingOn = false;
        } else {
          drawChart();
          chartingOn = true;
        }
      }

      function toggleDistance() {
        if (distanceOn) {
          stopDistance();
          distanceOn = false;
        } else {
          startDistance();
          distanceOn = true;
        }
      }

      function toggleArea() {
        if (areaOn) {
          stopArea();
          map.setOptions({draggableCursor:'hand'});
          areaOn = false;
        } else {
          startArea();
          areaOn = true;
        }
      }
      function toggleQuery(){
        if(queryOn){
          queryOn = false;
          stopQuery();
        }else{
          queryOn = true;
          startQuery();
        }
      }
      function toggleAreaCharting(){
        console.log('toggling area charting')
        if(areaChartingOn){
          areaChartingOn = false;
          stopAreaCharting();
        }else{
          areaChartingOn = true;

          startAreaCharting();
        }
      }
      function toggleDrawing() {
        if (drawing) {
          // shapesMap = undefined;
          drawingManager.setMap(null);
          drawing = false;
        } else {
          console.log('shapesmap');
          console.log(shapesMap)
          if (shapesMap != undefined) {
            drawingManager.setMap(map);
          } else {
            shapesMap = new ShapesMap(
              map,
              document.getElementById("delete-button"),
              document.getElementById("clear-button"),
              document.getElementById("process-button"),
              document.getElementById("export-button"),
              document.getElementById("toggle-drawing-button"),
              document.getElementById("console"));
          }
          drawing = true;
        }
      }
      
      var colSize = 'lg'
     

      function setIdCol(id,n){
        console.log(id);
        var classes = $(id).attr('class').split(' ');
        classes.map(function(c){if(c.indexOf('col-'+colSize+'-') >-1){$(id).removeClass(c)}})
        $(id).addClass('col-'+colSize+'-'+n.toString());
      }
      
      
      // function toggleRightSidebar(){
      //   var rightSidebarVisible;
      //   if($('#map').attr('class').indexOf('-6') > -1){
      //     rightSidebarVisible = true;
      //   }else{
      //     rightSidebarVisible = false;
      //   }

      //   if(!rightSidebarVisible){turnOnSidebar('right')}
      //   else{turnOffSidebar('right')}

      // }

      function findCols(){
        var mapCols = $('#map').attr('class').split(' ').filter(c => c.indexOf('col-'+colSize+'-')>-1)[0].split('col-'+colSize+'-')[1];
        var leftCols = $('#sidebar-left').attr('class').split(' ').filter(c => c.indexOf('col-'+colSize+'-')>-1)[0].split('col-'+colSize+'-')[1];
        var rightCols = $('#sidebar-right').attr('class').split(' ').filter(c => c.indexOf('col-'+colSize+'-')>-1)[0].split('col-'+colSize+'-')[1];

        return {left:parseInt(leftCols),right:parseInt(rightCols),map:parseInt(mapCols)};

      }
      function updateCols(left,right){
        var map = 12- (left + right);
      
        setIdCol('#sidebar-left',left);
        setIdCol('#sidebar-right',right);
        
        
        setIdCol('#map',map);
        
        // if(right <1){$('#legendDiv').hide();}
        // else if(right >= 1){$('#legendDiv').show();}
      }
      var leftRotate = 180;
      function toggleLeftSidebar(){
        // var state = findCols();
        // console.log(state);
       
        $('#left-sidebar-toggler').css('transform','rotate('+leftRotate.toString()+'deg)');
        leftRotate +=180;
        // if(state.left > 0){
          // updateCols(0,state.right);
        // }
        // else{
          // updateCols(3,state.right);
        // } 
         $('#sidebar-left').toggle();
      }
      var rightRotate = 180;
      function toggleRightSidebar(){
        var state = findCols();
        $('#sidebar-right').toggle();
        $('#right-sidebar-toggler').css('transform','rotate('+rightRotate.toString()+'deg)');
        rightRotate += 180;
        if(state.right > 0){
          updateCols(state.left,0);
          
        }
        else{
          updateCols(state.left,3);
          
        } 
      }
      //  function turnOnSidebar(which){
      //   var rotate = eval(which+'Rotate');
      //   $('#'+which+'-sidebar-toggler').css('transform','rotate('+rotate.toString()+'deg)');
      //   eval(which+ 'Rotate += 180;')
        
      //   setIdCol('#map',9);
      //   setIdCol('#sidebar-'+which,3);
      // };
      // function turnOffSidebar(which){
      //   $('#legendDiv').hide();
      //   setIdCol('#map',12);
      //   setIdCol('#sidebar-'+which,0);

      // };
      function toggleRadio(thisValue) {
       
        if (thisValue == 'charting') {
          // turnOnSidebar('left')
          if (distanceOn) {
            toggleDistance()
          };
          if (areaOn) {
            toggleArea()
          };
          if (drawing) {
            toggleDrawing()
          };
          if (queryOn) {
            toggleQuery()
          };
          if (areaChartingOn) {
            toggleAreaCharting()
          };
          if (!chartingOn) {
            toggleCharting()
          };
        } else if (thisValue == 'distance') {
          // turnOnSidebar('left')
          if (areaOn) {
            toggleArea()
          };
          if (chartingOn) {
            toggleCharting()
          };
          if (drawing) {
            toggleDrawing()
          };
          if (queryOn) {
            toggleQuery()
          };
          if (areaChartingOn) {
            toggleAreaCharting()
          };
          if (!distanceOn) {
            toggleDistance()
          };
        } 
        else if (thisValue == 'query') {
          // turnOnSidebar('left')
          if (areaOn) {
            toggleArea()
          };
          if (chartingOn) {
            toggleCharting()
          };
          if (drawing) {
            toggleDrawing()
          };
          if (distanceOn) {
            toggleDistance()
          };
          if (areaChartingOn) {
            toggleAreaCharting()
          };
          if (!queryOn) {
            toggleQuery()
          };
        }else if (thisValue == 'drawing') {
          if (areaOn) {
            toggleArea()
          };
          if (chartingOn) {
            toggleCharting()
          };
          if (distanceOn) {
            toggleDistance()
          };
          if (queryOn) {
            toggleQuery()
          };
          if (areaChartingOn) {
            toggleAreaCharting()
          };
          if (!drawing) {
            toggleDrawing()
          };
        } else if (thisValue == 'area') {
          // turnOnSidebar('left')
          if (drawing) {
            toggleDrawing()
          };
          if (chartingOn) {
            toggleCharting()
          };
          if (distanceOn) {
            toggleDistance()
          };
          if (queryOn) {
            toggleQuery()
          };
          if (areaChartingOn) {
            toggleAreaCharting()
          };
          if (!areaOn) {
            toggleArea()
          };
        } else if (thisValue == 'areaCharting') {
          // turnOnSidebar('left')
          if (drawing) {
            toggleDrawing()
          };
          if (chartingOn) {
            toggleCharting()
          };
          if (distanceOn) {
            toggleDistance()
          };
          if (queryOn) {
            toggleQuery()
          };
          if (areaOn) {
            toggleArea()
          };
          if (!areaChartingOn) {
            toggleAreaCharting()
          };
          
        } else if (thisValue == 'none') {
          // turnOffSidebar('right')
          if (areaOn) {
            toggleArea()
          };
          if (chartingOn) {
            toggleCharting()
          };
          if (drawing) {
            toggleDrawing()
          };
          if (queryOn) {
            toggleQuery()
          };
          if (areaChartingOn) {
            toggleAreaCharting()
          };
          if (distanceOn) {
            toggleDistance()
          };
          stopCharting();
        }
      }

      $(document).ready(function () {
         $(function(){
  $('#whichIndexRadio').change(function(){
    console.log('change');
  });
});

         // function 
         //Add tool tabs
         var distanceDiv = '<div  id="distance-measurement"  onclick=toggleDistanceAreaUnits(this.value)></div>';
         var distanceTip = "Click to toggle metric or imperial.  Drag if needed.  Click on map to start measuring.  Press 'Delete' or 'd' button to clear for area measuring and double click for distance measuring.  Press 'u' to undo last vertex placement for area measuring.  Press 'None' radio button to stop measuring";

         var areaDiv = '<div  id="area-measurement"  onclick=toggleDistanceAreaUnits(this.value)></div>'
         var areaTip = "Click to toggle metric or imperial.  Drag if needed.  Click on map to start measuring.  Press 'Delete' or 'd' button to clear for area measuring and double click for distance measuring.  Press 'u' to undo last vertex placement for area measuring.  Press 'None' radio button to stop measuring";
         
         var queryDiv = "<div  id='query-container' >Double click on map to query values of displayed layers at a location</div>";
         var queryTip = 'Double click on map to query values of displayed layers at a location';

         var pixelChartDiv = "<div  id='charting-container' >\
                            Double click on map to query LCMS data time series<br>\
                            \
                            </div>";
         var pixelChartTip = 'click here'

         addTab('Distance Measuring','toolTabs','toolDivs','distance-tab','distance-div','toggleRadio("none");toggleRadio("distance")',distanceDiv,distanceTip,false)
         addTab('Area Measuring','toolTabs','toolDivs','area-tab','area-div','toggleRadio("none");toggleRadio("area")',areaDiv,areaTip,false)
         
         addTab('Query Visible Map Layers','toolTabs','toolDivs','query-tab','query-div','toggleRadio("none");toggleRadio("query")',queryDiv,queryTip,false)
         
         addTab('Query LCMS Time Series','toolTabs','toolDivs','pixel-chart-tab','pixel-chart-div','toggleRadio("none");toggleRadio("charting")',pixelChartDiv,pixelChartTip,false)
         
   
            // $('#sidebarCollapse').on('click', function () {
            //     $('#sidebar').toggleClass('active');
            //     $('#sidebar-tools').toggle();
            //     // $('#sidebar2').toggleClass('active');

            //     $(this).toggleClass('active');
            //     // $('#lcms-layers-submenu').toggle();
            //     // $('#reference-layers-submenu').toggle();
            // });
            // $('#lcms-collapse').click();
            // $('#reference-collapse').click();
            // $('#legend-clicker').click();
            // listenForUserDefinedAreaCharting();
            $("input[name='standardOrAdvancedToggle']").change(function() {
              console.log('mode change');
                analysisMode = $("input[name='standardOrAdvancedToggle']:checked").val();
                    // if ($(this).prop('checked')) {
                    //     analysisMode = 'advanced';
                    // } else {
                    //     analysisMode = 'easy';
                    // }
                    reRun();
                });
             $("#menu-toggle").click(function(e) {
              e.preventDefault();
              $("#wrapper").toggleClass("toggled");

            });


        });

      var analysisMode = 'easy';
                
                // var viewBeta = 'no';
                var viewCONUS = 'no';

    // $('.keep-open').on({
    //   "shown.bs.dropdown": function() { this.closable = true; },
    //   "click":             function(e) { 
    //       var target = $(e.target);
    //       console.log(target);
    //       if(target.hasClass("close-button") ) 
    //           this.closable = true;
    //       else 
    //          this.closable = false; 
    //   },
    //   "hide.bs.dropdown":  function() { return this.closable; }
    // });
    $(".dropdown-menu li a").click(function(){

  $(this).parents(".btn-group").find('.selection').text($(this).text());
  $(this).parents(".btn-group").find('.selection').val($(this).text());

});

  // $("body").on("swipeleft",function(){toggleLeftSidebar()});
  // $("body").on("swiperight",function(){toggleLeftSidebar()});



// create a simple instance
// by default, it only adds horizontal recognizers
var sidebarLeftHammer = new Hammer(document.getElementById('sidebar-left'));
var mcHammer = new Hammer(document.getElementById('main-container'));
// listen to events...
// sidebarLeftHammer.on("panleft", function() {toggleLeftSidebar()});


var dontShowAgain;
if(localStorage.showIntroModal == undefined){
  localStorage.showIntroModal = 'true';
  }
if(localStorage.showIntroModal === 'true'){
  $('#introModal').modal().show();
}
$('#dontShowAgainCheckbox').change(function(){
  console.log(this.checked)
  localStorage.showIntroModal  = !this.checked;
  
});
$('#title-banner').fitText(1.2);
$('#study-area-label').fitText(1.3);

function addStudyAreaToDropdown(name,toolTip){
    console.log(name);
    $('#studyAreaDropdownList').append('<a class="dropdown-item" onclick = dropdownUpdateStudyArea("{{name}}")  href="#" data-toggle="tooltip" data-placement="top" title="'+toolTip+'">'+name+'</a>')
 }
 // addStudyAreaToDropdown('Bridger-Teton National Forest',"Bridger-Teton National Forest boundary buffered by 5km plus Star Valley");
