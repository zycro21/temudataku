const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { verifyLogin } = require("../middlewares/middlewareLogin");
const { verifyRole } = require("../middlewares/middlewareValidateRole");
const {
  checkTokenBlacklist,
} = require("../middlewares/middlewareBlacklistToken");

router.post(
  "/createReviews",
  verifyLogin,
  checkTokenBlacklist,
  verifyRole(["admin", "user"]),
  reviewController.createReview
);

router.get(
  "/getAllReviews",
  verifyLogin,
  checkTokenBlacklist,
  verifyRole(["admin"]),
  reviewController.getAllReviews
);

router.get(
  "/getReviewById/:review_id",
  verifyLogin,
  checkTokenBlacklist,
  reviewController.getReviewsByReviewId
);

router.put(
  "/updateReviewById/:review_id",
  verifyLogin,
  checkTokenBlacklist,
  verifyRole(["admin", "user"]),
  reviewController.updateReview
);

router.delete(
  "/deleteReviewById/:review_id",
  verifyLogin,
  checkTokenBlacklist,
  verifyRole(["admin"]),
  reviewController.deleteReview
);

module.exports = router;
