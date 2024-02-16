
sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    // "xlxs"
], function (MessageToast, Fragment,xlxs) {
    'use strict';

    return {
        uploadExcel: function (oEvent) {
            //MessageToast.show("Custom handler invoked.");
            //console.log(xlxs)
            var oView = this.getView();
            if (!this.pDialog) {
                Fragment.load({
                    id: "excel_upload",
                    name: "uploadexcel.ext.fragment.ExcelUpload",
                    type: "XML",
                    controller: this
                }).then((oDialog) => {
                    var oFileUploader = Fragment.byId("excel_upload", "uploadSet");
                    oFileUploader.removeAllItems();
                    this.pDialog = oDialog;
                    this.pDialog.open();
                })
                    .catch(error => alert(error.message));
            } else {
                var oFileUploader = Fragment.byId("excel_upload", "uploadSet");
                oFileUploader.removeAllItems();
                this.pDialog.open();
            }

        },
        onUploadSet: function(oEvent) {
            console.log("Upload Button Clicked!!!")
            /* TODO: Read excel file data */

        },
        onTempDownload: function (oEvent) {
            console.log("Template Download Button Clicked!!!")
            /* TODO: Excel file template download */
        },
        onCloseDialog: function (oEvent) {
            this.pDialog.close();
        },
        onBeforeUploadStart: function (oEvent) {
            console.log("File Before Upload Event Fired!!!")
            /* TODO: check for file upload count */
        },
        onUploadSetComplete: function (oEvent) {
            console.log("File Uploaded!!!")
            /* TODO: Read excel file data*/
        },
        onItemRemoved:function (oEvent) {
            console.log("File Remove/delete Event Fired!!!")  
            /* TODO: Clear the already read excel file data */          
        }
    };
});
