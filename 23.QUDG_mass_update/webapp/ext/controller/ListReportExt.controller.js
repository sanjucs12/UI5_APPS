sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/comp/smartfilterbar/SmartFilterBar",
    "sap/m/ComboBox"
], function (Filter, SmartFilterBar, ComboBox) {
    "use strict";
    return {
        onInit: function () {
            this._SmartTable = this.getView().byId("listReport")
            this._InnerTable = this._SmartTable.getTable()
            this._InnerTable.setMode("MultiSelect")
            this._InnerTable.attachSelectionChange(this._onTableRowSelection.bind(this));
            debugger;

            //Hiding the create button
            this.byId("massupdate::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_QU_DG_Materials--addEntry").setVisible(false)

        },
        
        onAfterRendering: function () {
            var oButtonMassEdit = this.getView().byId("massupdate::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_QU_DG_Materials--action::idMassEditActionButton")
            oButtonMassEdit.setEnabled(false);
            oButtonMassEdit.setTooltip("Mass Edit");

        },

        onInitSmartFilterBarExtension: function (oEvent) {
            let oModel = this.getOwnerComponent().getModel()
            var oModelContext = oModel.createEntry("/ZC_QU_DG_Materials", {});
            this.getView().byId("idCustomSmartField").setBindingContext(oModelContext);

            // oModel.read('/ZI_QU_DG_Rules', {
            //     success: function (oData, oRes) {
            //         let oRulesModel = new sap.ui.model.json.JSONModel(oData.results);
            //         this.getView().setModel(oRulesModel, "JSONModel_Rules")
            //     }.bind(this),
            //     error: function (oErr) { }
            // })
            oModel.read('/ZC_QU_DG_Materials', {
                success: function (oData, oRes) {
                    this._Count = oData.results.length
                }.bind(this),
                error: function (oErr) { }
            })
        },

        onBeforeRebindTableExtension: function (oEvent) {
            let oModel = this.getOwnerComponent().getModel();
            var oSmartTable = oEvent.getSource();
            var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());
            if (oSmartFilterBar instanceof SmartFilterBar) {
                var oCustomControl = oSmartFilterBar.getControlByKey("rule_config");
                // if (oCustomControl instanceof ComboBox) {
                //     var sRule = oCustomControl.getSelectedKey();
                //     if (sRule.length > 0) {
                //         debugger
                //         this._InnerTable.setGrowingThreshold(this._Count)
                //         oModel.setHeaders({ rule_config: sRule })
                //     } else {
                //         this._InnerTable.setGrowingThreshold(20)
                //         oModel.setHeaders(null)
                //     }

                // }
                let sRule = oCustomControl.getProperty('value')
                debugger;
                if (sRule) {
                    if (sRule.replace(/ /g, '').length > 0) {
                        this._InnerTable.setGrowingThreshold(this._Count)
                        oModel.setHeaders({ rule_config: sRule })
                    }

                } else {
                    this._InnerTable.setGrowingThreshold(20)
                    oModel.setHeaders(null)
                }

            }
        },

        _onTableRowSelection: function (oEvent) {
            var oButtonMassEdit = this.getView().byId("massupdate::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_QU_DG_Materials--action::idMassEditActionButton")
            if (this._InnerTable.getSelectedItems().length === 0) {
                oButtonMassEdit.setEnabled(false)
                oButtonMassEdit.setType("Transparent")
            } else {
                oButtonMassEdit.setEnabled(true)
                oButtonMassEdit.setType("Emphasized")
            }
        },

        handle_MassEditBtnClick: function () {
            this.getView().setBusy(true)
            var oMassEditDialog = this.getView().byId("idMassEditDialog");
            if (!oMassEditDialog) {
                oMassEditDialog = sap.ui.xmlfragment(this.getView().getId(), "massupdate.ext.fragments.MassEditDialog", this);
                this.getView().addDependent(oMassEditDialog);
            }
            oMassEditDialog.setEscapeHandler(this.onPressEscapeButton.bind(this));

            let aRules = []
            this._InnerTable.getSelectedItems().map((oData) => {
                aRules.push(oData.getBindingContext().getObject().rule_config)
            })
            aRules = [...new Set(aRules)].filter((item) => { return item !== '' })
            this._getFieldsForEdit(aRules)
        },

        _getFieldsForEdit: function (aRules) {
            let oModel = this.getOwnerComponent().getModel()
            let oMassEditDialog = this.getView().byId("idMassEditDialog")

            let aFilters = []
            aRules.map((rule) => {
                aFilters.push(new sap.ui.model.Filter("rule_name", "EQ", rule))
            })
            debugger;
            oModel.read('/ZI_QU_DG_Rule_Fields', {
                filters: aFilters,
                success: function (oData, oRes) {
                    debugger;
                    let aFields = []
                    oData.results.forEach((data) => {
                        aFields.push(data.field_name.toLowerCase())
                    })
                    debugger;
                    this.getView().setBusy(false)
                    this._CreateForm(aFields)
                    oMassEditDialog.open();
                }.bind(this),
                error: function (oErr) {
                    this.getView().setBusy(false)
                    debugger
                }.bind(this),
            })
        },

        _CreateForm: function (aFields) {
            debugger;
            let oModel = this.getOwnerComponent().getModel()
            //CREATING A SMART FORM USING CONSTRUCTOR
            let oSmartForm = new sap.ui.comp.smartform.SmartForm({
                editable: true,
                layout: new sap.ui.comp.smartform.Layout({
                    labelSpanM: 12,
                    labelSpanL: 12,
                    labelSpanXL: 12
                })
            });
            //CREATING A BINDING CONTEXT TO BIND TO SMART FORM
            var oModelContext = oModel.createEntry("/ZC_QU_DG_Materials", {  });
            oSmartForm.setBindingContext(oModelContext);

            //GROUP FOR SMARTFORM
            let oGroup = new sap.ui.comp.smartform.Group();
            oSmartForm.addGroup(oGroup);

            for (let i = 0; i < aFields.length; i++) {
                //GROUP ELEMENT
                let oGroupElement = new sap.ui.comp.smartform.GroupElement({
                    elements: [
                        new sap.ui.comp.smartmultiedit.Field({
                            propertyName: aFields[i],
                        })
                    ]
                });
                oGroup.addGroupElement(oGroupElement);
            }
            debugger;

            //CONTAINER FOR SMARTFORM
            var oMultiEditContainer = this.getView().byId("multiEditContainer");
            oMultiEditContainer.setLayout(oSmartForm);

            //Header Details
            this.getView().byId("selectedMaterialCount").setText(this._InnerTable.getSelectedItems().length)
        },

        onCloseDialog: function (oEvent) {
            //oEvent.getSource().getParent().close();
            let oMassEditDialog = this.getView().byId("idMassEditDialog")
            oMassEditDialog.close();
            oMassEditDialog.destroy()
        },

        onPressEscapeButton: function (oEvent) {
            let oMassEditDialog = this.getView().byId("idMassEditDialog")
            oMassEditDialog.close();
            oMassEditDialog.destroy()
            oEvent.resolve();
        },

        onDialogApplyButton: function (oEvent) {
            let that = this;
            let oConfirmationDialog = new sap.m.Dialog({
                title: "Apply Mass Changes",
                type: "Message",
                icon: "sap-icon://question-mark",
                content: [
                    new sap.ui.layout.VerticalLayout({
                        width: "100%",
                        content: [
                            new sap.m.Text("confirmationDialogText", {
                                text: "Apply mass changes to the selected Materials?" + "\n\n" + "Enter Job Description"
                            }),
                            new sap.m.TextArea("confirmDialogTextarea", {
                                ariaLabelledBy: "confirmationDialogText",
                                width: "100%",
                                value: "Mass Change Job",
                                maxLength: 120
                            })
                        ]
                    })
                ],
                beginButton: new sap.m.Button("updateJobConfirmationBtn", {
                    text: "Apply",
                    type: "Emphasized",
                    press: function () {
                        var sComment = sap.ui.getCore().byId("confirmDialogTextarea").getValue();
                        if (sComment === "") {
                            sComment = "Mass Change Job"
                        }
                        that.submitMassChanges()
                        oConfirmationDialog.close();
                        that.getView().byId("idMassEditDialog").close();
                        that.getView().byId("idMassEditDialog").destroy();
                    }

                }),
                endButton: new sap.m.Button({
                    text: "Cancel",
                    press: function () {
                        oConfirmationDialog.close();
                    }
                }),
                afterClose: function () {
                    oConfirmationDialog.destroy();
                }
            });
            oConfirmationDialog.open();
            sap.ui.getCore().byId("confirmDialogTextarea").attachLiveChange(function (event) {
                if (event.getParameter("value") === "") {
                    sap.ui.getCore().byId("updateJobConfirmationBtn").setEnabled(false);
                } else {
                    sap.ui.getCore().byId("updateJobConfirmationBtn").setEnabled(true);
                }
            });


        },

        submitMassChanges: function () {
            debugger;

            let changedFields = {};

            //Create Changed fields Array
            let aFormContainers = this.getView().byId("multiEditContainer").getLayout()._oForm.getFormContainers();
            for (var i = 0; i < aFormContainers.length; i++) {
                //returns all the fields of the group
                let aFormElements = aFormContainers[i].getFormElements();
                for (var j = 0; j < aFormElements.length; j++) {
                    let oField = aFormElements[j].getFields()[0];
                    if (oField.getMetadata().getName() === "sap.ui.comp.smartmultiedit.Field") {
                        if (oField.getSelectedItem() !== null) {
                            var sKey = oField.getSelectedItem().getKey();
                            var fName, fValue;
                            if (sKey !== "keep") {
                                if (sKey === "blank") {
                                    fName = oField.getPropertyName();
                                    if (oField.getDataType() === "Edm.DateTime") {
                                        fValue = new Date(-18000000000000);
                                    } else if (oField.getDataType() === "Edm.Decimal") {
                                        fValue = "0.0";
                                    } else if (oField.getDataType() === "Edm.Boolean") {
                                        fValue = false;
                                    } else {
                                        fValue = " ";
                                    }
                                } else if (sKey === "new") {
                                    fName = oField.getPropertyName();
                                    if (oField.getDataType() === "Edm.Decimal") {
                                        fValue = oField.getRawValue()[fName].toString();
                                    } else {
                                        fValue = oField.getRawValue()[fName];
                                    }
                                } else if (sKey === "true") {
                                    fName = oField.getPropertyName();
                                    fValue = oField.getRawValue()[fName];
                                } else if (sKey === "false") {
                                    fName = oField.getPropertyName();
                                    fValue = oField.getRawValue()[fName];
                                }
                                changedFields[fName] = fValue;
                            }
                        }
                    }
                }
            }
            debugger;
            //Preparing the PAYLOAD
            let oPayload = changedFields
            let aMatnr = this._InnerTable.getSelectedContexts().map(context => context.getObject().matnr);
            let sMatnr = aMatnr.join(',')
            oPayload.matnr = sMatnr;
            debugger;

            let oModel = this.getOwnerComponent().getModel();
            let sPath = this._InnerTable.getSelectedContexts()[0].getPath()

            // oModel.setDeferredGroups(["DEFAULT"]);
            // oModel.metadataLoaded().then(() => {
            //     debugger;
            //     oModel.update(sPath, oPayload, {
            //         groupId: "DEFAULT",
            //         changeSetId: "myId",
            //         success: function (oData, oRes) {
            //             debugger
            //         },
            //         error: function (oErr) {
            //             debugger
            //         }
            //     });
            //     debugger;
            //     oModel.submitChanges({
            //         groupId: "DEFAULT",
            //         success: function (oData, oRes) {
            //             debugger
            //         },
            //         error: function (oErr) {
            //             debugger
            //         }
            //     })
            // })

            debugger;
            this.getView().setBusy(true)
            oModel.callFunction('/FIMP_MASS_UPDATE',{
                urlParameters:{
                    Json:JSON.stringify(oPayload)
                },
                success: function(oData,oRes){
                    this.getView().setBusy(false)
                    sap.m.MessageBox.success('Items Updaed Successfully')
                    this._InnerTable.removeSelections(true);
                    this._SmartTable.rebindTable();
                    this.getView().byId("massupdate::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_QU_DG_Materials--action::idMassEditActionButton").setEnabled(false)
                }.bind(this),
                error:function(oErr){
                    debugger;
                    this.getView().setBusy(false)
                    sap.m.MessageBox.error('Something went wrong')
                }
            })


        }

    };
});