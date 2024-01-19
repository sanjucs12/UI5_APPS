sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox) {
        "use strict";

        return Controller.extend("metadata.controller.View2", {
            onInit: function () {
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteView2").attachPatternMatched(this.onPatternMatched, this);
            },

            onPatternMatched: function (oEvent) {
                var encodedPath = oEvent.getParameter("arguments").processPath;
                var objectPageLayout = this.getView().byId('idObjectPageLayout')
                var smartTableSteps = this.getView().byId("smartTable_steps")
                var smartTableRoles = this.getView().byId("smartTable_roles")
                var processPath = decodeURIComponent(encodedPath);

                this.processPath = processPath
                this.getProcessData(processPath); // Call readData with the processPath (GET REQUEST)
                this.createStepPath = `${processPath}/to_ProcesstoRole`;  //(POST REQUEST PATH TO CREATE NEW STEP FOR A PARTICULAR PROCESS)
                this.createRolePath = `${processPath}/to_proctosteprole`;  //(POST REQUEST PATH TO CREATE NEW ROLE FOR A PARTICULAR STEP)
                //console.log(this.createStepPath)
                smartTableSteps.rebindTable();
                smartTableRoles.rebindTable();
                objectPageLayout.bindElement({
                    path: decodeURIComponent(encodedPath),
                });
            },

            getProcessData: function (url) {
                var oModel = this.getOwnerComponent().getModel();
                var sPath = `${url}/to_ProcesstoRole`; // Defining the path for specific request                
                console.log(sPath)
                oModel.read(sPath, {
                    success: function (response) {
                        console.log("Data Read Successfully: ", response.results);
                    }.bind(this),
                    error: function (oError) {
                        // Handle error
                        console.error("Error reading data: ", oError);
                    }
                })
            },

            onBeforeRebindStepsTable: function (oEvent) {
                //console.log("Rebind table")
                var oFilter = new sap.ui.model.Filter({
                    path: "ProcessId",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: this.decodeProcessIdFromPath(this.processPath)
                });
                oEvent.getParameter("bindingParams").filters.push(oFilter);
            },

            decodeProcessIdFromPath: function (oString) {
                let match = oString.match(/guid'([^']+)'/);
                if (match && match.length > 1) {
                    let extractedValue = match[1];
                    return (extractedValue);
                } else {
                    console.log("No match found");
                }
            },

            /////>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>SECTION 1<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<///////

            handleDeleteProcessButton: function (oEvent) {
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

            handleEditProcessButton: function (oEvent) {
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

            handle_editProcessDialog_CancelButton: function () {
                this.oEditProcessDialog.close();
            },

            handle_editProcessDialog_EditButton: function (oEvent) {
                var oModel = this.getOwnerComponent().getModel() //GET THE MODEL INSTANCE
                var sPath = oEvent.getSource().getBindingContext().getPath();
                var sProcessName = this.getView().byId("smartField_editProcessName").getValue();
                var that = this;

                // DATA OBJECT TO UPDATE
                var oEditedProcessDetails = {
                    ProcessName: sProcessName,
                };
                //console.log(oEditedProcessDetails)

                // Update the data in the OData service
                oModel.update(sPath, oEditedProcessDetails, {
                    success: function () {
                        console.log("Data updated successfully");
                        that.oEditProcessDialog.close(); // Close the dialog
                    },
                    error: function (oError) {
                        console.error("Error updating data", oError);
                    }
                });             
                
            },

            /////>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>SECTION 2<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<///////

            handleStepRowClick: function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext().getPath();
                console.log(sPath)

                // if (!this.oStepDetailsDialog) {
                //     this.loadFragment({
                //         name: "metadata.fragments.stepDetailsDialog"
                //     }).then(function (oDialog) {
                //         this.oStepDetailsDialog = oDialog;
                //         this.oStepDetailsDialog.bindElement({
                //             path: sPath,
                //         });
                //         this.oStepDetailsDialog.open();
                //     }.bind(this));
                // } else {
                //     this.oStepDetailsDialog.bindElement({
                //         path: sPath,
                //     });
                //     this.oStepDetailsDialog.open();
                // }
            },

            handleStepRowSelection: function (oEvent) {
                //console.log('selected');
                var oTable = this.getView().byId('table_steps');
                var oDeleteStepButton = this.getView().byId("deleteStepButton")
                var oEditStepButton = this.getView().byId("editStepButton")
                //var oAssaignRoleButton = this.getView().byId("assaignRoleButton")
                var aSelectedItems = oTable.getSelectedItems(); // Get selected items
                oDeleteStepButton.setEnabled(aSelectedItems.length > 0); // Enable the Delete button if at least one row is selected, otherwise disable it
                oEditStepButton.setEnabled(aSelectedItems.length > 0); // Enable the Delete button if at least one row is selected, otherwise disable it
                //oAssaignRoleButton.setEnabled(aSelectedItems.length > 0); // Enable the Delete button if at least one row is selected, otherwise disable it
            },

            handleDeleteStepButton: function () {
                var oModel = this.getOwnerComponent().getModel();
                var oTable = this.getView().byId('table_steps');
                var aSelectedItems = oTable.getSelectedItems(); // Get selected items

                var that = this; //SAVING THE CONTEXT OF THIS IN A VARIABLE

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
                                        oTable.removeSelections();   // Deselect all items after deletion
                                        that.getView().byId("deleteStepButton").setEnabled(false); //DISABLING BACK THE DELETE BUTTON 
                                        that.getView().byId("editStepButton").setEnabled(false);
                                    },
                                    error: function () {
                                        // Handle deletion error
                                        console.error("Error deleting item");
                                    }
                                });
                            });
                        }
                    }
                });
            },

            handleCreateStepButton: function (oEvent) {
                //console.log(oModel)
                if (!this.oCreateStepDialog) {
                    this.loadFragment({
                        name: "metadata.fragments.createStepDialog"
                    }).then(function (oDialog) {
                        this.oCreateStepDialog = oDialog;
                        this.oCreateStepDialog.open();
                    }.bind(this));
                } else {
                    this.oCreateStepDialog.open();
                }
            },

            handle_createStepDialog_CancelButton: function () {
                this.oCreateStepDialog.close();
            },

            handle_createStepDialog_CreateButton: function (oEvent) {
                var oModel = this.getView().getModel();
                var sPath = this.createStepPath;
                var stepName = this.getView().byId("smartField_newStepName").getValue();
                var stepType = this.getView().byId("smartField_newStepType").getValue();

                var that = this; //SAVING THIS CONTEXT IN A VARIABLE

                // Create a new entry with action
                var oNewStep = {
                    StepName: stepName,
                    StepType: stepType
                };
                //console.log(oNewStep);

                //Creating new Process in the Model
                oModel.create(sPath, oNewStep, {
                    success: function (response) {
                        console.log(response);
                        that.oCreateStepDialog.close();
                    },
                    error: function (error) {
                        alert('error')
                    }
                });
            },

            handleEditStepButton: function (oEvent) {
                var oTable = this.getView().byId('table_steps');
                var aSelectedItems = oTable.getSelectedItems(); // Get selected items
                var sPath = aSelectedItems[0].getBindingContext().getPath()
                //console.log(sPath)

                if (!this.oEditStepDialog) {
                    this.loadFragment({
                        name: "metadata.fragments.editStepDialog"
                    }).then(function (oDialog) {
                        this.oEditStepDialog = oDialog;
                        this.oEditStepDialog.bindElement({
                            path: sPath,
                        });
                        this.oEditStepDialog.open();
                    }.bind(this));
                } else {
                    this.oEditStepDialog.bindElement({
                        path: sPath,
                    });
                    this.oEditStepDialog.open();
                }
            },

            handle_editStepDialog_cancelButton: function () {
                this.oEditStepDialog.close();
            },

            handle_editStepDialog_saveButton: function (oEvent) {
                var oModel = this.getOwnerComponent().getModel();
                var sPath = oEvent.getSource().getBindingContext().getPath()
                var sEditedStepName = this.getView().byId("smartField_editStepName").getValue();
                var sEditedStepType = this.getView().byId("smartField_editStepType").getValue();

                var that = this;  //SAVING THE THIS CONTEXT IN A VARIABLE

                // Creating a new Object
                var oNewEditedStep = {
                    StepName: sEditedStepName,
                    StepType: sEditedStepType
                };
                console.log(oNewEditedStep);

                //Updating in the Model
                oModel.update(sPath, oNewEditedStep, {
                    success: function (response) {
                        console.log(`EDITED: ${response}`);
                        that.oEditStepDialog.close();  //CLOSING THE DIALOG
                        that.getView().byId("deleteStepButton").setEnabled(false); //DISABLING BACK THE DELETE BUTTON 
                        that.getView().byId("editStepButton").setEnabled(false);   //DISABLING BACK THE EDIT BUTTON                      
                    },
                    error: function (error) {
                        alert('error')
                    }
                });
            },

            handleAssaignRoleButton: function () {
                var oTable = this.getView().byId('table_steps');
                var aSelectedItems = oTable.getSelectedItems(); // Get selected items
                var sPath = aSelectedItems[0].getBindingContext().getPath()
                //console.log(sPath)

                if (!this.oCreateRoleDialog) {
                    this.loadFragment({
                        name: "metadata.fragments.createRoleDialog"
                    }).then(function (oDialog) {
                        this.oCreateRoleDialog = oDialog;
                        // this.oCreateRoleDialog.bindElement({
                        //     path: sPath,
                        // });
                        this.oCreateRoleDialog.open();
                    }.bind(this));
                } else {
                    // this.oCreateRoleDialog.bindElement({
                    //     path: sPath,
                    // });
                    this.oCreateRoleDialog.open();
                }
            },



            /////>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>SECTION 3<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<///////
            onBeforeRebindRolesTable: function (oEvent) {
                var oFilter = new sap.ui.model.Filter({
                    path: "ProcessId",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: this.decodeProcessIdFromPath(this.processPath)
                });
                oEvent.getParameter("bindingParams").filters.push(oFilter);
            },

            handleCreateRoleButton: function () {
                if (!this.oCreateRoleDialog) {
                    this.loadFragment({
                        name: "metadata.fragments.createRoleDialog"
                    }).then(function (oDialog) {
                        this.oCreateRoleDialog = oDialog;
                        this.oCreateRoleDialog.open();
                    }.bind(this));
                } else {
                    this.oCreateRoleDialog.open();
                }
            },

            handle_createRoleDialog_assaignButton: function () {
                var oModel = this.getView().getModel();
                var sPath = this.createRolePath;
                var sRoleName = this.getView().byId("smartField_assaignRoleName").getValue();
                var sStepName = this.getView().byId("smartField_assaignStepName").getValue();
                // console.log(sPath)
                // console.log(sRoleName);

                //Create a new entry
                var oNewRole = {
                    AssignedRole: sRoleName,
                    StepName: sStepName
                };
                //console.log(oNewRole);

                //Creating new Process in the Model
                oModel.create(sPath, oNewRole, {
                    success: function (response) {
                        console.log(response);
                    },
                    error: function (error) {
                        alert('error')
                    }
                });
                this.oCreateRoleDialog.close();
            },

            handle_createRoleDialog_cancelButton: function () {
                this.oCreateRoleDialog.close();
            },

            handle_RolesTable_RowSelection: function () {
                var oTable = this.getView().byId('table_roles');
                var oDeleteStepButton = this.getView().byId("deleteRoleButton")
                var aSelectedItems = oTable.getSelectedItems(); // Get selected items

                oDeleteStepButton.setEnabled(aSelectedItems.length > 0); // Enable the Delete button if at least one row is selected, otherwise disable it
            },

            handleDeleteRoleButton: function () {
                var oModel = this.getOwnerComponent().getModel();
                var oTable = this.getView().byId('table_roles');
                var oDeleteStepButton = this.getView().byId("deleteRoleButton")

                var aSelectedItems = oTable.getSelectedItems(); // Get selected items

                // Check if any items are selected
                if (aSelectedItems.length === 0) {
                    // No items selected, show an error or inform the user
                    MessageBox.error("No Items Selected");
                    return;
                }

                // Confirm deletion with the user
                MessageBox.confirm("Are you sure you want to delete the selected Role?", {
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
                                        oTable.removeSelections();  // Deselect all items after deletion
                                        oDeleteStepButton.setEnabled(false)  //Disable the delete button
                                    },
                                    error: function () {
                                        // Handle deletion error
                                        console.error("Error deleting item");
                                    }
                                });
                            });

                        }
                    }
                });
            },

            handle_RolesTable_RowClick: function () { },
        });
    });