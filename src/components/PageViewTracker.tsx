"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // No trackeamos /admin para no contaminar analítica con visitas internas.
    if (!pathname || pathname.startsWith("/admin")) return;
    track("page_view", { page: pathname });
  }, [pathname]);

  return null;
}
