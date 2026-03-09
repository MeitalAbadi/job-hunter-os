// components/ui/index.tsx
// Reusable UI primitives — no external component library dependency

import React from "react";

// ─── Score Badge ──────────────────────────────────────────────────────────────

const SCORE_COLORS: Record<string, string> = {
  STRONG_APPLY: "#22c55e",
  APPLY: "#00d4ff",
  STRETCH_APPLY: "#f59e0b",
  LOW_PRIORITY: "#6b7280",
  SKIP: "#ef4444",
};

const SCORE_LABELS: Record<string, string> = {
  STRONG_APPLY: "Strong Apply",
  APPLY: "Apply",
  STRETCH_APPLY: "Stretch",
  LOW_PRIORITY: "Low Priority",
  SKIP: "Skip",
};

export function ScoreBadge({ score, recommendation }: { score: number; recommendation: string }) {
  const col = SCORE_COLORS[recommendation] || "#6b7280";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 11,
      fontWeight: 600,
      color: col,
      background: col + "18",
      border: `1px solid ${col}33`,
      borderRadius: 4,
      padding: "3px 8px",
      fontFamily: "var(--font-mono)",
      letterSpacing: 0.5,
    }}>
      <span style={{ fontSize: 15, lineHeight: 1 }}>{Math.round(score)}</span>
      <span style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", opacity: 0.85 }}>
        {SCORE_LABELS[recommendation] || recommendation}
      </span>
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  WISHLIST:             { color: "#6b7280", label: "Wishlist" },
  APPLIED:              { color: "#00d4ff", label: "Applied" },
  RECRUITER_SCREEN:     { color: "#8b5cf6", label: "Recruiter Screen" },
  TECHNICAL_INTERVIEW:  { color: "#f59e0b", label: "Technical Interview" },
  CASE_STUDY:           { color: "#f97316", label: "Case Study" },
  FINAL_INTERVIEW:      { color: "#06b6d4", label: "Final Interview" },
  OFFER:                { color: "#22c55e", label: "Offer 🎉" },
  ACCEPTED:             { color: "#16a34a", label: "Accepted ✓" },
  REJECTED:             { color: "#ef4444", label: "Rejected" },
  WITHDRAWN:            { color: "#6b7280", label: "Withdrawn" },
  ON_HOLD:              { color: "#eab308", label: "On Hold" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || { color: "#6b7280", label: status };
  return (
    <span style={{
      display: "inline-block",
      fontSize: 10,
      fontWeight: 600,
      color: s.color,
      background: s.color + "15",
      border: `1px solid ${s.color}30`,
      borderRadius: 3,
      padding: "2px 7px",
      letterSpacing: 0.5,
      whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 9,
      letterSpacing: 2,
      color: "var(--text-muted)",
      textTransform: "uppercase",
      marginBottom: 8,
      fontFamily: "var(--font-mono)",
    }}>
      {children}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────

type BtnVariant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  children,
  onClick,
  variant = "secondary",
  disabled,
  loading,
  size = "md",
  style,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md";
  style?: React.CSSProperties;
  type?: "button" | "submit";
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "none",
    borderRadius: "var(--radius)",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    fontFamily: "var(--font-mono)",
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase",
    transition: "all 0.15s",
    opacity: disabled || loading ? 0.5 : 1,
    fontSize: size === "sm" ? 10 : 11,
    padding: size === "sm" ? "5px 12px" : "9px 16px",
  };

  const variants: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: "var(--accent)", color: "var(--bg-base)" },
    secondary: { background: "transparent", border: "1px solid var(--border)", color: "var(--text-primary)" },
    ghost: { background: "transparent", color: "var(--text-secondary)" },
    danger: { background: "var(--red-dim)", border: "1px solid var(--red)", color: "var(--red)" },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {loading && <span className="spinner" />}
      {children}
    </button>
  );
}

// ─── Input / Textarea ─────────────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-base)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  padding: "8px 12px",
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

export function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <input style={inputBase} {...props} />
    </div>
  );
}

export function Textarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <textarea style={{ ...inputBase, resize: "vertical", minHeight: 100, fontFamily: "var(--font-mono)", fontSize: 12 }} {...props} />
    </div>
  );
}

export function Select({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <select style={{ ...inputBase, cursor: "pointer" }} {...props}>
        {children}
      </select>
    </div>
  );
}

// ─── Tag ─────────────────────────────────────────────────────────────────────

export function Tag({ children, color }: { children: React.ReactNode; color?: string }) {
  const c = color || "var(--accent)";
  return (
    <span style={{
      display: "inline-block",
      fontSize: 10,
      padding: "2px 7px",
      borderRadius: 3,
      marginRight: 4,
      marginBottom: 3,
      background: c + "15",
      border: `1px solid ${c}25`,
      color: c,
      fontFamily: "var(--font-mono)",
    }}>
      {children}
    </span>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div style={{
      padding: "20px 28px",
      borderBottom: "1px solid var(--border)",
      background: "var(--bg-surface)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: 0.5 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12 }}>{description}</div>
    </div>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

export function ScoreBar({ label, score, weight }: { label: string; score: number; weight: number }) {
  const col = score >= 70 ? "var(--green)" : score >= 50 ? "var(--yellow)" : "var(--red)";
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{label}</span>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: col }}>{Math.round(score)}</span>
      </div>
      <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${score}%`,
          background: col,
          borderRadius: 2,
          transition: "width 0.5s ease",
        }} />
      </div>
      <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>
        weight: {Math.round(weight * 100)}%
      </div>
    </div>
  );
}
