import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Search,
  FileText,
  Upload,
  Lock,
  Eye,
  ChevronDown,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Upload,
    name: "ListClean AI",
    tag: "Upload Engine",
    description:
      "Accepts CSV, Excel, PDF, and pasted tables. Extracts and normalizes parcel data. Never guesses on missing fields — marks them clearly so you know what to verify.",
  },
  {
    icon: Eye,
    name: "SourceTrust Score",
    tag: "Data Confidence Engine",
    description:
      "Every parcel and every data field gets a confidence score from 0–100. See the source chain for every data point. Know whether you're looking at verified assessor data or one line from a questionable export.",
  },
  {
    icon: AlertTriangle,
    name: "ConflictRadar",
    tag: "Conflict Detection Engine",
    description:
      "Automatically detects mismatches between sources: address conflicts, parcel ID discrepancies, assessed value gaps, deceased owner signals, and more. Every conflict explained in plain English.",
  },
  {
    icon: BarChart3,
    name: "DealRisk Score",
    tag: "Pre-Bid Risk Intelligence",
    description:
      "Six-category risk score across data risk, property risk, legal risk, auction risk, liquidity risk, and valuation risk. Color-labeled: green, yellow, orange, red.",
  },
  {
    icon: Shield,
    name: "MaxBid Guardrail",
    tag: "Conservative Bid Ceiling",
    description:
      "Not a return calculator. A capital-protection guardrail. Enter your assumptions and get a conservative max bid range you should not exceed.",
  },
  {
    icon: FileText,
    name: "Investor Brief",
    tag: "Professional Due Diligence Report",
    description:
      "Export a polished investor-grade report: county overview, top opportunities, avoid list, risk summaries, max bid guardrails, and verification checklists.",
  },
];

const problemCards = [
  {
    icon: "🔴",
    title: "Conflicting Data",
    description:
      "The address on the sale list doesn't match the county assessor record. The parcel ID maps to a different property. You don't know until it's too late.",
  },
  {
    icon: "🔴",
    title: "Hidden Risks",
    description:
      "Vacant land with no road access. A property in a flood zone. An estate with four heirs and no clear chain of title. Senior liens that survive the tax sale.",
  },
  {
    icon: "🔴",
    title: "No Confidence Layer",
    description:
      "Every property looks like a number on a spreadsheet. There's no way to know which data points are solid and which ones are guesses.",
  },
];

const steps = [
  {
    step: "01",
    title: "Upload",
    description:
      "Drop in your county tax sale list — CSV, Excel, PDF, or paste directly. Any format. Any county.",
  },
  {
    step: "02",
    title: "Clean + Normalize",
    description:
      "ListClean AI extracts and normalizes every parcel. Missing fields are flagged, not guessed. You see exactly what's there and what isn't.",
  },
  {
    step: "03",
    title: "Score + Flag",
    description:
      "SourceTrust Score rates data confidence. DealRisk Score rates investment risk. ConflictRadar flags mismatches. MaxBid Guardrail sets your ceiling.",
  },
  {
    step: "04",
    title: "Report",
    description:
      "Get a ranked investor brief: top opportunities, avoid list, verification checklist, and max-bid guardrails — ready before auction day.",
  },
];

const faqs = [
  {
    q: "Does ParcelGuard AI access county records automatically?",
    a: "In the current version, ParcelGuard AI analyzes and scores the data you upload. We provide source links where available, but we do not yet automatically pull live county assessor or recorder data. That's on the roadmap.",
  },
  {
    q: "Is this legal, title, or investment advice?",
    a: "No. ParcelGuard AI provides research support and data analysis only. It is not legal, tax, title, financial, or investment advice. All data must be verified with appropriate professionals before bidding.",
  },
  {
    q: "What file types can I upload?",
    a: "CSV, Excel (.xlsx, .xls), PDF, and direct paste. We're adding more format support continuously.",
  },
  {
    q: "How accurate is the risk scoring?",
    a: "DealRisk Score is based on the data available in your upload plus any source conflicts detected. The more complete the source data, the more accurate the score. Missing data increases risk ratings — that's intentional, because missing information is itself a risk.",
  },
  {
    q: "Does ParcelGuard AI work for both tax lien and tax deed states?",
    a: "Yes. The platform supports lien, deed, and redeemable deed sale types. Risk scoring and verification checklists adapt based on auction type.",
  },
];

