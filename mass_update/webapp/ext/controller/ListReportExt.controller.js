sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/comp/smartfilterbar/SmartFilterBar",
    "sap/m/ComboBox"
], function (Filter, SmartFilterBar, ComboBox) {
    "use strict";
    return {
        onInitSmartFilterBarExtension: function (oEvent) {
            debugger;
            let that = this;
            this.getOwnerComponent().getModel().read('/ZI_QU_DG_Rules', {
                success: (oData, oResponse) => {
                    debugger;
                    let oRulesModel = new sap.ui.model.json.JSONModel(oData.results);
                    that.getView().setModel(oRulesModel, "JSONModel_Rules")
                },
                error: (oError) => { }
            })
        },
        getCustomAppStateDataExtension: function (oCustomData) {
            //the content of the custom field will be stored in the app state, so that it can be restored later, for example after a back navigation.
            //The developer has to ensure that the content of the field is stored in the object that is passed to this method.
            // if (oCustomData) {
            //     var oCustomField1 = this.oView.byId("idCustomFilter");
            //     if (oCustomField1) {
            //         oCustomData.rule_config = oCustomField1.getSelectedKey();
            //     }
            // }

        },
        restoreCustomAppStateDataExtension: function (oCustomData) {
            //in order to restore the content of the custom field in the filter bar, for example after a back navigation,
            //an object with the content is handed over to this method. Now the developer has to ensure that the content of the custom filter is set to the control

            // if (oCustomData) {
            //     if (oCustomData.rule_config) {
            //         var oComboBox = this.oView.byId("idCustomFilter");
            //         oComboBox.setSelectedKey(
            //             oCustomData.rule_config
            //         );
            //     }
            // }
        },
        onBeforeRebindTableExtension: function (oEvent) {
            let oModel = this.getOwnerComponent().getModel();
            oModel.setHeaders(null)
            debugger;

            //var oBindingParams = oEvent.getParameter("bindingParams");
            //oBindingParams.parameters = oBindingParams.parameters || {};

            var oSmartTable = oEvent.getSource();
            var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());
            if (oSmartFilterBar instanceof SmartFilterBar) {
                var oCustomControl = oSmartFilterBar.getControlByKey("rule_config");
                if (oCustomControl instanceof ComboBox) {
                    var sRule = oCustomControl.getSelectedKey();
                    //oModel.setHeaders({rule_config:sRule})
                    debugger;
                    // oBindingParams.filters.push(new Filter("rule_config", "EQ", vCategory));

                }
            }
        }
    };
});