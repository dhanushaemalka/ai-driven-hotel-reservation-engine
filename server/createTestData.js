import mongoose from "mongoose";
import dotenv from "dotenv";
import Booking from "./models/Booking.js";
import Room from "./models/Room.js";
import User from "./models/User.js";

dotenv.config();

const createTestData = async () => {
  try {
    // Connect without the /hotel-booking suffix
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: "majority"
    });
    console.log("✓ MongoDB Connected");

    // Check if rooms exist, if not create one
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
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
          "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"
        ],
        isAvailable: true
      });
      console.log("✓ Created sample room:", room.roomType);
    }

    // Create test bookings
    console.log("Creating test bookings with past checkout dates...");
    
    const existingCount = await Booking.countDocuments();
    
    if (existingCount === 0) {
      const testBookings = [
        {
          user: "test-guest-1",
          room: room._id,
          checkInDate: new Date("2026-01-15"),
          checkOutDate: new Date("2026-01-20"),
          totalPrice: 62500,
          guests: 2,
          guestName: "Sarah Johnson",
          guestEmail: "sarah@example.com",
          guestPhone: "+1234567890",
          specialRequests: "Late checkout if available",
          status: "completed",
          isPaid: true,
          paymentMethod: "online"
        },
        {
          user: "test-guest-1",
          room: room._id,
          checkInDate: new Date("2026-02-01"),
          checkOutDate: new Date("2026-02-10"),
          totalPrice: 112500,
          guests: 2,
          guestName: "Sarah Johnson",
          guestEmail: "sarah@example.com",
          guestPhone: "+1234567890",
          specialRequests: "Mountain view room preferred",
          status: "completed",
          isPaid: true,
          paymentMethod: "online"
        },
        {
          user: "test-guest-2",
          room: room._id,
          checkInDate: new Date("2026-01-05"),
          checkOutDate: new Date("2026-01-12"),
          totalPrice: 87500,
          guests: 1,
          guestName: "Mike Chen",
          guestEmail: "mike@example.com",
          guestPhone: "+9876543210",
          specialRequests: "",
          status: "completed",
          isPaid: true,
          paymentMethod: "online"
        }
      ];

      const created = await Booking.insertMany(testBookings);
      console.log(`✓ Created ${created.length} completed bookings`);
      
      created.forEach((booking) => {
        console.log(`  • ${booking.guestName} - Checkout: ${booking.checkOutDate.toLocaleDateString()}`);
      });
    } else {
      console.log(`✓ Database already has ${existingCount} bookings`);
    }

    console.log("\n✅ Setup complete!");
    console.log("You can now:");
    console.log("  1. Log in with a test account");
    console.log("  2. Go to 'My Bookings' to see completed bookings");
    console.log("  3. Click 'Write Review' on any completed booking");
    console.log("  4. Fill in the review form and submit your review!");

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

createTestData();
