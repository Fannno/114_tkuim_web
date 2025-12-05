// server/repositories/participants.js
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';

const collection = () => getDB().collection('participants');

export async function createParticipant(data) {
  const result = await collection().insertOne({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return result.insertedId;
}

export async function listParticipants(page = 1, limit = 10) {
  const col = collection();
  const skip = (page - 1) * limit;
  const items = await col.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  const total = await col.countDocuments(); // 總筆數
  return { items, total };
}


export async function updateParticipant(id, patch) {
  return collection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...patch, updatedAt: new Date() } }
  );
}

export async function deleteParticipant(id) {
  return collection().deleteOne({ _id: new ObjectId(id) });
}
