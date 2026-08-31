namespace FidenzWeatherApi.Models;

public class City
{
    public string CityCode { get; set; } = string.Empty;
    public string CityName { get; set; } = string.Empty;
    public string Temp { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}