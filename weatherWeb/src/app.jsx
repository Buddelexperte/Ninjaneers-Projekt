import React, { useState } from "react";
import WeatherDashboard from "./components/WeatherDashboard";
import Login from "./components/loginWindow.jsx"; // Adjust path as needed

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <div>
      {isLoggedIn ? (
        <>
          <h1>Weather Data</h1>
          <WeatherDashboard />
        </>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
