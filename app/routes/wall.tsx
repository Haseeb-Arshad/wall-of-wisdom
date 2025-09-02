import type { Route } from "./+types/wall";

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
      <div id="wall-canvas" style={{ position: "relative", width: "100%", height: "70vh", borderRadius: 12, background: "#f6f2ea", overflow: "hidden" }}>
        {/* Cards will be rendered here in the next step */}
      </div>
    </section>
  );
}

