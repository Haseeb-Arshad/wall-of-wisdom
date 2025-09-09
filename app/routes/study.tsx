import type { Route } from "./+types/study";
import { redirect } from "react-router";

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const deck = url.searchParams.get("deck");
  const dest = deck ? `/?deck=${encodeURIComponent(deck)}#review` : "/#review";
  return redirect(dest);
}

export default function StudyRoute() {
  return null;
}

