import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import dns from "dns";
import dotenv from "dotenv";
import connectDB from "./configs/db.js";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRouters.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import experienceRouter from "./routes/experienceRoutes.js";
import aiRouter from "./routes/aiRoutes.js";

dotenv.config();// Load .env variables
connectCloudinary();
dns.setServers(["8.8.8.8", "1.1.1.1"]);

connectDB();


const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json());
app.use(clerkMiddleware());

// Safety middleware - ensure req.user always exists for demo mode
app.use((req, res, next) => {
  if (!req.user) {
    req.user = {
      _id: 'demo-user-' + Date.now(),
      email: 'demo@example.com',
      role: 'guest'
    };
  }
  next();
});

// API listen to clerk webhooks
app.use('/api/clerk', clerkWebhooks);


// Test route
app.get('/', (req, res) => res.send("Cloudy Hill Cottage API is working"));

// API Routes
app.use('/api/user', userRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/experiences', experienceRouter);
app.use('/api/ai', aiRouter);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
