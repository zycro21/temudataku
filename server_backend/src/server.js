const app = require("./app");
const PORT = 8000;

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server Berjalan di Port ${PORT}`);
});
