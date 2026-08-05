"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Toaster } from "@/components/ui/sonner";

/** Renders Sonner into document.body so app layout stacking never hides it. */
export function AppToaster() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(<Toaster />, document.body);
}
