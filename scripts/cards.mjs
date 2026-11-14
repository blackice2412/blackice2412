// Renders the README's image cards (dark + light) and line icons into assets/.
// Same look as abdulhkim.com: charcoal / paper, Fraunces + Manrope, teal dot,
// sand highlights (Teal & Sand palette). Run: npm install && npm run cards (needs Playwright).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright');

/* ------------------------------------------------------------------ data */

const projects = [
  { key: 'menupasha', icon: 'utensils-crossed', name: 'MenuPasha', tag: 'Restaurant platform', host: 'menupasha.sy', text: 'Digital menus, orders, branches and reporting for restaurants and cafés.' },
  { key: 'autozatca', icon: 'receipt-text', name: 'AutoZATCA', tag: 'Odoo 17 module · Free', host: 'apps.odoo.com', text: 'Free ZATCA e-invoicing for Odoo 17. Saudi tax compliance without the headache.' },
  { key: 'tabibon', icon: 'stethoscope', name: 'Tabibon', tag: 'Healthcare app', host: 'tabibon.com', text: 'Doctor booking. Pick a doctor, pick a slot, skip the waiting-room lottery.' },
  { key: 'shariii', icon: 'tag', name: 'Shariii', tag: 'Marketplace', host: 'shariii.com', text: 'Classified ads with web and mobile apps. List it, find it, sell it.' },
  { key: 'tadbeer', icon: 'store', name: 'Tadbeer', tag: 'Retail POS', host: null, text: 'A POS system with a customer loyalty app, so the till and the regulars get along.' },
  { key: 'systems', icon: 'workflow', name: 'CRM & ERP', tag: 'Business systems', host: null, text: 'Custom CRM and ERP systems and integrations, built around how a business works.' },
];

const rf4 = {
  stats: [
    ['118K+', 'visits a month'],
    ['219K', 'visits in the peak month'],
    ['~270K', 'pageviews in one week'],
    ['17.4K', 'Google clicks in 28 days'],
    ['#1', 'for “rf4 trophies”'],
    ['~10K', 'pages indexed'],
  ],
};

const services = [
  { icon: 'globe', title: 'Web & SEO', text: 'Fast sites and web apps that load quick and get found.' },
  { icon: 'smartphone', title: 'Mobile apps', text: 'Flutter apps on the same backend as the web.' },
  { icon: 'layers', title: 'CRM, ERP & POS', text: 'Custom business systems, plus the integrations.' },
  { icon: 'server-cog', title: 'Self-hosting', text: 'Docker, Dokploy and Linux on your own servers.' },
];

// small icons used inline in the README headings and lists (mid teal reads on both GitHub themes)
const inlineIcons = ['rocket', 'building-2', 'briefcase', 'map-pin', 'languages', 'trophy', 'sparkles', 'code-xml', 'layers', 'mail', 'calendar', 'fish', 'hammer', 'send', 'activity'];

/* ----------------------------------------------------------------- theme */

const THEMES = {
  dark: {
    bg: '#101616', panel: '#172020', fg: '#eef3f2', fg2: '#9aa7a5', rule: 'rgba(238,243,242,.13)', accent: '#e8cf9e', italic: '#56c2bb', ring: 'rgba(238,243,242,.22)',
    glow: 'radial-gradient(70% 90% at 100% 0%, rgba(15,126,125,.26), transparent 62%)',
  },
  light: {
    bg: '#f4f0e6', panel: '#ebe6da', fg: '#132020', fg2: '#5b6563', rule: 'rgba(19,32,32,.14)', accent: '#0d6867', italic: '#0d6867', ring: 'rgba(19,32,32,.2)',
    glow: 'radial-gradient(70% 90% at 100% 0%, rgba(15,126,125,.14), transparent 62%)',
  },
};

const font = (p) => 'data:font/woff2;base64,' + readFileSync(resolve('node_modules/@fontsource-variable', p)).toString('base64');
const FONTS = `
@font-face{font-family:F;font-weight:100 900;src:url(${font('fraunces/files/fraunces-latin-wght-normal.woff2')})}
@font-face{font-family:F;font-style:italic;font-weight:100 900;src:url(${font('fraunces/files/fraunces-latin-wght-italic.woff2')})}
@font-face{font-family:M;font-weight:200 800;src:url(${font('manrope/files/manrope-latin-wght-normal.woff2')})}`;

const icon = (name, size = 24, color = 'currentColor', stroke = 1.6) =>
  readFileSync(resolve('node_modules/lucide-static/icons', `${name}.svg`), 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/width="24"/, `width="${size}"`)
    .replace(/height="24"/, `height="${size}"`)
    .replace(/stroke="currentColor"/, `stroke="${color}"`)
    .replace(/stroke-width="2"/, `stroke-width="${stroke}"`)
    .replace(/\sclass="[^"]*"/, '');
