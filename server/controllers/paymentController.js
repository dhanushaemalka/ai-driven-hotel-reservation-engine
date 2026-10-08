import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

// ============================================
// VALIDATION HELPERS
// ============================================

const VALID_METHODS = ['cash', 'card', 'bank_transfer', 'online'];
const VALID_CURRENCIES = ['LKR', 'USD', 'EUR', 'GBP'];
const VALID_STATUSES = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];

const validateObjectId = (id, fieldName = 'ID') => {
  if (!id) {
    return { valid: false, error: `${fieldName} is required` };
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { valid: false, error: `Invalid ${fieldName} format` };
  }
  return { valid: true };
};

const validateAmount = (amount) => {
  if (amount === undefined || amount === null) {
    return { valid: false, error: 'Amount is required' };
  }
  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }
  if (numAmount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (numAmount > 10000000) {
    return { valid: false, error: 'Amount exceeds maximum limit (10,000,000)' };
  }
  return { valid: true, amount: numAmount };
};

const validatePaymentMethod = (method) => {
  if (!method) {
    return { valid: false, error: 'Payment method is required' };
  }
  if (!VALID_METHODS.includes(method)) {
    return { valid: false, error: `Invalid payment method. Must be one of: ${VALID_METHODS.join(', ')}` };
  }
  return { valid: true };
};

const validateCurrency = (currency) => {
  if (currency && !VALID_CURRENCIES.includes(currency)) {
    return { valid: false, error: `Invalid currency. Must be one of: ${VALID_CURRENCIES.join(', ')}` };
  }
  return { valid: true };
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const isAdmin = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user && user.role === 'admin';
  } catch {
    return false;
  }
};

const hasAdminAccess = async (req) => {
  // Primary check from auth middleware-populated user
  if (req.user?.role === 'admin') return true;
  // Fallback DB lookup
  const userId = req.user?._id;
  if (!userId) return false;
  return isAdmin(userId);
};

const formatPaymentResponse = (payment) => ({
  _id: payment._id,
  booking: payment.booking,
  user: payment.user,
  amount: payment.amount,
  currency: payment.currency,
  method: payment.method,
  status: payment.status,
  transactionId: payment.transactionId,
  receiptNumber: payment.receiptNumber,
  paidAt: payment.paidAt,
  refundAmount: payment.refundAmount,
  refundReason: payment.refundReason,
  refundDate: payment.refundDate,
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt
});

// ============================================
// CONTROLLERS
// ============================================

// POST /api/payments - Create a new payment
export const createPayment = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const { 
      bookingId, 
      amount, 
      currency = 'LKR',
      method, 
      transactionId,
      cardLast4,
      cardBrand,
      notes
    } = req.body;
    
    const userId = req.user?._id;
    
    // Validate user
    if (!userId) {
      await session.abortTransaction();
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // Validate booking ID
    const bookingValidation = validateObjectId(bookingId, 'Booking ID');
    if (!bookingValidation.valid) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: bookingValidation.error });
    }

    // Validate payment method
    const methodValidation = validatePaymentMethod(method);
    if (!methodValidation.valid) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: methodValidation.error });
    }

    // Validate currency
    const currencyValidation = validateCurrency(currency);
    if (!currencyValidation.valid) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: currencyValidation.error });
    }

    // Fetch booking with session for consistency
    const booking = await Booking.findById(bookingId).session(session);
    
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Check booking status - can't pay for cancelled bookings
    if (booking.status === 'cancelled') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Cannot create payment for a cancelled booking" });
    }

    // Verify authorization
    const userIsAdmin = await isAdmin(userId);
    const isBookingOwner = booking.user.toString() === userId.toString();
    
    if (!isBookingOwner && !userIsAdmin) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "Not authorized to pay for this booking" });
    }
    
    // Check for existing active payment
    const existingPayment = await Payment.findOne({ 
      booking: bookingId, 
      status: { $in: ['completed', 'pending'] }
    }).session(session);
    
    if (existingPayment) {
      await session.abortTransaction();
      const statusMessage = existingPayment.status === 'completed' 
        ? "This booking has already been paid" 
        : "A pending payment already exists for this booking";
      return res.status(409).json({ success: false, message: statusMessage });
    }

    // Validate and set amount
    const paymentAmount = amount || booking.totalPrice;
    const amountValidation = validateAmount(paymentAmount);
    if (!amountValidation.valid) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: amountValidation.error });
    }

    // Validate card details if method is card
    if (method === 'card') {
      if (cardLast4 && !/^\d{4}$/.test(cardLast4)) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: "Card last 4 digits must be exactly 4 numbers" });
      }
    }

    // Create payment
    const paymentData = {
      booking: bookingId,
      user: booking.user,
      amount: amountValidation.amount,
      currency,
      method,
      transactionId: transactionId?.trim(),
      cardLast4,
      cardBrand,
      notes: notes?.trim(),
      // All user-submitted payments are pending until admin confirms.
      status: 'pending',
      paidAt: null
    };

    const [payment] = await Payment.create([paymentData], { session });

    await session.commitTransaction();

    // Populate for response
    await payment.populate('booking');
    await payment.populate('user', 'username email');

    res.status(201).json({ 
      success: true, 
      payment: formatPaymentResponse(payment),
      message: "Payment submitted successfully. Awaiting admin confirmation."
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('[PaymentController] createPayment error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    
    res.status(500).json({ success: false, message: "Failed to create payment. Please try again." });
  } finally {
    session.endSession();
  }
};

// GET /api/payments - Get all payments (admin)
export const getAllPayments = async (req, res) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const userIsAdmin = await hasAdminAccess(req);
    if (!userIsAdmin) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    // Parse pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    // Parse filters
    const filter = {};
    if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (req.query.method && VALID_METHODS.includes(req.query.method)) {
      filter.method = req.query.method;
    }

    const [payments, totalCount] = await Promise.all([
      Payment.find(filter)
        .populate("booking", "checkInDate checkOutDate totalPrice status")
        .populate("user", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(filter)
    ]);

    res.json({ 
      success: true, 
      payments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + payments.length < totalCount
      }
    });
  } catch (error) {
    console.error('[PaymentController] getAllPayments error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch payments" });
  }
};

