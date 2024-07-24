/*global download*/
sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/IconPool",
    "com/am/armp/spListAppBase/spSes/lib/download"
], function (MessageToast, MessageBox, IconPool) {
    "use strict";
    return sap.ui.controller("com.am.armp.spListAppBase.spSes.controller.MainCustom", {
        //=======================================
        // PROPERTIES
        //=======================================
        iconPool: IconPool,

        //=======================================
        // LIFE CYCLE
        //=======================================

        //=======================================
        // HOOKS
        //=======================================

        extHookOnInit: function () {

        },

        extHookFillList: function (oFromDate, oToDate) {
            this._checkHasNoStartUpParams();
        },

        //=======================================
        // EVENT HANDLERS
        //=======================================

        onSesNrPress: function (oEvent) {
            var oBindingContext = oEvent.getSource().getBindingContext(),
                sPoNr = oBindingContext.getProperty("PoNr"),
                sPoPrPosNr = oBindingContext.getProperty("PoPrPosNr"),
                sSesNr = oBindingContext.getProperty("SesNr");

            $.when(this._getService().getNavigation(sPoNr, sPoPrPosNr, sSesNr))
                .done(function (oData) {
                    if (oData.SemanticObject !== "") {
                        this._navTo(oData);
                    } else {
                        MessageBox.warning(this.getText("navUnknownTypeText", {
                            title: this.getText("navUnknownTypeTitle")
                        }));
                    }
                }.bind(this))
                .fail(function (oError) {
                    MessageBox.warning(this.getText("navUnknownTypeText", {
                        title: this.getText("navUnknownTypeTitle")
                    }));
                }.bind(this));
        },

        onDeleteEntryPress: function (oEvent) {
            var that = this;
            var oBindingContext = oEvent.getParameter("listItem").getBindingContext(),
                sPoNr = oBindingContext.getProperty("PoNr"),
                sPoPrPosNr = oBindingContext.getProperty("PoPrPosNr"),
                sSesNr = oBindingContext.getProperty("SesNr");
            MessageBox.confirm(this.getText("deleteConfirmation") + " " + sSesNr + "?", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (sAction) {
                    if (sAction === "YES") {
                        $.when(that._getService().deleteSheet(sPoNr, sPoPrPosNr, sSesNr))
                            .done($.proxy(function (oData) {
                                MessageToast.show(that.getText("deleted"));
                                that.onRefreshPress();
                            }, that))
                            .fail($.proxy(function (oError) {
                                that._getErrorHandler().showError(oError, false);
                            }, that));
                    }
                }
            });
        },

        //=======================================
        // PRIVATE METHODS
        //=======================================

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
        },

        _getErrorHandler: function () {
            return this.getOwnerComponent().getErrorHandler();
        },

        _checkHasNoStartUpParams: function () {
            var oStartUpParams = this.getOwnerComponent().getComponentData().startupParameters;

            if (oStartUpParams.constructor === Object && Object.keys(oStartUpParams).length > 0) {
                if (oStartUpParams.PoNr && oStartUpParams.PoNr[0] && oStartUpParams.PoPosNr && oStartUpParams.PoPosNr[0] && oStartUpParams.SesNr &&
                    oStartUpParams.SesNr[0]) {
                    this.getRouter().navTo("detail", {
                        id1: oStartUpParams.PoNr[0],
                        id2: oStartUpParams.PoPosNr[0],
                        id3: oStartUpParams.SesNr[0]
                    }, true);
                } else {
                    MessageBox.warning(this.getText("issuesWithParams"));
                }
            }
        }
    });
});


// Detail Controller:


