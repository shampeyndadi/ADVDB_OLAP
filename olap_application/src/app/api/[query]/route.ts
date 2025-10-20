// src/app/api/[query]/route.ts
import { NextResponse } from "next/server";
import { query as db } from "../../db";

export async function GET(
  req: Request,
  context: { params: Promise<{ query: string }> }
) {
  const { query } = await context.params;
  let sql = "";

  switch (query) {
    case "rollup":
      sql = `
        SELECT 
            g.genre_code AS genre,
            ROUND(AVG(f.average_rating), 2) AS avg_rating,
            SUM(f.num_votes) AS total_votes
        FROM dwh.fact_title_rating f
        JOIN dwh.bridge_title_genre bg ON f.title_key = bg.title_key
        JOIN dwh.dim_genre g ON bg.genre_key = g.genre_key
        GROUP BY g.genre_code
        ORDER BY avg_rating DESC;
      `;
      break;

    case "drilldown":
      sql = `
        SELECT 
            (t.start_year / 10) * 10 AS decade,
            g.genre_code AS genre,
            ROUND(AVG(f.average_rating), 2) AS avg_rating
        FROM dwh.fact_title_rating f
        JOIN dwh.dim_title t ON f.title_key = t.title_key
        JOIN dwh.bridge_title_genre bg ON t.title_key = bg.title_key
        JOIN dwh.dim_genre g ON bg.genre_key = g.genre_key
        WHERE t.start_year IS NOT NULL
        GROUP BY decade, g.genre_code
        ORDER BY decade, avg_rating DESC;
      `;
      break;

    case "slice":
      sql = `
        SELECT 
            t.title_type,
            ROUND(AVG(f.average_rating), 2) AS avg_rating,
            COUNT(*) AS total_titles
        FROM dwh.fact_title_rating f
        JOIN dwh.dim_title t ON f.title_key = t.title_key
        JOIN dwh.bridge_title_genre bg ON t.title_key = bg.title_key
        JOIN dwh.dim_genre g ON bg.genre_key = g.genre_key
        WHERE g.genre_code = 'drama'
        GROUP BY t.title_type
        ORDER BY avg_rating DESC;
      `;
      break;

    case "dice":
      sql = `
        SELECT 
            t.primary_title,
            t.start_year,
            f.average_rating,
            f.num_votes
        FROM dwh.fact_title_rating f
        JOIN dwh.dim_title t ON f.title_key = t.title_key
        JOIN dwh.bridge_title_genre bg ON t.title_key = bg.title_key
        JOIN dwh.dim_genre g ON bg.genre_key = g.genre_key
        JOIN dwh.bridge_title_region br ON t.title_key = br.title_key
        JOIN dwh.dim_region r ON br.region_key = r.region_key
        WHERE g.genre_code = 'comedy'
          AND r.region_code = 'us'
          AND t.start_year >= 2015
        ORDER BY f.average_rating DESC
        LIMIT 20;
      `;
      break;

    case "popularity":
      sql = `
        SELECT * FROM crosstab(
          $$
          SELECT (t.start_year / 10) * 10 AS decade,
                g.genre_code,
                ROUND(AVG(f.average_rating), 2) AS avg_rating
          FROM dwh.fact_title_rating f
          JOIN dwh.bridge_title_genre bg ON f.title_key = bg.title_key
          JOIN dwh.dim_genre g ON bg.genre_key = g.genre_key
          JOIN dwh.dim_title t ON f.title_key = t.title_key
          GROUP BY decade, g.genre_code
          ORDER BY decade
          $$,
          $$ SELECT DISTINCT genre_code FROM dwh.dim_genre ORDER BY genre_code $$
        ) AS ct(decade INT, action NUMERIC, comedy NUMERIC, drama NUMERIC, horror NUMERIC, sci_fi NUMERIC);
      `;
      break;

    case "correlation":
      sql = `
        SELECT 
            CORR(f.average_rating, f.num_votes) AS correlation
        FROM dwh.fact_title_rating f;
      `;
      break;

    default:
      return NextResponse.json(
        { error: "Invalid query parameter" },
        { status: 400 }
      );
  }

  try {
    const rows = await db(sql);
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("DB Query Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
