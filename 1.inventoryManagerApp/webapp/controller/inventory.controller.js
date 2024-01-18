sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "inventory/utils/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, formatter, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("inventory.controller.inventory", {
            customFormatter: formatter,
            onInit: function () {
                var oModel = this.getOwnerComponent().getModel("inventoryItemsModel");
                var ProductCollection = oModel.getProperty("/ProductCollection");

                ProductCollection.forEach((product) => {
                    product.Editable = false;
                });
                // oModel.setProperty("/ProductCollection", ProductCollection);
                // console.log(oModel.getData());
            },

            handleEditButton: function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext('inventoryItemsModel').getPath();
                var oModel = this.getView().getModel("inventoryItemsModel");
                oModel.setProperty(sPath + "/Editable", true);
            },

            handleCancelButton: function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext('inventoryItemsModel').getPath();
                var oModel = this.getView().getModel("inventoryItemsModel");

                // Create a deep copy of the original data when entering edit mode
                oModel.setProperty(sPath + "/OriginalData", JSON.parse(JSON.stringify(oModel.getProperty(sPath))));
                oModel.setProperty(sPath + "/Editable", true);

                oModel.setProperty(sPath + "/Editable", false); // Set the "Editable" property back to false
                console.log(oModel.getData())
            },

            handleSaveButton: function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext('inventoryItemsModel').getPath();
                var oModel = this.getView().getModel("inventoryItemsModel");
                oModel.setProperty(sPath + "/Editable", false);
                console.log(oModel.getData());
            },

            handleDeleteButton: function (oEvent) {
                var oRow = oEvent.getSource().getParent().getParent();
                var oModel = this.getView().getModel("inventoryItemsModel");
                var sPathObject = oRow.getBindingContext("inventoryItemsModel").getObject();
                var aProductCollection = oModel.getProperty("/ProductCollection");
                var getNumberOfItemsText = this.getView().byId('itemsCount');


                // Find the index of the item to delete
                var iIndex = aProductCollection.findIndex(function (oItem) {
                    return oItem === sPathObject;
                });

                // Remove the item from the array
                aProductCollection.splice(iIndex, 1);

                // Update the model to reflect the changes
                oModel.setProperty("/ProductCollection", aProductCollection);
                // console.log(oModel.getData());
            },

            handleOpenDialog: function (oEvent) {

                //OPENING THE DIALOG AND BINDING THE DATA
                var sPath = oEvent.getSource().getBindingContext('inventoryItemsModel').getPath();
                if (!this.productInfoDialog) {
                    this.loadFragment({
                        name: "inventory.fragments.productInfoDialog"
                    }).then(function (oDialog) {
                        this.productInfoDialog = oDialog;
                        this.productInfoDialog.bindElement({
                            path: sPath,
                            model: "inventoryItemsModel"
                        });
                        this.productInfoDialog.open();
                    }.bind(this));
                } else {
                    this.productInfoDialog.bindElement({
                        path: sPath,
                        model: "inventoryItemsModel"
                    });
                    this.productInfoDialog.open();
                }
            },

            handleCloseDialog: function () {
                this.productInfoDialog.close();
            },

            handleGetJsonModel: function () {
                var oModel = this.getOwnerComponent().getModel("inventoryItemsModel");
                //Getting Data from Model
                var data = oModel.getData();
                console.log(data);
            },
            handleSearchFilter: function (oEvent) {
                // build filter array
                var aFilter = [];
                var sQuery = oEvent.getParameter("newValue"); //THE SEARCH TERM ENTERED IS STORED IN THE 'query' PROPERTY of oEvent Object
                if (sQuery) {
                    //Creating new filter 
                    var newFilter = new Filter({
                        path: "Category",
                        operator: FilterOperator.Contains,
                        value1: sQuery
                    })
                    aFilter.push(newFilter);
                    // aFilter.push(new Filter("Category", FilterOperator.Contains, sQuery));
                }

                // filter binding
                var oTable = this.byId("tableId");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(aFilter);

                // Update the count based on the filtered items
                var iFilteredItems = oBinding.getLength();
                this.getView().byId("itemsCount").setText("(" + iFilteredItems + ")");
            },

        });
    });

