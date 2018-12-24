/*globals define*/



define( ["qlik", "jquery", "text!./style.css",'./properties','./filesaver'], function ( qlik, $, cssContent, props,filesaver) {
	'use strict';
	$( "<style>" ).html( cssContent ).appendTo( "head" );
	

	
	return {
		initialProperties: {
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 10,
					qHeight: 50
				}]
			}
		},
		definition: props,
		snapshot: {
			canTakeSnapshot: true
		},
		paint: function ( $element, layout ) {
			console.log("layout",layout);
			var chartId = layout.props.chartID;
			var jsonTableName = (layout.props.jsonTableName) ? layout.props.jsonTableName : "data"
			var htmlText = (layout.props.buttonName)? layout.props.buttonName : "Export";
			var html = "<button class='lui-button'>"+htmlText+"</button>";
						//get the qId from the qlik layout
			var ObjId = layout.qInfo.qId+"_qlik";
			var $myElm = $("#"+ObjId);
			if(!$myElm.length){
				var $myObj = $(document.createElement("div"));
				$myObj.attr("id",ObjId);
				$myObj.html(html);
				$element.append($myObj);
			}
			else {
								
				$myElm.html(html);
			}
			
			$('#'+ObjId+'>button').css("background-color", layout.props.bgcolor.color);
			$('#'+ObjId+'>button').css("color", layout.props.txcolor.color);
			//Get More Data Function
			var dataToExport =[];
			var jsonData ={};
			var dataArray = [];
			
			
			function writeToJSON(colcount,dimensionInfo,measureInfo,dataItem){
				//console.log("inside writeJSON");
				//console.log(colcount,dimensionInfo,measureInfo,dataItem);
				var dataObject ={}
				var j=0;
				for (var i=0;i<colcount;i++){
					if(dimensionInfo[i].qFallbackTitle){
						
						
						dataObject[dimensionInfo[i].qFallbackTitle] = dataItem[i].qText;
					}
					else {
						dataObject[measureInfo[j].qFallbackTitle] = dataItem[i].qNum;
						j++;
					}
				}
				//console.log("dataObject",dataObject);
				return dataObject;
			}
			
			function getMoreData(colcount,rowcount,rowsTofetch,totalRows,callback){
						if(rowsTofetch>=totalRows){
						callback(rowcount,jsonData);
						}
						else{
						var requestPage =  [{
						qTop: rowcount,
						qLeft: 0,
						qWidth: colcount,
						qHeight: rowsTofetch
						}];
						//console.log("dataToExport",dataToExport);
						//console.log("requestPage",requestPage);
						qlik.currApp().getObjectProperties(chartId).then(function(model) {
							//console.log("getMoreData Model",model);
							var hypercube = model.layout.qHyperCube;
							model.getHyperCubeData('/qHyperCubeDef', requestPage).then(function(data){
								var data = data[0].qMatrix;
								var dimensionInfo = hypercube.qDimensionInfo;
								var measureInfo = hypercube.qMeasureInfo;
								
								for(var i=0; i<data.length; i++){
									
									//jsonData[rowcount+i] = writeToJSON(colcount,dimensionInfo,measureInfo,data[i]);
									dataArray.push(writeToJSON(colcount,dimensionInfo,measureInfo,data[i]));
								}
								 rowcount = rowcount + data.length;
								
								callback(rowcount,jsonData);
							})
						});
						
						}
			}
					
			
			
			var rowcount,totalRows;
			$('#'+ObjId+'>button').on('click',function(){
					qlik.currApp().getObjectProperties(chartId).then(function(model) {
					//console.log("model",model);
					var hypercube = model.layout.qHyperCube;
					var colcount = hypercube.qDimensionInfo.length + hypercube.qMeasureInfo.length;
					 totalRows = hypercube.qSize.qcy;
					var rowsTofetch = Math.floor(10000/colcount);
					rowcount = rowsTofetch; //maximum allowed columns are 20 --> thats why initial qheight is set to 10000/20 = 500
					
					
  				    model.getHyperCubeData('/qHyperCubeDef', [{


					qTop: 0, 


					qLeft: 0, 


					qWidth: colcount, 


					qHeight: rowsTofetch


				  }]).then(function(data){
						//var dataPage = data[0].qMatrix;
						dataToExport.push(data[0].qMatrix);
						var data = data[0].qMatrix;
						var dimensionInfo = hypercube.qDimensionInfo;
						var measureInfo = hypercube.qMeasureInfo;
						//console.log("data[0].qMatrix",data.length);
						for(var i=0; i<data.length; i++){
							//jsonData[i] = writeToJSON(colcount,dimensionInfo,measureInfo,data[i]);
							dataArray.push(writeToJSON(colcount,dimensionInfo,measureInfo,data[i]));
						}
						//console.log("jsonData",jsonData);
						getMoreData(colcount,rowcount,rowsTofetch,totalRows,function repeat(rowcount,jsonData){
						
							if(rowcount<totalRows){
									getMoreData(colcount,rowcount,rowsTofetch,totalRows,repeat)
							}
							else{
							rowcount = rowsTofetch;
									
							jsonData[jsonTableName]= dataArray;
							//console.log("dataArray",dataArray);
							var content = JSON.stringify(jsonData);
							
							// any kind of extension (.txt,.cpp,.cs,.bat)
							var filename = jsonTableName+".json";

							var blob = new Blob([content], {
							 type: "text/plain;charset=utf-8"
							});

							saveAs(blob, filename);
							dataToExport =[];
							
							}
							dataToExport =[];
						});
				  })
			});
			})
	

			return qlik.Promise.resolve();
		}
	};
	
	//place here
} );
