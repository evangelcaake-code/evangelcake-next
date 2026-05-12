import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import BroadcastComposer from "./BroadcastComposer";

export const metadata: Metadata = {
  title: "Nueva campaña · Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function NewBroadcastPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="game-eyebrow">Email marketing</span>
          <h1>Nueva campaña</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13 }}>
            <Link href="/admin/emails" style={{ color: "var(--pink-deep)", textDecoration: "underline" }}>
              ← Volver a Emails
            </Link>
          </p>
        </div>
      </header>
      <BroadcastComposer />
    </div>
  );
}
