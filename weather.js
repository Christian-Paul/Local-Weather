var latitude;
var longitude;
var wundergroundKey = '7a056c766178ccde';
var reverseGeodataKey ='AIzaSyCjhHJMF4wMgIU9LEV7xQuyjD5ENwXGqmM';
var town;
var state;
var units = 'fahrenheit';
var currentCondition;
var forecastCondition;
var hourlyCondition;
var isActive = '7day';

// queries wunderground api for current weather conditions
// called after location is obtained and when units are switched
function getCurrentWeather(state, town, units) {
	$.getJSON('https://api.wunderground.com/api/' + wundergroundKey + '/geolookup/conditions/q/' + state + '/' + town + '.json', function(data) {
		
		// display icon
		// takes the condition name from the api icon
		currentCondition = data.current_observation.icon_url.split('/')[6].split('.')[0];

		// splices condition name into wunderground's better icon url format
		$('.current-icon').attr('src', 'https://icons.wxug.com/i/c/v4/' + currentCondition + '.svg');

  		// display town name
  		$('.location-name').text(data.current_observation.display_location.full);

		// displays the temperature in relevant units
		if(units === 'fahrenheit') {
			$('.current-temp-value').html(Math.round(data.current_observation.temp_f) + '&deg&nbsp;');
			$('.active-unit').text('F');
			$('.inactive-unit').text('C')
		} else {
			$('.current-temp-value').html(Math.round(data.current_observation.temp_c) + '&deg&nbsp;');
			$('.active-unit').text('C');
			$('.inactive-unit').text('F');
		}

		// hide backup input
		$('.backup').hide(500);

		// show current weather after data is obtained
		$('.current-container').show(500);
	});
}

// queries wunderground api for 10 day forecase
// called after location is obtained and when units are switched
function getForecast(state, town, units, isActive) {
	$.getJSON('https://api.wunderground.com/api/' + wundergroundKey + '/geolookup/forecast10day/q/' + state + '/' + town + '.json', function(data) {
		for(var i = 0; i < 7; i++) {
			// displays days
			$('.forecast-day-' + i + '> .day-name').html(data.forecast.simpleforecast.forecastday[i].date.weekday.substring(0, 3))

			// displays forecast icons
			// takes the condition name from the api icon
			forecastCondition = data.forecast.simpleforecast.forecastday[i].icon_url.split('/')[6].split('.')[0];

			// splices condition name into wunderground's better icon url format
			$('.forecast-day-' + i + '> .icon').attr('src', 'https://icons.wxug.com/i/c/v4/' + forecastCondition + '.svg');

			// displays forecast's daily highs
			if(units === 'fahrenheit') {
				$('.forecast-day-' + i + '> .temperatures > .high-temp').html(data.forecast.simpleforecast.forecastday[i].high.fahrenheit + '&deg');
			} else {
				$('.forecast-day-' + i + '> .temperatures > .high-temp').html(data.forecast.simpleforecast.forecastday[i].high.celsius + '&deg');
			}

			// displays forecast's daily lows
			if(units === 'fahrenheit') {
				$('.forecast-day-' + i + '> .temperatures > .low-temp').html(data.forecast.simpleforecast.forecastday[i].low.fahrenheit + '&deg');
			} else {
				$('.forecast-day-' + i + '> .temperatures > .low-temp').html(data.forecast.simpleforecast.forecastday[i].low.celsius + '&deg');
			}

			// show forecast after data is obtained
			if(isActive === '7day') {
				$('.forecast-container').show(500);
			} else {
				$('.forecast-container').hide(500);
			}

			$('.toggle-forecast-type').show();
		}
	});
}

