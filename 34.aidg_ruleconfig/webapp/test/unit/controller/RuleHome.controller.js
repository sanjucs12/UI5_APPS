/*global QUnit*/

sap.ui.define([
	"aidg_ruleconfig/controller/RuleHome.controller"
], function (Controller) {
	"use strict";

	QUnit.module("RuleHome Controller");

	QUnit.test("I should test the RuleHome controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
