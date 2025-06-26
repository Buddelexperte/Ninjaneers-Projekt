import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DATA_TYPES = ["precipitation", "temp_max", "temp_min", "wind", "weather"];

const COL_NAMES = ["Precipitation", "Max Temp", "Min Temp", "Wind", "Weather"];

function openBase64Image(base64String) {
  const img = new Image();
  img.src = `data:image/png;base64,${base64String}`;
  const tab = window.open();
  if (tab) {
    tab.document.body.innerHTML = "";
    tab.document.body.appendChild(img);
  } else {
    alert("Popup blocked! Please allow popups.");
  }
}

async function fetchJSON(url) {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err.message);
    return [];
  }
}

async function fetchImageData(startDate, endDate, dataType) {
  const url = `http://localhost:8000/weather/timeframe/${startDate}/${endDate}/${dataType}`;
  const res = await fetchJSON(url);
  return res?.image_base64 || null;
}

function WeatherTable() {
  const [data, setData] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("all");
  const [sortConfig, setSortConfig] = useState({ col: "date", dir: "asc" });

  const [selectedType, setSelectedType] = useState(DATA_TYPES[0]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    fetchJSON("http://127.0.0.1:8000/weather/years/all").then((res) =>
      setYears(res.map(String))
    );
  }, []);

  useEffect(() => {
    const url =
      selectedYear === "all"
        ? "http://127.0.0.1:8000/weather/all"
        : `http://127.0.0.1:8000/weather/year/${selectedYear}`;
    fetchJSON(url).then(setData);
  }, [selectedYear]);

  const handleSort = (col) => {
    setSortConfig((prev) =>
      prev.col === col ? { col, dir: prev.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" }
    );
  };

  const sortedData = () => {
    return [...data].sort((a, b) => {
      const rowA = a.WeatherInfo || a;
      const rowB = b.WeatherInfo || b;
      const valA = rowA[sortConfig.col];
      const valB = rowB[sortConfig.col];
      if (valA < valB) return sortConfig.dir === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.dir === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleImageRequest = async () => {
    if (!startDate || !endDate || !selectedType) {
      return alert("Please select all inputs.");
    }
    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];
    const base64 = await fetchImageData(startStr, endStr, selectedType);
    if (base64) openBase64Image(base64);
  };

  return (
    <div className="main-container">
      <div className="image-controls">
        <Control label="Data Type:">
          <select className="dropdown" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            {DATA_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </Control>

        <Control label="Start Date:">
          <DatePicker className="datepicker" selected={startDate} onChange={setStartDate} dateFormat="yyyy-MM-dd" />
        </Control>

        <Control label="End Date:">
          <DatePicker className="datepicker" selected={endDate} onChange={setEndDate} dateFormat="yyyy-MM-dd" />
        </Control>

        <Control>
          <button className="standalone-btn" onClick={handleImageRequest}>Open Chart</button>
        </Control>
      </div>

      <div className="table-layout">
        <div className="year-filter">
          <label className="input-label">Filter by Year:</label>
          <select className="dropdown" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="all">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="sticky-wrapper">
          <div className="weather-table-wrapper">
            <table className="weather-table">
              <thead>
                <tr>
                  {["date", ...COL_NAMES].map((col) => (
                    <th key={col} className="sortable" onClick={() => handleSort(col)}>
                      {col.charAt(0).toUpperCase() + col.slice(1)}
                      {sortConfig.col === col ? (sortConfig.dir === "asc" ? " ▲" : " ▼") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData().map((entry) => {
                  const row = entry.WeatherInfo || entry;
                  return (
                    <tr className="table-body-row" key={row.id}>
                      <td>{row.date}</td>
                      <td>{row.precipitation}</td>
                      <td>{row.temp_max}</td>
                      <td>{row.temp_min}</td>
                      <td>{row.wind}</td>
                      <td>{row.weather}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Control({ label, children }) {
  return (
    <div className="control-item">
      {label && <label className="input-label">{label}</label>}
      {children}
    </div>
  );
}

export default WeatherTable;
