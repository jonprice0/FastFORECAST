let userFormEl = $("#user-form");
let inputEl = $("#city-state");
let searchHistoryUlEl = $("#previous-searches");
let currentWeatherContainerEl = $("#current-weather-container");
let forecastContainerEl = $("#forecast-container");

let storageArr = [];

let displayCurrentWeather = (data, city) => {
    // destructure the data, convert temp from Kelvin to Fahrenheit, and get the current weather icon:
    let { current, daily } = data;
    let { temp, wind_speed, humidity, uvi } = current;
    temp = ((temp - 273.15) * (9/5) + 32).toFixed(2);
    let iconCode = (current.weather[0].icon);
    let iconSrc = `http://openweathermap.org/img/w/${iconCode}.png`;

    // clear current weather and forecast displays:
    if ($("#current-weather")) {
        $("#current-weather").remove();
    };
    if ($("#forecast")) {
        $("#forecast").remove();
    };

    // display current weather:
    let currentWeatherDivEl = $("<div></div").attr("id", "current-weather");
    currentWeatherContainerEl[0].append(currentWeatherDivEl[0]);
    
    let currentWeatherH2El = $("<h2></h2>");
    currentWeatherH2El.html(`${city} (${moment().format('M/D/YYYY')}) <img src="${iconSrc}">`);
    currentWeatherDivEl.append(currentWeatherH2El[0]);
    
    let currentWeatherUlEl = $("<ul></ul>").attr("id", "current-details");
    currentWeatherH2El.after(currentWeatherUlEl[0]);

    let currentWeatherDetailsArr = [`Temp: ${temp} °F`, `Wind: ${wind_speed} MPH`, `Humidity: ${humidity} %`, ""]
    for (i = 0; i < currentWeatherDetailsArr.length; i++) {
        currentWeatherUlEl.append($(`<li>${currentWeatherDetailsArr[i]}</li>`));
    };
    
    // color code UV index display:
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

    // display 5-day forecast:
    let forecastDivEl = $("<div></div").attr("id", "forecast");
    forecastContainerEl[0].append(forecastDivEl[0]);

    let forecastH4El = $("<h4></h4>").text("5-Day Forecast:");
    forecastDivEl.append(forecastH4El[0]);

    let forecastUlEl = $("<ul></ul>")
        .attr({
            "id": "forecast-list",
            "class": "col-12 card-list"
        });
    forecastH4El.append(forecastUlEl[0]);

    // loop through the daily forecasts returned by the api:
    for (i = 0; i < 5; i++) {
        // assign variables:
        let { temp, wind_speed, humidity } = (daily[i]);
        let forecastIconCode = (daily[i].weather[0].icon);
        let forecastIconSrc = `http://openweathermap.org/img/w/${forecastIconCode}.png`;
        // compute the daily average temperature and convert the result from Kelvin to Fahrenheit:
        avgTemp = (temp.day + temp.night) / 2;
        avgTemp = ((avgTemp - 273.15) * (9/5) + 32).toFixed(2);

        let forecastLiEl = $("<li></li>");
        forecastLiEl.attr("class", "card ");
        forecastUlEl.append(forecastLiEl[0]);

        let forecastCardBody = $("<div></div>");
        forecastCardBody.attr("class", "card-body");
        forecastLiEl.append(forecastCardBody[0]);

        let formattedDate = moment().add(i + 1, 'd').format('M/D/YYYY');
        let forecastH5El = $("<h5></>").text(`${formattedDate}`);
        forecastCardBody.append(forecastH5El[0]);
        
        let iconSpanEl = $("<span></span");
        iconSpanEl.html(`<img src="${forecastIconSrc}">`);
        forecastH5El.append(iconSpanEl[0]);

        let forecastTempEl = $("<p></p>").attr("class", "card-text");
        forecastTempEl.text(`Temp: ${avgTemp} °F`);
        iconSpanEl.append(forecastTempEl[0]);

        let forecastWindEl = $("<p></p>").attr("class", "card-text");
        forecastWindEl.text(`Wind: ${wind_speed} MPH`);
        forecastTempEl.append(forecastWindEl[0]);

        let forecastHumidityEl = $("<p></p>").attr("class", "card-text");
        forecastHumidityEl.text(`Humidity: ${humidity} %`);
        forecastWindEl.append(forecastHumidityEl[0]);
    };
};

