import type { Route } from "./+types/wall";
import { redirect } from "react-router";

export function loader({}: Route.LoaderArgs) {
  return redirect("/#wall");
}

export default function WallRoute() { return null; }
