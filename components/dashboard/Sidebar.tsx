"use client";
// components/dashboard/Sidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", icon: "⚡", label: "Command Center" },
  { href: "/daily-queue", icon: "▶", label: "Daily Queue" },
  { href: "/jobs", icon: "◎", label: "Jobs Inbox" },
  { href: "/jobs/batch-ingest", icon: "📋", label: "Batch Ingest" },
  { href: "/applications", icon: "◈", label: "Applications" },
  { href: "/resumes", icon: "▤", label: "Resumes" },
  { href: "/outreach", icon: "⬡", label: "Outreach" },
  { href: "/analytics", icon: "▲", label: "Analytics" },
  { href: "/onboarding", icon: "◍", label: "Onboarding" },
  { href: "/profile-memory", icon: "◌", label: "Profile Memory" },
  { href: "/profile", icon: "◉", label: "Profile" },
];

const s = {
  sidebar: {
    width: 220,
    background: "var(--bg-surface)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column" as const,
    flexShrink: 0,
    height: "100vh",
  },
  logo: {
    padding: "20px 18px 16px",
    borderBottom: "1px solid var(--border)",
  },
  logoTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--accent)",
    letterSpacing: 3,
    textTransform: "uppercase" as const,
  },
  logoSub: {
    fontSize: 10,
    color: "var(--text-muted)",
    letterSpacing: 1,
    marginTop: 3,
  },
  nav: { flex: 1, padding: "8px 0", overflowY: "auto" as const },
  navLink: (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 18px",
    textDecoration: "none",
    fontSize: 12,
    letterSpacing: 0.5,
    color: active ? "var(--accent)" : "var(--text-secondary)",
    background: active ? "var(--accent-dim)" : "transparent",
    borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
    transition: "all 0.15s",
  }),
  navIcon: { fontSize: 14, width: 18, textAlign: "center" as const, flexShrink: 0 },
  footer: {
    padding: "12px 18px",
    borderTop: "1px solid var(--border)",
  },
  userEmail: { fontSize: 10, color: "var(--text-muted)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--green)",
    display: "inline-block",
    marginRight: 6,
  },
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div style={s.sidebar}>
      <div style={s.logo}>
        <div style={s.logoTitle}>Job Hunter</div>
        <div style={s.logoSub}>AI Operating System</div>
        <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ ...s.statusDot }} />
          <span style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: 1 }}>
            ACTIVE
          </span>
        </div>
      </div>

      <nav style={s.nav}>
        {NAV_ITEMS.map((item) => {
          // Exact match for root and items with sub-routes in nav, startsWith for others
          const hasSubRouteInNav = NAV_ITEMS.some((other) => other.href !== item.href && other.href.startsWith(item.href + "/"));
          const active = item.href === "/" ? pathname === "/" : hasSubRouteInNav ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={s.navLink(active)}>
              <span style={s.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={s.footer}>
        <div style={s.userEmail}>Single-user personal mode</div>
      </div>
    </div>
  );
}
