import type { Route } from "./+types/import";
import { redirect } from "react-router";

export function loader({}: Route.LoaderArgs) {
  return redirect("/#import");
}

export default function ImportRoute() {
  return null;
}
