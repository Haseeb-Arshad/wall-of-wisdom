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
  const [msg, setMsg] = useState<string | null>(null);

  async function oauth(provider: "google" | "apple" | "twitter") {
    setMsg(null);
    if (!supabase) {
      setMsg("Auth not configured");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) setMsg(error.message);
  }
  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-title">enter notédex</div>

        <button className="auth-pill" onClick={() => oauth("google")}>
          <span className="icon">
            <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.9-6.9C35.9 2.4 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.22 6.38C12.53 13.05 17.75 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.62-.15-3.18-.44-4.68H24v9.08h12.7c-.55 2.98-2.24 5.51-4.76 7.2l7.3 5.67C43.8 38.38 46.5 31.93 46.5 24.5z"/>
              <path fill="#FBBC05" d="M10.78 19.6l-8.22-6.38C.9 16.57 0 20.2 0 24c0 3.8.9 7.43 2.56 10.78l8.22-6.38C9.87 26.34 9.5 25.2 9.5 24s.37-2.34 1.28-4.4z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.94-2.14 15.92-5.84l-7.3-5.67C30.39 38.5 27.4 39.5 24 39.5c-6.25 0-11.47-3.55-13.22-8.68l-8.22 6.38C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
          </span>
          Google
        </button>

        <button className="auth-pill" onClick={() => oauth("apple")}>
          <span className="icon">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path fill="#000" d="M16.365 1.43c0 1.14-.456 2.2-1.206 3.028-.77.855-2.028 1.524-3.14 1.43-.14-1.09.41-2.227 1.16-3.056.77-.855 2.12-1.5 3.186-1.402zM20.998 17.4c-.59 1.37-.88 1.976-1.656 3.19-1.072 1.677-2.316 3.775-3.995 3.803-1.682.03-2.12-1.228-4.42-1.217-2.301.01-2.786 1.246-4.47 1.216-1.68-.03-2.968-1.9-4.04-3.577C.94 18.54-.39 14.2 1.663 11.11c1.083-1.66 3.01-2.71 4.89-2.68 1.713.026 3.33 1.187 4.42 1.187 1.09 0 3.04-1.468 5.127-1.25.874.036 3.33.353 4.905 2.668-4.33 2.37-3.63 7.63-.007 6.363z"/>
            </svg>
          </span>
          Apple Id
        </button>

        <button className="auth-pill dark" onClick={() => oauth("twitter")}>
          <span className="icon">✕</span>
          The Everything App
        </button>

        {msg && <div className="auth-hint">{msg}</div>}
        <div className="auth-hint">By continuing you agree to our <a href="/privacy">privacy</a>.</div>
      </div>
    </div>
  );
}
