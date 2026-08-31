import { useAuth0 } from "@auth0/auth0-react";
import { CloudSun } from "lucide-react";

import ThemeToggle from "../components/ThemeToggle";

function Login() {
  const {
    loginWithRedirect,
    isLoading,
  } = useAuth0();

  // auth0 does the whole flow, we just point to it
  const handleLogin = async () => {
    try {
      console.log("Starting Auth0 login...");

      await loginWithRedirect({
        appState: {
          returnTo: window.location.origin,
        },
      });
    } catch (error) {
      // if this fails there's nothing much we can do on screen
      console.error("Auth0 Login Error:", error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="login-card">
        <div className="login-logo">
          <CloudSun size={58} />
        </div>

        <h1>Fidenz Weather</h1>

        <p>
          Comfort Index Dashboard
        </p>

        <button
          className="login-button"
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Login"}
        </button>

        <span className="login-info">
          Authorized users only
        </span>
      </div>
    </div>
  );
}

export default Login;