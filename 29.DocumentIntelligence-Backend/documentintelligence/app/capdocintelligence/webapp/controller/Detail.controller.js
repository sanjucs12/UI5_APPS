sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    function (Controller) {
        "use strict";

        return Controller.extend("capdocintelligence.controller.Detail", {
            onInit: function () {
                this.getOwnerComponent().getRouter().getRoute("Details").attachPatternMatched(this._onPatternMatched, this);

            },
            _onPatternMatched: function (oEvent) {
                debugger;
                // Don't show two columns when in full screen mode
                if (this.getOwnerComponent().getModel("appView").getProperty("/layout") !== "MidColumnFullScreen") {
                    this.getOwnerComponent().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
                }
            },
        });
    });
