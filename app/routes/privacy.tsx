import type { Route } from "./+types/privacy";
import MinimalFrame from "../components/MinimalFrame";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Privacy" },
    { name: "description", content: "How we handle your uploaded documents and data." },
  ];
}

export default function PrivacyRoute() {
  return (
    <MinimalFrame ctaHref="/auth" ctaLabel="Sign In">
      <section className="stack" style={{ maxWidth: 800 }}>
        <h2>Privacy & Data</h2>
        <p>
          Your uploaded documents and generated cards stay on your device by default. We store decks, cards,
          and study sessions in your browser using IndexedDB to support offline sessions. If you enable cloud
          features later (e.g., Supabase sign-in), your content may be synced to your private account.
        </p>
        <ul>
          <li>Uploads: processed locally or via configured AI provider.</li>
          <li>AI: requests use your configured API key and are not retained by us.</li>
          <li>Controls: you can delete decks and export data at any time.</li>
        </ul>
        <p className="muted" style={{ fontSize: 12 }}>MVP draft. Subject to iteration.</p>
      </section>
    </MinimalFrame>
  );
}
