
sap.ui.controller("bomrequest01.ext.controller.ListReportExt", {
    onInit: function () {
        //  
        var n = this.extensionAPI.getNavigationController();
    },
    onAfterRendering: function () {
        let i = this.getView().createId("addEntry");
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
 
    _createDialog: function () {
 
        this.oNavController = this.extensionAPI.getNavigationController();
        var that = this;
        var oModel = this.getView().getModel();
        this.getView().setBusy(false);
 
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
 
                        var matnrinput = that.getView().byId("create::Matnr-input").getValue();
                        var werksinput = that.getView().byId("create::Werks-input").getValue();
                        var stlaninput = that.getView().byId("create::Stlan-input").getValue();
                        var stlalinput = that.getView().byId("create::Stlal-input").getValue();
                        var aennrinput = that.getView().byId("create::Aennr-input").getValue();
                        //var valid_frominput = that.getView().byId("create::Datuv").getValue();
 
                        const oPayload = {
                            request_id: that.ReqId,
                            matnr: matnrinput,
                            werks: werksinput,
                            stlan: stlaninput,
                            stlal: stlalinput,
                            aennr: aennrinput
                        }
                        debugger;
 
                        that.getView().setBusy(true);
 
                        // let sPath = `/ZC_QUDG_BOMHEADERREQUESTTP(request_id='${that.ReqId}',stlnr='${00000000}',stlty='',stlal='${stlalinput}',bom_versn='',aennr='',matnr='${matnrinput}',werks='${werksinput}',DraftUUID=guid'${}',IsActiveEntity=false)`;
                        // var oContext = new sap.ui.model.Context(oModel, sPath)
                        // that.oNavController.navigateInternal(oContext)
 
                        oModel.create(`/ZC_QUDG_BOMHEADERREQUESTTP`, oPayload, {
                            success: function (oData, oResponse) {
                                that.createPersonDialog.close();
                                let sUpdatePath = oData.__metadata.uri.split("/sap/opu/odata/sap/ZC_QUDG_BOMHEADERREQUESTTP_CDS").pop()
                                debugger;
                                oModel.read("/ZC_QUDG_BOMHEADERREQUESTTP", oPayload,{
                                    filters: [new sap.ui.model.Filter("request_id", "EQ", that.ReqId)],
                                    success: (oData, oRes) => {
                                        debugger;
                                        var sContextPath = oData.results[0].__metadata.uri.split("/sap/opu/odata/sap/ZC_QUDG_BOMHEADERREQUESTTP_CDS").pop()
                                        //var sContextPath = sUpdatePath
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
                            error: function (oError) {
                                that.getView().setBusy(false);
                                debugger;
                            }
                        }
                        );
                    }
                }, {
                    text: "Cancel",
                    press: function () {
                        that.createPersonDialog.close();
                    }
                }]
            });
        }
        this.createPersonDialog.setModel(this.getView().getModel());
        debugger
        this.getView().byId('SFPersonCreateDialog').setBindingContext(this.getOwnerComponent().getModel().createEntry("/ZC_QUDG_BOMHEADERREQUESTTP", {}));
        //this.getView().byId('SFPersonCreateDialog').bindElement("/ZC_QUDG_BOMHEADERREQUESTTP")
        debugger;
        this.createPersonDialog.open();
    },
    onCreate: function () {
        var that = this;
        this.getView().setBusy(true);
 
        //var oApi = this.extensionAPI;
        //var oPromise = oApi.invokeActions("/ZC_QUDG_BOMHEADERREQUESTTPCreate_bom", [], {});
        debugger;
        // oPromise.then(function (aResponse) {
        //     console.log(aResponse)
        //     debugger;
 
        //     if (aResponse[0] && aResponse[0].response) {
        //         var oResponseContext = aResponse[0].response.context;
        //         if (oResponseContext) {
        //             that.ResponseContext = oResponseContext;
        //             let ReqId = aResponse[0].response.data.ZC_QUDG_BOMHEADERREQUESTTPCreate_bom.Reqid;
        //            debugger;
        //             that.getOwnerComponent().getModel().setProperty('/ZC_QUDG_BOMHEADERREQUESTTP/request_id',ReqId)
        //             that._createDialog(ReqId);
        //         }
        //     }
        // }, function () {
 
        //     //that._olView.setBusy(false);
        // });
        this.getOwnerComponent().getModel().read("/ZC_QU_DG_BOM_CREATE", {
            success: (oData, oRes) => {
                debugger;
                that.ReqId = oData.results[0].reqid_generated
                that._createDialog()
                //that._createDialog(oData.results[0].reqid_generated)
            },
            error: (oErr) => {
                debugger;
            }
        })
 
    },
 
});
 