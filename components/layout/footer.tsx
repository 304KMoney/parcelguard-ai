import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="border-t mt-24"
      style={{ borderColor: "#1e293b", backgroundColor: "#0a0f1e" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#6366f1" }}
              >
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-100">
                ParcelGuard <span style={{ color: "#6366f1" }}>AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Pre-bid risk intelligence for tax lien and tax deed investors.
              Research support only.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Product
            </h4>
            <ul className="space-y-2">
              {["Features", "Pricing", "How It Works", "Investor Desk", "White Label"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href={`/#${item.toLowerCase().replace(/ /g, "-")}`}
                      className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Resources
            </h4>
            <ul className="space-y-2">
              {["Tax Sale Glossary", "Due Diligence Guide", "Blog"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Legal
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Terms of Service", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Disclaimer", href: "/disclaimer" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div
          className="rounded-lg p-4 mb-6 text-xs text-slate-500 leading-relaxed"
          style={{ backgroundColor: "rgba(30, 41, 59, 0.5)", borderColor: "#334155", border: "1px solid" }}
        >
          ParcelGuard AI provides research support and data analysis tools only. It does not provide
          legal, tax, title, financial, or investment advice. All information is for research purposes
          only. Verify all data with the applicable county, auction provider, title professional, and
          licensed attorney before bidding on any property. Use of this platform constitutes acceptance
          of our Terms of Service.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© 2026 ParcelGuard AI. All rights reserved.</p>
          <p>Not legal, tax, title, financial, or investment advice.</p>
        </div>
      </div>
    </footer>
  );
}
