define(function() { return {
    type: 'device',
    definition: {
        uuid: 'df007525-8741-11e3-baa7-0800200c9a66',
        version: '0.0.1',
        name: 'OpenWeatherMap.org',
        icon: 'weather',
        manufacturer: 'HabiThings',
        protocol: 'http',
        fields: {
            city: { label: 'City', description: 'The city to check the weather for.', type: 'string', config: true, editable: true, value: 'Amsterdam,NL' },
            humidity: { label: 'Humidity', description: 'The humidity in %.', type: 'number' },
            pressure: { label: 'Pressure', description: 'Atmospheric pressure in hPa.', type: 'number' },
            temp_current: { label: 'Temperature', description: 'The temperature in degrees Celsius.', type: 'number' },
            temp_min: { label: 'Minimum temperature', description: 'The minimum temperature in degrees Celsius.', type: 'number' },
            temp_max: { label: 'Maximum temperature', description: 'The maximum temperature in degrees Celsius.', type: 'number' },
            wind_speed: { label: 'Wind speed', description: 'Wind speed in mps.', type: 'number' },
            wind_direction: { label: 'Wind direction', description: 'Wind direction in degrees (meteorological).', type: 'number' }
        },
        commands: {
            setCity: { label: 'Change city', description: 'Change city the weather information is received for.', fields: ['city'] }
        },   
        triggers: {
            humidity: { label: 'Humidity change', description: 'Fires whenever the humidity changes.' },
            pressure: { label: 'Pressure change', description: 'Fires whenever the atmospheric pressure changes.' },
            temp_current: { label: 'Temperature change', description: 'Fires whenever the temperature changes.' }
        }
    },
    commands: {
        discover: function(args) {
            var self = this;
            self.functions.getApiResult(function(response, protocol) {
                var result = { settings: {} };
                if (protocol) { result.protocol = protocol; };
                var cityApi = (response.name && response.sys && response.sys.country) ? response.name + ',' + response.sys.country : '';
                var cityDefault = self.setting('city');
                result.settings.city = cityApi || cityDefault;
                result.name = self.definition.name + ' - ' + result.settings.city;
                args.callback(result);
            });
        },
        load: function(args) {
            if (args.callback) { args.callback(true); }
        },
        poll: function(args) {
            var self = this;
            self.functions.getApiResult(function(result) {
                if (result && result.main && result.wind) {
                    self.setting('humidity', result.main.humidity || 0);
                    self.setting('pressure', result.main.pressure || 0);
                    self.setting('temp_current', result.main.temp || 0);
                    self.setting('temp_min', result.main.temp_min || 0);
                    self.setting('temp_max', result.main.temp_max || 0);
                    self.setting('wind_speed', result.wind.speed || 0);
                    self.setting('wind_direction', result.wind.deg || 0);
                    args.callback(true);
                } else {
                    self.setting('humidity', 0);
                    self.setting('pressure', 0);
                    self.setting('temp_current', 0);
                    self.setting('temp_min', 0);
                    self.setting('temp_max', 0);
                    self.setting('wind_speed', 0);
                    self.setting('wind_direction', 0);
                    args.callback(false);  
                }
            });
        },
        setCity: function(args) {
            var self = this;
            if (args && args.city) {
                self.setting('city', args.city);
            }
        }
    },
    functions: {
        getApiResult: function(callback) {
            var self = this;
            var url = self.functions.getApiUrl();
            self.command('protocol:getUrl', { url: url, callback: function(result, protocol) {
                if (result && result.status == 200 && callback) {
                    var jsonContent = JSON.parse(result.content);
                    callback(jsonContent, protocol);
                }
            }});    
        },
        getApiUrl: function() {
            var self = this;
            var base = 'http://api.openweathermap.org/data/2.5/weather';
            var q = '?q=';
            q += self.setting('city');
            q += '&units=metric&mode=json';
            return base + q;
        }
    }
}});



// {"coord":{"lon":4.89,"lat":52.37},"sys":{"message":0.1928,"country":"NL","sunrise":1392188458,"sunset":1392223699},"weather":[{"id":801,"main":"Clouds","description":"few clouds","icon":"02d"}],"base":"cmc stations","main":{"temp":4.33,"pressure":1002,"temp_min":3.89,"temp_max":5,"humidity":98},"wind":{"speed":1.54,"gust":4.63,"deg":294},"clouds":{"all":24},"dt":1392196255,"id":2759794,"name":"Amsterdam","cod":200}

    //{
    //    "coord": {
    //        "lon": 4.89,
    //        "lat": 52.37
    //    },
    //    "sys": {
    //        "message": 0.1928,
    //        "country": "NL",
    //        "sunrise": 1392188458,
    //        "sunset": 1392223699
    //    },
    //    "weather": [
    //        {
    //            "id": 801,
    //            "main": "Clouds",
    //            "description": "few clouds",
    //            "icon": "02d"
    //        }
    //    ],
    //    "base": "cmc stations",
    //    "main": {
    //        "temp": 4.33,
    //        "pressure": 1002,
    //        "temp_min": 3.89,
    //        "temp_max": 5,
    //        "humidity": 98
    //    },
    //    "wind": {
    //        "speed": 1.54,
    //        "gust": 4.63,
    //        "deg": 294
    //    },
    //    "clouds": {
    //        "all": 24
    //    },
    //    "dt": 1392196255,
    //    "id": 2759794,
    //    "name": "Amsterdam",
    //    "cod": 200
    //}
