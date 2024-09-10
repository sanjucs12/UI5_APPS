function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZP_QU_DG_NOTIFICATION_CDS/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}