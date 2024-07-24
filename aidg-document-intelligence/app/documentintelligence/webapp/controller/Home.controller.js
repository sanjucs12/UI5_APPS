sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    function (Controller) {
        "use strict";

        return Controller.extend("documentintelligence.controller.Home", {
            onInit: function () {
                var oPayload = { testString: "sTestString" };
                fetch("/odata/v4/catalog/testFunction")
                    .then(response => {
                        if (response.ok) {
                            debugger
                        } else {
                            debugger
                        }
                    })
                    .catch(error => {
                        console.error("Error uploading file:", error);
                    });
            }
        });
    });
