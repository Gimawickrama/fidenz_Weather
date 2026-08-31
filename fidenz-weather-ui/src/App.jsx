import { useAuth0 } from "@auth0/auth0-react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Loading from "./components/Loading";

function App() {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth0();

  // auth0 still checking the session, show the spinner for now
  if (isLoading) {
    return <Loading />;
  }

  // not logged in? no dashboard for you
  if (!isAuthenticated) {
    return <Login />;
  }

  return <Dashboard />;
}

export default App;