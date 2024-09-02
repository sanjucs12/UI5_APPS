sap.ui.define(["sap/m/MessageBox"], function (MessageBox) {
    "use strict";

    return {
        onSenderPress: function () {
            MessageBox.show("Button Sender pressed!");
        },
        onIconPress: function () {
            MessageBox.show("Button Icon pressed!");
        },
        onPost: function (oEvent) {
            let oApi = this.extensionAPI;
            let workflowModel = this.getOwnerComponent().getModel("WorkflowModel");
            this.sCommentServiceURL = "/sap/opu/odata/sap/ZQU_DG_ATTACHMENT_COMMENT_SRV/";
            this.oCommentModel = new sap.ui.model.odata.v2.ODataModel(this.sCommentServiceURL, true);
            this.getView().setModel(this.oCommentModel, "CommentModel");
            var workItemId = workflowModel.getProperty("/wi_id")
            var oPayload = {
                "InstanceId": workItemId,
                "Id": "",
                "Filename": "USER COMMENTS",
                "CreatedAt": new Date(),
                "CreatedBy": "CHALLA0185",
                "Text": oEvent.getParameter("value")

            }
            var that = this;
            this.oCommentModel.attachMetadataLoaded(function () {
                that.oCommentModel.create("/TaskSet('" + workItemId + "')/TaskToComments", oPayload, {
                    success: jQuery.proxy(function (mOdata, response) {
                        console.log("post success");
                        that.getComments(workItemId);

                    }, this),
                    error: jQuery.proxy(function (oError) {
                        try {
                            var msg = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
                            sap.m.MessageBox.error(msg, {
                                title: "Error",
                                id: "messagexxxddBoxId1"


                            });
                        } catch (e) {
                            sap.m.MessageBox.error("Error message", {
                                title: "Error",
                                id: "messageddBoxId1"


                            });
                        }

                    }, this)
                });
            });


        },
        readComments: function (workItem, model) {
            model.read("/TaskSet('" + workItem + "')/TaskToComments", oPayload, {
                success: jQuery.proxy(function (mOdata, response) {
                    console.log("success");
                    console.log(mOdata);

                }, this),
                error: jQuery.proxy(function (oError) {

                    try {
                        var msg = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
                        sap.m.MessageBox.error(msg, {
                            title: "Error",
                            id: "messagexxxddBoxId1"


                        });
                    } catch (e) {
                        sap.m.MessageBox.error("Error message", {
                            title: "Error",
                            id: "messageddBoxId1"


                        });
                    }

                }, this)
            });
        },
        onActionPressed: function(oEvent){
            var selectedComment = oEvent.getSource().sId.split("-")[6];
            var commentData= this.getView().getModel("localCommentModel").getData().EntryCollection[selectedComment];
            var that = this;
            that.oCommentModel.remove("/CommentSet(InstanceId='" + commentData.InstanceId +"',Id='" + commentData.Id + "')", {
                success: jQuery.proxy(function (mOdata, response) {
                    that.getComments(commentData.InstanceId);
                }, this),
                error: jQuery.proxy(function (oError) {

                    try {
                        var msg = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
                        sap.m.MessageBox.error(msg, {
                            title: "Error",
                            id: "messagexxxddBoxId1"
                        });
                    } catch (e) {
                        sap.m.MessageBox.error("Error message", {
                            title: "Error",
                            id: "messageddBoxId1"
                        });
                    }

                }, this)
            });
        }
       
    };
});