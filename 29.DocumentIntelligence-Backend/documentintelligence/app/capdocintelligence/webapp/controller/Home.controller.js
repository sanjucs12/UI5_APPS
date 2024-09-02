sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
function (Controller) {
    "use strict";

    return Controller.extend("capdocintelligence.controller.Home", {
        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("Home").attachPatternMatched(this._onPatternMatched, this);

        },
        _onPatternMatched: function(oEvent){
            debugger;
            this.getOwnerComponent().getModel("appView").setProperty("/layout", "OneColumn");
        },
        onNavigate: function(oEvent){
            debugger;
            this.getOwnerComponent().getRouter().navTo('Details')
        },
    });
});
