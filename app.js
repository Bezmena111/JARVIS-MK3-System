const logEl = document.getElementById('log');
const inputEl = document.getElementById('holo-input');
const statusEl = document.getElementById('status');
const blockedEl = document.getElementById('blocked');
const clockEl = document.getElementById('clock');
const lockTimeEl = document.getElementById('lockTime');
const networkStateEl = document.getElementById('networkState');
const threatLevelEl = document.getElementById('threatLevel');
const powerLevelEl = document.getElementById('powerLevel');
const moodValueEl = document.getElementById('moodValue');
const moodFillEl = document.getElementById('moodFill');
const weatherValueEl = document.getElementById('weatherValue');
const weatherCodeEl = document.getElementById('weatherCode');
const feedListEl = document.getElementById('feedList');
const lockscreenEl = document.getElementById('lockscreen');
const lockInputEl = document.getElementById('lockPassword');
const lockErrorEl = document.getElementById('lockError');
const hudEl = document.getElementById('hud');
const masterCode = '77346244';

const state = {
  bioRegistered: !!localStorage.getItem('jarvis_bio'),
  voiceEnabled: false,
  audioEnabled: true,
  mood: 'CALM',
  weather: 'CLEAR SKY',
  threats: ['SYSTEM CHECK: OK', 'SIGNAL: STABLE', 'BIO: ONLINE'],
  unlocked: false
};

function updateLockClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('sk-SK');
  if (clockEl) clockEl.textContent = time;
  if (lockTimeEl) lockTimeEl.textContent = time;
}

function unlockSystem() {
  state.unlocked = true;
  if (lockscreenEl) {
    lockscreenEl.classList.add('hidden');
  }
  if (hudEl) {
    hudEl.style.display = 'grid';
  }
  statusEl.textContent = 'Čakám na príkaz, kapitán';
  setMood('CALM');
  setNetworkState('ONLINE');
  setThreatLevel('LOW');
  log('JARVIS', 'Systém odomknutý. Full potential access granted.');
}

function handleLockInput(value) {
  const entered = String(value || '').trim();
  if (!entered) {
    lockErrorEl.textContent = 'Zadajte master kód.';
    return;
  }

  if (entered === masterCode) {
    lockErrorEl.textContent = 'Access granted. Welcome, Captain.';
    lockErrorEl.style.color = '#ffd98c';
    setTimeout(unlockSystem, 500);
  } else {
    lockErrorEl.textContent = 'Neplatný kód. Prístup zamietnutý.';
    lockErrorEl.style.color = '#ff8c76';
    lockInputEl.value = '';
    lockInputEl.focus();
  }
}

function setMood(level) {
  state.mood = level;
  const moodMap = {
    CALM: { text: 'CALM', className: 'calm' },
    ALERT: { text: 'ALERT', className: 'alert' },
    FOCUSED: { text: 'FOCUSED', className: 'focused' },
    DEFENSIVE: { text: 'DEFENSIVE', className: 'defensive' },
    CRITICAL: { text: 'CRITICAL', className: 'critical' }
  };

  const mood = moodMap[level] || moodMap.CALM;
  if (moodValueEl) moodValueEl.textContent = mood.text;
  if (moodFillEl) moodFillEl.className = `mood-fill ${mood.className}`;
}

function updateWeather() {
  const weatherModes = [
    ['CLEAR SKY', '17°C / STABLE'],
    ['LOW CLOUD', '14°C / CALM'],
    ['RED STORM', '12°C / ALERT'],
    ['THERMAL SHIFT', '21°C / HIGH'],
    ['DEFCON NIGHT', '9°C / DEFENSIVE']
  ];
  const pick = weatherModes[Math.floor(Math.random() * weatherModes.length)];
  state.weather = pick[0];
  if (weatherValueEl) weatherValueEl.textContent = pick[0];
  if (weatherCodeEl) weatherCodeEl.textContent = pick[1];
}

function updateThreatFeed() {
  const items = [
    '• SYSTEM CHECK: OK',
    '• SIGNAL: STABLE',
    '• BIO: ONLINE',
    '• THREAT INDEX: LOW',
    '• TRACKER: ACTIVE',
    '• SECURITY CHANNEL: LOCKED'
  ];

  if (feedListEl) {
    feedListEl.innerHTML = items
      .slice(0, 6)
      .map((item) => `<div>${item}</div>`)
      .join('');
  }
}

