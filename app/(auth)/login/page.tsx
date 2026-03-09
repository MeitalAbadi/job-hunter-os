"use client";
// app/(auth)/login/page.tsx
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const result = await signIn("credentials", {
      email, password, redirect: false,
    });
    if (result?.error) {
      setError("Invalid credentials");
      setLoading(false);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="login-shell">
      <div
        className="jh-card animate-fadeIn login-card"
        style={{
          width: "min(980px, 100%)",
          borderRadius: 24,
          overflow: "hidden",
        }}
      >
        <div className="login-hero"
          style={{
            padding: "40px 34px",
            background:
              "radial-gradient(circle at 9% 18%, rgba(255,126,80,0.28), transparent 40%), radial-gradient(circle at 91% 20%, rgba(0,183,164,0.22), transparent 38%), rgba(255,255,255,0.68)",
            borderRight: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 38,
              lineHeight: 1.1,
              fontWeight: 700,
              maxWidth: 410,
            }}
          >
            Make your job search feel magnetic.
          </div>
          <p style={{ marginTop: 14, maxWidth: 500, color: "var(--text-secondary)", fontSize: 15 }}>
            Career Orbit helps you score roles, track momentum, and move from applications to offers with
            clarity.
          </p>
          <div
            style={{
              marginTop: 28,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 999,
              padding: "6px 12px",
              background: "rgba(255,255,255,0.62)",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
            AI modules online
          </div>
        </div>

        <div style={{ padding: "30px 28px" }}>
          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 26,
                fontWeight: 700,
                lineHeight: 1.15,
              }}
            >
              Welcome back
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, letterSpacing: 0.3 }}>
              Log in to continue your momentum.
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  fontSize: 9,
                  color: "var(--text-muted)",
                  letterSpacing: 1.8,
                  display: "block",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Email
              </label>
              <input
                className="jh-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="meital@example.com"
                required
                style={{ padding: "10px 12px", fontSize: 13 }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontSize: 9,
                  color: "var(--text-muted)",
                  letterSpacing: 1.8,
                  display: "block",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Password
              </label>
              <input
                className="jh-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ padding: "10px 12px", fontSize: 13 }}
              />
            </div>

            {error && (
              <div style={{ fontSize: 12, color: "var(--red)", marginBottom: 12, textAlign: "center" }}>
                {error}
              </div>
            )}

            <button
              className="jh-button jh-button-primary"
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px",
                border: "none",
                color: "white",
                fontWeight: 700,
                fontSize: 12,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-mono)",
                letterSpacing: 1.4,
                textTransform: "uppercase",
                opacity: loading ? 0.72 : 1,
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
