import { ApiError, type Schema } from "@/lib/api/client";
export type Appearance = Schema["StorefrontAppearance"];
export const presets = {
  home: {
    name: "Nhà & đời sống",
    note: "Ấm áp · tự nhiên · gần gũi",
    title: "Những điều đẹp cho mỗi ngày",
    text: "Khám phá những sản phẩm được cửa hàng lựa chọn dành cho bạn.",
  },
  fashion: {
    name: "Thời trang",
    note: "Tinh giản · thanh lịch · cá tính",
    title: "Phong cách của riêng bạn",
    text: "Tìm những món đồ phù hợp với phong cách và nhịp sống của bạn.",
  },
  sport: {
    name: "Thể thao",
    note: "Năng động · rõ nét · mạnh mẽ",
    title: "Sẵn sàng cho mỗi chuyển động",
    text: "Khám phá trang phục và dụng cụ cho những hoạt động bạn yêu thích.",
  },
} as const;
export function safeImageURL(value: string): string | undefined {
  try {
    const u = new URL(value);
    return u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !u.hash &&
      !/[<>\\\s]/.test(value)
      ? u.href
      : undefined;
  } catch {
    return undefined;
  }
}

export function canKeepAppearance(error: unknown): boolean {
  return (
    !(error instanceof ApiError) ||
    error.status === 408 ||
    error.status === 429 ||
    error.status >= 500
  );
}
