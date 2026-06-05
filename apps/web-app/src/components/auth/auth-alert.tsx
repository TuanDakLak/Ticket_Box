import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type AuthAlertVariant = "error" | "success" | "warning" | "info";

const styles: Record<AuthAlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-blue-200 bg-primary-light text-blue-900",
};

const icons: Record<AuthAlertVariant, React.ReactNode> = {
  error: <AlertCircle className="h-5 w-5 shrink-0" />,
  success: <CheckCircle2 className="h-5 w-5 shrink-0" />,
  warning: <AlertCircle className="h-5 w-5 shrink-0" />,
  info: <Info className="h-5 w-5 shrink-0" />,
};

type AuthAlertProps = {
  variant: AuthAlertVariant;
  title?: string;
  children: React.ReactNode;
};

export function AuthAlert({ variant, title, children }: AuthAlertProps) {
  return (
    <div className={`flex gap-3 rounded-xl border p-4 text-sm ${styles[variant]}`}>
      {icons[variant]}
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? "mt-1" : ""}>{children}</div>
      </div>
    </div>
  );
}
