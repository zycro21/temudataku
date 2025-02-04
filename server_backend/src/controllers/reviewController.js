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

// Create Reviews
exports.createReview = async (req, res) => {
  const connection = await db.getConnection(); // Ambil koneksi untuk transaksi
  try {
    const { session_id, rating, comment } = req.body;
    const { user_id, role } = req.user; // Ambil user_id & role dari token

    // Validasi wajib isi
    if (!session_id || !rating) {
      return res
        .status(400) // Bad Request
        .json({ message: "Session ID dan rating wajib diisi" });
    }

    // Cek apakah session_id valid
    const checkSessionSql = `SELECT * FROM sessions WHERE session_id = ? LIMIT 1`;
    const [sessionResults] = await db.query(checkSessionSql, [session_id]);
    if (sessionResults.length === 0) {
      return res
        .status(400) // Bad Request
        .json({ message: "Session ID tidak valid!" });
    }

    // Validasi rating (1-5)
    if (rating < 0 || rating > 5) {
      return res
        .status(400) // Bad Request
        .json({ message: "Rating harus antara 0-5" });
    }

    // Hanya admin & user bisa review
    if (role !== "user" && role !== "admin") {
      return res
        .status(403) // Forbidden
        .json({ message: "Anda tidak memiliki izin untuk memberikan review!" });
    }

    // Jika role "user", cek apakah pernah order session ini
    if (role === "user") {
      const checkOrderSql = `SELECT * FROM orders WHERE user_id = ? AND session_id = ? LIMIT 1`;
      const [orderResults] = await db.query(checkOrderSql, [
        user_id,
        session_id,
      ]);

      if (orderResults.length === 0) {
        return res
          .status(403) // Forbidden
          .json({
            message:
              "Anda hanya bisa memberikan review untuk session yang pernah Anda order!",
          });
      }
    }

    // Cek apakah user sudah pernah review session ini
    const checkExistingReviewSql = `SELECT * FROM reviews WHERE session_id = ? AND user_id = ? LIMIT 1`;
    const [existingReview] = await db.query(checkExistingReviewSql, [
      session_id,
      user_id,
    ]);

    if (existingReview.length > 0) {
      return res
        .status(400) // Bad Request
        .json({ message: "Anda sudah memberikan review untuk sesi ini!" });
    }

    // Cari nomor urut terakhir untuk session_id yang sama
    const countSql = `SELECT COUNT(*) AS count FROM reviews WHERE session_id = ?`;
    const [countResult] = await db.query(countSql, [session_id]);
    const nextNumber = countResult[0].count + 1; // Urutan berikutnya

    // Buat review_id dengan format "review-{session_id}-000X"
    const review_id = `review-${session_id}-${String(nextNumber).padStart(
      4,
      "0"
    )}`;

    // Gunakan transaksi untuk insert
    await connection.beginTransaction();
    const insertSql = `INSERT INTO reviews (review_id, session_id, user_id, rating, comment) VALUES (?, ?, ?, ?, ?)`;
    await connection.query(insertSql, [
      review_id,
      session_id,
      user_id,
      rating,
      comment,
    ]);
    await connection.commit();

    // Response sukses
    return res
      .status(201) // Created
      .json({ message: "Review berhasil ditambahkan!", review_id });
  } catch (error) {
    await connection.rollback();
    // Response error server
    return res.status(500).json({ message: "Server error: " + error.message });
  } finally {
    connection.release();
  }
};

