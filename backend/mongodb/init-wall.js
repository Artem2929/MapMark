// MongoDB initialization script for Wall collections

db = db.getSiblingDB('mapmark');

// Create posts collection with indexes
db.createCollection('posts');

// Create indexes for better performance
db.posts.createIndex({ "author": 1, "createdAt": -1 });
db.posts.createIndex({ "createdAt": -1 });
db.posts.createIndex({ "reactions.userId": 1 });
db.posts.createIndex({ "isDeleted": 1 });
db.posts.createIndex({ "type": 1 });

// Insert sample posts
db.posts.insertMany([
  {
    author: ObjectId("507f1f77bcf86cd799439011"),
    content: "Щойно відвідав чудове кафе в центрі міста! Рекомендую всім спробувати їхній авторський кави та десерти. Атмосфера просто неймовірна! ☕️✨",
    images: [],
    type: "text",
    location: "Київ, Україна",
    mood: "happy",
    reactions: [
      {
        userId: ObjectId("507f1f77bcf86cd799439012"),
        type: "like",
        createdAt: new Date()
      },
      {
        userId: ObjectId("507f1f77bcf86cd799439013"),
        type: "love",
        createdAt: new Date()
      }
    ],
    comments: [
      {
        author: ObjectId("507f1f77bcf86cd799439012"),
        content: "Де саме це кафе? Хочу теж спробувати!",
        replies: [
          {
            author: ObjectId("507f1f77bcf86cd799439011"),
            content: "На вулиці Хрещатик, 15. Називається \"Coffee Dreams\"",
            createdAt: new Date()
          }
        ],
        createdAt: new Date()
      }
    ],
    shares: 3,
    views: 45,
    isDeleted: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    author: ObjectId("507f1f77bcf86cd799439011"),
    content: "Сьогодні був чудовий день для прогулянки парком! Природа вже почала змінювати кольори. 🍂🌳",
    images: [],
    type: "text",
    location: "Парк Шевченка, Київ",
    mood: "relaxed",
    reactions: [
      {
        userId: ObjectId("507f1f77bcf86cd799439011"),
        type: "like",
        createdAt: new Date()
      }
    ],
    comments: [],
    shares: 1,
    views: 23,
    isDeleted: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  }
]);

print("Wall collections and sample data created successfully!");