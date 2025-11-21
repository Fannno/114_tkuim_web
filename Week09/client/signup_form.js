// 宣告變數
    const form = document.getElementById("signupForm");
    const submitBtn = document.getElementById("submitBtn");
    const resetBtn = document.getElementById("resetBtn");
    const successMsg = document.getElementById("successMsg");
    const strengthText = document.createElement("span");
    strengthText.id = "strengthText";
    strengthText.style.marginLeft = "8px";
    document.getElementById("password").after(strengthText);
    const interestArea = document.getElementById("interests");
    const inputs = form.querySelectorAll("input");
    const viewListBtn = document.getElementById("viewListBtn");
    const signupList = document.getElementById("signupList");

    // 載入 localStorage
    window.addEventListener("DOMContentLoaded", () => {
      inputs.forEach(input => {
        const saved = localStorage.getItem(input.id);
        if (saved) {
          if (input.type === "checkbox") input.checked = saved === "true";
          else input.value = saved;
        }
      });

      const savedInterests = JSON.parse(localStorage.getItem("interests") || "[]");
      interestArea.querySelectorAll("input[type=checkbox]").forEach(b => {
        if (savedInterests.includes(b.value)) b.checked = true;
      });

      updateStrength(document.getElementById("password").value);
    });

    // 即時驗證與儲存
    inputs.forEach(input => {
      input.addEventListener("input", () => {
        if (input.type === "checkbox") localStorage.setItem(input.id, input.checked);
        else localStorage.setItem(input.id, input.value);

        validateField(input);
        if (input.id === "password") updateStrength(input.value);
      });
      input.addEventListener("blur", () => validateField(input));
    });

    // 興趣變更
    interestArea.addEventListener("change", () => {
      validateInterests();
      const checked = [...interestArea.querySelectorAll("input[type=checkbox]:checked")].map(b => b.value);
      localStorage.setItem("interests", JSON.stringify(checked));
    });

    // 欄位驗證
    function validateField(field) {
      let msg = "";
      field.setCustomValidity("");

      if (field.id === "name" && !field.value.trim()) msg = "請輸入姓名。";
      if (field.id === "email") {
        if (!field.value) msg = "請輸入 Email。";
        else if (!/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(field.value)) msg = "Email 格式不正確。";
      }
      if (field.id === "phone") {
        if (!field.value) msg = "請輸入手機號碼。";
        else if (!/^\d{10}$/.test(field.value)) msg = "手機需為 10 碼數字。";
        else if (!/^09\d{8}$/.test(field.value)) msg = "手機需以 09 開頭。";
      }
      if (field.id === "password") {
        if (field.value.length < 8) msg = "密碼需至少 8 碼。";
        else if (!/[A-Za-z]/.test(field.value) || !/\d/.test(field.value)) msg = "密碼需包含英文字母與數字。";
      }
      if (field.id === "confirm" && field.value !== document.getElementById("password").value) msg = "兩次密碼不一致。";
      if (field.id === "agree" && !field.checked) msg = "請同意服務條款。";

      const errEl = document.getElementById(field.id + "-error");
      if (errEl) errEl.textContent = msg;

      field.setCustomValidity(msg);
      return msg === "";
    }

    // 密碼強度
    function updateStrength(password) {
      strengthText.textContent = '';
      strengthText.style.color = '';
      if (!password) return;

      const hasNumber = /\d/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasUpper = /[A-Z]/.test(password);
      const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      if (hasSymbol && hasLower && hasUpper && hasNumber) {
        strengthText.textContent = '強';
        strengthText.style.color = 'green';
      } else if (hasLower && hasUpper && hasNumber) {
        strengthText.textContent = '中';
        strengthText.style.color = 'orange';
      } else {
        strengthText.textContent = '弱';
        strengthText.style.color = 'red';
      }
    }

    // 興趣驗證
    function validateInterests() {
      const checked = [...interestArea.querySelectorAll("input[type=checkbox]:checked")].length > 0;
      document.getElementById("interestError").textContent = checked ? "" : "請至少選擇一個興趣。";
      return checked;
    }

    // 送出表單
    form.addEventListener("submit", async e => {
      e.preventDefault();
      let valid = true;
      inputs.forEach(i => { if (!validateField(i)) valid = false; });
      if (!validateInterests()) valid = false;
      if (!valid) { form.querySelector(":invalid")?.focus(); return; }

      submitBtn.disabled = true;
      submitBtn.textContent = "Loading...";
      successMsg.classList.add("hidden");

      const interests = [...interestArea.querySelectorAll("input[type=checkbox]:checked")].map(b => b.value);
      const payload = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        password: document.getElementById("password").value,
        interests
      };

      try {
        const res = await fetch("http://localhost:3001/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "發生錯誤，請稍後再試。");
        } else {
          successMsg.textContent = "註冊成功！";
          successMsg.classList.remove("hidden");
          form.reset();
          localStorage.clear();
          strengthText.textContent = "無";
        }
      } catch {
        alert("無法連線到伺服器，請確認 server 是否啟動。");
      }

      submitBtn.disabled = false;
      submitBtn.textContent = "註冊";
    });

    // 重設按鈕
    resetBtn.addEventListener("click", () => {
      form.reset();
      successMsg.classList.add("hidden");
      inputs.forEach(i => { const errEl = document.getElementById(i.id + "-error"); if (errEl) errEl.textContent = ""; });
      document.getElementById("interestError").textContent = "";
      strengthText.textContent = "無";
      localStorage.clear();
    });

    // 查看報名清單
    viewListBtn.addEventListener("click", async () => {
      viewListBtn.disabled = true;
      viewListBtn.textContent = "載入中...";
      try {
        const res = await fetch("http://localhost:3001/api/signup");
        if (!res.ok) throw new Error("無法取得資料");
        const data = await res.json();
        signupList.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        alert(err.message);
      }
      viewListBtn.disabled = false;
      viewListBtn.textContent = "查看報名清單";
    });
