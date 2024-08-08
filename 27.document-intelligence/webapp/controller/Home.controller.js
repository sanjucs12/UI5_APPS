sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "documentintelligence/model/converter",
    "documentintelligence/model/formatter"
],
    function (Controller, Converter, formatter) {
        "use strict";

        return Controller.extend("documentintelligence.controller.Home", {
            formatter: formatter,
            onInit: function () {
                debugger;
                this.oItemsProcessor = [];
                this.documentTypes = this.getOwnerComponent().getModel('Documents').getProperty('/categories')
            },
            uploadFileToAzure: async function (file) {
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

            onPluginActivated: function (oEvent) {
                this.oUploadPluginInstance = oEvent.getParameter("oPlugin");
            },
            openPreview: function (oEvent) {
                debugger;
                const blobUrl = oEvent.getSource().getBindingContext('Documents').getObject().url
                const oBindingContext = oEvent.getSource().getBindingContext("Documents");
                if (oBindingContext && this.oUploadPluginInstance) {
                    this.oUploadPluginInstance.openFilePreview(oBindingContext);
                }
                //window.open(blobUrl)               
            },

            ////_________________Uploading functions : Fragment Functions__________________
            itemValidationCallback: function (oItemInfo) {
                debugger
                const { oItem, iTotalItemsForUpload } = oItemInfo;
                var oItemPromise = new Promise((resolve, reject) => {
                    this.oItemsProcessor.push({
                        item: oItem,
                        resolve: resolve,
                        reject: reject
                    });
                });
                if (iTotalItemsForUpload === 1) {
                    this.openFileUploadDialog();
                } else if (iTotalItemsForUpload === this.oItemsProcessor.length) {
                    this.openFileUploadDialog();
                }
                return oItemPromise;
            },
            uploadFilesHandler: function () {
                this.oUploadPluginInstance.fileSelectionHandler();
            },
            openFileUploadDialog: function () {
                let aItems = this.oItemsProcessor;
                if (aItems && aItems.length) {
                    this._oFilesTobeuploaded = aItems;
                    debugger;

                    var aItemsMap = this._oFilesTobeuploaded.map(function (oItemProcessor) {
                        return {
                            fileName: oItemProcessor.item.getFileName(),
                            fileCategorySelected: this.documentTypes[0].categoryId,
                            itemInstance: oItemProcessor.item,
                            fnResolve: oItemProcessor.resolve,
                            fnReject: oItemProcessor.reject
                        };
                    }.bind(this));
                    debugger;
                    var oModel = new sap.ui.model.json.JSONModel({
                        selectedItems: aItemsMap,
                        categories: this.getOwnerComponent().getModel('Documents').getProperty('/categories')
                    });
                    debugger;
                    if (!this._fileUploadFragment) {
                        sap.ui.core.Fragment.load({
                            name: "documentintelligence.fragment.FileUpload",
                            id: this.getView().getId() + "-file-upload-dialog",
                            controller: this
                        })
                            .then(function (oPopover) {
                                this._fileUploadFragment = oPopover;
                                this.getView().addDependent(oPopover);
                                oPopover.setModel(oModel);
                                oPopover.open();
                            }.bind(this));
                    } else {
                        this._fileUploadFragment.setModel(oModel);
                        this._fileUploadFragment.open();
                    }
                }
            },
            isAddButtonEnabled: function (aSelectedItems) {
                if (aSelectedItems && aSelectedItems.length) {
                    if (aSelectedItems.some(function (item) {
                        return !item.fileCategorySelected;
                    })) {
                        return false;
                    }
                    return true;
                } else {
                    return false;
                }
            },
            handleRemoveItemInFragment: function (oEvent) {
                var oSource = oEvent.getSource();
                var oItemInstance = oSource.data().item;
                var fnReject = oSource.data().reject;
                var oFragmentModel = this._fileUploadFragment.getModel();
                var oSelectedItems = oFragmentModel.getData().selectedItems;
                debugger;
                var iSelectedItemIndex = oSelectedItems.findIndex(function (oItem) {
                    return oItem.itemInstance.getId() === oItemInstance.getId();
                });
                oSelectedItems.splice(iSelectedItemIndex, 1);
                this._oFilesTobeuploaded.splice(iSelectedItemIndex, 1);
                var oModel = new sap.ui.model.json.JSONModel({
                    selectedItems: oSelectedItems,
                    categories: this.getOwnerComponent().getModel('Documents').getProperty('/categories')
                });
                this._fileUploadFragment.setModel(oModel);

                // cancel the upload of the current item selected for upload.
                fnReject(oItemInstance);
            },
            closeFileUplaodFragment: function () {
                this._fileUploadFragment.destroy();
                this._fileUploadFragment = null;
                this._oFilesTobeuploaded = [];
                this.oItemsProcessor = [];
            },
            handleUploadConfirmation: function () {
                let oData = this._fileUploadFragment.getModel().getData();
                let oSelectedItems = oData.selectedItems;
                let aDocumentCategories = this.documentTypes

                debugger;
                if (oSelectedItems && oSelectedItems.length) {
                    oSelectedItems.forEach(function (oItem) {
                        var oItemToUploadRef = oItem.itemInstance;
                        // adding selected document type in a Header
                        debugger;
                        oItemToUploadRef.addHeaderField(new sap.ui.core.Item({
                            key: oItem.fileCategorySelected,
                            text: Converter.findCategoryText(aDocumentCategories, oItem.fileCategorySelected)
                        }));
                        // oItemToUploadRef.addCustomData(new sap.ui.core.CustomData({
                        //     key: "documentType",
                        //     value: oItem.fileCategorySelected
                        // }))
                        oItem.fnResolve(oItemToUploadRef);
                    });
                }
                this._fileUploadFragment.destroy();
                this._fileUploadFragment = null;
                this._oFilesTobeuploaded = [];
                this.oItemsProcessor = [];
            },

            ////_________________After Upload functions__________________

            onUploadCompleted: function (oEvent) {
                const oFile = oEvent.getParameter('item').getFileObject()
                const sFileType = oEvent.getParameter('item').getHeaderFields()[0].getProperty('text')
                const sFileTypeId = oEvent.getParameter('item').getHeaderFields()[0].getProperty('key')
                const iResponseStatus = oEvent.getParameter("status");
                debugger;

                if (iResponseStatus === 200) {
                    this._SaveDocumentToJsonModel(oFile, sFileType, sFileTypeId)
                }
            },
            _SaveDocumentToJsonModel: async function (oFile, sFileType, sFileTypeId) {
                try {
                    const sBase64URL = await Converter._FileToBase64(oFile);
                    const oModel = this.getOwnerComponent().getModel("Documents");
                    const oFileDetails = {
                        id: oFile.name,
                        fileName: oFile.name,
                        mediaType: oFile.type,
                        url: URL.createObjectURL(oFile),
                        base64url: sBase64URL,
                        status: "Not Verified",
                        documentType: sFileType,
                        documentTypeId: sFileTypeId,
                        previewable: true,
                        trustedSource: true
                    };
                    const aModelItems = oModel.getProperty('/items');
                    aModelItems.unshift(oFileDetails);
                    oModel.setProperty('/items', aModelItems);
                } catch (err) {
                    console.error('Error:', err);
                }
            },
            onRemoveItemHandler: function (oEvent) {
                var oSource = oEvent.getSource();
                const oContext = oSource.getBindingContext("Documents");
                this.removeItemFromTable(oContext);
            },
            removeItemFromTable: function (oContext) {
                const oModel = this.getView().getModel("Documents");
                const oTable = this.byId("table-uploadSet");
                sap.m.MessageBox.warning(
                    "Are you sure you want to remove the document" + " " + oContext.getProperty("fileName") + " " + "?",
                    {
                        icon: sap.m.MessageBox.Icon.WARNING,
                        actions: ["Remove", sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: "Remove",
                        styleClass: "sapMUSTRemovePopoverContainer",
                        initialFocus: sap.m.MessageBox.Action.CANCEL,
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
            onSelectionChange: function (oEvent) {
                const oTable = oEvent.getSource();
                const aSelectedItems = oTable?.getSelectedContexts();
                const oAnalyseBtn = this.byId("idAnalyseBtn");

                if (aSelectedItems.length > 0) {
                    oAnalyseBtn.setEnabled(true);
                } else {
                    oAnalyseBtn.setEnabled(false);
                }

            },

            ///_________DOCUMENT INTELLIGENCE FUNCTIONS__________/////

            onDocumentVerify: function (oEvent) {
                const oTable = this.byId("table-uploadSet");
                const aContexts = oTable.getSelectedContexts();
                const sDocBase64Url = aContexts[0].getObject().base64url
                const sDocTypeId = aContexts[0].getObject().documentTypeId;
                const sModelId = formatter._getModelId(sDocTypeId)
                this._onAnalyzeDocument(sDocBase64Url, sModelId)
            },
            _onAnalyzeDocument: async function (sDocUrl, sModelId) {
                const endpoint = "https://aidg-doc-intl.cognitiveservices.azure.com";
                const subscriptionKey = "b0c89defb05b445ab391921a5d94b115";
                const modelId = sModelId;
                const apiVersion = "2023-07-31";
                const documentUrl = "https://github.com/Azure-Samples/cognitive-services-REST-api-samples/raw/master/curl/form-recognizer/rest-api/invoice.pdf"
                const sDocBase64Url = sDocUrl

                const url = `${endpoint}/formrecognizer/documentModels/${modelId}:analyze?api-version=${apiVersion}`;

                debugger;
                this.getView().setBusy(true)
                try {
                    const postReqResponse = await fetch(url, {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                            "Ocp-Apim-Subscription-Key": subscriptionKey
                        },
                        body: JSON.stringify({
                            "base64Source": sDocBase64Url
                        })
                    });

                    if (postReqResponse.ok) {
                        const getResponseUrl = postReqResponse.headers.get('Operation-Location');

                        let analysisResult;
                        let status;

                        do {
                            const getReqResponse = await fetch(getResponseUrl, {
                                headers: {
                                    "Ocp-Apim-Subscription-Key": subscriptionKey
                                }
                            });

                            if (!getReqResponse.ok) {
                                const errorText = await getReqResponse.text();
                                console.error('Error:', errorText);
                                this.getView().setBusy(false)
                                return;
                            }

                            analysisResult = await getReqResponse.json();
                            status = analysisResult.status;

                            if (status !== "succeeded" && status !== "failed") {
                                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds before polling again
                            }
                        } while (status !== "succeeded" && status !== "failed");

                        if (status === "succeeded") {
                            this.getView().setBusy(false)
                            console.log(analysisResult);
                            //sap.m.MessageBox.show(analysisResult.analyzeResult.content)
                            this._ShowAnalysisResult(analysisResult.analyzeResult.documents[0].fields)
                        } else {
                            this.getView().setBusy(false)
                            console.error('Analysis failed:', analysisResult);
                        }


                    } else {
                        const errorText = await response.text();
                        console.error('Error:', errorText);
                    }
                } catch (error) {
                    debugger
                    this.getView().setBusy(false)
                    console.error('Error:', error.message);

                }
                //this._ShowAnalysisResult()
            },

            _ShowAnalysisResult: function (data) {
                //let oData = this.getOwnerComponent().getModel('Documents').getData().fields
                let oData = data
                const aTransformedData = Object.keys(oData).map(key => ({
                    label: key,
                    value: oData[key].content
                }));
                debugger;
                const oModel = new sap.ui.model.json.JSONModel({items:aTransformedData});
                if (!this._InvoiceFragment) {
                    sap.ui.core.Fragment.load({
                        name: "documentintelligence.fragment.Invoice",
                        id: this.getView().getId() + "--invoice-dialog",
                        controller: this
                    })
                        .then(function (oDialog) {
                            this._InvoiceFragment = oDialog;
                            this.getView().addDependent(oDialog);
                            oDialog.setModel(oModel)
                            oDialog.open();
                        }.bind(this));
                } else {
                    this._InvoiceFragment.setModel(oModel)
                    this._InvoiceFragment.open();
                }

            },

        });
    });
