"use client";

import { useSession } from "@/components/providers";
import { ActionFeedback, ErrorNotice, Field, Loading, useAction } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ApiError, api, unwrap } from "@/lib/api/client";
import { money } from "@/lib/commerce";
import { useQuery } from "@tanstack/react-query";

export function ShippingView() {
  const { scope, ready } = useSession();
  const action = useAction();
  const query = useQuery({
    queryKey: [...scope, "shipping-rule"],
    enabled: ready,
    queryFn: async () => unwrap(await api.GET("/api/v1/admin/shipping/rule")),
  });
  if (query.isPending) return <Loading />;
  const missing = query.error instanceof ApiError && query.error.status === 404;
  if (query.error && !missing)
    return <ErrorNotice error={query.error} retry={() => void query.refetch()} />;
  const rule = query.data || {
    version: 0,
    mode: "free",
    price: { amount_minor: 0 },
  };
  return (
    <>
      <span className="eyebrow">GIAO HÀNG</span>
      <h1>Phí vận chuyển</h1>
      <p>
        Quy tắc hiện tại: {rule.mode === "free" ? "Miễn phí" : money(rule.price.amount_minor)}. Đơn
        đã đặt giữ nguyên phí giao hàng tại thời điểm đặt.
      </p>
      <Card key={rule.version} asChild>
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            void action.run("/api/v1/admin/shipping/rule", "PUT", {
              expected_version: rule.version,
              mode: form.get("mode"),
              flat_amount_minor: Number(form.get("flat_amount_minor")),
            });
          }}
        >
          <Label className="field">
            <span>Hình thức</span>
            <NativeSelect name="mode" defaultValue={rule.mode}>
              <NativeSelectOption value="free">Miễn phí</NativeSelectOption>
              <NativeSelectOption value="flat">Phí cố định</NativeSelectOption>
            </NativeSelect>
          </Label>
          <Field
            label="Phí cố định (VND)"
            name="flat_amount_minor"
            type="number"
            min={0}
            value={rule.price.amount_minor}
          />
          <Button disabled={action.pending}>Lưu quy tắc</Button>
          <ActionFeedback action={action} />
        </form>
      </Card>
    </>
  );
}
