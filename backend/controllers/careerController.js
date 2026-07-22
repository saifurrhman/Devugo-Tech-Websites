const Career = require('../models/Career');
const slugify = require('slugify');

// @desc    Get all careers
// @route   GET /api/careers
// @access  Public / Admin (Admin sees all, public sees only active)
exports.getCareers = async (req, res) => {
  try {
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'website_manager');
    const query = isAdmin ? {} : { isActive: true };

    const careers = await Career.find(query).sort({ createdAt: -1 });
    res.status(200).json(careers);
  } catch (error) {
    console.error('Error fetching careers:', error);
    res.status(500).json({ message: 'Server error fetching careers' });
  }
};

// @desc    Get single career by ID or Slug
// @route   GET /api/careers/:id
// @access  Public
exports.getCareerById = async (req, res) => {
  try {
    const { id } = req.params;
    let career;
    
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      career = await Career.findById(id);
    }
    if (!career) {
      career = await Career.findOne({ slug: id });
    }

    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }

    res.status(200).json(career);
  } catch (error) {
    console.error('Error fetching career:', error);
    res.status(500).json({ message: 'Server error fetching career' });
  }
};

// @desc    Create new career
// @route   POST /api/careers
// @access  Private (Admin / Website Manager)
exports.createCareer = async (req, res) => {
  try {
    const { title, department, location, type, experience, description, requirements, deadline, isActive } = req.body;
    
    let slug = slugify(title, { lower: true, strict: true });
    
    // Check if slug exists
    const existingSlug = await Career.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const career = new Career({
      title,
      slug,
      department,
      location,
      type,
      experience,
      description,
      requirements: requirements || [],
      deadline: deadline || null,
      isActive: isActive !== undefined ? isActive : true
    });

    const createdCareer = await career.save();
    res.status(201).json(createdCareer);
  } catch (error) {
    console.error('Error creating career:', error);
    res.status(500).json({ message: 'Server error creating career' });
  }
};

// @desc    Update career
// @route   PUT /api/careers/:id
// @access  Private (Admin / Website Manager)
exports.updateCareer = async (req, res) => {
  try {
    const { title, department, location, type, experience, description, requirements, deadline, isActive } = req.body;
    
    const career = await Career.findById(req.params.id);

    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }

    const originalTitle = career.title;

    career.title = title || career.title;
    career.department = department !== undefined ? department : career.department;
    career.location = location !== undefined ? location : career.location;
    career.type = type || career.type;
    career.experience = experience !== undefined ? experience : career.experience;
    career.description = description || career.description;
    career.requirements = requirements || career.requirements;
    if (deadline !== undefined) career.deadline = deadline;
    career.isActive = isActive !== undefined ? isActive : career.isActive;

    if ((title && title !== originalTitle) || !career.slug) {
      let slug = slugify(career.title, { lower: true, strict: true });
      const existingSlug = await Career.findOne({ slug, _id: { $ne: career._id } });
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }
      career.slug = slug;
    }

    const updatedCareer = await career.save();
    res.status(200).json(updatedCareer);
  } catch (error) {
    console.error('Error updating career:', error);
    res.status(500).json({ message: 'Server error updating career' });
  }
};

// @desc    Delete career
// @route   DELETE /api/careers/:id
// @access  Private (Admin / Website Manager)
exports.deleteCareer = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);

    if (!career) {
      return res.status(404).json({ message: 'Career not found' });
    }

    await Career.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Career removed' });
  } catch (error) {
    console.error('Error deleting career:', error);
    res.status(500).json({ message: 'Server error deleting career' });
  }
};
