// These tests only look at two parameters of the Comfort Index:
// Temperature and Visibility. Everything else (humidity, wind,
// cloudiness, pressure) is pinned to its ideal value, so any
// change in the score here has to come from temp or visibility.

using FidenzWeatherApi.Services;
using FidenzWeatherApi.Services.Interfaces;

namespace FidenzWeatherApi.Tests;

public class ComfortIndexServiceTests
{
    // one service instance, shared by all the tests below
    private readonly IComfortIndexService _service = new ComfortIndexService();

    
    // TEMPERATURE
  

    [Theory]
    [InlineData(22, 100.0)]   // 22 °C = the sweet spot
    [InlineData(25, 95.5)]   // warm-ish, still nice
    [InlineData(30, 88.0)]    // getting uncomfortable
    [InlineData(40, 73.0)]    // properly hot
    [InlineData(50, 70.0)]    // temp part already at the floor
    [InlineData(100, 70.0)]   // extreme, same floor as before
    public void Temperature_PartOfTheScore(double temperature, double expected)
    {
        // everything else ideal so only temperature moves the needle
        var actual = _service.Calculate(
            temperature,
            humidity: 50,
            windSpeed: 3,
            cloudiness: 30,
            pressure: 1013,
            visibility: 10000,
            dewPoint:12);

        Assert.Equal(expected, actual, 2);
    }

    [Fact]
    public void Temperature_IdealStillBeatsHot()
    {
        var ideal = _service.Calculate(22, 50, 3, 30, 1013, 10000,12);
        var hot = _service.Calculate(35, 50, 3, 30, 1013, 10000,12);

        Assert.True(ideal > hot);
    }

   
    // VISIBILITY
  

    [Theory]
    [InlineData(10000, 100.0)]  // 10km + = perfect
    [InlineData(8000, 98.0)]
    [InlineData(5000, 95.0)]
    [InlineData(3000, 93.0)]
    [InlineData(500, 90.5)]
    [InlineData(0, 90.0)]       // zero visibility, rest of the formula holds
    [InlineData(20000, 100.0)]  // anything above 10km just caps
    public void Visibility_PartOfTheScore(double visibility, double expected)
    {
        // temp held at ideal, only visibility changes here
        var actual = _service.Calculate(
            temperature: 22,
            humidity: 50,
            windSpeed: 3,
            cloudiness: 30,
            pressure: 1013,
            visibility: visibility,
            dewPoint:12);

        Assert.Equal(expected, actual, 2);
    }

    [Fact]
    public void Visibility_ClearSkyScoresHigherThanFog()
    {
        var clear = _service.Calculate(22, 50, 3, 30, 1013, 9000,12);
        var foggy = _service.Calculate(22, 50, 3, 30, 1013, 1500,12);

        Assert.True(clear > foggy);
    }
}