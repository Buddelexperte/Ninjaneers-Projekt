import React from "react";
import {useState} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login.jsx";
import SignupWrapper from "./components/SignupWrapper.jsx";
import WeatherDashboard from "./components/WeatherDashboard.jsx";
import {useNavigate, Navigate} from "react-router-dom";

const LoginWithNavigation = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  return <Login onLoginSuccess={(data) => {
    onLoginSuccess(data);
    navigate("/dashboard");
  }} />;
};

const PrivateRoute = ({ token, children }) => {
    if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
    const [loginToken, setLoginToken] = useState("");

    const handleLoginSuccess = (token) => {
        setLoginToken(token);
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <LoginWithNavigation onLoginSuccess={handleLoginSuccess}/>
                    }
                />
                <Route
                    path="/signup"
                    element={<SignupWrapper />}
                />
                <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute token={loginToken}>
                        <WeatherDashboard login={{"token": loginToken}} setToken={setLoginToken}/>
                      </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
      );
}

export default App;
