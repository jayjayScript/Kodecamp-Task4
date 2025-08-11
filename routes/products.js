const express = require('express');
const Product = require('../models/product');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const upload = require('../utility/imageUpload')
const router = express.Router();
const Brand = require('../models/brand')

// GET /products 
router.get('/:page/:limit', async (req, res) => {
    try {

        const {page, limit} = req.params;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;

        if(isNaN(pageNum) || pageNum < 1){
            return res.status(400).json({
                success: false,
                message: 'Page numbe must be a positive integer'
            })
        }

        if(isNaN(limitNum) || limitNum < 1 || limitNum > 100){
            return res.status(400).json({
                success: false,
                message: 'Limit must be a positive integer less than 100'
            })
        }

        const options = {
            page: pageNum,
            limit: limitNum,
            populate: [
                { path: 'brand', select: 'brandName' },
                { path: 'ownerId', select: 'fullName email' }
            ],
            sort: { createdAt: -1 }
        }

        const products = await Product.paginate({}, options)
        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No product found'
            })
        }

        res.status(200).json({
            success: true,
            message: `Products found`,
            data: {
                products: products.docs,
                pagination: {
                    currentPage: products.page,
                    totalPages: products.totalPages,
                    totalProducts: products.totalDocs,
                    hasNextPage: products.hasNextPage,
                    hasPrevPage: products.hasPrevPage,
                    nextPage: products.nextPage,
                    prevPage: products.prevPage
                }
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        })
    }
})

router.get('/:brand/:page/:limit', async (req, res) => {
    try {

        const { brand, page, limit } = req.params;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;

        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                success: false,
                message: 'Page number must be a positive integer'
            })
        }

        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return res.status(400).json({
                success: false,
                message: 'Limit must be a positive integer between 1 and 100'
            })
        }

        const options = {
            page: pageNum,
            limit: limitNum,
            populate: [
                { path: 'brand', select: 'brandName' },
                { path: 'ownerId', select: 'fullName email' }
            ],
            sort: { createdAt: -1 }
        }

        const products = await Product.paginate({ brand: brand }, options);
        res.json({
            success: true,
            data: {
                products: products.docs,
                pagination: {
                    currentPage: products.page,
                    totalPages: products.totalPages,
                    totalProducts: products.totalDocs,
                    hasNextPage: products.hasNextPage,
                    hasPrevPage: products.hasPrevPage,
                    nextPage: products.nextPage,
                    prevPage: products.prevPage
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /products - Add new product (Admin only)
router.post('/', authMiddleware, adminOnly, upload.array('productImages', 5), async (req, res) => {
    try {
        const { productName, cost, description, brand } = req.body;

        if (!productName || !cost || !description) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one product image is required' });
        }

        const brandExists = await Brand.findById(brand);
        if (!brandExists) {
            return res.status(400).json({ success: false, message: 'Invalid brand' });
        }

        const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

        const product = new Product({
            productName,
            ownerId: req.user.userId,
            cost,
            productImages: imageUrls,
            description,
            brand: brand
        });

        const savedProduct = await product.save();
        const populatedProduct = await Product.findById(savedProduct._id).populate('ownerId', 'fullName email');

        res.status(201).json({ success: true, data: populatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /products/:id - Delete product
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;