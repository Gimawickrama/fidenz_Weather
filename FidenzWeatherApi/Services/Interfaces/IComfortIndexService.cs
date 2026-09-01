namespace FidenzWeatherApi.Services.Interfaces
{
    public interface IComfortIndexService
    {
        double Calculate(
            double temperature,
            double humidity,
            double windSpeed,
            double cloudiness,
            double pressure,
            double visibility,
            double dewPoint);
           
    }
}