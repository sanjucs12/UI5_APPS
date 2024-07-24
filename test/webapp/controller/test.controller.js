sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "sap/ui/table/Table",
    "sap/ui/table/Column",
    'sap/ui/comp/library',
    'sap/ui/model/type/String',
    'sap/m/ColumnListItem',
    'sap/m/Label',
    'sap/m/SearchField',
    'sap/m/Token',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/m/Column',
    'sap/m/Table',
    'sap/m/Text',
    "com/am/armp/spListAppBase/spPoList/lib/download"

], function (Controller, Fragment, JSONModel, MessageBox, ODataModel, ValueHelpDialog, Table, library, String, ColumnListItem, Label, SearchField, Token, Filter, FilterOperator, Column, Text) {
    "use strict";
    return sap.ui.controller("com.am.armp.spListAppBase.spPoList.controller.MainCustom", {
        //=======================================
        // PROPERTIES
        //=======================================
        //=======================================
        // LIFE CYCLE
        //=======================================

        //=======================================
        // HOOKS
        //=======================================

        //=======================================
        // EVENT HANDLERS
        //=======================================

        onInit: function () {

            var oviewModel = new sap.ui.model.json.JSONModel({});
            this.getView().setModel(oviewModel, "viewModel");
            this.getView().getModel("viewModel").setProperty("/Value", "");
            this.getView().getModel("viewModel").setProperty("/setEnabled", false);
            this.getView().getModel("viewModel").setProperty("/DeviceId", []);
            this.getView().getModel("viewModel").setProperty("/selectedValue", "");
            // this.getView().getModel("viewModel").setProperty("/Selection",false);
            this.getView().getModel("viewModel").setProperty("/abuttonEnabled", true);
            this.getView().getModel("viewModel").setProperty("/dbuttonEnabled", true);
            this.getView().setModel(this.getOwnerComponent().getModel("i18n"), "i18n");


            this.getView().setModel(this.valueHelpModel, "valueHelp");

            this.getView().getModel("viewModel").setProperty("/deassigndevices", []);
            var that = this;
            var data = {};

            $.when(this._getService().CheckAssignmentButtons(data))
                .done(jQuery.proxy(function (oData) {
                    var value = oData.Value;

                    this.getView().getModel("viewModel").setProperty("/Value", value);
                    if (this.getView().getModel("viewModel").getProperty("/Value") === 'X') {

                        this.getView().byId("assign").setVisible(true);

                        this.getView().byId("deassign").setVisible(true);
                        var oTable = this.byId("myTable");
                        oTable.setMode("SingleSelectLeft");
                        // var oSelectedItem = oTable.getSelectedItem();
                        // 	this.getView().getModel("viewModel").setProperty("/SelectedItems",oSelectedItem);
                        if (this.getView().getModel("viewModel").getProperty("/setEnabled") === false) {

                            this.getView().byId("assign").setEnabled(false);

                            this.getView().byId("deassign").setEnabled(false);
                        }
                        // this.getView().getModel("viewModel").setProperty("/Selection",true);
                        oTable.attachSelectionChange(this.onSelectionChange, this);


                    } else {

                        this.getView().byId("assign").setVisible(false);
                        this.getView().byId("deassign").setVisible(false);
                        // this.getView().getModel("viewModel").setProperty("/Selection",false);
                    }

                }, this))
                .fail(jQuery.proxy(function (oError) {
                    this.getView().setBusy(false);
                    MessageBox.error(oError.responseText);
                }, this));
        },

        onSelectionChange: function (oEvent) {
            var oSmartTable = this.getView().byId("myTable");
            var oSelectedItem = oSmartTable.getSelectedItem();
            var oSelectedData = oSelectedItem.getBindingContext().getObject();

            if (oSelectedData.Assigned === "X") {
                this.getView().byId("deassign").setEnabled(true);
                // this.getView().byId("assign").setEnabled(false);
            }
            else {
                this.getView().byId("deassign").setEnabled(false);
            }

            if (oSelectedData.AssignPossible = true) {
                this.getView().byId("assign").setEnabled(true);
            }
            else {
                this.getView().byId("assign").setEnabled(false);
            }
            this.getView().getModel("viewModel").setProperty("/setEnabled", true);
            this.getView().setModel(new sap.ui.model.json.JSONModel({
                aPoNr: oSelectedData.PoNr,
                aPoPosNr: oSelectedData.PoPosNr,
                aPmOrderNr: oSelectedData.PmOrderNr,
                aOperation: oSelectedData.Operation
            }), "viewModel");

            let Pmorder = this.getView().getModel("viewModel").getProperty("/aPmOrderNr")
            if (Pmorder.length < 11 && Pmorder !== "") {

                let result = Pmorder.padStart(12, '0')
                console.log(result)
                this.getView().getModel("viewModel").setProperty("/aPmOrderNr", result)
            }

        },

        onPoPress: function (oEvent) {
            this.getRouter().navTo("detail", {
                id1: oEvent.getSource().getBindingContext().getProperty("PoNr"),
                id2: oEvent.getSource().getBindingContext().getProperty("PoPosNr")
            });
        },

        //=======================================
        // PRIVATE METHODS
        //=======================================
        assigntoMobile: function () {
            var poNr = this.getView().getModel("viewModel").getProperty("/aPoNr");
            var poPosNr = this.getView().getModel("viewModel").getProperty("/aPoPosNr");
            this._getService().fetchNavDevIdData(poNr, poPosNr)
                .then(jQuery.proxy(function (oData) {

                    var deviceData = oData;

                    var DeviceIds = [];

                    var Plants = [];



                    if (deviceData.results.length > 0) {

                        for (let i = 0; i < deviceData.results.length; i++) {

                            DeviceIds.push(deviceData.results[i].DeviceId);

                            Plants.push(deviceData.results[i].Werks);

                        }

                        var formattedData = DeviceIds.map(function (DeviceId, index) {

                            return DeviceId + " " + " " + Plants[index];

                        });

                        this.getView().getModel("viewModel").setProperty("/deviceData", formattedData.join('\n'));

                    } else {
                        this.getView().setModel(this.getOwnerComponent().getModel("i18n"), "i18n");
                        this.getView().getModel("viewModel").setProperty("/deviceData", this.getView().getModel("i18n").getProperty("noDevicesAssigned"));
                        // this.getView().getModel("viewModel").setProperty("/deviceData", "No devices assigned yet");

                    }
                    this.getView().getModel("viewModel").setProperty("/selectedValue", "");
                    this.getView().getModel("viewModel").refresh(true);
                    var oView = this.getView();
                    if (!this._oAssignDialog) {

                        Fragment.load({

                            name: "com.am.armp.spListAppBase.spPoList.view.Assigntomobile",

                            controller: this

                        }).then(function (oDialog) {
                            this._oAssignDialog = oDialog;
                            oView.addDependent(oDialog);
                            this.getView().getModel("viewModel").setProperty("/abuttonEnabled", false);
                            oDialog.open();
                        }.bind(this));

                    } else {
                        this.getView().getModel("viewModel").setProperty("/abuttonEnabled", false);
                        this._oAssignDialog.open();

                    }
                }, this))

                .fail(jQuery.proxy(function (oError) {
                    MessageBox.error(oError.responseText);
                }, this));

        },

        onAssignButtonPress: function (oEvent) {
            var that = this;
            var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/ARMP/GW_PM_PO_SRV", true);

            var PoNr = this.getView().getModel("viewModel").getProperty("/aPoNr"),
                PoPosNr = this.getView().getModel("viewModel").getProperty("/aPoPosNr"),
                PmOrderNr = this.getView().getModel("viewModel").getProperty("/aPmOrderNr"),
                Operation = this.getView().getModel("viewModel").getProperty("/aOperation");
            var DeviceId = this.getView().getModel("viewModel").getProperty("/selectedValue");

            this.urlParam = {
                PoNr: PoNr,
                PoPosNr: PoPosNr,
                PmOrderNr: PmOrderNr,
                DeviceId: DeviceId,
                Operation: Operation
            }
            $.when(this._getService().assignOrder(this.urlParam)).done(
                function (urlParam) {
                    sap.m.MessageBox.success(this.getText("AssignSuccess", [this.urlParam.PoNr, this.urlParam.PoPosNr, this.urlParam.DeviceId]));
                    // sap.m.MessageBox.show("PO item " + PoNr + " " + PoPosNr + " assigned to device " + DeviceId + " successfully.");


                    that.getView().byId("deassign").setEnabled(false);
                    that.getView().byId("assign").setEnabled(false);
                    that.getView().byId("ContractSmartTable").rebindTable(true);
                    that._oAssignDialog.close();
                    that._oValueHelpDialog.destroy(true);
                    that._oValueHelpDialog = undefined;

                    that.getView().getModel("viewModel").refresh(true);


                }.bind(this)
            ).fail(function (oError) {
                var errorData = JSON.parse(oError.responseText);
                errorData = errorData?.error?.message?.value;
                MessageBox.error(errorData);
            }.bind(this)
            );


        },

        // 			error: function(oError) {
        // 				var errorData = JSON.parse(oError.response.body);

        // 				var errorMessage = errorData.error.message.value;

        // 				MessageBox.error(errorMessage);

        // 			}

        // 	});
        // },

        onCancelAssignButtonPress: function (oEvent) {
            if (this._oAssignDialog) {

                //   this._oAssignDialog.close();
                this.getView().getModel("viewModel").setProperty("/selectedValue", "");
                if (this._oValueHelpDialog) {
                    this._oValueHelpDialog.destroy(true);
                    this._oValueHelpDialog = undefined;
                }


                this._oAssignDialog.close();
                this._oAssignDialog.destroy(true);
                this._oAssignDialog = undefined;

            }
        },

        deassignMobile: function () {
            var PoNr = this.getView().getModel("viewModel").getProperty("/aPoNr"),
                PoPosNr = this.getView().getModel("viewModel").getProperty("/aPoPosNr");
            this._getService().fetchNavDevIdData(PoNr, PoPosNr)
                .then(jQuery.proxy(function (oData) {
                    this.getView().getModel("viewModel").setProperty("/deassignDevice", oData);
                    var oView = this.getView();
                    if (!this._oDeassignDialog) {
                        Fragment.load({
                            name: "com.am.armp.spListAppBase.spPoList.view.Deassigntovmobile",
                            controller: this
                        }).then(function (oDialog) {
                            this._oDeassignDialog = oDialog;
                            oView.addDependent(oDialog);
                            this.getView().getModel("viewModel").setProperty("/dbuttonEnabled", false);
                            oDialog.open();
                        }.bind(this));

                    } else {
                        this.getView().getModel("viewModel").setProperty("/dbuttonEnabled", false);
                        this._oDeassignDialog.open();

                    }
                }, this))

                .fail(jQuery.proxy(function (oError) {
                    MessageBox.error(oError.responseText);
                }, this));

        },

        onDeassignButtonPress: function (oEvent) {
            var that = this
            var PoNr = this.getView().getModel("viewModel").getProperty("/aPoNr"),
                PoPosNr = this.getView().getModel("viewModel").getProperty("/aPoPosNr"),
                PmOrderNr = this.getView().getModel("viewModel").getProperty("/aPmOrderNr"),
                Operation = this.getView().getModel("viewModel").getProperty("/aOperation");
            var devices = [];
            var dev = [];
            var paths = sap.ui.getCore().byId('DList').getSelectedContextPaths();
            this.getView().getModel("viewModel").setProperty("/selectedpaths", paths);
            for (var i = 0; i < paths.length; i++) {
                devices = this.getView().getModel('viewModel').getProperty(paths[i]);
                dev.push({ DeviceId: devices.DeviceId })
                var DeviceId = dev;
            }

            var Assigned = "X";

            $.when(this._getService().postDeassign(PoNr, PoPosNr, PmOrderNr, Operation, DeviceId, Assigned))
                .done(jQuery.proxy(function (oData) {
                    // sap.m.MessageBox.show("PO item " + PoNr + " " + PoPosNr + " deassigned from selected device(s) successfully");
                    sap.m.MessageBox.success(this.getText('DeassignSuccess', [PoNr, PoPosNr]));
                    that.getView().byId("deassign").setEnabled(false);
                    that.getView().byId("assign").setEnabled(false);
                    sap.ui.getCore().byId('DList').removeSelections();
                    that.getView().byId("ContractSmartTable").rebindTable(true);
                    that._oDeassignDialog.close();
                    that.getView().getModel("viewModel").refresh(true);
                }, that))

                .fail(jQuery.proxy(function (oError) {
                    var rText = oError.responseText
                    var parser = new DOMParser();

                    var xmlDoc = parser.parseFromString(rText, "text/xml");
                    var messageElement = xmlDoc.getElementsByTagName("message")[0];
                    var message = messageElement.textContent;
                    MessageBox.error(message)
                    that.getView().byId("ContractSmartTable").rebindTable(true);
                    that.getView().byId("deassign").setEnabled(false);
                    that._oDeassignDialog.close();
                    that.getView().getModel("viewModel").refresh(true);
                    //   return;
                }, that));

        },

        onCancelDeassignButtonPress: function (oEvent) {
            if (this._oDeassignDialog) {
                this._oDeassignDialog.close();

            }
        },

        onValueHelpRequestAssign: function (oEvent) {
            var itemsArray = [];
            this._getService().fetchDevIdData()
                .then(jQuery.proxy(function (oData) {
                    itemsArray = oData.results;
                    this.getView().getModel("viewModel").setProperty("/Device", itemsArray);
                    this.getView().getModel("viewModel").setProperty("/selectedValue", "");
                    this.getView().getModel("viewModel").refresh(true);

                    if (!this._oValueHelpDialog) {

                        this._oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
                            title: "Value Help",
                            supportRanges: false,
                            supportRangesOnly: false,
                            key: "DeviceId",
                            descriptionKey: "DeviceId",
                            supportMultiselect: false
                        });

                        var oColDeviceId = new sap.ui.table.Column({
                            label: "Device ID",
                            template: new sap.m.Text({ text: "{DeviceId}" }),
                        });
                        this._oValueHelpDialog.getTable().addColumn(oColDeviceId);
                        this._oValueHelpDialog.getTable().setModel(this.getView().getModel("viewModel"));

                        this._oValueHelpDialog.getTable().bindRows("/Device");
                        var oSearchField = new sap.m.SearchField({
                            width: "100%",

                            search: function (oSearchEvent) {

                                var sValue = oSearchEvent.getParameter("query");
                                var oBinding = this._oValueHelpDialog.getTable().getBinding("rows");

                                if (sValue) {
                                    var oFilter = new sap.ui.model.Filter("DeviceId", sap.ui.model.FilterOperator.Contains, sValue);
                                    oBinding.filter([oFilter]);
                                } else {
                                    oBinding.filter([]);
                                }
                            }.bind(this)
                        });

                        var oGoButton = new sap.m.Button({
                            text: "Go",
                            press: function () {
                                var sValue = oSearchField.getValue();
                                var oBinding = this._oValueHelpDialog.getTable().getBinding("rows");
                                if (sValue) {
                                    var oFilter = new sap.ui.model.Filter("DeviceId", sap.ui.model.FilterOperator.Contains, sValue);
                                    oBinding.filter([oFilter]);
                                } else {
                                    oBinding.filter([]);
                                }
                            }.bind(this)

                        });

                        this._oValueHelpDialog.setCustomHeader(new sap.m.Toolbar({
                            content: [oSearchField, oGoButton],
                        }));

                        // 		  this._oValueHelpDialog.attachOk(function (oEvent) {

                        // 			var oSelectedItem = oEvent.getParameter("tokens")[0];

                        // 			if (oSelectedItem) {

                        // 			  var selectedValue = oSelectedItem.getText().split("(")[0];

                        // 			  this.getView().getModel("viewModel").setProperty("/selectedValue",selectedValue);

                        // 			}

                        // 			this._oValueHelpDialog.close();

                        // 		  }, this);

                        // 		  this._oValueHelpDialog.attachCancel(function (oEvent) {

                        // 			this._oValueHelpDialog.close();

                        // 		  }, this);

                        // 		}

                        // 		this._oValueHelpDialog.open();

                        // }, this))
                        this._oValueHelpDialog.attachOk(this.onValueHelpOK.bind(this));

                        this._oValueHelpDialog.attachCancel(this.onValueHelpCancel.bind(this));

                    }

                    this._oValueHelpDialog.open();

                }, this))
                .fail(jQuery.proxy(function (oError) {

                    MessageBox.error(oError.responseText);

                }, this));
        },

        onValueHelpOK: function (oEvent) {

            var oSelectedItem = oEvent.getParameter("tokens")[0];

            if (oSelectedItem) {

                var selectedValue = oSelectedItem.getText().split("(")[0];

                this.getView().getModel("viewModel").setProperty("/selectedValue", selectedValue);
                this.getView().getModel("viewModel").refresh(true);

            }

            this._oValueHelpDialog.close();

        },

        onValueHelpCancel: function () {

            this._oValueHelpDialog.close();

        },

        onselectdevice: function () {
            if (sap.ui.getCore().byId('DList').getSelectedContextPaths().length === 0) {
                this.getView().getModel("viewModel").setProperty("/dbuttonEnabled", false);
            }
            else {
                this.getView().getModel("viewModel").setProperty("/dbuttonEnabled", true);
            }

        },

        _getViewModel: function () {
            return this.getView().getModel("viewModel");
        },
    });
});

