import type { Route } from "./+types/wall";
import { StickyWall } from "../components/StickyWall";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sticky Wall" },
    { name: "description", content: "Arrange and study your cards." },
  ];
}

export default function WallRoute() {
  return (
    <section className="stack">
      <h1>Sticky Wall</h1>
      <p className="muted">Physics-based sticky notes with drag and toss.</p>
      <StickyWall />
    </section>
  );
}
