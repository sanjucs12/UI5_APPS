/*global QUnit*/

sap.ui.define([
	"qudg_tree/controller/ProductHeirarchy.controller"
], function (Controller) {
	"use strict";

	QUnit.module("ProductHeirarchy Controller");

	QUnit.test("I should test the ProductHeirarchy controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
