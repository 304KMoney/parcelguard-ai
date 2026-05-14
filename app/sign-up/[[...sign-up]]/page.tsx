import { SignUp } from "@clerk/nextjs";
import { Shield } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#0f172a" }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "#6366f1" }}
        >
          <Shield className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-slate-100 text-xl">
          ParcelGuard <span style={{ color: "#6366f1" }}>AI</span>
        </span>
      </Link>

      {/* Clerk Sign Up */}
      <SignUp
        appearance={{
          variables: {
            colorBackground: "#1e293b",
            colorText: "#f1f5f9",
            colorTextSecondary: "#94a3b8",
            colorInputBackground: "#0f172a",
            colorInputText: "#f1f5f9",
            colorPrimary: "#6366f1",
            borderRadius: "0.5rem",
            fontFamily: "Inter, system-ui, sans-serif",
          },
          elements: {
            card: "shadow-2xl border border-slate-700",
            formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 transition-colors",
            footerActionLink: "text-indigo-400 hover:text-indigo-300",
          },
        }}
      />

      <p className="mt-6 text-xs text-slate-500 text-center max-w-sm">
        By signing up, you agree to our Terms of Service. Research support only. Not legal, tax,
        title, financial, or investment advice.
      </p>
    </div>
  );
}
