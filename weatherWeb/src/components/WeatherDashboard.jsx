import React, { useState } from "react";
import WeatherTable from "./WeatherTable.jsx";
import WeatherChart from "./WeatherCharts.jsx";

function WeatherDashboard() {
  const [viewMode, setViewMode] = useState("table"); // "table" or "chart"

  return (
    <div>
        <div className="dashboard">
            <div className="view-switch-div">
              <button className="standalone-btn" onClick={() => setViewMode(viewMode === "table" ? "chart" : "table")}>
                Switch to {viewMode === "table" ? "Chart" : "Table"} View
              </button>
            </div>
        </div>
      {viewMode === "table" ? <WeatherTable /> : <WeatherChart />}
    </div>
  );
}

export default WeatherDashboard;
