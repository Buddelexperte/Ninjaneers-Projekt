import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const dataTypes = [
  "precipitation",
  "temp_max",
  "temp_min",
  "wind",
  "weather"
];

function openBase64Image(base64String) {
  const image = new Image();
  image.src = `data:image/png;base64,${base64String}`;
  const newTab = window.open();
  if (newTab) {
    newTab.document.body.innerHTML = "";
    newTab.document.body.appendChild(image);
  } else {
    alert("Popup blocked! Please allow popups for this site.");
  }
}

async function fetchImageData(startDate, endDate, dataType) {
  const url = `http://localhost:8000/weather/timeframe/${startDate}/${endDate}/${dataType}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }
    const data = await res.json();
    return data.image_base64;
  } catch (error) {
    console.error("Image fetch failed:", error.message);
    return null;
  }
}

function WeatherTable() {
  const [data, setData] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("all");
  const [sortConfig, setSortConfig] = useState({ col: "date", dir: "asc" });

  const [selectedType, setSelectedType] = useState(dataTypes[0]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("http://127.0.0.1:8000/weather/years/all");
      const rawYears = await res.json();
      setYears(rawYears.map((y) => y.toString()));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const url =
        selectedYear === "all"
          ? "http://127.0.0.1:8000/weather/all"
          : `http://127.0.0.1:8000/weather/year/${selectedYear}`;
      const result = await fetchData(url);
      setData(result);
    })();
  }, [selectedYear]);

  const handleSort = (col) => {
    setSortConfig((prev) =>
      prev.col === col
        ? { col, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { col, dir: "asc" }
    );
  };

  const getSortedData = () => {
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
      alert("Please select a start date, end date, and data type.");
      return;
    }

    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

    const base64Image = await fetchImageData(startStr, endStr, selectedType);
    if (base64Image) openBase64Image(base64Image);
  };

  return (
    <div className="main-container">
      <div className="image-controls">
        <div className="control-item">
          <label className="input-label">Data Type:</label>
          <select className="dropdown" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            {dataTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="control-item">
          <label className="input-label">Start Date:</label>
          <DatePicker className="datepicker" selected={startDate} onChange={setStartDate} dateFormat="yyyy-MM-dd" />
        </div>

        <div className="control-item">
          <label className="input-label">End Date:</label>
          <DatePicker className="datepicker" selected={endDate} onChange={setEndDate} dateFormat="yyyy-MM-dd" />
        </div>

        <div className="control-item">
          <button className="standalone-btn" onClick={handleImageRequest}>
            Open Chart
          </button>
        </div>
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

        <div className="weather-table-wrapper">
          <table className="weather-table">
            <thead>
              <tr>
                {["date", "precipitation", "temp_max", "temp_min", "wind", "weather"].map((col) => (
                  <th key={col} className="sortable" onClick={() => handleSort(col)}>
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                    {sortConfig.col === col ? (sortConfig.dir === "asc" ? " ▲" : " ▼") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getSortedData().map((entry) => {
                const weather = entry.WeatherInfo || entry;
                return (
                  <tr key={weather.id}>
                    <td>{weather.date}</td>
                    <td>{weather.precipitation}</td>
                    <td>{weather.temp_max}</td>
                    <td>{weather.temp_min}</td>
                    <td>{weather.wind}</td>
                    <td>{weather.weather}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


async function fetchData(url) {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error.message);
    return [];
  }
}

export default WeatherTable;
