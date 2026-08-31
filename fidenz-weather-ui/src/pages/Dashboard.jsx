import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import {LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,
    ReferenceDot,} from "recharts";

import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import WeatherModal from "../components/WeatherModal";
import Footer from "../components/Footer";
import { getWeather } from "../services/weatherApi";

function Dashboard() {
  const {
    getAccessTokenSilently,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth0();


  // main weather list comes from the api, plus a few ui flags
  const [weather, setWeather] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // when we last got data, just for the header
  const [lastUpdated, setLastUpdated] = useState("");

  // search + rating filter (client side, no extra calls)
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  // city we are showing in the modal, null = modal closed
  const [selectedCity, setSelectedCity] = useState(null);


  // backend sends camelCase, but be a bit flexible here just in case
  function getCityName(city) {
    return (
      city.cityName ||
      city.CityName ||
      city.name ||
      city.Name ||
      city.city ||
      "Unknown City"
    );
  }

  function getScore(city) {
    const score =
      city.comfortScore ??
      city.ComfortScore ??
      city.score ??
      city.Score ??
      0;

    const number = Number(score);

    // have seen api send weird values, fall back to 0
    if (Number.isNaN(number)) {
      return 0;
    }

    return Math.round(number);
  }

  function getTemperature(city) {
    const temperature =
      city.temperature ??
      city.Temperature ??
      city.temp ??
      city.Temp ??
      0;

    const number = Number(temperature);

    if (Number.isNaN(number)) {
      return 0;
    }

    return number;
  }

  function getDescription(city) {
    return (
      city.description ||
      city.Description ||
      city.status ||
      city.Status ||
      city.weatherDescription ||
      city.WeatherDescription ||
      "Unknown"
    );
  }

  function getRating(score) {
    // comfort rating as words, so its easy for anyone to understand
    if (score >= 80) {
      return "Excellent";
    }

    if (score >= 60) {
      return "Good";
    }

    if (score >= 40) {
      return "Moderate";
    }

    if (score >= 25) {
      return "Fair";
    }

    return "Poor";
  }

  function getRatingClass(score) {
    if (score >= 80) {
      return "excellent";
    }

    if (score >= 60) {
      return "good";
    }

    if (score >= 40) {
      return "moderate";
    }

    if (score >= 25) {
      return "fair";
    }

    return "poor";
  }

  function getWeatherIcon(description) {
    // pick an emoji based on what the api says. default to partly sunny
    if (!description) {
      return "☀️";
    }

    const value = description.toLowerCase();

    if (
      value.includes("thunder") ||
      value.includes("storm")
    ) {
      return "⛈️";
    }

    if (
      value.includes("rain") ||
      value.includes("drizzle")
    ) {
      return "🌧️";
    }

    if (
      value.includes("cloud") ||
      value.includes("overcast")
    ) {
      return "☁️";
    }

    if (
      value.includes("mist") ||
      value.includes("fog")
    ) {
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

  function getTemperatureColor(temperature) {
    // red = hot, yellow/amber = warm-ish, green = cool
    if (temperature >= 28) {
      return "#ef4444";
    }

    if (temperature >= 20) {
      return "#f59e0b";
    }

    return "#10b981";
  }

  // hits the backend, needs a fresh token from auth0
  const loadWeather = async () => {
    try {
      setLoading(true);
      setError("");

      // silent = no popup for the user, auth0 refreshes behind the scenes
      const token = await getAccessTokenSilently();

      // should never get here really, but the api needs a token
      if (!token) {
        throw new Error(
          "Auth0 access token was not received."
        );
      }

      const data = await getWeather(token);

      // backend should give us a list. anything else and we bail
      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid weather data received from server."
        );
      }

      setWeather(data);

      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    } catch (err) {
      console.error(
        "Weather loading error:",
        err
      );

      // clear list so the empty state shows, not stale data
      setWeather([]);

      setError(
        err?.message ||
          "Failed to load weather data."
      );
    } finally {
      // always stop the spinner, even on error
      setLoading(false);
    }
  };

  useEffect(() => {
    // wait until auth0 finished loading and we know who's logged in
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    loadWeather();
  }, [authLoading, isAuthenticated]);


  // search + filter both run together, cheap enough to do every render
  const filteredWeather = weather.filter(
    (city) => {
      const cityName =
        getCityName(city).toLowerCase();

      const matchesSearch =
        cityName.includes(
          searchTerm.toLowerCase()
        );

      const score = getScore(city);

      let matchesFilter = true;

      if (filter === "excellent") {
        matchesFilter = score >= 80;
      }

      if (filter === "good") {
        matchesFilter =
          score >= 60 && score < 80;
      }

      if (filter === "moderate") {
        matchesFilter =
          score >= 40 && score < 60;
      }

      if (filter === "poor") {
        matchesFilter = score < 40;
      }

      return (
        matchesSearch &&
        matchesFilter
      );
    }
  );

  // average of all comfort scores, rounded
  const averageComfort =
    weather.length > 0
      ? Math.round(
          weather.reduce(
            (total, city) =>
              total + getScore(city),
            0
          ) / weather.length
        )
      : 0;

  // walk the list and just keep the one with the highest score
  const mostComfortable =
    weather.length > 0
      ? weather.reduce(
          (best, city) =>
            getScore(city) >
            getScore(best)
              ? city
              : best
        )
      : null;


  // chart only needs the city name + temp
  const temperatureChartData =
    weather.map((city) => ({
      city: getCityName(city),
      temperature: Number(
        getTemperature(city).toFixed(1)
      ),
    }));


  return (
    <div className="app-layout">

      <div className="main-content-area">

        <Navbar />

        <main className="dashboard-content">

          <div className="page-header">

            <div>
              <h1>
                Weather Comfort Dashboard
              </h1>

              <p>
                Cities ranked by Comfort Index
                (0 - 100)
              </p>
            </div>

            <div className="page-header-actions">

              {/* refresh manually pulls fresh data from the backend */}
              <button
                className="refresh-button"
                onClick={loadWeather}
                disabled={loading}
              >
                {loading
                  ? "Loading..."
                  : "↻ Refresh"}
              </button>

              <span className="last-updated-time">
                Last Updated:{" "}
                {lastUpdated ||
                  "--:--:--"}
              </span>

            </div>

          </div>

          {/* only show errors when there actually is one */}
          {error && (
            <div className="error-message">

              <strong>
                Error loading weather
              </strong>

              <p>
                {error}
              </p>

              <button
                className="refresh-button"
                onClick={loadWeather}
              >
                Try Again
              </button>

            </div>
          )}

          <div className="stats-grid">

            {/* four little cards up top, quick glance numbers */}
            <div className="stats-card">

              <div className="stats-icon stats-icon-blue">
                🏢
              </div>

              <div className="stats-content">

                <span>
                  Total Cities
                </span>

                <strong>
                  {weather.length}
                </strong>

              </div>

            </div>

            <div className="stats-card">

              <div className="stats-icon stats-icon-green">
                🏅
              </div>

              <div className="stats-content">

                <span>
                  Most Comfortable
                </span>

                <strong className="best-city-name">
                  {mostComfortable
                    ? getCityName(
                        mostComfortable
                      )
                    : "-"}
                </strong>

                <small>
                  Score:{" "}
                  {mostComfortable
                    ? `${getScore(
                        mostComfortable
                      )}/100`
                    : "-"}
                </small>

              </div>

            </div>

            <div className="stats-card">

              <div className="stats-icon stats-icon-orange">
                🌡️
              </div>

              <div className="stats-content">

                <span>
                  Average Comfort
                </span>

                <strong className="average-comfort-score">
                  {averageComfort}/100
                </strong>

                <small>
                  {getRating(
                    averageComfort
                  )}
                </small>

              </div>

            </div>

          </div>

          {/* chart only makes sense when we have data to plot */}
          {!loading &&
            weather.length > 0 && (

              <div className="chart-card">

                <div className="chart-card-header">

                  <div>
                    <h2>
                      Temperature Overview
                    </h2>

                    <p>
                      Current temperature
                      by city
                    </p>
                  </div>

                  {/* small legend so the colors are self-explanatory */}
                  <div className="temperature-legend">

                    <span>
                      <i className="legend-cool" />
                      Cool
                    </span>

                    <span>
                      <i className="legend-warm" />
                      Moderate
                    </span>

                    <span>
                      <i className="legend-hot" />
                      Hot
                    </span>

                  </div>

                </div>

                <div className="chart-body">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <LineChart
                      data={
                        temperatureChartData
                      }
                      margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 5,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                      />

                      <XAxis
                        dataKey="city"
                        stroke="#667085"
                        tick={{
                          fontSize: 11,
                        }}
                      />

                      <YAxis
                        stroke="#667085"
                        unit="°C"
                        tick={{
                          fontSize: 11,
                        }}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor:
                            "#ffffff",
                          border:
                            "1px solid #e5e7eb",
                          color:
                            "#101828",
                          borderRadius:
                            "6px",
                        }}
                        formatter={(
                          value
                        ) => [
                          `${value} °C`,
                          "Temperature",
                        ]}
                      />

                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#1769ed"
                        strokeWidth={3}
                        dot={{
                          stroke: "#1769ed",
                          strokeWidth: 2,
                          r: 5,
                          fill: "#ffffff",
                        }}
                        activeDot={{
                          r: 7,
                          strokeWidth: 2,
                        }}
                        animationDuration={800}
                      />

                      {weather.map((entry, index) => {
                        const cityItem =
                          weather.find(
                            (item) =>
                              getCityName(
                                item
                              ) ===
                              entry.city
                          );

                        return (
                          <ReferenceDot
                            key={`point-${index}`}
                            x={entry.city}
                            y={entry.temperature}
                            r={6}
                            fill={getTemperatureColor(
                              entry.temperature
                            )}
                            stroke="#ffffff"
                            strokeWidth={2}
                            onClick={() =>
                              cityItem &&
                              setSelectedCity(
                                cityItem
                              )
                            }
                          />
                        );
                      })}

                    </LineChart>

                  </ResponsiveContainer>

                </div>

              </div>
            )}

          <div className="weather-list">

            <div className="list-toolbar">

              <div className="search-box">

                <span className="search-box-icon">
                  🔍
                </span>

                <input
                  type="text"
                  placeholder="Search city..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                />

                {searchTerm && (
                  <button
                    className="search-clear-button"
                    onClick={() =>
                      setSearchTerm("")
                    }
                    type="button"
                  >
                    ✕
                  </button>
                )}

              </div>

              <select
                className="filter-select"
                value={filter}
                onChange={(e) =>
                  setFilter(
                    e.target.value
                  )
                }
              >

                <option value="all">
                  All Ratings
                </option>

                <option value="excellent">
                  Excellent
                </option>

                <option value="good">
                  Good
                </option>

                <option value="moderate">
                  Moderate
                </option>

                <option value="poor">
                  Poor
                </option>

              </select>

            </div>

            {loading && <Loading />}

            {/* spinner above, table below (on mobile it morphs into cards) */}
            {!loading &&
              filteredWeather.length >
                0 && (

                <div className="weather-table-scroll">

                  <div className="weather-table-header">

                    <div>
                      Rank
                    </div>

                    <div>
                      City
                    </div>

                    <div>
                      Weather
                    </div>

                    <div>
                      Temperature
                    </div>

                    <div>
                      Comfort Index
                    </div>

                    <div>
                      Rating
                    </div>

                  </div>

                  {/* every row opens the detail modal when clicked */}
                  {filteredWeather.map(
                    (city, index) => {

                      const score =
                        getScore(city);

                      const cityName =
                        getCityName(city);

                      const description =
                        getDescription(city);

                      const temperature =
                        getTemperature(city);

                      const actualRank =
                        city.rank ??
                        city.Rank ??
                        weather.findIndex(
                          (item) =>
                            item === city
                        ) + 1;

                      return (
                        <div
                          className="weather-row"
                          key={
                            city.cityCode ||
                            city.CityCode ||
                            city.id ||
                            city.Id ||
                            index
                          }
                          onClick={() =>
                            setSelectedCity(
                              city
                            )
                          }
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (
                              event.key ===
                              "Enter"
                            ) {
                              setSelectedCity(
                                city
                              );
                            }
                          }}
                        >
                          <div className="rank-cell">
                            {/* medals only for the podium spots */}
                            {city.rank &&
                              city.rank ===
                                1 && (
                                <span className="rank-medal">
                                  🥇
                                </span>
                              )}

                            {city.rank &&
                              city.rank ===
                                2 && (
                                <span className="rank-medal">
                                  🥈
                                </span>
                              )}

                            {city.rank &&
                              city.rank ===
                                3 && (
                                <span className="rank-medal">
                                  🥉
                                </span>
                              )}

                            {(!city.rank ||
                              city.rank > 3) && (
                              <span className="rank-number">
                                {actualRank}
                              </span>
                            )}
                          </div>

                          <div className="city-cell">

                            <strong>
                              {cityName}
                            </strong>

                            <span>
                              {city.country ||
                                city.Country ||
                                ""}
                            </span>

                          </div>

                          <div className="condition-cell">

                            <span className="condition-icon">
                              {getWeatherIcon(
                                description
                              )}
                            </span>

                            <span>
                              {description}
                            </span>

                          </div>

                          <div className="temperature-cell">

                            {temperature.toFixed(
                              1
                            )}{" "}
                            °C

                          </div>

                          {/* comfort bar always shows 0-100, clamped so it never overflows */}
                          <div className="comfort-cell">

                            <div className="comfort-bar">

                              <div
                                className={
                                  `comfort-bar-fill ${
                                    score >= 65
                                      ? "high"
                                      : score >=
                                        50
                                      ? "medium"
                                      : "low"
                                  }`
                                }
                                style={{
                                  width:
                                    `${Math.min(
                                      Math.max(
                                        score,
                                        0
                                      ),
                                      100
                                    )}%`,
                                }}
                              />

                            </div>

                            <span>
                              {score}/100
                            </span>

                          </div>

                          <div className="rating-cell">

                            <span
                              className={
                                `rating ${getRatingClass(
                                  score
                                )}`
                              }
                            >
                              {getRating(
                                score
                              )}
                            </span>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}


            {/* search matched nothing — let them reset quick */}
            {!loading &&
              weather.length > 0 &&
              filteredWeather.length ===
                0 && (

                <div className="no-data">

                  <div className="no-data-icon">
                    🔍
                  </div>

                  <h3>
                    No cities found
                  </h3>

                  <p>
                    Try another city name
                    or rating filter.
                  </p>

                  <button
                    className="refresh-button"
                    onClick={() => {
                      setSearchTerm("");
                      setFilter("all");
                    }}
                  >
                    Clear Filters
                  </button>

                </div>
              )}

            {/* this one means the backend gave us nothing at all */}
            {!loading &&
              weather.length === 0 &&
              !error && (

                <div className="no-data">

                  <div className="no-data-icon">
                    🌤️
                  </div>

                  <h3>
                    No weather data
                    available
                  </h3>

                  <p>
                    Try refreshing the
                    weather data.
                  </p>

                  <button
                    onClick={loadWeather}
                    className="refresh-button"
                  >
                    ↻ Refresh
                  </button>

                </div>
              )}

            {!loading &&
              weather.length > 0 && (

                <div className="pagination">

                  <span>
                    Showing{" "}
                    {
                      filteredWeather.length
                    }{" "}
                    of{" "}
                    {weather.length} cities
                  </span>

                </div>
              )}

          </div>

        </main>

        <Footer />

      </div>

      {selectedCity && (
        <WeatherModal
          city={selectedCity}
          onClose={() =>
            setSelectedCity(null)
          }
        />
      )}

    </div>
  );
}

export default Dashboard;

