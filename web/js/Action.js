var Action = new Backbone.Marionette.Application();

Action.uri = 'https://graph.api.smartthings.com/api/smartapps/installations/825c747f-6845-4d4d-a4db-e618856b01d2/';
Action.access_token = 'd575b326-f7d7-4ee8-87af-1e83d7ad830a';

Action.Device = Backbone.Model.extend();
Action.Devices = Backbone.Collection.extend({
	model: Action.Device,
});

Action.Contact = Action.Device.extend();
Action.Contacts = Action.Devices.extend({
	model: Action.Contact,
});

Action.Dimmer = Action.Device.extend();
Action.Dimmers = Action.Devices.extend({
	model: Action.Dimmer,
});

Action.Humidity = Action.Device.extend();
Action.Humidities = Action.Devices.extend({
	model: Action.Humidity,
});

Action.Lock = Action.Device.extend();
Action.Locks = Action.Devices.extend({
	model: Action.Lock,
});

Action.Momentary = Action.Device.extend();
Action.Momentaries = Action.Devices.extend({
	model: Action.Momentary,
});

Action.Motion = Action.Device.extend();
Action.Motions = Action.Devices.extend({
	model: Action.Motion,
});

Action.Presence = Action.Device.extend();
Action.Presences = Action.Devices.extend({
	model: Action.Presence,
});

Action.Switch = Action.Device.extend();
Action.Switches = Action.Devices.extend({
	model: Action.Switch,
});

Action.Temperature = Action.Device.extend();
Action.Temperatures = Action.Devices.extend({
	model: Action.Temperature,
});


Action.addInitializer(function() {
	Action.contacts = new Action.Contacts();
	Action.dimmers = new Action.Dimmers();
	Action.humidities = new Action.Humidities();
	Action.locks = new Action.Locks();
	Action.momentaries = new Action.Momentaries();
	Action.motions = new Action.Motions();
	Action.presences = new Action.Presences();
	Action.switches = new Action.Switches();
	Action.temperatures = new Action.Temperatures();

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
			Action.contacts.set(data.contacts);
			Action.dimmers.set(data.dimmers);
			Action.humidities.set(data.humidity);
			Action.locks.set(data.locks);
			Action.momentaries.set(data.momentary);
			Action.motions.set(data.motion);
			Action.presences.set(data.presence);
			Action.switches.set(data.switches);
			Action.temperatures.set(data.temperature);
		},
	});
});

Action.start();