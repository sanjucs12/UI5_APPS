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

        },
        onAfterRendering: function () {
            var oButtonMassEdit = this.getView().byId("massupdate::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_QU_DG_Materials--action::idMassEditActionButton")
			oButtonMassEdit.setEnabled(false);
			oButtonMassEdit.setTooltip("Mass Edit");
		},

        onInitSmartFilterBarExtension: function (oEvent) {
            let oModel = this.getOwnerComponent().getModel()
            oModel.read('/ZI_QU_DG_Rules', {
                success: function (oData,oRes) {
                    let oRulesModel = new sap.ui.model.json.JSONModel(oData.results);
                    this.getView().setModel(oRulesModel, "JSONModel_Rules")
                }.bind(this),
                error: function (oErr) { }
            })
            oModel.read('/ZC_QU_DG_Materials', {
                success: function (oData,ores) {
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
                if (oCustomControl instanceof ComboBox) {
                    var sRule = oCustomControl.getSelectedKey();
                    if (sRule.length > 0) {
                        debugger
                        this._InnerTable.setGrowingThreshold(this._Count)
                        oModel.setHeaders({ rule_config: sRule })
                    } else {
                        this._InnerTable.setGrowingThreshold(20)
                        oModel.setHeaders(null)
                    }

                }
            }
        },

        _onTableRowSelection: function(oEvent){
            var oButtonMassEdit = this.getView().byId("massupdate::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_QU_DG_Materials--action::idMassEditActionButton")
            if(this._InnerTable.getSelectedItems().length === 0){
                oButtonMassEdit.setEnabled(false)
                oButtonMassEdit.setType("Transparent")
            } else {
                oButtonMassEdit.setEnabled(true)
                oButtonMassEdit.setType("Emphasized")
            }
        },

        handle_MassEditBtnClick: function () {
            var oMassEditDialog = this.getView().byId("idMassEditDialog");
            if (!oMassEditDialog) {
                oMassEditDialog = sap.ui.xmlfragment(this.getView().getId(), "massupdate.ext.fragments.MassEditDialog", this);
                this.getView().addDependent(oMassEditDialog);
            }
            //oMassEditDialog.setEscapeHandler(this.onPressEcsButton.bind(this));
          
            let aRules = []
            this._InnerTable.getSelectedItems().map((oData)=>{
                aRules.push(oData.getBindingContext().getObject().rule_config)
            })   
            aRules = [...new Set(aRules)].filter((item)=>{return item !== ''})     
            this._getFieldsForEdit(aRules)
        },

        _getFieldsForEdit: function (aRules) {
            let oModel = this.getOwnerComponent().getModel()
            let oMassEditDialog = this.getView().byId("idMassEditDialog")

            let aFilters = []
            aRules.map((rule)=>{
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
                    this._CreateForm(aFields)
                    oMassEditDialog.open();
                }.bind(this),
                error: function (oErr) {
                    debugger
                },
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
            var oModelContext = oModel.createEntry("/ZC_QU_DG_Materials", {});
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
        },

        onCloseDialog: function(oEvent){
            oEvent.getSource().getParent().close();
        },

        onDialogApplyButton: function(oEvent){
            this.submitMassChanges()
        },

        submitMassChanges: function(){
            debugger;
			//var selectedItemsCount = this.getTotalSelectedItemsCount();
			var oModel = this.getOwnerComponent().getModel();
			var currentRowContext;
			var prEntry = {};
			var that = this;
			var changedFields = {};
			var aFormElements;
			var oField;
			var aFormContainers = this.getView().byId("multiEditContainer").getLayout()._oForm.getFormContainers();

			//Create Changed fields Array
			for (var i = 0; i < aFormContainers.length; i++) {
				//returns all the fields of the group
				aFormElements = aFormContainers[i].getFormElements();
				for (var j = 0; j < aFormElements.length; j++) {
					oField = aFormElements[j].getFields()[0];
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

			prEntry = changedFields;
            debugger;
			//prEntry.InternalComment = sComment;
        }

    };
});