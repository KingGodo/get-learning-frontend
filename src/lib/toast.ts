"use client";

import { toast as sonnerToast } from "sonner";

/** App toast helpers — always import from here, not directly from sonner. */
export const toast = {
  success(message: string, description?: string) {
    return sonnerToast.success(message, {
      description,
      duration: 3500,
    });
  },
  error(message: string, description?: string) {
    return sonnerToast.error(message, {
      description,
      duration: 4500,
    });
  },
  info(message: string, description?: string) {
    return sonnerToast.info(message, {
      description,
      duration: 3500,
    });
  },
  warning(message: string, description?: string) {
    return sonnerToast.warning(message, {
      description,
      duration: 4000,
    });
  },
  message(message: string, description?: string) {
    return sonnerToast.message(message, {
      description,
      duration: 3500,
    });
  },
  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
};

export function toastFromError(err: unknown, fallback: string) {
  const message =
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof err.message === "string"
      ? err.message
      : fallback;
  return toast.error(message);
}
