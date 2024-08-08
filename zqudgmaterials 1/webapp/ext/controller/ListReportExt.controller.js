sap.ui.controller("zqudgmaterials.zqudgmaterials.ext.controller.ListReportExt", {
    onInit: function () {
        //  
        var n = this.extensionAPI.getNavigationController();
        oButtonCustomsearch = this.getView().byId("zqudgmaterials.zqudgmaterials::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_QU_DG_MaterialsAndRequests--action::idCustomSearchButton")
       // oButtonCustomsearch.setType("Emphasized")
        oButtonCustomsearch.setIcon('sap-icon://search')
        debugger;
    },
    onBeforeRebindTableExtension: function (oEvent) {
        let sTable2 = this.getView().createId("listReport-tab0");
        let sTable1 = this.getView().createId("listReport-tab1");
        // oEvent.getSource().deactivateColumns(['mbrsh']);
        let sTableId = oEvent.getSource().getId()
        if (sTableId === sTable1) {
            debugger;
            let aColumns = oEvent.getSource()._aColumnKeys
            let fieldsToShow = ['reqid', 'reqtyp', 'req_desc', 'reqprio', 'ersda', 'laeda', 'ersda'];
            let filteredArray = aColumns.filter((field) => {
                return !fieldsToShow.includes(field)
            })
            //console.log(filteredArray)
            oEvent.getSource().deactivateColumns(filteredArray);


        }
        if (sTableId === sTable2) {
            debugger;

            let bColumns = oEvent.getSource()._aColumnKeys
            let fieldsToShowTab2 = ['matnr', 'maktx', 'mtart', 'mbrsh', 'reqid', 'reqtyp', 'req_desc', 'reqprio', 'ersda', 'laeda', 'ersda'];
            let filteredArraytab2 = bColumns.filter((field) => {
                return !fieldsToShowTab2.includes(field)
            })
            //console.log(filteredArray)
            oEvent.getSource().deactivateColumns(filteredArraytab2)
        }
        debugger;
    },
    onAfterRendering: function () {
        let i = this.getView().createId("addEntry-tab1");
        let j = this.getView().createId("addEntry-tab0");
        let UpdateButton = this.getView().createId("Update-tab1");
        let CopyButton = this.getView().createId("Copy-tab1");
        let ExtendButton = this.getView().createId("Extend-tab1");
        let DeleteButton = this.getView().createId("deleteEntry-tab0");
        let DeleteRequest = this.getView().createId("Markfordeletion-tab1");
        if (sap.ui.getCore().byId(i) !== undefined) {
            sap.ui.getCore().byId(i).setVisible(false);
        }
        if (sap.ui.getCore().byId(j) !== undefined) {
            sap.ui.getCore().byId(j).setVisible(false);
        }
        if (sap.ui.getCore().byId(UpdateButton) !== undefined) {
            sap.ui.getCore().byId(UpdateButton).setVisible(false);
        }
        if (sap.ui.getCore().byId(CopyButton) !== undefined) {
            sap.ui.getCore().byId(CopyButton).setVisible(false);
        }
        if (sap.ui.getCore().byId(ExtendButton) !== undefined) {
            sap.ui.getCore().byId(ExtendButton).setVisible(false);
        }
        if (sap.ui.getCore().byId(DeleteRequest) !== undefined) {
            sap.ui.getCore().byId(DeleteRequest).setVisible(false);
        }
        if (sap.ui.getCore().byId(DeleteButton) !== undefined) {
            sap.ui.getCore().byId(DeleteButton).setVisible(false);
        }
        if (sap.ui.getCore().byId(DeleteRequest) !== undefined) {
            sap.ui.getCore().byId(DeleteRequest).setVisible(false);
        }

    },
    readFragment: function () {
        return sap.ui.xmlfragment(this.getView().getId(), "zqudgmaterials.zqudgmaterials.ext.fragment.Content", this);
    },
    readUpdateFragment: function () {
        return sap.ui.xmlfragment(this.getView().getId(), "zqudgmaterials.zqudgmaterials.ext.fragment.Update", this);
    },
    readFragmentCopy: function () {
        return sap.ui.xmlfragment(this.getView().getId(), "zqudgmaterials.zqudgmaterials.ext.fragment.Copy", this);
    },
    readFragmentExtend: function () {
        return sap.ui.xmlfragment(this.getView().getId(), "zqudgmaterials.zqudgmaterials.ext.fragment.Extend", this);
    },

    onCreate: function () {

        var that = this;
        this.getView().setBusy(true);

        var oApi = this.extensionAPI;
        var oPromise = oApi.invokeActions("/ZC_QU_DG_MaterialsAndRequestsCreate", [], {});
        oPromise.then(function (aResponse) {
            console.log(aResponse)

            if (aResponse[0] && aResponse[0].response) {
                var oResponseContext = aResponse[0].response.context;
                if (oResponseContext) {
                    //					 
                    console.log(aResponse);
                    //that._createDialog(oResponseContext, aResponse[0].response.data.reqid);
                    that.ResponseContext = oResponseContext;
                    that.reqid = aResponse[0].response.data.reqid;
                    that.ReadData = aResponse[0].response.context.getDeepPath();
                    that._createDialog();
                }
            }
        }, function () {

            //that._olView.setBusy(false);
        });



    },

    _createDialog: function () {
        //this.cont = oResponseContext;
        this.oNavController = this.extensionAPI.getNavigationController();
        var that = this;
        var oModel = this.getView().getModel();
        this.getView().setBusy(false);
        //var oReadData = "/ZC_QU_DG_MaterialRequests('"+reqid+"')";
        if (!this.createMaterialDialog) {
            this.createMaterialDialog = new sap.m.Dialog({
                contentWidth: "auto",
                contentHeight: "auto",
                draggable: true,
                resizable: true,
                title: "Material",
                content: [this.readFragment()],
                afterClose: function () {
                },
                buttons: [{
                    text: "Ok",
                    type: "Emphasized",
                    press: function () {
                        that.getView().setBusy(true);
                        that.createMaterialDialog.close();
                        sap.m.MessageToast.show("Navigating to next screen");
                        var mtartInput = that.getView().byId("create::Mtart-input").getValue();
                        var oPayload = {
                            mtart: mtartInput
                        }
                        var oReadData = that.ReadData;

                        oModel.update(oReadData, oPayload, {
                            success: function (oData, oResponse) {

                                oModel.read(oReadData,
                                    {
                                        success: function (oData, oResponse) {
                                            var sContextPath = oReadData;
                                            var oContext = new sap.ui.model.Context(oModel, sContextPath);
                                            that.getView().setBusy(false);
                                            that.oNavController.navigateInternal(oContext);
                                            that.createMaterialDialog.close();
                                        },
                                        error: function () {
                                            debugger;
                                        }
                                    });
                            },
                            error: function () {

                            }
                        }
                        );
                    }
                }, {
                    text: "Cancel",
                    press: function () {
                        that.createMaterialDialog.close();
                        var oReadData = that.ReadData;
                        oModel.remove(oReadData, {
                            success: function () {
                                debugger;
                            },
                            error: function () {
                            }
                        }
                        );

                    }
                }]
            });
        }
        this.createMaterialDialog.setModel(this.getView().getModel());
        this.createMaterialDialog.setBindingContext(this.oResponseContext);
        this.bindData(this.ReadData);
    },

    bindData: function (sPath) {

        this.getView().byId("create::Mtart").bindElement({
            path: sPath,

        });
        this.getView().addDependent(this.createMaterialDialog);
        this.createMaterialDialog.open();
    },

    /**************************** Update code ****************************/
    onUpdate: function (oEvent) {
        debugger;
        let that = this;
        this.getView().setBusy(true);
        //let oParameter = {};

        let oApi = this.extensionAPI;
        let oPromise = oApi.invokeActions("/ZC_QU_DG_MaterialsAndRequestsCreate", [], {});
        oPromise.then(function (aResponse) {
            console.log(aResponse)

            if (aResponse[0] && aResponse[0].response) {
                let oResponseContext = aResponse[0].response.context;
                debugger;
                if (oResponseContext) {
                    console.log(aResponse);
                    //that._createDialog(oResponseContext, aResponse[0].response.data.reqid);
                    that.ResponseContext = oResponseContext;
                    that.reqid = aResponse[0].response.data.reqid;
                    that.matnrUpdate = aResponse[0].response.data.matnr;
                    that.DraftUUIDUpdate = aResponse[0].response.data.DraftUUID;
                    that.ReadData = aResponse[0].response.context.getDeepPath();
                    that._updateDialog();
                }
            }
        }, function () {
            that._olView.setBusy(false);
        });
    },

    _updateDialog: function () {
        debugger;
        //this.cont = oResponseContext;
        this.oNavController = this.extensionAPI.getNavigationController();
        let that = this;
        let oModel = this.getView().getModel();
        this.getView().setBusy(false);
        if (!this.updateDialog) {
            this.updateDialog = new sap.m.Dialog({
                contentWidth: "auto",
                contentHeight: "auto",
                draggable: true,
                resizable: true,
                title: "Material Update",
                content: [this.readUpdateFragment()],
                afterClose: function () {
                },
                buttons: [{
                    text: "Ok",
                    type: "Emphasized",
                    press: function () {
                        that.getView().setBusy(true);
                        //that.updateDialog.close();
                        let oApi = that.extensionAPI;
                        sap.m.MessageToast.show("Navigating to next screen");
                        that.updateDialog.close();
                        // let requidInput = that.getView().byId("header::Reqid-input").getValue();
                        let matnrInput = that.matnrBinding;
                        let werksInput = that.getView().byId("update::Werks-input").getValue();
                        let lgortInput = that.getView().byId("update::Lgort-input").getValue();
                        let vkorgInput = that.getView().byId("update::Vkorg-input").getValue();
                        let vtwegInput = that.getView().byId("update::Vtweg-input").getValue();
                        let oPayload = {
                            "reqid": that.reqid,
                            "matnr": matnrInput,
                            "werks": werksInput,
                            "lgort": lgortInput,
                            "vkorg": vkorgInput,
                            "vtweg": vtwegInput,
                            "draftuuid": that.DraftUUIDUpdate,
                            "DraftUUID": that.DraftUUIDUpdate,
                            "isactiveentity": "false",
                            "IsActiveEntity": "false"
                        }
                        debugger;
                        let sContextPath = that.pathToNavigate;
                        let oContext = new sap.ui.model.Context(oModel, sContextPath);
                        let oPromise = oApi.invokeActions("/ZC_QU_DG_MaterialsAndRequestsUpdate", [], oPayload);
                        debugger;
                        oPromise.then((res) => {
                            debugger;
                            // console.log(res)
                            let aContext = "/ZC_QU_DG_MaterialsAndRequests(reqid='" + that.reqid + "',matnr='" + matnrInput + "',DraftUUID=guid'" + that.DraftUUIDUpdate + "',IsActiveEntity=false)"
                            let aContextPath = new sap.ui.model.Context(oModel, aContext);
                            that.getView().setBusy(false);
                            that.oNavController.navigateInternal(aContextPath);
                        }).catch((err) => {
                            debugger;
                        });

                        // that.oNavController.navigateInternal();
                    }
                }, {
                    text: "Cancel",
                    press: function () {
                        that.updateDialog.close();
                        let oReadData = that.ReadData;
                        oModel.remove(oReadData, {
                            success: function () {
                                debugger;
                            },
                            error: function () {
                            }
                        }
                        );

                    }
                }]
            });
        }
        this.updateDialog.setModel(this.getView().getModel());
        this.updateDialog.setBindingContext(this.oResponseContext);
        this.bindUpdateData(this.ReadData);
    },

    bindUpdateData: function (sPathUpdate) {

        let oContext = this.extensionAPI.getSelectedContexts();
        oPath = oContext[0].sPath;
        this.pathToNavigate = oContext[0].sPath;
        this.matnrBinding = oContext[0].getObject().matnr;
        this.getView().byId("update::Matnr").bindElement({
            path: oPath,

        });
        this.getView().byId("update::Werks").bindElement({
            path: sPathUpdate,

        });
        this.getView().byId("update::Lgort").bindElement({
            path: sPathUpdate,

        });
        this.getView().byId("update::Vkorg").bindElement({
            path: sPathUpdate,

        });
        this.getView().byId("update::Vtweg").bindElement({
            path: sPathUpdate,

        });
        this.getView().addDependent(this.updateDialog);
        this.updateDialog.open();
    },

    /*...............Copy Code....................*/

    _copyDialog: function () {
        //this.cont = oResponseContext;
        this.oNavController = this.extensionAPI.getNavigationController();
        var that = this;
        debugger;
        var oModel = this.getView().getModel();
        this.getView().setBusy(false);
        if (!this.CopyDialog) {
            this.CopyDialog = new sap.m.Dialog({
                contentWidth: "auto",
                contentHeight: "auto",
                draggable: true,
                resizable: true,
                title: "Copy Material",
                content: [this.readFragmentCopy()],
                afterClose: function () {
                },
                buttons:
                    [{
                        text: "Ok",
                        type: "Emphasized",
                        press: function () {
                            debugger;
                            that.getView().setBusy(true);
                            var oApi = that.extensionAPI;
                            that.CopyDialog.close();
                            var reqidInput = that.reqid;
                            var matnrInput = that.matnrBindingCopy;
                            debugger;
                            var werksInput = that.getView().byId("copy::Werks-input").getValue();
                            var lgortInput = that.getView().byId("copy::Lgort-input").getValue();
                            var vkorgInput = that.getView().byId("copy::Vkorg-input").getValue();
                            var vtwegInput = that.getView().byId("copy::Vtweg-input").getValue();
                            var oPayload = {
                                "reqid": reqidInput,
                                "matnr": matnrInput,
                                "werks": werksInput,
                                "lgort": lgortInput,
                                "vkorg": vkorgInput,
                                "vtweg": vtwegInput,
                                "draftuuid": that.DraftUUIDCopy,
                                "DraftUUID": that.DraftUUIDCopy,
                                "isactiveentity": "false",
                                "IsActiveEntity": "false"
                            }
                            debugger;
                            let sContextPath = that.pathToNavigate;
                            let oContext = new sap.ui.model.Context(oModel, sContextPath);
                            let oPromise = oApi.invokeActions("/ZC_QU_DG_MaterialsAndRequestsCopy", [], oPayload);
                            debugger;
                            oPromise.then((res) => {
                                debugger;
                                // console.log(res)
                                let aContext = "/ZC_QU_DG_MaterialsAndRequests(reqid='" + that.reqid + "',matnr='',DraftUUID=guid'" + that.DraftUUIDCopy + "',IsActiveEntity=false)"
                                let aContextPath = new sap.ui.model.Context(oModel, aContext);
                                that.getView().setBusy(false);
                                that.oNavController.navigateInternal(aContextPath);
                            }).catch((err) => {
                                debugger;
                                that.getView().setBusy(false);
                            });
                            // that.oNavController.navigateInternal();
                        }
                    },
                    {
                        text: "Cancel",
                        press: function () {
                            that.CopyDialog.close();
                            var oReadData = that.ReadData;
                            oModel.remove(oReadData, {
                                success: function () {
                                    debugger;
                                },
                                error: function () {
                                }
                            }
                            );

                        }
                    }]
            });
        }
        this.CopyDialog.setModel(this.getView().getModel());
        this.CopyDialog.setBindingContext(this.oResponseContext);
        this.bindDataCopy(this.ReadData);
    },
    onCopy: function () {
        debugger;
        var that = this;
        debugger;
        this.getView().setBusy(true);
        var oApi = this.extensionAPI;
        var oPromise = oApi.invokeActions("/ZC_QU_DG_MaterialsAndRequestsCreate", [], {});
        oPromise.then(function (aResponse) {
            console.log(aResponse)
            if (aResponse[0] && aResponse[0].response) {
                var oResponseContext = aResponse[0].response.context;
                if (oResponseContext) {
                    console.log(aResponse);
                    that.ResponseContext = oResponseContext;
                    that.reqid = aResponse[0].response.data.reqid;
                    that.matnrBindingCopy = aResponse[0].response.data.matnr;
                    that.DraftUUIDCopy = aResponse[0].response.data.DraftUUID;
                    that.ReadData = aResponse[0].response.context.getDeepPath();
                    that._copyDialog();
                    //this.getView().setBusy(false);
                }
            }
        },
            function () {

                that._olView.setBusy(false);
            });
    },


    bindDataCopy: function (sPathCopy) {
        let oContext = this.extensionAPI.getSelectedContexts();
        oPath = oContext[0].sPath;
        this.matnrBindingCopy = oPath.split("'")[3];
        this.getView().byId("copy::Matnr").bindElement({
            path: oPath,

        });
        this.getView().byId("copy::Werks").bindElement({
            path: sPathCopy,

        });
        this.getView().byId("copy::Lgort").bindElement({
            path: sPathCopy,

        });
        this.getView().byId("copy::Vkorg").bindElement({
            path: sPathCopy,

        });
        this.getView().byId("copy::Vtweg").bindElement({
            path: sPathCopy,

        });
        this.getView().addDependent(this.CopyDialog);
        this.CopyDialog.open();
    },

    /*.........................Extend Code........................*/

    _extendDialog: function () {
        debugger;
        //this.cont = oResponseContext;
        this.oNavController = this.extensionAPI.getNavigationController();
        var that = this;
        var oModel = this.getView().getModel();
        this.getView().setBusy(false);
        if (!this.EDialog) {
            this.EDialog = new sap.m.Dialog({
                contentWidth: "auto",
                contentHeight: "auto",
                draggable: true,
                resizable: true,
                title: "Material Extend",
                content: [this.readFragmentExtend()],
                afterClose: function () {
                },
                buttons:
                    [{
                        text: "Ok",
                        type: "Emphasized",
                        press: function () {
                            debugger;
                            var oApi = that.extensionAPI;
                            that.EDialog.close();
                            sap.m.MessageToast.show("Navigating to next screen");
                            that.getView().setBusy(false);
                            reqidInput = that.reqid;
                            var matnrInput = that.matnrBindingExtend
                            var werksInput = that.getView().byId("header::Werks-input").getValue();
                            var lgortInput = that.getView().byId("header::Lgort-input").getValue();
                            var vkorgInput = that.getView().byId("header::vkorg-input").getValue();
                            var vtwegInput = that.getView().byId("header::Vtweg-input").getValue();
                            let werksObjPage = that.getView().byId("header::werks-input").getValue();
                            let lgortObjPage = that.getView().byId("header::lgort-input").getValue();
                            let vkorgObjPage = that.getView().byId("header::vkorg-input").getValue();
                            let vtwegObjPage = that.getView().byId("header::vtweg-input").getValue();
                            debugger;
                            var oPayload = {
                                "reqid": reqidInput,
                                "matnr": matnrInput,
                                "werks": werksInput,
                                "lgort": lgortInput,
                                "vkorg": vkorgInput,
                                "vtweg": vtwegInput,
                                "draftuuid": that.DraftUUIDExtend,
                                "DraftUUID": that.DraftUUIDExtend,
                                "isactiveentity": "false",
                                "IsActiveEntity": "false"
                            }
                            let sContextPath = that.pathToNavigate;
                            let oContext = new sap.ui.model.Context(oModel, sContextPath);
                            debugger;
                            var oPromise = oApi.invokeActions("/ZC_QU_DG_MaterialsAndRequestsExtend", [], oPayload);
                            debugger;
                            oPromise.then((res) => {
                                that.getView().setBusy(false);
                                oModel.setProperty(sContextPath + "/werks", werksObjPage);
                                oModel.setProperty(sContextPath + "/lgort", lgortObjPage);
                                oModel.setProperty(sContextPath + "/vkorg", vkorgObjPage);
                                oModel.setProperty(sContextPath + "/vtweg", vtwegObjPage);
                                let aContext = "/ZC_QU_DG_MaterialsAndRequests(reqid='" + that.reqid + "',matnr='" + matnrInput + "',DraftUUID=guid'" + that.DraftUUIDExtend + "',IsActiveEntity=false)"
                                let aContextPath = new sap.ui.model.Context(oModel, aContext);
                                that.getView().setBusy(false);
                                that.EDialog.close();
                                that.oNavController.navigateInternal(aContextPath);
                            }).catch((err) => {
                                debugger;
                            });
                            that.oNavController.navigateInternal();
                        }
                    },
                    {
                        text: "Cancel",
                        press: function () {
                            that.EDialog.destroy();
                            var oReadData = that.ReadData;
                            oModel.remove(oReadData, {
                                success: function () {
                                    debugger;
                                },
                                error: function () {
                                }
                            }
                            );

                        }
                    }]
            });
        }
        debugger;
        let aContexts = this.extensionAPI.getSelectedContexts();
        this.EDialog.setModel(this.getView().getModel());
        this.EDialog.setBindingContext(this.oResponseContext);
        this.bindDataExtend();
        this.bindDataExtend2(this.ReadData);
    },

    onExtend: function () {
        debugger;
        var that = this;
        this.getView().setBusy(true);
        var oApi = this.extensionAPI;
        var oPromise = oApi.invokeActions("/ZC_QU_DG_MaterialsAndRequestsCreate", [], {});
        oPromise.then(function (aResponse) {
            console.log(aResponse)

            if (aResponse[0] && aResponse[0].response) {
                var oResponseContext = aResponse[0].response.context;
                if (oResponseContext) {
                    console.log(aResponse);
                    that.ResponseContext = oResponseContext;
                    that.reqid = aResponse[0].response.data.reqid;
                    that.matnrBindingExtend = aResponse[0].response.data.matnr;
                    that.DraftUUIDExtend = aResponse[0].response.data.DraftUUID;
                    that.ReadData = aResponse[0].response.context.getDeepPath();
                    that._extendDialog();
                }
            }
        },
            function () {

                that._olView.setBusy(false);
            });
    },

    bindDataExtend: function () {

        let aContexts = this.extensionAPI.getSelectedContexts();
        debugger;
        let apath = aContexts[0].sPath;
        this.matnrBindingExtend = apath.split("'")[3];
        this.getView().byId("header::Matnr").bindElement({
            path: apath,
        });
        this.getView().byId("header::Werks").bindElement({
            path: apath,
        });
        this.getView().byId("header::Lgort").bindElement({
            path: apath,
        });
        this.getView().byId("header::Vkorg").bindElement({
            path: apath,
        });
        this.getView().byId("header::Vtweg").bindElement({
            path: apath,
        });

    },

    bindDataExtend2: function (sPathExtend) {
        let oContext = this.extensionAPI.getSelectedContexts();
        oPath = oContext[0].sPath;
        this.getView().byId("header::matnr").bindElement({
            path: oPath,
        });

        this.getView().byId("header::werks").bindElement({
            path: sPathExtend,

        });
        this.getView().byId("header::lgort").bindElement({
            path: sPathExtend,

        });
        this.getView().byId("header::vkorg").bindElement({
            path: sPathExtend,

        });
        this.getView().byId("header::vtweg").bindElement({
            path: sPathExtend,
        });
        this.getView().addDependent(this.EDialog);
        this.EDialog.open();
    },

    //_______________________CUSTOM SEARCH BUTTON________________________
    handleCustomSearch: function (oEvent) {
        let oModel = this.getOwnerComponent().getModel('SearchMaterialByChar')
        let oCustomSearchDialog = this.getView().byId("idCustomSearch");
        if (!oCustomSearchDialog) {
            oCustomSearchDialog = sap.ui.xmlfragment(this.getView().getId(), "zqudgmaterials.zqudgmaterials.ext.fragment.CustomSearchByCharClass", this);
            this.getView().addDependent(oCustomSearchDialog);
        }
        oCustomSearchDialog.setModel(oModel)
        oCustomSearchDialog.setEscapeHandler(this.onPressEscapeButton.bind(this));
        oCustomSearchDialog.open();
    },
    onCloseDialog: function (oEvent) {
        let oCustomSearchDialog = this.getView().byId("idCustomSearch")
        oCustomSearchDialog.close();
        //oCustomSearchDialog.destroy()
    },
    onPressEscapeButton: function (oEvent) {
        let oCustomSearchDialog = this.getView().byId("idCustomSearch")
        oCustomSearchDialog.close();
        //oCustomSearchDialog.destroy()
        oEvent.resolve();
    },
    onAddTableRow: function () {
        var oTable = this.getView().byId("idTable");
        var oNewItem = new sap.m.ColumnListItem({
            cells: [
                new sap.ui.comp.smartfield.SmartField({
                    entitySet: "ZC_QU_DG_MatClassUnion",
                    value: "{atnam}"
                }),
                new sap.ui.comp.smartfield.SmartField({
                    entitySet: "ZC_QU_DG_MatClassUnion",
                    value: "{atwrtValue}"
                }),
                new sap.m.Button({
                    type: "Transparent",
                    icon: "sap-icon://decline",
                    press: this.onRemoveTableRow.bind(this)
                })
            ]
        });
        oTable.addItem(oNewItem);
    },
    onDialogSearch: function (oEvent) {
        let oCustomSearchDialog = this.getView().byId("idCustomSearch")
        let oModel = this.getOwnerComponent().getModel('SearchMaterialByChar')
        let aCharacteristics = this._GetCharTableData()
        let sCharClassName = this.getView().byId("idSearchField").getValue()


        //PREPARING ODATA Read Parameters//
        let oReadParameters = {
            success: function (oData, oRes) {
                debugger
                oCustomSearchDialog.setBusy(false)
                oCustomSearchDialog.close()
                let aMaterials = []
                let aRequests = []
                oData.results.forEach((item) => {
                    if (item.matnr.length > 0) {
                        aMaterials.push(item.matnr);
                    }
                    if (item.reqid.length > 0) {
                        aRequests.push(item.reqid);
                    }
                })
                let oCustomSearchResults = {
                    Materials: [...new Set(aMaterials)],
                    Requests: [...new Set(aRequests)]
                }
                debugger;
                this._PassCustomFilters(oCustomSearchResults)

            }.bind(this),
            error: function (oErr) { debugger },
        }

        //ADDING FILTER PARAMETER IF FILTERS AREPRESENT
        if (aCharacteristics.length > 0) {
            let aFilters = []
            aCharacteristics.forEach((item) => {
                let oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("atnam", "EQ", item.CharacteristicsName),
                        new sap.ui.model.Filter("atwrtValue", "EQ", item.CharacteristicsValue)
                    ],
                    and: true
                })
                aFilters.push(oFilter)
            })
            let oCombinedFilter = new sap.ui.model.Filter({
                filters: aFilters,
                and: false
            });
            oReadParameters.filters = [oCombinedFilter]
        }

        //ADDING URL PARAMETERS IF SEARCH PARAMETER IS PRESENT
        if (sCharClassName && sCharClassName.length > 0) {
            oReadParameters.urlParameters = {
                search: sCharClassName
            }
        }

        //MAKING GET CALL
        if (aCharacteristics.length > 0 || sCharClassName.length > 0) {
            oCustomSearchDialog.setBusy(true)
            oModel.read('/ZC_QU_DG_MatClassUnion', oReadParameters)
        } else {
            debugger;
            let oSmartFilterBar = this.getView().byId('listReportFilter')
            oCustomSearchDialog.close()
            oSmartFilterBar.removeAllFilters()
            oSmartFilterBar.search()
        }
    },
    _GetCharTableData: function (oEvent) {
        let oTable = this.getView().byId("idTable");
        let aItems = oTable.getItems();
        let aResults = [];
        aItems.forEach(function (oItem) {
            // Get the cells in the current row
            let aCells = oItem.getCells();
            let oRowData = {}
            // Loop through each cell and get the value from SmartField
            debugger;
            aCells.forEach(function (oCell, index) {
                if (oCell instanceof sap.ui.comp.smartfield.SmartField) {
                    let sValue = oCell.getValue();
                    if (sValue && sValue.length > 0) {
                        if (index === 0) {
                            oRowData.CharacteristicsName = sValue;
                        } else if (index === 1) {
                            oRowData.CharacteristicsValue = sValue;
                        }
                    }
                }
            });
            // Add the row data to the results array
            if (Object.keys(oRowData).length > 0) {
                aResults.push(oRowData)
            }
        });
        return aResults
    },
    onRemoveTableRow: function (oEvent) {
        let oButton = oEvent.getSource();
        let oItem = oButton.getParent();
        let oTable = this.getView().byId("idTable");
        oTable.removeItem(oItem);
    },
    _PassCustomFilters: function (data) {
        let oSmartFilterBar = this.getView().byId('listReportFilter')
        let aMaterials = data.Materials
        let aRequests = data.Requests
        let aMaterialsFilter = aMaterials.map(function (mat) {
            return { key: mat };
        });
        let aRequestsFilter = aRequests.map(function (req) {
            return { key: req };
        });

        let oSearchData = {
            matnr: {
                items: aMaterialsFilter,
            },
            reqid: {
                items: aRequestsFilter,
            },
        }

        oSmartFilterBar.setFilterData(oSearchData)
        oSmartFilterBar.search()
    }
});