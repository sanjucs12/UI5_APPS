jQuery.sap.require("zinvcategory.libs.xlsx");

sap.ui.define(
    ["sap/suite/ui/generic/template/lib/AppComponent"],
    function (Component) {
        "use strict";

        return Component.extend("zinvcategory.Component", {
            metadata: {
                manifest: "json"
            }
        });
    }
);