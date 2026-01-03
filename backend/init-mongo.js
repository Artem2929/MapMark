// MongoDB initialization script
const DATABASE_NAME = 'pinPointt';
const db = db.getSiblingDB(DATABASE_NAME);

// Create collections
db.createCollection('users');

// Create indexes for users collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ isActive: 1 });

print('Database initialized successfully');
