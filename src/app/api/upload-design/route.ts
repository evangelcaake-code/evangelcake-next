/**
 * POST /api/upload-design
 *
 * Recibe una imagen del cliente (multipart/form-data, campo `file`), la
 * sube al bucket público `cake-designs` de Supabase Storage y devuelve la
 * URL pública. Se usa en el configurador de tartas (DesignPicker) cuando
 * el cliente sube una foto de referencia que luego acompaña su pedido
 * por WhatsApp.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function safeExt(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
    case "image/heif":
      return "heic";
    default:
      return "bin";
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "La imagen pesa más de 8 MB. Reduce el tamaño y prueba otra vez." },
        { status: 413 },
      );
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Formato no soportado. Sube JPG, PNG, WebP o HEIC." },
        { status: 415 },
      );
    }

    const ext = safeExt(file.type);
    // Nombre aleatorio para evitar colisiones y enumeración pública.
    const name = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const path = `uploads/${name}`;

    const sb = getSupabaseAdmin();
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await sb.storage
      .from("cake-designs")
      .upload(path, bytes, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });
    if (error) {
      console.error("[upload-design]", error);
      return NextResponse.json({ error: "No se pudo subir la imagen" }, { status: 500 });
    }

    const { data } = sb.storage.from("cake-designs").getPublicUrl(path);
    return NextResponse.json({ ok: true, url: data.publicUrl, path });
  } catch (err) {
    console.error("[upload-design] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
