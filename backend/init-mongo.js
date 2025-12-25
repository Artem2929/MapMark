// MongoDB initialization script
db = db.getSiblingDB('mapmark');

// Create collections
db.createCollection('users');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": -1 });
db.users.createIndex({ "isActive": 1 });

print('Database initialized successfully');