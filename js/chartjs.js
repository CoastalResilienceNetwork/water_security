define([
	"dojo/_base/declare", "dojo/_base/lang", "dojo/on", './esriapi', "dojo/dom", "./Chart_v2.4.0"
],
function ( declare,  lang, on, esriapi, dom, Chart ) {
        "use strict";

        return declare(null, {
			createChart: function(t){
				// Get inital selections
				if (t.obj.stateSet == "no"){
					t.obj.selPol = $('#' + t.id + ' .se_chartSel input[type=radio]:checked')[0].value
					t.obj.selPer = $('#' + t.id + ' .se_chartSel input[type=radio]:checked')[1].value
				}
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
				$('#' + t.id + ' .se_chartSel input').on('click',lang.hitch(t,function(c){
					t.obj.selPol = $('#' + t.id + ' .se_chartSel input[type=radio]:checked')[0].value;
					t.obj.selPer = $('#' + t.id + ' .se_chartSel input[type=radio]:checked')[1].value;
					t.chartjs.updateCharts(t);
				}));
			},
			updateCharts: function(t){
				var areaMax = 0
				$.each(t.areaDS,function(i,v){
					var field = t.obj.selPer + v.label + t.obj.selPol;
					v.data = [t.atts[field]]
					if (t.atts[field]){
						areaMax = areaMax + t.atts[field];
					}
				});	
				var m = t.chartjs.maxNumber(areaMax)
				if (m == 0){
					var spid = $('#' + t.id + ' .se_chartSel input[type=radio]:checked')[0].id;
					var splbl = $("label[for='"+ spid +"']").text().toLowerCase();
					var perid = $('#' + t.id + ' .se_chartSel input[type=radio]:checked')[1].id;
					var perlbl = $("label[for='"+perid+"']").text();
					$('#' + t.id + 'areaNd').html("A " + perlbl + " " + splbl + " reduction target cannot be achieved here.")
					$('#' + t.id + 'areaNd').show();
					$('#' + t.id + 'areaCh').hide();
				}else{
					$('#' + t.id + 'areaNd').hide();
					$('#' + t.id + 'areaCh').show();
				}
				t.myAreaChart.config.options.scales.yAxes[0].ticks.max = m;
				var costMax = 0;
				$.each(t.costDS,function(i,v){
					var field = t.obj.selPer + v.label + t.obj.selPol;
					v.data = [t.atts[field]]
					if (t.atts[field]){
						costMax = costMax + t.atts[field];
					}
				});	
				var n = t.chartjs.maxNumber(costMax)
				if (n == 0){
					var spid = $('#' + t.id + ' .se_chartSel input[type=radio]:checked')[0].id;
					var splbl = $("label[for='"+ spid +"']").text().toLowerCase();
					var perid = $('#' + t.id + ' .se_chartSel input[type=radio]:checked')[1].id;
					var perlbl = $("label[for='"+perid+"']").text();
					$('#' + t.id + 'costNd').html("A " + perlbl + " " + splbl + " reduction target cannot be achieved here.")
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
			maxNumber: function(num){
				if(num< 1){
					num = Math.ceil(num/.2)*.2;
				}
				else if(num> 1 && num<6){
					num = Math.ceil(num/2)*2;
				}
				else if(num> 6 && num<11){
					num = Math.round(num + (num * .25))
					num = Math.ceil(num/2)*2;
				}
				else if(num> 11 && num<=50){
					num = Math.round(num + (num * .5))
					num = Math.ceil(num/5)*5;
				}
				else if(num>= 51 && num<=100){
					num = Math.round(num + (num * .25))
					num = Math.ceil(num/10)*10;
				}
				else if(num>= 101 && num<=500){
					num = Math.round(num + (num * .20))
					num = Math.ceil(num/50)*50;
				}
				else if(num>= 501 && num<=1000){
					num = Math.round(num + (num * .15))
					num = Math.ceil(num/50)*50;
				}
				else if(num>= 1001 && num<=10000){
					num = Math.round(num + (num * .1))
					num = Math.ceil(num/500)*500;
				}
				else if(num>= 10001 && num<=100000){
					num = Math.round(num + (num * .1))
					num = Math.ceil(num/5000)*5000;
				}
				else if(num>= 100001 && num<=1000000){
					num = Math.round(num + (num * .1))
					num = Math.ceil(num/25000)*25000;
				}
				else if(num>= 1000001 && num<=10000000){
					num = Math.round(num + (num * .05))
					num = Math.ceil(num/500000)*500000;
				}
				else if(num>= 10000001 && num<=100000000){
					num = Math.round(num + (num * .05))
					num = Math.ceil(num/5000000)*5000000;
				}
				else if(num>= 100000001 && num<=1000000000){
					num = Math.round(num + (num * .05))
					num = Math.ceil(num/50000000)*50000000;
				}
				return num
			}
		});
    }
)
