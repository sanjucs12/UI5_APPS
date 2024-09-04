sap.ui.define(["sap/ui/core/mvc/Controller"], function (n) {
	"use strict";
	return n.extend("com.airdit.qudg.qudglpad.controller.App", {
		onInit: function () {
			if(this.getOwnerComponent().getRouter().getHashChanger().hash.length === 0){
				this.getOwnerComponent().getRouter().navTo("Home");
			}
		}
	})
});