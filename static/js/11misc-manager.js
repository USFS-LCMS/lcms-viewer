function addMisc(){
	addToggle('area-tools-accordian','toggle-area-chart-collection','Chart Loss/Gain or Landcover: ',"Loss/Gain",'Landcover','true','whichAreaChartCollection','lg','lc','toggleAreaChartCollection()','Choose which LCMS time series to summarize. Loss/Gain will chart the proportion of both loss and gain over a selected area while Landcover will chart the proportion of each landcover class over a selected area.');
	addToggle('measure-distance-div','toggler-distance-units','Toggle imperial or metric units: ',"Imperial",'Metric','true','metricOrImperialDistance','imperial','metric','updateDistance()');
	addToggle('measure-area-div','toggler-area-units','Toggle imperial or metric units: ',"Imperial",'Metric','true','metricOrImperialArea','imperial','metric','updateArea()');
}
