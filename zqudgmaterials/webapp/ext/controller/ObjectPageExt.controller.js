sap.ui.define([
    'sap/ui/core/mvc/Controller',
    "sap/m/MessageToast",
    'sap/m/p13n/Engine',
    'sap/m/p13n/SelectionController',
    'sap/m/p13n/MetadataHelper',
    'sap/ui/core/library',
    'sap/m/ColumnListItem',
    'sap/ui/core/library',
    'sap/ui/model/json/JSONModel'
  ], function (Controller, MessageToast, Engine, SelectionController, MetadataHelper, coreLibrary, JSONModel) {
    'use strict';
  
    return {
      onInit: function () {
        var that = this;
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.attachRoutePatternMatched(this.onRouteMatched, this);
      },

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
        oDataModel.setProperty(sPath + "/dup_check_button", true);
        let oCurrentData = oDataModel.getData(sPath);
            var oApi = this.extensionAPI;
            var o = this.getView().getBindingContext();
            // delete oCurrentData.__metadata;
            var oPromise = oApi.invokeActions("/ZC_QU_DG_MaterialsAndRequestsCheck", [], { reqid: reqid, matnr: matnr, DraftUUID: DraftUUID, IsActiveEntity: IsActiveEntity });
            oPromise.then(function (aResponse) {
              oDataModel.setProperty(sPath + "/dup_check_button", false);
              let oPath = that.getView().getBindingContext().getPath();
              var oMatnr = that.getView().getModel().getData(oPath+"/matnr");
              var oMaktx = that.getView().getModel().getData(oPath+"/maktx");
              var oMbrsh = that.getView().getModel().getData(oPath+"/mbrsh");
              var oMtart = that.getView().getModel().getData(oPath+"/mtart");
              var oWerks = that.getView().getModel().getData(oPath+"/werks");
  
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
                    that._oFragment = sap.ui.xmlfragment(oView.getId(), "zqudgmmreqsts.qudgmaterialmaster.ext.fragment.DuplicateCheck", that);
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
          that._oFragment = sap.ui.xmlfragment(oView.getId(), "zqudgmaterials.zqudgmaterials.ext.fragment.DuplicateCheck", that);
  
        }
    }
  }
});