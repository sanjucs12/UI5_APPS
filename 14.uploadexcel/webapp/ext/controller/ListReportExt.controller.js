
sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
], function (MessageToast, Fragment) {
    'use strict';

    return {
        uploadExcel: function (oEvent) {
            console.log(XLSX)
            // if (!this.oDialog) {
            //     Fragment.load({
            //         id: "excel_upload",
            //         name: "uploadexcel.ext.fragment.ExcelUpload",
            //         type: "XML",
            //         controller: this
            //     }).then((oDialog) => {
            //         var oFileUploader = Fragment.byId("excel_upload", "uploadSet");
            //         oFileUploader.removeAllItems();
            //         this.oDialog = oDialog;
            //         this.oDialog.open();
            //     })
            //         .catch(error => alert(error.message));
            // } else {
            //     var oFileUploader = Fragment.byId("excel_upload", "uploadSet");
            //     oFileUploader.removeAllItems();
            //     this.oDialog.open();
            // }

            if (!this.oUploadDialog) {
                this.loadFragment({
                    name: "uploadexcel.ext.fragment.ExcelUpload"
                }).then(function (oDialog) {
                    var oFileUploader = this.byId("uploadSet");
                    oFileUploader.removeAllItems();
                    this.oUploadDialog = oDialog;
                    this.oUploadDialog.open();
                }.bind(this));
            } else {
                var oFileUploader = this.byId("uploadSet");
                oFileUploader.removeAllItems();
                this.oUploadDialog.open();
            }

        },
        onBeforeUploadStart: function (oEvent) {
            console.log("File Before Upload Event Fired!!!")
        },
        onUploadSetComplete: function (oEvent) {
            console.log("File Uploaded!!!")
            var that = this;
            // getting the UploadSet Control reference
            var oFileUploader = this.byId("uploadSet");
            // since we will be uploading only 1 file so reading the first file object
            var oFile = oFileUploader.getItems()[0].getFileObject();
            var reader = new FileReader();
            reader.onload = function (e) {
                var data = new Uint8Array(e.target.result);
                var workbook = XLSX.read(data, {
                    type: 'array'
                });
                // Extract data from the first sheet
                var worksheet = workbook.Sheets[workbook.SheetNames[0]];
                debugger;
                var jsonData = XLSX.utils.sheet_to_json(worksheet);
                console.log(jsonData);
                var oExcelData_Model = new sap.ui.model.json.JSONModel(jsonData);
                that.getView().setModel(oExcelData_Model, "oExcelData_Model");
            };
            reader.readAsArrayBuffer(oFile);

        },
        onItemRemoved: function (oEvent) {
            console.log("File Remove/delete Event Fired!!!")
            /* TODO: Clear the already read excel file data */
        },

        handle_UploadBtn: function (oEvent) {
            //console.log("Upload Button Clicked!!!")
            var oModel = this.getOwnerComponent().getModel()
            var oData = this.getView().getModel("oExcelData_Model").getData();
            // console.log(oData)
            //this.validateExcel();
            oData.forEach((data) => {
                console.log(data)
                oModel.create("/EmployeeDetailsType", data, {
                    success: function (oResponse) {
                        console.log(oResponse);

                    }.bind(this),
                    error: function (oError) {
                        console.log(oError)
                    }
                });

            })
        },
        validateExcel: function () {
            var oFileUploader = this.byId("uploadSet");
            var oFile = oFileUploader.getItems()[0].getFileObject();

            console.log(oFile)
        },

        handle_TemplateDownloadBtn: function (oEvent) {
            //console.log("Template Download Button Clicked!!!")

            function s2ab(s) {
                let buf = new ArrayBuffer(s.length);
                let view = new Uint8Array(buf);
                for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
                return buf;
            }

            let workbook = XLSX.utils.book_new();

            // Define column headers
            let columns = ["Plant", "Storage Location", "Material Group", "From Material", "To Material", "Category Main", "Category PIV Main", "Inventory Group", "Shop Floor Location", "Category Material", "Category Material  Shop Floor"];

            // Create a worksheet
            let worksheet = XLSX.utils.aoa_to_sheet([columns]);

            // Add the worksheet to the workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

            // Convert the workbook to a binary string
            let wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

            // Convert the binary string to a Blob
            let blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });

            // Convert Blob to URL
            let url = URL.createObjectURL(blob);

            // Create a hidden link element
            let a = document.createElement('a');
            a.href = url;
            a.download = 'template.xlsx';

            // Trigger the download
            a.click();

        },
        handle_CloseBtn: function (oEvent) {
            this.oUploadDialog.close();
        },

        testPress: function(){
            debugger;
        }

    };
});
