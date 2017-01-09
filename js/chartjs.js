define([
	"dojo/_base/declare", "dojo/_base/lang", "dojo/on", "jquery", './jquery-ui-1.11.2/jquery-ui', './esriapi', "dojo/dom", "./Chart_v2.4.0"
],
function ( declare,  lang, on, $, ui, esriapi, dom, Chart ) {
        "use strict";

        return declare(null, {
			createChart: function(t){
				// Get inital selections
				t.selPol = $('#' + t.id + ' .se_chartSel .sty_togBtnSel')[0].id.split('-')[1]
				t.selPer = $('#' + t.id + ' .se_chartSel .sty_togBtnSel')[1].id.split('-')[1]
				// Set global chart variables
				Chart.defaults.global.tooltips.enabled = false;
				Chart.defaults.global.legend.display = false;
				// build datasets options for graph
				t.areaDS = [
					{ label: 'area_agb', backgroundColor: 'rgba(161,18,37,0.7)', yAxisID: "bar-y-axis" },
					{ label: 'area_pro', backgroundColor: 'rgba(79,168,74,0.7)', yAxisID: "bar-y-axis" },
					{ label: 'area_ref', backgroundColor: 'rgba(64,140,180,0.7)', yAxisID: "bar-y-axis" }
				]
				t.costDS = [
					{ label: 'cost_agb', backgroundColor: 'rgba(161,18,37,0.7)', yAxisID: "bar-y-axis" },
					{ label: 'cost_pro', backgroundColor: 'rgba(79,168,74,0.7)', yAxisID: "bar-y-axis" },
					{ label: 'cost_ref', backgroundColor: 'rgba(64,140,180,0.7)', yAxisID: "bar-y-axis" }
				]
				// build main options for graphs
				var areaOpt = {
					elements:{ point:{ radius:0 } },
					scales: {
						yAxes: [
							{ 	id:"bar-y-axis", stacked:true, type:'linear', display:true, 
								ticks:{
									beginAtZero:true, min:0, max:20,
									callback: function(value, index, values){
										//return tick.toString() + ' km²';
										if(parseInt(value) >= 1000){
											return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
										} else {
											return value;
										}
									}	
								} 
							}
						],
						xAxes: [
							{ stacked:true, ticks:{beginAtZero:true} }
						]
					}
				}
				var costOpt = {
					elements:{ point:{ radius:0 } },
					scales: {
						yAxes: [
							{ 	id:"bar-y-axis", stacked:true, type:'linear', display:true, 
								ticks:{
									beginAtZero:true, min:0, max:20,
									callback: function(value, index, values) {
										if(parseInt(value) >= 1000){
											return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
										} else {
											return '$' + value;
										}
									}	
								} 
							}
						],
						xAxes: [
							{ stacked:true, ticks:{beginAtZero:true} }
						]
					}
				}
				
				// Instantiate charts from objects above
				var ctxArea = $('#' + t.id + 'areaChart');
				var ctxCost = $('#' + t.id + 'costChart');
				// build charts
				t.myAreaChart = new Chart(ctxArea, {
					type: 'bar', data: { labels: [""], datasets: t.areaDS }, options: areaOpt
				});
				t.myCostChart = new Chart(ctxCost, {
					type: 'bar', data: { labels: [""], datasets: t.costDS }, options: costOpt
				});
				$('#' + t.id + ' .se_chartSel div').on('click',lang.hitch(t,function(c){
					t.selPol = $('#' + t.id + ' .se_chartSel .sty_togBtnSel')[0].id.split('-')[1]
					t.selPer = $('#' + t.id + ' .se_chartSel .sty_togBtnSel')[1].id.split('-')[1]
					t.chartjs.updateCharts(t);
				}));
			},
			updateCharts: function(t){
				var areaMax = 0
				$.each(t.areaDS,function(i,v){
					var field = t.selPer + v.label + t.selPol;
					v.data = [t.atts[field]]
					if (t.atts[field]){
						areaMax = areaMax + t.atts[field];
					}
				});	
				var m = t.chartjs.maxNumber(areaMax)
				if (m == 0){
					$('#' + t.id + 'areaNd').show();
					$('#' + t.id + 'areaCh').hide();
				}else{
					$('#' + t.id + 'areaNd').hide();
					$('#' + t.id + 'areaCh').show();
				}
				t.myAreaChart.config.options.scales.yAxes[0].ticks.max = m;
				var costMax = 0;
				$.each(t.costDS,function(i,v){
					var field = t.selPer + v.label + t.selPol;
					v.data = [t.atts[field]]
					if (t.atts[field]){
						costMax = costMax + t.atts[field];
					}
				});	
				var n = t.chartjs.maxNumber(costMax)
				if (n == 0){
					$('#' + t.id + 'costNd').show();
					$('#' + t.id + 'costCh').hide();
				}else{
					$('#' + t.id + 'costNd').hide();
					$('#' + t.id + 'costCh').show();
				}
				t.myCostChart.config.options.scales.yAxes[0].ticks.max = n;
				t.myAreaChart.update();
				t.myCostChart.update();
			},
			maxNumber: function(n){
				var x = 0;
				var y = 0;
				if (n < 100){
					x = n * .1 + n;
					y = Math.ceil(x/2)*2;
				}
				if (n > 100){
					x = n * .1 + n;
					y = Math.ceil(x/5)*5;
				}
				if (n > 100000){
					x = n * .1 + n;
					y = Math.ceil(x/10000)*10000;
				}
				return y
			}
		});
    }
)