"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "./providers";
import { api, unwrap } from "@/lib/api/client";
import type { CatalogProduct } from "@/lib/catalog";

export function useStoreCatalog() {
  const { scope, ready } = useSession();
  return useQuery({
    queryKey: [...scope, "store-catalog"],
    enabled: ready,
    queryFn: async ({ signal }) => {
      const products = new Map<string, CatalogProduct>();
      const cursors = new Set<string>();
      let cursor: string | undefined;
      do {
        const page = unwrap(
          await api.GET("/api/v1/catalog/products", {
            params: { query: { limit: 100, cursor } },
            signal,
          }),
        );
        for (const product of page.products) products.set(product.product_id, product);
        cursor = page.next_cursor || undefined;
        if (cursor && cursors.has(cursor))
          throw new Error("Không thể tải đầy đủ sản phẩm. Vui lòng thử lại.");
        if (cursor) cursors.add(cursor);
      } while (cursor);
      return [...products.values()];
    },
  });
}
