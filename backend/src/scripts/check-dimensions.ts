import { sequelize } from '../config/database';

async function main() {
  await sequelize.authenticate();
  const [rows] = await sequelize.query(`
    SELECT 
      d.name AS dept,
      s.name AS subtype,
      CASE 
        WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(ri.content_json, '$.amount')) AS DECIMAL(10,2)) < 50 THEN '<50万'
        WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(ri.content_json, '$.amount')) AS DECIMAL(10,2)) <= 100 THEN '50-100万'
        ELSE '>100万'
      END AS band,
      COUNT(*) AS cnt
    FROM research_items ri
    LEFT JOIN users u ON u.id = ri.user_id
    LEFT JOIN mdm_departments d ON d.id = u.dept_id
    LEFT JOIN research_subtypes s ON s.id = ri.subtype_id
    WHERE ri.title LIKE '维度演示-%'
    GROUP BY d.name, s.name, band
    ORDER BY d.name, s.name, band;
  `);
  console.log(JSON.stringify(rows, null, 2));
  await sequelize.close();
}

main().catch(err => { console.error(err); process.exit(1); });

