// LocalStorage Keys 
const LS_RESUMES = 'mp_resumes_v2';
const LS_FORM_DRAFT = 'mp_form_draft_v2';
const LS_THEME = 'mp_theme_v1';

const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB

// 常用工具 
const get = (id) => document.getElementById(id);
const saveResumes = (arr) => localStorage.setItem(LS_RESUMES, JSON.stringify(arr));
const loadResumes = () => JSON.parse(localStorage.getItem(LS_RESUMES) || '[]');

const form = get('resume-form');
const submitBtn = get('submit-btn');
const draftBtn = get('draft-btn');
const resetBtn = get('reset-btn');
const themeBtn = get('toggle-theme');

const fileInput = get('photo');
const photoError = get('photo-error');
const photoPreview = get('photo-preview');
const pvPhoto = get('pv-photo');

const expListEl = get('exp-list');
const addExpBtn = get('add-experience');

const searchInput = get('search');
const listWrap = get('list');
const emptyHint = get('empty');

// 預覽節點
const pv = {
  index: get('pv-index'),
  name: get('pv-name'),
  edu: get('pv-edu'),
  email: get('pv-email'),
  phone: get('pv-phone'),
  target: get('pv-target'),
  summary: get('pv-summary'),
  languages: get('pv-languages'),
  skills: get('pv-skills'),
  expCards: get('pv-exp-cards'),
  certs: get('pv-certs'),
  links: get('pv-links'),
  autobio: get('pv-autobio'),
};

// 用來產生經驗卡片 ID
let expCounter = 0;

// 深色模式 
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const isDark = theme === 'dark';
  themeBtn.textContent = isDark ? '淺色模式' : '深色模式';
  themeBtn.setAttribute('aria-pressed', String(isDark));
}

function loadTheme() {
  const saved = localStorage.getItem(LS_THEME);
  let theme = saved;
  if (!theme) {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  applyTheme(theme);
}

themeBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  localStorage.setItem(LS_THEME, next);
  applyTheme(next);
});

// 驗證相關 
function setErr(el, msg) {
  el.setCustomValidity(msg);
  const err = get(`${el.id}-error`);
  if (err) err.textContent = msg;
  return !msg;
}

