import { writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

async function main() {
  console.log('Fetching sitemap from https://greek-invest.com/sitemap-0.xml...');
  const res = await fetch('https://greek-invest.com/sitemap-0.xml');
  if (!res.ok) {
    console.error(`Failed to fetch sitemap: ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  const xml = await res.text();
  
  // Extract all <loc> URLs
  const urls = [];
  const regex = /<loc>(https:\/\/greek-invest\.com\/[^<]+)<\/loc>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1]);
  }

  if (!urls.length) {
    console.error('No URLs found in sitemap.');
    process.exit(1);
  }

  console.log(`Found ${urls.length} URLs to submit.`);

  // 1. Submit to Bing IndexNow
  const tempTxtPath = join(__dirname, 'greek-sitemap-urls.txt');
  writeFileSync(tempTxtPath, urls.join('\n'));
  console.log('\nSubmitting to Bing IndexNow...');
  try {
    const bingOut = execSync(`node scripts/submit-bing-explicit.mjs scripts/greek-sitemap-urls.txt`, { cwd: ROOT, encoding: 'utf8' });
    console.log(bingOut.trim());
  } catch (err) {
    console.error('Bing submission failed:', err.message);
  } finally {
    try {
      unlinkSync(tempTxtPath);
    } catch {}
  }

  // 2. Submit to Google Indexing API
  console.log('\nSubmitting to Google Indexing API...');
  try {
    // Pass URLs as arguments to submit-google-explicit.mjs
    const googleOut = execSync(`node scripts/submit-google-explicit.mjs ${urls.join(' ')}`, { cwd: ROOT, encoding: 'utf8' });
    console.log(googleOut.trim());
  } catch (err) {
    console.error('Google submission failed:', err.message);
  }
}

main().catch(console.error);
