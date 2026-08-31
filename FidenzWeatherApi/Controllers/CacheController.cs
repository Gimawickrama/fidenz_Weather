using FidenzWeatherApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FidenzWeatherApi.Controllers
{
    [ApiController]
[Route("api/[controller]")]
public class CacheController : ControllerBase
{
    private readonly ICacheService _cacheService;

    public CacheController(ICacheService cacheService)
    {
        _cacheService = cacheService;
    }

    [HttpGet("status")]
    [AllowAnonymous]
    public IActionResult GetStatus()
    {
        var keys = new[]
        {
            "weather:1248991",
            "weather:1850147",
            "weather:2644210",
            "weather:2988507",
            "weather:2147714",
            "weather:4930956",
            "weather:1796236",
            "weather:3143244",
            "weather:5128581",
            "weather:1880252",
            "weather:processed"
        };

        var result = keys.Select(key => new
        {
            Key = key,
            Status = _cacheService.GetStatus(key),
            Exists = _cacheService.Exists(key)
        });

        return Ok(result);
    }

    [HttpDelete]
    [Authorize]
    public IActionResult Clear()
    {
        _cacheService.Clear();

        return Ok(new
        {
            message = "Cache cleared successfully."
        });
    }
}}