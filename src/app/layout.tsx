import { ApplicationFrame } from "@/components/application-frame";
import type { Metadata } from "next";
import { loadAppearance } from "@/lib/server/appearance";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/be-vietnam-pro/800.css";
import "./globals.css";
export async function generateMetadata(): Promise<Metadata> {
  const a = await loadAppearance();
  return {
    title: a ? `${a.display_name} · Cửa hàng trực tuyến` : "Cửa hàng trực tuyến",
    description: a?.tagline || a?.hero_text,
    robots: { index: false, follow: false },
  };
}
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initial = await loadAppearance();
  return (
    <html lang="vi">
      <body>
        <ApplicationFrame initial={initial}>{children}</ApplicationFrame>
      </body>
    </html>
  );
}
