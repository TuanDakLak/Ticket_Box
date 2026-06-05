"use client";

import Link from "next/link";
import { ShieldX } from "lucide-react";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { useAuth } from "@/context/AuthContext";

export default function AccessDeniedPage() {
  const { isAuthenticated } = useAuth();

  return (
    <AuthCardLayout>
      <div className="tb-card text-center transition-transform hover:-translate-y-1">
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-error/10 blur-xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-red-50">
            <ShieldX className="h-12 w-12 text-error" />
          </div>
        </div>

        <p className="text-5xl font-black text-error/20">403</p>
        <h1 className="mt-2 text-3xl font-bold">Truy cập bị từ chối</h1>
        <p className="mt-3 text-muted-foreground">
          Bạn không có quyền hoặc vai trò cần thiết để truy cập trang này.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {isAuthenticated ? (
            <Link href="/dashboard" className="tb-btn-primary sm:w-auto">
              Về Dashboard
            </Link>
          ) : (
            <Link href="/login" className="tb-btn-primary sm:w-auto">
              Đăng nhập
            </Link>
          )}
          <Link href="/" className="tb-btn-outline sm:w-auto">
            Về trang chủ
          </Link>
        </div>
      </div>
    </AuthCardLayout>
  );
}
