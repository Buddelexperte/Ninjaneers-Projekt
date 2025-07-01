import React from "react";
import {useState} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login.jsx";
import SignupWrapper from "./components/SignupWrapper.jsx";
import WeatherDashboard from "./components/WeatherDashboard.jsx";
import {useNavigate, Navigate} from "react-router-dom";

const LoginWithNavigation = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  return <Login onLoginSuccess={() => {
    onLoginSuccess();
    navigate("/dashboard");
  }} />;
};

const PrivateRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginWithNavigation onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/signup" element={<SignupWrapper />} />
                <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute isLoggedIn={isLoggedIn}>
                        <WeatherDashboard />
                      </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
      );
}

export default App;
