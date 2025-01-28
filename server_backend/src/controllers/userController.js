const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { body, validationResult } = require("express-validator");
const db = require("../config/database");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const RESET_PASSWORD_TOKEN_SECRET = process.env.RESET_PASSWORD_TOKEN_SECRET;
const RESET_PASSWORD_EXPIRATION = "1h";

// Register User, Mentor, atau Admin
exports.registerUser = [
  // Validasi Email
  body("email")
    .isEmail()
    .withMessage("Gunakan Format Email yang Valid")
    .custom(async (value) => {
      const sql = "SELECT * FROM users WHERE email = ?";
      const [results] = await db.query(sql, [value]);
      if (results.length > 0) {
        throw new Error("Email Sudah Pernah Digunakan, Gunakan Email Lain");
      }
    })
    .notEmpty()
    .withMessage("Email Wajib Diisi"),

  // Validasi Username
  body("username").notEmpty().withMessage("Username Wajib Diisi"),

  // Validasi Password
  body("password")
    .notEmpty()
    .withMessage("Password Wajib Diisi")
    .isLength({ min: 8 })
    .withMessage("Password Minimal 8 Karakter")
    .matches(/\d/)
    .withMessage("Password Harus Mengandung Angka")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password Harus Mengandung Simbol"),

  // Validasi Role
  body("role").custom(async (value, { req }) => {
    if (value === "admin") {
      // Cek Jika Admin Sudah Lebih dari 3 orang
      const sql = "SELECT COUNT(*) AS count FROM users WHERE role = 'admin'";
      const [results] = await db.query(sql);

      if (results[0].count >= 3) {
        throw new Error("Jumlah admin sudah mencapai batas maksimum (3 Orang)");
      }
    }

    if (value === "mentor") {
      // Role mentor hanya bisa dibuat oleh admin
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new Error("Harus Login Sebagai Admin Untuk Membuat Role Mentor");
      }
      const decodedToken = jwt.verify(token, JWT_SECRET);
      if (decodedToken.role !== "admin") {
        throw new Error("Hanya Admin yang Bisa Membuat Akun Mentor");
      }
    }
    return true;
  }),

  // Fungsi Register
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { email, username, password, role } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate User ID berdasarkan Role
      const userIdPrefix =
        role === "admin" ? "Admin-" : role === "mentor" ? "Mentor-" : "User-";
      const userId = `${userIdPrefix}${uuidv4()}`;

      // Ambil waktu saat ini untuk created_at dan updated_at
      const currentTimestamp = new Date();

      // Insert user ke tabel users
      const sql =
        "INSERT INTO users (user_id, email, username, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
      await db.query(sql, [
        userId,
        email,
        username,
        hashedPassword,
        role || "user",
        currentTimestamp,
        currentTimestamp,
      ]);

      // Jika role adalah mentor, otomatis buatkan entry di tabel mentors
      if (role === "mentor") {
        // Cari mentor_id terakhir
        const mentorSql =
          "SELECT mentor_id FROM mentors ORDER BY mentor_id DESC LIMIT 1";
        const [mentorResults] = await db.query(mentorSql);

        let newMentorId = "mentor-101"; // Default mentor-101 jika belum ada data mentor

        if (mentorResults.length > 0) {
          // Ambil angka terakhir dari mentor_id
          const lastMentorId = mentorResults[0].mentor_id;
          const lastNumber = parseInt(lastMentorId.split("-")[1], 10);
          newMentorId = `mentor-${lastNumber + 1}`;
        }

        // Insert mentor ke tabel mentors hanya dengan user_id dan mentor_id
        const mentorInsertSql =
          "INSERT INTO mentors (mentor_id, user_id) VALUES (?, ?)";
        await db.query(mentorInsertSql, [newMentorId, userId]);
      }

      return res.status(201).json({
        message: "User Berhasil Terdaftar",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi Kesalahan Saat Membuat User",
      });
    }
  },
];

// Login User, Mentor, atau Admin
exports.loginUser = [
  body("emailOrUsername")
    .notEmpty()
    .withMessage("Email atau Username Wajib Diisi"),
  body("password")
    .notEmpty()
    .withMessage("Password Wajib Diisi")
    .isLength({ min: 8 })
    .withMessage("Password Minimal 8 Karakter"),

  // Fungsi Login
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { emailOrUsername, password } = req.body;

    try {
      // Cek Apakah Input adalah Username atau Email yang tersedia di Database
      const sql = "SELECT * FROM users WHERE email = ? OR username = ?";
      const [user] = await db.query(sql, [emailOrUsername, emailOrUsername]);

      if (!user || user.length === 0) {
        return res.status(404).json({
          message: "User Tidak Ditemukan",
        });
      }

      const userData = user[0];

      //   Verifikasi Password
      const isPasswordMatch = await bcrypt.compare(password, userData.password);
      if (!isPasswordMatch) {
        return res.status(400).json({
          message: "Password Salah, Masukkan Password yang Benar",
        });
      }

      // Generate JWT Token
      const token = jwt.sign(
        { user_id: userData.user_id, role: userData.role },
        JWT_SECRET,
        { expiresIn: "12h" }
      );

      return res.status(200).json({
        message: "Login Berhasil",
        token,
        user: {
          user_id: userData.user_id,
          username: userData.username,
          role: userData.role,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi Kesalahan",
        error: error.message,
      });
    }
  },
];

