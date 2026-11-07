// "Don't see a disc?" (docs/disc-request-form.md): the sheet the search empty states open. The Worker is the one
// validator; its messages land beside each field and nothing the visitor typed is cleared until a request succeeds.
(() => {
 const $ = selector => document.querySelector(selector), dialog = $('#discRequestDialog');
 if (!dialog) return;
 const form = $('#discRequestForm'), status = $('#discRequestStatus'), send = $('#discRequestSend'), done = $('#discRequestDone'), thanks = $('#discRequestThanks');
 const FLIGHT = ['speed', 'glide', 'turn', 'fade'], FAILED = 'Your request couldn’t be sent. What you typed is still here, so please try again.';
 let opener = null, busy = false;

 function fillBrands() {
  const select = form.elements.manufacturer;
  if (select.options.length > 1) return;
  // app.js owns the catalog's brand list; the classic scripts share their top-level names.
  for (const name of [...manufacturers, 'Other']) select.add(new Option(name, name));
 }
 function fieldsFor(name) {return name === 'flight' ? FLIGHT.map(n => form.elements[n]) : [form.elements[name]];}
 function clearErrors() {
  status.textContent = '';
  for (const node of form.querySelectorAll('[data-error-for]')) node.textContent = '';
  for (const node of form.querySelectorAll('[aria-invalid]')) node.removeAttribute('aria-invalid');
 }
 function showErrors(fields) {
  for (const [name, message] of Object.entries(fields)) {
   const node = form.querySelector(`[data-error-for="${name}"]`);
   if (!node) continue;
   node.textContent = message;
   for (const field of fieldsFor(name)) field.setAttribute('aria-invalid', 'true');
  }
  form.querySelector('[aria-invalid]')?.focus();
 }
 function setBusy(next) {busy = next; send.disabled = next; send.textContent = next ? 'Sending…' : 'Send request';}
 function payload() {
  const data = Object.fromEntries(['discName', 'manufacturer', 'link', 'note', 'email', 'contact_time'].map(name => [name, form.elements[name].value]));
  for (const name of FLIGHT) {const value = form.elements[name].value; data[name] = value === '' ? null : Number(value);}
  return data;
 }

 function open(event) {
  opener = event.target.closest('[data-disc-request]');
  if (!done.hidden) {done.hidden = true; form.hidden = false; thanks.textContent = ''; form.reset();}
  fillBrands(); clearErrors();
  if (!form.elements.discName.value) form.elements.discName.value = $('#search').value.trim().slice(0, 120);
  if (!dialog.open) dialog.showModal();
  form.elements.discName.focus();
 }
 document.addEventListener('click', event => {if (event.target.closest('[data-disc-request]')) open(event);});
 // The Directory rebuilds its rows, so the link that opened the sheet may have gone.
 dialog.addEventListener('close', () => {(opener?.isConnected ? opener : $('#search')).focus();});

 form.addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return;
  clearErrors(); setBusy(true);
  try {
   const response = await fetch('/api/disc-requests', {method: 'POST', cache: 'no-store', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload())});
   const result = await response.json().catch(() => ({}));
   if (response.ok) {
    form.hidden = true; done.hidden = false;
    thanks.textContent = 'Thanks — every request is reviewed by a human before a disc is added.';
    thanks.focus();
   } else if (result.fields) showErrors(result.fields);
   else status.textContent = result.error || FAILED;
  } catch {status.textContent = FAILED;}
  finally {setBusy(false);}
 });
})();
