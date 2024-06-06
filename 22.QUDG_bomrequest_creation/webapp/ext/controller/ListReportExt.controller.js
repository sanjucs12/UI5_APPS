sap.ui.controller("bomrequest01.ext.controller.ListReportExt", {
    onInit: function () {
        //  
        var n = this.extensionAPI.getNavigationController();
    },
    onAfterRendering: function () {
        let i = this.getView().createId("addEntry-tab0");
        let j = this.getView().createId("addEntry-tab1");
        if (sap.ui.getCore().byId(i) !== undefined) {
            sap.ui.getCore().byId(i).setVisible(false);
        }
        if (sap.ui.getCore().byId(j) !== undefined) {
            sap.ui.getCore().byId(j).setVisible(false);
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
                        oModel.create(`/ZC_QUDG_BOMHEADERREQUESTTP`, oPayload, {
                            success: function (oData, oResponse) {
                                that.createPersonDialog.close();
                                var sContextPath = oData.__metadata.uri.split("/sap/opu/odata/sap/ZC_QUDG_BOMHEADERREQUESTTP_CDS").pop()
                                debugger;
                                var oContext = new sap.ui.model.Context(oModel, sContextPath);
                                that.getView().setBusy(false);
                                sap.m.MessageToast.show("Navigating to next screen");
                                that.oNavController.navigateInternal(oContext);
                                that.createPersonDialog.close();

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
        this.createPersonDialog.setModel(oModel);
        this.getView().byId('SFPersonCreateDialog').setBindingContext(this.getOwnerComponent().getModel().createEntry("/ZC_QUDG_BOMHEADERREQUESTTP", {}));
        debugger;
        this.createPersonDialog.open();
    },
    onCreate: function () {
        var that = this;
        this.getView().setBusy(true);

        // var oApi = this.extensionAPI;
        // var oPromise = oApi.invokeActions("/ZC_QUDG_BOMHEADERREQUESTTPCreate_bom", [], {});
        // oPromise.then(function (aResponse) {
        //     debugger;
        //     if (aResponse[0] && aResponse[0].response) {
        //         var oResponseContext = aResponse[0].response.context;
        //         if (oResponseContext) {
        //             that.ResponseContext = oResponseContext;
        //             let ReqId = aResponse[0].response.data.ZC_QUDG_BOMHEADERREQUESTTPCreate_bom.Reqid;
        //             debugger;
        //             that.getOwnerComponent().getModel().setProperty('/ZC_QUDG_BOMHEADERREQUESTTP/request_id', ReqId)
        //             that._createDialog(ReqId);
        //         }
        //     }
        // });

        // this.getOwnerComponent().getModel().read("/ZC_QU_DG_BOM_CREATE",{
        //     success: (oData,oRes)=>{
        //         debugger;
        //         that.ReqId = oData.results[0].reqid_generated
        //         that._createDialog()
        //     },
        //     error: (oErr)=>{
        //         debugger;
        //     }
        // })
        that._createDialog()

    },

});