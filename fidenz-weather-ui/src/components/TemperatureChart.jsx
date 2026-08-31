import {ResponsiveContainer,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,} from "recharts";

function TemperatureChart({ weather }) {
  const chartData = weather.map((city) => ({
    city:
      city.cityName ||
      city.CityName ||
      city.name ||
      city.Name ||
      "Unknown",

    temperature:
      Number(
        city.temperature ??
        city.Temperature ??
        city.temp ??
        city.Temp ??
        0
      ),
  }));

  return (
    <div className="temperature-chart-card">

      <div className="temperature-chart-header">

        <div>
          <h2>Temperature Overview</h2>

          <p>
            Current temperature by city
          </p>
        </div>

      </div>

      <div className="temperature-chart">

        <ResponsiveContainer
          width="100%"
          height={350}
        >

          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 20,
              left: 10,
              bottom: 10,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="city"
              tick={{
                fontSize: 11,
              }}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={70}
            />

            <YAxis
              tick={{
                fontSize: 11,
              }}
              label={{
                value: "°C",
                angle: -90,
                position: "insideLeft",
              }}
            />

            <Tooltip
              formatter={(value) => [
                `${Number(value).toFixed(1)} °C`,
                "Temperature",
              ]}
            />

            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#1769ed"
              strokeWidth={3}
              dot={{
                r: 4,
              }}
              activeDot={{
                r: 6,
              }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default TemperatureChart;