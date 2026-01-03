import express from 'express';
import bcrypt from 'bcrypt';
import { findUserByEmail,createUser } from '../repositories/users.js';
import { generateToken } from '../utils/generateToken.js';

const router = express.Router();

// 註冊路由
router.post('/signup', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 檢查必填
    if (!email || !password) {
      return res.status(400).json({ error: '請輸入 email 和密碼' });
    }

    // 檢查 Email 是否已存在
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: '此 Email 已被註冊' });
    }

    // 密碼雜湊
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 建立使用者 (預設角色為 student)
    const newUser = await createUser({ 
      email, 
      passwordHash, 
      role: role || 'student' 
    });

    // 回傳成功 (不回傳密碼)
    res.status(201).json({
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      message: '註冊成功'
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 登入路由
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: '請輸入 email 和密碼' });
    }
    
    // 查找使用者
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: '帳號或密碼錯誤' });
    }
    
    // 驗證密碼
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: '帳號或密碼錯誤' });
    }
    
    // 生成 token
    const token = generateToken(user);
    
    // 回傳結果
    res.json({
      token,
      expiresIn: '2h',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

export default router;