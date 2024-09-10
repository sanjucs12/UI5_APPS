/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/airdit/qudg/qudglpad/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});