sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    function (Controller) {
        "use strict";

        return Controller.extend("azuretest.controller.Test", {
            onInit: function () {

            },
            handleFileSelection: function (oEvent) {
                let oFileUploader = oEvent.getSource();
                let oFile = oEvent.getParameter("files")[0];
                let oFileName = oFileUploader.getProperty('name')
                let oReader = new FileReader();
                oReader.onload = function (e) {
                    let sUrl = e.target.result;
                    let sBase64Url = sUrl.split(',')[1]
                    debugger
                }.bind(this);
                oReader.readAsDataURL(oFile);
            }
        });
    });
