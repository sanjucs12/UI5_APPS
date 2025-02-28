/*global QUnit*/

sap.ui.define([
	"azuretest/controller/Test.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Test Controller");

	QUnit.test("I should test the Test controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
