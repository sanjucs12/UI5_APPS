sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
function (Controller) {
    "use strict";

    return Controller.extend("flexiblecolumnrouting.controller.view2", {
        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("Routeview2").attachPatternMatched(this._onRouteMatched, this);

        },
        _onRouteMatched:function(oEvent){
            let oModel = this.getOwnerComponent().getModel("appView")
            if (oModel.getProperty("/layout") !== "MidColumnFullScreen") {
				oModel.setProperty("/layout", "TwoColumnsMidExpanded");
			}
        },
        onClosePage: function () {
			//this.getOwnerComponent().getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			this.getOwnerComponent().getRouter().navTo("Routeview1");
		},
        toggleFullScreen: function () {
            let oModel = this.getOwnerComponent().getModel("appView")
			var bFullScreen = oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			oModel.setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
			if (!bFullScreen) {
				// store current layout and go full screen
				oModel.setProperty("/previousLayout", oModel.getProperty("/layout"));
				oModel.setProperty("/layout", "MidColumnFullScreen");
			} else {
				// reset to previous layout
				oModel.setProperty("/layout",  oModel.getProperty("/previousLayout"));
			}

		},
        goToView3:function(){
            this.getOwnerComponent().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            this.getOwnerComponent().getRouter().navTo("Routeview3")
        }
    });
});
