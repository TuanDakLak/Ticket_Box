"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  MailCheck,
  XCircle,
} from "lucide-react";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { AuthAlert } from "@/components/auth/auth-alert";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/utils/error.utils";

type VerifyState = "loading" | "success" | "error" | "no-token";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams?.get("token") ?? null, [searchParams]);
  const [state, setState] = useState<VerifyState>(token ? "loading" : "no-token");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    window.history.replaceState({}, document.title, window.location.pathname);

    const run = async () => {
      try {
        const res = await authService.verifyEmail(token);
        setMessage(res.message);
        setState("success");
      } catch (err: unknown) {
        setMessage(getErrorMessage(err));
        setState("error");
      }
    };

    run();
  }, [token]);

  if (state === "loading") {
    return (
      <AuthCardLayout>
        <div className="tb-card text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-light">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Đang xác thực email</h1>
          <p className="mt-3 text-muted-foreground">
            Vui lòng đợi trong giây lát, chúng tôi đang kích hoạt tài khoản của bạn...
          </p>
        </div>
      </AuthCardLayout>
    );
  }

  if (state === "success") {
    return (
      <AuthCardLayout>
        <div className="tb-card text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-14 w-14 text-success" />
          </div>
          <h1 className="text-3xl font-bold">Kích hoạt thành công!</h1>
          <p className="mt-3 text-muted-foreground">
            {message || "Tài khoản của bạn đã được xác thực. Bạn có thể đăng nhập ngay bây giờ."}
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/login?verified=1" className="tb-btn-primary">
              Đăng nhập ngay
            </Link>
            <Link href="/catalog" className="tb-btn-outline">
              Khám phá sự kiện
            </Link>
          </div>
        </div>
      </AuthCardLayout>
    );
  }

  if (state === "error") {
    return (
      <AuthCardLayout>
        <div className="tb-card text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-14 w-14 text-error" />
          </div>
          <h1 className="text-2xl font-bold">Xác thực thất bại</h1>
          <div className="mt-4">
            <AuthAlert variant="error">{message}</AuthAlert>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Liên kết có thể đã hết hạn (1 giờ) hoặc đã được sử dụng trước đó.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/resend-verification" className="tb-btn-primary">
              Gửi lại email xác thực
            </Link>
            <Link href="/login" className="tb-btn-outline">
              Về trang đăng nhập
            </Link>
          </div>
        </div>
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout>
      <div className="tb-card text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-light">
          <MailCheck className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Xác thực email</h1>
        <p className="mt-3 text-muted-foreground">
          Không tìm thấy mã xác thực. Vui lòng mở liên kết từ email hoặc yêu cầu gửi lại.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/resend-verification" className="tb-btn-primary">
            Gửi lại email xác thực
          </Link>
          <Link href="/login" className="tb-btn-outline">
            Về trang đăng nhập
          </Link>
        </div>
      </div>
    </AuthCardLayout>
  );
}
