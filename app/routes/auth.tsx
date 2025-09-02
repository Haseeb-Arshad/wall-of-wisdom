import type { Route } from "./+types/auth";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign In" },
    { name: "description", content: "Email/Password or Google via Supabase." },
  ];
}

export default function AuthRoute() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function signIn() {
    setMsg(null);
    if (!supabase) {
      setMsg("Supabase not configured.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMsg(error ? error.message : "Signed in.");
  }
  async function signInGoogle() {
    setMsg(null);
    if (!supabase) {
      setMsg("Supabase not configured.");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    setMsg(error ? error.message : "Redirecting to Google…");
  }
  return (
    <section className="stack">
      <h1>Sign In</h1>
      <p className="muted">Configure Supabase to enable authentication.</p>
      <div className="card" style={{ padding: 16, maxWidth: 440 }}>
        <div className="stack">
          <input className="card" placeholder="Email" type="email" style={{ padding: 10 }} value={email} onChange={(e) => setEmail((e.target as HTMLInputElement).value)} />
          <input className="card" placeholder="Password" type="password" style={{ padding: 10 }} value={password} onChange={(e) => setPassword((e.target as HTMLInputElement).value)} />
          <button className="btn primary" onClick={signIn}>Sign In</button>
          <button className="btn" onClick={signInGoogle}>Continue with Google</button>
        </div>
      </div>
      {msg && <p>{msg}</p>}
      <p className="muted" style={{ fontSize: 12 }}>By continuing you agree to the <a className="ww-link" href="/privacy">privacy notice</a> and data terms.</p>
    </section>
  );
}
