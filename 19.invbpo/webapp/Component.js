jQuery.sap.require("invbpo.libs.xlsx");
sap.ui.define(
    ["sap/suite/ui/generic/template/lib/AppComponent"],
    function (Component) {
        "use strict";

        return Component.extend("invbpo.Component", {
            metadata: {
                manifest: "json"
            }
        });
    }
);