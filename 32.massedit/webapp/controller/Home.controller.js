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
            },
            onPressEdit: function (oEvent) {
                this._GetTableData()
                const oRouter = this.getOwnerComponent().getRouter()
                oRouter.navTo("Work")
            },
            _GetTableData: function (oEvent) {
                let oTable_Basic = this.getView().byId("idTable_Basic");
                let oTable_Plant = this.getView().byId("idTable_Plant");
                let oTable_Sales = this.getView().byId("idTable_Sales");
                let oTable_Classification = this.getView().byId("idTable_Classification");

                const getTableName = ((oTable) => {
                    if (oTable.getId() === this.getView().createId("idTable_Basic")) {
                        return 'Basic'
                    } else if (oTable.getId() === this.getView().createId("idTable_Plant")) {
                        return 'Plant'
                    } else if (oTable.getId() === this.getView().createId("idTable_Sales")) {
                        return 'Sales'
                    } else if (oTable.getId() === this.getView().createId("idTable_Classification")) {
                        return 'Classification'
                    }
                })

                const aTables = [oTable_Basic, oTable_Plant, oTable_Sales, oTable_Classification]
                const aTableData = [];
                aTables.forEach((oTable) => {
                    let aItems = oTable.getItems();
                    aItems.forEach(function (oItem) {
                        // Get the cells in the current row
                        let aCells = oItem.getCells();
                        let oRowData = {}
                        // Loop through each cell and get the value from SmartField
                        aCells.forEach(function (oCell, index) {
                            if (oCell instanceof sap.ui.comp.smartfield.SmartField) {
                                let sValue = oCell.getValue();
                                if (sValue && sValue.length > 0) {
                                    if (index === 0) {
                                        oRowData.fieldName = sValue;
                                    } else if (index === 1) {
                                        oRowData.fieldValue = sValue;
                                    }
                                }
                            }
                        });
                        oRowData.fieldType = getTableName(oTable)
                        // Add the row data to the results array
                        if (Object.keys(oRowData).length > 0) {
                            aTableData.push(oRowData)
                        }
                    });
                })
                let oModel = new sap.ui.model.json.JSONModel(aTableData)
                this.getOwnerComponent().setModel(oModel, 'Data')
            },
        });
    });
