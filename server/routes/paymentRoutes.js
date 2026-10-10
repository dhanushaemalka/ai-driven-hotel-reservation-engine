import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createPayment,
  getAllPayments,
  getUserPayments,
  getDashboardPayments,
  getPaymentByBooking,
  getPaymentById,
  updatePayment,
  confirmPayment,
  refundPayment,
  cancelPayment,
  deletePayment
} from "../controllers/paymentController.js";

const paymentRouter = express.Router();

// Payment CRUD operations
paymentRouter.get("/", protect, getAllPayments);                       // Get all payments (admin)
paymentRouter.get("/user", protect, getUserPayments);                  // Get user's payments (guest)
paymentRouter.get("/dashboard", protect, getDashboardPayments);        // Get dashboard data (admin)
paymentRouter.get("/booking/:bookingId", protect, getPaymentByBooking);// Get payment by booking
paymentRouter.get("/:id", protect, getPaymentById);                    // Get payment by ID
paymentRouter.post("/", protect, createPayment);                       // Create payment (guest/admin)
paymentRouter.put("/:id", protect, updatePayment);                     // Update payment (admin)
paymentRouter.put("/:id/confirm", protect, confirmPayment);            // Confirm cash payment (admin)
paymentRouter.put("/:id/refund", protect, refundPayment);              // Process refund (admin)
paymentRouter.put("/:id/cancel", protect, cancelPayment);              // Cancel pending payment
paymentRouter.delete("/:id", protect, deletePayment);                  // Delete payment (admin - failed/cancelled only)

export default paymentRouter;
