// components/ui/index.tsx
// Reusable UI primitives — no external component library dependency

import React from "react";

const SCORE_COLORS: Record<string, string> = {
  STRONG_APPLY: "#08b765",
  APPLY: "#00b7a4",
  STRETCH_APPLY: "#f59f1a",
  LOW_PRIORITY: "#6e7f9e",
  SKIP: "#e5484d",
};

const SCORE_LABELS: Record<string, string> = {
  STRONG_APPLY: "Strong Apply",
  APPLY: "Apply",
  STRETCH_APPLY: "Stretch",
  LOW_PRIORITY: "Low Priority",
  SKIP: "Skip",
};

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  WISHLIST: { color: "#6e7f9e", label: "Wishlist" },
  APPLIED: { color: "#00b7a4", label: "Applied" },
  RECRUITER_SCREEN: { color: "#5672ff", label: "Recruiter Screen" },
  TECHNICAL_INTERVIEW: { color: "#f59f1a", label: "Technical Interview" },
  CASE_STUDY: { color: "#f9791a", label: "Case Study" },
  FINAL_INTERVIEW: { color: "#08a4dd", label: "Final Interview" },
  OFFER: { color: "#08b765", label: "Offer" },
  ACCEPTED: { color: "#15985b", label: "Accepted" },
  REJECTED: { color: "#e5484d", label: "Rejected" },
  WITHDRAWN: { color: "#6e7f9e", label: "Withdrawn" },
  ON_HOLD: { color: "#db9618", label: "On Hold" },
};

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function ScoreBadge({ score, recommendation }: { score: number; recommendation: string }) {
  const col = SCORE_COLORS[recommendation] || "#6e7f9e";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        fontWeight: 600,
        color: col,
        background: `${col}1A`,
        border: `1px solid ${col}3D`,
        borderRadius: 999,
        padding: "4px 10px",
        fontFamily: "var(--font-mono)",
        letterSpacing: 0.4,
      }}
    >
      <span style={{ fontSize: 15, lineHeight: 1 }}>{Math.round(score)}</span>
      <span style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", opacity: 0.9 }}>
        {SCORE_LABELS[recommendation] || recommendation}
      </span>
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || { color: "#6e7f9e", label: status };

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 10,
        fontWeight: 600,
        color: s.color,
        background: `${s.color}16`,
        border: `1px solid ${s.color}3D`,
        borderRadius: 999,
        padding: "3px 9px",
        letterSpacing: 0.4,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

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
      className={cx("jh-card", className)}
      style={{
        borderRadius: "var(--radius-lg)",
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 9,
        letterSpacing: 1.8,
        color: "var(--text-muted)",
        textTransform: "uppercase",
        marginBottom: 8,
        fontFamily: "var(--font-mono)",
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
}

type BtnVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonVariantClass: Record<BtnVariant, string> = {
  primary: "jh-button-primary",
  secondary: "jh-button-secondary",
  ghost: "jh-button-ghost",
  danger: "jh-button-danger",
};

export function Button({
  children,
  onClick,
  variant = "secondary",
  disabled,
  loading,
  size = "md",
  style,
  type = "button",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md";
  style?: React.CSSProperties;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cx("jh-button", buttonVariantClass[variant], className)}
      style={{
        border: variant === "secondary" || variant === "danger" ? "1px solid transparent" : "none",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.55 : 1,
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        letterSpacing: 0.95,
        textTransform: "uppercase",
        fontSize: size === "sm" ? 10 : 11,
        padding: size === "sm" ? "6px 12px" : "9px 16px",
        ...style,
      }}
    >
      {loading && <span className="spinner" />}
      {children}
    </button>
  );
}

const inputBase: React.CSSProperties = {
  color: "var(--text-primary)",
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  padding: "10px 12px",
  boxSizing: "border-box",
};

export function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <input className="jh-input" style={inputBase} {...props} />
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
      <textarea
        className="jh-textarea"
        style={{
          ...inputBase,
          resize: "vertical",
          minHeight: 110,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
        }}
        {...props}
      />
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
      <select className="jh-select" style={{ ...inputBase, cursor: "pointer" }} {...props}>
        {children}
      </select>
    </div>
  );
}

export function Tag({ children, color }: { children: React.ReactNode; color?: string }) {
  const c = color || "var(--accent)";

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 10,
        padding: "3px 9px",
        borderRadius: 999,
        marginRight: 4,
        marginBottom: 3,
        background: `${c}16`,
        border: `1px solid ${c}33`,
        color: c,
        fontFamily: "var(--font-mono)",
        letterSpacing: 0.2,
      }}
    >
      {children}
    </span>
  );
}

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
    <div className="jh-page-header">
      <div>
        <h1 className="jh-page-title">{title}</h1>
        {subtitle && <p className="jh-page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ fontSize: 12 }}>{description}</div>
    </div>
  );
}

export function ScoreBar({ label, score, weight }: { label: string; score: number; weight: number }) {
  const col = score >= 70 ? "var(--green)" : score >= 50 ? "var(--yellow)" : "var(--red)";

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{label}</span>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: col }}>{Math.round(score)}</span>
      </div>
      <div
        style={{
          height: 6,
          background: "rgba(22, 37, 66, 0.12)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            background: col,
            borderRadius: 999,
            transition: "width 0.5s ease",
          }}
        />
      </div>
      <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 3 }}>
        weight: {Math.round(weight * 100)}%
      </div>
    </div>
  );
}
