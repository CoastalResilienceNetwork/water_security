define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query" ,"esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", 
	"esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/graphic", "dojo/_base/Color", "dojo/_base/lang", "dojo/on", "jquery", './jquery-ui-1.11.2/jquery-ui', "esri/tasks/RelationshipQuery", "esri/graphicsUtils",
],
function ( 	ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, declare, FeatureLayer, 
			SimpleLineSymbol, SimpleFillSymbol, Graphic, Color, lang, on, $, ui, RelationshipQuery, graphicsUtils) {
        "use strict";

        return declare(null, {
			esriApiFunctions: function(t){	
				// Define dynamic layer numbers
				t.cities = '3';
				t.filteredCities = '1';
				t.selectedCity = '0';
				t.noDataCities = '2';
				t.watersheds = '4'
				// Create global layer definitions array
				t.layerDefinitions = [];
				// Add dynamic map service
				t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.url, {opacity:0.8});
				t.map.addLayer(t.dynamicLayer);
				if (t.obj.visibleLayers.length > 0){	
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
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
					t.cost_PP_sed = "";
					t.cost_pctGDP_sed = "";
					t.cost_Sum_p = "";
					t.cost_PP_p = "";
					t.cost_pctGDP_p = "";
					t.wsDef = "";
					t.map.setMapCursor("pointer");
					// Save and Share 
					if (t.obj.stateSet == "yes"){
						console.log(this.obj)
						//extent
						var extent = new Extent(t.obj.extent.xmin, t.obj.extent.ymin, t.obj.extent.xmax, t.obj.extent.ymax, new SpatialReference({ wkid:4326 }))
						t.map.setExtent(extent, true);
						// accordion visibility
						$('#' + t.id + t.obj.accordVisible).show();
						$('#' + t.id + t.obj.accordHidden).hide();
						$('#' + t.id + 'getHelpBtn').html(t.obj.buttonText);
						t.standards.updateAccord(t);
						$('#' + t.id + t.obj.accordVisible).accordion( "option", "active", t.obj.accordActive );
						//  city click
						$('#' + t.id + ' .se_chartSel div').removeClass('sty_togBtnSel')
						$('#' + t.id + ' .se_chartSel div').each(lang.hitch(t,function(i,v){
							if( v.id == t.id + "-" + t.obj.selPol || v.id == t.id + "-" + t.obj.selPer ){
								$('#' + v.id).addClass('sty_togBtnSel')
							}
						}))
						if (t.obj.selCity.length > 0){
							var q = new Query();
							q.where = t.obj.selCity;
							console.log(t.obj.selCity)
							t.selCityFL.selectFeatures(q,esri.layers.FeatureLayer.SELECTION_NEW);
						}
						// benefit checkboxes and sliders
						$.each(t.obj.checkedYield,lang.hitch(t,function(i,v){
							$('#' + t.id + 'yieldCbs input').each(lang.hitch(t,function(j,w){
								if ( v[0] == $(w).val() ){
									$('#' + t.id + '-' + v[0]).slider('values', v[1]);
									$(w).trigger('click')
								}
							}))	
						}))
						$.each(t.obj.reduceSliders,lang.hitch(t,function(i,v){
							$('#' + t.id + ' .be_rslide').each(lang.hitch(t,function(j,w){
								var wid = "-" + w.id.split("-")[1]
								if ( v[0] == wid ){
									$('#' + t.id + v[0]).slider('values', v[1]);
								}
							}))	
						}))
						$.each(t.obj.percentBtns,lang.hitch(t,function(i,v){
							$('#' + t.id + v).trigger('click')
						}));	
						t.obj.stateSet = "no";
					}else{
						t.clicks.layerDefsUpdate(t);
					}
					
				}));	
				
				var relatedQuery = new RelationshipQuery();
				relatedQuery.outFields = ["OBJECTID"];
				relatedQuery.relationshipId = 0;
				
				t.selCityFL = new FeatureLayer(t.url + "/" + t.cities, { mode: FeatureLayer.MODE_SELECTION, outFields: ["*"] });
				t.selWsFL = new FeatureLayer(t.url + "/" + t.watersheds, { mode: FeatureLayer.MODE_SELECTION, outFields: ["*"] });
				t.selCityFL.on('selection-complete', lang.hitch(t,function(evt){
					var index = t.obj.visibleLayers.indexOf(t.selectedCity);
					var index1 = t.obj.visibleLayers.indexOf(t.watersheds);
					if (evt.features.length > 0){
						if ( $('#' + t.id + 'mainAccord').is(':hidden') ){
							$('#' + t.id + 'getHelpBtn').trigger('click');
						} 
						t.atts = evt.features[0].attributes;
						t.chartjs.updateCharts(t);
						$('#' + t.id + 'selectCityHeader').hide();
						$('#' + t.id + 'sc').html(t.atts.City_Name);
						$('#' + t.id + 'citySelectedHeader').show();
						t.obj.selCity = "OBJECTID = " + t.atts.OBJECTID;
						t.layerDefinitions[t.selectedCity] = t.obj.selCity
						t.dynamicLayer.setLayerDefinitions(t.layerDefinitions);
						if (index == -1) {
							t.obj.visibleLayers.push(t.selectedCity);
							t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
						}									
						$('#' + t.id + 'se_attWrap .se_attSpan').each(lang.hitch(t,function(i,v){
							var field = v.id.split("-")[1];
							var val = t.atts[field];
							if ( isNaN(val) == false ){
								if (val == -99){
									val = "No Data"
								}else{	
									val = Math.round(val);
									val = t.standards.numberWithCommas(val);
								}	
							}	
							$('#' + v.id).html(val)
						}));
						t.wsDef = "";
						relatedQuery.objectIds = [t.atts.OBJECTID];
						t.selCityFL.queryRelatedFeatures(relatedQuery, lang.hitch(t,function(relatedRecords) {
							var inStr = ""
							$.each(relatedRecords[t.atts.OBJECTID].features, function(i,v){
								if (i == 0){
									inStr = v.attributes.OBJECTID;
								}else{
									inStr = inStr + ", " + v.attributes.OBJECTID;
								}									
							})
							t.wsDef = "OBJECTID IN (" + inStr + ")";
							t.layerDefinitions[t.watersheds] = t.wsDef;
							t.dynamicLayer.setLayerDefinitions(t.layerDefinitions);
							if (index1 == -1) {
								t.obj.visibleLayers.push(t.watersheds)
								t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
							}
							var q = new Query();
							q.where = t.wsDef;
							t.selWsFL.queryFeatures(q,lang.hitch(t,function(featureSet){
								t.wsExt = graphicsUtils.graphicsExtent(featureSet.features);
							}));
						}))
						$('#' + t.id + 'citySelSection').trigger('click');						
						$('#' + t.id + 'chartWrap').slideDown();						
					}else{
						t.obj.selCity = "";
						t.wsDef = "";
						if (index > -1) {
							t.obj.visibleLayers.splice(index, 1);						
						}
						index1 = t.obj.visibleLayers.indexOf(t.watersheds);
						if (index1 > -1) {
							t.obj.visibleLayers.splice(index1, 1);							
						}						
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);	
						$('#' + t.id + 'citySelectedHeader').hide();
						$('#' + t.id + 'selectCityHeader').show();
						$('#' + t.id + 'chartWrap').slideUp();
					}	
				}));		
				t.map.on("click", lang.hitch(t, function(evt) {
					if (t.open == "yes"){
						// Use pixels to grab pixels on point-click selections
						// change the tolerence below to adjust how many pixels will be grabbed when clicking on a point or line
						var tolerance = 10 * t.map.extent.getWidth()/t.map.width;;
						var pnt = evt.mapPoint;
						var ext = new esri.geometry.Extent(1,1, tolerance, tolerance, evt.mapPoint.spatialReference);
						var q = new Query();
						q.geometry = ext.centerAt(new esri.geometry.Point(evt.mapPoint.x,evt.mapPoint.y,evt.mapPoint.spatialReference));
						t.selCityFL.selectFeatures(q,esri.layers.FeatureLayer.SELECTION_NEW);
					}	
				}));
				t.map.on("zoom-end", lang.hitch(t,function(e){
					t.map.setMapCursor("pointer");
				}));
				t.map.on("update-end", lang.hitch(t,function(e){
					t.map.setMapCursor("pointer");
				}));	
				$('#' + t.id + 'zoomToWs').on('click', lang.hitch(t,function(i,v){
					t.map.setExtent(t.wsExt.getExtent().expand(2));
				}))
			}
		});
    }
);