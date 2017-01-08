define([
	"esri/tasks/query", "esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", "dojo/_base/lang", "dojo/on", "jquery", './jquery-ui-1.11.2/jquery-ui', './esriapi', "dojo/dom",
],
function ( Query, QueryTask, declare, FeatureLayer, lang, on, $, ui, esriapi, dom ) {
        "use strict";

        return declare(null, {
			clickListener: function(t){
				// Instantiate range sliders
				// Sediment range slider
				$('#' + t.id + '-sed_yield').slider({range:true, min:0, max:345, values:[0,345], change:function(event,ui){t.clicks.sliderChange(event,ui,t)}});
				// Forest Loss range slider
				$('#' + t.id + '-p_yield').slider({range:true, min:0, max:360, values:[0,360], change:function(event,ui){t.clicks.sliderChange(event,ui,t)}});
				// Cost Reduce Sediment
				$('#' + t.id + '-cost_Sum_sed').slider({range:true, min:0, max:500000000, values:[0,500000000], change:function(event,ui){t.clicks.sliderChange(event,ui,t)}});
				// Per Capita Cost to Reduce Sediment
				$('#' + t.id + '-cost_PP_sed').slider({range:true, min:0, max:2500, values:[0,2500], change:function(event,ui){t.clicks.sliderChange(event,ui,t)}});
				// Cost to Reduce Sediment Relative to GDP
				$('#' + t.id + '-cost_pctGDP_sed').slider({range:true, min:0, max:10, values:[0,10], change:function(event,ui){t.clicks.sliderChange(event,ui,t)}});
				// Cost Reduce Phosphorus
				$('#' + t.id + '-cost_Sum_p').slider({range:true, min:0, max:3000000000, values:[0,3000000000], change:function(event,ui){t.clicks.sliderChange(event,ui,t)}});
				// Per Capita Cost to Reduce Phosphorus
				$('#' + t.id + '-cost_PP_p').slider({range:true, min:0, max:20000, values:[0,20000], change:function(event,ui){t.clicks.sliderChange(event,ui,t)}});
				// Cost to Reduce Phosphorus Relative to GDP
				$('#' + t.id + '-cost_pctGDP_p').slider({range:true, min:0, max:500, values:[0,500], change:function(event,ui){t.clicks.sliderChange(event,ui,t)}});

				// Handle sediment and phosphorus CB clicks
				$('#' + t.id + 'filterCitiesWrap .sty_cbWrap').on('click',lang.hitch(t,function(c){
					var val = "";
					// If they click a label, toggle the checkbox. Otherwise, use the CB value 
					if (c.target.checked == undefined){
						$(c.currentTarget.children[0].children[0]).prop("checked", !$(c.currentTarget.children[0].children[0]).prop("checked") )	
						val = $(c.currentTarget.children[0].children[0]).val()
					}else{
						val = c.target.value;
					}
					// If checked, show slider and trigger change so the layer defs are applied
					if ($(c.currentTarget.children[0].children[0]).prop('checked') === true){
						$(c.currentTarget).parent().find('.sty_rangeWrap').slideDown();
						var values = $('#' + t.id + '-' + val).slider("option", "values");
						$('#' + t.id + '-' + val).slider('values', values); 
					}
					// If unchecked, hide slider and clear and update associated layer defs 
					else{
						$(c.currentTarget).parent().find('.sty_rangeWrap').slideUp();
						t[val] = "";
						t.clicks.layerDefsUpdate(t);
						$('#' + t.id + val + '-range').html("")
						$('#' + t.id + val + '-unit').hide();
					}	
				}));	
				// 10, 20, 30% toggle button clicks
				$('#' + t.id + ' .sty_togBtn').on('click',lang.hitch(t,function(c){
					// Get percent selected
					t.per = c.currentTarget.id.split("-")[1]
					// Show and hide range sliders
					if (t.per == "none"){						
						// Clear all layer defs associated with sliders in current section and hide sliders
						$.each( $(c.currentTarget).parent().parent().parent().find('.be_rslide'), lang.hitch(t,function(i,v){
							var slide = v.id.split("-")[1];
							t[slide] = "";
						}));
						t.clicks.layerDefsUpdate(t);			
						$(c.currentTarget).parent().parent().parent().find('.sty_rangeWrap').slideUp();						
					}else{
						// Show sliders in current section and and trigger changes to each so the layer defs are applied
						$(c.currentTarget).parent().parent().parent().find('.sty_rangeWrap').slideDown();
						$.each( $(c.currentTarget).parent().parent().parent().find('.be_rslide'), lang.hitch(t,function(i,v){
							var slide = v.id.split("-")[1]; 
							var values = $('#' + t.id + '-' + slide).slider("option", "values");
							$('#' + t.id + '-' + slide).slider('values', values); 
						})) 	
					}
				}));				
			},
			// Handle range slider changes
			sliderChange: function( event, ui, t ){
				var att  = event.target.id.split("-").pop()
				t.maxSelected = "no";
				// Create sediment and phosphorus layer defs
				if (att == "sed_yield" || att == "p_yield"){
					t[att] = "(" + att + " >= " + ui.values[0] + " AND " + att + " <= " + ui.values[1] + ")";	
				}
				// Create all other layer defs
				else{
					// If the range's selected high value equals the range's max value, don't use the high value in the layer def (becomes greater than min)
					if ( $('#' + event.target.id).slider("option", "max") == ui.values[1] ){
						t[att] = "(opt" + t.per + "_" + att + " >= " + ui.values[0] + ")";
						t.maxSelected = "yes"
					}
					// If the range's selected high value is less than the range's max value, include it in the layer def (becomes between min and max)
					else{
						t[att] = "(opt" + t.per + "_" + att + " >= " + ui.values[0] + " AND opt" + t.per + "_" + att + " <= " + ui.values[1] + ")";
					}
				}
				t.clicks.layerDefsUpdate(t);
				// Show range values selected
				var low = t.standards.numberWithCommas(ui.values[0])
				var high = t.standards.numberWithCommas(ui.values[1])				
				var grtr = "";
				if (t.maxSelected == "yes"){
					grtr = ">"
				}	
				if (low == high){						
					$('#' + t.id + att + '-range').html("(" + low);
				}else{
					$('#' + t.id + att + '-range').html("(" + low + " - " + grtr + high);
				}
				$('#' + t.id + att + '-unit').css('display', 'inline-block');
			},	
			layerDefsUpdate: function(t){
				// Get array of all layer defs
				t.exp = [t.sed_yield, t.p_yield, t.cost_Sum_sed, t.cost_PP_sed, t.cost_pctGDP_sed, t.cost_Sum_p, t.cost_PP_p, t.cost_pctGDP_p]
				var exp = "";
				var exp1 = "";
				// Create array of layer defs that have text (exp) and create a null selector layer def array for the same field (exp1)
				$.each(t.exp, lang.hitch(t,function(i, v){
					if (v.length > 0){
						if (exp.length == 0){
							exp = v;
							exp1 = v.split(" ")[0].slice(1) + " IS Null"
						}else{
							exp = exp + " AND " + v;
							exp1 = exp1 + " AND " + v.split(" ")[0].slice(1) + " IS Null";
						}	
					}	
				}));
				var layerDefinitions = [];
				// If no layer defs have text (are set by sliders) just show cities and update city count to zero 
				if (exp.length == 0){
					$('#' + t.id + 'basinCnt').html("0"); 
					t.obj.visibleLayers = [t.cities];
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				}
				// At least one layer def (range slider value) was set
				else{
					// Query for null values
					var q = new Query();
					var qt = new QueryTask(t.url + '/' + t.noDataCities);
					q.where = exp1;
					qt.executeForCount(q,function(count){
						// Filtered cities get exp layer def no matter what
						layerDefinitions[t.filteredCities] = exp;
						// If there are null values selected, show the no data for cities layer and apply exp1
						if(count > 0){
							layerDefinitions[t.noDataCities] = exp1;	
							t.obj.visibleLayers = [t.noDataCities,t.filteredCities,t.cities];
						}
						// If the query returns zero null values, don't show the no data for cities layer
						else{
							t.obj.visibleLayers = [t.cities,t.filteredCities];		
						}
						// Set layers defs and visible layers
						t.dynamicLayer.setLayerDefinitions(layerDefinitions);
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
						// Show the count of filtered (slider selected) cities 
						var query = new Query();
						var queryTask = new QueryTask(t.url + '/' + t.filteredCities);
						query.where = exp;
						queryTask.executeForCount(query,function(count){
							var cnt = t.standards.numberWithCommas(count)
							$('#' + t.id + 'basinCnt').html(cnt); 
						});
					})
				}		
			}		
        });
    }
)