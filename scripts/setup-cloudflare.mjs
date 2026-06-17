#!/usr/bin/env node
/**
 * One-time Cloudflare setup for greek-invest.com
 * DNS (Vercel) + Email Routing (info@ → Gmail)
 *
 * Usage: node scripts/setup-cloudflare.mjs
 * Requires: CLOUDFLARE_API_TOKEN in env (or 99_Системное/MCP/.env)
 */

const ZONE_ID = '76132a4bd85c3a272d9e7cda1984cbc7';
const DOMAIN = 'greek-invest.com';
const FORWARD_TO = 'maks.shchegolev@gmail.com';
const INFO_EMAIL = `info@${DOMAIN}`;

const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.error('Missing CLOUDFLARE_API_TOKEN');
  process.exit(1);
}

const API = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}`;

async function cf(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(`${path}: ${JSON.stringify(data.errors || data)}`);
  }
  return data;
}

async function listDns() {
  const data = await cf('/dns_records?per_page=100');
  return data.result;
}

async function upsertDns(type, name, content, extra = {}) {
  const records = await listDns();
  const fullName = name === '@' ? DOMAIN : `${name}.${DOMAIN}`;
  const existing = records.find(
    (r) => r.type === type && r.name === fullName && r.content === content
  );
  const body = {
    type,
    name,
    content,
    ttl: 1,
    proxied: false,
    ...extra,
  };
  if (existing) {
    console.log(`  OK exists: ${type} ${fullName} → ${content}`);
    return existing;
  }
  const data = await cf('/dns_records', { method: 'POST', body: JSON.stringify(body) });
  console.log(`  Created: ${type} ${fullName} → ${content}`);
  return data.result;
}

async function setupDns() {
  console.log('\n=== DNS (Vercel) ===');
  await upsertDns('CNAME', '@', 'cname.vercel-dns.com');
  await upsertDns('CNAME', 'www', 'cname.vercel-dns.com');
}

async function setupEmailRouting() {
  console.log('\n=== Email Routing ===');

  try {
    await cf('/email/routing/enable', { method: 'POST', body: '{}' });
    console.log('  Enabled email routing');
  } catch (e) {
    if (String(e.message).includes('already enabled')) {
      console.log('  Email routing already enabled');
    } else {
      console.log('  enable:', e.message);
    }
  }

  try {
    await cf('/email/routing/dns', { method: 'POST', body: '{}' });
    console.log('  MX + SPF DNS records created/updated');
  } catch (e) {
    console.log('  dns:', e.message);
    // fallback manual MX
    for (const mx of ['route1.mx.cloudflare.net', 'route2.mx.cloudflare.net', 'route3.mx.cloudflare.net']) {
      await upsertDns('MX', '@', mx, { priority: 10 });
    }
    await upsertDns('TXT', '@', 'v=spf1 include:_spf.mx.cloudflare.net ~all');
  }

  const rules = (await cf('/email/routing/rules')).result || [];
  const hasInfo = rules.some((r) =>
    r.matchers?.some((m) => m.field === 'to' && m.value === INFO_EMAIL)
  );

  if (hasInfo) {
    console.log(`  Rule exists: ${INFO_EMAIL} → ${FORWARD_TO}`);
    return;
  }

  await cf('/email/routing/rules', {
    method: 'POST',
    body: JSON.stringify({
      name: `Forward ${INFO_EMAIL}`,
      enabled: true,
      matchers: [{ type: 'literal', field: 'to', value: INFO_EMAIL }],
      actions: [{ type: 'forward', value: [FORWARD_TO] }],
    }),
  });
  console.log(`  Created rule: ${INFO_EMAIL} → ${FORWARD_TO}`);
}

async function main() {
  console.log(`Cloudflare setup: ${DOMAIN} (zone ${ZONE_ID})`);
  await setupDns();
  await setupEmailRouting();

  console.log('\n=== Final DNS ===');
  for (const r of await listDns()) {
    console.log(`  ${r.type.padEnd(4)} ${r.name} → ${r.content}${r.priority != null ? ` pri=${r.priority}` : ''}`);
  }
  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
