/**
 * PATCH /api/admin/citas/[id]
 *
 * Gestión de una cita desde el panel /admin/citas (auth por cookie admin).
 * La lógica y los efectos secundarios viven en lib/citasCore.ts — es el
 * mismo motor que usa /api/sistema/citas/[id] (el SOP interno).
 *
 * Body (uno u otro, o ambos):
 *   { status: "pending" | "confirmed" | "vino" | "no_vino" | "cancelada" }
 *   { appointment_date: "YYYY-MM-DD", appointment_slot: "HH:MM" }   ← reprogramar
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { applyCitaPatch } from "@/lib/citasCore";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const result = await applyCitaPatch(id, body);
    return NextResponse.json(result.body, { status: result.httpStatus });
  } catch (e) {
    console.error("[admin citas patch]", e);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
