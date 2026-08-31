using System.Collections.Concurrent;
using System.Text.Json;
using FidenzWeatherApi.Services.Interfaces;

namespace FidenzWeatherApi.Services
{
    public class CacheService : ICacheService
    {
        private class CacheEntry
        {
            public object Value { get; set; } = default!;

            public DateTime Expiry { get; set; }
        }

        private readonly ConcurrentDictionary<
            string,
            CacheEntry> _cache = new();

        private readonly ConcurrentDictionary<
            string,
            string> _status = new();

        public Task<T?> GetAsync<T>(
            string key)
        {
            if (_cache.TryGetValue(
                key,
                out var entry))
            {
                if (entry.Expiry > DateTime.UtcNow)
                {
                    _status[key] = "HIT";

                    var json =
                        JsonSerializer.Serialize(
                            entry.Value);

                    var value =
                        JsonSerializer.Deserialize<T>(
                            json);

                    return Task.FromResult(value);
                }

                // Remove expired entry
                _cache.TryRemove(
                    key,
                    out _);
            }

            _status[key] = "MISS";

            return Task.FromResult<T?>(
                default);
        }

        public Task SetAsync<T>(
            string key,
            T value,
            TimeSpan duration)
        {
            _cache[key] =
                new CacheEntry
                {
                    Value = value!,
                    Expiry =
                        DateTime.UtcNow.Add(
                            duration)
                };

            // The value was not available
            // before this request.
            _status[key] = "MISS";

            return Task.CompletedTask;
        }

        public bool Exists(
            string key)
        {
            if (!_cache.TryGetValue(
                key,
                out var entry))
            {
                return false;
            }

            if (entry.Expiry <=
                DateTime.UtcNow)
            {
                _cache.TryRemove(
                    key,
                    out _);

                return false;
            }

            return true;
        }

        public string GetStatus(
            string key)
        {
            if (_cache.TryGetValue(
                key,
                out var entry))
            {
                if (entry.Expiry >
                    DateTime.UtcNow)
                {
                    return "HIT";
                }

                _cache.TryRemove(
                    key,
                    out _);
            }

            return _status.TryGetValue(
                key,
                out var status)
                ? status
                : "MISS";
        }

        public void Clear()
        {
            _cache.Clear();
            _status.Clear();
        }
    }
}