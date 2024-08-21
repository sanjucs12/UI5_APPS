sap.ui.define(
    [

    ],
    function () {
        "use strict";
        return {
            _FileToBase64: function (oFile) {
                return new Promise((resolve, reject) => {
                    let oReader = new FileReader();
                    oReader.onload = function (e) {
                        let sUrl = e.target.result;
                        let sBase64Url = sUrl.split(',')[1]
                        resolve(sBase64Url);
                    };
                    oReader.onerror = function (error) {
                        reject(error);
                    };
                    oReader.readAsDataURL(oFile);
                });
            },
            findCategoryText: function (categories, categoryId) {
                const category = categories.find(cat => cat.categoryId === categoryId);
                return category ? category.categoryText : null;
            },

            _Base64ToBlob: function(base64){
                var byteCharacters = atob(base64);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var blob = new Blob([byteArray], { type: "application/pdf" });
                
                // Create a URL for the blob
                var url = URL.createObjectURL(blob);
                return url;
            }

        }
    }
);