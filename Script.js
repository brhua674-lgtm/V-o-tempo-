const API_KEY = 'eba0ca7abead12061cbcbefc75ac2dda';

const input = document.getElementById('cityInput');
const errorMsg = document.getElementById('errorMsg');
const loading = document.getElementById('loading');
const card = document.getElementById('weatherCard');

input.addEventListener('keydown', e => { if (e.key === 'Enter') fetchWeather(); });

function showError(msg) {
  errorMsg.textContent = msg;
  loading.classList.remove('visible');
  card.classList.remove('visible');
}

function formatTime(unix, offset) {
  const d = new Date((unix + offset) * 1000);
  return d.toUTCString().slice(17, 22);
}

function getDayName(dateStr) {
  const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  return days[new Date(dateStr).getDay()];
}

async function fetchWeather() {
  const city = input.value.trim();
  if (!city) return;

  errorMsg.textContent = '';
  card.classList.remove('visible');
  loading.classList.add('visible');

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pt_br`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pt_br`)
    ]);

    if (!currentRes.ok) {
      showError('Cidade não encontrada nas trevas.');
      return;
    }

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    const offset = current.timezone;
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    document.getElementById('cityName').textContent = current.name;
    document.getElementById('countryDate').textContent = `${current.sys.country} — ${dateStr}`;
    document.getElementById('temperature').textContent = `${Math.round(current.main.temp)}°`;
    document.getElementById('feelsLike').textContent = `Sensação: ${Math.round(current.main.feels_like)}°C`;
    document.getElementById('description').textContent = current.weather[0].description;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
    document.getElementById('humidity').innerHTML = `${current.main.humidity}<span class="stat-unit">%</span>`;
    document.getElementById('wind').innerHTML = `${Math.round(current.wind.speed * 3.6)}<span class="stat-unit">km/h</span>`;
    document.getElementById('pressure').innerHTML = `${current.main.pressure}<span class="stat-unit">hPa</span>`;
    document.getElementById('visibility').innerHTML = `${(current.visibility / 1000).toFixed(1)}<span class="stat-unit">km</span>`;
    document.getElementById('clouds').innerHTML = `${current.clouds.all}<span class="stat-unit">%</span>`;
    document.getElementById('sunrise').textContent = formatTime(current.sys.sunrise, offset);
    document.getElementById('sunset').textContent = formatTime(current.sys.sunset, offset);
    document.getElementById('minmax').innerHTML = `${Math.round(current.main.temp_min)}° <span class="stat-unit">/</span> ${Math.round(current.main.temp_max)}°`;

    const dailyMap = {};
    forecast.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyMap[date]) dailyMap[date] = [];
      dailyMap[date].push(item);
    });

    const days = Object.keys(dailyMap).slice(0, 5);
    const fg = document.getElementById('forecastGrid');
    fg.innerHTML = '';

    days.forEach(date => {
      const entries = dailyMap[date];
      const temps = entries.map(e => e.main.temp);
      const maxTemp = Math.round(Math.max(...temps));
      const minTemp = Math.round(Math.min(...temps));
      const midEntry = entries[Math.floor(entries.length / 2)];
      const icon = midEntry.weather[0].icon;

      const div = document.createElement('div');
      div.className = 'forecast-day';
      div.innerHTML = `
        <div class="forecast-dow">${getDayName(date + 'T12:00:00')}</div>
        <img class="forecast-icon" src="https://openweathermap.org/img/wn/${icon}.png" alt="">
        <div class="forecast-temp">${maxTemp}°</div>
        <div class="forecast-temp-min">${minTemp}°</div>
      `;
      fg.appendChild(div);
    });

    loading.classList.remove('visible');
    card.classList.add('visible');

  } catch (err) {
    showError('Erro ao invocar os dados das trevas.');
  }
}