import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Dashboard Contenido Mayo · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DashboardMayoAdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <div className="admin-shell" style={{ paddingBottom: 0 }}>
      <header className="admin-header" style={{ marginBottom: 16 }}>
        <div>
          <span className="game-eyebrow">Campaña Mayo 2026</span>
          <h1>Dashboard de contenido</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ink-2)" }}>
            10 cadenas de Stories + 6 carruseles · descarga PNGs listos para publicar.
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 13 }}>
            <Link
              href="/admin"
              style={{ color: "var(--pink-deep)", textDecoration: "underline" }}
            >
              ← Volver al admin
            </Link>
            {" · "}
            <a
              href="/dashboard-mayo/index.html"
              target="_blank"
              rel="noopener"
              style={{ color: "var(--pink-deep)", textDecoration: "underline" }}
            >
              Abrir en pestaña nueva ↗
            </a>
          </p>
        </div>
      </header>

      <iframe
        src="/dashboard-mayo/index.html"
        title="Dashboard contenido Mayo"
        style={{
          display: "block",
          width: "100%",
          height: "calc(100vh - 180px)",
          border: "1px solid rgba(26,22,20,.08)",
          borderRadius: 12,
          background: "#f5f0e8",
        }}
      />
    </div>
  );
}
