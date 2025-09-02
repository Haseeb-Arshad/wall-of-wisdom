import type { Route } from "./+types/wall";
import { StickyWall } from "../components/StickyWall";
import MinimalFrame from "../components/MinimalFrame";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sticky Wall" },
    { name: "description", content: "Arrange and study your cards." },
  ];
}

export default function WallRoute() {
  return (
    <MinimalFrame ctaHref="/study" ctaLabel="Study">
      <section className="stack">
        <h2>Sticky Wall</h2>
        <p className="muted">Physics-based sticky notes with drag and toss.</p>
        <StickyWall />
      </section>
    </MinimalFrame>
  );
}
