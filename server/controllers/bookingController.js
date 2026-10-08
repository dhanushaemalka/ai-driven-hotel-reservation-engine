import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import mongoose from "mongoose";

/**
 * CRITICAL: Double-booking prevention helper
 * Checks if a room is available for the given date range
 * Uses strict date overlap detection algorithm
 */
const checkAvailability = async ({ checkInDate, checkOutDate, room, excludeBookingId = null }) => {
  try {
    // Normalize dates to start of day for consistent comparison
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);

    // Validate dates
    if (checkIn >= checkOut) {
      return { available: false, error: "Check-out date must be after check-in date" };
    }

    if (checkIn < new Date().setHours(0, 0, 0, 0)) {
      return { available: false, error: "Check-in date cannot be in the past" };
    }

    /**
     * OVERLAP DETECTION ALGORITHM:
     * Two date ranges [A_start, A_end] and [B_start, B_end] overlap if:
     * A_start < B_end AND A_end > B_start
     * 
     * We find conflicting bookings where:
     * - existing.checkInDate < newCheckOutDate (existing starts before new ends)
     * - existing.checkOutDate > newCheckInDate (existing ends after new starts)
     * - Status is pending or confirmed (active bookings only)
     */
    const query = {
      room: new mongoose.Types.ObjectId(room),
      $and: [
        { checkInDate: { $lt: checkOut } },  // Existing booking starts before new checkout
        { checkOutDate: { $gt: checkIn } }   // Existing booking ends after new checkin
      ],
      status: { $in: ["pending", "confirmed"] }  // Only active bookings block availability
    };
    
    // Exclude current booking when updating
    if (excludeBookingId) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeBookingId) };
    }
    
    const conflictingBookings = await Booking.find(query).select('checkInDate checkOutDate status');
    
    if (conflictingBookings.length > 0) {
      return { 
        available: false, 
        error: "Room is already booked for these dates",
        conflicts: conflictingBookings.map(b => ({
          checkIn: b.checkInDate,
          checkOut: b.checkOutDate,
          status: b.status
        }))
      };
    }
    
    return { available: true };
  } catch (error) {
    console.error("Availability check error:", error.message);
    return { available: false, error: "Failed to check availability" };
  }
};

/**
 * Get blocked dates for a room (for calendar display)
 */
