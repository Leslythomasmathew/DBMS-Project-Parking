const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Slot = require('../models/Slot');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();
connectDB();

const seedData = async () => {
  try {
    await Slot.deleteMany();
    await User.deleteMany();
    await require('../models/Booking').deleteMany();

    const createdUser = await User.create({
      name: 'Admin Manager',
      email: 'admin@parking.com',
      password: 'password123',
      phone: '1234567890',
      role: 'manager'
    });

    await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '0987654321',
      role: 'user'
    });

    const slots = [];
    for (let i = 1; i <= 20; i++) {
      slots.push({
        slotNumber: `A-${i}`,
        type: i <= 5 ? 'premium' : 'regular',
        pricePerHour: i <= 5 ? 20 : 10,
        status: 'available'
      });
    }

    await Slot.insertMany(slots);
    
    console.log('Database Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
