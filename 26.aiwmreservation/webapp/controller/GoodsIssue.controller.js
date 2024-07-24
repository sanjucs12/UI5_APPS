sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    function (Controller) {
        "use strict";

        return Controller.extend("aiwmreservation.controller.GoodsIssue", {
            onInit: function () {
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("GoodsIssue").attachPatternMatched(this.ObjectMatched, this);
            },
            ObjectMatched: function (oEvent) {
                let sResNo = oEvent.getParameter("arguments").ReservationNo
                let aResItems = JSON.parse(oEvent.getParameter("arguments").ReservationItems) 
                let oModel = this.getOwnerComponent().getModel()
                let aFilters = [
                    new sap.ui.model.Filter('ReservationNumber','EQ',sResNo)
                ]
                aResItems.forEach((item)=>{
                    aFilters.push(new sap.ui.model.Filter('ReservationItem',"EQ",item))
                })
                oModel.read('/zi_reservationdtl',{
                    filters:aFilters,
                    success: function(oData,oRes){
                       let oItemsModel = new sap.ui.model.json.JSONModel(oData.results)
                       this.getView().setModel(oItemsModel,"GoodsIssueItems")
                    }.bind(this),
                    error: function(oRes){
                        debugger
                    },
                }) 

            },
        });
    });
