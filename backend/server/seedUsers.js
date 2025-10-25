const mongoose = require('mongoose');
const User = require('./models/User');

const DB_URL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/mapmark';

const testUsers = [
  {
    name: 'Олександр Петренко',
    firstName: 'Олександр',
    lastName: 'Петренко',
    email: 'oleksandr.petrenko@example.com',
    password: 'password123',
    age: 24,
    country: 'Україна',
    city: 'Київ',
    gender: 'чоловіча',
    isOnline: true
  },
  {
    name: 'Марина Коваленко',
    firstName: 'Марина',
    lastName: 'Коваленко',
    email: 'marina.kovalenko@example.com',
    password: 'password123',
    age: 28,
    country: 'Україна',
    city: 'Львів',
    gender: 'жіноча',
    isOnline: false
  },
  {
    name: 'Андрій Сидоренко',
    firstName: 'Андрій',
    lastName: 'Сидоренко',
    email: 'andriy.sydorenko@example.com',
    password: 'password123',
    age: 32,
    country: 'Україна',
    city: 'Одеса',
    gender: 'чоловіча',
    isOnline: true
  },
  {
    name: 'Ірина Мельник',
    firstName: 'Ірина',
    lastName: 'Мельник',
    email: 'iryna.melnyk@example.com',
    password: 'password123',
    age: 26,
    country: 'Україна',
    city: 'Харків',
    gender: 'жіноча',
    isOnline: false
  },
  {
    name: 'Сергій Бондар',
    firstName: 'Сергій',
    lastName: 'Бондар',
    email: 'sergiy.bondar@example.com',
    password: 'password123',
    age: 30,
    country: 'Україна',
    city: 'Дніпро',
    gender: 'чоловіча',
    isOnline: true
  },
  {
    name: 'Анна Коваль',
    firstName: 'Анна',
    lastName: 'Коваль',
    email: 'anna.koval@example.com',
    password: 'password123',
    age: 22,
    country: 'Україна',
    city: 'Київ',
    gender: 'жіноча',
    isOnline: true
  },
  {
    name: 'Дмитро Шевченко',
    firstName: 'Дмитро',
    lastName: 'Шевченко',
    email: 'dmytro.shevchenko@example.com',
    password: 'password123',
    age: 35,
    country: 'Україна',
    city: 'Львів',
    gender: 'чоловіча',
    isOnline: false
  },
  {
    name: 'Оксана Іваненко',
    firstName: 'Оксана',
    lastName: 'Іваненко',
    email: 'oksana.ivanenko@example.com',
    password: 'password123',
    age: 29,
    country: 'Україна',
    city: 'Одеса',
    gender: 'жіноча',
    isOnline: true
  }
];

async function seedUsers() {
  try {
    await mongoose.connect(DB_URL);
    console.log('Connected to MongoDB');

    // Clear existing test users
    await User.deleteMany({ email: { $in: testUsers.map(u => u.email) } });
    console.log('Cleared existing test users');

    // Insert new users
    const createdUsers = await User.insertMany(testUsers);
    console.log(`Created ${createdUsers.length} test users`);

    console.log('Test users:');
    createdUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ID: ${user._id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();