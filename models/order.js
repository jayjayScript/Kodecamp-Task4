const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalCost: {
        type: Number,
    },
    shippingStatus: {
        type: String,
        enum: ['pending', 'shipped', 'delivered'],
        default: 'pending'
    }
})

orderSchema.pre('save', async function(next) {
    const product = await mongoose.model('Product').findById(this.productId);
    this.productName = product.productName;
    this.totalCost = product.cost * this.quantity;
    next()
});

const Product = mongoose.model('Order', orderSchema);
module.exports = Product;
