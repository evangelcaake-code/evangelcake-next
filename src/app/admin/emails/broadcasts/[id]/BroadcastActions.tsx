"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  status: string;
  audienceCount: number | null;
  autoPrompt: boolean;
}

export default function BroadcastActions({ id, status, audienceCount, autoPrompt }: Props) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<{ sent: number; fails: number; total: number } | null>(null);

  useEffect(() => {
    if (autoPrompt && status === "draft") {
      // Hacemos scroll para que el bloque sea visible. No auto-disparamos
      // el confirm() para que no asuste al usuario.
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }, [autoPrompt, status]);

  async function onSend() {
    const count = audienceCount ?? "?";
    if (!confirm(`Vas a mandar este email a ${count} destinatarios. ¿Confirmas?`)) return;
    setSending(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/broadcasts/${id}/send`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error enviando");
      setResult({ sent: data.sent, fails: data.fails, total: data.total });
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setSending(false);
    }
  }

  if (status === "sent") {
    return <p style={{ margin: 0, color: "var(--ink-2)" }}>Esta campaña ya se ha enviado.</p>;
  }
  if (status === "sending") {
    return <p style={{ margin: 0, color: "var(--ink-2)" }}>Envío en curso. Recarga en unos segundos para ver el progreso.</p>;
  }
  if (status === "failed") {
    return <p style={{ margin: 0, color: "#d33" }}>Envío fallido. Crea una campaña nueva o contacta soporte.</p>;
  }

  return (
    <>
      <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.6 }}>
        Esta campaña está en <strong>borrador</strong>. Al darle a enviar irá a {audienceCount ?? "?"} destinatarios. Resend tiene rate limit, así que el envío tarda ~0.6 s por destinatario (ej. 100 destinatarios = ~1 min).
      </p>
      <button type="button" onClick={onSend} disabled={sending} className="btn btn-pink" style={{ padding: "12px 24px", fontSize: 15 }}>
        {sending ? "Enviando… (no cierres esta pestaña)" : "Enviar ahora →"}
      </button>
      {err && <p style={{ color: "#d33", margin: "10px 0 0" }}>{err}</p>}
      {result && (
        <p style={{ margin: "10px 0 0", color: "#0a8c4a" }}>
          ✓ {result.sent} entregados, {result.fails} fallidos (de {result.total} totales).
        </p>
      )}
    </>
  );
}
