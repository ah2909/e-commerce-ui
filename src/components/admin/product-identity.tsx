"use client";

import { useSession } from "@/components/providers";
import { api, unwrap, type Schema } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function useAdminCatalog() {
  const { scope, ready } = useSession();
  return useQuery({
    queryKey: [...scope, "admin-product-identities"],
    enabled: ready,
    queryFn: async ({ signal }) => {
      const products = new Map<string, Schema["CatalogProduct"]>();
      const cursors = new Set<string>();
      let cursor: string | undefined;
      do {
        const page = unwrap(
          await api.GET("/api/v1/admin/catalog/products", {
            params: { query: { limit: 100, cursor } },
            signal,
          }),
        );
        for (const product of page.products) products.set(product.product_id, product);
        cursor = page.next_cursor || undefined;
        if (cursor && cursors.has(cursor))
          throw new Error("Không thể tải đầy đủ thông tin sản phẩm. Vui lòng thử lại.");
        if (cursor) cursors.add(cursor);
      } while (cursor);
      return [...products.values()];
    },
    select: (products) => ({
      products,
      variants: new Map(
        products.flatMap((product) =>
          product.variants.map((variant) => [variant.variant_id, { product, variant }] as const),
        ),
      ),
    }),
  });
}

export function AdminProductIdentity({
  product,
  variant,
  variantID,
  snapshot,
}: {
  product?: Schema["CatalogProduct"];
  variant?: Schema["CatalogVariant"];
  variantID?: string;
  snapshot?: Pick<Schema["OrderLine"], "product_name" | "sku" | "option_values">;
}) {
  const [failed, setFailed] = useState<string>();
  const image = product?.media
    .filter((media) => !media.archived_at)
    .sort((a, b) => a.position - b.position)[0];
  const name = snapshot?.product_name || product?.name || "Chưa có thông tin sản phẩm";
  const sku = snapshot?.sku || variant?.sku;
  const options = Object.values(snapshot?.option_values || variant?.option_values || {}).join(
    " / ",
  );
  return (
    <div className="admin-product-identity">
      <div className="admin-product-thumbnail">
        {image?.object_key && failed !== image.object_key ? (
          <Image
            src={`/api/media?key=${encodeURIComponent(image.object_key)}`}
            alt={image.alt_text || name}
            width={64}
            height={64}
            unoptimized
            onError={() => setFailed(image.object_key)}
          />
        ) : (
          <span role="img" aria-label={`Chưa có hình ảnh: ${name}`}>
            <ImageOff size={24} aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="admin-product-description">
        <strong>{name}</strong>
        {options && <small>{options}</small>}
        {sku && <small>SKU: {sku}</small>}
        {!sku && variantID && <small>Mã biến thể: {variantID}</small>}
      </div>
    </div>
  );
}
