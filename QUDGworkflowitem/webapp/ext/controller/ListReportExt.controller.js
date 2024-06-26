sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function(Controller, History) {
    "use strict";

    return sap.ui.controller("workflowitem.ext.controller.ListReportExt", {
        onInit: function () {
            //  
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.attachRoutePatternMatched(this.onRouteMatched, this);
            debugger;
        },
        onRouteMatched: function (oEvent) {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            
            try {
                debugger;
                let n = this.extensionAPI.getNavigationController();
                let sRoute = oEvent.getParameter("name");
                if (sRoute === 'rootquery')
                {	
                    sap.ui.getCore().byId("workflowitem::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_QU_DG_WORKFLOWITEM--listReportFilter-btnGo").firePress();
                }
                // if (sRoute === 'ZC_QU_DG_WORKFLOWITEMquery' && this.PrevRoute === 'rootquery') {
                //     let oModel = this.getView().getModel();
                //     let oKeys = oEvent.getParameter("arguments").keys1;
                //     let oKeyMatReq = oKeys.split(',')[1].split('=')[1];
                //     let sContext = "/ZC_QU_DG_WORKFLOWITEM("+oKeys+")/to_matreq(reqid="+oKeyMatReq+",matnr='')";
                //     let oContext = new sap.ui.model.Context(oModel, sContext);
                //     // n.navigateInternal(oContext);
                // } 
                // else 
                if (sRoute === 'ZC_QU_DG_WORKFLOWITEMquery' && this.PrevRoute === 'ZC_QU_DG_WORKFLOWITEM/to_matreqquery') {
                    debugger;if (sPreviousHash !== undefined) {
                        window.history.go(-1);
                    } else {
                        const oRouter = this.getOwnerComponent().getRouter();
                        oRouter.navTo("overview", {}, true);
                    }

                }
                this.PrevRoute = oEvent.getParameter("name");
            } catch (error) {
                console.error("An error occurred in onRouteMatched:", error);
            }
        },
        onListNavigationExtension: function (oEvent) {
            debugger;
            let oModel = this.getView().getModel();
            let oNavigationController = this.extensionAPI.getNavigationController();
            let reqid = oEvent.getSource().getBindingContext().getObject().Technical_WorkFlow_Object;
            let workItemId = oEvent.getSource().getBindingContext().getObject().WorkItem_ID;
            let matnr = oEvent.getSource().getBindingContext().getObject().MaterialNumber;
            var oBindingContext = oEvent.getSource().getBindingContext();
            let sContext = "/ZC_QU_DG_WORKFLOWITEM(WorkItem_ID='" + workItemId + "',Technical_WorkFlow_Object='" + reqid + "')/to_matreq(reqid='" + reqid + "',matnr='" + matnr + "')";
            // let sContext = "ZC_QU_DG_MaterialRequests(reqid='"+reqid+"',matnr='')";
            let oContext = new sap.ui.model.Context(oModel, sContext);
            oNavigationController.navigateInternal(oContext);
            // if (sNavigationProperty) {
            //     var oExtensionAPI = this.extensionAPI;
            //     var fnNavigate = function () {
            //         return new Promise(function (fnResolve, fnReject) {
            //             var oModel = oBindingContext.getModel();
            //             var oTarget;
            //             oModel.createBindingContext(sNavigationProperty, oBindingContext, {}, function (oTarget) {
            //                 var oNavigationController = oExtensionAPI.getNavigationController();
            //                 oNavigationController.navigateInternal(oTarget);
            //                 fnResolve();
            //             });
            //         });
            //     };
            //     oExtensionAPI.securedExecution(fnNavigate, {
            //         busy: {
            //             check: false
            //         },
            //         dataloss: {
            //             popup: false
            //         }
            //     });

            //     return true;
            // }
            return false;
        }
    });
});
