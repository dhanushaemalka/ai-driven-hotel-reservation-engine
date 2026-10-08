import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: { 
    type: String, 
    ref: "User", 
    required: true 
  },
  room: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Room"
  },
  booking: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Booking", 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  title: { 
    type: String, 
    required: true,
    maxlength: 100
  },
  comment: { 
    type: String, 
    required: true,
    maxlength: 1000
  },
  // Specific ratings
  cleanlinessRating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  serviceRating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  locationRating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  valueRating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  foodRating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  // Review images (optional)
  images: [{ 
    type: String 
  }],
  // Admin response
  adminResponse: {
    type: String,
    maxlength: 500
  },
  adminResponseDate: {
    type: Date
  },
  // Helpful votes
  helpfulVotes: { 
    type: Number, 
    default: 0 
  },
  // Status for moderation
  isApproved: { 
    type: Boolean, 
    default: true 
  },
  // AI Sentiment Analysis (from Python AI service)
  sentiment: {
    detected: {
      type: String,
      enum: ["positive", "neutral", "negative", "crisis", "mixed"],
      default: "neutral",
    },
    score: {
      type: Number,
      min: -1,
      max: 1,
      default: 0,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    emotions: [{
      type: String,
      enum: ["joy", "satisfaction", "disappointment", "anger", "frustration", "gratitude", "neutral"],
    }],
    analyzedAt: {
      type: Date,
    },
  },
  // Crisis detection flag
  isCrisis: {
    type: Boolean,
    default: false,
  },
  crisisHandled: {
    type: Boolean,
    default: false,
  },
  crisisHandledBy: {
    type: String,
    ref: "User",
  },
  crisisHandledAt: {
    type: Date,
  },
  // Review verification
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationSource: {
    type: String,
    enum: ["booking", "manual", "none"],
    default: "none",
  },
}, { timestamps: true });

// Index for efficient queries
reviewSchema.index({ room: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ "sentiment.detected": 1 });
reviewSchema.index({ isCrisis: 1 });
reviewSchema.index({ isApproved: 1 });

// Text index for searching reviews
reviewSchema.index({ title: 'text', comment: 'text' });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
