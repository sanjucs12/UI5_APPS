sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
  ], function (MessageToast, History) {
    'use strict';
   
    return {

		onViewButtonPress: function (oEvent) {
            debugger;
			let oModel = this.getView().getModel();
			let n = this.extensionAPI.getNavigationController();
            
			var oItemSelectedPath = oEvent.getSource().getBindingContext().getPath();
			var oItemSelected = oEvent.getSource().getBindingContext().getModel().getProperty(oItemSelectedPath);
            
            let sContext = "/ZC_QUDG_BOMHEADERREQUESTTP(request_id='', stlnr='"+ oItemSelected.billofmaterial +"',stlty='"+ oItemSelected.billofmaterialcategory+"',stlal='"+ oItemSelected.billofmaterialvariant+"',bom_versn='"+ oItemSelected.billofmaterialversion+"',aennr='',matnr='"+ oItemSelected.material+"',werks='"+ oItemSelected.plant+"',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)"
            // let sContext = "/ZC_QUDG_BOMHEADERREQUESTTP(BillOfMaterial='"+ oItemSelected.BillOfMaterial+"',BillOfMaterialCategory='"+ oItemSelected.BillOfMaterialCategory+"',BillOfMaterialVariant='"+ oItemSelected.BillOfMaterialVariant+"',BillOfMaterialVersion='"+ oItemSelected.BillOfMaterialVariant+"',EngineeringChangeDocument='"+ oItemSelected.EngineeringChangeDocument+"',Material='"+ oItemSelected.Material+"',Plant='"+ oItemSelected.Plant+"')";
			// var aFilters = [
			// 	new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, oItemSelected.BillOfMaterialComponent),
			// 	new sap.ui.model.Filter("BillOfMaterialCategory", sap.ui.model.FilterOperator.EQ, oItemSelected.BillOfMaterialCategory)
			// ];

			// this.getView().getModel().read("/ZC_QUDG_BillOfMaterialTP", {
			// 		filters: aFilters,
			// 		success: jQuery.proxy(function (data) {
			// 			var oNavController = this.extensionAPI.getNavigationController();
			// 			var oData = data.results[0];
			// 			debugger;
			// 			let sContext = "/ZC_QUDG_BillOfMaterialTP(BillOfMaterial='"+ oData.BillOfMaterial+"',BillOfMaterialCategory='"+ oData.BillOfMaterialCategory+"',BillOfMaterialVariant='"+ oData.BillOfMaterialVariant+"',BillOfMaterialVersion='"+ oData.BillOfMaterialVersion+"',EngineeringChangeDocument='"+ oData.EngineeringChangeDocument+"',Material='"+ oData.Material+"',Plant='"+ oData.Plant+"')";
			// 			// // exampe  :::: let sContext = "/ZC_QUDG_BillOfMaterialTP(BillOfMaterial='00000100',BillOfMaterialCategory='M',BillOfMaterialVariant='1',BillOfMaterialVersion='',EngineeringChangeDocument='',Material='MATNR1004',Plant='1000')";
			// 			 let oContext = new sap.ui.model.Context(oModel,sContext);
			// 			 n.navigateInternal(oContext);

			// 		},this)


			// });
			

		}

	 } });