// Get all data reviews
exports.getAllReviews = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      sort_by = "created_at",
      sort_order = "DESC",
      q = "",
      session_id = "",
      user_id = "",
    } = req.query;

    // Pastikan nilai numerik valid
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    // Cegah SQL Injection dengan validasi sorting
    const validSortBy = ["rating", "created_at"];
    const validSortOrder = ["ASC", "DESC"];

    if (!validSortBy.includes(sort_by)) sort_by = "created_at"; // Default created_at
    if (!validSortOrder.includes(sort_order)) sort_order = "DESC"; // Default DESC

    // Query Pencarian & Filter
    let searchQuery = "";
    let queryParams = [];

    if (q) {
      searchQuery += `AND (r.session_id LIKE ? OR r.user_id LIKE ?) `;
      queryParams.push(`%${q}%`, `%${q}%`);
    }
    if (session_id) {
      searchQuery += `AND r.session_id = ? `;
      queryParams.push(session_id);
    }
    if (user_id) {
      searchQuery += `AND r.user_id = ? `;
      queryParams.push(user_id);
    }

    // Query utama dengan join ke sessions & mentors
    const sql = `
    SELECT r.review_id, r.session_id, s.title AS session_title, 
           r.user_id, u.username, m.name AS mentor_name, 
           r.rating, r.comment, r.created_at
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.user_id
    LEFT JOIN sessions s ON r.session_id = s.session_id
    LEFT JOIN mentors m ON s.mentor_id = m.mentor_id
    WHERE 1 ${searchQuery}
    ORDER BY ${sort_by} ${sort_order}
    LIMIT ? OFFSET ?`;

    queryParams.push(limit, offset);
    const [reviews] = await db.query(sql, queryParams);

    // Hitung total data untuk pagination
    const countSql = `SELECT COUNT(*) AS total FROM reviews r WHERE 1 ${searchQuery}`;
    const countParams = queryParams.slice(0, -2); // Ambil queryParams tanpa limit & offset
    const [countResult] = await db.query(countSql, countParams);

    res.json({
      total: countResult[0].total,
      page,
      totalPages: Math.ceil(countResult[0].total / limit),
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Get Reviews Detail by review_id
exports.getReviewsByReviewId = async (req, res) => {
  try {
    const { review_id } = req.params; // Ambil review_id dari params
    const { user_id, role } = req.user; // Ambil user_id & role dari token

    // Cek apakah review ini ada di database
    const checkReviewSql = `SELECT r.session_id, s.title AS session_title, s.mentor_id, m.name AS mentor_name 
                              FROM reviews r 
                              LEFT JOIN sessions s ON r.session_id = s.session_id 
                              LEFT JOIN mentors m ON s.mentor_id = m.mentor_id 
                              WHERE r.review_id = ?`;
    const [reviewData] = await db.query(checkReviewSql, [review_id]);

    if (reviewData.length === 0) {
      return res.status(404).json({ message: "Review tidak ditemukan" });
    }

    const sessionId = reviewData[0].session_id;
    const sessionTitle = reviewData[0].session_title;
    const mentorId = reviewData[0].mentor_id;
    const mentorName = reviewData[0].mentor_name;

    // Buat query untuk mendapatkan detail review
    let sql = `
        SELECT r.review_id, r.session_id, s.title AS session_title, 
               r.user_id, u.name AS user_name, 
               r.rating, r.comment, r.created_at
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.user_id
        LEFT JOIN sessions s ON r.session_id = s.session_id
        WHERE r.review_id = ?`;

    let queryParams = [review_id];

    if (role === "user") {
      // User hanya bisa melihat review jika dia yang memberi review tersebut
      sql += ` AND r.user_id = ?`;
      queryParams.push(user_id);
    } else if (role === "mentor") {
      // Mentor hanya bisa melihat review untuk sesi yang dia ajar
      sql += ` AND s.mentor_id = ?`;
      queryParams.push(mentorId);
    }
    // Admin tidak perlu filter tambahan, karena bisa melihat semua.

    const [reviews] = await db.query(sql, queryParams);

    if (reviews.length === 0) {
      return res.status(404).json({
        message: "Review tidak ditemukan atau Anda tidak memiliki akses",
      });
    }

    res.json({
      review_id,
      session_id: sessionId,
      session_title: sessionTitle,
      mentor_name: mentorName,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Update Review by review_id
exports.updateReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const { rating, comment } = req.body;
    const { user_id, role } = req.user; // Ambil role dari token

    // Cek apakah review ada di database
    const checkReviewSql = `SELECT * FROM reviews WHERE review_id = ? LIMIT 1`;
    const [reviewResults] = await db.query(checkReviewSql, [review_id]);

    if (reviewResults.length === 0) {
      return res.status(404).json({ message: "Review tidak ditemukan" });
    }

    const review = reviewResults[0];

    // Hanya user yang membuat review atau admin yang boleh update
    if (role !== "admin" && review.user_id !== user_id) {
      return res.status(403).json({
        message: "Anda tidak memiliki izin untuk mengedit review ini",
      });
    }

    // Validasi rating jika ada
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return res.status(400).json({ message: "Rating harus antara 1-5" });
    }

    // Update hanya jika ada perubahan
    let updates = [];
    let values = [];

    if (rating !== undefined) {
      updates.push("rating = ?");
      values.push(rating);
    }
    if (comment !== undefined) {
      updates.push("comment = ?");
      values.push(comment);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ message: "Tidak ada perubahan yang dikirimkan" });
    }

    // Tambahkan updated_at untuk mencatat perubahan
    updates.push("updated_at = CURRENT_TIMESTAMP");

    values.push(review_id);

    const updateSql = `UPDATE reviews SET ${updates.join(
      ", "
    )} WHERE review_id = ?`;
    await db.query(updateSql, values);

    res.json({ message: "Review berhasil diperbarui!" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Delete Reviews by review_id
exports.deleteReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const { role } = req.user;

    // Hanya admin yang bisa menghapus
    if (role !== "admin") {
      return res
        .status(403)
        .json({ message: "Anda tidak memiliki izin menghapus review ini!" });
    }

    // Cek apakah review ada
    const checkReviewSql = `SELECT * FROM reviews WHERE review_id = ? LIMIT 1`;
    const [reviewResults] = await db.query(checkReviewSql, [review_id]);

    if (reviewResults.length === 0) {
      return res.status(404).json({ message: "Review tidak ditemukan!" });
    }

    // Eksekusi penghapusan
    const deleteSql = `DELETE FROM reviews WHERE review_id = ?`;
    await db.query(deleteSql, [review_id]);

    res.json({ message: "Review berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};
