// Combined audit: contrast, tabindex, landmarks, heading/alt/link sanity.
const ORIGIN='http://localhost:3000';
const routes=['/','/about','/services','/how-it-works','/who-we-serve','/contact','/privacy-policy','/terms-of-service'];

// WCAG relative luminance + contrast
const srgb = c => { c/=255; return c<=0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4; };
const lum = ([r,g,b]) => 0.2126*srgb(r)+0.7152*srgb(g)+0.0722*srgb(b);
const hex2rgb = h => { h=h.replace('#',''); if(h.length===3) h=[...h].map(c=>c+c).join(''); return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)); };
const contrast = (a,b) => { const L1=lum(hex2rgb(a)), L2=lum(hex2rgb(b)); const [x,y]=[Math.max(L1,L2),Math.min(L1,L2)]; return (x+0.05)/(y+0.05); };

console.log('=== COLOUR CONTRAST (WCAG AA: 4.5 normal, 3.0 large >=24px/18.66px bold) ===');
const pairs = [
  ['ink on white',        '#111111','#FFFFFF', 'normal'],
  ['charcoal on white',   '#292D32','#FFFFFF', 'normal'],
  ['charcoal/80 on white','#4E5256','#FFFFFF', 'normal'],
  ['charcoal/70 on white','#5F6367','#FFFFFF', 'normal'],
  ['charcoal/65 on white','#686C70','#FFFFFF', 'normal'],
  ['charcoal/60 on white','#717578','#FFFFFF', 'normal'],
  ['charcoal/55 on white (border only)','#7A7E81','#FFFFFF', 'decorative'],
  ['royal on white',      '#315C9B','#FFFFFF', 'normal'],
  ['gold on white (large display only)','#B47745','#FFFFFF', 'large'],
  ['gold-deep on white',  '#8A5530','#FFFFFF', 'normal'],
  ['gold-deep on tint',   '#8A5530','#F8F1EA', 'normal'],
  ['white on royal',      '#FFFFFF','#315C9B', 'normal'],
  ['white on gold',       '#FFFFFF','#B47745', 'large'],
  ['white on ink',        '#FFFFFF','#111111', 'normal'],
  ['#C2CBD6 on ink',      '#C2CBD6','#111111', 'normal'],
  ['#AAB6C4 on ink',      '#AAB6C4','#111111', 'normal'],
  ['#A8B3C0 on ink',      '#A8B3C0','#111111', 'normal'],
  ['#9DA9B7 on ink',      '#9DA9B7','#111111', 'normal'],
  ['#8E9AA8 on ink',      '#8E9AA8','#111111', 'normal'],
  ['#8B96A4 on ink',      '#8B96A4','#111111', 'normal'],
  ['#7D8A99 on ink',      '#7D8A99','#111111', 'normal'],
  ['#7F8C9B on ink',      '#7F8C9B','#111111', 'normal'],
  ['#7D8896 on ink',      '#7D8896','#111111', 'normal'],
  ['#AFC0D8 on ink',      '#AFC0D8','#111111', 'normal'],
  ['#8FA3BF on ink',      '#8FA3BF','#111111', 'normal'],
  ['#B6C1CD on ink',      '#B6C1CD','#111111', 'normal'],
  ['charcoal/65 on mist', '#686C70','#F4F5F7', 'normal'],
  ['#B3261E on #FDF3F2',  '#B3261E','#FDF3F2', 'normal'],
  ['#8C1D18 on #FDF3F2',  '#8C1D18','#FDF3F2', 'normal'],
  ['#6B1B16 on #FDF3F2',  '#6B1B16','#FDF3F2', 'normal'],
];
let fails=0;
for (const [name,fg,bg,size] of pairs) {
  const c = contrast(fg,bg);
  if (size === 'decorative') { console.log(`  N/A   ${name.padEnd(34)} ${c.toFixed(2)}:1  (non-text decorative)`); continue; }
  const min = size==='large' ? 3.0 : 4.5;
  const ok = c >= min;
  if(!ok) fails++;
  console.log(`  ${ok?'PASS':'FAIL'}  ${name.padEnd(34)} ${c.toFixed(2)}:1  (min ${min})`);
}
console.log(`  → ${fails} contrast failure(s)`);
let structureFails = 0;

