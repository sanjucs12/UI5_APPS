sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("managepo.controller.Home", {
            onInit: function () {
            },

            handleBeforeRebind_PurchaseOrderTable: function (oEvent) {
                var sEmail = 'krishna@airditsoftware.com';
                var sPlantId = '1100'

                //ADDING TWO FILTERS i.e., PlantId and Email
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter({
                            path: 'Werks',
                            operator: sap.ui.model.FilterOperator.EQ,
                            value1: sPlantId
                        }),
                        new sap.ui.model.Filter({
                            path: 'Email',
                            operator: sap.ui.model.FilterOperator.EQ,
                            value1: sEmail
                        })
                    ],
                    and: true  // BOTH THE CONTITIONS SHOULD BE TRUE
                })
                oEvent.getParameter("bindingParams").filters.push(oFilter);
            },

            handleMyGroupTable_RowClick: function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext().getPath()
                console.log(oEvent.getSource().getBindingContext().getObject())
                //console.log(encodeURIComponent(sPath))
                // var oRouter = this.getOwnerComponent().getRouter();
                // oRouter.navTo('RoutePoDetails', {
                //     "po": encodeURIComponent(sPath)
                // })
            },

            handleMyPoTable_RowClick: function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext().getPath()
                //console.log(encodeURIComponent(sPath))
                var oRouter = this.getOwnerComponent().getRouter();
                // oRouter.navTo('RoutePoDetails', {
                //     "po": encodeURIComponent(sPath)
                // })
            }

        });
    });
