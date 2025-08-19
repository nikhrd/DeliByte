// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Mongoose Schemas (Move menuItemSchema to the models folder in a real app)
// We will define it here for simplicity and to make it a self-contained file.
const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
        type: String,
        required: true,
        enum: ['burgers', 'pizzas', 'desserts', 'beverages']
    },
    image: { type: String, default: '' },
    available: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },
    items: [{
        _id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
    }],
    total: { type: Number, required: true },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']
    },
    orderDate: { type: Date, default: Date.now },
    estimatedDelivery: { type: Date },
    notes: { type: String }
});

// Models
const Order = mongoose.model('Order', orderSchema);

// API Routes

// GET all menu items
app.get('/api/menu', async (req, res) => {
    try {
        const menuItems = await MenuItem.find({});
        res.json(menuItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ error: 'Failed to fetch menu items' });
    }
});

// Create new order
app.post('/api/orders', async (req, res) => {
    try {
        const orderId = 'ORDER' + Date.now() + Math.random().toString(36).substr(2, 9);

        // Calculate estimated delivery time (30-45 minutes from now)
        const estimatedDelivery = new Date();
        estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + Math.floor(Math.random() * 15) + 30);

        const orderData = {
            ...req.body,
            orderId,
            estimatedDelivery
        };

        const order = new Order(orderData);
        await order.save();

        // In a real application, you would send confirmation email/SMS here
        console.log(`New order received: ${orderId}`);
        console.log('Customer:', order.customer.name);
        console.log('Total:', `₹${order.total.toFixed(2)}`);

        res.status(201).json({
            message: 'Order placed successfully',
            orderId: orderId,
            estimatedDelivery: estimatedDelivery,
            order: order
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(400).json({ error: 'Failed to create order' });
    }
});

// Get order by ID
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Update order status (admin functionality)
app.put('/api/orders/:orderId/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(400).json({ error: 'Failed to update order status' });
    }
});

// Get all orders (admin functionality)
app.get('/api/orders', async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const query = status ? { status } : {};

        const orders = await Order.find(query)
            .sort({ orderDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(query);

        res.json({
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Restaurant API is running',
        timestamp: new Date().toISOString()
    });
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Restaurant Server is running!`);
    console.log(`Server: http://localhost:${PORT}`);
});