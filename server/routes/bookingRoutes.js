import express from 'express';
import { 
  checkAvailabilityAPI, 
  createBooking, 
  createChatbotBooking,
  getAllBookings,
  getUserBookings,
  getDashboardBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  confirmBooking,
  deleteBooking
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const bookingRouter = express.Router();

// Booking CRUD operations
bookingRouter.post('/check-availability', checkAvailabilityAPI);  // Check availability (public)
bookingRouter.post('/book', protect, createBooking);              // Create booking (guest)
bookingRouter.post('/chatbot-book', createChatbotBooking);        // Create booking from AI chatbot (public)
bookingRouter.get('/', protect, getAllBookings);                  // Get all bookings (admin)
bookingRouter.get('/user', protect, getUserBookings);             // Get user's bookings (guest)
bookingRouter.get('/dashboard', protect, getDashboardBookings);   // Get dashboard data (admin)
bookingRouter.get('/:id', protect, getBookingById);               // Get booking by ID
bookingRouter.put('/:id', protect, updateBooking);                // Update booking
bookingRouter.put('/:id/cancel', protect, cancelBooking);         // Cancel booking
bookingRouter.put('/:id/confirm', protect, confirmBooking);       // Confirm booking (admin)
bookingRouter.delete('/:id', protect, deleteBooking);             // Delete booking (admin)

export default bookingRouter;