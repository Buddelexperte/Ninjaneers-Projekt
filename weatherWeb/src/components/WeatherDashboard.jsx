import React, { useState } from "react";
import WeatherTable from "./WeatherTable.jsx";
import WeatherChart from "./WeatherCharts.jsx";

function WeatherDashboard() {
  const [viewMode, setViewMode] = useState("table"); // "table" or "chart"

  return (
    <div>
      <button onClick={() => setViewMode(viewMode === "table" ? "chart" : "table")}>
        Switch to {viewMode === "table" ? "Chart" : "Table"} View
      </button>

      {viewMode === "table" ? <WeatherTable /> : <WeatherChart />}
    </div>
  );
}

export default WeatherDashboard;
