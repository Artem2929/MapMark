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

    // Створюємо більше постів для демонстрації infinite scroll
    const samplePosts = [];
    const contents = [
      'Неймовірний захід сонця в Карпатах! Це місце просто зачаровує своєю красою.',
      'Відвідав сьогодні новий ресторан у центрі міста. Кухня просто неперевершена!',
      'Прогулянка парком вранці - найкращий спосіб почати день.',
      'Вражаючий вид на море з вершини гори. Варто було піднятися!',
      'Сьогодні відкрив для себе нове кафе з неймовірною кавою.',
      'Музей історії - це завжди цікаво! Дізнався багато нового.',
      'Подорож по Україні - найкращий спосіб пізнати свою країну.',
      'Новий день - нові можливості! Починаю ранок з позитивним настроєм.',
      'Літній вечір у місті - магія, яку не можна передати словами.',
      'Книга і чашка кави - ідеальний спосіб провести вихідні.',
      'Мистецтво на вулицях міста завжди надихає і дає енергію.',
      'Перший сніг цього року! Зима офіційно почалася.',
      'Нова виставка в галереї вразила своєю оригінальністю.',
      'Спорт - це не тільки здоров’я, а й чудовий спосіб почати день.',
      'Маленькі радості життя роблять кожен день особливим.'
    ];
    
    const locations = [
      'Карпати, Україна',
      'Київ, Україна',
      'Львів, Україна',
      'Одеса, Україна',
      'Харків, Україна',
      'Дніпро, Україна'
    ];
    
    const images = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'
    ];
    
    // Створюємо 25 постів
    for (let i = 0; i < 25; i++) {
      const randomUser = users[i % users.length];
      const hasImage = Math.random() > 0.3; // 70% постів з зображенням
      
      samplePosts.push({
        author: randomUser._id,
        content: contents[i % contents.length],
        images: hasImage ? [{
          url: images[i % images.length],
          publicId: `sample${i + 1}`
        }] : [],
        type: hasImage ? 'image' : 'text',
        location: locations[i % locations.length],
        mood: ['happy', 'excited', 'relaxed', 'thoughtful'][i % 4]
      });
    }

    // Видаляємо старі пости
    await Post.deleteMany({});
    
    // Створюємо нові пости
    const posts = await Post.create(samplePosts);
    
    // Додаємо деякі реакції та коментарі
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      
      // Додаємо реакції (like/dislike)
      const likeCount = Math.floor(Math.random() * 15) + 1;
      const dislikeCount = Math.floor(Math.random() * 5);
      
      // Додаємо лайки
      for (let j = 0; j < likeCount; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        // Перевіряємо, що користувач ще не реагував
        const existingReaction = post.reactions.find(r => r.userId.toString() === randomUser._id.toString());
        if (!existingReaction) {
          post.reactions.push({
            userId: randomUser._id,
            type: 'like'
          });
        }
      }
      
      // Додаємо дизлайки
      for (let j = 0; j < dislikeCount; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const existingReaction = post.reactions.find(r => r.userId.toString() === randomUser._id.toString());
        if (!existingReaction) {
          post.reactions.push({
            userId: randomUser._id,
            type: 'dislike'
          });
        }
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
    
    console.log(`Створено ${posts.length} постів для демонстрації infinite scroll`);
    process.exit(0);
  } catch (error) {
    console.error('Помилка при створенні постів:', error);
    process.exit(1);
  }
};

seedPosts();