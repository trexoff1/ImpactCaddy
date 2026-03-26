import { Suspense } from "react";
import ScoresPageClient from "./ScoresPageClient";

export default function ScoresPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}><div className="loading-spinner" /></div>}>
      <ScoresPageClient />
    </Suspense>
  );
}
