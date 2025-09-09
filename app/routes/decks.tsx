import type { Route } from "./+types/decks";
import { redirect } from "react-router";

export function loader({}: Route.LoaderArgs) {
  return redirect("/#decks");
}

export default function DecksRoute() { return null; }
