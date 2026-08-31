import WeatherCard from "./WeatherCard";

function WeatherGrid({ weather }) {

  return (
    <div className="weather-grid">

      {weather.map((item, index) => (

        <WeatherCard
          key={item.cityCode || index}
          weather={item}
        />

      ))}

    </div>
  );
}

export default WeatherGrid;