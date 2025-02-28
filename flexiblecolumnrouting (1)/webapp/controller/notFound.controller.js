sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
function (Controller) {
    "use strict";

    return Controller.extend("flexiblecolumnrouting.controller.notFound", {
        onInit: function () {
			this.getOwnerComponent().getRouter().getTarget("notFound").attachDisplay(this._onNotFoundDisplayed, this);
        },
		_onNotFoundDisplayed : function () {
			this.getOwnerComponent().getModel("appView").setProperty("/layout", "OneColumn");
		}       
        
    });
});
