import Image from "next/image";
import type { Avatar as AvatarType } from "@/app/lib/types";

type Props = {
  avatar: AvatarType;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  priority?: boolean;
};

const SIZES = {
  sm: { px: 28, text: "text-base" },
  md: { px: 36, text: "text-2xl" },
  lg: { px: 48, text: "text-3xl" },
  xl: { px: 72, text: "text-5xl" },
  hero: { px: 96, text: "text-6xl" },
};

export default function Avatar({ avatar, size = "md", className = "", priority = false }: Props) {
  const { px, text } = SIZES[size];

  if (avatar.image) {
    return (
      <div
        className={`rounded-full overflow-hidden shrink-0 ${className}`}
        style={{ width: px, height: px }}
      >
        <Image
          src={avatar.image}
          alt={avatar.label}
          width={px}
          height={px}
          priority={priority}
          className="h-full w-full object-cover object-top"
          style={{ transform: `scale(1.15)`, transformOrigin: 'top center' }}
        />
      </div>
    );
  }

  return <span className={`${text} ${className}`}>{avatar.emoji}</span>;
}
