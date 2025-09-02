import type { Route } from "./+types/manifest";

export function loader() {
  const manifest = {
    name: "WisdomWall",
    short_name: "WisdomWall",
    description: "Sticky-wall flashcards with AI and SRS",
    theme_color: "#ffffff",
    background_color: "#faf7f2",
    display: "standalone",
    icons: [
      { src: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "content-type": "application/manifest+json" },
  });
}

export default function ManifestRoute() {
  return null;
}

