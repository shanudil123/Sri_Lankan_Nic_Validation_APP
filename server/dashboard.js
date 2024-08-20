import express from "express";
import { createConnection } from "mysql2";

const router = express.Router();

// MySQL connection
const db = createConnection({
  host: "localhost",
  user: "root",
  password: "Shanuka@1234",
  database: "nic_validation",
  port: 3307,
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    throw err;
  }
  console.log("Dashboard connected...");
});

// Route to get dashboard summary
router.get("/dashboard", (req, res) => {
  const query = `
  SELECT
    COUNT(*) AS totalRecords,
    SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) AS maleUsers,
    SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) AS femaleUsers,
    (SELECT COUNT(*) FROM rejected_records) AS rejectedRecords
  FROM nic_data
`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching summary:", err);
      return res.status(500).send("Error fetching summary");
    }

    // Send the summary data
    res.json(results[0]);
  });
});

export default router;
