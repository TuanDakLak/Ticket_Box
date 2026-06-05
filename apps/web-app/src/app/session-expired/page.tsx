"use client";

import Link from "next/link";
import { Clock, LogIn } from "lucide-react";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";

export default function SessionExpiredPage() {
  return (
    <AuthCardLayout>
      <div className="tb-card text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-50">
          <Clock className="h-12 w-12 text-warning" />
        </div>
        <h1 className="text-2xl font-bold">Phiên đăng nhập đã hết hạn</h1>
        <p className="mt-3 text-muted-foreground">
          Vì lý do bảo mật, phiên làm việc của bạn đã kết thúc. Vui lòng đăng nhập lại để tiếp tục.
        </p>
        <Link href="/login" className="tb-btn-primary mt-8 gap-2">
          <LogIn className="h-4 w-4" />
          Đăng nhập lại
        </Link>
      </div>
    </AuthCardLayout>
  );
}
