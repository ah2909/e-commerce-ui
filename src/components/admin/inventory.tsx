"use client";

import { Pager } from "./shared";
import { AdminProductIdentity, useAdminCatalog } from "./product-identity";
import { useSession } from "@/components/providers";
import { ActionFeedback, Empty, ErrorNotice, Field, Loading, useAction } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError, api, unwrap, type Schema } from "@/lib/api/client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";

function StockLookup() {
  const { scope, ready } = useSession();
  const [variantID, setVariantID] = useState("");
  const action = useAction();
  const products = useAdminCatalog();
  const selected = products.data?.variants.get(variantID);
  const stock = useQuery({
    queryKey: [...scope, "stock", variantID],
    enabled: ready && !!variantID,
    staleTime: 0,
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/inventory/stock-items/{variant_id}", {
          params: { path: { variant_id: variantID } },
        }),
      ),
  });
  const missing = stock.error instanceof ApiError && stock.error.status === 404;
  if (products.isPending) return <Loading />;
  if (products.error)
    return <ErrorNotice error={products.error} retry={() => void products.refetch()} />;
  return (
    <Card asChild>
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          void action.run(
            `/api/v1/admin/inventory/stock-items/${variantID}/adjustments`,
            "POST",
            {
              quantity_delta: Number(form.get("quantity_delta")),
              reason: String(form.get("reason")),
              expected_version: stock.data?.version || 0,
            },
            true,
          );
        }}
      >
        <h2>Nhập và điều chỉnh hàng</h2>
        <Label className="field">
          <span>Biến thể sản phẩm</span>
          <NativeSelect
            required
            value={variantID}
            disabled={action.pending}
            onChange={(e) => setVariantID(e.target.value)}
          >
            <NativeSelectOption value="" disabled>
              Chọn biến thể
            </NativeSelectOption>
            {products.data.products.flatMap((p) =>
              p.variants
                .filter((v) => v.status === "active")
                .map((v) => (
                  <NativeSelectOption key={v.variant_id} value={v.variant_id}>
                    {p.name} · {Object.values(v.option_values).join(" / ")} · {v.sku}
                  </NativeSelectOption>
                )),
            )}
          </NativeSelect>
        </Label>
        {selected && <AdminProductIdentity {...selected} />}
        {variantID &&
          (stock.isPending ? (
            <Loading />
          ) : stock.error && !missing ? (
            <ErrorNotice error={stock.error} retry={() => void stock.refetch()} />
          ) : (
            <>
              <p>
                {missing
                  ? "Biến thể chưa có tồn kho. Nhập số lượng đầu tiên."
                  : `Trong kho: ${stock.data?.on_hand} · Có thể bán: ${stock.data?.available}`}
              </p>
              <Field
                label="Thay đổi số lượng (+/-)"
                name="quantity_delta"
                type="number"
                min={missing ? 1 : -2147483647}
                max={2147483647}
              />
              <Field label="Lý do" name="reason" maxLength={240} />
              <Button disabled={action.pending}>Xác nhận điều chỉnh</Button>
            </>
          ))}
        <ActionFeedback action={action} />
      </form>
    </Card>
  );
}

function StockRow({
  stock,
  identity,
}: {
  stock: Schema["InventoryStockItem"];
  identity?: { product: Schema["CatalogProduct"]; variant: Schema["CatalogVariant"] };
}) {
  const [editing, setEditing] = useState(false);
  const action = useAction();
  return (
    <>
      <TableRow>
        <TableCell>
          <AdminProductIdentity {...identity} variantID={stock.variant_id} />
        </TableCell>
        <TableCell>{stock.on_hand}</TableCell>
        <TableCell>{stock.reserved}</TableCell>
        <TableCell>{stock.available}</TableCell>
        <TableCell>
          <Button variant="outline" onClick={() => setEditing(!editing)} aria-expanded={editing}>
            Điều chỉnh
          </Button>
        </TableCell>
      </TableRow>
      {editing && (
        <TableRow>
          <TableCell colSpan={5}>
            <Card asChild>
              <form
                className="panel"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  if (
                    await action.run(
                      `/api/v1/admin/inventory/stock-items/${stock.variant_id}/adjustments`,
                      "POST",
                      {
                        quantity_delta: Number(form.get("quantity_delta")),
                        reason: String(form.get("reason")),
                        expected_version: stock.version,
                      },
                      true,
                    )
                  )
                    setEditing(false);
                }}
              >
                <h3>Điều chỉnh tồn kho</h3>
                <AdminProductIdentity {...identity} variantID={stock.variant_id} />
                <Field
                  label="Thay đổi số lượng (+/-)"
                  name="quantity_delta"
                  type="number"
                  min={-2147483647}
                  max={2147483647}
                />
                <Field label="Lý do" name="reason" maxLength={240} />
                <Button disabled={action.pending}>Xác nhận điều chỉnh</Button>
                <ActionFeedback action={action} />
              </form>
            </Card>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function InventoryView() {
  const { scope, ready } = useSession();
  const catalog = useAdminCatalog();
  const query = useInfiniteQuery({
    queryKey: [...scope, "admin-stock"],
    enabled: ready,
    staleTime: 0,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      unwrap(
        await api.GET("/api/v1/admin/inventory/stock-items", {
          params: { query: { limit: 25, cursor: pageParam } },
        }),
      ),
    getNextPageParam: (page) => page.next_cursor || undefined,
  });
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorNotice error={query.error} retry={() => void query.refetch()} />;
  const stocks = query.data.pages.flatMap((p) => p.stock_items);
  return (
    <>
      <span className="eyebrow">TỒN KHO</span>
      <h1>Tồn kho cửa hàng</h1>
      <p>Số lượng có thể bán do cửa hàng xác nhận tại thời điểm đặt hàng.</p>
      <StockLookup />
      {!stocks.length ? (
        <Empty>Chưa có mặt hàng tồn kho.</Empty>
      ) : (
        <Card asChild>
          <div className="panel table-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Biến thể</TableHead>
                  <TableHead>Trong kho</TableHead>
                  <TableHead>Đã giữ</TableHead>
                  <TableHead>Có thể bán</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks.map((s) => (
                  <StockRow
                    key={s.variant_id}
                    stock={s}
                    identity={catalog.data?.variants.get(s.variant_id)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
      <Pager
        next={query.data.pages.at(-1)?.next_cursor}
        load={() => void query.fetchNextPage()}
        pending={query.isFetchingNextPage}
      />
    </>
  );
}
