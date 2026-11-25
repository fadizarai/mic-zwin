/**
 * MIC Zwin lel Tech - registration backend.
 * 1) Create a Google Sheet.  2) Extensions > Apps Script, paste this file.
 * 3) Deploy > New deployment > Web app: Execute as "Me", access "Anyone".
 * 4) Copy the Web app URL into CONFIG.sheetUrl in js/script.js.
 * Each team gets 4 rows (leader first) and ONE color, different from every other team.
 */
const SHEET = 'Registrations';
const MAX_TEAMS = 15;

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET);
    const rows = (sh && sh.getLastRow() > 1) ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues() : [];
    const count = rows.reduce((a, r) => Math.max(a, Number(r[0]) || 0), 0);
    return out({ ok: true, count: count, full: count >= MAX_TEAMS });
  } catch (err) {
    return out({ ok: true, message: 'MIC Zwin lel Tech registration backend is active.' });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.website) return out({ ok: true });            // honeypot: bots only
    const bad = check(d);
    if (bad) return out({ ok: false, error: bad });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
    if (sh.getLastRow() === 0) {
      sh.appendRow(['Team #', 'Team name', 'Role', 'Full name', 'Email', 'Phone', 'Submitted at']);
      sh.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#0a1a4d').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
    const rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 7).getValues() : [];
    
    // Check if 15 teams limit has already been reached
    const currentTeams = rows.reduce((a, r) => Math.max(a, Number(r[0]) || 0), 0);
    if (currentTeams >= MAX_TEAMS) {
      return out({ ok: true, full: true, team: currentTeams + 1 });
    }

    if (rows.some(r => String(r[1]).toLowerCase() === d.teamName.toLowerCase()))
      return out({ ok: false, error: 'This team name is already taken. Choose another one.' });
    const used = rows.map(r => String(r[4]).toLowerCase());
    const dup = d.members.find(m => used.indexOf(m.email.toLowerCase()) > -1);
    if (dup) return out({ ok: false, error: dup.email + ' is already registered in another team.' });

    const num = currentTeams + 1;
    const start = sh.getLastRow() + 1, now = new Date();
    const count = d.members.length;
    sh.getRange(start, 6, count, 1).setNumberFormat('@');   // keep +216 as text
    sh.getRange(start, 1, count, 7).setValues(d.members.map((m, i) =>
      [num, d.teamName, i ? 'Member' : 'Leader', m.name, m.email.toLowerCase(), m.phone, now]));
    sh.getRange(start, 1, count, 7).setBackground(teamColor(num))
      .setBorder(null, null, true, null, null, null, '#ffffff', SpreadsheetApp.BorderStyle.SOLID_THICK);
    sh.getRange(start, 1, 1, 7).setFontWeight('bold');   // leader row in bold
    return out({ ok: true, team: num, full: false });
  } catch (err) {
    return out({ ok: false, error: 'Server error. Please try again.' });
  } finally {
    lock.releaseLock();
  }
}

function check(d) {
  if (!d || !d.teamName || !d.members || (d.members.length !== 3 && d.members.length !== 4))
    return 'A team needs 3 or 4 members.';
  for (const m of d.members)
    if (!m.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email || '') || !m.phone) return 'Some member details are missing.';
  return '';
}

// Golden-angle hue: every new team gets a clearly different pastel, even after 100 teams.
function teamColor(n) {
  const h = (n * 137.508) % 360, s = 0.65, l = 0.82;
  const a = s * Math.min(l, 1 - l);
  const f = k => {
    const t = (k + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(t - 3, 9 - t, 1));
    return ('0' + Math.round(255 * c).toString(16)).slice(-2);
  };
  return '#' + f(0) + f(8) + f(4);
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
