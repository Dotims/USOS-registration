document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);



const KEYS = {
    'group_algebra': 'Algebra z geometrią MS',
    'group_analiza': 'Analiza matematyczna II',
    'group_cpp': 'Język C++',
    'group_matdysk': 'Matematyka dyskretna',

    'group_so': 'Systemy operacyjne',
    'group_filozofia': 'Filozofia'
};

function saveOptions() {
  const settings = {};
  for (const id in KEYS) {
      const val = document.getElementById(id).value;
      if (val) {
          settings[KEYS[id]] = val;
      }
  }

  // Zapisz czas
  const timer = {
      h: document.getElementById('target_hour').value || 5,
      m: document.getElementById('target_minute').value || 59,
      s: document.getElementById('target_second').value || 59
  };

  chrome.storage.local.set({ 
      'courses_config': settings,
      'timer_config': timer
  }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Zapisano! (Czas: ' + timer.h + ':' + timer.m + ':' + timer.s + ')';
    setTimeout(() => {
      status.textContent = '';
    }, 2500);
  });
}

function restoreOptions() {
  chrome.storage.local.get(['courses_config', 'timer_config'], (result) => {
      const config = result.courses_config || {};
      for (const id in KEYS) {
          const courseName = KEYS[id];
          if (config[courseName]) {
              document.getElementById(id).value = config[courseName];
          }
      }
      
      const timer = result.timer_config || { h: 5, m: 59, s: 59 };
      document.getElementById('target_hour').value = timer.h;
      document.getElementById('target_minute').value = timer.m;
      document.getElementById('target_second').value = timer.s;
  });
}
