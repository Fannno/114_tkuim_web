// Week12/docker/mongo-init.js
db = db.getSiblingDB('week12');

db.createUser({
  user: 'week12-admin',
  pwd: 'week12-pass',
  roles: [{ role: 'readWrite', db: 'week12' }]
});

// 1. participants 集合加入索引，準備 ownerId 欄位
db.createCollection('participants');
db.participants.createIndex({ ownerId: 1 });

// 2. users 集合 + email 唯一索引
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });

// 預先建立管理員帳號（pwd 需先用 bcrypt 雜湊）
db.users.insertOne({
  email: 'admin@example.com',
  passwordHash: '$2b$10$4P6uyrAvH/e0K9..exampleHash12345',
  role: 'admin',
  createdAt: new Date()
});
