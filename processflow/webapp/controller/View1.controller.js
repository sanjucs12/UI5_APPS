sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("processflow.controller.View1", {
            onInit: function () {
                var oModel = this.getOwnerComponent().getModel("processDataModel");
                this.getView().setModel(oModel,"JsonModel")
                console.log(oModel.getData())

                var oDataModel = this.getOwnerComponent().getModel();
                // history.go()

                var sPath = "/ActionLogSet?$filter=Banfn eq '1170012432' and Bnfpo eq '00010'"
                oDataModel.read(sPath,{
                    success: function(res){
                        console.log(res.results[0])
                    },
                    error: function(err){
                        console.log(err)
                    },
                })
            }
        });
    });
