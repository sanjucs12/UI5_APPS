
sap.ui.define([

], function () {
    'use strict';

    return {
        onInitSmartFilterBarExtension: function (oEvent) {
            console.log(oEvent)
            var filter = this.getView().byId("dalmia::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_PO_LIST_DETAILSSet--listReportFilter")
            console.log(filter)
            var oGlobalFilter = oEvent.getSource();
            var oDefaultFilter = {
                "$Parameter.P_Email": "123@gmail.com"
            };

            oGlobalFilter.setFilterData(oDefaultFilter);
            //oEvent.getSource()._aFields[28].defaultPropertyValue = '123@gmail.com'
        },
    };
});