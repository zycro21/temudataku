const db = require("../config/database");

// Middleware untuk memeriksa apakah token ada di blacklist
const checkTokenBlacklist = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token tidak dapat ditemukan",
    });
  }

  try {
    // Cek apakah token ada di blacklist
    const [rows] = await db.query(
      "SELECT * FROM blacklisted_tokens WHERE token = ?",
      [token]
    );

    if (rows.length > 0) {
      return res.status(401).json({ message: "Token sudah dibatalkan" });
    }

    next(); // Jika token tidak ada di blacklist, lanjutkan ke route berikutnya
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat memeriksa token" });
  }
};

module.exports = {checkTokenBlacklist};