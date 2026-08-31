// backend url comes from env, set in the .env file
const API_URL = import.meta.env.VITE_API_URL;

export async function getWeather(token) {
  // token goes in the header so the api knows who we are
  const response = await fetch(
    `${API_URL}/api/Weather`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  // non-200? surface whatever the server said
  if (!response.ok) {
    const errorText = await response.text();

    console.error(
      "Weather API error:",
      errorText
    );

    throw new Error(
      `Weather API failed: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}