import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  createRoom,
  getRooms,
  getAllRooms,
  getAdminRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  toggleRoomAvailability
} from "../controllers/roomController.js";

const roomRouter = express.Router();

// Room CRUD operations
roomRouter.get("/", getRooms);                                                   // Get available rooms (public)
roomRouter.get("/all", getAllRooms);                                             // Get all rooms (public)
roomRouter.get("/admin", protect, getAdminRooms);                                // Get admin rooms (admin only)
roomRouter.get("/:id", getRoomById);                                             // Get room by ID (public)
roomRouter.post("/", protect, upload.array("images", 5), createRoom);            // Create room (admin only)
roomRouter.put("/:id", protect, upload.array("images", 5), updateRoom);          // Update room (admin only)
roomRouter.delete("/:id", protect, deleteRoom);                                  // Delete room (admin only)
roomRouter.post("/toggle-availability", protect, toggleRoomAvailability);        // Toggle availability (admin only)

export default roomRouter;
