"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { AuthAlert } from "@/components/auth/auth-alert";
import { PasswordField } from "@/components/auth/password-field";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/utils/error.utils";

function isUnverifiedAccountError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("kích hoạt") ||
    lower.includes("pending") ||
    lower.includes("xác thực") ||
    lower.includes("verified")
  );
}

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get("returnUrl") || "/dashboard";
  const verified = searchParams?.get("verified") === "1";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsVerification(false);

    try {
      const response = await authService.login(email, password);
      login(response.user);
      router.push(returnUrl);
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
      if (isUnverifiedAccountError(message)) setNeedsVerification(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      heroTitle="Hàng ghế đầu đang chờ bạn."
      heroDescription="Vé cho các sự kiện lớn nhất Việt Nam. Nhanh chóng, an toàn và luôn trong tầm tay."
    >
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
        <p className="mt-2 text-muted-foreground">Truy cập vé và sự kiện cá nhân của bạn.</p>
      </div>

      {verified && (
        <AuthAlert variant="success" title="Xác thực thành công">
          Tài khoản đã được kích hoạt. Bạn có thể đăng nhập ngay.
        </AuthAlert>
      )}

      {error && (
        <div className="mb-5">
          <AuthAlert variant="error">{error}</AuthAlert>
        </div>
      )}

      {needsVerification && (
        <div className="mb-5">
          <AuthAlert variant="warning" title="Tài khoản chưa được kích hoạt">
            Vui lòng kiểm tra hòm thư hoặc{" "}
            <Link
              href={`/resend-verification${email ? `?email=${encodeURIComponent(email)}` : ""}`}
              className="font-semibold text-primary hover:underline"
            >
              gửi lại email xác thực
            </Link>
            .
          </AuthAlert>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4">
        <button type="button" className="tb-btn-outline h-11" disabled>
          Google
        </button>
        <button type="button" className="tb-btn-outline h-11" disabled>
          Facebook
        </button>
      </div>

      <div className="tb-divider mb-8">
        <span>Hoặc đăng nhập bằng email</span>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div>
          <label className="tb-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="tb-input"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="tb-label mb-0" htmlFor="password">
              Mật khẩu
            </label>
            <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <PasswordField
            id="password"
            label=""
            value={password}
            onChange={setPassword}
            placeholder="Nhập mật khẩu"
            disabled={loading}
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-5 w-5 rounded border-input text-primary focus:ring-primary"
          />
          <label htmlFor="remember" className="text-sm text-muted-foreground select-none">
            Ghi nhớ đăng nhập 30 ngày
          </label>
        </div>

        <button type="submit" className="tb-btn-primary" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-bold text-primary hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
