"use client";

/**
 * Dulci's Sweet Challenge — versión React/Next.js
 * - Canvas 2D + pointer events + teclado
 * - Object pooling para 60fps estables
 * - Ranking persistido vía /api/ranking (Supabase)
 * - Registro vía /api/newsletter (Supabase + email Resend con código descuento)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { getSubscribedEmail, saveSubscribedEmail } from "@/lib/subscriberLocal";
import { track } from "@/lib/track";

// ===== Config =====
const CONFIG: {
  GAME_DURATION: number;
  SPAWN_MIN: number;
  SPAWN_MAX: number;
  SPAWN_END_MIN: number;
  SPAWN_END_MAX: number;
  BOMB_PROBABILITY: number;
  FALL_SPEED_START: number;
  FALL_SPEED_END: number;
  DULCI_WIDTH_PCT: number;
  OBJECT_WIDTH_PCT: number;
  POINTS_CAKE: number;
  POINTS_BOMB: number;
  LS_KEY: string;
} = {
  GAME_DURATION: 30,
  // Spawn más rápido: caen muchos más objetos por segundo
  SPAWN_MIN: 320,
  SPAWN_MAX: 600,
  SPAWN_END_MIN: 160,
  SPAWN_END_MAX: 320,
  // Más bombas (antes 0.28 ≈ 1 de cada 3.5 era bomba; ahora ≈ 1 de cada 2.5)
  BOMB_PROBABILITY: 0.4,
  FALL_SPEED_START: 2.8,
  FALL_SPEED_END: 6.4,
  DULCI_WIDTH_PCT: 0.18,
  OBJECT_WIDTH_PCT: 0.1,
  POINTS_CAKE: 10,
  // Penalización mucho mayor por bomba (era -20)
  POINTS_BOMB: -40,
  LS_KEY: "evangelcake_player_v2",
};

const CAKE_EMOJIS = ["🍰", "🧁", "🍩", "🍪", "🥮", "🎂"];
const BOMB_EMOJI = "💣";

type Player = {
  name: string;
  email: string;
  bestScore: number;
};

type Screen = "preview" | "register" | "welcome" | "countdown" | "play" | "result";

interface GameProps {
  embed?: boolean;
}

type RankEntry = { name: string; email: string; score: number };

type FallingObject = {
  type: "cake" | "bomb";
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  cakeVariant: number;
  alive: boolean;
};

export default function Game({ embed = false }: GameProps = {}) {
  // Empezamos siempre en "preview" — jugar primero, registrar al final
  // si el jugador quiere entrar al ranking + llevarse el 5%.
  const [screen, setScreen] = useState<Screen>("preview");
  const [player, setPlayer] = useState<Player | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(CONFIG.GAME_DURATION);
  const [countdownText, setCountdownText] = useState("3");
  const [position, setPosition] = useState<number | null>(null);
  const [topRank, setTopRank] = useState<RankEntry[]>([]);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regBirthday, setRegBirthday] = useState("");
  const [regConsent, setRegConsent] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");

  // Auto-detección: si el email tecleado ya está registrado, ofrecemos saltarse el form
  const [returningName, setReturningName] = useState<string | null>(null);

  // Debounce la consulta al backend para no spamear con cada tecla
  useEffect(() => {
    if (screen !== "register") return;
    const email = regEmail.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setReturningName(null);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/player/lookup?email=${encodeURIComponent(email)}`,
          { signal: ctrl.signal },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.found && data.name) {
          setReturningName(data.name);
        } else {
          setReturningName(null);
        }
      } catch {
        // silencio
      }
    }, 500);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [regEmail, screen]);

  async function skipRegister() {
    if (!returningName) return;
    const email = regEmail.toLowerCase().trim();
    const restored: Player = { name: returningName, email, bestScore: 0 };
    setPlayer(restored);
    localStorage.setItem(CONFIG.LS_KEY, JSON.stringify(restored));
    fetchPosition(email);
    await startGame(restored);
  }

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    running: false,
    cw: 0,
    ch: 0,
    dulci: { x: 0, y: 0, w: 0, h: 0, target: 0 },
    objects: [] as FallingObject[],
    pool: [] as FallingObject[],
    particles: [] as { x: number; y: number; text: string; type: string; life: number; maxLife: number }[],
    lastSpawn: 0,
    nextSpawnIn: 400,
    lastTime: 0,
    gameStartedAt: 0,
    rafId: 0,
    score: 0,
    timeLeft: CONFIG.GAME_DURATION,
    shakeFrames: 0,
  });

  // Load player from localStorage en silencio (no cambiamos pantalla).
  // Si lo encontramos, el primer click arranca partida directa con su identidad.
  // Si no, el click arranca partida anónima y le pedimos registro al acabar.
  //
  // Si el usuario NO tiene player pero SÍ tiene email guardado de cuando se
  // suscribió a la newsletter (popup/home/footer/blog), precargamos el email
  // en el form post-partida y marcamos el consent — solo le falta poner nombre.
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Helper: si conseguimos nombre + email, restauramos al player completo
    // (así el banner post-partida NO vuelve a salir).
    function restorePlayer(email: string, name: string) {
      const restored: Player = { name, email, bestScore: 0 };
      setPlayer(restored);
      localStorage.setItem(CONFIG.LS_KEY, JSON.stringify(restored));
      saveSubscribedEmail(email);
      fetchPosition(email);
    }

    // 1. localStorage con Player completo (vía rápida, sin fetch)
    try {
      const raw = localStorage.getItem(CONFIG.LS_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Player;
        if (p?.email && p?.name) {
          setPlayer(p);
          fetchPosition(p.email);
          return;
        }
      }
    } catch {}

    // 2. Tenemos email en localStorage → lookup en BD por nombre
    const savedEmail = getSubscribedEmail();
    if (savedEmail) {
      (async () => {
        try {
          const res = await fetch(
            `/api/player/lookup?email=${encodeURIComponent(savedEmail)}`,
            { cache: "no-store" },
          );
          if (res.ok) {
            const data = await res.json();
            if (data.found && data.name) {
              restorePlayer(savedEmail, data.name);
              return;
            }
          }
        } catch {}
        // Lookup falló → al menos precargamos email + consent
        setRegEmail(savedEmail);
        setRegConsent(true);
      })();
      return;
    }

    // 3. Ni Player ni email en localStorage (incógnito, caché borrada…)
    //    → probamos la COOKIE firmada vía /api/identify. Sobrevive aunque
    //    el visitante haya limpiado el localStorage.
    (async () => {
      try {
        const res = await fetch("/api/identify", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.found && data.email) {
          if (data.name) {
            restorePlayer(data.email, data.name);
          } else {
            // Tenemos email vía cookie pero sin nombre → precarga el form mini
            saveSubscribedEmail(data.email);
            setRegEmail(data.email);
            setRegConsent(true);
          }
        }
      } catch {}
    })();
  }, []);

  async function fetchPosition(email: string) {
    try {
      const res = await fetch(
        `/api/ranking?email=${encodeURIComponent(email)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data?.position) setPosition(data.position);
    } catch {}
  }

  // ===== Registro =====
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");
    if (regName.trim().length < 2) {
      setRegError("Pon un nombre, aunque sea solo el primero.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      setRegError("Ese email no parece válido.");
      return;
    }
    if (!regConsent) {
      setRegError("Marca la casilla para entrar en el ranking.");
      return;
    }

    setRegLoading(true);
    try {
      // Crear subscriber en backend (manda email con código)
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          source: "game",
          consent: regConsent,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error de registro");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo completar el registro.";
      setRegError(message);
      setRegLoading(false);
      return;
    }

    const newPlayer: Player = {
      name: regName.trim(),
      email: regEmail.toLowerCase().trim(),
      bestScore: 0,
    };
    setPlayer(newPlayer);
    localStorage.setItem(CONFIG.LS_KEY, JSON.stringify(newPlayer));
    setRegLoading(false);
    await startGame(newPlayer);
  }

  function logout() {
    if (!confirm("¿Salir y jugar como otro?")) return;
    localStorage.removeItem(CONFIG.LS_KEY);
    setPlayer(null);
    setRegName("");
    setRegEmail("");
    setRegConsent(false);
    setScreen("preview");
  }

  // ===== Canvas setup =====
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      const s = stateRef.current;
      s.cw = rect.width;
      s.ch = rect.height;
      const dw = s.cw * CONFIG.DULCI_WIDTH_PCT;
      const dh = dw * 1.25;
      s.dulci.w = dw;
      s.dulci.h = dh;
      s.dulci.x = (s.cw - dw) / 2;
      s.dulci.y = s.ch - dh - 12;
      s.dulci.target = s.dulci.x;
    }
    resize();
    window.addEventListener("resize", resize);

    let dragging = false;
    const setTarget = (clientX: number) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const s = stateRef.current;
      s.dulci.target = Math.max(0, Math.min(s.cw - s.dulci.w, x - s.dulci.w / 2));
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      canvas.setPointerCapture(e.pointerId);
      setTarget(e.clientX);
    };
    const onMove = (e: PointerEvent) => {
      if (dragging) setTarget(e.clientX);
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      try { canvas.releasePointerCapture(e.pointerId); } catch {}
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", () => { dragging = false; });

    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (!s.running) return;
      const step = s.cw * 0.06;
      if (e.key === "ArrowLeft")
        s.dulci.target = Math.max(0, s.dulci.x - step);
      else if (e.key === "ArrowRight")
        s.dulci.target = Math.min(s.cw - s.dulci.w, s.dulci.x + step);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // ===== Game logic =====
  function aabb(a: FallingObject, b: typeof stateRef.current.dulci, padding = 0.85) {
    const ax = a.x + (a.w * (1 - padding)) / 2;
    const ay = a.y + (a.h * (1 - padding)) / 2;
    const aw = a.w * padding;
    const ah = a.h * padding;
    const bx = b.x + b.w * 0.1;
    const by = b.y + b.h * 0.2;
    const bw = b.w * 0.8;
    const bh = b.h * 0.7;
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function spawnObject() {
    const s = stateRef.current;
    const isBomb = Math.random() < CONFIG.BOMB_PROBABILITY;
    const w = s.cw * CONFIG.OBJECT_WIDTH_PCT;
    const h = w;
    const obj: FallingObject = s.pool.pop() || {
      type: "cake", x: 0, y: 0, w: 0, h: 0, vy: 0,
      rot: 0, rotSpeed: 0, cakeVariant: 0, alive: false,
    };
    obj.type = isBomb ? "bomb" : "cake";
    obj.x = Math.random() * (s.cw - w);
    obj.y = -h - Math.random() * 40;
    obj.w = w;
    obj.h = h;
    const t = 1 - s.timeLeft / CONFIG.GAME_DURATION;
    obj.vy =
      CONFIG.FALL_SPEED_START +
      (CONFIG.FALL_SPEED_END - CONFIG.FALL_SPEED_START) * t +
      Math.random() * 0.8;
    obj.rot = (Math.random() - 0.5) * 0.4;
    obj.rotSpeed = (Math.random() - 0.5) * 0.04;
    obj.cakeVariant = Math.floor(Math.random() * CAKE_EMOJIS.length);
    obj.alive = true;
    s.objects.push(obj);
  }

  function update(dt: number) {
    const s = stateRef.current;
    const dx = s.dulci.target - s.dulci.x;
    s.dulci.x += dx * 0.22;

    s.lastSpawn += dt;
    if (s.lastSpawn >= s.nextSpawnIn) {
      spawnObject();
      s.lastSpawn = 0;
      const t = 1 - s.timeLeft / CONFIG.GAME_DURATION;
      const minMs = CONFIG.SPAWN_MIN - (CONFIG.SPAWN_MIN - CONFIG.SPAWN_END_MIN) * t;
      const maxMs = CONFIG.SPAWN_MAX - (CONFIG.SPAWN_MAX - CONFIG.SPAWN_END_MAX) * t;
      s.nextSpawnIn = minMs + Math.random() * (maxMs - minMs);
    }

    for (let i = s.objects.length - 1; i >= 0; i--) {
      const o = s.objects[i];
      if (!o.alive) continue;
      o.y += o.vy * (dt / 16.67);
      o.rot += o.rotSpeed * (dt / 16.67);

      if (aabb(o, s.dulci)) {
        if (o.type === "cake") {
          s.score += CONFIG.POINTS_CAKE;
          s.particles.push({
            x: o.x + o.w / 2, y: o.y + o.h / 2,
            text: "+10", type: "cake",
            life: 700, maxLife: 700,
          });
        } else {
          s.score = Math.max(0, s.score + CONFIG.POINTS_BOMB);
          s.particles.push({
            x: o.x + o.w / 2, y: o.y + o.h / 2,
            text: "-40", type: "bomb",
            life: 700, maxLife: 700,
          });
          s.shakeFrames = 10;
        }
        s.objects.splice(i, 1);
        o.alive = false;
        s.pool.push(o);
        continue;
      }
      if (o.y > s.ch + 20) {
        s.objects.splice(i, 1);
        o.alive = false;
        s.pool.push(o);
      }
    }

    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.life -= dt;
      p.y -= 0.6 * (dt / 16.67);
      if (p.life <= 0) s.particles.splice(i, 1);
    }
  }

  function render() {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    if (s.shakeFrames > 0) {
      const off = s.shakeFrames * 0.8;
      ctx.translate((Math.random() - 0.5) * off, (Math.random() - 0.5) * off);
      s.shakeFrames--;
    }
    ctx.clearRect(0, 0, s.cw, s.ch);

    for (const o of s.objects) {
      if (!o.alive) continue;
      ctx.save();
      ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
      ctx.rotate(o.rot);
      ctx.font = `${o.w}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(o.type === "cake" ? CAKE_EMOJIS[o.cakeVariant] : BOMB_EMOJI, 0, 0);
      ctx.restore();
    }

    // Dulci con imagen mascot
    const d = s.dulci;
    if (dulciImageRef.current?.complete) {
      ctx.drawImage(dulciImageRef.current, d.x, d.y, d.w, d.h);
    } else {
      ctx.fillStyle = "#f4b8d0";
      ctx.beginPath();
      ctx.arc(d.x + d.w / 2, d.y + d.h / 2, d.w / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const p of s.particles) {
      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = "600 22px Inter,sans-serif";
      ctx.fillStyle = p.type === "cake" ? "#e85a9a" : "#c0392b";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
    }

    ctx.restore();
  }

  const dulciImageRef = useRef<HTMLImageElement | null>(null);

  async function startGame(p: Player | null) {
    track("game_start", {
      email: p?.email,
      meta: { embed, hasPlayer: !!p },
    });
    setScreen("countdown");
    const s = stateRef.current;
    s.score = 0;
    s.timeLeft = CONFIG.GAME_DURATION;
    s.objects.length = 0;
    s.particles.length = 0;
    s.lastSpawn = 0;
    s.nextSpawnIn = 400;
    s.running = false;
    setScore(0);
    setTimeLeft(CONFIG.GAME_DURATION);

    for (const txt of ["3", "2", "1", "¡YA!"]) {
      setCountdownText(txt);
      await new Promise((r) => setTimeout(r, 800));
    }

    setScreen("play");
    requestAnimationFrame(() => {
      setupCanvas();
      window.dispatchEvent(new Event("resize"));
      s.running = true;
      s.gameStartedAt = performance.now();
      s.lastTime = s.gameStartedAt;
      loop(s.gameStartedAt, p);
    });
  }

  function loop(now: number, p: Player | null) {
    const s = stateRef.current;
    if (!s.running) return;
    const dt = Math.min(now - s.lastTime, 50);
    s.lastTime = now;
    const elapsed = (now - s.gameStartedAt) / 1000;
    s.timeLeft = Math.max(0, CONFIG.GAME_DURATION - elapsed);
    setTimeLeft(Math.ceil(s.timeLeft));
    setScore(s.score);
    update(dt);
    render();
    if (s.timeLeft <= 0) {
      endGame(p);
      return;
    }
    s.rafId = requestAnimationFrame((t) => loop(t, p));
  }

  async function endGame(p: Player | null) {
    const s = stateRef.current;
    s.running = false;
    cancelAnimationFrame(s.rafId);

    const finalScore = Math.max(0, s.score);
    track("game_complete", {
      email: p?.email,
      meta: { score: finalScore, anonymous: !p },
    });

    if (!p) {
      // Partida anónima: vamos a la pantalla de resultados con formulario.
      // El score se guardará si el jugador decide registrarse.
      setScreen("result");
      return;
    }

    const newBest = Math.max(p.bestScore || 0, finalScore);
    const updated: Player = { ...p, bestScore: newBest };
    setPlayer(updated);
    localStorage.setItem(CONFIG.LS_KEY, JSON.stringify(updated));

    // Subir score al ranking
    try {
      const res = await fetch("/api/ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: p.email, name: p.name, score: finalScore }),
      });
      const data = await res.json();
      setPosition(data.position);
      setTopRank(data.top || []);
      setIsNewRecord(data.isNewRecord);
    } catch {
      setPosition(null);
      setTopRank([]);
    }
    setScreen("result");
  }

  // Registro post-partida (jugador anónimo que quiere entrar al ranking)
  async function registerAfterGame(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");
    if (regName.trim().length < 2) {
      setRegError("Pon un nombre, aunque sea solo el primero.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      setRegError("Ese email no parece válido.");
      return;
    }
    if (!regConsent) {
      setRegError("Marca la casilla para entrar en el ranking.");
      return;
    }

    setRegLoading(true);
    const email = regEmail.toLowerCase().trim();
    const name = regName.trim();

    try {
      // 1) Crear/actualizar subscriber (manda email con código del 5%)
      const newsRes = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          birthday: regBirthday || undefined,
          source: "game",
          consent: regConsent,
        }),
      });
      if (!newsRes.ok) {
        const data = await newsRes.json().catch(() => ({}));
        throw new Error(data.error || "Error de registro");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No se pudo completar el registro.";
      setRegError(message);
      setRegLoading(false);
      return;
    }

    const newPlayer: Player = { name, email, bestScore: score };
    setPlayer(newPlayer);
    localStorage.setItem(CONFIG.LS_KEY, JSON.stringify(newPlayer));

    // 2) Guardar score en ranking
    try {
      const res = await fetch("/api/ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, score }),
      });
      const data = await res.json();
      setPosition(data.position);
      setTopRank(data.top || []);
      setIsNewRecord(data.isNewRecord);
    } catch {
      setPosition(null);
      setTopRank([]);
    }
    setRegLoading(false);
  }

  async function shareResult() {
    const text = `🎂 He hecho ${score} puntos en Dulci's Sweet Challenge de EvangelCake${position ? ` (#${position} del mes)` : ""}. ¿Puedes superarme?`;
    const url = `${window.location.origin}/game`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Dulci's Sweet Challenge",
          text,
          url,
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      alert("¡Copiado al portapapeles!");
    } catch {
      alert(text + " " + url);
    }
  }

  // Preload mascota
  useEffect(() => {
    const img = new window.Image();
    img.src = "/images/mascot.png";
    dulciImageRef.current = img;
  }, []);

  const timeWarn = timeLeft <= 5;

  // "Jugar primero, registrar después": arranca la partida siempre.
  // Si el visitante ya está identificado (localStorage → player), se asocia
  // el score directamente. Si no, juega anónimo y al terminar le pedimos los
  // datos en la pantalla de resultado (con email pre-rellenado si viene de
  // una suscripción previa al newsletter).
  function onPlayFromPreview() {
    startGame(player);
  }

  const overlayScreens: Screen[] = ["result"];
  const playScreens: Screen[] = ["countdown", "play"];

  const content = (
    <>
      {screen === "preview" && embed && (
        <div className="game-embed-preview" aria-label="Vista previa del juego">
          <span className="game-embed-preview-cake c1" aria-hidden="true">🍰</span>
          <span className="game-embed-preview-cake c2" aria-hidden="true">🧁</span>
          <span className="game-embed-preview-cake c3" aria-hidden="true">🍩</span>
          <span className="game-embed-preview-cake c4" aria-hidden="true">🎂</span>
          <img
            className="game-embed-preview-dulci"
            src="/images/mascot.png"
            alt=""
            width={120}
            height={150}
            aria-hidden="true"
          />
          <button
            type="button"
            className="game-embed-play-btn"
            onClick={onPlayFromPreview}
            aria-label="Jugar a Dulci's Sweet Challenge"
          >
            <span className="play-icon" aria-hidden="true">▶</span>
            ¡Jugar!
          </button>
        </div>
      )}

      {screen === "preview" && !embed && (
        <section className="game-screen">
          <div className="game-card">
            <div className="game-mascot-mini">
              <img src="/images/mascot.png" alt="Dulci, mascota de EvangelCake" width={120} height={150} />
            </div>
            <span className="game-eyebrow">Listo cuando tú</span>
            <h2>Dulci&apos;s Sweet Challenge</h2>
            <p className="game-lede">
              30 segundos. Atrapa tartas, esquiva bombas. Tu score entra al
              ranking del mes y los <strong>3 mejores ganan una tarta personalizada gratis</strong>.
            </p>
            <button className="btn btn-pink game-cta" onClick={onPlayFromPreview}>
              ¡Jugar! →
            </button>
            <details className="game-howto">
              <summary>¿Cómo se juega?</summary>
              <ul>
                <li><strong>Móvil</strong>: desliza el dedo para mover a Dulci</li>
                <li><strong>Ordenador</strong>: ratón o teclas ← →</li>
                <li>🍰 Tarta = <strong>+10 puntos</strong></li>
                <li>💣 Bomba = <strong>-40 puntos</strong></li>
                <li>⏱ Tienes <strong>30 segundos</strong> por partida</li>
              </ul>
            </details>
            {player && (
              <p className="game-prize-note">
                Estás jugando como <strong>{player.name}</strong>. Tu récord: {player.bestScore}
              </p>
            )}
          </div>
        </section>
      )}

      {screen === "register" && (
        <section className="game-screen">
          <div className="game-card">
            <div className="game-mascot-mini">
              <img src="/images/mascot.png" alt="Dulci" width={120} height={150} />
            </div>
            <span className="game-eyebrow">Antes de jugar…</span>
            <h2>¿Cómo te llamamos en el ranking?</h2>
            <p className="game-lede">
              Atrapa tartas, esquiva bombas y entra en la lista del mes. Los{" "}
              <strong>3 mejores ganan una tarta personalizada gratis</strong>. Al
              registrarte te mandamos un <strong>código del 5%</strong> para tu
              próxima tarta.
            </p>
            <form className="game-form" onSubmit={handleRegister} noValidate>
              <label className="game-field">
                <span>Tu nombre</span>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="María, Carlos…"
                  required
                  maxLength={40}
                />
              </label>
              <label className="game-field">
                <span>Tu email</span>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </label>
              <label className="game-check">
                <input
                  type="checkbox"
                  checked={regConsent}
                  onChange={(e) => setRegConsent(e.target.checked)}
                  required
                />
                <span>
                  Acepto recibir el newsletter de EvangelCake. Sin spam, solo
                  cosas buenas. <a href="/privacidad" target="_blank">Privacidad</a>.
                </span>
              </label>
              <button type="submit" className="btn btn-pink game-cta" disabled={regLoading}>
                {regLoading ? "Creando tu cuenta…" : "¡Empezar a jugar! →"}
              </button>
              {regError && <p className="game-error">{regError}</p>}
            </form>

            {returningName && (
              <div className="game-returning" role="status">
                <div>
                  <strong>¡Te reconocemos, {returningName}!</strong>
                  <span>
                    Este email ya está registrado. Salta el formulario y juega
                    directamente.
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-pink"
                  onClick={skipRegister}
                >
                  Entrar y jugar →
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {screen === "welcome" && player && (
        <section className="game-screen">
          <div className="game-card">
            <span className="game-eyebrow">¡Hola otra vez!</span>
            <h2>Bienvenido de vuelta, <span>{player.name}</span></h2>
            <div className="game-stats-row">
              <div className="game-stat">
                <span className="game-stat-num">{player.bestScore || 0}</span>
                <span className="game-stat-lbl">Tu récord</span>
              </div>
              <div className="game-stat">
                <span className="game-stat-num">{position ? `#${position}` : "—"}</span>
                <span className="game-stat-lbl">Tu posición</span>
              </div>
            </div>
            <button className="btn btn-pink game-cta" onClick={() => startGame(player)}>
              ¡Jugar! →
            </button>
            <button className="game-cta-mini" onClick={logout}>
              Salir como otro jugador
            </button>
          </div>
        </section>
      )}

      {screen === "countdown" && (
        <section className="game-screen game-screen-countdown">
          <div className="countdown-number" key={countdownText}>
            {countdownText}
          </div>
        </section>
      )}

      {screen === "play" && (
        <section className="game-screen game-screen-play">
          <div className="game-hud">
            <div className={"hud-stat" + (timeWarn ? " hud-time-warning" : "")}>
              <span className="hud-lbl">Tiempo</span>
              <span className="hud-val">{timeLeft}</span>
            </div>
            <div className="hud-stat hud-score">
              <span className="hud-lbl">Puntos</span>
              <span className="hud-val">{score}</span>
            </div>
          </div>
          <canvas ref={canvasRef} id="gameCanvas" aria-label="Área de juego" />
        </section>
      )}

      {screen === "result" && !player && (
        <section className="game-screen">
          <div className="game-card game-card-compact">
            <h2 className="game-card-compact-title">
              <span>{score}</span> pts · ¿Entras al ranking?
            </h2>
            <p className="game-card-compact-sub">
              Los 3 mejores del mes ganan tarta gratis + código 5% al registrarte.
            </p>
            <form className="game-form game-form-inline" onSubmit={registerAfterGame} noValidate>
              <div className="game-form-row">
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  maxLength={40}
                  aria-label="Tu nombre"
                />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  aria-label="Tu email"
                />
              </div>
              <label className="game-check game-check-compact">
                <input
                  type="checkbox"
                  checked={regConsent}
                  onChange={(e) => setRegConsent(e.target.checked)}
                  required
                />
                <span>
                  Acepto el newsletter. <a href="/privacidad" target="_blank">Privacidad</a>.
                </span>
              </label>
              <button
                type="submit"
                className="btn btn-pink game-cta game-cta-compact"
                disabled={regLoading}
              >
                {regLoading ? "Guardando…" : "Guardar mi score →"}
              </button>
              {regError && <p className="game-error">{regError}</p>}
            </form>
          </div>
        </section>
      )}

      {screen === "result" && player && (
        <section className="game-screen">
          <div className="game-card">
            <span className="game-eyebrow">
              {isNewRecord ? "¡Nuevo récord!" : "¡Partida terminada!"}
            </span>
            <h2>Has hecho <span>{score}</span> puntos</h2>
            <p className="game-lede">
              {position === 1
                ? "🥇 Estás en cabeza del ranking del mes."
                : position && position <= 3
                ? `🏆 Top ${position} del mes — vas camino de tu tarta gratis.`
                : isNewRecord
                ? "¡Has mejorado tu récord personal!"
                : "Buen intento. La práctica hace al maestro pastelero."}
            </p>
            <div className="game-position-box">
              <span>Tu posición del mes</span>
              <strong>{position ? `#${position}` : "#—"}</strong>
            </div>
            {topRank.length > 0 && (
              <div className="game-ranking-mini">
                <h4>🏆 Top del mes</h4>
                <ol>
                  {topRank.slice(0, 5).map((r, i) => {
                    const isMe = r.email === player.email;
                    return (
                      <li key={i} className={isMe ? "rank-me" : ""}>
                        <span className="rank-name">{r.name}</span>
                        <span className="rank-score">{r.score} pts</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
            <div className="game-result-ctas">
              <button className="btn btn-pink game-cta" onClick={() => startGame(player)}>
                Jugar otra vez →
              </button>
              <button className="btn btn-secondary" onClick={shareResult}>
                Compartir resultado
              </button>
            </div>
            <p className="game-prize-note">
              🏆 Los 3 primeros del mes ganan una tarta personalizada gratis.
            </p>
            <a className="game-back-home" href="/">← Volver a la home</a>
          </div>
        </section>
      )}
    </>
  );

  if (embed) {
    const isOverlay = overlayScreens.includes(screen);
    const isPlay = playScreens.includes(screen);
    return (
      <div className="game-embed">
        {/* Cuando el overlay (banner) está arriba, dejamos el primer frame del
            juego de fondo para mantener el contexto visual. */}
        {isOverlay && (
          <div className="game-embed-preview" aria-hidden="true">
            <span className="game-embed-preview-cake c1">🍰</span>
            <span className="game-embed-preview-cake c2">🧁</span>
            <span className="game-embed-preview-cake c3">🍩</span>
            <span className="game-embed-preview-cake c4">🎂</span>
            <img
              className="game-embed-preview-dulci"
              src="/images/mascot.png"
              alt=""
              width={120}
              height={150}
            />
          </div>
        )}
        {isOverlay ? (
          <div className="game-embed-overlay" role="dialog" aria-modal="true">
            {content}
          </div>
        ) : isPlay ? (
          content
        ) : (
          content
        )}
      </div>
    );
  }

  return content;
}
