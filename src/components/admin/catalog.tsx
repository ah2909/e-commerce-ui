"use client";

import { Pager } from "./shared";
import { AdminProductIdentity } from "./product-identity";
import { useConfirm } from "@/components/confirm";
import { useSession } from "@/components/providers";
import {
  ActionFeedback,
  Badge,
  Empty,
  ErrorNotice,
  Field,
  Loading,
  useAction,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api, unwrap, type Schema } from "@/lib/api/client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

function CategoryEditor({
  value,
  categories,
}: {
  value: Schema["CatalogCategory"];
  categories: Schema["CatalogCategory"][];
}) {
  const confirm = useConfirm();
  const action = useAction();
  return (
    <Card key={value.version} asChild>
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          void action.run(`/api/v1/admin/catalog/categories/${value.category_id}`, "PUT", {
            name: String(form.get("name")),
            slug: String(form.get("slug")),
            parent_id: String(form.get("parent_id")) || null,
            expected_version: value.version,
          });
        }}
      >
        <h3>{value.name}</h3>
        <Badge state={value.status} />
        {value.status === "active" && (
          <>
            <Field label="Tên danh mục" name="name" value={value.name} maxLength={120} />
            <Field label="Đường dẫn danh mục" name="slug" value={value.slug} maxLength={120} />
            <Label className="field">
              <span>Danh mục cha</span>
              <NativeSelect name="parent_id" defaultValue={value.parent_id || ""}>
                <NativeSelectOption value="">Không có</NativeSelectOption>
                {categories
                  .filter((c) => c.status === "active" && c.category_id !== value.category_id)
                  .map((c) => (
                    <NativeSelectOption key={c.category_id} value={c.category_id}>
                      {c.name}
                    </NativeSelectOption>
                  ))}
              </NativeSelect>
            </Label>
            <div className="actions">
              <Button disabled={action.pending}>Lưu danh mục</Button>
              <Button
                variant="outline"
                type="button"
                disabled={action.pending}
                onClick={async () => {
                  if (await confirm("Lưu trữ danh mục này?"))
                    void action.run(
                      `/api/v1/admin/catalog/categories/${value.category_id}/archive`,
                      "POST",
                      { expected_version: value.version },
                    );
                }}
              >
                Lưu trữ danh mục
              </Button>
            </div>
          </>
        )}
        <ActionFeedback action={action} />
      </form>
    </Card>
  );
}

export function CatalogAdminView() {
  const { scope, ready } = useSession();
  const [category, setCategory] = useState(false);
  const action = useAction();
  const products = useInfiniteQuery({
    queryKey: [...scope, "admin-products"],
    enabled: ready,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      unwrap(
        await api.GET("/api/v1/admin/catalog/products", {
          params: { query: { limit: 25, cursor: pageParam } },
        }),
      ),
    getNextPageParam: (page) => page.next_cursor || undefined,
  });
  const categories = useQuery({
    queryKey: [...scope, "admin-categories"],
    enabled: ready,
    queryFn: async () => unwrap(await api.GET("/api/v1/admin/catalog/categories")),
  });
  if (products.isPending || categories.isPending) return <Loading />;
  if (products.error || categories.error)
    return (
      <ErrorNotice
        error={products.error || categories.error}
        retry={() => {
          void products.refetch();
          void categories.refetch();
        }}
      />
    );
  const items = products.data.pages.flatMap((p) => p.products);
  return (
    <>
      <span className="eyebrow">SẢN PHẨM</span>
      <h1>Danh mục sản phẩm</h1>
      <div className="actions">
        <Button asChild>
          <Link className="button" href="/admin/products/new">
            Thêm sản phẩm
          </Link>
        </Button>
        <Button variant="outline" onClick={() => setCategory(!category)}>
          Thêm danh mục
        </Button>
      </div>
      <ActionFeedback action={action} />
      {category && (
        <Card asChild>
          <form
            className="panel"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              if (
                await action.run("/api/v1/admin/catalog/categories", "POST", {
                  name: String(form.get("name")),
                  slug: String(form.get("slug")),
                  parent_id: null,
                })
              )
                setCategory(false);
            }}
          >
            <h2>Danh mục mới</h2>
            <Field label="Tên" name="name" maxLength={120} />
            <Field label="Đường dẫn" name="slug" maxLength={120} />
            <Button disabled={action.pending}>Lưu danh mục</Button>
          </form>
        </Card>
      )}
      <h2>Danh mục</h2>
      {!categories.data.categories.length ? (
        <p>Chưa có danh mục.</p>
      ) : (
        categories.data.categories.map((c) => (
          <CategoryEditor key={c.category_id} value={c} categories={categories.data.categories} />
        ))
      )}
      {!items.length ? (
        <Empty>Chưa có sản phẩm.</Empty>
      ) : (
        <Card asChild>
          <div className="panel table-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Biến thể</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => (
                  <TableRow key={p.product_id}>
                    <TableCell>
                      <AdminProductIdentity product={p} />
                      <small>{p.slug}</small>
                    </TableCell>
                    <TableCell>
                      <Badge state={p.status} />
                    </TableCell>
                    <TableCell>{p.variants.length}</TableCell>
                    <TableCell>
                      <Button asChild variant="outline">
                        <Link className="button" href={`/admin/products/${p.product_id}`}>
                          Chỉnh sửa
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
      <Pager
        next={products.data.pages.at(-1)?.next_cursor}
        load={() => void products.fetchNextPage()}
        pending={products.isFetchingNextPage}
      />
    </>
  );
}

