import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
const ROOT = process.env.ROOT, PORT = Number(process.env.PORT || 4493);
const MIME = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2' };
const srv = createServer((req,res)=>{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); let f=path.join(ROOT,p);
  if (existsSync(f)&&statSync(f).isDirectory()) f=path.join(f,'index.html');
  if (!existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'}); res.end(readFileSync(f)); }).listen(PORT);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const c = await b.newContext();
await c.route('**res.cloudinary.com/**', r => r.fulfill({ status:200, contentType:'image/webp', body: Buffer.alloc(0) }));
const urls = JSON.parse(readFileSync(process.env.URLS, 'utf8'));
let bad = 0;
for (const w of [1440, 768, 390]) {
  const page = await c.newPage(); await page.setViewportSize({ width: w, height: 900 });
  for (const u of urls) {
    await page.goto(`http://localhost:${PORT}${u}`, { waitUntil: 'load', timeout: 30000 }).catch(()=>{});
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (ov > 4) { console.log(`OVF ${w}px ${u} +${ov}px`); bad++; }
  }
  await page.close(); console.log(`ширина ${w}: готово`);
}
console.log('ВСЕГО ВЫЛЕЗАНИЙ:', bad);
await b.close(); srv.close();
