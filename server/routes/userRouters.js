import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  createUser,
  getUserData, 
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  storeRecentSearch 
} from "../controllers/userController.js";

const userRouter = express.Router();

// User CRUD operations
userRouter.get("/", protect, getUserData);           // Get current user data
userRouter.post("/", protect, createUser);           // Create user (admin only)
userRouter.get("/all", protect, getAllUsers);        // Get all users (admin only)
userRouter.get("/:id", protect, getUserById);        // Get user by ID
userRouter.put("/:id", protect, updateUser);         // Update user
userRouter.delete("/:id", protect, deleteUser);      // Delete user (admin only)

// Additional operations
userRouter.post("/store-recent-search", protect, storeRecentSearch);

export default userRouter;