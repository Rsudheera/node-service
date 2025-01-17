const mongoose = require('mongoose');
const Order = require('./models/orderModel'); 
const { v4: uuidv4 } = require('uuid');

// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    await mongoose.connect('mongodb://0.0.0.0:27017/ordersdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Generate random data
const generateRandomData = () => {
  const items = ['Laptop', 'Headphones', 'Keyboard', 'Mouse', 'Monitor'];
  const shops = ['ShopA', 'ShopB', 'ShopC', 'ShopD', 'ShopE'];

  return {
    _id: uuidv4(),
    itemName: items[Math.floor(Math.random() * items.length)],
    quantity: Math.floor(Math.random() * 100) + 1, // Random quantity between 1 and 100
    // isSynced: Math.random() > 0.5, // Random true/false
    isSynced: false,
    // shopId: shops[Math.floor(Math.random() * shops.length)],
    shopId: 'shop124'
  };
};

// Seed database with 2000 orders
const seedDatabase = async () => {
  try {
    const orders = [];
    for (let i = 0; i < 2000; i++) {
      orders.push(generateRandomData());
    }

    await Order.insertMany(orders);
    console.log('Successfully seeded 2000 orders into the database');
  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    mongoose.connection.close();
  }
};

const runSeeder = async () => {
  await connectToDatabase();
  await seedDatabase();
};

runSeeder();
