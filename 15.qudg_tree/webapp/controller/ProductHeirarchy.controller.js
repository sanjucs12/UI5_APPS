sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("qudgtree.controller.ProductHeirarchy", {
            stringToNumber: function (value) {
                return Number(value);
            },
            
            onInit: function () {
                var oModel = this.getOwnerComponent().getModel();
                //console.log(oModel)
                oModel.read("/ZC_QUDG_MM_PRODH", {
                    success: function (response) {
                        console.log("Data Read Successfully: ", response);
                        var oJSONModel = new sap.ui.model.json.JSONModel(response);
                        this.getView().byId("Tree").setModel(oJSONModel, "JSONModel_Data");
                    }.bind(this),
                    error: function (oError) {
                        console.error("Error reading data: ", oError);
                    }
                })
            },
       
        });
    });
