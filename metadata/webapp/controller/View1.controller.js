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
                if (!this.oDialog) {
                    this.loadFragment({
                        name: "metadata.fragments.newProcessDialog"
                    }).then(function (oDialog) {
                        this.oDialog = oDialog;
                        this.oDialog.open();
                    }.bind(this));
                } else {
                    this.oDialog.open();
                }

            },

            handleDialogCancelButton: function () {
                this.oDialog.close();
            },

            handleDialogCreateButton: function () {
                var oModel = this.getView().getModel();
                var oSmartField = this.getView().byId("smartField_Process");
                var oSmartFilterBar = this.getView().byId("smartFilterBar_Action");

                // Get values from SmartField
                var sProcessName = oSmartField.getValue();
                var sAction = oSmartFilterBar.getFilterData().Action;

                // Create a new entry with action
                var oNewProcess = {
                    ProcessName: sProcessName,
                    Action: sAction
                };
                //console.log(oNewEntry);

                // Creating new Process in the Model
                oModel.create("/ZP_QU_DG_PROC_STEP_ROLE", oNewProcess, {
                    success: this.onSuccessInAddingNewProcess,
                    error: this.onErrorInAddingNewProcess
                });
                // Close the dialog
                this.handleDialogCancelButton();
            },

            onSuccessInAddingNewProcess: function (oEvent) {
                // console.log(oEvent)
            },

            onSelectProcess: function (oEvent) {
                var oContext = oEvent.getSource().getBindingContext().getPath()
                // 	//var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo('RouteView2', {
                    'processPath': encodeURIComponent(oContext)
                })
            }
        });
    });
