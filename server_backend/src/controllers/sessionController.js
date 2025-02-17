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

    console.log("Data diterima di backend:", req.body);

    if (!mentor_id || !title || !price || !duration || !service_type) {
      return res.status(400).json({
        message: "Semua Field Wajib Diisi",
      });
    }

    // Cek apakah mentor_id ada di tabel mentors
    const mentorCheckQuery = `SELECT * FROM mentors WHERE mentor_id = ?`;
    const [mentorResults] = await db.query(mentorCheckQuery, [mentor_id]);

    if (mentorResults.length === 0) {
      return res.status(400).json({
        message: "mentor_id tidak ditemukan di tabel mentors",
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

    // Ambil session_id terbesar dengan service_type yang sama
    const maxIdQuery = `SELECT MAX(session_id) AS max_id FROM sessions WHERE service_type = ?`;
    const [maxResult] = await db.query(maxIdQuery, [service_type]);

    let nextNumber = 1; // Default jika belum ada sesi dengan service_type tersebut
    if (maxResult[0].max_id) {
      const lastNumber = parseInt(maxResult[0].max_id.split("-")[1], 10);
      nextNumber = lastNumber + 1;
    }

    // Buat session_id baru
    const session_id = `${prefix}-${String(nextNumber).padStart(4, "0")}`;

    // Insert Session Ke Database
    const insertQuery = `INSERT INTO sessions (session_id, mentor_id, title, description, price, duration, service_type) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const insertValues = [
      session_id,
      mentor_id,
      title,
      description,
      price,
      duration,
      service_type,
    ];

    // Menjalankan insert query menggunakan promise
    const [insertResult] = await db.query(insertQuery, insertValues);

    // Log hasil query insert
    console.log("Session inserted, result:", insertResult);

    // Kirim respons jika berhasil
    res.status(201).json({
      message: "Session berhasil dibuat",
      session_id,
    });
  } catch (error) {
    // Tangani error jika ada
    console.error("Error:", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getAllSession = async (req, res) => {
  try {
    const {
      service_type,
      sort_price,
      sort_duration,
      page = 1,
      search,
    } = req.query;

    // Tentukan kondisi filter
    let whereClause = "";
    let queryParams = [];

    if (search) {
      whereClause +=
        "WHERE (s.title LIKE ? OR s.description LIKE ? OR m.name LIKE ?)";
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (service_type) {
      // Jika sudah ada WHERE sebelumnya, gunakan AND untuk filter service_type
      if (whereClause) {
        whereClause += " AND service_type = ?";
      } else {
        whereClause += "WHERE service_type = ?";
      }
      queryParams.push(service_type);
    }

    // Tentukan Pengurutan
    let orderClause = "";
    let orderParams = [];
    if (sort_price) {
      orderParams.push(
        `price ${sort_price.toUpperCase() === "DESC" ? "DESC" : "ASC"}`
      );
    }
    if (sort_duration) {
      orderParams.push(
        `duration ${sort_duration.toUpperCase() === "DESC" ? "DESC" : "ASC"}`
      );
    }
    if (orderParams.length > 0) {
      orderClause = `ORDER BY ${orderParams.join(", ")}`;
    }

    // Tentukan Pagination
    const limit = 10;
    const offset = (page - 1) * limit;

    // Query untuk menghitung total jumlah session
    const countQuery = `
              SELECT COUNT(*) AS total 
              FROM sessions s
              LEFT JOIN mentors m ON s.mentor_id = m.mentor_id
              ${whereClause}
          `;

    const [countResult] = await db.query(countQuery, queryParams);

    const totalSessions = countResult[0].total;
    const totalPages = Math.ceil(totalSessions / limit);

    // Query untuk mengambil data session dengan filter, pengurutan, dan pagination
    const sql = `
              SELECT s.*, m.name AS mentor_name 
              FROM sessions s
              LEFT JOIN mentors m ON s.mentor_id = m.mentor_id
              ${whereClause}
              ${orderClause}
              LIMIT ? OFFSET ?
         `;

    const [results] = await db.query(sql, [...queryParams, limit, offset]);

    res.json({
      totalSessions,
      totalPages,
      currentPage: page,
      sessions: results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Session ID dari request:", id);

    // Pastikan session_id valid
    if (!id) {
      return res.status(400).json({ message: "Session ID tidak valid" });
    }

    let sql = `
        SELECT 
          s.session_id, 
          s.title, 
          s.description, 
          s.price, 
          s.duration, 
          s.service_type, 
          m.name AS mentor_name,
          CASE 
            WHEN s.service_type IN ('group', 'bootcamp') THEN AVG(r.rating)
            ELSE MAX(r.rating)
          END AS rating
        FROM sessions s
        LEFT JOIN mentors m ON s.mentor_id = m.mentor_id
        LEFT JOIN reviews r ON s.session_id = r.session_id
        WHERE s.session_id = ? 
        GROUP BY s.session_id, s.title, s.description, s.price, s.duration, s.service_type, m.name
      `;

    // Eksekusi query
    const [results] = await db.query(sql, [id]);

    if (results.length === 0) {
      return res.status(404).json({
        message: "Session tidak ditemukan.",
      });
    }

    res.json(results[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, description, price, duration, service_type, mentor_id } =
      req.body;
    const { role, user_id } = req.user;

    console.log("Role:", role);
    console.log("Session ID dari request:", id);

    // Pastikan session_id valid
    if (!id) {
      return res.status(400).json({ message: "Session ID tidak valid" });
    }

    let loggedMentorId = null;

    // Jika role mentor, ambil mentor_id dari database
    if (role === "mentor") {
      const [mentorResult] = await db.query(
        "SELECT mentor_id FROM mentors WHERE user_id = ?",
        [user_id]
      );

      if (mentorResult.length > 0) {
        loggedMentorId = mentorResult[0].mentor_id;
      } else {
        return res.status(403).json({ message: "Anda bukan mentor terdaftar" });
      }

      console.log("Mentor ID dari database:", loggedMentorId);
    }

    // Cek apakah session ada
    const checkSessionSql = `SELECT * FROM sessions WHERE session_id = ? LIMIT 1`;
    const [sessionResults] = await db.query(checkSessionSql, [id]);

    if (sessionResults.length === 0) {
      return res.status(404).json({ message: "Session tidak ditemukan!" });
    }

    const session = sessionResults[0];

    // Role "user" tidak diizinkan
    if (role === "user") {
      return res.status(403).json({
        message: "Anda tidak memiliki izin untuk mengupdate session!",
      });
    }

    // Mentor hanya bisa update session miliknya sendiri
    if (role === "mentor" && session.mentor_id !== loggedMentorId) {
      return res.status(403).json({
        message: "Anda hanya bisa mengupdate session milik Anda sendiri!",
      });
    }

    // Validasi price dan duration harus berupa angka
    if (price !== undefined && price !== "" && isNaN(price)) {
      return res.status(400).json({ message: "Price harus berupa angka!" });
    }
    if (duration !== undefined && duration !== "" && isNaN(duration)) {
      return res.status(400).json({ message: "Duration harus berupa angka!" });
    }

    // Validasi agar tidak update dengan nilai kosong
    const updatedFields = {};
    if (title?.trim() && title !== session.title)
      updatedFields.title = title.trim();
    if (description?.trim() && description !== session.description)
      updatedFields.description = description.trim();
    if (price !== undefined && price !== "" && Number(price) !== session.price)
      updatedFields.price = Number(price);
    if (
      duration !== undefined &&
      duration !== "" &&
      Number(duration) !== session.duration
    )
      updatedFields.duration = Number(duration);
    if (service_type?.trim() && service_type !== session.service_type)
      updatedFields.service_type = service_type.trim();

    // Admin boleh mengganti mentor_id, tetapi harus valid
    if (role === "admin" && mentor_id && mentor_id !== session.mentor_id) {
      const checkMentorSql = `SELECT * FROM mentors WHERE mentor_id = ? LIMIT 1`;
      const [mentorResults] = await db.query(checkMentorSql, [mentor_id]);

      if (mentorResults.length === 0) {
        return res.status(400).json({ message: "Mentor ID tidak valid!" });
      }
      updatedFields.mentor_id = mentor_id;
    }

    // Jika tidak ada perubahan, kirim respons tanpa update
    if (Object.keys(updatedFields).length === 0) {
      return res
        .status(400)
        .json({ message: "Tidak ada perubahan yang dilakukan!" });
    }

    // Buat query update secara dinamis
    let sql = `UPDATE sessions SET `;
    let values = [];
    Object.keys(updatedFields).forEach((key, index) => {
      sql += `${key} = ?${
        index < Object.keys(updatedFields).length - 1 ? "," : ""
      } `;
      values.push(updatedFields[key]);
    });
    sql += `WHERE session_id = ?`;
    values.push(id);

    // Eksekusi query update
    await db.query(sql, values);

    res.json({
      message: "Session berhasil diperbarui!",
      updated_fields: updatedFields,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Delete Session By ID
exports.deleteSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    // Hanya admin yang bisa menghapus session
    if (role !== "admin") {
      return res
        .status(403)
        .json({ message: "Anda tidak memiliki izin untuk menghapus session!" });
    }

    // Cek apakah session ada
    const checkSessionSql = `SELECT * FROM sessions WHERE session_id = ? LIMIT 1`;
    const [sessionResults] = await db.query(checkSessionSql, [id]);

    if (sessionResults.length === 0) {
      return res.status(404).json({ message: "Session tidak ditemukan!" });
    }

    // Hapus session
    const deleteSessionSql = `DELETE FROM sessions WHERE session_id = ?`;
    await db.query(deleteSessionSql, [id]);

    res.json({ message: "Session berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};
