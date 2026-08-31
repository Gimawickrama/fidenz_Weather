import WeatherRow from "./WeatherRow";

function WeatherTable({ weather }) {

  return (
    <div className="weather-table-scroll">
      <div className="weather-table-header">

        <div>Rank</div>
        <div>City</div>
        <div>Weather</div>
        <div>Temperature</div>
        <div>Comfort Index</div>
        <div>Rating</div>
        <div></div>

      </div>
      <div>

        {weather.length === 0 ? (

          <div className="no-results">
            No cities found.
          </div>

        ) : (

          weather.map((city, index) => (

            <WeatherRow
              key={
                city.cityCode ||
                city.CityCode ||
                index
              }
              weather={city}
              index={index}
            />

          ))

        )}

      </div>

      <div className="pagination">

        <button>
          ‹
        </button>

        <button className="pagination-active">
          1
        </button>

        <button>
          ›
        </button>

      </div>

    </div>
  );
}

export default WeatherTable;