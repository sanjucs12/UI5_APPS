sap.ui.define([
    "sap/ui/core/mvc/Controller",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("networkgraph.controller.View1", {
            onInit: function () {
                var sPath = "/ZP_QU_DG_PROC_STEP_ROLE(ProcessId=guid'bc305bce-60aa-1ede-abf3-2fbaf6341631',Action='01')/to_ProcesstoRole"
                var oModel = this.getOwnerComponent().getModel();
                //var sPath = `${url}/to_ProcesstoRole`; // Defining the path for specific request                
                //console.log(sPath)

                oModel.read(sPath, {
                    success: function (response) {
                        console.log("Data Read Successfully: ", response.results);
                        this._createNetworkGraph(response.results);
                    }.bind(this),
                    error: function (oError) {
                        // Handle error
                        console.error("Error reading data: ", oError);
                    }
                })
            },
            _createNetworkGraph: function (data) {

                //var oNetworkModel = new sap.ui.model.json.JSONModel();               
                const nodes = data.map(step => ({ ...step }));
                const lines = [];
                for (let i = 0; i < data.length - 1; i++) {
                    lines.push({
                        from: data[i].StepId,
                        to: data[i + 1].StepId
                    });
                }

                // Create final result object
                const result = {
                    nodes,
                    lines,
                };
                console.log(result)
                // console.log(JSON.stringify(result, null, 2));
                var oNetworkModel = new sap.ui.model.json.JSONModel(result);
                //oModel.setData(result)
                console.log(oNetworkModel.getData())
                this.getView().byId("networkGraph").setModel(oNetworkModel)
                
            }
        });
    });
