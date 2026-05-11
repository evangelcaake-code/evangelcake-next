"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "evangelcake_cookies";
const VERSION = 1;
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";

type Consent = {
  v: number;
  analytics: boolean;
  marketing: boolean;
  ts: number;
};

function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Consent;
    if (data.v !== VERSION) return null;
    return data;
  } catch {
    return null;
  }
}

let gaLoaded = false;
function loadGA() {
  if (gaLoaded) return;
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "G-XXXXXXXXXX") return;
  gaLoaded = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(s);
  type GtagWindow = Window & {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  };
  const w = window as unknown as GtagWindow;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function (...args: unknown[]) {
    w.dataLayer.push(args);
  };
  w.gtag("js", new Date());
  w.gtag("config", GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    cookie_flags: "SameSite=None;Secure",
  });
}

function applyConsent(data: Consent) {
  if (data.analytics) loadGA();
  window.dispatchEvent(new CustomEvent("cookieConsentUpdated", { detail: data }));
}

function saveConsent(prefs: { analytics: boolean; marketing: boolean }): Consent {
  const data: Consent = {
    v: VERSION,
    analytics: !!prefs.analytics,
    marketing: !!prefs.marketing,
    ts: Date.now(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
  applyConsent(data);
  return data;
}

export default function CookiesBanner() {
  const [bannerOpen, setBannerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Inicial: si no hay consent, mostrar banner. Si lo hay, aplicarlo.
  useEffect(() => {
    const c = readConsent();
    if (c) {
      setAnalytics(c.analytics);
      setMarketing(c.marketing);
      applyConsent(c);
    } else {
      const t = setTimeout(() => setBannerOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  // Escuchar evento para abrir modal desde /cookies → Configurar
  useEffect(() => {
    function onOpen() {
      const c = readConsent();
      if (c) {
        setAnalytics(c.analytics);
        setMarketing(c.marketing);
      }
      setModalOpen(true);
    }
    window.addEventListener("open-cookie-settings", onOpen);
    return () => window.removeEventListener("open-cookie-settings", onOpen);
  }, []);

  // ESC cierra el modal + lock scroll del body
  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModalOpen(false);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  function acceptAll() {
    saveConsent({ analytics: true, marketing: true });
    setAnalytics(true);
    setMarketing(true);
    setBannerOpen(false);
    setModalOpen(false);
  }
  function rejectAll() {
    saveConsent({ analytics: false, marketing: false });
    setAnalytics(false);
    setMarketing(false);
    setBannerOpen(false);
    setModalOpen(false);
  }
  function saveCurrent() {
    saveConsent({ analytics, marketing });
    setBannerOpen(false);
    setModalOpen(false);
  }

  return (
    <>
      <div
        id="cookieBanner"
        className={`cookie-banner${bannerOpen ? " is-open" : ""}`}
        role="dialog"
        aria-label="Aviso de cookies"
        aria-live="polite"
      >
        <div className="cookie-banner-text">
          <strong>Cookies en EvangelCake 🍰</strong>
          <p>
            Usamos cookies técnicas para que la web funcione. Si quieres,
            también podemos usar analíticas para mejorar la experiencia. Tú
            decides. <Link href="/cookies">Más info</Link>.
          </p>
        </div>
        <div className="cookie-banner-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={rejectAll}
          >
            Solo necesarias
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setModalOpen(true)}
          >
            Configurar
          </button>
          <button type="button" className="btn" onClick={acceptAll}>
            Aceptar todas
          </button>
        </div>
      </div>

      <div
        id="cookieModal"
        className={`cookie-modal${modalOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookieModalTitle"
        onClick={(e) => {
          if (e.target === e.currentTarget) setModalOpen(false);
        }}
      >
        <div className="cookie-modal-box" role="document">
          <h2 id="cookieModalTitle">
            Configura tus <em>cookies.</em>
          </h2>
          <p>
            Activa o desactiva las categorías de cookies según tus preferencias.
            Las técnicas son obligatorias para que el sitio funcione.
          </p>

          <div className="cookie-pref">
            <div className="cookie-pref-info">
              <b>Cookies técnicas</b>
              <span>
                Imprescindibles para el funcionamiento del sitio (preferencias,
                navegación, formularios).
              </span>
              <span className="req">Siempre activas</span>
            </div>
            <div
              className="toggle on locked"
              aria-label="Cookies técnicas — siempre activas"
              role="switch"
              aria-checked="true"
              aria-disabled="true"
            />
          </div>

          <div className="cookie-pref">
            <div className="cookie-pref-info">
              <b>Cookies analíticas</b>
              <span>
                Nos ayudan a entender cómo usas la web (páginas más visitadas,
                tiempo, etc.) para mejorarla. Anónimas.
              </span>
            </div>
            <div
              className={`toggle${analytics ? " on" : ""}`}
              role="switch"
              tabIndex={0}
              aria-checked={analytics}
              aria-label="Cookies analíticas"
              onClick={() => setAnalytics((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  setAnalytics((v) => !v);
                }
              }}
            />
          </div>

          <div className="cookie-pref">
            <div className="cookie-pref-info">
              <b>Cookies de marketing</b>
              <span>
                Para mostrarte publicidad relevante en otras webs (Meta Pixel,
                Google Ads, etc.). Actualmente no activas.
              </span>
            </div>
            <div
              className={`toggle${marketing ? " on" : ""}`}
              role="switch"
              tabIndex={0}
              aria-checked={marketing}
              aria-label="Cookies de marketing"
              onClick={() => setMarketing((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  setMarketing((v) => !v);
                }
              }}
            />
          </div>

          <div className="cookie-modal-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={rejectAll}
            >
              Rechazar todas
            </button>
            <button type="button" className="btn" onClick={saveCurrent}>
              Guardar mis elecciones
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
