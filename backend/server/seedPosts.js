const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User');

const seedPosts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mapmark');
    
    // Отримуємо користувачів для авторів постів
    const users = await User.find().limit(5);
    
    if (users.length === 0) {
      console.log('Спочатку створіть користувачів');
      return;
    }

    const samplePosts = [
      {
        author: users[0]._id,
        content: 'Неймовірний захід сонця в Карпатах! Це місце просто зачаровує своєю красою.',
        images: [{
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          publicId: 'sample1'
        }],
        type: 'image',
        location: 'Карпати, Україна',
        mood: 'excited'
      },
      {
        author: users[1]._id,
        content: 'Відвідав сьогодні новий ресторан у центрі міста. Кухня просто неперевершена!',
        images: [{
          url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
          publicId: 'sample2'
        }],
        type: 'image',
        location: 'Київ, Україна'
      },
      {
        author: users[2]._id,
        content: 'Прогулянка парком вранці - найкращий спосіб почати день. Свіже повітря та красива природа заряджають енергією на весь день.',
        type: 'text',
        location: 'Парк Шевченка, Київ',
        mood: 'relaxed'
      },
      {
        author: users[0]._id,
        content: 'Вражаючий вид на море з вершини гори. Варто було піднятися!',
        images: [{
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          publicId: 'sample3'
        }],
        type: 'image',
        location: 'Крим, Україна',
        mood: 'happy'
      },
      {
        author: users[3]._id,
        content: 'Сьогодні відкрив для себе нове кафе з неймовірною кавою та затишною атмосферою.',
        images: [{
          url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
          publicId: 'sample4'
        }],
        type: 'image',
        location: 'Львів, Україна'
      },
      {
        author: users[4]._id,
        content: 'Музей історії - це завжди цікаво! Дізнався багато нового про наше минуле.',
        type: 'text',
        location: 'Національний музей історії України',
        mood: 'thoughtful'
      }
    ];

    // Видаляємо старі пости
    await Post.deleteMany({});
    
    // Створюємо нові пости
    const posts = await Post.create(samplePosts);
    
    // Додаємо деякі реакції та коментарі
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      
      // Додаємо реакції
      const reactionCount = Math.floor(Math.random() * 10) + 1;
      for (let j = 0; j < reactionCount; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const reactionTypes = ['like', 'love', 'wow'];
        const randomType = reactionTypes[Math.floor(Math.random() * reactionTypes.length)];
        
        post.reactions.push({
          userId: randomUser._id,
          type: randomType
        });
      }
      
      // Додаємо коментарі
      const commentCount = Math.floor(Math.random() * 5);
      const sampleComments = [
        'Дуже красиво!',
        'Чудове місце!',
        'Обов\'язково відвідаю',
        'Дякую за рекомендацію',
        'Неймовірно!'
      ];
      
      for (let j = 0; j < commentCount; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        
        post.comments.push({
          author: randomUser._id,
          content: randomComment
        });
      }
      
      await post.save();
    }
    
    console.log(`Створено ${posts.length} постів`);
    process.exit(0);
  } catch (error) {
    console.error('Помилка при створенні постів:', error);
    process.exit(1);
  }
};

seedPosts();