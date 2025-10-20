"use client";

export default function Sidebar({ selectedQuery, setSelectedQuery, runQuery }) {
  const queries = [
    { id: "rollup", label: "Average Rating per Genre (ROLL-UP)" },
    { id: "drilldown", label: "Ratings by Decade (DRILL-DOWN)" },
    { id: "slice", label: "Drama Title Types (SLICE)" },
    { id: "dice", label: "Comedy in US (DICE)" },
    { id: "popularity", label: "Average Ratings per Genre by Decade (PIVOT)" },
    { id: "correlation", label: "Rating vs Votes (STATISTICAL)" },
  ];

  return (
    <aside className="h-screen w-64 bg-indigo-700 text-white flex flex-col justify-between">
      <div>
        <h2 className="text-center text-2xl font-bold py-6 border-b border-indigo-500">
          Menu
        </h2>

        <nav className="mt-4 flex flex-col hover:cursor-pointer">
          {queries.map((q) => (
            <button
              key={q.id}
              onClick={() => {
                setSelectedQuery(q.id);
                runQuery(q.id);
              }}
              className={`text-left px-6 py-3 hover:bg-indigo-600 transition-all ${
                selectedQuery === q.id ? "bg-indigo-500 font-semibold" : ""
              }`}
            >
              {q.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="text-center text-lg py-3 text-indigo-200 pb-6 border-t border-indigo-500">
        <p>Group 9</p>
        <p>Julian - Foo</p>
      </div>
    </aside>
  );
}
