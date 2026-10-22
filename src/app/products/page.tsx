import { Catalog } from "@/components/catalog";
import { Suspense } from "react";
import { Loading } from "@/components/ui";
export default function ProductsPage() {
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">KHÁM PHÁ CỬA HÀNG</span>
        <h1>Tất cả sản phẩm</h1>
        <p>Những lựa chọn cho nhu cầu và phong cách của bạn.</p>
      </div>
      <Suspense fallback={<Loading />}>
        <Catalog />
      </Suspense>
    </>
  );
}
