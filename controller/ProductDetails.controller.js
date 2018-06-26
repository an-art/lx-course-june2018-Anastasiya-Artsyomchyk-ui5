sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(Controller, History, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("anastasiya.artsyomchyk.controller.ProductDetails", {
		/**
         * Controller's "init" lifecycle method.
         */
		onInit: function() {
			var oComponent = this.getOwnerComponent();
			var oRouter = oComponent.getRouter();

			oRouter.getRoute("productDetails").attachPatternMatched(this.onPatternMatched, this);
		},

		/**
         * "productDetails" route pattern matched event handler.
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
		onPatternMatched: function(oEvent) {
			var that = this;
			var mRouteArguments = oEvent.getParameter("arguments");
			var sProductID = mRouteArguments.productId;
			var oODataModel = this.getView().getModel("odata");

			oODataModel.metadataLoaded().then(function() {
				var sKey = oODataModel.createKey("/OrderProducts", {id: sProductID});

				that.getView().bindObject({
					path: sKey,
					model: "odata"
				});
			});
		},

		/**
         * Nav back to previous page, if it exists in history, or nav to orders Overview page, event handler.
         */
		onBackToOrderButtonPress: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if(sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("ordersOverview", {}, true);
			}

		},

		/**
		 * Add new comment to oData model, event handler.
		 * 
		 * @param {sap.ui.base.Event} oEvent event object.
		 */
		onPostCommentPress: function(oEvent) {
			var oODataModel = this.getView().getModel("odata");
			var oCtx = oEvent.getSource().getBindingContext("odata");
			var sProductID = oCtx.getObject().id;
			var ID = function() {
				return '_' + Math.random().toString(36).substr(2, 9);
			};
			var mComment=  {
				"comment": this.byId('commentText').getValue(),
				"author": this.byId('commentAuthor').getValue(),
				"rating": this.byId('commentRating').getValue(),
				"id": ID(),
				"productId": sProductID
			};

			oODataModel.create("/ProductComments", mComment, {
				var message;
				success: function () {
					message = sap.ui.getCore().getModel("i18n").getResourceBundle().getText("commentSuccessPost");
					MessageToast.show(message)
				},
				error: function () {
					message = sap.ui.getCore().getModel("i18n").getResourceBundle().getText("commentErrorPost");
					MessageBox.error(message);
				}
			});
			this.byId('commentAuthor').setValue(' ');
			this.byId('commentRating').setValue(0);
		}
	});
});