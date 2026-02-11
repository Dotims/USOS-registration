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

  chrome.storage.local.set({ 'courses_config': settings }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Zapisano!';
    setTimeout(() => {
      status.textContent = '';
    }, 1500);
    
    // Odśwież aktywną kartę, żeby bot załapał zmiany od razu (opcjonalne)
    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    //    chrome.tabs.reload(tabs[0].id);
    // });
  });
}

function restoreOptions() {
  chrome.storage.local.get(['courses_config'], (result) => {
      const config = result.courses_config || {};
      for (const id in KEYS) {
          const courseName = KEYS[id];
          if (config[courseName]) {
              document.getElementById(id).value = config[courseName];
          }
      }
  });
}
