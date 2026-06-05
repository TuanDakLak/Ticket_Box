"use client";

type PasswordStrengthProps = {
  password: string;
};

function getStrength(password: string) {
  if (!password) return { label: "", width: "0%", color: "bg-border", textColor: "text-muted-foreground" };
  if (password.length < 5)
    return { label: "Yếu", width: "25%", color: "bg-error", textColor: "text-error" };
  if (password.length < 8)
    return { label: "Trung bình", width: "65%", color: "bg-warning", textColor: "text-warning" };
  return { label: "Mạnh", width: "100%", color: "bg-success", textColor: "text-success" };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = getStrength(password);
  if (!password) return null;

  return (
    <div className="pt-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Độ bảo mật
        </span>
        <span className={`text-xs font-bold ${strength.textColor}`}>{strength.label}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
          style={{ width: strength.width }}
        />
      </div>
    </div>
  );
}
