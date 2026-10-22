"use client";

import { AddressFields, addressFromForm } from "./cart-checkout";
import { useSession } from "./providers";
import { useStoreAccess } from "./store-access";
import { useAppearance } from "./appearance";
import { CustomerPage } from "./customer-page";
import { ActionFeedback, ErrorNotice, Field, Loading, useAction } from "./ui";
import { useConfirm } from "@/components/confirm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError, api, unwrap, type Schema } from "@/lib/api/client";
import { formatAddress } from "@/lib/vn-address";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  UserRound,
  MapPin,
  ShoppingBag,
  PackageCheck,
  LogOut,
  Store,
  ShieldCheck,
  Phone,
  Pencil,
  Plus,
  Archive,
  Check,
} from "lucide-react";

export function AccountView() {
  const { session, scope, ready, changeSession } = useSession();
  const appearance = useAppearance();
  const store = useStoreAccess();
  const [register, setRegister] = useState(false);
  const action = useAction();
  const user = useQuery({
    queryKey: [...scope, "user"],
    queryFn: async () => unwrap(await api.GET("/api/v1/auth/me")),
    enabled: ready && session.kind === "user",
  });
  if (!ready) return <Loading />;
  if (session.kind !== "user")
    return (
      <div className="two-columns">
        <Card asChild>
          <form
            className="panel"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              if (
                await action.run(
                  register ? "/api/v1/auth/registrations" : "/api/v1/auth/sessions",
                  "POST",
                  {
                    email: String(form.get("email")),
                    password: String(form.get("password")),
                  },
                )
              )
                await changeSession();
            }}
          >
            <span className="eyebrow">TÀI KHOẢN · {appearance.display_name}</span>
            <h1>{register ? "Tạo tài khoản" : "Chào mừng trở lại"}</h1>
            <Field label="Email" name="email" type="email" maxLength={254} />
            <Field label="Mật khẩu" name="password" type="password" maxLength={128} />
            <Button disabled={action.pending}>{register ? "Đăng ký" : "Đăng nhập"}</Button>
            <ActionFeedback action={action} />
            <p>
              <Button variant="outline" type="button" onClick={() => setRegister(!register)}>
                {register ? "Đã có tài khoản? Đăng nhập" : "Tạo tài khoản mới"}
              </Button>
            </p>
          </form>
        </Card>
        <Card asChild>
          <aside className="panel">
            <h2>Mua sắm không cần tài khoản</h2>
            <p>Bạn có thể chọn sản phẩm và thanh toán với tư cách khách.</p>
            <Button asChild variant="outline">
              <Link className="button" href="/products">
                Tiếp tục mua sắm
              </Link>
            </Button>
            <p>Đơn của khách được bảo vệ bằng quyền truy cập riêng trên trình duyệt đã đặt hàng.</p>
          </aside>
        </Card>
      </div>
    );
  return (
    <div className="account-dashboard">
      <section className="account-welcome">
        <div>
          <span className="eyebrow">KHÔNG GIAN CỦA BẠN</span>
          <h1>Tài khoản của bạn</h1>
          <p>
            Chào mừng bạn trở lại {appearance.display_name}. Quản lý thông tin để mỗi lần mua sắm
            thuận tiện hơn.
          </p>
        </div>
        <div className="account-identity">
          <span className="account-avatar" aria-hidden="true">
            <UserRound size={28} />
          </span>
          <div>
            <strong>{user.data?.email || "Đang tải tài khoản…"}</strong>
            <span>
              {store.canManage
                ? { owner: "Chủ cửa hàng", admin: "Quản trị viên", staff: "Nhân viên" }[
                    store.data?.role || "owner"
                  ]
                : "Khách hàng"}
            </span>
          </div>
        </div>
      </section>
      <ErrorNotice error={user.error} />
      <div className="account-layout">
        <div>
          <div className="section-heading">
            <div>
              <span className="eyebrow">MỌI THỨ TRONG TẦM TAY</span>
              <h2>Thông tin & mua sắm</h2>
            </div>
          </div>
          <nav className="account-actions" aria-label="Quản lý tài khoản">
            {[
              {
                href: "/account/profile",
                title: "Thông tin cá nhân",
                text: "Cập nhật họ tên, email và số điện thoại của bạn.",
                Icon: UserRound,
              },
              {
                href: "/account/addresses",
                title: "Địa chỉ đã lưu",
                text: "Lưu địa chỉ nhận hàng để đặt hàng nhanh hơn.",
                Icon: MapPin,
              },
              {
                href: "/cart",
                title: "Giỏ hàng của bạn",
                text: "Xem lại những lựa chọn trước khi thanh toán.",
                Icon: ShoppingBag,
              },
            ].map(({ href, title, text, Icon }) => (
              <Link className="account-action-card" key={href} href={href}>
                <span className="account-action-icon">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <ArrowUpRight size={20} aria-hidden="true" />
              </Link>
            ))}
          </nav>
          <section className="account-order-note">
            <PackageCheck size={26} aria-hidden="true" />
            <div>
              <h3>Theo dõi đơn hàng</h3>
              <p>
                Sau khi đặt hàng, hãy lưu đường dẫn chi tiết đơn để kiểm tra thanh toán, giao hàng
                hoặc yêu cầu hủy khi đủ điều kiện.
              </p>
            </div>
          </section>
          {store.canManage && (
            <Link href="/admin" className="account-management">
              <Store size={24} aria-hidden="true" />
              <div>
                <strong>Quản lý cửa hàng</strong>
                <p>Mở trang quản trị {store.data?.name}.</p>
              </div>
              <ArrowUpRight size={20} aria-hidden="true" />
            </Link>
          )}
        </div>
        <aside className="account-sidebar">
          <span className="eyebrow">SẴN SÀNG CHO LẦN TIẾP THEO</span>
          <h2>Tìm thêm điều bạn thích.</h2>
          <p>Khám phá sản phẩm, chọn kích cỡ và tìm lựa chọn phù hợp với bạn.</p>
          <Button asChild>
            <Link href="/products">
              Tiếp tục mua sắm <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </Button>
          <div className="account-privacy">
            <ShieldCheck size={20} aria-hidden="true" />
            <p>Chỉ bạn có thể xem thông tin cá nhân và địa chỉ trong tài khoản này.</p>
          </div>
        </aside>
      </div>
      <div className="account-signout">
        <Button
          variant="outline"
          disabled={action.pending}
          onClick={async () => {
            await action.run("/api/v1/auth/sessions/current", "DELETE");
            await changeSession();
          }}
        >
          <LogOut size={17} aria-hidden="true" /> Đăng xuất
        </Button>
        <ActionFeedback action={action} />
      </div>
    </div>
  );
}

