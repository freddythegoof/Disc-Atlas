(() => {
 const $ = selector => document.querySelector(selector), dialog = $('#coachDialog');
 if (!dialog) return;
 let chat = [], busy = false, remaining = null, epoch = 0, aborter = null, account = null, opener = null;
 // Hyzer the Disc, the coach's face. He is live only while the panel is open (the launcher wears a still image), acts
 // out the coach's real states and nothing else, and stays hidden once dismissed (this browser only, like Appearance).
 const HYZER_KEY = 'disc-atlas-hyzer', SLEEP_AFTER = 120000;
 let hyzer = null, loading = null, failed = false, asleep = false, speakingUntil = 0, sleepTimer = 0, speakTimer = 0;
 const hyzerHidden = () => document.documentElement.dataset.hyzer === 'hidden';
 function mood() {
  if (failed) return 'error';
  if (busy) return 'thinking';
  if (Date.now() < speakingUntil) return 'speaking';
  if (asleep) return 'sleeping';
  return document.activeElement === $('#coachInput') ? 'listening' : 'idle';
 }
 const feel = () => hyzer?.setState(mood());
 // Any activity in the panel wakes him; two quiet minutes put him to sleep instead of moving forever.
 function stir() {asleep = false; clearTimeout(sleepTimer); if (dialog.open) sleepTimer = setTimeout(() => {asleep = true; feel();}, SLEEP_AFTER); feel();}
 async function wake() {
  if (hyzer || loading || hyzerHidden() || !dialog.open) return;
  loading = Promise.all([import('/vendor/wobnimo/wobnimo-0.2.0.js'), import('/hyzer.mjs')]);
  try {
   const [{mount}, {default: spec}] = await loading;
   if (dialog.open && !hyzerHidden() && !hyzer) hyzer = mount($('#coachHyzer'), spec, {state: mood(), floor: 0.35, framing: 0.9});
  } catch { /* The coach works without its face. */ } finally {loading = null;}
 }
 function rest() {hyzer?.dispose(); hyzer = null; clearTimeout(sleepTimer); clearTimeout(speakTimer); failed = asleep = false; speakingUntil = 0;}
 function hyzerLabels() {
  const hidden = hyzerHidden();
  $('#coachHyzerToggle').textContent = hidden ? 'Show Hyzer the Disc' : 'Hide Hyzer the Disc';
  $('#coachButton').setAttribute('aria-label', hidden ? 'Atlas Coach' : 'Ask Hyzer, the Atlas Coach');
  $('#coachButton').title = hidden ? 'Atlas Coach' : 'Ask Hyzer';
 }
 function showHyzer(show) {
  try {if (show) localStorage.removeItem(HYZER_KEY); else localStorage.setItem(HYZER_KEY, 'hidden');} catch { /* Storage may be disabled. */ }
  if (show) delete document.documentElement.dataset.hyzer; else document.documentElement.dataset.hyzer = 'hidden';
  hyzerLabels();
  if (show) {stir(); void wake();} else rest();
 }
 function reset() {epoch++; aborter?.abort(); aborter = null; busy = false; chat = []; remaining = null; $('#coachMessages').replaceChildren(); $('#coachInput').value = ''; $('#coachError').textContent = ''; $('#coachNotice').textContent = ''; $('#coachProvider').textContent = ''; failed = false; speakingUntil = 0; feel();}
 function render() {
  const signedIn = !!account?.user;
  dialog.dataset.state = !account ? 'loading' : signedIn ? 'signed-in' : 'signed-out';
  dialog.dataset.capped = String(remaining === 0);
  for (const id of ['coachMessages', 'coachForm', 'coachDisclosure', 'coachProvider']) $('#' + id).hidden = !signedIn;
  $('#coachForm').hidden = !signedIn || remaining === 0;
  $('#coachSignIn').hidden = signedIn || !account;
  $('#coachSignIn').href = '/signin?return_to=' + encodeURIComponent('/?coach=1');
  $('#coachInput').disabled = !signedIn || !account.coachReady || remaining === null || remaining === 0 || busy;
  $('#coachSend').disabled = $('#coachInput').disabled;
  $('#clearChat').disabled = busy;
  $('#coachSend').textContent = busy ? 'Thinking…' : 'Send question ↗';
  $('#coachStatus').textContent = !account ? 'Checking your account…' : !signedIn ? 'Sign in to ask about discs, shots, and your next round.' : remaining === 0 ? 'You’ve used your 20 messages today. Come back tomorrow for more advice.' : !account.coachReady ? 'Atlas Coach is being connected. Please try again soon.' : remaining === null ? 'Checking your daily allowance…' : `${remaining} of 20 messages left today`;
 }
 async function api(method, data, signal) {
  const generation = epoch;
  const response = await fetch('/api/coach', {method, credentials: 'same-origin', cache: 'no-store', signal,
   headers: method === 'GET' ? {} : {'Content-Type': 'application/json', 'X-Atlas-CSRF': account?.csrfToken || ''}, ...(data ? {body: JSON.stringify(data)} : {})});
  const result = await response.json();
  if (generation !== epoch) throw new DOMException('Account changed', 'AbortError');
  if (Number.isInteger(result.remaining)) remaining = result.remaining;
  if (response.status === 401) {reset(); account = {...account, user: null}; render(); void window.AtlasAccount.refresh().catch(() => {});}
  if (!response.ok) throw new Error(result.error || 'Atlas Coach is unavailable. Please try again.');
  return result;
 }
 async function allowance() {
  const generation = epoch;
  try {const data = await api('GET'); if (generation !== epoch) return; remaining = data.remaining; render();}
  catch (error) {if (generation === epoch) {$('#coachError').textContent = error.message; render();}}
 }
 function append(role, text, discs = []) {
  const node = document.createElement('div'); node.className = 'chat-message ' + role;
  const label = document.createElement('strong'); label.textContent = role === 'user' ? 'You' : 'Atlas Coach';
  const body = document.createElement('p'); body.textContent = text; node.append(label, body);
  for (const disc of discs) {
   if (!disc.flightSource) continue;
   try {const url = new URL(disc.flightSource); if (url.protocol !== 'https:') continue;
    const link = document.createElement('a'); link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = `${disc.brand} ${disc.name} · rating source ↗`; node.append(link);
   } catch { /* No unverified source link. */ }
  }
  $('#coachMessages').append(node); $('#coachMessages').scrollTop = $('#coachMessages').scrollHeight;
 }
 async function open(event) {
  opener = event?.currentTarget || $('#coachButton');
  if (!dialog.open) dialog.showModal(); $('#coachButton').setAttribute('aria-expanded', 'true');
  render(); stir(); void wake();
  try {await window.AtlasAccount.refresh();} catch {$('#coachError').textContent = 'Your account could not be checked. Close the coach and try again.';}
  if (account?.user) await allowance();
  if (dialog.open) ($('#coachInput').disabled ? $('#coachClose') : $('#coachInput')).focus();
 }
 $('#coachButton').addEventListener('click', open); $('#askCoach')?.addEventListener('click', open);
 document.addEventListener('click', event => {
  const close = event.target.closest('[data-close-dialog]');
  if (close) document.getElementById(close.dataset.closeDialog)?.close();
 });
 dialog.addEventListener('close', () => {rest(); $('#coachButton').setAttribute('aria-expanded', 'false'); opener?.focus();});
 for (const type of ['pointerdown', 'pointermove', 'keydown']) dialog.addEventListener(type, stir, {passive: true});
 $('#coachInput').addEventListener('focus', stir); $('#coachInput').addEventListener('blur', () => feel());
 // Typing again after a failed question picks him out of the tree.
 $('#coachInput').addEventListener('input', () => {failed = false; stir();});
 $('#coachHyzerToggle').addEventListener('click', () => showHyzer(hyzerHidden()));
 dialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const focusable = [...dialog.querySelectorAll('button:not(:disabled), a[href], textarea:not(:disabled)')].filter(node => !node.closest('[hidden]') && node.getClientRects().length);
  const first = focusable[0], last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
  else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
 });
 $('#coachInput').addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {event.preventDefault(); if (!$('#coachSend').disabled) $('#coachForm').requestSubmit();}
 });
 $('#coachForm').addEventListener('submit', async event => {
  event.preventDefault(); if (busy || $('#coachInput').disabled) return;
  const input = $('#coachInput'), question = input.value.trim(); if (!question) return;
  const generation = epoch, next = [...chat.slice(-10), {role: 'user', content: question}];
  busy = true; failed = false; speakingUntil = 0; aborter = new AbortController(); render(); stir(); $('#coachError').textContent = '';
  const draft = appendDraft(question);
  try {
   const result = await api('POST', {messages: next}, aborter.signal); if (generation !== epoch) return;
   chat = [...next, {role: 'assistant', content: result.answer.slice(0, 2000)}]; input.value = '';
   append('assistant', result.answer, result.discs);
   // The answer arrives whole (no streaming), so he speaks for a moment scaled to its length.
   speakingUntil = Date.now() + Math.min(4500, Math.max(1200, result.answer.length * 15));
   clearTimeout(speakTimer); speakTimer = setTimeout(feel, speakingUntil - Date.now() + 20);
   $('#coachProvider').textContent = result.provider === 'openai' ? 'Alternate AI service' : 'Standard AI service';
   $('#coachNotice').textContent = result.notice || '';
  } catch (error) {
   if (generation === epoch) {draft.remove(); $('#coachError').textContent = error.message; failed = true;}
  } finally {
   if (generation === epoch) {busy = false; aborter = null; render(); if (dialog.open && !input.disabled) input.focus(); stir();}
  }
 });
 function appendDraft(text) {append('user', text); return $('#coachMessages').lastElementChild;}
 $('#clearChat').addEventListener('click', () => {chat = []; $('#coachMessages').replaceChildren(); $('#coachError').textContent = ''; $('#coachInput').value = ''; $('#coachInput').focus();});
 window.addEventListener('atlas-account-change', event => {
  const data = event.detail;
  if (account?.csrfToken !== data.csrfToken || !!account?.user !== !!data.user) reset();
  account = data; render();
 });
 document.addEventListener('visibilitychange', () => {if (!document.hidden && dialog.open && account?.user && !busy) void allowance();});
 account = window.AtlasAccount?.current || null; render(); hyzerLabels();
 if (new URLSearchParams(location.search).get('coach') === '1') void open();
})();
