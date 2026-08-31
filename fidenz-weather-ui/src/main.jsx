import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";

import App from "./App";
import "./index.css";

// apply saved theme BEFORE react renders so there's no flash
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
}

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

// log these at boot, handy for debugging local runs
console.log("Auth0 Domain:", domain);
console.log("Auth0 Client ID:", clientId);
console.log("Auth0 Audience:", audience);

// no point starting up without these — fail fast
if (!domain) {
  throw new Error("VITE_AUTH0_DOMAIN is missing");
}

if (!clientId) {
  throw new Error("VITE_AUTH0_CLIENT_ID is missing");
}

if (!audience) {
  throw new Error("VITE_AUTH0_AUDIENCE is missing");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);