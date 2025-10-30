// example5_script.js
// 攔截 submit，聚焦第一個錯誤並模擬送出流程

const form = document.getElementById('full-form');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');

function validateAllInputs(formElement) {
  let firstInvalid = null;
  const controls = Array.from(formElement.querySelectorAll('input, select, textarea'));
  controls.forEach((control) => {
    control.classList.remove('is-invalid');
    if (!control.checkValidity()) {
      control.classList.add('is-invalid');
      if (!firstInvalid) {
        firstInvalid = control;
      }
    }
  });
  return firstInvalid;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = '送出中...';

  const firstInvalid = validateAllInputs(form);
  if (firstInvalid) {
    submitBtn.disabled = false;
    submitBtn.textContent = '送出';
    firstInvalid.focus();
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));
  alert('資料已送出，感謝您的聯絡！');
  form.reset();
  submitBtn.disabled = false;
  submitBtn.textContent = '送出';
});

resetBtn.addEventListener('click', () => {
  form.reset();
  Array.from(form.elements).forEach((element) => {
    element.classList.remove('is-invalid');
  });
});

form.addEventListener('input', (event) => {
  const target = event.target;
  if (target.classList.contains('is-invalid') && target.checkValidity()) {
    target.classList.remove('is-invalid');
  }
});
//找到 ID 為 agree 的 HTML 元素
const agreeCheckbox = document.getElementById('agree');
//  點擊隱私條款時彈出視窗
agreeCheckbox.addEventListener('click', (event) => {
  if (event.target.checked) {
    alert('這是隱私條款');
  }
});