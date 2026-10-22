"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ApiError, api, unwrap, type Schema } from "@/lib/api/client";
import { money } from "@/lib/commerce";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Link from "next/link";

function VietQRConfirmation() {
  const confirm = useConfirm();
  const action = useAction();
  return (
    <Card asChild>
      <form
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          if (
            await confirm(
              "Bạn đã kiểm tra tài khoản nhận, số tiền và mã chuyển khoản trên ngân hàng?",
            )
          )
            void action.run(
              `/api/v1/admin/payments/${String(form.get("payment_id"))}/vietqr-confirmations`,
              "POST",
              {
                transfer_reference: String(form.get("transfer_reference")),
                amount_minor: Number(form.get("amount_minor")),
                received_at: new Date(String(form.get("received_at"))).toISOString(),
              },
              true,
            );
        }}
      >
        <h2>Xác nhận chuyển khoản VietQR</h2>
        <p>
          Dùng mã thanh toán trên đơn của khách. Chỉ xác nhận sau khi kiểm tra giao dịch thực trên
          ngân hàng.
        </p>
        <Field label="Mã thanh toán" name="payment_id" />
        <Field label="Mã chuyển khoản" name="transfer_reference" maxLength={64} />
        <Field label="Số tiền nhận (VND)" name="amount_minor" type="number" min={0} />
        <Field label="Thời điểm nhận" name="received_at" type="datetime-local" />
        <Button disabled={action.pending}>Xác nhận thanh toán</Button>
        <ActionFeedback action={action} />
      </form>
    </Card>
  );
}

export function PaymentsView() {
  const { scope, ready } = useSession();
  const vietqr = useQuery({
    queryKey: [...scope, "vietqr-config"],
    enabled: ready,
    queryFn: async () => unwrap(await api.GET("/api/v1/admin/payment-providers/vietqr")),
  });
  const momo = useQuery({
    queryKey: [...scope, "momo-config"],
    enabled: ready,
    queryFn: async () => unwrap(await api.GET("/api/v1/admin/payment-providers/momo")),
  });
  const reconciliation = useInfiniteQuery({
    queryKey: [...scope, "reconciliation"],
    enabled: ready,
    initialPageParam: undefined as { before_created_at: string; before_id: string } | undefined,
    queryFn: async ({ pageParam }) =>
      unwrap(
        await api.GET("/api/v1/admin/payment-reconciliation-items", {
          params: { query: { limit: 50, ...pageParam } },
        }),
      ),
    getNextPageParam: (page) => {
      const last = page.items.at(-1);
      return last && page.items.length === 50
        ? {
            before_created_at: last.created_at,
            before_id: last.reconciliation_id,
          }
        : undefined;
    },
  });
  const transfers = reconciliation.data?.pages.flatMap((page) => page.items) || [];
  const vietqrAction = useAction();
  const momoAction = useAction();
  const qrMissing = vietqr.error instanceof ApiError && vietqr.error.status === 404;
  const momoMissing = momo.error instanceof ApiError && momo.error.status === 404;
  const qr = vietqr.data || {
    version: 0,
    enabled: false,
    masked_account_number: "Chưa cấu hình",
    bank_bin: "",
    account_name: "",
  };
  const mo = momo.data || {
    version: 0,
    enabled: false,
    masked_partner_code: "Chưa cấu hình",
  };
  return (
    <>
      <span className="eyebrow">THANH TOÁN</span>
      <h1>Cấu hình và đối soát</h1>
      <div className="two-columns">
        <section>
          <Card asChild>
            <div className="panel">
              <h2>VietQR</h2>
              {vietqr.isPending ? (
                <Loading />
              ) : vietqr.error && !qrMissing ? (
                <ErrorNotice error={vietqr.error} />
              ) : (
                <>
                  <p>
                    {qr.enabled ? "Đang bật" : "Đang tắt"} · {qr.masked_account_number}
                  </p>
                  <form
                    key={qr.version}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = new FormData(e.currentTarget);
                      void vietqrAction.run("/api/v1/admin/payment-providers/vietqr", "PUT", {
                        expected_version: qr.version,
                        enabled: form.has("enabled"),
                        bank_bin: String(form.get("bank_bin")),
                        account_number: String(form.get("account_number")),
                        account_name: String(form.get("account_name")),
                      });
                    }}
                  >
                    <Label className="check">
                      <Checkbox name="enabled" defaultChecked={qr.enabled} />
                      Bật VietQR
                    </Label>
                    <Field
                      label="Mã ngân hàng (BIN)"
                      name="bank_bin"
                      value={qr.bank_bin}
                      maxLength={6}
                    />
                    <Field label="Số tài khoản" name="account_number" maxLength={19} />
                    <Field
                      label="Tên tài khoản (không dấu)"
                      name="account_name"
                      value={qr.account_name}
                      maxLength={50}
                    />
                    <Button disabled={vietqrAction.pending}>Lưu cấu hình</Button>
                    <ActionFeedback action={vietqrAction} />
                  </form>
                </>
              )}
            </div>
          </Card>
          <Card asChild>
            <div className="panel">
              <h2>MoMo</h2>
              {momo.isPending ? (
                <Loading />
              ) : momo.error && !momoMissing ? (
                <ErrorNotice error={momo.error} />
              ) : (
                <>
                  <p>
                    {mo.enabled ? "Đang bật" : "Đang tắt"} · {mo.masked_partner_code}
                  </p>
                  <form
                    key={mo.version}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = new FormData(e.currentTarget);
                      void momoAction.run("/api/v1/admin/payment-providers/momo", "PUT", {
                        expected_version: mo.version,
                        enabled: form.has("enabled"),
                        partner_code: String(form.get("partner_code")),
                        access_key: String(form.get("access_key")),
                        secret_key: String(form.get("secret_key")),
                      });
                    }}
                  >
                    <Label className="check">
                      <Checkbox name="enabled" defaultChecked={mo.enabled} />
                      Bật MoMo
                    </Label>
                    <Field label="Mã đối tác" name="partner_code" maxLength={50} />
                    <Field
                      label="Access key mới"
                      name="access_key"
                      type="password"
                      maxLength={128}
                    />
                    <Field
                      label="Secret key mới"
                      name="secret_key"
                      type="password"
                      maxLength={256}
                    />
                    <Button disabled={momoAction.pending}>Lưu cấu hình</Button>
                    <ActionFeedback action={momoAction} />
                  </form>
                </>
              )}
            </div>
          </Card>
        </section>
        <aside>
          <VietQRConfirmation />
          <Card asChild>
            <div className="panel">
              <h2>Giao dịch cần đối soát</h2>
              {reconciliation.isPending ? (
                <Loading />
              ) : reconciliation.error ? (
                <ErrorNotice error={reconciliation.error} />
              ) : !transfers.length ? (
                <Empty>Không có giao dịch cần đối soát.</Empty>
              ) : (
                transfers.map((item) => (
                  <div className="summary-row" key={item.reconciliation_id}>
                    <div>
                      <strong>{item.transfer_reference}</strong>
                      <small>
                        {item.reason} · {new Date(item.received_at).toLocaleString("vi-VN")}
                      </small>
                    </div>
                    <span>{money(item.observed_amount_minor)}</span>
                  </div>
                ))
              )}
              {reconciliation.hasNextPage && (
                <Button
                  variant="outline"
                  type="button"
                  disabled={reconciliation.isFetchingNextPage}
                  onClick={() => void reconciliation.fetchNextPage()}
                >
                  Xem thêm giao dịch
                </Button>
              )}
              <p>Đối soát không tự mở lại đơn đã hết hạn.</p>
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}