function validateField(el) {
  let msg = '';

  if (el.validity.valueMissing) {
    msg = '此欄位為必填';
  } else if (el.id === 'email' && el.validity.typeMismatch) {
    msg = 'Email 格式不正確';
  } else if (el.id === 'phone' && el.value && !/^\d{10}$/.test(el.value)) {
    msg = '電話需為 10 碼數字';
  } else if (el.id === 'links' && el.value.trim()) {
    const all = splitCSV(el.value);
    const bad = all.find((u) => !/^https?:\/\//i.test(u));
    if (bad) msg = '作品連結請以 http(s):// 開頭';
  }

  return setErr(el, msg);
}

function validatePhoto() {
  photoError.textContent = '';
  const f = fileInput.files?.[0];
  if (!f) {
    photoPreview.style.display = 'none';
    photoPreview.src = '';
    pvPhoto.style.display = 'none';
    pvPhoto.src = '';
    return true;
  }

  if (!/^image\/(jpeg|png)$/i.test(f.type)) {
    photoError.textContent = '僅接受 JPG 或 PNG 格式的圖片';
    return false;
  }

  if (f.size > MAX_PHOTO_SIZE) {
    photoError.textContent = '檔案大小需 ≤ 2MB';
    return false;
  }

  const url = URL.createObjectURL(f);
  photoPreview.src = url;
  photoPreview.style.display = 'block';
  pvPhoto.src = url;
  pvPhoto.style.display = 'block';

  return true;
}

function splitCSV(text) {
  return text.split(',').map((s) => s.trim()).filter(Boolean);
}

// 經驗卡片（多筆）
function createExpCard(data = {}) {
  const id = `exp-${expCounter++}`;
  const wrapper = document.createElement('div');
  wrapper.className = 'exp-card';
  wrapper.dataset.id = id;

  wrapper.innerHTML = `
    <div class="exp-card-header">
      <span class="exp-card-title">工作經驗</span>
      <button type="button" class="exp-remove-btn" data-role="remove-exp">刪除</button>
    </div>
    <div class="row g-2">
      <div class="col-md-4">
        <label class="form-label small mb-1">公司名稱</label>
        <input class="form-control form-control-sm" data-field="company" placeholder="例如：OOO 科技" value="${data.company || ''}">
      </div>
      <div class="col-md-4">
        <label class="form-label small mb-1">職稱</label>
        <input class="form-control form-control-sm" data-field="title" placeholder="例如：前端工程師" value="${data.title || ''}">
      </div>
      <div class="col-md-4">
        <label class="form-label small mb-1">年資（年）</label>
        <input class="form-control form-control-sm" data-field="years" type="number" min="0" step="0.5" placeholder="例如：1.5" value="${data.years || ''}">
      </div>
    </div>
    <div class="row g-2">
      <div class="col-12">
        <label class="form-label small mb-1">工作內容／成就</label>
        <textarea class="form-control form-control-sm" rows="2" data-field="desc" placeholder="簡要說明你的職責、負責專案與成就">${data.desc || ''}</textarea>
      </div>
    </div>
  `;

  return wrapper;
}

function getExperiencesFromDOM() {
  const list = [];
  expListEl.querySelectorAll('.exp-card').forEach((card) => {
    const getField = (field) =>
      card.querySelector(`[data-field="${field}"]`)?.value.trim() || '';

    const company = getField('company');
    const title = getField('title');
    const years = getField('years');
    const desc = getField('desc');

    // 若完全都是空白就略過
    if (!company && !title && !years && !desc) return;

    list.push({ company, title, years, desc });
  });
  return list;
}

function setExperiencesToDOM(exps) {
  expListEl.innerHTML = '';
  exps.forEach((exp) => {
    const card = createExpCard(exp);
    expListEl.appendChild(card);
  });
}

// 新增一筆空白經驗
addExpBtn.addEventListener('click', () => {
  const card = createExpCard();
  expListEl.appendChild(card);
  saveFormDraft();
  updatePreview();
});

// 刪除某筆經驗
expListEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-role="remove-exp"]');
  if (!btn) return;
  const card = btn.closest('.exp-card');
  if (card) {
    card.remove();
    saveFormDraft();
    updatePreview();
  }
});

// 表單草稿 
function saveFormDraft() {
  const draft = {
    name: get('name').value,
    email: get('email').value,
    phone: get('phone').value,
    education: get('education').value,
    school: get('school').value,
    industry: get('industry').value,
    position: get('position').value,
    company: get('company').value,
    summary: get('summary').value,
    skills: get('skills').value,
    languages: get('languages').value,
    certs: get('certs').value,
    links: get('links').value,
    autobio: get('autobio').value,
    experiences: getExperiencesFromDOM(),
  };
  localStorage.setItem(LS_FORM_DRAFT, JSON.stringify(draft));
}

function restoreFormDraft() {
  const raw = localStorage.getItem(LS_FORM_DRAFT);
  if (!raw) return;

  const d = JSON.parse(raw);
  const map = {
    name: 'name',
    email: 'email',
    phone: 'phone',
    education: 'education',
    school: 'school',
    industry: 'industry',
    position: 'position',
    company: 'company',
    summary: 'summary',
    skills: 'skills',
    languages: 'languages',
    certs: 'certs',
    links: 'links',
    autobio: 'autobio',
  };

  Object.entries(map).forEach(([k, id]) => {
    if (d[k] !== undefined) {
      get(id).value = d[k];
    }
  });

  if (Array.isArray(d.experiences)) {
    setExperiencesToDOM(d.experiences);
  }
}

function clearFormDraft() {
  localStorage.removeItem(LS_FORM_DRAFT);
}

