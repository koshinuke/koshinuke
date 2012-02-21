function renderBranchActivity(target, json, configs) {
	var barChart = new $jit.BarChart({
		//id or element of the visualization container
		injectInto : target,
		animate : true,
		hoveredColor : '#9fd4ff',
		orientation : 'vertical',
		barsOffset : 1,
		type : 'stacked',
		showAggregates : false,
		showLabels : true,
		Label : {
			color: 'black'
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

function resizeGraph(HANDLE) {
	var chart = HANDLE.chart;
	if(chart.busy == false) {
		var wrapper = chart.canvas.getElement();
		var p = wrapper.parentNode;
		chart.canvas.resize(p.offsetWidth, p.offsetHeight);
		chart.updateJSON(HANDLE.data);
		return true;
	}
	return false;
};

function disposeGraph(HANDLE) {
	var chart = HANDLE.chart;
	chart.canvas.clear();
	var wrapper = chart.canvas.getElement();
	wrapper.parentNode.removeChild(wrapper);
};