sap.ui.define([
    "sap/ui/core/mvc/Controller",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("metadata.controller.FormulaDetails", {
            onInit: function () {
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("FormulaDetails").attachPatternMatched(this.onPatternMatched, this);
            },
            onPatternMatched: function (oEvent) {
                this.rule = oEvent.getParameter("arguments").rule
                this.formula = oEvent.getParameter("arguments").formula;
                this.path = `/ZC_QU_DG_FORMULA_DATA(RuleName='${this.rule}',FormulaId='${this.formula}')`
                debugger
                let oModel = this.getOwnerComponent().getModel()
                oModel.read(this.path, {
                    success: function (oData, oRes) {
                        debugger
                        let oModel = new sap.ui.model.json.JSONModel(oData)
                        this.getView().setModel(oModel, 'FormulaDetails')
                    }.bind(this),
                    error: function (oErr) {
                        debugger
                    },
                })

                setTimeout(() => {
                    this.getView().byId('idSmartTable_Fields').rebindTable()
                }, 1000)
            },
            onBeforeRebindFieldsTable: function (oEvent) {
                let oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter({
                            path: 'RuleName',
                            operator: sap.ui.model.FilterOperator.EQ,
                            value1: this.rule
                        }),
                        new sap.ui.model.Filter({
                            path: 'FormulaId',
                            operator: sap.ui.model.FilterOperator.EQ,
                            value1: this.formula
                        })
                    ],
                    and: true // BOTH THE CONTITIONS SHOULD BE TRUE
                })
                oEvent.getParameter("bindingParams").filters.push(oFilter);
            },
            onPressEdit: function (oEvent) {
                let oModel = this.getOwnerComponent().getModel()
                let oContext = new sap.ui.model.Context(oModel, this.path);
                debugger;
                if (!this._editFormulaFragment) {
                    this.loadFragment({
                        name: "metadata.fragments.editFormula"
                    })
                        .then(function (oDialog) {
                            this._editFormulaFragment = oDialog;
                            let oSmartForm = this.byId('idSmartFormEditFormula')
                            oSmartForm.setBindingContext(oContext)
                            oDialog.open();
                        }.bind(this));
                } else {
                    this._editFormulaFragment.open();
                }

            },
            handle_fCancelEditFormula: function (oEvent) {
                this._editFormulaFragment.close()
                this._editFormulaFragment.destroy()
                this._editFormulaFragment = null
            },
            handle_fEditFormula: function (oEvent) {
                let oSmartForm = this.byId('idSmartFormEditFormula')
                let oPayload = {
                    FormulaId: oSmartForm.getSmartFields()[0].getValue(),
                    MessageText: oSmartForm.getSmartFields()[1].getValue(),
                }

                let oModel = this.getOwnerComponent().getModel()

                this._editFormulaFragment.setBusy(true)
                oModel.update(this.path, oPayload, {
                    success: function (oData, oRes) {
                        let sMessage = JSON.parse(oRes.headers["sap-message"]).message
                        sap.m.MessageBox.success(sMessage);
                        this._editFormulaFragment.setBusy(false)
                        this._editFormulaFragment.close()
                        this._editFormulaFragment.destroy()
                        this._editFormulaFragment = null
                        oModel.read(this.path, {
                            success: function (oData, oRes) {
                                this.getView().getModel("FormulaDetails").setData(oData)
                            }.bind(this),
                            error: function (oErr) {
                                this._editFormulaFragment.setBusy(false)
                                sap.m.MessageBox.error('Something went wrong');
                            },
                        })
                    }.bind(this),
                    error: function (oErr) {
                        this._editFormulaFragment.setBusy(false)
                        let sMessage = JSON.parse(oErr.responseText).error.message.value
                        sap.m.MessageBox.error(sMessage);
                    },
                })
            },
            onPress_CreateFieldBtn: function (oEvent) {
                if (!this._createFieldFragment) {
                    this.loadFragment({
                        name: "metadata.fragments.createField"
                    })
                        .then(function (oDialog) {
                            this._createFieldFragment = oDialog;
                            let oSmartForm = this.byId('idSmartFormCreateField')
                            let oContext = this.getOwnerComponent().getModel().createEntry('/ZC_QU_DG_FIELDS_DATA', {})
                            oSmartForm.setBindingContext(oContext)
                            oDialog.open();
                        }.bind(this));
                } else {
                    this._createFieldFragment.open();
                }
            },
            handle_fCancelField: function (oevent) {
                this._createFieldFragment.close()
                this._createFieldFragment.destroy()
                this._createFieldFragment = null
            },
            handle_fCreateField: function (oEvent) {
                let oSmartForm = this.byId('idSmartFormCreateField')
                let oPayload = {
                    FormulaId: oSmartForm.getSmartFields()[0].getValue(),
                    FieldName: oSmartForm.getSmartFields()[1].getValue(),
                    Conditions: oSmartForm.getSmartFields()[2].getValue(),
                    value: oSmartForm.getSmartFields()[3].getValue(),
                    Combinator: oSmartForm.getSmartFields()[4].getValue()
                }

                let oModel = this.getOwnerComponent().getModel()

                this._createFieldFragment.setBusy(true)
                oModel.create(`${this.path}/to_fields`, oPayload, {
                    success: function (oData, oRes) {
                        this._createFieldFragment.setBusy(false)
                        let sMessage = JSON.parse(oRes.headers["sap-message"]).message
                        sap.m.MessageBox.success(sMessage);
                        this._createFieldFragment.close()
                        this._createFieldFragment.destroy()
                        this._createFieldFragment = null
                    }.bind(this),
                    error: function (oErr) {
                        debugger;
                        this._createFieldFragment.setBusy(false)
                        let sMessage = JSON.parse(oErr.responseText).error.message.value
                        sap.m.MessageBox.error(sMessage);
                    }.bind(this),
                })
            },
            onPress_DeleteFieldBtn: function (oEvent) {
                let that = this;
                let oModel = this.getOwnerComponent().getModel();
                let oTable = this.getView().byId('idTable_Fields');

                let aSelectedContexts = oTable.getSelectedContexts(); // Get selected items

                if (aSelectedContexts.length === 0) {
                    sap.m.MessageBox.error("No Items Selected");
                    return;
                }

                // Confirm deletion with the user
                sap.m.MessageBox.confirm("Are you sure you want to delete the selected Field?", {
                    icon: sap.m.MessageBox.Icon.WARNING,
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    emphasizedAction: sap.m.MessageBox.Action.YES,
                    //CALLBACK FUNCTION WHICH GETS EXECUTED WHEN THE MESSGE BOX IS CLOSED
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                            that.getView().setBusy(true)
                            aSelectedContexts.forEach(function (item) {
                                let sPath = item.getPath()
                                oModel.remove(sPath, {
                                    success: function (oData, oRes) {
                                        that.getView().setBusy(false)
                                        let sMessage = JSON.parse(oRes.headers["sap-message"]).message
                                        sap.m.MessageBox.success(sMessage);
                                    },
                                    error: function (oError) {
                                        that.getView().setBusy(false)
                                        let sMessage = JSON.parse(oErr.responseText).error.message.value
                                        sap.m.MessageBox.error(sMessage);
                                    }
                                });
                            });

                        }
                    }
                });
            },
        });
    });
