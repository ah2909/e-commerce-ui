"use client";

import { StoreHero } from "@/components/appearance";
import { PreviewDialog } from "@/components/primitives/preview-dialog";
import { useSession } from "@/components/providers";
import { ErrorNotice, Loading } from "@/components/ui";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ApiError, api, request, unwrap, type Schema } from "@/lib/api/client";
import { canKeepAppearance, presets, type Appearance } from "@/lib/appearance";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function AppearanceEditor() {
  const { scope } = useSession();
  const query = useQuery({
    queryKey: [...scope, "admin-appearance"],
    queryFn: async () => unwrap(await api.GET("/api/v1/admin/storefront")),
    staleTime: 0,
  });
  if (query.isPending) return <Loading />;
  if (query.error && (!query.data || !canKeepAppearance(query.error)))
    return <ErrorNotice error={query.error} retry={() => void query.refetch()} />;
  return (
    <>
      <ErrorNotice error={query.error} retry={() => void query.refetch()} />
      <Editor initial={query.data!} />
    </>
  );
}
function Editor({ initial }: { initial: Appearance }) {
  const [draft, setDraft] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>();
  const [saved, setSaved] = useState(false);
  const [latest, setLatest] = useState<Appearance>();
  const client = useQueryClient();
  const router = useRouter();
  const fields = [
    ["display_name", "Tên hiển thị", 120, true],
    ["tagline", "Lời giới thiệu ngắn", 180, false],
    ["hero_title", "Tiêu đề trang chủ", 160, true],
    ["hero_text", "Nội dung giới thiệu", 600, false],
    ["announcement", "Thông báo đầu trang (không bắt buộc)", 240, false],
    ["logo_url", "Đường dẫn logo HTTPS", 2048, false],
    ["hero_url", "Đường dẫn ảnh trang chủ HTTPS", 2048, false],
  ] as const;
  async function save() {
    if (pending) return;
    setPending(true);
    setError(undefined);
    setSaved(false);
    setLatest(undefined);
    try {
      const { version, ...content } = draft;
      const body: Schema["StorefrontAppearanceWrite"] = {
        ...content,
        expected_version: version,
      };
      const result = await request<Appearance>("/api/v1/admin/storefront", "PUT", body);
      setDraft(result);
      setSaved(true);
      await client.invalidateQueries({
        predicate: (q) =>
          q.queryKey.includes("appearance") || q.queryKey.includes("admin-appearance"),
      });
      router.refresh();
    } catch (e) {
      setError(e);
    } finally {
      setPending(false);
    }
  }
  async function compare() {
    setPending(true);
    try {
      setLatest(unwrap(await api.GET("/api/v1/admin/storefront")));
    } catch (e) {
      setError(e);
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">THƯƠNG HIỆU CỦA BẠN</span>
        <h1>Giao diện cửa hàng</h1>
        <p>
          Chọn phong cách, thêm lời giới thiệu và xem trước. Thay đổi chỉ hiển thị cho khách sau khi
          lưu.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <fieldset disabled={pending} className="appearance-fields">
          <Card asChild>
            <section className="panel">
              <h2>1. Chọn phong cách</h2>
              <RadioGroup
                className="preset-grid"
                aria-label="Phong cách cửa hàng"
                value={draft.preset}
                disabled={pending}
                onValueChange={(key) => {
                  setDraft({ ...draft, preset: key as Appearance["preset"] });
                  setSaved(false);
                }}
              >
                {Object.entries(presets).map(([key, p]) => (
                  <RadioGroupItem
                    type="button"
                    className="preset-choice"
                    card
                    data-theme={key}
                    key={key}
                    value={key}
                    aria-label={p.name}
                  >
                    <span className="preset-swatch" />
                    <strong>{p.name}</strong>
                    <small>{p.note}</small>
                  </RadioGroupItem>
                ))}
              </RadioGroup>
              <Button
                variant="link"
                type="button"
                onClick={() => {
                  const p = presets[draft.preset];
                  setDraft({
                    ...draft,
                    hero_title: p.title,
                    hero_text: p.text,
                  });
                  setSaved(false);
                }}
              >
                Dùng lời giới thiệu mẫu
              </Button>
            </section>
          </Card>
          <Card asChild>
            <section className="panel">
              <h2>2. Nội dung & hình ảnh</h2>
              <p>
                Dùng hình ảnh của cửa hàng từ một địa chỉ HTTPS công khai. Bỏ trống để dùng bố cục
                chữ mặc định.
              </p>
              <div className="form-grid">
                {fields.map(([key, label, maxLength, required]) => (
                  <Label className="field" key={key}>
                    <span>{label}</span>
                    <Input
                      type={key.endsWith("_url") ? "url" : "text"}
                      value={draft[key]}
                      maxLength={maxLength}
                      required={required}
                      pattern={key.endsWith("_url") ? "https://.*" : undefined}
                      onChange={(e) => {
                        setDraft({ ...draft, [key]: e.target.value });
                        setSaved(false);
                      }}
                    />
                  </Label>
                ))}
              </div>
            </section>
          </Card>
        </fieldset>
        <section
          className="appearance-preview"
          aria-label="Xem trước giao diện"
          data-theme={draft.preset}
        >
          <div className="preview-label">XEM TRƯỚC · CHƯA LƯU</div>
          {draft.announcement && <div className="announcement">{draft.announcement}</div>}
          <StoreHero appearance={draft} preview />
        </section>
        <div className="save-bar">
          <PreviewDialog
            title="Xem trước cửa hàng"
            description="Bản xem trước sử dụng nội dung chưa lưu."
            theme={draft.preset}
          >
            <StoreHero appearance={draft} preview />
          </PreviewDialog>
          <p>{saved ? "Đã lưu giao diện cửa hàng." : "Kiểm tra bản xem trước rồi lưu thay đổi."}</p>
          <Button disabled={pending}>{pending ? "Đang xử lý…" : "Lưu giao diện"}</Button>
        </div>
        {saved && (
          <Alert asChild>
            <p role="status" className="notice">
              Đã lưu giao diện cửa hàng.
            </p>
          </Alert>
        )}
        <ErrorNotice error={error} />
        {error instanceof ApiError && error.status === 409 && (
          <Alert asChild role={undefined}>
            <div className="notice">
              <p>
                Bản nháp của bạn vẫn được giữ nguyên. Xem phiên bản mới nhất trước khi quyết định
                thay thế bản nháp.
              </p>
              <Button
                variant="outline"
                type="button"
                disabled={pending}
                onClick={() => void compare()}
              >
                Xem phiên bản mới nhất
              </Button>
              {latest && (
                <>
                  <p>
                    Phiên bản {latest.version}: {latest.display_name} · {latest.hero_title}
                  </p>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setDraft(latest);
                      setLatest(undefined);
                      setError(undefined);
                    }}
                  >
                    Bỏ bản nháp và dùng phiên bản mới nhất
                  </Button>
                </>
              )}
            </div>
          </Alert>
        )}
      </form>
    </>
  );
}
