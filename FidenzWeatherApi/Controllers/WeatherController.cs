using FidenzWeatherApi.Models;
using FidenzWeatherApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FidenzWeatherApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WeatherController : ControllerBase
    {
        private readonly ICityService _cityService;
        private readonly IWeatherService _weatherService;
        private readonly IComfortIndexService _comfortIndexService;
        private readonly ICacheService _cacheService;

        private const string ProcessedWeatherCacheKey =
            "weather:processed";

        public WeatherController(
            ICityService cityService,
            IWeatherService weatherService,
            IComfortIndexService comfortIndexService,
            ICacheService cacheService)
        {
            _cityService = cityService;
            _weatherService = weatherService;
            _comfortIndexService = comfortIndexService;
            _cacheService = cacheService;
        }

        [HttpGet]
        public async Task<ActionResult<List<WeatherResult>>> GetWeather()
        {
            
            var cachedResults =
                await _cacheService.GetAsync<List<WeatherResult>>(
                    ProcessedWeatherCacheKey);

            if (cachedResults != null)
            {
                return Ok(cachedResults);
            }

            var cities =
                await _cityService.GetCitiesAsync();

            var results =
                new List<WeatherResult>();

            foreach (var city in cities)
            {
                var weather =
                    await _weatherService.GetWeatherAsync(
                        city.CityCode);

                if (weather == null)
                {
                    continue;
                }

                var description =
                    weather.Weather
                        .FirstOrDefault()
                        ?.Description
                        ?? "Unknown";

                var temperature =
                    weather.Main.Temp - 273.15;

                var score =
                    _comfortIndexService.Calculate(
                        temperature,
                        weather.Main.Humidity,
                        weather.Wind.Speed,
                        weather.Clouds.All,
                        weather.Main.Pressure,
                        weather.Visibility);

                results.Add(new WeatherResult
                {
                    CityCode = city.CityCode,

                    CityName = weather.Name,

                    Description = description,

                    Temperature =
                        Math.Round(
                            temperature,
                            1),

                    Humidity =
                        weather.Main.Humidity,

                    WindSpeed =
                        weather.Wind.Speed,

                    Cloudiness =
                        weather.Clouds.All,

                    Pressure =
                        weather.Main.Pressure,

                    Visibility =
                        weather.Visibility,

                    ComfortScore =
                        score
                });
            }

            results =
                results
                    .OrderByDescending(
                        x => x.ComfortScore)
                    .ToList();

            for (int i = 0;
                 i < results.Count;
                 i++)
            {
                results[i].Rank = i + 1;
            }

            await _cacheService.SetAsync(
                ProcessedWeatherCacheKey,
                results,
                TimeSpan.FromMinutes(5));

            return Ok(results);
        }
    }
}