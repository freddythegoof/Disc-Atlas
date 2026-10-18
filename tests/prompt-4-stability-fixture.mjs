import fs from 'node:fs';
import {chromium} from 'playwright';
const b=await chromium.launch({headless:true});const p=await b.newPage();
try{
 await p.setContent('<div id="stabilityHelp"><button id="stabilityHelpButton" aria-expanded="false">Help</button><section id="stabilityHelpContent" hidden>Stability information</section></div><button id="outside">Outside</button>');
 await p.addStyleTag({path:'public/polish.css'});await p.addStyleTag({path:'public/cosmic.css'});
 await p.addScriptTag({path:'public/stability-help.js'});
 const visible=()=>p.locator('#stabilityHelpContent').evaluate(n=>!n.hidden);
 const rows=[];
 await p.locator('#stabilityHelpButton').hover();if(!await visible())throw Error('hover failed');await p.locator('#outside').hover();rows.push({exit:'pointer-leave',hidden:!await visible()});
 await p.locator('#stabilityHelpButton').focus();if(!await visible())throw Error('focus failed');await p.locator('#outside').focus();rows.push({exit:'focus-out',hidden:!await visible()});
 await p.locator('#stabilityHelpButton').click();if(!await visible())throw Error('pin failed');await p.keyboard.press('Escape');rows.push({exit:'Escape',hidden:!await visible()});
 await p.locator('#stabilityHelpButton').click();if(!await visible())throw Error('pin failed');await p.locator('#outside').click();rows.push({exit:'outside click',hidden:!await visible()});
 if(rows.some(r=>!r.hidden))throw Error(JSON.stringify(rows));fs.writeFileSync('outputs/prompt-4/stability.json',JSON.stringify(rows,null,2));console.log('PASS isolated dead-script fixture: all four exits set hidden immediately');
}finally{await b.close();}
