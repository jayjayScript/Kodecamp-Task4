const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const {createServer} = require('http');
const { Server } = require('socket.io');

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const brandRoutes = require("./routes/brand");
const orderRoutes = require("./routes/order");

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch(() => {
    console.log("Error connecting to MongoDB");
});

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/auth', authRoutes);
app.use('/products', productRoutes); 
app.use('/brand', brandRoutes); 
app.use('/order', orderRoutes);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'E-commerce API is running!'
    });
});

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    io.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


module.exports = httpServer;