const comparisonRows = [
  { feature: "Source confidence scoring", others: false, us: true },
  { feature: "Conflict detection", others: false, us: true },
  { feature: "Pre-bid risk scoring", others: "Partial", us: "Full" },
  { feature: "Conservative max-bid guardrail", others: false, us: true },
  { feature: "Verification checklist", others: false, us: true },
  { feature: "Investor-grade due diligence reports", others: false, us: true },
  { feature: "Designed for pre-bid decisions", others: false, us: true },
];

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0f172a" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 50% -20%, rgba(99,102,241,0.15) 0%, transparent 60%), #0f172a",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold mb-8"
            style={{ borderColor: "rgba(99,102,241,0.3)", backgroundColor: "rgba(99,102,241,0.08)", color: "#818cf8" }}>
            <Shield className="w-3.5 h-3.5" />
            Pre-bid risk intelligence for tax sale investors
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-100 mb-6 leading-tight">
            Tax sale research
            <br />
            <span style={{
              background: "linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              before you risk capital.
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            ParcelGuard AI helps tax lien and tax deed investors analyze county sale lists,
            verify source confidence, flag hidden risks, and set conservative max-bid guardrails
            — before auction day.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/sign-up">
              <Button size="xl" className="shadow-2xl shadow-indigo-900/40">
                Analyze My Tax Sale List <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="xl" variant="outline">
                See How It Works
              </Button>
            </Link>
          </div>

          <p className="text-sm text-slate-500">
            Used by serious investors. No hype. No guaranteed profits. Research support only.
          </p>

          {/* Preview card */}
          <div className="mt-16 max-w-4xl mx-auto rounded-2xl overflow-hidden border shadow-2xl"
            style={{ borderColor: "#334155", backgroundColor: "#1e293b" }}>
            <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: "#334155" }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs text-slate-500 font-mono">ParcelGuard AI — BidReady Dashboard</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Parcels Analyzed", value: "247", sub: "from upload" },
                  { label: "Avg Risk Score", value: "52", sub: "moderate risk" },
                  { label: "Top Opportunities", value: "18", sub: "low risk parcels" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg p-4" style={{ backgroundColor: "#0f172a" }}>
                    <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
                    <p className="text-xs text-slate-400">{stat.sub}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { addr: "123 Oak St, Baltimore, MD", risk: 22, trust: 85, bid: "$4,200", band: "green" },
                  { addr: "456 Elm Ave, Rockville, MD", risk: 45, trust: 72, bid: "$8,500", band: "yellow" },
                  { addr: "789 Pine Rd, Frederick, MD", risk: 71, trust: 58, bid: "$2,100", band: "orange" },
                ].map((row) => (
                  <div key={row.addr} className="flex items-center justify-between rounded-lg px-4 py-3 text-sm"
                    style={{ backgroundColor: "#0f172a" }}>
                    <span className="text-slate-300 font-mono text-xs">{row.addr}</span>
                    <div className="flex items-center gap-6">
                      <span className="text-slate-400 text-xs">Trust: <span className="text-slate-200">{row.trust}</span></span>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border"
                        style={{
                          backgroundColor: row.band === "green" ? "rgba(34,197,94,0.12)" : row.band === "yellow" ? "rgba(234,179,8,0.12)" : "rgba(249,115,22,0.12)",
                          color: row.band === "green" ? "#22c55e" : row.band === "yellow" ? "#eab308" : "#f97316",
                          borderColor: row.band === "green" ? "rgba(34,197,94,0.3)" : row.band === "yellow" ? "rgba(234,179,8,0.3)" : "rgba(249,115,22,0.3)",
                        }}
                      >
                        Risk {row.risk}
                      </span>
                      <span className="text-slate-300 text-xs font-mono">{row.bid}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <p className="section-label mb-3">THE PROBLEM</p>
          <h2 className="text-4xl font-bold text-slate-100 mb-4">
            County tax sale lists are messy.
            <br />
            <span className="text-slate-400">Bad parcels can look profitable.</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Tax sale lists come from dozens of sources — county treasurers, auction platforms,
            third-party aggregators. The data is inconsistent. Addresses conflict. Assessed values
            are stale. Most investors don&apos;t find out about the problems until after they&apos;ve bid.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problemCards.map((card) => (
            <div key={card.title} className="card hover:border-red-500/30 transition-colors">
              <div className="text-2xl mb-4">{card.icon}</div>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">{card.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Solution / How It Works ── */}
      <section
        id="how-it-works"
        className="py-24"
        style={{ backgroundColor: "rgba(30, 41, 59, 0.3)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label mb-3">THE SOLUTION</p>
            <h2 className="text-4xl font-bold text-slate-100 mb-4">
              Upload a sale list. Get risk scores,
              <br />red flags, and a bid-ready report.
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              ParcelGuard AI is the pre-bid risk intelligence layer that sits between your county
              tax sale list and your bidding decision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px z-10"
                    style={{ backgroundColor: "rgba(99,102,241,0.2)" }} />
                )}
                <div className="card text-center">
                  <div className="text-3xl font-bold mb-4" style={{ color: "rgba(99,102,241,0.4)" }}>
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <p className="section-label mb-3">FEATURES</p>
          <h2 className="text-4xl font-bold text-slate-100">
            Every tool serious tax sale investors
            <br />need before they bid.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.name}
                className="card hover:border-indigo-500/30 transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(99,102,241,0.15)" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "#6366f1" }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100">{feature.name}</h3>
                    <p className="text-xs" style={{ color: "#f59e0b" }}>{feature.tag}</p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Comparison ── */}
      <section
        className="py-24"
        style={{ backgroundColor: "rgba(30, 41, 59, 0.3)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-100 mb-4">
              Not an auction platform. Not a property database.
              <br />
              <span className="text-slate-400">The research layer that goes before both.</span>
            </h2>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: "#334155" }}>
                  <th className="text-left py-4 px-6 text-sm text-slate-400 font-medium">Feature</th>
                  <th className="py-4 px-6 text-sm text-slate-400 font-medium text-center">Other Tools</th>
                  <th className="py-4 px-6 text-sm font-medium text-center" style={{ color: "#6366f1" }}>ParcelGuard AI</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.feature}
                    className={i % 2 === 0 ? "" : ""}
                    style={{ backgroundColor: i % 2 === 1 ? "rgba(15,23,42,0.3)" : "transparent" }}
                  >
                    <td className="py-3 px-6 text-sm text-slate-300">{row.feature}</td>
                    <td className="py-3 px-6 text-center">
                      {row.others === false ? (
                        <span className="text-red-400 text-sm">✗</span>
                      ) : (
                        <span className="text-yellow-400 text-xs">{row.others}</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {row.us === true ? (
                        <span className="text-green-400 text-sm">✓</span>
                      ) : (
                        <span className="text-green-400 text-xs font-semibold">{row.us}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Investor Desk ── */}
      <section id="investor-desk" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="rounded-2xl border p-10 md:p-16"
          style={{
            background: "radial-gradient(ellipse at top left, rgba(99,102,241,0.12) 0%, transparent 60%), #1e293b",
            borderColor: "#334155",
          }}>
          <div className="max-w-2xl">
            <p className="section-label mb-4">INVESTOR DESK</p>
            <h2 className="text-4xl font-bold text-slate-100 mb-6">
              Need human eyes on your deals?
              <br />That&apos;s what Investor Desk is for.
            </h2>
            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
              AI gets you 80% of the way. Investor Desk gets you the rest. Our team reviews your
              uploaded list, flags the highest-risk properties manually, confirms conflict findings,
              and delivers a pre-bid briefing packet before auction day.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Monthly pre-auction county analysis",
                "Manual risk review before auction day",
                "Custom due diligence workflow",
                "Priority turnaround",
                "Exportable investor packet",
                "Human-reviewed Investor Brief reports",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#22c55e" }} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4">
              <Button size="lg">Request Investor Desk Access →</Button>
              <p className="text-xs text-slate-500">Limited availability. Not investment advice.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section
        className="py-24"
        style={{ backgroundColor: "rgba(30, 41, 59, 0.3)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label mb-3">PRICING</p>
            <h2 className="text-4xl font-bold text-slate-100 mb-4">
              Serious tools for serious investors.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                name: "Starter Research",
                price: "$97",
                period: "/month",
                annual: "$930/year",
                highlight: false,
                features: [
                  "50 parcels/month",
                  "ListClean AI upload",
                  "Basic SourceTrust Score",
                  "Basic DealRisk Score",
                  "CSV export",
                  "Standard Investor Brief",
                  "Email support",
                ],
                cta: "Start for $97/month",
                href: "/sign-up?plan=starter",
              },
              {
                name: "Pro Investor",
                price: "$297",
                period: "/month",
                annual: "$2,851/year",
                highlight: true,
                badge: "MOST POPULAR",
                features: [
                  "500 parcels/month",
                  "Full ListClean AI",
                  "Full SourceTrust Score",
                  "Full DealRisk Score",
                  "ConflictRadar",
                  "MaxBid Guardrail",
                  "BidReady Dashboard",
                  "Full Investor Brief (PDF)",
                  "Verification Checklist",
                ],
                cta: "Start for $297/month",
                href: "/sign-up?plan=pro",
              },
              {
                name: "Investor Team",
                price: "$997",
                period: "/month",
                annual: "$9,571/year",
                highlight: false,
                features: [
                  "2,500 parcels/month",
                  "Everything in Pro",
                  "Up to 5 team members",
                  "Multi-county comparison",
                  "Deal pipeline (Kanban)",
                  "Advanced export",
                  "Team notes + assignments",
                  "Priority support",
                ],
                cta: "Start for $997/month",
                href: "/sign-up?plan=team",
              },
              {
                name: "Investor Desk",
                price: "$2,500",
                period: "/month",
                annual: "Human review included",
                highlight: false,
                features: [
                  "5,000 parcels/month",
                  "Everything in Team",
                  "Monthly county analysis",
                  "Human review",
                  "Manual verification",
                  "Custom workflow",
                  "Dedicated account manager",
                ],
                cta: "Apply for Investor Desk →",
                href: "/pricing#desk",
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className="card flex flex-col relative"
                style={tier.highlight ? {
                  borderColor: "#6366f1",
                  boxShadow: "0 0 40px rgba(99,102,241,0.15)",
                } : {}}
              >
                {tier.highlight && tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full px-3 py-1 text-xs font-bold text-white"
                      style={{ backgroundColor: "#6366f1" }}>
                      {tier.badge}
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-100 mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-100">{tier.price}</span>
                    <span className="text-slate-400">{tier.period}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{tier.annual}</p>
                </div>

                <ul className="flex-1 space-y-2.5 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-400" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href={tier.href}>
                  <Button
                    className="w-full"
                    variant={tier.highlight ? "default" : "outline"}
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-slate-100">
            Built for investors who protect capital first.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              icon: Lock,
              title: "Capital-Protection Design",
              description:
                "Every feature is designed to prevent bad bids, not encourage reckless ones. The platform shows uncertainty instead of hiding it.",
            },
            {
              icon: FileText,
              title: "Research Support Only",
              description:
                "ParcelGuard AI does not provide legal, tax, title, financial, or investment advice. Every output includes clear sourcing and methodology.",
            },
            {
              icon: Search,
              title: "Source Transparency",
              description:
                "Every data point shows where it came from and how old it is. You always know whether you're looking at a verified county record or a single sale list entry.",
            },
            {
              icon: Eye,
              title: "Missing Data is Visible",
              description:
                "Bad tools hide what they don't know. ParcelGuard AI shows every missing field, every unverifiable data point, and every conflict.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="card">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: "rgba(245, 158, 11, 0.12)" }}>
                  <Icon className="w-5 h-5" style={{ color: "#f59e0b" }} />
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        className="py-24"
        style={{ backgroundColor: "rgba(30, 41, 59, 0.3)" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label mb-3">FAQ</p>
            <h2 className="text-4xl font-bold text-slate-100">Common questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="card">
                <div className="flex items-start gap-3">
                  <ChevronDown className="w-5 h-5 mt-0.5 flex-shrink-0 text-indigo-400" />
                  <div>
                    <h4 className="font-semibold text-slate-100 mb-2">{faq.q}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-5xl font-bold text-slate-100 mb-6">
          Know what can go wrong
          <br />before you bid.
        </h2>
        <p className="text-xl text-slate-400 mb-10 leading-relaxed">
          Upload your next county tax sale list and get ranked risk scores, source confidence
          ratings, conflict flags, max-bid guardrails, and a professional investor brief —
          all before auction day.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link href="/sign-up">
            <Button size="xl" className="shadow-2xl shadow-indigo-900/40">
              Analyze My Tax Sale List <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="#investor-desk">
            <Button size="xl" variant="outline">
              Request Investor Desk Access
            </Button>
          </Link>
        </div>

        <p className="text-sm text-slate-500">
          No hype. No guaranteed profits. Research support only. Not legal, tax, title, or investment advice.
        </p>
      </section>

      <Footer />
    </div>
  );
}
