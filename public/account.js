/* eslint-disable @next/next/no-location-assign-relative-destination -- Static Worker pages require full document navigation. */
/* Shared Google account UI for the atlas, Profile and Account settings. */
(() => {
 const $ = selector => document.querySelector(selector);
 let current = null, pending = null;
 const route = location.pathname;
 const protectedPage = ['/profile', '/account-settings'].includes(route);
 const returnTo = ['/', '/profile', '/account-settings', '/?bag=1', '/?coach=1'].includes(new URLSearchParams(location.search).get('return_to'))
  ? new URLSearchParams(location.search).get('return_to') : '/';
 const status = message => {const node = $('#accountStatus');if (node) node.textContent = message;};
 async function api(path, method = 'GET', data) {
  const response = await fetch(path, {method, credentials: 'same-origin', cache: 'no-store',
   headers: method === 'GET' ? {} : {'Content-Type': 'application/json', 'X-Atlas-CSRF': current?.csrfToken || ''},
   ...(data ? {body: JSON.stringify(data)} : {})});
  const result = await response.json();if (!response.ok) throw new Error(result.error || 'Please try again.');return result;
 }
 function sync(data) {
  current = data;
  document.querySelectorAll('[data-auth-signed-out]').forEach(node => {node.hidden = !!data.user;});
  document.querySelectorAll('[data-auth-signed-in]').forEach(node => {node.hidden = !data.user;});
  const button = $('#accountButton');
  if (button) {const firstName=data.user?.name?.trim().split(/\s+/)[0] || 'there';button.textContent = data.user ? 'Hi '+firstName : 'Sign in';button.href = data.user ? '/profile' : '/signin';}
  const userName = $('#accountName'), email = $('#accountEmail'), nameInput = $('#displayName');
  if (userName) userName.textContent = data.user?.name || '';
  if (email) email.textContent = data.user?.email || '';
  const settingsEmail = $('#settingsEmail');if (settingsEmail) settingsEmail.textContent = data.user?.email || '';
  if (nameInput && data.user) nameInput.value = data.user.name;
  window.dispatchEvent(new CustomEvent('atlas-account-change', {detail: data}));
 }
 function renderPage() {
  if (!$('#accountPage')) return;
  if (protectedPage && !current.user) {location.replace('/signin?return_to=' + encodeURIComponent(route));return;}
  const view = route === '/account-settings' ? 'settings' : route === '/profile' ? 'profile' : 'signin';
  document.querySelectorAll('[data-account-view]').forEach(node => {node.hidden = node.dataset.accountView !== view;});
  $('#accountLoading').hidden = true;
  document.title = `${view === 'settings' ? 'Account settings' : view === 'profile' ? 'Profile' : 'Sign in'} — Disc Atlas`;
  const google = $('#googleSignIn');
  google.href = '/auth/google/start?return_to=' + encodeURIComponent(returnTo);
  google.hidden = !current.authReady || !!current.user;
  const resume = $('#resumeProfile');resume.hidden = !current.user;
  const message = new URLSearchParams(location.search).get('auth_error');
  if (view === 'signin') status(message === 'cancelled' ? 'Sign-in was cancelled. Try again when you’re ready.' :
   !current.authReady || message === 'unconfigured' ? 'Google sign-in is being connected. Please try again soon.' :
   message ? 'Sign-in didn’t finish. Please try again.' : '');
 }
 async function refresh() {
  if (!pending) pending = api('/api/account').then(data => {sync(data);renderPage();return data;})
   .catch(error => {status(error.message);throw error;}).finally(() => {pending = null;});
  return pending;
 }
 async function signOut() {
  await api('/auth/signout', 'POST');
  if (protectedPage) location.href = '/';else await refresh();
 }
 window.AtlasAccount = {refresh, signOut, get current() {return current;}};
 document.addEventListener('click', async event => {
  const button = event.target.closest('[data-account-signout]');if (!button) return;
  button.disabled = true;
  try {await signOut();} catch (error) {
   const menu = $('#siteMenu'), trigger = $('#siteMenuButton');
   if (menu) {menu.hidden = true;trigger?.setAttribute('aria-expanded', 'false');trigger?.focus();}
   const node = $('#accountStatus') || $('#accountActionStatus');if (node) {node.hidden = false;node.textContent = error.message;}
  } finally {button.disabled = false;}
 });
 document.addEventListener('DOMContentLoaded', () => {
  $('#retryAccountPage')?.addEventListener('click', () => {status('');refresh().catch(() => {});});
  $('#accountNameForm')?.addEventListener('submit', async event => {
   event.preventDefault();const button = $('#saveAccountName');button.disabled = true;status('Saving…');
   try {sync(await api('/api/account', 'PUT', {displayName: $('#displayName').value}));status('Display name saved.');}
   catch (error) {status(error.message);} finally {button.disabled = false;}
  });
  const dialog = $('#deleteAccountDialog');
  $('#deleteAccount')?.addEventListener('click', () => {
   $('#deleteAccountConfirm').value = '';$('#deleteAccountStatus').textContent = '';dialog.showModal();
  });
  $('#cancelDeleteAccount')?.addEventListener('click', () => dialog.close());
  $('#deleteAccountForm')?.addEventListener('submit', async event => {
   event.preventDefault();const button = $('#confirmDeleteAccount');
   if ($('#deleteAccountConfirm').value !== 'DELETE') {$('#deleteAccountStatus').textContent = 'Type DELETE to confirm.';return;}
   button.disabled = true;
   try {await api('/api/account', 'DELETE', {confirmation: 'DELETE'});location.href = '/';}
   catch (error) {$('#deleteAccountStatus').textContent = error.message;} finally {button.disabled = false;}
  });
  refresh().catch(() => {});
 });
 window.addEventListener('pageshow', event => {if (event.persisted) refresh().catch(() => {});});
})();
