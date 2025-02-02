const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyLogin } = require("../middlewares/middlewareLogin");
const { verifyRole } = require("../middlewares/middlewareValidateRole");
const {
  checkTokenBlacklist,
} = require("../middlewares/middlewareBlacklistToken");

router.post(
  "/createOrder",
  verifyLogin,
  checkTokenBlacklist,
  verifyRole(["admin", "user"]),
  orderController.createOrder
);

router.get(
  "/getAllOrders",
  verifyLogin,
  checkTokenBlacklist,
  verifyRole(["admin"]),
  orderController.getAllOrders
);

router.get(
  "/getOrderById/:orderId",
  verifyLogin,
  checkTokenBlacklist,
  verifyRole(["admin", "user"]),
  orderController.getOrderById
);

router.put(
  "/updateOrderById/:orderId",
  verifyLogin,
  checkTokenBlacklist,
  verifyRole(["admin"]),
  orderController.updateOrderById
);

router.delete(
  "/deleteOrderById/:orderId",
  verifyLogin,
  checkTokenBlacklist,
  verifyRole(["admin"]),
  orderController.deleteOrderById
);

module.exports = router;
