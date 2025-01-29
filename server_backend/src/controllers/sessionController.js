const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { body, validationResult, param } = require("express-validator");
const db = require("../config/database");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const RESET_PASSWORD_TOKEN_SECRET = process.env.RESET_PASSWORD_TOKEN_SECRET;
const RESET_PASSWORD_EXPIRATION = "1h";

exports.createSession = async (req, res) => {
  try {
    const { mentor_id, title, description, price, duration, service_type } =
      req.body;

    if (!mentor_id || !title || !price || !duration || !service_type) {
      return res.status(400).json({
        message: "Semua Field Wajib Diisi",
      });
    }

    // Tentukan prefix untuk session_id berdasarkan service_type
    let prefix = "";
    switch (service_type) {
      case "one_on_one":
        prefix = "OOO";
        break;
      case "group":
        prefix = "GROUP";
        break;
      case "bootcamp":
        prefix = "BC";
        break;
      default:
        return res.status(400).json({
          message: "Jenis service session tidak valid",
        });
    }

    // Ambil jumlah sesi yang sudah ada dengan service_type yang sama
    const countQuery = `SELECT COUNT(*) AS count FROM sessions WHERE service_type = ?`;

    db.query(countQuery, [service_type], (err, result) => {
      if (err)
        return res.status(500).json({
          message: err.message,
        });

      const count = result[0].count + 1;
      const session_id = `${prefix}-${String(count).padStart(4, "0")}`;

      // Insert Session Ke Database
      const sql = `INSERT INTO sessions (session_id, mentor_id, title, description, price, duration, service_type) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const values = [
        session_id,
        mentor_id,
        title,
        description,
        price,
        duration,
        service_type,
      ];

      db.query(sql, values, (err, result) => {
        if (err)
          return res.status(500).json({
            message: err.message,
          });

        res.status(201).json({
          message: "Session berhasil dibuat",
          session_id,
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getAllSession = async (req, res) => {
    try {
        const { service_type, sort_price, sort_duration, page = 1} = req.query;

        // Tentukan kondisi filter
        let whereClause =  "";
        let queryParams = [];
        if (service_type) {
            whereClause += "WHERE service_type = ?";
            queryParams.push(service_type);
        }

        // Tentukan Pengurutan
        let orderClause = "";
        if (sort_price) {
            orderClause = `ORDER BY price ${sort_price.toUpperCase() === "DESC" ? "DESC" : "ASC"}`;
        } else if (sort_duration) {
            orderClause = `ORDER BY duration ${sort_duration.toUpperCase() === "DESC" ? "DESC" : "ASC"}`;
        }

        // Tentukan Pagination
    } catch (error) {
        
    }
}