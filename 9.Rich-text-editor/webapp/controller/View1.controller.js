sap.ui.define([
	"sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller) {
		"use strict";

		return Controller.extend("texteditor.controller.View1", {
			onInit: function () {
				var oRouter = this.getOwnerComponent().getRouter();
				oRouter.getRoute("RouteView1").attachPatternMatched(this.onPatternMatched, this);
				if (!this.oTextEditorDialog) {
					this.loadFragment({
						name: "texteditor.fragments.texteditorDialog"
					}).then(function (oDialog) {
						this.oTextEditorDialog = oDialog;
						this.oTextEditorDialog.open();
					}.bind(this));
				} else {
					this.oTextEditorDialog.open();
				}

			},

			onPatternMatched: function (oEvent) {
				var oRouteData = oEvent.getParameter("arguments").details;
				console.log(oRouteData)
				this.oRouteData = JSON.parse(oRouteData)
			},

			handle_SubmitButton: function (oEvent) {

				var sRichTextValue = this.getView().byId("richTextEditor").getValue();
				console.log(sRichTextValue)
				var htmlTag = sRichTextValue;
				var tempDiv = document.createElement('div');
				tempDiv.innerHTML = htmlTag;
				var sDecodedRichText = tempDiv.querySelector('p').textContent;

				var oCommentDetails = {
					Reqid: this.oRouteData.reqId,
					Status: this.oRouteData.action,
					Email: this.oRouteData.email,
					Comment: sDecodedRichText,
				}
				var data = JSON.stringify(oCommentDetails)
				console.log(data)

				$.ajax({
					url: "https://MAZ1-DHDB-02.dalmiabharat.com:8100/sap/opu/odata/sap/ZPM_DYNAMIC_UI_SRV/ARCommentSet",
					type: 'POST',
					data: JSON.stringify(oCommentDetails),
					success: function (data) {
						console.log("success" + data);
						//this.oTextEditorDialog.close();
					},
					error: function (error) {
						console.log(error);
					}
				});
			},

			handle_CancelButton: function (oEvent) {
				//	window.close()
				this.oTextEditorDialog.close();
			}
		});
	});
