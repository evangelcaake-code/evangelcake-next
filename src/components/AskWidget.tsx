"use client";

import { useState } from "react";

const CHIPS = [
  {
    label: "📅 Disponibilidad fecha",
    text: "Hola! ¿Tenéis disponibilidad para una tarta el {fecha}?",
  },
  {
    label: "💰 Pedir presupuesto",
    text: "Hola! ¿Cuánto costaría una tarta de {raciones} personas con diseño {tema}?",
  },
  {
    label: "🌱 Alergias e intolerancias",
    text: "Hola! ¿Podéis hacer una tarta sin gluten / sin lactosa / sin azúcar?",
  },
  {
    label: "🎉 Eventos grandes",
    text: "Hola! Quiero hacer un encargo grande para un evento de {número} personas. ¿Podríais ayudarme?",
  },
];

const MAX = 500;

export default function AskWidget() {
  const [text, setText] = useState("");
  const [activeChip, setActiveChip] = useState<number | null>(null);

  function pickChip(i: number) {
    setActiveChip(i);
    setText(CHIPS[i].text);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const url = `https://wa.me/34624131348?text=${encodeURIComponent(text.trim())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const overLimit = text.length >= MAX;

  return (
    <>
      <div className="ask-suggestions" aria-label="Preguntas sugeridas">
        {CHIPS.map((c, i) => (
          <button
            key={c.label}
            type="button"
            className={`ask-chip${activeChip === i ? " active" : ""}`}
            onClick={() => pickChip(i)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <form className="ask-form" onSubmit={onSubmit} noValidate>
        <label htmlFor="askInput" className="visually-hidden">
          Tu pregunta
        </label>
        <textarea
          id="askInput"
          rows={3}
          maxLength={MAX}
          placeholder="Escribe aquí tu duda y te respondemos por WhatsApp..."
          required
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setActiveChip(null);
          }}
        />
        <div className="ask-actions">
          <span className={`ask-count${overLimit ? " limit" : ""}`}>
            {text.length}/{MAX}
          </span>
          <button
            type="submit"
            className="btn btn-pink ask-send"
            disabled={!text.trim()}
          >
            <svg
              viewBox="0 0 32 32"
              width="16"
              height="16"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M16 0C7.164 0 0 7.164 0 16c0 2.826.738 5.572 2.139 7.965L.069 31.31l7.516-1.97A15.936 15.936 0 0016 32c8.836 0 16-7.164 16-16S24.836 0 16 0zm8.28 22.506c-.36.986-1.786 1.808-2.926 2.052-.77.165-1.773.297-5.153-1.106-4.331-1.798-7.127-6.2-7.343-6.486-.216-.286-1.76-2.342-1.76-4.47 0-2.127 1.114-3.173 1.51-3.606.395-.432.864-.54 1.152-.54.288 0 .576.002.829.015.266.013.621-.1.973.742.36.863 1.229 3.002 1.337 3.22.108.216.18.469.036.755-.144.286-.216.465-.432.718-.216.252-.454.563-.648.756-.216.215-.44.45-.19.883.252.432 1.12 1.847 2.404 2.992 1.653 1.473 3.047 1.932 3.478 2.148.432.216.684.18.936-.108.252-.288 1.08-1.26 1.368-1.692.288-.432.576-.36.972-.216.397.144 2.518 1.188 2.95 1.404.432.216.72.324.828.504.108.18.108 1.044-.252 2.052z" />
            </svg>
            Enviar por WhatsApp
          </button>
        </div>
        <p className="ask-foot">
          Tu pregunta abrirá WhatsApp con el mensaje pre-escrito. Sin
          compromiso.
        </p>
      </form>
    </>
  );
}
