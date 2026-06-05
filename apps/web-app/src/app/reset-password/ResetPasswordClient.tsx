"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { AuthAlert } from "@/components/auth/auth-alert";
import { PasswordField } from "@/components/auth/password-field";
import { PasswordStrength } from "@/components/auth/password-strength";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/utils/error.utils";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = useMemo(() => searchParams?.get("token") ?? null, [searchParams]);

  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!urlToken) return;
    setToken(urlToken);
    window.history.replaceState({}, document.title, window.location.pathname);
  }, [urlToken]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Thiếu mã khôi phục. Vui lòng yêu cầu liên kết mới.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => router.push("/login?verified=1"), 3000);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthCardLayout>
        <div className="tb-card text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold">Đặt lại mật khẩu thành công</h1>
          <p className="mt-3 text-muted-foreground">
            Bạn sẽ được chuyển đến trang đăng nhập trong giây lát.
          </p>
          <Link href="/login" className="tb-btn-primary mt-8">
            Đăng nhập ngay
          </Link>
        </div>
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout>
      <div className="tb-card">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Đặt mật khẩu mới</h1>
          <p className="mt-2 text-muted-foreground">
            Chọn mật khẩu mạnh để bảo vệ tài khoản của bạn.
          </p>
        </div>

        {error && (
          <div className="mb-5">
            <AuthAlert variant="error">{error}</AuthAlert>
          </div>
        )}

        <form className="space-y-6" onSubmit={onSubmit}>
          <PasswordField
            id="password"
            label="Mật khẩu mới"
            value={newPassword}
            onChange={setNewPassword}
            disabled={loading}
            required
            hint={<PasswordStrength password={newPassword} />}
          />

          <PasswordField
            id="confirmPassword"
            label="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={setConfirmPassword}
            disabled={loading}
            required
          />

          <button type="submit" className="tb-btn-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              "Xác nhận mật khẩu mới"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
            Về trang đăng nhập
          </Link>
        </div>
      </div>
    </AuthCardLayout>
  );
}
