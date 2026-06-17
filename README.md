# Greek Invest

Independent Singapore property research — guides, new launch reviews, ABSD explainers, and district yield data.

**Domain:** https://greek-invest.com

## Stack

Astro 6 · MDX · Vercel · Telegram lead API

## Local

```bash
npm install
cp .env.example .env   # TG_TOKEN, TG_CHAT_ID
npm run dev
```

## Deploy

```bash
npm run validate:content
npm run build
git push origin main   # Vercel auto-deploy
npm run healthcheck
```

## Env (Vercel)

- `TG_TOKEN` — Telegram bot token
- `TG_CHAT_ID` — lead destination chat (default MORE Group: 190070714)

Never commit `.env` or `scripts/google-indexing-key.json`.
