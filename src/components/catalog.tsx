"use client";

import { useSession } from "./providers";
import { useStoreCatalog } from "./store-catalog";
import { ActionFeedback, Empty, ErrorNotice, Loading, useAction } from "./ui";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { api, unwrap, type Schema } from "@/lib/api/client";
import { money } from "@/lib/commerce";
import { useQuery } from "@tanstack/react-query";
import {
  brandOf,
  emptyFilters,
  filterCatalog,
  priceBound,
  readFilters,
  type CatalogFilters,
} from "@/lib/catalog";
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Ruler,
  PackageCheck,
  Check,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function ProductImage({
  media,
  name,
}: {
  media: Schema["PublicCatalogMedia"][];
  name: string;
}) {
  const [failed, setFailed] = useState<string>();
  const selected = [...media].sort((a, b) => a.position - b.position)[0];
  const key = selected?.object_key;
  if (!key || failed === key)
    return (
      <div className="product-image product-placeholder">
        <span className="placeholder-shape" aria-hidden="true" />
        Chưa có hình ảnh
      </div>
    );
  return (
    <img
      className="product-image"
      src={`/api/media?key=${encodeURIComponent(key)}`}
      alt={selected?.alt_text || name}
      loading="lazy"
      onError={() => setFailed(key)}
    />
  );
}

