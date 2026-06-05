import { Ticket } from "lucide-react";
import { HERO_CONCERT_IMAGE } from "./constants";

type AuthHeroProps = {
  imageSrc?: string;
  title: string;
  description: string;
  tag?: string;
  variant?: "bottom" | "glass";
};

export function AuthHero({
  imageSrc = HERO_CONCERT_IMAGE,
  title,
  description,
  tag = "4.8k vé đã bán hôm nay",
  variant = "bottom",
}: AuthHeroProps) {
  if (variant === "glass") {
    return (
      <section className="relative hidden min-h-[600px] overflow-hidden lg:flex lg:w-1/2 lg:items-end lg:p-16">
        <img src={imageSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#140c2e]/90 via-[#30135f]/30 to-transparent" />
        <div className="relative z-10 max-w-lg rounded-xl border border-white/20 bg-black/40 p-8 backdrop-blur-md">
          <h1 className="text-4xl font-extrabold leading-tight text-white lg:text-5xl">{title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-white/90">{description}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative hidden min-h-screen overflow-hidden lg:flex lg:w-1/2 lg:items-end lg:p-margin-desktop">
      <img src={imageSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#140c2e]/85 via-[#30135f]/25 to-transparent" />
      <div className="relative z-10 mb-8 max-w-lg">
        <h1 className="text-4xl font-extrabold leading-tight text-white lg:text-5xl">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-white/90">{description}</p>
        {tag && (
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
            <Ticket className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">{tag}</span>
          </div>
        )}
      </div>
    </section>
  );
}
