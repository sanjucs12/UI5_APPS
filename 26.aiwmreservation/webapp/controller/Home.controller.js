sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    function (Controller) {
        "use strict";

        return Controller.extend("aiwmreservation.controller.Home", {
            onInit: function () {

            },
            onPressItemDetails: function () {
                let oTable = this.byId('idHeaderTable')
                let sMaterialNo = oTable.getSelectedContexts()[0].getObject().MaterialDocument
                this._ItemDialog = this.getView().byId("idItemsDialog");
                if (!this._ItemDialog) {
                    this._ItemDialog = sap.ui.xmlfragment("aiwmreservation.fragments.ItemDetails", this);
                    this.getView().addDependent(this._ItemDialog);
                }
                this._ItemDialog.setEscapeHandler(this.onPressEscapeButton.bind(this));
                this._ItemDialog.open()
            },

            handle_ItemDialogClose: function (oEvent) {
                this._ItemDialog.close();
                this._ItemDialog.destroy();
            },
            onPressEscapeButton: function () {
                this._ItemDialog.close();
                this._ItemDialog.destroy();
            },
            onBeforeRebindItemTable: function (oEvent) {
                let oTable = this.byId('idHeaderTable')
                let sMaterialNo = oTable.getSelectedContexts()[0].getObject().MaterialDocument
                // var oFilter = new sap.ui.model.Filter({
                //     filters: [
                //         new sap.ui.model.Filter({
                //             path: 'MaterialDocument',
                //             operator: sap.ui.model.FilterOperator.EQ,
                //             value1: sMaterialNo
                //         })
                //     ],
                //     and: true // BOTH THE CONTITIONS SHOULD BE TRUE
                // })
                // oEvent.getParameter("bindingParams").filters.push(oFilter);
            },
            onPressGoodsIssue: function (oEvent) {
                let aSelectedItems = this.byId('idHeaderTable').getSelectedContexts()
                let sReservationNo = aSelectedItems[0].getObject().ReservationNumber
                let aReservationItems = []
                aSelectedItems.map((item)=>{
                    aReservationItems.push(item.getObject().ReservationItem)
                })

                let oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo('GoodsIssue', {
                    ReservationNo: sReservationNo,
                    ReservationItems: JSON.stringify(aReservationItems)
                })
            }
        });
    });
