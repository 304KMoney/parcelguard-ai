import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Starter Research",
    price: 97,
    annual: 930,
    annualSave: 234,
    description: "For investors getting started with systematic due diligence.",
    highlight: false,
    features: [
      "Up to 50 parcels/month",
      "ListClean AI upload & normalization",
      "Basic SourceTrust Score",
      "Basic DealRisk Score",
      "CSV export",
      "Standard Investor Brief (web view)",
      "Email support",
    ],
    excluded: [
      "ConflictRadar",
      "MaxBid Guardrail",
      "Verification Checklist",
      "PDF export",
    ],
    cta: "Start for $97/month",
    href: "/sign-up?plan=starter",
  },
  {
    name: "Pro Investor",
    price: 297,
    annual: 2851,
    annualSave: 713,
    description: "For active investors who bid multiple properties per county sale.",
    highlight: true,
    badge: "MOST POPULAR",
    features: [
      "Up to 500 parcels/month",
      "Full ListClean AI",
      "Full SourceTrust Score (field-level)",
      "Full DealRisk Score (6 categories)",
      "ConflictRadar (all conflict types)",
      "MaxBid Guardrail",
      "BidReady Dashboard",
      "Full Investor Brief (PDF + web)",
      "Verification Checklist",
      "Watchlist",
      "Priority email support",
    ],
    excluded: [],
    cta: "Start for $297/month",
    href: "/sign-up?plan=pro",
  },
  {
    name: "Investor Team",
    price: 997,
    annual: 9571,
    annualSave: 2393,
    description: "For small investment teams analyzing multiple counties.",
    highlight: false,
    features: [
      "Up to 2,500 parcels/month",
      "Everything in Pro",
      "Up to 5 team members",
      "Multi-county comparison",
      "Deal pipeline (Kanban)",
      "Advanced export (CSV + PDF batch)",
      "Team notes + assignments",
      "Priority support + onboarding call",
    ],
    excluded: [],
    cta: "Start for $997/month",
    href: "/sign-up?plan=team",
  },
  {
    name: "Investor Desk",
    price: 2500,
    annual: null,
    annualSave: null,
    description: "For serious investors who want human review.",
    highlight: false,
    features: [
      "Up to 5,000 parcels/month",
      "Everything in Investor Team",
      "Monthly pre-auction county analysis",
      "Human review of top risk findings",
      "Manual verification support",
      "Custom due diligence workflow",
      "Exportable investor packet",
      "Dedicated account manager",
    ],
    excluded: [],
    cta: "Apply for Investor Desk →",
    href: "/sign-up?plan=desk",
  },
];

