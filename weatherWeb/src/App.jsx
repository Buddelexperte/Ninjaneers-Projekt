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

const PrivateRoute = ({ loggedUser, children }) => {
    if (!loggedUser.username) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
    const [loggedUser, setLoggedUser] = useState({"username" : ""});

    const handleLoginSuccess = (data) => {
        setLoggedUser(data);
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
                      <PrivateRoute loggedUser={loggedUser}>
                        <WeatherDashboard loggedUser={loggedUser}/>
                      </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
      );
}

export default App;
