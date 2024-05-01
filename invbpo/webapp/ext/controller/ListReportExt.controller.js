
sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
], function (MessageToast, Fragment, MessageBox) {
    'use strict';

    return {
        onInit: function () {
            //debugger;
            //this.getView().byId("responsiveTable").setProperty("useExportToExcel", true)
            // this.getView().byId("responsiveTable").setProperty("useInfoToolbar", true)
            //this.getView().byId("responsiveTable").setUseExportToExcel(true);
        },

        uploadButtonClick: function (oEvent) {
            //console.log(XLSX)
            if (!this.oUploadDialog) {
                Fragment.load({
                    id: "excel_upload",
                    name: "invbpo.ext.fragment.ExcelUpload",
                    type: "XML",
                    controller: this
                }).then((oDialog) => {
                    let oFileUploader = Fragment.byId("excel_upload", "uploadSet");
                    let oUploadBtn = Fragment.byId("excel_upload", "uploadBtn");
                    oFileUploader.removeAllItems();
                    oUploadBtn.setEnabled(false);
                    this.oUploadDialog = oDialog;
                    this.oUploadDialog.open();
                })
                    .catch(error => alert(error.message));
            } else {
                let oFileUploader = Fragment.byId("excel_upload", "uploadSet");
                let oUploadBtn = Fragment.byId("excel_upload", "uploadBtn");
                oFileUploader.removeAllItems();
                oUploadBtn.setEnabled(false);
                this.oUploadDialog.open();
            }

        },

        onUploadSetComplete: function (oEvent) {
            //console.log("File Uploaded!!!")
            let that = this;
            // getting the UploadSet Control and uploadButton reference
            let oFileUploader = Fragment.byId("excel_upload", "uploadSet");
            let oUploadBtn = Fragment.byId("excel_upload", "uploadBtn");

            // since we will be uploading only 1 file so reading the first file object
            //var oFile = oFileUploader.getItems()[0].getFileObject();

            var oFile = oEvent.getParameters().item.getFileObject();
            oUploadBtn.setEnabled(oFileUploader.getList().getItems().length > 0 ? true : false); //UPDATE THE VISIBILITY OF THE UPLOAD BUTTON

            //UPDATE THE VISIBILITY OF THE UPLOAD BUTTON
            // oUploadBtn.setEnabled(oFileUploader.getItems().length > 0 ? true : false)



            var reader = new FileReader();
            reader.onload = function (e) {
                var data = new Uint8Array(e.target.result);
                var workbook = XLSX.read(data, {
                    type: 'array'
                });
                // Extract data from the first sheet
                var worksheet = workbook.Sheets[workbook.SheetNames[0]];
                var jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Modify JSON data
                jsonData = jsonData.map(function (item) {
                    var newItem = {};
                    Object.keys(item).forEach(function (key) {
                        var newKey = key.replace(/\s+/g, '').toLowerCase(); // Remove spaces and convert to lowercase
                        // newItem[newKey] = item[key];
                        newItem[newKey] = String(item[key]); // Convert value to string
                    });
                    return newItem;
                });
                //console.log(jsonData);
                var oExcelData_Model = new sap.ui.model.json.JSONModel(jsonData);
                that.getView().setModel(oExcelData_Model, "oExcelData_Model");
            };
            reader.readAsArrayBuffer(oFile);
        },

        handle_UploadBtn: function (oEvent) {
            let oModel = this.getOwnerComponent().getModel()
            let oData = this.getView().getModel("oExcelData_Model").getData();
            if (!this.validateExcel(oData) || !oData.length) {
                MessageBox.error("PLEASE FILL MANDATORY FIELDS")
                return;
            }
            let promises = []; // Array to store promises
            var that = this;

            Fragment.byId("excel_upload", "uploadDialogSet").setBusy(true);
            oModel.setUseBatch(false);
            oData.forEach((data) => {
                let promise = new Promise((resolve, reject) => {
                    const oPayload = {
                        plant: data.plant,
                        storage_location: data.storagelocation,
                        mat_group: data.materialgroup,
                        category_material: data.categorymaterial,
                        bpo_1st_level: data.bpo1stlevel,
                        bpo_2nd_level: data.bpo2ndlevel,
                        bpo_final_level: data.bpofinallevel,
                    }
                    //console.log(oPayload)
                    oModel.create("/ZC_INV_BPO", oPayload, {
                        success: function (oResponse) {
                            resolve(oResponse);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                })
                promises.push(promise); // Push each promise into the array
            })

            async function processPromises() {
                try {
                    const oResponse = await Promise.all(promises);
                    console.log("All requests completed successfully.");
                    Fragment.byId("excel_upload", "uploadDialogSet").setBusy(false);
                    that.oUploadDialog.close();
                    that.getView().getModel("oExcelData_Model").destroy(); // Destroy the model data after successful request
                    MessageBox.success("Excel upload completed successfully");
                    oModel.setUseBatch(true);
                } catch (oError) {
                    const aMessageContainer = []; //STORE ALL THE ERROR MESSAGES IN A SINGLE ARRAY

                    for (let index = 0; index < promises.length; index++) {
                        try {
                            await promises[index];
                        } catch (error) {
                            const oError = JSON.parse(error.responseText);
                            const aInnerErrors = oError.error.innererror.errordetails;
                            const sOuterError = oError.error.message.value;
                            const messages = [];

                            // Add inner errors to the array
                            aInnerErrors.forEach(function (item) {
                                messages.push(item.message);
                            });
                            messages.push(sOuterError); // Add outer error to the array

                            //REMOVE DUPLICATES FROM THE ARRAY messages
                            let aMessages = [...new Set(messages)]
                            const sMessagesString = aMessages.join('\n');
                            const sErrorMessage = `FOUND BELOW ERRORS IN LINE ${index + 2} :\n ${sMessagesString} \n`;
                            aMessageContainer.push(sErrorMessage);
                        }
                    }

                    let sAllErrorMessages = aMessageContainer.join('\n')
                    MessageBox.error(sAllErrorMessages)
                    Fragment.byId("excel_upload", "uploadDialogSet").setBusy(false);
                    oModel.setUseBatch(true);
                }
            }
            processPromises();
        },

        validateExcel: function (oData) {
            //console.log(oData)
            let bValidate = oData.every((item) => {
                return (item.plant && item.materialgroup && item.categorymaterial);
            })
            return bValidate
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
            let columns = ["Plant", "Storage Location", "Material Group", "Category Material", "BPO 1st Level", "BPO 2nd Level", "BPO Final Level"];

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
            a.download = 'template_BPO.xlsx';

            // Trigger the download
            a.click();

        },

        handle_CloseBtn: function (oEvent) {
            this.oUploadDialog.close();
        },

        onItemRemoved: function (oEvent) {
            //console.log('removed')
            let oFileUploader = Fragment.byId("excel_upload", "uploadSet");
            let oUploadBtn = Fragment.byId("excel_upload", "uploadBtn");
            oUploadBtn.setEnabled(oFileUploader.getList().getItems().length > 0 ? true : false)
        }
    };
});
