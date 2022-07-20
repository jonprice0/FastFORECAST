let userFormEl = $("#user-form");
let cityInputEl = $("#city");

let formSubmitHandler = e => {
    e.preventDefault();
    // get value from input element
    let city = cityInputEl[0].value.trim();
    // validates input calls the api request function
    if (city) {
        getWeatherData(city);
        cityInputEl.value = "";
    } else {
        alert("Please enter a city.");
    };
};

var getWeatherData = (city) => {
    const apiKey = "5cda3e33cf0e17bd1edc1617c8b6b14d";
    var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    // make a request to the url
    fetch(apiUrl)
        .then(response => {
            // checks whether request was successful
            if (response.ok) {
                response.json()
                    .then(data =>{
                        console.log(data);
                    });
            } else {
                alert("Error: City not found");
            };
        })
        // error handling
        .catch(error => {
            console.log(error);
            alert("Unable to connect to weather database.");
        })
};

userFormEl.on("submit", formSubmitHandler);