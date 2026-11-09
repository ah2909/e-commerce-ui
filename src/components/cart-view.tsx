"use client";

import { useSession } from "./providers";
import { useStoreCatalog } from "./store-catalog";
import { CatalogResults, ProductImage } from "./catalog";
import { ActionFeedback, ErrorNotice, Field, Loading, useAction } from "./ui";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError, api, unwrap } from "@/lib/api/client";
import { emptyFilters, filterCatalog } from "@/lib/catalog";
import { money } from "@/lib/commerce";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  PackageCheck,
  Ruler,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export function CartView() {
  const { scope, ready, session } = useSession();
  const action = useAction();
  const catalog = useStoreCatalog();
  const query = useQuery({
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
  const cart = query.data;
  const products = catalog.data || [];
  const empty = session.kind === "anonymous" || (query.isSuccess && (!cart || !cart.lines.length));
  const recommendations = filterCatalog(products, { ...emptyFilters, stock: "in-stock" }).slice(
    0,
    4,
  );
  return (
    <div className="shopping-cart-page">
      <Link href="/products" className="customer-back">
        <ArrowLeft size={16} aria-hidden="true" />
        Tiếp tục mua sắm
      </Link>
      <header className="cart-page-heading">
        <div>
          <span className="eyebrow">NHỮNG LỰA CHỌN CỦA BẠN</span>
          <h1>Giỏ hàng của bạn</h1>
          <p>Kiểm tra sản phẩm và kích cỡ trước khi đến bước đặt hàng.</p>
        </div>
        <ol className="cart-progress" aria-label="Các bước đặt hàng">
          <li aria-current="step">
            <span>01</span>Giỏ hàng
          </li>
          <li>
            <span>02</span>Giao hàng
          </li>
          <li>
            <span>03</span>Thanh toán
          </li>
        </ol>
      </header>
      {!ready || (session.kind !== "anonymous" && query.isPending) ? (
        <Loading />
      ) : query.error ? (
        <section className="cart-load-error">
          <ShoppingBag size={32} aria-hidden="true" />
          <h2>Chưa thể tải giỏ hàng</h2>
          <p>Giỏ hàng tạm thời chưa tải được. Hãy thử lại sau một chút.</p>
          <ErrorNotice
            error={
              query.error instanceof ApiError
                ? new ApiError(query.error.status, {
                    ...query.error.problem,
                    message: "Không thể tải giỏ hàng lúc này.",
                  })
                : new Error("Kết nối chưa thành công. Vui lòng thử lại.")
            }
            retry={() => void query.refetch()}
          />
        </section>
      ) : empty ? (
        <>
          <div className="cart-empty-layout">
            <section className="cart-empty-card">
              <span className="cart-empty-icon">
                <ShoppingBag size={45} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <span className="eyebrow">CHƯA CÓ SẢN PHẨM NÀO</span>
              <h2>
                Đam mê bắt đầu
                <br />
                từ một lựa chọn.
              </h2>
              <p>Giỏ hàng của bạn đang trống. Khám phá danh mục và tìm sản phẩm dành cho mình.</p>
              <Button asChild>
                <Link href="/products">
                  Khám phá sản phẩm <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </Button>
            </section>
            <aside className="cart-shopping-notes">
              <span className="eyebrow">TRƯỚC KHI BẠN CHỌN</span>
              <h2>Mua sắm theo cách của bạn.</h2>
              {[
                {
                  Icon: Ruler,
                  title: "Chọn kích cỡ phù hợp",
                  text: "Đối chiếu nhãn kích cỡ của từng sản phẩm trước khi thêm vào giỏ.",
                },
                {
                  Icon: ShoppingBag,
                  title: "Tìm điều bạn yêu thích",
                  text: "Lọc theo bộ sưu tập, thương hiệu và khoảng giá để tìm nhanh hơn.",
                },
                {
                  Icon: PackageCheck,
                  title: "Kiểm tra trước khi đặt",
                  text: "Xem phí giao hàng và tổng tiền trên trang đơn hàng trước khi thanh toán.",
                },
              ].map(({ Icon, title, text }) => (
                <div className="cart-shopping-note" key={title}>
                  <Icon size={23} aria-hidden="true" />
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </aside>
          </div>
          {!!recommendations.length && (
            <section className="cart-recommendations">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">GỢI Ý ĐỂ BẮT ĐẦU</span>
                  <h2>Có thể bạn sẽ thích</h2>
                </div>
                <Link className="text-link" href="/products">
                  Xem tất cả <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
              <CatalogResults results={recommendations} featured />
            </section>
          )}
        </>
      ) : (
        cart && (
          <>
            <ActionFeedback action={action} />
            <div className="cart-content-layout">
              <section className="cart-items-panel" aria-label="Sản phẩm trong giỏ">
                <div className="cart-items-heading">
                  <h2>Sản phẩm đã chọn</h2>
                  <span>
                    {cart.lines.reduce((total, line) => total + line.quantity, 0)} sản phẩm
                  </span>
                </div>
                {cart.lines.map((line) => {
                  const product = products.find((product) =>
                    product.variants.some((variant) => variant.variant_id === line.variant_id),
                  );
                  return (
                    <article className="shopping-cart-item" key={line.variant_id}>
                      <div className="cart-item-picture">
                        {product ? (
                          <Link href={`/products/${encodeURIComponent(product.slug)}`}>
                            <ProductImage
                              media={product.media}
                              name={line.product_name || product.name}
                            />
                          </Link>
                        ) : (
                          <ShoppingBag size={32} aria-hidden="true" />
                        )}
                      </div>
                      <div className="cart-item-info">
                        <h3>
                          {product ? (
                            <Link href={`/products/${encodeURIComponent(product.slug)}`}>
                              {line.product_name || product.name}
                            </Link>
                          ) : (
                            line.product_name || "Sản phẩm không còn bán"
                          )}
                        </h3>
                        <p className="cart-item-variant">
                          {Object.values(line.option_values || {}).join(" / ") || line.sku}
                        </p>
                        <span className="price">{money(line.unit_price?.amount_minor)}</span>
                        {(!line.sellable || !line.in_stock) && (
                          <Alert asChild variant="destructive" role={undefined}>
                            <p className="notice danger">Sản phẩm chưa sẵn sàng để thanh toán.</p>
                          </Alert>
                        )}
                        <div className="cart-item-controls">
                          <form
                            key={`${line.variant_id}:${cart.version}`}
                            aria-label={`Cập nhật ${line.product_name || "sản phẩm"}`}
                            onSubmit={(event) => {
                              event.preventDefault();
                              const form = new FormData(event.currentTarget);
                              void action.run(`/api/v1/cart/lines/${line.variant_id}`, "PUT", {
                                quantity: Number(form.get("quantity")),
                                expected_version: cart.version,
                              });
                            }}
                          >
                            <Field
                              name="quantity"
                              label="Số lượng"
                              type="number"
                              value={line.quantity}
                              min={1}
                              max={2147483647}
                            />
                            <Button variant="outline" disabled={action.pending}>
                              Cập nhật
                            </Button>
                          </form>
                          <Button
                            variant="ghost"
                            disabled={action.pending}
                            onClick={() =>
                              void action.run(`/api/v1/cart/lines/${line.variant_id}`, "DELETE", {
                                expected_version: cart.version,
                              })
                            }
                          >
                            <Trash2 size={16} aria-hidden="true" />
                            Xóa
                          </Button>
                        </div>
                      </div>
                      <div className="cart-item-total">
                        <span>Tạm tính</span>
                        <strong>{money(line.line_estimate?.amount_minor)}</strong>
                      </div>
                    </article>
                  );
                })}
              </section>
              <aside className="cart-order-summary">
                <span className="eyebrow">BƯỚC TIẾP THEO</span>
                <h2>Tóm tắt giỏ hàng</h2>
                <div className="summary-row">
                  <span>Số lượng</span>
                  <strong>
                    {cart.lines.reduce((total, line) => total + line.quantity, 0)} sản phẩm
                  </strong>
                </div>
                <div className="summary-row">
                  <span>Tạm tính</span>
                  <strong>{money(cart.estimated_subtotal?.amount_minor)}</strong>
                </div>
                <div className="cart-shipping-estimate">
                  <PackageCheck size={19} aria-hidden="true" />
                  <p>Phí giao hàng được hiển thị sau khi đặt đơn, trước khi thanh toán.</p>
                </div>
                <div className="cart-summary-total">
                  <span>Tạm tính sản phẩm</span>
                  <strong>{money(cart.estimated_subtotal?.amount_minor)}</strong>
                  <small>Giá đã bao gồm VAT · Chưa gồm phí giao hàng</small>
                </div>
                {cart.checkout_ready && cart.status === "active" ? (
                  <Button asChild className="w-full">
                    <Link href="/checkout">
                      Tiếp tục thanh toán <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                  </Button>
                ) : (
                  <p className="cart-checkout-blocked" role="status">
                    Vui lòng kiểm tra lại sản phẩm trong giỏ trước khi thanh toán.
                  </p>
                )}
                <span className="cart-summary-note">
                  <Check size={16} aria-hidden="true" />
                  Giá và tồn kho được kiểm tra lại khi đặt hàng.
                </span>
              </aside>
            </div>
          </>
        )
      )}
    </div>
  );
}
