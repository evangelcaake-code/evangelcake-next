"use client";

import { useEffect, useState } from "react";

type Entry = { name: string; score: number };

export default function GameTeaserRank() {
  const [top, setTop] = useState<Entry[]>([]);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    let lastSerialized = "";

    async function refresh() {
      try {
        const res = await fetch("/api/ranking?limit=3", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { top?: Entry[] };
        if (cancelled) return;
        const fresh = JSON.stringify(data.top ?? []);
        if (fresh === lastSerialized) return;
        lastSerialized = fresh;
        setTop(data.top ?? []);
      } catch {
        // fallback silencioso
      }
    }

    function start() {
      if (interval) return;
      refresh();
      interval = setInterval(refresh, 5000);
    }
    function stop() {
      if (!interval) return;
      clearInterval(interval);
      interval = null;
    }
    function onVis() {
      if (document.hidden) stop();
      else start();
    }

    start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const sanitize = (n: string) => n.replace(/[<>&]/g, "");

  return (
    <div className="game-teaser-rank">
      <strong>🏆 Top del mes</strong>
      <ol>
        {top.length === 0 ? (
          <li>
            <span>Sé el primero</span>
            <span className="score">—</span>
          </li>
        ) : (
          top.map((p, i) => (
            <li key={`${p.name}-${i}`}>
              <span>{sanitize(p.name || "Anónimo")}</span>
              <span className="score">{p.score} pts</span>
            </li>
          ))
        )}
      </ol>
    </div>
  );
}
