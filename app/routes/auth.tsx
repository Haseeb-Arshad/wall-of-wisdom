import type { Route } from "./+types/auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign In" },
    { name: "description", content: "Email/Password or Google via Supabase." },
  ];
}

export default function AuthRoute() {
  return (
    <section className="stack">
      <h1>Sign In</h1>
      <p className="muted">Configure Supabase to enable authentication.</p>
      <div className="card" style={{ padding: 16, maxWidth: 440 }}>
        <div className="stack">
          <input className="card" placeholder="Email" type="email" style={{ padding: 10 }} />
          <input className="card" placeholder="Password" type="password" style={{ padding: 10 }} />
          <button className="btn primary">Sign In</button>
          <button className="btn">Continue with Google</button>
        </div>
      </div>
      <p className="muted" style={{ fontSize: 12 }}>By continuing you agree to the privacy notice and data terms.</p>
    </section>
  );
}

