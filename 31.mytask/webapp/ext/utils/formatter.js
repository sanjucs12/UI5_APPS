sap.ui.define(
    [

    ],
    function () {
        "use strict";
        return {
            logStatusFormatter: function (text) {
                if (text === "SUBMITTED") {
                    return 'Warning'
                } else if (text === "STARTED") {
                    return 'Information'
                } else if (text === "REJECTED") {
                    return 'Error'
                } else if (text === "APPROVED") {
                    return 'Success'
                } else if (text === 'READY') {
                    return "None"
                } else if (text === 'PENDING') {
                    return "Standard"
                }

            },

            dateTimeFormat: function (oDate, oTime) {
                debugger;
                if (oDate && oTime) {
                    let sDate = oDate.toDateString()
                    let time = oTime.ms
                    let newDateTime = new Date(sDate)
                    return newDateTime.setMilliseconds(time)
                }

            },
            logStatusClassFormatter: function (text) {
                debugger;
                if (text === 'PENDING') {
                    return 'myDisabledNode'
                }
            }

        }
    }
);