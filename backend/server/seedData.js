const mongoose = require('mongoose');
const User = require('./models/User');
const TeamMember = require('./models/TeamMember');

const DB_URL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/mapmark';

async function seedData() {
  try {
    await mongoose.connect(DB_URL);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await TeamMember.deleteMany({});

    // Create test users
    const users = [
      {
        name: 'Олександр Петренко',
        email: 'alex@example.com',
        password: 'Test123',
        city: 'Київ',
        country: 'Україна',
        bio: 'Люблю подорожувати та відкривати нові місця'
      },
      {
        name: 'Марія Іваненко',
        email: 'maria@example.com',
        password: 'Test123',
        city: 'Львів',
        country: 'Україна',
        bio: 'Фотограф та блогер про подорожі'
      },
      {
        name: 'Дмитро Коваленко',
        email: 'dmitro@example.com',
        password: 'Test123',
        city: 'Одеса',
        country: 'Україна',
        bio: 'Гід та експерт з туризму'
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${user.name}`);
    }

    // Create team members
    const teamMembers = [
      {
        name: 'Артем Поліщук',
        role: 'Засновник та CEO',
        bio: 'Досвідчений розробник з пристрастю до подорожей та технологій',
        avatar: null,
        isActive: true,
        order: 1
      },
      {
        name: 'Анна Шевченко',
        role: 'Head of Product',
        bio: 'Експерт з UX/UI дизайну та продуктового менеджменту',
        avatar: null,
        isActive: true,
        order: 2
      },
      {
        name: 'Максим Бондаренко',
        role: 'Lead Developer',
        bio: 'Full-stack розробник з 8+ років досвіду',
        avatar: null,
        isActive: true,
        order: 3
      }
    ];

    for (const memberData of teamMembers) {
      const member = new TeamMember(memberData);
      await member.save();
      console.log(`Created team member: ${member.name}`);
    }

    console.log('Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();