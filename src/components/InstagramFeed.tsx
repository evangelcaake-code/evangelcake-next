"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface IGPost {
  id: string;
  image_url: string;
  post_url: string | null;
  caption: string | null;
}

export default function InstagramFeed() {
  const [posts, setPosts] = useState<IGPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/instagram-posts", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.ok && Array.isArray(data.posts)) {
          setPosts(data.posts.slice(0, 9));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="instagram"
      className="section ig-section"
      aria-labelledby="ig-title"
    >
      <div className="section-head ig-head">
        <div>
          <span className="tag">Síguenos en Instagram</span>
          <h2 id="ig-title">
            Lo último que <em>horneamos.</em>
          </h2>
          <p className="ig-handle">
            <a
              href="https://instagram.com/evangelcake"
              target="_blank"
              rel="noopener noreferrer"
            >
              @evangelcake
            </a>
            {" — pásate y dile hola"}
          </p>
        </div>
        <a
          className="btn btn-pink ig-follow-btn"
          href="https://instagram.com/evangelcake"
          target="_blank"
          rel="noopener noreferrer"
        >
          Seguir en Instagram →
        </a>
      </div>

      {loading ? (
        <div className="ig-grid ig-grid-skeleton">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="ig-item ig-skeleton" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="ig-empty">
          <p>Pasa por nuestro Instagram para ver lo último:</p>
          <a
            className="btn btn-pink"
            href="https://instagram.com/evangelcake"
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir @evangelcake →
          </a>
        </div>
      ) : (
        <div className="ig-grid">
          {posts.map((p) => {
            const inner = (
              <>
                <Image
                  src={p.image_url}
                  alt={p.caption || "Tarta EvangelCake"}
                  width={600}
                  height={600}
                  unoptimized
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div className="ig-overlay" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  <span className="ig-overlay-text">Ver en Instagram</span>
                </div>
              </>
            );
            return p.post_url ? (
              <a
                key={p.id}
                className="ig-item"
                href={p.post_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={p.caption || "Abrir post de Instagram"}
              >
                {inner}
              </a>
            ) : (
              <div key={p.id} className="ig-item">
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
