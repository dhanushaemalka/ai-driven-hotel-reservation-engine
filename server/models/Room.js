import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomType: {
      type: String,
      enum: ["Standard", "Deluxe", "Suite", "Family Suite", "Honeymoon Suite"],
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    minNegotiablePrice: {
      type: Number,
      min: [0, "Min price cannot be negative"],
      validate: {
        validator: function(v) {
          return v <= this.pricePerNight;
        },
        message: "Min negotiable price must be less than or equal to base price"
      }
    },
    capacity: {
      type: Number,
      required: true,
      default: 2,
      min: 1,
      max: 10,
    },
    amenities: [{
      type: String,
    }],
    images: [{ type: String }],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    floor: {
      type: Number,
      default: 1,
    },
    view: {
      type: String,
      enum: ["mountain", "garden", "pool", "city", "none"],
      default: "mountain",
    },
    bedType: {
      type: String,
      enum: ["single", "double", "queen", "king", "twin"],
      default: "double",
    },
  },
  { timestamps: true }
);

// Index for efficient queries
roomSchema.index({ roomType: 1 });
roomSchema.index({ pricePerNight: 1 });
roomSchema.index({ isAvailable: 1 });

// Set default minNegotiablePrice before save
roomSchema.pre('save', function() {
  if (!this.minNegotiablePrice) {
    this.minNegotiablePrice = Math.round(this.pricePerNight * 0.8); // 80% of base price
  }
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
