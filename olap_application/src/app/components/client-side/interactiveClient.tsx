"use client";

import { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import ChartDisplay from "./display";
import Header from "./header";

export default function InteractiveClient({
  initialData,
}: {
  initialData: any;
}) {
  const [selectedQuery, setSelectedQuery] = useState("rollup");
  const [data, setData] = useState(initialData);

  async function runQuery(id: string) {
    setSelectedQuery(id);
    const res = await fetch(`/api/${id}`);
    const json = await res.json();
    setData(Array.isArray(json) ? json : []);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        selectedQuery={selectedQuery}
        setSelectedQuery={setSelectedQuery}
        runQuery={runQuery}
      />
      <div className="flex-1 bg-gray-50">
        <Header />
        <div className="p-6 h-[80vh]">
          <ChartDisplay query={selectedQuery} data={data} />
        </div>
      </div>
    </div>
  );
}
