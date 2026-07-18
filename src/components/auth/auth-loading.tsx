import { PageLoading } from "@/components/ui/page-loading";

type AuthLoadingProps = {
  label?: string;
  className?: string;
};

/** Full-screen overlay loader for auth / form submits. */
export function AuthLoading({
  label = "Signing you in…",
  className,
}: AuthLoadingProps) {
  return <PageLoading label={label} overlay className={className} />;
}
