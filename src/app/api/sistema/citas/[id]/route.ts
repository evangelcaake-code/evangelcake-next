/**
 * PATCH /api/sistema/citas/[id]
 *
 * Gestión de una cita desde el SOP interno. Mismo contrato que el panel:
 *   { status: "pending" | "confirmed" | "vino" | "no_vino" | "cancelada" }
 *   { appointment_date: "YYYY-MM-DD", appointment_slot: "HH:MM" }
 *
 * Los efectos secundarios (email al confirmar, mover evento de Google
 * Calendar al reprogramar) los dispara citasCore — idénticos al panel.
 * Auth: Authorization: Bearer <SISTEMA_API_TOKEN>.
 */
import { NextRequest, NextResponse } from "next/server";
import { applyCitaPatch } from "@/lib/citasCore";
import { isSistemaAuthorized, sistemaCorsHeaders } from "@/lib/sistemaAuth";

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: sistemaCorsHeaders(req) });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cors = sistemaCorsHeaders(req);
  if (!isSistemaAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: cors });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const result = await applyCitaPatch(id, body);
    return NextResponse.json(result.body, { status: result.httpStatus, headers: cors });
  } catch (e) {
    console.error("[sistema citas] patch:", e);
    return NextResponse.json({ error: "Bad request" }, { status: 400, headers: cors });
  }
}
