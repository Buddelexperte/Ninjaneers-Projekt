import React, { useEffect, useState } from "react";

async function getData() {
  const url = "http://127.0.0.1:8000/weather/all";
  try {
    const response = await fetch(url, { mode: "cors" });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);
    return json;
  } catch (error) {
    console.error(error.message);
  }

  return [];
}

function WeatherTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
  getData().then(setData);
}, []);

  if (data.length === 0) {
    return <p>Loading or no data available.</p>;
  }

  return (
    <table border="1" cellPadding="8">
      <thead>
        <tr>
          <th>ID</th>
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
          const weather = entry.WeatherInfo;
          return (
            <tr key={weather.id}>
              <td>{weather.id}</td>
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
  );
}

export default WeatherTable;
