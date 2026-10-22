"use client";

import { ArrowLeft, ArrowUpRight, MapPin, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function CustomerPage({
  title,
  description,
  active,
  children,
}: {
  title: string;
  description: string;
  active: "profile" | "addresses";
  children: ReactNode;
}) {
  return (
    <div className="customer-page">
      <Link href="/account" className="customer-back">
        <ArrowLeft size={16} aria-hidden="true" />
        Tài khoản của bạn
      </Link>
      <header className="customer-page-heading">
        <span className="eyebrow">KHÔNG GIAN CỦA BẠN</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <div className="customer-page-layout">
        <aside className="customer-navigation">
          <span className="eyebrow">TÀI KHOẢN</span>
          <nav aria-label="Điều hướng tài khoản">
            {[
              {
                key: "profile",
                href: "/account/profile",
                label: "Thông tin cá nhân",
                Icon: UserRound,
              },
              {
                key: "addresses",
                href: "/account/addresses",
                label: "Địa chỉ đã lưu",
                Icon: MapPin,
              },
              { key: "cart", href: "/cart", label: "Giỏ hàng của bạn", Icon: ShoppingBag },
            ].map(({ key, href, label, Icon }) => (
              <Link href={href} key={key} aria-current={key === active ? "page" : undefined}>
                <Icon size={19} aria-hidden="true" />
                {label}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            ))}
          </nav>
          <div className="customer-navigation-note">
            <ShoppingBag size={23} aria-hidden="true" />
            <p>Thông tin đầy đủ giúp lần đặt hàng tiếp theo thuận tiện hơn.</p>
            <Link className="text-link" href="/products">
              Tiếp tục khám phá <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </aside>
        <div className="customer-page-content">{children}</div>
      </div>
    </div>
  );
}
