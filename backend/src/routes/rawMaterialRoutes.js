const express = require('express');
const router = express.Router();
const {
    getMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial
} = require('../controllers/rawMaterialController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMaterials).post(protect, createMaterial);
router.route('/:id').put(protect, updateMaterial).delete(protect, deleteMaterial);

module.exports = router;