// create a search button element, add an event listener, and append it to the search history:
let displayToSearchHistory = (city, state) => {
    let searchBtnEl = $(`<button>${city}</button>`);
    searchBtnEl.attr("data-state", `${state}`);
    searchBtnEl[0].addEventListener("click", () => {
        city = searchBtnEl[0].innerText;
        state = searchBtnEl.attr("data-state");
        getCityCoordinates(city, state);
    });
    $("#previous-searches")[0].style.display = "block";
    $("#previous-searches").append(searchBtnEl);
};

var saveSearch = (city, state) => {
    // get storage array from local storage; if it isn't in storage, set it to an empty array:
    storageArr = JSON.parse(localStorage.getItem("search-history"));
    if (!storageArr) {
        storageArr = [];
    };
    // create a string from the search terms:
    storageStr = (`["${city}", "${state}"]`);
    // if the storage array is empty, add the search string to the array, display it in the search history, and set it in local storage:
    if (storageArr.length === 0) {
        let newStorageArr = [storageStr];
        displayToSearchHistory(city, state);
        localStorage.setItem("search-history", JSON.stringify(newStorageArr));
    }
    else {
        let isNew = true;
        for (i = 0; i < storageArr.length; i++) {
            if (storageArr[i] === storageStr) {
               isNew = false;
            };
        };
        if (isNew) {
            let newStorageArr = [...storageArr, storageStr];
            displayToSearchHistory(city, state);
            localStorage.setItem("search-history", JSON.stringify(newStorageArr));
        };
    };
};

var getCurrentWeather = (lat, lon, city, state) => {
    const apiKey = "5cda3e33cf0e17bd1edc1617c8b6b14d";
    var apiUrlCurrentWeather = `http://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${apiKey}`;
    
    // make a request to the url:
    fetch(apiUrlCurrentWeather)
        .then(response => {
            // check whether request was successful:
            if (response.ok) {
                response.json()
                    .then(data =>{
                        displayCurrentWeather(data, city);
                        saveSearch(city, state);
                    });
            } else {
                alert("Error: City not found");
            };
        })
        // error handling:
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
        // check whether request was successful:
        if (response.ok) {
            response.json()
                .then(data =>{
                    // extract latitude and longitude from the response and call the weather api function:
                    let latitude = data[0].lat.toString().slice(0, 5);
                    let longitude = data[0].lon.toString().slice(0, 5);
                    getCurrentWeather(latitude, longitude, city, state);
                });
        } else {
            // error handling:
            alert("Oops. Something went wrong.")
        };
    })
    // error handling:
    .catch(error => {
        console.log(error);
        alert("Unable to connect to weather database.");
    });
};

let formSubmitHandler = e => {
    e.preventDefault();
    // get values from input element:
    let cityState = inputEl[0].value.trim();
    // validate input and call the geocoding api request function:
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

// add a handler to the search form:
userFormEl.on("submit", formSubmitHandler);

let loadSearchHistory = () => {
    storageArr = JSON.parse(localStorage.getItem("search-history"));
    if (!storageArr) {
        return;
    }
    else {
        $("#previous-searches")[0].style.display = "block";
        for (i = 0; i < storageArr.length; i++) {
            city = storageArr[i].split('"')[1];
            state = storageArr[i].split('"')[3];
            displayToSearchHistory(city, state); 
        };
    };
};

// on page load get search history from local storage and display it:
loadSearchHistory();
