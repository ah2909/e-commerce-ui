"use client";

import { Pager } from "./shared";
import { AdminProductIdentity, useAdminCatalog } from "./product-identity";
import { useConfirm } from "@/components/confirm";
import { OrderSummary } from "@/components/order";
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, unwrap, type Schema } from "@/lib/api/client";
import { money } from "@/lib/commerce";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function OrdersAdminView() {
  const catalog = useAdminCatalog();
  const { scope, ready } = useSession();
  const [state, setState] = useState<"paid" | "processing" | "shipped" | "">("");
  const query = useInfiniteQuery({
    queryKey: [...scope, "admin-orders", state],
    enabled: ready,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      unwrap(
        await api.GET("/api/v1/admin/orders", {
          params: {
            query: { limit: 25, cursor: pageParam, state: state || undefined },
          },
        }),
      ),
    getNextPageParam: (page) => page.next_cursor || undefined,
  });
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorNotice error={query.error} retry={() => void query.refetch()} />;
  const orders = query.data.pages.flatMap((p) => p.orders);
  return (
    <>
      <span className="eyebrow">ĐƠN HÀNG</span>
      <h1>Đơn cần xử lý</h1>
      <Label className="field">
        <span>Trạng thái</span>
        <NativeSelect value={state} onChange={(e) => setState(e.target.value as typeof state)}>
          <NativeSelectOption value="">Tất cả</NativeSelectOption>
          <NativeSelectOption value="paid">Đã thanh toán</NativeSelectOption>
          <NativeSelectOption value="processing">Đang chuẩn bị</NativeSelectOption>
          <NativeSelectOption value="shipped">Đang giao</NativeSelectOption>
        </NativeSelect>
      </Label>
      {!orders.length ? (
        <Empty>Không có đơn hàng trong trạng thái này.</Empty>
      ) : (
        <Card asChild>
          <div className="panel table-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Đơn hàng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Tổng</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.order_id}>
                    <TableCell>
                      <strong>{order.order_number}</strong>
                      <small>{order.contact.name}</small>
                      {order.lines.slice(0, 2).map((line) => (
                        <div key={line.line_id}>
                          <AdminProductIdentity
                            {...catalog.data?.variants.get(line.variant_id)}
                            snapshot={line}
                          />
                          <small>Số lượng: {line.quantity}</small>
                        </div>
                      ))}
                      {order.lines.length > 2 && (
                        <small>+{order.lines.length - 2} sản phẩm khác</small>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge state={order.state} />
                    </TableCell>
                    <TableCell>{money(order.grand_total.amount_minor)}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleString("vi-VN")}</TableCell>
                    <TableCell>
                      <Button asChild variant="outline">
                        <Link className="button" href={`/admin/orders/${order.order_id}`}>
                          Chi tiết
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
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

function ShipmentActions({ order }: { order: Schema["Order"] }) {
  const action = useAction();
  const router = useRouter();
  const shipment = order.shipment;
  return (
    <Card asChild>
      <div className="panel">
        <h2>Giao hàng</h2>
        <ActionFeedback action={action} />
        {!shipment && order.state === "paid" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              void action.run(
                `/api/v1/admin/orders/${order.order_id}/shipments`,
                "POST",
                {
                  carrier: String(form.get("carrier")),
                  tracking_number: String(form.get("tracking_number")),
                },
                true,
              );
            }}
          >
            <Field label="Đơn vị vận chuyển" name="carrier" maxLength={120} />
            <Field label="Mã vận đơn" name="tracking_number" maxLength={160} />
            <Button disabled={action.pending}>Tạo vận đơn</Button>
          </form>
        )}
        {shipment && (
          <>
            <Badge state={shipment.state} />
            <p>
              {shipment.carrier} · {shipment.tracking_number}
            </p>
            {shipment.state === "processing" && (
              <>
                <form
                  key={shipment.version}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = new FormData(e.currentTarget);
                    void action.run(`/api/v1/admin/shipments/${shipment.shipment_id}`, "PUT", {
                      carrier: String(form.get("carrier")),
                      tracking_number: String(form.get("tracking_number")),
                      expected_version: shipment.version,
                    });
                  }}
                >
                  <Field
                    label="Đơn vị vận chuyển"
                    name="carrier"
                    value={shipment.carrier}
                    maxLength={120}
                  />
                  <Field
                    label="Mã vận đơn"
                    name="tracking_number"
                    value={shipment.tracking_number}
                    maxLength={160}
                  />
                  <Button variant="outline" disabled={action.pending}>
                    Cập nhật vận đơn
                  </Button>
                </form>
                <div className="actions">
                  <Button
                    disabled={action.pending}
                    onClick={() =>
                      void action.run(
                        `/api/v1/admin/shipments/${shipment.shipment_id}/dispatches`,
                        "POST",
                        { expected_version: shipment.version },
                        true,
                      )
                    }
                  >
                    Đã gửi hàng
                  </Button>
                </div>
              </>
            )}
            {shipment.state === "shipped" && (
              <Button
                disabled={action.pending}
                onClick={() =>
                  void action
                    .run(
                      `/api/v1/admin/shipments/${shipment.shipment_id}/completions`,
                      "POST",
                      { expected_version: shipment.version },
                      true,
                    )
                    .then((result) => {
                      if (result) router.push("/admin/orders");
                    })
                }
              >
                Hoàn tất giao hàng
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

export function AdminOrderView({ orderID }: { orderID: string }) {
  const catalog = useAdminCatalog();
  const confirm = useConfirm();
  const { scope, ready } = useSession();
  const query = useQuery({
    queryKey: [...scope, "admin-order", orderID],
    enabled: ready,
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/orders/{order_id}", {
          params: { path: { order_id: orderID } },
        }),
      ),
    staleTime: 0,
    refetchInterval: 5000,
  });
  const action = useAction();
  const router = useRouter();
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorNotice error={query.error} retry={() => void query.refetch()} />;
  const order = query.data;
  return (
    <>
      <Link href="/admin/orders">← Đơn hàng</Link>
      <span className="eyebrow">ĐƠN HÀNG</span>
      <h1>{order.order_number}</h1>
      <div className="two-columns">
        <section>
          <OrderSummary
            order={order}
            renderLine={(line) => (
              <div>
                <AdminProductIdentity
                  {...catalog.data?.variants.get(line.variant_id)}
                  snapshot={line}
                />
                <small>Số lượng: {line.quantity}</small>
              </div>
            )}
          />
          <ShipmentActions order={order} />
        </section>
        <Card asChild>
          <aside className="panel">
            <h2>Thanh toán</h2>
            <Badge state={order.payment.state} />
            <p>
              {order.payment.provider === "vietqr" ? "VietQR" : "MoMo"} ·{" "}
              {money(order.payment.amount.amount_minor)}
            </p>
            <ActionFeedback action={action} />
            {order.state !== "cancelled" && order.state !== "completed" && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const reason = String(new FormData(e.currentTarget).get("reason"));
                  if (await confirm("Xác nhận hủy đơn? Đơn đã thanh toán cần quy trình hoàn tiền."))
                    void action
                      .run<
                        Schema["CancellationResult"]
                      >(`/api/v1/admin/orders/${orderID}/cancellations`, "POST", { reason }, true)
                      .then((result) => {
                        if (result)
                          router.push(
                            result.refund_id
                              ? `/admin/refunds/${result.refund_id}`
                              : "/admin/orders",
                          );
                      });
                }}
              >
                <h3>Hủy đơn</h3>
                <Field label="Lý do" name="reason" maxLength={240} />
                <Button variant="outline" disabled={action.pending}>
                  Yêu cầu hủy
                </Button>
              </form>
            )}
            {order.payment.provider === "vietqr" && order.payment.state === "pending" && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  if (
                    await confirm(
                      "Bạn đã kiểm tra tài khoản nhận, số tiền và mã chuyển khoản trên ngân hàng?",
                    )
                  )
                    void action.run(
                      `/api/v1/admin/payments/${order.payment.payment_id}/vietqr-confirmations`,
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
                <h3>Xác nhận chuyển khoản VietQR</h3>
                <p>Chỉ xác nhận sau khi kiểm tra giao dịch thực trên ngân hàng.</p>
                <Field label="Mã chuyển khoản" name="transfer_reference" maxLength={64} />
                <Field
                  label="Số tiền nhận (VND)"
                  name="amount_minor"
                  type="number"
                  min={0}
                  value={order.payment.amount.amount_minor}
                />
                <Field label="Thời điểm nhận" name="received_at" type="datetime-local" />
                <Button disabled={action.pending}>Xác nhận thanh toán</Button>
              </form>
            )}
          </aside>
        </Card>
      </div>
    </>
  );
}
