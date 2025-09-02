import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/wall", "routes/wall.tsx"),
  route("/import", "routes/import.tsx"),
  route("/decks", "routes/decks.tsx"),
  route("/study", "routes/study.tsx"),
  route("/progress", "routes/progress.tsx"),
  route("/auth", "routes/auth.tsx"),
] satisfies RouteConfig;