export function RefundView({ refundID }: { refundID: string }) {
  const confirm = useConfirm();
  const { scope, ready } = useSession();
  const action = useAction();
  const query = useQuery({
    queryKey: [...scope, "refund", refundID],
    enabled: ready,
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/refunds/{refund_id}", {
          params: { path: { refund_id: refundID } },
        }),
      ),
    staleTime: 0,
  });
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorNotice error={query.error} retry={() => void query.refetch()} />;
  const refund: Schema["Refund"] = query.data;
  return (
    <>
      <Link href="/admin/orders">← Đơn hàng</Link>
      <span className="eyebrow">HOÀN TIỀN</span>
      <h1>Hoàn tiền toàn phần</h1>
      <Card asChild>
        <div className="panel">
          <Badge state={refund.state} />
          <p>
            {money(refund.amount_minor)} · {refund.provider === "vietqr" ? "VietQR" : "MoMo"}
          </p>
          <p>Lý do: {refund.reason}</p>
          <ActionFeedback action={action} />
          {refund.state !== "succeeded" && refund.provider === "momo" && (
            <Button
              disabled={action.pending}
              onClick={() =>
                void action.run(
                  `/api/v1/admin/refunds/${refundID}/momo-executions`,
                  "POST",
                  undefined,
                  true,
                )
              }
            >
              Thực hiện hoàn tiền MoMo
            </Button>
          )}
          {refund.state !== "succeeded" && refund.provider === "vietqr" && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                if (await confirm("Bạn đã hoàn tiền ngoài hệ thống và kiểm tra chứng từ?"))
                  void action.run(
                    `/api/v1/admin/refunds/${refundID}/vietqr-settlements`,
                    "POST",
                    {
                      external_reference: String(form.get("external_reference")),
                      settled_at: new Date(String(form.get("settled_at"))).toISOString(),
                    },
                    true,
                  );
              }}
            >
              <h2>Ghi nhận hoàn tiền VietQR</h2>
              <Field label="Mã giao dịch hoàn tiền" name="external_reference" maxLength={128} />
              <Field label="Thời điểm hoàn tiền" name="settled_at" type="datetime-local" />
              <Button disabled={action.pending}>Ghi nhận đã hoàn tiền</Button>
            </form>
          )}
        </div>
      </Card>
    </>
  );
}
