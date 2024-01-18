sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox) {
        "use strict";

        return Controller.extend("metadata.controller.View1", {
            onInit: function () {
            },

            handleDeleteProcessButton: function () {
                var oModel = this.getView().byId('smartTable_process').getModel();
                var oTable = this.getView().byId('table_process');

                // Get selected items
                var aSelectedItems = oTable.getSelectedItems();

                // Check if any items are selected
                if (aSelectedItems.length === 0) {
                    // No items selected, show an error or inform the user
                    MessageBox.error("Please select at least one item to delete");
                    return;
                }

                // Confirm deletion with the user
                MessageBox.confirm("Are you sure you want to delete the selected item(s)?", {
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

            handleDialogCancelButton: function () {
                this.oCreateProcessDialog.close();
            },

            handleDialogCreateButton: function () {
                var oModel = this.getView().getModel();
                var sProcessName = this.getView().byId("smartField_newProcessName").getValue();;
                var sAction = this.getView().byId("smartField_newAction").getValue();

                // Create a new entry with action
                var oNewProcess = {
                    ProcessName: sProcessName,
                    Action: sAction
                };
                //console.log(oNewProcess);

                // Creating new Process in the Model
                oModel.create("/ZP_QU_DG_PROC_STEP_ROLE", oNewProcess, {
                    success: function (response) {
                        console.log(`SUCCESS : ${response}`)
                    },
                    error: function (error) {
                        console.log(`ERROR : ${error}`)
                    }
                });                
                this.oCreateProcessDialog.close(); // Close the dialog
            },

            handleProcessRowSelection: function () {
                //console.log('selected');
                var oTable = this.getView().byId('table_process');
                var oDeleteProcessButton = this.getView().byId("deleteProcessButton")
                var aSelectedItems = oTable.getSelectedItems(); // Get selected items
                oDeleteProcessButton.setEnabled(aSelectedItems.length > 0); // Enable the Delete button if at least one row is selected, otherwise disable it
            },

            handleProcessRowClick: function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext().getPath()
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo('RouteView2', {
                    'processPath': encodeURIComponent(sPath)
                })
            }
        });
    });
