jQuery.sap.require("invcat.libs.xlsx");
sap.ui.define(
    ["sap/suite/ui/generic/template/lib/AppComponent"],
    function (Component) {
        "use strict";

        return Component.extend("invcat.Component", {
            metadata: {
                manifest: "json"
            }
        });
    }
);