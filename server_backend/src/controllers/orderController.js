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
    const { user_id, session_ids, status } = req.body;
    const { role, user_id: loggedInUserId } = req.user;

    // Pastikan session_ids berupa array dan tidak kosong
    if (!Array.isArray(session_ids) || session_ids.length === 0) {
      return res.status(400).json({
        message: "Session ID harus berupa array dan minimal 1 sesi",
      });
    }

    // Jika role adalah "user", pastikan dia hanya bisa membuat order untuk dirinya sendiri
    if (role === "user" && user_id !== loggedInUserId) {
      return res.status(403).json({
        message: "Anda hanya bisa membuat order untuk diri sendiri",
      });
    }

    // Jika bukan admin, pastikan status hanya bisa "pending"
    if (role !== "admin" && status !== "pending") {
      return res.status(403).json({
        message: "Anda tidak memiliki izin untuk mengatur status order",
      });
    }

    // Ambil data sesi berdasarkan session_ids
    const placeholders = session_ids.map(() => "?").join(",");
    const [sessions] = await db.query(
      `SELECT session_id, service_type, price FROM sessions WHERE session_id IN (${placeholders})`,
      session_ids
    );

    // Pastikan semua session ditemukan
    if (sessions.length !== session_ids.length) {
      return res.status(400).json({ message: "Beberapa sesi tidak ditemukan" });
    }

    // Hitung total harga dari semua sesi yang diorder (pastikan harga dikonversi ke angka)
    const total_price = sessions.reduce(
      (sum, session) => sum + Number(session.price),
      0
    );

    // Pastikan formatnya benar sebagai angka desimal, bukan string
    const formattedTotalPrice = parseFloat(total_price.toFixed(2));

    // Pastikan semua sesi memiliki jenis layanan yang sama
    const service_types = [...new Set(sessions.map((s) => s.service_type))];
    if (service_types.length !== 1) {
      return res.status(400).json({
        message: "Semua sesi dalam order harus memiliki service type yang sama",
      });
    }

    const service_type = service_types[0];

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

    let newNumber = 1;
    if (lastOrder.length > 0) {
      const lastOrderId = lastOrder[0].order_id;
      const lastNumber = parseInt(lastOrderId.split("-").pop(), 10);
      newNumber = lastNumber + 1;
    }

    const order_id = `${orderPrefix}${String(newNumber).padStart(4, "0")}`;

    await db.query(
      `INSERT INTO orders (order_id, user_id, order_date, status, service_type, total_price)
       VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, ?)`,
      [order_id, user_id, status, service_type, formattedTotalPrice]
    );

    // Insert ke `order_details` (hubungan antara order & sesi)
    const orderDetailSql = `
      INSERT INTO order_details (order_id, session_id)
      VALUES ${session_ids.map(() => "(?, ?)").join(", ")}
    `;

    const orderDetailParams = [];
    session_ids.forEach((session_id) => {
      orderDetailParams.push(order_id, session_id);
    });

    await db.query(orderDetailSql, orderDetailParams);

    res.status(201).json({
      message: "Order Berhasil Dibuat",
      order_id,
      total_price,
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
      return res.status(403).json({
        message: "Akses ditolak, hanya admin yang bisa mengakses.",
        status: "error",
      });
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
    if (sort_by === "total_price") orderBy = "o.total_price";

    // Ambil daftar order_id unik untuk pagination
    let baseFilter = `FROM orders o WHERE 1=1`;
    const queryParams = [];

    if (status) {
      baseFilter += ` AND o.status = ?`;
      queryParams.push(status);
    }

    if (service_type) {
      baseFilter += ` AND o.service_type = ?`;
      queryParams.push(service_type);
    }

    if (search) {
      baseFilter += ` AND EXISTS (
        SELECT 1 FROM order_details od
        JOIN sessions s ON od.session_id = s.session_id
        JOIN users u ON o.user_id = u.user_id
        WHERE od.order_id = o.order_id
        AND (LOWER(s.title) LIKE LOWER(?) OR LOWER(u.username) LIKE LOWER(?))
      )`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern);
    }

    // Query pagination untuk order_id unik
    const orderIdsQuery = `
      SELECT o.order_id
      ${baseFilter}
      ORDER BY ${orderBy} ${sort_order}
      LIMIT ? OFFSET ?
    `;
    queryParams.push(limit, offset);

    const [orderIds] = await db.query(orderIdsQuery, queryParams);
    const orderIdsList = orderIds.map((o) => o.order_id);

    if (orderIdsList.length === 0) {
      return res.json({
        message: "Tidak ada order ditemukan",
        status: "success",
        data: [],
      });
    }

    // Ambil detail berdasarkan order_id yang sudah difilter
    const ordersQuery = `
      SELECT o.order_id, o.user_id, o.order_date, o.status, 
             CAST(o.total_price AS UNSIGNED) AS total_price, o.service_type,
             u.username,
             od.session_id, s.title AS session_title, m.name AS mentor_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_details od ON o.order_id = od.order_id
      LEFT JOIN sessions s ON od.session_id = s.session_id
      LEFT JOIN mentors m ON s.mentor_id = m.mentor_id
      WHERE o.order_id IN (?)
      ORDER BY o.order_date ${sort_order};
    `;

    const [ordersData] = await db.query(ordersQuery, [orderIdsList]);

    // Gabungkan sesi berdasarkan order_id
    const ordersMap = new Map();
    ordersData.forEach((order) => {
      if (!ordersMap.has(order.order_id)) {
        ordersMap.set(order.order_id, {
          order_id: order.order_id,
          user_id: order.user_id,
          order_date: order.order_date,
          status: order.status,
          total_price: order.total_price,
          service_type: order.service_type,
          username: order.username,
          sessions: [],
        });
      }

      if (order.session_id) {
        ordersMap.get(order.order_id).sessions.push({
          session_id: order.session_id,
          session_title: order.session_title,
          mentor_name: order.mentor_name,
        });
      }
    });

    // Hitung total orders sesuai filter tanpa LIMIT
    const countQuery = `SELECT COUNT(DISTINCT o.order_id) AS total_count ${baseFilter}`;
    const [[{ total_count }]] = await db.query(
      countQuery,
      queryParams.slice(0, -2)
    );

    // Hitung total halaman
    const total_pages = Math.ceil(total_count / limit);

    res.status(200).json({
      message: "Daftar order berhasil ditemukan",
      status: "success",
      page: Number(page),
      total_pages,
      total_count,
      data: Array.from(ordersMap.values()),
    });
  } catch (error) {
    console.error("Error saat mengambil orders:", error);
    res.status(500).json({
      message: "Terjadi kesalahan, coba lagi nanti.",
      status: "error",
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { user_id, role } = req.user; // Ambil user_id dan role dari token

    console.log(orderId);

    // Query untuk mengambil detail order beserta informasi mentor dan session
    let sql = `
        SELECT o.order_id, o.user_id, od.session_id, o.order_date, o.status, CAST(o.total_price AS UNSIGNED) AS total_price, o.service_type, 
              s.title AS session_title, m.mentor_id, m.name AS mentor_name
        FROM orders o
        LEFT JOIN order_details od ON o.order_id = od.order_id
        LEFT JOIN sessions s ON od.session_id = s.session_id
        LEFT JOIN mentors m ON s.mentor_id = m.mentor_id
        WHERE o.order_id = ?
    `;

    // Jika role user adalah "user", pastikan hanya bisa mengakses order_id miliknya sendiri
    if (role === "user") {
      sql += ` AND o.user_id = ?`;
    }

    const [orderDetails] = await db.query(
      sql,
      role === "user" ? [orderId, user_id] : [orderId]
    );

    if (orderDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "Order tidak ditemukan", status: "error" });
    }

    // Gabungkan data sesi berdasarkan order_id
    const order = {
      order_id: orderDetails[0].order_id,
      user_id: orderDetails[0].user_id,
      order_date: orderDetails[0].order_date,
      status: orderDetails[0].status,
      total_price: orderDetails[0].total_price,
      service_type: orderDetails[0].service_type,
      sessions: orderDetails.map((detail) => ({
        session_id: detail.session_id,
        session_title: detail.session_title,
        mentor_name: detail.mentor_name,
      })),
    };

    // Mengembalikan detail order beserta informasi mentor
    res.status(200).json({
      message: "Detail order berhasil ditemukan",
      status: "success",
      data: order,
    });
  } catch (error) {
    console.error("Error saat mengambil detail order:", error);
    res.status(500).json({
      message: "Terjadi kesalahan, coba lagi nanti.",
      status: "error",
    });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const { user_id } = req.user; // Hanya ambil user_id dari token

    // Query untuk mengambil daftar order beserta informasi mentor dan session
    const sql = `
      SELECT o.order_id, o.user_id, od.session_id, o.order_date, o.status, CAST(o.total_price AS UNSIGNED) AS total_price, o.service_type, 
             s.title AS session_title, m.mentor_id, m.name AS mentor_name
      FROM orders o
      LEFT JOIN order_details od ON o.order_id = od.order_id
      LEFT JOIN sessions s ON od.session_id = s.session_id
      LEFT JOIN mentors m ON s.mentor_id = m.mentor_id
      WHERE o.user_id = ?
    `;

    const [orderDetails] = await db.query(sql, [user_id]);

    if (orderDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "Order tidak ditemukan", status: "error" });
    }

    // Gabungkan data sesi berdasarkan order_id
    const orders = orderDetails.reduce((result, detail) => {
      let order = result.find((o) => o.order_id === detail.order_id);

      if (!order) {
        order = {
          order_id: detail.order_id,
          user_id: detail.user_id,
          order_date: detail.order_date,
          status: detail.status,
          total_price: detail.total_price,
          service_type: detail.service_type,
          sessions: [],
        };
        result.push(order);
      }

      order.sessions.push({
        session_id: detail.session_id,
        session_title: detail.session_title,
        mentor_name: detail.mentor_name,
      });

      return result;
    }, []);

    res.status(200).json({
      message: "Daftar order berhasil ditemukan",
      status: "success",
      data: orders,
    });
  } catch (error) {
    console.error("Error saat mengambil daftar order:", error);
    res.status(500).json({
      message: "Terjadi kesalahan, coba lagi nanti.",
      status: "error",
    });
  }
};