/*global _*/
/*global download*/
sap.ui.define([
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/am/armp/spListAppBase/spSes/lib/download"
], function (MBox, MToast) {
    "use strict";
    return sap.ui.controller("com.am.armp.spListAppBase.spSes.controller.DetailCustom", {
        //=======================================
        // PROPERTIES
        //=======================================
        sPoNr: "",
        sPoPrPosNr: "",
        sSesNr: "",
        //=======================================
        // LIFE CYCLE 
        //=======================================
        //=======================================
        // HOOKS
        //=======================================
        extHookOnInit: function () {
            this._oBusy = new sap.m.BusyDialog();
        },
        extHookOnDetailRouteMatched: function (oEvent) {
            this._setViewModel();
            var title = this.getView().getModel("i18n").getResourceBundle().getText("appTitleDisplay");
            sap.ui.getCore().byId("shellAppTitle").setText(title);
            var oArguments = oEvent.getParameter("arguments");
            this.sPoNr = oArguments.id1,
                this.sPoPrPosNr = oArguments.id2,
                this.sSesNr = oArguments.id3;
            this.getLocalModel().setProperty("/SesNr", this.sSesNr);
            this._getSurchargeItems();
            this._getDetails(this.sPoNr, this.sPoPrPosNr, this.sSesNr);
        },
        //=======================================
        // EVENT HANDLERS
        //=======================================
        onPrintPreviewPress: function () {
            $.when(this._getService().getPrintPreview(this.sPoNr, this.sPoPrPosNr, this.sSesNr))
                .done($.proxy(function (oData) {
                    download("data:" + oData.Mimetype + ";base64," + oData.Content, oData.ObjDescr, oData.Mimetype);
                }, this))
                .fail(function (oError) {
                    MToast.show(this.getText("couldNotDownloadFile"));
                }.bind(this));
        },

        onFinalEntryPress: function () {
            var oDetails = this._getViewModel().getProperty("/SES"),
                oSheet = {
                    PoNr: oDetails.PoNr,
                    PoPrPosNr: oDetails.PoPrPosNr,
                    SesNr: oDetails.SesNr
                };
            $.when(this._getService().setFinal(oSheet))
                .done($.proxy(function (oData) {
                    MToast.show(this.getText("finalSet"));
                    this._getDetails(this.sPoNr, this.sPoPrPosNr, this.sSesNr);
                }, this))
                .fail($.proxy(function (oError) {
                    try {
                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                        MToast.show(this.getText("couldNotSetFinal", [sMessage]));
                    } catch (err) {
                        MToast.show(this.getText("couldNotSetFinal"));
                    }
                }, this));
        },

        onAttachmentsPress: function () {
            this._getAttachments();
            this._getDialogManager().open("Attachments", this.getView());
        },

        onDeleteAttaItem: function (oEvent) {
            var oObject = oEvent.getParameter("listItem").getBindingContext("localModel").getObject();
            $.when(this._getService().deleteAttachment(oObject.DocId, oObject.Token))
                .done(function (oData) {
                    MToast.show(this.getText("attachmentSuccessfullyDeleted"));
                    this._getAttachments();
                }.bind(this))
                .fail(function (oError) {
                    this._getErrorHandler().showError(oError, false);
                }.bind(this));
        },

        onCloseAttachmentsPress: function () {
            this._getDialogManager().close("Attachments", this.getView());
        },

        onUploadAttachment: function (oEvent) {
            var oFileUploader = oEvent.getSource(),
                oModel = this.getView().getModel();

            oModel.refreshSecurityToken();

            oFileUploader.removeAllHeaderParameters();
            oFileUploader.setSendXHR(true);
            oFileUploader.setUseMultipart(false);

            oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
                name: "x-csrf-token",
                value: oModel.getSecurityToken()
            }));
            oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
                name: "slug",
                value: oFileUploader.getValue()
            }));

            var sPath = oModel.createKey("SESSet", {
                PoNr: this.sPoNr,
                PoPrPosNr: this.sPoPrPosNr,
                SesNr: this.sSesNr
            });

            oFileUploader.setUploadUrl("/sap/opu/odata/armp/GW_PM_SES_SRV/" + sPath + "/ATTAItem");
            this._oBusy.open();
            oFileUploader.upload();
            oFileUploader.clear();
        },

        onUploadAttachmentComplete: function (oEvent) {
            const EntityRegex = new RegExp("ATTAItemSet[(]DocId='[0-9]*'"),
                NrRegex = new RegExp("[0-9]+");
            var sResponse = oEvent.getParameter("response");
            if (sResponse) {
                var sEntity = sResponse.match(EntityRegex);
                if (sEntity && sEntity[0]) {
                    var sNr = sEntity[0].match(NrRegex);
                    if (sNr && sNr[0]) {
                        if (parseInt(sNr[0], 10) > 0) {
                            MToast.show(this.getText("uploadFailed"));
                        } else {
                            this._getAttachments();
                        }
                    }
                }
            }
            this._oBusy.close();
        },

        onDownloadAttachmentPress: function (oEvent) {
            var oObject = oEvent.getParameter("listItem").getBindingContext("localModel").getObject();
            if (oObject.Mimetype && oObject.Content && oObject.ObjDescr) {
                download("data:" + oObject.Mimetype + ";base64," + oObject.Content, oObject.ObjDescr, oObject.Mimetype);
            }
        },
        //=======================================
        // PRIVATE METHODS
        //=======================================
        _setViewModel: function () {
            this.getView().setModel(new sap.ui.model.json.JSONModel({
                ATTAitems: [],
                servicesCount: 5,
                SES: {},
                ServiceLongText: "",
                serviceTable: {
                    visibleRowCount: 1,
                    data: []
                },
                Requisitioner: {}
            }), "viewModel");
        },
        _getSurchargeItems: function () {
            $.when(this._getService().getSurchargeItems())
                .done(function (oData) {
                    var convertedScItems = this._convertScItems(oData.results);
                    this.getLocalModel().setProperty("/SurchargeItems", convertedScItems);
                }.bind(this))
                .fail(function (oError) {
                    this._getErrorHandler().showError(oError, false);
                }.bind(this));
        },
        _convertScItems: function (aScItems) {
            var aItems = [];
            _.each(aScItems, function (item) {
                aItems[item.ColName] = {
                    Header: item.Header,
                    Visible: item.Visible,
                    SurchValueItems: item.SurChValueItems.results,
                    ContainsItems: ((item.SurChValueItems.results.length > 1) ? "X" : "")
                };
            });
            return aItems;
        },
        _getDetails: function (sPoNr, sPoPrPosNr, sSesNr) {
            $.when(this._getService().getDetails(sPoNr, sPoPrPosNr, sSesNr))
                .done(function (oData) {
                    this._getViewModel().setProperty("/SES", oData);
                    this._setServicesDetails(oData.SESServices.results);
                }.bind(this))
                .fail(function (oError) {
                    this._getErrorHandler().showError(oError, false);
                }.bind(this));
        },
        _setServicesDetails: function (oServices) {
            _.each(oServices, function (service) {
                service = this._cleanService(service);
            }.bind(this));
            _.each(oServices, function (service) {
                if (service.ExtraHours === "")
                    service.ExtraHours = false;
                else if (service.ExtraHours === "x" || service.ExtraHours === "X")
                    service.ExtraHours = true;
            }.bind(this));
            this._getViewModel().setProperty("/serviceTable/data", oServices);
            this._getViewModel().setProperty("/serviceTable/visibleRowCount", oServices.length + 1);
        },
        _cleanService: function (oService) {
            var _oService = oService;
            if (_oService.PersNo === "00000000") {
                _oService.PersNo = "";
            }
            return _oService;
        },
        _getAttachments: function () {
            $.when(this._getService().getAttachments(this.sPoNr, this.sPoPrPosNr, this.sType, this.sSesNr))
                .done($.proxy(function (oData) {
                    this.getLocalModel().setProperty("/Attachments", oData);
                }, this))
                .fail(function (oError) {
                    MToast.show(this.getText("couldNotGetFiles"));
                }.bind(this));
        },
        //--------------------------------------------------------------------------
        _getService: function () {
            return this.getOwnerComponent().getService();
        },
        _getTableExporter: function () {
            return this.getOwnerComponent().getTableExporter();
        },
        _getErrorHandler: function () {
            return this.getOwnerComponent().getErrorHandler();
        },
        _getViewModel: function () {
            return this.getView().getModel("viewModel");
        }

    });
});