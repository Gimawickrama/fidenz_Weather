# Fidenz Weather — Comfort Index Dashboard

A full-stack weather app. It pulls live data from the **OpenWeatherMap API**, runs it through a **Comfort Index** of my own design (0–100), ranks every city from most to least comfortable, and shows the result in a responsive dashboard that only logged-in users can see (**Auth0**).

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Repository Structure](#repository-structure)
4. [Backend — FidenzWeatherApi](#backend--fidenzweatherapi)
5. [Comfort Index formula](#comfort-index-formula)
6. [Why these weights](#why-these-weights)
7. [Trade-offs I weighed](#trade-offs-i-weighed)
8. [Cache design](#cache-design)
9. [Frontend — fidenz-weather-ui](#frontend--fidenz-weather-ui)
10. [Setup & Run](#setup--run)
11. [Running the tests](#running-the-tests)
12. [API Endpoints](#api-endpoints)
13. [UI / UX Design](#ui--ux-design)


---

## Overview

The project is split in two:

- **Backend** — an ASP.NET Core 8 Web API that:
  - Reads a city list from `Data/cities.json`.
  - Fetches weather for each city from OpenWeatherMap.
  - Computes a Comfort Index between `0` and `100`.
  - Sorts the cities, best first, and assigns a rank.
  - Caches raw and processed results for 5 minutes.
  - Protects endpoints with Auth0 (JWT Bearer).

- **Frontend** — a React (Vite) single-page app that:
  - Logs people in through Auth0.
  - Shows summary cards (total cities, most comfortable city, average comfort).
  - Renders a temperature chart (Recharts) with color-coded dots.
  - Lists the ranked cities — clicking a row opens a **details modal**.
  - Has **Light and Dark mode**, toggled from the top-right of the navbar.
  - Is fully **responsive** for desktop and mobile.

---

## Demo Login

The dashboard is protected using Auth0 authentication.

- Username: `careers@fidenz.com`
- Password: `Password#fidenz`

The password is not stored in the source code or repository.

---

## Tech Stack

| Layer     | Technology                                          |
| --------- | --------------------------------------------------- |
| Backend   | ASP.NET Core 8, C#, JWT Bearer, Swagger             |
| Data      | OpenWeatherMap API + `Data/cities.json`             |
| Tests     | xUnit (`FidenzWeatherApi.Tests`)                    |
| Frontend  | React 18, Vite 5, Recharts 3, lucide-react          |
| Auth      | Auth0 (`@auth0/auth0-react` + JWT Bearer)           |
| Styling   | Plain CSS with CSS custom properties (variables)    |

---

## Repository Structure

```
D:\Assignment
├── FidenzWeatherApi              # Backend (.NET 8 Web API)
│   ├── Controllers
│   │   ├── WeatherController.cs
│   │   └── CacheController.cs
│   ├── Data\cities.json
│   ├── Models
│   ├── Services
│   │   ├── Interfaces
│   │   ├── WeatherService.cs
│   │   ├── CityService.cs
│   │   ├── ComfortIndexService.cs
│   │   └── CacheService.cs
│   ├── Program.cs
│   └── appsettings.json
│
├── FidenzWeatherApi.Tests        # Unit tests for the Comfort Index
│   ├── ComfortIndexServiceTests.cs
│   └── FidenzWeatherApi.Tests.csproj
│
└── fidenz-weather-ui             # Frontend (React + Vite)
    ├── src
    │   ├── components
    │   │   ├── Navbar.jsx
    │   │   ├── ThemeToggle.jsx
    │   │   ├── WeatherModal.jsx
    │   │   ├── Footer.jsx
    │   │   ├── Loading.jsx
    │   │   └── ... (unused legacy components)
    │   ├── pages
    │   │   ├── Dashboard.jsx
    │   │   └── Login.jsx
    │   ├── services\weatherApi.js
    │   ├── index.css
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## Backend — FidenzWeatherApi

### How a request flows

1. `WeatherController` has `[Authorize]`, so every call needs a valid Auth0 JWT.
2. `GET /api/Weather` checks the **processed cache** (`weather:processed`) first.
3. On a miss, `CityService` loads the 10 cities from `Data/cities.json`.
4. For each city, `WeatherService` calls
   `https://api.openweathermap.org/data/2.5/weather?id={cityCode}&appid={apiKey}`.
   Per-city responses are cached under `weather:{cityCode}` for 5 minutes.
5. `ComfortIndexService` turns the raw measurements into a score (formula below).
6. Cities are sorted by score, highest first, and `Rank` (1, 2, 3 …) is assigned.
7. The finished list is cached for 5 minutes and returned to the client.

One thing to note: if OpenWeatherMap returns a 404 for a city (bad id, removed city, whatever), that city is silently skipped rather than breaking the whole response.

---

## Comfort Index formula

The backend computes the score — the frontend only displays it.

Each parameter is first normalized to a `0–100` "sub-score" by measuring how far it sits from an ideal value:

```
Temperature sub-score = clamp( 100 − |temp °C − 22| × 5 ,        0, 100 )
Humidity    sub-score = clamp( 100 − |humidity% − 50| × 2 ,      0, 100 )
Wind        sub-score = clamp( 100 − |wind m/s − 3| × 20 ,       0, 100 )
Cloudiness  sub-score = clamp( 100 − |cloudiness% − 30| × 1.4 ,  0, 100 )
Pressure    sub-score = clamp( 100 − |pressure hPa − 1013| × 2 , 0, 100 )
Visibility  sub-score = clamp( (visibility m / 10000) × 100 ,     0, 100 )
```

Those sub-scores are then combined with weights that add up to 100%:

```
Comfort Index =
    Temperature × 0.35
  + Humidity    × 0.20
  + Wind        × 0.15
  + Cloudiness  × 0.10
  + Pressure    × 0.10
  + Visibility  × 0.10
```

| Factor     | Ideal value | Weight | Sub-score math                              |
| ---------- | ----------- | ------ | ------------------------------------------- |
| Temperature| 22 °C       | 35%    | `100 − |temp − 22| × 5`                     |
| Humidity   | 50%         | 20%    | `100 − |humidity − 50| × 2`                |
| Wind       | 3 m/s       | 15%    | `100 − |wind − 3| × 20`                     |
| Cloudiness | 30%         | 10%    | `100 − |cloudiness − 30| × 1.4`            |
| Pressure   | 1013 hPa    | 10%    | `100 − |pressure − 1013| × 2`              |
| Visibility | 10 km       | 10%    | `(visibility / 10000) × 100`               |

The result is clamped to `0–100` and rounded to two decimals, so a weird API value can never push the ranking out of bounds.

**A worked example** — a mild, partly cloudy afternoon (24 °C, 55% humidity, 4 m/s wind, 40% clouds, 1005 hPa, 8 km visibility):

```
Temperature: 100 − |24 − 22| × 5 = 90   → 90 × 0.35 = 31.5
Humidity:    100 − |55 − 50|  × 2 = 90  → 90 × 0.20 = 18.0
Wind:        100 − |4 − 3|    × 20 = 80 → 80 × 0.15 = 12.0
Cloudiness:  100 − |40 − 30|  × 1.4 = 86 → 86 × 0.10 = 8.6
Pressure:    100 − |1005−1013| × 2 = 84 → 84 × 0.10 = 8.4
Visibility:  (8000 / 10000) × 100 = 80   → 80 × 0.10 = 8.0

Comfort Index = 31.5 + 18 + 12 + 8.6 + 8.4 + 8 = 86.5
```

---

## Why these weights

I started from a simple question: *when I step outside, which numbers do I actually feel?* That ordering drove the weights.

- **Temperature — 35%.** It dominates how a day feels. A too-hot or too-cold day ruins comfort no matter what the other numbers say, so it gets the biggest share. It also keeps the ranking sensitive to the most visible number.
- **Humidity — 20%.** Humidity changes how temperature feels: 35 °C at 90% humidity is miserable, 35 °C at 20% is just hot and dry. It doesn't beat pure temperature, but it's a close runner-up because it bends the most important factor.
- **Wind — 15%.** Wind is a genuine comfort swing — a breeze rescues a hot day, a strong wind makes a cold one feel worse. It's more situational than temperature or humidity, so it sits a step below them.
- **Cloudiness, Pressure, Visibility — 10% each.** These are genuine but secondary. Clouds shape sun exposure, pressure hints at the general weather pattern, and visibility matters if you're traveling. People feel them, but rarely as strongly as the top three.

### Why these "ideal" values

- **22 °C** is the usual neutral indoor comfort temperature and a fair outdoor target for a dashboard.
- **50% humidity** is the middle range; anything very humid (sticky) or very dry (scratchy) drops the sub-score.
- **3 m/s** is a light, pleasant breeze — a "calm day" reference.
- **30% cloudiness** reads as partly sunny: enough cloud to take the edge off without feeling grey.
- **1013 hPa** is standard sea-level pressure.
- **10 km** is OpenWeatherMap's own benchmark for "excellent visibility."

The penalty slopes (5, 2, 20, 1.4, 2) weren't pulled from a textbook — I tuned them so that *typical* weather deviations produce a useful spread. A 10 °C swing costs 50 points on the temperature sub-score (big but not catastrophic), while wind is much steeper (3 m/s to 8 m/s costs 100 points) because wind comfort is closer to a yes/no: calm is pleasant, gale is not.

---

## Trade-offs I weighed

- **Linear penalties, not a heat-index.** A "real" comfort model would borrow from the heat index or wind-chill formulas, which mix temperature and humidity non-linearly. That's more accurate but a lot harder to explain and to defend in a short README. I chose straightforward linear sub-scores: transparent, predictable, and easy to unit test. The trade-off: a 40 °C day and a -20 °C day are punished symmetrically, which isn't quite how a human feels it. For a dashboard showing *current* city temperatures it was an acceptable simplification.
- **Raw humidity as a proxy for mugginess.** The assignment points out dew point isn't in the API response, so I used relative humidity directly. Downside: in the tropics 85% RH feels oppressively sticky, and RH alone understates that. It's a known limitation, not a bug.
- **Fixed weights.** A fancier model would make temperature weigh more in summer and wind weigh more in winter. I kept the weights static so the ranking behaves predictably and the formula stays one paragraph long.
- **Clamping flattens extremes.** Two scorching cities can both bottom out on the temperature sub-score (both clamp to 0), so extreme heat alone can't separate them — the other four factors break the tie. That's fine, but it means the index is better at ordering "normal" weather than at ranking two "unbearable" cities.
- **10 cities only.** Every city costs one OpenWeatherMap call per cache window. Ten keeps the dashboard fast and stays well inside the free-tier rate limits.

---

## Cache design

Caching sits at two levels, both hosted by an in-memory service (`CacheService`) that stores values in a `ConcurrentDictionary` with an expiry timestamp.

1. **Raw responses** — each `weather:{cityCode}` entry is cached for 5 minutes. This protects the OpenWeatherMap API (and its rate limits) from the frontend refreshing or multiple users hitting the endpoint together.
2. **Processed output** — the whole ranked list is cached under one key (`weather:processed`) for 5 minutes, so the Comfort Index isn't recomputed and re-sorted for every request on a quiet dashboard.

On read, an entry that isn't expired counts as a **HIT**; anything else is a **MISS**, and the controller then rebuilds the data and writes it back. The status of every key is tracked, so you can watch a request flip a key from MISS to HIT.

- **Debug endpoint:** `GET /api/Cache/status` (public) lists each cache key and its HIT/MISS state. `DELETE /api/Cache` (authorized) clears everything — useful for forcing a rebuild.
- **Why 5 minutes?** OpenWeatherMap's free tier refreshes roughly every 10 minutes, so caching at half that keeps data fresh enough while cutting calls to about two per hour per city.
- **Trade-off:** an in-memory cache lives and dies with the process — it empties on restart and only works on a single instance. For this project's scale that's the right call; if it needed to scale horizontally, a Redis cache would replace it with the same interface.

---

## Frontend — fidenz-weather-ui

### Features

- **Auth0 login** — unauthenticated visitors only ever see the Login page.
- **Dashboard**
  - Summary cards: Total Cities · Most Comfortable City · Average Comfort.
  - Temperature Overview chart (Recharts line chart), dots colored by temperature: `cool` ≤ 20 °C green, `moderate` 20–28 °C amber, `hot` ≥ 28 °C red.
  - Weather list: rank (🥇🥈🥉 medals), city + country, condition icon, temperature, comfort progress bar, rating badge (Excellent / Good / Moderate / Fair / Poor).
  - Client-side search box and rating filter — no extra API calls.
- **Details modal** — clicking a city row (or a chart dot) opens a modal with humidity, wind speed, cloudiness, pressure, visibility and the comfort score.
- **Dark / Light mode** — a toggle in the top-right of the navbar, also present on the Login page. The choice is saved to `localStorage` and applied before React renders, so there's no theme flash on reload.
- **Responsive** — the weather table becomes stacked cards on phones (≤ 700px) instead of a sideways-scrolling table.

---

## Setup & Run

### 1. Backend

```bash
cd FidenzWeatherApi
dotnet restore
dotnet run
```

- Swagger UI: http://localhost:5158/swagger (or http://localhost:7016 with the https profile).
- Required config in `appsettings.json`:
  - `OpenWeatherMap:ApiKey`
  - `Auth0:Domain`, `Auth0:Audience`

### 2. Frontend

Create a `.env` file inside `fidenz-weather-ui/`:

```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://fidenz-weather-api
VITE_API_URL=http://localhost:5158
```

Then:

```bash
cd fidenz-weather-ui
npm install
npm run dev
```

Open http://localhost:5173

---

## Running the tests

The unit tests live in `FidenzWeatherApi.Tests` and cover the Comfort Index (Temperature and Visibility in isolation, plus the never-out-of-bounds behaviour):

```bash
cd FidenzWeatherApi.Tests
dotnet test
```

```bash
# run just the temperature cases
dotnet test --filter "Temperature"
```

---

## API Endpoints

| Method   | Endpoint             | Auth    | Description                          |
| -------- | -------------------- | ------- | ------------------------------------ |
| GET      | `/api/Weather`       | Bearer  | Ranked weather + comfort list        |
| GET      | `/api/Cache/status`  | Public  | Cache HIT/MISS status per key        |
| DELETE   | `/api/Cache`         | Bearer  | Clear the whole cache                |

---

## UI / UX Design

- **Border radius:** every surface uses a single `4px` radius for a crisp, consistent look.
- **No box shadows.** Cards and panels are separated with `1px solid` borders only.
- **Theme:** CSS custom properties in `:root` (light) and `body.dark-mode` (dark). Both themes share the same brand colors (blue `#1769ed`, green, amber, orange).
- **Mobile-first** breakpoints: `1200px` → `1024px` → `700px` → `400px`. On phones the table becomes stacked cards.
- **Human-readable class names** (e.g. `.topbar`, `.stats-card`, `.details-modal`, `.comfort-bar`) are used consistently across JSX and CSS.