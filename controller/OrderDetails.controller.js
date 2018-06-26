sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function(Controller, History, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("anastasiya.artsyomchyk.controller.OrderDetails", {
        /**
         * Controller's "init" lifecycle method.
         */
        onInit: function() {           
            var oComponent = this.getOwnerComponent();
            var oRouter = oComponent.getRouter();
            oRouter.getRoute("orderDetails").attachPatternMatched(this.onPatternMatched, this);
            this.oOrderViewModel = new JSONModel({
                editShip: false,
                editCustomer: false
            });
            this.getView().setModel(this.oOrderViewModel, "orderView");
        },

        /**
         * "orderDetails" route pattern matched event handler.
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
		onPatternMatched: function(oEvent) {            
			var that = this;
			var mRouteArguments = oEvent.getParameter("arguments");
			var sOrderID = mRouteArguments.orderId;

			var oODataModel = this.getView().getModel("odata");
			oODataModel.metadataLoaded().then(function() {
				var sKey = oODataModel.createKey("/Orders", {id: sOrderID});
				that.getView().bindObject({
					path: sKey,
					model: "odata"
				});
			});
		},

        /**
         * Change ship form mode to editable, show buttons "Save" and "Cancel", event handler.
         */
		onEditShipPress: function() {
            this.oOrderViewModel.setProperty("/editShip", true);
		},
        
        /**
         * Change customer form mode to editable, show buttons "Save" and "Cancel", event handler.
         */
		onEditCustomerPress: function() {
            this.oOrderViewModel.setProperty("/editCustomer", true);
		},
        
        /**
         * Reset ship form changes and set its mode to non-editable, event handler.
         */
		onCancelShipPress: function() {
            this.oOrderViewModel.setProperty("/editShip", false);
            var oODataModel = this.getView().getModel("odata");
            oODataModel.resetChanges();
		},
        
        /**
         * Reset customer form changes and set its mode to non-editable, event handler.
         */
        onCancelCustomerPress: function() {
            this.oOrderViewModel.setProperty("/editCustomer", false);
            var oODataModel = this.getView().getModel("odata");
            oODataModel.resetChanges();
		},
        
        /**
         * Submit ship form changes to oData model, set form's mode to non-editable, event handler.
         */
        onSaveShipPress: function() {
            this.oOrderViewModel.setProperty("/editShip", false);
            var oODataModel = this.getView().getModel("odata");
            oODataModel.submitChanges();
            var message = sap.ui.getCore().getModel("i18n").getResourceBundle().getText("shipInfoChange");
            MessageToast.show(message);
		},
        
        /**
         * Submit customer form changes to oData model, set form's mode to non-editable, event handler.
         */
        onSaveCustomerPress: function() {
            this.oOrderViewModel.setProperty("/editCustomer", false);
            var oODataModel = this.getView().getModel("odata");
            oODataModel.submitChanges();
            var message = sap.ui.getCore().getModel("i18n").getResourceBundle().getText("customerInfoChange");
            MessageToast.show(message);
        },
        
        /**
         * Open product details page, event handler.
         * 
         * @param {sap.ui.base.Event} oEvent event object
         */
		onProductDetailsButtonPress: function(oEvent) {
			var oSource = oEvent.getSource();
			var oCtx = oSource.getBindingContext("odata");
			var oComponent = this.getOwnerComponent();

            oComponent.getRouter().navTo("productDetails", {
                productId: oCtx.getObject("id")
            });
		},
        
        /**
         * Delete product, event handler.
         * 
         * @param {sap.ui.base.Event} oEvent event object
         */
		onDeleteProductPress: function(oEvent) {
            var oCtx = oEvent.getParameter("listItem").getBindingContext("odata");
            var oODataModel = oCtx.getModel();
            var sKey = oODataModel.createKey("/OrderProducts", oCtx.getObject());
            var message;

            oODataModel.remove(sKey, {
                success: function () {
                    message = sap.ui.getCore().getModel("i18n").getResourceBundle().getText("productSuccessRemove");
                    MessageToast.show(message);
                },
                error: function () {
                    message = sap.ui.getCore().getModel("i18n").getResourceBundle().getText("productErrorRemove");
                    sap.m.MessageBox.error(message);
                }
            });
        },
        
        /**
         * Nav back to previous page, if it exists in history, or nav to orders Overview page, event handler.
         */
        onBackToOrdersButtonPress: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("ordersOverview", {}, true);
			}
		},

        /**
         * Open dialog window to add new product, event handler.
         * 
         * @param {sap.ui.base.Event} oEvent event object
         */
		onAddProductPress:function (oEvent) {
            var oView = this.getView();
            var oODataModel = oView.getModel("odata");
            var oCtx = oEvent.getSource().getBindingContext("odata");
            var sOrderID = oCtx.getObject().id;
            
            if(!this.oProductDialog) {
                this.oProductDialog = sap.ui.xmlfragment(oView.getId(), "anastasiya.artsyomchyk.view.fragments.ProductDialog", this);
                oView.addDependent(this.oProductDialog);
            }
            var ID = function() {
                return '_' + Math.random().toString(36).substr(2, 9);
            };
            var oProductCtx = oODataModel.createEntry("/OrderProducts",{
                properties: {
                    orderId: sOrderID,
                    id: ID()
                }
            });

            this.oProductDialog.setBindingContext(oProductCtx);
            this.oProductDialog.setModel(oODataModel);
            this.oProductDialog.open();
		},
        
        /**
         * Submit add product changes to oData model, event handler.
         */
		onSaveProductPress: function () {
			var oODataModel = this.getView().getModel("odata");
			
            oODataModel.submitChanges();
            console.log(oODataModel.oData);
            this.oProductDialog.close();
		},
        
        /**
         * Close dialog window of adding product, event handler.
         */
		onCancelProductPress: function () {
            var oODataModel = this.getView().getModel("odata");
            var oCtx = this.oProductDialog.getBindingContext("odata");

            oODataModel.deleteCreatedEntry(oCtx);
            this.oProductDialog.close();
        }
	});
});