// 即時預覽
function updatePreview() {
  const resumes = loadResumes();
  const nextIndex = resumes.length + 1;
  pv.index.textContent = `第 ${nextIndex} 份履歷（預覽）`;

  const name = get('name').value.trim() || '—';
  pv.name.textContent = name;

  const edu = get('education').value || '—';
  const school = get('school').value.trim() || '—';
  pv.edu.textContent = `學歷：${edu}（學校：${school}）`;

  const email = get('email').value.trim() || '—';
  const phone = get('phone').value.trim() || '—';
  pv.email.textContent = `Email：${email}`;
  pv.phone.textContent = `電話：${phone}`;

  const industry = get('industry').value || '—';
  const position = get('position').value.trim() || '—';
  const company = get('company').value.trim() || '—';
  pv.target.textContent = `目標行業：${industry}／期望職位：${position}／公司：${company}`;

  const summary = get('summary').value.trim() || '—';
  pv.summary.textContent = `簡介：${summary}`;

  const languages = get('languages').value.trim() || '—';
  pv.languages.textContent = `語言能力：${languages}`;

  // 技能
  pv.skills.innerHTML = '';
  splitCSV(get('skills').value).forEach((skill) => {
    const li = document.createElement('li');
    li.textContent = skill;
    pv.skills.appendChild(li);
  });

  // 多筆工作經驗預覽
  pv.expCards.innerHTML = '';
  const exps = getExperiencesFromDOM();
  if (!exps.length) {
    const p = document.createElement('p');
    p.textContent = '—';
    p.className = 'mb-0';
    pv.expCards.appendChild(p);
  } else {
    exps.forEach((exp) => {
      const card = document.createElement('div');
      card.className = 'pv-exp-card';
      card.innerHTML = `
        <div class="pv-exp-card-title">
          ${escapeHTML(exp.company || '（未填公司）')} · ${escapeHTML(exp.title || '（未填職稱）')}
        </div>
        <div class="pv-exp-card-meta">
          年資：${exp.years || '—'} 年
        </div>
        <div class="mt-1">
          ${escapeHTML(exp.desc || '')}
        </div>
      `;
      pv.expCards.appendChild(card);
    });
  }

  // 證照
  const certs = get('certs').value.trim();
  pv.certs.textContent = certs || '—';

  // 作品連結
  pv.links.innerHTML = '';
  splitCSV(get('links').value).forEach((url) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = url;
    li.appendChild(a);
    pv.links.appendChild(li);
  });

  // 自傳
  const autobio = get('autobio').value.trim() || '—';
  pv.autobio.textContent = autobio;
}

// 建立履歷資料物件
function buildResumeData(status) {
  return {
    id: crypto.randomUUID?.() || String(Date.now()),
    status, // 'draft' | 'submitted'
    createdAt: Date.now(),
    name: get('name').value.trim(),
    email: get('email').value.trim(),
    phone: get('phone').value.trim(),
    education: get('education').value,
    school: get('school').value.trim(),
    industry: get('industry').value,
    position: get('position').value.trim(),
    company: get('company').value.trim(),
    summary: get('summary').value.trim(),
    skills: splitCSV(get('skills').value),
    languages: get('languages').value.trim(),
    certs: get('certs').value.trim(),
    links: splitCSV(get('links').value),
    autobio: get('autobio').value.trim(),
    experiences: getExperiencesFromDOM(),
  };
}

// 履歷列表渲染
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m]));
}

