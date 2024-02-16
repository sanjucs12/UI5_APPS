sap.ui.define([
    "sap/ui/core/Fragment"
], function (Fragment) {
    'use strict';

    return {
        upload: function (oEvent) {
            var oView = this.getView();
            if (!this.pDialog) {
                Fragment.load({
                    id: "excel_upload",
                    name: "com.test.listreportapp.ext.fragment.ExcelUpload",
                    type: "XML",
                    controller: this
                }).then((oDialog) => {
                    var oFileUploader = Fragment.byId("excel_upload", "uploadSet");
                    oFileUploader.removeAllItems();
                    this.pDialog = oDialog;
                    this.pDialog.open();
                })
                    .catch(error => console.log(error.message));
            } else {
                var oFileUploader = Fragment.byId("excel_upload", "uploadSet");
                oFileUploader.removeAllItems();
                this.pDialog.open();
            }
        }
    };
});