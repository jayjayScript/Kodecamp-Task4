const express = require('express');
const router = express.Router();
const {authMiddleware, adminOnly} = require('../middleware/auth')

const Brand = require('../models/brand');

router.get('/', authMiddleware, adminOnly, async (req, res) => {
    try {
        const brands = await Brand.find().populate('brandName');
    if (!brands) {
        return res.status(404).json({
            success: false,
            message: 'No brand found'
        })
    }
    res.json({ success: true, data: brands })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })  
    }
})

router.post('/', authMiddleware, adminOnly, async (req, res) => {

    try {
        const { brandName } = req.body;
        if (!brandName) {
            return res.status(400).json({
                success: false,
                message: 'Please enter brand name'
            })
        }

        const brand = new Brand({
            brandName
        });

        const savedBrand = await brand.save();
        res.status(201).json({
            success: true,
            message: 'Brand created',
            brand: savedBrand
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }

})

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { brandName } = req.body;
        if (!brandName){
            return res.status(400).json({
                success: false,
                message: 'Please enter brand name'
            })
        }

        const updatedBrand = await Brand.findByIdAndUpdate(id, { brandName });
        res.status(200).json({
            success: true,
            message: 'Brand updated',
            data: updatedBrand
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
})

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        // const { brandName } = req.body;
        const brand = await Brand.findById(id);
        if (!brand){
            return res.status(400).json({
                success: false,
                message: 'Brand does not exist'
            })
        }

        const deletedBrand = await Brand.findByIdAndDelete(id, { brand });
        res.status(200).json({
            success: true,
            message: 'Brand updated',
            data: deletedBrand
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
})

module.exports = router;