function escapeAttr(s) {
  return String(s).replace(/"/g, '&quot;');
}

function renderList() {
  const resumes = loadResumes();
  const q = (searchInput.value || '').trim().toLowerCase();

  const filtered = resumes.filter((r) => {
    if (!q) return true;
    const text = [
      r.name,
      r.company,
      r.position,
      r.industry,
      r.education,
      r.school,
      r.summary,
      r.languages,
      r.certs,
      r.skills.join(','),
    ]
      .join(' ')
      .toLowerCase();
    return text.includes(q);
  });

  listWrap.innerHTML = '';
  if (!filtered.length) {
    emptyHint.style.display = '';
    return;
  }
  emptyHint.style.display = 'none';

  filtered.forEach((r, idx) => {
    const card = document.createElement('article');
    card.className = 'resume-card';

    const indexLabel = `第 ${idx + 1} 份履歷`;

    card.innerHTML = `
      <div class="resume-header">
        <h3>${escapeHTML(r.name)}（${escapeHTML(r.position || '未填職位')}）</h3>
        <span class="badge-status ${
          r.status === 'draft' ? 'badge-draft' : 'badge-submitted'
        }">
          ${r.status === 'draft' ? '草稿' : '已儲存'}
        </span>
      </div>
      <div class="resume-meta">
        ${indexLabel}｜${escapeHTML(r.industry || '未填行業')}｜${escapeHTML(
          r.company || '未填公司'
        )}
      </div>
      <div class="resume-skills">
        ${r.skills.map((s) => `<span>${escapeHTML(s)}</span>`).join('')}
      </div>
      <div class="resume-actions">
        <button class="btn btn-sm btn-outline-secondary" data-act="load" data-id="${
          r.id
        }">套用此履歷</button>
        <button class="btn btn-sm btn-outline-danger" data-act="delete" data-id="${
          r.id
        }">刪除</button>
      </div>
      <details class="mt-1">
        <summary class="small text-muted">展開詳細內容</summary>
        <div class="mt-2 small">
          <div><strong>Email：</strong>${escapeHTML(r.email)}</div>
          <div><strong>電話：</strong>${escapeHTML(r.phone)}</div>
          <div><strong>學歷：</strong>${escapeHTML(r.education)}（${escapeHTML(
      r.school
    )}）</div>
          <div><strong>簡介：</strong>${escapeHTML(r.summary || '')}</div>
          <div><strong>語言能力：</strong>${escapeHTML(r.languages || '—')}</div>
          <div class="mt-1"><strong>工作經驗：</strong></div>
          ${
            r.experiences && r.experiences.length
              ? r.experiences
                  .map(
                    (e) => `
            <div class="mt-1">
              ・${escapeHTML(e.company || '')}／${escapeHTML(e.title || '')}／ ${
                      e.years || '—'
                    } 年<br>
              <span class="text-muted">${escapeHTML(e.desc || '')}</span>
            </div>`
                  )
                  .join('')
              : '<div class="text-muted">（未填寫工作經驗）</div>'
          }
          <div class="mt-1"><strong>證照：</strong>${escapeHTML(r.certs || '—')}</div>
          <div class="mt-1"><strong>作品連結：</strong>${
            r.links && r.links.length
              ? r.links
                  .map(
                    (u) =>
                      `<div><a href="${escapeAttr(
                        u
                      )}" target="_blank" rel="noopener">${escapeHTML(u)}</a></div>`
                  )
                  .join('')
              : '—'
          }</div>
          <div class="mt-1"><strong>自傳：</strong>${escapeHTML(r.autobio || '—')}</div>
        </div>
      </details>
    `;

    listWrap.appendChild(card);
  });
}

// 履歷卡片上的按鈕
listWrap.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;

  const act = btn.dataset.act;
  const id = btn.dataset.id;

  const resumes = loadResumes();
  const idx = resumes.findIndex((r) => r.id === id);
  if (idx < 0) return;

  if (act === 'delete') {
    if (!confirm('確定要刪除此履歷？')) return;
    resumes.splice(idx, 1);
    saveResumes(resumes);
    renderList();
    updatePreview();
    return;
  }

  if (act === 'load') {
    const r = resumes[idx];
    get('name').value = r.name;
    get('email').value = r.email;
    get('phone').value = r.phone;
    get('education').value = r.education;
    get('school').value = r.school;
    get('industry').value = r.industry;
    get('position').value = r.position;
    get('company').value = r.company;
    get('summary').value = r.summary;
    get('skills').value = r.skills.join(', ');
    get('languages').value = r.languages;
    get('certs').value = r.certs;
    get('links').value = r.links.join(', ');
    get('autobio').value = r.autobio;

    if (Array.isArray(r.experiences)) {
      setExperiencesToDOM(r.experiences);
    } else {
      expListEl.innerHTML = '';
    }

    saveFormDraft();
    updatePreview();
    window.scrollTo({ top: form.offsetTop - 20, behavior: 'smooth' });
  }
});

// 搜尋防抖
let searchTimer = 0;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(renderList, 150);
});

// 表單事件
form.addEventListener(
  'blur',
  (e) => {
    const t = e.target;
    if (
      t instanceof HTMLInputElement ||
      t instanceof HTMLTextAreaElement ||
      t instanceof HTMLSelectElement
    ) {
      if (t.id === 'photo') return;
      validateField(t);
      saveFormDraft();
    }
  },
  true
);

form.addEventListener('input', (e) => {
  const t = e.target;
  if (
    t instanceof HTMLInputElement ||
    t instanceof HTMLTextAreaElement ||
    t instanceof HTMLSelectElement
  ) {
    if (t.id !== 'photo') {
      validateField(t);
      updatePreview();
      saveFormDraft();
    }
  }
});

// 證件照
fileInput.addEventListener('change', () => {
  validatePhoto();
});

// 清除按鈕
resetBtn.addEventListener('click', () => {
  form.reset();
  Array.from(form.elements).forEach((el) => {
    if (
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      el instanceof HTMLSelectElement
    ) {
      setErr(el, '');
    }
  });
  photoError.textContent = '';
  photoPreview.style.display = 'none';
  pvPhoto.style.display = 'none';
  clearFormDraft();
  expListEl.innerHTML = '';
  updatePreview();
});

// 共用送出流程
async function handleSubmit(status) {
  const requiredIds = [
    'name',
    'email',
    'phone',
    'education',
    'school',
    'industry',
    'position',
    'company',
    'summary',
    'skills',
    'autobio',
  ];
  let firstInvalid = null;

  requiredIds.forEach((id) => {
    const el = get(id);
    const ok = validateField(el);
    if (!ok && !firstInvalid) firstInvalid = el;
  });

  if (!validatePhoto() && !firstInvalid) firstInvalid = fileInput;

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  if (status === 'submitted') {
    submitBtn.disabled = true;
    submitBtn.textContent = '儲存中…';
  }

  await new Promise((r) => setTimeout(r, 600));

  const resumes = loadResumes();
  const data = buildResumeData(status);
  resumes.unshift(data);
  saveResumes(resumes);

  if (status === 'submitted') {
    alert('履歷已儲存！');
    form.reset();
    photoPreview.style.display = 'none';
    pvPhoto.style.display = 'none';
    photoError.textContent = '';
    clearFormDraft();
    expListEl.innerHTML = '';
    submitBtn.disabled = false;
    submitBtn.textContent = '正式履歷';
  } else {
    alert('草稿已儲存，可於下方列表套用繼續修改或儲存。');
  }

  updatePreview();
  renderList();
}

// submit
form.addEventListener('submit', (e) => {
  e.preventDefault();
  handleSubmit('submitted');
});

// 儲存草稿
draftBtn.addEventListener('click', () => {
  handleSubmit('draft');
});

// 初始 
function initValidationWiring() {
  const requiredIds = [
    'name',
    'email',
    'phone',
    'education',
    'school',
    'industry',
    'position',
    'company',
    'summary',
    'skills',
    'autobio',
  ];
  requiredIds.forEach((id) => {
    const el = get(id);
    el.addEventListener('invalid', (e) => {
      e.preventDefault();
      validateField(el);
    });
  });
}

function init() {
  loadTheme();
  restoreFormDraft();
  // 預設給一筆空的工作經驗方便使用者理解
  if (!expListEl.children.length) {
    const card = createExpCard();
    expListEl.appendChild(card);
  }
  validatePhoto();
  updatePreview();
  renderList();
  initValidationWiring();
}

document.addEventListener('DOMContentLoaded', init);
