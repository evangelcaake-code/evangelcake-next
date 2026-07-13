/**
 * GET /api/sistema/citas?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Lista de citas para el SOP interno (sistema.evangelcake.com).
 * Auth: Authorization: Bearer <SISTEMA_API_TOKEN>.
 * Sin parámetros: desde hace 30 días hasta dentro de 90.
 */
import { NextRequest, NextResponse } from "next/server";
import { listCitas } from "@/lib/citasCore";
import { isSistemaAuthorized, sistemaCorsHeaders } from "@/lib/sistemaAuth";

export const dynamic = "force-dynamic";

function isoAddDays(delta: number) {
  const d = new Date(Date.now() + delta * 86400000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: sistemaCorsHeaders(req) });
}

export async function GET(req: NextRequest) {
  const cors = sistemaCorsHeaders(req);
  if (!isSistemaAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: cors });
  }
  const { searchParams } = new URL(req.url);
  const from = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.get("from") ?? "")
    ? searchParams.get("from")!
    : isoAddDays(-30);
  const to = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.get("to") ?? "")
    ? searchParams.get("to")!
    : isoAddDays(90);
  try {
    const citas = await listCitas(from, to);
    return NextResponse.json({ ok: true, from, to, citas }, { headers: cors });
  } catch (e) {
    console.error("[sistema citas] list:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500, headers: cors });
  }
}
