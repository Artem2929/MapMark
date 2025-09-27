// Simple script to add team data via API
const teamMembers = [
  {
    name: 'Артем Поліщук',
    role: 'Засновник & CEO',
    bio: 'Пристрасний мандрівник з досвідом у розробці продуктів. Створив MapMark, щоб допомогти людям відкривати нові місця та ділитися враженнями.',
    order: 1,
    isActive: true
  },
  {
    name: 'Марія Коваленко',
    role: 'Head of Design',
    bio: 'UX/UI дизайнер з 5+ років досвіду. Відповідає за створення інтуїтивного та красивого інтерфейсу MapMark.',
    order: 2,
    isActive: true
  },
  {
    name: 'Олександр Петренко',
    role: 'Lead Developer',
    bio: 'Full-stack розробник, який втілює дизайн у життя. Спеціалізується на React, Node.js та мобільній розробці.',
    order: 3,
    isActive: true
  },
  {
    name: 'Анна Сидоренко',
    role: 'Community Manager',
    bio: 'Керує спільнотою MapMark, організовує події та допомагає користувачам отримати максимум від платформи.',
    order: 4,
    isActive: true
  }
];

async function addTeamData() {
  try {
    for (const member of teamMembers) {
      const response = await fetch('http://localhost:3000/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member)
      });
      
      if (response.ok) {
        console.log(`Added team member: ${member.name}`);
      } else {
        console.log(`Failed to add: ${member.name}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  addTeamData();
}