import type { Route } from "./+types/home";
import MinimalFrame from "../components/MinimalFrame";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Workspace" },
    { name: "description", content: "Minimal knowledge space workspace" },
  ];
}

export default function Home() {
  return (
    <MinimalFrame ctaHref="/import" ctaLabel="Import">
      <section className="stack">
        <h2>Welcome</h2>
        <p className="muted">Start by importing a document or open the wall.</p>
        <div className="row">
          <Link className="btn primary" to="/import">Import</Link>
          <Link className="btn" to="/wall">Open Wall</Link>
        </div>
      </section>
    </MinimalFrame>
  );
}
