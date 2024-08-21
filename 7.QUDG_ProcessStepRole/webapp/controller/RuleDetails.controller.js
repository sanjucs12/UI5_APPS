sap.ui.define([
    "sap/ui/core/mvc/Controller",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("metadata.controller.RuleDetails", {
            onInit: function () {
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RuleDetails").attachPatternMatched(this.onPatternMatched, this);
            },
            onPatternMatched: function (oEvent) {
                this.rule = oEvent.getParameter("arguments").rule;
                this.path = `/ZC_QU_DG_RULE_FORMULA_FLDS('${this.rule}')`
                let oModel = this.getOwnerComponent().getModel()
                oModel.read(this.path, {
                    success: function (oData, oRes) {
                        debugger
                        let oModel = new sap.ui.model.json.JSONModel(oData)
                        this.getView().setModel(oModel, 'RuleDetails')
                    }.bind(this),
                    error: function (oErr) {
                        debugger
                    },
                })

                setTimeout(() => {
                    this.getView().byId('idSmartTable_Formulas').rebindTable()
                }, 1000)
            },
            onBeforeRebindFormulaTable: function (oEvent) {
                var oFilter = new sap.ui.model.Filter({
                    path: "RuleName",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: this.rule
                });
                oEvent.getParameter("bindingParams").filters.push(oFilter);
            },
            onPressEdit: function (oEvent) {
                let oModel = this.getOwnerComponent().getModel()
                let oContext = new sap.ui.model.Context(oModel, this.path);
                debugger;
                if (!this._editRuleFragment) {
                    this.loadFragment({
                        name: "metadata.fragments.editRule"
                    })
                        .then(function (oDialog) {
                            this._editRuleFragment = oDialog;
                            let oSmartForm = this.byId('idSmartFormEditRule')
                            oSmartForm.setBindingContext(oContext)
                            oDialog.open();
                        }.bind(this));
                } else {
                    this._editRuleFragment.open();
                }

            },
            handle_fCancelEditRule: function (oEvent) {
                this._editRuleFragment.close()
                this._editRuleFragment.destroy()
                this._editRuleFragment = null
            },
            handle_fEditRule: function (oEvent) {
                let oSmartForm = this.byId('idSmartFormEditRule')
                let oPayload = {
                    RuleName: oSmartForm.getSmartFields()[0].getValue(),
                    RuleText: oSmartForm.getSmartFields()[1].getValue(),
                    master: oSmartForm.getSmartFields()[2].getValue()
                }

                let oModel = this.getOwnerComponent().getModel()

                this._editRuleFragment.setBusy(true)
                oModel.update(this.path, oPayload, {
                    success: function (oData, oRes) {
                        let sMessage = JSON.parse(oRes.headers["sap-message"]).message
                        sap.m.MessageBox.success(sMessage);
                        this._editRuleFragment.setBusy(false)
                        this._editRuleFragment.close()
                        this._editRuleFragment.destroy()
                        this._editRuleFragment = null
                        oModel.read(this.path, {
                            success: function (oData, oRes) {
                                this.getView().getModel("RuleDetails").setData(oData)
                            }.bind(this),
                            error: function (oErr) {
                                this._editRuleFragment.setBusy(false)
                                sap.m.MessageBox.error('Something went wrong');
                            },
                        })
                    }.bind(this),
                    error: function (oErr) { 
                        this._editRuleFragment.setBusy(false)
                        let sMessage = JSON.parse(oErr.responseText).error.message.value
                        sap.m.MessageBox.error(sMessage);
                    },
                })
            },
            onPress_CreateFormulaBtn: function (oEvent) {
                if (!this._createFormulaFragment) {
                    this.loadFragment({
                        name: "metadata.fragments.createFormula"
                    })
                        .then(function (oDialog) {
                            this._createFormulaFragment = oDialog;
                            let oSmartForm = this.byId('idSmartFormCreateFormula')
                            let oContext = this.getOwnerComponent().getModel().createEntry('/ZC_QU_DG_FORMULA_DATA', {})
                            oSmartForm.setBindingContext(oContext)
                            oDialog.open();
                        }.bind(this));
                } else {
                    this._createFormulaFragment.open();
                }
            },
            handle_fCancelformula: function (oevent) {
                this._createFormulaFragment.close()
                this._createFormulaFragment.destroy()
                this._createFormulaFragment = null
            },
            handle_fCreateFormula: function (oEvent) {
                debugger;
                let oSmartForm = this.byId('idSmartFormCreateFormula')
                oSmartForm.check()
                let oPayload = {
                    FormulaId: oSmartForm.getSmartFields()[0].getValue(),
                    MessageText: oSmartForm.getSmartFields()[1].getValue()
                }

                let oModel = this.getOwnerComponent().getModel()

                this._createFormulaFragment.setBusy(true)
                oModel.create(`${this.path}/to_formula`, oPayload, {
                    success: function (oData, oRes) {
                        this._createFormulaFragment.setBusy(false)
                        let sMessage = JSON.parse(oRes.headers["sap-message"]).message
                        sap.m.MessageBox.success(sMessage);
                        this._createFormulaFragment.close()
                        this._createFormulaFragment.destroy()
                        this._createFormulaFragment = null
                    }.bind(this),
                    error: function (oErr) {
                        this._createFormulaFragment.setBusy(false)
                        let sMessage = JSON.parse(oErr.responseText).error.message.value
                        sap.m.MessageBox.error(sMessage);
                    }.bind(this),
                })
            },
            onPress_DeleteFormulaBtn: function (oEvent) {
                let that = this;
                let oModel = this.getOwnerComponent().getModel();
                let oTable = this.getView().byId('idTable_Formulas');

                let aSelectedContexts = oTable.getSelectedContexts(); // Get selected items

                if (aSelectedContexts.length === 0) {
                    sap.m.MessageBox.error("No Items Selected");
                    return;
                }

                // Confirm deletion with the user
                sap.m.MessageBox.confirm("Are you sure you want to delete the selected Formula?", {
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
                                        sap.m.MessageBox.error('Something went wrong');
                                    }
                                });
                            });

                        }
                    }
                });
            },
            handleNavToFormulaDetailsPage: function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext().getPath()
                let sFormula = oEvent.getSource().getBindingContext().getObject().FormulaId
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo('FormulaDetails', {
                    rule: this.rule,
                    formula: sFormula
                })
            },
        });
    });
