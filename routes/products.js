const express = require('express');
const Product = require('../models/product');
const authMiddleware = require('../middleware/auth');
const upload = require('../utility/imageUpload')
const router = express.Router();

// GET /products - Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('ownerId', 'fullName email');
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /products - Add new product (Admin only)
router.post('/', authMiddleware, upload.array('productImages', 5),async (req, res) => {
    try {
        const { productName, cost, productImages, description } = req.body;

        // Check admin permission
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        if (!productName || !cost || !description) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one product image is required' });
        }

        const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

        const product = new Product({
            productName,
            ownerId: req.user.userId,
            cost,
            productImages: imageUrls,
            description
        });

        const savedProduct = await product.save();
        const populatedProduct = await Product.findById(savedProduct._id).populate('ownerId', 'fullName email');

        res.status(201).json({ success: true, data: populatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /products/:id - Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Check permission (admin or owner)
        if (req.user.role !== 'admin' && product.ownerId.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;