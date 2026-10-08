import User from "../models/User.js";
import { Webhook } from "svix";

/**
 * Clerk Webhook Handler
 * Syncs user data from Clerk to MongoDB
 * Handles: user.created, user.updated, user.deleted events
 */
const clerkWebhooks = async (req, res) => {
  try {
    // Create svix instance with clerk webhook secret
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // Get headers for verification
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // Verify webhook signature
    await whook.verify(JSON.stringify(req.body), headers);

    // Extract data from request body
    const { data, type } = req.body;

    // Prepare user data
    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      username: `${data.first_name || ""} ${data.last_name || ""}`.trim() || 'User',
      image: data.image_url || "https://via.placeholder.com/120",
      recentSearches: [],
    };

    // Handle different event types
    switch (type) {
      case "user.created":
        await User.create(userData);
        break;

      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        break;

      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;

      default:
        break;
    }

    res.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("Clerk webhook error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;
