// Import required modules and set up the server
import express from "express";
import multer, { diskStorage } from "multer";
import { createConnection } from "mysql2";
import { extname } from "path";
import { createReadStream, unlink, existsSync, mkdirSync } from "fs";
import csv from "csv-parser";
import cors from "cors";
import authRouter from "./auth.js";
import dashboardRouter from "./dashboard.js";
import { v4 as uuidv4 } from "uuid";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { parse } from "json2csv";
import * as XLSX from "xlsx";
import { Server } from "http";

const app = express();
const port = 5000;

const uploadDir = "uploads";
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/auth", authRouter);
app.use("/api", dashboardRouter);

const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

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
  console.log("MySQL connected...");
});

// Validate and extract NIC details
function validateAndExtractNIC(nic) {
  const nicRegex10Digit = /^[0-9]{9}[vVxX]$/;
  const nicRegex12Digit = /^[0-9]{12}$/;

  // Clean up NIC: Remove all non-numeric characters except 'V', 'v', 'X', 'x'
  const cleanedNIC = nic.replace(/[^0-9VvXx]/g, "");

  let birthYear;
  let birthDay;
  let gender;

  if (nicRegex10Digit.test(cleanedNIC)) {
    const yearPrefix = cleanedNIC[4] >= "5" ? "19" : "20"; // Assume NICs are from 1950s to 2099
    birthYear = yearPrefix + cleanedNIC.substring(0, 2);
    birthDay = parseInt(cleanedNIC.substring(2, 5), 10);
    gender = birthDay > 500 ? "Female" : "Male";
    birthDay = birthDay > 500 ? birthDay - 500 : birthDay;
  } else if (nicRegex12Digit.test(cleanedNIC)) {
    birthYear = cleanedNIC.substring(0, 4);
    birthDay = parseInt(cleanedNIC.substring(4, 7), 10);
    gender = birthDay > 500 ? "Female" : "Male";
    birthDay = birthDay > 500 ? birthDay - 500 : birthDay;
  } else {
    return null; // Return null if NIC is invalid
  }

  // Validate the day part of the NIC
  if (birthDay < 1 || birthDay > 366) {
    console.error(`Invalid day value extracted from NIC: ${birthDay}`);
    return null; // Skip invalid NICs
  }

  // Ensure we are in a valid year range
  const currentYear = new Date().getFullYear();
  let fullBirthYear = parseInt(birthYear, 10);
  if (fullBirthYear > currentYear) {
    fullBirthYear -= 100; // Adjust the year if it's beyond current year
  }

  const birthDate = new Date(fullBirthYear, 0);
  birthDate.setDate(birthDay);

  let today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return {
    nic,
    birthDate: birthDate.toISOString().split("T")[0],
    age,
    gender,
  };
}

// File upload route
app.post("/upload", upload.array("files", 4), (req, res) => {
  if (!req.files || req.files.length < 1 || req.files.length > 4) {
    return res.status(400).send("You must upload between 1 and 4 files.");
  }

  const invalidNICs = [];
  const validNICs = [];
  const fileProcessingPromises = req.files.map((file) => {
    return new Promise((resolve, reject) => {
      const results = [];
      createReadStream(file.path)
        .pipe(csv({ headers: false }))
        .on("data", (data) => {
          console.log("Raw row data:", data); // Log the entire row data
          const nic = (data[0] || "").trim();

          console.log("Processing NIC:", nic); // Log the NIC to ensure it's read correctly

          if (nic) {
            const nicDetails = validateAndExtractNIC(nic);
            if (nicDetails) {
              validNICs.push(nicDetails);
            } else {
              invalidNICs.push(nic);
              console.error(`Invalid NIC number: ${nic}`);
            }
          } else {
            console.error(
              `No NIC number found in row: ${JSON.stringify(data)}`
            );
          }
        })
        .on("end", () => {
          const insertValidNICsPromises = validNICs.map((nicDetails) => {
            const sql = `INSERT INTO nic_data (nic, birthday, age, gender) VALUES (?, ?, ?, ?)`;
            return new Promise((resolve, reject) => {
              db.query(
                sql,
                [
                  nicDetails.nic,
                  nicDetails.birthDate,
                  nicDetails.age,
                  nicDetails.gender,
                ],
                (err) => {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
          });

          const insertInvalidNICsPromises = invalidNICs.map((nic) => {
            const sql = `INSERT INTO rejected_records (nic, reason) VALUES (?, ?)`;
            return new Promise((resolve, reject) => {
              db.query(sql, [nic, "Invalid NIC format"], (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
          });

          Promise.all([
            ...insertValidNICsPromises,
            ...insertInvalidNICsPromises,
          ])
            .then(() => {
              if (existsSync(file.path)) {
                unlink(file.path, (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              } else {
                resolve();
              }
            })
            .catch((err) => {
              reject(err);
            });
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  });

  Promise.all(fileProcessingPromises)
    .then(() => {
      res.json({
        success: true,
        message: "Files processed successfully",
        invalidNICs,
      });
    })
    .catch((err) => {
      console.error("Error processing files:", err);
      res.status(500).send("Error processing files");
    });
});

// Dashboard summary route
app.get("/api/dashboard", (req, res) => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM nic_data) AS totalRecords,
      (SELECT COUNT(*) FROM nic_data WHERE gender = 'Male') AS maleUsers,
      (SELECT COUNT(*) FROM nic_data WHERE gender = 'Female') AS femaleUsers,
      (SELECT COUNT(*) FROM rejected_records) AS rejectedRecords
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Dashboard query error:", err);
      res.status(500).send("Database error");
    } else {
      res.json(result[0]);
    }
  });
});

// Report route
app.get("/report", (req, res) => {
  const sql = `SELECT nic, birthday, age, gender FROM nic_data`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Report query error:", err);
      res.status(500).send("Database error");
    } else {
      results.forEach((row) => {
        row.birthday = new Date(row.birthday).toLocaleDateString("en-CA");
      });
      res.json(results);
    }
  });
});

// Report route for rejected records
app.get("/api/rejected-records", (req, res) => {
  const sql = `SELECT nic, reason FROM rejected_records`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Report query error:", err);
      res.status(500).send("Database error");
    } else {
      res.json(results);
    }
  });
});

// Generate and download report as PDF
app.get("/report/pdf", async (req, res) => {
  try {
    const sql = `SELECT nic, birthday, age, gender FROM nic_data`;
    db.query(sql, (err, results) => {
      if (err) {
        console.error("PDF generation query error:", err);
        res.status(500).send("Database error");
      } else {
        const doc = new jsPDF();
        doc.text("NIC Validation Report", 14, 20);
        autoTable(doc, {
          head: [["NIC", "Birthday", "Age", "Gender"]],
          body: results.map((row) => [
            row.nic,
            row.birthday,
            row.age,
            row.gender,
          ]),
        });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment;filename=report.pdf");
        res.send(doc.output());
      }
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).send("Error generating PDF report");
  }
});

// Generate and download report as CSV
app.get("/report/csv", (req, res) => {
  const sql = `SELECT nic, birthday, age, gender FROM nic_data`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("CSV generation query error:", err);
      res.status(500).send("Database error");
    } else {
      const csvData = parse(results);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment;filename=report.csv");
      res.send(csvData);
    }
  });
});

// Generate and download report as Excel
app.get("/report/excel", (req, res) => {
  const sql = `SELECT nic, birthday, age, gender FROM nic_data`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Excel generation query error:", err);
      res.status(500).send("Database error");
    } else {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(results);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
      const excelData = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment;filename=report.xlsx");
      res.send(excelData);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
