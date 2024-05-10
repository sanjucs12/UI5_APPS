sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
], function (MessageToast,Fragment) {
    'use strict';

    return {
        handleClick: function (oEvent) {
            // if (!this.oDialog) {
            //     this.oDialog = sap.ui.xmlfragment(
            //         this.getRouting().getView().getId(),
            //         "pratham.ext.fragments.test",
            //         this
            //     );
            // }
            // this.getRouting().getView().addDependent(this.oDialog);
            // debugger;
            // this.oDialog.open();
            this.refresh();
            debugger;

        },
        handle_CloseBtn: function (oEvent) {
            debugger;
        }
    };
});
