import { Card } from "@/components/ui/card";
import Link from "next/link";
const areas = [
  ["orders", "01", "Đơn hàng", "Theo dõi, xử lý và giao đơn hàng."],
  ["products", "02", "Sản phẩm", "Quản lý danh mục và thông tin sản phẩm."],
  ["inventory", "03", "Tồn kho", "Cập nhật số lượng hàng đang có."],
  ["appearance", "04", "Giao diện cửa hàng", "Thay đổi phong cách, hình ảnh và lời giới thiệu."],
];
export default function AdminPage() {
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">KHÔNG GIAN QUẢN LÝ</span>
        <h1>Cửa hàng của bạn</h1>
        <p>Mọi việc cần làm, trong một nơi. Quyền truy cập phụ thuộc vào vai trò của bạn.</p>
      </div>
      <div className="admin-shortcuts">
        {areas.map(([path, n, title, text]) => (
          <Card key={path} asChild>
            <Link className="panel shortcut" href={`/admin/${path}`}>
              <span className="eyebrow">
                {n} <span aria-hidden="true">↗</span>
              </span>
              <h2>{title}</h2>
              <p>{text}</p>
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}
