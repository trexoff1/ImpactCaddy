import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/admin-auth";
import { runDrawSimulation, type DrawMode, type SimulationParticipant } from "@/lib/draw-engine";

interface SimulateBody {
  drawId: string;
  mode: DrawMode;
}

async function getParticipantScores(admin: ReturnType<typeof createAdminClient>, drawId: string) {
  const { data: entries } = await admin
    .from("draw_entries")
    .select("id, user_id, locked_scores")
    .eq("draw_id", drawId);

  const participants: SimulationParticipant[] = [];

  for (const entry of entries || []) {
    const lockedScores = (entry.locked_scores as number[] | null) || [];
    if (lockedScores.length > 0) {
      participants.push({ userId: entry.user_id as string, scores: lockedScores.slice(0, 5) });
      continue;
    }

    const { data: latestScores } = await admin
      .from("scores")
      .select("stableford_points")
      .eq("user_id", entry.user_id)
      .order("date_played", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5);

    const scoreList = (latestScores || []).map((row) => Number(row.stableford_points)).filter((n) => Number.isFinite(n));
    participants.push({ userId: entry.user_id as string, scores: scoreList });
  }

  return participants;
}

export async function POST(request: Request) {
  const auth = await requireAdminUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!auth.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as SimulateBody;
  if (!body?.drawId || !body?.mode) {
    return NextResponse.json({ error: "drawId and mode are required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: draw } = await admin
    .from("draws")
    .select("id, title, total_pool, status")
    .eq("id", body.drawId)
    .single();

  if (!draw) {
    return NextResponse.json({ error: "Draw not found" }, { status: 404 });
  }

  const participants = await getParticipantScores(admin, body.drawId);
  const simulation = runDrawSimulation(body.mode, participants);

  const totalPool = Number(draw.total_pool || 0);
  const pools = {
    fiveMatch: Number((totalPool * 0.4).toFixed(2)),
    fourMatch: Number((totalPool * 0.35).toFixed(2)),
    threeMatch: Number((totalPool * 0.25).toFixed(2)),
  };

  return NextResponse.json({
    draw,
    mode: body.mode,
    participants: participants.length,
    winningNumbers: simulation.winningNumbers,
    winnerCounts: simulation.winnerCounts,
    payoutPreview: {
      fiveMatchEach: simulation.winnerCounts[5] > 0 ? Number((pools.fiveMatch / simulation.winnerCounts[5]).toFixed(2)) : 0,
      fourMatchEach: simulation.winnerCounts[4] > 0 ? Number((pools.fourMatch / simulation.winnerCounts[4]).toFixed(2)) : 0,
      threeMatchEach: simulation.winnerCounts[3] > 0 ? Number((pools.threeMatch / simulation.winnerCounts[3]).toFixed(2)) : 0,
      jackpotCarryover: simulation.winnerCounts[5] === 0,
    },
  });
}
