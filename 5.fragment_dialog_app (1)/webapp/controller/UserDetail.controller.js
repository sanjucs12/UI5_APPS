sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("fragmentdialogapp.controller.UserDetail", {
            onInit: function () {

            },
            openDialogControl: function(){
                if(!this.oDialog){
                    this.loadFragment({
                        name: "fragmentdialogapp.fragments.dialog"
                    }).then(function(oDialog){
                        this.oDialog = oDialog;
                        this.oDialog.open();
                    }.bind(this));
                } else {
                    this.oDialog.open();
                }
                
            },
            handleDialogClose: function(){
                this.oDialog.close();
            }
        });
    });