function getHourly(state, town, units, isActive) {
	$.getJSON('https://api.wunderground.com/api/' + wundergroundKey + '/hourly/q/' + state + '/' + town + '.json', function(data) {
		console.log(data.hourly_forecast);
		for(var i = 0; i < 7; i++) {
			var displayHour;
			if(i === 0) {
				displayHour = 0;
			} else {
				displayHour = i*2;
			}

			// displays hours
			var prettyHour = data.hourly_forecast[displayHour].FCTTIME.hour;
			prettyHour = prettyHour > 12 ? prettyHour - 12 : prettyHour;
			prettyHour = prettyHour === "0" ? 12 : prettyHour;
			$('.hourly-hour-' + i + '> .hour-name').html(prettyHour + ' ' + data.hourly_forecast[displayHour].FCTTIME.ampm)

			
			// displays hourly icons
			// takes the condition name from the api icon
			hourlyCondition = data.hourly_forecast[displayHour].icon_url.split('/')[6].split('.')[0];

			// splices condition name into wunderground's better icon url format
			$('.hourly-hour-' + i + '> .icon').attr('src', 'https://icons.wxug.com/i/c/v4/' + hourlyCondition + '.svg');

			
			// displays hourly temperature
			if(units === 'fahrenheit') {
				$('.hourly-hour-' + i + '> .temperatures > .temp').html(data.hourly_forecast[displayHour].temp.english + '&deg');
			} else {
				$('.hourly-hour-' + i + '> .temperatures > .temp').html(data.hourly_forecast[displayHour].temp.metric + '&deg');
			}

			// show hourly after data is obtained
			if(isActive === 'hourly') {
				$('.hourly-container').show(500);
			} else {
				$('.hourly-container').hide(500);
			}
		}
	});
}

$(document).ready(function() {

	// hide weather info by default
	$('.current-container').hide();
	$('.forecast-container').hide();
	$('.hourly-container').hide();
	$('.toggle-forecast-type').hide();
	$('.backup').hide();

	// set background based on if it's night or day
	var localTime = new Date();
	var localHour = localTime.getHours();
	if(localHour < 6 || localHour > 18) {
		$('.main-container').addClass('background-night');
	}
	else {
		$('.main-container').addClass('background-day');
	}

	// when "inactive unit" is clicked, the units are switched, and the weather is redisplayed
	$('.inactive-unit').click(function() {

		units = (units === 'fahrenheit' ? 'celsius' : 'fahrenheit');
		getCurrentWeather(state, town, units);
  		getForecast(state, town, units, isActive);
		getHourly(state, town, units, isActive);
	});

	// if the user's location is obtained
	if (navigator.geolocation) {

	  navigator.geolocation.getCurrentPosition(function(position) {

	  	// get user's lat and long
	  	latitude = position.coords.latitude;
	  	longitude = position.coords.longitude;

	  	// query googlemaps api to receive town and state names from latlong
	  	$.getJSON('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&key=AIzaSyCjhHJMF4wMgIU9LEV7xQuyjD5ENwXGqmM', function(data) {
	  		
	  		town = data.results[0].address_components[2].long_name;
	  		state = data.results[0].address_components[5].short_name;

	  		// send requests to wunderground api
	  		getCurrentWeather(state, town, units);
	  		getForecast(state, town, units, isActive);
	  		getHourly(state, town, units, isActive);
	  	});
	  }, function() {
	  	// if the geolocation can't be obtained, show backup input
	  	$('.backup').show();
	  }); 
	}

	// manual location input
	$('.submit-button').click(function() {
		// get location info from inputs
		town = $('.town-input').val();
		town = town[0].toUpperCase() + town.slice(1);

		state = $('.state-input').val();

		// send request to wunderground api
		getCurrentWeather(state, town, units);
		getForecast(state, town, units, isActive);
		getHourly(state, town, units, isActive);
	});

	// input validation
	$('.text-only').on('input', function (event) { 
		// remove any character that isn't a letter
	    this.value = this.value.replace(/[^A-Za-z\s]/g, '');
	});

	// toggle forecast type
	$('.toggle-forecast-type').click(function() {
		isActive = isActive === '7day' ? 'hourly' : '7day';
		getForecast(state, town, units, isActive);
		getHourly(state, town, units, isActive);

		$('.select-seven-day').toggleClass('active');
		$('.select-hourly').toggleClass('active');
	});
});