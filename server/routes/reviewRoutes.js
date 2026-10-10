import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createReview,
  getAllReviews,
  getCottageReviews,
  getRoomReviews,
  getUserReviews,
  getReviewById,
  updateReview,
  respondToReview,
  markReviewHelpful,
  deleteReview
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

// Review CRUD operations
reviewRouter.get("/", getAllReviews);                             // Get all reviews (public)
reviewRouter.get("/cottage", getCottageReviews);                  // Get cottage reviews with stats (public)
reviewRouter.get("/room/:roomId", getRoomReviews);                // Get room reviews (public)
reviewRouter.get("/user", protect, getUserReviews);               // Get user's reviews (guest)
reviewRouter.get("/:id", getReviewById);                          // Get review by ID (public)

// Create review — authenticated; author must own the booking (see createReview)
reviewRouter.post("/", protect, createReview);

reviewRouter.put("/:id", protect, updateReview);                 // Update review (owner only)
reviewRouter.put("/:id/respond", protect, respondToReview);       // Admin respond to review (admin)
reviewRouter.post("/:id/helpful", markReviewHelpful);             // Mark review helpful (public)
reviewRouter.delete("/:id", protect, deleteReview);              // Delete review (owner/admin)

export default reviewRouter;
