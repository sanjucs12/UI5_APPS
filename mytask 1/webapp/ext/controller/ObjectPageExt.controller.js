sap.ui.define([
  "sap/m/MessageToast",
  "sap/ui/core/routing/History",
  "zmytask/mytask/ext/utils/formatter"
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
      let workflowModel = this.getOwnerComponent().getModel("WorkflowModel");
      this.sCommentServiceURL = "/sap/opu/odata/sap/ZQU_DG_ATTACHMENT_COMMENT_SRV/";
      this.oCommentModel = new sap.ui.model.odata.v2.ODataModel(this.sCommentServiceURL, true);
      var workItemId = "";
      if (this.getView().getBindingContext() !== undefined) {
        workItemId = workflowModel.getProperty("/wi_id");
      }

      var that = this;
      if (workItemId !== "" && workItemId.indexOf("MATREQ") < 0) {
        this.oCommentModel.attachMetadataLoaded(function () {
          that.getComments(workItemId);
        });
      }
    },

    /***********Duplicate Check Code******************/
    onCheck: function (oEvent) {
      this.getView().setBusy(true);
      let sPath = this.getView().getBindingContext().getPath();
      var sUrl = "/sap/opu/odata/sap/ZC_QU_DG_MaterialsAndRequests_SRV";
      let oDataModel = this.getView().getModel();
      let reqid = this.getView().getBindingContext().getProperty().reqid;
      let matnr = this.getView().getBindingContext().getProperty().matnr;
      let DraftUUID = this.getView().getBindingContext().getProperty().DraftUUID;
      let IsActiveEntity = this.getView().getBindingContext().getProperty().IsActiveEntity
      let oModel = new sap.ui.model.odata.v2.ODataModel(sUrl);
      sap.ui.getCore().setModel(oModel);

      if (this.getView().getModel("ui").getProperty("/editable") === true)
        oDataModel.setProperty(sPath + "/dup_check_button", true);

      let oCurrentData = oDataModel.getData(sPath);
      var oApi = this.extensionAPI;
      var o = this.getView().getBindingContext();
      // delete oCurrentData.__metadata;
      var oPromise = oApi.invokeActions("/ZC_QU_DG_MaterialsAndRequestsCheck", [], { reqid: reqid, matnr: matnr, DraftUUID: DraftUUID, IsActiveEntity: IsActiveEntity });
      oPromise.then(function (aResponse) {
        oDataModel.setProperty(sPath + "/dup_check_button", false);
        let oPath = that.getView().getBindingContext().getPath();
        var oMatnr = that.getView().getModel().getData(oPath + "/matnr");
        var oMaktx = that.getView().getModel().getData(oPath + "/maktx");
        var oMbrsh = that.getView().getModel().getData(oPath + "/mbrsh");
        var oMtart = that.getView().getModel().getData(oPath + "/mtart");
        var oWerks = that.getView().getModel().getData(oPath + "/werks");

        var oJSONModel1 = new sap.ui.model.json.JSONModel({
          data: [{
            "matnr": oMatnr,
            "maktx": oMaktx,
            "mbrsh": oMbrsh,
            "mtart": oMtart,
            "werks": oWerks
          }]
        });
        that.getView().setModel(oJSONModel1, "JSONModel1");

        if (aResponse[0] && aResponse[0].response) {
          var oResponseContext = aResponse[0].response.context;
          if (oResponseContext) {
            var oJSONModel = new sap.ui.model.json.JSONModel({ data: aResponse[0].response.data.results });
            console.log(oJSONModel);
            that.getView().setModel(oJSONModel, "JSONModel");
            var oView = that.getView();

            // Create or instantiate the fragment
            if (!that._oFragment) {
              that._oFragment = sap.ui.xmlfragment(oView.getId(), "zmytask.mytask.ext.fragment.DuplicateCheck", that);
              oView.addDependent(that._oFragment);
            }

            if (!that.duplicateCheckDialog) {
              that.duplicateCheckDialog = new sap.m.Dialog({
                contentWidth: "auto",
                contentHeight: "auto",
                draggable: true,
                resizable: true,
                title: "Duplicate Check",
                content: [that._oFragment],
                buttons: [{
                  text: "Ignore Duplicates",
                  type: "Emphasized",
                  press: function () {
                    let path = that.getView().getBindingContext().getPath();
                    let oModelData = that.getView().getModel();
                    oModelData.setProperty(sPath + "/dup_indicator", "Duplicates Ignored");
                    that.duplicateCheckDialog.close();
                    sap.m.MessageToast.show("Potential duplicates Ignored");

                  }
                },
                {
                  text: "Cancel",
                  press: function () {
                    that.duplicateCheckDialog.close();

                  }
                }],
                afterClose: function () {
                }
              });
            }
            oView.addDependent(that.duplicateCheckDialog);
            that.duplicateCheckDialog.open();
            that.getView().setBusy(false);
            that.ResponseContext = oResponseContext;
          }
        }
      }, function () {
        oDataModel.setProperty(sPath + "/dup_check_button", false);
        that.getView().setBusy(false);
      });

      var that = this;
      var oNavController = this.extensionAPI.getNavigationController();


      var oView = that.getView();

      // Create or instantiate the fragment
      if (!that._oFragment) {
        that._oFragment = sap.ui.xmlfragment(oView.getId(), "zmytask.mytask.ext.fragment.DuplicateCheck", that);

      }
    },


    onItemPress: function (oEvent) {
      MessageToast.show("Custom handler invoked.");
    },
    onApprove: function (oEvent) {
      debugger;
      // this.getView().setBusy(true);
      const oHistory = History.getInstance();
      const sPreviousHash = oHistory.getPreviousHash();
      let workflowModel = this.getOwnerComponent().getModel("WorkflowModel");
      let oApi = this.extensionAPI;
      let o = this.getView().getBindingContext();
      let reqid = workflowModel.getProperty("/reqid")
      let wi_id = workflowModel.getProperty("/wi_id")
      let matnr = this.getView().getBindingContext().sDeepPath.split("'")[7]
      wi_id = wi_id;
      var oPromise = oApi.invokeActions("/ZC_QU_DG_MaterialsAndRequestsApprove", [], { reqid: reqid, matnr: "", WiId: wi_id, Step: "0", DraftUUID: "00000000-0000-0000-0000-000000000000", IsActiveEntity: "true" });
      oPromise.then(function (aResponse) {
        console.log("Response:", aResponse);
        debugger;
        // const CircularJSON = require('circular-json');
        // console.log("aResponse structure:", CircularJSON.stringify(aResponse, null, 2));
        // Extract success message from the response using optional chaining and nullish coalescing
        let successMessage = aResponse?.[0]?.response?.message ?? "";

        // Log the extracted success message
        console.log("Extracted success message:", successMessage);

        // Ensure the fragment opens and displays the success message
        if (!this._pDialog) {
            this._pDialog = this.loadFragment({
                name: "zmytask.mytask.ext.fragment.Submit"
            }).then(function (oDialog) {
                this.getView().addDependent(oDialog);
                let messageModel = new sap.ui.model.json.JSONModel({ message: successMessage });
                this.getView().setModel(messageModel, "messageModel");
                oDialog.open();
                return oDialog;
            }.bind(this));
        } else {
            this._pDialog.then(function (oDialog) {
                let messageModel = new sap.ui.model.json.JSONModel({ message: successMessage });
                this.getView().setModel(messageModel, "messageModel");
                oDialog.open();
            }.bind(this));
        }
  }.bind(this)).catch(function (oError) {
      sap.m.MessageToast.show("Approval failed, please try again.");
      console.log("Error:", oError); 
        // if (sPreviousHash !== undefined) {
        //   window.history.go(-1);
        // } else {
        //   const oRouter = this.getOwnerComponent().getRouter();
        //   oRouter.navTo("overview", {}, true);
        // }
      }, function () {
        debugger;
      });
      this.getView().setBusy(false);

    },
    onDialogOkPress: function () {
      // Close the dialog
      if (this._pDialog) {
          this._pDialog.then(function (oDialog) {
              oDialog.close();
          });
      }
  
      // Handle navigation after closing the dialog
      const oHistory = History.getInstance();
      const sPreviousHash = oHistory.getPreviousHash();
  
      if (sPreviousHash !== undefined) {
          // Navigate to the previous page in the history
          window.history.go(-1);
      } else {
          // Navigate to a specific route if no previous history exists
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("overview", {}, true); // Change "overview" to the desired route name
      }
  },
  
    onDialogCancel:function(){
      const oDialog = this.byId("idSubmit");
      if (oDialog) {
          oDialog.close();
      }

    },

    // ******Rejection code*********

    onReject: function (oEvent) {
      //REJECT FUNCTION
      this.getView().setBusy(true);
      const oHistory = History.getInstance();
      const sPreviousHash = oHistory.getPreviousHash();
      let workflowModel = this.getOwnerComponent().getModel("WorkflowModel");
      let oApi = this.extensionAPI;
      let o = this.getView().getBindingContext();
      let reqid = workflowModel.getProperty("/reqid")
      let wi_id = workflowModel.getProperty("/wi_id")
      let matnr = this.getView().getBindingContext().sDeepPath.split("'")[7]
      wi_id = wi_id;
      var oPromise = oApi.invokeActions("/ZC_QU_DG_MaterialsAndRequestsReject", [], { reqid: reqid, matnr: "", WiId: wi_id, Step: "1", DraftUUID: "00000000-0000-0000-0000-000000000000", IsActiveEntity: "true" });
      oPromise.then(function (aResponse) {
        debugger;
        if (!this._pDialog) {
          this._pDialog = this.loadFragment({
              name: "zmytask.mytask.ext.fragment.Submit"
          }).then(function (oDialog) {
              this.getView().addDependent(oDialog);
              let messageModel = new sap.ui.model.json.JSONModel({ message: successMessage });
              this.getView().setModel(messageModel, "messageModel");
              return oDialog;
          }.bind(this));
      }

      this._pDialog.then(function (oDialog) {
          oDialog.open();
      });
  }.bind(this)).catch(function (oError) {
      sap.m.MessageToast.show("Approval failed, please try again.");
      console.log("Error:", oError); 
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

    // ***********Withdraw Code**************

    onWithdraw: function(){
      this.getView().setBusy(true);
      const oHistory = History.getInstance();
      const sPreviousHash = oHistory.getPreviousHash();
      let workflowModel = this.getOwnerComponent().getModel("WorkflowModel");
      let oApi = this.extensionAPI;
      let o = this.getView().getBindingContext();
      let reqid = workflowModel.getProperty("/reqid")
      let wi_id = workflowModel.getProperty("/wi_id")
      let matnr = this.getView().getBindingContext().sDeepPath.split("'")[7]
      wi_id = wi_id;
      var oPromise = oApi.invokeActions("/ZC_QU_DG_MaterialsAndRequestsWithdraw", [], { reqid: reqid, matnr: "", WiId: wi_id, Step: "1", DraftUUID: "00000000-0000-0000-0000-000000000000", IsActiveEntity: "true" });
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
    },

    // *****************Show log timeline***********************

    onShowLog: function (oEvent) {
      this.getView().setBusy(true);
      this._PrepareLog(oEvent)

    },

    onCloseLog: function () {
      let _oDialogLog = this.getView().byId("idLogs");
      _oDialogLog.close();
      _oDialogLog.destroy();
      _oDialogLog === null;
    },


    _PrepareLog: function (oEvent) {
      let oWorkflowModel = this.getOwnerComponent().getModel("WorkflowLog");
      let workflowModellog = this.getOwnerComponent().getModel("WorkflowModel");
      let sWorkItemId = workflowModellog.getProperty("/wi_id");

      let _oDialogLog = this.getView().byId("idLogs");
      if (!_oDialogLog) {
        _oDialogLog = new sap.ui.xmlfragment(this.getView().getId(), "zmytask.mytask.ext.fragment.Logs", this);
        this.getView().addDependent(_oDialogLog);
      }
      debugger;

      oWorkflowModel.read('/WorkflowLogSet', {
        filters: [new sap.ui.model.Filter('WfId', "EQ", sWorkItemId)],
        success: function (oData, oRes) {
          let aFilteredData = oData.results.filter((item) => {
            return item.WiStat !== "PENDING"
          })
          this._LogForTimeline(aFilteredData)
          debugger;
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

    // **********Show Status Code***************

    onShowStatus: function (oEvent) {
      this.getView().setBusy(true);
      this._PrepareStatusLog(oEvent)

    },
    onCloseStatusLog: function () {
      let _oDialogStatusLog = this.getView().byId("idStatusLogs")
      _oDialogStatusLog.close();
      _oDialogStatusLog.destroy();
      _oDialogStatusLog === null;
    },
    _PrepareStatusLog: function (oEvent) {
      let oWorkflowModel = this.getOwnerComponent().getModel("WorkflowLog");
      // let sWorkItemId = this.getView().getBindingContext().sDeepPath.split("'")[1]

      let workflowModellog = this.getOwnerComponent().getModel("WorkflowModel");
      let sWorkItemId = workflowModellog.getProperty("/wi_id");

      //LOG FOR STATUS --- NETWORK GRAPH
      let _oDialogStatusLog = this.getView().byId("idStatusLogs");
      if (!_oDialogStatusLog) {
        _oDialogStatusLog = new sap.ui.xmlfragment(this.getView().getId(), "zmytask.mytask.ext.fragment.StatusLog", this);
        this.getView().addDependent(_oDialogStatusLog);
      }
      debugger

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

      //aFilteredData.reverse(); // Restore original order
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
    onAfterLayouting: function (oEvent) {
      let aNodes = oEvent.getSource().getNodes()
      aNodes.forEach((node) => {
        if (node.getStatus() === 'Standard') {
          debugger;
          node.addStyleClass('myDisabledNode')
        }
      })

    }

  };
});