
sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
], function (MessageToast, Fragment, MessageBox) {
    'use strict';

    return {

        uploadButtonClick: function (oEvent) {
            //console.log(XLSX)

            if (!this.oUploadDialog) {
                Fragment.load({
                    id: "excel_upload",
                    name: "invcat.ext.fragment.ExcelUpload",
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
            var that = this;
            // getting the UploadSet Control reference
            let oFileUploader = Fragment.byId("excel_upload", "uploadSet");
            let oUploadBtn = Fragment.byId("excel_upload", "uploadBtn");
            // since we will be uploading only 1 file so reading the first file object          

            //var oFile = oFileUploader.getItems()[0].getFileObject();
            var oFile = oEvent.getParameters().item.getFileObject();
            oUploadBtn.setEnabled(oFileUploader.getList().getItems().length > 0 ? true : false); //UPDATE THE VISIBILITY OF THE UPLOAD BUTTON

            //UPDATE THE VISIBILITY OF THE UPLOAD BUTTON
            //oUploadBtn.setEnabled(oFileUploader.getItems().length > 0 ? true : false)

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
            var oModel = this.getOwnerComponent().getModel()
            var oData = this.getView().getModel("oExcelData_Model").getData();
            if (!this.validateExcel(oData) || !oData.length) {
                MessageBox.error("PLEASE FILL MANDATORY FIELDS")
                return;
            }
            var promises = []; // Array to store promises
            var that = this;

            Fragment.byId("excel_upload", "uploadDialogSet").setBusy(true);

            oModel.setUseBatch(false);
            oData.forEach((data) => {
                var promise = new Promise((resolve, reject) => {
                    var oPayload = {
                        plant: data.plant,
                        storage_location: data.storagelocation,
                        mat_group: data.materialgroup,
                        from_material: data.frommaterial,
                        to_material: data.tomaterial,
                        category_main: data.categorymain,
                        category_piv_main: data.categorypivmain,
                        inv_group: data.inventorygroup,
                        shop_flr_loc: data.shopfloorlocation,
                        category_mat: data.categorymaterial,
                        category_mat_sfr: data.categorymaterialshopfloor,
                    }
                    //console.log(oPayload)
                    oModel.create("/ZC_INV_CATEGORY", oPayload, {
                        success: function (oResponse) {
                            //console.log(oResponse);
                            resolve(oResponse);
                        },
                        error: function (oError) {
                            //console.log(oError);
                            reject(oError);

                        }
                    });

                })
                promises.push(promise); // Push each promise into the array
            })


            // Promise.all(promises)
            //     .then((oResponse) => {
            //         console.log("All requests completed successfully."); // Execute this when all promises are resolved
            //         Fragment.byId("excel_upload", "uploadDialogSet").setBusy(false);
            //         that.oUploadDialog.close();
            //         that.getView().getModel("oExcelData_Model").destroy(); //Destroy the model data after successfull request
            //         MessageBox.success("Excel upload completed successfully");
            //     })
            //     .catch((oError) => {
            //         let aMessageContainer = []  //STORE ALL THE ERROR MESSAGES IN A SINGLE ARRAY
            //         promises.forEach((promise, index) => {
            //             promise.catch((error) => {
            //                 var oError = JSON.parse(error.responseText)
            //                 var aInnerErrors = oError.error.innererror.errordetails;
            //                 var sOuterError = oError.error.message.value;
            //                 var messages = [];

            //                 //ADDING INNER ERRORS TO THE ARRAY
            //                 aInnerErrors.forEach(function (item) {
            //                     messages.push(item.message);
            //                 });

            //                 // Adding outer errors to the array
            //                 messages.push(sOuterError)

            //                 //JOINING ALL THE ERRORS IN A SINGLE STRING
            //                 var messagesString = messages.join('\n');
            //                 //console.log(messagesString);
            //                 //let sMessage = oError.error.message.value
            //                 var sErrorMessage = `Found errors in line number ${index + 2} :\n ${messagesString}`

            //                 //STORING EACH MESSAGES IN AN ARRAY : aMessageContainer
            //                 aMessageContainer.push(sErrorMessage)
            //                 //MessageBox.error(sErrorMessage)
            //             })
            //         })
            //         return Promise.resolve(aMessageContainer);
            //     })
            //     .then(function (response) {
            //         console.log(response)
            //         Fragment.byId("excel_upload", "uploadDialogSet").setBusy(false);
            //         let sAllErrorMessages = response.join('\n');
            //         MessageBox.error(sAllErrorMessages)
            //     })

            async function processPromises() {
                try {
                    const oResponse = await Promise.all(promises);
                    console.log("All requests completed successfully.");
                    Fragment.byId("excel_upload", "uploadDialogSet").setBusy(false);
                    that.oUploadDialog.close();
                    that.getView().getModel("oExcelData_Model").destroy(); // Destroy the model data after successful request
                    MessageBox.success("Excel upload completed successfully");
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

                    //console.log(aMessageContainer);
                    let sAllErrorMessages = aMessageContainer.join('\n')
                    //console.log(sAllErrorMessages)
                    MessageBox.error(sAllErrorMessages)
                    Fragment.byId("excel_upload", "uploadDialogSet").setBusy(false);
                }
            }

            processPromises();
        },

        validateExcel: function (oData) {
            let bValidate = oData.every((item) => {
                return (item.plant && item.materialgroup && item.frommaterial && item.tomaterial);
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
            let columns = ["Plant", "Storage Location", "Material Group", "From Material", "To Material", "Category Main", "Category PIV Main", "Inventory Group", "Shop Floor Location", "Category Material", "Category Material Shop Floor"];

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
            a.download = 'template_WWC.xlsx';

            // Trigger the download
            a.click();

        },

        handle_CloseBtn: function (oEvent) {
            // let oFileUploader = Fragment.byId("excel_upload", "uploadSet");
            // oFileUploader.removeAllItems();
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
