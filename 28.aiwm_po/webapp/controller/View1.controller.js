sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
],
    function (Controller, ODataModel, JSONModel, MessageToast) {
        "use strict";

        return Controller.extend("airdit.aiwm.sckinpo.aiwmpo.controller.View1", {
            onInit: function () {
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.selectedHeaders = [];
            },
            onPress: function (oEvent) {
                var that = this;
                var oSelectedItem = oEvent.getSource().getBindingContext().getObject();
                var sPath = oEvent.getSource().getBindingContext().getPath();
                var oModel = that.getView().getModel();

                oModel.read(sPath + "/to_POItem", {
                    // oModel.read(sItemsPath, {
                    success: function (oData) {
                        console.log("Retrieved data:", oData);
                        if (!that.oFragment) {
                            that.oFragment = new sap.ui.xmlfragment("airdit.aiwm.sckinpo.aiwmpo.fragments.display", that);
                            that.getView().addDependent(that.oFragment);

                            that.oFragment.open();
                            var oItemModel = new JSONModel(oData);
                            console.log("Model Data:", oItemModel.getData());
                            that.oFragment.setModel(oItemModel, "itemModel");

                        }
                        else {
                            var oItemModel = new JSONModel(oData);
                            that.oFragment.setModel(oItemModel, "itemModel")
                            that.oFragment.open();
                        }

                    },
                    error: function (oError) {
                        // Handle error
                        MessageToast.show("Error fetching PO items");
                        console.error("Error fetching PO items:", oError);
                    }

                });
            },
            onCloseDialog: function () {
                var that = this;
                that.oFragment.close()
                that.oFragment.destroy(true)
                that.oFragment = null
            },
            // onOkPress: function (oEvent) {
            // var aSelectedItems = [];
            // var oList = sap.ui.getCore().byId("poItemList");
            // var aSelectedContexts = oList.getSelectedContexts();

            // aSelectedContexts.forEach(function (oContext) {
            //     aSelectedItems.push(oContext.getObject());
            // });

            // console.log("Selected Items:", aSelectedItems);

            // if (aSelectedContexts.length === 0) {
            //     MessageToast.show("No items selected.");
            //     return;
            // }

            // var aSelectedItems = aSelectedContexts.map(function (oContext) {
            //     return oContext.getObject();
            // });

            // if (aSelectedItems.length === 0) {
            //     MessageToast.show("No items selected.");
            //     return;
            // }

            // // Accessing the purchase document number from the first selected item
            // var sPurchaseDocumentNumber = aSelectedItems[0].PurchasingDocumentNumber;
            // var aItemNumbers = aSelectedItems.map(function (item) {
            //     return item.PurchasingDocumentItemNumber;
            // });

            // // Navigate to next screen with header and selected items
            // this.oRouter.navTo("RouteView2", {
            //     PurchasingDocumentNumber: sPurchaseDocumentNumber,
            //     PurchasingDocumentItemNumber: aItemNumbers.join(",")

            // });



            // this.onCloseDialog();
            // },
            onProceed: function (oEvent) {
                var oView = this.getView();
                var oTable = this.byId("_IDGenSmartTable1").getTable(); // ID of the table
                var aSelectedItems = oTable.getSelectedContexts();

                if (aSelectedItems.length === 0) {
                    MessageToast.show("No items selected.");
                    return;
                }

                var aSelectedHeaders = aSelectedItems.map(function (oContext) {
                    return oContext.getObject();
                });

                this.selectedHeaders = aSelectedHeaders;

                if (!this.oFragment) {
                    this.oFragment = sap.ui.xmlfragment("airdit.aiwm.sckinpo.aiwmpo.fragments.display", this);
                    this.getView().addDependent(this.oFragment);
                }

                var oItemModel = new JSONModel({ items: this.selectedHeaders });
                this.oFragment.setModel(oItemModel, "itemModel");
                this._getitems();
                this.oFragment.open();


            },
            _getitems: function () {
                var that = this;
                var oModel = this.getOwnerComponent().getModel();
                var aData = this.selectedHeaders;;
                var aAllResults = [];
                // this.getView().setBusy(true);
                aData.forEach(function (item, index) {
                    oModel.read("/ZC_POListHeaderItem('" + item.PurchasingDocumentNumber + "')/to_POItem", {
                        success: function (oData) {
                            aAllResults = aAllResults.concat(oData.results);

                            if (index === aData.length - 1) { // Ensure all reads are complete
                                var oItemModel = new sap.ui.model.json.JSONModel({ items: aAllResults });
                                that.oFragment.setModel(oItemModel, "itemModel");
                                that.getView().setBusy(false);
                            }
                        },
                        error: function () {
                            that.getView().setBusy(false);
                            MessageToast.show("Error fetching item data.");
                        }
                    });
                });
            },
            onOkPress: function (oEvent) {
                var oView = this.getView();
                // var oList = this.byId("poItemList").getTable();
                var oList = sap.ui.getCore().byId("poItemList"); // ID of the list inside fragment
                var aSelectedContexts = oList.getSelectedContexts();

                if (aSelectedContexts.length === 0) {
                    MessageToast.show("No items selected.");
                    return;
                }

                var aSelectedItems = aSelectedContexts.map(function (oContext) {
                    return oContext.getObject();
                });

                var aHeaders = this.selectedHeaders.map(function (header) {
                    return header.PurchasingDocumentNumber.toString(); // Convert to string explicitly
                });

                var aItemNumbers = aSelectedItems.map(function (item) {
                    return item.PurchasingDocumentItemNumber.toString(); // Convert to string explicitly
                });
                // var aItemDocumentNumbers = aSelectedItems.map(function (item) {
                //     return item.PurchasingDocumentNumber;
                // });
                var sHeaders = aHeaders.join(",");
                var sItemNumbers = aItemNumbers.join(",");
                // var sItemDocumentNumbers = aItemDocumentNumbers.join(",");

                this.oRouter.navTo("RouteView2", {
                    headers: sHeaders,
                    itemNumbers: sItemNumbers,
                    // itemDocumentNumbers: sItemDocumentNumbers
                });

                this.oFragment.close();
                this.oFragment.destroy(true);
                this.oFragment = null;
            }

        });
    });
