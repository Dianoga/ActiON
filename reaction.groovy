/**
 *  ActiON Dashboard 3.0.2
 *
 *  ActiON Dashboard is a web application to contol and view status of your devices.
 *  The dashboard is optimized for mobile devices as well as large screens.
 *  Once the dashboard url is generated, it could be used in any modern browser.
 *  There is no need to install SmartThings Mobile application on the device that will run the dashboard.
 *
 *  http://github.com/625alex/ActiON-Dashboard
 *
 *  Donations accepted via PayPal at alex.smart.things@gmail.com
 *
 *  Copyright © 2014 Alex Malikov
 *
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License. You may obtain a copy of the License at:
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed
 *  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License
 *  for the specific language governing permissions and limitations under the License.
 *
 */
definition(
	name: "REactiON Dashboard",
	namespace: "dianoga",
	author: "Brian Steere, Alex Malikov",
	description: "Self contained web dashboard with optional superpowers.",
	category: "Convenience",
	iconUrl: "https://s3.amazonaws.com/smartthings-device-icons/unknown/thing/thing-circle.png",
	iconX2Url: "https://s3.amazonaws.com/smartthings-device-icons/unknown/thing/thing-circle@2x.png",
	oauth: true)


preferences {
	page(name: "selectDevices", title: "Devices", install: false, unintall: true, nextPage: "selectPhrases") {

		section("About") {
			paragraph "ActiON Dashboard is a web application dashboard for your devices. \n" +
			"There is no need to install SmartThings Mobile application on devices that will run ActiON Dashboard. \n" +
			"Tap SmartApp icon to print the ActiON Dashboard URL to the logs or SMS number specified in app preferences."
			paragraph "Version 3.0.2\n\n" +
			"http://github.com/625alex/ActiON-Dashboard\n\n" +
			"Donations accepted via PayPal at alex.smart.things@gmail.com. \n" +
			"Copyright © 2014 Alex Malikov"
		}

		section("Allow control of these things...") {
			input "switches", "capability.switch", title: "Which Switches?", multiple: true, required: false
			input "dimmers", "capability.switchLevel", title: "Which Dimmers?", multiple: true, required: false
			input "momentaries", "capability.momentary", title: "Which Momentary Switches?", multiple: true, required: false
			input "locks", "capability.lock", title: "Which Locks?", multiple: true, required: false
		}

		section("View state of these things...") {
			input "contacts", "capability.contactSensor", title: "Which Contact?", multiple: true, required: false
			input "presence", "capability.presenceSensor", title: "Which Presence?", multiple: true, required: false
			input "temperature", "capability.temperatureMeasurement", title: "Which Temperature?", multiple: true, required: false
			input "humidity", "capability.relativeHumidityMeasurement", title: "Which Hygrometer?", multiple: true, required: false
			input "motion", "capability.motionSensor", title: "Which Motion?", multiple: true, required: false
		}
	}

	page(name: "selectPreferences", title: "Preferences", install: true, unintall: true) {
		section("Dashboard Preferences...") {
			label title: "Title", required: false
			input "viewOnly", title: "View Only", "bool", required: true, defaultValue: false
		}

		section("Automatically refresh dashboard...") {
			input "interval", "decimal", title: "Interval (in minutes)", required: true, defaultValue:2
		}

		section("Reset AOuth Access Token...") {
			paragraph "Activating this option will invalidate access token. The new ActiON Dashboard URL will be printed to the logs. Access token will keep resetting until this option is turned off."
			input "resetOauth", "bool", title: "Reset AOuth Access Token?", defaultValue: false
		}

		section("Send text message to...") {
			paragraph "Optionally, send text message containing the ActiON Dashboard URL to phone number. The URL will be sent in two parts because it's too long."
			input "phone", "phone", title: "Which phone?", required: false
		}
	}

	page(name: "selectPhrases", title: "Hello Home", content: "selectPhrases")
}


