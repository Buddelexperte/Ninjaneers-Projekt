import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

function WeatherChart() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  async function fetchWeatherData() {
      try {
        const response = await fetch("http://127.0.0.1:8000/weather/all", { mode: "cors" });
        if (!response.ok)
          throw new Error(`Response status: ${response.status}`);
        const json = await response.json();

        // Normalize entries
        const cleaned = json.map((entry) => {
          const weather = entry.WeatherInfo || entry;
          return {
            date: weather.date,
            precipitation: weather.precipitation,
            temp_max: weather.temp_max,
            temp_min: weather.temp_min,
            wind: weather.wind,
            weather: weather.weather,
          };
        });

        setData(cleaned);
      } catch (err) {
        setError(err.message);
        console.error("Chart Fetch Error:", err);
      }
    }

  useEffect(() => {
    fetchWeatherData();
  }, []);

  if (error) return <p>Error loading chart: {error}</p>;
  if (data.length === 0) return <p>Loading chart...</p>;

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  const categories = data.map(d => new Date(d.date).getTime());

  const series = [
    {
      name: "Precipitation",
      data: data.map((d) => d.precipitation),
    },
    {
      name: "Temp Max",
      data: data.map((d) => d.temp_max),
    },
    {
      name: "Temp Min",
      data: data.map((d) => d.temp_min),
    },
    {
      name: "Wind",
      data: data.map((d) => d.wind),
    },
  ];

  const options = {
    xaxis: {
      type: 'datetime',
      min: startOfYear,
      max: startOfYear + ONE_YEAR_MS,
      categories: categories,
    },
    yaxis: {
      title: { text: "Values" },
    },
    stroke: {
      curve: "smooth",
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: function({ series, dataPointIndex, w }) {
        const row = data[dataPointIndex];
        if (!row) return "";

        const date = row.date;
        const weather = row.weather ?? 'N/A';

        const formattedDate = new Intl.DateTimeFormat("de-DE", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(new Date(date));

        const header = `<div style="font-weight: bold; margin-bottom: 4px;">${formattedDate} - <em>${weather}</em></div>`;

        const lines = w.globals.seriesNames.map((name, i) => {
          const val = series[i][dataPointIndex];
          return `<div>${name}: <strong>${val}</strong></div>`;
        }).join("");

        return `<div style="padding: 8px; font-size: 13px;">
                  ${header}
                  ${lines}
                </div>`;
      }
    },

    markers: {
      size: 0,
    },
    chart: {
      id: "weather-chart",
      type: "line",
      toolbar: { show: true },
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true,
      },
    },
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="line"
      height={400}
    />
  );
}

export default WeatherChart;