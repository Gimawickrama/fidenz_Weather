using System.Text.Json.Serialization;

namespace FidenzWeatherApi.Models
{
    public class WeatherResponse
    {
        [JsonPropertyName("main")]
        public MainWeather Main { get; set; } = new();

        [JsonPropertyName("weather")]
        public List<WeatherDescription> Weather { get; set; } = new();

        [JsonPropertyName("wind")]
        public Wind Wind { get; set; } = new();

        [JsonPropertyName("clouds")]
        public Clouds Clouds { get; set; } = new();

        [JsonPropertyName("visibility")]
        public int Visibility { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("id")]
        public int Id { get; set; }
    }

    public class MainWeather
    {
        [JsonPropertyName("temp")]
        public double Temp { get; set; }

        [JsonPropertyName("feels_like")]
        public double FeelsLike { get; set; }

        [JsonPropertyName("pressure")]
        public double Pressure { get; set; }

        [JsonPropertyName("humidity")]
        public double Humidity { get; set; }
    }

    public class WeatherDescription
    {
        [JsonPropertyName("main")]
        public string Main { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
    }

    public class Wind
    {
        [JsonPropertyName("speed")]
        public double Speed { get; set; }
    }

    public class Clouds
    {
        [JsonPropertyName("all")]
        public double All { get; set; }
    }
}