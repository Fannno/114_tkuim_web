## Week12 

### 啟動方式

### 1. 啟動 MongoDB
```bash
cd Week12
docker-compose up -d
```

### 2. 安裝套件並啟動後端
```bash
cd server
npm install
npm run dev
```
- 伺服器會在 http://localhost:3001 啟動
- 自動連接 MongoDB 並初始化資料

### 3. 啟動前端
使用 VS Code Live Server 開啟 `client/index.html`
- 預設網址: http://localhost:5501

## 測試帳號列表

### 管理員帳號
- **Email**: admin@example.com
- **密碼**: pass1234
- **角色**: admin
- **權限**: 可查看所有資料、刪除任何資料、完整系統管理權限

### 學員帳號 (可透過註冊建立)
- **Email**: student@example.com 或 student2@example.com
- **密碼**: student123
- **角色**: student
- **權限**: 只能查看自己的資料、只能刪除自己的資料、可以新增報名

## API 端點

### 認證相關
- `POST /auth/signup` - 使用者註冊
- `POST /auth/login` - 使用者登入

### 報名相關 (需要認證)
- `GET /api/signup` - 查看報名列表
- `POST /api/signup` - 新增報名
- `DELETE /api/signup/:id` - 刪除報名

## 測試方式

### 方法1: 使用前端介面測試
1. 開啟 http://localhost:5501
2. 用管理員帳號登入測試完整功能
3. 登出後用學員帳號測試權限限制
4. 驗證以下功能：
   - 登入/登出
   - 報名表單提交
   - 資料列表顯示
   - 刪除權限控制

### 方法2: 使用 API 測試檔案
開啟 `tests/api.http` 按順序執行：

1. **未登入測試** → 401 錯誤
2. **註冊新學員** → 201 成功
3. **管理員登入** → 取得 admin token
4. **學員登入** → 取得 student token
5. **學員報名** → 記錄 ownerId
6. **管理員查看全部** → 看到所有資料
7. **學員查看** → 只看到自己的資料
8. **學員嘗試刪除別人的** → 403 權限不足
9. **管理員刪除** → 200 成功

### 方法3: 命令列測試
```bash
# 測試未登入被拒
curl http://localhost:3001/api/signup

# 測試登入
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"pass1234"}'
```

## 安全特性
-  密碼使用 bcrypt 雜湊儲存
-  JWT token 有效期限 2 小時
-  API 路由全數受 JWT 保護
-  角色權限控制 (admin/student)
-  CORS 跨域保護
-  環境變數保護敏感資訊

## 資料庫結構

### users 集合
```javascript
{
  _id: ObjectId,
  email: String (唯一),
  passwordHash: String,
  role: String ('admin' | 'student'),
  createdAt: Date
}
```

### participants 集合
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  ownerId: String, // 建立者的 user._id
  createdAt: Date,
  updatedAt: Date
}
```

## 環境變數
```
PORT=3001
MONGODB_URI=mongodb://week12-admin:week12-pass@localhost:27017/week12?authSource=week12
ALLOWED_ORIGIN=http://localhost:5501
JWT_SECRET=your-secret-key
```

## 注意事項
- `.env` 檔案不應該被 commit 到版本控制
- JWT_SECRET 在正式環境應使用更強的密鑰
- MongoDB 密碼在正式環境應使用更安全的設定