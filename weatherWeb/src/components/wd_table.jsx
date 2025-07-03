import React, { useEffect, useState } from "react";
import { Trash2, Pencil } from "lucide-react";

const COLUMNS = [
  { label: "Date", key: "date" },
  { label: "Precipitation", key: "precipitation" },
  { label: "Max Temp", key: "temp_max" },
  { label: "Min Temp", key: "temp_min" },
  { label: "Wind", key: "wind" },
  { label: "Weather", key: "weather" },
];

const DATA_TYPES = ["precipitation", "temp_max", "temp_min", "wind"];

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

async function fetchImageTimeframe(startDate, endDate, dataType) {
  const url = `http://localhost:8000/weather/timeframe/${startDate}/${endDate}/${dataType}`;
  const res = await fetchJSON(url);
  return res?.image_base64 || null;
}

async function fetchImagePrediction(date) {
  const url = `http://localhost:8000/weather/predict/${date}`;
  const res = await fetchJSON(url);
  return res?.image_base64 || null;
}

function Wd_table() {
  // current fetched data
  const [data, setData] = useState([]);
  // all present years in data (also fetched)
  const [years, setYears] = useState([]);
  // selected years (filtering)
  const [selectedYear, setSelectedYear] = useState("all");
  // Sorting by which category and which direction
  const [sortConfig, setSortConfig] = useState({ col: "date", dir: "asc" });
  // Timeframe view: Which category, start Date, end Date
  const [selectedType, setSelectedType] = useState(DATA_TYPES[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // date for prediction, only works if prev days have data
  const [predictionDate, setPredictionDate] = useState("");

  // Inserting new data
  const ENTRY_KEY_MAP = {
    date: "i_date",
    precipitation: "i_precipitation",
    temp_max: "i_temp_max",
    temp_min: "i_temp_min",
    wind: "i_wind",
    weather: "i_weather",
  };


  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    i_id: -1,
    i_date: "",
    i_precipitation: "",
    i_temp_max: "",
    i_temp_min: "",
    i_wind: "",
    i_weather: ""
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);


  const loadWeatherData = async () => {
    const url =
    selectedYear === "all"
      ? "http://127.0.0.1:8000/weather/all"
      : `http://127.0.0.1:8000/weather/year/${selectedYear}`;
    const result = await fetchJSON(url);
    setData(result);
  };
  
  const loadYearData = async () => {
    fetchJSON("http://127.0.0.1:8000/weather/years/all").then((res) =>
        setYears(res.map(String))
    );
  }

  useEffect(() => {
    loadYearData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsInsertModalOpen(false);
      }
    };

    if (isInsertModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isInsertModalOpen]);


  useEffect(() => {
    loadWeatherData();
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

  const submitNewEntry = async () => {
    try
    {
      const response = await fetch("http://localhost:8000/weather/addEntry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEntry),
      });
      if (!response.ok) throw new Error("Failed to insert");

      setIsInsertModalOpen(false);
      setNewEntry({ i_id: -1, i_date: "", i_precipitation: "", i_temp_max: "", i_temp_min: "", i_wind: "", i_weather: "" });
      loadWeatherData();
      loadYearData();
    }
    catch (error)
    {
      console.error("Error submitting entry:", error);
      alert("Failed to insert data.");
    }
  };

  const submitEditEntry = async () => {
    try
    {
      const response = await fetch("http://localhost:8000/weather/updateEntry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editEntry),
      });

      if (!response.ok) throw new Error("Failed to update");

      setIsEditModalOpen(false);
      setEditEntry(null);
      loadWeatherData();
      loadYearData();
    }
    catch (error)
    {
      console.error("Error updating entry:", error);
      alert("Failed to update data.");
    }
  };


  const deleteEntry = async(id) => {
    try
    {
      const response = await fetch("http://localhost:8000/weather/deleteEntry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({id : id}),
      });
      if (!response.ok) throw new Error("Failed to insert");

      setIsInsertModalOpen(false);
      setNewEntry({ date: "", precipitation: "", temp_max: "", temp_min: "", wind: "", weather: "" });
      loadWeatherData();
      loadYearData();
    }
    catch (error)
    {
      console.error("Error deleting entry:", error);
      alert("Failed to delete data.");
    }
  }

  const handleTimeFrameImage = async () => {
    if (!startDate || !endDate || !selectedType) {
      return alert("Please select all inputs.");
    }

    const base64 = await fetchImageTimeframe(startDate, endDate, selectedType);
    if (base64) openBase64Image(base64);
  };

  const handlePredictionImage = async () => {
    if (!predictionDate) {
      return alert("Please select a prediction date.");
    }

    const base64 = await fetchImagePrediction(predictionDate);
    if (base64) openBase64Image(base64);
  };

  const handleOpenInsertMenu = () => {
    setIsInsertModalOpen(true)
    // Implement inserting logic here
  };

  const handleEdit = (row) => {
    const entry = {
      i_id: row.id,
      i_date: row.date,
      i_precipitation: row.precipitation,
      i_temp_max: row.temp_max,
      i_temp_min: row.temp_min,
      i_wind: row.wind,
      i_weather: row.weather,
    };
    setEditEntry(entry);
    setIsEditModalOpen(true);
  };


  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this row?")) {
      deleteEntry(id);
    }
  };

  return (
    <div className="main-container">
      <div className="chart-dashboard">
        <div className="border-div">
          <Control label="Data Type:">
            <select className="dropdown" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              {DATA_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </Control>

          <Control label="Start Date:">
            <input
              type="date"
              className="form-input"
              value={startDate || ""}
              onChange={(e) => setStartDate(e.target.value)}
            />

          </Control>

          <Control label="End Date:">
            <input
              type="date"
              className="form-input"
              value={endDate || ""}
              onChange={(e) => setEndDate(e.target.value)}
            />

          </Control>

          <Control>
            <button className="standalone-btn" onClick={handleTimeFrameImage}>Open Chart</button>
          </Control>
        </div>
        <div className="border-div">

          <Control label="Temp Prediction for Date:">
            <input
              type="date"
              className="form-input"
              value={predictionDate || ""}
              onChange={(e) => setPredictionDate(e.target.value)}
            />
          </Control>

          <Control>
            <button className="standalone-btn" onClick={handlePredictionImage}>Open Prediction</button>
          </Control>
        </div>
      </div>

      <div className="table-layout">
        <div className="sticky-widget-col">
          <div className="border-div-col">
            <label className="input-label">Filter by Year:</label>
            <select className="dropdown" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="all">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="add-entry">
            <Control>
              <button className="standalone-btn" onClick={handleOpenInsertMenu}>Add Entry</button>
            </Control>
          </div>
        </div>

        <div className="table-wrapper">
            <div className="scrollable-div">
              <table className="data-table">
                <thead>
                  <tr>
                    {COLUMNS.map((col) => (
                      <th key={col.key} className="sortable" onClick={() => handleSort(col.key)}>
                        {col.label}
                        {sortConfig.col === col.key ? (sortConfig.dir === "asc" ? " ▲" : " ▼") : ""}
                      </th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData().map((entry) => {
                    const row = entry.WeatherInfo || entry;
                    return (
                      <tr key={row.id}>
                        {COLUMNS.map((col) => (
                          <td key={col.key}>{row[col.key]}</td>
                        ))}
                        <td className="action-cell">
                          <button onClick={() => handleEdit(row)} className="icon-btn" title="Edit">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => handleDelete(row.id)} className="icon-btn" title="Delete">
                            <Trash2 size={18} color="red" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
      </div>
      {isInsertModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Weather Entry</h2>
            {COLUMNS.map(({ label, key }) => {
              const entryKey = ENTRY_KEY_MAP[key];
              return (
                <Control label={label} key={key} className="form-row">
                  <input
                    className="form-input-stretch"
                    type={key === "date" ? "date" : "text"}
                    value={newEntry[entryKey] || ""}
                    onChange={(e) =>
                      setNewEntry((prev) => ({ ...prev, [entryKey]: e.target.value }))
                    }
                  />
                </Control>
              );
            })}

            <div className="modal-buttons">
              <button className="standalone-btn" onClick={() => setIsInsertModalOpen(false)}>Cancel</button>
              <button className="standalone-btn" onClick={submitNewEntry}>Submit</button>
            </div>
          </div>
        </div>
      )}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Weather Entry</h2>
            {COLUMNS.map(({ label, key }) => {
              const entryKey = ENTRY_KEY_MAP[key];
              return (
                <Control label={label} key={key} className="form-row">
                  <input
                    className="form-input-stretch"
                    type={key === "date" ? "date" : "text"}
                    value={editEntry?.[entryKey] ?? ""}
                    onChange={(e) =>
                      setEditEntry((prev) => ({ ...prev, [entryKey]: e.target.value }))
                    }
                  />
                </Control>
              );
            })}

            <div className="modal-buttons">
              <button className="standalone-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button className="standalone-btn" onClick={submitEditEntry}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

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

export default Wd_table;
