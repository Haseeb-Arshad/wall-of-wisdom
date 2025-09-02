import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import "./styles/custom.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const isAuth = loc?.pathname?.startsWith("/auth");
  const isHome = loc?.pathname === "/";
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {!isAuth && !isHome && (
          <header className="ww-header">
            <nav className="ww-container ww-nav">
              <div className="ww-brand">
                <span>🧠</span>
                <span>WisdomWall</span>
              </div>
              <div className="ww-nav-links">
                <a className="ww-link" href="/">Home</a>
                <a className="ww-link" href="/wall">Wall</a>
                <a className="ww-link" href="/import">Import</a>
                <a className="ww-link" href="/decks">Decks</a>
                <a className="ww-link" href="/study">Study</a>
                <a className="ww-link" href="/progress">Progress</a>
                <a className="ww-link ww-cta" href="/auth">Sign In</a>
              </div>
            </nav>
          </header>
        )}
        <main className={isAuth || isHome ? "" : "ww-container"} style={isAuth || isHome ? undefined : { minHeight: "calc(100dvh - 64px)" }}>
          {children}
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
