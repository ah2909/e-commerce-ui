"use client";

import { StoreHero, useAppearance } from "@/components/appearance";
import { CatalogResults, ProductImage } from "@/components/catalog";
import { useStoreCatalog } from "@/components/store-catalog";
import { ErrorNotice, Loading } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brandOf, emptyFilters, filterCatalog, normalizeSearch } from "@/lib/catalog";
import { ArrowUpRight, PackageCheck, Ruler, Search, Shirt, ShoppingBag } from "lucide-react";
import Form from "next/form";
import Link from "next/link";

export function HomeStorefront() {
  const appearance = useAppearance();
  const catalog = useStoreCatalog();
  const products = catalog.data || [];
  const categories = [
    ...new Map(
      products
        .flatMap((product) => product.categories || [])
        .filter((category) => !/^brand\s/i.test(category.name))
        .map((category) => [category.slug, category]),
    ).values(),
  ];
  const inCategory = (slug: string) =>
    products.filter((product) => product.categories?.some((category) => category.slug === slug));
  const jerseyCategory =
    categories.find((category) => normalizeSearch(category.name) === "ao bong da")?.slug ||
    "ao-bong-da";
  const bootCategory =
    categories.find((category) => normalizeSearch(category.name) === "giay bong da")?.slug ||
    "giay-bong-da";
  const jerseys = inCategory(jerseyCategory);
  const boots = inCategory(bootCategory);
  const football = jerseys.length > 0;
  const quickCategories = (
    football
      ? [jerseyCategory, bootCategory].flatMap((slug) =>
          categories.filter((item) => item.slug === slug),
        )
      : categories
  ).slice(0, 2);
  const highlights = football
    ? [jerseys.find((product) => /real madrid/i.test(product.name)) || jerseys[0], boots[0]].filter(
        Boolean,
      )
    : products.filter((product) => product.media.length).slice(0, 2);
  const collections = football
    ? [
        {
          slug: "europe",
          title: "Sắc màu châu Âu",
          caption: "Những màu áo quen thuộc trên sân cỏ",
          mark: "01 / EUROPE",
        },
        {
          slug: "asia",
          title: "Nhịp đập châu Á",
          caption: "Khám phá những câu lạc bộ gần gũi hơn",
          mark: "02 / ASIA",
        },
        {
          slug: "brazil",
          title: "Cảm hứng Brazil",
          caption: "Tinh thần bóng đá đầy sắc màu",
          mark: "03 / BRAZIL",
        },
        {
          slug: bootCategory,
          title: "Sẵn sàng ra sân",
          caption: "Tìm đôi giày cho cách chơi của bạn",
          mark: "04 / BOOTS",
        },
      ].filter((collection) => inCategory(collection.slug).length)
    : categories.slice(0, 4).map((category, index) => ({
        slug: category.slug,
        title: category.name,
        caption: "Khám phá bộ sưu tập",
        mark: `0${index + 1} / COLLECTION`,
      }));
  const featured = football ? [...jerseys.slice(0, 2), ...boots.slice(0, 2)] : products.slice(0, 4);
  const brands = [...new Set(products.map(brandOf).filter(Boolean))];
  return (
    <>
      <StoreHero
        appearance={appearance}
        highlights={highlights}
        discovery={
          <div className="home-discovery">
            <Form action="/products" role="search" aria-label="Tìm sản phẩm trong cửa hàng">
              <label className="catalog-search">
                <span className="sr-only">Tìm sản phẩm</span>
                <Search size={20} aria-hidden="true" />
                <Input
                  className="pl-11"
                  type="search"
                  name="q"
                  placeholder="Tên sản phẩm, thương hiệu, mã SKU…"
                />
              </label>
              <Button type="submit">Tìm</Button>
            </Form>
            <nav className="home-discovery-links" aria-label="Mua theo bộ sưu tập">
              {quickCategories.map((category) => (
                <Button asChild variant="outline" key={category.slug}>
                  <Link href={{ pathname: "/products", query: { category: category.slug } }}>
                    {category.name}
                  </Link>
                </Button>
              ))}
              <Button asChild variant="link">
                <Link href="/products">
                  Xem tất cả <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </Button>
            </nav>
          </div>
        }
      />
      {!!products.length && (
        <div className="store-facts" aria-label="Khám phá cửa hàng">
          <div>
            <strong>{products.length}</strong>
            <span>Sản phẩm để khám phá</span>
          </div>
          <div>
            <strong>{brands.length || categories.length}</strong>
            <span>{brands.length ? "Thương hiệu trong danh mục" : "Bộ sưu tập"}</span>
          </div>
          <div>
            <strong>VND</strong>
            <span>Giá rõ ràng · Đã gồm VAT</span>
          </div>
          <div>
            <ShoppingBag size={25} aria-hidden="true" />
            <span>Mua sắm với tài khoản hoặc khách</span>
          </div>
        </div>
      )}
      {catalog.isPending && <Loading />}
      <ErrorNotice error={catalog.error} retry={() => void catalog.refetch()} />
      {!!collections.length && (
        <section className="home-collections">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CHỌN ĐIỀU BẠN YÊU</span>
              <h2>{football ? "Một đam mê. Nhiều màu sắc." : "Khám phá từng bộ sưu tập"}</h2>
            </div>
            <Link className="text-link" href="/products">
              Xem tất cả <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="collection-grid">
            {collections.map((collection) => {
              const matches = inCategory(collection.slug);
              const product = matches.find((item) => item.media.length) || matches[0];
              return (
                <Link
                  className="collection-card"
                  key={collection.slug}
                  href={`/products?category=${encodeURIComponent(collection.slug)}`}
                >
                  <span className="collection-mark">{collection.mark}</span>
                  <ProductImage media={product.media} name={collection.title} />
                  <div>
                    <span className="eyebrow">{matches.length} SẢN PHẨM</span>
                    <h3>{collection.title}</h3>
                    <p>{collection.caption}</p>
                  </div>
                  <span className="collection-arrow">
                    <ArrowUpRight size={22} aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
      <section className="store-story" id="about">
        <div className="store-story-heading">
          <span className="eyebrow">VỀ {appearance.display_name}</span>
          <h2>
            {football ? (
              <>
                Mang đam mê
                <br />
                vào từng lựa chọn.
              </>
            ) : (
              <>
                Những lựa chọn
                <br />
                mang dấu ấn của bạn.
              </>
            )}
          </h2>
          <Link className="text-link" href="/products">
            Tìm lựa chọn của bạn <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className="store-story-copy">
          <p className="store-story-lead">
            {football
              ? `${appearance.display_name} là điểm hẹn dành cho người yêu bóng đá — từ màu áo câu lạc bộ châu Âu, châu Á, Brazil đến những đôi giày cho buổi ra sân tiếp theo.`
              : `${appearance.display_name} mang những sản phẩm trong cửa hàng đến gần bạn hơn, với thông tin rõ ràng và các lựa chọn dễ tìm.`}
          </p>
          <p>
            {football
              ? "Mỗi màu áo gắn với một câu chuyện. Khám phá các mùa giải, tìm đội bóng bạn yêu và chọn kích cỡ phù hợp theo thông tin của từng sản phẩm."
              : appearance.hero_text}
          </p>
          <p>
            So sánh theo thương hiệu, khoảng giá và kích cỡ. Xem tình trạng còn hàng trước khi thêm
            vào giỏ, rồi chọn địa chỉ và phương thức thanh toán khi đặt hàng.
          </p>
        </div>
      </section>
      {!!featured.length && (
        <section id="catalog" className="catalog-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">BẮT ĐẦU TỪ ĐÂY</span>
              <h2>{football ? "Từ khán đài đến sân cỏ" : "Những lựa chọn từ cửa hàng"}</h2>
            </div>
            <Link className="text-link" href="/products">
              Khám phá sản phẩm <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <CatalogResults results={filterCatalog(featured, emptyFilters)} featured />
        </section>
      )}
      <section className="shopping-guide" aria-label="Hướng dẫn mua sắm">
        {[
          {
            Icon: Shirt,
            title: "Tìm đúng phong cách",
            text: "Tìm kiếm và lọc toàn bộ danh mục theo sở thích, thương hiệu và giá.",
          },
          {
            Icon: Ruler,
            title: "Chọn đúng kích cỡ",
            text: "Đối chiếu nhãn kích cỡ và tình trạng còn hàng trên trang sản phẩm.",
          },
          {
            Icon: PackageCheck,
            title: "Theo dõi từng bước",
            text: "Lưu đường dẫn đơn hàng để xem thanh toán và tiến trình giao hàng.",
          },
        ].map(({ Icon, title, text }) => (
          <div key={title}>
            <Icon size={27} aria-hidden="true" />
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>
      <section className="home-last-call">
        <div>
          <span className="eyebrow">LỰA CHỌN TIẾP THEO LÀ CỦA BẠN</span>
          <h2>{football ? "Màu áo nào dành cho bạn?" : "Tìm điều bạn yêu thích."}</h2>
        </div>
        <Button asChild>
          <Link href="/products">
            Khám phá cửa hàng <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </>
  );
}
