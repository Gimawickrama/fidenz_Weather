using System.Text.Json;
using FidenzWeatherApi.Models;
using FidenzWeatherApi.Services.Interfaces;

namespace FidenzWeatherApi.Services
{
    public class CityService : ICityService
    {
        private readonly IWebHostEnvironment _environment;

        public CityService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public async Task<List<City>> GetCitiesAsync()
        {
            var filePath = Path.Combine(
                _environment.ContentRootPath,
                "Data",
                "cities.json");

            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException(
                    "cities.json file was not found.",
                    filePath);
            }

            var json = await File.ReadAllTextAsync(filePath);

            var response = JsonSerializer.Deserialize<CitiesResponse>(
                json,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

            return response?.List ?? new List<City>();
        }
    }
}