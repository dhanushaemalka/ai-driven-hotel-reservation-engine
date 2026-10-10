import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createExperience,
  getAllExperiences,
  getActiveExperiences,
  getExperiencesByCategory,
  getExperienceById,
  updateExperience,
  toggleExperienceStatus,
  updateExperienceRating,
  deleteExperience
} from "../controllers/experienceController.js";

const experienceRouter = express.Router();

// Public routes
experienceRouter.get("/", getActiveExperiences);                    // GET all active experiences
experienceRouter.get("/category/:category", getExperiencesByCategory); // GET by category
experienceRouter.get("/:id", getExperienceById);                   // GET single experience

// Admin routes (protected)
experienceRouter.get("/admin/all", protect, getAllExperiences);     // GET all experiences (including inactive)
experienceRouter.post("/", protect, createExperience);              // CREATE experience
experienceRouter.put("/:id", protect, updateExperience);            // UPDATE experience
experienceRouter.put("/:id/toggle", protect, toggleExperienceStatus); // Toggle active status
experienceRouter.put("/:id/rating", protect, updateExperienceRating); // Update rating
experienceRouter.delete("/:id", protect, deleteExperience);         // DELETE experience

export default experienceRouter;
