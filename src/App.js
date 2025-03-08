import React, { useState, useEffect } from 'react';
import './App.css';
import clearSkyVideo from './videos/clear-sky.mp4';
import rainVideo from './videos/rain.mp4';
import thunderstormVideo from './videos/thunderstorm.mp4';
import snowGif from './videos/snow.gif';
import cloudsVideo from './videos/clouds.mp4';
import mistVideo from './videos/mist.mp4';

const API_KEY = 'b0cca6bfbb92130cd2bafa496f377b08';

const weatherThemes = {
  'clear sky': 'clear',
  'few clouds': 'cloudy',
  'overcast clouds': 'cloudy',
  'scattered clouds': 'cloudy',
  'broken clouds': 'cloudy',
  'moderate rain': 'rainy',
  'light rain': 'rainy',
  'shower rain': 'rainy',
  'rain': 'rainy',
  'thunderstorm': 'rainy',
  'snow': 'snowy',
  'light snow': 'snowy',
  'heavy snow': 'snowy',
  'sleet': 'snowy',
  'mist': 'misty',
};

const weatherVideos = {
  'clear sky': clearSkyVideo,
  'overcast clouds': cloudsVideo,
  'few clouds': cloudsVideo,
  'scattered clouds': cloudsVideo,
  'broken clouds': cloudsVideo,
  'moderate rain': rainVideo,
  'light rain': rainVideo,
  'shower rain': rainVideo,
  'rain': rainVideo,
  'thunderstorm': thunderstormVideo,
  'snow': snowGif,
  'light snow': snowGif,
  'heavy snow': snowGif,
  'sleet': snowGif,
  'mist': mistVideo,
};

const App = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [videoSrc, setVideoSrc] = useState(clearSkyVideo);
  const [theme, setTheme] = useState('clear');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch city suggestions from OpenWeatherMap Geolocation API
  const fetchCitySuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      const data = await response.json();

      if (data.length > 0) {
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
    }
  };

  const fetchWeather = async (cityName) => {
    if (!cityName || cityName.length < 3) return; // Prevents short queries
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();

      if (data.cod === 200) {
        const temperature = Math.round(data.main.temp);
        const description = data.weather[0].description.toLowerCase();
        
        let tempClass = 'cold';
        if (temperature > 30) tempClass = 'hot';
        else if (temperature > 20) tempClass = 'warm';
        else if (temperature > 10) tempClass = 'cool';

        setWeather({
          city: `${data.name}, ${data.sys.country}`,
          temperature: `${temperature}°C`,
          description,
          humidity: `${data.main.humidity}%`,
          wind: `${data.wind.speed} m/s`,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          temperatureClass: tempClass,
          humidityLevel:
            data.main.humidity < 40 ? 'low' :
            data.main.humidity < 70 ? 'moderate' : 'high',
          windLevel:
            data.wind.speed < 3 ? 'low' :
            data.wind.speed < 8 ? 'moderate' : 'high',
        });

        setVideoSrc(weatherVideos[description] || clearSkyVideo);
        setTheme(weatherThemes[description] || 'clear');
      } else {
        setWeather(null);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  useEffect(() => {
    if (city) fetchWeather(city);
  }, [city]);

  return (
    <div className={`app-container ${theme}`}>
      <div className="background-container">
        {videoSrc.endsWith('.gif') ? (
          <img src={videoSrc} alt="Weather Background" className="background-media gif" />
        ) : (
          <video autoPlay loop muted key={videoSrc} className="background-media">
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}
      </div>
      <div className="weather-box">
        <h1 className="app-title">Weather App</h1>
        <input
          type="text"
          className="city-input"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            fetchCitySuggestions(e.target.value);
          }}
          placeholder="Enter city name..."
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />

        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions-dropdown">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => {
                  setCity(suggestion.name);
                  fetchWeather(suggestion.name);
                  setShowSuggestions(false);
                }}
              >
                {suggestion.name}, {suggestion.country}
              </li>
            ))}
          </ul>
        )}
        
        {weather && (
          <div className="weather-info">
            <h2 className="city-name">{weather.city}</h2>
            <div className="weather-description-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
              <img src={weather.icon} alt="Weather Icon" className="weather-icon" style={{ marginRight: '10px' }} />
              <p className="weather-description" style={{ textAlign: 'left' }}>{weather.description}</p>
            </div>
            <p className={`temperature ${weather.temperatureClass}`}>{weather.temperature}</p>
            <div className="color-range temperature-range"></div>
            <p className="humidity" data-level={weather.humidityLevel}>
              Humidity: {weather.humidity}
            </p>
            <div className="color-range humidity-range"></div>
            <p className="wind" data-level={weather.windLevel}>
              Wind: {weather.wind}
            </p>
            <div className="color-range wind-range"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
