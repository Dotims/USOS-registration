// USOS Registration Bot - Content Script

(function() {
    'use strict';

    // --- KONFIGURACJA ---
    // Ustawienia czasowe (teraz ZMIENNE, ładowane z configu)
    let TARGET_HOUR = 5;      
    let TARGET_MINUTE = 59;     
    let TARGET_SECOND = 59;     

    const DEFAULT_GROUP = null; 
    const BUTTON_TEXT_TRIGGERS = ["Zarejestruj", "Zapisz", "Rejestruj", "Dalej", "Wybierz"]; 

    // --- STAN ---
    let detectedCourseName = null;
    let detectedCourseCode = null;
    let targetGroupNumber = null;
    let configMap = {}; // Załadowane z popupu
    
    // Generujemy losowe opóźnienie dla tej konkretnej karty (0 - 400ms)
    // Dzięki temu 5 otwartych kart nie wyśle żądania w TEJ SAMEJ milisekundzie, ale "gęsiego".
    const TAB_RANDOM_DELAY = Math.floor(Math.random() * 401); 
    
    // Konfiguracja precyzyjnych strzałów (Offsety w ms od Godziny "0")
    // Użytkownik prosił: -500ms, 0ms, +250ms, +750ms
    const ATTACK_OFFSETS = [-500, 0, 250, 750]; 

    // Refresh: 25 sekund po (6:00:25)
    // Retry: 45 sekund po (6:00:45) - Opcjonalnie, na razie skupmy się na Refresh
    const REFRESH_DELAY_MS = 25000; 
    const PRE_FIRE_MS = 3000; // Aktywujemy logikę 3 sekundy przed, żeby zdążyć zakolejkować timery

    let targetButton = null;
    let groupCheckbox = null;
    let groupRow = null;
    let burstActive = false;
    let refreshClicked = false;
    let statusPanel = null;
    let detectedRefreshButton = null;

    // --- ŁADOWANIE KONFIGURACJI ---
    function loadConfig() {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['courses_config', 'timer_config'], (result) => {
                if (result.courses_config) {
                    configMap = result.courses_config;
                    log("Config loaded: " + JSON.stringify(configMap));
                    detectCourseContext(); 
                }
                if (result.timer_config) {
                    TARGET_HOUR = parseInt(result.timer_config.h);
                    TARGET_MINUTE = parseInt(result.timer_config.m);
                    TARGET_SECOND = parseInt(result.timer_config.s);
                    log(`Timer loaded: ${TARGET_HOUR}:${TARGET_MINUTE}:${TARGET_SECOND}`);
                }
                updateStatusPanel();
            });
        }
    }
    
    // Nasłuchiwanie na wiadomości z popupu (Testowanie)
    // Nasłuchiwanie na wiadomości z popupu (Testowanie) - USUNIĘTE na prośbę użytkownika
    // (Kod testowy usunięty)

    function resetState() {
        log("Resetting state...");
        // Czyść style starego checkboxa
        if (groupCheckbox) {
            groupCheckbox.style.border = '';
            groupCheckbox.style.boxShadow = '';
            groupCheckbox.dataset.botHighlight = '';
            groupCheckbox = null;
        }
        // Czyść style starego wiersza
        if (groupRow) {
            groupRow.style.backgroundColor = '';
            groupRow.style.outline = '';
            groupRow.title = '';
            groupRow.dataset.botStyled = '';
            groupRow = null;
        }
        targetGroupNumber = null;
    }

    // Nasłuchiwanie na zmiany w storage (jak użytkownik zmieni w popupie w trakcie bycia na stronie)
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            if (changes.courses_config) {
                configMap = changes.courses_config.newValue;
                log("Config updated dynamically.");
                
                resetState(); // <--- WAŻNE: Czyścimy stare zaznaczenia!
                
                detectCourseContext();
            }
            if (changes.timer_config) {
                const t = changes.timer_config.newValue;
                TARGET_HOUR = parseInt(t.h);
                TARGET_MINUTE = parseInt(t.m);
                TARGET_SECOND = parseInt(t.s);
                log(`Timer updated dynamically: ${TARGET_HOUR}:${TARGET_MINUTE}:${TARGET_SECOND}`);
            }
            updateStatusPanel();
        }
    });

    // --- LOGIKA BOTA ---
    
    function detectCourseContext() {
        // 1. Pobranie KODU i NAZWY przedmiotu ze strony
        
        let code = null;
        let name = null;

        // Kod z URL
        const urlParams = new URLSearchParams(window.location.search);
        code = urlParams.get('prz_kod');

        // Kod/Nazwa z nagłówka H1 (najważniejsze dla dopasowania nazwy)
        const h1 = document.querySelector('h1');
        if (h1) {
            // Przykłady w H1:
            // "Algebra z geometrią MS WFAIS.IF-M005.1 ..." (często w spanie lub linku)
            // "<a...>Algebra z geometrią MS</a> <span class=note>KOD</span>"
            // "Filozofia (2526L) [KOD]"
            
            const link = h1.querySelector('a');
            if (link) {
                name = link.innerText.trim();
            } else {
                const block = h1.querySelector('span.block');
                if (block) {
                    const lines = block.innerText.split('\n');
                    name = lines[0].trim();
                } else {
                    name = h1.innerText.trim();
                }
            }
        }
        
        if (name) {
             name = name.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();
        }

        detectedCourseName = name;
        detectedCourseCode = code || "BRAK_KODU";

        // 2. Dopasowanie do konfiguracji
        
        targetGroupNumber = DEFAULT_GROUP;
        
        if (detectedCourseName) {
            for (const [cfgName, cfgGroup] of Object.entries(configMap)) {
                if (detectedCourseName.toLowerCase().includes(cfgName.toLowerCase())) {
                    targetGroupNumber = cfgGroup;
                    log(`Matched Config: "${cfgName}" -> Group ${cfgGroup}`);
                    break; 
                }
            }
        }
    }

    function createStatusPanel() {
        if (statusPanel) return;
        statusPanel = document.createElement('div');
        Object.assign(statusPanel.style, {
            position: 'fixed', top: '10px', right: '10px', zIndex: '999999',
            backgroundColor: 'rgba(0, 0, 0, 0.85)', color: 'white', padding: '15px',
            borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)', border: '1px solid #444',
            pointerEvents: 'none'
        });
        document.body.appendChild(statusPanel);
    }

    function updateStatusPanel() {
        if (!statusPanel) createStatusPanel();

        const nameDisplay = detectedCourseName ? (detectedCourseName.length > 30 ? detectedCourseName.substring(0,27)+"..." : detectedCourseName) : "Szukam nazwy...";
        let courseInfoHtml = `<div style="color: #bbb; font-size: 0.9em; margin-bottom: 5px;">
            Przedmiot: <span style="color:white" title="${detectedCourseName || ''}">${nameDisplay}</span>
        </div>`;
        
        let targetInfoHtml = "";
        if (targetGroupNumber) {
            targetInfoHtml = `<div>Cel: Grupa <span style="color: #00d2ff; font-weight:bold;">${targetGroupNumber}</span> @ ${TARGET_HOUR}:${TARGET_MINUTE < 10 ? '0'+TARGET_MINUTE : TARGET_MINUTE}:${TARGET_SECOND < 10 ? '0'+TARGET_SECOND : TARGET_SECOND}</div>`;
        } else {
            targetInfoHtml = `<div>Cel: <span style="color: gray;">Skonfiguruj w wtyczce!</span></div>`;
        }

        // Dodajemy info o opóźnieniu ("Delay: +123ms") żeby user widział że każda karta ma inaczej
        let statusHtml = `
            <div style="font-weight: bold; border-bottom: 1px solid #555; margin-bottom: 8px; padding-bottom: 4px; color: #00d2ff;">🤖 USOS BOT EXTENSION</div>
            ${courseInfoHtml}
            ${targetInfoHtml}
            <div style="font-size: 10px; color: #888; margin-top:2px;">Lag: +${TAB_RANDOM_DELAY}ms (Pre-fire: ${PRE_FIRE_MS/1000}s)</div>
            <div id="bot-status-group" style="margin-top:5px">Grupa: ...</div>
            <div id="bot-status-btn">Przycisk: ...</div>
            <div id="bot-status-time" style="margin-top: 8px; color: yellow; font-size: 1.1em;">Czas: --:--:--</div>
        `;
        
        if (statusPanel.childElementCount === 0 || statusPanel.querySelector('#bot-status-group') === null) {
            statusPanel.innerHTML = statusHtml;
        } else {
             // Aktualizuj dynamiczne elementy...
             const groupStatus = statusPanel.querySelector('#bot-status-group');
             const btnStatus = statusPanel.querySelector('#bot-status-btn');
             const timeStatus = statusPanel.querySelector('#bot-status-time');
             
             // Grupa
             if (!targetGroupNumber) {
                 groupStatus.innerHTML = `Grupa: <span style="color:gray">Brak celu</span>`;
                 groupStatus.style.color = 'gray';
             } else if (groupCheckbox) {
                 groupStatus.innerHTML = `Grupa: ZNALEZIONA (${groupCheckbox.type === 'radio'?'Radio':'Check'}) ✅`;
                 groupStatus.style.color = 'lime';
             } else if (groupRow) {
                 groupStatus.innerHTML = `Grupa: WIDZĘ WIERSZ ⚠️`;
                 groupStatus.style.color = 'orange';
             } else {
                 groupStatus.innerHTML = `Grupa: Szukam... ❌`;
                 groupStatus.style.color = 'red';
             }

             // Przycisk
             if (targetButton) {
                 btnStatus.innerHTML = `Przycisk: GOTOWY ✅`;
                 btnStatus.style.color = 'lime';
             } else {
                 btnStatus.innerHTML = `Przycisk: Brak ❌`;
                 btnStatus.style.color = 'red';
             }

             // Czas
             const now = new Date();
             const targetTime = new Date();
             targetTime.setHours(TARGET_HOUR, TARGET_MINUTE, TARGET_SECOND, 0);
             if (now - targetTime > 3600000) targetTime.setDate(targetTime.getDate() + 1);
             
             // Odliczanie uwzględnia PRE_FIRE_MS w wyświetlaniu "START!"
             // Ale wyświetlamy czas do "Godziny zero", a info o pre-fire jest wyżej
             const diff = Math.floor((targetTime - now) / 1000);
             
             // Czy jesteśmy w fazie "Pre-fire"?
             const msToTarget = targetTime - now;

             if (msToTarget > PRE_FIRE_MS) {
                 const h = Math.floor(diff / 3600);
                 const m = Math.floor((diff % 3600) / 60);
                 const s = diff % 60;
                 timeStatus.innerText = `Start za: ${h > 0 ? h+'h ' : ''}${m}m ${s}s`;
                 timeStatus.style.color = 'yellow';
                 timeStatus.style.fontWeight = 'normal';
                 timeStatus.style.textShadow = 'none';
             } else if (msToTarget <= PRE_FIRE_MS && msToTarget > -10000) {
                 timeStatus.innerText = `🔥 REJESTRACJA W TOKU 🔥`;
                 timeStatus.style.color = '#ff3333';
                 timeStatus.style.fontWeight = 'bold';
                 timeStatus.style.textShadow = '0 0 10px red';
             } else {
                 timeStatus.innerText = `Po czasie. Czekam.`;
                 timeStatus.style.color = 'gray';
             }
        }
    }

    function log(msg) {
        const now = new Date();
        console.log(`[USOS-EXT ${now.toLocaleTimeString()}.${now.getMilliseconds()}] ${msg}`);
    }

    function highlightElement(el, color) {
        el.style.border = `4px solid ${color}`;
        el.style.boxShadow = `0 0 10px ${color}`;
        el.style.transition = "all 0.2s";
        el.dataset.botHighlight = 'true';
    }

    function executePrecisionAttack(btn) {
        if (burstActive) return;
        burstActive = true;
        
        log(`!!! PRECISE ATTACK ARMED !!!`);

        // Obliczamy dokładny czas "Godziny 0"
        const now = new Date();
        const targetTime = new Date();
        targetTime.setHours(TARGET_HOUR, TARGET_MINUTE, TARGET_SECOND, 0);
        if (now - targetTime > 3600000) targetTime.setDate(targetTime.getDate() + 1);

        // Kolejkujemy strzały (Tylko jeden strzał po 0.5s)
        // +500ms
        const ATTACK_OFFSETS = [500]; 

        ATTACK_OFFSETS.forEach((offset, updateIndex) => {
            const fireTime = new Date(targetTime.getTime() + offset);
            const delay = fireTime - now;

            if (delay > 0) {
                setTimeout(() => {
                    log(`⚡ CLICK #${updateIndex + 1} (Offset: ${offset}ms)`);
                    
                    // Wizualizacja "Strzału"
                    if (btn) {
                        btn.style.border = "15px solid #9400D3"; 
                        btn.style.backgroundColor = "#9400D3";
                        btn.style.color = "white";
                        btn.click();
                        
                        // Reset wizualizacji po chwili
                        setTimeout(() => {
                            if(btn) {
                                btn.style.border = "4px solid #9400D3"; 
                                btn.style.backgroundColor = ""; 
                                btn.style.color = "";
                            }
                        }, 100);
                    }

                }, delay);
            } else {
                log(`Skipped missed shot at offset ${offset}ms`);
            }
        });
    }

    // --- Wyszukiwanie Elementów ---

    function findAndSelectGroup() {
        detectCourseContext(); 
        
        if (!targetGroupNumber) return; 

        // 1. Checkbox LUB Radio button
        if (!groupCheckbox || !document.body.contains(groupCheckbox)) {
             const inputs = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
             for (let input of inputs) {
                if (input.value === targetGroupNumber) {
                    groupCheckbox = input;
                    const typeName = input.type === 'radio' ? 'Radio' : 'Checkbox';
                    log(`Found ${typeName} for Group ${targetGroupNumber}`);
                    highlightElement(input, "lime");
                    break;
                }
            }
        }

        if (groupCheckbox) {
            if (!groupCheckbox.checked) {
                log(`Checking Group ${targetGroupNumber}...`);
                groupCheckbox.click();
                if(!groupCheckbox.checked) groupCheckbox.checked = true;
            }
        }

        // 2. Row (Wiersz)
        if (!groupRow || !document.body.contains(groupRow)) {
            const cells = document.querySelectorAll('td');
            for (let cell of cells) {
                if (cell.innerText.trim() === targetGroupNumber) {
                    const row = cell.closest('tr');
                    if (row && row.querySelectorAll('td').length > 2) {
                         groupRow = row;
                         log(`Found Row for Group ${targetGroupNumber}`);
                         break;
                    }
                }
            }
        }

        if (groupRow) {
            const color = groupCheckbox ? "rgba(50, 205, 50, 0.2)" : "rgba(255, 165, 0, 0.2)";
            if (groupRow.dataset.botStyled !== "true" || groupRow.style.backgroundColor !== color) {
                groupRow.style.backgroundColor = color;
                groupRow.style.outline = groupCheckbox ? "2px solid lime" : "2px dashed orange";
                groupRow.dataset.botStyled = "true";
            }
        }
    }

    function findRegistrationButton() {
        const candidates = [
            ...document.querySelectorAll('button'),
            ...document.querySelectorAll('input[type="submit"]'),
            ...document.querySelectorAll('input[type="button"]'),
            ...document.querySelectorAll('.button'), 
            ...document.querySelectorAll('a.submit'),
            ...document.querySelectorAll('input[value*="Rejestruj"]'), 
            ...document.querySelectorAll('input[value*="Zapisz"]')
        ];

        let foundButtons = [];

        for (let el of candidates) {
            if (el.offsetParent === null) continue;

            const text = (el.innerText || el.value || "").trim();
            if (BUTTON_TEXT_TRIGGERS.some(trigger => text.includes(trigger))) {
                foundButtons.push(el);
            }
        }

        if (foundButtons.length > 0) {
            const bestButton = foundButtons[foundButtons.length - 1]; 
            
            if (targetButton !== bestButton) {
                targetButton = bestButton; 
                log(`Selected Target Button (Last of ${foundButtons.length}): "${targetButton.innerText || targetButton.value}"`);
                
                foundButtons.forEach(btn => {
                    if(btn !== bestButton) {
                        btn.style.border = "2px dashed yellow";
                        btn.title = "Bot: Ignoruję ten przycisk (jest wyżej)";
                    }
                });
                
                // --- POKAZUJEMY "WIDZĘ CIĘ" (FIOLET 4px DLA REJESTRACJI) ---
                targetButton.style.border = "4px solid #9400D3"; 
                targetButton.style.boxShadow = "0 0 10px #9400D3";
                targetButton.style.transition = "all 0.1s"; 
                targetButton.dataset.botHighlight = 'true';
            }
        }
    }

    function findRefreshButton() {
        // Independent of targetGroupNumber (works without config)
        
        let btn = document.querySelector('button[onclick*="location.reload"]');

        if (!btn) {
            // Check for USOS icon (user provided HTML structure)
            const icon = document.querySelector('usos-icon[icon-name="refresh"]');
            if (icon) {
                btn = icon.closest('button');
            }
        }

        if (!btn) {
             const buttons = document.querySelectorAll('button');
             for (let b of buttons) {
                if ((b.innerText || "").toLowerCase().includes("odśwież")) {
                    btn = b;
                    break;
                }
            }
        }

        if (btn !== detectedRefreshButton) {
            detectedRefreshButton = btn;
            if (detectedRefreshButton) {
                // Persistent Visual Feedback (I SEE YOU)
                detectedRefreshButton.style.border = "4px solid #9400D3"; // DarkViolet
                detectedRefreshButton.style.boxShadow = "0 0 10px #9400D3";
                detectedRefreshButton.style.transition = "all 0.1s"; 
                log("Found potential Refresh Button");
            }
        }
        return detectedRefreshButton;
    }

    function tryRefreshAndRetry() {
        if (refreshClicked) return; 

        // Zabezpieczenie przed pętlą odświeżania (SessionStorage)
        // Klucz unikalny dla danej minuty (np. "usos_refreshed_5_59")
        // Dzięki temu resetuje się automatycznie jak zmienisz czas w configu
        const storageKey = `usos_refreshed_${TARGET_HOUR}_${TARGET_MINUTE}`;
        if (sessionStorage.getItem(storageKey) === 'true') {
            log("Refresh skipped (Already refreshed in this session/minute).");
            refreshClicked = true; // Zablokuj lokalnie też
            return;
        }

        // Ensure we have the button
        let btnToClick = detectedRefreshButton || findRefreshButton();

        if (btnToClick) {
            log("!!! EMERGENCY REFRESH TRIGGERED (25s mark) !!!");
            refreshClicked = true;
            sessionStorage.setItem(storageKey, 'true'); // Znacznik że już odświeżyliśmy
            
            // Visual Feedback on Click (ACTION!)
            btnToClick.style.border = "15px solid #9400D3"; // EXPLOSION
            btnToClick.style.backgroundColor = "#9400D3";
            btnToClick.style.color = "white";
            btnToClick.innerText = "KLIKAM... 🔄";
            
            if(statusPanel) {
                const btnStatus = statusPanel.querySelector('#bot-status-btn');
                if(btnStatus) {
                    btnStatus.innerHTML = "ODŚWIEŻAM... 🔄";
                    btnStatus.style.color = "#9400D3";
                    btnStatus.style.fontWeight = "bold";
                }
            }

            btnToClick.click();
        } else {
            log("Test Refresh: Button not found (yet).");
        }
    }

    function checkTimeAndAct() {
        // Refresh logic is independent of group config (mostly)
        const now = new Date();
        const targetTime = new Date();
        targetTime.setHours(TARGET_HOUR, TARGET_MINUTE, TARGET_SECOND, 0);

        if (now - targetTime > 3600000) {
             targetTime.setDate(targetTime.getDate() + 1);
        }

        const effectiveStartTime = new Date(targetTime.getTime() - PRE_FIRE_MS);
        const refreshTime = new Date(targetTime.getTime() + REFRESH_DELAY_MS); // +25s

        // Jeśli minęły 25 sekundy po idealnym czasie (i nie kliknęliśmy jeszcze odśwież)
        if (now >= refreshTime && !refreshClicked) {
            tryRefreshAndRetry();
        }

        // Registration logic requires group config
        if (!targetGroupNumber) return;
        
        if (now >= effectiveStartTime) {
            const diff = now - targetTime;
            // Okno aktywne (trwa krótko po czasie zero, -3s do +10s)
            if (diff < 10000) {
                if (targetButton && !burstActive) {
                     executePrecisionAttack(targetButton);
                }
            }
        }
    }

    // --- INIT ---
    loadConfig(); 
    log("Status: Loaded Advanced Staggering Logic");
    
    setInterval(() => {
        detectCourseContext(); 
        findAndSelectGroup();
        findRegistrationButton();
        findRefreshButton(); 
        checkTimeAndAct();
        updateStatusPanel();
    }, 50);

})();
