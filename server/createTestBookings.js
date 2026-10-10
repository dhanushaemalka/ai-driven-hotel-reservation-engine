import mongoose from "mongoose";
import dotenv from "dotenv";
import Booking from "./models/Booking.js";
import Room from "./models/Room.js";

dotenv.config();

const createTestBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");

    // Get first room
    const room = await Room.findOne();
    if (!room) {
      console.log("No rooms found. Please seed rooms first.");
      process.exit(1);
    }

    console.log("Found room:", room.roomType);

    // Create test bookings with past checkout dates so reviews can be added
    const testBookings = [
      {
        user: "test-user-1",
        room: room._id,
        checkInDate: new Date("2026-01-15"),
        checkOutDate: new Date("2026-01-20"),
        totalPrice: room.pricePerNight * 5,
        guests: 2,
        guestName: "John Doe",
        guestEmail: "john@example.com",
        guestPhone: "+1234567890",
        specialRequests: "Quiet room preferred",
        status: "completed",
        paymentStatus: "paid",
        paymentMethod: "credit_card"
      },
      {
        user: "test-user-1",
        room: room._id,
        checkInDate: new Date("2026-02-01"),
        checkOutDate: new Date("2026-02-10"),
        totalPrice: room.pricePerNight * 9,
        guests: 2,
        guestName: "John Doe",
        guestEmail: "john@example.com",
        guestPhone: "+1234567890",
        specialRequests: "Late checkout please",
        status: "completed",
        paymentStatus: "paid",
        paymentMethod: "credit_card"
      },
      {
        user: "test-user-2",
        room: room._id,
        checkInDate: new Date("2026-01-05"),
        checkOutDate: new Date("2026-01-12"),
        totalPrice: room.pricePerNight * 7,
        guests: 1,
        guestName: "Jane Smith",
        guestEmail: "jane@example.com",
        guestPhone: "+9876543210",
        specialRequests: "",
        status: "completed",
        paymentStatus: "paid",
        paymentMethod: "credit_card"
      }
    ];

    // Check if bookings already exist
    const existingCount = await Booking.countDocuments();
    
    if (existingCount > 0) {
      console.log(`✓ Database already has ${existingCount} bookings`);
    } else {
      // Insert test bookings
      const result = await Booking.insertMany(testBookings);
      console.log(`✓ Created ${result.length} test bookings`);
      
      result.forEach((booking, index) => {
        console.log(`  ${index + 1}. ${booking.guestName} (${new Date(booking.checkOutDate).toLocaleDateString()})`);
      });
    }

    console.log("\n✓ You can now add reviews for completed bookings!");
    console.log("  - Navigate to 'My Bookings'");
    console.log("  - Click 'Write Review' on a completed booking");
    console.log("  - Fill the form and submit");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

createTestBookings();
