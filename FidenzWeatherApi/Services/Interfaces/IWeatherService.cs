using FidenzWeatherApi.Models;

namespace FidenzWeatherApi.Services.Interfaces
{
    public interface IWeatherService
    {
        Task<WeatherResponse?> GetWeatherAsync(string cityCode);
    }
}