const comparisons = [
  { feature: "Parcels / month", starter: "50", pro: "500", team: "2,500", desk: "5,000" },
  { feature: "ListClean AI upload", starter: "Basic", pro: "Full", team: "Full", desk: "Full" },
  { feature: "SourceTrust Score", starter: "Basic", pro: "Field-level", team: "Field-level", desk: "Field-level" },
  { feature: "DealRisk Score", starter: "Basic", pro: "6 categories", team: "6 categories", desk: "6 categories" },
  { feature: "ConflictRadar", starter: "✗", pro: "✓", team: "✓", desk: "✓" },
  { feature: "MaxBid Guardrail", starter: "✗", pro: "✓", team: "✓", desk: "✓" },
  { feature: "Investor Brief (PDF)", starter: "✗", pro: "✓", team: "✓", desk: "✓" },
  { feature: "Verification Checklist", starter: "✗", pro: "✓", team: "✓", desk: "✓" },
  { feature: "Team members", starter: "1", pro: "1", team: "Up to 5", desk: "Unlimited" },
  { feature: "Human review", starter: "✗", pro: "✗", team: "✗", desk: "✓" },
  { feature: "Custom workflow", starter: "✗", pro: "✗", team: "✗", desk: "✓" },
  { feature: "Account manager", starter: "✗", pro: "✗", team: "✗", desk: "✓" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0f172a" }}>
      <Navbar />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <p className="section-label mb-4">PRICING</p>
        <h1 className="text-5xl font-bold text-slate-100 mb-4">
          Serious tools for serious investors.
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Choose the plan that fits your investing volume. All plans include a 14-day free trial.
          Cancel anytime.
        </p>
      </section>

      {/* Pricing cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="card flex flex-col relative"
              style={
                tier.highlight
                  ? {
                      borderColor: "#6366f1",
                      boxShadow: "0 0 60px rgba(99,102,241,0.15)",
                    }
                  : {}
              }
            >
              {tier.highlight && tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span
                    className="rounded-full px-4 py-1 text-xs font-bold text-white"
                    style={{ backgroundColor: "#6366f1" }}
                  >
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-100 mb-1">{tier.name}</h2>
                <p className="text-sm text-slate-400 mb-4">{tier.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-100">${tier.price}</span>
                  <span className="text-slate-400">/month</span>
                </div>
                {tier.annual && tier.annualSave ? (
                  <p className="text-xs text-slate-500 mt-1">
                    ${tier.annual.toLocaleString()}/year — save ${tier.annualSave.toLocaleString()}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">Contact us for billing options</p>
                )}
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-2.5 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-400" />
                    {f}
                  </li>
                ))}
                {tier.excluded.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-4 h-4 mt-0.5 flex-shrink-0 text-center text-red-900">✗</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={tier.href}>
                <Button
                  className="w-full"
                  variant={tier.highlight ? "default" : "outline"}
                  size="lg"
                >
                  {tier.cta}
                  {!tier.name.includes("Desk") && (
                    <ArrowRight className="ml-2 w-4 h-4" />
                  )}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* White Label */}
        <div
          className="mt-6 card"
          style={{ borderColor: "rgba(245, 158, 11, 0.3)" }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-slate-100">White Label / Educator</h3>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.12)",
                    color: "#f59e0b",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                  }}
                >
                  Custom
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-2">
                $5,000 setup + $997/month — For coaches and educators who want to offer their
                students a premium research tool.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                {[
                  "Branded student portal",
                  "Coach dashboard",
                  "Student upload limits",
                  "Report templates",
                  "Revenue share available",
                ].map((f) => (
                  <span key={f} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <Button variant="amber" size="lg" className="flex-shrink-0">
              Schedule Educator Demo →
            </Button>
          </div>
        </div>

        {/* One-time reports */}
        <div className="mt-6 card">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">
                Enterprise / Custom County Report
              </h3>
              <p className="text-slate-400 text-sm mb-2">
                Not ready for a subscription? Start with a one-time county report.
              </p>
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-slate-400">Beta report:</span>{" "}
                  <span className="text-slate-100 font-semibold">$197</span>
                </div>
                <div>
                  <span className="text-slate-400">Standard report:</span>{" "}
                  <span className="text-slate-100 font-semibold">$497</span>
                </div>
                <div>
                  <span className="text-slate-400">Premium with manual review:</span>{" "}
                  <span className="text-slate-100 font-semibold">$997</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="lg" className="flex-shrink-0">
              Order a County Report →
            </Button>
          </div>
        </div>
      </section>

      {/* Feature comparison */}
      <section
        className="py-24"
        style={{ backgroundColor: "rgba(30, 41, 59, 0.3)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-100 mb-10 text-center">
            Full feature comparison
          </h2>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b" style={{ borderColor: "#334155" }}>
                  <th className="text-left py-4 px-6 text-sm text-slate-400 font-medium w-1/3">
                    Feature
                  </th>
                  <th className="py-4 px-4 text-sm text-slate-400 font-medium text-center">
                    Starter
                  </th>
                  <th
                    className="py-4 px-4 text-sm font-medium text-center"
                    style={{ color: "#6366f1" }}
                  >
                    Pro
                  </th>
                  <th className="py-4 px-4 text-sm text-slate-400 font-medium text-center">
                    Team
                  </th>
                  <th className="py-4 px-4 text-sm text-slate-400 font-medium text-center">
                    Desk
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <tr
                    key={row.feature}
                    style={{
                      backgroundColor: i % 2 === 1 ? "rgba(15,23,42,0.3)" : "transparent",
                    }}
                  >
                    <td className="py-3 px-6 text-sm text-slate-300">{row.feature}</td>
                    {[row.starter, row.pro, row.team, row.desk].map((val, vi) => (
                      <td key={vi} className="py-3 px-4 text-center text-sm">
                        {val === "✓" ? (
                          <span className="text-green-400">✓</span>
                        ) : val === "✗" ? (
                          <span className="text-slate-600">✗</span>
                        ) : (
                          <span
                            className={
                              vi === 1 ? "text-indigo-300" : "text-slate-300"
                            }
                          >
                            {val}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div
          className="rounded-xl border p-6 text-xs text-slate-500 leading-relaxed"
          style={{
            backgroundColor: "rgba(30, 41, 59, 0.5)",
            borderColor: "#334155",
          }}
        >
          ParcelGuard AI provides research support and data analysis tools only. It does not
          provide legal, tax, title, financial, or investment advice. All information is for
          research purposes only. Verify all data with the applicable county, auction provider,
          title professional, and licensed attorney before bidding on any property.
        </div>
      </section>

      <Footer />
    </div>
  );
}
