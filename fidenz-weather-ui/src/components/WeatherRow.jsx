import {Sun,Cloud,CloudRain,AlignJustify,Star,} from "lucide-react";

function WeatherRow({ weather, index }) {

  const score = Number(
    weather.comfortScore ?? 0
  );


  const cityName =
    weather.cityName ??
    weather.CityName ??
    weather.name ??
    "Unknown";


  const temperature =
    weather.temperature ??
    weather.Temp ??
    weather.temp ??
    0;


  const description =
    weather.description ??
    weather.weatherDescription ??
    weather.status ??
    weather.Status ??
    "Clear";


  const country =
    weather.country ??
    weather.Country ??
    "";


  const getRating = () => {

    if (score >= 80) {
      return {
        name: "Excellent",
        className: "excellent",
      };
    }

    if (score >= 65) {
      return {
        name: "Good",
        className: "good",
      };
    }

    if (score >= 50) {
      return {
        name: "Moderate",
        className: "moderate",
      };
    }

    if (score >= 35) {
      return {
        name: "Fair",
        className: "fair",
      };
    }

    return {
      name: "Poor",
      className: "poor",
    };
  };


  const getWeatherIcon = () => {

    const value =
      description.toLowerCase();

    if (
      value.includes("rain") ||
      value.includes("drizzle")
    ) {
      return (
        <CloudRain
          size={31}
          className="rain-icon"
        />
      );
    }

    if (
      value.includes("cloud")
    ) {
      return (
        <Cloud
          size={31}
          className="cloud-icon"
        />
      );
    }

    if (
      value.includes("mist") ||
      value.includes("fog")
    ) {
      return (
        <AlignJustify
          size={31}
          className="mist-icon"
        />
      );
    }

    return (
      <Sun
        size={31}
        className="sun-icon"
      />
    );
  };


  const getRankClass = () => {

    if (index === 0) {
      return "rank-first";
    }

    if (index === 1) {
      return "rank-second";
    }

    if (index === 2) {
      return "rank-third";
    }

    return "rank-normal";
  };


  const rating = getRating();


  return (
    <div className="weather-row">

      {/* Rank */}
      <div className="rank-cell">

        {index < 3 ? (

          <div className={`rank-medal ${getRankClass()}`}>
            {index === 0 && "🥇"}
            {index === 1 && "🥈"}
            {index === 2 && "🥉"}
          </div>

        ) : (

          <div className="rank-number">
            {index + 1}
          </div>

        )}

      </div>


      
      <div className="city-cell">

        <strong>
          {cityName}
        </strong>

        <span>
          {country}
        </span>

      </div>


      
      <div className="condition-cell">

        <div className="condition-icon">
          {getWeatherIcon()}
        </div>

        <span>
          {description}
        </span>

      </div>


      {/* Temperature */}
      <div className="temperature-cell">

        {Number(temperature).toFixed(1)} °C

      </div>


      {/* Comfort Index */}
      <div className="comfort-cell">

        <div className="comfort-bar">

          <div
            className={
              score >= 65
                ? "comfort-bar-fill high"
                : score >= 50
                ? "comfort-bar-fill medium"
                : "comfort-bar-fill low"
            }
            style={{
              width: `${Math.min(
                Math.max(score, 0),
                100
              )}%`,
            }}
          />

        </div>

        <span>
          {score}/100
        </span>

      </div>


      {/* Rating */}
      <div className="rating-cell">

        <span
          className={`rating ${rating.className}`}
        >
          {rating.name}
        </span>

      </div>

    </div>
  );
}

export default WeatherRow;