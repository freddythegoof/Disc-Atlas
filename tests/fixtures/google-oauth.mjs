import {SignJWT, generateKeyPair, exportJWK} from 'jose';

// Test transport only: production always contacts Google's fixed HTTPS endpoints.
export function googleFixture() {
 let keys;
 const getKeys = () => keys ||= generateKeyPair('RS256').then(async pair => ({...pair,
  jwk: {...await exportJWK(pair.publicKey), kid: 'fixture-google', alg: 'RS256', use: 'sig'}}));
 return async (input, options = {}) => {
  const pair = await getKeys(), url = String(input);
  if (url === 'https://www.googleapis.com/oauth2/v3/certs') return Response.json({keys: [pair.jwk]});
  if (url !== 'https://oauth2.googleapis.com/token') throw new Error('Unexpected fixture endpoint');
  const form = new URLSearchParams(options.body);
  if (form.get('client_id') !== 'fixture-client' || form.get('client_secret') !== 'fixture-secret') return Response.json({error:'invalid_client'}, {status:400});
  let code;try {code = JSON.parse(atob(form.get('code')));} catch {return Response.json({error:'invalid_grant'}, {status:400});}
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(form.get('code_verifier'))));
  const challenge = btoa(String.fromCharCode(...digest)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
  if (challenge !== code.challenge) return Response.json({error:'invalid_grant'}, {status:400});
  const id_token = await new SignJWT({nonce:code.nonce, email:code.email || 'player@example.com', email_verified:true, name:'Atlas Player'})
   .setProtectedHeader({alg:'RS256', kid:'fixture-google'}).setIssuer('https://accounts.google.com').setAudience('fixture-client')
   .setSubject(code.sub || 'fixture-player').setIssuedAt().setExpirationTime('5m').sign(pair.privateKey);
  return Response.json({id_token});
 };
}
