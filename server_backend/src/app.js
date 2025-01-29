const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

const userRoutes = require("./routes/userRoutes");
const sessionRoutes = require("./routes/sessionRoutes");

// Konfigurasi CORS
const corsOptions = {
  origin: "http://localhost:3000", // Ganti dengan frontend yang berjalan di localhost:3000
  credentials: true, // Memungkinkan pengiriman cookie
};

app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
// Tes API
app.get("/", (req, res) => {
  res.send("Server Backend Berhasil Diakses");
});

// Route Utama
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);

// Route untuk akses image user
app.use("/image_user", express.static(path.join(__dirname, "../image_user")));

// Export app untuk digunakan di server.js
module.exports = app;
