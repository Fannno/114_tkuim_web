// login.js - 處理登入、登出和認證狀態

// DOM 元素
const loginSection = document.getElementById('loginSection');
const userSection = document.getElementById('userSection');
const signupSection = document.getElementById('signupSection');
const listSection = document.getElementById('listSection');
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const loginError = document.getElementById('loginError');

// 頁面載入時檢查登入狀態
window.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

// 檢查認證狀態
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (token && user) {
        showLoggedInState(user);
    } else {
        showLoggedOutState();
    }
}

// 顯示已登入狀態
function showLoggedInState(user) {
    loginSection.classList.add('hidden');
    userSection.classList.remove('hidden');
    signupSection.classList.remove('hidden');
    listSection.classList.remove('hidden');
    
    userInfo.textContent = `歡迎，${user.email} (${user.role})`;
    
    // 載入報名列表
    loadParticipants();
}

// 顯示未登入狀態
function showLoggedOutState() {
    loginSection.classList.remove('hidden');
    userSection.classList.add('hidden');
    signupSection.classList.add('hidden');
    listSection.classList.add('hidden');
    
    // 清空表單
    loginForm.reset();
    loginError.textContent = '';
}

// 登入表單提交
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    loginBtn.disabled = true;
    loginBtn.textContent = '登入中...';
    loginError.textContent = '';
    
    try {
        const response = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // 登入成功
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showLoggedInState(data.user);
            alert('登入成功，快去看報名資料');
        } else {
            // 登入失敗
            loginError.textContent = data.error || '登入失敗';
        }
    } catch (error) {
        loginError.textContent = '無法連線到伺服器';
    }
    
    loginBtn.disabled = false;
    loginBtn.textContent = '登入';
});

// 登出功能
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showLoggedOutState();
    alert('已登出');
});

// 取得認證 headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
}

// 處理 401 錯誤（token 過期）
function handleUnauthorized() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showLoggedOutState();
    alert('登入已過期，請重新登入');
}