(() => {
 const $ = selector => document.querySelector(selector), dialog = $('#coachDialog');
 if (!dialog) return;
 let chat = [], busy = false, remaining = null, epoch = 0, aborter = null, account = null, opener = null;
 function reset() {epoch++; aborter?.abort(); aborter = null; busy = false; chat = []; remaining = null; $('#coachMessages').replaceChildren(); $('#coachInput').value = ''; $('#coachError').textContent = ''; $('#coachNotice').textContent = ''; $('#coachProvider').textContent = '';}
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
  render();
  try {await window.AtlasAccount.refresh();} catch {$('#coachError').textContent = 'Your account could not be checked. Close the coach and try again.';}
  if (account?.user) await allowance();
  if (dialog.open) ($('#coachInput').disabled ? $('#coachClose') : $('#coachInput')).focus();
 }
 $('#coachButton').addEventListener('click', open); $('#askCoach')?.addEventListener('click', open);
 document.addEventListener('click', event => {
  const close = event.target.closest('[data-close-dialog]');
  if (close) document.getElementById(close.dataset.closeDialog)?.close();
 });
 dialog.addEventListener('close', () => {$('#coachButton').setAttribute('aria-expanded', 'false'); opener?.focus();});
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
  busy = true; aborter = new AbortController(); render(); $('#coachError').textContent = '';
  const draft = appendDraft(question);
  try {
   const result = await api('POST', {messages: next}, aborter.signal); if (generation !== epoch) return;
   chat = [...next, {role: 'assistant', content: result.answer.slice(0, 2000)}]; input.value = '';
   append('assistant', result.answer, result.discs);
   $('#coachProvider').textContent = result.provider === 'openai' ? 'Alternate AI service' : 'Standard AI service';
   $('#coachNotice').textContent = result.notice || '';
  } catch (error) {
   if (generation === epoch) {draft.remove(); $('#coachError').textContent = error.message;}
  } finally {
   if (generation === epoch) {busy = false; aborter = null; render(); if (dialog.open && !input.disabled) input.focus();}
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
 account = window.AtlasAccount?.current || null; render();
 if (new URLSearchParams(location.search).get('coach') === '1') void open();
})();
