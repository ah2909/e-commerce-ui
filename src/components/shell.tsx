"use client";

import { BrandImage, useAppearance } from "./appearance";
import { useSession } from "./providers";
import { useStoreAccess } from "./store-access";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function Shell({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const { canManage } = useStoreAccess();
  const a = useAppearance();
  const path = usePathname();
  const admin = path.startsWith("/admin");
  return (
    <>
      <a className="skip" href="#content">
        Đến nội dung chính
      </a>
      {a.announcement && !admin && <div className="announcement">{a.announcement}</div>}
      <header className="header">
        <Link className="brand" href="/">
          <BrandImage url={a.logo_url} alt="" className="brand-logo" />
          <span>{a.display_name}</span>
        </Link>
        <nav aria-label="Điều hướng chính">
          <Link href="/products" aria-current={path.startsWith("/products") ? "page" : undefined}>
            Sản phẩm
          </Link>
        </nav>
        <nav aria-label="Tài khoản">
          <Link href="/account" aria-current={path.startsWith("/account") ? "page" : undefined}>
            {session.kind === "user" ? "Tài khoản" : "Đăng nhập"}
          </Link>
          <Link href="/cart" aria-current={path === "/cart" ? "page" : undefined}>
            Giỏ hàng <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </header>
      <main id="content" className={`commerce-container ${admin ? "admin-container" : ""}`}>
        {children}
      </main>
      <footer>
        <div>
          <Link className="footer-brand" href="/">
            {a.display_name}
          </Link>
          <p>{a.tagline || "Cửa hàng trực tuyến của bạn."}</p>
        </div>
        <div className="footer-links">
          <Link href="/products">Khám phá sản phẩm</Link>
          <Link href="/account">Tài khoản của bạn</Link>
          {canManage && <Link href="/admin">Quản lý cửa hàng</Link>}
        </div>
        <small>Giá niêm yết bằng VND · Đã bao gồm VAT</small>
      </footer>
    </>
  );
}