type VariantDraft = { key: string; value: Schema["CatalogVariantWrite"] };
const draftKey = () => Math.random().toString(36).slice(2);

function VariantFields({ draft, remove }: { draft: VariantDraft; remove: () => void }) {
  const { key, value } = draft;
  const [options, setOptions] = useState(() =>
    Object.entries(value.option_values).map(([name, value]) => ({
      key: draftKey(),
      name,
      value,
    })),
  );
  return (
    <Card asChild>
      <fieldset className="panel">
        <legend>Biến thể {value.sku || "mới"}</legend>
        <input type="hidden" name="variant-key" value={key} />
        <input type="hidden" name={`${key}-id`} value={value.variant_id || ""} />
        <Field label="SKU" name={`${key}-sku`} value={value.sku} maxLength={100} />
        <Field
          label="Mã vạch"
          name={`${key}-barcode`}
          value={value.barcode || ""}
          required={false}
          maxLength={100}
        />
        <Field
          label="Khối lượng (g)"
          name={`${key}-weight`}
          type="number"
          value={value.weight_grams}
          min={0}
          max={1000000000}
        />
        <div className="form-grid">
          {(["length_mm", "width_mm", "height_mm"] as const).map((d, index) => (
            <Field
              key={d}
              label={["Chiều dài (mm)", "Chiều rộng (mm)", "Chiều cao (mm)"][index]}
              name={`${key}-${d}`}
              type="number"
              value={value.dimensions[d] ?? ""}
              required={false}
              min={0}
              max={10000000}
            />
          ))}
        </div>
        {options.map((option) => (
          <div className="form-grid" key={option.key}>
            <Field
              label="Tên thuộc tính"
              name={`${key}-option-name`}
              value={option.name}
              maxLength={100}
            />
            <Field
              label="Giá trị thuộc tính"
              name={`${key}-option-value`}
              value={option.value}
              maxLength={100}
            />
            <Button
              variant="outline"
              type="button"
              onClick={() => setOptions((items) => items.filter((item) => item.key !== option.key))}
            >
              Xóa thuộc tính
            </Button>
          </div>
        ))}
        <div className="actions">
          <Button
            variant="outline"
            type="button"
            onClick={() =>
              setOptions((items) => [...items, { key: draftKey(), name: "", value: "" }])
            }
          >
            Thêm thuộc tính
          </Button>
          <Button variant="outline" type="button" onClick={remove}>
            Xóa biến thể
          </Button>
        </div>
      </fieldset>
    </Card>
  );
}