exports.getAllProfiles = async (req, res) => {
  const { role } = req.query;
  console.log("Role filter:", role); // Debug log untuk melihat role

  try {
    let sql = "SELECT * FROM users";
    const params = [];

    // Jika ada filter role tambahkan kondisi where
    if (role) {
      sql += " WHERE role = ?";
      params.push(role);
    }

    console.log("SQL Query:", sql); // Debug log untuk melihat query yang dijalankan
    const [users] = await db.query(sql, params);

    res.status(200).json({
      message: "Berhasil mendapatkan data pengguna",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      message: "Terjadi Kesalahan Saat Mengambil Data Pengguna",
    });
  }
};

exports.getUserById = async (req, res) => {
  const { user_id } = req.params;

  // Jika Role Bukan Admin, maka tidak bisa melihat profil pengguna lain
  if (req.user.role !== "admin" && req.user.user_id !== user_id) {
    return res.status(403).json({
      message:
        "Anda Tidak Punya Akses dan Izin Untuk Melihat Profil Pengguna Lain",
    });
  }

  try {
    // Query untuk mendapatkan user berdasarkan user_id
    const sql = "SELECT * FROM users WHERE user_id = ?";
    const [user] = await db.query(sql, [user_id]);

    if (user.length === 0) {
      return res.status(404).json({
        message: "User Tidak Dapat Ditemukan",
      });
    }

    res.status(200).json({
      message: `User dengan ID ${user[0].user_id} ditemukan`,
      data: user[0],
    });
  } catch (error) {
    console.error("Error saat mengambil data user: ", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data User",
    });
  }
};

