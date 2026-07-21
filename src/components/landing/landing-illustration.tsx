import Image from "next/image";
import { cn } from "@/lib/utils";

/** Illustration paths under /public/landing */
export const landingIllustrations = {
  hero: "/landing/undraw_online-learning_tgmv.svg",
  teacher: "/landing/undraw_team-assignment_lzot.svg",
  student: "/landing/undraw_reading_6jjr.svg",
  cta: "/landing/undraw_working-together_r43a.svg",
} as const;

type LandingIllustrationProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function LandingIllustration({
  src,
  alt,
  className,
  imageClassName,
  priority,
}: LandingIllustrationProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={640}
        height={480}
        priority={priority}
        className={cn(
          "h-auto w-full max-w-md object-contain",
          imageClassName,
        )}
      />
    </div>
  );
}
