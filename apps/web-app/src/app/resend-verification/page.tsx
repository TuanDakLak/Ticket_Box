import { Suspense } from "react";
import ResendVerificationClient from "./ResendVerificationClient";

export default function ResendVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">Loading...</div>
      }
    >
      <ResendVerificationClient />
    </Suspense>
  );
}
