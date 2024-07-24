sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/plugins/UploadSetwithTable",
    "sap/m/MessageBox",
    "sap/m/MessageToast",

], function (Controller, UploadSetwithTable, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("test.controller.View1", {
        onInit: function () {

        },
        handleUploadPress: function (oEvent) {
            this.uploadFile(this._file);

        },
        handleFileChange: function (oEvent) {
            this._file = oEvent.getParameter("files")[0];

            let oFile = oEvent.getParameter("files")[0];

            let oReader = new FileReader();
            oReader.onload = function (e) {
                let sUrl = e.target.result;
                let sBase64Url = sUrl.split(',')[1]
                this._generateBlob(sUrl)
            }.bind(this);
            oReader.readAsDataURL(oFile);
        },
        _generateBlob: function (url) {
            let base64URL = url.split(',')[1]; // Your base64 URL

            // Decode base64 string, convert to binary data
            var byteCharacters = atob(base64URL);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            debugger;
            var byteArray = new Uint8Array(byteNumbers);

            // Create a blob from the byte array
            var blob = new Blob([byteArray], { type: 'application/pdf' });

            // Create an object URL from the blob
            var objectURL = URL.createObjectURL(blob);
            debugger;
            // Open the object URL in a new tab
            //window.open(objectURL);
            //fetch(objectURL).then((res) => { debugger }).catch((err) => { debugger })
            this._onAnalyzeDocument(objectURL,url)
        },
        _onAnalyzeDocument: async function (objectURL,base64) {
            const endpoint = "https://aidg-doc-intl.cognitiveservices.azure.com";
            const modelId = "prebuilt-invoice";
            const apiVersion = "2024-02-29-preview";
            const subscriptionKey = "b0c89defb05b445ab391921a5d94b115";
            const documentUrl = "https://github.com/Azure-Samples/cognitive-services-REST-api-samples/raw/master/curl/form-recognizer/rest-api/invoice.pdf"

            //const url = `${endpoint}/documentintelligence/documentModels/${modelId}:analyze?api-version=${apiVersion}`;
            const URL = "https://aidg-doc-intl.cognitiveservices.azure.com/documentintelligence/documentModels/prebuilt-invoice:analyze?_overload=analyzeDocument&api-version=2024-02-29-preview"


            try {
                const response = await fetch(URL, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Ocp-Apim-Subscription-Key": subscriptionKey
                    },
                    body: JSON.stringify({
                        "base64Source": base64.split(',')[1]
                    })
                });

                if (response.ok) {
                    debugger
                    const data = await response.json();
                    console.log('Success:', data);

                } else {
                    debugger
                    const errorText = await response.text();
                    console.error('Error:', errorText);

                }
            } catch (error) {
                debugger
                console.error('Error:', error.message);

            }
        },

        uploadFile: async function (file) {
            // https://aispdb.blob.core.windows.net/document-intelligence
            debugger;
            const accountName = "devdocstorage0001";
            const sasToken = "cgDixhoD0LdLA4Guqe5o+jQkzsaAIkN4opZrtm/O/AyrbDQlocTjRSMDwPq7dRlH3Q0BvDTeLMe0+AStl/hR4w==";
            const containerName = "gst-certificate";
            const blobName = file.name;
            const url = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}${sasToken}`;
            try {
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'x-ms-blob-type': 'BlockBlob',
                        'Content-Type': file.type,
                    },
                    body: file
                });

                if (response) {
                    debugger
                    MessageToast.show("File uploaded successfully.");
                } else {
                    const errorText = await response.text();
                    console.error("Upload failed:", errorText);
                    MessageToast.show("File upload failed.");
                }
            } catch (error) {
                debugger;
                console.error("Upload failed:", error.message);
                MessageToast.show("File upload failed.");
            }
        },
        onBeforeUploadStarts: function () {

        },
        onPluginActivated: function (oEvent) {
            this.oUploadPluginInstance = oEvent.getParameter("oPlugin");
        },
        getIconSrc: function (mediaType, thumbnailUrl) {
            return UploadSetwithTable.getIconForFileType(mediaType, thumbnailUrl);
        },
        // Table row selection handler
        onSelectionChange: function (oEvent) {
            const oTable = oEvent.getSource();
            const aSelectedItems = oTable?.getSelectedContexts();
        },

        // UploadCompleted event handler
        onUploadCompleted: function (oEvent) {
            const oModel = this.byId("table-uploadSet").getModel("documents");
            const iResponseStatus = oEvent.getParameter("status");

            // check for upload is sucess
            if (iResponseStatus === 201) {
                oModel.refresh(true);
                setTimeout(function () {
                    MessageToast.show("Document Added");
                }, 1000);
            }
        },

        onRemoveHandler: function (oEvent) {
            var oSource = oEvent.getSource();
            const oContext = oSource.getBindingContext("documents");
            this.removeItem(oContext);
        },
        removeItem: function (oContext) {
            const oModel = this.getView().getModel("documents");
            const oTable = this.byId("table-uploadSet");
            MessageBox.warning(
                "Are you sure you want to remove the document" + " " + oContext.getProperty("fileName") + " " + "?",
                {
                    icon: MessageBox.Icon.WARNING,
                    actions: ["Remove", MessageBox.Action.CANCEL],
                    emphasizedAction: "Remove",
                    styleClass: "sapMUSTRemovePopoverContainer",
                    initialFocus: MessageBox.Action.CANCEL,
                    onClose: function (sAction) {
                        if (sAction !== "Remove") {
                            return;
                        }
                        var spath = oContext.getPath();
                        if (spath.split("/")[2]) {
                            var index = spath.split("/")[2];
                            var data = oModel.getProperty("/items");
                            data.splice(index, 1);
                            oModel.refresh(true);
                            if (oTable && oTable.removeSelections) {
                                oTable.removeSelections();
                            }
                        }
                    }
                }
            );
        },

        getFileSizeWithUnits: function (iFileSize) {
            return UploadSetwithTable.getFileSizeWithUnits(iFileSize);
        },
        openPreview: function (oEvent) {
            const oSource = oEvent.getSource();
            const oBindingContext = oSource.getBindingContext("documents");
            if (oBindingContext && this.oUploadPluginInstance) {
                this.oUploadPluginInstance.openFilePreview(oBindingContext);
            }
        },
        onRenameDocument: function () {
            const oUploadSet = this.byId("table-uploadSet");
            const aSelectedContexts = oUploadSet.getSelectedContexts();
            if (aSelectedContexts?.length === 1) {
                // invoking public API on UploadSetTable
                this.oUploadPluginInstance.renameItem(aSelectedContexts[0]);
            }
        },
        onDocumentRenamedSuccess: function (oEvent) {
            MessageToast.show("Document Renamed.", { duration: 2000 });
        },


    });
});
