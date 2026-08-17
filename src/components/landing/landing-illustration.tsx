import Image from "next/image";
import { cn } from "@/lib/utils";

/** Illustration paths under /public/landing — keep the artwork, change the frame. */
export const landingIllustrations = {
  hero: "/landing/undraw_online-learning_tgmv.svg",
  teacher: "/landing/undraw_team-assignment_lzot.svg",
  student: "/landing/undraw_reading_6jjr.svg",
  cta: "/landing/undraw_working-together_r43a.svg",
  classes: "/landing/undraw_book-lover_m9n3.svg",
  assignments: "/landing/undraw_youtube-tutorial_xgp1.svg",
  grading: "/landing/undraw_deep-work_muov.svg",
  materials: "/landing/undraw_ai-research-assistant_cxx0.svg",
  activity: "/landing/undraw_developer-activity_4zqd.svg",
} as const;

type LandingIllustrationProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  /** Fill a fixed-height parent so sibling cards match. */
  fillHeight?: boolean;
};

export function LandingIllustration({
  src,
  alt,
  className,
  imageClassName,
  priority,
  fillHeight,
}: LandingIllustrationProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        fillHeight && "h-full w-full",
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
          fillHeight
            ? "h-full w-auto max-h-full max-w-full object-contain"
            : "h-auto w-full max-w-md object-contain",
          imageClassName,
        )}
      />
    </div>
  );
}
