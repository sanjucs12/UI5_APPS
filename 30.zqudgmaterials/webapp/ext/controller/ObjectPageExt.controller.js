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
      if (this.getView().getModel("ui").getProperty("/editable") === true) {
        oDataModel.setProperty(sPath + "/dup_check_button", true);
      }

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
    },

    // ******P13N code**********

    _registerForP13n: function () {
      const oTable = this.byId("persoTable");

      this.oMetadataHelper = new MetadataHelper([{
        key: "Material",
        label: "Material",
        path: "Material"
      },
      {
        key: "Description",
        label: "Description",
        path: "Description"
      },
      {
        key: "MaterialType",
        label: "MaterialType",
        path: "MaterialType"
      },
      {
        key: "IndustrySector",
        label: "IndustrySector",
        path: "IndustrySector"
      },
      {
        key: "Plant",
        label: "Plant",
        path: "Plant"
      },
      {
        key: "Score",
        label: "Score",
        path: "Score"
      },
      {
        key: "Rule",
        label: "Rule",
        path: "Rule"
      }
      ]);

      const _oMetadataHelperRows = new MetadataHelper("JSONModel1");

      Engine.getInstance().register(oTable, {
        helper: this.oMetadataHelper,
        controller: {
          Columns: new SelectionController({
            targetAggregation: "columns",
            control: oTable,
            persistenceIdentifier: "selection-columns"
          }),
          Rows: new SelectionController({
            targetAggregation: "items",
            helper: _oMetadataHelperRows,
            control: oTable,
            persistenceIdentifier: "selection-items",
            enableReorder: false,
            getKeyForItem: function (oListItem) {
              return oListItem.getCells()[0].getText();
            }
          })
        }
      });

      Engine.getInstance().attachStateChange(this.handleStateChange.bind(this));
    },

    openPersoDialog: function (oEvt) {
      const oTable = this.byId("persoTable");
      this._registerForP13n();

      Engine.getInstance().show(oTable, ["Columns"], {
        contentHeight: "35rem",
        contentWidth: "32rem",
        source: oEvt.getSource()
      });
    },

    handleStateChange: function (oEvt) {
      const oTable = this.byId("persoTable");
      const oState = oEvt.getParameter("state");

      if (!oState) {
        return;
      }

      oTable.getColumns().forEach(function (oColumn, iIndex) {
        oColumn.setVisible(false);
        console.log('bande');
        oColumn.setSortIndicator(coreLibrary.SortOrder.None);
        oColumn.data("grouped", false);
      });

      oState.Columns.forEach(function (oProp, iIndex) {
        const oCol = this.byId(oProp.key);
        oCol.setVisible(true);
        console.log(oState);
        console.log('illi bande');
        oTable.removeColumn(oCol);
        oTable.insertColumn(oCol, iIndex);
      }.bind(this));

      oTable.getItems().forEach(function (oItem, iIndex) {
        oItem.setVisible(false);
      });

      oState.Rows.forEach(function (oProp, iIndex) {
        const aItems = this.byId("persoTable").getItems();
        // var oRelevantCol = aItems[0].getCells().find((cell) => true);

        // find index of cell with "id", that can be used later
        const oFoundItem = aItems.find((oItem) => oItem.getCells()[0].getText() == oProp.key);

        oFoundItem.setVisible(true);

        oTable.removeItem(oFoundItem);
        oTable.insertItem(oFoundItem, iIndex);
      }.bind(this));

      //Update the columns per selection in the state
      this.updateColumns(oState);

      const aCells = oState.Columns.map(function (oColumnState) {
        return new Text({
          text: "{" + this.oMetadataHelper.getProperty(oColumnState.key).path + "}"
        });
      }.bind(this));

      //rebind the table with the updated cell template
      oTable.bindItems({
        templateShareable: false,
        path: 'JSONModel1>/data',
        template: new ColumnListItem({
          cells: aCells
        })
      });
    },
    updateColumns: function (oState) {
      const oTable = this.byId("persoTable");

      oTable.getColumns().forEach(function (oColumn, iIndex) {
        oColumn.setVisible(false);
        oColumn.data("grouped", false);
      }.bind(this));

      oState.Columns.forEach(function (oProp, iIndex) {
        const oCol = this.byId(oProp.key);
        oCol.setVisible(true);

        oTable.removeColumn(oCol);
        oTable.insertColumn(oCol, iIndex);
      }.bind(this));
    },
    _getKey: function (oControl) {
      console.log(oControl);
      return sap.ui.getCore().getLocalId(oControl.getId());
    }
  }
});