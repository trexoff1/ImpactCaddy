"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface LeaderboardEntry {
  rank: number;
  display_name: string;
  avg_stableford: number;
  total_rounds: number;
  best_score: number;
  isCurrentUser: boolean;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"all" | "month" | "week">("month");

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData?.user?.id;

    // Fetch all scores with profiles
    let query = supabase
      .from("scores")
      .select("user_id, stableford_points, date_played, profiles!inner(display_name)")
      .order("stableford_points", { ascending: false });

    if (period === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte("date_played", monthAgo.toISOString());
    } else if (period === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte("date_played", weekAgo.toISOString());
    }

    const { data: scores } = await query;

    // Aggregate by user
    const userMap: Record<string, { name: string; scores: number[]; isCurrentUser: boolean }> = {};
    (scores || []).forEach((s: Record<string, unknown>) => {
      const uid = s.user_id as string;
      if (!userMap[uid]) {
        const profileData = s.profiles as Record<string, string> | null;
        userMap[uid] = {
          name: profileData?.display_name || "Anonymous",
          scores: [],
          isCurrentUser: uid === currentUserId,
        };
      }
      userMap[uid].scores.push(s.stableford_points as number);
    });

    const entries = Object.values(userMap)
      .map((u) => ({
        display_name: u.name,
        avg_stableford: Math.round(u.scores.reduce((a, b) => a + b, 0) / u.scores.length),
        total_rounds: u.scores.length,
        best_score: Math.max(...u.scores),
        isCurrentUser: u.isCurrentUser,
      }))
      .sort((a, b) => b.avg_stableford - a.avg_stableford)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    setLeaderboard(entries);
    setLoading(false);
  }, [period]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  function getRankEmoji(rank: number) {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  }

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", marginBottom: 4 }}>Leaderboard</h1>
          <p style={{ color: "var(--color-text-secondary)" }}>See how you stack up against other golfers.</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["week", "month", "all"] as const).map((p) => (
            <button
              key={p}
              className={`btn ${period === p ? "btn-primary" : "btn-ghost"} btn-sm`}
              onClick={() => setPeriod(p)}
            >
              {p === "all" ? "All Time" : p === "month" ? "This Month" : "This Week"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <div className="loading-spinner" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🏆</div>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: 8 }}>
            No Scores Yet
          </h3>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Be the first to log a score and top the leaderboard!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 20,
              marginBottom: 32,
            }}
          >
            {leaderboard.slice(0, 3).map((entry) => (
              <div
                className="glass-card"
                key={entry.rank}
                style={{
                  padding: 28,
                  textAlign: "center",
                  order: entry.rank === 1 ? 0 : entry.rank === 2 ? -1 : 1,
                  transform: entry.rank === 1 ? "scale(1.05)" : "none",
                  border: entry.isCurrentUser ? "1px solid var(--color-primary-500)" : undefined,
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>{getRankEmoji(entry.rank)}</div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", marginBottom: 4 }}>
                  {entry.display_name}
                  {entry.isCurrentUser && <span style={{ color: "var(--color-primary-400)", marginLeft: 6, fontSize: "0.75rem" }}>YOU</span>}
                </div>
                <div className="stat-counter" style={{ fontSize: "2rem", color: "var(--color-success-400)", marginBottom: 8 }}>
                  {entry.avg_stableford}
                </div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                  avg pts · {entry.total_rounds} rounds · best: {entry.best_score}
                </div>
              </div>
            ))}
          </div>

          {/* Full leaderboard table */}
          {leaderboard.length > 3 && (
            <div className="glass-card" style={{ overflow: "hidden" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Rank</th>
                    <th>Golfer</th>
                    <th>Avg Stableford</th>
                    <th>Rounds</th>
                    <th>Best</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.slice(3).map((entry) => (
                    <tr
                      key={entry.rank}
                      style={{
                        background: entry.isCurrentUser ? "rgba(99,102,241,0.08)" : undefined,
                      }}
                    >
                      <td style={{ fontWeight: 600 }}>{getRankEmoji(entry.rank)}</td>
                      <td style={{ fontWeight: entry.isCurrentUser ? 700 : 400 }}>
                        {entry.display_name}
                        {entry.isCurrentUser && (
                          <span className="badge badge-primary" style={{ marginLeft: 8 }}>You</span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-success">{entry.avg_stableford} pts</span>
                      </td>
                      <td>{entry.total_rounds}</td>
                      <td>{entry.best_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
