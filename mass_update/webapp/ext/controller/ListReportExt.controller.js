sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/comp/smartfilterbar/SmartFilterBar",
    "sap/m/ComboBox"
], function (Filter, SmartFilterBar, ComboBox) {
    "use strict";
    return {
        onInit: function () {
            debugger;
            this._SmartTable = this.getView().byId("listReport")
            this._InnerTable = this._SmartTable.getTable()
            this._InnerTable.setMode("MultiSelect")

        },

        onInitSmartFilterBarExtension: function (oEvent) {
            let that = this;
            let oModel = this.getOwnerComponent().getModel()
            oModel.read('/ZI_QU_DG_Rules', {
                success: (oData, oResponse) => {
                    let oRulesModel = new sap.ui.model.json.JSONModel(oData.results);
                    that.getView().setModel(oRulesModel, "JSONModel_Rules")
                },
                error: (oError) => { }
            })
            oModel.read('/ZC_QU_DG_Materials', {
                success: (oData, oResponse) => {
                    that._Count = oData.results.length
                },
                error: (oError) => { }
            })
        },

        onBeforeRebindTableExtension: function (oEvent) {
            let oModel = this.getOwnerComponent().getModel();
            var oSmartTable = oEvent.getSource();
            var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());
            if (oSmartFilterBar instanceof SmartFilterBar) {
                var oCustomControl = oSmartFilterBar.getControlByKey("rule_config");
                if (oCustomControl instanceof ComboBox) {
                    var sRule = oCustomControl.getSelectedKey();
                    if (sRule.length > 0) {
                        debugger
                        this._InnerTable.setGrowingThreshold(this._Count)
                        oModel.setHeaders({ rule_config: sRule })
                    }

                }
            }
        },

        openMassEditDialog: function () {
            var oModel = this.getOwnerComponent().getModel()
            var oMassEditDialog = this.getView().byId("idMassEditDialog");
            if (!oMassEditDialog) {
                oMassEditDialog = sap.ui.xmlfragment(this.getView().getId(), "massupdate.ext.fragments.MassEditDialog", this);
                this.getView().addDependent(oMassEditDialog);
            }
            //oMassEditDialog.setEscapeHandler(this.onPressEcsButton.bind(this));
            debugger
            // var oModelContext = oModel.createEntry("/ZC_QU_DG_Materials", {});
            // this.byId('id-smartform').setBindingContext(oModelContext);
            this._getFieldsForEdit()

        },

        _getFieldsForEdit: function () {
            let oModel = this.getOwnerComponent().getModel()
            let oMassEditDialog = this.getView().byId("idMassEditDialog")
            debugger;
            //let aFormElements = this.getView().byId("id-smartform--Form").getFormContainers()[0].getFormElements()
            oModel.read('/ZI_QU_DG_Rule_Fields', {
                success: function (oData, oRes) {
                    debugger;
                    // oData.results.map((data)=>{
                    //     for(let i=0;i<aFormElements.length;i++){
                    //        let oField = aFormElements[i].getFields()[0]
                    //          if(oField.getPropertyName() === data.field_name.toLowerCase()){
                    //             aFormElements[i].setVisible(true)
                    //          }

                    //     }

                    // })
                    this._CreateFormFields()
                    oMassEditDialog.open();
                }.bind(this),
                error: function (oErr) {
                    debugger
                },
            })
        },

        _CreateFormFields: function () {
            debugger;
            let oModel = this.getOwnerComponent().getModel()
            let oSmartForm = new sap.ui.comp.smartform.SmartForm({
                editable: true,
                layout: new sap.ui.comp.smartform.Layout({
                    labelSpanM: 12,
                    labelSpanL: 12,
                    labelSpanXL: 12
                })
            });
            var oModelContext = oModel.createEntry("/ZC_QU_DG_Materials", {});
            oSmartForm.setBindingContext(oModelContext);
            let oGroup = new sap.ui.comp.smartform.Group();
            oSmartForm.addGroup(oGroup);
            //let oGroup = this.getView().byId("id-smartform--Form").getFormContainers()[0]
            let oGroupElement = new sap.ui.comp.smartform.GroupElement({
                elements: [
                    new sap.ui.comp.smartmultiedit.Field({
                        propertyName: "mtart",
                    })
                ]
            });
            oGroup.addGroupElement(oGroupElement);
            debugger
            var oMultiEditContainer = this.getView().byId("multiEditContainer");
            oMultiEditContainer.setLayout(oSmartForm);
            debugger;

        }

    };
});