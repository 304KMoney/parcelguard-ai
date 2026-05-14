import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: "#0f172a" }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ backgroundColor: "rgba(99,102,241,0.15)" }}
      >
        <Shield className="w-8 h-8" style={{ color: "#6366f1" }} />
      </div>

      <h1 className="text-6xl font-bold text-slate-200 mb-3">404</h1>
      <p className="text-xl text-slate-400 mb-2">Page not found</p>
      <p className="text-slate-500 mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="flex gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white transition-colors"
          style={{ backgroundColor: "#6366f1" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-colors border"
          style={{ borderColor: "#334155", color: "#94a3b8" }}
        >
          Dashboard
        </Link>
      </div>

      <p className="mt-8 text-xs text-slate-600">
        ParcelGuard AI — Research support only. Not investment advice.
      </p>
    </div>
  );
}