export function ProfileView() {
  const { session, scope, ready } = useSession();
  const action = useAction();
  const profile = useQuery({
    queryKey: [...scope, "profile"],
    queryFn: async () => unwrap(await api.GET("/api/v1/customer/profile")),
    enabled: ready && session.kind === "user",
  });
  const missing = profile.error instanceof ApiError && profile.error.status === 404;
  return (
    <CustomerPage
      active="profile"
      title="Thông tin cá nhân"
      description="Một chút thông tin để cửa hàng liên hệ và chuẩn bị đơn hàng của bạn chính xác hơn."
    >
      {!ready || (session.kind === "user" && profile.isPending) ? (
        <Loading />
      ) : session.kind !== "user" ? (
        <div className="customer-empty">
          <UserRound size={36} aria-hidden="true" />
          <h2>Thông tin dành riêng cho bạn</h2>
          <p>Đăng nhập để lưu và quản lý thông tin cá nhân.</p>
          <Button asChild>
            <Link href="/account">Đăng nhập để quản lý thông tin</Link>
          </Button>
        </div>
      ) : profile.error && !missing ? (
        <ErrorNotice error={profile.error} retry={() => void profile.refetch()} />
      ) : (
        <>
          <Card key={profile.data?.version || 0} asChild>
            <form
              className="customer-form-card"
              aria-label="Thông tin liên hệ"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                void action.run("/api/v1/customer/profile", "PUT", {
                  full_name: String(form.get("full_name")),
                  email: String(form.get("email")),
                  phone: String(form.get("phone")),
                  expected_version: profile.data?.version || 0,
                });
              }}
            >
              <div className="customer-card-heading">
                <span className="customer-card-icon">
                  <UserRound size={24} aria-hidden="true" />
                </span>
                <div>
                  <h2>Thông tin liên hệ</h2>
                  <p>Cập nhật thông tin đang dùng để dễ dàng nhận hàng.</p>
                </div>
              </div>
              <fieldset disabled={action.pending} className="customer-form-fields">
                <Field
                  label="Họ và tên"
                  name="full_name"
                  value={profile.data?.full_name}
                  maxLength={160}
                  autoComplete="name"
                />
                <div className="customer-form-grid">
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={profile.data?.email}
                    maxLength={254}
                    autoComplete="email"
                  />
                  <Field
                    label="Điện thoại"
                    name="phone"
                    type="tel"
                    value={profile.data?.phone}
                    maxLength={20}
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>
                <p className="customer-field-note">
                  Email này được dùng cho thông tin liên hệ nhận hàng. Email đăng nhập của bạn không
                  thay đổi.
                </p>
                <div className="customer-form-footer">
                  <Button disabled={action.pending}>
                    <Check size={17} aria-hidden="true" />
                    {action.pending ? "Đang lưu…" : "Lưu thông tin"}
                  </Button>
                  <Link href="/account" className="text-link">
                    Quay lại tài khoản
                  </Link>
                </div>
              </fieldset>
              <ActionFeedback action={action} />
            </form>
          </Card>
          <div className="customer-inline-note">
            <ShieldCheck size={21} aria-hidden="true" />
            <p>
              Thông tin được lưu trong tài khoản của bạn tại cửa hàng này. Bạn có thể quay lại cập
              nhật bất cứ lúc nào.
            </p>
          </div>
        </>
      )}
    </CustomerPage>
  );
}

