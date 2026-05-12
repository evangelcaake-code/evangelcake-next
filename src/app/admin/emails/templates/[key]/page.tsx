import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { TEMPLATE_DEFS, getTemplate, type TemplateKey } from "@/lib/emailTemplates";
import TemplateEditor from "./TemplateEditor";

export const metadata: Metadata = {
  title: "Editar plantilla · Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

function isKey(k: string): k is TemplateKey {
  return k in TEMPLATE_DEFS;
}

export default async function TemplateEditPage({ params }: { params: Promise<{ key: string }> }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const { key } = await params;
  if (!isKey(key)) notFound();

  const def = TEMPLATE_DEFS[key];
  const tpl = await getTemplate(key);

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="game-eyebrow">Plantilla automática</span>
          <h1>{def.label}</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ink-2)" }}>{def.description}</p>
          <p style={{ margin: "4px 0 0", fontSize: 13 }}>
            <Link href="/admin/emails" style={{ color: "var(--pink-deep)", textDecoration: "underline" }}>
              ← Volver a Emails
            </Link>
          </p>
        </div>
      </header>

      <TemplateEditor
        templateKey={key}
        initial={{
          subject: tpl.subject,
          html: tpl.html,
          text_body: tpl.text_body || "",
        }}
        vars={[...def.vars]}
        sample={def.sample}
      />
    </div>
  );
}
