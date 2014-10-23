var Action = new Backbone.Marionette.Application();

Action.uri = 'https://graph.api.smartthings.com/api/smartapps/installations/825c747f-6845-4d4d-a4db-e618856b01d2/';
Action.access_token = 'd575b326-f7d7-4ee8-87af-1e83d7ad830a';

Action.Device = Backbone.Model.extend();
Action.Devices = Backbone.Collection.extend({
	model: Action.Device,
});

Action.DeviceTypes = Backbone.Collection.extend({
	initialize: function() {
		this.listenTo(this, 'add', function(model) {
			Action.devices.add(model);
		});

		this.listenTo(this, 'remove', function(model) {
			Action.devices.remove(model);
		});
	}
});

Action.Contact = Action.Device.extend();
Action.Contacts = Action.DeviceTypes.extend({
	model: Action.Contact,
});

Action.Dimmer = Action.Device.extend();
Action.Dimmers = Action.DeviceTypes.extend({
	model: Action.Dimmer,
});

Action.Humidity = Action.Device.extend();
Action.Humidities = Action.DeviceTypes.extend({
	model: Action.Humidity,
});

Action.Lock = Action.Device.extend();
Action.Locks = Action.DeviceTypes.extend({
	model: Action.Lock,
});

Action.Momentary = Action.Device.extend();
Action.Momentaries = Action.DeviceTypes.extend({
	model: Action.Momentary,
});

Action.Motion = Action.Device.extend();
Action.Motions = Action.DeviceTypes.extend({
	model: Action.Motion,
});

Action.Presence = Action.Device.extend();
Action.Presences = Action.DeviceTypes.extend({
	model: Action.Presence,
});

Action.Switch = Action.Device.extend();
Action.Switches = Action.DeviceTypes.extend({
	model: Action.Switch,
});

Action.Temperature = Action.Device.extend();
Action.Temperatures = Action.DeviceTypes.extend({
	model: Action.Temperature,
});

Action.DeviceView = Marionette.ItemView.extend({
	template: function(item) {
		var template = '#_st-' + item.type;
		if ($(template).length === 0) {
			template = '#_st-placeholder';
		}

		return Marionette.TemplateCache.get(template);
	}
});

Action.DevicesView = Marionette.CollectionView.extend({
	getChildView: function(item) {
		return Action.DeviceView;
	}
});


Action.updateData = function() {
	$.ajax({
		url: Action.dataUri,
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
};

Action.addInitializer(function() {
	Action.devices = new Action.Devices();

	Action.contacts = new Action.Contacts();
	Action.dimmers = new Action.Dimmers();
	Action.humidities = new Action.Humidities();
	Action.locks = new Action.Locks();
	Action.momentaries = new Action.Momentaries();
	Action.motions = new Action.Motions();
	Action.presences = new Action.Presences();
	Action.switches = new Action.Switches();
	Action.temperatures = new Action.Temperatures();

	Action.dataUri = Action.uri + 'data';
	Action.updateData();

	Action.addRegions({
		container: '#container',
	});
});

Action.on('start', function() {
	Action.container.show(new Action.DevicesView({
		collection: Action.devices
	}));
});

$().ready(function() {
	Action.start()
});