function ProductAuthoring({ value }: { value?: Schema["CatalogProduct"] }) {
  const confirm = useConfirm();
  const [variants, setVariants] = useState<VariantDraft[]>(() =>
    value
      ? value.variants
          .filter((v) => v.status === "active")
          .map((v) => ({
            key: v.variant_id,
            value: {
              variant_id: v.variant_id,
              sku: v.sku,
              barcode: v.barcode,
              option_values: v.option_values,
              weight_grams: v.weight_grams,
              dimensions: v.dimensions,
            },
          }))
      : [
          {
            key: draftKey(),
            value: {
              sku: "",
              option_values: {},
              weight_grams: 0,
              dimensions: {},
            },
          },
        ],
  );
  const [media, setMedia] = useState(
    () =>
      value?.media.map((m) => ({
        key: m.media_id as string,
        value: {
          media_id: m.media_id,
          object_key: m.object_key,
          alt_text: m.alt_text,
          position: m.position,
        } as Schema["CatalogMediaWrite"],
      })) || [],
  );
  return (
    <>
      <h2>Biến thể</h2>
      {variants.map((draft) => (
        <VariantFields
          key={draft.key}
          draft={draft}
          remove={async () => {
            if (variants.length > 1 && (await confirm("Xóa biến thể khỏi sản phẩm khi lưu?")))
              setVariants((items) => items.filter((item) => item.key !== draft.key));
          }}
        />
      ))}
      <Button
        variant="outline"
        type="button"
        onClick={() =>
          setVariants((items) => [
            ...items,
            {
              key: draftKey(),
              value: {
                sku: "",
                option_values: {},
                weight_grams: 0,
                dimensions: {},
              },
            },
          ])
        }
      >
        Thêm biến thể
      </Button>
      <h2>Hình ảnh</h2>
      <p>Dùng mã đối tượng từ kho hình ảnh của cửa hàng.</p>
      {media.map((draft) => (
        <Card key={draft.key} asChild>
          <fieldset className="panel">
            <legend>Hình ảnh sản phẩm</legend>
            <input type="hidden" name="media-key" value={draft.key} />
            <input
              type="hidden"
              name={`${draft.key}-media-id`}
              value={draft.value.media_id || ""}
            />
            <Field
              label="Mã đối tượng hình ảnh"
              name={`${draft.key}-object-key`}
              value={draft.value.object_key}
              maxLength={512}
            />
            <Field
              label="Mô tả hình ảnh"
              name={`${draft.key}-alt`}
              value={draft.value.alt_text}
              maxLength={500}
            />
            <Field
              label="Thứ tự hình ảnh"
              name={`${draft.key}-position`}
              type="number"
              value={draft.value.position}
              min={0}
            />
            <Button
              variant="outline"
              type="button"
              onClick={() => setMedia((items) => items.filter((item) => item.key !== draft.key))}
            >
              Xóa hình ảnh
            </Button>
          </fieldset>
        </Card>
      ))}
      <Button
        variant="outline"
        type="button"
        onClick={() =>
          setMedia((items) => [
            ...items,
            {
              key: draftKey(),
              value: { object_key: "", alt_text: "", position: items.length },
            },
          ])
        }
      >
        Thêm hình ảnh
      </Button>
    </>
  );
}

function parseVariants(form: FormData): Schema["CatalogVariantWrite"][] {
  return form
    .getAll("variant-key")
    .map(String)
    .map((key) => {
      const names = form.getAll(`${key}-option-name`).map(String);
      const values = form.getAll(`${key}-option-value`).map(String);
      if (new Set(names).size !== names.length)
        throw new Error("Tên thuộc tính trong một biến thể không được trùng nhau.");
      const dimension = (name: string) =>
        form.get(`${key}-${name}`) ? Number(form.get(`${key}-${name}`)) : null;
      return {
        ...(form.get(`${key}-id`) ? { variant_id: String(form.get(`${key}-id`)) } : {}),
        sku: String(form.get(`${key}-sku`)),
        barcode: String(form.get(`${key}-barcode`)) || null,
        option_values: Object.fromEntries(names.map((name, index) => [name, values[index]])),
        weight_grams: Number(form.get(`${key}-weight`)),
        dimensions: {
          length_mm: dimension("length_mm"),
          width_mm: dimension("width_mm"),
          height_mm: dimension("height_mm"),
        },
      };
    });
}

