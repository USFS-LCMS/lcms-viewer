///////////////////////////////////////////////////////////
// Sequoia run function
// if (mode === "sequoia-view") {
var seq_mon_query_clicked = false;
var site_highlights_dict = {};
// var exports;
// }
function runHiForm() {
    var generalized_counties = ee.FeatureCollection('users/timberharvestmap/gen_co20m_minatt_east');
    Map.addLayer(generalized_counties,{palette: '66ff00'}, 'counties (1:20M)', false);

    //////////////////////////////////////////////
    // Create Parameters for HiForm-BMP Processing

    // Select a single county

    var generalized_county_selected = ee.FeatureCollection('users/timberharvestmap/gen_co20m_minatt_east')
        .filter(ee.Filter.eq("co_st2", 'Madison, AL'));

    print(generalized_county_selected, 'county(s) selected');

    Map.addLayer(generalized_county_selected, {palette: '66ff00'}, 'county selected', false);

    var geometry = generalized_county_selected;

    hiform_bmp_process(geometry);
}

function hiform_bmp_process(geometry) {

    // Load a Sentinel2 pre-disturbance image

    var pre = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
        .filterDate('2022-05-21', '2022-08-21')
        .filterBounds(geometry);

    console.log(pre.size().getInfo())

    // Add NDVI and DATE as separate bands to image layer stack
    var addNDVI = function(pre) {
        var ndvi = pre.normalizedDifference(['B8', 'B4']).rename('NDVI');
        return pre.addBands(ndvi);
    };

    function addDate(pre){
        var date = ee.Date(pre.get('system:time_start'));
        var dateString = date.format('yyyyMMdd');
        var dateNumber = ee.Number.parse(dateString);
        var dateBand = ee.Image(dateNumber).uint32().rename('date');
    return pre.addBands(dateBand);}

    var pre2 = pre.map(addNDVI).map(addDate); 

    // "greenest" is for max ndvi value compositing of multiple dates
    var greenest_pre2 = pre2.qualityMosaic('NDVI');

    // Perform clip on larger extent 'bounds' image to geometry or shapefile 
    var greenest_pre2_clip = greenest_pre2.clip(geometry);

    // Display the 'pre' date raster with random colors
    Map.addLayer(greenest_pre2_clip.select('date').randomVisualizer(), {addToLegend: false}, 'pre date raster', false);

    //  Display pre products
    Map.addLayer(greenest_pre2_clip.select(['B4', 'B3', 'B2']), {min: 0, max: 2000, addToLegend: false}, 'pre natural color composite', false);


}
