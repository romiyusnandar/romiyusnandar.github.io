const cityInput = document.querySelector('.city-input')
const searchBtn = document.querySelector('.search-btn')

const apiUrlBmkg = 'https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4='

const csvFile = "data/base.csv"

const weatherInfoSection = document.querySelector('.weather-info')
const notFoundSection = document.querySelector('.not-found')
const searchCitySection = document.querySelector('.search-city')

searchBtn.addEventListener('click', () => {
  if (cityInput.value.trim() != '') {
    updateWeatherInfo(cityInput.value)
    cityInput.value = ''
    cityInput.blur()
  }
})

cityInput.addEventListener('keydown', (e) => {
  if (e.key == 'Enter' && cityInput.value.trim() != '') {
    updateWeatherInfo(cityInput.value)
    cityInput.value = ''
    cityInput.blur()
  }
})

// get kodeWilyah from csv file
async function getWilayahCode(cityName) {
  const csvData = await fetch(csvFile).then(response => response.text())
  const rows = csvData.split('\n')
  for (const row of rows) {
    const colums = row.split(',')
    const namaWilayah = colums[1]?.trim().toLowerCase()
    const kodeWilayah = colums[0]?.trim()
    if (namaWilayah === cityName.toLowerCase()) {
      return kodeWilayah
    }
  }
  return null
}

// get weather data from api bmkg by kodeWilayah
async function getWeatherDataFromBMMKG(kodeWilayah) {
  const apiUrl = `${apiUrlBmkg}${kodeWilayah}`
  const response = await fetch(apiUrl)
  return response.json()
}

// return weather
async function updateWeatherInfo(city) {
  try {
    const kodeWilayah = await getWilayahCode(city)

    if (!kodeWilayah) {
      console.log(`Kode wilayah untuk ${city} tidak ditemukan.`)
      showDisplaySection(notFoundSection)
      return;
    }

    const weatherData = await getWeatherDataFromBMMKG(kodeWilayah)
    // console.log(weatherData)

    if (weatherData && weatherData.data) {
      const currentWeather = weatherData.data[0].cuaca[0][0];
      const localDateTime = currentWeather.local_datetime;
      const localDate = localDateTime.split(' ')[0];

      document.querySelector('.country-txt').textContent = `${weatherData.data[0].lokasi.desa}, ${weatherData.data[0].lokasi.kecamatan}`;
      document.querySelector('.weather-summary-img').src = currentWeather.image;
      document.querySelector('.current-date-txt').textContent = localDate;
      document.querySelector('.temp-txt').textContent = `${currentWeather.t} °C`;
      document.querySelector('.condition-txt').textContent = currentWeather.weather_desc;
      document.querySelector('.humidity-value-txt').textContent = `${currentWeather.hu} %`;
      document.querySelector('.wind-value-txt').textContent = `${currentWeather.ws} KM/j`;

      const forecastContainer = document.querySelector('.forecast-items-container');
      forecastContainer.innerHTML = '';

      for (let i = 1; i <= 2; i++) {
        const forecast = weatherData.data[0].cuaca[i][0];
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');

        forecastItem.innerHTML = `
          <h5 class="forecast-item-date regular-txt">${forecast.local_datetime.split(' ')[0]}</h5>
          <img src="${forecast.image}" class="forecast-item-img">
          <h5 class="forecast-item-temp">${forecast.t} °C</h5>
        `;

        forecastContainer.appendChild(forecastItem);
      }

      showDisplaySection(weatherInfoSection)

    } else {
      showDisplaySection(notFoundSection)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

function showDisplaySection(section) {
  [searchCitySection, weatherInfoSection, notFoundSection].forEach(sec => sec.style.display = 'none')
  section.style.display = 'flex'
}