// Detail Controller:


/*global download*/
sap.ui.define([
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "com/am/armp/spListAppBase/spPoList/lib/download"
], function (MessageBox, MessageToast, JSONModel) {
    "use strict";
    return sap.ui.controller("com.am.armp.spListAppBase.spPoList.controller.DetailCustom", {
        //=======================================
        // PROPERTIES
        //=======================================
        POdetails: {
            PoNr: "",
            PoPosNr: "",
            ContractNr: "",
            ContractPosNr: ""
        },
        //=======================================
        // LIFE CYCLE
        //=======================================

        //=======================================
        // HOOKS
        //=======================================
        extHookOnInit: function () {
            this.getView().setModel(new sap.ui.model.json.JSONModel(), "viewModel");
        },

        extHookOnDetailRouteMatched: function (oEvent) {
            var oArguments = oEvent.getParameter("arguments"),
                oLocalModel = this.getLocalModel();
            this.POdetails = {
                PoNr: oArguments.id1,
                PoPosNr: oArguments.id2
            };

            $.when(this._getService().getParameters())
                .done(function (oData) {
                    oLocalModel.setProperty("/Params", oData);
                }.bind(this));

            this._getDetails(this.POdetails.PoNr, this.POdetails.PoPosNr);

            this.bATTAItemsLoaded = false;
            this.getView().byId("TabBar").setSelectedKey("services");
        },

        //=======================================
        // EVENT HANDLERS
        //=======================================

        onSelectTab: function (oEvent) {
            var oModel = this.getLocalModel(),
                oPO = this._getViewModel().getProperty("/Order"),
                sKey = oEvent.getParameter("key");

            switch (sKey) {
                case "ATTA":
                    if (!this.bATTAItemsLoaded) {
                        oModel.setProperty("/Attachments", []);
                        $.when(this._getService().getAttachments(this.POdetails.PoNr, this.POdetails.PoPosNr))
                            .done(function (oData) {
                                this.bATTAItemsLoaded = true; // only load attachments once and only after opening tab
                                oModel.setProperty("/Attachments", oData.results);
                            }.bind(this));
                    }
                    break;
                case "addService":
                    this.getView().setModel(new sap.ui.model.json.JSONModel({
                        service: "",
                        servicetxt: "",
                        quantity: "",
                        unit: "",
                        price: "",
                        longtxt: "",
                        serviceVS: "None",
                        pmOrderNr: oPO.PmOrderNr,
                        contractNr: oPO.Contract,
                        contractPosNr: oPO.ContractPosNr,
                        poNr: oPO.PoNr,
                        poPosNr: oPO.PoPosNr
                    }), "addServiceModel");
                    break;
                case "addDamage":
                    this.getView().setModel(new JSONModel({
                        notifNr: oPO.PmNotifNr,
                        parentdamage: "",
                        childdamage: "",
                        damagetext: "",
                        damageVS: "None",
                        parentcause: "",
                        childcause: "",
                        causetext: "",
                        causeVS: "None",
                        longtxt: ""
                    }), "addDamageModel");
                    break;
                case "inspeclot":
                    var sUrl = this.getLocalModel().getProperty("/Params/P_INSPECLOT_URL") || "";
                    if (sUrl && oPO.Operation && oPO.Inspectionlot) {
                        this._openInspectionWebdynpro(sUrl, oPO.Inspectionlot, oPO.Operation);
                    }
                    break;
            }
        },

        onPressSES: function (oEvent) {
            var oBindingContext = oEvent.getSource().getBindingContext("viewModel"),
                sPoNr = oBindingContext.getProperty("PoNr"),
                sPoPosNr = oBindingContext.getProperty("PoPosNr"),
                sSesNr = oBindingContext.getProperty("SesNr");

            $.when(this._getService().getNavigation(sPoNr, sPoPosNr, sSesNr))
                .done($.proxy(function (oData) {
                    if (oData.SemanticObject !== "") {
                        this._navTo(oData);
                    } else {
                        MessageBox.warning(this.getText("navUnknownTypeText", {
                            title: this.getText("navUnknownTypeTitle")
                        }));
                    }
                }, this))
                .fail(function (oError) {
                    MessageBox.warning(this.getText("navUnknownTypeText", {
                        title: this.getText("navUnknownTypeTitle")
                    }));
                }.bind(this));
        },

        onShowLongTextPress: function (oEvent) {
            var oService = oEvent.getSource().getParent().getBindingContext("viewModel").getObject();

            this._getViewModel().setProperty("/ServiceLongText", "");

            $.when(this._getService().getServiceLongText(oService.PckgNo, oService.LineNo))
                .done($.proxy(function (oData) {
                    this._getViewModel().setProperty("/ServiceLongText", oData.Text);
                    this._getDialogManager().open("ServiceLongText", this.getView());
                }, this));
        },

        onCloseServiceLongTextPress: function (oEvent) {
            this._getDialogManager().close("ServiceLongText", this.getView());
        },

        onDownloadAttachmentPress: function (oEvent) {
            var oObject = oEvent.getParameter("listItem").getBindingContext("localModel").getObject();
            if (oObject.Mimetype && oObject.Content && oObject.ObjDescr) {
                download("data:" + oObject.Mimetype + ";base64," + oObject.Content, oObject.ObjDescr, oObject.Mimetype);
            }
        },

        addService: function (oEvent) {
            var oAddServiceModel = this.getView().getModel("addServiceModel");
            var oPmData = oAddServiceModel.getData();

            if (oPmData.service === "") {
                oAddServiceModel.setProperty("/serviceVS", "Error");
                MessageToast.show(this.getText("Field_Required"));
            } else {
                $.when(this._getService().addService(oPmData.pmOrderNr, oPmData.PckgNo, oPmData.LineNo, oPmData.quantity.toString(), oPmData.longtxt))
                    .done(function (oData) {
                        var msg = this.getText("serviceSuccesfullyAdded");
                        MessageToast.show(msg);
                    }.bind(this))
                    .fail(function (oError) {
                        this._getErrorHandler().showError(oError, false);
                    }.bind(this));
            }
        },

        serviceValueHelp: function () {
            if (!this._serviceValueHelp) {
                this._serviceValueHelp = sap.ui.xmlfragment("com.am.armp.spListAppBase.spPoList.view.ServicesVH", this);
                this._serviceValueHelp.setModel(this.getView().getModel());
                this.getView().addDependent(this._serviceValueHelp);
            }

            var oPmData = this._getViewModel().getProperty("/Order");
            $.when(this._getService().getServiceValueHelp(oPmData))
                .done(function (oData) {
                    var aFilteredLeafs = oData.results.filter(function (oService) {
                        return oService.IsLeaf === "X";
                    });
                    this._serviceValueHelp.setModel(new JSONModel({
                        "services": aFilteredLeafs
                    }), "serviceModel");
                    this._serviceValueHelp.open();
                }.bind(this))
                .fail(function (oError) {
                    this._getErrorHandler().showError(oError, false);
                }.bind(this));
        },

        handleServiceSelection: function (oEvent) {
            var oTable = sap.ui.getCore().byId("ContractServicesTable"),
                iSelectedIndex = oTable.getSelectedIndex();
            if (iSelectedIndex < 0) {
                sap.m.MessageToast.show(this.getText("PleaseSelectService"));
            } else {
                var oObject = oTable.getContextByIndex(iSelectedIndex).getObject(),
                    oAddServiceModel = this.getView().getModel("addServiceModel");

                oAddServiceModel.setProperty("/service", oObject.Service);
                oAddServiceModel.setProperty("/unit", oObject.BaseUom);
                oAddServiceModel.setProperty("/price", oObject.GrPrice);
                oAddServiceModel.setProperty("/servicetxt", oObject.ShortText);
                oAddServiceModel.setProperty("/LineNo", oObject.LineNo);
                oAddServiceModel.setProperty("/PckgNo", oObject.PckgNo);

                oAddServiceModel.refresh();

                this.onDialogClose("_serviceValueHelp");
            }
        },

        addDamage: function () {
            var oDamageModel = this.getView().getModel("addDamageModel");
            oDamageModel.setProperty("/damageVS", "None");
            oDamageModel.setProperty("/causeVS", "None");
            oDamageModel.setProperty("/longtxtVS", "None");
            if (oDamageModel.getProperty("/childcause") === "" || oDamageModel.getProperty("/childdamage") === "" || oDamageModel.getProperty(
                "/causetext") === "" || oDamageModel.getProperty("/damagetext") === "") {
                if (oDamageModel.getProperty("/childcause") === "" || oDamageModel.getProperty("/causetext") === "") {
                    oDamageModel.setProperty("/causeVS", "Error");
                }
                if (oDamageModel.getProperty("/childdamage") === "" || oDamageModel.getProperty("/damagetext") === "") {
                    oDamageModel.setProperty("/damageVS", "Error");
                }
                MessageToast.show(this.getText("Fillinrequiredfields"));
            } else {
                var oDamage = {
                    NotifNo: oDamageModel.getProperty("/notifNr"),
                    LongTxt: oDamageModel.getProperty("/longtxt"),
                    Catalog: [{
                        Catalogname: "DamageCodes",
                        GroupCode: oDamageModel.getProperty("/childdamage"),
                        GroupParent: oDamageModel.getProperty("/parentdamage"),
                        GroupText: oDamageModel.getProperty("/damagetext")
                    }, {
                        Catalogname: "CauseCodes",
                        GroupCode: oDamageModel.getProperty("/childcause"),
                        GroupParent: oDamageModel.getProperty("/parentcause"),
                        GroupText: oDamageModel.getProperty("/causetext")
                    }]
                };
                $.when(this._getService().addDamage(oDamage))
                    .done(function (oData) {
                        var msg = this.getText("Damagesuccesfullyadded");
                        MessageToast.show(msg);
                        // this._AddServiceDialog.close();
                    }.bind(this))
                    .fail(function (oError) {
                        this._getErrorHandler().showError(oError, false);
                    }.bind(this));
            }
        },

        damageValueHelp: function (sNotifNr) {
            if (!this._DamageVHDialog) {
                this._DamageVHDialog = sap.ui.xmlfragment("com.am.armp.spListAppBase.spPoList.view.DamageVH", this);
                this._DamageVHDialog.setModel(this.getView().getModel());
                this.getView().addDependent(this._DamageVHDialog);
                this._DamageVHDialog.setModel(new JSONModel({
                    "root": []
                }), "addDamageModel");
            }
            $.when(this._getService().getDamageValueHelp(sNotifNr))
                .done(function (oData) {
                    this._DamageVHDialog.getModel("addDamageModel").setProperty("/root", this._getChildren(null, oData));
                }.bind(this))
                .fail(function (oError) {
                    this._getErrorHandler().showError(oError, false);
                }.bind(this));
            this._DamageVHDialog.open();
        },
        selectDamage: function (oEvent) {
            var i = oEvent.getParameter("listItem"),
                oModel = this.getView().getModel("addDamageModel");

            oModel.setProperty("/parentdamage", i.getParent().getParent().getKey());
            oModel.setProperty("/childdamage", i.getTitle());
            oModel.setProperty("/damagetext", "");

            this._DamageVHDialog.close();
        },
        causeValueHelp: function (sNotifNr) {
            if (!this._CauseVHDialog) {
                this._CauseVHDialog = sap.ui.xmlfragment("com.am.armp.spListAppBase.spPoList.view.CauseVH", this);
                this._CauseVHDialog.setModel(this.getView().getModel());
                this.getView().addDependent(this._CauseVHDialog);
                this._CauseVHDialog.setModel(new JSONModel({
                    "root": []
                }), "causeModel");
            }
            $.when(this._getService().getCauseValueHelp(sNotifNr))
                .done(function (oData) {
                    this._CauseVHDialog.getModel("causeModel").setProperty("/root", this._getChildren(null, oData));
                }.bind(this))
                .fail(function (oError) {
                    this._getErrorHandler().showError(oError, false);
                }.bind(this));
            this._CauseVHDialog.open();
        },
        selectCause: function (oEvent) {
            var i = oEvent.getParameter("listItem"),
                oModel = this.getView().getModel("addDamageModel");

            oModel.setProperty("/parentcause", i.getParent().getParent().getKey());
            oModel.setProperty("/childcause", i.getTitle());
            oModel.setProperty("/causetext", "");

            this._CauseVHDialog.close();
        },

        onDialogClose: function (sDialogId) {
            this[sDialogId].close();
        },

        //=======================================
        // PRIVATE METHODS
        //=======================================

        _getDetails: function (sPoNr, sPoPosNr) {
            $.when(this._getService().getOrder(sPoNr, sPoPosNr))
                .done($.proxy(function (oData) {
                    this._getViewModel().setProperty("/Order", oData);
                    this.POdetails.ContractNr = oData.Contract;
                    this.POdetails.ContractPosNr = oData.ContractPosNr;
                }, this));
        },

        _openInspectionWebdynpro: function (sUrl, sInspection, sOperation) {
            var _sUrl = sUrl.replace("<INSPECTIONLOT>", sInspection).replace("<OPERATION>", sOperation);
            try {
                window.open(_sUrl, "_blank");
            } catch (e) {

            }
        },

        _getChildren: function (parent, data) {
            var items = [];
            $.each(data.results, function (key, value) {
                if (!parent && value.GroupParent.length === 0) {
                    value.children = this._getChildren(value, data);
                    items.push(value);
                } else if (parent && value.GroupParent === parent.GroupCode && value.GroupText) {
                    value.children = this._getChildren(value, data);
                    items.push(value);
                }
            }.bind(this));
            return items;
        },

        _getViewModel: function () {
            return this.getView().getModel("viewModel");
        },

        _getErrorHandler: function () {
            return this.getOwnerComponent().getErrorHandler();
        },

        _navTo: function (oObject) {
            sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oService) {
                oService.toExternal({
                    target: {
                        semanticObject: oObject.SemanticObject,
                        action: oObject.Action
                    },
                    params: JSON.parse(oObject.Params)
                });
            });
        }
    });
});
