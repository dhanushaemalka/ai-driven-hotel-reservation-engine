import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      ref: "User",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(v) {
          return v > this.checkInDate;
        },
        message: "Check-out date must be after check-in date"
      }
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    negotiatedPrice: {
      type: Number,
      min: 0,
    },
    discountApplied: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    nights: {
      type: Number,
      min: 1,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    guestName: {
      type: String,
      required: true,
    },
    guestEmail: {
      type: String,
      required: true,
    },
    guestPhone: {
      type: String,
      default: "",
    },
    specialRequests: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "no_show"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["pay_at_cottage", "online", "bank_transfer", "card"],
      default: "pay_at_cottage",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ["website", "phone", "walk_in", "ai_chatbot"],
      default: "website",
    },
  },
  { timestamps: true }
);

// Index for efficient queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ checkInDate: 1 });
bookingSchema.index({ checkOutDate: 1 });

// Calculate nights before save
bookingSchema.pre('save', function() {
  if (this.checkInDate && this.checkOutDate) {
    const timeDiff = this.checkOutDate.getTime() - this.checkInDate.getTime();
    this.nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
