sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/ProgressIndicator",
    "sap/m/BusyDialog",
    "sap/m/Dialog"
], function (MessageToast, MessageBox, ProgressIndicator, BusyDialog, Dialog) {
    'use strict';

    return {
        onInit: function () {
            this.getView().byId("responsiveTable").getParent().setProperty("useExportToExcel", true)

            // // Create a custom Dialog
            // this._oProgressDialog = new Dialog({
            //     title: "Processing",
            //     content: [
            //         new Text({ text: "Please wait while we process your request..." }),
            //         new ProgressIndicator({
            //             percentValue: 0,
            //             showValue: true,
            //             width: "100%"
            //         })
            //     ],
            //     endButton: new sap.m.Button({
            //         text: "Cancel",
            //         press: function () {
            //             this._oProgressDialog.close();
            //         }.bind(this)
            //     }),
            //     afterClose: function () {
            //         // Clear the interval when the dialog is closed
            //         clearInterval(this._interval);
            //     }.bind(this)
            // });

            // // Save a reference to the ProgressIndicator
            // this._oProgressIndicator = this._oProgressDialog.getContent()[1];
        },

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
            let that = this;
            let oModel = this.getOwnerComponent().getModel("Excel_Upload")
            this.getView().setBusy(false)
            //that._oProgressDialog.close();
            let oResponse = oEvent.getParameters("response");
            debugger;
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

                // this._oProgressDialog.open();
                // this._updateProgressIndicator();
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
                                    "invcat::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_INV_CATEGORY--listReport");
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
                this._ErrorFragment = sap.ui.xmlfragment("invcat.ext.fragment.Errors", this);
            }
            this._ErrorFragment.setModel(this.getOwnerComponent().getModel("Excel_Upload"))
            this.getView().addDependent(this._ErrorFragment);
            this._ErrorFragment.open();
            setTimeout(()=>{
                sap.ui.getCore().byId("smartTable_Errors").rebindTable()
            },0)
            
        },

        handle_ErrorsCloseBtn: function (oEvent) {
            this._ErrorFragment.close();
            this._ErrorFragment.destroy();
            this._ErrorFragment = null;
        },

        _updateProgressIndicator: function () {
            var that = this;
            var progress = 0;

            // Simulate progress updates every second
            this._interval = setInterval(function () {
                progress += 10; // Increment progress by 10%

                // Update the ProgressIndicator
                that._oProgressIndicator.setPercentValue(progress);

                // If progress reaches 100%, stop the interval
                if (progress >= 100) {
                    clearInterval(that._interval);
                }
            }, 1000); // Update every second
        }
    };
});