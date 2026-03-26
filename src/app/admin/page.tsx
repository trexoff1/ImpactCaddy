import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="fade-in" style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", marginBottom: 8 }}>
        Admin Dashboard
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 28 }}>
        Manage draw simulations, publish results, and process winner payouts.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        <Link href="/admin/draws" className="glass-card" style={{ padding: 24, textDecoration: "none", color: "inherit" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", marginBottom: 8 }}>🎰 Draw Control</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
            Run pre-publish simulations and publish official draw results.
          </p>
        </Link>

        <Link href="/admin/winners" className="glass-card" style={{ padding: 24, textDecoration: "none", color: "inherit" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", marginBottom: 8 }}>✅ Winner Verification</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
            Review winner proof submissions and update payment state pending → paid.
          </p>
        </Link>
      </div>
    </div>
  );
}
