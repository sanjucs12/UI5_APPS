sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (MessageToast, MessageBox) {
    'use strict';

    return {
        onInit: function () {
            this.getView().byId("responsiveTable").getParent().setProperty("useExportToExcel", true)
        },

        handleUploadButtonClick: function (oEvent) {
            if (!this.importDialog) {
                this.importDialog = sap.ui.xmlfragment("invbpo.ext.fragment.fileUpload", this);
            }
            this.getView().addDependent(this.importDialog);
            this.importDialog.open();
        },

        handleCancelPress: function (oEvent) {
            this.importDialog.close();
            this.importDialog.destroy();
            this.importDialog = null;
        },

        handleUploadComplete: function (oEvent) {
            this.getView().setBusy(false)
            let that = this;
            let oModel = this.getOwnerComponent().getModel("Excel_Upload")
            let oResponse = oEvent.getParameters("response");
            if (oResponse.status === 201) {
                if (oResponse.response.includes("Success")) {
                    MessageBox.success("All records added successfully")
                } else {
                    that.getView().setBusy(true)
                    oModel.read("/GetErrorSet", {
                        success: function (oData, oResponse) {
                            that.getView().setBusy(false)
                            that.openErrorsTable()
                        },
                        error: function (oData, oResponse) {
                            that.getView().setBusy(false)
                            MessageBox.error("SOMETHING WENT WRONG");
                        },
                    })
                }

            } else {
                MessageBox.error(`
                SOMETHING WENT WRONG \n
                Status:${oResponse.status} \n
                Response:${oResponse.responseRaw}`)
            }


            this.extensionAPI.refreshTable(
                "invbpo::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_INV_BPO--listReport");
            this.importDialog.destroy();
            this.importDialog = null;
        },

        handleUploadPress: function (oEvent) {
            //perform upload
            var oFileUploader = sap.ui.getCore().byId("fupImport");

            //check file has been entered
            var sFile = oFileUploader.getValue();
            if (!sFile) {
                sap.m.MessageToast.show("Please select a file first");
                return;
            }
            else {
                this._addTokenToUploader();
                oFileUploader.upload();
                this.importDialog.close();
                this.getView().setBusy(true)
            }

        },

        _addTokenToUploader: function () {
            //Add header parameters to file uploader.
            var oDataModel = this.getView().getModel("Excel_Upload");
            var sTokenForUpload = oDataModel.getSecurityToken();
            var oFileUploader = sap.ui.getCore().byId("fupImport");
            var oHeaderParameter = new sap.ui.unified.FileUploaderParameter({
                name: "X-CSRF-Token",
                value: sTokenForUpload
            });

            var sFile = oFileUploader.getValue();
            var oHeaderSlug = new sap.ui.unified.FileUploaderParameter({
                name: "SLUG",
                value: sFile
            });

            //Header parameter need to be removed then added.
            oFileUploader.removeAllHeaderParameters();
            oFileUploader.addHeaderParameter(oHeaderParameter);

            oFileUploader.addHeaderParameter(oHeaderSlug);
            //set upload url
            var sUrl = oDataModel.sServiceUrl + "/BpoUploadSet";
            oFileUploader.setUploadUrl(sUrl);
        },

        handleDeleteAllButtonClick: function () {
            let oDataModel = this.getView().getModel("Excel_Upload");
            let that = this;
            MessageBox.warning("Delete All Data?", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if (sAction === "OK") {
                        that.getView().setBusy(true)
                        oDataModel.callFunction("/DeleteAllFI", {
                            success: function (data) {
                                that.getView().setBusy(false);
                                MessageBox.success("All records deleted successfully");
                                that.extensionAPI.refreshTable(
                                    "invbpo::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_INV_BPO--listReport");
                            },
                            error: function (error) {
                                that.getView().setBusy(false)
                                MessageBox.error("Something went wrong. Please try again")
                            },
                        })
                    }

                }
            });

        },

        openErrorsTable: function () {
            if (!this._ErrorFragment) {
                this._ErrorFragment = sap.ui.xmlfragment("invbpo.ext.fragment.Errors", this);
            }
            this._ErrorFragment.setModel(this.getOwnerComponent().getModel("Excel_Upload"))
            this.getView().addDependent(this._ErrorFragment);
            this._ErrorFragment.open();
            setTimeout(() => {
                sap.ui.getCore().byId("smartTable_Errors").rebindTable()
            }, 0)
        },

        handle_ErrorsCloseBtn: function (oEvent) {
            this._ErrorFragment.close();
            this._ErrorFragment.destroy();
            this._ErrorFragment = null;
        },
    };
});