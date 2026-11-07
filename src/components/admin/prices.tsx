"use client";

import { Pager } from "./shared";
import { AdminProductIdentity, useAdminCatalog } from "./product-identity";
import { useConfirm } from "@/components/confirm";
import { useSession } from "@/components/providers";
import {
  ActionFeedback,
  Badge,
  Empty,
  ErrorNotice,
  Field,
  Loading,
  useAction,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, unwrap, type Schema } from "@/lib/api/client";
import { dateTimeInstant, localDateTime, money } from "@/lib/commerce";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";

function parsePrices(raw: string): Schema["PricingPriceWrite"][] {
  return raw
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [variant_id, amount] = line.split(",").map((p) => p.trim());
      const amount_minor = Number(amount);
      if (
        !/^[0-9a-f-]{36}$/i.test(variant_id) ||
        !Number.isSafeInteger(amount_minor) ||
        amount_minor < 0
      )
        throw new Error(
          "Mỗi dòng cần mã biến thể UUID và giá VND nguyên, cách nhau bằng dấu phẩy.",
        );
      return { variant_id, amount_minor };
    });
}

function PriceEditor({ value, close }: { value?: Schema["PricingPriceList"]; close: () => void }) {
  const action = useAction();
  const [formError, setFormError] = useState<unknown>();
  return (
    <Card key={value?.version || 0} asChild>
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          setFormError(undefined);
          try {
            const form = new FormData(e.currentTarget);
            const body: Schema["PricingPriceListWrite"] = {
              name: String(form.get("name")),
              channel: "storefront",
              currency: "VND",
              priority: Number(form.get("priority")),
              prices: parsePrices(String(form.get("prices"))),
              valid_from: dateTimeInstant(String(form.get("valid_from") || ""), value?.valid_from),
              valid_until: dateTimeInstant(
                String(form.get("valid_until") || ""),
                value?.valid_until,
              ),
              ...(value ? { expected_version: value.version } : {}),
            };
            void action
              .run(
                value
                  ? `/api/v1/admin/pricing/price-lists/${value.price_list_id}`
                  : "/api/v1/admin/pricing/price-lists",
                value ? "PUT" : "POST",
                body,
              )
              .then((result) => {
                if (result) close();
              });
          } catch (error) {
            setFormError(error);
          }
        }}
      >
        <h2>{value ? `Chỉnh sửa · ${value.name}` : "Thêm bảng giá"}</h2>
        <Field label="Tên bảng giá" name="name" value={value?.name} maxLength={120} />
        <Field
          label="Ưu tiên"
          name="priority"
          type="number"
          value={value?.priority || 0}
          min={-1000000}
          max={1000000}
        />
        <div className="form-grid">
          <Field
            label="Bắt đầu"
            name="valid_from"
            type="datetime-local"
            value={localDateTime(value?.valid_from)}
            required={false}
          />
          <Field
            label="Kết thúc"
            name="valid_until"
            type="datetime-local"
            value={localDateTime(value?.valid_until)}
            required={false}
          />
        </div>
        <Label className="field">
          <span>Giá theo biến thể</span>
          <Textarea
            name="prices"
            required
            defaultValue={value?.prices
              .map((p) => `${p.variant_id}, ${p.money.amount_minor}`)
              .join("\n")}
          />
          <small>Mỗi dòng: UUID biến thể, giá VND nguyên</small>
        </Label>
        <ErrorNotice error={formError} />
        <ActionFeedback action={action} />
        <div className="actions">
          <Button disabled={action.pending}>Lưu bảng giá</Button>
          <Button variant="outline" type="button" onClick={close}>
            Đóng
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function PricesView() {
  const catalog = useAdminCatalog();
  const confirm = useConfirm();
  const { scope, ready } = useSession();
  const [editing, setEditing] = useState<Schema["PricingPriceList"] | "new">();
  const action = useAction();
  const query = useInfiniteQuery({
    queryKey: [...scope, "price-lists"],
    enabled: ready,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      unwrap(
        await api.GET("/api/v1/admin/pricing/price-lists", {
          params: { query: { limit: 25, cursor: pageParam } },
        }),
      ),
    getNextPageParam: (page) => page.next_cursor || undefined,
  });
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorNotice error={query.error} retry={() => void query.refetch()} />;
  const lists = query.data.pages.flatMap((p) => p.price_lists);
  const current =
    editing && editing !== "new"
      ? lists.find((list) => list.price_list_id === editing.price_list_id) || editing
      : undefined;
  return (
    <>
      <span className="eyebrow">BẢNG GIÁ</span>
      <h1>Giá bán cửa hàng</h1>
      <Button onClick={() => setEditing("new")}>Thêm bảng giá</Button>
      <ActionFeedback action={action} />
      <ErrorNotice error={catalog.error} retry={() => void catalog.refetch()} />
      {editing && (
        <PriceEditor
          key={current ? `${current.price_list_id}:${current.version}` : "new"}
          value={current}
          close={() => setEditing(undefined)}
        />
      )}
      {!lists.length ? (
        <Empty>Chưa có bảng giá.</Empty>
      ) : (
        <div className="stack">
          {lists.map((list) => (
            <Card key={list.price_list_id} asChild>
              <div className="panel">
                <h2>
                  {list.name} <Badge state={list.status} />
                </h2>
                <p>
                  Ưu tiên {list.priority} · {list.prices.length} biến thể
                </p>
                {list.prices.slice(0, 4).map((p) => (
                  <div className="summary-row" key={p.variant_id}>
                    <AdminProductIdentity
                      {...catalog.data?.variants.get(p.variant_id)}
                      variantID={p.variant_id}
                    />
                    <strong>{money(p.money.amount_minor)}</strong>
                  </div>
                ))}
                <div className="actions">
                  <Button variant="outline" onClick={() => setEditing(list)}>
                    Chỉnh sửa
                  </Button>
                  {list.status === "active" && (
                    <Button
                      variant="outline"
                      disabled={action.pending}
                      onClick={async () => {
                        if (await confirm("Lưu trữ bảng giá này?"))
                          void action.run(
                            `/api/v1/admin/pricing/price-lists/${list.price_list_id}/archive`,
                            "POST",
                            { expected_version: list.version },
                          );
                      }}
                    >
                      Lưu trữ
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Pager
        next={query.data.pages.at(-1)?.next_cursor}
        load={() => void query.fetchNextPage()}
        pending={query.isFetchingNextPage}
      />
    </>
  );
}