const ARROW = (c) => `<svg width="15" height="15" viewBox="0 0 16 16"><path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const base = (t, w, h) => `<style>${FONTS}
*{margin:0;box-sizing:border-box}
html,body{width:${w}px;height:${h}px;background:transparent}
body{font-family:M,sans-serif;color:${t.fg};-webkit-font-smoothing:antialiased}
.card{position:relative;width:100%;height:100%;border-radius:22px;border:1px solid ${t.rule};background:${t.glow},${t.bg};overflow:hidden}
.label{display:flex;align-items:center;gap:10px;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${t.fg2}}
.label:before{content:'';width:7px;height:7px;border-radius:50%;background:#0f7e7d;box-shadow:0 0 0 4px rgba(15,126,125,.22)}
.tag{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${t.accent}}
.serif{font-family:F,serif;font-weight:400;letter-spacing:-.03em}
em{font-family:F,serif;font-style:italic;font-weight:360;color:${t.italic}}
</style>`;

/* ----------------------------------------------------------------- cards */

const projectCard = (t, p, i) => `${base(t, 410, 236)}
<style>
.card{padding:24px 26px;display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:flex-start}
.ic{width:52px;height:52px;border-radius:50%;border:1px solid ${t.ring};display:grid;place-items:center}
.no{font-size:12px;font-weight:700;color:${t.fg2}}
.name{font-size:31px;line-height:1.05;margin-top:6px}
.text{margin-top:8px;font-size:14px;line-height:1.5;color:${t.fg2};max-width:340px}
.foot{margin-top:auto;padding-top:12px;border-top:1px solid ${t.rule};display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700}
.tagrow{margin-top:18px}
</style>
<div class="card">
  <div class="top"><div class="ic">${icon(p.icon, 24, t.accent)}</div><span class="no">${String(i + 2).padStart(2, '0')}</span></div>
  <p class="tag tagrow">${p.tag}</p>
  <p class="serif name">${p.name}</p>
  <p class="text">${p.text}</p>
  <div class="foot">${p.host ? `${p.host} ${ARROW('#0f7e7d')}` : `<span style="color:${t.fg2};font-weight:600">Ask me about it</span>`}</div>
</div>`;

const rf4Card = (t) => `${base(t, 840, 330)}
<style>
.card{display:grid;grid-template-columns:300px 1fr;gap:34px;padding:34px 36px;align-items:center}
.ic{width:46px;height:46px;border-radius:50%;background:#0f7e7d;display:grid;place-items:center;margin-bottom:18px}
.name{font-size:46px;line-height:1;margin-top:10px}
.text{margin-top:12px;font-size:14.5px;line-height:1.55;color:${t.fg2}}
.btn{display:inline-flex;align-items:center;gap:8px;margin-top:18px;padding:10px 16px;border-radius:999px;background:#0f7e7d;color:#fff;font-size:13px;font-weight:700}
.stats{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid ${t.rule}}
.stat{padding:16px 14px 18px;border-bottom:1px solid ${t.rule};border-right:1px solid ${t.rule}}
.stat:nth-child(3n){border-right:0}
.v{font-family:F,serif;font-size:40px;font-weight:380;letter-spacing:-.03em;line-height:1;color:${t.accent}}
.l{margin-top:6px;font-size:12px;line-height:1.35;color:${t.fg2}}
</style>
<div class="card">
  <div>
    <div class="ic">${icon('trophy', 22, '#fff', 1.8)}</div>
    <p class="tag">Side project · Since 2024</p>
    <p class="serif name">RF4 Trophies</p>
    <p class="text">A trophy and fishing-spot guide for Russian Fishing 4. I built it for fun; the anglers showed up.</p>
    <span class="btn">rf4trophies.com ${ARROW('#fff')}</span>
  </div>
  <div class="stats">${rf4.stats.map(([v, l]) => `<div class="stat"><p class="v">${v}</p><p class="l">${l}</p></div>`).join('')}</div>
</div>`;

const servicesCard = (t) => `${base(t, 840, 214)}
<style>
.card{display:grid;grid-template-columns:repeat(4,1fr)}
.s{padding:26px 22px;border-right:1px solid ${t.rule};display:flex;flex-direction:column;gap:10px}
.s:last-child{border-right:0}
.row{display:flex;justify-content:space-between;align-items:center}
.n{font-family:F,serif;font-style:italic;font-size:16px;color:#0f7e7d}
.title{font-family:F,serif;font-size:21px;line-height:1.15;letter-spacing:-.015em;margin-top:8px}
.text{font-size:13px;line-height:1.5;color:${t.fg2}}
</style>
<div class="card">${services
  .map((s, i) => `<div class="s"><div class="row">${icon(s.icon, 26, t.accent)}<span class="n">0${i + 1}</span></div><p class="title">${s.title}</p><p class="text">${s.text}</p></div>`)
  .join('')}</div>`;

const dividerCard = (t, label, title) => `${base(t, 840, 96)}
<style>
.card{border:0;border-radius:0;background:transparent;display:flex;flex-direction:column;justify-content:center;gap:10px;padding:0 4px}
.h{font-family:F,serif;font-size:40px;line-height:1;letter-spacing:-.03em;font-weight:400}
.line{position:absolute;left:0;right:0;bottom:0;height:1px;background:${t.rule}}
</style>
<div class="card"><p class="label">${label}</p><p class="h">${title}</p><div class="line"></div></div>`;

const headings = [
  ['work', 'Selected work', 'Things I’ve <em>shipped</em>'],
  ['more', 'More work', 'More <em>stuff</em>'],
  ['services', 'What I do', 'What I <em>do</em>'],
  ['companies', 'Companies', 'Where I <em>build</em>'],
  ['stack', 'Stack', 'Tools of the <em>trade</em>'],
  ['activity', 'Activity', 'Still <em>shipping</em>'],
  ['contact', 'Contact', 'Let’s <em>talk</em>'],
];


/* The profile header: "I make stu|ff" with an autocomplete suggestion. */
const headerCard = () => `<style>${FONTS}
*{margin:0;box-sizing:border-box}
html,body{width:1280px;height:320px}
body{position:relative;overflow:hidden;font-family:M,sans-serif;color:#eef3f2;
background:radial-gradient(45% 80% at 72% 30%,rgba(15,126,125,.20),transparent 70%),radial-gradient(40% 70% at 10% 100%,rgba(232,207,158,.05),transparent 70%),#101616}
.rule{position:absolute;left:0;right:0;height:1px;background:rgba(238,243,242,.11)}
.title{position:absolute;left:0;right:0;top:78px;text-align:center;font-family:F,serif;font-size:122px;font-weight:400;letter-spacing:-.045em;line-height:1;white-space:nowrap}
.title em{font-style:italic;font-weight:360;color:#56c2bb}
.title .ghost{font-style:italic;font-weight:360;color:rgba(232,207,158,.32)}
.caret{display:inline-block;width:7px;height:96px;margin:0 4px 0 6px;vertical-align:-8px;border-radius:2px;background:#e8cf9e;box-shadow:0 0 22px rgba(232,207,158,.45)}
.pop{position:absolute;top:218px;display:flex;align-items:center;gap:16px;padding:12px 14px 12px 18px;border-radius:14px;background:#172020;border:1px solid rgba(238,243,242,.12);box-shadow:0 18px 40px -12px rgba(0,0,0,.6)}
.pop i{width:10px;height:10px;border-radius:50%;background:#0f7e7d;box-shadow:0 0 0 5px rgba(15,126,125,.25)}
.pop span{font-family:F,serif;font-style:italic;font-size:34px;letter-spacing:-.02em;color:#9aa7a5}
.pop span b{font-weight:360;color:#e8cf9e}
.pop kbd{display:grid;place-items:center;width:54px;height:36px;border-radius:8px;border:1px solid rgba(238,243,242,.16);background:rgba(238,243,242,.04);color:#9aa7a5}
</style>
<div class="rule" style="top:50px"></div><div class="rule" style="top:269px"></div>
<p class="title" id="t">I make <em>stu</em><span class="caret" id="c"></span><span class="ghost">ff</span></p>
<div class="pop" id="p"><i></i><span>stu<b>ff</b></span><kbd><svg width="22" height="16" viewBox="0 0 22 16"><path d="M2 8h14M11 3l5 5-5 5M20 2v12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></kbd></div>
<script>document.fonts.ready.then(()=>{const c=document.getElementById('c').getBoundingClientRect();document.getElementById('p').style.left=(c.left-34)+'px'})</script>`;

/* ---------------------------------------------------------------- render */

mkdirSync('assets/cards', { recursive: true });
mkdirSync('assets/icons', { recursive: true });

const browser = await chromium.launch();
async function shot(html, w, h, file) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file, omitBackground: true });
  await page.close();
}

for (const [mode, t] of Object.entries(THEMES)) {
  await shot(rf4Card(t), 840, 330, `assets/cards/rf4-${mode}.png`);
  await shot(servicesCard(t), 840, 214, `assets/cards/services-${mode}.png`);
  for (const [i, p] of projects.entries()) await shot(projectCard(t, p, i), 410, 236, `assets/cards/${p.key}-${mode}.png`);
  for (const [key, label, title] of headings) await shot(dividerCard(t, label, title), 840, 96, `assets/cards/h-${key}-${mode}.png`);
}
await shot(headerCard(), 1280, 320, 'assets/header.png');
await browser.close();

for (const name of inlineIcons) writeFileSync(`assets/icons/${name}.svg`, icon(name, 24, '#2a9d99', 2) + '\n');

console.log('Cards and icons written to assets/.');
