import { getDB } from '../db.js'; 

const collection = () => getDB().collection('users');
export async function findUserByEmail(email) {
  return collection().findOne({ email });
}

export async function createUser({ email, passwordHash, role = 'student' }) {
  const doc = { email, passwordHash, role, createdAt: new Date() };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}
