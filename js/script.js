/* ===== EDIT HERE: paste your Google Apps Script Web App URL ===== */
const CONFIG = { sheetUrl: "https://script.google.com/macros/s/AKfycby0T7RGqVgzoPkBlLJM8LMEAlxaM-8ydkJy7SKlOsYnF8zAPn-dwNioNCwWWwrocXav/exec" };
/* ================================================================ */
const $ = s => document.querySelector(s);

// Voice note
const au = $('#voice'), box = $('#vnote'), msg = $('#vmsg');
$('#play').onclick = () => au.paused ? au.play() : au.pause();
au.onplay = () => { box.classList.add('on'); msg.textContent = 'Listening…'; };
au.onpause = au.onended = () => { box.classList.remove('on'); msg.textContent = 'Press play to listen again.'; };
au.ontimeupdate = () => $('#prog').style.width = (au.currentTime / au.duration * 100 || 0) + '%';
au.onerror = () => msg.textContent = 'The voice note is coming soon.';

// Member cards
const roles = ['Team leader (you)', 'Member 2', 'Member 3', 'Member 4 (optional)'];
$('#members').innerHTML = roles.map((r, i) => `
  <fieldset class="mem${i ? '' : ' leader'}"><legend><span class="star">${i + 1}</span>${r}</legend>
    <label>Full name<input name="name${i}" ${i === 3 ? '' : 'required'} autocomplete="${i ? 'off' : 'name'}"></label>
    <label>Email<input type="email" name="email${i}" ${i === 3 ? '' : 'required'} autocomplete="${i ? 'off' : 'email'}"></label>
    <label>Phone number<input type="tel" name="phone${i}" ${i === 3 ? '' : 'required'} autocomplete="${i ? 'off' : 'tel'}" placeholder="+216 …"></label>
  </fieldset>`).join('');

const fail = (m, el) => { $('#err').textContent = m; if (el) { el.classList.add('bad'); el.focus(); } return false; };

function collect(f) {
  const v = n => f.elements[n].value.trim();
  const members = [0, 1, 2].map(i => ({
    name: v('name' + i),
    email: v('email' + i).toLowerCase(),
    phone: v('phone' + i)
  }));
  const m3Name = v('name3'), m3Email = v('email3').toLowerCase(), m3Phone = v('phone3');
  if (m3Name || m3Email || m3Phone) {
    members.push({ name: m3Name, email: m3Email, phone: m3Phone });
  }
  return { teamName: v('teamName'), website: v('website'), submittedAt: new Date().toISOString(), members };
}

function validate(f, d) {
  f.querySelectorAll('.bad').forEach(e => e.classList.remove('bad'));
  $('#err').textContent = '';
  if (d.teamName.length < 2) return fail('Enter your team name.', f.teamName);
  const seenE = new Set(), seenP = new Set();
  for (let i = 0; i < 3; i++) {
    const m = d.members[i], who = roles[i].replace(' (you)', '');
    if (m.name.length < 3) return fail(`Enter the full name of ${who}.`, f.elements['name' + i]);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email)) return fail(`The email of ${who} is not valid.`, f.elements['email' + i]);
    const p = m.phone.replace(/[\s.-]/g, '').replace(/^(\+|00)216/, '');
    if (!/^\d{8}$/.test(p)) return fail(`The phone number of ${who} must have 8 digits.`, f.elements['phone' + i]);
    if (seenE.has(m.email)) return fail('Each member needs a different email.', f.elements['email' + i]);
    if (seenP.has(p)) return fail('Each member needs a different phone number.', f.elements['phone' + i]);
    seenE.add(m.email); seenP.add(p);
  }
  if (d.members.length === 4) {
    const m = d.members[3], who = 'Member 4';
    if (m.name.length < 3) return fail(`Enter the full name of ${who}.`, f.elements['name3']);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email)) return fail(`The email of ${who} is not valid.`, f.elements['email3']);
    const p = m.phone.replace(/[\s.-]/g, '').replace(/^(\+|00)216/, '');
    if (!/^\d{8}$/.test(p)) return fail(`The phone number of ${who} must have 8 digits.`, f.elements['phone3']);
    if (seenE.has(m.email)) return fail('Each member needs a different email.', f.elements['email3']);
    if (seenP.has(p)) return fail('Each member needs a different phone number.', f.elements['phone3']);
  }
  return true;
}

$('#f').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target, d = collect(f);
  if (!validate(f, d)) return;
  if (!CONFIG.sheetUrl) return fail('Registration is not open yet. Try again soon.');
  const btn = $('#go'); btn.disabled = true; btn.textContent = 'Sending…';
  try {
    const r = await fetch(CONFIG.sheetUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(d) });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || 'Something went wrong.');
    f.hidden = true;
    const done = $('#done'); done.hidden = false;
    done.innerHTML = '<h3>Welcome to the souk of tech!</h3><p>Team <b></b> is registered. We will contact the leader by email.</p>';
    done.querySelector('b').textContent = d.teamName;
    done.focus();
  } catch (x) {
    fail(x instanceof TypeError ? 'No connection. Check your internet and register again.' : x.message);
    btn.disabled = false; btn.textContent = 'Register my team';
  }
});
