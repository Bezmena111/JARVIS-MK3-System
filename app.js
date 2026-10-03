const logEl = document.getElementById('log');
const inputEl = document.getElementById('holo-input');
const statusEl = document.getElementById('status');
const blockedEl = document.getElementById('blocked');
const clockEl = document.getElementById('clock');
const networkStateEl = document.getElementById('networkState');
const threatLevelEl = document.getElementById('threatLevel');
const powerLevelEl = document.getElementById('powerLevel');

const memory = [];
const commandHistory = [];

function log(who, text) {
  const row = document.createElement('div');
  row.innerHTML = `<b>${who}:</b> ${text}`;
  logEl.appendChild(row);
  logEl.scrollTop = logEl.scrollHeight;
  memory.push(`${who}: ${text}`);
}

function updateClock() {
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString('sk-SK');
}
setInterval(updateClock, 1000);
updateClock();

function setThreatLevel(level) {
  threatLevelEl.textContent = level;
  threatLevelEl.className = level === 'HIGH' ? 'warn' : level === 'MEDIUM' ? 'sec' : 'ok';
}

function setNetworkState(state) {
  networkStateEl.textContent = state;
}

function openPage(url, label) {
  window.open(url, '_blank');
  return `${label} bol spustený.`;
}

function parseCommand(raw) {
  const text = String(raw || '').trim();
  if (!text) return null;

  commandHistory.push(text);
  const lower = text.toLowerCase();

  if (lower.includes('status') || lower.includes('stav')) {
    return 'Systém online. Firewall aktívny. Bio-lock zapnutý. Dôsledná ochrana v režime DEFENCE.';
  }

  if (lower.includes('hodín') || lower.includes('time')) {
    return `Je ${new Date().toLocaleTimeString('sk-SK')}`;
  }

  if (lower.includes('dátum') || lower.includes('date')) {
    return `Dnes je ${new Date().toLocaleDateString('sk-SK')}`;
  }

  if (lower.includes('youtube')) {
    return openPage('https://youtube.com', 'YouTube');
  }

  if (lower.includes('google')) {
    return openPage('https://google.com', 'Google');
  }

  if (lower.includes('plane crazy') || lower.includes('plane-crazy')) {
    return openPage('https://www.roblox.com/games/12742348/Plane-Crazy', 'Plane Crazy');
  }

  if (lower.includes('scan') || lower.includes('oskenuj')) {
    setNetworkState('SCANNING');
    setThreatLevel('MEDIUM');
    return 'Skenujem sieť. Hľadám zraniteľnosti a anomálie v okolí.';
  }

  if (lower.includes('vyhľadaj') || lower.includes('search')) {
    const q = text.replace(/^(vyhľadaj|search)\s+/i, '').trim();
    if (!q) return 'Na čo mám vyhľadať?';
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
    return `Vyhľadávam: ${q}`;
  }

  if (lower.includes('help') || lower.includes('pomoc')) {
    return 'Dostupné príkazy: status, time, date, youtube, google, scan, search, password, link, panic, unlock, biometric, joke, fact, shutdown, reboot, mute, help.';
  }

  if (lower.includes('joke') || lower.includes('vtip')) {
    return 'Kapitán, keď AI vylezie z testu: “Aha, to bol iba feature, nie bug.”';
  }

  if (lower.includes('fact') || lower.includes('zaujímavost')) {
    return 'Fakt: 80% bezpečnostných incidentov začína ľudskou zvedavosťou a slabým heslom.';
  }

  if (lower.includes('heslo') || lower.includes('password')) {
    const match = text.match(/(?:heslo|password)\s+(.+)/i);
    const value = match ? match[1] : 'MojeHeslo123';
    return checkPassword(value);
  }

  if (lower.includes('link') || lower.includes('odkaz')) {
    const match = text.match(/https?:\/\/[^\s]+/i);
    const url = match ? match[0] : 'https://example.com';
    return checkLink(url);
  }

  if (lower.includes('start') && lower.includes('listen')) {
    return 'Počúvam. Môžem reagovať na príkazy hlasom alebo z klávesnice.';
  }

  if (lower.includes('panic') || lower.includes('panika')) {
    window.open('about:blank', '_self');
    return '🚨 PANIC MODE aktivovaný. Všetko sa uzatvára.';
  }

  if (lower.includes('shutdown') || lower.includes('vypni')) {
    statusEl.textContent = 'SYSTEM OFFLINE';
    setNetworkState('OFFLINE');
    return 'Systém je deaktivovaný na bezpečnostnom režime.';
  }

  if (lower.includes('reboot') || lower.includes('reštart')) {
    statusEl.textContent = 'RESTARTING';
    setNetworkState('BOOTING');
    return 'JARVIS sa reštartuje a obnovuje obranné systémy.';
  }

  if (lower.includes('mute') || lower.includes('ztlmi')) {
    return 'Zvukový výstup je stlmený. Príkazy budú pracovať bez hlasu.';
  }

  if (lower.includes('biometric') || lower.includes('biometria') || lower.includes('unlock')) {
    return biometricLogin();
  }

  if (lower.includes('register biometric') || lower.includes('zaregistruj biometriu')) {
    return registerBiometric();
  }

  if (lower.includes('security') || lower.includes('audit') || lower.includes('oscanuj')) {
    const domain = text.replace(/^(.*?)(security|audit|oscanuj)\s+/i, '').trim() || 'example.com';
    return runSecurityAudit(domain);
  }

  return `Rozumiem: "${text}". Bez API kľúča pracujem v offline režime. Pre pomoc napíš: pomoc.`;
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

function runSecurityAudit(domain) {
  const safeDomain = String(domain || 'example.com').replace(/[^a-zA-Z0-9.-]/g, '');
  setThreatLevel('MEDIUM');
  setNetworkState('ANALYZING');

  const results = [
    `Audit spustený pre ${safeDomain}`,
    `HTTPS: ${safeDomain.startsWith('http') ? safeDomain : 'https://' + safeDomain}`,
    'Kontrola hlavičiek: securityheaders.com',
    'DNS overenie: SPF / DKIM / DMARC',
    'Kontrola únikov: haveibeenpwned.com',
    'Odporúčanie: zablokovať podozrivé subdomény a overiť certifikát.'
  ];

  return results.join(' | ');
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
    return 'Identita potvrdená. Vitaj späť, kapitán.';
  } catch (e) {
    statusEl.textContent = 'LOCKED';
    setNetworkState('LOCKED');
    return 'Biometria zlyhala. Prístup zamietnutý.';
  }
}

function executeCommand(inputValue) {
  const value = String(inputValue || '').trim();
  if (!value) return;

  log('TY', value);
  const result = parseCommand(value);
  if (result) {
    log('JARVIS', result);
  }
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
      panic: 'panic'
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
      executeCommand('scan');
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

window.addEventListener('load', () => {
  log('JARVIS', 'JARVIS Mark 3 online. Typ alebo klikni do klávesnice.');
  setNetworkState('ONLINE');
  setThreatLevel('LOW');
  powerLevelEl.textContent = '97%';
});

blockedEl.textContent = '0';
