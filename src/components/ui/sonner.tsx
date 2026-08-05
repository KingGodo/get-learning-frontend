"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-center"
      closeButton
      richColors
      expand
      gap={10}
      offset={20}
      duration={3500}
      visibleToasts={5}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#111827",
          "--normal-border": "#e5e7eb",
          "--border-radius": "0.625rem",
          "--success-bg": "#eff6ff",
          "--success-text": "#1d4ed8",
          "--success-border": "#bfdbfe",
          "--error-bg": "#fef2f2",
          "--error-text": "#b91c1c",
          "--error-border": "#fecaca",
          zIndex: 999999,
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          title: "cn-toast-title",
          description: "cn-toast-description",
          closeButton: "cn-toast-close",
          success: "cn-toast-success",
          error: "cn-toast-error",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
