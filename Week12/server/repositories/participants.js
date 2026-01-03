import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';

const collection = () => getDB().collection('participants');

// 新增報名
export async function createParticipant(data) {
  const result = await collection().insertOne({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return result.insertedId;
}

// 查詢全部資料
export async function findAll() {
  return await collection()
    .find()
    .sort({ createdAt: -1 })
    .toArray();
}

// 只查詢 ownerId 是自己的資料 
export async function findByOwner(ownerId) {
  return await collection()
    .find({ ownerId: ownerId }) // 過濾
    .sort({ createdAt: -1 })
    .toArray();
}

// 查詢單筆資料
export async function findById(id) {
  return await collection().findOne({ _id: new ObjectId(id) });
}

//  刪除資料 
export async function deleteParticipant(id) {
  return collection().deleteOne({ _id: new ObjectId(id) });
}