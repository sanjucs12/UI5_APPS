sap.ui.define(
    ["sap/suite/ui/generic/template/lib/AppComponent"],
    function (Component) {
        "use strict";

        return Component.extend("workflowitem.Component", {
            metadata: {
                manifest: "json",
                dependencies: {
                    libs: ["sap.m", "sap.se.mi.plm.lib.attachmentservice"],
                    components: ["se.mi.plm.lib.attachmentservice.attachment.components.stcomponent"]
                }
            }
        });
    }
);