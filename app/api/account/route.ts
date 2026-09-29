import {getChatGPTUser,chatGPTSignInPath,chatGPTSignOutPath} from '../../chatgpt-auth';
import {json,savedBag,savedProfile,unavailable} from '../../../lib/server';
import {env} from 'cloudflare:workers';
export const dynamic='force-dynamic';
export async function GET(){try{const user=await getChatGPTUser();const auth={signInUrl:chatGPTSignInPath('/?bag=1'),signOutUrl:chatGPTSignOutPath('/'),coachReady:!!env.OPENAI_API_KEY};if(!user)return json({...auth,user:null});const [profile,bag]=await Promise.all([savedProfile(user.userId),savedBag(user.userId)]);return json({...auth,user:{name:user.fullName||'Player',email:user.email},profile,bag});}catch{return unavailable();}}
