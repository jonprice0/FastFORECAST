let userFormEl = $("#user-form");
let inputEl = $("#city-state");
let currentWeatherContainerEl = $("#current-weather-container");

let formSubmitHandler = e => {
    e.preventDefault();
    // get values from input element
    let cityState = inputEl[0].value.trim();
    // validates input and calls the geocoding api request function
    var cityFormat = /([A-Z][a-z]+\s?)+,\s[A-Z]{2}/g;
    if (cityState.match(cityFormat)) {
        let city = cityState.split(", ")[0];
        let state = cityState.split(", ")[1];
        getCityCoordinates(city, state);
        inputEl[0].value = "";
    } else {
        alert("Please enter a city and a state code separated by a comma.");
    };
};

var getCurrentWeather = (lat, lon, city) => {
    const apiKey = "5cda3e33cf0e17bd1edc1617c8b6b14d";
    var apiUrlCurrentWeather = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${apiKey}`;
    
    // make a request to the url
    fetch(apiUrlCurrentWeather)
        .then(response => {
            // checks whether request was successful
            if (response.ok) {
                response.json()
                    .then(data =>{
                        displayCurrentWeather(data, city);
                    });
            } else {
                alert("Error: City not found");
            };
        })
        // error handling
        .catch(error => {
            console.log(error);
            alert("Unable to connect to weather database.");
        });
};

var getCityCoordinates = (city, state) => {
    const apiKey = "5cda3e33cf0e17bd1edc1617c8b6b14d";
    var apiUrlCityCoordinates = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&limit=1&appid=${apiKey}`;
    
    fetch(apiUrlCityCoordinates)
    .then(response => {
        // checks whether request was successful
        if (response.ok) {
            response.json()
                .then(data =>{
                    // extracts latitude and longitude from the response and calls the weather api function
                    let latitude = data[0].lat.toString().slice(0, 5);
                    let longitude = data[0].lon.toString().slice(0, 5);
                    getCurrentWeather(latitude, longitude, city, state);
                });
        } else {
            // error handling
            alert("Oops. Something went wrong.")
        };
    })
    // error handling
    .catch(error => {
        console.log(error);
        alert("Unable to connect to weather database.");
    });
};
            
let displayCurrentWeather = (data, city, state) => {
    let { current, daily } = data;
    let iconCode = (current.weather[0].icon);
    let iconSrc = `http://openweathermap.org/img/w/${iconCode}.png`;
    let { temp, wind_speed, humidity, uvi } = current;
    temp = ((temp - 273.15) * (9/5) + 32).toFixed(2);

    if ($("#current-weather")) {
        $("#current-weather").remove();
    };

    let currentWeatherDivEl = $("<div></div").attr("id", "current-weather");
    currentWeatherContainerEl[0].append(currentWeatherDivEl[0]);
    
    let currentWeatherH2El = $("<h2></h2>");
    currentWeatherH2El.html(`${city} (${moment().format('M/D/YYYY')}) <img src="${iconSrc}">`);
    currentWeatherDivEl.append(currentWeatherH2El[0]);
    
    let currentWeatherUlEl = $("<ul></ul>").attr("id", "current-details");
    currentWeatherH2El.after(currentWeatherUlEl[0]);

    console.log(currentWeatherH2El);

    let currentWeatherDetailsArr = [`Temp: ${temp} °F`, `Wind: ${wind_speed} MPH`, `Humidity: ${humidity} %`, ""]
    for (i = 0; i < currentWeatherDetailsArr.length; i++) {
        currentWeatherUlEl.append($(`<li>${currentWeatherDetailsArr[i]}</li>`));
    };
    
    let uviClass = "";
    if (uvi < 3) {
        uviClass = 'class="favorable"';
    }
    else if (3 <= uvi < 6) {
        uviClass = 'class="moderate"';
    } else {
        uviClass = 'class="severe"';
    };
    let uvIndexLiEl = $("#current-details :nth-child(4)");
    uvIndexLiEl.html($(`<p>UV Index: <span ${uviClass}>${uvi}</span></p>`));
};

userFormEl.on("submit", formSubmitHandler);