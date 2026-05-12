"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";
import { getSubscribedEmail, saveSubscribedEmail } from "@/lib/subscriberLocal";

export default function PageViewTracker() {
  const pathname = usePathname();

  // Recuperar identidad desde la cookie firmada si no hay nada en localStorage.
  // Se ejecuta una sola vez al montar el componente (no por cada cambio de
  // ruta) para no spammear la API.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (getSubscribedEmail()) return; // ya conocemos al usuario en local
    let cancelled = false;
    fetch("/api/identify", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.found && data.email) {
          saveSubscribedEmail(data.email);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    track("page_view", { page: pathname });
  }, [pathname]);

  return null;
}
