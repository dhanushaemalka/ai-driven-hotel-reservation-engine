import mongoose from "mongoose";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

// Helper function to ensure user exists
const ensureUser = (req) => {
  if (!req.user) {
    req.user = {
      _id: 'demo-user-' + Date.now(),
      email: 'demo@example.com',
      role: 'guest'
    };
  }
  return req.user;
};

// POST /api/reviews - Create a new review
export const createReview = async (req, res) => {
  try {
    const { 
      bookingId, 
      title, 
      comment, 
      rating,
      cleanlinessRating,
      serviceRating,
      locationRating,
      valueRating,
      foodRating,
      images
    } = req.body;

    if (!req.user?._id) {
      return res.json({ success: false, message: "Not authenticated" });
    }

    const reviewerId = String(req.user._id);
    
    if (!title?.trim() || !comment?.trim()) {
      return res.json({ success: false, message: "Title and comment are required" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.json({ success: false, message: "Rating must be between 1 and 5" });
    }

    if (!bookingId || bookingId === 'undefined') {
      return res.json({
        success: false,
        message: "Select the stay you are reviewing (booking is required)",
      });
    }

    const booking = await Booking.findById(bookingId).populate("room");

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    const bookingOwnerId = booking.user != null ? String(booking.user) : "";
    if (!bookingOwnerId || bookingOwnerId !== reviewerId) {
      return res.json({
        success: false,
        message: "You can only review your own completed booking",
      });
    }

    // CONSTRAINT: Guest can ONLY leave review if booking is 'completed' and checkout date has passed
    if (booking.status !== "completed") {
      return res.json({
        success: false,
        message: "You can only leave a review for completed bookings",
      });
    }

    const now = new Date();
    const checkoutDate = new Date(booking.checkOutDate);
    if (now < checkoutDate) {
      return res.json({
        success: false,
        message: "You can only leave a review after your checkout date",
      });
    }

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.json({ success: false, message: "You have already reviewed this booking" });
    }

    const roomRef = booking.room;
    const roomId =
      roomRef && typeof roomRef === "object" && roomRef._id != null
        ? roomRef._id
        : roomRef;

    if (!roomId) {
      return res.json({ success: false, message: "Booking has no room assigned" });
    }

    // Always attribute the review to the authenticated account (matches User._id / Clerk id)
    const userId = reviewerId;

    // Create the review
    const review = await Review.create({
      user: userId,
      room: roomId,
      booking: bookingId,
      rating: +rating,
      title: title.substring(0, 100),
      comment: comment.substring(0, 1000),
      cleanlinessRating: cleanlinessRating ? +cleanlinessRating : +rating,
      serviceRating: serviceRating ? +serviceRating : +rating,
      locationRating: locationRating ? +locationRating : +rating,
      valueRating: valueRating ? +valueRating : +rating,
      foodRating: foodRating ? +foodRating : +rating,
      images: images || [],
      isApproved: true,
      isVerified: !!bookingId,
      verificationSource: bookingId ? 'booking' : 'none',
    });

    // Populate for response
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'username image')
      .populate('room', 'roomType roomNumber');

    res.json({
      success: true,
      message: "Review submitted successfully",
      review: populatedReview
    });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reviews - Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .populate("user", "username image")
      .populate("room", "roomType images roomNumber")
      .sort({ createdAt: -1 });

    // Ensure all reviews have user and room objects
    const safeReviews = reviews.map(r => {
      const review = r.toObject ? r.toObject() : r;
      return {
        ...review,
        user: review.user || { _id: review.user || 'unknown', username: 'Guest', image: null },
        room: review.room || { _id: 'unknown', roomType: 'Room', images: [], roomNumber: 'N/A' }
      };
    });

    // Calculate overall stats for Cloudy Hill Cottage
    const totalReviews = safeReviews.length;
    const stats = totalReviews > 0 ? {
      averageRating: (safeReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews).toFixed(1),
      averageCleanliness: (safeReviews.reduce((acc, r) => acc + (r.cleanlinessRating || 0), 0) / totalReviews).toFixed(1),
      averageService: (safeReviews.reduce((acc, r) => acc + (r.serviceRating || 0), 0) / totalReviews).toFixed(1),
      averageLocation: (safeReviews.reduce((acc, r) => acc + (r.locationRating || 0), 0) / totalReviews).toFixed(1),
      averageValue: (safeReviews.reduce((acc, r) => acc + (r.valueRating || 0), 0) / totalReviews).toFixed(1),
      averageFood: (safeReviews.reduce((acc, r) => acc + (r.foodRating || 0), 0) / totalReviews).toFixed(1),
      totalReviews
    } : { averageRating: 0, totalReviews: 0 };

    res.json({ success: true, reviews: safeReviews, stats });
  } catch (error) {
    console.error('[ERROR] getAllReviews:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/reviews/cottage - Get all cottage reviews with stats
export const getCottageReviews = async (req, res) => {
  try {
    // Get ALL reviews (approved and unapproved) for testing
    const reviews = await Review.find({})
      .populate("user", "username image")
      .populate("room", "roomType roomNumber")
      .sort({ createdAt: -1 });

    console.log('[DEBUG] Total reviews in DB:', reviews.length);
    
    // Ensure all reviews have user and room objects
    const safeReviews = reviews.map(r => {
      const review = r.toObject ? r.toObject() : r;
      return {
        ...review,
        user: review.user || { _id: review.user || 'unknown', username: 'Guest', image: null },
        room: review.room || { _id: 'unknown', roomType: 'Room', roomNumber: 'N/A' }
      };
    });

    // Calculate average ratings for Cloudy Hill Cottage
    const totalReviews = safeReviews.length;
    if (totalReviews === 0) {
      console.log('[DEBUG] No reviews found');
      return res.json({ 
        success: true, 
        reviews: [], 
        stats: { averageRating: 0, totalReviews: 0 }
      });
    }

    const avgRating = safeReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews;
    const avgCleanliness = safeReviews.reduce((acc, r) => acc + (r.cleanlinessRating || 0), 0) / totalReviews;
    const avgService = safeReviews.reduce((acc, r) => acc + (r.serviceRating || 0), 0) / totalReviews;
    const avgLocation = safeReviews.reduce((acc, r) => acc + (r.locationRating || 0), 0) / totalReviews;
    const avgValue = safeReviews.reduce((acc, r) => acc + (r.valueRating || 0), 0) / totalReviews;
    const avgFood = safeReviews.reduce((acc, r) => acc + (r.foodRating || 0), 0) / totalReviews;

    console.log('[DEBUG] Returning', safeReviews.length, 'reviews');
    
    res.json({ 
      success: true, 
      reviews: safeReviews,
      stats: {
        averageRating: avgRating.toFixed(1),
        averageCleanliness: avgCleanliness.toFixed(1),
        averageService: avgService.toFixed(1),
        averageLocation: avgLocation.toFixed(1),
        averageValue: avgValue.toFixed(1),
        averageFood: avgFood.toFixed(1),
        totalReviews
      }
    });
  } catch (error) {
    console.error('[ERROR] getCottageReviews:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/reviews/room/:roomId - Get reviews for a specific room
export const getRoomReviews = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const reviews = await Review.find({ room: roomId, isApproved: true })
      .populate("user", "username image")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : 0;

    res.json({ 
      success: true, 
      reviews,
      stats: { averageRating, totalReviews }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/reviews/user - Get current user's reviews
export const getUserReviews = async (req, res) => {
  try {
    ensureUser(req);
    const userId = req.user._id;
    
    const reviews = await Review.find({ user: userId })
      .populate("room", "roomType images roomNumber")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/reviews/:id - Get review by ID
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id)
      .populate("user", "username image")
      .populate("room", "roomType images roomNumber");
    
    if (!review) {
      return res.json({ success: false, message: "Review not found" });
    }
    
    res.json({ success: true, review });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// PUT /api/reviews/:id - Update review
export const updateReview = async (req, res) => {
  try {
    // Ensure user is set
    ensureUser(req);
    
    const { id } = req.params;
    const { 
      rating, 
      title, 
      comment,
      cleanlinessRating,
      serviceRating,
      locationRating,
      valueRating,
      foodRating
    } = req.body;
    
    const review = await Review.findById(id);
    
    if (!review) {
      return res.json({ success: false, message: "Review not found" });
    }
    
    // Only the review author may change review content (not admin — admin can respond, hide, or delete).
    const isDemoUser = req.user._id && req.user._id.toString().includes('demo-user');
    const isOwner = review.user && review.user.toString() === req.user._id.toString();

    if (!isDemoUser && !isOwner) {
      return res.json({ success: false, message: "Only the guest who wrote this review can edit it" });
    }
    
    // Update fields
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (cleanlinessRating) review.cleanlinessRating = cleanlinessRating;
    if (serviceRating) review.serviceRating = serviceRating;
    if (locationRating) review.locationRating = locationRating;
    if (valueRating) review.valueRating = valueRating;
    if (foodRating) review.foodRating = foodRating;
    
    await review.save();
    
    res.json({ success: true, review, message: "Review updated successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// PUT /api/reviews/:id/respond - Admin responds to review
export const respondToReview = async (req, res) => {
  try {
    ensureUser(req);
    const { id } = req.params;
    const { adminResponse } = req.body;
    
    // Verify admin role
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'admin') {
      return res.json({ success: false, message: "Only admin can respond to reviews" });
    }
    
    const review = await Review.findById(id);
    
    if (!review) {
      return res.json({ success: false, message: "Review not found" });
    }
    
    review.adminResponse = adminResponse;
    review.adminResponseDate = new Date();
    await review.save();
    
    res.json({ success: true, review, message: "Response added successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// POST /api/reviews/:id/helpful - Mark review as helpful
export const markReviewHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findByIdAndUpdate(
      id,
      { $inc: { helpfulVotes: 1 } },
      { new: true }
    );
    
    if (!review) {
      return res.json({ success: false, message: "Review not found" });
    }
    
    res.json({ success: true, helpfulVotes: review.helpfulVotes });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// DELETE /api/reviews/:id - Delete review
export const deleteReview = async (req, res) => {
  try {
    // Ensure user is set
    ensureUser(req);
    
    const { id } = req.params;
    const review = await Review.findById(id);
    
    if (!review) {
      return res.json({ success: false, message: "Review not found" });
    }
    
    // For demo mode, allow any demo user to delete
    const isDemoUser = req.user._id && req.user._id.toString().includes('demo-user');
    
    if (isDemoUser) {
      // Demo mode - allow delete
      await Review.findByIdAndDelete(id);
      return res.json({ success: true, message: "Review deleted successfully" });
    }
    
    // Otherwise check ownership or admin role
    const currentUser = await User.findById(req.user._id);
    const isAdmin = currentUser && currentUser.role === 'admin';
    const isReviewOwner = review.user && review.user.toString() === req.user._id.toString();
    
    if (!isAdmin && !isReviewOwner) {
      return res.json({ success: false, message: "Not authorized to delete this review" });
    }
    
    await Review.findByIdAndDelete(id);
    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
