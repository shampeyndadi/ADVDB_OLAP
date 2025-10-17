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

// 🧩 GLOBAL: disable points entirely
ChartJS.defaults.elements.point.radius = 0;
ChartJS.defaults.elements.point.hoverRadius = 0;
ChartJS.defaults.elements.point.pointStyle = false;

// 🧩 GLOBAL: disable datalabels by default
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
                text: "Average Rating per Genre (ROLL-UP)",
                font: { size: 18, weight: "bold" },
              },
              legend: { display: true, position: "top" },
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
      // Sort and filter: only top 8 genres overall
      const genreAverages = {};
      data.forEach((d) => {
        genreAverages[d.genre] = (genreAverages[d.genre] || []).concat(
          d.avg_rating
        );
      });
      const topGenres = Object.entries(genreAverages)
        .sort(
          (a, b) =>
            b[1].reduce((s, v) => s + v, 0) / b[1].length -
            a[1].reduce((s, v) => s + v, 0) / a[1].length
        )
        .slice(0, 8)
        .map(([g]) => g);

      const decades = [...new Set(data.map((d) => `${d.decade}s`))];

      const datasets = topGenres.map((genre, i) => {
        const colors = [
          "#60a5fa",
          "#f87171",
          "#34d399",
          "#a78bfa",
          "#facc15",
          "#fb923c",
          "#f472b6",
          "#10b981",
        ];
        const color = colors[i % colors.length];
        return {
          label: genre,
          data: decades.map((decade) => {
            const row = data.find(
              (d) => `${d.decade}s` === decade && d.genre === genre
            );
            return row ? row.avg_rating : null;
          }),
          backgroundColor: color + "cc",
        };
      });

      return (
        <Bar
          data={{ labels: decades, datasets }}
          options={{
            plugins: {
              title: {
                display: true,
                text: "Average Ratings by Decade (Top 8 Genres)",
                font: { size: 18, weight: "bold" },
              },
              legend: { position: "bottom" },
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                stacked: false,
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
            },
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      );

    case "popularity":
      return (
        <Bar
          data={{
            labels: data.map((d) => d.genre_code || d.popularity_tier),
            datasets: [
              {
                label: "Average Rating",
                data: data.map((d) => d.avg_rating),
                backgroundColor: "rgba(239, 68, 68, 0.7)",
                borderRadius: 4,
              },
            ],
          }}
          options={{
            plugins: {
              title: {
                display: true,
                text: "Average Ratings by Popularity Tier (ROLL-UP)",
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

    case "correlation":
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <h3 className="text-lg font-semibold mb-2">
            Rating–Votes Correlation
          </h3>
          <p className="text-3xl font-bold text-indigo-600">
            {Array.isArray(data)
              ? Number(data[0]?.correlation || 0).toFixed(3)
              : Number(data.correlation || 0).toFixed(3)}
          </p>
          <p className="text-gray-500 mt-2">
            (1 = strong positive, 0 = none, -1 = negative)
          </p>
        </div>
      );

    default:
      return (
        <div className="text-center text-gray-500">Select a valid query.</div>
      );
  }
}
