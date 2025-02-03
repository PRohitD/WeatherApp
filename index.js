const usertab = document.querySelector('[data-user]');
const searchtab = document.querySelector('[data-search]');
const usercontainer = document.querySelector('.weather-container');
const grantAcessContainer = document.querySelector('.grant-location-container');
const searchForm = document.querySelector('[data-searchForm]');
const searchInput = document.querySelector('[data-searchInput]');
const loading = document.querySelector('.loading');
const userinfoContainer = document.querySelector(".user-info-Container");

let currentTab = usertab;
const Api_key = "9d92e34c835f733096fe17f5592c9489";
currentTab.classList.add("current-tab");

function switchtab(clickedTab) {
    if (clickedTab !== currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {
            userinfoContainer.classList.remove("active");
            grantAcessContainer.classList.remove("active");
            searchForm.classList.add("active");
        } else {
            searchForm.classList.remove("active");
            userinfoContainer.classList.remove("active");
            getformSessionStorage();
        }
    }
}

usertab.addEventListener('click', () => {
    switchtab(usertab);
});

searchtab.addEventListener('click', () => {
    switchtab(searchtab);
});

// Check if coordinates are present in session storage
function getformSessionStorage() {
    const localcoordinates = sessionStorage.getItem("user-coordinates");

    if (!localcoordinates) {
        grantAcessContainer.classList.add("active");
        usercontainer.classList.remove("active");
    } else {
        const coordinates = JSON.parse(localcoordinates);
        fetchuserweatherInfo(coordinates);
    }
}

async function fetchuserweatherInfo(coordinates) {
    const { lat, lon } = coordinates;

    grantAcessContainer.classList.remove("active");
    loading.classList.add("active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${Api_key}&units=metric`);
        const data = await response.json();

        if (data.cod !== 200) {
            alert("Unable to fetch weather data.");
            grantAcessContainer.classList.add("active");
            loading.classList.remove("active");
            return;
        }

        loading.classList.remove("active");
        usercontainer.classList.add("active");
        renderinfo(data);
    } catch (error) {
        loading.classList.remove("active");
        console.error("Error fetching weather data:", error);
    }
}

function renderinfo(weatherInfo) {
    const cityname = document.querySelector('[data-cityName]');
    const countryicon = document.querySelector('[data-countryIcon]');
    const desc = document.querySelector('[data-weather-discription]');
    const weathericon = document.querySelector('[data-weather-icon]');
    const temp = document.querySelector('[data-temp]');
    const windspeed = document.querySelector('[data-windspeed]');
    const humidity = document.querySelector('[data-humidity]');
    const dataclouds = document.querySelector('[data-clouds]');

    cityname.innerText = weatherInfo?.name;
    countryicon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country?.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weathericon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp}°C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    dataclouds.innerText = `${weatherInfo?.clouds?.all}%`;

    userinfoContainer.classList.add("active"); // Make sure the weather data container is visible
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showposition, (error) => {
            alert("Geolocation not available or permission denied.");
            grantAcessContainer.classList.add("active");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
        grantAcessContainer.classList.add("active");
    }
}

function showposition(position) {
    const usercoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };

    // Store in session storage
    sessionStorage.setItem("user-coordinates", JSON.stringify(usercoordinates));

    // Fetch weather info immediately after getting location
    fetchuserweatherInfo(usercoordinates);
}

// Click event for Grant Access button
const grantAcessbtn = document.querySelector("[data-grantAcess]");
grantAcessbtn.addEventListener("click", () => {
    grantAcessContainer.classList.remove("active");
    getLocation();
});

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityname = searchInput.value.trim();
    if (cityname !== "") {
        fetchsearchweatherinfo(cityname);
    } else {
        alert("Please enter a city name.");
    }
});

async function fetchsearchweatherinfo(name) {
    loading.classList.add("active");
    usercontainer.classList.remove("active");
    grantAcessContainer.classList.remove("active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${Api_key}&units=metric`);
        const data = await response.json();

        if (data.cod !== 200) {
            alert("City not found. Please enter a valid city name.");
            loading.classList.remove("active");
            grantAcessContainer.classList.add("active");
            return;
        }

        loading.classList.remove("active");
        usercontainer.classList.add("active");
        renderinfo(data);
    } catch (error) {
        loading.classList.remove("active");
        console.error("Error fetching weather data:", error);
    }
}
