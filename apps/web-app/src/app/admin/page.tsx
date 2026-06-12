import { redirect } from "next/navigation";
//test admin
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
