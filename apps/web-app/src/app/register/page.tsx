"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Mail, User } from "lucide-react";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { AuthAlert } from "@/components/auth/auth-alert";
import { PasswordField } from "@/components/auth/password-field";
import { PasswordStrength } from "@/components/auth/password-strength";
import { HERO_REGISTER_IMAGE } from "@/components/auth/constants";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/utils/error.utils";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (!terms) {
      setError("Vui lòng đồng ý với Điều khoản & Chính sách.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.register(email, password, fullName);
      setSuccess(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthSplitLayout
        heroTitle="Kiểm tra email của bạn"
        heroDescription="Chúng tôi đã gửi liên kết kích hoạt tài khoản."
        heroImage={HERO_REGISTER_IMAGE}
        heroVariant="glass"
      >
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <Mail className="h-10 w-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold">Kiểm tra hòm thư</h2>
          <p className="mt-3 text-muted-foreground">
            Vui lòng mở email và nhấn liên kết kích hoạt. Sau đó bạn có thể đăng nhập.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/login" className="tb-btn-primary">
              Về trang đăng nhập
            </Link>
            <Link
              href={`/resend-verification${email ? `?email=${encodeURIComponent(email)}` : ""}`}
              className="tb-btn-outline"
            >
              Gửi lại email xác thực
            </Link>
          </div>
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      heroTitle="Gia nhập nhịp điệu."
      heroDescription="Đừng bỏ lỡ những sự kiện âm nhạc lớn nhất. Đăng ký để đặt vé nhanh chóng và an toàn."
      heroImage={HERO_REGISTER_IMAGE}
      heroVariant="glass"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Tạo tài khoản</h2>
        <p className="mt-2 text-muted-foreground">Nhập thông tin để bắt đầu hành trình âm nhạc.</p>
      </div>

      {error && (
        <div className="mb-5">
          <AuthAlert variant="error">{error}</AuthAlert>
        </div>
      )}

      <form className="space-y-5" onSubmit={onSubmit}>
        <div>
          <label className="tb-label" htmlFor="fullName">
            Họ và tên
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="fullName"
              type="text"
              className="tb-input-icon"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="tb-label" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              className="tb-input-icon"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <PasswordField
            id="password"
            label="Mật khẩu"
            value={password}
            onChange={setPassword}
            disabled={loading}
            required
            hint={<PasswordStrength password={password} />}
          />
        </div>

        <div>
          <PasswordField
            id="confirmPassword"
            label="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={setConfirmPassword}
            disabled={loading}
            required
          />
          {passwordsMatch && (
            <p className="mt-1 text-xs font-medium text-success">Mật khẩu khớp</p>
          )}
        </div>

        <div className="flex items-start gap-3">
          <input
            id="terms"
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-input text-primary focus:ring-primary"
            required
          />
          <label htmlFor="terms" className="text-sm leading-snug text-muted-foreground">
            Tôi đồng ý với{" "}
            <span className="text-primary hover:underline">Điều khoản</span> và{" "}
            <span className="text-primary hover:underline">Chính sách bảo mật</span>.
          </label>
        </div>

        <button type="submit" className="tb-btn-primary" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tạo tài khoản...
            </>
          ) : (
            "Tạo tài khoản"
          )}
        </button>
      </form>

      <p className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-bold text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
