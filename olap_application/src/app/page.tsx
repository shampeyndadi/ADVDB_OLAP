import Header from "./components/client-side/header";
import Sidebar from "./components/client-side/sidebar";
import ChartDisplay from "./components/client-side/display";
import { query } from "./db";

export default async function Page() {
  // Example OLAP query (ROLL-UP)
  const rows = await query(`
    SELECT 
      g.genre_code AS genre,
      ROUND(AVG(f.average_rating), 2) AS avg_rating,
      SUM(f.num_votes) AS total_votes
    FROM dwh.fact_title_rating f
    JOIN dwh.bridge_title_genre bg ON f.title_key = bg.title_key
    JOIN dwh.dim_genre g ON bg.genre_key = g.genre_key
    GROUP BY g.genre_code
    ORDER BY avg_rating DESC;
  `);

  return (
    <div className="flex min-h-screen">
      <Sidebar /> {/* static for now */}
      <div className="flex-1 bg-gray-50">
        <Header />
        <div className="p-6 h-[80vh]">
          <ChartDisplay query="rollup" data={rows} />
        </div>
      </div>
    </div>
  );
}
