(function() {
    'use strict';

    // config
    const TARGET_GROUP_NUMBER = "3"; // number of group to select
    const TARGET_HOUR = 5;           // h 
    const TARGET_MINUTE = 59;        // min
    const TARGET_SECOND = 59;        // sec
    const BUTTON_TEXT_TRIGGERS = ["Zarejestruj", "Zapisz", "Rejestruj", "Dalej", "Wybierz"]; 

    let targetButton = null;
    let groupCheckbox = null;
    let groupRow = null;
    let burstActive = false; 
    let statusPanel = null; 

    function createStatusPanel() {
        if (statusPanel) return;

        statusPanel = document.createElement('div');
        statusPanel.style.position = 'fixed';
        statusPanel.style.top = '10px';
        statusPanel.style.right = '10px';
        statusPanel.style.zIndex = '999999';
        statusPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        statusPanel.style.color = 'white';
        statusPanel.style.padding = '15px';
        statusPanel.style.borderRadius = '5px';
        statusPanel.style.fontFamily = 'monospace';
        statusPanel.style.fontSize = '14px';
        statusPanel.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        statusPanel.innerHTML = `
            <div style="font-weight: bold; border-bottom: 1px solid #555; margin-bottom: 5px;">🤖 USOS BOT STATUS</div>
            <div>Cel: Grupa ${TARGET_GROUP_NUMBER} @ ${TARGET_HOUR}:${TARGET_MINUTE < 10 ? '0'+TARGET_MINUTE : TARGET_MINUTE}:${TARGET_SECOND < 10 ? '0'+TARGET_SECOND : TARGET_SECOND}</div>
            <div id="bot-status-group">Grupa: Szukam... ❌</div>
            <div id="bot-status-btn">Przycisk: Szukam... ❌</div>
            <div id="bot-status-time" style="margin-top: 5px; color: yellow;">Czas: --:--:--</div>
        `;
        document.body.appendChild(statusPanel);
    }

    function updateStatusPanel() {
        if (!statusPanel) createStatusPanel();

        const groupStatus = document.getElementById('bot-status-group');
        const btnStatus = document.getElementById('bot-status-btn');
        const timeStatus = document.getElementById('bot-status-time');

        if (groupCheckbox) {
            groupStatus.innerHTML = `Grupa: ZNALEZIONA (Checkbox) ✅`;
            groupStatus.style.color = 'lime';
        } else if (groupRow) {
            groupStatus.innerHTML = `Grupa: WIDZĘ WIERSZ (Czekam na checkbox) ⚠️`;
            groupStatus.style.color = 'orange';
        } else {
            groupStatus.innerHTML = `Grupa: Szukam... ❌`;
            groupStatus.style.color = 'red';
        }

        if (targetButton) {
            btnStatus.innerHTML = `Przycisk: GOTOWY ✅`;
            btnStatus.style.color = 'lime';
        } else {
            btnStatus.innerHTML = `Przycisk: Brak ❌`;
            btnStatus.style.color = 'red';
        }

        const now = new Date();
        const targetTime = new Date();
        targetTime.setHours(TARGET_HOUR, TARGET_MINUTE, TARGET_SECOND, 0);
        const diff = Math.floor((targetTime - now) / 1000);

        if (diff > 0) {
            timeStatus.innerText = `Start za: ${diff}s`;
            timeStatus.style.color = 'yellow';
        } else if (diff > -60) {
            timeStatus.innerText = `CZAS START! (Minęło ${Math.abs(diff)}s)`;
            timeStatus.style.color = 'red';
            timeStatus.style.fontWeight = 'bold';
        } else {
            timeStatus.innerText = `Po czasie. Czekam na jutro/kolejną próbę.`;
            timeStatus.style.color = 'gray';
        }
    }

    function log(msg) {
        const now = new Date();
        console.log(`[USOS-BOT ${now.toLocaleTimeString()}.${now.getMilliseconds()}] ${msg}`);
    }

    function findAndSelectGroup() { // find checkbox/row
        // find checkbox on site
        if (!groupCheckbox || !document.body.contains(groupCheckbox)) {
             const inputs = document.querySelectorAll('input[type="checkbox"][name*="zajecia"]');
             for (let input of inputs) {
                if (input.value === TARGET_GROUP_NUMBER) {
                    groupCheckbox = input;
                    log(`Znaleziono CHECKBOX grupy ${TARGET_GROUP_NUMBER}.`);
                    break;
                }
            }
        }

        if (groupCheckbox) {
            if (!groupCheckbox.checked) {
                log(`Zaznaczam grupę ${TARGET_GROUP_NUMBER}...`);
                groupCheckbox.click();
                if(!groupCheckbox.checked) groupCheckbox.checked = true;
            }
            highlightElement(groupCheckbox, "#00ff00"); 
        }

        // find row
        if (!groupRow || !document.body.contains(groupRow)) {
            const cells = document.querySelectorAll('td');
            for (let cell of cells) {
                if (cell.innerText.trim() === TARGET_GROUP_NUMBER) {
                    const row = cell.closest('tr');
                    if (row) {
                        groupRow = row;
                        log(`Znaleziono WIERSZ grupy ${TARGET_GROUP_NUMBER}.`);
                        break;
                    }
                }
            }
        }

        if (groupRow) {
            const color = groupCheckbox ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 165, 0, 0.3)";
            if (groupRow.style.backgroundColor !== color) {
                groupRow.style.backgroundColor = color;
                groupRow.style.border = groupCheckbox ? "2px solid green" : "2px solid orange";
            }
        }
    }

    function findRegistrationButton() {
        if (targetButton && document.body.contains(targetButton)) return; 

        const candidates = [
            ...document.querySelectorAll('button'),
            ...document.querySelectorAll('input[type="submit"]'),
            ...document.querySelectorAll('input[type="button"]'),
            ...document.querySelectorAll('.button'),   
            ...document.querySelectorAll('a.submit'),     
            ...document.querySelectorAll('input[value="Zarejestruj"]') 
        ];

        for (let el of candidates) {
            const text = (el.innerText || el.value || "").trim();
            
            // check if text has one of the trigger
            if (BUTTON_TEXT_TRIGGERS.some(trigger => text.includes(trigger))) {
                targetButton = el;
                log(`Znaleziono przycisk rejestracji: "${text}"`);
                highlightElement(el, "red");
                return;
            }
        }
    }

    // el backlight
    function highlightElement(el, color) {
        el.style.border = `5px solid ${color}`;
        el.style.boxShadow = `0 0 15px ${color}`;
        el.style.transition = "all 0.2s";
        el.setAttribute('data-bot-highlight', 'true');
    }

    // execute a series of clicks
    function executeBurstClick(btn) {
        if (burstActive) return;
        burstActive = true;
        
        log("!!! ROZPOCZYNAM SERIĘ KLIKNIĘĆ (start 5:59:59) !!!");
        
        let clicks = 0;
        const totalClicks = 8;
        const intervalTime = 250; // every 250ms
        
        btn.click();
        clicks++;
        log(`Kliknięcie nr ${clicks} (natychmiastowe)`);

        const interval = setInterval(() => {
            if (clicks >= totalClicks) {
                clearInterval(interval);
                log("Koniec serii kliknięć.");
                return;
            }
            
            if (document.body.contains(btn)) {
                btn.click();
                clicks++;
                log(`Kliknięcie nr ${clicks}`);
            } else {
                log("Przycisk zniknął z DOM, przerywam serię.");
                clearInterval(interval);
            }
        }, intervalTime);
    }

    function checkTimeAndAct() {
        if (burstActive) return; 

        const now = new Date();
        const targetTime = new Date();
        targetTime.setHours(TARGET_HOUR, TARGET_MINUTE, TARGET_SECOND, 0);

        if (now >= targetTime) {
            const diff = now - targetTime;
            
            if (diff < 10000) { 
                if (targetButton) {
                    executeBurstClick(targetButton);
                    targetButton = null; 
                }
            }
        }
    }

    setInterval(() => {
        findAndSelectGroup();
        findRegistrationButton();
        checkTimeAndAct();
        updateStatusPanel();
    }, 50);

})();
