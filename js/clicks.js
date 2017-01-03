define([
	"esri/tasks/query", "esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", "dojo/_base/lang", "dojo/on", "jquery", './jquery-ui-1.11.2/jquery-ui', './esriapi', "dojo/dom",
],
function ( Query, QueryTask, declare, FeatureLayer, lang, on, $, ui, esriapi, dom ) {
        "use strict";

        return declare(null, {
			clickListener: function(t){
				//make accrodians
				$( function() {
					$( "#" + t.id + "mainAccord" ).accordion({heightStyle: "fill"}); 
					$( "#" + t.id + "infoAccord" ).accordion({heightStyle: "fill"});
				});
				// update accordians on window resize - map resize is much cleaner than window resize
				t.map.on('resize',lang.hitch(t,function(){
					t.clicks.updateAccord(t);
				}))								
				// leave the get help section
				$('#' + t.id + 'getHelpBtn').on('click',lang.hitch(t,function(c){
					$('#' + t.id + 'infoAccord').hide();
					$('#' + t.id + 'mainAccord').show();
					$('#' + t.id + 'getHelpBtnWrap').hide();
					$('#' + t.id + 'getHelpBtn').html('Back to Water Security Explorer');
					t.clicks.updateAccord(t);
				}));
				// info icon clicks
				$('#' + t.id + ' .se_minfo').on('click',lang.hitch(t,function(c){
					$('#' + t.id + 'mainAccord').hide();
					$('#' + t.id + 'infoAccord').show();
					$('#' + t.id + 'getHelpBtnWrap').show();
					var ben = c.target.id.split("-").pop();
					t.clicks.updateAccord(t);	
					$('#' + t.id + 'infoAccord .' + ben).trigger('click');
				}));
				// CB clicks in 10, 20, 30% sections
				$('#' + t.id + 'filterCitiesWrap .sty_cbwLabel').on('click',lang.hitch(t,function(c){
					var val = "";
					// if they click a checkbox label, treat it like a checkbox
					if (c.target.checked == undefined){
						$(c.currentTarget.children[0]).prop("checked", !$(c.currentTarget.children[0]).prop("checked") )	
						val = $(c.currentTarget.children[0]).val()
					}else{
						// they clicked a checkbox
						val = c.target.value;
					}	
					var field = val.split("-")[1]
					val = val.split("-")[0]
					// update slider values based on percentage checkboxes
					if ( $(c.currentTarget).parent().find(':checkbox[value=10-' + field + ']').prop('checked') ) {
						$('#' + t.id + '-' + field).slider('option', 'max', t[field + '_10'][0]);
						$('#' + t.id + field + '_Max').html(t[field + '_10'][1]);
						t.sed10 = "yes";
					}else{
						t.sed10 = "no";
					}
					if ( $(c.currentTarget).parent().find(':checkbox[value=20-' + field + ']').prop('checked') ) {
						if ( ( t.sed10 == 'yes' && t[field + '_10'][0] < t[field + '_20'][0] ) || t.sed10 == 'no' ){
							$('#' + t.id + '-' + field).slider('option', 'max', t[field + '_20'][0]);
							$('#' + t.id + field + '_Max').html(t[field + '_20'][1]);
						}
						t.sed20 = "yes";
					}else{
						t.sed20 = "no";
					}
					if ( $(c.currentTarget).parent().find(':checkbox[value=30-' + field + ']').prop('checked') ) {
						if ( ( t.sed10 == 'no' && t.sed20 == 'no' ) || ( $('#' + t.id + '-' + field).slider('option', 'max') < t[field + '_30'][0] ) ){
							$('#' + t.id + '-' + field).slider('option', 'max', t[field + '_30'][0]);
							$('#' + t.id + field + '_Max').html(t[field + '_30'][1]);
						}
						t.sed30 = "yes";
					}else{
						t.sed30 = "no";
					}
					if ($(c.currentTarget.children[0]).prop('checked') === true){
						// if the checked box is a percentage (10, 20, 30) uncheck the none checkbox
						if (val.length == 2){
							$(c.currentTarget).parent().find(':checkbox[value=none-' + field + ']').prop('checked', false) 
						}
						// if none was selected uncheck siblings
						if (val == 'none'){
							$(c.currentTarget).parent().find(':checkbox[value!=none-' + field + ']').prop('checked', false)	
							t[field] = "";
							t.clicks.layerDefsUpdate(t);
							$(c.currentTarget).parent().next('.sty_rangeWrap').slideUp();
						}else{
							// none wasn't clicked so show the range slider
							$(c.currentTarget).parent().next('.sty_rangeWrap').slideDown();
							var values = $('#' + t.id + '-' + field).slider("option", "values");
							$('#' + t.id + '-' + field).slider('values', values); 
						}
					}else{
						// test if other percentage checkboxes are checked checked before hiding sliders and select none if none of them are
						var ch = 'no'
						if (val.length == 2){
							$(c.currentTarget).parent().find(':checkbox[value!=none-' + field + ']').each(function(i,v){
								if ($(v).prop('checked')){
									ch = 'yes';
									var values = $('#' + t.id + '-' + field).slider("option", "values");
									$('#' + t.id + '-' + field).slider('values', values); 
								}	
							})
						}
						if (ch == 'no'){
							$(c.currentTarget).parent().find(':checkbox[value=none-' + field + ']').prop('checked', true) 
							$(c.currentTarget).parent().next('.sty_rangeWrap').slideUp();
							t[field] = "";
							t.clicks.layerDefsUpdate(t);
						}
					}	
				}));				
				// Benefit CB Clicks
				$('#' + t.id + 'filterCitiesWrap .sty_cbWrap').on('click',lang.hitch(t,function(c){
					var ben = "";
					// if they click a label toggle the checkbox
					if (c.target.checked == undefined){
						$(c.currentTarget.children[0].children[0]).prop("checked", !$(c.currentTarget.children[0].children[0]).prop("checked") )	
						ben = $(c.currentTarget.children[0].children[0]).val()
					}else{
						ben = c.target.value;
					}	
					if ($(c.currentTarget.children[0].children[0]).prop('checked') === true){
						$(c.currentTarget).parent().find('.sty_rangeWrap').slideDown();
						var values = $('#' + t.id + '-' + ben).slider("option", "values");
						$('#' + t.id + '-' + ben).slider('values', values); 
					}else{
						$(c.currentTarget).parent().find('.sty_rangeWrap').slideUp();
						t[ben] = "";
						t.clicks.layerDefsUpdate(t);
						$('#' + t.id + ben + '-range').html("")
						$('#' + t.id + ben + '-unit').hide();
					}	
				}));	
				// Sup data CB Clicks
				$('#' + t.id + 'supDataWrap .be_cbSupWrap').on('click',lang.hitch(t,function(c){
					var val = "";
					// if they click a label toggle the checkbox
					if (c.target.checked == undefined){
						$(c.currentTarget.children[0].children[0]).prop("checked", !$(c.currentTarget.children[0].children[0]).prop("checked") )	
						val = $(c.currentTarget.children[0].children[0]).val()
					}else{
						val = c.target.value;
					}	
					var lyr = Number( val.split("-").pop() )
					$('#' + t.id + 'supDataWrap .be_pointer').each(lang.hitch(t,function(i,v){
						if ( v.value != val ){
							$(v).prop('checked', false)
							var rl = Number( v.value.split("-").pop() )
							var index = t.obj.visibleLayers.indexOf(rl);
							if (index > -1) {
								t.obj.visibleLayers.splice(index, 1);
							}
						}
					}));
					if ($(c.currentTarget.children[0].children[0]).prop('checked') === true){
						t.obj.visibleLayers.push(lyr);
					}else{
						var index = t.obj.visibleLayers.indexOf(lyr);
						if (index > -1) {
							t.obj.visibleLayers.splice(index, 1);
						}
					}	
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				}));	
				// Sediment range slider
				$('#' + t.id + '-sed_yield').slider({range:true, min:0, max:345, values:[0,345], change:function(event,ui){t.clicks.sliderChange(event,ui,t)}});
				// Forest Loss range slider
				$('#' + t.id + '-p_yield').slider({range:true, min:0, max:360, values:[0,360], change:function(event,ui){t.clicks.sliderChange(event,ui,t)}});
				// Cost Reduce Sediment
				$('#' + t.id + '-cost_Sum_sed').slider({range:true, min:0, max:1000000000, values:[0,1000000000], change:function(event,ui){t.clicks.sliderChange(event,ui,t)}});
				// Cost Reduce Phosphorus
				$('#' + t.id + '-cost_Sum_p').slider({range:true, min:0, max:212000000000, values:[0,212000000000], change:function(event,ui){t.clicks.sliderChange(event,ui,t)}});				
			},
			sliderChange: function( event, ui, t ){
				var ben  = event.target.id.split("-").pop()
				if (ben == 'cost_Sum_sed' || ben == 'cost_Sum_p'){
					var s10 = "";
					var cnt = 0;
					if (t.sed10 == 'yes'){
						s10 = "(opt10_" + ben + " >= " + ui.values[0] + " AND opt10_" + ben + " <= " + ui.values[1] + ")"
						t[ben] = s10;
					}
					var s20 = "";
					if (t.sed20 == 'yes'){
						s20 = "(opt20_" + ben + " >= " + ui.values[0] + " AND opt20_" + ben + " <= " + ui.values[1] + ")"
						if (t.sed10 == 'yes'){
							t[ben] = t[ben] + " OR " + s20;
							cnt = 2;
						}
						if (t.sed10 == 'no'){
							t[ben] = s20;
						}
					}
					var s30 = "";
					if (t.sed30 == 'yes'){
						s30 = "(opt30_" + ben + " >= " + ui.values[0] + " AND opt30_" + ben + " <= " + ui.values[1] + ")"
						if (t.sed10 == 'yes' && t.sed20 == 'yes'){
							t[ben] = t[ben] + " OR " + s30;
							cnt = 3;
						}
						else{
							if (t.sed10 == 'yes' || t.sed20 == 'yes'){
								t[ben] = t[ben] + " OR " + s30;
								cnt = 2;
							}
						}	
						if (t.sed10 == 'no' && t.sed20 == 'no'){
							t[ben] = s30;
							cnt = 1;
						}
					}
					if (cnt > 1){
						t[ben] = "( " + t[ben] + " )"
					}
				}else{
					t[ben] = "(" + ben + " >= " + ui.values[0] + " AND " + ben + " <= " + ui.values[1] + ")";	
				}
				t.clicks.layerDefsUpdate(t);
				var low = 0;
				var high = 0;
				low = t.clicks.numberWithCommas(ui.values[0])
				high = t.clicks.numberWithCommas(ui.values[1])
				if (low == high){						
					$('#' + t.id + ben + '-range').html("(" + low);
				}else{
					$('#' + t.id + ben + '-range').html("(" + low + " - " + high);
				}
				$('#' + t.id + ben + '-unit').css('display', 'inline-block');
			},	
			layerDefsUpdate: function(t){
				t.exp = [t.sed_yield, t.p_yield, t.cost_Sum_sed, t.cost_Sum_p]
				var exp = "";
				var cnt = 0;
				var nd = "f";
				$.each(t.exp, lang.hitch(t,function(i, v){
					if (v.length > 0){
						if (exp.length == 0){
							exp = v;
							cnt = 1;
						}else{
							exp = exp + " AND " + v;
							cnt = cnt + 1;
						}	
					}	
				}));
				if (cnt == 1 && (t.cost_Sum_sed.length > 1 || t.cost_Sum_p.length > 1) ){
					$('#' + t.id + ' .se_nd input').each(function(i,v){
						if ( $(v).prop('checked') && $(v).val().split("-")[0] != 'none'){
							var x = $(v).val().substring($(v).val().lastIndexOf("_") + 1)
							t.exp1 = "opt_flag_" + x + " = 0";
						}	
					});
					var q = new Query();
					var qt = new QueryTask(t.url + '/' + t.noDataCities);
					q.where = t.exp1;
					qt.executeForCount(q,function(count){
						var layerDefinitions = [];
						layerDefinitions[t.filteredCities] = exp;
						if (count > 0){
							layerDefinitions[t.noDataCities] = t.exp1;	
							t.obj.visibleLayers = [t.noDataCities,t.filteredCities,t.cities];
						}else{
							t.obj.visibleLayers = [t.filteredCities,t.cities];
						}
						t.dynamicLayer.setLayerDefinitions(layerDefinitions);
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);						
					}); 
				}else{
					if (exp.length == 0){
						exp = "OBJECTID < 0";
						t.obj.visibleLayers = [t.cities];
					}else{
						t.obj.visibleLayers = [t.cities,t.filteredCities];
					}		
					var layerDefinitions = [];		
					layerDefinitions[t.filteredCities] = exp;	
					t.dynamicLayer.setLayerDefinitions(layerDefinitions);
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				}
				var query = new Query();
				var queryTask = new QueryTask(t.url + '/' + t.filteredCities);
				query.where = exp;
				queryTask.executeForCount(query,function(count){
					var cnt = t.clicks.numberWithCommas(count)
					$('#' + t.id + 'basinCnt').html(cnt); 
				});
			},
			updateAccord: function(t){
				$( "#" + t.id + "mainAccord" ).accordion('refresh');	
				$( "#" + t.id + "infoAccord" ).accordion('refresh');				
			},
			numberWithCommas: function(x){
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}			
        });
    }
)