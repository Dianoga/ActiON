var Action = new Backbone.Marionette.Application();

Action.uri = 'https://graph.api.smartthings.com/api/smartapps/installations/825c747f-6845-4d4d-a4db-e618856b01d2/';
Action.access_token = 'd575b326-f7d7-4ee8-87af-1e83d7ad830a';

Action.Device = Backbone.Model.extend();
Action.Devices = Backbone.Collection.extend({
	model: Action.Device,
});


var dataUri = Action.uri + 'data';
var data = {};
$.ajax({
	url: dataUri,
	dataType: 'jsonp',
	data: {
		access_token: Action.access_token,
	},
	success: function(data) {
		console.log(data);
	},
});

Action.start();