// Controller untuk mendapatkan profil mentor
exports.getMentorProfile = async (req, res) => {
  const { mentor_id } = req.params;

  try {
    // Cari mentor berdasarkan mentor_id
    const sqlMentor = "SELECT * FROM mentors WHERE mentor_id = ?";
    const [mentorResults] = await db.query(sqlMentor, [mentor_id]);

    if (mentorResults.length === 0) {
      return res.status(404).json({
        message: "Mentor tidak ditemukan",
      });
    }

    const mentor = mentorResults[0];

    // Cari data user berdasarkan user_id yang terhubung dengan mentor_id
    const sqlUser = "SELECT * FROM users WHERE user_id = ?";
    const [userResults] = await db.query(sqlUser, [mentor.user_id]);

    if (userResults.length === 0) {
      return res.status(404).json({
        message: "Data user mentor tidak ditemukan",
      });
    }

    const user = userResults[0];

    // Kembalikan data profil mentor
    return res.status(200).json({
      mentor_id: mentor.mentor_id,
      user_id: mentor.user_id,
      username: user.username,
      email: user.email,
      profile_picture: user.image,
      name: mentor.name,
      expertise: mentor.expertise,
      bio: mentor.bio,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data profil mentor",
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  const {
    email,
    username,
    password,
    newPassword,
    oldPassword,
    expertise,
    bio,
    name,
  } = req.body;
  const { user_id } = req.user;
  const { user_id: userIdFromParam } = req.params;

  if (req.user.role !== "admin" && user_id !== userIdFromParam) {
    return res.status(403).json({
      message: "Anda hanya bisa mengupdate profil anda sendiri",
    });
  }

  // Verifikasi apakah password lama disertakan jika ada perubahan data apapun
  if (!oldPassword) {
    return res.status(400).json({
      message: "Password lama wajib disertakan untuk mengganti data apapun",
    });
  }

  try {
    // Ambil data user dari database untuk memverifikasi password lama
    const [user] = await db.query("SELECT * FROM users WHERE user_id = ?", [
      userIdFromParam, // Menggunakan ID dari parameter URL
    ]);

    if (user.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    // Verifikasi Password Lama
    const passwordMatch = await bcrypt.compare(oldPassword, user[0].password);
    if (!passwordMatch) {
      return res.status(401).json({
        message: "Password Lama Tidak Cocok",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan saat memverifikasi password",
    });
  }

  // Handle Upload Image
  let imageLink = null;

  if (req.file) {
    try {
      // Ambil data user dari database untuk mendapatkan gambar lama
      const [user] = await db.query(
        "SELECT image FROM users WHERE user_id = ?",
        [user_id]
      );

      if (user.length === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const oldImage = user[0].image; // Path lama dari database

      // Hapus gambar lama jika ada
      if (oldImage) {
        const oldImagePath = path.join(
          __dirname,
          "../..",
          oldImage.replace("/image_user", "image_user")
        );
        console.log("Gambar lama akan dihapus dari path:", oldImagePath);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Hapus file lama secara sinkron
        }
      }

      // Set link untuk gambar baru
      imageLink = `/image_user/${req.file.filename}`;
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan saat mengganti gambar",
      });
    }
  }

  // Flag untuk melacak apakah password diperbarui
  let passwordUpdated = false;

  // Validasi Password Lama dan Proses Perubahan Password Baru
  if (newPassword) {
    const passwordRegex =
      /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>-])[A-Za-z0-9!@#$%^&*(),.?":{}|<>-]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password baru harus memiliki minimal 8 karakter, angka, dan tanda baca",
      });
    }

    try {
      const [user] = await db.query("SELECT * FROM users WHERE user_id = ?", [
        user_id,
      ]);

      // Hash Password Baru dan Simpan ke Database
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await db.query("UPDATE users SET password = ? WHERE user_id = ?", [
        hashedNewPassword,
        user_id,
      ]);
      passwordUpdated = true;
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan saat memperbarui password",
      });
    }
  }

  const updateFields = {};
  const params = [];

  // Update email jika ada perubahan
  if (email && email !== "") {
    updateFields.email = email;
    params.push(email);
  }

  // Update Username jika ada perubahan
  if (username && username !== "") {
    updateFields.username = username;
    params.push(username);
  }

  // Update Image jika ada perubahan
  if (imageLink) {
    updateFields.image = imageLink;
    params.push(imageLink);
  }

  // Jika ada data yang diupdate
  if (Object.keys(updateFields).length > 0) {
    try {
      let sql = "UPDATE users SET ";
      const fields = Object.keys(updateFields);
      const setClauses = fields.map((field) => `${field} = ?`);
      sql += setClauses.join(", ");
      sql += " WHERE user_id = ?";
      params.push(userIdFromParam);

      // Update data pengguna
      await db.query(sql, params);

      // Gabungkan hasil perubahan password dengan data lainnya
      return res.status(200).json({
        message: passwordUpdated
          ? "Profil dan password telah diperbarui"
          : "Profil pengguna telah diperbarui",
        data: {
          ...updateFields,
          ...(passwordUpdated && { password: "updated" }),
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan saat memperbarui profil pengguna",
      });
    }
  }

  // Jika pengguna adalah mentor, update data di tabel mentors
  if (req.user.role === "mentor") {
    try {
      const mentorUpdateFields = {};
      const mentorParams = [];

      // Update data mentor jika ada perubahan
      if (name && name !== "") {
        mentorUpdateFields.name = name;
        mentorParams.push(name);
      }

      if (expertise && expertise !== "") {
        mentorUpdateFields.expertise = expertise;
        mentorParams.push(expertise);
      }

      if (bio && bio !== "") {
        mentorUpdateFields.bio = bio;
        mentorParams.push(bio);
      }

      // Debugging: Cek apakah ada perubahan data
      console.log("Fields yang akan diupdate di mentors:", mentorUpdateFields);

      // Pastikan data yang akan diupdate valid dan ada perubahan
      if (Object.keys(mentorUpdateFields).length > 0) {
        let sql = "UPDATE mentors SET ";
        const fields = Object.keys(mentorUpdateFields);
        const setClauses = fields.map((field) => `${field} = ?`);
        sql += setClauses.join(", ");
        sql += " WHERE user_id = ?"; // Pastikan userIdFromParam digunakan di sini
        mentorParams.push(userIdFromParam); // Gunakan userId dari parameter untuk query

        await db.query(sql, mentorParams);

        return res.status(200).json({
          message: passwordUpdated
            ? "Profil Mentor dan password telah diperbarui"
            : "Profil Mentor telah diperbarui",
          data: {
            ...mentorUpdateFields,
            ...(passwordUpdated && { password: "updated" }),
          },
        });
      } else {
        return res.status(400).json({
          message: "Tidak ada data yang diupdate di tabel mentors",
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Terjadi kesalahan saat memperbarui data mentor",
      });
    }
  }

  // Jika hanya password yang diupdate
  if (passwordUpdated) {
    return res.status(200).json({
      message: "Password berhasil diperbarui",
    });
  }

  return res.status(400).json({
    message: "Tidak ada data yang diupdate",
  });
};

const sendResetPasswordEmail = async (email, token) => {
  try {
    console.log("Sending email to:", email);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const resetLink = `${process.env.BASE_URL}/reset-password?token=${token}`;
    console.log("Reset link:", resetLink);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Permintaan Melakukan Reset Password",
      html: `
            <p>Anda menerima permintaan reset password. Klik link berikut untuk mengubah password Anda:</p>
            <a href="${resetLink}">Reset Password</a>
          `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending Email:", error);
    throw new Error("Error sending Email");
  }
};

// Controller untuk meminta reset password (Mengirimkan Email) (Langkah Kedua Reset Password)
exports.requestResetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email wajib disertakan",
    });
  }

  try {
    // Cari user berdasarkan email
    const [user] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (user.length === 0) {
      return res.status(404).json({
        message: "Email tidak ditemukan",
      });
    }

    // Generate token reset password
    const token = crypto.randomBytes(20).toString("hex");

    // Simpan token reset ke database
    await db.query(
      "UPDATE users SET reset_token = ?, reset_token_created_at = NOW() WHERE email = ?",
      [token, email]
    );

    // Kirim email dengan token reset password
    await sendResetPasswordEmail(email, token);

    return res.status(200).json({
      message: "Link reset password telah dikirim ke email Anda",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Terjadi kesalahan saat memproses permintaan reset password",
    });
  }
};

