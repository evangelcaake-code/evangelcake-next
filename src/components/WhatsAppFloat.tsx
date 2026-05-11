"use client";

import { usePathname } from "next/navigation";

const SHORT = "https://wa.me/34624131348?text=Hola!";
const ENCARGO =
  "https://wa.me/34624131348?text=Hola!%20Quiero%20pedir%20una%20tarta%20personalizada";
const INFO =
  "https://wa.me/34624131348?text=Hola!%20Me%20gustar%C3%ADa%20informaci%C3%B3n%20sobre%20tartas%20personalizadas";

export default function WhatsAppFloat() {
  const pathname = usePathname();
  let href = ENCARGO;
  let label = "WhatsApp";
  if (pathname === "/") {
    href = INFO;
    label = "Contactar por WhatsApp";
  } else if (pathname === "/contacto" || pathname === "/encargos") {
    href = SHORT;
  }

  return (
    <a
      className="whatsapp-float"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    >
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 0C7.164 0 0 7.164 0 16c0 2.826.738 5.572 2.139 7.965L.069 31.31l7.516-1.97A15.936 15.936 0 0016 32c8.836 0 16-7.164 16-16S24.836 0 16 0zm8.28 22.506c-.36.986-1.786 1.808-2.926 2.052-.77.165-1.773.297-5.153-1.106-4.331-1.798-7.127-6.2-7.343-6.486-.216-.286-1.76-2.342-1.76-4.47 0-2.127 1.114-3.173 1.51-3.606.395-.432.864-.54 1.152-.54.288 0 .576.002.829.015.266.013.621-.1.973.742.36.863 1.229 3.002 1.337 3.22.108.216.18.469.036.755-.144.286-.216.465-.432.718-.216.252-.454.563-.648.756-.216.215-.44.45-.19.883.252.432 1.12 1.847 2.404 2.992 1.653 1.473 3.047 1.932 3.478 2.148.432.216.684.18.936-.108.252-.288 1.08-1.26 1.368-1.692.288-.432.576-.36.972-.216.397.144 2.518 1.188 2.95 1.404.432.216.72.324.828.504.108.18.108 1.044-.252 2.052z" />
      </svg>
    </a>
  );
}