function log(who, text) {
  const row = document.createElement('div');
  row.innerHTML = `<b>${who}:</b> ${text}`;
  logEl.appendChild(row);
  logEl.scrollTop = logEl.scrollHeight;
}

function setThreatLevel(level) {
  if (!threatLevelEl) return;
  threatLevelEl.textContent = level;
  threatLevelEl.className = level === 'HIGH' ? 'warn' : level === 'MEDIUM' ? 'sec' : 'ok';
}

function setNetworkState(stateText) {
  if (networkStateEl) networkStateEl.textContent = stateText;
}

function openPage(url, label) {
  window.open(url, '_blank');
  return `${label} bol spustený.`;
}

function speak(text) {
  if (!state.audioEnabled) return;
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = 'sk-SK';
  speech.rate = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}

function parseDomain(raw) {
  const cleaned = String(raw || '').trim();
  return cleaned.replace(/^https?:\/\//i, '').replace(/\/$/, '').replace(/[^a-zA-Z0-9.-]/g, '');
}

function checkLink(url) {
  const value = String(url || '');
  const isHttps = value.startsWith('https://');
  const includesAt = value.includes('@');

  if (!isHttps) return `⚠️ VAROVANIE: ${value} nemá HTTPS!`;
  if (includesAt) return `⚠️ VAROVANIE: ${value} obsahuje @ - možný phishing`;
  return `✅ Link OK: ${value}`;
}

function checkPassword(value) {
  const pwd = String(value || '');
  let score = 0;

  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const levels = ['ULTRA SLABÉ - zmeň hneď!', 'Slabé', 'Priemerné', 'Silné', 'ULTRA SILNÉ 💎'];
  return `Heslo: ${pwd} // ${levels[Math.min(score, levels.length - 1)]}`;
}

async function hashText(algo, value) {
  if (!value) return 'Nezadali ste žiadnu hodnotu na hashovanie.';
  const text = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest(algo, text);
  const bytes = Array.from(new Uint8Array(digest));
  const hex = bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${algo.toUpperCase()}: ${hex}`;
}

function simulateDns(domain) {
  const name = parseDomain(domain || 'example.com');
  const records = {
    A: '93.184.216.34',
    AAAA: '2606:2800:220:1:248:1893:25c8:1946',
    MX: 'mail.example.com',
    TXT: 'spf=redirect=_spf.example.com'
  };

  return `DNS REPORT pre ${name}: A=${records.A}; AAAA=${records.AAAA}; MX=${records.MX}; TXT=${records.TXT};`;
}

function simulateLocalScan() {
  const ports = [
    { port: 21, status: 'CLOSED' },
    { port: 22, status: 'OPEN' },
    { port: 80, status: 'OPEN' },
    { port: 443, status: 'OPEN' },
    { port: 3306, status: 'CLOSED' },
    { port: 8080, status: 'FILTERED' }
  ];

  return 'LOCAL SERVICE STATUS: ' + ports.map((p) => `p${p.port}=${p.status}`).join(' | ');
}

function runSecurityAudit(domain) {
  const safeDomain = parseDomain(domain || 'example.com');
  setThreatLevel('MEDIUM');
  setNetworkState('ANALYZING');
  setMood('DEFENSIVE');
  return [
    `Audit spustený pre ${safeDomain}`,
    `HTTPS: ${safeDomain.startsWith('http') ? safeDomain : 'https://' + safeDomain}`,
    'Kontrola hlavičiek: securityheaders.com',
    'DNS overenie: SPF / DKIM / DMARC',
    'Kontrola únikov: haveibeenpwned.com',
    'Odporúčanie: zablokovať podozrivé subdomény a overiť certifikát.'
  ].join(' | ');
}

async function registerBiometric() {
  log('JARVIS', 'Registrujem biometriu... prilož prst / FaceID');
  try {
    if (!window.PublicKeyCredential) {
      return 'WebAuthn nie je podporovaný v tomto prehliadači.';
    }

    await navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array([1, 2, 3, 4, 5, 6]),
        rp: { name: 'JARVIS MK3' },
        user: { id: new Uint8Array([1]), name: 'kapitan', displayName: 'Kapitan' },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' }
      }
    });

    localStorage.setItem('jarvis_bio', 'registered');
    state.bioRegistered = true;
    return 'Biometria zaregistrovaná, kapitán.';
  } catch (e) {
    return `Biometria zlyhala: ${e.message || 'Neznáma chyba'}`;
  }
}

async function biometricLogin() {
  if (!localStorage.getItem('jarvis_bio')) {
    return 'Najprv zaregistruj biometriu príkazom “zaregistruj biometriu”.';
  }

  try {
    if (!window.PublicKeyCredential) {
      return 'WebAuthn nepodporovaný.';
    }

    await navigator.credentials.get({
      publicKey: {
        challenge: new Uint8Array([1, 2, 3, 4, 5, 6]),
        userVerification: 'required'
      }
    });

    statusEl.textContent = 'ACCESS GRANTED';
    setNetworkState('ONLINE');
    setMood('FOCUSED');
    return 'Identita potvrdená. Vitaj späť, kapitán.';
  } catch (e) {
    statusEl.textContent = 'LOCKED';
    setNetworkState('LOCKED');
    setMood('CRITICAL');
    return 'Biometria zlyhala. Prístup zamietnutý.';
  }
}

function parseCommand(raw) {
  const text = String(raw || '').trim();
  if (!text) return null;

  const lower = text.toLowerCase();

  if (lower.includes('status') || lower.includes('stav')) {
    setMood('CALM');
    return 'Systém online. Firewall aktívny. Bio-lock zapnutý. Dôsledná ochrana v režime REDLINE.';
  }

  if (lower.includes('hodín') || lower.includes('time') || lower.includes('čas')) {
    setMood('CALM');
    return `Je ${new Date().toLocaleTimeString('sk-SK')}`;
  }

  if (lower.includes('dátum') || lower.includes('date') || lower.includes('deň')) {
    setMood('CALM');
    return `Dnes je ${new Date().toLocaleDateString('sk-SK')}`;
  }

  if (lower.includes('weather') || lower.includes('počasie')) {
    updateWeather();
    return `Počasie: ${state.weather}`;
  }

  if (lower.includes('mood') || lower.includes('stav systému')) {
    return `SYSTEM STATE: ${state.mood}`;
  }

  if (lower.includes('youtube')) return openPage('https://youtube.com', 'YouTube');
  if (lower.includes('google')) return openPage('https://google.com', 'Google');
  if (lower.includes('plane crazy') || lower.includes('plane-crazy')) return openPage('https://www.roblox.com/games/12742348/Plane-Crazy', 'Plane Crazy');

  if (lower.includes('scan') || lower.includes('oskenuj') || lower.includes('skenuj')) {
    setMood('ALERT');
    setNetworkState('SCANNING');
    setThreatLevel('MEDIUM');
    return 'Skenujem sieť. Hľadám zraniteľnosti a anomálie v okolí.';
  }

  if (lower.includes('scanlocal') || lower.includes('lokálny scan') || lower.includes('local scan')) {
    setMood('FOCUSED');
    return simulateLocalScan();
  }

  if (lower.includes('vyhľadaj') || lower.includes('search') || lower.includes('hľadaj')) {
    const q = text.replace(/^(vyhľadaj|search|hľadaj)\s+/i, '').trim();
    if (!q) return 'Na čo mám vyhľadať?';
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
    setMood('ALERT');
    return `Vyhľadávam: ${q}`;
  }

  if (lower.includes('password') || lower.includes('heslo')) {
    setMood('FOCUSED');
    const match = text.match(/(?:heslo|password)\s+(.+)/i);
    const value = match ? match[1] : 'MojeHeslo123';
    return checkPassword(value);
  }

  if (lower.includes('link') || lower.includes('odkaz')) {
    setMood('FOCUSED');
    const match = text.match(/https?:\/\/[^\s]+/i);
    const url = match ? match[0] : 'https://example.com';
    return checkLink(url);
  }

  if (lower.includes('hash')) {
    setMood('FOCUSED');
    const match = text.match(/hash\s+(sha-256|sha256|md5)\s+(.+)/i) || text.match(/hash\s+(.+)/i);
    if (match) {
      const algo = (match[1] || 'sha-256').toLowerCase().replace('sha256', 'sha-256');
      const value = match[2] || match[1];
      return hashText(algo, value);
    }
    return 'Použitie: hash sha-256 text alebo hash md5 text';
  }

  if (lower.includes('dns')) {
    setMood('ALERT');
    const match = text.match(/dns\s+([^\s]+)/i);
    const domain = match ? match[1] : 'example.com';
    return simulateDns(domain);
  }

  if (lower.includes('audit') || lower.includes('security') || lower.includes('oscanuj')) {
    setMood('DEFENSIVE');
    const domain = text.replace(/^(.*?)(security|audit|oscanuj|audituj)\s+/i, '').trim() || 'example.com';
    return runSecurityAudit(domain);
  }

  if (lower.includes('help') || lower.includes('pomoc')) {
    setMood('CALM');
    return 'Dostupné príkazy: status, weather, time, password, link, hash, dns, audit, local scan, panic, biometria, help.';
  }

  if (lower.includes('panic') || lower.includes('panika')) {
    setMood('CRITICAL');
    window.open('about:blank', '_self');
    return '🚨 PANIC MODE aktivovaný. Všetko sa uzatvára.';
  }

  if (lower.includes('biometric') || lower.includes('biometria') || lower.includes('unlock')) {
    setMood('FOCUSED');
    return biometricLogin();
  }

  if (lower.includes('register biometric') || lower.includes('zaregistruj biometriu')) {
    setMood('FOCUSED');
    return registerBiometric();
  }

  if (lower.includes('joke') || lower.includes('vtip')) {
    setMood('ALERT');
    return 'Kapitán, keď previerka zistí phishingový link: “To bolo skvelé, ale už to je v logu.”';
  }

  if (lower.includes('toolkit') || lower.includes('security toolkit')) {
    setMood('FOCUSED');
    return 'SECURITY TOOLKIT ONLINE: password checker, hash generator, link validator, DNS report, local scan, audit report.';
  }

  return `Rozumiem: "${text}". Bez API kľúča pracujem v offline režime. Pre pomoc napíš: pomoc.`;
}

async function executeCommand(inputValue) {
  const value = String(inputValue || '').trim();
  if (!value || !state.unlocked) return;

  log('TY', value);
  const result = parseCommand(value);

  if (typeof result === 'string') {
    log('JARVIS', result);
    speak(result);
  } else if (result && typeof result.then === 'function') {
    const resolved = await result;
    log('JARVIS', resolved);
    speak(resolved);
  }
}

function enableVoiceCommands() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    log('JARVIS', 'Webové rozpoznávanie reči nie je v tomto prehliadači podporované.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'sk-SK';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    state.voiceEnabled = true;
    statusEl.textContent = 'POČÚVAM';
    setMood('ALERT');
    log('JARVIS', 'Počúvam príkaz...');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    log('VOICE', transcript);
    executeCommand(transcript);
  };

  recognition.onerror = (event) => {
    log('ERROR', `Rozpoznanie reči zlyhalo: ${event.error}`);
  };

  recognition.onend = () => {
    state.voiceEnabled = false;
    statusEl.textContent = 'Čakám na príkaz, kapitán';
    setMood('CALM');
  };

  recognition.start();
}

inputEl.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    executeCommand(inputEl.value);
    inputEl.value = '';
  }
});

document.querySelectorAll('[data-command]').forEach((button) => {
  button.addEventListener('click', () => {
    const command = button.dataset.command;
    const commandMap = {
      status: 'status',
      time: 'time',
      scan: 'scan',
      panic: 'panic',
      password: 'password test123',
      audit: 'security audit example.com',
      hash: 'hash sha-256 jarvis',
      link: 'link https://example.com',
      dns: 'dns example.com',
      scanlocal: 'local scan'
    };
    executeCommand(commandMap[command] || command);
  });
});

document.querySelectorAll('.key').forEach((key) => {
  key.addEventListener('click', () => {
    key.classList.add('pressed');
    setTimeout(() => key.classList.remove('pressed'), 100);

    const action = key.dataset.action;
    const value = key.dataset.value;

    if (action === 'backspace') {
      inputEl.value = inputEl.value.slice(0, -1);
      return;
    }

    if (action === 'space') {
      inputEl.value += ' ';
      return;
    }

    if (action === 'enter') {
      executeCommand(inputEl.value);
      inputEl.value = '';
      return;
    }

    if (action === 'bio') {
      executeCommand('biometric');
      return;
    }

    if (action === 'defence') {
      executeCommand('security audit example.com');
      return;
    }

    if (action === 'panic') {
      executeCommand('panic');
      return;
    }

    if (value) {
      inputEl.value += value;
    }
  });
});

function createBootSequence() {
  const boot = document.createElement('div');
  boot.className = 'boot-overlay';
  boot.innerHTML = `
    <div class="boot-screen">
      <div class="boot-header">JARVIS MK3 // SYSTEM BOOT SEQUENCE</div>
      <div class="boot-lines">
        <div class="active">> INITIALIZING CORE SYSTEMS...</div>
        <div>> LINKING DEFENCE MATRIX...</div>
        <div>> CALIBRATING AI COGNITION...</div>
        <div>> SYNCING HYPER-DRIVE CHANNELS...</div>
        <div>> READY FOR COMMAND</div>
      </div>
      <div class="boot-progress">
        <div class="boot-progress-bar" id="bootProgressBar"></div>
      </div>
    </div>
  `;
  document.body.prepend(boot);

  const lines = [...boot.querySelectorAll('.boot-lines div')];
  const progress = boot.querySelector('#bootProgressBar');

  let currentIndex = 0;
  const bootInterval = setInterval(() => {
    lines.forEach((line, index) => line.classList.toggle('active', index === currentIndex));
    progress.style.width = `${((currentIndex + 1) / lines.length) * 100}%`;
    currentIndex += 1;
    if (currentIndex >= lines.length) {
      clearInterval(bootInterval);
    }
  }, 420);

  return boot;
}

function finishBootSequence() {
  const boot = document.querySelector('.boot-overlay');
  const hud = document.getElementById('hud');
  if (!boot || !hud) return;

  setTimeout(() => {
    boot.classList.add('hidden');
    hud.classList.remove('booting');
    setTimeout(() => boot.remove(), 900);
  }, 2200);
}

window.addEventListener('load', () => {
  const hud = document.getElementById('hud');
  if (hud) hud.classList.add('booting');

  const boot = createBootSequence();
  setMood('CALM');
  updateWeather();
  updateThreatFeed();
  log('JARVIS', 'JARVIS REDLINE online. Typ alebo klikni do klávesnice.');
  setNetworkState('ONLINE');
  setThreatLevel('LOW');
  powerLevelEl.textContent = '98%';
  blockedEl.textContent = '0';

  if ('speechSynthesis' in window) {
    log('JARVIS', 'Hlasový výstup je pripravený.');
  }

  if (localStorage.getItem('jarvis_bio')) {
    log('JARVIS', 'Biometrický lock je aktivovaný.');
  }

  statusEl.textContent = 'SYSTEM INITIALIZING';
  setTimeout(() => {
    statusEl.textContent = 'Čakám na príkaz, kapitán';
  }, 2200);

  finishBootSequence();
  if (boot) {
    setTimeout(() => {
      boot.querySelector('#bootProgressBar').style.width = '100%';
    }, 1700);
  }
});

const voiceBtn = document.createElement('button');
voiceBtn.textContent = '🎙️ VOICE';
voiceBtn.className = 'voice-toggle';
voiceBtn.addEventListener('click', enableVoiceCommands);
const panel = document.querySelector('.right-panel');
if (panel) {
  panel.appendChild(voiceBtn);
}

// Lock screen handler
const lockSubmitBtn = document.getElementById('lockSubmit');
const lockClearBtn = document.getElementById('lockClear');

lockInputEl.addEventListener('input', (event) => {
  event.target.value = event.target.value.replace(/\D/g, '').slice(0, 8);
  if (lockErrorEl) lockErrorEl.textContent = '';
});

lockInputEl.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleLockInput(lockInputEl.value);
  }
});

document.querySelectorAll('.keypad-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const value = button.dataset.num;
    if (lockInputEl.value.length < 8) {
      lockInputEl.value += value;
    }
  });
});

if (lockSubmitBtn) {
  lockSubmitBtn.addEventListener('click', () => {
    handleLockInput(lockInputEl.value);
  });
}

if (lockClearBtn) {
  lockClearBtn.addEventListener('click', () => {
    lockInputEl.value = '';
    lockErrorEl.textContent = '';
    lockInputEl.focus();
  });
}

// Start hiding HUD until unlocked
if (hudEl) {
  hudEl.style.display = 'none';
}

setInterval(updateLockClock, 1000);
updateLockClock();
