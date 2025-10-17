"use client";

import React from "react";
import { useState } from "react";
import Header from "./components/client-side/header";
import Sidebar from "./components/client-side/sidebar";

function main() {
  const [selectedQuery, setSelectedQuery] = useState("rollup");
  const [data, setData] = useState([]);

  const runQuery = async (queryId = selectedQuery) => {
    const res = await fetch(`/api/${queryId}`);
    const json = await res.json();
    setData(json);
  };

  return (
    <div className="flex flex-row min-w-full">
      <Header />
      <Sidebar
        selectedQuery={selectedQuery}
        setSelectedQuery={setSelectedQuery}
        runQuery={runQuery}
      />
    </div>
  );
}

export default main;
