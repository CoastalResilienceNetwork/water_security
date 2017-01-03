define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query" ,"esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", 
	"esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/graphic", "dojo/_base/Color", "dojo/_base/lang", "dojo/on", "jquery", './jquery-ui-1.11.2/jquery-ui'
],
function ( 	ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, declare, FeatureLayer, 
			SimpleLineSymbol, SimpleFillSymbol, Graphic, Color, lang, on, $, ui) {
        "use strict";

        return declare(null, {
			esriApiFunctions: function(t){	
				// Define dynamic layer numbers
				t.cities = '3';
				t.filteredCities = '1';
				t.selectedCity = '0';
				t.noDataCities = '2';
				// Add dynamic map service
				t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.url, {opacity:0.7});
				t.map.addLayer(t.dynamicLayer);
				if (t.obj.visibleLayers.length > 0){	
					//t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				}else{
					t.obj.visibleLayers.push(t.cities)
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				}
				t.dynamicLayer.on("load", lang.hitch(t, function () { 			
					t.layersArray = t.dynamicLayer.layerInfos;
					// Start with empty expressions
					t.sed_yield = ""; 
					t.p_yield = "";
					t.cost_Sum_sed = "";
					t.cost_Sum_sed_10 = [1100000000, 1.1];
					t.cost_Sum_sed_20 = [3100000000, 3.1];
					t.cost_Sum_sed_30 = [7510000000, 7.5];
					t.cost_Sum_p = "";
					t.cost_Sum_p_10 = [212000000000, 212];
					t.cost_Sum_p_20 = [9600000000, 9.6];
					t.cost_Sum_p_30 = [18200000000, 18.2];
					t.sed10 = "no";
					t.sed20 = "no";
					t.sed30 = "no";
					t.clicks.layerDefsUpdate(t);
					t.map.setMapCursor("pointer");
				}));	
				var sym = new SimpleFillSymbol( SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_SOLID, new Color([0,0,255]), 2 ), new Color([0,0,0,0.1])
				);
				t.basinFl = new FeatureLayer(t.url + "/1", { mode: FeatureLayer.MODE_SELECTION, outFields: ["*"] });
				t.basinFl.setSelectionSymbol(sym);
				t.map.addLayer(t.basinFl);
				t.basinFl.on('selection-complete', lang.hitch(t,function(evt){
					if (evt.features.length > 0){
						$('#' + t.id + 'hydroHeader').html('Selected Hydrobasin Attributes');
						var atts = evt.features[0].attributes;
						var b = [['standingc',atts.standingc,6568.95], ['p_yield',atts.p_yield,19429.33], ['refor',atts.refor,65038.4], ['freshbiot',atts.freshbiot/10,1], 
								 ['terrsp',atts.terrsp,219], ['vita',atts.vita,84.06], ['agloss',atts.agloss,68], ['nitrogen',atts.nitrogen,611.6]];
						t.hbar.updateHbar(t,b);
						
						if ($('#' + t.id + 'cbListener').is(":visible")){
							$('#' + t.id + 'hbbHeader').trigger('click');
						};
						if ($('#' + t.id + 'supDataWrap').is(":visible")){
							$('#' + t.id + 'sdWrap').trigger('click');
						};
						if ($('#' + t.id + 'hydroWrap').is(":hidden")){
							$('#' + t.id + 'hydroSection').trigger('click');
						};
						$('#' + t.id + 'graphWrap').slideDown();
					}else{
						$('#' + t.id + 'hydroHeader').html('Click map to select a hydrobasin');
						$('#' + t.id + 'graphWrap').slideUp();
							
					}	
				}));	
				t.map.on("click", lang.hitch(t, function(evt) {
					var pnt = evt.mapPoint;
					var q = new Query();
					q.geometry = pnt;
					t.basinFl.selectFeatures(q,esri.layers.FeatureLayer.SELECTION_NEW);
				}));
				t.map.on("zoom-end", lang.hitch(t,function(e){
					t.map.setMapCursor("pointer");
				}));
				t.map.on("update-end", lang.hitch(t,function(e){
					t.map.setMapCursor("pointer");
				}));				
			}
		});
    }
);