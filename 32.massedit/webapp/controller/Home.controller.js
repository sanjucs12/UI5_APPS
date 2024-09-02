sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    function (Controller) {
        "use strict";

        return Controller.extend("massedit.controller.Home", {
            onInit: function () {

            },
            onAddTableRow: function (oEvent) {
                let oTable = oEvent.getSource().getParent().getParent();
                let oNewColumnListItem = new sap.m.ColumnListItem({
                    cells: [
                        new sap.ui.comp.smartfield.SmartField({
                            entitySet: this._onAddSfProperties(oTable),
                            value: "{maktx}",
                        }),
                        new sap.ui.comp.smartfield.SmartField({
                            entitySet: this._onAddSfProperties(oTable),
                            value: "{maktx}",
                        }),
                        new sap.m.Button({
                            type: "Transparent",
                            icon: "sap-icon://decline",
                            press: this.onRemoveTableRow.bind(this)
                        })
                    ]
                });
                oTable.addItem(oNewColumnListItem);
            },
            onRemoveTableRow: function (oEvent) {
                let oButton = oEvent.getSource();
                let oItem = oButton.getParent();
                let oTable = oEvent.getSource().getParent().getParent();
                oTable.removeItem(oItem);
            },
            _onAddSfProperties: function (oTable) {
                if (oTable.getId() === this.getView().createId("idTable_Basic")) {
                    return 'ZC_QU_DG_MATERIAL'
                } else if (oTable.getId() === this.getView().createId("idTable_Plant")) {
                    return 'ZC_QU_DG_MATERIAL'
                }
            }
        });
    });
