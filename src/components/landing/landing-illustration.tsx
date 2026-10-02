import Image from "next/image";
import { cn } from "@/lib/utils";

/** School photos under /public/landing/photos. */
export const landingIllustrations = {
  hero: "/landing/photos/lab.jpg",
  teacher: "/landing/photos/projector.jpg",
  student: "/landing/photos/laptops.jpg",
  cta: "/landing/photos/lab.jpg",
  classes: "/landing/photos/lab.jpg",
  assignments: "/landing/photos/computers.jpg",
  grading: "/landing/photos/projector.jpg",
  materials: "/landing/photos/computers.jpg",
  activity: "/landing/photos/laptops.jpg",
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
