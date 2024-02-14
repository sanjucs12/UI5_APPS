sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("managepo.controller.PoDetails", {
            onInit: function () {
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RoutePoDetails").attachPatternMatched(function (oEvent) {
                    var sPO = oEvent.getParameter("arguments").po;
                    var sVendor = oEvent.getParameter("arguments").vendor;
                    console.log(sVendor)
                    this.PO_Number = sPO;
                    this.getView().byId('smartTable_ItemDetails').rebindTable()
                    this.getView().byId('smartTable_ServiceDetails').rebindTable()
                    this.getView().byId('smartTable_DeliveryDetails').rebindTable()
                    this.getView().byId('smartTable_InvoiceDetails').rebindTable()
                    this.getView().byId('smartTable_AccountAssaignment').rebindTable()
                    this.getView().byId('smartTable_CustomerData').rebindTable()
                    this.getView().byId('title_poNumber').setText(sPO)
                    this.getView().byId('text_vendor1').setText(sVendor)
                    this.getView().byId('text_vendor2').setText(sPO)
                }, this);
            },

            handleBeforeRebind_Table: function (oEvent) {
                // var oFilter = new sap.ui.model.Filter({
                //     path: "Ebeln",
                //     operator: sap.ui.model.FilterOperator.EQ,
                //     value1: this.PO_Number
                // });
                var sEmail = 'krishna@airditsoftware.com';
                var sPlantId = '1100'
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
                        }),
                        new sap.ui.model.Filter({
                            path: 'Ebeln',
                            operator: sap.ui.model.FilterOperator.EQ,
                            value1: this.PO_Number
                        })
                    ],
                    and: true  // BOTH THE CONTITIONS SHOULD BE TRUE
                })
                oEvent.getParameter("bindingParams").filters.push(oFilter);
            },

        });
    });
