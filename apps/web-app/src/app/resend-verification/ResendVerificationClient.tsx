"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Mail, MailCheck } from "lucide-react";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { AuthAlert } from "@/components/auth/auth-alert";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/utils/error.utils";

export default function ResendVerificationClient() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const prefill = searchParams?.get("email");
    if (prefill) setEmail(prefill);
  }, [searchParams]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.resendVerification(email);
      setSuccess(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthCardLayout>
        <div className="tb-card text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <MailCheck className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold">Email đã được gửi</h1>
          <p className="mt-3 text-muted-foreground">
            Nếu tài khoản tồn tại, liên kết xác thực mới đã được gửi đến{" "}
            <strong className="text-foreground">{email}</strong>.
          </p>
          <Link href="/login" className="tb-btn-primary mt-8">
            Về trang đăng nhập
          </Link>
        </div>
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout>
      <div className="tb-card">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-light">
            <Mail className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Gửi lại email xác thực</h1>
          <p className="mt-2 text-muted-foreground">
            Nhập email đã đăng ký để nhận liên kết kích hoạt tài khoản.
          </p>
        </div>

        {error && (
          <div className="mb-5">
            <AuthAlert variant="error">{error}</AuthAlert>
          </div>
        )}

        <form className="space-y-6" onSubmit={onSubmit}>
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

          <button type="submit" className="tb-btn-primary" disabled={loading || !email}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              "Gửi email xác thực"
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <Link href="/login" className="tb-btn-ghost justify-center">
            <ArrowLeft className="h-4 w-4" />
            Về trang đăng nhập
          </Link>
        </div>
      </div>
    </AuthCardLayout>
  );
}
