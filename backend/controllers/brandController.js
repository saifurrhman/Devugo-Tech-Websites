const Brand = require('../models/Brand');

// List all brands (Public/Admin)
exports.list = async (req, res) => {
    try {
        const { active } = req.query;
        const filter = {};
        if (active === 'true') filter.isActive = true;

        // Default sort by order then createdAt
        const brands = await Brand.find(filter).sort({ order: 1, createdAt: -1 });
        res.json(brands);
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

// Create a new brand
exports.create = async (req, res) => {
    try {
        const { name, logo, url, isActive } = req.body;

        // Get highest order to append
        const last = await Brand.findOne().sort({ order: -1 });
        const order = (last?.order || 0) + 1;

        const brand = await Brand.create({
            name,
            logo,
            url,
            isActive: isActive !== undefined ? isActive : true,
            order
        });

        res.status(201).json(brand);
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

// Update brand
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const brand = await Brand.findByIdAndUpdate(id, req.body, { new: true });
        if (!brand) return res.status(404).json({ error: 'Brand not found' });

        res.json(brand);
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

// Delete brand
exports.remove = async (req, res) => {
    try {
        const { id } = req.params;
        await Brand.findByIdAndDelete(id);
        res.json({ message: 'Brand deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};
