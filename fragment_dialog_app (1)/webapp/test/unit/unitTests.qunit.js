/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"fragment_dialog_app/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
