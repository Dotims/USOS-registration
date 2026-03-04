// USOS Registration Bot — Popup Script
// Dynamic course management + timer config

const coursesList = document.getElementById('courses-list');
const emptyState = document.getElementById('empty-state');
const nameInput = document.getElementById('new-course-name');
const groupInput = document.getElementById('new-course-group');
const btnAdd = document.getElementById('btn-add-course');
const btnSave = document.getElementById('save');
const statusEl = document.getElementById('status');

// In-memory course list: [{name: string, group: string}]
let courses = [];

// ──────────── DOM ────────────

function renderCourses() {
  coursesList.innerHTML = '';
  emptyState.style.display = courses.length === 0 ? 'block' : 'none';

  courses.forEach((course, index) => {
    const card = document.createElement('div');
    card.className = 'course-card';

    card.innerHTML = `
      <span class="course-name" title="${escapeHtml(course.name)}">${escapeHtml(course.name)}</span>
      <span class="course-group">gr. ${escapeHtml(course.group)}</span>
      <button class="btn-remove" data-index="${index}" title="Usuń przedmiot">🗑️</button>
    `;

    coursesList.appendChild(card);
  });

  // Attach remove handlers
  coursesList.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.index);
      removeCourse(idx, e.currentTarget.closest('.course-card'));
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ──────────── Actions ────────────

function addCourse() {
  const name = nameInput.value.trim();
  const group = groupInput.value.trim();

  if (!name) {
    shakeInput(nameInput);
    nameInput.focus();
    return;
  }
  if (!group) {
    shakeInput(groupInput);
    groupInput.focus();
    return;
  }

  // Check for duplicate course name
  if (courses.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    showStatus('Ten przedmiot już istnieje!', '#ff4444');
    shakeInput(nameInput);
    return;
  }

  courses.push({ name, group });
  nameInput.value = '';
  groupInput.value = '';
  nameInput.focus();

  renderCourses();
}

function removeCourse(index, cardEl) {
  // Animate out
  cardEl.classList.add('removing');
  cardEl.addEventListener('animationend', () => {
    courses.splice(index, 1);
    renderCourses();
  });
}

function shakeInput(el) {
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.borderColor = '#ff4444';
  el.style.animation = 'shake 0.3s ease';
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.animation = '';
  }, 600);
}

// ──────────── Save / Restore ────────────

function saveOptions() {
  // Build courses_config in the same format content.js expects: {courseName: groupNumber}
  const config = {};
  courses.forEach(c => {
    config[c.name] = c.group;
  });

  const timer = {
    h: document.getElementById('target_hour').value || '5',
    m: document.getElementById('target_minute').value || '59',
    s: document.getElementById('target_second').value || '59'
  };

  chrome.storage.local.set({
    courses_config: config,
    timer_config: timer
  }, () => {
    showStatus(`✅ Zapisano! (${courses.length} przedmiotów, czas: ${timer.h}:${pad(timer.m)}:${pad(timer.s)})`, '#22c55e');

    // Visual feedback on button
    btnSave.classList.add('saved');
    btnSave.textContent = '✅ Zapisano!';
    setTimeout(() => {
      btnSave.classList.remove('saved');
      btnSave.textContent = '💾 Zapisz ustawienia';
    }, 2000);
  });
}

function restoreOptions() {
  chrome.storage.local.get(['courses_config', 'timer_config'], (result) => {
    // Restore courses
    const config = result.courses_config || {};
    courses = [];
    for (const [name, group] of Object.entries(config)) {
      courses.push({ name, group: String(group) });
    }
    renderCourses();

    // Restore timer
    const timer = result.timer_config || { h: 5, m: 59, s: 59 };
    document.getElementById('target_hour').value = timer.h;
    document.getElementById('target_minute').value = timer.m;
    document.getElementById('target_second').value = timer.s;
  });
}

// ──────────── Helpers ────────────

function pad(val) {
  return String(val).padStart(2, '0');
}

function showStatus(text, color) {
  statusEl.textContent = text;
  statusEl.style.color = color || '#22c55e';
  setTimeout(() => {
    statusEl.textContent = '';
  }, 3000);
}

// ──────────── CSS animation (injected) ────────────

const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-3px); }
    80% { transform: translateX(3px); }
  }
`;
document.head.appendChild(style);

// ──────────── Events ────────────

document.addEventListener('DOMContentLoaded', restoreOptions);
btnSave.addEventListener('click', saveOptions);
btnAdd.addEventListener('click', addCourse);

// Enter key support
nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (nameInput.value.trim()) groupInput.focus();
  }
});

groupInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addCourse();
});
