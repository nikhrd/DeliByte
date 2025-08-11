// scripts/seedDatabase.js
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
        enum: ['appetizers', 'mains', 'desserts', 'beverages']
    },
    image: { type: String, default: '🍽️' },
    available: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

const sampleMenuItems = [
    // Appetizers
    {
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce, parmesan cheese, croutons with classic caesar dressing',
        price: 8.99,
        category: 'appetizers',
        image: '🥗'
    },
    {
        name: 'Buffalo Wings',
        description: 'Spicy chicken wings with blue cheese dip and celery sticks',
        price: 9.99,
        category: 'appetizers',
        image: '🍗'
    },
    {
        name: 'Garlic Bread',
        description: 'Toasted artisan bread with garlic butter and fresh herbs',
        price: 5.99,
        category: 'appetizers',
        image: '🥖'
    },
    {
        name: 'Stuffed Mushrooms',
        description: 'Button mushrooms stuffed with cream cheese, herbs, and breadcrumbs',
        price: 7.99,
        category: 'appetizers',
        image: '🍄'
    },
    {
        name: 'Mozzarella Sticks',
        description: 'Golden fried mozzarella with marinara sauce',
        price: 6.99,
        category: 'appetizers',
        image: '🧀'
    },

    // Main Courses
    {
        name: 'Margherita Pizza',
        description: 'Fresh tomatoes, mozzarella cheese, basil leaves on crispy thin crust',
        price: 12.99,
        category: 'mains',
        image: '🍕'
    },
    {
        name: 'Grilled Salmon',
        description: 'Atlantic salmon fillet with lemon herb seasoning and roasted vegetables',
        price: 18.99,
        category: 'mains',
        image: '🐟'
    },
    {
        name: 'Classic Beef Burger',
        description: 'Juicy beef patty with lettuce, tomato, onion, cheese, and fries',
        price: 14.99,
        category: 'mains',
        image: '🍔'
    },
    {
        name: 'Chicken Alfredo',
        description: 'Tender chicken breast with fettuccine in creamy alfredo sauce',
        price: 16.99,
        category: 'mains',
        image: '🍝'
    },
    {
        name: 'Fish Tacos',
        description: 'Grilled white fish with cabbage slaw, lime crema, and corn tortillas',
        price: 13.99,
        category: 'mains',
        image: '🌮'
    },
    {
        name: 'BBQ Ribs',
        description: 'Slow-cooked pork ribs with house BBQ sauce and coleslaw',
        price: 19.99,
        category: 'mains',
        image: '🥩'
    },
    {
        name: 'Vegetable Stir Fry',
        description: 'Mixed vegetables in teriyaki sauce served over jasmine rice',
        price: 11.99,
        category: 'mains',
        image: '🥬'
    },

    // Desserts
    {
        name: 'Chocolate Lava Cake',
        description: 'Rich chocolate cake with molten center, served with vanilla ice cream',
        price: 6.99,
        category: 'desserts',
        image: '🍰'
    },
    {
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
        price: 7.99,
        category: 'desserts',
        image: '🍮'
    },
    {
        name: 'Ice Cream Sundae',
        description: 'Three scoops of vanilla ice cream with chocolate sauce and cherry',
        price: 5.99,
        category: 'desserts',
        image: '🍨'
    },
    {
        name: 'Cheesecake',
        description: 'New York style cheesecake with berry compote',
        price: 6.49,
        category: 'desserts',
        image: '🍰'
    },
    {
        name: 'Apple Pie',
        description: 'Homemade apple pie with cinnamon and vanilla ice cream',
        price: 5.99,
        category: 'desserts',
        image: '🥧'
    },

    // Beverages
    {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice, no added sugar',
        price: 3.99,
        category: 'beverages',
        image: '🍊'
    },
    {
        name: 'Iced Coffee',
        description: 'Cold brew coffee with milk and ice, perfectly refreshing',
        price: 4.99,
        category: 'beverages',
        image: '☕'
    },
    {
        name: 'Fresh Lemonade',
        description: 'House-made lemonade with fresh lemons and mint',
        price: 3.49,
        category: 'beverages',
        image: '🍋'
    },
    {
        name: 'Milkshake',
        description: 'Thick and creamy milkshake - vanilla, chocolate, or strawberry',
        price: 4.99,
        category: 'beverages',
        image: '🥤'
    },
    {
        name: 'Hot Chocolate',
        description: 'Rich hot chocolate with whipped cream and marshmallows',
        price: 3.99,
        category: 'beverages',
        image: '☕'
    },
    {
        name: 'Fruit Smoothie',
        description: 'Blended fresh fruits with yogurt and honey',
        price: 5.49,
        category: 'beverages',
        image: '🥤'
    }
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