const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyLogin } = require("../middlewares/middlewareLogin");
const { verifyRole } = require("../middlewares/middlewareValidateRole");
const {
  checkTokenBlacklist,
} = require("../middlewares/middlewareBlacklistToken");
const upload = require("../middlewares/middlewareUploadImage");

// Route
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get(
  "/getAllUsers",
  verifyLogin,
  checkTokenBlacklist,
  verifyRole(["admin"]),
  userController.getAllProfiles
);
router.get(
  "/getUser/:user_id",
  verifyLogin,
  checkTokenBlacklist,
  userController.getUserById
);
router.get(
  "/getMentorProfile/:user_id",
  verifyLogin,
  checkTokenBlacklist,
  userController.getMentorProfile
);
router.put(
  "/updateUser/:user_id",
  verifyLogin,
  checkTokenBlacklist,
  upload,
  userController.updateUserProfile
);
router.post("/request-reset-password", userController.requestResetPassword);
router.post("/reset-password", userController.resetPassword);
router.post("/logout", verifyLogin, userController.logout);
router.delete(
  "/deleteUser/:user_id",
  verifyLogin,
  checkTokenBlacklist,
  verifyRole(["admin"]),
  userController.deleteUserById
);

module.exports = router;
