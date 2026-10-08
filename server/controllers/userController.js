import User from "../models/User.js";

// GET /api/user - Get current user data
export const getUserData = async (req, res) => {
  try {
    const role = req.user.role;
    const recentSearches = req.user.recentSearches;
    res.json({ success: true, role, recentSearches });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/user/all - Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    // Verify admin role
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== 'admin') {
      return res.json({ success: false, message: "Admin access required" });
    }
    
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// POST /api/user - Create user (admin only)
export const createUser = async (req, res) => {
  try {
    const { username, email, image, role, loyaltyStatus, phone, address, isActive } = req.body;

    // Verify admin role
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== 'admin') {
      return res.json({ success: false, message: "Only admin can create users" });
    }

    if (!username || !email) {
      return res.json({ success: false, message: "Username and email are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.json({ success: false, message: "User with this email already exists" });
    }

    const safeRole = role === "admin" ? "admin" : "guest";
    const safeLoyalty = ["standard", "silver", "gold", "platinum"].includes(loyaltyStatus)
      ? loyaltyStatus
      : "standard";

    const user = await User.create({
      _id: `manual_${Date.now()}`,
      username: String(username).trim(),
      email: normalizedEmail,
      image: image || "https://via.placeholder.com/120",
      role: safeRole,
      loyaltyStatus: safeLoyalty,
      phone: phone || "",
      address: address || "",
      isActive: typeof isActive === "boolean" ? isActive : true,
      recentSearches: [],
    });

    res.json({ success: true, user, message: "User created successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET /api/user/:id - Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const isAdmin = currentUser && currentUser.role === 'admin';
    const isSelf = currentUser && currentUser._id.toString() === id;

    if (!isAdmin && !isSelf) {
      return res.json({ success: false, message: "Not authorized to view this user" });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// PUT /api/user/:id - Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, image, phone, role, loyaltyStatus, address, isActive } = req.body;
    
    // Only admin can change roles and loyalty status
    const currentUser = req.user;
    const isAdmin = currentUser && currentUser.role === 'admin';
    const isSelf = currentUser && currentUser._id.toString() === id;
    
    if (!isAdmin && !isSelf) {
      return res.json({ success: false, message: "Not authorized to update this user" });
    }
    
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (image) updateData.image = image;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    
    // Admin-only fields
    if (isAdmin) {
      if (role) updateData.role = role;
      if (loyaltyStatus) updateData.loyaltyStatus = loyaltyStatus;
      if (typeof isActive === 'boolean') updateData.isActive = isActive;
    }
    
    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    res.json({ success: true, user, message: "User updated successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// DELETE /api/user/:id - Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify admin role
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== 'admin') {
      return res.json({ success: false, message: "Only admin can delete users" });
    }
    
    // Prevent admin from deleting themselves
    if (currentUser._id.toString() === id) {
      return res.json({ success: false, message: "Cannot delete your own account" });
    }
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// POST /api/user/store-recent-search - Store recent search
export const storeRecentSearch = async (req, res) => {
  try {
    const { searchTerm } = req.body;
    const user = req.user;

    if (user.recentSearches.length < 5) {
      user.recentSearches.push(searchTerm);
    } else {
      user.recentSearches.shift();
      user.recentSearches.push(searchTerm);
    }
    
    await user.save();
    res.json({ success: true, message: "Search saved" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};