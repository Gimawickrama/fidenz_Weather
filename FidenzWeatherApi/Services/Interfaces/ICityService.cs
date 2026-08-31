using FidenzWeatherApi.Models;

namespace FidenzWeatherApi.Services.Interfaces
{
    public interface ICityService
    {
        Task<List<City>> GetCitiesAsync();
    }
}