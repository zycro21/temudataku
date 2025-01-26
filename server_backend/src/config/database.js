const mysql = require("mysql2/promise");

// Pool connection
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "database_temudataku",
});

// Check Koneksi Awal
async function checkDatabaseConnection() {
  try {
    await db.query("SELECT 1");
    console.log("Koneksi ke Database Berhasil");
  } catch (error) {
    console.error("Koneksi ke Database Gagal: ", error.code);
  }
}

checkDatabaseConnection();

// Event Listener setiap Koneksi Baru dari Pool
db.on("connection", (connection) => {
  console.log(
    "Koneksi baru telah berhasil dibuat dengan ID:",
    connection.threadId
  );
});

module.exports = db;
