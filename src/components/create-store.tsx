"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Schema } from "@/lib/api/client";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe2,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

const errors: Record<string, string> = {
  onboarding_conflict:
    "Địa chỉ cửa hàng hoặc tài khoản đã tồn tại. Kiểm tra thông tin trước khi tạo lại.",
  platform_unauthenticated: "Mã quản trị không hợp lệ. Kiểm tra lại mã truy cập nền tảng.",
  invalid_onboarding: "Thông tin chưa hợp lệ. Kiểm tra địa chỉ, email và mật khẩu chủ cửa hàng.",
  rate_limited: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ trước khi thử lại.",
};

function suggestAddress(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63)
    .replace(/-+$/g, "");
}

export function CreateStore({
  domain,
  port,
  protocol,
}: {
  domain: string;
  port: string;
  protocol: string;
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [editedAddress, setEditedAddress] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const [created, setCreated] = useState("");
  const lock = useRef(false);
  const notice = useRef<HTMLDivElement>(null);
  const addressField = useRef<HTMLInputElement>(null);
  const preview = `${address || "ten-cua-hang"}.${domain}${port}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || uncertain) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const addressInput = form.elements.namedItem("subdomain") as HTMLInputElement;
    addressInput.setCustomValidity(
      ["admin", "api", "auth", "www"].includes(address)
        ? "Địa chỉ này dành riêng cho hệ thống. Vui lòng chọn địa chỉ khác."
        : "",
    );
    if (!form.reportValidity()) return;
    const body: Schema["OnboardStore"] = {
      store_name: name.trim(),
      subdomain: address,
      email: String(data.get("email")).trim(),
      password: String(data.get("password")),
      default_currency: "VND",
      locale: "vi-VN",
      timezone: "Asia/Ho_Chi_Minh",
    };
    lock.current = true;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/platform/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Commerce-CSRF": "1",
          Authorization: `Bearer ${String(data.get("platform_token")).trim()}`,
        },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (response.status === 201 && typeof result.subdomain === "string") {
        setCreated(result.subdomain);
        form.reset();
      } else {
        const unknown = response.status >= 500;
        setUncertain(unknown);
        setError(
          unknown
            ? "Chưa xác định được kết quả tạo cửa hàng. Hãy kiểm tra cửa hàng với quản trị nền tảng trước khi gửi lại."
            : errors[result.code] ||
                "Không thể tạo cửa hàng. Vui lòng kiểm tra quyền truy cập và thông tin.",
        );
      }
    } catch {
      setUncertain(true);
      setError(
        "Kết nối bị gián đoạn. Hãy kiểm tra cửa hàng với quản trị nền tảng trước khi gửi lại.",
      );
    } finally {
      setPending(false);
      lock.current = false;
      requestAnimationFrame(() => notice.current?.focus());
    }
  }

  return (
    <div className="store-setup" data-theme="home">
      <a className="skip" href="#content">
        Đến nội dung chính
      </a>
      <header className="setup-header">
        <span className="flex items-center gap-3 font-semibold">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Store size={22} aria-hidden="true" />
          </span>
          Commerce
          <span className="hidden border-l pl-3 text-sm font-normal text-muted-foreground sm:block">
            Quản trị nền tảng
          </span>
        </span>
        <Badge variant="secondary">
          <ShieldCheck size={14} aria-hidden="true" /> Khu vực quản trị
        </Badge>
      </header>
      <main id="content" className="setup-main">
        <div className="setup-heading">
          <p className="setup-eyebrow">MỘT KHỞI ĐẦU MỚI</p>
          <h1>Tạo cửa hàng của bạn.</h1>
          <p>Thông tin cần thiết, trong một trang. Sẵn sàng cho bước tiếp theo.</p>
        </div>
        {created ? (
          <Card className="mx-auto max-w-2xl">
            <CardContent className="space-y-6 p-8">
              <div ref={notice} tabIndex={-1} role="status" className="space-y-3">
                <CheckCircle2 className="size-12 text-primary" aria-hidden="true" />
                <h2 className="text-2xl font-semibold">Cửa hàng đã được tạo!</h2>
                <p className="break-all">
                  {created}.{domain}
                  {port}
                </p>
                <p className="text-muted-foreground">
                  Chủ cửa hàng có thể đăng nhập bằng email và mật khẩu vừa thiết lập. Thêm sản phẩm
                  và tùy chỉnh giao diện để bắt đầu.
                </p>
              </div>
              <Button asChild>
                <a href={`${protocol}://${created}.${domain}${port}/account`}>
                  Đăng nhập cửa hàng <ArrowRight aria-hidden="true" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="setup-grid">
            <Card className="setup-form-card py-0">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={submit} className="space-y-8">
                  <fieldset disabled={pending || uncertain} className="min-w-0 space-y-8">
                    <section className="space-y-5" aria-labelledby="store-details">
                      <div className="setup-section-title">
                        <Store size={20} aria-hidden="true" />
                        <h2 id="store-details">Thông tin cửa hàng</h2>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="store-name">Tên cửa hàng</Label>
                        <Input
                          id="store-name"
                          name="store_name"
                          pattern=".*\S.*"
                          placeholder="Ví dụ: Mộc Studio"
                          required
                          maxLength={120}
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            addressField.current?.setCustomValidity("");
                            if (!editedAddress) setAddress(suggestAddress(e.target.value));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="store-address">Địa chỉ cửa hàng</Label>
                        <div className="setup-address">
                          <Input
                            ref={addressField}
                            id="store-address"
                            name="subdomain"
                            required
                            minLength={3}
                            maxLength={63}
                            pattern="[a-z0-9][a-z0-9-]*[a-z0-9]"
                            title="Từ 3–63 ký tự: chữ thường, số và dấu gạch ngang; bắt đầu và kết thúc bằng chữ hoặc số."
                            autoCapitalize="none"
                            spellCheck={false}
                            value={address}
                            onChange={(e) => {
                              e.target.setCustomValidity("");
                              setEditedAddress(true);
                              setAddress(e.target.value.toLowerCase());
                            }}
                            aria-describedby="address-hint"
                          />
                          <span>.{domain}</span>
                        </div>
                        <p id="address-hint" className="text-sm text-muted-foreground">
                          Địa chỉ dùng để truy cập cửa hàng và không thể đổi sau khi tạo.
                        </p>
                      </div>
                    </section>
                    <section className="space-y-5 border-t pt-6" aria-labelledby="owner-details">
                      <div className="setup-section-title">
                        <UserRound size={20} aria-hidden="true" />
                        <h2 id="owner-details">Tài khoản chủ cửa hàng</h2>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="owner-email">Email</Label>
                        <Input
                          id="owner-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder="ban@example.com"
                          maxLength={254}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="owner-password">Mật khẩu</Label>
                        <div className="relative">
                          <Input
                            id="owner-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            minLength={12}
                            maxLength={128}
                            className="pr-14"
                            aria-describedby="password-hint"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2"
                            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            aria-pressed={showPassword}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff aria-hidden="true" />
                            ) : (
                              <Eye aria-hidden="true" />
                            )}
                          </Button>
                        </div>
                        <p id="password-hint" className="text-sm text-muted-foreground">
                          Ít nhất 12 ký tự. Chủ cửa hàng dùng tài khoản này để đăng nhập.
                        </p>
                      </div>
                    </section>
                    <section className="space-y-3 border-t pt-6" aria-labelledby="platform-access">
                      <div className="setup-section-title">
                        <LockKeyhole size={20} aria-hidden="true" />
                        <h2 id="platform-access">Xác nhận quyền quản trị</h2>
                      </div>
                      <Label htmlFor="platform-token">Mã truy cập nền tảng</Label>
                      <Input
                        id="platform-token"
                        name="platform_token"
                        type="password"
                        autoComplete="off"
                        required
                        maxLength={4096}
                        aria-describedby="token-hint"
                      />
                      <p id="token-hint" className="text-sm text-muted-foreground">
                        Sử dụng mã do quản trị nền tảng cung cấp. Mã không được lưu trên trình
                        duyệt.
                      </p>
                    </section>
                  </fieldset>
                  {error && (
                    <div ref={notice} tabIndex={-1}>
                      <Alert variant="destructive">
                        <AlertTitle>Chưa thể hoàn tất</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </div>
                  )}
                  <div className="space-y-3">
                    <Button type="submit" className="w-full" disabled={pending || uncertain}>
                      {pending ? (
                        <>
                          <Loader2 className="animate-spin" aria-hidden="true" /> Đang tạo cửa hàng…
                        </>
                      ) : (
                        <>
                          Tạo cửa hàng <ArrowRight aria-hidden="true" />
                        </>
                      )}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      Bạn có thể thêm sản phẩm và chỉnh giao diện sau.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
            <aside className="setup-aside" aria-label="Tóm tắt cửa hàng">
              <div className="setup-preview">
                <div className="flex items-center gap-2 border-b px-5 py-4 text-sm text-muted-foreground">
                  <Globe2 size={16} className="shrink-0" aria-hidden="true" />
                  <span className="min-w-0 break-all">{preview}</span>
                </div>
                <div className="setup-preview-content">
                  <span className="setup-preview-icon">
                    <Store size={32} aria-hidden="true" />
                  </span>
                  <p className="setup-eyebrow">CỬA HÀNG TRỰC TUYẾN</p>
                  <h2>{name.trim() || "Tên cửa hàng của bạn"}</h2>
                  <p>Một không gian riêng cho thương hiệu của bạn.</p>
                  <Badge variant="secondary">Bản xem trước</Badge>
                </div>
              </div>
              <div className="space-y-5 px-2">
                <h2 className="text-base font-semibold">Thiết lập sẵn cho Việt Nam</h2>
                <dl className="setup-defaults">
                  <div>
                    <dt>Tiền tệ</dt>
                    <dd>VND · Việt Nam đồng</dd>
                  </div>
                  <div>
                    <dt>Ngôn ngữ</dt>
                    <dd>Tiếng Việt</dd>
                  </div>
                  <div>
                    <dt>Múi giờ</dt>
                    <dd>Việt Nam · UTC+7</dd>
                  </div>
                </dl>
                <div className="flex items-start gap-3 border-t pt-5 text-sm text-muted-foreground">
                  <Check size={18} className="shrink-0 text-primary" aria-hidden="true" />
                  <p>
                    Cửa hàng và tài khoản chủ sở hữu được tạo cùng nhau. Dữ liệu riêng biệt với các
                    cửa hàng khác.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
      <footer className="setup-footer">Commerce · Khởi đầu đơn giản, quản lý dễ dàng.</footer>
    </div>
  );
}
