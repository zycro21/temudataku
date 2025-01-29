const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/userController");
const { verifyLogin } = require("../middlewares/middlewareLogin");
const { verifyRole } = require("../middlewares/middlewareValidateRole");
const {
  checkTokenBlacklist,
} = require("../middlewares/middlewareBlacklistToken");
const upload = require("../middlewares/middlewareUploadImage");

// Route
router.post(
  "/createSession",
  verifyLogin,
  checkTokenBlacklist,
  verifyRole(["admin", "mentor"])
);

module.exports = router;
