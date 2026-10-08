import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["guest", "admin"],
      default: "guest",
    },
    loyaltyStatus: {
      type: String,
      enum: ["standard", "silver", "gold", "platinum"],
      default: "standard",
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    recentSearches: {
      type: Array,
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ loyaltyStatus: 1 });

const User = mongoose.model("User", userSchema);

export default User;
