sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/odata/v2/ODataModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, oDataModel) {
        "use strict";

        return Controller.extend("metadata.controller.View2", {
            onInit: function () {
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteView2").attachPatternMatched(this.onPatternMatched, this);
                //this.readData(); // Read the data from Odata instance
            },

            readData: function (dynamicPath) {
                var oModel = this.getOwnerComponent().getModel();
                var oJSONModel = new sap.ui.model.json.JSONModel();
                var smartTable = this.getView().byId('smartTable_steps')
                var mTable = this.getView().byId('table_steps')
                // Define the path for your specific request
                //var sPath = "/ZP_QU_DG_PROC_STEP_ROLE(ProcessId=guid'bc305bce-60aa-1ede-abd5-3ab89c2bebd8',Action='05')/to_ProcesstoRole";
                var sPath = `${dynamicPath}/to_ProcesstoRole`;
                this.dynamicPath = sPath;
                console.log(sPath)
                oModel.read(sPath, {
                    success: function (response) {
                        console.log("Data Read Successfully: ", response.results);
                        // Store the loaded data in the original variable
                        oJSONModel.setData(response.results);
                        this.getView().setModel(oJSONModel, 'ProcessDataModel')
                    }.bind(this),
                    error: function (oError) {
                        // Handle error
                        console.error("Error reading data: ", oError);
                    }
                })
            },

            onPatternMatched: function (oEvent) {
                var path = oEvent.getParameter("arguments").processPath;
                var dynamicPath = decodeURIComponent(path);
                var objectPageLayout = this.getView().byId('idObjectPageLayout')
                var smartTable = this.getView().byId('smartTable_steps')
                objectPageLayout.bindElement({
                    path: decodeURIComponent(path),
                });
                this.readData(dynamicPath); // Call readData with the dynamic path

                // smartTable.setTableBindingPath(decodeURIComponent(path));
                // smartTable.bindElement({
                // 	path: decodeURIComponent(path),
                // })
                // var processId = this.decodeProcessIdFromPath(decodeURIComponent(path));
                // smartTable.getTable().attachEventOnce("updateFinished", function () {
                // 	var oModel = this.getView().getModel();
                // 	var oBinding = smartTable.getTable().getBinding("items");

                // 	if (oBinding) {
                // 		// Create a filter for the ProcessId
                // 		var oFilter = new sap.ui.model.Filter("ProcessId", sap.ui.model.FilterOperator.EQ, processId);
                // 		// Apply the filter to the binding
                // 		oBinding.filter([oFilter]);
                // 	}
                // }, this);
            },

            // decodeProcessIdFromPath: function (oString) {
            // 	let match = oString.match(/guid'([^']+)'/);
            // 	if (match && match.length > 1) {
            // 		let extractedValue = match[1];
            // 		return (extractedValue);
            // 	} else {
            // 		console.log("No match found");
            // 	}
            // },

            //////////>>>>>>>>>>>>>>>>>>>>>>>>SECTION 1<<<<<<<<<<<<<<<<<<<<<<<<<<<<<///////

            handleDeleteButton: function (oEvent) {
                //alert('clicked')
                var oRouter = this.getOwnerComponent().getRouter();
                var oModel = this.getOwnerComponent().getModel();
                var sPath = this.getView().byId('idObjectPageLayout').getBindingContext().getPath()
                var sProcessName = this.getView().byId('idObjectPageLayout').getBindingContext().getObject().ProcessName

                // Confirm deletion with the user
                MessageBox.confirm(`Are you sure you want to delete ${sProcessName}?`, {
                    icon: MessageBox.Icon.WARNING,
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.NO,

                    //callback function when the MessageBox is closed
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            // User confirmed deletion
                            oModel.setUseBatch(false); // Disable batch processing for the OData model
                            oModel.remove(sPath, {
                                success: function () {
                                    // Deletion successful
                                    console.log("Item deleted successfully");
                                    oRouter.navTo('RouteView1')
                                },
                                error: function () {
                                    // Handle deletion error
                                    console.error("Error deleting item");
                                }
                            });

                        }
                    }
                });
            },

            handleEditButton: function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext().getPath();

                if (!this.oEditProcessDialog) {
                    this.loadFragment({
                        name: "metadata.fragments.editProcessDialog"
                    }).then(function (oDialog) {
                        this.oEditProcessDialog = oDialog;
                        this.oEditProcessDialog.bindElement({
                            path: sPath,
                        });
                        this.oEditProcessDialog.open();
                    }.bind(this));
                } else {
                    this.oEditProcessDialog.bindElement({
                        path: sPath,
                    });
                    this.oEditProcessDialog.open();
                }

            },

            handleDialogCancelButton: function () {
                this.oEditProcessDialog.close();
            },

            handleDialogEditButton: function (oEvent) {
                var oModel = this.getView().getModel(); // Assuming you have an ODataModel
                var sPath = oEvent.getSource().getBindingContext().getPath();
                var sProcessName = this.getView().byId("smartField_Process").getValue();
                var sAction = this.getView().byId("smartFilterBar_Action").getValue();
                //var sAction = this.getView().byId("smartFilterBar_Action").getFilterData().Action;

                // Prepare the data object to update
                var oData = {
                    ProcessName: sProcessName,
                    Action: sAction // Add other properties as needed
                };
                //console.log(oData)

                // Update the data in the OData service
                oModel.update(sPath, oData, {
                    success: function () {
                        console.log("Data updated successfully");
                    },
                    error: function (oError) {
                        console.error("Error updating data", oError);
                    }
                });

                // Close the dialog
                this.oEditProcessDialog.close();
            },

            onSelectStepRow: function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext().getPath();
                console.log(sPath)
                console.log(oEvent.getSource().getBindingContext())
            },

            ////////>>>>>>>>>>>>>>>>>>>>>>>>>>>>SECTION 2<<<<<<<<<<<<<<<<<<<<<<<<<<</////////

            handleStepRowSelection: function (oEvent) {
                //console.log('selected');
                var oTable = this.getView().byId('table_steps');
                var oDeleteButton = this.getView().byId("deleteStepButton")
                var aSelectedItems = oTable.getSelectedItems(); // Get selected items
                oDeleteButton.setEnabled(aSelectedItems.length > 0); // Enable the Delete button if at least one row is selected, otherwise disable it
            },

            handleDeleteStepButton: function () {
                var oModel = this.getView().byId('smartTable_steps').getModel();
                var oTable = this.getView().byId('table_steps');

                var aSelectedItems = oTable.getSelectedItems(); // Get selected items

                // Check if any items are selected
                if (aSelectedItems.length === 0) {
                    // No items selected, show an error or inform the user
                    MessageBox.error("No Items Selected");
                    return;
                }

                // Confirm deletion with the user
                MessageBox.confirm("Are you sure you want to delete the selected steps?", {
                    icon: MessageBox.Icon.WARNING,
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.NO,
                    //CALLBACK FUNCTION WHICH GETS EXECUTED WHEN THE MESSGE BOX IS CLOSED
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            // User confirmed deletion
                            oModel.setUseBatch(false);

                            // Iterate through selected items and delete them
                            aSelectedItems.forEach(function (oSelectedItem) {
                                var sPath = oSelectedItem.getBindingContext().getPath();
                                oModel.remove(sPath, {
                                    success: function () {
                                        // Deletion successful, you may want to perform additional tasks
                                        console.log("Item deleted successfully");
                                    },
                                    error: function () {
                                        // Handle deletion error
                                        console.error("Error deleting item");
                                    }
                                });
                            });
                            // Deselect all items after deletion
                            oTable.removeSelections();
                        }
                    }
                });
            },

            handleCreateStepButton: function () {
                if (!this.oDialog) {
                    this.loadFragment({
                        name: "metadata.fragments.newStepDialog"
                    }).then(function (oDialog) {
                        this.oDialog = oDialog;
                        this.oDialog.open();
                    }.bind(this));
                } else {
                    this.oDialog.open();
                }
            },

            handleDialogStepCancelButton: function () {
                this.oDialog.close();
            },

            handleDialogStepCreateButton: function (oEvent) {
                var oModel = this.getView().getModel();
                var sPath = this.dynamicPath
                var stepName = this.getView().byId("newStep_name").getValue();
                // var stepType = this.getView().byId("newStep_type").getValue();
                var stepType = this.getView().byId("newStep_type").getSelectedItem().getText();

                // Create a new entry with action
                var oNewStep = {
                    StepName: stepName,
                    StepType: stepType
                };
                console.log(oNewStep);

                //Creating new Process in the Model
                oModel.create(sPath, oNewStep, {
                    success: function (response) {
                        console.log(response)
                    },
                    error: function (error) {
                        alert('error')
                    }
                });

                this.handleDialogStepCancelButton(); // Close the dialog
            },

            // onStepTypeValueHelp: function (oEvent) {
            //     if (!this._valueHelpDialog) {
            //         this._valueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
            //             title: "Step Type",
            //             supportMultiselect: false,
            //             key: "StepType", // the key of the selected item
            //             descriptionKey: "StepType", // the description of the selected item
            //             ok: function (oControlEvent) {
            //                 // Handle selection, e.g., update the input field
            //                 var aTokens = oControlEvent.getParameter("tokens");
            //                 if (aTokens.length > 0) {
            //                     var oSelectedToken = aTokens[0];
            //                     var sSelectedStepType = oSelectedToken.getKey();
            //                     this.getView().byId("newStep_type").setValue(sSelectedStepType);
            //                 }
            //                 oControlEvent.getSource().close();
            //             }.bind(this),
            //             cancel: function (oControlEvent) {
            //                 // Handle cancel
            //                 oControlEvent.getSource().close();
            //             },
            //             afterClose: function () {
            //                 this._valueHelpDialog.destroy();
            //                 this._valueHelpDialog = null;
            //             }
            //         });

            //         // Bind the items from your OData service entity set
            //         this._valueHelpDialog.getTableAsync().then(function (oTable) {
            //             oTable.setModel(this.getOwnerComponent().getModel()); // Use the same model as your main view
            //             oTable.bindAggregation("items", {
            //                 path: "ZQU_DG_STEPTYPE_VH",
            //                 template: new sap.m.ColumnListItem({
            //                     cells: [
            //                         new sap.m.Text({ text: "{StepType}" })
            //                     ]
            //                 })
            //             });
            //         }.bind(this));
            //     }

            //     this._valueHelpDialog.open();
            // }


        });
    });