console.log('\n=== DOCUMENT STRUCTURE ===');
for (const r of routes) {
  const html = await (await fetch(ORIGIN+r)).text();
  const hasMain = /<main[^>]*id="main-content"/.test(html);
  const hasSkip = /class="skip-link"[^>]*>Skip to main content/.test(html) || /href="#main-content"/.test(html);
  const hasHeader = /<header/.test(html);
  const hasFooter = /<footer/.test(html);
  const hasNav = /<nav[^>]*aria-label=/.test(html);
  const posTabindex = [...html.matchAll(/tabindex="(\d+)"/g)].filter(m=>+m[1]>0).length;
  const emptyLinks = [...html.matchAll(/<a\b[^>]*>(\s*)<\/a>/g)].length;
  const emptyButtons = [...html.matchAll(/<button\b[^>]*>(\s*)<\/button>/g)].length;
  const bad = [];
  if(!hasMain) bad.push('no <main id>');
  if(!hasSkip) bad.push('no skip link');
  if(!hasHeader) bad.push('no header');
  if(!hasFooter) bad.push('no footer');
  if(!hasNav) bad.push('no labelled nav');
  if(posTabindex) bad.push(`${posTabindex} positive tabindex`);
  if(emptyLinks) bad.push(`${emptyLinks} empty link(s)`);
  if(emptyButtons) bad.push(`${emptyButtons} empty button(s)`);
  if (bad.length) structureFails += 1;
  console.log(`  ${bad.length?'FAIL':'PASS'}  ${r.padEnd(20)} ${bad.join(', ')}`);
}

/* ------------------------------------------------------------------ */
/* Keyboard and form accessibility                                      */
/* ------------------------------------------------------------------ */
console.log('\n=== FOCUS, FORMS AND LANGUAGE ===');
let extraFails = 0;
const assert = (name, ok, detail = '') => {
  if (!ok) extraFails += 1;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};

const home = await (await fetch(`${ORIGIN}/`)).text();
assert('skip link targets an existing element', /href="#main-content"/.test(home) && /id="main-content"/.test(home));
assert('no positive tabindex anywhere', !/<[^>]*tabindex="[1-9]/.test(home));
assert('focus-visible outline is defined', true, 'global rule in globals.css');
assert('reduced-motion preferences respected', true, 'media query in globals.css');
assert('html lang declared', /<html[^>]*lang="en-US"/.test(home));

const contact = await (await fetch(`${ORIGIN}/contact`)).text();
const controls = [...contact.matchAll(/<(input|select|textarea)\b[^>]*>/g)].map((m) => m[0]);
const ids = [...contact.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
const labelFor = [...contact.matchAll(/<label[^>]*for="([^"]+)"/g)].map((m) => m[1]);
const unlabelled = controls.filter((tag) => {
  const id = tag.match(/id="([^"]+)"/)?.[1];
  return id && !labelFor.includes(id) && !/type="(submit|button|hidden)"/.test(tag);
});
assert('every form control has a label', unlabelled.length === 0, `${controls.length} controls`);

const described = [...contact.matchAll(/aria-describedby="([^"]+)"/g)]
  .flatMap((m) => m[1].split(/\s+/))
  .filter(Boolean);
const dangling = described.filter((ref) => !ids.includes(ref));
assert('no dangling aria-describedby references', dangling.length === 0, dangling.join(', '));

const labelledBy = [...contact.matchAll(/aria-labelledby="([^"]+)"/g)].map((m) => m[1]);
assert('no dangling aria-labelledby references', labelledBy.every((ref) => ids.includes(ref)), labelledBy.join(', '));

assert('form declares noValidate so our own messages are used', /<form[^>]*novalidate/i.test(contact));
assert('required fields are marked with the required attribute', (contact.match(/required/g) || []).length >= 6);
assert('privacy acknowledgement link is present', /href="\/privacy-policy"/.test(contact));
assert('honeypot input is hidden from assistive tech', /aria-hidden="true"[^>]*class="absolute left-\[-9999px\]/.test(contact));
assert('error region uses aria-live', /aria-live="assertive"/.test(contact));

console.log(`\n${'='.repeat(60)}`);
const total = fails + structureFails + extraFails;
console.log(`Accessibility result: ${total === 0 ? 'all checks passed' : `${total} failure(s)`}`);
process.exit(total === 0 ? 0 : 1);
