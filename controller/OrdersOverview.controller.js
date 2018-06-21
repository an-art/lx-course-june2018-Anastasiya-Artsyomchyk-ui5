sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("anastasiya.artsyomchyk.controller.OrdersOverview", {

		onOrderDetailsButtonPress: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("orderDetails");
		}
	});
});