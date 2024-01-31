/*global QUnit*/

sap.ui.define([
	"fragment_dialog_app/controller/UserDetail.controller"
], function (Controller) {
	"use strict";

	QUnit.module("UserDetail Controller");

	QUnit.test("I should test the UserDetail controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
