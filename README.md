# ParcelGuard AI — MVP Application

Pre-bid risk intelligence for tax lien and tax deed investors.

> **Not legal, tax, title, financial, or investment advice.** Research support only.

---

## Tech Stack

- **Next.js 15** (App Router) + TypeScript (strict)
- **Tailwind CSS** + custom dark financial theme
- **Clerk** — Authentication
- **Neon PostgreSQL** + Prisma ORM
- **Stripe** — Billing
- **Anthropic Claude** — AI risk narratives and reports
- **Vercel Blob** — File storage
- **Resend** — Transactional email
- **Svix** — Webhook verification

---

## Pages Built

### Public
| Route | Description |
|---|---|
| `/` | Landing page — full copy from spec, dark premium theme |
| `/pricing` | 4 tiers with feature comparison table |
| `/sign-in` | Clerk SignIn (dark themed) |
| `/sign-up` | Clerk SignUp (dark themed) |

### Dashboard (Authenticated)
| Route | Description |
|---|---|
| `/dashboard` | Stats overview (parcels, avg risk, top opportunities) |
| `/dashboard/upload` | Drag-and-drop CSV/Excel/PDF + paste mode |
| `/dashboard/parcels` | Filterable, sortable parcel table with DealRisk badges |
| `/dashboard/parcels/[id]` | Full parcel: DealRisk gauge, SourceTrust, ConflictRadar, MaxBid, AI narrative, BidReady checklist |
| `/dashboard/reports` | Generated investor briefs with download |
| `/dashboard/settings` | Profile, subscription, platform info |

### API Routes
| Route | Method | Description |
|---|---|---|
| `/api/parcels/upload` | POST | CSV/Excel/paste upload + auto-scoring |
| `/api/parcels` | GET | List parcels with filter/sort |
| `/api/parcels/[id]` | GET | Single parcel with score, flags, reports |
| `/api/parcels/[id]/score` | POST | Claude AI scoring + narrative |
| `/api/parcels/[id]/report` | POST | Generate investor brief (text → Vercel Blob) |
| `/api/webhooks/stripe` | POST | Subscription lifecycle |
| `/api/webhooks/clerk` | POST | User sync |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | https://dashboard.clerk.com |
| `CLERK_SECRET_KEY` | https://dashboard.clerk.com |
| `DATABASE_URL` | https://neon.tech |
| `DIRECT_URL` | https://neon.tech |
| `STRIPE_SECRET_KEY` | https://dashboard.stripe.com |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | https://dashboard.stripe.com |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook dashboard |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com |
| `BLOB_READ_WRITE_TOKEN` | https://vercel.com/storage/blob |
| `RESEND_API_KEY` | https://resend.com |

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill in values
cp .env.example .env.local

# 3. Generate Prisma client
npm run db:generate

# 4. Push schema to Neon DB
npm run db:push

# 5. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database

The Prisma schema includes:

- **User** — Clerk-linked accounts, plan, AI credits
- **Parcel** — All canonical parcel fields (parcel_id, county, state, address, owner, financials, auction data)
- **ParcelScore** — DealRisk (0-100), SourceTrust (0-100), MaxBid, AI narrative, top risk drivers
- **ConflictFlag** — flagType, severity (info/warn/alert/stop), description, action
- **Report** — Vercel Blob URL, status, generated timestamp

---

## Scoring Logic

See `/lib/scoring.ts`:

- **DealRisk Score (0-100)**: Higher = more risky. Color bands: 0-30 green, 31-60 yellow, 61-80 orange, 81-100 red
- **SourceTrust Score (0-100)**: Higher = better data quality. Based on field presence, source multiplier, conflict penalty, freshness
- **MaxBid Guardrail**: `opening_bid × risk_multiplier`, capped at 70% of assessed value

Auto-scoring runs at upload for all parcels (no AI credits). On-demand Claude AI scoring adds narrative text.

---

## Upload Format

The CSV parser recognizes common column header variations:

```
parcel_id, situs_address, owner_name, assessed_value, tax_amount_owed,
opening_bid, auction_type, redemption_period, property_type, county, state, sale_date
```

Flexible synonyms (e.g. "APN", "Property Address", "Amount Due") are automatically mapped.

---

## Deploying to Vercel

```bash
# Push to GitHub, then connect in Vercel dashboard
# Or use Vercel CLI:
npx vercel

# Add all env vars in Vercel project settings
# Vercel will use vercel.json: runs db:generate + build
```

---

## Disclaimer

ParcelGuard AI provides research support and data analysis tools only. It does not provide legal, tax, title, financial, or investment advice. All information is for research purposes only. Verify all data with the applicable county, auction provider, title professional, and licensed attorney before bidding on any property.
