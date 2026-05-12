"use client";

import { track } from "@/lib/track";

interface Props {
  productName: string;
  waText: string;
}

export default function OrderButton({ productName, waText }: Props) {
  const waUrl = `https://wa.me/34624131348?text=${encodeURIComponent(waText)}`;

  function onClick() {
    track("cta_click", { meta: { product: productName, action: "whatsapp" } });
  }

  return (
    <a
      className="btn btn-pink product-cta"
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
    >
      <svg viewBox="0 0 32 32" width="20" height="20" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16 0C7.164 0 0 7.164 0 16c0 2.826.738 5.572 2.139 7.965L.069 31.31l7.516-1.97A15.936 15.936 0 0016 32c8.836 0 16-7.164 16-16S24.836 0 16 0zm8.28 22.506c-.36.986-1.786 1.808-2.926 2.052-.77.165-1.773.297-5.153-1.106-4.331-1.798-7.127-6.2-7.343-6.486-.216-.286-1.76-2.342-1.76-4.47 0-2.127 1.114-3.173 1.51-3.606.395-.432.864-.54 1.152-.54.288 0 .576.002.829.015.266.013.621-.1.973.742.36.863 1.229 3.002 1.337 3.22.108.216.18.469.036.755-.144.286-.216.465-.432.718-.216.252-.454.563-.648.756-.216.215-.44.45-.19.883.252.432 1.12 1.847 2.404 2.992 1.653 1.473 3.047 1.932 3.478 2.148.432.216.684.18.936-.108.252-.288 1.08-1.26 1.368-1.692.288-.432.576-.36.972-.216.397.144 2.518 1.188 2.95 1.404.432.216.72.324.828.504.108.18.108 1.044-.252 2.052z"
        />
      </svg>
      Pedir por WhatsApp
    </a>
  );
}
