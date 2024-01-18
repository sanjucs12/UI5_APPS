sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/suite/ui/commons/networkgraph/Graph",
    "sap/suite/ui/commons/networkgraph/Node",
    "sap/suite/ui/commons/networkgraph/Line"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,JSONModel, Graph, Node, Line) {
        "use strict";

        return Controller.extend("networkgraph.controller.View1", {
            onInit: function () {
                var sPath = "/ZP_QU_DG_PROC_STEP_ROLE(ProcessId=guid'bc305bce-60aa-1ede-abf3-2fbaf6341631',Action='01')/to_ProcesstoRole"
                var oModel = this.getOwnerComponent().getModel();
                var that = this;
                //var sPath = `${url}/to_ProcesstoRole`; // Defining the path for specific request                
                //console.log(sPath)
                oModel.read(sPath, {
                    success: function (response) {
                        console.log("Data Read Successfully: ", response.results);
                        that._createNetworkGraph(response.results);
                    }.bind(this),
                    error: function (oError) {
                        // Handle error
                        console.error("Error reading data: ", oError);
                    }
                })
            },
            _createNetworkGraph: function (data) {
                var nodes = [];
                var edges = [];
    
                // Modify the data as per your requirements
                // ...
    
                // Create nodes and edges
                for (var i = 0; i < data.length; i++) {
                    var step = data[i];
    
                    // Create node
                    var node = new Node({
                        key: "Step" + (i + 1),
                        title: step.CreatedBy + "\n" + step.StepName + "\n" + step.StepType,
                        group: "Nodes",
                        state: [{}]
                    });
    
                    // Create edge
                    if (i < data.length - 1) {
                        var edge = new Line({
                            key: "Edge" + i,
                            from: "Step" + i,
                            to: "Step" + (i + 1),
                            title: ""
                        });
                        edges.push(edge);
                    }
    
                    // Add node to array
                    nodes.push(node);
                }
    
                // Create the network graph
                var oGraph = new Graph({
                    nodes: {
                        path: "/Nodes",
                        template: nodes[0] // Use the first node as a template
                    },
                    lines: {
                        path: "/Lines",
                        template: edges[0] // Use the first edge as a template
                    }
                });
    
                // Set the model
                var oModel = new JSONModel({
                    Nodes: nodes,
                    Lines: edges
                });
                oGraph.setModel(oModel);
    
                // Attach the graph to a container or a layout
                var oView = this.getView();
                var oContainer = oView.byId("networkGraphContainer"); // Assuming you have a container in your view
                oContainer.addContent(oGraph);
            }
        });
    });
