import { useEffect } from "react";
import { X } from "lucide-react";

function WeatherModal({ city, onClose }) {
  // escape key closes it too, feel free without grabbing the mouse
  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKey);

    return () =>
      window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // same flexible field lookup as the dashboard, keeps things consistent
  const cityName =
    city.cityName ||
    city.CityName ||
    city.name ||
    city.Name ||
    "Unknown City";

  const country =
    city.country || city.Country || "";

  const description =
    city.description ||
    city.Description ||
    city.status ||
    city.Status ||
    city.weatherDescription ||
    city.WeatherDescription ||
    "Unknown";

  const temperature = Number(
    city.temperature ??
      city.Temperature ??
      city.temp ??
      city.Temp ??
      0
  );

  const humidity = Number(
    city.humidity ?? city.Humidity ?? 0
  );

  const windSpeed = Number(
    city.windSpeed ??
      city.WindSpeed ??
      city.wind?.speed ??
      0
  );

  const cloudiness = Number(
    city.cloudiness ??
      city.Cloudiness ??
      city.clouds?.all ??
      0
  );

  const pressure = Number(
    city.pressure ??
      city.Pressure ??
      city.main?.pressure ??
      0
  );

  const visibility = Number(
    city.visibility ?? city.Visibility ?? 0
  );

  const score = Math.round(
    Number(
      city.comfortScore ??
        city.ComfortScore ??
        city.score ??
        0
    ) || 0
  );

  const rank = city.rank ?? city.Rank ?? "";
  const rankmedal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";

  function getRating(value) {
    if (value >= 80) return "Excellent";
    if (value >= 60) return "Good";
    if (value >= 40) return "Moderate";
    if (value >= 25) return "Fair";
    return "Poor";
  }

  function getRatingClass(value) {
    if (value >= 80) return "excellent";
    if (value >= 60) return "good";
    if (value >= 40) return "moderate";
    if (value >= 25) return "fair";
    return "poor";
  }

  function getWeatherIcon(text) {

    if (!text) return "☀️";

    const value = text.toLowerCase();

    if (value.includes("thunder") || value.includes("storm")) {
      return "⛈️";
    }

    if (value.includes("rain") || value.includes("drizzle")) {
      return "🌧️";
    }

    if (value.includes("cloud") || value.includes("overcast")) {
      return "☁️";
    }

    if (value.includes("mist") || value.includes("fog")) {
      return "🌫️";
    }

    if (value.includes("snow")) {
      return "❄️";
    }

    if (value.includes("clear")) {
      return "☀️";
    }

    return "🌤️";
  }

  // clamp the bar 0..100 so a weird score can't break the layout
  const progressWidth = `${Math.min(
    Math.max(score, 0),
    100
  )}%`;

  const progressClass =
    score >= 65
      ? "high"
      : score >= 50
      ? "medium"
      : "low";

  const tempClass =
    temperature >= 28
      ? "hot"
      : temperature >= 20
      ? "warm"
      : "cool";

  // backdrop click also closes it, but not clicks inside the box
  return (
    <div
      className="details-overlay"
      onClick={onClose}
    >
      <div
        className="details-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${cityName} weather details`}
      >
        <div className="details-header">
          <div className="details-title">
            <h3>
              {rankmedal && <span>{rankmedal}</span>}
              {cityName}
            </h3>

            {country && <p>{country}</p>}
          </div>

          <button
            className="details-close-button"
            onClick={onClose}
            aria-label="Close weather details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="details-body">
          <div className="details-summary">
            <span className="details-condition-icon">
              {getWeatherIcon(description)}
            </span>

            <div>
              <span className="details-condition">
                {description}
              </span>

              <div className={`details-temperature ${tempClass}`}>
                {temperature.toFixed(1)} °C
              </div>
            </div>
          </div>

          <div className="details-grid">
            <div className="details-item details-comfort">
              <span>Comfort Index</span>

              <strong className="details-comfort-score">
                {score}/100
              </strong>

              <div className="comfort-bar">
                <div
                  className={`comfort-bar-fill ${progressClass}`}
                  style={{ width: progressWidth }}
                />
              </div>

              <span
                className={`rating ${getRatingClass(score)}`}
              >
                {getRating(score)}
              </span>
            </div>

            <div className="details-item">
              <span>Humidity</span>
              <strong>{Math.round(humidity)}%</strong>
            </div>

            <div className="details-item">
              <span>Wind Speed</span>
              <strong>{windSpeed.toFixed(1)} m/s</strong>
            </div>

            <div className="details-item">
              <span>Cloudiness</span>
              <strong>{Math.round(cloudiness)}%</strong>
            </div>

            <div className="details-item">
              <span>Pressure</span>
              <strong>{Math.round(pressure)} hPa</strong>
            </div>

            <div className="details-item">
              <span>Visibility</span>
              <strong>
                {visibility > 0
                  ? `${(visibility / 1000).toFixed(1)} km`
                  : "-"}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherModal;