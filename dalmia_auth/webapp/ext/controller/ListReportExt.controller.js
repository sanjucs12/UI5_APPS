
sap.ui.define([

], function () {
    'use strict';

    return {
        onInitSmartFilterBarExtension: function (oEvent) {
            var oSmartFilter = oEvent.getSource();
            //var oSmartFilter = this.getView().byId("dalmiaauth::sap.suite.ui.generic.template.ListReport.view.ListReport::ZI_PurchaseHeader_ParamSet--listReportFilter")
            //console.log(oSmartFilter)

            var oDefaultFilter = {
                "$Parameter.P_Email": "test123@gmail.com"
            };
            oSmartFilter.setFilterData(oDefaultFilter);

            var oSmartFilterField = this.getView().byId("dalmiaauth::sap.suite.ui.generic.template.ListReport.view.ListReport::ZI_PurchaseHeader_ParamSet--listReportFilter-filterItemControlA_-_Parameter.P_Email")

            //console.log(oSmartFilterField)
            // var oSmartFilterLabel = oSmartFilterField.getParent().getParent().getParent().getItems()[0];
            // if (oSmartFilterLabel) {
            //     oSmartFilterLabel.setVisible(false);
            // }


            // var oEmailFilterField = oSmartFilter.getControlByKey("$Parameter.P_Email");
            // console.log(oEmailFilterField)
            //oSmartFilterField.setVisible(false)
           // oSmartFilterField.getParent().setVisible(false)
        },

        // modifyStartupExtension: function (oStartupObject) {
        //     console.log(oStartupObject.selectionVariant)
        //     var oSelectionVariant = oStartupObject.selectionVariant;
        //     console.log(oSelectionVariant)
        //     if (oSelectionVariant) {
        //         oSelectionVariant.addParameter("P_Email", "test@gmail.com");
        //     }
        // }
    };
});