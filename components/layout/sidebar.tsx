"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Upload,
  MapPin,
  FileText,
  Settings,
  Shield,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/upload", label: "Upload List", icon: Upload },
  { href: "/dashboard/parcels", label: "Parcels", icon: MapPin },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div
      className="w-64 min-h-screen flex flex-col border-r"
      style={{ backgroundColor: "#0a0f1e", borderColor: "#1e293b" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-6 py-5 border-b"
        style={{ borderColor: "#1e293b" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#6366f1" }}
        >
          <Shield className="w-5 h-5 text-white" />
        </div>
        <Link href="/" className="font-bold text-slate-100 text-base tracking-tight">
          ParcelGuard <span style={{ color: "#6366f1" }}>AI</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                    isActive
                      ? "text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  )}
                  style={
                    isActive
                      ? { backgroundColor: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }
                      : {}
                  }
                >
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    style={isActive ? { color: "#6366f1" } : {}}
                  />
                  {item.label}
                  {isActive && (
                    <ChevronRight className="w-3 h-3 ml-auto opacity-60" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Disclaimer */}
      <div className="px-4 py-3 mx-4 mb-2 rounded-lg text-xs text-slate-500" style={{ backgroundColor: "rgba(30,41,59,0.4)" }}>
        Research support only. Not investment advice.
      </div>

      {/* User */}
      <div
        className="flex items-center gap-3 px-6 py-4 border-t"
        style={{ borderColor: "#1e293b" }}
      >
        <UserButton
          appearance={{
            elements: { avatarBox: "w-8 h-8" },
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 truncate">Signed in</p>
        </div>
      </div>
    </div>
  );
}
