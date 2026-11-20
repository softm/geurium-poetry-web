(function () {
'use strict';

const STORAGE_KEY = 'geurium-records-v1';
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MOODS = [
  { id: 'miss', label: '그리움', color: '#e9dff1', ink: '#88639e', icon: 'moon' },
  { id: 'grateful', label: '고마움', color: '#f4e7c9', ink: '#b1924b', icon: 'sun' },
  { id: 'excited', label: '설렘', color: '#f1dce1', ink: '#b47687', icon: 'heart' },
  { id: 'regret', label: '아쉬움', color: '#e0e6f0', ink: '#7b8eaf', icon: 'cloud' },
  { id: 'calm', label: '평온함', color: '#e0e9df', ink: '#7a9474', icon: 'leaf' },
  { id: 'mixed', label: '복잡함', color: '#e4e1e7', ink: '#8a8199', icon: 'swirl' }
];
const PAPERS = [
  { id: 'cream', label: '따뜻한 크림', color: '#f6efdf' },
  { id: 'lilac', label: '연한 라일락', color: '#eee7f2' },
  { id: 'rose', label: '살구빛 분홍', color: '#f6e7e1' },
  { id: 'sky', label: '차분한 하늘', color: '#e7eef1' }
];
const POEM_HINTS = [
  { id:'scene', label:'오늘의 한 장면', text:'오늘 눈에 남은 색이나 빛을 한 줄로 적어 보세요.' },
  { id:'person', label:'그리운 사람', text:'그 사람의 목소리, 걸음, 작은 습관 하나를 떠올려 보세요.' },
  { id:'words', label:'하지 못한 말', text:'말하지 못한 한마디 뒤에, 지금의 마음을 붙여 보세요.' },
  { id:'season', label:'다음 계절의 나', text:'다음 계절의 나에게 지금 건네고 싶은 말을 적어 보세요.' }
];
const ICONS = {
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  letter: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h.01M12 15h.01M16 15h.01M8 18h.01M12 18h.01"/>',
  pen: '<path d="m16 3 5 5M4 15 16 3a2 2 0 0 1 3 0l2 2a2 2 0 0 1 0 3L9 20l-6 1 1-6Z"/><path d="m4 15 5 5"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  settings: '<path d="M4 7h16M4 17h16M8 4v6m8 4v6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 8.5a2.5 2.5 0 1 1 3.1 2.4c-.6.2-.6 1.1-.6 2.1m0 3h.01"/>',
  storage: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 16h8M8 8h4"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4"/>',
  trash: '<path d="M3 6h18M8 6V3h8v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  print: '<path d="M6 8V3h12v5M6 17H3V9h18v8h-3M6 14h12v7H6Z"/><path d="M17 11h.01"/>',
  moon: '<path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5a8.5 8.5 0 1 0 10.6 10.6Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  cloud: '<path d="M6 17a4 4 0 0 1-.3-8 6.5 6.5 0 0 1 12.5 0A4 4 0 0 1 18 17Z"/><path d="m9 20 1-2m4 2 1-2"/>',
  leaf: '<path d="M20 3C7 2 3 7 5 14c3 7 14 4 15-11Z"/><path d="M4 21 15 9"/>',
  swirl: '<path d="M9 8c1-4 8-4 9 1 2 5-5 9-10 6-5-3-3-10 2-12M7 12c0 4 6 5 8 2m-2 7c7-1 10-7 7-12"/>',
  sparkle: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>'
};
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const icon = (name, size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.heart}</svg>`;
const uid = () => globalThis.crypto?.randomUUID?.() || `g${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
const today = () => localDay(new Date());
function localDay(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
const dayDate = day => new Date(`${day}T12:00:00`);
const dateText = (value, options = { year:'numeric', month:'long', day:'numeric' }) => new Intl.DateTimeFormat('ko-KR', options).format(new Date(value));
const shortDate = value => dateText(value,{month:'numeric',day:'numeric'});
const moodById = id => MOODS.find(m => m.id === id);
const paperById = id => PAPERS.find(p => p.id === id) || PAPERS[0];
const blankState = () => ({ version:1, moods:[], letters:[], composer:null });
let state = blankState();
let view = ['today','letters','calendar'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'today';
let selectedMood = null;
let noteInput = '';
let searchText = '';
let letterFilter = 'all';
let kindFilter = 'all';
let selectedDay = today();
let calendarMonth = new Date(new Date().getFullYear(),new Date().getMonth(),1);
let storageBlocked = false;
let storageError = '';
let originalCorruptText = null;
let editorTimer = null;
let toastTimer = null;
let pendingRestore = null;
let lastStorageRaw = null;
let tabConflict = false;

function validDay(s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(dayDate(s).getTime()) && localDay(dayDate(s)) === s; }
function validTime(s) { return typeof s === 'string' && s.length <= 40 && Number.isFinite(Date.parse(s)); }
function validString(s, max) { return typeof s === 'string' && s.length <= max; }
function validId(s) { return typeof s === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(s); }
function validateRecordData(data) {
  if (!data || typeof data !== 'object' || data.version !== 1 || !Array.isArray(data.moods) || !Array.isArray(data.letters)) throw new Error('그리움 백업 파일 형식이 아닙니다.');
  if (data.moods.length > 10000 || data.letters.length > 10000) throw new Error('한 번에 복원할 수 있는 기록 수를 넘었습니다.');
  const seenMood = new Set(), seenLetter = new Set();
  const moods = data.moods.map(m => {
    if (!m || !validId(m.id) || seenMood.has(m.id) || !moodById(m.emotion) || !validString(m.note,2000) || !validDay(m.date) || !validTime(m.createdAt) || !validTime(m.updatedAt)) throw new Error('마음 기록에 잘못되거나 중복된 항목이 있습니다.');
    seenMood.add(m.id);
    return { id:m.id, emotion:m.emotion, note:m.note, date:m.date, createdAt:m.createdAt, updatedAt:m.updatedAt };
  });
  const letters = data.letters.map(l => {
    if (!l || !validId(l.id) || seenLetter.has(l.id) || !validString(l.recipient,120) || !validString(l.title,160) || !validString(l.body,50000) || !PAPERS.some(p=>p.id===l.color) || !['draft','complete'].includes(l.status) || (l.kind != null && !['letter','poem'].includes(l.kind)) || !validTime(l.createdAt) || !validTime(l.updatedAt)) throw new Error('글에 잘못되거나 중복된 항목이 있습니다.');
    seenLetter.add(l.id);
    return { id:l.id, kind:l.kind || 'letter', recipient:l.kind==='poem'?'':l.recipient, title:l.title, body:l.body, color:l.color, status:l.status, createdAt:l.createdAt, updatedAt:l.updatedAt };
  });
  let composer = null;
  if (data.composer != null) {
    const c = data.composer;
    if (!c || (c.letterId !== null && !validId(c.letterId)) || !validString(c.recipient,120) || !validString(c.title,160) || !validString(c.body,50000) || !PAPERS.some(p=>p.id===c.color) || (c.kind != null && !['letter','poem'].includes(c.kind)) || !validTime(c.updatedAt)) throw new Error('작성 중인 글의 형식이 올바르지 않습니다.');
    composer = { letterId:c.letterId, kind:c.kind || 'letter', recipient:c.kind==='poem'?'':c.recipient, title:c.title, body:c.body, color:c.color, updatedAt:c.updatedAt };
  }
  return { version:1, moods, letters, composer };
}

function loadState() {
  let raw;
  try { raw = localStorage.getItem(STORAGE_KEY); }
  catch { storageError = '이 브라우저에서 저장 공간에 접근할 수 없습니다. 브라우저의 사이트 저장 설정을 확인해 주세요.'; return; }
  lastStorageRaw = raw;
  if (!raw) return;
  try { state = validateRecordData(JSON.parse(raw)); }
  catch {
    storageBlocked = true;
    originalCorruptText = raw;
    storageError = '기존 기록을 정상적으로 읽지 못했습니다. 원본을 덮어쓰지 않도록 저장을 멈췄어요. 먼저 내 기록 관리에서 원본을 내려받아 주세요.';
  }
}

function persist(next, { quiet = false } = {}) {
  if (storageBlocked) {
    if (!quiet) toast('기존 기록 보호를 위해 저장을 멈춘 상태예요. 내 기록 관리를 확인해 주세요.',true);
    return false;
  }
  try {
    if (next.moods.length > 10000 || next.letters.length > 10000) {
      if (!quiet) toast('기록은 종류별 10,000개까지 보관할 수 있어요. 먼저 백업하고 일부 기록을 정리해 주세요.',true);
      return false;
    }
    const exported = JSON.stringify({...next,exportedAt:new Date().toISOString(),app:'geurium'},null,2);
    if (new Blob([exported]).size > MAX_FILE_BYTES) {
      storageError = '백업 파일을 다시 불러올 수 있도록 기록은 총 5MB까지 보관해요. 먼저 백업한 뒤 필요 없는 기록을 정리해 주세요.';
      if (!quiet) toast('기록 용량 한도에 도달했어요. 백업 후 일부 기록을 정리해 주세요.',true);
      return false;
    }
    const currentRaw = localStorage.getItem(STORAGE_KEY);
    if (tabConflict || currentRaw !== lastStorageRaw) {
      tabConflict = true;
      showTabConflict();
      return false;
    }
    const serialized = JSON.stringify(next);
    localStorage.setItem(STORAGE_KEY,serialized);
    lastStorageRaw = serialized;
    state = next;
    storageError = '';
    return true;
  } catch {
    storageError = '기록을 저장하지 못했습니다. 저장 공간이 부족하거나 브라우저가 저장을 막고 있을 수 있어요. 입력 내용을 복사하거나 기록을 백업해 주세요.';
    if (!quiet) toast('저장하지 못했어요. 입력 내용은 닫기 전에 복사해 주세요.',true);
    return false;
  }
}

function showTabConflict() {
  storageError = '다른 탭에서 기록이 바뀌어 덮어쓰지 않도록 저장을 멈췄어요. 작성 내용을 파일로 보관한 뒤 새로고침해 주세요.';
  toast('다른 탭에서 기록이 바뀌었어요. 작성 내용을 보관한 뒤 새로고침해 주세요.',true);
  const editor=$('dialog[data-kind="editor"]');
  if(editor&&!$('#editor-conflict')) {
    const notice=document.createElement('div');
    notice.id='editor-conflict';notice.className='error-banner';notice.setAttribute('role','alert');
    notice.innerHTML='<strong>다른 탭의 기록을 보호하고 있어요</strong>지금 작성한 내용을 먼저 파일로 보관해 주세요. 새로고침하면 다른 탭의 최신 기록을 불러옵니다.<div class="settings-buttons"><button class="button secondary small" data-action="export-editor">작성 내용 파일로 저장</button><button class="button secondary small" data-action="reload-app">새로고침</button></div>';
    $('.dialog-content',editor).prepend(notice);
  }
}

function toast(message, error = false) {
  const el = $('#toast');
  el.textContent = message;
  el.className = `show${error?' error':''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ el.className=''; },error?7000:3800);
}

function orb(mood, small=false) {
  return `<span class="emotion-orb${small?' tiny':''}" style="--tone:${mood.color};--tone-ink:${mood.ink}">${icon(mood.icon,24)}</span>`;
}
function navButtons(bottom=false) {
  const items=[['today','home','오늘의 마음'],['letters','letter','내 글 모음'],['calendar','calendar','마음 달력']];
  return items.map(([id,ico,label])=>`<button type="button" class="${bottom?'':'nav-button '}${view===id?'active':''}" data-action="navigate" data-view="${id}" ${view===id?'aria-current="page"':''}>${icon(ico,21)}<span>${label}</span></button>`).join('') + (bottom?`<button type="button" data-action="settings">${icon('settings',21)}<span>내 기록</span></button>`:'');
}
function errorsHTML() {
  return storageError ? `<div class="error-banner" role="alert"><strong>저장 상태를 확인해 주세요</strong>${esc(storageError)}<br><button class="button small secondary" data-action="settings">내 기록 관리</button>${tabConflict?'<button class="button small secondary" data-action="reload-app">새로고침</button>':''}</div>` : '';
}
function footerHTML() {
  return `<p class="storage-note">${icon('storage',16)}기록은 이 브라우저에 저장돼요. 기기를 바꾸기 전에 <button data-action="settings">백업해 주세요.</button></p>`;
}
function draftBanner() {
  return state.composer && (state.composer.body || state.composer.title || state.composer.recipient) ? `<div class="draft-banner"><span>아직 마치지 않은 ${state.composer.kind==='poem'?'시가':'편지가'} 있어요.<br>천천히, 이어서 적어도 괜찮아요.</span><button class="button small secondary" data-action="compose">이어 쓰기</button></div>`:'';
}

function render() {
  $('#app').innerHTML = `<div class="shell">
    <aside class="sidebar" aria-label="주 메뉴">
      <a class="brand" href="#today" aria-label="그리움과 시 오늘의 마음"><div class="brand-mark"><span class="brand-symbol">${icon('heart',18)}</span><span class="brand-name">그리움과 시</span></div><span class="brand-sub">마음을 놓아두는 곳</span></a>
      <nav class="side-nav">${navButtons()}</nav>
      <div class="sidebar-bottom"><button class="nav-button" data-action="settings">${icon('settings')}내 기록 관리</button><button class="nav-button" data-action="help">${icon('help')}이용 안내</button><p class="sidebar-note">다 전하지 못한 마음도<br><span>여기서는 괜찮아요.</span></p></div>
    </aside>
    <div class="app-area"><header class="topbar"><div class="topbar-left"><span class="topbar-brand">그리움과 시</span><span class="eyebrow">A quiet place for your heart</span><span class="topbar-dot"></span><span class="topbar-date">${dateText(new Date(),{month:'long',day:'numeric',weekday:'short'})}</span></div><div class="topbar-actions"><button class="button secondary" data-action="compose-letter">편지 쓰기</button><button class="button" data-action="compose-poem">${icon('pen',17)}시 쓰기</button></div></header><main id="main" class="page" tabindex="-1">${errorsHTML()}${view==='today'?dashboardHTML():view==='letters'?lettersHTML():calendarHTML()}${footerHTML()}</main></div>
    <nav class="bottom-nav" aria-label="모바일 주 메뉴">${navButtons(true)}</nav>
  </div>`;
  bindMoodForm();
  bindLettersSearch();
}

function dashboardHTML() {
  const recent = [...state.letters].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,3);
  return `<div class="page-heading"><div><div class="greeting-label">${icon('sparkle',15)}나를 위한 작은 쉼표</div><h1>오늘도, 마음을 놓아두세요.</h1><p>그리움이 머물고, 마음이 시가 되는 곳.</p></div></div>
  ${draftBanner()}
  <div class="hero-grid"><section class="panel mood-panel" aria-labelledby="mood-title"><div class="section-overline">TODAY'S FEELING</div><h2 id="mood-title">지금, 어떤 마음인가요?</h2><p class="section-description">마음을 하나 고르고, 오늘의 한 줄을 남겨 보세요.</p><form id="mood-form"><div class="mood-options" role="group" aria-label="오늘의 마음 선택">${MOODS.map(m=>`<button type="button" class="mood-option${selectedMood===m.id?' selected':''}" data-action="select-mood" data-mood="${m.id}" aria-pressed="${selectedMood===m.id}">${orb(m)}<span>${m.label}</span></button>`).join('')}</div><label class="note-label" for="mood-note">오늘의 한 줄 <span class="muted">· 적지 않아도 괜찮아요</span></label><textarea id="mood-note" class="note-field" maxlength="2000" placeholder="문득 떠오른 얼굴, 오래 남은 말 한마디…" rows="2">${esc(noteInput)}</textarea><div class="form-footer"><span class="subtle">나만의 기록으로 남겨요.</span><button class="button" type="submit">마음 남기기</button></div></form></section>
  <section class="write-card"><div class="section-overline">A SMALL POEM</div><h2>그리움이<br>한 편의 시가 될 때.</h2><p>한 장면, 한 사람, 한 줄.<br>떠오르는 말부터 직접 적어 보세요.</p><div class="letter-art" aria-hidden="true"><div class="art-envelope"><div class="art-paper"></div><div class="envelope-front"></div><div class="envelope-seal">g</div></div></div><button class="button" data-action="compose-poem">마음으로 시 쓰기</button></section></div>
  <div class="dashboard-lower"><section><div class="section-head"><h2>내 글 모음<span class="count">${state.letters.length}</span></h2><button class="button link small" data-action="navigate" data-view="letters">모두 보기 ${icon('chevron',16)}</button></div>${recent.length?`<div class="recent-list">${recent.map(letterRow).join('')}</div>`:`<div class="empty-box"><span class="empty-icon">${icon('pen',23)}</span><h3>첫 번째 글을 기다리고 있어요</h3><p>짧은 시도, 보내지 않는 편지도 괜찮아요.<br>떠오르는 한 문장으로 시작해 보세요.</p><div class="empty-actions"><button class="button link small" data-action="compose-poem">시 쓰기</button><button class="button link small" data-action="compose-letter">편지 쓰기</button></div></div>`}</section>
  <section><div class="section-head"><h2>지난 7일의 마음</h2><button class="button link small" data-action="navigate" data-view="calendar" aria-label="마음 달력 보기">${icon('calendar',19)}</button></div><div class="panel week-panel">${weekHTML()}<p class="week-caption">${state.moods.length?'하루의 마지막 기록을 모아 보았어요.<br>어떤 마음이든, 남겨 둔 만큼의 의미가 있어요.':'아직 남긴 마음이 없어요.<br>오늘의 작은 기록으로 채워가 보세요.'}</p></div></section></div>`;
}
function weekHTML() {
  const days=[];
  for(let n=6;n>=0;n--){ const d=new Date();d.setDate(d.getDate()-n);days.push(localDay(d)); }
  return `<div class="week-strip">${days.map(day=>{
    const records=state.moods.filter(m=>m.date===day).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    const m=records.length?moodById(records[0].emotion):null;
    return `<button class="week-day${day===today()?' today':''}" data-action="day" data-day="${day}" aria-label="${esc(dateText(dayDate(day)))} ${m?m.label:'기록 없음'}"><span>${dateText(dayDate(day),{weekday:'short'})}</span><span class="day-dot${m?' recorded':''}" ${m?`style="--tone:${m.color};--tone-ink:${m.ink}"`:''}>${m?icon(m.icon,18):'·'}</span><span>${dayDate(day).getDate()}</span></button>`;
  }).join('')}</div>`;
}
function letterRow(l) {
  const poem=l.kind==='poem';
  return `<button class="letter-row" data-action="read-letter" data-id="${esc(l.id)}"><span class="letter-mini" style="--letter-color:${paperById(l.color).color}">${icon(poem?'pen':'letter',21)}</span><span class="letter-row-content"><span class="letter-row-title">${esc(l.title||(poem?'제목 없는 시':'제목 없는 편지'))}</span><span class="letter-row-meta">${esc(poem?'시':l.recipient?`편지 · To. ${l.recipient}`:'편지')} · ${shortDate(l.updatedAt)}${l.status==='draft'?' · 초안':''}</span></span>${icon('chevron',18)}</button>`;
}
function filteredLetters() {
  const needle=searchText.trim().toLocaleLowerCase();
  return [...state.letters].filter(l=>(letterFilter==='all'||l.status===letterFilter)&&(kindFilter==='all'||l.kind===kindFilter)&&(!needle||`${l.recipient} ${l.title} ${l.body}`.toLocaleLowerCase().includes(needle))).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
}
function lettersHTML() {
  return `<div class="page-heading"><div><div class="greeting-label">${icon('letter',16)}남겨 둔 마음들</div><h1>내 글 모음</h1><p>한 편의 시, 전하지 못한 편지. 나의 마음을 모아 두어요.</p></div></div>${draftBanner()}<div class="toolbar"><div class="search-wrap">${icon('search',19)}<label class="sr-only" for="letter-search">글의 제목, 내용, 받는 사람 검색</label><input id="letter-search" class="search-input" type="search" placeholder="어떤 마음을 찾고 있나요?" value="${esc(searchText)}" maxlength="300"></div></div><div class="library-filters"><div class="filter-group"><span>종류</span><div class="tabs" role="group" aria-label="글 종류 필터">${[['all','전체'],['poem','시'],['letter','편지']].map(([id,label])=>`<button class="tab${kindFilter===id?' active':''}" data-action="kind-filter" data-filter="${id}" aria-pressed="${kindFilter===id}">${label}</button>`).join('')}</div></div><div class="filter-group"><span>상태</span><div class="tabs" role="group" aria-label="글 상태 필터">${[['all','전체'],['complete','완성'],['draft','초안']].map(([id,label])=>`<button class="tab${letterFilter===id?' active':''}" data-action="filter" data-filter="${id}" aria-pressed="${letterFilter===id}">${label}</button>`).join('')}</div></div></div><div id="letter-results" class="letters-grid">${letterResultsHTML()}</div>`;
}
function letterResultsHTML() {
  const letters=filteredLetters();
  if(!letters.length) return `<div class="empty-box no-results"><span class="empty-icon">${icon(searchText?'search':'pen',25)}</span><h3>${searchText?'찾는 글이 아직 없어요':letterFilter==='draft'?'이 조건에 맞는 초안이 없어요':letterFilter==='complete'?'이 조건에 맞는 완성 글이 없어요':kindFilter==='poem'?'아직 남겨 둔 시가 없어요':kindFilter==='letter'?'아직 남겨 둔 편지가 없어요':'아직 남겨 둔 글이 없어요'}</h3><p>${searchText?'다른 말로 검색하거나 전체 글을 확인해 보세요.':'잘 쓰려고 애쓰지 않아도 괜찮아요.<br>떠오르는 한 문장부터 시작해 보세요.'}</p>${searchText?`<button class="button secondary small" data-action="clear-search">검색·필터 초기화</button>`:`<button class="button secondary" data-action="${kindFilter==='letter'?'compose-letter':'compose-poem'}">${icon('pen',17)}${kindFilter==='letter'?'편지 쓰기':'시 쓰기'}</button>`}</div>`;
  return letters.map(l=>{const poem=l.kind==='poem';return `<button class="letter-tile" style="--letter-color:${paperById(l.color).color}" data-action="read-letter" data-id="${esc(l.id)}"><span class="recipient">${esc(poem?'한 편의 시':l.recipient?`편지 · To. ${l.recipient}`:'보내지 않는 편지')}</span><h3>${esc(l.title||(poem?'제목 없는 시':'제목 없는 편지'))}</h3><p class="letter-excerpt${poem?' poem-excerpt':''}">${esc(l.body||'아직 적지 않은 마음이 있어요.')}</p><span class="tile-bottom"><time datetime="${esc(l.updatedAt)}">${dateText(l.updatedAt,{year:'numeric',month:'numeric',day:'numeric'})}</time><span class="status-tag">${l.status==='draft'?'초안':'완성'}</span></span></button>`;}).join('');
}
function calendarHTML() {
  const monthKey=`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}`;
  const monthMoods=state.moods.filter(m=>m.date.startsWith(monthKey));
  const days=new Set(monthMoods.map(m=>m.date)).size;
  const allDays=new Set(state.moods.map(m=>m.date)).size;
  return `<div class="page-heading"><div><div class="greeting-label">${icon('calendar',16)}차곡차곡 쌓인 하루</div><h1>마음 달력</h1><p>내가 남긴 마음을 천천히 돌아보세요.</p></div></div><div class="stats-row"><div class="stat">이번 달 기록한 날<strong>${days}<small>일</small></strong></div><div class="stat">이번 달 마음 기록<strong>${monthMoods.length}<small>개</small></strong></div><div class="stat">지금까지 함께한 날<strong>${allDays}<small>일</small></strong></div></div><div class="calendar-layout"><section class="panel calendar-panel"><div class="calendar-heading"><h2>${dateText(calendarMonth,{year:'numeric',month:'long'})}</h2><div class="calendar-controls"><button class="icon-button" data-action="month-prev" aria-label="이전 달">${icon('back',19)}</button><button class="button small secondary" data-action="calendar-today">오늘</button><button class="icon-button" data-action="month-next" aria-label="다음 달">${icon('chevron',19)}</button></div></div><div class="calendar-weekdays" aria-hidden="true">${['일','월','화','수','목','금','토'].map(d=>`<span>${d}</span>`).join('')}</div><div class="calendar-grid">${calendarDaysHTML()}</div><p class="calendar-help">그날 마지막으로 남긴 마음을 표시해요.<br>날짜를 선택하면 기록을 모두 읽을 수 있어요.</p></section><section class="panel day-panel">${dayPanelHTML()}</section></div>`;
}
function calendarDaysHTML() {
  const year=calendarMonth.getFullYear(),month=calendarMonth.getMonth(),count=new Date(year,month+1,0).getDate(),start=new Date(year,month,1).getDay();
  let html=Array(start).fill('<span aria-hidden="true"></span>').join('');
  for(let d=1;d<=count;d++) {
    const day=localDay(new Date(year,month,d));
    const records=state.moods.filter(m=>m.date===day).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    const mood=records.length?moodById(records[0].emotion):null;
    html+=`<button class="calendar-day${day===today()?' is-today':''}${day===selectedDay?' is-selected':''}" data-action="day" data-day="${day}" aria-pressed="${day===selectedDay}" aria-label="${esc(dateText(dayDate(day)))} ${records.length?`${mood.label}, 기록 ${records.length}개`:'기록 없음'}"><span>${d}</span>${mood?orb(mood):''}</button>`;
  }
  return html;
}
function dayPanelHTML() {
  const records=state.moods.filter(m=>m.date===selectedDay).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  return `<div class="section-head"><div><div class="section-overline">${dateText(dayDate(selectedDay),{weekday:'long'})}</div><h2>${dateText(dayDate(selectedDay),{month:'long',day:'numeric'})}의 마음</h2></div><span class="subtle">${records.length}개</span></div>${records.length?`<div class="mood-history">${records.map(m=>{const mood=moodById(m.emotion);return `<article class="mood-entry"><div class="mood-entry-top">${orb(mood)}<strong>${mood.label}</strong><time datetime="${esc(m.createdAt)}">${dateText(m.createdAt,{hour:'2-digit',minute:'2-digit'})}</time></div>${m.note?`<p>${esc(m.note)}</p>`:`<p class="muted">한 줄 없이 마음만 남겼어요.</p>`}<div class="mood-entry-actions"><button class="button small link" data-action="delete-mood" data-id="${esc(m.id)}" aria-label="${esc(dateText(m.createdAt))} ${mood.label} 기록 삭제">${icon('trash',15)}삭제</button></div></article>`}).join('')}</div>`:`<div class="empty-box"><span class="empty-icon">${icon('leaf',25)}</span><h3>이날은 남긴 마음이 없어요</h3><p>기록이 없는 하루도 괜찮아요.<br>오늘부터 가볍게 남겨 보세요.</p>${selectedDay===today()?`<button class="button small secondary" data-action="navigate" data-view="today">오늘의 마음 남기기</button>`:''}</div>`}`;
}

function bindMoodForm() {
  const form=$('#mood-form');
  if(!form) return;
  $('#mood-note').addEventListener('input',e=>{noteInput=e.target.value;});
  form.addEventListener('submit',e=>{
    e.preventDefault();
    if(!selectedMood) {toast('지금의 마음을 하나 골라 주세요.');$('.mood-option')?.focus();return;}
    const now=new Date().toISOString();
    const next={...state,moods:[...state.moods,{id:uid(),emotion:selectedMood,note:noteInput.trim(),date:today(),createdAt:now,updatedAt:now}]};
    if(persist(next)) {selectedMood=null;noteInput='';render();toast('오늘의 마음을 남겨 두었어요.');}
  });
}
function bindLettersSearch() {
  const input=$('#letter-search');
  if(!input)return;
  input.addEventListener('input',e=>{searchText=e.target.value;$('#letter-results').innerHTML=letterResultsHTML();});
}

function navigate(next, focus = true) {
  if(!['today','letters','calendar'].includes(next))return;
  view=next;
  if(location.hash!==`#${next}`)history.replaceState(null,'',`#${next}`);
  render();
  window.scrollTo({top:0,behavior:'auto'});
  if(focus)$('#main')?.focus({preventScroll:true});
}
function showDialog(content, kind='generic', label='dialog-title') {
  const old=$('dialog');
  if(old){clearTimeout(editorTimer);old.close();}
  $('#dialog-root').innerHTML=`<dialog data-kind="${kind}" aria-labelledby="${label}">${content}</dialog>`;
  const dialog=$('dialog');
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog();});
  dialog.showModal();
  return dialog;
}
function closeDialog() {
  const dialog=$('dialog');
  if(!dialog)return;
  if(dialog.dataset.kind==='editor'&&!flushComposer())return;
  dialog.close();
  $('#dialog-root').innerHTML='';
  render();
}
function dialogHeader(title, subtitle='') {
  return `<header class="dialog-header"><div>${subtitle?`<div class="section-overline">${subtitle}</div>`:''}<h2 id="dialog-title">${title}</h2></div><button type="button" class="icon-button" data-action="close-dialog" aria-label="닫기">${icon('close',21)}</button></header>`;
}

function preserveComposerAsDraft() {
  const c=state.composer;
  if(!c)return true;
  const hasContent=c.body||c.title||c.recipient;
  const same=state.letters.some(l=>l.kind===c.kind&&l.recipient===c.recipient&&l.title===c.title&&l.body===c.body&&l.color===c.color);
  const next={...state,letters:[...state.letters],composer:null};
  if(hasContent&&!same)next.letters.push({id:uid(),kind:c.kind||'letter',recipient:c.kind==='poem'?'':c.recipient,title:c.title,body:c.body,color:c.color,status:'draft',createdAt:c.updatedAt,updatedAt:c.updatedAt});
  if(!persist(next))return false;
  if(hasContent&&!same)toast('작성하던 글은 내 글 모음에 초안으로 남겨 두었어요.');
  return true;
}
function openComposer(id=null, requestedKind=null) {
  let c;
  const letter=id?state.letters.find(l=>l.id===id):null;
  if(id&&!letter)return;
  if(letter) {
    if(state.composer&&state.composer.letterId!==id&&(state.composer.body||state.composer.title||state.composer.recipient)) {
      if(!preserveComposerAsDraft())return;
    }
    c=state.composer?.letterId===id?state.composer:{letterId:id,kind:letter.kind||'letter',recipient:letter.recipient,title:letter.title,body:letter.body,color:letter.color,updatedAt:letter.updatedAt};
  } else {
    if(requestedKind&&state.composer&&state.composer.kind!==requestedKind&&!preserveComposerAsDraft())return;
    c=state.composer||{letterId:null,kind:requestedKind||'letter',recipient:'',title:'',body:'',color:'cream',updatedAt:new Date().toISOString()};
  }
  const poem=c.kind==='poem';
  const noun=poem?'시':'편지';
  const hints=poem?`<section class="poem-hints" aria-label="시를 시작하는 질문"><p>시작이 어려울 때, 작은 주제를 골라 보세요.</p><div class="hint-buttons">${POEM_HINTS.map(h=>`<button type="button" data-action="poem-hint" data-hint="${h.id}" aria-pressed="false">${h.label}</button>`).join('')}</div><p id="poem-hint-display" class="hint-prompt" aria-live="polite">정해진 길이나 운율은 없어요. 한 줄만 남겨도 괜찮아요.</p></section>`:'';
  const dialog=showDialog(`${dialogHeader(c.letterId?`${noun}에 마음 더하기`:poem?'한 줄에서 시작하는 시':'보내지 않는 편지',poem?'A POEM FROM THE HEART':'A LETTER FROM THE HEART')}<div class="dialog-content"><div class="field-grid${poem?' poem-fields':''}">${poem?'':`<div class="field"><label for="letter-recipient">누구에게 <span class="muted">· 선택</span></label><input id="letter-recipient" maxlength="120" placeholder="그리운 사람, 또는 나에게" value="${esc(c.recipient)}" autocomplete="off"></div>`}<div class="field"><label for="letter-title">${noun} 제목 <span class="muted">· 선택</span></label><input id="letter-title" maxlength="160" placeholder="이 마음에 이름을 붙인다면" value="${esc(c.title)}" autocomplete="off"></div></div>${hints}<div id="letter-paper" class="letter-editor" style="--letter-color:${paperById(c.color).color}"><label for="letter-body" class="sr-only">${noun} 내용</label><textarea id="letter-body" maxlength="50000" placeholder="${poem?'떠오르는 장면 하나,\n마음에 남은 말 한 줄.\n\n나의 속도로 시를 적어 보세요.':'문득, 당신이 생각났어요.\n\n잘 쓰려 하지 않아도 괜찮아요.\n마음에 남은 말부터 천천히 적어 보세요.'}">${esc(c.body)}</textarea></div><div class="color-picker" role="group" aria-label="${poem?'시집':'편지지'} 색 선택"><span>${poem?'시집 색':'편지지'}</span>${PAPERS.map(p=>`<button type="button" class="color-choice${c.color===p.id?' active':''}" style="--choice:${p.color}" data-action="paper-color" data-color="${p.id}" aria-label="${p.label}" aria-pressed="${c.color===p.id}">${c.color===p.id?icon('check',17):''}</button>`).join('')}</div><p class="editor-notice">${icon('storage',16)}<span>직접 적은 글을 이 브라우저에 임시로 보관해요.<br>${poem?'입력한 줄바꿈은 그대로 남아요.':'편지는 상대에게 발송되지 않아요.'}</span></p></div><footer class="dialog-footer"><span id="editor-save-state" class="save-state" role="status">${state.composer?'작성하던 마음을 불러왔어요.':'떠오르는 말부터 적어 보세요.'}</span><div class="dialog-footer-actions"><button class="button secondary" data-action="save-draft">초안 저장</button><button class="button" data-action="save-complete">${icon('check',17)}${letter?.status==='complete'?'수정 마치기':`${noun} 마치기`}</button></div></footer>`,'editor');
  dialog.dataset.letterId=c.letterId||'';
  dialog.dataset.entryKind=c.kind||'letter';
  dialog.dataset.color=c.color;
  dialog.dataset.dirty='false';
  ['#letter-recipient','#letter-title','#letter-body'].forEach(selector=>$(selector)?.addEventListener('input',queueComposerSave));
}
function editorValues() {
  const dialog=$('dialog[data-kind="editor"]');
  if(!dialog)return null;
  return {letterId:dialog.dataset.letterId||null,kind:dialog.dataset.entryKind||'letter',recipient:dialog.dataset.entryKind==='poem'?'':$('#letter-recipient')?.value||'',title:$('#letter-title').value,body:$('#letter-body').value,color:dialog.dataset.color,updatedAt:new Date().toISOString()};
}
function queueComposerSave() {
  const dialog=$('dialog[data-kind="editor"]');
  if(!dialog)return;
  dialog.dataset.dirty='true';
  $('#editor-save-state').textContent='작성 내용을 보관하는 중…';
  clearTimeout(editorTimer);
  editorTimer=setTimeout(()=>flushComposer(true),650);
}
function flushComposer(quiet=false) {
  clearTimeout(editorTimer);
  const dialog=$('dialog[data-kind="editor"]');
  if(!dialog||dialog.dataset.dirty!=='true')return true;
  const values=editorValues();
  const hasContent=values.recipient||values.title||values.body;
  if(persist({...state,composer:hasContent?values:null},{quiet})) {
    dialog.dataset.dirty='false';
    $('#editor-save-state').textContent=hasContent?'이 브라우저에 임시 보관했어요.':'새로운 한 줄을 기다리고 있어요.';
    return true;
  }
  $('#editor-save-state').textContent='저장 실패 · 내용을 복사해 보관해 주세요.';
  return false;
}
function saveLetter(status) {
  clearTimeout(editorTimer);
  const values=editorValues();
  if(!values)return;
  if(status==='complete'&&!values.body.trim()) {toast('남기고 싶은 내용을 한 줄 적어 주세요.');$('#letter-body').focus();return;}
  if(!values.body.trim()&&!values.title.trim()&&!values.recipient.trim()) {toast('남겨 두고 싶은 마음을 먼저 적어 주세요.');$('#letter-body').focus();return;}
  const existing=state.letters.find(l=>l.id===values.letterId);
  const now=new Date().toISOString();
  const letter={id:existing?.id||uid(),kind:values.kind,recipient:values.kind==='poem'?'':values.recipient.trim(),title:values.title.trim(),body:values.body,color:values.color,status,createdAt:existing?.createdAt||now,updatedAt:now};
  const letters=existing?state.letters.map(l=>l.id===existing.id?letter:l):[...state.letters,letter];
  if(!persist({...state,letters,composer:null})) {$('#editor-save-state').textContent='저장하지 못했어요. 내용을 복사해 주세요.';return;}
  $('dialog').dataset.dirty='false';
  closeDialog();
  toast(status==='draft'?'내 글 모음에 초안을 저장했어요.':`${values.kind==='poem'?'시를':'편지를'} 내 글 모음에 남겨 두었어요.`);
}
function readLetter(id) {
  const l=state.letters.find(l=>l.id===id);if(!l)return;
  const poem=l.kind==='poem',noun=poem?'시':'편지';
  showDialog(`${dialogHeader(poem?'마음으로 쓴 시':'마음의 편지',poem?'A POEM OF YOUR OWN':'FROM YOUR LETTERBOX')}<div class="dialog-content"><div class="view-meta"><span>${noun} · ${l.status==='draft'?'아직 쓰고 있는 초안':'완성한 글'}</span><button class="button small link" data-action="delete-letter" data-id="${esc(id)}">${icon('trash',15)}삭제</button></div><article class="view-letter" style="--letter-color:${paperById(l.color).color}">${poem?'':`<p class="recipient">${esc(l.recipient?`To. ${l.recipient}`:'To. 마음에 남은 누군가')}</p>`}<h2>${esc(l.title||`제목 없는 ${noun}`)}</h2><div class="letter-body">${esc(l.body||'아직 내용을 적지 않았어요.')}</div><p class="letter-date">${dateText(l.updatedAt)} · 그리움과 시에 남김</p></article></div><footer class="dialog-footer"><div class="dialog-footer-actions"><button class="button secondary" data-action="export-letter" data-id="${esc(id)}">${icon('download',17)}텍스트 저장</button><button class="button secondary" data-action="print-letter" data-id="${esc(id)}">${icon('print',17)}인쇄</button><button class="button" data-action="edit-letter" data-id="${esc(id)}">${icon('pen',17)}이어 쓰기</button></div></footer>`,'reader');
}
function deleteLetter(id) {
  const l=state.letters.find(l=>l.id===id);if(!l)return;
  if(!confirm(`‘${l.title||(l.kind==='poem'?'제목 없는 시':'제목 없는 편지')}’를 삭제할까요? 이 브라우저에서는 되돌릴 수 없어요.`))return;
  const next={...state,letters:state.letters.filter(l=>l.id!==id),composer:state.composer?.letterId===id?null:state.composer};
  if(persist(next)){$('#print-surface').innerHTML='';closeDialog();toast('글을 삭제했어요.');}
}
function downloadText(text,filename,type='text/plain;charset=utf-8') {
  try {
    if (window.HannunNativeWeb.post({ type:'downloadText', name:filename, mime:type.split(';')[0], text:text })) return true;
    const blob=new Blob([text],{type}), url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
    return true;
  }catch{toast('파일을 만들지 못했어요. 브라우저 설정을 확인해 주세요.',true);return false;}
}
function safeFilename(s) { return s.replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').slice(0,55)||'제목없는글'; }
function exportLetter(id) {
  const l=state.letters.find(l=>l.id===id);if(!l)return;
  const noun=l.kind==='poem'?'시':'편지';
  const text=`${noun} · ${l.title||`제목 없는 ${noun}`}\n${l.kind!=='poem'&&l.recipient?`To. ${l.recipient}\n`:''}\n${l.body}\n\n${dateText(l.updatedAt)}\n그리움과 시 — 마음을 놓아두는 곳\n`;
  if(downloadText(text,`그리움과시_${noun}_${safeFilename(l.title)}_${localDay(new Date(l.updatedAt))}.txt`))toast('텍스트 파일 저장을 시작했어요.');
}
function printLetter(id) {
  const l=state.letters.find(l=>l.id===id);if(!l)return;
  const noun=l.kind==='poem'?'시':'편지';
  $('#print-surface').innerHTML=`<p class="print-meta">그리움과 시 · ${noun} · ${dateText(l.updatedAt)}</p><h1>${esc(l.title||`제목 없는 ${noun}`)}</h1>${l.kind!=='poem'&&l.recipient?`<p>To. ${esc(l.recipient)}</p>`:''}<div class="print-body">${esc(l.body)}</div><footer>마음을 놓아두는 곳, 그리움과 시</footer>`;
  if (!window.HannunNativeWeb.post({ type:'print' })) window.print();
}

function settingsDialog() {
  showDialog(`${dialogHeader('내 기록 관리','YOUR RECORDS')}<div class="dialog-content"><div class="privacy-callout">마음 기록 ${state.moods.length}개 · 시와 편지 ${state.letters.length}개<br>이 기기의 이 브라우저에 보관하고 있어요.</div>${storageBlocked?`<section class="dialog-section"><h3>기존 기록을 먼저 보관해 주세요</h3><p>저장된 내용을 읽는 중 문제가 생겼어요. 원본을 내려받은 뒤 복원 가능한 백업을 준비하고 초기화할 수 있어요. 지금은 기존 원본을 덮어쓰지 않아요.</p><button class="button secondary" data-action="export-raw">${icon('download',17)}기존 원본 내려받기</button></section>`:''}<section class="dialog-section"><h3>기록을 파일로 보관하기</h3><p>기기를 바꾸거나 브라우저 데이터를 지우기 전에 백업해 주세요. 마음 기록, 시와 편지, 작성 중인 글을 JSON 파일 하나에 담아요.</p><div class="settings-buttons"><button class="button secondary" data-action="export-backup" ${storageBlocked?'disabled':''}>${icon('download',17)}전체 기록 백업</button><button class="button secondary" data-action="choose-restore" ${storageBlocked?'disabled':''}>${icon('upload',17)}백업 파일 불러오기</button></div><input class="settings-file" id="restore-file" type="file" accept="application/json,.json" aria-label="그리움과 시 백업 JSON 파일 선택"><p class="subtle" style="margin-top:12px">파일에는 시와 편지 내용이 그대로 담겨요. 보관하거나 공유할 때 확인해 주세요.</p></section><section class="dialog-section"><h3>어디에 저장되나요?</h3><p>기록은 이 브라우저의 저장 공간(localStorage)에 보관됩니다. 계정이나 다른 기기로 자동 동기화하지 않고, 편지를 상대에게 보내지 않아요. 브라우저 데이터를 지우거나 비공개 모드를 종료하면 기록이 사라질 수 있어요.</p><p style="margin-top:9px">별도의 암호화·잠금 기능은 없어요. 같은 기기와 브라우저를 쓰는 사람은 기록을 볼 수 있습니다. 시와 편지 내용은 앱 기능을 위해 외부 서버로 전송하지 않습니다.</p><button class="button link small" data-action="help">자세한 이용·개인정보 안내</button></section><section class="dialog-section"><h3>이 브라우저의 기록 지우기</h3><p>마음 기록과 시·편지, 작성 중인 글을 모두 지워요. 필요한 기록은 먼저 백업해 주세요.</p><button class="button danger" data-action="delete-all-dialog">${icon('trash',17)}전체 기록 삭제</button></section></div><footer class="dialog-footer"><span class="subtle">내 마음은 내가 보관해요.</span><button class="button secondary" data-action="close-dialog">닫기</button></footer>`,'settings');
  $('#restore-file').addEventListener('change',handleRestoreFile);
}
function exportBackup() {
  if(storageBlocked){toast('원본을 먼저 내려받아 주세요.',true);return;}
  const backup={...state,exportedAt:new Date().toISOString(),app:'geurium'};
  if(downloadText(JSON.stringify(backup,null,2),`그리움과시_기록백업_${today()}.json`,'application/json;charset=utf-8'))toast('백업 파일 저장을 시작했어요.');
}
async function handleRestoreFile(event) {
  const file=event.target.files?.[0];if(!file)return;
  if(file.size>MAX_FILE_BYTES){toast('5MB 이하의 그리움과 시 백업 파일을 선택해 주세요.',true);event.target.value='';return;}
  try {
    const raw=await file.text();
    const parsed=JSON.parse(raw);
    if(parsed?.app!=='geurium')throw new Error('그리움과 시에서 내보낸 백업 파일을 선택해 주세요.');
    pendingRestore={data:validateRecordData(parsed),name:file.name};
    restorePreview();
  } catch(error){toast(error instanceof SyntaxError?'읽을 수 있는 JSON 파일이 아니에요. 파일을 확인해 주세요.':error.message||'백업 파일을 읽지 못했어요.',true);event.target.value='';}
}
function restorePreview() {
  const r=pendingRestore;if(!r)return;
  showDialog(`${dialogHeader('백업 내용을 확인해 주세요','RESTORE YOUR RECORDS')}<div class="dialog-content"><p class="restore-file-name">${esc(r.name)}</p><div class="backup-summary"><div>마음 기록<strong>${r.data.moods.length}개</strong></div><div>시와 편지<strong>${r.data.letters.length}개</strong></div></div><section class="dialog-section"><h3>지금 기록에 합쳐서 보관해요</h3><p>현재 기록을 지우지 않아요. 같은 기록은 한 번만 보관하고, 같은 번호라도 내용이 다르면 별도 기록으로 남겨요.</p><p style="margin-top:10px">${r.data.composer?'백업에 작성 중인 글도 있어요. 복원하면 내 글 모음에 초안으로 추가해요.':'백업 내용을 확인한 뒤 아래 버튼을 눌러 주세요.'}</p></section></div><footer class="dialog-footer"><button class="button secondary" data-action="settings">취소</button><button class="button" data-action="confirm-restore">${icon('upload',17)}합쳐서 복원하기</button></footer>`,'restore');
}
function mergeRecords(current,incoming) {
  const result=[...current], map=new Map(current.map(r=>[r.id,r]));
  for(const item of incoming){
    const existing=map.get(item.id);
    if(!existing){result.push(item);map.set(item.id,item);}
    else if(JSON.stringify(existing)!==JSON.stringify(item)){
      const signature=r=>JSON.stringify({...r,id:''});
      if(!result.some(r=>signature(r)===signature(item))){const copy={...item,id:uid()};result.push(copy);map.set(copy.id,copy);}
    }
  }
  return result;
}
function confirmRestore() {
  const r=pendingRestore;if(!r)return;
  const next={...state,moods:mergeRecords(state.moods,r.data.moods),letters:mergeRecords(state.letters,r.data.letters)};
  const c=r.data.composer;
  if(c&&(c.recipient||c.title||c.body)){
    const matching=next.letters.some(l=>l.kind===c.kind&&l.recipient===c.recipient&&l.title===c.title&&l.body===c.body&&l.color===c.color);
    const currentMatch=state.composer&&state.composer.kind===c.kind&&state.composer.recipient===c.recipient&&state.composer.title===c.title&&state.composer.body===c.body&&state.composer.color===c.color;
    if(!matching&&!currentMatch)next.letters.push({id:uid(),kind:c.kind||'letter',recipient:c.kind==='poem'?'':c.recipient,title:c.title,body:c.body,color:c.color,status:'draft',createdAt:c.updatedAt,updatedAt:c.updatedAt});
  }
  if(next.letters.length>10000||next.moods.length>10000){toast('복원 후 기록 수가 보관 한도를 넘어요. 한 종류당 최대 10,000개까지 보관할 수 있어요.',true);return;}
  const added=next.letters.length+next.moods.length-state.letters.length-state.moods.length;
  if(persist(next)){pendingRestore=null;closeDialog();toast(added?`${added}개의 기록을 합쳐 복원했어요.`:'이미 보관한 기록이에요. 중복 없이 확인했어요.');}
}
function deleteAllDialog() {
  showDialog(`${dialogHeader('모든 기록을 지울까요?','DELETE YOUR RECORDS')}<div class="dialog-content"><div class="danger-box"><p>이 브라우저에 보관한 마음 기록 ${state.moods.length}개, 시와 편지 ${state.letters.length}개와 작성 중인 글을 삭제해요. 삭제한 기록은 백업 파일이 있어야 복원할 수 있습니다.</p><label for="delete-confirm" class="note-label" style="margin-top:14px">진행하려면 <strong>모두 삭제</strong>를 입력해 주세요.</label><input id="delete-confirm" placeholder="모두 삭제" autocomplete="off"><button class="button danger" id="delete-all-button" data-action="confirm-delete-all" disabled>${icon('trash',17)}전체 기록 삭제</button></div></div><footer class="dialog-footer"><button class="button secondary" data-action="settings">돌아가기</button></footer>`,'delete-all');
  $('#delete-confirm').addEventListener('input',e=>{$('#delete-all-button').disabled=e.target.value!=='모두 삭제';});
}
function confirmDeleteAll() {
  if($('#delete-confirm')?.value!=='모두 삭제')return;
  try {localStorage.removeItem(STORAGE_KEY);}
  catch{toast('기록을 삭제하지 못했어요. 브라우저 저장 설정을 확인해 주세요.',true);return;}
  state=blankState();storageBlocked=false;storageError='';originalCorruptText=null;selectedMood=null;noteInput='';pendingRestore=null;lastStorageRaw=null;tabConflict=false;
  $('#print-surface').innerHTML='';
  clearTimeout(editorTimer);closeDialog();toast('이 브라우저의 그리움과 시 기록을 모두 삭제했어요.');
}
function helpDialog() {
  showDialog(`${dialogHeader('그리움과 시를 이용하는 방법','A QUIET PLACE FOR YOUR HEART')}<div class="dialog-content"><div class="privacy-callout">그리움과 시는 직접 쓴 마음을 놓아두는 작은 글쓰기 책상입니다.<br>한 줄의 시여도, 다 쓰지 못한 편지여도 괜찮아요.</div><section class="dialog-section"><h3>오늘의 마음</h3><p>가까운 감정을 하나 고르고 짧은 메모를 남겨요. 하루에 여러 번 기록할 수 있고, 마음 달력에는 그날의 마지막 감정을 표시합니다. 기록한 감정과 개수를 보여줄 뿐, 성격이나 건강 상태를 진단하지 않아요.</p></section><section class="dialog-section"><h3>마음으로 시 쓰기</h3><p>시 제목과 내용을 직접 적어 보세요. 작은 작성 주제 네 가지를 골라 시작할 수 있어요. 앱이 시를 자동 생성하거나 다른 사람의 시를 가져오지는 않습니다. 입력한 줄바꿈과 빈 줄은 저장·읽기·텍스트 내보내기에서 그대로 유지해요. ‘초안 저장’과 ‘시 마치기’로 내 글 모음에 보관할 수 있습니다.</p></section><section class="dialog-section"><h3>보내지 않는 편지</h3><p>받는 사람과 제목은 비워도 괜찮아요. 편지 내용은 입력 중 이 브라우저에 임시로 보관돼요. ‘초안 저장’을 누르면 내 글 모음에 들어가고, ‘편지 마치기’를 누르면 완성한 편지가 됩니다. 편지는 누구에게도 발송되지 않아요.</p></section><section class="dialog-section"><h3>기록의 보관과 개인정보</h3><ul><li>마음 기록과 시·편지는 현재 기기의 현재 브라우저 저장 공간에 보관됩니다.</li><li>회원가입과 클라우드 동기화, 예약 발송, 실제 답장 기능은 없습니다.</li><li>이 앱은 글 내용을 외부 서버로 전송하거나 광고·분석 도구로 보내지 않습니다. 다만 사이트를 제공하는 호스팅 서비스는 일반 접속 정보를 처리할 수 있습니다.</li><li>별도의 기록 암호화나 비밀번호 잠금 기능이 없습니다. 공용 기기에서는 다른 사용자가 기록을 볼 수 있어요.</li><li>브라우저 데이터 삭제, 저장 공간 정리, 비공개 모드 종료 시 기록이 사라질 수 있습니다.</li><li>백업·텍스트 파일에는 기록 내용이 그대로 담깁니다. 보관 장소와 공유 대상을 직접 확인해 주세요.</li></ul></section><section class="dialog-section"><h3>기기를 옮기려면</h3><ol><li>이전 기기의 ‘내 기록 관리’에서 ‘전체 기록 백업’을 눌러요.</li><li>새 기기에서 같은 그리움과 시 사이트를 열어요.</li><li>‘백업 파일 불러오기’로 JSON 파일을 고르고 내용을 확인해요.</li><li>‘합쳐서 복원하기’를 누르면 현재 기록과 함께 보관해요.</li></ol><p style="margin-top:10px">앱 설치본과 웹사이트도 기기·브라우저에 따라 저장 공간이 다를 수 있어요. 먼저 백업한 뒤 옮겨 주세요.</p></section><section class="dialog-section"><h3>저장이 잘되지 않으면</h3><p>작성 내용을 먼저 복사해 두세요. 사용 중인 브라우저가 사이트 저장을 허용하는지와 기기의 여유 공간을 확인해 주세요. 읽지 못한 기존 데이터가 있으면 덮어쓰지 않고 원본을 내려받을 수 있도록 안내합니다.</p></section></div><footer class="dialog-footer"><button class="button secondary" data-action="settings">내 기록 관리</button><button class="button" data-action="close-dialog">알겠어요</button></footer>`,'help');
}

document.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');
  if(!button||button.disabled)return;
  const action=button.dataset.action;
  switch(action){
    case 'navigate':navigate(button.dataset.view);break;
    case 'compose':openComposer();break;
    case 'compose-letter':openComposer(null,'letter');break;
    case 'compose-poem':openComposer(null,'poem');break;
    case 'settings':settingsDialog();break;
    case 'help':helpDialog();break;
    case 'close-dialog':closeDialog();break;
    case 'select-mood':{
      if(!moodById(button.dataset.mood))break;
      selectedMood=button.dataset.mood;
      $$('.mood-option').forEach(b=>{const selected=b.dataset.mood===selectedMood;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
      break;
    }
    case 'read-letter':readLetter(button.dataset.id);break;
    case 'edit-letter':openComposer(button.dataset.id);break;
    case 'save-draft':saveLetter('draft');break;
    case 'save-complete':saveLetter('complete');break;
    case 'paper-color':{
      const paper=PAPERS.find(p=>p.id===button.dataset.color),dialog=$('dialog[data-kind="editor"]');if(!paper||!dialog)break;
      dialog.dataset.color=paper.id;$('#letter-paper').style.setProperty('--letter-color',paper.color);
      $$('.color-choice').forEach(b=>{const active=b.dataset.color===paper.id;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));b.innerHTML=active?icon('check',17):'';});queueComposerSave();break;
    }
    case 'filter':letterFilter=button.dataset.filter;render();break;
    case 'kind-filter':kindFilter=button.dataset.filter;render();break;
    case 'clear-search':searchText='';letterFilter='all';kindFilter='all';render();$('#letter-search')?.focus();break;
    case 'poem-hint':{
      const hint=POEM_HINTS.find(h=>h.id===button.dataset.hint);if(!hint)break;
      $('#poem-hint-display').textContent=hint.text;
      $$('.hint-buttons button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hint===hint.id)));
      break;
    }
    case 'delete-letter':deleteLetter(button.dataset.id);break;
    case 'export-letter':exportLetter(button.dataset.id);break;
    case 'print-letter':printLetter(button.dataset.id);break;
    case 'day':{
      if(!validDay(button.dataset.day))break;selectedDay=button.dataset.day;const d=dayDate(selectedDay);calendarMonth=new Date(d.getFullYear(),d.getMonth(),1);navigate('calendar',false);break;
    }
    case 'month-prev':calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1,1);render();break;
    case 'month-next':calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1);render();break;
    case 'calendar-today':selectedDay=today();calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1);render();break;
    case 'delete-mood':{
      if(!confirm('이 마음 기록을 삭제할까요? 이 브라우저에서는 되돌릴 수 없어요.'))break;
      if(persist({...state,moods:state.moods.filter(m=>m.id!==button.dataset.id)})){render();toast('마음 기록을 삭제했어요.');}break;
    }
    case 'export-backup':exportBackup();break;
    case 'export-raw':if(originalCorruptText)downloadText(originalCorruptText,`그리움_복구원본_${today()}.json`,'application/json;charset=utf-8');break;
    case 'choose-restore':$('#restore-file')?.click();break;
    case 'confirm-restore':confirmRestore();break;
    case 'delete-all-dialog':deleteAllDialog();break;
    case 'confirm-delete-all':confirmDeleteAll();break;
    case 'export-editor':{
      const c=editorValues();if(!c)break;
      if(downloadText(`${c.kind==='poem'?'시':'편지'} · ${c.title||'작성 중인 글'}\n${c.kind!=='poem'&&c.recipient?`To. ${c.recipient}\n`:''}\n${c.body}`,`그리움과시_작성중_${today()}.txt`))toast('작성 내용 파일 저장을 시작했어요.');
      break;
    }
    case 'reload-app':{
      if($('dialog[data-kind="editor"]')&&!confirm('지금 작성한 내용은 파일로 보관하셨나요? 새로고침하면 아직 저장하지 못한 입력은 사라져요.'))break;
      const editor=$('dialog[data-kind="editor"]');if(editor)editor.dataset.dirty='false';
      location.reload();break;
    }
  }
});
window.addEventListener('hashchange',()=>{const next=location.hash.slice(1);if(['today','letters','calendar'].includes(next)){view=next;render();}});
window.addEventListener('beforeunload',event=>{if(!flushComposer(true)){event.preventDefault();event.returnValue='';}});
window.addEventListener('afterprint',()=>{$('#print-surface').innerHTML='';});
window.addEventListener('hannun-native-result',event=>{
  if (event.detail && event.detail.type==='printResult') {
    $('#print-surface').innerHTML='';
    if (!event.detail.ok && !event.detail.cancelled) toast('인쇄를 시작하지 못했어요. 다시 시도해 주세요.',true);
  }
});
window.addEventListener('storage',event=>{
  if(event.key!==STORAGE_KEY)return;
  const editor=$('dialog[data-kind="editor"]');
  if(editor){tabConflict=true;showTabConflict();return;}
  try {state=event.newValue?validateRecordData(JSON.parse(event.newValue)):blankState();lastStorageRaw=event.newValue;storageError='';storageBlocked=false;tabConflict=false;render();toast('다른 탭의 기록을 반영했어요.');}
  catch{storageError='다른 탭의 변경 내용을 읽지 못했어요. 현재 기록을 백업한 뒤 다시 확인해 주세요.';render();}
});
loadState();
render();

// Intentionally no network requests. Records remain in this browser until the user exports them.

window.addEventListener('hannun-native-result', function (event) {
  const result = event.detail;
  if (!result || result.type !== 'downloadResult') return;
  if (result.ok) toast('파일을 저장했어요.');
  else if (result.cancelled) toast('파일 저장을 취소했어요.');
  else toast('파일을 저장하지 못했어요. 저장 위치와 공간을 확인해 주세요.');
});

})();
