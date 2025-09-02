import type { Route } from "./+types/icons";

// 1x1 transparent PNG (base64)
const tinyPngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/UkJ9X8AAAAASUVORK5CYII=";

export function loader({ params }: Route.LoaderArgs) {
  const buf = Buffer.from(tinyPngBase64, "base64");
  return new Response(buf, {
    status: 200,
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=3600",
    },
  });
}

export default function IconsRoute() {
  // No UI; icon bytes served by loader
  return null;
}
