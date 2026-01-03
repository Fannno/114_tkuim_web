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

// 預先建立管理員帳號（密碼: pass1234）
db.users.insertOne({
  email: 'admin@example.com',
  passwordHash: '$2b$10$tvZgP/z81Y4uzDCpqbbjXOUpQnDD1TqooB9IcrnHNAOI6Sum.E9WW',
  role: 'admin',
  createdAt: new Date()
});
