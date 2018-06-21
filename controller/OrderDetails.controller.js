sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (Controller, History) {
	"use strict";

	return Controller.extend("anastasiya.artsyomchyk.controller.OrdersOverview", {

		onProductDetailsButtonPress: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("productDetails");
        },
        
        onBackToOrdersButtonPress: function (oEvent) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("ordersOverview", {}, true);
			}
		}
	});
});