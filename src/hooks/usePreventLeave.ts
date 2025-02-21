"use client";

import { useEffect } from "react";

export function usePreventLeave(shouldPrevent: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldPrevent) {
        e.preventDefault();
        e.returnValue = ""; // Mensaje requerido para algunos navegadores
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldPrevent]);
}