// Fungsi untuk mereset password (Langkah ketiga reset password)
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body; // Ambil password baru dari body request
  const { token: queryToken } = req.query; // Ambil token dari query parameter

  // Pastikan ada token dan password baru
  if (!queryToken || !newPassword) {
    return res.status(400).json({
      message: "Token dan Password Baru Wajib Disertakan",
    });
  }

  try {
    // Cari user berdasarkan token reset di database
    const [user] = await db.query("SELECT * FROM users WHERE reset_token = ?", [
      queryToken,
    ]);

    if (user.length === 0) {
      return res.status(400).json({
        message: "Token tidak valid, harap login ulang",
      });
    }

    // Verifikasi jika token masih berlaku
    const tokenCreationAt = user[0].reset_token_created_at;
    const now = new Date();
    const tokenExpirationTime =
      new Date(tokenCreationAt).getTime() * 60 * 60 * 1000;

    if (now.getTime() > tokenExpirationTime) {
      return res.status(400).json({
        message:
          "Token reset password telah kadaluarsa, harap ulangi langkah dari awal",
      });
    }

    // Hash password baru dan simpan ke database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_created_at = NULL WHERE user_id = ?",
      [hashedPassword, user[0].user_id]
    );

    return res.status(200).json({
      message: "Password Berhasil Diperbarui",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Terjadi kesalahan saat melakukan reset password",
    });
  }
};

// Fungsi untuk menambahkan token ke blacklist
const blacklistToken = async (token) => {
  await db.query("INSERT INTO blacklisted_tokens (token) VALUES (?)", [token]);

  // Jika sudah lebih dari 200, hapus semuanya
  const [rows] = await db.query(
    "SELECT COUNT(*) AS count FROM blacklisted_tokens"
  );
  const tokenCount = rows[0].count;

  if (tokenCount > 200) {
    await db.query("DELETE FROM blacklisted_tokens");
  }
};

// Delete User By user_id
exports.deleteUserById = async (req, res) => {
  const { user_id } = req.params;
  const { role } = req.user;

  // Hanya "admin" yang bisa menghapus user
  if (role !== "admin") {
    return res.status(400).json({
      message: "Anda tidak memiliki izin untuk menghapus user",
    });
  }

  try {
    const [user] = await db.query("SELECT * FROM users WHERE user_id = ?", [
      user_id,
    ]);

    if (user.length === 0) {
      return res.status(400).json({
        message: "User tidak dapat ditemukan",
      });
    }

    const oldImage = user[0].image;

    // Hapus file image user jika ada
    if (oldImage) {
      const oldImagePath = path.join(
        __dirname,
        "../..",
        oldImage.replace("/image_user", "image_user")
      );

      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Jika role adalah mentor, hapus data di tabel mentors terlebih dahulu
    if (user[0].role === "mentor") {
      try {
        await db.query("DELETE FROM mentors WHERE user_id = ?", [user_id]);
      } catch (error) {
        console.error("Terjadi kesalahan saat menghapus data mentor", error);
        return res.status(500).json({
          message: "Terjadi kesalahan saat menghapus data mentor",
        });
      }
    }

    // Hapus user dari DB
    await db.query("DELETE from users WHERE user_id = ?", [user_id]);

    res.status(200).json({
      message: "User berhasil dihapus",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Terjadi kesalahan saat menghapus user",
    });
  }
};

// Controller Logout
exports.logout = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(400).json({
      message: "Token tidak dapat ditemukan",
    });
  }

  try {
    await blacklistToken(token);

    return res.status(200).json({
      message: "Logout Berhasil",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Terjadi kesalahan saat logout",
    });
  }
};
