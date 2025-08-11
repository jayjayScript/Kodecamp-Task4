const mongoose = require("mongoose");
const paginate = require('mongoose-paginate-v2')

const productSchema = new mongoose.Schema({
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',  
        required: [true, 'Brand is required']
    },
    productName: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [2, 'Product name must be at least 2 characters'],
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auth',  
        required: [true, 'Owner ID is required']
    },
    cost: {
        type: Number,
        required: [true, 'Cost is required'],
        min: [0, 'Cost cannot be negative']
    },
    productImages: {
        type: [String], 
        required: [true, 'At least one product image is required'],
        validate: {
            validator: function(images) {
                return images.length > 0;
            },
            message: 'At least one product image is required'
        }
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    stockStatus: {
        type: String,
        required: [true, 'Stock status is required'],
        enum: {
            values: ['in-stock', 'out-of-stock', 'low-stock'],
            message: 'Stock status must be either in-stock, out-of-stock, or low-stock'
        },
        default: 'in-stock'
    }
}, {
    timestamps: true
});



productSchema.index({ ownerId: 1 });
productSchema.index({ productName: 'text', description: 'text' });
productSchema.plugin(paginate)

const Product = mongoose.model("Product", productSchema);

module.exports = Product;