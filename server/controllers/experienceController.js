import Experience from "../models/Experience.js";

// CREATE - Add a new experience
export const createExperience = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      category,
      duration,
      durationMinutes,
      price,
      priceIncludes,
      maxParticipants,
      minParticipants,
      difficulty,
      highlights,
      whatToBring,
      schedule,
      tags,
      keywords,
      suitableFor,
      fitnessLevel,
      weatherDependent,
      advanceBookingDays
    } = req.body;

    // Auto-generate tags from name, category, and difficulty if not provided
    let experienceTags = tags || [];
    if (experienceTags.length === 0) {
      experienceTags = [
        category,
        difficulty,
        ...name.toLowerCase().split(' ').filter(w => w.length > 3)
      ];
    }

    // Auto-generate keywords for AI recommendations
    let experienceKeywords = keywords || [];
    if (experienceKeywords.length === 0) {
      experienceKeywords = [
        category,
        difficulty,
        ...(highlights || []).map(h => h.toLowerCase().split(' ')).flat().filter(w => w.length > 3)
      ];
    }

    const experience = new Experience({
      name,
      description,
      shortDescription,
      category,
      duration,
      durationMinutes: durationMinutes ? +durationMinutes : null,
      price: +price,
      priceIncludes,
      maxParticipants: maxParticipants ? +maxParticipants : 10,
      minParticipants: minParticipants ? +minParticipants : 1,
      difficulty,
      highlights,
      whatToBring,
      schedule,
      images: req.body.images || [],
      tags: experienceTags,
      keywords: experienceKeywords,
      suitableFor: suitableFor || [],
      fitnessLevel: fitnessLevel || 'low',
      weatherDependent: weatherDependent || false,
      advanceBookingDays: advanceBookingDays ? +advanceBookingDays : 1,
    });

    await experience.save();

    res.json({ 
      success: true, 
      message: "Experience created successfully",
      experience 
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// READ - Get all experiences
export const getAllExperiences = async (req, res) => {
  try {
    const { category, isActive, minPrice, maxPrice } = req.query;
    
    let filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const experiences = await Experience.find(filter).sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: experiences.length,
      experiences 
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// READ - Get active experiences (for public display)
export const getActiveExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find({ isActive: true }).sort({ category: 1, name: 1 });

    res.json({ 
      success: true, 
      count: experiences.length,
      experiences 
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// READ - Get experiences by category
export const getExperiencesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const experiences = await Experience.find({ 
      category, 
      isActive: true 
    }).sort({ name: 1 });

    res.json({ 
      success: true, 
      count: experiences.length,
      experiences 
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// READ - Get single experience by ID
export const getExperienceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const experience = await Experience.findById(id);

    if (!experience) {
      return res.json({ success: false, message: "Experience not found" });
    }

    res.json({ 
      success: true, 
      experience 
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// UPDATE - Update an experience
export const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const experience = await Experience.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!experience) {
      return res.json({ success: false, message: "Experience not found" });
    }

    res.json({ 
      success: true, 
      message: "Experience updated successfully",
      experience 
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// UPDATE - Toggle experience active status
export const toggleExperienceStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await Experience.findById(id);

    if (!experience) {
      return res.json({ success: false, message: "Experience not found" });
    }

    experience.isActive = !experience.isActive;
    await experience.save();

    res.json({ 
      success: true, 
      message: `Experience ${experience.isActive ? 'activated' : 'deactivated'} successfully`,
      experience 
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// UPDATE - Update experience rating (called after a review)
export const updateExperienceRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, totalReviews } = req.body;

    const experience = await Experience.findByIdAndUpdate(
      id,
      { rating, totalReviews },
      { new: true }
    );

    if (!experience) {
      return res.json({ success: false, message: "Experience not found" });
    }

    res.json({ 
      success: true, 
      message: "Experience rating updated",
      experience 
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// DELETE - Delete an experience
export const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await Experience.findByIdAndDelete(id);

    if (!experience) {
      return res.json({ success: false, message: "Experience not found" });
    }

    res.json({ 
      success: true, 
      message: "Experience deleted successfully" 
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
