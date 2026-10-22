"use client";

import { AddressFields } from "./address-fields";
import { useSession } from "./providers";
import { ActionFeedback, Empty, ErrorNotice, Field, Loading, useAction } from "./ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ApiError, api, request, unwrap, type Schema } from "@/lib/api/client";
import { money } from "@/lib/commerce";
import { formatAddress } from "@/lib/vn-address";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  CreditCard,
  PackageCheck,
  ShoppingBag,
  Clock3,
} from "lucide-react";

export { AddressFields } from "./address-fields";

export function addressFromForm(form: FormData): Schema["OrderAddress"] {
  const text = (name: string) => String(form.get(name) || "").trim();
  return {
    recipient_name: text("recipient_name"),
    phone: text("phone"),
    line1: text("line1"),
    line2: text("line2"),
    ward: text("ward"),
    district: text("district"),
    province: text("province"),
    postal_code: text("postal_code"),
    country_code: "VN",
  };
}

export { CartView } from "./cart-view";

export function CheckoutView() {
  const { scope, ready, session } = useSession();
  const action = useAction();
  const router = useRouter();
  const [submitted, setSubmitted] = useState<Schema["CheckoutWrite"]>();
  const [recoveredOrder, setRecoveredOrder] = useState<Schema["Order"]>();
  const [addressID, setAddressID] = useState("");
  const cart = useQuery({
    queryKey: [...scope, "cart"],
    queryFn: async () => {
      try {
        return unwrap(await api.GET("/api/v1/cart"));
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.status === 404 &&
          error.problem.code === "cart_unavailable"
        )
          return null;
        throw error;
      }
    },
    enabled: ready && session.kind !== "anonymous",
    staleTime: 0,
  });
  const addresses = useQuery({
    queryKey: [...scope, "addresses"],
    queryFn: async () => unwrap(await api.GET("/api/v1/customer/addresses")),
    enabled: ready && session.kind === "user",
  });
  const profile = useQuery({
    queryKey: [...scope, "profile"],
    queryFn: async () => unwrap(await api.GET("/api/v1/customer/profile")),
    enabled: ready && session.kind === "user",
  });
  const selectedAddress =
    addresses.data?.addresses.find((address) => address.address_id === addressID) ||
    addresses.data?.addresses[0];
  const currentCart = cart.data;
  if (!ready) return <Loading />;
  if (session.kind === "anonymous")
    return (
      <CheckoutFrame>
        <Empty>
          <h1>Bắt đầu từ giỏ hàng</h1>
          <Button asChild>
            <Link className="button" href="/products">
              Chọn sản phẩm
            </Link>
          </Button>
        </Empty>
      </CheckoutFrame>
    );
  if (recoveredOrder)
    return (
      <CheckoutFrame>
        <Empty>
          <h1>Đơn hàng đã được ghi nhận</h1>
          <p>
            Mã đơn: <strong>{recoveredOrder.order_number}</strong>
          </p>
          <p>
            Trình duyệt chưa nhận được quyền truy cập đơn. Vui lòng liên hệ cửa hàng với mã đơn này
            để kiểm tra; tránh đặt lại cùng đơn hàng.
          </p>
        </Empty>
      </CheckoutFrame>
    );
  if (submitted)
    return (
      <CheckoutFrame>
        <Empty>
          <h1>Đang xác nhận đơn hàng</h1>
          <p>Yêu cầu đặt hàng đã gửi được giữ nguyên trong khi cửa hàng xác nhận kết quả.</p>
          <p>
            Không đặt lại đơn mới. Nếu kết nối bị gián đoạn, dùng nút thử lại bên dưới để kiểm tra
            cùng yêu cầu.
          </p>
          <ActionFeedback action={action} onRetry={() => void place(submitted)} />
        </Empty>
      </CheckoutFrame>
    );
  if (cart.isPending) return <Loading />;
  if (cart.error)
    return (
      <CheckoutFrame>
        <ErrorNotice error={cart.error} retry={() => void cart.refetch()} />
      </CheckoutFrame>
    );
  if (!currentCart || !currentCart.checkout_ready || !currentCart.lines.length)
    return (
      <CheckoutFrame>
        <Empty>
          <ShoppingBag size={36} aria-hidden="true" />
          <h2>Giỏ hàng chưa sẵn sàng</h2>
          <p>Chọn sản phẩm còn hàng hoặc kiểm tra lại giỏ hàng trước khi tiếp tục.</p>
          <Button asChild>
            <Link href="/cart">
              Kiểm tra giỏ hàng <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </Button>
        </Empty>
      </CheckoutFrame>
    );
  if (session.kind === "user" && (addresses.isPending || profile.isPending)) return <Loading />;
  if (session.kind === "user" && addresses.error)
    return <ErrorNotice error={addresses.error} retry={() => void addresses.refetch()} />;
  if (
    session.kind === "user" &&
    profile.error &&
    !(profile.error instanceof ApiError && profile.error.status === 404)
  )
    return <ErrorNotice error={profile.error} retry={() => void profile.refetch()} />;
  if (session.kind === "user" && (!profile.data || !addresses.data?.addresses.length))
    return (
      <CheckoutFrame>
        <Empty>
          <h1>Hoàn tất thông tin giao hàng</h1>
          <p>Vui lòng lưu thông tin cá nhân và địa chỉ nhận hàng trước khi thanh toán.</p>
          <div className="actions">
            <Button asChild>
              <Link className="button" href="/account/profile">
                Thông tin cá nhân
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link className="button" href="/account/addresses">
                Địa chỉ nhận hàng
              </Link>
            </Button>
          </div>
        </Empty>
      </CheckoutFrame>
    );
  async function place(body: Schema["CheckoutWrite"]) {
    setSubmitted(body);
    const result = await action.run<Schema["CheckoutResult"]>(
      "/api/v1/checkout",
      "POST",
      body,
      true,
    );
    if (result) {
      if (session.kind === "guest") {
        try {
          const access = await request<{ order_access_available: boolean }>(
            `/api/session?order_id=${encodeURIComponent(result.order.order_id)}`,
          );
          if (!access.order_access_available) {
            setRecoveredOrder(result.order);
            return;
          }
        } catch {
          setRecoveredOrder(result.order);
          return;
        }
      }
      router.push(`/orders/${result.order.order_id}`);
    } else if (
      action.lastFailure.current instanceof ApiError &&
      action.lastFailure.current.status >= 400 &&
      action.lastFailure.current.status < 500 &&
      ![408, 429].includes(action.lastFailure.current.status)
    )
      setSubmitted(undefined);
  }
  return (
    <CheckoutFrame>
      <div className="checkout-layout">
        <Card asChild>
          <form
            className="checkout-form"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const address = addressFromForm(form);
              void place({
                cart_version: currentCart.version,
                payment_provider: "vietqr",
                ...(session.kind === "user"
                  ? { address_id: String(form.get("address_id")) }
                  : {
                      contact: {
                        name: address.recipient_name,
                        email: String(form.get("email")),
                        phone: address.phone,
                      },
                      delivery_address: address,
                    }),
              });
            }}
          >
            <fieldset disabled={action.pending || !!submitted} className="checkout-fields">
              <legend>
                <span className="checkout-section-number">01</span>
                <h2>Địa chỉ nhận hàng</h2>
              </legend>
              <p className="checkout-section-help">
                Chọn nơi nhận hàng và kiểm tra thông tin liên hệ.
              </p>
              {session.kind === "user" && (
                <>
                  <Label className="field">
                    <span>Địa chỉ đã lưu</span>
                    <NativeSelect
                      name="address_id"
                      required
                      value={selectedAddress?.address_id || ""}
                      onChange={(e) => setAddressID(e.target.value)}
                    >
                      <NativeSelectOption value="" disabled>
                        Chọn địa chỉ nhận hàng
                      </NativeSelectOption>
                      {addresses.data?.addresses.map((a) => (
                        <NativeSelectOption value={a.address_id} key={a.address_id}>
                          {a.label} · {a.line1}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Label>
                  {selectedAddress && (
                    <div className="saved-address-summary">
                      <strong>{selectedAddress.recipient_name}</strong>
                      <p>{selectedAddress.phone}</p>
                      <p>{formatAddress(selectedAddress)}</p>
                    </div>
                  )}
                  <Link className="text-link" href="/account/addresses">
                    <MapPin size={16} aria-hidden="true" />
                    Quản lý địa chỉ
                  </Link>
                </>
              )}
              {session.kind === "guest" && (
                <>
                  <Field
                    label="Email liên hệ"
                    name="email"
                    type="email"
                    maxLength={254}
                    autoComplete="shipping email"
                    inputMode="email"
                  />
                  <AddressFields />
                </>
              )}
              <div className="checkout-payment-heading">
                <span className="checkout-section-number">02</span>
                <h2>Phương thức thanh toán</h2>
              </div>
              <RadioGroup
                name="payment_provider"
                value="vietqr"
                className="checkout-payment-options"
                required
                aria-label="Phương thức thanh toán"
              >
                <Label className="check payment-option">
                  <RadioGroupItem value="vietqr" />
                  <span>
                    <strong>Chuyển khoản VietQR</strong>
                    <small>Nhận mã QR và nội dung chuyển khoản sau khi đặt hàng.</small>
                  </span>
                  <CreditCard size={23} aria-hidden="true" />
                </Label>
                <Label className="check payment-option cursor-not-allowed opacity-60">
                  <RadioGroupItem value="momo" disabled />
                  <span>
                    <strong>Ví MoMo</strong>
                    <small>Tạm thời chưa khả dụng. Vui lòng chọn VietQR.</small>
                  </span>
                  <ShoppingBag size={23} aria-hidden="true" />
                </Label>
              </RadioGroup>
              <p className="customer-field-note">
                Hiện cửa hàng nhận thanh toán bằng VietQR. Bạn sẽ nhận hướng dẫn sau khi đơn hàng
                được ghi nhận.
              </p>
            </fieldset>
            <div className="checkout-submit">
              <Button className="w-full" disabled={action.pending}>
                <Check size={18} aria-hidden="true" />
                {action.pending ? "Đang xác nhận…" : "Đặt hàng"}
              </Button>
              <p>Kiểm tra lại địa chỉ và lựa chọn thanh toán trước khi gửi đơn.</p>
            </div>
            <ActionFeedback action={action} />
          </form>
        </Card>
        <Card asChild>
          <aside className="checkout-summary">
            <span className="eyebrow">NHỮNG LỰA CHỌN CỦA BẠN</span>
            <h2>Kiểm tra đơn hàng</h2>
            {currentCart.lines.map((line) => (
              <div className="summary-row" key={line.variant_id}>
                <span>
                  {line.product_name} × {line.quantity}
                  <small>{Object.values(line.option_values || {}).join(" / ")}</small>
                </span>
                <span>{money(line.line_estimate?.amount_minor)}</span>
              </div>
            ))}
            <div className="summary-row checkout-shipping">
              <span>Phí giao hàng</span>
              <span>Xác nhận khi đặt hàng</span>
            </div>
            <div className="summary-row total">
              <span>Tạm tính sản phẩm</span>
              <span>{money(currentCart.estimated_subtotal?.amount_minor)}</span>
            </div>
            <small>Giá đã gồm VAT · Chưa gồm phí giao hàng</small>
            <div className="checkout-summary-note">
              <CreditCard size={19} aria-hidden="true" />
              <p>
                Chuyển khoản VietQR
                <small>Bạn sẽ thanh toán sau khi đơn được ghi nhận.</small>
              </p>
            </div>
            <div className="checkout-summary-note">
              <Clock3 size={19} aria-hidden="true" />
              <p>
                Giữ hàng sau khi đặt đơn
                <small>
                  Thời hạn giữ hàng và tổng tiền chính thức được hiển thị trên trang đơn hàng.
                </small>
              </p>
            </div>
          </aside>
        </Card>
      </div>
    </CheckoutFrame>
  );
}

function CheckoutFrame({ children }: { children: ReactNode }) {
  return (
    <div className="checkout-page">
      <Link className="customer-back" href="/cart">
        <ArrowLeft size={16} aria-hidden="true" />
        Quay lại giỏ hàng
      </Link>
      <header className="cart-page-heading">
        <div>
          <span className="eyebrow">SẮP ĐẾN TAY BẠN</span>
          <h1>Hoàn tất đơn hàng</h1>
          <p>Thông tin rõ ràng để cửa hàng chuẩn bị đúng lựa chọn của bạn.</p>
        </div>
        <ol className="cart-progress" aria-label="Các bước đặt hàng">
          <li>
            <span>01</span>Giỏ hàng
          </li>
          <li aria-current="step">
            <span>02</span>Thông tin
          </li>
          <li>
            <span>03</span>Xác nhận
          </li>
        </ol>
      </header>
      {children}
      <div className="customer-inline-note">
        <PackageCheck size={20} aria-hidden="true" />
        <p>Cửa hàng kiểm tra lại giá, tồn kho và phương thức thanh toán khi ghi nhận đơn.</p>
      </div>
    </div>
  );
}
