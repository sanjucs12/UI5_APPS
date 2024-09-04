sap.ui.define([], function () {
	return {
		formatDateForView: function (value) {
			if (value) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-ddTHH:mm:ss"
					//UTC: true
				});
				return oDateFormat.format(new Date(value));
			} else {
				return value;
			}
		},
		formatStatusMsg: function (value) {
			if (value === "Success") {
				return "Success";
			} else if (value === "Error") {
				return "Error";
			}
		},
		formatcheckbox: function (value) {
			if (value === "X") {
				return true;
			} else if (value === "") {
				return false;
			}
		},
		formatStatusClass: function (e) {
			var t = "";
			if (e === "REL") {
				t = "releasedStat"
			} else if (e === "CRTD") {
				t = "createdStat"
			} else if (e === "PCNF") {
				t = "partiallyConfirmedStat"
			} else if (e === "Delay") {
				t = "delayStat"
			} else if (e === "NOPR") {
				return "noprStat"
			} else if (e === "OSNO") {
				return "osnoStat"
			} else if (e === "INST") {
				return "instStat"
			} else if (e === "AVLB") {
				return "avlbStat"
			} else if (e === "ASEQ") {
				return "aseqStat"
			} else {
				t = "customNone"
			}
			return t
		}
	}
});