import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  booking: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Booking", 
    required: true 
  },
  user: { 
    type: String, 
    ref: "User", 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: "LKR",
    enum: ["LKR", "USD", "EUR", "GBP"]
  },
  method: { 
    type: String, 
    enum: ["cash", "card", "bank_transfer", "online"], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "completed", "failed", "refunded", "cancelled"], 
    default: "pending" 
  },
  transactionId: { 
    type: String 
  },
  // Payment details
  cardLast4: {
    type: String
  },
  cardBrand: {
    type: String
  },
  // For refunds
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String
  },
  refundDate: {
    type: Date
  },
  // Receipt/Invoice
  receiptNumber: {
    type: String
  },
  notes: {
    type: String
  },
  // Payment date
  paidAt: {
    type: Date
  }
}, { timestamps: true });

// Index for efficient queries
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });

// Generate receipt number before saving
paymentSchema.pre('save', function() {
  if (!this.receiptNumber && this.status === 'completed') {
    this.receiptNumber = `CHC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
