/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"prpo-sample/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
