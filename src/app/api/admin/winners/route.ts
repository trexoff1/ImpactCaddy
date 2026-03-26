import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdminUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("draw_winners")
    .select("id, draw_id, user_id, match_tier, prize_amount, payment_status, proof_image_url, paid_at, created_at, draws(title, draw_date), profiles(display_name, email)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ winners: data || [] });
}

interface UpdateWinnerBody {
  id: string;
  paymentStatus: "pending" | "paid" | "rejected";
}

export async function PATCH(request: Request) {
  const auth = await requireAdminUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as UpdateWinnerBody;
  if (!body?.id || !body?.paymentStatus) {
    return NextResponse.json({ error: "id and paymentStatus are required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const updatePayload: { payment_status: string; paid_at?: string | null } = {
    payment_status: body.paymentStatus,
  };

  if (body.paymentStatus === "paid") {
    updatePayload.paid_at = new Date().toISOString();
  }

  if (body.paymentStatus !== "paid") {
    updatePayload.paid_at = null;
  }

  const { error } = await admin
    .from("draw_winners")
    .update(updatePayload)
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
