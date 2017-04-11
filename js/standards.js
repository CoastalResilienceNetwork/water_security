define([
	"esri/tasks/query", "esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", "dojo/_base/lang", "dojo/on", "jquery", './jquery-ui-1.11.2/jquery-ui', './esriapi', "dojo/dom",
],
function ( Query, QueryTask, declare, FeatureLayer, lang, on, $, ui, esriapi, dom ) {
        "use strict";

        return declare(null, {
			startUp: function(t){
				//make accrodians
				$( function() {
					$( "#" + t.id + "mainAccord" ).accordion({heightStyle: "fill"}); 
					$( "#" + t.id + "infoAccord" ).accordion({heightStyle: "fill"});
					$( '#' + t.id + 'mainAccord > h3' ).addClass("accord-header"); 
					$( '#' + t.id + 'infoAccord > div' ).addClass("accord-body");
					$( '#' + t.id + 'infoAccord > h3' ).addClass("accord-header"); 
					$( '#' + t.id + 'mainAccord > div' ).addClass("accord-body");
				});
				// update accordians on window resize
				var doit;
				$(window).resize(function(){
					clearTimeout(doit);
					doit = setTimeout(function() {
						t.standards.updateAccord(t);
					}, 100);
				});									
				// leave the get help section
				$('#' + t.id + 'getHelpBtn').on('click',lang.hitch(t,function(c){
					$('#' + t.id + 'infoAccord').hide();
					$('#' + t.id + 'mainAccord').show();
					$('#' + t.id + 'getHelpBtnWrap').hide();
					t.standards.updateAccord(t);
				}));
				// info icon clicks
				$('#' + t.id + ' .sty_infoIcon').on('click',lang.hitch(t,function(c){
					$('#' + t.id + 'mainAccord').hide();
					$('#' + t.id + 'infoAccord').show();
					$('#' + t.id + 'getHelpBtnWrap').show();
					var ben = c.target.id.split("-").pop();
					t.standards.updateAccord(t);	
					$('#' + t.id + 'infoAccord .' + ben).trigger('click');
					$('#' + t.id + 'getHelpBtn').html('Back to Source Protection Explorer');
				}));
			},
			updateAccord: function(t){
				var ma = $( "#" + t.id + "mainAccord" ).accordion( "option", "active" );
				var ia = $( "#" + t.id + "infoAccord" ).accordion( "option", "active" );
				$( "#" + t.id + "mainAccord" ).accordion('destroy');	
				$( "#" + t.id +  "infoAccord" ).accordion('destroy');	
				$( "#" + t.id + "mainAccord" ).accordion({heightStyle: "fill"}); 
				$( "#" + t.id + "infoAccord" ).accordion({heightStyle: "fill"});	
				$( "#" + t.id + "mainAccord" ).accordion( "option", "active", ma );		
				$( "#" + t.id + "infoAccord" ).accordion( "option", "active", ia );				
			},
			numberWithCommas: function(x){
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}			
        });
    }
)
