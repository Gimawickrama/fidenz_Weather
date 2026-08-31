import { LogOut } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const { user, logout } = useAuth0();

  // send them back to the app root after auth0 clears its session
  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  // fall back through whatever the provider gives us
  const displayName =
    user?.name ||
    user?.nickname ||
    user?.email ||
    "";

  // take first letters of up to two words, for the avatar circle
  const initials =
    displayName
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "U";

  return (
    <header className="topbar">
      {/* left side: who's logged in */}
      <div className="welcome-message">
        <span>Welcome</span>

        <strong>
          {user?.email || "User"}
        </strong>
      </div>

      {/* right side of the bar, all the actions */}
      <div className="navbar-actions">
        {/* tiny initials avatar */}
        <div
          className="user-avatar"
          title={displayName}
        >
          {initials}
        </div>

        {/* light / dark switcher */}
        <ThemeToggle />

        {/* logout */}
        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;