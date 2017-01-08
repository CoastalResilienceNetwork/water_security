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
				});
				// update accordians on window resize - map resize is much cleaner than window resize
				t.map.on('resize',lang.hitch(t,function(){
					t.standards.updateAccord(t);
				}))								
				// leave the get help section
				$('#' + t.id + 'getHelpBtn').on('click',lang.hitch(t,function(c){
					$('#' + t.id + 'infoAccord').hide();
					$('#' + t.id + 'mainAccord').show();
					$('#' + t.id + 'getHelpBtnWrap').hide();
					$('#' + t.id + 'getHelpBtn').html('Back to Water Security Explorer');
					t.standards.updateAccord(t);
				}));
				// info icon clicks
				$('#' + t.id + ' .se_minfo').on('click',lang.hitch(t,function(c){
					$('#' + t.id + 'mainAccord').hide();
					$('#' + t.id + 'infoAccord').show();
					$('#' + t.id + 'getHelpBtnWrap').show();
					var ben = c.target.id.split("-").pop();
					t.standards.updateAccord(t);	
					$('#' + t.id + 'infoAccord .' + ben).trigger('click');
				}));
				// Handle Class changes on all togBtn clicks
				$('#' + t.id + ' .sty_togBtn').on('click',function(c){		
					$(c.currentTarget).parent().find('.sty_togBtn').removeClass('sty_togBtnSel');
					$(c.currentTarget).addClass('sty_togBtnSel');
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