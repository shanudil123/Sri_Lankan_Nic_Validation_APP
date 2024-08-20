import express from "express";
import mysql from "mysql";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";
const salt = 10;

const router = express.Router();

router.use(express.json());
router.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET"],
    credentials: true,
  })
);
router.use(cookieParser());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Shanuka@1234",
  database: "nic_validation",
  port: 3307,
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Gmail SMTP server
  port: 587, // Port for TLS
  secure: false, // Set to true for port 465 (SSL)
  auth: {
    user: "shanuka1280@gmail.com", // Your Gmail address
    pass: "sxys dlog jcxs wytn", // Your Gmail password or App Password
  },
  tls: {
    rejectUnauthorized: false, // Disable certificate validation (useful for local testing)
  },
});

router.post("/register", (req, res) => {
  const sql = "INSERT INTO login(name,email,password) VALUES(?)";
  bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
    if (err) return res.json({ Error: "Error for hashing password" });

    const values = [req.body.name, req.body.email, hash];
    db.query(sql, [values], (err, result) => {
      if (err) return res.json({ Error: "Inserting data Error in server" });
      return res.json({ status: "Success" });
    });
  });
});

router.post("/login", (req, res) => {
  const sql = "SELECT * FROM login WHERE email = ?";

  db.query(sql, [req.body.email], (err, data) => {
    if (err) return res.json({ Error: "Login Error in server" });

    if (data.length > 0) {
      bcrypt.compare(
        req.body.password.toString(),
        data[0].password,
        (err, response) => {
          if (err) return res.json({ Error: "password compare Error" });
          if (response) {
            const name = data[0].name;
            const token = jwt.sign({ name }, "jwt-secret-key", {
              expiresIn: "1d",
            });
            res.cookie("token", token);
            return res.json({ status: "Success" });
          } else {
            return res.json({ Error: "password not matched" });
          }
        }
      );
    } else {
      return res.json({ Error: "No email existed" });
    }
  });
});

router.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  // Update the database with the verification code
  const sql = "UPDATE login SET verification_code = ? WHERE email = ?";
  db.query(sql, [verificationCode, email], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.json({ Error: "Database Error" });
    }

    if (result.affectedRows > 0) {
      // Send verification email
      const mailOptions = {
        from: "shanuka1280@gmail.com",
        to: email,
        subject: "Password Reset Verification Code",
        text: `Your verification code is ${verificationCode}`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Error sending email:", err);
          return res.json({ Error: "Email Error" });
        }
        console.log("Email sent:", info.response);
        return res.json({
          status: "Success",
          message: "Verification code sent",
        });
      });
    } else {
      return res.json({ Error: "Email not found" });
    }
  });
});

router.post("/reset-password", (req, res) => {
  const { code, newPassword, email } = req.body;

  console.log("Received code:", code);
  console.log("Received email:", email);
  console.log("New password:", newPassword);

  // Check if the verification code exists in the database
  const sql = "SELECT * FROM login WHERE verification_code = ? AND email = ?";
  db.query(sql, [code, email], (err, data) => {
    if (err) {
      console.error("Database Error:", err);
      return res.json({ Error: "Database Error" });
    }

    console.log("Data from database:", data);

    if (data.length > 0) {
      // Hash the new password
      bcrypt.hash(newPassword, salt, (err, hash) => {
        if (err) {
          console.error("Hashing Error:", err);
          return res.json({ Error: "Hashing Error" });
        }

        // Update the password and clear the verification code
        const updateSql =
          "UPDATE login SET password = ?, verification_code = NULL WHERE email = ?";
        db.query(updateSql, [hash, email], (err, result) => {
          if (err) {
            console.error("Database Update Error:", err);
            return res.json({ Error: "Database Update Error" });
          }

          console.log("Update Result:", result);

          return res.json({ status: "Success" });
        });
      });
    } else {
      console.log("No matching records found");
      return res.json({ Error: "Invalid verification code or email" });
    }
  });
});

export default router;
