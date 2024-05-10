sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (MessageToast, MessageBox) {
    'use strict';

    return {
        handleUploadButtonClick: function (oEvent) {
            if (!this.importDialog) {
                this.importDialog = sap.ui.xmlfragment("invcat.ext.fragment.fileUpload", this);
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
            let oResponse = oEvent.getParameters("response");
            if (oResponse.status === 201) {
                let firstSpaceIndex = oResponse.response.indexOf(" ");
                let cleanedString = oResponse.response.substring(firstSpaceIndex + 1);
                let sMessage = cleanedString.split('\\n ').join(' \n').replaceAll(";", "\n").replaceAll(",", "\n")
                debugger;
                if (cleanedString === 'Records in Excel are Correct,') {
                    MessageBox.success("All records added successfully")
                } else {
                    MessageBox.error(sMessage)
                }

            } else {
                MessageBox.error("SOMETHING WENT WRONG")
            }

            this.extensionAPI.refreshTable(
                "invcat::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_INV_CATEGORY--listReport");
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
            var sUrl = oDataModel.sServiceUrl + "/MatCatUploadSet";
            oFileUploader.setUploadUrl(sUrl);
        },
    };
});