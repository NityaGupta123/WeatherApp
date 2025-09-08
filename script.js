const apiKey = "bedcedb9a9ed888248298070ce10fd58"; 

// Get weather by city name
async function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (city === "") return alert("Please enter a city!");

  fetchWeather(city);
}

// Get weather by geolocation
function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeather(null, lat, lon);
      },
      () => alert("Geolocation permission denied.")
    );
  } else {
    alert("Geolocation not supported by your browser.");
  }
}

// Fetch current weather + forecast
async function fetchWeather(city, lat, lon) {
  try {
    let url;
    if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();

    displayWeather(data);

    // Fetch 5-day forecast
    const forecastUrl = city
      ? `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
      : `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    displayForecast(forecastData);

  } catch (error) {
    document.getElementById("weatherResult").innerHTML = error.message;
  }
}

// Display current weather
function displayWeather(data, unitSymbol) {
  if (data.cod === "404") {
    document.getElementById("weatherResult").innerHTML = `<p>City not found</p>`;
    return;
  }

  document.getElementById("weatherResult").innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <p>${data.weather[0].description}</p>
    <h3>${data.main.temp} ${unitSymbol}</h3>
  `;
}

// Display 5-day forecast
function displayForecast(forecastData) {
  const forecastDiv = document.getElementById("forecast");
  forecastDiv.innerHTML = "";

  // Filter for one forecast per day at 12:00
  const dailyData = forecastData.list.filter(item =>
    item.dt_txt.includes("12:00:00")
  );

  dailyData.forEach(day => {
    const date = new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "short" });
    const temp = day.main.temp;
    const desc = day.weather[0].description;
    const icon = day.weather[0].icon;

    forecastDiv.innerHTML += `
      <div class="forecast-day">
        <h4>${date}</h4>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
        <p>${temp}°C</p>
        <p>${desc}</p>
      </div>
    `;
  });
}

// Change background depending on weather
function changeBackground(desc) {
  const body = document.body;
  if (desc.includes("cloud")) {
    body.style.background = "linear-gradient(to right, #bdc3c7, #2c3e50)";
  } else if (desc.includes("rain")) {
    body.style.background = "linear-gradient(to right, #4e54c8, #8f94fb)";
  } else if (desc.includes("clear")) {
    body.style.background = "linear-gradient(to right, #56ccf2, #2f80ed)";
  } else if (desc.includes("snow")) {
    body.style.background = "linear-gradient(to right, #e0eafc, #cfdef3)";
  } else {
    body.style.background = "#87ceeb";
  }
}
