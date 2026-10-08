import Room from "../models/Room.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";

// POST /api/rooms - Create a new room (Admin only)
export const createRoom = async (req, res) => {
  try {
    const { roomType, roomNumber, description, pricePerNight, minNegotiablePrice, capacity, amenities, floor, view, bedType } = req.body;

    // Verify admin role
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.json({ success: false, message: "Only admin can create rooms" });
    }

    // Validate price is not negative
    if (+pricePerNight < 0) {
      return res.json({ success: false, message: "Price cannot be negative" });
    }

    // Validate minNegotiablePrice
    const minPrice = minNegotiablePrice ? +minNegotiablePrice : Math.round(+pricePerNight * 0.8);
    if (minPrice > +pricePerNight) {
      return res.json({ success: false, message: "Minimum negotiable price cannot exceed base price" });
    }

    // Check if room number already exists
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.json({ success: false, message: "Room number already exists" });
    }

    const images = await Promise.all(
      (req.files || []).map(file =>
        cloudinary.uploader.upload(file.path).then(r => r.secure_url)
      )
    );

    const room = await Room.create({
      roomType,
      roomNumber,
      description,
      pricePerNight: +pricePerNight,
      minNegotiablePrice: minPrice,
      capacity: +capacity || 2,
      amenities: typeof amenities === 'string' ? JSON.parse(amenities) : amenities,
      images,
      floor: floor ? +floor : 1,
      view: view || 'mountain',
      bedType: bedType || 'double',
    });

    res.json({ success: true, room, message: "Room created successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/rooms - Get all available rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true })
      .sort({ roomNumber: 1 });

    res.json({ success: true, rooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/rooms/all - Get all rooms (including unavailable) - Admin
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .sort({ roomNumber: 1 });

    res.json({ success: true, rooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/rooms/admin - Get all rooms for admin dashboard
export const getAdminRooms = async (req, res) => {
  try {
    // Verify admin role
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.json({ success: false, message: "Admin access required" });
    }
   
    const rooms = await Room.find().sort({ roomNumber: 1 });

    res.json({ success: true, rooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/rooms/:id - Get room by ID
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const room = await Room.findById(id);
    
    if (!room) {
      return res.json({ success: false, message: "Room not found" });
    }
    
    res.json({ success: true, room });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// PUT /api/rooms/:id - Update room (Admin only)
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomType, roomNumber, description, pricePerNight, minNegotiablePrice, capacity, amenities, isAvailable, floor, view, bedType } = req.body;
    
    // Verify admin role
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.json({ success: false, message: "Only admin can update rooms" });
    }
    
    const room = await Room.findById(id);
    
    if (!room) {
      return res.json({ success: false, message: "Room not found" });
    }

    // Validate price constraints
    if (pricePerNight && +pricePerNight < 0) {
      return res.json({ success: false, message: "Price cannot be negative" });
    }

    const newPrice = pricePerNight ? +pricePerNight : room.pricePerNight;
    const newMinPrice = minNegotiablePrice ? +minNegotiablePrice : (pricePerNight ? Math.round(+pricePerNight * 0.8) : room.minNegotiablePrice);
    
    if (newMinPrice > newPrice) {
      return res.json({ success: false, message: "Minimum negotiable price cannot exceed base price" });
    }
    
    // Handle new images if uploaded
    let images = room.images;
    if (req.files && req.files.length > 0) {
      images = await Promise.all(
        req.files.map(file =>
          cloudinary.uploader.upload(file.path).then(r => r.secure_url)
        )
      );
    }
    
    const updateData = {};
    if (roomType) updateData.roomType = roomType;
    if (roomNumber) updateData.roomNumber = roomNumber;
    if (description !== undefined) updateData.description = description;
    if (pricePerNight) updateData.pricePerNight = +pricePerNight;
    if (minNegotiablePrice !== undefined) updateData.minNegotiablePrice = +minNegotiablePrice;
    if (capacity) updateData.capacity = +capacity;
    if (amenities) updateData.amenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
    if (typeof isAvailable === 'boolean') updateData.isAvailable = isAvailable;
    if (images.length > 0) updateData.images = images;
    if (floor) updateData.floor = +floor;
    if (view) updateData.view = view;
    if (bedType) updateData.bedType = bedType;
    
    const updatedRoom = await Room.findByIdAndUpdate(id, updateData, { new: true });
    
    res.json({ success: true, room: updatedRoom, message: "Room updated successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// DELETE /api/rooms/:id - Delete room (Admin only)
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify admin role
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.json({ success: false, message: "Only admin can delete rooms" });
    }
    
    const room = await Room.findById(id);
    
    if (!room) {
      return res.json({ success: false, message: "Room not found" });
    }
    
    await Room.findByIdAndDelete(id);
    
    res.json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// POST /api/rooms/toggle-availability - Toggle room availability (Admin only)
export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;
    
    // Verify admin role
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.json({ success: false, message: "Only admin can toggle room availability" });
    }
    
    const room = await Room.findById(roomId);

    if (!room) {
      return res.json({ success: false, message: "Room not found" });
    }

    room.isAvailable = !room.isAvailable;
    await room.save();

    res.json({ success: true, message: "Room availability updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
