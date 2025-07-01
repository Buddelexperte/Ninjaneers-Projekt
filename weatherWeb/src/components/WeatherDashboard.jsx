import React, { useState } from "react";
import {User, LogOut} from "lucide-react";
import Wd_table from "./wd_table.jsx";
import WeatherChart from "./wd_charts.jsx";
import {useNavigate} from "react-router-dom";


function WeatherDashboard() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("table");

  return (
    <div>
      <div className="title-bar">
        <button
            className="left-title-icon"
            onClick={() => alert("Profile clicked!")}
        >
          <User size={40}/>
        </button>
        <h1 className="title">Weather Dashboard</h1>
        <button
            className="right-title-icon"
            onClick={() => navigate("/")}
        >
          <LogOut size={40}/>
        </button>
      </div>
      <div className="dashboard">
        <div className="view-switch-div">
          <button
            className="standalone-btn"
            onClick={() => setViewMode(viewMode === "table" ? "chart" : "table")}
          >
            Switch to {viewMode === "table" ? "Chart" : "Table"} View
          </button>
        </div>
      </div>
      {viewMode === "table" ? <Wd_table /> : <WeatherChart />}
    </div>
  );
}

export default WeatherDashboard;
