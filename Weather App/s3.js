const apiKey = '1ff961561c0cd8ae52c309174a8cf890';
let isCelsius = true;

function formatTemperature(temp) {
    return `${temp.toFixed(1)}°${isCelsius ? 'C' : 'F'}`;
}

function formatDate(dateString) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

async function getWeather(event) {
    event.preventDefault();
    const city = document.getElementById('city-input').value.trim();
    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    document.getElementById('loading').style.display = 'block';  
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`City not found: ${city}`);
        const data = await response.json();
        displayCurrentWeather(data);
        getForecast(data.coord.lat, data.coord.lon);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert(`Error: ${error.message}. Please try again.`);
    } finally {
        document.getElementById('loading').style.display = 'none';  
    }
}


function displayCurrentWeather(data) {
    const currentWeather = document.getElementById('current-weather');
    currentWeather.innerHTML = `
        <h2>${data.name}</h2>
        <p>${data.weather[0].description}</p>
        <p>Temperature: ${formatTemperature(data.main.temp)}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} ${isCelsius ? 'm/s' : 'mph'}</p>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}">
    `;
}

async function getForecast(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayForecast(data.list);
    } catch (error) {
        console.error('Error fetching forecast:', error);
        alert('Could not load forecast. Please try again.');
    }
}

function displayForecast(forecastList) {
    const forecast = document.getElementById('forecast');
    forecast.innerHTML = '';
    
    forecastList.filter((_, index) => index % 8 === 0)
        .forEach(day => {
            const forecastCard = document.createElement('div');
            forecastCard.className = 'forecast-card';
            forecastCard.innerHTML = `
                <p>${formatDate(day.dt_txt)}</p>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
                <p>High: ${formatTemperature(day.main.temp_max)}</p>
                <p>Low: ${formatTemperature(day.main.temp_min)}</p>
            `;
            forecast.appendChild(forecastCard);
        });
}

function getLocationWeather() {
    navigator.geolocation.getCurrentPosition(
        position => getWeatherByCoords(position.coords.latitude, position.coords.longitude),
        error => console.error('Error with geolocation:', error)
    );
}

async function getWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayCurrentWeather(data);
        getForecast(lat, lon);
    } catch (error) {
        console.error('Error fetching weather by coordinates:', error);
        alert('Could not fetch weather for your location. Please try again.');
    }
}
function toggleUnits() {
    isCelsius = !isCelsius;
    const button = document.querySelector('#buttons button:last-of-type');
    button.innerText = `Switch to ${isCelsius ? '°F' : '°C'}`;
    button.style.backgroundColor = isCelsius ? '#0277bd' : '#e64a19';  
    getWeather(new Event('submit'));
}


async function searchCity() {
    const query = document.getElementById('city-input').value.trim();
    if (query.length < 3) return;
    
    const url = `https://api.openweathermap.org/data/2.5/find?q=${query}&appid=${apiKey}&units=metric`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        const suggestions = data.list.map(city => `<p onclick="selectCity('${city.name}')">${city.name}, ${city.sys.country}</p>`).join('');
        document.getElementById('city-suggestions').innerHTML = suggestions;
        document.getElementById('city-suggestions').style.display = suggestions ? 'block' : 'none';
    } catch (error) {
        console.error('Error fetching city suggestions:', error);
    }
}

function selectCity(cityName) {
    document.getElementById('city-input').value = cityName;
    document.getElementById('city-suggestions').style.display = 'none';
    getWeather(new Event('submit'));
}