def selectPhrases() {
	def phrases = location?.helloHome?.getPhrases()*.label
	phrases?.sort()
	log.debug "phrases: $phrases"

	return dynamicPage(name: "selectPhrases", title: "Other Tiles", install: false, uninstall: true, nextPage: "selectPreferences") {
		if (phrases) {
			section("Hello, Home!") {
				input "showHelloHome", title: "Show Hello, Home! Phrases", "bool", required: true, defaultValue: true
				input "phrases", "enum", title: "Which phrases?", multiple: true, options: phrases, required: false
			}
		}

		section("Show...") {
			input "showMode", title: "Show Mode", "bool", required: true, defaultValue: true
			input "showClock", title: "Show Clock", "enum", multiple: false, required: true, defaultValue: "Digital", options: ["Digital", "Analog", "None"]
			input "showWeather", title: "Show Weather", "bool", required: true, defaultValue: true
			input "weatherLocation", title: "Weather Location", "text", required: false
		}

		section("Show Link 1...") {
			input "link1title", "text", title:"Link 1 Title", required: false
			input "link1url", "text", title:"Link 1 URL", required: false
		}

		section("Show Link 2...") {
			input "link2title", "text", title:"Link 2 Title", required: false
			input "link2url", "text", title:"Link 2 URL", required: false
		}

		section("Show Link 3...") {
			input "link3title", "text", title:"Link 3 Title", required: false
			input "link3url", "text", title:"Link 3 URL", required: false
		}
	}
}

mappings {
	path("/data") {
		action: [
			GET: "list",
		]
	}
	path("/ui") {
		action: [
			GET: "html",
		]
	}
	path("/command") {
		action: [
			GET: "command",
		]
	}
}

def command() {
	if (viewOnly) {
		return false;
	}

	log.debug "command received with params $params"

	def id = params.id
	def type = params.type
	def value = params.value

	def device
	def endState
	def attribute

	if (value == "toggle" && (type == "dimmer" || type == "switch")) {
		device = (type == "dimmer" ? dimmers : switches)?.find{it.id == id}
		attribute = "switch"

		log.debug "command toggle for dimmer/switch $device"
		if (device) {
			if(value == "toggle") {
				if(device.currentValue('switch') == "on") {
					device.off()
					endState = "off"
				} else {
					device.on()
					endState = "on"
				}
			} else if (value == "on") {
				device.on()
				endState = "on"
			} else if (value == "off") {
				device.off()
				endState = "off"
			}
		}
	} else if (type == "dimmer" && value == "0") {
		device = dimmers?.find{it.id == id}
		attribute = "switch"
		endState = "off"

		if (device) {
			device.setLevel(0)
			device.off()
		}
	} else if (type == "dimmer") {
		device = dimmers?.find{it.id == id}
		attribute = "level"
		endState = Math.min(value as Integer, 99) as String

		if (device) {
			device.setLevel(Math.min(value as Integer, 99))
		}
	} else if (type == "lock") {
		device = locks?.find{it.id == id}
		attribute = "lock"

		if (device) {
			log.debug "current lock status ${device.currentValue('lock')}"
			if(device.currentValue('lock') == "locked") {
				device.unlock()
				endState = "unlocked"
			} else {
				device.lock()
				endState = "locked"
			}

		}
	} else if (type == "mode") {
		setLocationMode(value)
	} else if (type == "helloHome") {
		device = "helloHome"
		log.debug "executing Hello Home '$value'"
		location.helloHome.execute(value)
	} else if (type == "momentary") {
		device = momentaries?.find{it.id == id}
		if (device) {
			device.push()
		}
	}

	def isUpdated = waitForUpdate(type, device, endState, attribute)

	def response = [:]

	if (isUpdated) {
		response.status = "ok"
	} else {
		response.status = "refresh"
	}
	log.debug "isUpdated for $device : $isUpdated"

	render contentType: "application/javascript", data: "${params.callback}(${response.encodeAsJSON()})"
}

def installed() {
	log.debug "Installed with settings: ${settings}"

	initialize()
}

