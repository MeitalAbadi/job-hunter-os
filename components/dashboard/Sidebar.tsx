"use client";
// components/dashboard/Sidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", icon: "◉", label: "Command Center" },
  { href: "/jobs", icon: "◎", label: "Jobs Inbox" },
  { href: "/applications", icon: "◈", label: "Pipeline" },
  { href: "/resumes", icon: "▤", label: "Resumes" },
  { href: "/outreach", icon: "⬡", label: "Outreach" },
  { href: "/analytics", icon: "▲", label: "Analytics" },
  { href: "/onboarding", icon: "◍", label: "Onboarding" },
  { href: "/profile-memory", icon: "◌", label: "Profile Memory" },
  { href: "/profile", icon: "◉", label: "Profile" },
];

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar-root">
      <div className="sidebar-brand">
        <div className="sidebar-brand-title">Career Orbit</div>
        <div className="sidebar-brand-sub">AI Job Search Operating System</div>
        <div className="sidebar-brand-status">
          <span className="sidebar-status-dot" />
          <span>Live Session</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cx("sidebar-link", active && "active")}>
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-pill">Single-user focus mode</div>
      </div>
    </aside>
  );
}