export const getBlockedDates = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const bookings = await Booking.find({
      room: roomId,
      status: { $in: ["pending", "confirmed"] },
      checkOutDate: { $gte: new Date() }
    }).select('checkInDate checkOutDate');
    
    res.json({ success: true, blockedDates: bookings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// POST /api/bookings/check-availability - Check room availability
export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    
    if (!room || !checkInDate || !checkOutDate) {
      return res.json({ success: false, message: "Room, check-in, and check-out dates are required" });
    }
    
    const result = await checkAvailability({
      checkInDate,
      checkOutDate,
      room,
    });

    res.json({ 
      success: true, 
      isAvailable: result.available,
      message: result.error || (result.available ? "Room is available" : "Room is not available"),
      conflicts: result.conflicts || []
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// POST /api/bookings/book - Create new booking
export const createBooking = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, guests, guestName, guestEmail, guestPhone, specialRequests, paymentMethod, negotiatedPrice } = req.body;
    const user = req.user._id;

    // Validate required fields
    if (!room || !checkInDate || !checkOutDate) {
      return res.json({ success: false, message: "Room, check-in, and check-out dates are required" });
    }

    // CRITICAL: Check availability before booking (double-booking prevention)
    const availabilityResult = await checkAvailability({
      checkInDate,
      checkOutDate,
      room,
    });

    if (!availabilityResult.available) {
      return res.json({
        success: false,
        message: availabilityResult.error || "Room is not available for selected dates",
        conflicts: availabilityResult.conflicts || []
      });
    }

    // Get room data for price calculation
    const roomData = await Room.findById(room);
    if (!roomData) {
      return res.json({ success: false, message: "Room not found" });
    }

    if (!roomData.isAvailable) {
      return res.json({ success: false, message: "This room is currently not available for booking" });
    }

    // Check capacity
    const guestCount = +guests || 1;
    if (guestCount > roomData.capacity) {
      return res.json({ 
        success: false, 
        message: `Room capacity is ${roomData.capacity} guests. You requested ${guestCount}.` 
      });
    }

    if (guestCount < 1) {
      return res.json({ success: false, message: "At least 1 guest is required" });
    }

    // Calculate total price based on nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);
    
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (nights < 1) {
      return res.json({ success: false, message: "Minimum stay is 1 night" });
    }

    const originalPrice = roomData.pricePerNight * nights;
    
    // Handle negotiated price from AI chatbot
    let finalPrice = originalPrice;
    let discountApplied = 0;
    
    if (negotiatedPrice && negotiatedPrice > 0) {
      // Validate negotiated price is within acceptable range (not below min negotiable)
      const minAcceptable = (roomData.minNegotiablePrice || roomData.pricePerNight * 0.8) * nights;
      if (negotiatedPrice >= minAcceptable && negotiatedPrice <= originalPrice) {
        finalPrice = negotiatedPrice;
        discountApplied = Math.round(((originalPrice - negotiatedPrice) / originalPrice) * 100);
      }
    }

    // Use atomic operation to prevent race conditions
    const booking = await Booking.create({
      user,
      room,
      guests: guestCount,
      guestName: guestName || req.user.username,
      guestEmail: guestEmail || req.user.email,
      guestPhone: guestPhone || "",
      specialRequests: specialRequests || "",
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalPrice: finalPrice,
      originalPrice,
      negotiatedPrice: negotiatedPrice || null,
      discountApplied,
      nights,
      paymentMethod: paymentMethod || "pay_at_cottage",
      source: negotiatedPrice ? "ai_chatbot" : "website",
    });

    // Double-check no conflict was created (race condition safety)
    const conflictCheck = await Booking.find({
      room,
      _id: { $ne: booking._id },
      $and: [
        { checkInDate: { $lt: checkOut } },
        { checkOutDate: { $gt: checkIn } }
      ],
      status: { $in: ["pending", "confirmed"] }
    });

    if (conflictCheck.length > 0) {
      // Rollback - delete the booking we just created
      await Booking.findByIdAndDelete(booking._id);
      return res.json({
        success: false,
        message: "Sorry, this room was just booked by another guest. Please try different dates.",
      });
    }

    res.json({
      success: true,
      booking,
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.json({
      success: false,
      message: error.message || "Failed to create booking",
    });
  }
};

// POST /api/bookings/chatbot-book - Create new booking from AI chatbot (public)
export const createChatbotBooking = async (req, res) => {
  try {
    const {
      userId,
      room,
      checkInDate,
      checkOutDate,
      guests,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests,
      paymentMethod,
      negotiatedPrice,
    } = req.body;

    if (!userId || !room || !checkInDate || !checkOutDate || !guestEmail) {
      return res.json({
        success: false,
        message: "userId, room, check-in, check-out, and guestEmail are required",
      });
    }

    const availabilityResult = await checkAvailability({
      checkInDate,
      checkOutDate,
      room,
    });

    if (!availabilityResult.available) {
      return res.json({
        success: false,
        message: availabilityResult.error || "Room is not available for selected dates",
        conflicts: availabilityResult.conflicts || [],
      });
    }

    const roomData = await Room.findById(room);
    if (!roomData) {
      return res.json({ success: false, message: "Room not found" });
    }

    if (!roomData.isAvailable) {
      return res.json({ success: false, message: "This room is currently not available for booking" });
    }

    const guestCount = +guests || 1;
    if (guestCount > roomData.capacity) {
      return res.json({
        success: false,
        message: `Room capacity is ${roomData.capacity} guests. You requested ${guestCount}.`,
      });
    }

    if (guestCount < 1) {
      return res.json({ success: false, message: "At least 1 guest is required" });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);

    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    if (nights < 1) {
      return res.json({ success: false, message: "Minimum stay is 1 night" });
    }

    const originalPrice = roomData.pricePerNight * nights;
    let finalPrice = originalPrice;
    let discountApplied = 0;

    if (negotiatedPrice && negotiatedPrice > 0) {
      const minAcceptable = (roomData.minNegotiablePrice || roomData.pricePerNight * 0.8) * nights;
      if (negotiatedPrice >= minAcceptable && negotiatedPrice <= originalPrice) {
        finalPrice = negotiatedPrice;
        discountApplied = Math.round(((originalPrice - negotiatedPrice) / originalPrice) * 100);
      }
    }

    const booking = await Booking.create({
      user: String(userId),
      room,
      guests: guestCount,
      guestName: guestName || "Chatbot Guest",
      guestEmail,
      guestPhone: guestPhone || "",
      specialRequests: specialRequests || "",
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalPrice: finalPrice,
      originalPrice,
      negotiatedPrice: negotiatedPrice || null,
      discountApplied,
      nights,
      paymentMethod: paymentMethod || "pay_at_cottage",
      source: "ai_chatbot",
    });

    const conflictCheck = await Booking.find({
      room,
      _id: { $ne: booking._id },
      $and: [
        { checkInDate: { $lt: checkOut } },
        { checkOutDate: { $gt: checkIn } },
      ],
      status: { $in: ["pending", "confirmed"] },
    });

    if (conflictCheck.length > 0) {
      await Booking.findByIdAndDelete(booking._id);
      return res.json({
        success: false,
        message: "Sorry, this room was just booked by another guest. Please try different dates.",
      });
    }

    return res.json({
      success: true,
      booking,
      message: "Chatbot booking created successfully",
    });
  } catch (error) {
    console.error("Chatbot booking creation error:", error);
    return res.json({
      success: false,
      message: error.message || "Failed to create chatbot booking",
    });
  }
};

// GET /api/bookings - Get all bookings (admin)
export const getAllBookings = async (req, res) => {
  try {
    // Verify admin role
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.json({ success: false, message: "Admin access required" });
    }

    const bookings = await Booking.find()
      .populate("room user")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/bookings/user - Get current user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const user = req.user._id;

    const bookings = await Booking.find({ user })
      .populate("room")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

// GET /api/bookings/dashboard - Get dashboard data (admin)
export const getDashboardBookings = async (req, res) => {
  try {
    // Verify admin role
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.json({ success: false, message: "Admin access required" });
    }

    const bookings = await Booking.find()
      .populate("room user")
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const totalRevenue = bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((acc, booking) => acc + booking.totalPrice, 0);

    res.json({
      success: true,
      dashboardData: { 
        totalBookings, 
        confirmedBookings,
        pendingBookings,
        totalRevenue, 
        bookings 
      },
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
};

// GET /api/bookings/:id - Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id)
      .populate("room user");
    
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }
    
    // Verify user owns this booking or is admin
    const currentUser = await User.findById(req.user._id);
    const isAdmin = currentUser && currentUser.role === 'admin';
    const isBookingUser = booking.user._id.toString() === req.user._id.toString();
    
    if (!isAdmin && !isBookingUser) {
      return res.json({ success: false, message: "Not authorized to view this booking" });
    }
    
    res.json({ success: true, booking });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// PUT /api/bookings/:id - Update booking
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkInDate, checkOutDate, guests, guestName, guestEmail, guestPhone, specialRequests, status, paymentMethod, isPaid } = req.body;
    
    const booking = await Booking.findById(id).populate("room");
    
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }
    
    // Verify user owns this booking or is admin
    const currentUser = await User.findById(req.user._id);
    const isAdmin = currentUser && currentUser.role === 'admin';
    const isBookingUser = booking.user.toString() === req.user._id.toString();
    
    if (!isAdmin && !isBookingUser) {
      return res.json({ success: false, message: "Not authorized to update this booking" });
    }
    
    // If dates are being changed, check availability
    if (checkInDate || checkOutDate) {
      const newCheckIn = checkInDate || booking.checkInDate;
      const newCheckOut = checkOutDate || booking.checkOutDate;
      
      const availabilityResult = await checkAvailability({
        checkInDate: newCheckIn,
        checkOutDate: newCheckOut,
        room: booking.room._id,
        excludeBookingId: id
      });
      
      if (!availabilityResult.available) {
        return res.json({ 
          success: false, 
          message: availabilityResult.error || "Room is not available for selected dates",
          conflicts: availabilityResult.conflicts || []
        });
      }
      
      // Recalculate total price
      const checkIn = new Date(newCheckIn);
      const checkOut = new Date(newCheckOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      booking.totalPrice = booking.room.pricePerNight * nights;
      booking.nights = nights;
      booking.checkInDate = checkIn;
      booking.checkOutDate = checkOut;
    }
    
    if (guests) booking.guests = +guests;
    if (guestName) booking.guestName = guestName;
    if (guestEmail) booking.guestEmail = guestEmail;
    if (guestPhone !== undefined) booking.guestPhone = guestPhone;
    if (specialRequests !== undefined) booking.specialRequests = specialRequests;
    if (status && isAdmin) booking.status = status;  // Only admin can change status
    if (paymentMethod) booking.paymentMethod = paymentMethod;
    if (typeof isPaid === 'boolean' && isAdmin) booking.isPaid = isPaid;  // Only admin can mark as paid
    
    await booking.save();
    
    res.json({ success: true, booking, message: "Booking updated successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// PUT /api/bookings/:id/cancel - Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }
    
    // Verify user owns this booking or is admin
    const currentUser = await User.findById(req.user._id);
    const isAdmin = currentUser && currentUser.role === 'admin';
    const isBookingUser = booking.user.toString() === req.user._id.toString();
    
    if (!isAdmin && !isBookingUser) {
      return res.json({ success: false, message: "Not authorized to cancel this booking" });
    }
    
    booking.status = "cancelled";
    await booking.save();
    
    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// PUT /api/bookings/:id/confirm - Confirm booking (Admin only)
export const confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify admin role
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.json({ success: false, message: "Only admin can confirm bookings" });
    }
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }
    
    booking.status = "confirmed";
    await booking.save();
    
    res.json({ success: true, message: "Booking confirmed successfully", booking });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// DELETE /api/bookings/:id - Delete booking (Admin only)
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify admin role
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.json({ success: false, message: "Only admin can delete bookings" });
    }
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }
    
    await Booking.findByIdAndDelete(id);
    
    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
