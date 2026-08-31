import {
  Building2,
  Award,
  Thermometer,
  RefreshCw,
} from "lucide-react";

function SummaryCards({ weather }) {

  const totalCities = weather.length;

  const mostComfortable =
    weather.length > 0
      ? weather[0]
      : null;

  const averageComfort =
    weather.length > 0
      ? Math.round(
          weather.reduce(
            (total, city) =>
              total + Number(city.comfortScore || 0),
            0
          ) / weather.length
        )
      : 0;


  const getAverageRating = () => {
    if (averageComfort >= 80) return "Excellent";
    if (averageComfort >= 65) return "Good";
    if (averageComfort >= 50) return "Moderate";
    if (averageComfort >= 35) return "Fair";

    return "Poor";
  };


  return (
    <div className="stats-grid">

      {/* Total Cities */}
      <div className="stats-card">

        <div className="stats-icon stats-icon-blue">
          <Building2 size={31} />
        </div>

        <div className="stats-content">

          <span>Total Cities</span>

          <strong>
            {totalCities}
          </strong>

        </div>

      </div>


      {/* Most Comfortable */}
      <div className="stats-card">

        <div className="stats-icon stats-icon-green">
          <Award size={34} />
        </div>

        <div className="stats-content">

          <span>Most Comfortable</span>

          <strong className="best-city-name">
            {mostComfortable?.cityName || "-"}
          </strong>

          <small>
            Score: {mostComfortable?.comfortScore || 0}/100
          </small>

        </div>

      </div>


      {/* Average Comfort */}
      <div className="stats-card">

        <div className="stats-icon stats-icon-orange">
          <Thermometer size={31} />
        </div>

        <div className="stats-content">

          <span>Average Comfort</span>

          <strong className="average-comfort-score">
            {averageComfort}/100
          </strong>

          <small>
            {getAverageRating()}
          </small>

        </div>

      </div>


      

    </div>
  );
}

export default SummaryCards;