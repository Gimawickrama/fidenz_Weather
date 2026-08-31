namespace FidenzWeatherApi.Models
{
    public class WeatherResult
    {
        public int Rank { get; set; }

        public string CityCode { get; set; } = string.Empty;

        public string CityName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public double Temperature { get; set; }

        public double Humidity { get; set; }

        public double WindSpeed { get; set; }

        public double Cloudiness { get; set; }

        public double Pressure { get; set; }

        public int Visibility { get; set; }

        public double ComfortScore { get; set; }
    }
}