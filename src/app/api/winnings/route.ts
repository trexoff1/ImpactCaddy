import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("draw_winners")
    .select("id, draw_id, match_tier, prize_amount, payment_status, proof_image_url, paid_at, created_at, draws(title, draw_date)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ winnings: data || [] });
}

interface ProofBody {
  id: string;
  proofUrl: string;
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as ProofBody;
  if (!body?.id || !body?.proofUrl) {
    return NextResponse.json({ error: "id and proofUrl are required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("draw_winners")
    .update({ proof_image_url: body.proofUrl, payment_status: "pending" })
    .eq("id", body.id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
