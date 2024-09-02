sap.ui.define(
    [
        "sap/ui/core/mvc/Controller"
    ],
    function(BaseController) {
      "use strict";
  
      return BaseController.extend("capdocintelligence.controller.App", {
        onInit : function () {
          debugger;
          var oViewModel,
            fnSetAppNotBusy,
            iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
    
          oViewModel = new sap.ui.model.json.JSONModel({
            busy : false,
            delay : 0,
            layout : "OneColumn",
            previousLayout : "",
            actionButtonsInfo : {
              midColumn : {
                fullScreen : false
              }
            }
          });
          this.getOwnerComponent().setModel(oViewModel, "appView");
    
          fnSetAppNotBusy = function() {
            oViewModel.setProperty("/busy", false);
            oViewModel.setProperty("/delay", iOriginalBusyDelay);
          };
    
          // // since then() has no "reject"-path attach to the MetadataFailed-Event to disable the busy indicator in case of an error
          // this.getOwnerComponent().getModel().metadataLoaded().then(fnSetAppNotBusy);
          // this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);
    
          // // apply content density mode to root view
          // this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }
      });
    }
  );
  