var Action = new Backbone.Marionette.Application();

Action.Device = Backbone.Model.extend({
	initialize: function() {
		this.set('id', this.get('type') + '_' + this.get('id'));
		this.set('updating', false);
	},

	sendCommand: function(value, type) {
		var model = this;
		model.set('updating', true);

		var id = model.get('id').split('_')[1];
		var type = type || model.get('type');
		Action.sendCommand(id, type, value, function() {
			Action.updateData();
		});
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

Action.Link = Action.Device.extend();
Action.Links = Action.DeviceTypes.extend({
	model: Action.Link,
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

Action.Mode = Action.Device.extend({
	defaults: {
		name: 'Mode',
	}
});

Action.Weather = Action.Device.extend({
	defaults: {
		type: 'weather'
	},

	weatherIcons: {
		"chanceflurries": "snow",
		"chancerain": "rain",
		"chancesleet": "sleet",
		"chancesnow": "snow",
		"chancetstorms": "rain",
		"clear": "clear-day",
		"cloudy": "cloudy",
		"flurries": "snow",
		"fog": "fog",
		"hazy": "fog",
		"mostlycloudy": "cloudy",
		"mostlysunny": "clear-day",
		"partlycloudy": "partly-cloudy-day",
		"partlysunny": "partly-cloudy-day",
		"rain": "rain",
		"sleet": "sleet",
		"snow": "snow",
		"sunny": "clear-day",
		"tstorms": "rain",
		"nt_chanceflurries": "snow",
		"nt_chancerain": "rain",
		"nt_chancesleet": "sleet",
		"nt_chancesnow": "snow",
		"nt_chancetstorms": "rain",
		"nt_clear": "clear-night",
		"nt_cloudy": "cloudy",
		"nt_flurries": "snow",
		"nt_fog": "fog",
		"nt_hazy": "fog",
		"nt_mostlycloudy": "partly-cloudy-night",
		"nt_mostlysunny": "partly-cloudy-night",
		"nt_partlycloudy": "partly-cloudy-night",
		"nt_partlysunny": "partly-cloudy-night",
		"nt_sleet": "sleet",
		"nt_rain": "rain",
		"nt_snow": "snow",
		"nt_sunny": "clear-night",
		"nt_tstorms": "rain",
	},

	initialize: function() {
		this.set('id', 'weather');
		this.set('location', this.get('display_location').full);
		this.set('skycon', this.weatherIcons[this.get('icon')]);

		var sunrise = this.get('sunrise');
		var sunset = this.get('sunset');
		this.set('sunrise', sunrise.hour + ':' + sunrise.minute + ' AM');
		this.set('sunset', (sunset.hour - 12) + ':' + sunset.minute + ' PM');
	}
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
		'.fa': {
			observe: 'status',
			update: 'getIcon',
		},
	},
	icons: {},

	onRender: function() {
		this.$el.enhanceWithin();
		this.stickit();

		this.listenTo(this.model, 'change:updating', function() {
			var updating = this.model.get('updating');
			this.$el.toggleClass('updating', updating);
		});
	},

	getIcon: function($el, val, model) {
		_.each(this.icons, function(icon, key) {
			$el.toggleClass(icon, key == val);
		});
	},
});

Action.ContactView = Action.DeviceView.extend({
	icons: {
		'closed': 'fa-compress',
		'open': 'fa-expand',
	},
});

Action.SwitchView = Action.DeviceView.extend({
	icons: {
		'off': 'fa-toggle-off',
		'on': 'fa-toggle-on',
	},
	events: {
		'click': 'toggle',
	},

	toggle: function() {
		this.model.sendCommand('toggle');
	}
});

Action.DimmerView = Action.SwitchView.extend({
	initialize: function() {
		this.bindings = _.extend({}, this.bindings, {
			'[name=dimmer]': {
				observe: 'level',
				update: function($el, val) {
					$el.val(val).slider('refresh');
				}
			},
		});

		this.$el.on('slidestop', _.bind(this.dimmerClick, this));
	},

	dimmerClick: function(event) {
		event.stopPropagation();
		this.model.sendCommand(this.model.get('level'));
	}
});

Action.PresenceView = Action.DeviceView.extend({
	icons: {
		'not present': 'fa-map-marker-away',
		'present': 'fa-map-marker',
	},
});

Action.MotionView = Action.DeviceView.extend({
	icons: {
		'inactive': 'fa-square-o',
		'active': 'fa-square',
	},
});

Action.LockView = Action.DeviceView.extend({
	icons: {
		'unlocked': 'fa-unlock-alt',
		'locked': 'fa-lock',
	},
});

Action.MomentaryView = Action.DeviceView.extend({
	icons: {
		'': 'fa-circle-o',
	},
});

Action.LinkView = Action.DeviceView.extend({
	icons: {
		'': 'fa-circle-o',
	},

	initialize: function() {
		this.bindings = _.extend({}, this.bindings, {
			'a': {
				attributes: [{
					observe: 'status',
					name: 'href',
				}],
			}
		});
	},

});

Action.TemperatureView = Action.DeviceView.extend({
	initialize: function() {
		this.bindings = _.extend({}, this.bindings, {
			'.st-icon': 'status',
		});
	}
});

Action.ModeView = Action.DeviceView.extend({
	initialize: function() {
		this.bindings = _.extend({}, this.bindings, {
			'.st-icon': {
				observe: 'status',
				update: function($el, val, model) {
					var link = $('<a href="#modePopupMenu" data-rel="popup" data-transition="slideup" />').text(val);
					var menu = $('<div data-role="popup" id="modePopupMenu" data-theme="b"/>');
					var menuUl = $('<ul data-role="listview" data-insert="true" />');

					_.each(model.get('modes'), function(mode) {
						menuUl.append('<li><a href="#" data-rel="back" data-mode="' + mode + '">' + mode + '</a></li>');
					});

					menu.append(menuUl);
					$el.empty().append(link).append(menu).enhanceWithin();
				}
			},
			'.st-phrases': {
				observe: 'status',
				update: function($el, val, model) {
					var link = $('<a href="#phrasePopupMenu" data-rel="popup" data-transition="slideup" />').text('Hello Home');
					var menu = $('<div data-role="popup" id="phrasePopupMenu" data-theme="b"/>');
					var menuUl = $('<ul data-role="listview" data-insert="true" />');

					_.each(model.get('phrases'), function(phrase) {
						menuUl.append('<li><a href="#" data-rel="back" data-phrase="' + phrase + '">' + phrase + '</a></li>');
					});

					menu.append(menuUl);
					$el.empty().append(link).append(menu).enhanceWithin();
				}
			},
		});
	},

	onRender: function() {
		this.stickit();
		$('#modePopupMenu').on('click', 'a', _.bind(this.changeMode, this));
		$('#phrasePopupMenu').on('click', 'a', _.bind(this.changePhrase, this));

		this.listenTo(this.model, 'change:updating', function() {
			var updating = this.model.get('updating');
			this.$el.toggleClass('updating', updating);
		});
	},

	changeMode: function(event) {
		this.model.sendCommand($(event.currentTarget).data().mode, 'mode');
	},

	changePhrase: function(event) {
		this.model.sendCommand($(event.currentTarget).data().phrase, 'hellohome');
	}
});

Action.HumidityView = Action.TemperatureView.extend();

Action.WeatherView = Action.DeviceView.extend({
	bindings: {
		'.st-title': 'location',
		'.w-temperature': {
			observe: 'temp_f',
			onGet: function(val) {
				return val + '\xb0';
			}
		},
		'.w-humidity': {
			observe: 'relative_humidity',
			onGet: function(val) {
				return 'Humidity: ' + val;
			}
		},
		'.w-status': {
			observe: ['weather', 'feelslike_f'],
			onGet: function(val) {
				return val[0] + ', feels like ' + val[1] + '\xb0';
			}
		},
		'.sunrise': 'sunrise',
		'.sunset': 'sunset',
	},

	initialize: function() {
		this.skycons = new Skycons({
			color: 'white'
		});
	},

	onRender: function() {
		this.stickit();
		this.skycons.add(this.$el.find('canvas')[0], this.model.get('skycon'));
		this.skycons.play();
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
		} else if (item instanceof Action.Temperature) {
			return Action.TemperatureView;
		} else if (item instanceof Action.Humidity) {
			return Action.HumidityView;
		} else if (item instanceof Action.Presence) {
			return Action.PresenceView;
		} else if (item instanceof Action.Lock) {
			return Action.LockView;
		} else if (item instanceof Action.Momentary) {
			return Action.MomentaryView;
		} else if (item instanceof Action.Link) {
			return Action.LinkView;
		} else if (item instanceof Action.Weather) {
			return Action.WeatherView;
		} else if (item instanceof Action.Mode) {
			return Action.ModeView;
		}

		return Action.DeviceView;
	},

	initialize: function() {

	},

	onRender: function() {
		this.$el.packery({
			itemSelector: '.st-tile',
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
			access_token: Action.config.access_token,
		},
		success: function(data) {
			console.log(data);
			Action.contacts.set(new Action.Contacts(data.contacts).models);
			Action.dimmers.set(new Action.Dimmers(data.dimmers).models);
			Action.humidities.set(new Action.Humidities(data.humidity).models);
			Action.locks.set(new Action.Locks(data.locks).models);
			Action.links.set(new Action.Links(data.links).models);
			Action.momentaries.set(new Action.Momentaries(data.momentary).models);
			Action.motions.set(new Action.Motions(data.motion).models);
			Action.presences.set(new Action.Presences(data.presence).models);
			Action.switches.set(new Action.Switches(data.switches).models);
			Action.temperatures.set(new Action.Temperatures(data.temperature).models);

			var weather = new Action.Weather(_.extend(data.weather.status.conditions, data.weather.status.astronomy));
			var mode = new Action.Mode(_.extend(data.hellohome, data.mode));

			var opts = {
				at: 0,
				merge: true
			};

			Action.devices.add(mode, opts);
			Action.devices.add(weather, opts);
		},
	});
};

Action.sendCommand = function(id, type, value, complete) {
	$.ajax({
		url: Action.commandUri,
		dataType: 'jsonp',
		data: {
			access_token: Action.config.access_token,
			id: id,
			type: type,
			value: value,
		},
		complete: complete || function() {}
	});
}

Action.addInitializer(function() {
	Action.devices = new Action.Devices();

	Action.contacts = new Action.Contacts();
	Action.dimmers = new Action.Dimmers();
	Action.humidities = new Action.Humidities();
	Action.locks = new Action.Locks();
	Action.links = new Action.Links();
	Action.momentaries = new Action.Momentaries();
	Action.motions = new Action.Motions();
	Action.presences = new Action.Presences();
	Action.switches = new Action.Switches();
	Action.temperatures = new Action.Temperatures();

	Action.dataUri = Action.config.uri + 'data';
	Action.commandUri = Action.config.uri + 'command';
	Action.updateData();

	Action.addRegions({
		container: '#container',
	});

	Action.container.show(new Action.DevicesView({
		collection: Action.devices
	}));
});