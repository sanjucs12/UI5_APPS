sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    function (Controller) {
        "use strict";

        return Controller.extend("massedit.controller.Work", {
            onInit: function () {
                debugger;
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.attachRoutePatternMatched(this._handlePatternMatched, this);

            },
            _handlePatternMatched: function (oEvent) {
                debugger
                //this.getView().byId('idTable').setModel(this.getOwnerComponent().getModel('Data'))
            }
        });
    });
