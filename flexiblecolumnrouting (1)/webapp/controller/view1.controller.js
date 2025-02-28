sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
function (Controller) {
    "use strict";

    return Controller.extend("flexiblecolumnrouting.controller.view1", {
        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("Routeview1").attachPatternMatched(this._onRouteMatched, this);
            this.getOwnerComponent().getRouter().attachBypassed(this._onBypassed, this);

        },
        _onBypassed:function(){

        },
        _onRouteMatched:function(oEvent){
            this.getOwnerComponent().getModel("appView").setProperty("/layout", "OneColumn");
        },
        goToView2:function(){
            debugger
            this.getOwnerComponent().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            this.getOwnerComponent().getRouter().navTo("Routeview2")
        }
    });
});
