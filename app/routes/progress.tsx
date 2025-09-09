import type { Route } from "./+types/progress";
import { redirect } from "react-router";

export function loader({}: Route.LoaderArgs) {
  return redirect("/#progress");
}

export default function ProgressRoute() {
  return null;
}

