// JavaScript
define([],function(){


var chartIDprop = {
    ref: "props.chartID",
    label: "Chart Id",
    type: "string"
};

var jsonTableName = {
    ref: "props.jsonTableName",
    label: "JSON Table Name",
    type: "string"
};

var chartProps ={
    label: "Export Settings",
	type: "items",
	items:{
		chartIDprop: chartIDprop,
		jsonTableName : jsonTableName
	}

}

var buttonNameProp = {
    ref: "props.buttonName",
    label: "Button Name",
    type: "string"
};
var colorPalletBG = {
	label:"Background Color",
	component: "color-picker",
	ref: "props.bgcolor",
	type: "object",
	defaultValue: {
	    index: 12,  
        color: "#000000"  
	}
};

var colorPalletTX = {
	label:"Text Color",
	component: "color-picker",
	ref: "props.txcolor",
	type: "object",
	defaultValue: {
	    index: 11,  
        color: "#ffffff"  
	}
};

var buttonProps ={
    label: "Button Settings",
	type: "items",
	items:{
		buttonNameProp: buttonNameProp,
		colorPalletBG : colorPalletBG,
		colorPalletTX : colorPalletTX
	}

}


return {
    type: "items",
    component: "accordion",
    items: {
        chartProps: chartProps,
		buttonProps : buttonProps
    	 }
    };
});

