sap.ui.define([
	"sap/ui/core/UIComponent",
    "sap/ui/model/odata/v2/ODataModel"
], function(UIComponent, ODataModel) {
	"use strict";

	return UIComponent.extend("anastasiya.artsyomchyk.Component", {

		metadata: {
			manifest: "json"
		},
		
		/**
		 * Initializes the Component instance after creation.
		 */
		init: function() {
			UIComponent.prototype.init.apply(this, arguments);

			var oODataModel = new ODataModel("http://localhost:3000/odata/", {
                useBatch: false,
                defaultBindingMode: "TwoWay"
            });
			var mHeaders = oODataModel.getHeaders();
			mHeaders["Access-Control-Allow-Origin"] = "*";
			oODataModel.setHeaders(mHeaders);
			oODataModel.read('/Orders');
			
			this.setModel(oODataModel, "odata");
			this.getRouter().initialize();
		}
	});
});
