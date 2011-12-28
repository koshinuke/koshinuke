function renderBranchActivity(target, json, configs) {
	var barChart = new $jit.BarChart({
		//id or element of the visualization container
		injectInto : target,
		animate : true,
		hoveredColor : '#9fd4ff',
		orientation : 'vertical',
		barsOffset : 3,
		type : 'stacked',
		showAggregates : false,
		showLabels : false,
		Label : {
			size : 0
		},
		Tips : {
			offsetX : 0,
			offsetY : 0,
			enable : true,
			onShow : function(tip, elem) {
				tip.innerHTML = elem.label + ' ' + elem.value + ' commits';
			}
		}
	});
	barChart.loadJSON(json);
	return {
		chart : barChart,
		data : json
	};
};

function resizeGraph(HANDLE, w, h) {
	var chart = HANDLE.chart;
	if(chart.busy == false) {
		chart.canvas.resize(w, h);
		chart.updateJSON(HANDLE.data);
		return true;
	}
	return false;
};