exports.updateOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { role } = req.user;
    const { status, session_ids, total_price, order_date } = req.body;

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

    // Jika session_ids diubah, update relasi ke order_details
    if (
      session_ids &&
      JSON.stringify(session_ids) !== JSON.stringify(currentOrder.session_ids)
    ) {
      // Cek apakah semua session_id baru ada di database
      const placeholders = session_ids.map(() => "?").join(",");
      const [sessions] = await db.query(
        `SELECT session_id, service_type FROM sessions WHERE session_id IN (${placeholders})`,
        session_ids
      );

      // Pastikan semua session ditemukan
      if (sessions.length !== session_ids.length) {
        return res
          .status(400)
          .json({ message: "Beberapa sesi tidak ditemukan" });
      }

      // Ambil service_type dari sesi pertama (semua sesi harus memiliki service_type yang sama)
      const service_types = [...new Set(sessions.map((s) => s.service_type))];
      if (service_types.length !== 1) {
        return res.status(400).json({
          message:
            "Semua sesi dalam order harus memiliki service type yang sama",
        });
      }

      const newServiceType = service_types[0];

      // Update service_type di tabel orders (tidak perlu update session_ids)
      updates.service_type = newServiceType;

      // Hapus data di tabel order_details yang lama
      await db.query("DELETE FROM order_details WHERE order_id = ?", [orderId]);

      // Insert data order_details yang baru
      const orderDetailSql = `
        INSERT INTO order_details (order_id, session_id)
        VALUES ${session_ids.map(() => "(?, ?)").join(", ")}
      `;
      const orderDetailParams = [];
      session_ids.forEach((session_id) => {
        orderDetailParams.push(orderId, session_id);
      });

      await db.query(orderDetailSql, orderDetailParams);
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