function AddressEditor({
  address,
  cancel,
}: {
  address?: Schema["CustomerAddress"];
  cancel: () => void;
}) {
  const action = useAction();
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    formRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  }, []);
  return (
    <Card asChild>
      <form
        ref={formRef}
        className="customer-form-card address-editor"
        aria-label={address ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"}
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const body = {
            ...addressFromForm(form),
            label: String(form.get("label")),
            ...(address ? { expected_version: address.version } : {}),
          };
          const result = await action.run(
            address
              ? `/api/v1/customer/addresses/${address.address_id}`
              : "/api/v1/customer/addresses",
            address ? "PUT" : "POST",
            body,
          );
          if (result) cancel();
        }}
      >
        <div className="customer-card-heading">
          <span className="customer-card-icon">
            <MapPin size={24} aria-hidden="true" />
          </span>
          <div>
            <h2>{address ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"}</h2>
            <p>Điền địa chỉ đầy đủ để cửa hàng giao đúng nơi bạn muốn.</p>
          </div>
        </div>
        <fieldset disabled={action.pending} className="customer-form-fields">
          <AddressFields value={address} label />
          <div className="customer-form-footer">
            <Button disabled={action.pending}>
              <Check size={17} aria-hidden="true" />
              {action.pending ? "Đang lưu…" : "Lưu địa chỉ"}
            </Button>
            <Button variant="outline" type="button" onClick={cancel}>
              Đóng
            </Button>
          </div>
        </fieldset>
        <ActionFeedback action={action} />
      </form>
    </Card>
  );
}

