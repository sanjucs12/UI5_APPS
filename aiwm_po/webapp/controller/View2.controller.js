sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/ui/layout/form/SimpleForm",
    "sap/m/MessageToast",
    "sap/m/Input",
    "sap/ui/core/Fragment"
],
    function (Controller, ODataModel, JSONModel, SimpleForm, MessageToast, Input, Fragment) {
        "use strict";

        return Controller.extend("airdit.aiwm.sckinpo.aiwmpo.controller.View2", {
            onInit: function () {
                var oViewModel = new JSONModel({
                    headerData: {} // Initialize with empty object or default values
                });
                this.getView().setModel(oViewModel, "viewModel");
                var oView = this.getView();
                var oInput = new Input({
                    id: "serialInput", // Assign ID here
                    width: "10rem",
                    placeholder: "Enter serial number..."
                });
                oView.byId("vboxId").addItem(oInput);

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("RouteView2").attachPatternMatched(this._onObjectMatched, this);

            },
            _onObjectMatched: function (oEvent) {
                var sHeaders = oEvent.getParameter("arguments").headers;
                var sItemNumbers = oEvent.getParameter("arguments").itemNumbers;

                if (!sHeaders || !sItemNumbers) {
                    sap.m.MessageToast.show("Missing header or item numbers.");
                    return;
                }

                var aHeaders = sHeaders.split(",");
                var aItemNumbers = sItemNumbers.split(",");

                var oView = this.getView();
                var oModel = oView.getModel();

                var oViewModel = oView.getModel("viewModel");
                if (!oViewModel) {
                    sap.m.MessageToast.show("ViewModel not initialized.");
                    return;
                }

                // Clear existing items
                var oVBox = oView.byId("vboxId");
                if (oVBox) {
                    oVBox.removeAllItems();
                } else {
                    sap.m.MessageToast.show("VBox control not found.");
                    console.error("VBox control not found.");
                    return;
                }

                // Fetch header data and items for each header
                aHeaders.forEach(function (sHeader) {
                    var sHeaderPath = `/ZC_POListHeaderItem('${sHeader}')`;
                    oModel.read(sHeaderPath, {
                        success: function (oData) {
                            var oHeaderModel = new sap.ui.model.json.JSONModel(oData);
                            oView.setModel(oHeaderModel, "headerModel");
                            oViewModel.setProperty("/headerData", oData);

                            this._fetchItemData(sHeader, aItemNumbers, oVBox);
                        }.bind(this),
                        error: function (oError) {
                            sap.m.MessageToast.show("Error fetching PO header data.");
                            console.error("Error fetching PO header data:", oError);
                        }
                    });
                }.bind(this));
            },

            _fetchItemData: function (sHeader, aItemNumbers, oVBox) {
                var oView = this.getView();
                var oModel = oView.getModel();
                var oViewModel = oView.getModel("viewModel");
                var aUniqueItems = [];

                var aPromises = aItemNumbers.map(function (sItemNumber) {
                    return new Promise(function (resolve, reject) {
                        var sItemPath = `/ZC_POList(PurchasingDocumentNumber='${sHeader}',PurchasingDocumentItemNumber='${sItemNumber}')`;
                        oModel.read(sItemPath, {
                            success: function (oData) {
                                // Check if the item is already in the list of unique items
                                var bDuplicate = aUniqueItems.some(function (oItem) {
                                    return oItem.PurchasingDocumentItemNumber === oData.PurchasingDocumentItemNumber;
                                });
                                if (!bDuplicate) {
                                    aUniqueItems.push(oData);
                                }
                                resolve();
                            },
                            error: reject
                        });
                    });
                });

                Promise.all(aPromises).then(function () {
                    this._addFormsForItems(sHeader, aUniqueItems, oVBox);
                }.bind(this)).catch(function (oError) {
                    sap.m.MessageToast.show("Error fetching PO item data.");
                    console.error("Error fetching PO item data:", oError);
                });
            },

            _addFormsForItems: function (sHeader, aItems, oVBox) {
                var oView = this.getView();
                var oViewModel = oView.getModel("viewModel");
                var oHeaderData = oViewModel.getProperty("/headerData");
                var that = this;
                var oHeaderForm = new sap.ui.layout.form.SimpleForm({
                    layout: "ResponsiveGridLayout",
                    editable: false,
                    // title: `Header Information for ${sHeader}`,
                    title: `PO details`,
                    content: [
                        new sap.m.Label({ text: "Vendor Name" }),
                        new sap.m.Text({ text: oHeaderData.Vendor + " " + oHeaderData.VendorName }),
                        new sap.m.Label({ text: "PO Type" }),
                        new sap.m.Text({ text: oHeaderData.PODocumentType + " " + oHeaderData.PODocumentTypeDescription }),
                        new sap.m.Label({ text: "Document Date" }),
                        new sap.m.Text({ text: oHeaderData.DocumentDate }),
                        new sap.ui.core.Title({}),
                        new sap.m.Label({ text: "Posting Date" }),
                        new sap.m.DatePicker({ value: new Date().toISOString().split('T')[0] }),
                        new sap.m.Label({ text: "Delivery Note" }),
                        new sap.m.Input({
                            width: "15rem",
                        }),
                        new sap.m.Label({ text: "Bill of Lading" }),
                        new sap.m.Input({
                            width: "15rem",
                        }),
                        new sap.m.Label({ text: "Header Text" }),
                        new sap.m.Input({
                            width: "15rem",
                        }),
                        // Add more header fields as needed
                    ]
                });
                oVBox.addItem(oHeaderForm);
                var that = this;
                aItems.forEach(function (oItem) {
                    var oForm = new sap.ui.layout.form.SimpleForm({
                        layout: "ResponsiveGridLayout",
                        editable: false,
                        title: `Item data`,
                        // title: `Item Details for ${oItem.PurchasingDocumentItemNumber}`,
                        content: [
                            new sap.m.Label({ text: "Purchasing Document Number" }),
                            new sap.m.Text({ text: oItem.PurchasingDocumentNumber }),
                            new sap.m.Label({ text: "Material Number" }),
                            new sap.m.Text({ text: oItem.MaterialNumber + " " + oItem.MaterialDescription }),
                            new sap.m.Label({ text: "Purchasing Document Item Number" }),
                            new sap.m.Text({ text: oItem.PurchasingDocumentItemNumber }),
                            new sap.m.Label({ text: "Order Quantity" }),
                            new sap.m.Text({ text: oItem.PurchaseOrderQuantity + "-" + oItem.PurchaseOrderUnitMeasure }),
                            new sap.m.Label({ text: "Plant" }),
                            new sap.m.Text({ text: oItem.Plant + " -" + oItem.PlantName }),
                            new sap.m.Label({ text: "Delivery Date" }),
                            new sap.m.Text({ text: oItem.ItemDeliveryDate }),
                            new sap.m.Label({ text: "Delivery QTY" }),
                            new sap.m.Text({ text: oItem.OpenQuantity + "-" + oItem.PurchaseOrderUnitMeasure }),
                            new sap.ui.core.Title({}),
                            new sap.m.Label({ text: "Movement Type" }),
                            new sap.m.Text({ text: oItem.MovementType }),
                            new sap.m.Label({ text: "Serial No" }),
                            new sap.m.CheckBox({

                                selected: !oItem.SerialNumber
                            }),
                            new sap.m.Label({ text: "Batch" }),
                            new sap.m.CheckBox({}),
                            new sap.m.Label({ text: "SLED" }),
                            new sap.m.CheckBox({}),
                            new sap.m.Label({ text: "WM Activated" }),
                            new sap.m.CheckBox({}),
                            new sap.m.Label({ text: "Storage Location" }),
                            new sap.m.ComboBox({
                                width: "10rem",
                                items: {
                                    path: '/ZC_POList',
                                    template: new sap.ui.core.Item({
                                        key: '{StorageLocation}',
                                        text: '{StorageLocation}'
                                    })
                                }
                            }),
                            new sap.m.Label({ text: "GR QTY" }),
                            new sap.m.ComboBox({
                                width: "10rem",
                                items: {
                                    path: '/ZC_POList',
                                    template: new sap.ui.core.Item({
                                        key: '{UOMDimension}',
                                        text: '{UOMDimension}'
                                    })
                                }
                            }),
                            new sap.m.Label({ text: "Stock Type" }),
                            new sap.m.ComboBox({
                                width: "10rem",
                                items: {
                                    path: '/ZC_POList',
                                    template: new sap.ui.core.Item({
                                        key: '{StockType}',
                                        text: '{StockType}'
                                    })
                                }
                            }),
                            new sap.m.Label({ text: "Special Stock" }),
                            new sap.m.Input({
                                width: "15rem",
                            }),
                            new sap.m.Label({ text: "Item Remarks" }),
                            new sap.m.Input({
                                width: "15rem",
                            }),
                            new sap.m.Label({ text: "Unloading Point" }),
                            new sap.m.Input({
                                width: "15rem",
                            }),
                            new sap.m.Label({ text: "Batch" }),
                            new sap.m.ComboBox({
                                width: "10rem",
                                items: {
                                    path: '/ZC_POList',
                                    template: new sap.ui.core.Item({
                                        key: '{Batch}',
                                        text: '{Batch}'
                                    })
                                }
                            }),
                            new sap.m.Label({ text: "Serial Number" }),
                            new sap.m.ComboBox({
                                width: "10rem",
                                items: [
                                    new sap.ui.core.Item({ key: "SG", text: "System Generated" }),
                                    new sap.ui.core.Item({ key: "CM", text: "Created Manually" }),
                                    new sap.ui.core.Item({ key: "AESN", text: "Assign Existing Serial Number" })
                                ],
                                selectionChange: function (oEvent) {
                                    var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
                                    // var oInput = this.getView().byId("serialInput");

                                    if (sSelectedKey === "SG") {
                                        var sSerialNumber = "SG-" + Math.floor(Math.random() * 10000); // Example: SG-1234
                                        MessageToast.show("Generated Serial Number: " + sSerialNumber);

                                    } else if (sSelectedKey === "CM") {
                                        // Open the fragment for manual serial number input
                                        if (!that.oFragment) {
                                            that.oFragment = sap.ui.xmlfragment("airdit.aiwm.sckinpo.aiwmpo.fragments.serialnumber", this);
                                            that.getView().addDependent(that.oFragment);
                                            that.oFragment.open();
                                        }
                                    }
                                },
                            }),

                            new sap.m.Label({ text: "Storage Bin" }),
                            new sap.m.ComboBox({
                                width: "10rem",
                                items: {
                                    path: '/ZC_POList',
                                    template: new sap.ui.core.Item({
                                        key: '{WarehouseNumber}',
                                        text: '{WarehouseNumber}'
                                    })
                                }
                            }),
                        ]
                    });
                    oVBox.addItem(oForm);
                });
            },
            onSerial: function () {
                var oInput = sap.ui.getCore().byId("inputid");
                var sSerialNumber = oInput.getValue();
                if (sSerialNumber) {
                    MessageToast.show("Entered Serial Number: " + sSerialNumber);
                    that.oFragment.close();
                    // Here you can add logic to handle the entered serial number as needed
                } else {
                    MessageToast.show("Please enter a serial number.");
                }
            },


            onCheckPress: function () {
                var oView = this.getView();
                var oVBox = oView.byId("vboxId");
                var oView = this.getView();
                var oViewModel = oView.getModel("viewModel");
                var oHeaderData = oViewModel.getProperty("/headerData")|| {};
                var aItemData = oViewModel.getProperty("/itemData")|| {};
                if (!Array.isArray(aItemData)) {
                    aItemData = [];
                }

                // if (!SerialNumber) {
                //     // Prompt for serial numbers
                //     MessageToast.show("Please provide serial number.");
                // } else {
                //     // Proceed with post operation
                //     this._handlePost();
                // }

                var sObj = {
                    "NumberofMaterialDocument": "1",
                    "MaterialDocumentYear": "2024",
                    "DocumentDateinDocument": "2024-06-27T12:00:00",
                    "PostingDateintheDocument": "2024-06-22T07:14:11",
                    "DocumentHeaderText": oHeaderData.DocumentHeaderText || null,
                    "ReferenceDocumentNumber": oHeaderData.ReferenceDocumentNumber || null,
                    "NumberofBillofLading": oHeaderData.NumberofBillofLading || null,
                    "GoodsReceiptIssueSlipNumber": oHeaderData.GoodsReceiptIssueSlipNumber || "",
                    "to_Item": {
                        "results": aItemData.map(function (oItem) {
                            return {
                                "NumberofMaterialDocument": "1",
                                "MaterialDocumentYear": "2024",
                                "MaterialNumber": oItem.MaterialNumber,
                                "Plant": oItem.Plant,
                                "ObjectListCounter": 1,
                                "ObjectListNumber": "0",
                                "MaterialDocumentItem": "",
                                "MovementType": "101",
                                "StorageLocation": oItem.StorageLocation,
                                "BatchNumber": oItem.BatchNumber || "",
                                "StockType": oItem.StockType || "",
                                "SpecialStockIndicator": oItem.SpecialStockIndicator || "",
                                "ItemNumberinSalesOrder": oItem.ItemNumberinSalesOrder || "0",
                                "DeliveryScheduleforSalesOrder": oItem.DeliveryScheduleforSalesOrder || "",
                                "QuantityInEntryUnit": oItem.QuantityInEntryUnit,
                                "UnitofEntry": oItem.UnitofEntry,
                                "PurchasingOrderNumber": oItem.PurchasingOrderNumber,
                                "ItemNumberofPurchasingDocument": oItem.ItemNumberofPurchasingDocument,
                                "QuantityinPurchaseOrder": oItem.QuantityinPurchaseOrder,
                                "IsCompletelyDelivered": oItem.IsCompletelyDelivered || false,
                                "ItemText": oItem.ItemText || "",
                                "GoodsRecipient": oItem.GoodsRecipient || "",
                                "UnloadingPoint": oItem.UnloadingPoint || "",
                                "OrderNumber": oItem.OrderNumber || "",
                                "OrderItemNumber": oItem.OrderItemNumber || "",
                                "NumberofReservation": oItem.NumberofReservation || "",
                                "ItemNumberofReservation": oItem.ItemNumberofReservation || "0",
                                "SerialNoAutoNumberAssignment": oItem.SerialNoAutoNumberAssignment || false,
                                "MovementIndicator": oItem.MovementIndicator || "B",
                                "ReasonforMovement": oItem.ReasonforMovement || "",
                                "ShelfLifeExpirationDate": oItem.ShelfLifeExpirationDate,
                                "ProductionDate": oItem.ProductionDate,
                                "ProfitabilitySegmentNumber": oItem.ProfitabilitySegmentNumber || "",
                                "ManufacturerDate": oItem.ManufacturerDate,
                                "TransferRequirementNumber": oItem.TransferRequirementNumber || "",
                                "SerialNumber": oItem.SerialNumber || "",
                                "StorageBin": oItem.StorageBin || "",
                                "SerialNumberList": oItem.SerialNumberList || "[]"
                            };
                        })
                    }
                };

                // Post the combined object to the backend
                this.getOwnerComponent().getModel("itemModel").create("/ZC_GRReservationHeader", sObj, {
                    success: function (data, sResponse) {
                        sap.m.MessageToast.show("Post successful.");
                        console.log("Success:", data);
                    },
                    error: function (eResponse) {
                        sap.m.MessageToast.show("Post failed.");
                        console.error("Error:", eResponse);
                    }
                });


            },


            // },


        });
    });