import type { Metadata } from "next";
import Game from "@/components/Game";

export const metadata: Metadata = {
  title: "Dulci's Sweet Challenge · Juega y gana tu tarta gratis",
  description:
    "Atrapa tartas, esquiva bombas y entra en el ranking. Los 3 mejores del mes ganan una tarta personalizada gratis de EvangelCake Zaragoza.",
  openGraph: {
    title: "Dulci's Sweet Challenge — Gana una tarta gratis",
    description: "Compite en el juego de EvangelCake. Top 3 del mes se llevan una tarta personalizada.",
    images: ["/images/mascot.png"],
  },
};

export default function GamePage() {
  return (
    <div style={{ padding: "24px 16px", minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Game />
    </div>
  );
}
