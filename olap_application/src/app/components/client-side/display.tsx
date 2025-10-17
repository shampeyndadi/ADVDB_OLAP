"use client";

import React from "react";
import { Bar, Line, Pie, Scatter } from "react-chartjs-2";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
                backgroundColor: "rgba(79, 70, 229, 0.7)",
              },
            ],
          }}
          options={{
            plugins: {
              title: {
                display: true,
                text: "Average Rating per Genre (ROLL-UP)",
              },
            },
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      );

    case "drilldown":
      return (
        <Line
          data={{
            labels: data.map((d) => `${d.decade}s`),
            datasets: [
              {
                label: "Average Rating",
                data: data.map((d) => d.avg_rating),
                borderColor: "rgba(34,197,94,0.8)",
                fill: false,
                tension: 0.2,
              },
            ],
          }}
          options={{
            plugins: {
              title: {
                display: true,
                text: "Ratings by Decade per Genre (DRILL-DOWN)",
              },
            },
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      );

    case "slice":
      return (
        <Pie
          data={{
            labels: data.map((d) => d.title_type),
            datasets: [
              {
                label: "Average Rating",
                data: data.map((d) => d.avg_rating),
                backgroundColor: [
                  "#60a5fa",
                  "#a78bfa",
                  "#f87171",
                  "#34d399",
                  "#facc15",
                ],
              },
            ],
          }}
          options={{
            plugins: {
              title: {
                display: true,
                text: "Drama Ratings by Title Type (SLICE)",
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
              },
            ],
          }}
          options={{
            indexAxis: "y",
            plugins: {
              title: {
                display: true,
                text: "Comedy Titles in US (2015–Present) (DICE)",
              },
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
            labels: data.map((d) => d.popularity_tier),
            datasets: [
              {
                label: "Average Rating",
                data: data.map((d) => d.avg_rating),
                backgroundColor: "rgba(239, 68, 68, 0.7)",
              },
            ],
          }}
          options={{
            plugins: {
              title: {
                display: true,
                text: "Average Ratings by Popularity Tier (ROLL-UP)",
              },
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
            {data.correlation
              ? Number(data.correlation).toFixed(3)
              : "No correlation value"}
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
