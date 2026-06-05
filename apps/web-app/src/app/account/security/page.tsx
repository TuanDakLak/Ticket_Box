"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Fingerprint,
  Loader2,
  LogOut,
  Monitor,
  Shield,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthTopBar } from "@/components/auth/auth-top-bar";
import { AuthAlert } from "@/components/auth/auth-alert";
import { PasswordField } from "@/components/auth/password-field";
import { PasswordStrength } from "@/components/auth/password-strength";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/utils/error.utils";

function SecurityContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.changePassword(oldPassword, newPassword);
      setSuccess(res.message || "Cập nhật mật khẩu thành công.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onLogout = async () => {
    await logout();
    router.push("/login");
  };

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-surface-bg">
      <AuthTopBar
        rightSlot={
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
            {initials || "TB"}
          </div>
        }
      />

      <main className="mx-auto flex max-w-container-auth flex-col gap-8 px-gutter py-8 lg:flex-row">
        <aside className="hidden w-72 shrink-0 flex-col rounded-xl bg-white p-6 shadow-card lg:flex">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-primary">Security Center</h2>
            <p className="text-xs text-muted-foreground">Quản lý quyền truy cập</p>
          </div>
          <nav className="space-y-1">
            {[
              { icon: Fingerprint, label: "Identity", active: false },
              { icon: Shield, label: "Security", active: true },
              { icon: Monitor, label: "Devices", active: false },
            ].map(({ icon: Icon, label, active }) => (
              <span
                key={label}
                className={`flex items-center gap-3 rounded-lg p-3 text-sm font-semibold ${
                  active
                    ? "bg-primary text-white"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </span>
            ))}
          </nav>
          <Link href="/dashboard" className="tb-btn-outline mt-auto text-sm">
            Về Dashboard
          </Link>
        </aside>

        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Account</span>
            <ChevronRight className="h-3 w-3" />
            <span>Security</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-bold text-primary">Change Password</span>
          </div>

          <section className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
            <div className="border-b border-border bg-primary-light/30 px-8 py-6">
              <h1 className="text-2xl font-bold">Đổi mật khẩu</h1>
              <p className="mt-1 text-muted-foreground">
                Nhập mật khẩu hiện tại để xác minh danh tính trước khi đặt mật khẩu mới.
              </p>
            </div>

            <form className="space-y-6 p-8" onSubmit={onChangePassword}>
              {error && <AuthAlert variant="error">{error}</AuthAlert>}
              {success && <AuthAlert variant="success">{success}</AuthAlert>}

              <PasswordField
                id="oldPassword"
                label="Mật khẩu hiện tại"
                value={oldPassword}
                onChange={setOldPassword}
                disabled={loading}
                required
              />

              <div className="grid gap-6 md:grid-cols-2">
                <PasswordField
                  id="newPassword"
                  label="Mật khẩu mới"
                  value={newPassword}
                  onChange={setNewPassword}
                  disabled={loading}
                  required
                  hint={<PasswordStrength password={newPassword} />}
                />
                <PasswordField
                  id="confirmPassword"
                  label="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  disabled={loading}
                  required
                />
              </div>

              <button type="submit" className="tb-btn-primary max-w-xs" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  "Cập nhật mật khẩu"
                )}
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-border bg-white p-8 shadow-card">
            <h2 className="text-lg font-bold">Phiên đăng nhập</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Đăng xuất để hủy refresh token trên máy chủ.
            </p>
            <button
              type="button"
              onClick={onLogout}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function AccountSecurityPage() {
  return (
    <ProtectedRoute>
      <SecurityContent />
    </ProtectedRoute>
  );
}