export function Catalog({ featured = false }: { featured?: boolean }) {
  const query = useStoreCatalog();
  const searchParams = useSearchParams();
  const filters = featured
    ? emptyFilters
    : readFilters(new URLSearchParams(searchParams.toString()));
  function change(key: keyof CatalogFilters, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === emptyFilters[key]) params.delete(key);
    else params.set(key, value);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${params.size ? `?${params}` : ""}`,
    );
  }
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorNotice error={query.error} retry={() => void query.refetch()} />;
  const products = query.data;
  if (!products.length)
    return (
      <Empty>
        <h2>Sản phẩm sẽ sớm có mặt</h2>
        <p>Cửa hàng chưa có sản phẩm đang bán.</p>
      </Empty>
    );
  const brands = [...new Set(products.map(brandOf).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
  const categories = [
    ...new Map(
      products
        .flatMap((product) => product.categories || [])
        .filter((category) => !/^brand\s/i.test(category.name))
        .map((category) => [category.slug, category]),
    ).values(),
  ].sort((a, b) => a.name.localeCompare(b.name, "vi"));
  const sizes = [
    ...new Set(
      products
        .flatMap((product) => product.variants.map((variant) => variant.option_values.size))
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "vi", { numeric: true }));
  const results = filterCatalog(products, filters);
  const invalidRange =
    priceBound(filters.min) !== undefined &&
    priceBound(filters.max) !== undefined &&
    Number(filters.min) > Number(filters.max);
  const active = Object.entries(filters).filter(
    ([key, value]) => value !== emptyFilters[key as keyof CatalogFilters],
  );
  return (
    <>
      {!featured && (
        <section className="catalog-controls" aria-label="Tìm kiếm và lọc sản phẩm">
          <div className="catalog-search-row">
            <Label className="catalog-search block">
              <span className="sr-only">Tìm sản phẩm</span>
              <Search size={20} aria-hidden="true" />
              <Input
                className="pl-11"
                type="search"
                placeholder="Tìm tên đội bóng, sản phẩm, mã SKU…"
                value={filters.q}
                onChange={(event) => change("q", event.target.value)}
              />
            </Label>
            <Label className="catalog-sort flex-col gap-0">
              <span>Sắp xếp</span>
              <NativeSelect
                value={filters.sort}
                onChange={(event) => change("sort", event.target.value)}
              >
                <NativeSelectOption value="newest">Mới nhất</NativeSelectOption>
                <NativeSelectOption value="price-asc">Giá: thấp đến cao</NativeSelectOption>
                <NativeSelectOption value="price-desc">Giá: cao đến thấp</NativeSelectOption>
                <NativeSelectOption value="name-asc">Tên: A đến Z</NativeSelectOption>
              </NativeSelect>
            </Label>
          </div>
          <div className="catalog-filter-grid">
            <Label className="field">
              <span>Thương hiệu</span>
              <NativeSelect
                value={filters.brand}
                onChange={(event) => change("brand", event.target.value)}
              >
                <NativeSelectOption value="">Tất cả thương hiệu</NativeSelectOption>
                {brands.map((brand) => (
                  <NativeSelectOption key={brand} value={brand}>
                    {brand}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Label>
            <Label className="field">
              <span>Bộ sưu tập</span>
              <NativeSelect
                value={filters.category}
                onChange={(event) => change("category", event.target.value)}
              >
                <NativeSelectOption value="">Tất cả bộ sưu tập</NativeSelectOption>
                {categories.map((category) => (
                  <NativeSelectOption key={category.slug} value={category.slug}>
                    {category.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Label>
            <Label className="field">
              <span>Kích cỡ</span>
              <NativeSelect
                value={filters.size}
                onChange={(event) => change("size", event.target.value)}
              >
                <NativeSelectOption value="">Tất cả kích cỡ</NativeSelectOption>
                {sizes.map((size) => (
                  <NativeSelectOption key={size} value={size}>
                    {size}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Label>
            <Label className="field">
              <span>Giá từ (VND)</span>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                placeholder="0"
                value={filters.min}
                aria-invalid={invalidRange}
                aria-describedby={invalidRange ? "price-range-error" : undefined}
                onChange={(event) => change("min", event.target.value)}
              />
            </Label>
            <Label className="field">
              <span>Giá đến (VND)</span>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                placeholder="Không giới hạn"
                value={filters.max}
                aria-invalid={invalidRange}
                aria-describedby={invalidRange ? "price-range-error" : undefined}
                onChange={(event) => change("max", event.target.value)}
              />
            </Label>
          </div>
          <div className="catalog-filter-bottom">
            <label className="stock-filter">
              <input
                type="checkbox"
                checked={!!filters.stock}
                onChange={(event) => change("stock", event.target.checked ? "in-stock" : "")}
              />
              Chỉ xem sản phẩm còn hàng
            </label>
            <span>
              <SlidersHorizontal size={15} aria-hidden="true" /> Lọc trên toàn bộ danh mục
            </span>
          </div>
          {invalidRange && (
            <p id="price-range-error" role="alert">
              Giá đến phải lớn hơn hoặc bằng giá từ.
            </p>
          )}
          {!!active.length && (
            <div className="filter-chips">
              {active.map(([key, value]) => (
                <Button
                  variant="outline"
                  size="sm"
                  key={key}
                  onClick={() =>
                    change(key as keyof CatalogFilters, emptyFilters[key as keyof CatalogFilters])
                  }
                >
                  {key === "category"
                    ? categories.find((category) => category.slug === value)?.name || value
                    : key === "stock"
                      ? "Còn hàng"
                      : key === "min"
                        ? `Từ ${money(priceBound(value))}`
                        : key === "max"
                          ? `Đến ${money(priceBound(value))}`
                          : key === "sort"
                            ? {
                                "price-asc": "Giá tăng dần",
                                "price-desc": "Giá giảm dần",
                                "name-asc": "Tên A–Z",
                              }[value] || value
                            : value}
                  <X size={14} aria-hidden="true" />
                  <span className="sr-only">Xóa bộ lọc</span>
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.replaceState(null, "", window.location.pathname)}
              >
                Xóa tất cả
              </Button>
            </div>
          )}
        </section>
      )}
      {!featured && (
        <div className="catalog-result-heading">
          <p role="status" aria-live="polite">
            <strong>{results.length}</strong> sản phẩm
            {active.length
              ? ` phù hợp · ${products.length} sản phẩm trong cửa hàng`
              : " để bạn khám phá"}
          </p>
        </div>
      )}
      {!results.length ? (
        <Empty>
          <Search size={28} aria-hidden="true" />
          <h2>Chưa tìm thấy sản phẩm phù hợp</h2>
          <p>Thử đổi từ khóa hoặc mở rộng khoảng giá và bộ lọc.</p>
          <Button
            variant="outline"
            onClick={() => window.history.replaceState(null, "", window.location.pathname)}
          >
            Xóa bộ lọc
          </Button>
        </Empty>
      ) : (
        <CatalogResults key={JSON.stringify(filters)} results={results} featured={featured} />
      )}
    </>
  );
}

export function CatalogResults({
  results,
  featured,
}: {
  results: ReturnType<typeof filterCatalog>;
  featured: boolean;
}) {
  const [visible, setVisible] = useState(featured ? 4 : 24);
  return (
    <>
      <div className="product-grid">
        {results.slice(0, visible).map(({ product, price, inStock, brand }) => {
          return (
            <Link
              className="product-card"
              key={product.product_id}
              href={`/products/${encodeURIComponent(product.slug)}`}
            >
              <ProductImage media={product.media} name={product.name} />
              {brand && <span className="product-brand">{brand}</span>}
              <h3>{product.name}</h3>
              <div className="card-bottom">
                <span className="price">{money(price)}</span>
                <UiBadge variant={inStock ? "secondary" : "warning"}>
                  {inStock ? "Còn hàng" : "Hết hàng"}
                </UiBadge>
              </div>
            </Link>
          );
        })}
      </div>
      {!featured && visible < results.length && (
        <div className="actions">
          <Button variant="outline" onClick={() => setVisible((count) => count + 24)}>
            Xem thêm sản phẩm ({results.length - visible})
          </Button>
        </div>
      )}
    </>
  );
}

export function ProductDetail({ slug }: { slug: string }) {
  const { scope, ready, session, changeSession } = useSession();
  const [variantID, setVariantID] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const action = useAction();
  const router = useRouter();
  const query = useQuery({
    queryKey: [...scope, "product", slug],
    enabled: ready,
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/catalog/products/{slug}", {
          params: { path: { slug } },
        }),
      ),
  });
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorNotice error={query.error} retry={() => void query.refetch()} />;
  const product = query.data;
  const variant =
    product.variants.find((v) => v.variant_id === variantID) ||
    product.variants.find((v) => v.in_stock) ||
    product.variants[0];
  async function add() {
    if (session.kind === "anonymous") {
      const guest = await action.run("/api/v1/guest-sessions", "POST");
      if (!guest) return;
      await changeSession();
    }
    const cart = await action.run<Schema["Cart"]>("/api/v1/cart", "POST");
    if (!cart) return;
    const current = cart.lines.find((l) => l.variant_id === variant.variant_id)?.quantity || 0;
    if (
      await action.run(`/api/v1/cart/lines/${variant.variant_id}`, "PUT", {
        quantity: current + quantity,
        expected_version: cart.version,
      })
    )
      router.push("/cart");
  }
  return (
    <div className="product-detail-page">
      <Link href="/products" className="customer-back">
        <ArrowLeft size={16} aria-hidden="true" />
        Tất cả sản phẩm
      </Link>
      <div className="product-detail-layout">
        <ProductGallery key={product.product_id} product={product} />
        <section className="purchase-panel">
          <span className="eyebrow">{brandOf(product) || "LỰA CHỌN TỪ CỬA HÀNG"}</span>
          <h1>{product.name}</h1>
          <UiBadge variant={variant.in_stock ? "secondary" : "warning"}>
            {variant.in_stock ? "Còn hàng" : "Hết hàng"}
          </UiBadge>
          <h2 className="price">{money(variant.price.amount_minor)}</h2>
          <small>Giá đã bao gồm VAT</small>
          <div className="product-option-heading">
            <h3>Chọn kích cỡ / tùy chọn</h3>
            <span>{Object.values(variant.option_values).join(" / ") || variant.sku}</span>
          </div>
          <div className="variants product-variant-grid" aria-label="Kích cỡ và tùy chọn">
            {product.variants.map((v) => (
              <Button
                variant="outline"
                key={v.variant_id}
                className={
                  v.variant_id === variant.variant_id
                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    : undefined
                }
                aria-pressed={v.variant_id === variant.variant_id}
                onClick={() => setVariantID(v.variant_id)}
              >
                {Object.values(v.option_values).join(" / ") || v.sku}
                {!v.in_stock && " · Hết hàng"}
              </Button>
            ))}
          </div>
          <div className="product-size-note">
            <Ruler size={18} aria-hidden="true" />
            <span>Nhãn kích cỡ giữ nguyên theo sản phẩm. Đối chiếu hệ cỡ trước khi chọn.</span>
          </div>
          <div className="product-purchase-controls">
            <div className="field">
              <Label htmlFor="product-quantity">Số lượng</Label>
              <span className="quantity-stepper">
                <Button
                  type="button"
                  variant="ghost"
                  aria-label="Giảm số lượng"
                  disabled={action.pending || quantity <= 1}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                >
                  <Minus size={16} aria-hidden="true" />
                </Button>
                <Input
                  id="product-quantity"
                  type="number"
                  min={1}
                  max={2147483647}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  aria-label="Tăng số lượng"
                  disabled={action.pending || quantity >= 2147483647}
                  onClick={() => setQuantity((value) => Math.min(2147483647, value + 1))}
                >
                  <Plus size={16} aria-hidden="true" />
                </Button>
              </span>
            </div>
            <Button
              className="product-add-button"
              disabled={
                action.pending ||
                !variant.in_stock ||
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > 2147483647
              }
              onClick={() => void add()}
            >
              <ShoppingBag size={18} aria-hidden="true" />
              {action.pending ? "Đang thêm…" : "Thêm vào giỏ hàng"}
            </Button>
          </div>
          <div className="product-service-note">
            <PackageCheck size={18} aria-hidden="true" />
            <span>Phí giao hàng được xác nhận khi đặt hàng.</span>
          </div>
          <ActionFeedback action={action} />
          <section className="product-information">
            <h3>Thông tin sản phẩm</h3>
            <p className="product-description">
              {product.description ||
                "Xem kích cỡ, giá và tình trạng còn hàng trong các lựa chọn của sản phẩm."}
            </p>
            <dl>
              <div>
                <dt>Mã sản phẩm</dt>
                <dd>{variant.sku}</dd>
              </div>
              {variant.weight_grams > 0 && (
                <div>
                  <dt>Khối lượng</dt>
                  <dd>{variant.weight_grams} g</dd>
                </div>
              )}
              <div>
                <dt>Tình trạng</dt>
                <dd>
                  <Check size={15} aria-hidden="true" />
                  {variant.in_stock ? "Có thể đặt hàng" : "Hiện hết hàng ở lựa chọn này"}
                </dd>
              </div>
            </dl>
            <div className="product-category-links">
              {product.categories
                ?.filter((category) => !/^brand\s/i.test(category.name))
                .slice(0, 6)
                .map((category) => (
                  <Link
                    href={`/products?category=${encodeURIComponent(category.slug)}`}
                    key={category.category_id}
                  >
                    {category.name}
                    <ArrowRight size={13} aria-hidden="true" />
                  </Link>
                ))}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

function ProductGallery({ product }: { product: Schema["PublicCatalogProduct"] }) {
  const [selected, setSelected] = useState(0);
  const media = [...product.media].sort((a, b) => a.position - b.position);
  const current = media[selected] || media[0];
  return (
    <section className="product-gallery" aria-label="Hình ảnh sản phẩm">
      <div className="product-gallery-main">
        <ProductImage media={current ? [current] : []} name={product.name} />
        {media.length > 1 && (
          <div className="gallery-controls">
            <Button
              variant="outline"
              size="icon"
              aria-label="Ảnh trước"
              onClick={() => setSelected((index) => (index - 1 + media.length) % media.length)}
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </Button>
            <span aria-live="polite">
              {selected + 1} / {media.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Ảnh tiếp theo"
              onClick={() => setSelected((index) => (index + 1) % media.length)}
            >
              <ChevronRight size={20} aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
      {media.length > 1 && (
        <div className="gallery-thumbnails">
          {media.map((image, index) => (
            <button
              type="button"
              key={image.object_key}
              aria-label={`Xem ảnh ${index + 1}`}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
            >
              <ProductImage media={[image]} name={product.name} />
            </button>
          ))}
        </div>
      )}
      <p className="gallery-caption">
        Hình ảnh tham khảo của sản phẩm{media.length > 1 && " · Chọn ảnh nhỏ để xem thêm"}
      </p>
    </section>
  );
}
