import { query } from "./db";
import InteractiveClient from "./components/client-side/InteractiveClient";

export default async function Page() {
  const rows = await query(`
    SELECT g.genre_code AS genre,
           ROUND(AVG(f.average_rating), 2) AS avg_rating,
           SUM(f.num_votes) AS total_votes
    FROM dwh.fact_title_rating f
    JOIN dwh.bridge_title_genre bg ON f.title_key = bg.title_key
    JOIN dwh.dim_genre g ON bg.genre_key = g.genre_key
    GROUP BY g.genre_code
    ORDER BY avg_rating DESC;
  `);

  return <InteractiveClient initialData={rows} />;
}
