import atlas from '../web/index.html?raw';
export const dynamic = 'force-dynamic';
export function GET(){return new Response(atlas,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});}
