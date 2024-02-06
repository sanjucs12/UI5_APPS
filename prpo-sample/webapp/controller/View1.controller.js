sap.ui.define([
    "sap/ui/core/mvc/Controller",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("prposample.controller.View1", {
            stringToNumber: function (value) {
                return Number(value);
            },

            statusColorFormatter: function (days) {
                // if (days > 5) {
                //     return "Good"
                // } 
                // else {
                //     return "Critical"
                // }
                if (days >= 0 && days < 4) {
                    return 'Error'
                }
                else if (days >= 4 && days <= 7) {
                    return 'Neutral'
                } else if (days > 7) {
                    return 'Good'
                }
            },

            onInit: function () {
            },

            // handleBeforeRebindTable: function (oEvent) {
            //     var oModel = this.getOwnerComponent().getModel();
            //     var that = this;
            //     oModel.read("/C_Purchasereqitmdtlsext", {
            //         success: function (response) {
            //             console.log(response);
            //             var oJSONModel_Data = new sap.ui.model.json.JSONModel(response);
            //             that.getView().setModel(oJSONModel_Data,"oJSONModel_Data");
            //         },
            //         error: function (oError) {
            //             console.log(oError);
            //         }
            //     })
            // }
        });
    });
