jQuery.sap.require("uploadexcel.libs.xlsx");

sap.ui.define(
    ["sap/suite/ui/generic/template/lib/AppComponent"],
    function (Component) {
        "use strict";

        return Component.extend("uploadexcel.Component", {
            metadata: {
                manifest: "json"
            }
        });
    }
);