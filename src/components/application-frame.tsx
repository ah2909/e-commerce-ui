"use client";

import { AppearanceProvider } from "@/components/appearance";
import { ConfirmProvider } from "@/components/confirm";
import { Providers } from "@/components/providers";
import { Shell } from "@/components/shell";
import type { Appearance } from "@/lib/appearance";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function ApplicationFrame({
  initial,
  children,
}: {
  initial: Appearance | null;
  children: ReactNode;
}) {
  const path = usePathname();
  if (path.startsWith("/platform/")) return <>{children}</>;
  return (
    <Providers>
      <AppearanceProvider initial={initial}>
        <ConfirmProvider>
          <Shell>{children}</Shell>
        </ConfirmProvider>
      </AppearanceProvider>
    </Providers>
  );
}