// GET /api/payments/user - Get current user's payments
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [payments, totalCount] = await Promise.all([
      Payment.find({ user: userId })
        .populate("booking", "checkInDate checkOutDate totalPrice status room")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments({ user: userId })
    ]);

    res.json({ 
      success: true, 
      payments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('[PaymentController] getUserPayments error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch your payments" });
  }
};

// GET /api/payments/dashboard - Get payment dashboard (admin)
export const getDashboardPayments = async (req, res) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const userIsAdmin = await hasAdminAccess(req);
    if (!userIsAdmin) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    // Fetch recent payments and aggregate stats in parallel
    const [recentPayments, stats] = await Promise.all([
      Payment.find()
        .populate("booking", "checkInDate checkOutDate totalPrice")
        .populate("user", "username email image")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      
      Payment.aggregate([
        {
          $group: {
            _id: null,
            totalPayments: { $sum: 1 },
            totalRevenue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0]
              }
            },
            pendingAmount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0]
              }
            },
            refundedAmount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'refunded'] }, '$refundAmount', 0]
              }
            },
            completedCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
              }
            },
            pendingCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
              }
            },
            refundedCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    const aggregatedStats = stats[0] || {
      totalPayments: 0,
      totalRevenue: 0,
      pendingAmount: 0,
      refundedAmount: 0,
      completedCount: 0,
      pendingCount: 0,
      refundedCount: 0
    };

    res.json({ 
      success: true, 
      payments: recentPayments,
      stats: {
        totalPayments: aggregatedStats.totalPayments,
        totalRevenue: aggregatedStats.totalRevenue,
        pendingAmount: aggregatedStats.pendingAmount,
        refundedAmount: aggregatedStats.refundedAmount,
        completedCount: aggregatedStats.completedCount,
        pendingCount: aggregatedStats.pendingCount,
        refundedCount: aggregatedStats.refundedCount,
        netRevenue: aggregatedStats.totalRevenue - aggregatedStats.refundedAmount
      }
    });
  } catch (error) {
    console.error('[PaymentController] getDashboardPayments error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
  }
};

// GET /api/payments/booking/:bookingId - Get payment for a booking
export const getPaymentByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const validation = validateObjectId(bookingId, 'Booking ID');
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    const payment = await Payment.findOne({ booking: bookingId })
      .populate("booking")
      .populate("user", "username email")
      .lean();
    
    if (!payment) {
      return res.status(404).json({ success: false, message: "No payment found for this booking" });
    }

    // Verify access
    const userId = req.user?._id || req.auth?.userId;
    const userIsAdmin = await isAdmin(userId);
    const isPaymentOwner = payment.user._id?.toString() === userId?.toString();

    if (!userIsAdmin && !isPaymentOwner) {
      return res.status(403).json({ success: false, message: "Not authorized to view this payment" });
    }
    
    res.json({ success: true, payment });
  } catch (error) {
    console.error('[PaymentController] getPaymentByBooking error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch payment" });
  }
};

