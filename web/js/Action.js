var Action = new Backbone.Marionette.Application();

Action.uri = 'https://graph.api.smartthings.com/api/smartapps/installations/825c747f-6845-4d4d-a4db-e618856b01d2/';
Action.access_token = 'd575b326-f7d7-4ee8-87af-1e83d7ad830a';

Action.Device = Backbone.Model.extend({
	initialize: function() {
		this.set('id', this.get('type') + '_' + this.get('id'));
	}
});
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
	className: function() {
		return 'st-tile ' + this.model.get('type');
	},
	getTemplate: function() {
		var template = '#_st-' + this.model.get('type');
		if ($(template).length === 0) {
			template = '#_st-device';
		}

		return template;
	},
	bindings: {
		'.st-title': 'name',
	},

	onRender: function() {
		this.stickit();
		this.$el.enhanceWithin();
	},
});

Action.ContactView = Action.DeviceView.extend({
	initialize: function() {
		this.bindings = _.extend({}, this.bindings, {
			'.fa': {
				observe: 'status',
				update: function($el, val, model) {
					val == 'closed' ? $el.addClass('fa-compress') : $el.addClass('fa-expand');
				}
			}
		});
	}
});

Action.SwitchView = Action.DeviceView.extend({
	initialize: function() {
		this.bindings = _.extend({}, this.bindings, {
			'.fa': {
				observe: 'status',
				update: function($el, val, model) {
					val == 'off' ? $el.addClass('fa-toggle-off') : $el.addClass('fa-toggle-on');
				}
			}
		});
	}
});

Action.DimmerView = Action.DeviceView.extend({
	initialize: function() {
		this.bindings = _.extend({}, this.bindings, {
			'.fa': {
				observe: 'status',
				update: function($el, val, model) {
					val == 'off' ? $el.addClass('fa-toggle-off') : $el.addClass('fa-toggle-on');
				}
			}
		});
	},
});

Action.MotionView = Action.DeviceView.extend({
	initialize: function() {
		this.bindings = _.extend({}, this.bindings, {
			'.fa': {
				observe: 'status',
				update: function($el, val, model) {
					val == 'inactive' ? $el.addClass('fa-square-o') : $el.addClass('fa-square');
				}
			}
		});
	},
});

Action.DevicesView = Marionette.CollectionView.extend({
	getChildView: function(item) {
		if (item instanceof Action.Contact) {
			return Action.ContactView;
		} else if (item instanceof Action.Dimmer) {
			return Action.DimmerView;
		} else if (item instanceof Action.Switch) {
			return Action.SwitchView;
		} else if (item instanceof Action.Motion) {
			return Action.MotionView;
		}

		return Action.DeviceView;
	},

	initialize: function() {

	},

	onRender: function() {
		this.$el.packery({
			itemSelector: '.st-tile',
			gutter: 10,
		});

		this.listenTo(this, 'childview:show', function(view) {
			this.$el.packery('reloadItems').packery();
		});
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

	Action.container.show(new Action.DevicesView({
		collection: Action.devices
	}));
});

$().ready(function() {
	Action.start();
});