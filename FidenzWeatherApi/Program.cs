using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using FidenzWeatherApi.Services;
using FidenzWeatherApi.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddHttpClient<IWeatherService, WeatherService>();
builder.Services.AddScoped<ICityService, CityService>();
builder.Services.AddScoped<IComfortIndexService, ComfortIndexService>();
builder.Services.AddSingleton<ICacheService, CacheService>();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description =
                "Enter your Auth0 access token. Example: Bearer {token}"
        });

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
});


var auth0Domain =
    builder.Configuration["Auth0:Domain"];

var auth0Audience =
    builder.Configuration["Auth0:Audience"];

if (string.IsNullOrWhiteSpace(auth0Domain))
{
    throw new InvalidOperationException(
        "Auth0:Domain is missing from appsettings.json"
    );
}

if (string.IsNullOrWhiteSpace(auth0Audience))
{
    throw new InvalidOperationException(
        "Auth0:Audience is missing from appsettings.json"
    );
}

var auth0Authority =
    $"https://{auth0Domain}/";

Console.WriteLine("======================================");
Console.WriteLine("AUTH0 CONFIGURATION");
Console.WriteLine($"Domain   : {auth0Domain}");
Console.WriteLine($"Authority: {auth0Authority}");
Console.WriteLine($"Audience : {auth0Audience}");
Console.WriteLine("======================================");


builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme
    )
    .AddJwtBearer(options =>
    {
        // Auth0 issuer
        options.Authority = auth0Authority;

        // API Identifier
        options.Audience = auth0Audience;

        // Auth0 uses HTTPS
        options.RequireHttpsMetadata = true;

        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = auth0Authority,

                ValidateAudience = true,
                ValidAudience = auth0Audience,

                ValidateLifetime = true,

                ValidateIssuerSigningKey = true,

                ClockSkew = TimeSpan.FromMinutes(1)
            };


        options.Events = new JwtBearerEvents
        {

            OnMessageReceived = context =>
            {
                Console.WriteLine(
                    "======================================"
                );

                Console.WriteLine(
                    "AUTH0 TOKEN RECEIVED"
                );

                Console.WriteLine(
                    $"Authorization Header Exists: " +
                    $"{!string.IsNullOrWhiteSpace(
                        context.Request.Headers.Authorization
                    )}"
                );

                Console.WriteLine(
                    "======================================"
                );

                return Task.CompletedTask;
            },

            OnAuthenticationFailed = context =>
            {
                Console.WriteLine(
                    "======================================"
                );

                Console.WriteLine(
                    "AUTH0 JWT AUTHENTICATION FAILED"
                );

                Console.WriteLine(
                    $"Exception Type: " +
                    $"{context.Exception.GetType().Name}"
                );

                Console.WriteLine(
                    $"Message: " +
                    $"{context.Exception.Message}"
                );

                Console.WriteLine(
                    "======================================"
                );

                return Task.CompletedTask;
            },


            OnTokenValidated = context =>
            {
                Console.WriteLine(
                    "======================================"
                );

                Console.WriteLine(
                    "AUTH0 JWT TOKEN VALIDATED SUCCESSFULLY"
                );

                Console.WriteLine(
                    $"User: " +
                    $"{context.Principal?.Identity?.Name}"
                );

                Console.WriteLine(
                    $"Authenticated: " +
                    $"{context.Principal?.Identity?.IsAuthenticated}"
                );

                Console.WriteLine(
                    "======================================"
                );

                return Task.CompletedTask;
            },

           
            // CHALLENGE
           

            OnChallenge = context =>
            {
                Console.WriteLine(
                    "======================================"
                );

                Console.WriteLine(
                    "AUTH0 JWT CHALLENGE"
                );

                Console.WriteLine(
                    $"Error: {context.Error}"
                );

                Console.WriteLine(
                    $"Description: " +
                    $"{context.ErrorDescription}"
                );

                Console.WriteLine(
                    "======================================"
                );

                return Task.CompletedTask;
            }
        };
    });


builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();

