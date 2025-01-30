const jwt = require("jsonwebtoken");

const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    const { role } = req.user;
    console.log("User role:", role); // Menampilkan role user

    // Cek apakah role pengguna termasuk dalam role yang diizinkan untuk mengakses
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: "Akses Ditolak. Anda tidak memiliki izin",
      });
    }
    next();
  };
};

module.exports = { verifyRole };
