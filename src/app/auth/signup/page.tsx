"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Charity {
  id: string;
  name: string;
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [charityId, setCharityId] = useState("");
  const [charityPercentage, setCharityPercentage] = useState("10");
  const [charities, setCharities] = useState<Charity[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadCharities() {
      const supabase = createClient();
      const { data } = await supabase
        .from("charities")
        .select("id, name")
        .eq("is_active", true)
        .order("name", { ascending: true });
      setCharities(data || []);
      if (data && data.length > 0) {
        setCharityId(data[0].id);
      }
    }
    loadCharities();
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const parsedPercentage = Number(charityPercentage);
    if (!charityId) {
      setError("Please select a charity.");
      setLoading(false);
      return;
    }
    if (!Number.isFinite(parsedPercentage) || parsedPercentage < 10) {
      setError("Charity contribution must be at least 10%.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          charity_id: charityId,
          charity_percentage: parsedPercentage,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.12) 0%, transparent 60%)",
      }}
    >
      <div className="glass-card fade-in" style={{ maxWidth: 420, width: "100%", padding: 40 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              fontSize: "2rem",
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              background: "linear-gradient(135deg, var(--color-success-400), var(--color-primary-400))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ⛳ GolfGives
          </div>
          <p style={{ color: "var(--color-text-secondary)", marginTop: 8, fontSize: "0.9375rem" }}>
            Join the community. Play golf. Give back.
          </p>
        </div>

        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label className="input-label" htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              className="input-field"
              placeholder="John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="input-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="input-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="charityId">Choose Charity</label>
            <select
              id="charityId"
              className="input-field"
              value={charityId}
              onChange={(e) => setCharityId(e.target.value)}
              required
            >
              {charities.map((charity) => (
                <option key={charity.id} value={charity.id}>
                  {charity.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label" htmlFor="charityPercentage">Charity Contribution %</label>
            <input
              id="charityPercentage"
              type="number"
              min={10}
              max={100}
              className="input-field"
              value={charityPercentage}
              onChange={(e) => setCharityPercentage(e.target.value)}
              required
            />
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                background: "rgba(239,68,68,0.1)",
                color: "var(--color-danger-400)",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 24,
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
          }}
        >
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "var(--color-primary-400)", textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
