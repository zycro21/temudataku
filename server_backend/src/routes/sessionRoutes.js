const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");
const { verifyLogin } = require("../middlewares/middlewareLogin");
const { verifyRole } = require("../middlewares/middlewareValidateRole");
const {
  checkTokenBlacklist,
} = require("../middlewares/middlewareBlacklistToken");

// Route
router.post(
  "/createSession",
  verifyLogin,
  checkTokenBlacklist,
  verifyRole(["admin","mentor"]),
  sessionController.createSession
);

router.get(
  "/getAllSessions",
  verifyLogin,
  checkTokenBlacklist,
  sessionController.getAllSession
);

router.get(
  "/getSessionById/:id",
  verifyLogin,
  checkTokenBlacklist,
  sessionController.getSessionById
);

router.put(
  "/updateSessionById/:id",
  verifyLogin,
  checkTokenBlacklist,
  verifyRole(["admin", "mentor"]),
  sessionController.updateSessionById
);

router.delete(
  "/deleteSessionById/:id",
  verifyLogin,
  checkTokenBlacklist,
  verifyRole(["admin"]),
  sessionController.deleteSessionById
);

module.exports = router;
