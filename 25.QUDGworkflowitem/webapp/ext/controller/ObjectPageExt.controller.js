sap.ui.define([
  "sap/m/MessageToast",
  "sap/ui/core/routing/History",
  "workflowitem/ext/utils/formatter",
], function (MessageToast, History, formatter) {
  'use strict';

  return {
    customFormatter: formatter,
    onInit: function () {
      // var that = this;
      this.sLogServiceURL = "/sap/opu/odata/sap/ZQU_DG_GETLOG_SRV_02/";
      this.oLogModel = new sap.ui.model.odata.v2.ODataModel(this.sLogServiceURL, true);

      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.attachRoutePatternMatched(this.onRouteMatched, this);
    },
    onRouteMatched: function (oEvent) {
      this.sCommentServiceURL = "/sap/opu/odata/sap/ZQU_DG_ATTACHMENT_COMMENT_SRV/";
      this.oCommentModel = new sap.ui.model.odata.v2.ODataModel(this.sCommentServiceURL, true);
      var workItemId = "";
      if (this.getView().getBindingContext() !== undefined) {
        workItemId = this.getView().getBindingContext().sDeepPath.split("'")[1];
      }

      var that = this;
      if (workItemId !== "" && workItemId.indexOf("MATREQ") < 0) {
        this.oCommentModel.attachMetadataLoaded(function () {
          that.getComments(workItemId);
        });
      }
    },
    onApprove: function (oEvent) {
      debugger;
      this.getView().setBusy(true);
      const oHistory = History.getInstance();
      const sPreviousHash = oHistory.getPreviousHash();
      let oApi = this.extensionAPI;
      let o = this.getView().getBindingContext();
      let reqid = this.getView().getBindingContext().sDeepPath.split("'")[3];
      let wi_id = this.getView().getBindingContext().sDeepPath.split("'")[1];
      let matnr = this.getView().getBindingContext().sDeepPath.split("'")[7]
      wi_id = wi_id;
      var oPromise = oApi.invokeActions("/ZC_QU_DG_MaterialRequestsApprove", [], { reqid: reqid, matnr: matnr, WiId: wi_id, Step: "0" });
      oPromise.then(function (aResponse) {
        debugger;
        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("overview", {}, true);
        }
      }, function () {
        debugger;
      });
      this.getView().setBusy(false);

    },
    onReject: function (oEvent) {
      //REJECT FUNCTION
      this.getView().setBusy(true);
      const oHistory = History.getInstance();
      const sPreviousHash = oHistory.getPreviousHash();
      let oApi = this.extensionAPI;
      let o = this.getView().getBindingContext();
      let reqid = this.getView().getBindingContext().sDeepPath.split("'")[3];
      let wi_id = this.getView().getBindingContext().sDeepPath.split("'")[1];
      let matnr = this.getView().getBindingContext().sDeepPath.split("'")[7]
      wi_id = wi_id;
      var oPromise = oApi.invokeActions("/ZC_QU_DG_MaterialRequestsReject", [], { reqid: reqid, matnr: matnr, WiId: wi_id, Step: "1" });
      oPromise.then(function (aResponse) {
        debugger;
        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("overview", {}, true);
        }
      }, function () {
        debugger;
      });
      this.getView().setBusy(false);
      // //OPENING A FRAGMENT TO GET BACK TO STEP UPON REJECTION
      // let that = this;
      // if (!this.RejectDialog) {
      //   this.RejectDialog = new sap.m.Dialog({
      //     contentWidth: "auto",
      //     contentHeight: "auto",
      //     draggable: true,
      //     resizable: true,
      //     title: "Revert Back To",
      //     content: [sap.ui.xmlfragment(this.getView().getId(), "workflowitem.ext.fragment.Reject", this)],
      //     afterClose: function () {
      //       // that.RejectDialog.destroy()
      //     },
      //     buttons: [{
      //       text: "Ok",
      //       type: "Emphasized",
      //       press: function () {
      //         //REJECT FUNCTION
      //         this.getView().setBusy(true);
      //         const oHistory = History.getInstance();
      //         const sPreviousHash = oHistory.getPreviousHash();
      //         let oApi = this.extensionAPI;
      //         let o = this.getView().getBindingContext();
      //         let reqid = this.getView().getBindingContext().sDeepPath.split("'")[3];
      //         let wi_id = this.getView().getBindingContext().sDeepPath.split("'")[1];
      //         let matnr = this.getView().getBindingContext().sDeepPath.split("'")[7]
      //         wi_id = wi_id;
      //         var oPromise = oApi.invokeActions("/ZC_QU_DG_MaterialRequestsReject", [], { reqid: reqid, matnr: matnr, WiId: wi_id, Step: "1" });
      //         oPromise.then(function (aResponse) {
      //           debugger;
      //           if (sPreviousHash !== undefined) {
      //             window.history.go(-1);
      //           } else {
      //             const oRouter = this.getOwnerComponent().getRouter();
      //             oRouter.navTo("overview", {}, true);
      //           }
      //         }, function () {
      //           debugger;
      //         });
      //         this.getView().setBusy(false);

      //       }
      //     }, {
      //       text: "Cancel",
      //       press: function () {
      //         that.RejectDialog.close();
      //       }
      //     }]
      //   });
      // }
      // this.getView().addDependent(this.RejectDialog);

      // let oBindingContext = this.getView().getModel().createEntry("/ZC_QU_DG_WORKFLOWITEM", {})
      // this.getView().getModel().setProperty(oBindingContext.getPath() + '/ApprovalStepType', '123')
      // this.RejectDialog.setBindingContext(oBindingContext);
      // this.RejectDialog.open();
      // debugger;
    },
    onShowStatus: function (oEvent) {
      this.getView().setBusy(true);
      this._PrepareStatusLog(oEvent)

    },
    onCloseStatusLog: function () {
      let _oDialogStatusLog = this.getView().byId("idStatusLogs")
      _oDialogStatusLog.close();
      _oDialogStatusLog.destroy();
    },
    _PrepareStatusLog: function (oEvent) {
      let oWorkflowModel = this.getOwnerComponent().getModel("WorkflowLog");
      let sWorkItemId = this.getView().getBindingContext().sDeepPath.split("'")[1]

      //LOG FOR STATUS --- NETWORK GRAPH
      let _oDialogStatusLog = this.getView().byId("idStatusLogs");
      if (!_oDialogStatusLog) {
        _oDialogStatusLog = sap.ui.xmlfragment(this.getView().getId(), "workflowitem.ext.fragment.StatusLog", this);
        this.getView().addDependent(_oDialogStatusLog);
      }

      oWorkflowModel.read('/WorkflowLogSet', {
        filters: [new sap.ui.model.Filter('WfId', "EQ", sWorkItemId)],
        success: function (oData, oRes) {
          this._LogForGraph(oData.results)
          this.getView().setBusy(false)
          _oDialogStatusLog.open()
        }.bind(this),
        error: function (oErr) {
          this.getView().setBusy(false)
        }.bind(this),
      })
    },
    _LogForGraph: function (aData) {
      let aLogData = aData
      const seenSequences = new Set();
      const aFilteredData = [];

      for (let i = aLogData.length - 1; i >= 0; i--) {
        if (!seenSequences.has(aLogData[i].Sequence)) {
          seenSequences.add(aLogData[i].Sequence);
          aFilteredData.push(aLogData[i]);
        }
      }

      aFilteredData.reverse(); // Restore original order
      debugger;
      let aNodes = aFilteredData
      let aLines = []
      aFilteredData.forEach(item => {
        const { Sequence, Preceeding_seq } = item;
        if (Sequence === 'START') {
          aLines.push({ from: 'START', to: '1-1', lineType: 'Dotted' });
        }
        const predecessors = Preceeding_seq.split('&');
        predecessors.forEach(predecessor => {
          if (predecessor !== "0-0" && predecessor !== "") {
            aLines.push({ from: predecessor, to: Sequence });
          }
        });

      });
      const oGraphData = {
        nodes: aNodes,
        lines: aLines
      };
      debugger;
      var oNetworkModel = new sap.ui.model.json.JSONModel(oGraphData);
      this.byId('networkGraph').setModel(oNetworkModel, 'StatusLogModel')
    },
    onShowLog: function (oEvent) {
      this.getView().setBusy(true);
      this._PrepareLog(oEvent)

    },
    onCloseLog: function () {
      let _oDialogLog = this.getView().byId("idLogs");
      _oDialogLog.close();
      _oDialogLog.destroy();
    },
    _PrepareLog: function (oEvent) {
      let oWorkflowModel = this.getOwnerComponent().getModel("WorkflowLog");
      let sWorkItemId = this.getView().getBindingContext().sDeepPath.split("'")[1]

      let _oDialogLog = this.getView().byId("idLogs");
      if (!_oDialogLog) {
        _oDialogLog = sap.ui.xmlfragment(this.getView().getId(), "workflowitem.ext.fragment.Logs", this);
        this.getView().addDependent(_oDialogLog);
      }

      oWorkflowModel.read('/WorkflowLogSet', {
        filters: [new sap.ui.model.Filter('WfId', "EQ", sWorkItemId)],
        success: function (oData, oRes) {
          this._LogForTimeline(oData.results)
          this.getView().setBusy(false)
          _oDialogLog.open()
        }.bind(this),
        error: function (oErr) {
          this.getView().setBusy(false)
        }.bind(this),
      })
    },
    _LogForTimeline: function (aData) {
      var logModel = new sap.ui.model.json.JSONModel();
      logModel.setData({ "LogCollection": aData });
      this.getView().byId("logList").setModel(logModel, "logModel");
    },

    prepareLog: function (oEvent) {
      var that = this;
      // this.getView().setBusy(true);
      var logModel = this.getOwnerComponent().getModel("LogService");
      var oEventSrc = oEvent.getSource();
      this._logList = null;
      this.__logList = sap.ui.xmlfragment(
        "workflowitem.ext.fragment.Logs",
        this
      );

      this.getView().addDependent(this._logList);
      var workItemId = "";
      if (this.getView().getBindingContext() !== undefined) {
        workItemId = this.getView().getBindingContext().sDeepPath.split("'")[1];
      }
      if (workItemId !== "" && workItemId.indexOf("MATREQ") < 0) {

        logModel.read("/WorkitemSet('" + workItemId + "')/ToWorkflowlog1", {
          success: jQuery.proxy(function (mOdata, response) {
            console.log(mOdata);
            var logModel = new sap.ui.model.json.JSONModel();
            logModel.setData({ "LogCollection": [] });
            logModel.setData({ "LogCollection": mOdata.results });
            sap.ui.getCore().byId("logList").setModel(logModel, "logModel");
            this.getView().setModel(logModel, "logModel");
            this.getView().setBusy(false);
            this.__logList.open();
          }, this),
          error: jQuery.proxy(function (oError) {
            this.getView().setBusy(false);
            try {
              var msg = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
              sap.m.MessageBox.error(msg, {
                title: "Error",
                id: "messagexxxddBoxId1"

              });
            } catch (e) {
              sap.m.MessageBox.error("Error message", {
                title: "Error",
                id: "messageddBoxId1"
              });
            }
          }, this)
        });

      }

    },
    getComments: function (workItemId) {
      var that = this;
      that.oCommentModel.read("/TaskSet('" + workItemId + "')/TaskToComments", {
        success: jQuery.proxy(function (mOdata, response) {
          var localModel = new sap.ui.model.json.JSONModel();
          localModel.setData({ "EntryCollection": [] });
          // localModel.setData({"WorkItemId":workItemId });
          // that.getOwnerComponent().setModel(localModel,"localModel");
          if (mOdata.results.length > 0) {
            var deleteActionObject = [];
            deleteActionObject.push({
              "Text": "Delete",
              "Icon": "sap-icon://delete",
              "Key": "delete"
            });
            for (var count = 0; count < mOdata.results.length; count++) {
              if (mOdata.results[count].Delete === "X") {
                mOdata.results[count].Actions = deleteActionObject;
              }
              else {
                mOdata.results[count].Actions = [];
              }

            }
          }
          localModel.setData({ "EntryCollection": mOdata.results });
          that.getView().setModel(localModel, "localCommentModel");
          console.log("get success");
          console.log(mOdata);

        }, this),
        error: jQuery.proxy(function (oError) {

          try {
            var msg = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
            sap.m.MessageBox.error(msg, {
              title: "Error",
              id: "messagexxxddBoxId1"


            });
          } catch (e) {
            sap.m.MessageBox.error("Error message", {
              title: "Error",
              id: "messageddBoxId1"


            });
          }

        }, this)
      });
    }
  }
});