"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";

/** Legacy route: redirects /verify?token= to /verify-email?token= */
export default function VerifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams?.get("token") ?? null, [searchParams]);

  useEffect(() => {
    if (token) {
      router.replace(`/verify-email?token=${encodeURIComponent(token)}`);
    } else {
      router.replace("/verify-email");
    }
  }, [token, router]);

  return (
    <AuthCardLayout mesh={false}>
      <div className="tb-card text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Đang chuyển hướng...</p>
      </div>
    </AuthCardLayout>
  );
}
