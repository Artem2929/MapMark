const mongoose = require('mongoose');
const TeamMember = require('./models/TeamMember');

const DB_URL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/mapmark';

const teamMembers = [
  {
    name: 'Артем Поліщук',
    role: 'Засновник & CEO',
    bio: 'Пристрасний мандрівник з досвідом у розробці продуктів. Створив MapMark, щоб допомогти людям відкривати нові місця та ділитися враженнями.',
    order: 1
  },
  {
    name: 'Марія Коваленко',
    role: 'Head of Design',
    bio: 'UX/UI дизайнер з 5+ років досвіду. Відповідає за створення інтуїтивного та красивого інтерфейсу MapMark.',
    order: 2
  },
  {
    name: 'Олександр Петренко',
    role: 'Lead Developer',
    bio: 'Full-stack розробник, який втілює дизайн у життя. Спеціалізується на React, Node.js та мобільній розробці.',
    order: 3
  },
  {
    name: 'Анна Сидоренко',
    role: 'Community Manager',
    bio: 'Керує спільнотою MapMark, організовує події та допомагає користувачам отримати максимум від платформи.',
    order: 4
  }
];

async function seedTeam() {
  try {
    await mongoose.connect(DB_URL);
    console.log('Connected to MongoDB');

    // Insert team members one by one to avoid duplicates
    for (const member of teamMembers) {
      const existing = await TeamMember.findOne({ name: member.name });
      if (!existing) {
        await TeamMember.create(member);
        console.log(`Created team member: ${member.name}`);
      } else {
        console.log(`Team member already exists: ${member.name}`);
      }
    }

    console.log('Team seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding team:', error);
    process.exit(1);
  }
}

seedTeam();