// server/routes/signup.js
import express from 'express';
import { ObjectId } from 'mongodb'; 
import {
  createParticipant,
  findAll,           
  findByOwner,       
  findById,          
  deleteParticipant
} from '../repositories/participants.js';

// 加入認證中間件
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 所有路由都需要登入
router.use(authMiddleware);


router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }
    
    // 建立資料時帶上 ownerId
    const id = await createParticipant({ 
      name, 
      email, 
      phone, 
      ownerId: req.user.id  
    });
    
    res.status(201).json({ id });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: '此 email 已報名過' });
    }
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    // admin 看全部，學生只看自己的
    const data = req.user.role === 'admin'
      ? await findAll()
      : await findByOwner(req.user.id);
    
    res.json({ 
      total: data.length, 
      data: data.map(serializeParticipant) 
    });
  } catch (error) {
    next(error);
  }
});


router.delete('/:id', async (req, res, next) => {
  try {
    const participant = await findById(req.params.id);    
    // 找不到 → 404
    if (!participant) {
      return res.status(404).json({ error: '找不到資料' });
    }
    // 不是自己且不是 admin → 403
    if (participant.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '權限不足' });
    }    
    // 通過 → 刪除
    await deleteParticipant(req.params.id);
    res.json({ message: '刪除完成' });    
  } catch (error) {
    next(error);
  }
});

// 格式化輸出資料（隱藏敏感資訊）
function serializeParticipant(participant) {
  return {
    id: participant._id,
    name: participant.name,
    email: participant.email,
    phone: participant.phone,
    createdAt: participant.createdAt
    // 不回傳 ownerId 給前端
  };
}

export default router;
