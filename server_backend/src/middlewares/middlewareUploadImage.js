const multer = require("multer");
const path = require("path");

// Lokasi dan Nama file yang akan diupload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "image_user/");
  },
  filename: (req, file, cb) => {
    // ambil user_id dari token yang sudah di decode
    const user_id = req.user.user_id;
    const dateNow = new Date().toISOString().replace(/[:.]/g, "-"); // Format Tanggal
    const extName = path.extname(file.originalname); // Ekstensi File Asli (misal jpg atau png)

    const filename = `${user_id}-${dateNow}${extName}`;

    cb(null, filename);
  },
});

// Konfigurasi Upload
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);

    if (extname && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error("Hanya File Gambar Yang Diizinkan Untuk Diupload"));
    }
  },
}).single("image"); // Hanya Mengizinkan 1 upload file gambar setiap request

module.exports = upload;
