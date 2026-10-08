import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  category: { 
    type: String, 
    enum: ["cooking", "adventure", "nature", "cultural", "wellness", "photography", "romantic", "family"],
    required: true 
  },
  duration: { 
    type: String, 
    required: true
  },
  durationMinutes: {
    type: Number,
    min: 0,
  },
  price: { 
    type: Number, 
    required: true,
    min: 0,
  },
  priceIncludes: [{
    type: String
  }],
  maxParticipants: { 
    type: Number, 
    default: 10,
    min: 1,
  },
  minParticipants: {
    type: Number,
    default: 1,
    min: 1,
  },
  difficulty: {
    type: String,
    enum: ["easy", "moderate", "challenging", "expert"],
    default: "easy"
  },
  highlights: [{
    type: String
  }],
  whatToBring: [{
    type: String
  }],
  schedule: {
    startTime: { type: String },
    endTime: { type: String },
    availableDays: [{ type: String }]
  },
  images: [{ 
    type: String 
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  // Tags for GraphRAG AI engine
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
  }],
  // Semantic keywords for AI recommendations
  keywords: [{
    type: String,
    lowercase: true,
  }],
  // Target audience
  suitableFor: [{
    type: String,
    enum: ["solo", "couples", "families", "groups", "seniors", "children", "adventure_seekers"],
  }],
  // Physical requirements
  fitnessLevel: {
    type: String,
    enum: ["none", "low", "moderate", "high"],
    default: "low",
  },
  // Weather dependency
  weatherDependent: {
    type: Boolean,
    default: false,
  },
  // Booking requirements
  advanceBookingDays: {
    type: Number,
    default: 1,
    min: 0,
  },
}, { timestamps: true });

// Index for efficient queries
experienceSchema.index({ category: 1 });
experienceSchema.index({ isActive: 1 });
experienceSchema.index({ price: 1 });
experienceSchema.index({ tags: 1 });
experienceSchema.index({ keywords: 1 });
experienceSchema.index({ difficulty: 1 });

// Text index for search
experienceSchema.index({ 
  name: 'text', 
  description: 'text', 
  tags: 'text', 
  keywords: 'text' 
});

const Experience = mongoose.model("Experience", experienceSchema);

export default Experience;
