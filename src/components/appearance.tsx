"use client";

import { useSession } from "./providers";
import { ProductImage } from "./catalog";
import type { CatalogProduct } from "@/lib/catalog";
import { ErrorNotice, Loading } from "./ui";
import { Button } from "@/components/ui/button";
import { api, unwrap } from "@/lib/api/client";
import { canKeepAppearance, presets, safeImageURL, type Appearance } from "@/lib/appearance";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { createContext, useContext, useState, type ReactNode } from "react";
const Context = createContext<Appearance | null>(null);
export function AppearanceProvider({
  initial,
  children,
}: {
  initial: Appearance | null;
  children: ReactNode;
}) {
  const { scope, ready } = useSession();
  const query = useQuery({
    queryKey: [...scope, "appearance"],
    queryFn: async () => unwrap(await api.GET("/api/v1/storefront")),
    enabled: ready,
    initialData: initial || undefined,
  });
  if (query.error && (!query.data || !canKeepAppearance(query.error)))
    return (
      <main className="commerce-container">
        <h1>Chưa thể mở cửa hàng</h1>
        <ErrorNotice error={query.error} retry={() => void query.refetch()} />
      </main>
    );
  if (!query.data)
    return (
      <main className="commerce-container">
        <Loading />
      </main>
    );
  return (
    <Context.Provider value={query.data}>
      <div data-theme={query.data.preset} className="store-theme">
        <ErrorNotice error={query.error} retry={() => void query.refetch()} />
        {children}
      </div>
    </Context.Provider>
  );
}
export function useAppearance() {
  const a = useContext(Context);
  if (!a) throw new Error("appearance_provider_required");
  return a;
}
export function BrandImage({
  url,
  alt,
  className,
}: {
  url: string;
  alt: string;
  className: string;
}) {
  const [failed, setFailed] = useState<string>();
  const src = safeImageURL(url);
  if (!src || failed === src) return null;
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(src)}
    />
  );
}
export function StoreHero({
  appearance,
  preview = false,
  highlights = [],
  discovery,
}: {
  appearance: Appearance;
  preview?: boolean;
  highlights?: CatalogProduct[];
  discovery?: ReactNode;
}) {
  const a = appearance;
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">{a.tagline || "LỰA CHỌN TỪ CỬA HÀNG"}</span>
        <h1>{a.hero_title}</h1>
        <p>{a.hero_text}</p>
        {discovery ?? (
          <div className="actions">
            {preview ? (
              <Button asChild>
                <span className="button">
                  Khám phá sản phẩm <span aria-hidden="true">↗</span>
                </span>
              </Button>
            ) : (
              <Button asChild>
                <Link className="button" href="/products">
                  Khám phá sản phẩm <span aria-hidden="true">↗</span>
                </Link>
              </Button>
            )}
          </div>
        )}
        <div className="hero-caption">
          <span className="caption-line" />
          {a.display_name}
        </div>
      </div>
      <div className="hero-visual">
        {!a.hero_url && highlights.length > 0 ? (
          <div className="hero-products">
            <span className="hero-product-eyebrow">KHÁM PHÁ CHẤT RIÊNG</span>
            {highlights.slice(0, 2).map((product, index) => (
              <Link
                className={`hero-product hero-product-${index + 1}`}
                href={`/products/${encodeURIComponent(product.slug)}`}
                key={product.product_id}
              >
                <ProductImage media={product.media} name={product.name} />
                <span>
                  {product.name}
                  <span aria-hidden="true">↗</span>
                </span>
              </Link>
            ))}
            <span className="hero-product-caption">TỪ ĐAM MÊ · ĐẾN PHONG CÁCH</span>
          </div>
        ) : (
          <>
            <div className="brand-poster" aria-hidden="true">
              <span className="poster-kicker">{presets[a.preset].name}</span>
              <div className="poster-orbit">
                <i />
                <i />
                <i />
              </div>
              <strong>{a.display_name}</strong>
              <span className="poster-bottom">
                Mỗi ngày, một lựa chọn mới <span>↗</span>
              </span>
            </div>
            <BrandImage url={a.hero_url} alt={a.hero_title} className="hero-art" />
          </>
        )}
      </div>
    </section>
  );
}
