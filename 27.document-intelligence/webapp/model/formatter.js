sap.ui.define(
    [
        "sap/m/plugins/UploadSetwithTable"
    ],
    function (UploadSetwithTable) {
        "use strict";
        return {
            getIconSrc: function (mediaType, thumbnailUrl) {
                debugger;
                return UploadSetwithTable.getIconForFileType(mediaType, thumbnailUrl);
            },

            _getModelId: function (docId) {
                let sModelId
                if (docId === 'pan' || docId === 'aadhaar') {
                    sModelId = 'prebuilt-idDocument'
                } else if (docId === 'invoice') {
                    sModelId = 'prebuilt-invoice'
                } else if (docId === 'receipt') {
                    sModelId = "prebuilt-receipt"
                }
                return sModelId;
            },

        }
    }
);