/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"airditaiwmsckinpo/aiwm_po/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