// GET /api/payments/:id - Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const validation = validateObjectId(id, 'Payment ID');
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.error });
    }
    
    const payment = await Payment.findById(id)
      .populate("booking")
      .populate("user", "username email image")
      .lean();
    
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    
    // Verify access
    const userId = req.user?._id;
    const userIsAdmin = await isAdmin(userId);
    const isPaymentOwner = payment.user._id?.toString() === userId?.toString();
    
    if (!userIsAdmin && !isPaymentOwner) {
      return res.status(403).json({ success: false, message: "Not authorized to view this payment" });
    }
    
    res.json({ success: true, payment });
  } catch (error) {
    console.error('[PaymentController] getPaymentById error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch payment" });
  }
};

// PUT /api/payments/:id - Update payment (Admin only)
export const updatePayment = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const { id } = req.params;
    const { status, transactionId, notes } = req.body;
    
    // Validate ID
    const validation = validateObjectId(id, 'Payment ID');
    if (!validation.valid) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: validation.error });
    }

    // Verify admin
    const userId = req.user?._id;
    const userIsAdmin = await hasAdminAccess(req);
    if (!userIsAdmin) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    
    const payment = await Payment.findById(id).session(session);
    
    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Validate status if provided
    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        await session.abortTransaction();
        return res.status(400).json({ 
          success: false, 
          message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` 
        });
      }

      // Prevent invalid status transitions
      const invalidTransitions = {
        'refunded': ['completed', 'pending'],
        'completed': ['pending'],
      };
      
      if (invalidTransitions[payment.status]?.includes(status)) {
        await session.abortTransaction();
        return res.status(400).json({ 
          success: false, 
          message: `Cannot change status from '${payment.status}' to '${status}'` 
        });
      }

      payment.status = status;
      
      if (status === 'completed' && !payment.paidAt) {
        payment.paidAt = new Date();
        await Booking.findByIdAndUpdate(
          payment.booking, 
          { isPaid: true },
          { session }
        );
      }
    }
    
    if (transactionId !== undefined) {
      payment.transactionId = transactionId?.trim() || payment.transactionId;
    }
    
    if (notes !== undefined) {
      payment.notes = notes?.trim();
    }
    
    await payment.save({ session });
    await session.commitTransaction();

    await payment.populate('booking');
    await payment.populate('user', 'username email');
    
    res.json({ 
      success: true, 
      payment: formatPaymentResponse(payment),
      message: "Payment updated successfully" 
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('[PaymentController] updatePayment error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    
    res.status(500).json({ success: false, message: "Failed to update payment" });
  } finally {
    session.endSession();
  }
};

// PUT /api/payments/:id/confirm - Confirm cash payment (Admin only)
export const confirmPayment = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const { id } = req.params;
    
    // Validate ID
    const validation = validateObjectId(id, 'Payment ID');
    if (!validation.valid) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: validation.error });
    }

    // Verify admin
    const userId = req.user?._id;
    const userIsAdmin = await hasAdminAccess(req);
    if (!userIsAdmin) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    
    const payment = await Payment.findById(id).session(session);
    
    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.status === 'completed') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Payment is already completed" });
    }

    if (payment.status === 'refunded') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Cannot confirm a refunded payment" });
    }

    if (payment.status === 'cancelled') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Cannot confirm a cancelled payment" });
    }
    
    payment.status = 'completed';
    payment.paidAt = new Date();
    await payment.save({ session });
    
    // Update booking
    await Booking.findByIdAndUpdate(
      payment.booking, 
      { isPaid: true },
      { session }
    );
    
    await session.commitTransaction();

    await payment.populate('booking');
    await payment.populate('user', 'username email');
    
    res.json({ 
      success: true, 
      payment: formatPaymentResponse(payment),
      message: "Payment confirmed successfully" 
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('[PaymentController] confirmPayment error:', error);
    res.status(500).json({ success: false, message: "Failed to confirm payment" });
  } finally {
    session.endSession();
  }
};

// PUT /api/payments/:id/refund - Process refund (Admin only)
export const refundPayment = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const { id } = req.params;
    const { refundAmount, refundReason } = req.body;
    
    // Validate ID
    const validation = validateObjectId(id, 'Payment ID');
    if (!validation.valid) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: validation.error });
    }

    // Verify admin
    const userId = req.user?._id;
    const userIsAdmin = await hasAdminAccess(req);
    if (!userIsAdmin) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    // Validate refund reason
    if (!refundReason || refundReason.trim().length < 5) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: "Refund reason is required (minimum 5 characters)" 
      });
    }
    
    const payment = await Payment.findById(id).session(session);
    
    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    
    if (payment.status !== 'completed') {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: `Cannot refund a payment with status '${payment.status}'. Only completed payments can be refunded.` 
      });
    }

    // Validate refund amount
    const actualRefundAmount = refundAmount || payment.amount;
    const amountValidation = validateAmount(actualRefundAmount);
    if (!amountValidation.valid) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: amountValidation.error });
    }

    if (amountValidation.amount > payment.amount) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: `Refund amount (${amountValidation.amount}) cannot exceed original payment amount (${payment.amount})` 
      });
    }
    
    payment.status = 'refunded';
    payment.refundAmount = amountValidation.amount;
    payment.refundReason = refundReason.trim();
    payment.refundDate = new Date();
    await payment.save({ session });
    
    // Update booking
    await Booking.findByIdAndUpdate(
      payment.booking, 
      { isPaid: false, status: 'cancelled' },
      { session }
    );
    
    await session.commitTransaction();

    await payment.populate('booking');
    await payment.populate('user', 'username email');
    
    res.json({ 
      success: true, 
      payment: formatPaymentResponse(payment),
      message: `Refund of ${payment.currency} ${amountValidation.amount.toLocaleString()} processed successfully` 
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('[PaymentController] refundPayment error:', error);
    res.status(500).json({ success: false, message: "Failed to process refund" });
  } finally {
    session.endSession();
  }
};

// DELETE /api/payments/:id - Delete payment (Admin only)
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    const validation = validateObjectId(id, 'Payment ID');
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    // Verify admin
    const userId = req.user?._id;
    const userIsAdmin = await hasAdminAccess(req);
    if (!userIsAdmin) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    
    const payment = await Payment.findById(id);
    
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    
    // Only allow deletion of failed or cancelled payments
    if (payment.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete completed payments. Process a refund instead." 
      });
    }

    if (payment.status === 'refunded') {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete refunded payments. Records must be kept for accounting." 
      });
    }

    if (payment.status === 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete pending payments. Cancel the payment first." 
      });
    }
    
    await Payment.findByIdAndDelete(id);
    
    res.json({ 
      success: true, 
      message: "Payment record deleted successfully" 
    });
  } catch (error) {
    console.error('[PaymentController] deletePayment error:', error);
    res.status(500).json({ success: false, message: "Failed to delete payment" });
  }
};

// PUT /api/payments/:id/cancel - Cancel pending payment
export const cancelPayment = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const { id } = req.params;
    const { reason } = req.body;
    
    // Validate ID
    const validation = validateObjectId(id, 'Payment ID');
    if (!validation.valid) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: validation.error });
    }

    const userId = req.user?._id || req.auth?.userId;
    if (!userId) {
      await session.abortTransaction();
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    
    const payment = await Payment.findById(id).session(session);
    
    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Verify access - admin or payment owner
    const userIsAdmin = await isAdmin(userId);
    const isPaymentOwner = payment.user.toString() === userId.toString();
    
    if (!userIsAdmin && !isPaymentOwner) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "Not authorized to cancel this payment" });
    }
    
    if (payment.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel a payment with status '${payment.status}'. Only pending payments can be cancelled.` 
      });
    }
    
    payment.status = 'cancelled';
    payment.notes = reason ? `Cancelled: ${reason.trim()}` : 'Payment cancelled';
    await payment.save({ session });
    
    await session.commitTransaction();

    await payment.populate('booking');
    await payment.populate('user', 'username email');
    
    res.json({ 
      success: true, 
      payment: formatPaymentResponse(payment),
      message: "Payment cancelled successfully" 
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('[PaymentController] cancelPayment error:', error);
    res.status(500).json({ success: false, message: "Failed to cancel payment" });
  } finally {
    session.endSession();
  }
};
