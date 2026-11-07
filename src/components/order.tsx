"use client";

import { useSession } from "./providers";
import { ActionFeedback, Badge, ErrorNotice, Field, Loading, useAction } from "./ui";
import { useConfirm } from "@/components/confirm";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, unwrap, type Schema } from "@/lib/api/client";
import { money, paymentLink } from "@/lib/commerce";
import { formatAddress } from "@/lib/vn-address";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock3,
  Copy,
  CreditCard,
  MapPin,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Truck,
  AlertCircle,
} from "lucide-react";

export function OrderSummary({
  order,
  renderLine,
}: {
  order: Schema["Order"];
  renderLine?: (line: Schema["OrderLine"]) => ReactNode;
}) {
  return (
    <>
      <Card asChild>
        <div className="order-items-card">
          <div className="order-card-heading">
            <ShoppingBag size={23} aria-hidden="true" />
            <h2>Chi tiết đơn hàng</h2>
          </div>
          <p className="order-number-label">{order.order_number}</p>
          <Badge state={order.state} />
          {order.lines.map((line) => (
            <div className="summary-row" key={line.variant_id}>
              {renderLine ? (
                renderLine(line)
              ) : (
                <span>
                  {line.product_name} × {line.quantity}
                  <small>{Object.values(line.option_values).join(" / ")}</small>
                </span>
              )}
              <span>{money(line.line_total.amount_minor)}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Tạm tính</span>
            <span>{money(order.subtotal.amount_minor)}</span>
          </div>
          <div className="summary-row">
            <span>Giao hàng</span>
            <span>{money(order.shipping_total.amount_minor)}</span>
          </div>
          <div className="summary-row total">
            <span>Tổng cộng</span>
            <span>{money(order.grand_total.amount_minor)}</span>
          </div>
          <small>Giá đã bao gồm VAT</small>
        </div>
      </Card>
      <Card asChild>
        <div className="order-delivery-card">
          <div className="order-card-heading">
            <MapPin size={23} aria-hidden="true" />
            <h2>Thông tin giao hàng</h2>
          </div>
          <strong>{order.delivery_address.recipient_name}</strong>
          <p>{order.delivery_address.phone}</p>
          <p>{formatAddress(order.delivery_address)}</p>
          {order.shipment && (
            <>
              <Badge state={order.shipment.state} />
              <p>
                {order.shipment.carrier} · {order.shipment.tracking_number}
              </p>
              {order.shipment.shipped_at && (
                <small>
                  Gửi hàng: {new Date(order.shipment.shipped_at).toLocaleString("vi-VN")}
                </small>
              )}
              {order.shipment.completed_at && (
                <small>
                  Hoàn tất: {new Date(order.shipment.completed_at).toLocaleString("vi-VN")}
                </small>
              )}
            </>
          )}
        </div>
      </Card>
    </>
  );
}

export function OrderView({ orderID }: { orderID: string }) {
  return <OrderContent key={orderID} orderID={orderID} />;
}

function OrderContent({ orderID }: { orderID: string }) {
  const confirm = useConfirm();
  const { scope, ready } = useSession();
  const query = useQuery({
    queryKey: [...scope, "order", orderID],
    enabled: ready,
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/orders/{order_id}", {
          params: { path: { order_id: orderID } },
        }),
      ),
    staleTime: 0,
    refetchInterval: 5000,
  });
  const action = useAction();
  const [instruction, setInstruction] = useState<Schema["VietQRInstruction"]>();
  const [attempt, setAttempt] = useState<Schema["MoMoAttempt"]>();
  const [now, setNow] = useState(() => Date.now());
  const [copyState, setCopyState] = useState("");
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorNotice error={query.error} retry={() => void query.refetch()} />;
  const order = query.data;
  const remaining = Math.max(0, Date.parse(order.reservation_expires_at) - now);
  const canPay =
    order.state === "pending_payment" && order.payment.state === "pending" && remaining > 0;
  const validInstruction =
    instruction?.order_id === orderID &&
    instruction.payment_id === order.payment.payment_id &&
    Date.parse(instruction.expires_at) > now;
  const validAttempt =
    attempt?.order_id === orderID &&
    attempt.payment_id === order.payment.payment_id &&
    attempt.state === "action_required" &&
    Date.parse(attempt.expires_at) > now;
  async function pay() {
    if (order.payment.provider === "vietqr") {
      const result = await action.run<Schema["VietQRInstruction"]>(
        `/api/v1/orders/${orderID}/payments/vietqr/instructions`,
        "POST",
        undefined,
        true,
      );
      if (result) setInstruction(result);
    } else {
      const result = await action.run<Schema["MoMoAttempt"]>(
        `/api/v1/orders/${orderID}/payments/momo/attempts`,
        "POST",
        undefined,
        true,
      );
      if (result) setAttempt(result);
    }
  }
  const link = validAttempt ? paymentLink(attempt?.pay_url) : undefined;
  const rank = ["pending_payment", "paid", "processing", "shipped", "completed"].indexOf(
    order.state,
  );
  const notice =
    order.payment.state === "refunded"
      ? { title: "Đã hoàn tiền", text: "Cửa hàng đã ghi nhận hoàn tiền cho đơn hàng này." }
      : order.payment.state === "refund_pending" || order.state === "refund_pending"
        ? {
            title: "Đang xử lý hoàn tiền",
            text: "Yêu cầu hoàn tiền đã được ghi nhận. Trạng thái sẽ cập nhật khi cửa hàng hoàn tất.",
          }
        : order.state === "expired"
          ? {
              title: "Đơn hàng đã hết hạn",
              text: "Thời gian giữ hàng đã kết thúc. Không chuyển tiền cho đơn hàng này.",
            }
          : order.state === "cancelled"
            ? {
                title: "Đơn hàng đã hủy",
                text: "Đơn này không tiếp tục được xử lý. Bạn có thể quay lại danh mục để chọn sản phẩm khác.",
              }
            : order.payment.state === "reconciliation_required"
              ? {
                  title: "Giao dịch cần đối soát",
                  text: "Cửa hàng đang kiểm tra giao dịch. Không thanh toán thêm cho đơn hàng này.",
                }
              : order.payment.state === "expired"
                ? {
                    title: "Thanh toán đã hết hạn",
                    text: "Không chuyển tiền theo hướng dẫn cũ. Cập nhật trạng thái đơn và liên hệ cửa hàng nếu bạn đã thanh toán.",
                  }
                : order.payment.state === "failed"
                  ? {
                      title: "Thanh toán chưa thành công",
                      text: "Kiểm tra trạng thái giao dịch với cửa hàng trước khi thực hiện thanh toán khác.",
                    }
                  : order.state === "cancellation_requested"
                    ? {
                        title: "Đang xử lý yêu cầu hủy",
                        text: "Cửa hàng đang kiểm tra yêu cầu hủy đơn của bạn.",
                      }
                    : null;
  return (
    <div className="order-tracking-page">
      <Link className="customer-back" href="/products">
        <ArrowLeft size={16} aria-hidden="true" />
        Tiếp tục mua sắm
      </Link>
      <header className="order-page-heading">
        <div>
          <span className="eyebrow">ĐƠN HÀNG CỦA BẠN</span>
          <h1>Theo dõi đơn hàng</h1>
          <p>
            <strong>{order.order_number}</strong> · Đặt lúc{" "}
            {new Date(order.created_at).toLocaleString("vi-VN")}
          </p>
        </div>
        <Button variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}>
          <RefreshCw size={17} aria-hidden="true" />
          Cập nhật trạng thái
        </Button>
      </header>
      {notice && (
        <section className="order-state-notice" role="status">
          <AlertCircle size={25} aria-hidden="true" />
          <div>
            <h2>{notice.title}</h2>
            <p>{notice.text}</p>
          </div>
        </section>
      )}
      {rank >= 0 && !notice && (
        <ol className="order-timeline" aria-label="Tiến trình đơn hàng">
          {[
            { label: "Đã nhận đơn", Icon: ShoppingBag },
            { label: "Thanh toán", Icon: CreditCard },
            { label: "Chuẩn bị", Icon: PackageCheck },
            { label: "Giao hàng", Icon: Truck },
            { label: "Hoàn tất", Icon: Check },
          ].map(({ label, Icon }, index) => (
            <li
              key={label}
              data-complete={index < rank || rank === 4}
              aria-current={index === rank ? "step" : undefined}
            >
              <span>
                <Icon size={21} aria-hidden="true" />
              </span>
              <strong>{label}</strong>
              {index === rank && (
                <small>
                  {rank === 0 ? "Chờ thanh toán" : rank === 4 ? "Đã hoàn tất" : "Đang ở bước này"}
                </small>
              )}
            </li>
          ))}
        </ol>
      )}
      <div className="order-tracking-layout">
        <section className="order-information">
          <OrderSummary order={order} />
        </section>
        <Card asChild>
          <aside className="order-payment-card">
            <div className="order-card-heading">
              <CreditCard size={23} aria-hidden="true" />
              <h2>Thanh toán {order.payment.provider === "vietqr" ? "VietQR" : "MoMo"}</h2>
            </div>
            <Badge state={order.payment.state} />
            <div className="order-payment-amount">
              <span>Tổng thanh toán</span>
              <strong>{money(order.grand_total.amount_minor)}</strong>
              <small>Đã gồm phí giao hàng và VAT</small>
            </div>
            {canPay && (
              <>
                <div className="payment-countdown">
                  <Clock3 size={21} aria-hidden="true" />
                  <div>
                    <strong>
                      Còn khoảng {String(Math.floor(remaining / 60000)).padStart(2, "0")}:
                      {String(Math.floor(remaining / 1000) % 60).padStart(2, "0")} để thanh toán
                    </strong>
                    <small>
                      Hạn giữ hàng: {new Date(order.reservation_expires_at).toLocaleString("vi-VN")}
                    </small>
                  </div>
                </div>
                <Button disabled={action.pending} onClick={() => void pay()}>
                  {action.pending ? "Đang xử lý…" : "Lấy hướng dẫn thanh toán"}
                </Button>
                {instruction && validInstruction && (
                  <div className="vietqr-instructions">
                    <img
                      className="qr"
                      src={`data:image/png;base64,${instruction.qr_png_base64}`}
                      alt="Mã QR chuyển khoản cho đơn hàng"
                    />
                    <p>
                      Nội dung: <strong>{instruction.transfer_reference}</strong>
                    </p>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(instruction.transfer_reference);
                          setCopyState("Đã sao chép nội dung chuyển khoản.");
                        } catch {
                          setCopyState("Bạn có thể chọn nội dung phía trên và sao chép thủ công.");
                        }
                      }}
                    >
                      <Copy size={16} aria-hidden="true" />
                      Sao chép nội dung
                    </Button>
                    {!!copyState && <p role="status">{copyState}</p>}
                    <p className="price">{money(instruction.amount.amount_minor)}</p>
                    <small>
                      Quét mã chưa xác nhận thanh toán. Cửa hàng kiểm tra giao dịch trước khi cập
                      nhật đơn.
                    </small>
                  </div>
                )}
                {instruction && !validInstruction && (
                  <p className="customer-field-note">
                    Hướng dẫn thanh toán đã hết hạn hoặc không còn phù hợp. Kiểm tra lại trạng thái
                    trước khi lấy hướng dẫn mới.
                  </p>
                )}
                {attempt && (
                  <Alert asChild role={undefined}>
                    <div className="notice">
                      <Badge state={attempt.state} />
                      {link && (
                        <a className="button" href={link} rel="noreferrer">
                          Mở MoMo
                        </a>
                      )}
                      <small>Trạng thái thanh toán được cập nhật từ cửa hàng.</small>
                    </div>
                  </Alert>
                )}
                <form
                  className="order-cancel-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = new FormData(e.currentTarget);
                    if (await confirm("Hủy đơn hàng chưa thanh toán?"))
                      void action.run(
                        `/api/v1/orders/${orderID}/cancellations`,
                        "POST",
                        { reason: String(form.get("reason")) },
                        true,
                      );
                  }}
                >
                  <h3>Hủy đơn chưa thanh toán</h3>
                  <Field label="Lý do" name="reason" maxLength={240} />
                  <Button variant="outline" disabled={action.pending}>
                    Hủy đơn hàng
                  </Button>
                </form>
              </>
            )}
            {order.state === "pending_payment" && remaining === 0 && (
              <div className="order-expiry-check" role="status">
                <Clock3 size={23} aria-hidden="true" />
                <h3>Đang kiểm tra hạn giữ hàng</h3>
                <p>
                  Hạn giữ hàng hiển thị đã qua. Không chuyển tiền lúc này; hãy cập nhật trạng thái
                  để kiểm tra kết quả từ cửa hàng.
                </p>
              </div>
            )}
            {order.payment.state === "succeeded" && (
              <p className="payment-success">
                <Check size={20} aria-hidden="true" />
                Cửa hàng đã xác nhận thanh toán. Không cần thanh toán thêm.
              </p>
            )}
            <details className="order-payment-reference">
              <summary>Mã tham chiếu thanh toán</summary>
              <p>{order.payment.payment_id}</p>
            </details>
            <ActionFeedback action={action} />
          </aside>
        </Card>
      </div>
      <p className="order-tracking-help">
        Lưu đường dẫn trang này để quay lại theo dõi. Trạng thái chính thức được cập nhật từ cửa
        hàng.
      </p>
    </div>
  );
}
