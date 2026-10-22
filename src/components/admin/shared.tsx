"use client";

import { useSession } from "@/components/providers";
import { ErrorNotice, Loading } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, unwrap } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const links = [
  ["/admin", "Tổng quan"],
  ["/admin/appearance", "Giao diện"],
  ["/admin/products", "Sản phẩm"],
  ["/admin/prices", "Bảng giá"],
  ["/admin/inventory", "Tồn kho"],
  ["/admin/orders", "Đơn hàng"],
  ["/admin/payments", "Thanh toán"],
  ["/admin/shipping", "Giao hàng"],
  ["/admin/workforce", "Nhân sự"],
];

export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { session, scope, ready } = useSession();
  const store = useQuery({
    queryKey: [...scope, "store"],
    queryFn: async () => unwrap(await api.GET("/api/v1/store")),
    enabled: ready && session.kind === "user",
  });
  if (!ready || (session.kind === "user" && store.isPending)) return <Loading />;
  if (session.kind !== "user")
    return (
      <Card className="empty block border-dashed">
        <h1>Đăng nhập để quản lý cửa hàng</h1>
        <Button asChild>
          <Link className="button" href="/account">
            Đăng nhập
          </Link>
        </Button>
      </Card>
    );
  if (store.error || !store.data)
    return (
      <ErrorNotice
        error={store.error || new Error("Không thể xác định cửa hàng.")}
        retry={() => void store.refetch()}
      />
    );
  return (
    <div className="admin-layout">
      <nav className="admin-nav" aria-label="Quản lý cửa hàng">
        <strong>{store.data.name}</strong>
        <small>{store.data.role}</small>
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            aria-current={
              (href === "/admin" ? path === href : path.startsWith(href)) ? "page" : undefined
            }
          >
            {label}
          </Link>
        ))}
      </nav>
      <div>{children}</div>
    </div>
  );
}

export function Pager({
  next,
  load,
  pending,
}: {
  next?: string | null;
  load: () => void;
  pending?: boolean;
}) {
  if (!next) return null;
  return (
    <div className="actions">
      <Button variant="outline" disabled={pending} onClick={load}>
        Xem thêm
      </Button>
    </div>
  );
}

export function FormButtons({ pending, cancel }: { pending: boolean; cancel?: () => void }) {
  return (
    <div className="actions">
      <Button disabled={pending}>{pending ? "Đang lưu…" : "Lưu thay đổi"}</Button>
      {cancel && (
        <Button variant="outline" type="button" onClick={cancel}>
          Đóng
        </Button>
      )}
    </div>
  );
}
