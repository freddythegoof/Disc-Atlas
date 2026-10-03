import {createPublicWorker} from '../../workers/public.mjs';
import {googleFixture} from './google-oauth.mjs';

const reply = JSON.stringify({answer: '[[7446eb39abe5]] is a useful starting point for a straight midrange shot. Try a smooth, flat release and compare a few throws at comfortable power. Flight numbers are a guide; your release and wind will affect the result.', discIds: ['7446eb39abe5']});
const googleFetch = googleFixture();
const worker = {fetch(request, env) {
 const live = env.COACH_QA_LIVE === 'true';
 const ai = live ? {async run(...args) {
  try {const result = await env.AI.run(...args); console.log('Coach QA Workers AI result', {type: typeof result.response, keys: typeof result.response === 'object' ? Object.keys(result.response || {}) : []}); return result;}
  catch (error) {console.log('Coach QA Workers AI failure ' + JSON.stringify({name: error.name, code: error.code, message: String(error.message).replace(/sk-[A-Za-z0-9_-]+/g, '[redacted]').slice(0, 400)})); throw error;}
 }} : {run: async () => ({response: reply})};
 const openaiFetch = live ? async (...args) => {
  const response = await fetch(...args), data = await response.clone().json();
  console.log('Coach QA OpenAI result ' + JSON.stringify({httpStatus: response.status, status: data.status, code: data.error?.code, model: data.model, hasUsage: !!data.usage, outputTypes: data.output?.map(item => item.type)}));
  return response;
 } : async () => Response.json({output: [{content: [{type: 'output_text', text: reply}]}], usage: {input_tokens: 100, output_tokens: 100}});
 const worker = createPublicWorker({googleFetch, openaiFetch});
 return worker.fetch(request, {...env, AI: ai});
}};
export default worker;
