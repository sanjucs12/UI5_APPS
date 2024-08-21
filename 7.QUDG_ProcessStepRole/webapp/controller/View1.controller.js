sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, MessageToast) {
        "use strict";

        return Controller.extend("metadata.controller.View1", {
            onInit: function () {
            },

            handleDeleteProcessButton: function () {
                var oModel = this.getView().byId('smartTable_process').getModel();
                var oTable = this.getView().byId('table_process');

                // Get selected items
                var aSelectedItems = oTable.getSelectedItems();
                var sProcessName = aSelectedItems[0].getBindingContext().getObject().ProcessName

                // // Check if any items are selected
                // if (aSelectedItems.length === 0) {
                //     // No items selected, show an error or inform the user
                //     MessageBox.error("Please select at least one item to delete");
                //     return;
                // }

                // Confirm deletion with the user
                MessageBox.confirm(`Are you sure you want to delete ${sProcessName}?`, {
                    icon: MessageBox.Icon.WARNING,
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    //CALLBACK FUNCTION WHICH GETS EXECUTED WHEN THE MESSGE BOX IS CLOSED
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            //oModel.setUseBatch(false);

                            // Iterate through selected items and delete them
                            aSelectedItems.forEach(function (oSelectedItem) {
                                var sPath = oSelectedItem.getBindingContext().getPath();
                                oModel.remove(sPath, {
                                    success: function (oResponse) {
                                        //console.log("Item deleted successfully");
                                        MessageToast.show('Process Deleted');
                                        oTable.removeSelections(); // Deselect all items after deletion
                                    },
                                    error: function (oError) {
                                        //console.error("Error deleting item");
                                        MessageToast.show('SOMETHING WENT WRONG')
                                    }
                                });
                            });

                        }
                    }
                });
            },

            handleCreateProcessButton: function () {
                if (!this.oCreateProcessDialog) {
                    this.loadFragment({
                        name: "metadata.fragments.createProcessDialog"
                    }).then(function (oDialog) {
                        this.oCreateProcessDialog = oDialog;
                        this.oCreateProcessDialog.open();
                    }.bind(this));
                } else {
                    this.oCreateProcessDialog.open();
                }
            },

            handleCreateProcessDialog_CancelButton: function () {
                this.oCreateProcessDialog.close();
            },

            handleCreateProcessDialog_CreateButton: function () {
                var oModel = this.getView().getModel();

                var sProcessName = this.getView().byId("smartField_newProcessName").getValue();;
                var sAction = this.getView().byId("smartField_newAction").getValue();
                var sMaster = this.getView().byId("smartField_newMaster").getValue();

                /////_____VALIDATIONS_______/////
                var oSmartField_ProcessName = this.getView().byId("smartField_newProcessName");
                var oSmartField_Action = this.getView().byId("smartField_newAction");
                var oSmartField_Master = this.getView().byId("smartField_newMaster");
                let aSmartFields = [oSmartField_ProcessName, oSmartField_Action, oSmartField_Master]

                aSmartFields.forEach((field) => {
                    if (!field.getValue()) {
                        field.setValueState("Error");
                        return;
                    }
                })

                var bFormValidate = aSmartFields.every((field) => {
                    return field.getValue()
                })

                if (bFormValidate) {
                    // Create a new entry with action
                    var oNewProcess = {
                        ProcessName: sProcessName,
                        Action: sAction,
                        Master: sMaster
                    };

                    //console.log(oNewProcess);

                    // Creating new Process in the Model
                    oModel.create("/ZP_QU_DG_PROC_STEP_ROLE", oNewProcess, {
                        success: function (oResponse) {
                            //console.log(response);
                            this.oCreateProcessDialog.close(); // Close the dialog
                            MessageToast.show('Process Created')
                        }.bind(this),
                        error: function (oError) {
                            //console.log(error)
                            MessageToast.show('SOMETHING WENT WRONG')
                        }
                    });
                }


            },

            handleInputChange: function (oEvent) {
                //console.log('changed')
                var sValue = oEvent.getParameters().value;
                if (sValue.length) {
                    oEvent.getSource().setValueState('None')
                }
            },

            handleProcessTable_RowSelection: function () {
                //console.log('selected');
                var oTable = this.getView().byId('table_process');
                var oDeleteProcessButton = this.getView().byId("deleteProcessButton")
                var aSelectedItems = oTable.getSelectedItems(); // Get selected items
                oDeleteProcessButton.setEnabled(aSelectedItems.length > 0); // Enable the Delete button if at least one row is selected, otherwise disable it
            },

            handleProcessTable_RowClick: function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext().getPath()
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo('RouteView2', {
                    'processPath': encodeURIComponent(sPath)
                })
            },
            onNavigateToAnotherApp: function (oEvent) {
                debugger;
                // var oRouter = this.getOwnerComponent().getRouter();
                // oRouter.navTo('RouteViewDummy')

                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                oCrossAppNavigator.toExternal({
                    target: {
                        semanticObject: "YourListReportObject",
                        action: "display"
                    },
                    params: {
                        "parameterName": "parameterValue"
                    }
                });
            }
        });
    });
