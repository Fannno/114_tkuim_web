// routes/signup.js
import { Router } from 'express';
import { nanoid } from 'nanoid';

const router = Router();
const participants = [];

const requiredFields = ['name', 'email', 'phone', 'password', 'interests'];

function validatePayload(body) {
  // 檢查必填欄位
  for (const field of requiredFields) {
    if (!body[field]) {
      return `${field} 為必填`;
    }
  }

  // 姓名
  if (!body.name.trim()) return '姓名不可為空';

  // Email 驗證
  if (!/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(body.email)) {
    return 'Email 格式不正確';
  }

  // 手機
  if (!/^09\d{8}$/.test(body.phone)) {
    return '手機需為 09 開頭 10 碼';
  }

  // 興趣至少 1
  if (!Array.isArray(body.interests) || body.interests.length === 0) {
    return '至少選擇一個興趣';
  }

  // 密碼長度
  if (body.password.length < 8) {
    return '密碼需至少 8 碼';
  }

  // 驗證密碼
  if (body.password !== body.confirmPassword) {
    return '密碼不一致';
  }
  return null; // 通過驗證
}

// GET：報名清單
router.get('/', (req, res) => {
  res.json({ total: participants.length, data: participants });
});

// POST：建立新報名
router.post('/', (req, res) => {
  const errorMessage = validatePayload(req.body || {});
  if (errorMessage) {
    return res.status(400).json({ error: errorMessage });
  }

  const newParticipant = {
    id: nanoid(8),
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    interests: req.body.interests,
    createdAt: new Date().toISOString()
  };

  participants.push(newParticipant);
  res.status(201).json({ message: '報名成功', participant: newParticipant });
});

// DELETE：刪除某位參加者
router.delete('/:id', (req, res) => {
  const index = participants.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '找不到這位參與者' });
  }

  const [removed] = participants.splice(index, 1);
  res.json({ message: '已取消報名', participant: removed });
});

export { router };
