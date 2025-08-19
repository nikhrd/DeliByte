const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant';

// Menu Item Schema
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

const sampleMenuItems = [
    {
        name: 'Cheese Burger',
        description: 'Juicy patty topped with melted cheese, lettuce, tomato, onion served on a toasted bun',
        price: 150,
        category: 'burgers',
        image: 'images/cheeseburger.jpg'
    },
    {
        name: 'BBQ Chicken pizza',
        description: 'Barbecue chicken pizza with grilled onions and cheese',
        price: 250,
        category: 'pizzas',
        image: 'images/bbq_pizza.jpg'
    },
    {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice, no added sugar',
        price: 40,
        category: 'beverages',
        image: 'images/orange_juice.jpg'
    },
    {
        name: 'Chocolate Lava Cake',
        description: 'Rich chocolate cake with molten center, served with vanilla ice cream',
        price: 110,
        category: 'desserts',
        image: 'images/chocolate_cake.jpg'
    },
    {
        name: 'Chicken Burger',
        description: 'Grilled or fried chicken breast patty, topped with lettuce, tomato, cheese served on a bun.',
        price: 130,
        category: 'burgers',
        image: 'images/chicken_burger.jpg'
    },
    {
        name: 'Margherita Pizza',
        description: 'Fresh tomatoes, mozzarella cheese, basil leaves on crispy thin crust',
        price: 160,
        category: 'pizzas',
        image: 'images/margherita_pizza.jpg'
    },
    {
        name: 'Iced Coffee',
        description: 'Cold brew coffee with milk and ice, perfectly refreshing',
        price: 100,
        category: 'beverages',
        image: 'images/iced_coffee.avif'
    },
    {
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
        price: 120,
        category: 'desserts',
        image: 'images/tiramisu.jpg'
    },
    {
        name: 'Mushroom Swiss Burger',
        description: 'Burger topped with sauteed mushrooms, Swiss cheese, lettuce, and mayo',
        price: 160,
        category: 'burgers',
        image: 'images/mushroom_burger.jpg'
    },
    {
        name: 'Pepperoni Pizza',
        description: 'Classic Italian pizza topped with spicy pepperoni slices,mozzarella cheese, and tomato sauce',
        price: 170,
        category: 'pizzas',
        image: 'images/pepperoni_pizza.jpg'
    },
    {
        name: 'Fruit Smoothie',
        description: 'Blended fresh fruits with yogurt and honey',
        price: 60,
        category: 'beverages',
        image: 'images/fruit_smoothie.jpg'
    },
    {
        name: 'Apple Pie',
        description: 'Homemade apple pie with cinnamon and vanilla ice cream',
        price: 160,
        category: 'desserts',
        image: 'images/apple_pie.jpg'
    },
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Clear existing data
        await MenuItem.deleteMany({});
        console.log('Cleared existing menu items');

        // Insert sample data
        await MenuItem.insertMany(sampleMenuItems);
        console.log(`Successfully inserted ${sampleMenuItems.length} menu items`);

        // Display summary
        const categoryCounts = await MenuItem.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        console.log('\nMenu Items by Category:');
        categoryCounts.forEach(cat => {
            console.log(`  ${cat._id}: ${cat.count} items`);
        });

        console.log('\n✅ Database seeding completed successfully!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    }
}

// Run the seed function
seedDatabase();