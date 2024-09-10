sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/airdit/qudg/qudglpad/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("com.airdit.qudg.qudglpad.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			var spath = jQuery.sap.getModulePath("com.airdit.qudg.qudglpad");
			var oImageModel = new sap.ui.model.json.JSONModel({
				path: spath
			});
			this.setModel(oImageModel, "imageModel");
			
			// if(this.getRouter().getHashChanger().hash.length !== 0){
			// 	this.getRouter().navTo("Overview");
			// }
			// sap.ui.loader.config({
			// 	paths: {
			// 		"zruleconfig/qudg": "/sap/bc/ui5_ui5/sap/zrule",

			// 	}
			// });
			
			if (this.getRouter().getHashChanger().hash.length !== 0) {
				this.getRouter().navTo("Overview1");
			}

			this.getService("ShellUIService").then( // promise is returned
				function (oService) {
					oService.setTitle("Application Title");
				},
				function (oError) {
					console.log("Cannot get ShellUIService", oError, "my.app.Component");
				}
			);

		}
	});
});