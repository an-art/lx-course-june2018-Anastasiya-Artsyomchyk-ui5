sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("anastasiya.artsyomchyk.controller.OrdersOverview", {
        /**
         * Controller's "init" lifecycle method.
         */
        onInit : function () {
			var oViewModel = new JSONModel({
				pending: 0, 
				accepted: 0, 
				countAll: 0
			});

            this.getView().setModel(oViewModel, "ordersView");
            this._oTable = this.byId("orderTable");
            this._mFilters = {
                "pending": [new  Filter("summary/status", FilterOperator.EQ,  "\'pending\'")],
                "accepted": [new Filter("summary/status", FilterOperator.EQ,   "\'accepted\'")],
                "all": []
            };
		},

        /**
         * A method to count and set the quantity of filtered items in a table, event handler.
         * Fires after items binding is updated and processed by the control.
         */
		countFilteredItems: function() {
            var oViewModel = this.getView().getModel("ordersView");
            var oODataModel = this.getView().getModel("odata");

            oODataModel.read("/Orders/$count", {
                success: function (oData) {
                    oViewModel.setProperty("/countAll", oData);
                }
            });
            oODataModel.read("/Orders/$count", {
                success: function (oData) {
                    oViewModel.setProperty("/pending", oData);
                },
                filters: this._mFilters.pending
            });
            oODataModel.read("/Orders/$count", {
                success: function(oData){
                    oViewModel.setProperty("/accepted", oData);
                },
                filters: this._mFilters.accepted
            });
		},
        
        /**
         * A method to filter a table by selected property, event handler.
         * 
         * @param {sap.ui.base.Event} oEvent event object
         */
		onTabFilter: function(oEvent ) {
            var oBinding = this._oTable.getBinding("items"),
                sKey = oEvent.getParameter("selectedKey");

            oBinding.filter(this._mFilters[sKey]);
        },

        /**
         * Open order details page, event handler.
         * 
         * @param {sap.ui.base.Event} oEvent event object
         */
		onOrderDetailsButtonPress: function (oEvent) {
            var oSource = oEvent.getSource();
            var oCtx = oSource.getBindingContext("odata");
            var oComponent = this.getOwnerComponent();

            oComponent.getRouter().navTo("orderDetails", {
                orderId: oCtx.getObject("id")
            });
		},

        /**
         * Delete order, event handler.
         * 
         * @param {sap.ui.base.Event} oEvent event object
         */
		onDeleteOrder: function (oEvent) {
			var oCtx = oEvent.getParameter("listItem").getBindingContext("odata");
			var oODataModel = oCtx.getModel();
            var sKey = oODataModel.createKey("/Orders", oCtx.getObject());
            var message;
			
			oODataModel.remove(sKey, {
				success: function () {
                    message = sap.ui.getCore().getModel("i18n").getResourceBundle().getText("orderSuccessRemove");
					MessageToast.show(message)
				},
				error: function () {
                    message = sap.ui.getCore().getModel("i18n").getResourceBundle().getText("orderErrorRemove");
					MessageBox.error(message);
				}
			});
		},

        /**
         * Open dialog window to add new order, event handler.
         */
        onAddOrderPress: function () {
            var oOrderView = this.getView();
			var oODataModel = oOrderView.getModel("odata");
			
           if (!this.oOrderDialog) {
                this.oOrderDialog = sap.ui.xmlfragment(oOrderView.getId(), "anastasiya.artsyomchyk.view.fragments.OrderDialog", this);
                oOrderView.addDependent(this.oOrderDialog);
            }
            var ID = function () {
                return '_' + Math.random().toString(36).substr(2, 9);
            };
            var oOrderCtx=oODataModel.createEntry("/Orders",{
                properties:{
                    id:ID()
                }
            });
            this.oOrderDialog.setBindingContext(oOrderCtx);
            this.oOrderDialog.setModel(oODataModel);

            this.oOrderDialog.open();
		},
        
        /**
         * Close dialog window of adding order, event handler.
         */
		onCancelPress: function () {
            var oODataModel = this.getView().getModel("odata");
            var oCtx = this.oOrderDialog.getBindingContext("odata");

            oODataModel.deleteCreatedEntry(oCtx);
            this.oOrderDialog.close();
        },

        /**
         * Submit add order changes to oData model, event handler.
         */
        onSaveOrderPress: function () {
            var oODataModel = this.getView().getModel("odata");
            oODataModel.submitChanges();
            this.oOrderDialog.close();
		},
	});
});
