import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Settings, User, Shield, CreditCard } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [clerkUser, dbUser] = await Promise.all([
    currentUser(),
    prisma.user.findUnique({ where: { clerkId: userId } }),
  ]);

  const planLimits = {
    starter: { parcels: 50, label: "Starter Research" },
    pro: { parcels: 500, label: "Pro Investor" },
    team: { parcels: 2500, label: "Investor Team" },
    desk: { parcels: 5000, label: "Investor Desk" },
  };

  const plan = (dbUser?.plan ?? "starter") as keyof typeof planLimits;
  const planInfo = planLimits[plan];

  const parcelCount = dbUser
    ? await prisma.parcel.count({ where: { userId: dbUser.id } })
    : 0;

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-1 flex items-center gap-2">
          <Settings className="w-7 h-7 text-indigo-400" />
          Settings
        </h1>
        <p className="text-slate-400">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" />
          Profile
        </h2>

        <div className="flex items-center gap-5 mb-6">
          {clerkUser?.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={clerkUser.imageUrl}
              alt="Avatar"
              className="w-16 h-16 rounded-full border-2"
              style={{ borderColor: "#6366f1" }}
            />
          )}
          <div>
            <p className="text-lg font-semibold text-slate-100">
              {clerkUser?.fullName ?? "Not set"}
            </p>
            <p className="text-sm text-slate-400">
              {clerkUser?.emailAddresses[0]?.emailAddress ?? "No email"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Full Name", value: clerkUser?.fullName ?? "—" },
            { label: "Email", value: clerkUser?.emailAddresses[0]?.emailAddress ?? "—" },
            { label: "Account ID", value: dbUser ? dbUser.id.slice(0, 8) + "..." : "—" },
            { label: "Member Since", value: dbUser ? new Date(dbUser.createdAt).toLocaleDateString() : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg p-3" style={{ backgroundColor: "rgba(15,23,42,0.4)" }}>
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="text-sm text-slate-200">{value}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500 mt-4">
          To update your name, email, or password, use the Clerk user button in the sidebar.
        </p>
      </div>

      {/* Plan */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-400" />
          Subscription
        </h2>

        <div
          className="rounded-lg p-5 border mb-5"
          style={{ backgroundColor: "rgba(99,102,241,0.05)", borderColor: "rgba(99,102,241,0.2)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-slate-100 text-lg">{planInfo.label}</p>
              <p className="text-sm text-slate-400 capitalize">{plan} plan</p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-sm font-semibold capitalize"
              style={{
                backgroundColor: "rgba(99,102,241,0.15)",
                color: "#818cf8",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Parcels Used</p>
              <p className="text-xl font-bold text-slate-100">
                {parcelCount} / {planInfo.parcels}
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-700">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (parcelCount / planInfo.parcels) * 100)}%`,
                    backgroundColor: "#6366f1",
                  }}
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">AI Credits Used</p>
              <p className="text-xl font-bold text-slate-100">
                {dbUser?.aiCreditsUsed ?? 0} / {dbUser?.aiCreditsLimit ?? 50}
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-700">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, ((dbUser?.aiCreditsUsed ?? 0) / (dbUser?.aiCreditsLimit ?? 50)) * 100)}%`,
                    backgroundColor: "#f59e0b",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href="/pricing"
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: "#6366f1" }}
          >
            Upgrade Plan
          </a>
          <p className="text-xs text-slate-500 self-center">
            Manage billing via Stripe Customer Portal
          </p>
        </div>
      </div>

      {/* API Info */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          Platform Info
        </h2>

        <div className="space-y-3">
          {[
            { label: "Platform", value: "ParcelGuard AI" },
            { label: "Data Purpose", value: "Research support only" },
            { label: "AI Engine", value: "Anthropic Claude" },
            { label: "Data Storage", value: "Encrypted at rest (Neon PostgreSQL)" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex justify-between items-center py-2 border-b"
              style={{ borderColor: "#1e293b" }}
            >
              <span className="text-sm text-slate-400">{label}</span>
              <span className="text-sm text-slate-200">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div
        className="rounded-xl border p-5 text-xs text-slate-500 leading-relaxed"
        style={{ backgroundColor: "rgba(15,23,42,0.4)", borderColor: "#1e293b" }}
      >
        <p className="font-semibold text-slate-400 mb-2">Important Disclaimer</p>
        <p>
          ParcelGuard AI provides research support and data analysis tools only. It does not provide
          legal, tax, title, financial, or investment advice. All information generated by this
          platform is for informational and research purposes only. You are solely responsible for
          verifying all information with the applicable county, auction provider, title professional,
          licensed attorney, and other qualified professionals before bidding on any property.
        </p>
      </div>
    </div>
  );
}
