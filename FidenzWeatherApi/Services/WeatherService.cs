using System.Net;
using System.Text.Json;
using FidenzWeatherApi.Models;
using FidenzWeatherApi.Services.Interfaces;

namespace FidenzWeatherApi.Services
{
    public class WeatherService : IWeatherService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ICacheService _cacheService;

        public WeatherService(
            HttpClient httpClient,
            IConfiguration configuration,
            ICacheService cacheService)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _cacheService = cacheService;
        }

        public async Task<WeatherResponse?> GetWeatherAsync(
            string cityCode)
        {
            var cacheKey = $"weather:{cityCode}";

            var cached =
                await _cacheService.GetAsync<WeatherResponse>(cacheKey);

            if (cached != null)
            {
                return cached;
            }

            var apiKey = _configuration["OpenWeatherMap:ApiKey"];

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException(
                    "OpenWeatherMap API key is not configured.");
            }

            var url =
                $"https://api.openweathermap.org/data/2.5/weather?id={cityCode}&appid={apiKey}";

            var response = await _httpClient.GetAsync(url);

            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return null;
            }

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();

            var weather =
                JsonSerializer.Deserialize<WeatherResponse>(
                    json,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

            if (weather != null)
            {
                await _cacheService.SetAsync(
                    cacheKey,
                    weather,
                    TimeSpan.FromMinutes(5));
            }

            return weather;
        }
    }
}