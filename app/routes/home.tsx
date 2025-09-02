import type { Route } from "./+types/home";
import Workspace from "../components/Workspace";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Workspace" },
    { name: "description", content: "Minimal knowledge space workspace" },
  ];
}

export default function Home() {
  return <Workspace />;
}
