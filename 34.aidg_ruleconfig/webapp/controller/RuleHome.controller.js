sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    function (Controller) {
        "use strict";

        return Controller.extend("aidgruleconfig.controller.RuleHome", {
            onInit: function () {

            },
            onPressCreateRule: function (oEvent) {
                if (!this._CreateRuleDialog) {
                    this._CreateRuleDialog = this.loadFragment({
                        name: "aidgruleconfig.fragments.CreateRuleDialog"
                    });
                }
                this._CreateRuleDialog.then(function (oDialog) {
                    this._CreateRuleDialog = oDialog;
                    let oSmartForm = this.getView().byId("idSmartForm_CreateRule")
                    oSmartForm.setBindingContext(this.getOwnerComponent().getModel().createEntry('/ZP_QU_DG_RULECONFIG', {}))
                    this._CreateRuleDialog.open();
                }.bind(this));
            },
            fnCloseDialog: function () {
                this._CreateRuleDialog.close()
                this._CreateRuleDialog.destroy()
                this._CreateRuleDialog = undefined;
            },
            _onPressCloseBtn: function (oEvent) {
                this.fnCloseDialog()
            },
            _onPressCreateBtn: async function (oEvent) {
                let oSmartForm = this.getView().byId("idSmartForm_CreateRule")
                let oModel = this.getOwnerComponent().getModel()
                let aErrorFields = await oSmartForm.check()
                if (aErrorFields.length === 0) {
                    oModel.submitChanges({
                        success: function (oData, oRes) {
                            debugger;
                            this.fnCloseDialog()
                        }.bind(this),
                        error: function (oErr) {
                            debugger;
                            this.fnCloseDialog()
                        }.bind(this)
                    })
                }
            },
            onPressDeleteRule: function (oEvent) {
                let aSelectedContexts = this.getView().byId('idSmartTable').getTable().getSelectedContexts()
                if (aSelectedContexts.length > 0) {
                    sap.m.MessageBox.confirm('Delete Selected Rule?', {
                        onClose: function (sAction) {
                            if (sAction === "OK") {
                                let sPath = aSelectedContexts[0].getPath()
                                let oModel = this.getOwnerComponent().getModel()
                                oModel.remove(sPath, {
                                    success: function (oData, oRes) {
                                        let sMessage = JSON.parse(oRes.headers["sap-message"]).message
                                        sap.m.MessageBox.success(sMessage)
                                    },
                                    error: function (oErr) {
                                        let sMessage = JSON.parse(oRes.headers["sap-message"]).message
                                        sap.m.MessageBox.error(sMessage)
                                    }
                                })
                            }
                        }.bind(this)
                    })

                } else if (aSelectedContexts.length === 0) {
                    sap.m.MessageBox.warning("Please Select Rule")
                }
            },
            goToEditScreen: function (oEvent) {
                let oRouter = this.getOwnerComponent().getRouter()
                oRouter.navTo("EditRule")
            }
        });
    });
