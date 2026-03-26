import Link from "next/link";
import { TIERS, type SubscriptionTier } from "@/lib/types";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ─── Nav ─── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(15,23,42,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(148,163,184,0.08)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
            fontSize: "1.5rem",
            background:
              "linear-gradient(135deg, var(--color-success-400), var(--color-primary-400))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ⛳ GolfGives
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/auth/login" className="btn btn-ghost btn-sm">
            Sign In
          </Link>
          <Link href="/auth/signup" className="btn btn-accent btn-sm">
            Start Giving
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 24px 80px",
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(16,185,129,0.1) 0%, transparent 40%)",
        }}
      >
        <div className="badge badge-success" style={{ marginBottom: 20 }}>
          🏌️ Play Golf · Give Back
        </div>

        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 800,
            marginBottom: 24,
          }}
        >
          Every Round You Play{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg, var(--color-success-400), var(--color-accent-400))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Changes Lives
          </span>
        </h1>

        <p
          style={{
            maxWidth: 560,
            fontSize: "1.125rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.7,
            marginBottom: 40,
          }}
        >
          Subscribe, log your Stableford scores, and enter monthly charity draws.
          Win prizes while your subscription fuels real impact for charities you
          care about.
        </p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/auth/signup" className="btn btn-primary btn-lg">
            Get Started — From £10/mo
          </Link>
          <a href="#how-it-works" className="btn btn-ghost btn-lg">
            How It Works ↓
          </a>
        </div>

        {/* Stats strip */}
        <div
          style={{
            display: "flex",
            gap: 48,
            marginTop: 64,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            { value: "£124K+", label: "Raised for charity" },
            { value: "2,340", label: "Active golfers" },
            { value: "58", label: "Monthly draws completed" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div className="stat-counter" style={{ fontSize: "2.25rem" }}>
                {s.value}
              </div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section
        id="how-it-works"
        style={{
          padding: "100px 24px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontFamily: "var(--font-heading)",
            fontSize: "2.25rem",
            marginBottom: 16,
          }}
        >
          How It Works
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "var(--color-text-secondary)",
            maxWidth: 520,
            margin: "0 auto 56px",
          }}
        >
          Three simple steps to play golf, do good, and win prizes.
        </p>

        <div className="stagger-children" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {[
            {
              icon: "📋",
              title: "1. Subscribe",
              desc: "Choose Birdie, Eagle, or Albatross and get monthly draw entries and score tracking.",
            },
            {
              icon: "⛳",
              title: "2. Play & Log",
              desc: "Record your Stableford scores after each round. Every game counts toward your charity.",
            },
            {
              icon: "🏆",
              title: "3. Win & Give",
              desc: "Monthly draws award prizes — a share goes directly to your chosen charity.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="glass-card"
              style={{ padding: 32, textAlign: "center" }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>{step.icon}</div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.25rem",
                  marginBottom: 12,
                }}
              >
                {step.title}
              </h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section
        style={{
          padding: "100px 24px",
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 60%)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2
            style={{
              textAlign: "center",
              fontFamily: "var(--font-heading)",
              fontSize: "2.25rem",
              marginBottom: 16,
            }}
          >
            Choose Your Impact
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "var(--color-text-secondary)",
              maxWidth: 480,
              margin: "0 auto 56px",
            }}
          >
            Every tier supports the charities you love. Upgrade anytime.
          </p>

          <div
            className="stagger-children"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            {(Object.entries(TIERS) as [SubscriptionTier, typeof TIERS[SubscriptionTier]][]).map(
              ([key, tier]) => (
                <div
                  key={key}
                  className="glass-card"
                  style={{
                    padding: 36,
                    display: "flex",
                    flexDirection: "column",
                    border:
                      key === "eagle"
                        ? "1px solid rgba(99,102,241,0.4)"
                        : undefined,
                    position: "relative",
                  }}
                >
                  {key === "eagle" && (
                    <div
                      className="badge badge-info"
                      style={{
                        position: "absolute",
                        top: -10,
                        right: 20,
                      }}
                    >
                      Popular
                    </div>
                  )}

                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.5rem",
                      color: tier.color,
                      marginBottom: 8,
                    }}
                  >
                    {tier.name}
                  </h3>

                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginBottom: 20 }}>
                    {tier.description}
                  </p>

                  <div style={{ marginBottom: 24 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "2.5rem",
                        fontWeight: 800,
                      }}
                    >
                      £{tier.price}
                    </span>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>/mo</span>
                  </div>

                  <ul style={{ listStyle: "none", flex: 1, marginBottom: 24 }}>
                    {tier.features.map((f) => (
                      <li
                        key={f}
                        style={{
                          padding: "8px 0",
                          color: "var(--color-text-secondary)",
                          fontSize: "0.9375rem",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ color: "var(--color-success-400)" }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/auth/signup"
                    className={`btn ${key === "eagle" ? "btn-primary" : "btn-ghost"}`}
                    style={{ width: "100%" }}
                  >
                    Get {tier.name}
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer
        style={{
          padding: "48px 24px",
          borderTop: "1px solid rgba(148,163,184,0.08)",
          textAlign: "center",
          color: "var(--color-text-muted)",
          fontSize: "0.875rem",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
            fontSize: "1.25rem",
            marginBottom: 12,
            background:
              "linear-gradient(135deg, var(--color-success-400), var(--color-primary-400))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ⛳ GolfGives
        </div>
        <p>Play Golf. Change Lives. © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
