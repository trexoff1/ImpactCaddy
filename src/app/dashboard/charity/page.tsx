"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Charity {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  total_raised: number;
}

export default function CharityPage() {
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [donationTotal, setDonationTotal] = useState(0);
  const [communityTotal, setCommunityTotal] = useState(0);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCharity();
  }, []);

  async function loadCharity() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("charity_id, charity_total")
      .eq("id", userData.user.id)
      .single();

    const { data: charityRows } = await supabase
      .from("charities")
      .select("id, name, description, logo_url, total_raised")
      .eq("is_active", true)
      .order("name", { ascending: true });

    setCharities(charityRows || []);
    setSelectedCharity(profile?.charity_id || null);
    setDonationTotal(profile?.charity_total || 0);
    const total = (charityRows || []).reduce((sum, charity) => sum + Number(charity.total_raised || 0), 0);
    setCommunityTotal(total);
    setLoading(false);
  }

  async function selectCharity(charityId: string) {
    setSaving(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSaving(false);
      return;
    }

    await supabase
      .from("profiles")
      .update({ charity_id: charityId })
      .eq("id", userData.user.id);

    setSelectedCharity(charityId);
    setSaving(false);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  const currentCharity = charities.find((c) => c.id === selectedCharity);

  return (
    <div className="fade-in">
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", marginBottom: 4 }}>My Charity</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 32 }}>
        Choose where your impact goes. A portion of subscription fees goes to your chosen charity.
      </p>

      {/* Impact stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <div className="glass-card" style={{ padding: 24, textAlign: "center" }}>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", marginBottom: 8 }}>
            Your Total Impact
          </div>
          <div className="stat-counter" style={{ fontSize: "2.5rem", color: "#f472b6" }}>
            £{donationTotal.toFixed(2)}
          </div>
        </div>
        <div className="glass-card" style={{ padding: 24, textAlign: "center" }}>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", marginBottom: 8 }}>
            Current Charity
          </div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem" }}>
            {currentCharity ? (
              <>
                <span style={{ marginRight: 8 }}>❤️</span>
                {currentCharity.name}
              </>
            ) : (
              <span style={{ color: "var(--color-text-muted)" }}>Not selected</span>
            )}
          </div>
        </div>
        <div className="glass-card" style={{ padding: 24, textAlign: "center" }}>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", marginBottom: 8 }}>
            Community Total
          </div>
          <div className="stat-counter" style={{ fontSize: "2.5rem", color: "var(--color-success-400)" }}>
            £{communityTotal.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Charity selection */}
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", marginBottom: 16 }}>
        Choose a Charity
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {charities.map((charity) => {
          const isSelected = selectedCharity === charity.id;
          return (
            <div
              className="glass-card"
              key={charity.id}
              style={{
                padding: 24,
                border: isSelected ? "2px solid var(--color-primary-500)" : "1px solid rgba(148,163,184,0.08)",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onClick={() => !saving && selectCharity(charity.id)}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <span style={{ fontSize: "2rem" }}>❤️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", marginBottom: 4 }}>
                      {charity.name}
                    </h3>
                    <span className={`badge ${isSelected ? "badge-primary" : "badge-info"}`}>Verified</span>
                  </div>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.8125rem", lineHeight: 1.5 }}>
                    {charity.description}
                  </p>
                  {isSelected && (
                    <div style={{ marginTop: 12, color: "var(--color-primary-400)", fontWeight: 600, fontSize: "0.875rem" }}>
                      ✅ Currently Selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
