/*global QUnit*/

sap.ui.define([
	"inventory/controller/inventory.controller"
], function (Controller) {
	"use strict";

	QUnit.module("inventory Controller");

	QUnit.test("I should test the inventory controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