def updated() {
	log.debug "Updated with settings: ${settings}"

	unsubscribe()
	initialize()
}

def initialize() {
	subscribe(app, getURL)
	getURL(null)

	scheduledWeatherRefresh()
	schedule('0 */15 * * * ?', scheduledWeatherRefresh)

	// Put links into an array for data
	state.links = [];
	if(link1url) {
		state.links.push([id: '1', name: link1title, status: link1url, type: 'link']);
	}
	if(link2url) {
		state.links.push([id: '2', name: link2title, status: link2url, type: 'link']);
	}
	if(link3url) {
		state.links.push([id: '3', name: link3title, status: link3url, type: 'link']);
	}
}

def getURL(e) {
	if (resetOauth) {
		log.debug "Reseting Access Token"
		state.accessToken = null
	}

	if (!state.accessToken) {
		createAccessToken()
		log.debug "Creating new Access Token: $state.accessToken"
	}

	def url1 = "https://graph.api.smartthings.com/api/smartapps/installations/${app.id}/ui"
	def url2 = "?access_token=${state.accessToken}"
	log.debug "${title ?: location.name} ActiON Dashboard URL: $url1$url2"
	if (phone) {
		sendSmsMessage(phone, url1)
		sendSmsMessage(phone, url2)
	}
}


def scheduledWeatherRefresh() {
	log.debug "Refreshing weather"

	def conditions = getWeatherFeature('conditions', weatherLocation)
	def astronomy = getWeatherFeature('astronomy', weatherLocation)

	state.weather.conditions = conditions.current_observation
	state.weather.astronomy = astronomy.moon_phase
}

def index() {
	["index", "list", "html"]
}

def list() {
	render contentType: "application/javascript", data: "${params.callback}(${data().encodeAsJSON()})"
}

def data() {
	def things = [
		locks: locks?.collect{[type: "lock", id: it.id, name: it.displayName, status: it.currentValue('lock') == "locked" ? "locked" : "unlocked"]}?.sort{it.name},
		switches: switches?.collect{[type: "switch", id: it.id, name: it.displayName, status: it.currentValue('switch')]}?.sort{it.name},
		dimmers: dimmers?.collect{[type: "dimmer", id: it.id, name: it.displayName, status: it.currentValue('switch'), level: it.currentValue('level')]}?.sort{it.name},
		momentary: momentaries?.collect{[type: "momentary", id: it.id, name: it.displayName]}?.sort{it.name},
		contacts: contacts?.collect{[type: "contact", id: it.id, name: it.displayName, status: it.currentValue('contact')]}?.sort{it.name},
		presence: presence?.collect{[type: "presence", id: it.id, name: it.displayName, status: it.currentValue('presence')]}?.sort{it.name},
		motion: motion?.collect{[type: "motion", id: it.id, name: it.displayName, status: it.currentValue('motion')]}?.sort{it.name},
		temperature: temperature?.collect{[type: "temperature", id: it.id, name: it.displayName, status: roundNumber(it.currentValue('temperature'), "°")]}?.sort{it.name},
		humidity: humidity?.collect{[type: "humidity", id: it.id, name: it.displayName, status: roundNumber(it.currentValue('humidity'), "%")]}?.sort{it.name},
		links: state.links,
	]

	if(showWeather) {
		things.weather = [type: 'weather', status: state.weather]
	}

	if(showMode) {
		things.mode = [
			type: 'mode',
			status: location.mode.toString(),
			modes: location.modes?.collect{it.name}
		]
	}

	if(showHelloHome) {
		things.hellohome = [
			type: 'hellohome',
			status: null,
			phrases: phrases
		]
	}

	return things
}

def roundNumber(num, unit) {
	if (num == null || num == "") return "n/a"
	if (!"$num".isNumber()) return num
	else {
		try {
			return Math.round("$num".toDouble()) + (unit ?: "")
		} catch (e) {
			return num
		}
	}
}

def html() {
	render contentType: "text/html", data: thePage()
}