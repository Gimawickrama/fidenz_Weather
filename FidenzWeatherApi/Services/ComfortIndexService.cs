using FidenzWeatherApi.Services.Interfaces;

namespace FidenzWeatherApi.Services
{
    public class ComfortIndexService : IComfortIndexService
    {
        public double Calculate(
            double temperature,
            double humidity,
            double windSpeed,
            double cloudiness,
            double pressure,
            double visibility,
            double dewPoint)
        {
            double temperatureScore =CalculateTemperatureScore(temperature);

            double humidityScore =CalculateHumidityScore(humidity);

            double windScore =CalculateWindScore(windSpeed);

            double cloudScore =CalculateCloudScore(cloudiness);

            double pressureScore =CalculatePressureScore(pressure);

            double visibilityScore =CalculateVisibilityScore(visibility);

            double dewPointScore = CalculatedewPointScore (dewPoint);

            // Comfort Index weights
            // Temperature 35%
            // Humidity    20%
            // Wind        15%
            // Cloudiness  10%
            // Pressure    10%
            // Visibility  10%

            double finalScore =
                (temperatureScore * 0.30) +
                (humidityScore * 0.15) +
                (windScore * 0.15) +
                (cloudScore * 0.10) +
                (pressureScore * 0.10) +
                (visibilityScore * 0.10) +
                (dewPointScore * 0.10);

            return Math.Round(
                Math.Clamp(finalScore, 0, 100),
                2);
        }

        private double CalculateTemperatureScore(double temperature)
        {
            const double idealTemperature = 22;

            double difference =
                Math.Abs(temperature - idealTemperature);

            double score =
                100 - (difference * 5);

            return Math.Clamp(score, 0, 100);
        }

        private double CalculateHumidityScore(double humidity)
        {
            const double idealHumidity = 50;

            double difference =
                Math.Abs(humidity - idealHumidity);

            double score =
                100 - (difference * 2);

            return Math.Clamp(score, 0, 100);
        }

        private double CalculateWindScore(double windSpeed)
        {
            const double idealWindSpeed = 3;

            double difference =
                Math.Abs(windSpeed - idealWindSpeed);

            double score =
                100 - (difference * 20);

            return Math.Clamp(score, 0, 100);
        }

        private double CalculateCloudScore(double cloudiness)
        {
            const double idealCloudiness = 30;

            double difference =
                Math.Abs(cloudiness - idealCloudiness);

            double score =
                100 - (difference * 1.4);

            return Math.Clamp(score, 0, 100);
        }

        private double CalculatePressureScore(double pressure)
        {
            const double idealPressure = 1013;

            double difference =
                Math.Abs(pressure - idealPressure);

            double score =
                100 - (difference * 2);

            return Math.Clamp(score, 0, 100);
        }

        private double CalculateVisibilityScore(double visibility)
        {
            // OpenWeatherMap visibility is measured in meters.
            // 10 km or more is considered excellent visibility.

            double score =
                (visibility / 10000.0) * 100;

            return Math.Clamp(score, 0, 100);
        }

        private double CalculatedewPointScore (double dewPoint)
        {
            const double idealDewPoint =12;
            double difference =Math.Abs ( dewPoint-idealDewPoint);
            double score = 100 - (difference *4);
            return Math.Clamp (score,0,100);

        }
    }
}