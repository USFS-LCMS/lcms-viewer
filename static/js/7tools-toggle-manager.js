
function stopAllTools(){
  stopArea();
  stopDistance();
  stopQuery();
  stopCharting();
  stopAreaCharting();
  stopCharting();
  Object.keys(toolFunctions).map(function(t){Object.keys(toolFunctions[t]).map(function(tt){toolFunctions[t][tt]['state'] = false})})
}
var toolFunctions = {'measuring':
                    {'area':
                      {'on':'stopAllTools();startArea();showTip("AREA MEASURING",staticTemplates.areaTip);',
                      'off':'stopAllTools();',
                      'state':false
                      },
                    'distance':
                      {'on':'stopAllTools();startDistance();showTip("DISTANCE MEASURING",staticTemplates.distanceTip);',
                      'off':'stopAllTools()',
                      'state':false
                      }
                    },
                  'pixel':
                    {
                      'query':{
                        'on':'stopAllTools();startQuery();showTip("QUERY VISIBLE MAP LAYERS",staticTemplates.queryTip);',
                        'off':'stopAllTools()',
                        'state':false
                      },
                      'chart':{
                        'on':'stopAllTools();startPixelChartCollection();showTip("QUERY LCMS TIME SERIES",staticTemplates.pixelChartTip);',
                        'off':'stopAllTools()',
                        'state':false
                      }
                    },
                    'area':
                    {
                      'userDefined':{
                        'on':'stopAllTools();areaChartingTabSelect("#user-defined");showTip("SUMMARIZE BY USER-DEFINED AREA",staticTemplates.userDefinedAreaChartTip);',
                        'off':'stopAllTools()',
                        'state':false
                      },
                      'shpDefined':{
                        'on':'stopAllTools();areaChartingTabSelect("#shp-defined");showTip("SUMMARIZE BY UPLOADED AREA",staticTemplates.uploadAreaChartTip);',
                        'off':'stopAllTools()',
                        'state':false
                      },
                      'select':{
                        'on':'stopAllTools();areaChartingTabSelect("#pre-defined");showTip("SUMMARIZE BY PRE-DEFINED AREA",staticTemplates.selectAreaChartTip);',
                        'off':'stopAllTools()',
                        'state':false
                      },
                    }
                  }

function toggleTool(tool){
  if(tool.state){
    eval(tool.off);
    // tool.state = false
  }else{
    eval(tool.on);
    tool.state = true
  }
}


