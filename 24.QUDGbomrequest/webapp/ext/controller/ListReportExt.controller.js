sap.ui.controller("bomrequest01.ext.controller.ListReportExt", {
    onInit: function () {
        //  
        var n = this.extensionAPI.getNavigationController();
        debugger;
        this._SmartTable1 = this.getView().byId('listReport-tab0')
        this._InnerTable1 = this._SmartTable1.getTable()
    },
    onAfterRendering: function () {
        let i = this.getView().createId("bomrequest01::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_QUDG_BOMHEADERREQUESTTP--addEntry-tab0");
        let j = this.getView().createId("__button0");
        if (sap.ui.getCore().byId(i) !== undefined) {
            sap.ui.getCore().byId(i).setVisible(false);
        }
        if (sap.ui.getCore().byId("__button0") !== undefined) {
            sap.ui.getCore().byId("__button0").setVisible(false);
        }
    },
    readFragment: function () {
        return sap.ui.xmlfragment(this.getView().getId(), "bomrequest01.ext.fragment.Create", this);
    },

    _createDialog: function (oResponse) {
        this.oNavController = this.extensionAPI.getNavigationController();
        var that = this;
        var oModel = this.getView().getModel();
        this.getView().setBusy(false);
        var oReadData = oResponse.context.sPath;
        if (!this.createPersonDialog) {
            this.createPersonDialog = new sap.m.Dialog({
                contentWidth: "auto",
                contentHeight: "auto",
                draggable: true,
                resizable: true,
                title: "BOM details",
                content: [this.readFragment()],
                afterClose: function () {
                },
                buttons: [{
                    text: "Ok",
                    type: "Emphasized",
                    press: function () {
                        that.getView().setBusy(true);
                        var matnrinput = that.getView().byId("create::Matnr-input").getValue();
                        var werksinput = that.getView().byId("create::Werks-input").getValue();
                        var stlaninput = that.getView().byId("create::Stlan-input").getValue();
                        var stlalinput = that.getView().byId("create::Stlal-input").getValue();
                        var aennrinput = that.getView().byId("create::Aennr-input").getValue();
                        var valid_frominput = that.getView().byId("create::Datuv").getValue();

                        const oPayload = {
                            request_id: that.request_id,
                            DraftUUID: that.draftUUID,
                            matnr: matnrinput,
                            werks: werksinput,
                            stlan: stlaninput,
                            stlal: stlalinput,
                            aennr: aennrinput,
                            ValitFrom: valid_frominput,
                            stlnr: "",
                            bom_versn: "",
                            IsActiveEntity: "false",
                            stlty: ""
                        }
                        debugger;
                        oPromiseUpdae = that.extensionAPI.invokeActions("/ZC_QUDG_BOMHEADERREQUESTTPUpdate_draft", [], oPayload)
                        oPromiseUpdae.then(
                            function (aresponse) {
                                oModel.read('/ZC_QUDG_BOMHEADERREQUESTTP', {
                                    filters: [new sap.ui.model.Filter("request_id", "EQ", that.request_id)],
                                    success: (oData, oRes) => {
                                        var sContextPath = oData.results[0].__metadata.uri.split("/sap/opu/odata/sap/ZC_QUDG_BOMHEADERREQUESTTP_CDS").pop()
                                        debugger;
                                        var oContext = new sap.ui.model.Context(oModel, sContextPath);
                                        that.getView().setBusy(false);
                                        sap.m.MessageToast.show("Navigating to next screen");

                                        that.oNavController.navigateInternal(oContext);
                                        that.createPersonDialog.close();
                                    },
                                    error: (oErr) => {
                                        debugger
                                    },
                                })
                            },
                            function (oErr) {
                                let sErrorMessage = ''
                                JSON.parse(oErr[0].error.response.responseText).error.innererror.errordetails.forEach((message) => {
                                    sErrorMessage = sErrorMessage + message.message + "\n"
                                })
                                debugger;
                                sap.m.MessageBox.error(sErrorMessage)
                            }
                        );
                    }
                }, {
                    text: "Cancel",
                    press: function () {
                        that.createPersonDialog.close();
                        that.getView().setBusy(false);
                    }
                }]
            });
        }
        this.createPersonDialog.setModel(this.getView().getModel());
        this.createPersonDialog.setBindingContext(oResponse.context);
        debugger;
        this.bindData(this.request_id, this.draftUUID);
    },

    onCreate: function () {

        var that = this;
        this.getView().setBusy(true);

        var oApi = this.extensionAPI;
        var oPromise = oApi.invokeActions("/ZC_QUDG_BOMHEADERREQUESTTPCreate_bom", [], {});
        debugger;
        oPromise.then(function (aResponse) {
            console.log(aResponse)

            if (aResponse[0] && aResponse[0].response) {
                var oResponseContext = aResponse[0].response.context;
                if (oResponseContext) {
                    //                  
                    console.log(aResponse);
                    //that._createDialog(oResponseContext, aResponse[0].response.data.reqid);
                    that.ResponseContext = oResponseContext;
                    that.request_id = aResponse[0].response.data.request_id;
                    that.draftUUID = aResponse[0].response.data.DraftUUID;
                    debugger;
                    that._createDialog(aResponse[0].response);
                }
            }
        }, function () {

            //that._olView.setBusy(false);
        });

    },

    bindData: function (request_id, DraftUUID) {
        debugger;
        this.getView().byId("create::Matnr").bindElement({
            path: "/ZC_QUDG_BOMHEADERREQUESTTP(request_id='" + request_id + "',stlnr='',stlty='',stlal='',bom_versn='',aennr='',matnr='',werks='',DraftUUID=guid'" + DraftUUID + "',IsActiveEntity=false)"
        });
        this.getView().byId("create::Werks").bindElement({
            path: "/ZC_QUDG_BOMHEADERREQUESTTP(request_id='" + request_id + "',stlnr='',stlty='',stlal='',bom_versn='',aennr='',matnr='',werks='',DraftUUID=guid'" + DraftUUID + "',IsActiveEntity=false)"

        });
        this.getView().byId("create::Stlan").bindElement({
            path: "/ZC_QUDG_BOMHEADERREQUESTTP(request_id='" + request_id + "',stlnr='',stlty='',stlal='',bom_versn='',aennr='',matnr='',werks='',DraftUUID=guid'" + DraftUUID + "',IsActiveEntity=false)"

        });
        this.getView().byId("create::Stlal").bindElement({
            path: "/ZC_QUDG_BOMHEADERREQUESTTP(request_id='" + request_id + "',stlnr='',stlty='',stlal='',bom_versn='',aennr='',matnr='',werks='',DraftUUID=guid'" + DraftUUID + "',IsActiveEntity=false)"

        });
        this.getView().byId("create::Aennr").bindElement({
            path: "/ZC_QUDG_BOMHEADERREQUESTTP(request_id='" + request_id + "',stlnr='',stlty='',stlal='',bom_versn='',aennr='',matnr='',werks='',DraftUUID=guid'" + DraftUUID + "',IsActiveEntity=false)"

        });
        this.getView().byId("create::Datuv").bindElement({
            path: "/ZC_QUDG_BOMHEADERREQUESTTP(request_id='" + request_id + "',stlnr='',stlty='',stlal='',bom_versn='',aennr='',matnr='',werks='',DraftUUID=guid'" + DraftUUID + "',IsActiveEntity=false)"

        });
        this.getView().addDependent(this.createPersonDialog);
        this.createPersonDialog.open();
    },

    onUpdate: function () {
        let oData = this._InnerTable1.getSelectedItems()[0].getBindingContext().getObject()
        let oPayload = {
            matnr: oData.matnr,
            werks: oData.werks,
            stlal: oData.stlal,
            stlan: oData.stlan
        }

        debugger;
   
        let oApi = this.extensionAPI;
        let oPromise = oApi.invokeActions("/ZC_QUDG_BOMHEADERREQUESTTPUpdate_bom", [], {
            zqu_dg_bomupdate_s: JSON.stringify(oPayload)
        });
        oPromise
            .then((oRes) => {
                debugger;
            })
            .catch((oErr) => {
                debugger
            })
    }

});
