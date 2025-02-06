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

exports.createOrder = async (req, res) => {
  try {
    const { user_id, session_id, status } = req.body;
    const { role, user_id: loggedInUserId } = req.user; // Ambil role & user_id dari token

    // Validasi wajib diisi
    if (!user_id || !session_id || !status) {
      return res
        .status(400)
        .json({ message: "User ID, Session ID, dan Status wajib diisi" });
    }

    // Jika role adalah "user", pastikan dia hanya bisa membuat order untuk dirinya sendiri
    if (role === "user" && user_id !== loggedInUserId) {
      return res
        .status(403)
        .json({ message: "Anda hanya bisa membuat order untuk diri sendiri" });
    }

    // Validasi status hanya boleh: pending, confirmed, completed, cancelled
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    // Ambil service_type berdasarkan session_id
    const [sessionData] = await db.query(
      "SELECT service_type FROM sessions WHERE session_id = ?",
      [session_id]
    );

    if (sessionData.length === 0) {
      return res.status(400).json({ message: "Session tidak dapat ditemukan" });
    }

    const service_type = sessionData[0].service_type; // Ambil service_type dari session

    // Generate order_id berdasarkan service_type
    const orderPrefix =
      service_type === "one_on_one"
        ? "order-OOO-"
        : service_type === "group"
        ? "order-GROUP-"
        : service_type === "bootcamp"
        ? "order-BC-"
        : null;

    if (!orderPrefix) {
      return res.status(400).json({ message: "Service type tidak valid" });
    }

    // Cari ID terbesar yang sudah ada
    const [lastOrder] = await db.query(
      `SELECT order_id FROM orders WHERE service_type = ? ORDER BY order_id DESC LIMIT 1`,
      [service_type]
    );

    let newNumber = 1; // Default jika belum ada order

    if (lastOrder.length > 0) {
      const lastOrderId = lastOrder[0].order_id; // Misalnya "order-BC-0003"
      const lastNumber = parseInt(lastOrderId.split("-").pop(), 10); // Ambil angka terakhir (0003)
      newNumber = lastNumber + 1; // Tambah 1
    }

    const order_id = `${orderPrefix}${String(newNumber).padStart(4, "0")}`;

    // Buat timestamp order_date
    const order_date = new Date();

    // Insert Order ke dalam database
    const sql = `
          INSERT INTO orders (order_id, user_id, session_id, order_date, status, service_type)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

    await db.query(sql, [
      order_id,
      user_id,
      session_id,
      order_date,
      status,
      service_type,
    ]);

    res.status(201).json({
      message: "Order Berhasil Dibuat",
      order_id,
    });
  } catch (error) {
    console.error("Error saat membuat order:", error);
    res.status(500).json({ message: "Terjadi kesalahan, coba lagi nanti." });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { role } = req.user; // Ambil role dari token

    // Hanya admin yang bisa mengakses
    if (role !== "admin") {
      return res
        .status(403)
        .json({ message: "Akses ditolak, hanya admin yang bisa mengakses." });
    }

    // Ambil query params untuk filter, sort, pagination, dan search
    let {
      page = 1,
      status,
      service_type,
      sort_by,
      sort_order,
      search,
    } = req.query;
    const limit = 10; // Max 10 per halaman
    const offset = (page - 1) * limit;

    // Validasi sort_order hanya bisa "asc" atau "desc"
    const validSortOrder = ["asc", "desc"];
    sort_order = validSortOrder.includes(sort_order?.toLowerCase())
      ? sort_order.toLowerCase()
      : "desc";

    let orderBy = "o.order_date"; // Default sorting

    if (sort_by === "total_price") {
      orderBy = `o.total_price`; // Tidak perlu CAST karena sudah DECIMAL
    } else if (sort_by === "order_date") {
      orderBy = "o.order_date";
    }
    // Base query
    let sql = `
        SELECT o.*, u.username, s.title 
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        JOIN sessions s ON o.session_id = s.session_id
        WHERE 1=1
      `;

    // Tambahkan filter berdasarkan status
    if (status) {
      sql += ` AND o.status = ?`;
    }

    // Tambahkan filter berdasarkan service_type
    if (service_type) {
      sql += ` AND o.service_type = ?`;
    }

    // Tambahkan fitur pencarian (case insensitive)
    if (search) {
      sql += ` AND (LOWER(s.title) LIKE LOWER(?) OR LOWER(u.username) LIKE LOWER(?))`;
    }

    // Tentukan sorting setelah deklarasi sql
    sql += ` ORDER BY ${orderBy} ${sort_order}`;

    // Tambahkan pagination
    sql += ` LIMIT ? OFFSET ?`;

    // Buat array parameter untuk query
    const queryParams = [];
    if (status) queryParams.push(status);
    if (service_type) queryParams.push(service_type);
    if (search) {
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern);
    }
    queryParams.push(limit, offset);

    // Jalankan query untuk mengambil data orders
    const [orders] = await db.query(sql, queryParams);

    console.log("Final Query:", sql);
    console.log("Query Params:", queryParams);

    // Query untuk menghitung total orders sesuai filter
    let countSql = `
        SELECT COUNT(*) AS total_count
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        JOIN sessions s ON o.session_id = s.session_id
        WHERE 1=1
      `;
    if (status) countSql += ` AND o.status = ?`;
    if (service_type) countSql += ` AND o.service_type = ?`;
    if (search) {
      countSql += ` AND (LOWER(s.title) LIKE LOWER(?) OR LOWER(u.username) LIKE LOWER(?))`;
    }

    // Jalankan query untuk menghitung jumlah total orders
    const [[{ total_count }]] = await db.query(countSql, queryParams);

    // Hitung total halaman
    const total_pages = Math.ceil(total_count / limit);

    res.status(200).json({
      page,
      total_pages,
      total_count,
      data: orders,
    });
  } catch (error) {
    console.error("Error saat mengambil orders:", error);
    res.status(500).json({ message: "Terjadi kesalahan, coba lagi nanti." });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { user_id, role } = req.user; // Ambil user_id dan role dari token

    // Query untuk mengambil detail order beserta informasi mentor dan session
    let sql = `
          SELECT o.order_id, o.user_id, o.session_id, o.order_date, o.status, o.total_price, o.service_type, 
                 s.title AS session_title, m.mentor_id, m.name AS mentor_name
          FROM orders o
          LEFT JOIN sessions s ON o.session_id = s.session_id
          LEFT JOIN mentors m ON s.mentor_id = m.mentor_id
          WHERE o.order_id = ?
        `;

    // Jika role user adalah "user", pastikan hanya bisa mengakses order_id miliknya sendiri
    if (role === "user") {
      sql += ` AND o.user_id = ?`;
    }

    const [order] = await db.query(
      sql,
      role === "user" ? [orderId, user_id] : [orderId]
    );

    if (order.length === 0) {
      return res
        .status(404)
        .json({ message: "Order tidak ditemukan", status: "error" });
    }

    // Mengembalikan detail order beserta informasi mentor
    res.status(200).json({
      message: "Detail order berhasil ditemukan",
      status: "success",
      data: order[0],
    });
  } catch (error) {
    console.error("Error saat mengambil detail order:", error);
    res.status(500).json({
      message: "Terjadi kesalahan, coba lagi nanti.",
      status: "error",
    });
  }
};

// Update data order (Hanya Admin)
exports.updateOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { role } = req.user;
    const { status, session_id, total_price, order_date, service_type } =
      req.body;

    // Hanya admin yang boleh mengupdate order
    if (role !== "admin") {
      return res.status(403).json({
        message: "Akses ditolak, hanya admin yang dapat mengupdate order.",
      });
    }

    // Ambil data order yang ada di database
    const [existingOrder] = await db.query(
      "SELECT * FROM orders WHERE order_id = ?",
      [orderId]
    );

    if (existingOrder.length === 0) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    const currentOrder = existingOrder[0]; // Data order saat ini di DB
    const updates = {}; // Objek untuk menyimpan data yang berubah

    // Jika status diubah, validasi dulu
    if (status && status !== currentOrder.status) {
      const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Status tidak valid!" });
      }
      updates.status = status;
    }

    // Jika total_price, order_date diubah
    if (total_price && total_price !== currentOrder.total_price)
      updates.total_price = total_price;
    if (order_date && order_date !== currentOrder.order_date)
      updates.order_date = order_date;

    // **Jika session_id diubah, update juga service_type**
    if (session_id && session_id !== currentOrder.session_id) {
      // Cek apakah session_id baru ada di database
      const [newSessionData] = await db.query(
        "SELECT service_type FROM sessions WHERE session_id = ?",
        [session_id]
      );

      if (newSessionData.length === 0) {
        return res
          .status(400)
          .json({ message: "Session ID baru tidak ditemukan!" });
      }

      const newServiceType = newSessionData[0].service_type;

      // Update session_id dan service_type
      updates.session_id = session_id;
      updates.service_type = newServiceType;
    }

    // Jika tidak ada perubahan data, return error
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Tidak ada perubahan yang dilakukan (nilai sama atau kosong).",
      });
    }

    // Bangun query UPDATE secara dinamis
    const updateFields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const updateValues = Object.values(updates);
    updateValues.push(orderId);

    const sql = `UPDATE orders SET ${updateFields} WHERE order_id = ?`;
    const [result] = await db.query(sql, updateValues);

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Gagal memperbarui order." });
    }

    res.status(200).json({
      message: "Order berhasil diperbarui!",
      updated_fields: updates,
    });
  } catch (error) {
    console.error("Error saat mengupdate order:", error);
    res.status(500).json({ message: "Terjadi kesalahan, coba lagi nanti." });
  }
};

// Delete Order
exports.deleteOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { role } = req.user; // Ambil role dari token

    // Hanya admin yang bisa menghapus order
    if (role !== "admin") {
      return res.status(403).json({
        message: "Akses ditolak, hanya admin yang bisa menghapus order.",
      });
    }

    // Cek apakah order ada
    const [order] = await db.query("SELECT * FROM orders WHERE order_id = ?", [
      orderId,
    ]);
    if (order.length === 0) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    // Hapus order dari tabel orders saja, tidak menyentuh sessions atau users
    const sql = "DELETE FROM orders WHERE order_id = ?";
    await db.query(sql, [orderId]);

    res.status(200).json({ message: "Order berhasil dihapus!" });
  } catch (error) {
    console.error("Error saat menghapus order:", error);
    res.status(500).json({ message: "Terjadi kesalahan, coba lagi nanti." });
  }
};
