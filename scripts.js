$('a.temp-ext').click(function() {
  if($('a.temp-ext').text() === 'C') {
    $('a.temp-ext').text('F');
    $('p.temp').html('' + Math.round($('p.temp').data('fahrenheit')) + '°');
    var temp_min = Math.round($('p.min-max-temp').data('fahrenheit_min'));
    var temp_max = Math.round($('p.min-max-temp').data('fahrenheit_max'));
    $('p.min-max-temp').html(temp_min + '° / ' + temp_max + '°');
  } else {
    $('a.temp-ext').text('C');
    $('p.temp').html('' + Math.round($('p.temp').data('celsius')) + '°');
    var temp_min = Math.round($('p.min-max-temp').data('celsius_min'));
    var temp_max = Math.round($('p.min-max-temp').data('celsius_max'));
    $('p.min-max-temp').html(temp_min + '° / ' + temp_max + '°');
  }
});

var ConvertTemperature = {
  toCelsius: function(fahrenheit) {
    return (fahrenheit - 32) / 1.8;
  },
  toFahrenheit: function(celsius) {
    return celsius * 1.8 + 32;
  }
}

var Weather = function(posObj) {
  return $.getJSON('https://fcc-weather-api.glitch.me/api/current?lat=' + posObj.lat + '&lon=' + posObj.lon);
}

var Country = function(countryCode) {
  return $.getJSON('https://restcountries.eu/rest/v2/alpha/' + countryCode);
}

function getLocation() {
  var promise = new $.Deferred();
  var posObj = {lon: -1, lat: -1};
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          posObj.lon = position.coords.longitude;
          posObj.lat = position.coords.latitude;
          promise.resolve(posObj);
        });
    } else {
      promise.reject("Geolocation is not supported by this browser.");
    }
  return promise;
}

$('div.container').hide();
$(document).ready(function() {

  getLocation()
  .then(function(posObj) {
    Weather(posObj).then(function(weatherJson) {
      var countrycode = '';

      // The main loop to catch all the data from the promises
      for(key in weatherJson) {
        if(key === 'weather') {
          $('p.description').html(weatherJson[key][0].description);
          $('img.icon').attr('src', weatherJson[key][0].icon);
        }
        if(key === 'main') {
          var temp = weatherJson[key].temp + '°'
          $('p.temp').data('celsius', weatherJson[key].temp);
          $('p.temp').data('fahrenheit', ConvertTemperature.toFahrenheit(weatherJson[key].temp));
          $('p.temp').html('' + Math.round($('p.temp').data('celsius')) + '°');

          $('p.pressure').html(weatherJson[key].pressure);
          $('p.humidity').html(weatherJson[key].humidity);

          $('p.min-max-temp').data('celsius_min', weatherJson[key].temp_min);
          $('p.min-max-temp').data('celsius_max', weatherJson[key].temp_max);
          $('p.min-max-temp').data('fahrenheit_min', ConvertTemperature.toFahrenheit(weatherJson[key].temp_min));
          $('p.min-max-temp').data('fahrenheit_max', ConvertTemperature.toFahrenheit(weatherJson[key].temp_max));
          $('p.min-max-temp').html(weatherJson[key].temp_min + '° / ' + weatherJson[key].temp_max + '°');
        }
        if(key === 'wind') {
          $('p.wind-speed').html(weatherJson[key].speed);
        }
        if(key === 'sys') {
          countryCode = weatherJson[key].country;
        }
        if(key === 'name'){
          $('p.city').html(weatherJson[key]);
        }

      }

      return Country(countryCode);
    }).then(function(countryJson) {
      for(key in countryJson) {
        if(key === 'name') {
          $('p.country-name').html(countryJson[key]);
        }
        if(key === 'flag') {
          $('img.flag').attr('src', countryJson[key]);
        }
      }
      // This shows the container content after the data is loaded
      $('div.loader-panel').hide();
      $('div.container').fadeIn(2000);
    }).fail(function(error) {
      alert('Failed to retrieve weather data.\n => Error message:\n' + error);
    });
  })
  .fail(function(error) {
    alert('getLocation() failed with error message of:\n' + error);
  });
});