export function AddressesView() {
  const confirm = useConfirm();
  const { session, scope, ready } = useSession();
  const [editing, setEditing] = useState<Schema["CustomerAddress"] | "new">();
  const action = useAction();
  const query = useQuery({
    queryKey: [...scope, "addresses"],
    queryFn: async () => unwrap(await api.GET("/api/v1/customer/addresses")),
    enabled: ready && session.kind === "user",
  });
  const current =
    editing && editing !== "new"
      ? query.data?.addresses.find((address) => address.address_id === editing.address_id) ||
        editing
      : undefined;
  return (
    <CustomerPage
      active="addresses"
      title="Địa chỉ đã lưu"
      description="Nhà riêng, nơi làm việc hay một địa chỉ quen thuộc. Lưu sẵn để chọn nhanh khi đặt hàng."
    >
      {!ready || (session.kind === "user" && query.isPending) ? (
        <Loading />
      ) : session.kind !== "user" ? (
        <div className="customer-empty">
          <MapPin size={36} aria-hidden="true" />
          <h2>Giao đến nơi bạn muốn</h2>
          <p>Đăng nhập để lưu và chọn lại địa chỉ nhận hàng.</p>
          <Button asChild>
            <Link href="/account">Đăng nhập để quản lý địa chỉ</Link>
          </Button>
        </div>
      ) : query.error ? (
        <ErrorNotice error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          <div className="address-toolbar">
            <div>
              <h2>Sổ địa chỉ của bạn</h2>
              <p>{query.data?.addresses.length || 0} địa chỉ đã lưu</p>
            </div>
            <Button disabled={!!editing || action.pending} onClick={() => setEditing("new")}>
              <Plus size={18} aria-hidden="true" />
              Thêm địa chỉ
            </Button>
          </div>
          <ActionFeedback action={action} />
          {editing && (
            <AddressEditor
              key={current ? `${current.address_id}:${current.version}` : "new"}
              address={current}
              cancel={() => setEditing(undefined)}
            />
          )}
          <div className="saved-address-grid">
            {query.data?.addresses.map((address, index) => (
              <Card key={address.address_id} asChild>
                <article className="saved-address-card">
                  <div className="saved-address-heading">
                    <span className="customer-card-icon">
                      <MapPin size={23} aria-hidden="true" />
                    </span>
                    <div>
                      <span className="eyebrow">ĐỊA CHỈ {String(index + 1).padStart(2, "0")}</span>
                      <h3>{address.label}</h3>
                    </div>
                  </div>
                  <div className="saved-address-details">
                    <p>
                      <UserRound size={17} aria-hidden="true" />
                      <strong>{address.recipient_name}</strong>
                    </p>
                    <p>
                      <Phone size={17} aria-hidden="true" />
                      <span>{address.phone}</span>
                    </p>
                    <p>
                      <MapPin size={17} aria-hidden="true" />
                      <span>{formatAddress(address)}</span>
                    </p>
                  </div>
                  <div className="saved-address-actions">
                    <Button
                      variant="outline"
                      disabled={!!editing || action.pending}
                      onClick={() => setEditing(address)}
                    >
                      <Pencil size={16} aria-hidden="true" />
                      Chỉnh sửa
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!!editing || action.pending}
                      onClick={async () => {
                        if (await confirm("Lưu trữ địa chỉ này?"))
                          void action.run(
                            `/api/v1/customer/addresses/${address.address_id}`,
                            "DELETE",
                            {
                              expected_version: address.version,
                            },
                          );
                      }}
                    >
                      <Archive size={16} aria-hidden="true" />
                      Lưu trữ
                    </Button>
                  </div>
                </article>
              </Card>
            ))}
          </div>
          {!query.data?.addresses.length && !editing && (
            <div className="customer-empty">
              <span className="customer-empty-icon">
                <MapPin size={36} aria-hidden="true" />
              </span>
              <h2>Thêm điểm đến đầu tiên</h2>
              <p>Lưu địa chỉ để lần đặt hàng tiếp theo không cần nhập lại từ đầu.</p>
              <Button onClick={() => setEditing("new")}>
                <Plus size={18} aria-hidden="true" />
                Thêm địa chỉ đầu tiên
              </Button>
            </div>
          )}
          <div className="customer-inline-note">
            <ShieldCheck size={21} aria-hidden="true" />
            <p>
              Địa chỉ đã lưu chỉ thuộc tài khoản của bạn. Lưu trữ một địa chỉ sẽ không thay đổi
              thông tin trong các đơn hàng trước đó.
            </p>
          </div>
        </>
      )}
    </CustomerPage>
  );
}
