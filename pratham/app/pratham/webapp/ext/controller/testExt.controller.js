// sap.ui.define([
//     "sap/m/MessageToast"
// ], function (MessageToast) {
//     'use strict';

//     return {
//         onInit: function () {

//         },
//         handle_CloseBtn: function (oEvent) {
//             debugger;
//         }
//     };
// });

sap.ui.define(["sap/ui/core/mvc/ControllerExtension","sap/ui/core/Fragment"], function (
	ControllerExtension,Fragment
) {
	"use strict";

	return ControllerExtension.extend("pratham.ext.controller.testExt", {
		// this section allows to extend lifecycle hooks or hooks provided by Fiori elements
		// override: {
		// 	// routing: {
		// 	// 	onBeforeNavigation: function (oContext) {
		// 	// 		console.log("onBeforeNavigation"); //this is not invoked
		// 	// 	}
		// 	// },
		// 	onInit: function () {
		// 		this.createFragment = sap.ui.xmlfragment("pratham.ext.fragments.test", this);
		// 		this.getView().addDependent(this.createFragment);
		// 		debugger;
		// 	}
		// },
		accept: function () {
			debugger;
			this.createFragment = sap.ui.xmlfragment("pratham.ext.fragments.test", this);
			this.getView().addDependent(this.createFragment);
			this.createFragment.open()
		},
		handle_CloseBtn: function(){
			debugger;
			this.createFragment.close()
		},
		handle_Submit: function(){
			debugger;
			let data = sap.ui.getCore().byId("input").getValue()
			oModel = sap.ui.getCore().getOwnerComponent().getModel()
			oModel.create("/deptviews",data,{
				    success:function(req,res){
				        MessageBox.success("Employee Added Successfully");
						debugger;
				    },
				    error:function(err){
				        MessageBox.error(JSON.parse(err.responseText).error.message.value);
				    }
				});
		}

	});
});
