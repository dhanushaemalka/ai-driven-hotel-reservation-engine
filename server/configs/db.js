import mongoose from "mongoose";

const getMongoConnectionUri = () => {
  const raw = (process.env.MONGODB_URI || "").trim();
  if (!raw) return "";

  // If URI already includes a database name after host, use as-is.
  // Example: mongodb+srv://user:pass@cluster.mongodb.net/hotel_management?...
  const hasDbInPath = /mongodb(\+srv)?:\/\/[^/]+\/[^?]+/.test(raw);
  return hasDbInPath ? raw : `${raw}/hotel-booking`;
};

const connectDB = async () => {
  try {
    const uri = getMongoConnectionUri();
    if (!uri) {
      throw new Error("MONGODB_URI is missing");
    }
    console.log("Connecting to:", uri.replace(/\/\/.*:.*@/, "//***:***@")); // Hide password
    await mongoose.connect(uri);
    console.log("Database Connected");
  } catch (error) {
    console.log("MongoDB connection error:", error.message);
  }
};

export default connectDB;
