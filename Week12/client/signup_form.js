// signup_form.js - 處理報名表單和資料列表

// DOM 元素
const signupForm = document.getElementById('signupForm');
const submitBtn = document.getElementById('submitBtn');
const signupError = document.getElementById('signupError');
const signupSuccess = document.getElementById('signupSuccess');
const refreshBtn = document.getElementById('refreshBtn');
const participantsList = document.getElementById('participantsList');

// 報名表單提交
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 檢查是否登入
    const token = localStorage.getItem('token');
    if (!token) {
        signupError.textContent = '請先登入';
        return;
    }
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    submitBtn.disabled = true;
    submitBtn.textContent = '送出中...';
    signupError.textContent = '';
    signupSuccess.textContent = '';
    
    try {
        const response = await fetch('http://localhost:3001/api/signup', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, email, phone })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            signupSuccess.textContent = '報名成功！';
            signupForm.reset();
            loadParticipants(); // 重新載入列表
        } else if (response.status === 401) {
            handleUnauthorized();
        } else {
            signupError.textContent = data.error || '報名失敗';
        }
    } catch (error) {
        signupError.textContent = '無法連線到伺服器';
    }
    
    submitBtn.disabled = false;
    submitBtn.textContent = '送出報名';
});

// 載入報名列表
async function loadParticipants() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    refreshBtn.disabled = true;
    refreshBtn.textContent = '載入中...';
    
    try {
        const response = await fetch('http://localhost:3001/api/signup', {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const result = await response.json();
            displayParticipants(result.data || []);
        } else if (response.status === 401) {
            handleUnauthorized();
        } else {
            participantsList.innerHTML = '<p class="error">載入失敗</p>';
        }
    } catch (error) {
        participantsList.innerHTML = '<p class="error">無法連線到伺服器</p>';
    }
    
    refreshBtn.disabled = false;
    refreshBtn.textContent = '重新載入';
}

// 顯示參與者列表
function displayParticipants(participants) {
    if (participants.length === 0) {
        participantsList.innerHTML = '<p>目前沒有報名資料</p>';
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';
    
    const html = participants.map(participant => `
        <div class="participant-item">
            <strong>${participant.name}</strong><br>
            Email: ${participant.email}<br>
            手機: ${participant.phone}<br>
            報名時間: ${new Date(participant.createdAt).toLocaleString()}
            ${canDelete(participant, user) ? 
                `<button class="delete-btn" onclick="deleteParticipant('${participant.id}')">刪除</button>` 
                : ''
            }
        </div>
    `).join('');
    
    participantsList.innerHTML = html;
}

// 判斷是否可以刪除
function canDelete(participant, user) {
    return user.role === 'admin' || participant.ownerId === user.id;
}

// 刪除參與者
async function deleteParticipant(id) {
    if (!confirm('確定要刪除這筆資料嗎？')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3001/api/signup/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(result.message || '刪除完成');
            loadParticipants(); // 重新載入列表
        } else if (response.status === 401) {
            handleUnauthorized();
        } else if (response.status === 403) {
            alert('權限不足');
        } else if (response.status === 404) {
            alert('找不到資料');
        } else {
            alert('刪除失敗');
        }
    } catch (error) {
        alert('無法連線到伺服器');
    }
}

// 重新載入按鈕
refreshBtn.addEventListener('click', loadParticipants);