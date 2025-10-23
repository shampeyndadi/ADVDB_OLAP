"use client";

import React from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

ChartJS.defaults.elements.point.radius = 0;
ChartJS.defaults.elements.point.hoverRadius = 0;
ChartJS.defaults.elements.point.pointStyle = false;

ChartJS.unregister(ChartDataLabels);

export default function ChartDisplay({ query, data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        No data available. Please select a query.
      </div>
    );
  }

  switch (query) {
    case "rollup":
      return (
        <Bar
          data={{
            labels: data.map((d) => d.genre),
            datasets: [
              {
                label: "Average Rating",
                data: data.map((d) => d.avg_rating),
                backgroundColor: "rgba(79, 70, 229, 0.6)",
                borderColor: "rgba(79, 70, 229, 1)",
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 16,
              },
            ],
          }}
          options={{
            plugins: {
              title: {
                display: true,
                text: "Average Rating per Genre Combination (ROLL-UP)",
                font: { size: 18, weight: "bold" },
              },
              legend: { display: true, position: "top" },
              datalabels: { display: false },
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                ticks: { color: "#555", maxRotation: 45, minRotation: 45 },
                grid: { color: "rgba(200,200,200,0.15)" },
              },
              y: {
                min: 0,
                max: 10,
                ticks: { stepSize: 1, color: "#555" },
                grid: { color: "rgba(200,200,200,0.15)" },
              },
            },
          }}
        />
      );

    case "drilldown":
      const genreGroups = {};
      data.forEach((d) => {
        if (!genreGroups[d.genre]) genreGroups[d.genre] = [];
        genreGroups[d.genre].push({
          decade: d.decade,
          avg_rating: d.avg_rating,
        });
      });

      const lineDecades = [...new Set(data.map((d) => `${d.decade}s`))].sort();

      const genreAveragesLine = Object.entries(genreGroups)
        .map(([genre, rows]) => ({
          genre,
          avg: rows.reduce((s, r) => s + r.avg_rating, 0) / rows.length,
        }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 8)
        .map((g) => g.genre);

      const lineColors = [
        "#60a5fa",
        "#f87171",
        "#34d399",
        "#a78bfa",
        "#facc15",
        "#fb923c",
        "#f472b6",
        "#10b981",
      ];

      const lineDatasets = genreAveragesLine.map((genre, i) => ({
        label: genre,
        data: lineDecades.map((decade) => {
          const row = data.find(
            (d) => `${d.decade}s` === decade && d.genre === genre
          );
          return row ? row.avg_rating : null;
        }),
        borderColor: lineColors[i % lineColors.length],
        backgroundColor: lineColors[i % lineColors.length] + "33",
        borderWidth: 2,
        tension: 0.3,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: lineColors[i % lineColors.length],
      }));

      return (
        <Line
          data={{
            labels: lineDecades,
            datasets: lineDatasets,
          }}
          options={{
            plugins: {
              title: {
                display: true,
                text: "Average Ratings by Decade (Top Genres, DRILL-DOWN)",
                font: { size: 18, weight: "bold" },
              },
              legend: { position: "bottom" },
              datalabels: { display: false },
              tooltip: {
                enabled: true,
                callbacks: {
                  label: function (context) {
                    const rating = context.parsed.y;
                    return `Rating: ${rating ? rating.toFixed(2) : "N/A"}`;
                  },
                },
              },
            },
            interaction: {
              mode: "nearest",
              intersect: false,
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: { display: true, text: "Decade", color: "#555" },
                ticks: { color: "#555" },
                grid: { color: "rgba(200,200,200,0.15)" },
              },
              y: {
                min: 0,
                max: 10,
                title: { display: true, text: "Average Rating", color: "#555" },
                ticks: { color: "#555" },
                grid: { color: "rgba(200,200,200,0.15)" },
              },
            },
          }}
        />
      );

    case "slice":
      ChartJS.register(ChartDataLabels);
      return (
        <Pie
          data={{
            labels: data.map((d) => d.title_type),
            datasets: [
              {
                label: "Average Rating (%)",
                data: data.map((d) => d.avg_rating),
                backgroundColor: [
                  "#60a5fa",
                  "#a78bfa",
                  "#f87171",
                  "#34d399",
                  "#facc15",
                ],
                borderColor: "#fff",
                borderWidth: 2,
              },
            ],
          }}
          options={{
            plugins: {
              title: {
                display: true,
                text: "Drama Ratings by Title Type (SLICE)",
                font: { size: 18, weight: "bold" },
              },
              legend: { position: "bottom" },
              datalabels: {
                color: "#fff",
                font: { weight: "bold" },
                formatter: (value, context) => {
                  const dataArr = context.chart.data.datasets[0].data;
                  const total = dataArr.reduce(
                    (sum, val) => sum + Number(val),
                    0
                  );
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${percentage}%`;
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      );

    case "dice":
      return (
        <Bar
          data={{
            labels: data.map((d) => d.primary_title),
            datasets: [
              {
                label: "Average Rating (Comedy, US, 2015+)",
                data: data.map((d) => d.average_rating),
                backgroundColor: "rgba(251, 191, 36, 0.7)",
                borderRadius: 4,
              },
            ],
          }}
          options={{
            indexAxis: "y",
            plugins: {
              title: {
                display: true,
                text: "Comedy Titles in US (2015–Present) (DICE)",
                font: { size: 18, weight: "bold" },
              },
              legend: { display: true, position: "top" },
              datalabels: { display: false },
            },
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      );

    case "popularity":
      const genres = Object.keys(data[0]).filter((key) => key !== "decade");

      const popularityDatasets = genres.map((genre, i) => {
        const colors = [
          "#3b82f6",
          "#f97316",
          "#10b981",
          "#a855f7",
          "#ef4444",
          "#14b8a6",
          "#eab308",
          "#f43f5e",
        ];
        const color = colors[i % colors.length];
        return {
          label: genre,
          data: data.map((d) => d[genre]),
          backgroundColor: color + "cc",
          borderColor: color,
          borderWidth: 1,
          borderRadius: 4,
        };
      });

      return (
        <Bar
          data={{
            labels: data.map((d) => `${d.decade}s`),
            datasets: popularityDatasets,
          }}
          options={{
            plugins: {
              title: {
                display: true,
                text: "Average Ratings per Genre by Decade (PIVOT)",
                font: { size: 18, weight: "bold" },
              },
              legend: { position: "bottom" },
              datalabels: { display: false },
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: { display: true, text: "Decade", color: "#555" },
                ticks: { color: "#555" },
                grid: { color: "rgba(200,200,200,0.15)" },
              },
              y: {
                min: 0,
                max: 10,
                title: { display: true, text: "Average Rating", color: "#555" },
                ticks: { color: "#555" },
                grid: { color: "rgba(200,200,200,0.15)" },
              },
            },
          }}
        />
      );

    case "correlation":
      const correlationValue = data[0]?.correlation ?? 0;

      return (
        <div className="flex flex-col justify-center items-center h-full">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">
            Ratings vs Votes (STATISTICAL)
          </h2>
          <p className="text-lg text-gray-700 mb-2">Correlation Coefficient:</p>
          <div className="text-5xl font-extrabold text-indigo-600">
            {correlationValue.toFixed(3)}
          </div>
          <p className="mt-3 text-gray-600 italic">
            {correlationValue > 0
              ? "Positive correlation — higher votes tend to align with higher ratings."
              : correlationValue < 0
              ? "Negative correlation — more votes often mean lower ratings."
              : "No significant correlation detected."}
          </p>
        </div>
      );

    default:
      return (
        <div className="text-center text-gray-500">Select a valid query.</div>
      );
  }
}
