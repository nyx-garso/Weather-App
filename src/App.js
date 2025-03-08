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
  'scattered clouds': 'cloudy',
  'broken clouds': 'cloudy',
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
  'few clouds': cloudsVideo,
  'scattered clouds': cloudsVideo,
  'broken clouds': cloudsVideo,
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

  const fetchCitySuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
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
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();
      if (data.cod === 200) {
        const description = data.weather[0].description.toLowerCase();
        setWeather({
          city: `${data.name}, ${data.sys.country}`,
          temperature: `${Math.round(data.main.temp)}°C`,
          description,
          humidity: data.main.humidity,
          wind: data.wind.speed,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
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

  useEffect(() => {
    const videoElement = document.querySelector(".background-media");
    if (videoElement && videoElement.tagName === "VIDEO") {
      videoElement.play().catch(error => console.log("Autoplay blocked:", error));
    }
  }, [videoSrc]);

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
          onBlur={() => setTimeout(() => setShowSuggestions(false), 500)}
        />

        {weather && (
          <div className="weather-info">
            <h2 className="city-name">{weather.city}</h2>
            <img src={weather.icon} alt="Weather Icon" className="weather-icon" />
            <p className={`temperature ${theme}`}>{weather.temperature}</p>
            <p className="weather-description">{weather.description}</p>
            <p className="humidity" data-level="moderate">Humidity: {weather.humidity}%</p>
            <p className="wind" data-level="moderate">Wind: {weather.wind} m/s</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
