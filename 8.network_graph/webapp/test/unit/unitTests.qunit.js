/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"network_graph/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
