sap.ui.define(
    [
        "sap/ui/core/format/DateFormat"
    ],
    function (DateFormat) {
        "use strict";

        return {
            dateFormatter: function (date) {
                if (date) {
                    var newDate = new Date(date)
                    var dateInstance = DateFormat.getDateInstance({
                        pattern: "dd-MMM-yyyy"
                    })
                    return dateInstance.format(newDate);

                }
            },

            statusColorFormatter: function (status) {
                if (status === "Available") {
                    return "Success"
                } else {
                    return "Error"
                }
            },
        }
    }
);
