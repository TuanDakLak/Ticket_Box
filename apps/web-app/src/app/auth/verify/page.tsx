import { Suspense } from "react";
import VerifyClient from "@/app/verify/VerifyClient";

export default function AuthVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <VerifyClient />
    </Suspense>
  );
}
