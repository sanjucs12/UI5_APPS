/*global QUnit*/

sap.ui.define([
	"manage_pr/controller/ManagePR.controller"
], function (Controller) {
	"use strict";

	QUnit.module("ManagePR Controller");

	QUnit.test("I should test the ManagePR controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
