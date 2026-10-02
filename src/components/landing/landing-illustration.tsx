import Image from "next/image";
import { cn } from "@/lib/utils";

/** School photos under /public/landing/photos. */
export const landingIllustrations = {
  hero: "/landing/photos/classroom.jpg",
  teacher: "/landing/photos/lesson.jpg",
  student: "/landing/photos/uniform.jpg",
  cta: "/landing/photos/classroom.jpg",
  classes: "/landing/photos/classroom.jpg",
  assignments: "/landing/photos/writing.jpg",
  grading: "/landing/photos/lesson.jpg",
  materials: "/landing/photos/writing.jpg",
  activity: "/landing/photos/smile.jpg",
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
            ? "h-full w-full object-cover"
            : "h-auto w-full object-cover",
          imageClassName,
        )}
      />
    </div>
  );
}
