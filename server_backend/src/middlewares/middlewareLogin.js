const jwt = require("jsonwebtoken");

// Middleware untuk memastikan pengguna sudah login
const verifyLogin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Anda belum login. Token tidak dapat ditemukan",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token tidak valid atau sudah kadaluwarsa",
    });
  }
};

module.exports = { verifyLogin };
