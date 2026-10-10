import mongoose from "mongoose";
import dotenv from "dotenv";
import Booking from "./models/Booking.js";
import Room from "./models/Room.js";

dotenv.config();

// This script creates test bookings for a specific user
// Usage: Update USER_ID below with your Clerk user ID, then run: node createTestBookingForUser.js

const USER_ID = process.argv[2] || "user_test_123456"; // Pass user ID as argument or edit here

const createTestBookingForUser = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log("✓ MongoDB Connected");

    // Get or create sample room
    let room = await Room.findOne();
    
    if (!room) {
      console.log("Creating sample room...");
      room = await Room.create({
        roomType: "Deluxe Room",
        roomNumber: "R201",
        description: "Spacious deluxe room with stunning mountain views and a private balcony.",
        pricePerNight: 12500,
        capacity: 2,
        amenities: ["Free WiFi", "Hot Water", "Mountain View", "Private Balcony", "Room Service", "Free Breakfast"],
        images: [
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"
        ],
        isAvailable: true
      });
      console.log("✓ Created sample room");
    }

    // Create completed booking for this user
    const booking = await Booking.create({
      user: USER_ID,
      room: room._id,
      checkInDate: new Date("2026-01-20"),
      checkOutDate: new Date("2026-01-25"),
      totalPrice: 62500,
      guests: 2,
      guestName: "Test Guest",
      guestEmail: "guest@example.com",
      guestPhone: "+1234567890",
      specialRequests: "Test booking for review",
      status: "completed",
      isPaid: true,
      paymentMethod: "online"
    });

    console.log("\n✅ Completed booking created!");
    console.log(`   User ID: ${USER_ID}`);
    console.log(`   Room: ${room.roomType}`);
    console.log(`   Check-out: ${booking.checkOutDate.toLocaleDateString()}`);
    console.log("\n📝 You can now write a review for this booking!");

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

console.log("Creating test booking for user:", USER_ID);
createTestBookingForUser();
