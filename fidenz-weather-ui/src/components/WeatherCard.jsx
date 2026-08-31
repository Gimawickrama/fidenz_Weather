function WeatherCard({ weather }) {

  return (
    <div className="weather-card">

      <h3>
        {weather.cityName}
      </h3>

      <p>
        {weather.description}
      </p>

      <strong>
        {Number(weather.temperature).toFixed(1)} °C
      </strong>

      <span>
        Comfort Score: {weather.comfortScore}/100
      </span>

    </div>
  );
}

export default WeatherCard;