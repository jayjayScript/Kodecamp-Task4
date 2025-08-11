const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const authSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Please enter your full name"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please enter your email address"],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email address"
        ],
        trim: true
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [6, "Password must be at least 6 characters long"],
        trim: true
    },
    role: {
        type: String,
        required: [true, "Please enter a role"],
        enum: {
            values: ["admin", "customer"],
            message: "Role must be either 'admin' or 'customer'"
        },
        trim: true
    }
}, {
    timestamps: true
})


authSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch(error) {
        next(error)
    }
})

authSchema.methods.comparePassword =  async function(userPassword) {
    return await bcrypt.compare(userPassword, this.password);
}

authSchema.methods.toJSON = function() {
    const auth = this;
    const authObject = auth.toObject();
    delete authObject.password;
    return authObject;
}

module.exports = mongoose.model("Auth", authSchema);