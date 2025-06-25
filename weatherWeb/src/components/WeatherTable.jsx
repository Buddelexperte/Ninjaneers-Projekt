import React, { useEffect, useState } from "react";

function openBase64Image(base64String) {
  // Create a new window or tab and write the image to it
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

async function fetchAndOpenImage() {
  const res = await fetch("http://localhost:8000/weather/timeframe/2022-02-05/2022-02-06");
  const data = await res.json();  // ✅ Parse JSON
  const base64String = data.image_base64;

  // Then open image
  const img = new Image();
  img.src = `data:image/png;base64,${base64String}`;

  const newTab = window.open();
  if (newTab) {
    newTab.document.body.innerHTML = "";
    newTab.document.body.appendChild(img);
  } else {
    alert("Popup blocked! Please allow popups for this site.");
  }
}

async function fetchAllData() {
  const url = "http://127.0.0.1:8000/weather/all";
  return fetchData(url);

}

async function fetchAvailYears()
{
  const url = "http://127.0.0.1:8000/weather/years/all";
  const rawYears = await fetchData(url);

  return rawYears.map(y => parseInt(y));
}

async function fetchYearData(year)
{
  const url = `http://127.0.0.1:8000/weather/year/${year}`;
  return fetchData(url);
}

async function fetchData(url)
{
  try {
    const response = await fetch(url, {mode : "cors"});
    if (!response.ok)
    {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);
    return json;

  } catch (error)
  {
    console.error(error.message);
    return [];
  }
}

function WeatherTable() {
  const [data, setData] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("all");
  const [sortConfig, setSortConfig] = useState({ col: null, dir: "asc" });


  // Fetch years once
  useEffect(() => {
    (async () => {
      const yearOptions = await fetchAvailYears();
      setYears(yearOptions.map(y => y.toString()));
    })();
  }, []);

  // Fetch weather data when year changes
  useEffect(() => {
    (async () => {
      const result =
        selectedYear === "all"
          ? await fetchAllData()
          : await fetchYearData(selectedYear);
      setData(result);
    })();
  }, [selectedYear]);

  return (
    <div>
      <label>Select year: </label>
      <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
        <option value="all">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
      </select>

      <button onClick={fetchAndOpenImage}>Open Image</button>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Date</th>
            <th>Precipitation</th>
            <th>Temp Max</th>
            <th>Temp Min</th>
            <th>Wind</th>
            <th>Weather</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => {
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
  );
}


export default WeatherTable;