export function ProductEditor({ productID }: { productID?: string }) {
  const confirm = useConfirm();
  const { scope, ready } = useSession();
  const action = useAction();
  const [formError, setFormError] = useState<unknown>();
  const product = useQuery({
    queryKey: [...scope, "admin-product", productID],
    enabled: ready && !!productID,
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/catalog/products/{product_id}", {
          params: { path: { product_id: productID! } },
        }),
      ),
  });
  const categories = useQuery({
    queryKey: [...scope, "admin-categories"],
    enabled: ready,
    queryFn: async () => unwrap(await api.GET("/api/v1/admin/catalog/categories")),
  });
  if ((productID && product.isPending) || categories.isPending) return <Loading />;
  if (product.error || categories.error)
    return (
      <ErrorNotice
        error={product.error || categories.error}
        retry={() => {
          void product.refetch();
          void categories.refetch();
        }}
      />
    );
  const value = product.data;
  async function edit(form: FormData) {
    setFormError(undefined);
    try {
      const body: Schema["CatalogProductWrite"] = {
        name: String(form.get("name")),
        slug: String(form.get("slug")),
        description: String(form.get("description")),
        variants: parseVariants(form),
        category_ids: form.getAll("category_ids").map(String),
        media: form
          .getAll("media-key")
          .map(String)
          .map((key) => ({
            ...(form.get(`${key}-media-id`)
              ? { media_id: String(form.get(`${key}-media-id`)) }
              : {}),
            object_key: String(form.get(`${key}-object-key`)),
            alt_text: String(form.get(`${key}-alt`)),
            position: Number(form.get(`${key}-position`)),
          })),
        ...(value ? { expected_version: value.version } : {}),
      };
      await action.run(
        value
          ? `/api/v1/admin/catalog/products/${value.product_id}`
          : "/api/v1/admin/catalog/products",
        value ? "PUT" : "POST",
        body,
      );
    } catch (error) {
      setFormError(error);
    }
  }
  return (
    <>
      <Link href="/admin/products">← Sản phẩm</Link>
      <span className="eyebrow">SẢN PHẨM</span>
      <h1>{value ? `Chỉnh sửa · ${value.name}` : "Thêm sản phẩm"}</h1>
      {value && <AdminProductIdentity product={value} />}
      <p>Sản phẩm cần biến thể đang bán và giá hiện tại trước khi xuất bản.</p>
      <ActionFeedback action={action} />
      <ErrorNotice error={formError} />
      <Card key={value?.version || 0} asChild>
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            void edit(new FormData(e.currentTarget));
          }}
        >
          <h2>Thông tin cơ bản</h2>
          <Field label="Tên sản phẩm" name="name" value={value?.name} maxLength={200} />
          <Field label="Đường dẫn" name="slug" value={value?.slug} maxLength={160} />
          <Label className="field">
            <span>Mô tả</span>
            <Textarea name="description" defaultValue={value?.description} maxLength={10000} />
          </Label>
          <ProductAuthoring key={value?.version || 0} value={value} />
          <fieldset>
            <legend>Danh mục</legend>
            {categories.data?.categories.map((c) => (
              <Label className="check" key={c.category_id}>
                <Checkbox
                  name="category_ids"
                  value={c.category_id}
                  defaultChecked={value?.category_ids.includes(c.category_id)}
                />
                {c.name}
              </Label>
            ))}
          </fieldset>
          <div className="actions">
            <Button disabled={action.pending}>Lưu thay đổi</Button>
          </div>
        </form>
      </Card>
      {value && (
        <Card asChild>
          <div className="panel">
            <h2>Trạng thái</h2>
            <Badge state={value.status} />
            <div className="actions">
              {value.status === "draft" && (
                <Button
                  disabled={action.pending}
                  onClick={() =>
                    void action.run(
                      `/api/v1/admin/catalog/products/${value.product_id}/publish`,
                      "POST",
                      { expected_version: value.version },
                    )
                  }
                >
                  Xuất bản
                </Button>
              )}
              {value.status !== "archived" && (
                <Button
                  variant="outline"
                  disabled={action.pending}
                  onClick={async () => {
                    if (await confirm("Lưu trữ sản phẩm này?"))
                      void action.run(
                        `/api/v1/admin/catalog/products/${value.product_id}/archive`,
                        "POST",
                        { expected_version: value.version },
                      );
                  }}
                >
                  Lưu trữ
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
