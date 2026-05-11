import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin · Iniciar sesión",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect("/admin");
  return (
    <section className="admin-login">
      <div className="admin-login-card">
        <span className="game-eyebrow">Panel interno</span>
        <h1>EvangelCake · Admin</h1>
        <p>Accede para ver suscriptores, leads, ranking del juego y códigos.</p>
        <LoginForm />
      </div>
    </section>
  );
}
