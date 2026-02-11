const asyncHandler = require('express-async-handler');
const RawMaterial = require('../models/RawMaterial');

// @desc    Get all raw materials
// @route   GET /api/materials
// @access  Private
const getMaterials = asyncHandler(async (req, res) => {
    const materials = await RawMaterial.find({ userId: req.user._id });
    res.json(materials);
});

// @desc    Create a raw material
// @route   POST /api/materials
// @access  Private
const createMaterial = asyncHandler(async (req, res) => {
    const { name, quantity, unit, minimumStockThreshold } = req.body;

    if (!name || !unit) {
        res.status(400);
        throw new Error('Please add all required fields');
    }

    const material = await RawMaterial.create({
        userId: req.user._id,
        name,
        quantity,
        unit,
        minimumStockThreshold
    });

    res.status(201).json(material);
});

// @desc    Update a raw material
// @route   PUT /api/materials/:id
// @access  Private
const updateMaterial = asyncHandler(async (req, res) => {
    const material = await RawMaterial.findById(req.params.id);

    if (!material) {
        res.status(404);
        throw new Error('Material not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the material user
    if (material.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedMaterial = await RawMaterial.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(updatedMaterial);
});

// @desc    Delete a raw material
// @route   DELETE /api/materials/:id
// @access  Private
const deleteMaterial = asyncHandler(async (req, res) => {
    const material = await RawMaterial.findById(req.params.id);

    if (!material) {
        res.status(404);
        throw new Error('Material not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the material user
    if (material.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await material.deleteOne();

    res.json({ id: req.params.id });
});

module.exports = {
    getMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial
};
