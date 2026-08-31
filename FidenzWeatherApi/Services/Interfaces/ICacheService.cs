namespace FidenzWeatherApi.Services.Interfaces
{
    public interface ICacheService
    {
        Task<T?> GetAsync<T>(string key);

        Task SetAsync<T>(
            string key,
            T value,
            TimeSpan duration);

        bool Exists(string key);

        string GetStatus(string key);

        void Clear();
    }
}