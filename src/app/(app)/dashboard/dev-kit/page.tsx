import { notFound } from "next/navigation";

import { DevKit } from "./DevKit";

/** Every shared component in every state. Not built in production. */
export default function DevKitPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <DevKit />;
}
