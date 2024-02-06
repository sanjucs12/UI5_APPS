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

        return Controller.extend("metadata.controller.View2", {
            onInit: function () {
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteView2").attachPatternMatched(this.onPatternMatched, this);

                //CREATING A MODEL TO TOGGLE STEP GRAPH AND STEP TABLE
                var oToggleGraphTableModel = new sap.ui.model.json.JSONModel({
                    table: false,
                    graph: true,
                });
                this.getView().setModel(oToggleGraphTableModel, "toggleGraphTable");
            },

            onPatternMatched: function (oEvent) {
                var sEncodedPath = oEvent.getParameter("arguments").processPath;
                var oObjectPageLayout = this.getView().byId('idObjectPageLayout')
                var oSmartTable_Steps = this.getView().byId("smartTable_steps")
                var oSmartTable_Roles = this.getView().byId("smartTable_roles")
                var oSmartTable_Users = this.getView().byId("smartTable_users")
                var sProcessPath = decodeURIComponent(sEncodedPath);

                this.processPath = sProcessPath

                this.createGraphPath = `${sProcessPath}/to_ProcesstoRole`;  //(THE DATA COMMING FROM THIS REQUEST IS USED TO CREATE THE NETWORK GRAPH)
                this.createStepPath = `${sProcessPath}/to_ProcesstoRole`;  //(POST REQUEST PATH TO CREATE NEW STEP FOR A PARTICULAR PROCESS)
                this.createRolePath = `${sProcessPath}/to_proctosteprole`;  //(POST REQUEST PATH TO CREATE NEW ROLE FOR A PARTICULAR STEP)
                this.getProcessData(); // Call readData_ MAINLY FOR CREATING A NETWORK GRAPH (GET REQUEST)
                console.log(this.createStepPath)
                oObjectPageLayout.bindElement({
                    path: decodeURIComponent(sEncodedPath),
                });
                oSmartTable_Steps.rebindTable();

                //IF JSONModel_SelectedStepData and JSONModel_SelectedRoleData is already present, reset the values to empty string and rebind the related tables to empty values

                var oModel_Step = this.getView().getModel("JSONModel_SelectedStepData")
                var oModel_Role = this.getView().getModel("JSONModel_SelectedRoleData")
                //console.log(oModel_Step.getData());
                //console.log(oModel_Role.getData());

                if (oModel_Step) {
                    var oDataObject = oModel_Step.getData()
                    Object.keys(oDataObject).forEach(function (index) {
                        oDataObject[index] = ''
                    });
                    //console.log(oModel_Step.getData())            
                    oSmartTable_Roles.rebindTable();
                }
                if (oModel_Role) {
                    var oDataObject = oModel_Role.getData()
                    Object.keys(oDataObject).forEach(function (index) {
                        oDataObject[index] = ''
                    });
                    //console.log(oModel_Role.getData())  
                    oSmartTable_Users.rebindTable();
                }

                ///IF THE MODEL  "toggleGraphTable" IS ALREADY PRESENT, MAKE GRAPH AS DEFAULT VIEW
                var oModel_taggleGraphTable = this.getView().getModel("toggleGraphTable");
                if(oModel_taggleGraphTable){
                    oModel_taggleGraphTable.setData({
                        table: false,
                        graph: true,
                    })
                }
            },

            getProcessData: function () {
                var oModel = this.getOwnerComponent().getModel();
                //var sPath = `${url}/to_ProcesstoRole`; // Defining the path for specific request  
                var sPath = this.createGraphPath;
                //console.log(sPath)
                oModel.read(sPath, {
                    success: function (response) {
                        //console.log("Data Read Successfully: ", response.results);
                        this._createNetworkGraph(response.results);
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

            /////>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>__________SECTION 1____________<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<///////

            handleDeleteProcessButton: function () {
                //alert('clicked')
                var oRouter = this.getOwnerComponent().getRouter();
                var oModel = this.getOwnerComponent().getModel();
                var sPath = this.getView().byId('idObjectPageLayout').getBindingContext().getPath()
                var sProcessName = this.getView().byId('idObjectPageLayout').getBindingContext().getObject().ProcessName

                // Confirm deletion with the user
                MessageBox.confirm(`Are you sure you want to delete ${sProcessName}?`, {
                    icon: MessageBox.Icon.WARNING,
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,

                    //callback function when the MessageBox is closed
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            // User confirmed deletion
                            //oModel.setUseBatch(false); // Disable batch processing for the OData model
                            oModel.remove(sPath, {
                                success: function (oResponse) {
                                    //console.log("Item deleted successfully"); 
                                    MessageToast.show("Process Deleted")
                                    oRouter.navTo('RouteView1')
                                },
                                error: function (oError) {
                                    // Handle deletion error
                                    //console.error("Error deleting item");
                                    MessageToast.show("Error: Something went Wrong")
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
                    success: function (oResponse) {
                        //console.log("Data updated successfully");
                        MessageToast.show("Process details updated")
                        that.oEditProcessDialog.close(); // Close the dialog
                    },
                    error: function (oError) {
                        //console.error("Error updating data", oError);
                        MessageToast.show("Error: Somenthing went wrong")
                    }
                });

            },

            // handleGetProcessDetailsButton: function () {
            //     this.getProcessData(this.processPath)
            // },

            /////>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>____________SECTION 2_______________<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<///////

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

            handleStepRowSelection: function () {
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

                // // Check if any items are selected
                // if (aSelectedItems.length === 0) {
                //     // No items selected, show an error or inform the user
                //     MessageBox.error("No Items Selected");
                //     return;
                // }

                // Confirm deletion with the user
                MessageBox.confirm("Are you sure you want to delete the selected steps?", {
                    icon: MessageBox.Icon.WARNING,
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    //CALLBACK FUNCTION WHICH GETS EXECUTED WHEN THE MESSGE BOX IS CLOSED
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            // Iterate through selected items and delete them
                            aSelectedItems.forEach(function (oSelectedItem) {
                                var sPath = oSelectedItem.getBindingContext().getPath();
                                oModel.remove(sPath, {
                                    success: function (oResponse) {
                                        //console.log("Item deleted successfully");
                                        MessageToast.show('Item deleted successfully')
                                        oTable.removeSelections();   // Deselect all items after deletion
                                        that.getView().byId("deleteStepButton").setEnabled(false); //DISABLING BACK THE DELETE BUTTON 
                                        that.getView().byId("editStepButton").setEnabled(false);
                                        that.getProcessData()  //UPDATING THE GRAPH
                                    },
                                    error: function (oError) {
                                        //console.error("Error deleting item");
                                        MessageToast.show('Error: Something went wrong')
                                    }
                                });
                            });
                        }
                    }
                });
            },

            handleCreateStepButton: function () {
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

            handle_createStepDialog_CreateButton: function () {
                var oModel = this.getView().getModel();
                var sPath = this.createStepPath;
                // var sStepName = this.getView().byId("smartField_newStepName").getValue();
                // var sStepType = this.getView().byId("smartField_newStepType").getValue();
                // var sStepSequence = this.getView().byId("smartField_newStepSequence").getValue();

                /////_____VALIDATIONS_______/////
                var oSmartField_stepName = this.getView().byId("smartField_newStepName");
                var oSmartField_stepType = this.getView().byId("smartField_newStepType");
                var oSmartField_stepSequence = this.getView().byId("smartField_newStepSequence");
                let aSmartFields = [oSmartField_stepName, oSmartField_stepType, oSmartField_stepSequence]

                aSmartFields.forEach((field) => {
                    if (!field.getValue()) {
                        field.setValueState("Error");
                        return;
                    }
                })

                var bFormValidation = aSmartFields.every((field) => {
                    return field.getValue();
                });
                //console.log(bFormValidation)


                if (bFormValidation) {
                    // Create a new entry with action
                    var oNewStep = {
                        StepName: oSmartField_stepName.getValue(),
                        StepType: oSmartField_stepType.getValue(),
                        StepSequence: oSmartField_stepSequence.getValue()
                    };
                    //console.log(oNewStep);

                    //Creating new Process in the Model
                    oModel.create(sPath, oNewStep, {
                        success: function (oResponse) {
                            //console.log(response);
                            MessageToast.show(`New Step added: ${oNewStep.StepName}`)
                            this.oCreateStepDialog.close();
                            this.getProcessData();  //MAKING A GET CALL WILL UPDATE THE GRAPH
                        }.bind(this),
                        error: function (oError) {
                            MessageToast.show('Error: Something went wrong')
                            //alert('error')
                        }
                    });

                }
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

                /////_____VALIDATIONS_______/////
                var oSmartField_EditedStepName = this.getView().byId("smartField_editStepName");
                var oSmartField_EditedStepType = this.getView().byId("smartField_editStepType")
                let aSmartFields = [oSmartField_EditedStepName, oSmartField_EditedStepType]

                aSmartFields.forEach((field) => {
                    if (!field.getValue()) {
                        field.setValueState("Error");
                        return;
                    }
                })

                var bFormValidation = aSmartFields.every((field) => {
                    return field.getValue();
                });
                //console.log(bFormValidation)

                if (bFormValidation) {
                    // Creating a new Object
                    var oNewEditedStep = {
                        StepName: sEditedStepName,
                        StepType: sEditedStepType
                    };
                    //console.log(oNewEditedStep);

                    //Updating in the Model
                    oModel.update(sPath, oNewEditedStep, {
                        success: function (response) {
                            //console.log(`EDITED: ${response}`);
                            MessageToast.show("Step details updated")
                            this.oEditStepDialog.close();  //CLOSING THE DIALOG
                            this.getView().byId("deleteStepButton").setEnabled(false); //DISABLING BACK THE DELETE BUTTON 
                            this.getView().byId("editStepButton").setEnabled(false);   //DISABLING BACK THE EDIT BUTTON 
                            this.getProcessData(); //UPDATE THE GRAPH                     
                        }.bind(this),
                        error: function (oError) {
                            // alert('error')
                            MessageToast.show("Error: Something went wrong")
                        }
                    });

                }
            },

            handleAssaignRoleButton: function () {
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

            /////////////>>>>>>>>>>>>>>>>>>>___________NETWORK GRAPH__________<<<<<<<<<<<<<<<<<<<<<<////////////////////////////////
            _createNetworkGraph: function (data) {
                let nodes = data.map(step => ({ ...step }));
                let lines = [];

                //OLD LOGIC
                // const firstNode = nodes[0];
                // const lastNode = nodes[nodes.length - 1];              
                // if (data.length <= 2) {
                //     lines.push({ from: firstNode.StepId, to: lastNode.StepId });
                // } else {
                //     for (let i = 1; i < nodes.length - 1; i++) {
                //         lines.push({ from: firstNode.StepId, to: nodes[i].StepId });
                //         lines.push({ from: nodes[i].StepId, to: lastNode.StepId });
                //     }
                // }

                for (let i = 0; i < data.length; i++) {
                    let child = data[i].StepSequence
                    let parentArray = []
                    for (let j = 0; j < data.length; j++) {
                        if (data[j].StepSequence == child - 1) {
                            parentArray.push(data[j])
                        }
                    }
                    //console.log("child = ", data[i].StepId, parentArray)
                    for (let k = 0; k < parentArray.length; k++) {
                        lines.push({ from: parentArray[k].StepId, to: data[i].StepId })
                    }
                }

                //console.log(lines);

                // Create final result object
                const oGraphData = {
                    nodes,
                    lines,
                };
                //console.log(oGraphData)
                var oNetworkModel = new sap.ui.model.json.JSONModel(oGraphData);
                //console.log(oNetworkModel.getData())
                this.getView().byId("networkGraph").setModel(oNetworkModel)
            },

            handleNodeClick: function (oEvent) {
                var oSmartTable_roles = this.getView().byId('smartTable_roles')
                var oSmartTable_users = this.getView().byId('smartTable_users')
                var oAssaignRoleButton = this.getView().byId('assaignRoleButton')
                oAssaignRoleButton.setEnabled(true);

                //IF JSONModel_SelectedRoleData is already present, reset the role to empty string because it has the data of previously selected node
                var oModel_SelectedRole = this.getView().getModel('JSONModel_SelectedRoleData');
                if (oModel_SelectedRole) {
                    var oDataObject = oModel_SelectedRole.getData()
                    Object.keys(oDataObject).forEach(function (index) {
                        oDataObject[index] = ''
                    });
                    oSmartTable_users.rebindTable()
                }
                //console.log(oEvent.getSource())
                var oClickedNodeData = oEvent.getSource().getBindingContext().getObject()
                //console.log(oClickedNodeData)

                var oSelectedNodeModel = new sap.ui.model.json.JSONModel(oClickedNodeData);
                this.getView().setModel(oSelectedNodeModel, "JSONModel_SelectedStepData")
                oSmartTable_roles.rebindTable()   //BINDING ROLES TO ROLES TABLE : THIS WILL BIND ONLY ROLES RELATED TO StepId
            },

            /////>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>___________SECTION 3_____________<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<///////
            onBeforeRebindRolesTable: function (oEvent) {
                var oModel = this.getView().getModel("JSONModel_SelectedStepData")
                var sStepId = oModel.getData().StepId;
                //console.log(sStepId);

                //ADDING TWO FILTERS i.e., ProcessId and StepId
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter({
                            path: 'ProcessId',
                            operator: sap.ui.model.FilterOperator.EQ,
                            value1: this.decodeProcessIdFromPath(this.processPath)
                        }),
                        new sap.ui.model.Filter({
                            path: 'StepId',
                            operator: sap.ui.model.FilterOperator.EQ,
                            value1: sStepId
                        })
                    ],
                    and: true  // BOTH THE CONTITIONS SHOULD BE TRUE
                })
                oEvent.getParameter("bindingParams").filters.push(oFilter);
            },

            handleAssaignRoleButton: function () {

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
                var sStepName = this.getView().byId("textField_assaignStepName").getText();
                var sStepSequence = this.getView().byId("textField_assaignStepSequence").getText();
                //console.log(sStepName);
                // console.log(sPath)
                // console.log(sRoleName);

                //Create a new entry
                var oNewRole = {
                    AssignedRole: sRoleName,
                    StepName: sStepName,
                    StepSequence: sStepSequence
                };
                //console.log(oNewRole);

                //Creating new Process in the Model
                oModel.create(sPath, oNewRole, {
                    success: function (oResponse) {
                        //console.log(response);
                        MessageToast.show(` New Role assigned to ${sStepName}`)
                        this.oCreateRoleDialog.close();
                    }.bind(this),
                    error: function (oError) {
                        //alert('error')
                        MessageToast.show('Error: Something went wrong')
                    }
                });

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

                // // Check if any items are selected
                // if (aSelectedItems.length === 0) {
                //     // No items selected, show an error or inform the user
                //     MessageBox.error("No Items Selected");
                //     return;
                // }

                // Confirm deletion with the user
                MessageBox.confirm("Are you sure you want to delete the selected Role?", {
                    icon: MessageBox.Icon.WARNING,
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    //CALLBACK FUNCTION WHICH GETS EXECUTED WHEN THE MESSGE BOX IS CLOSED
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            // User confirmed deletion
                            //oModel.setUseBatch(false);

                            // Iterate through selected items and delete them
                            aSelectedItems.forEach(function (oSelectedItem) {
                                var sPath = oSelectedItem.getBindingContext().getPath();
                                oModel.remove(sPath, {
                                    success: function (oResponse) {
                                        //console.log("Item deleted successfully");
                                        MessageToast.show("Item deleted successfully")
                                        oTable.removeSelections();  // Deselect all items after deletion
                                        oDeleteStepButton.setEnabled(false)  //Disable the delete button
                                    },
                                    error: function (oError) {
                                        // Handle deletion error
                                        //console.error("Error deleting item");
                                        MessageToast.show("Error: Something went wrong")
                                    }
                                });
                            });

                        }
                    }
                });
            },

            handle_RolesTable_RowClick: function (oEvent) {
                var oSmartTable_users = this.getView().byId('smartTable_users')
                var oSelectedRoleData = oEvent.getSource().getBindingContext().getObject();
                var oModel_SelectedRole = new sap.ui.model.json.JSONModel(oSelectedRoleData);
                this.getView().setModel(oModel_SelectedRole, "JSONModel_SelectedRoleData")
                oSmartTable_users.rebindTable();
            },

            onBeforeRebindUsersTable: function (oEvent) {
                var oModel = this.getView().getModel("JSONModel_SelectedRoleData")
                var sAssignedRole = oModel.getData().AssignedRole
                //console.log(sAssignedRole)
                var oFilter = new sap.ui.model.Filter({
                    path: "RoleName",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: sAssignedRole
                });
                oEvent.getParameter("bindingParams").filters.push(oFilter);
            },

            //>>>>>>>>>>>>>>>>>>>>>>>>>>>___________FORM VALIDATIONS____________<<<<<<<<<<<<<<<<<<<<<<
            handleInputChange: function (oEvent) {
                //console.log('changed')
                var sValue = oEvent.getParameters().value;
                if (sValue.length) {
                    oEvent.getSource().setValueState('None')
                }
            },
        });
    });