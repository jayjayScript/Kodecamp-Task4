const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product')
const { authMiddleware, authorize, adminOnly } = require('../middleware/auth')

router.get('/', authMiddleware, adminOnly, async (req, res) => {
    try {
        const orders = await Order.find({})
        res.status(200).json({
            success: true,
            orders
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
})

router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
        res.status(200).json({
            success: true,
            order
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
})

router.post('/order', authMiddleware, authorize, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Each field is required to make order'
            })
        }

        const productExists = await Product.findById(productId)
        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (productExists.stockStatus === 'out-of-stock') {
            return res.status(400).json({
                success: false,
                message: 'Product is out of stock'
            });
        }

        const userId = req.user._id
        const order = new Order({
            productName: productExists.productName,
            productId,
            quantity,
            user: userId
        })

        await order.save()

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: {
                id: order._id,
                productName: order.productName,  // Now available after save
                productId: order.productId,
                quantity: order.quantity,
                totalCost: order.totalCost,      // Now calculated and available
                shippingStatus: order.shippingStatus,
                user: order.user,
                createdAt: order.createdAt
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
})

router.patch('/:id', authMiddleware, adminOnly , async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const { shippingStatus } = req.body;
        if(!shippingStatus) {
            return res.status(400).json({
                success: false,
                message: 'Shipping status is required'
            });
        }
        const updatedOrder = await Order.findByIdAndUpdate(order, { shippingStatus }, { new: true });
        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            order: updatedOrder
        })    

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
})

module.exports = router;