## 如何啟動後端（npm install、npm run dev）。
- 安裝套件 
``` npm install ```
- 建立.env 
  ``` 
    PORT=3001 
    ALLOWED_ORIGIN=http://localhost:5500
  ```
- 啟動後端（開發模式）
``` npm run dev ```

## 如何啟動前端（Live Server / Vite）。
- 右鍵``` signup_form.html ``` → Open with Live Server
  
## API 端點文件與測試方式。
- 建立新報名資料。
  - 成功回應（201）
  - 失敗回應（400）
-  GET /api/signup :取得目前所有報名資料。
1.  VS Code REST Client
   - 安裝 REST Client 
   - 建立 ```tests/api.http```
   - 按下 ```Send Request```
2.  Postman
   - 打``` GET http://localhost:3001/health ```驗證服務狀態 
   -  增加``` POST /api/signup ```請求，Body 選``` raw JSON ```
3.  curl 指令
   ``` 
    curl http://localhost:3001/api/signup
    curl -X POST http://localhost:3001/api/signup \
        -H "Content-Type: application/json" \
        -d '{
        "name": "CLI",
        "email": "cli@example.com",
        "phone": "0911222333",
        "password": "cliPass88",
        "confirmPassword": "cliPass88",
        "interests": ["資料庫"],
        "terms": true
    }'
   ```


