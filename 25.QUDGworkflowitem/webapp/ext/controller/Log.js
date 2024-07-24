sap.ui.define(["sap/m/MessageBox"], function (MessageBox) {
    "use strict";

    return {
        onSenderPress: function () {
            MessageBox.show("Button Sender pressed!");
        },
        onIconPress: function () {
            MessageBox.show("Button Icon pressed!");
        }
       
        
       
    };
});