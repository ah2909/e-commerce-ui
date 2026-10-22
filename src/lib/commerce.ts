export function money(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "Chưa có giá";
  if (!Number.isSafeInteger(amount) || amount < 0) throw new Error("invalid_money");
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function paymentLink(value?: string): string | undefined {
  if (!value) return;
  try {
    const url = new URL(value);
    if (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (url.hostname === "momo.vn" || url.hostname.endsWith(".momo.vn"))
    )
      return url.href;
  } catch {
    return;
  }
}

export function localDateTime(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function dateTimeInstant(value: string, prior?: string | null): string | null {
  if (!value) return null;
  if (prior && value === localDateTime(prior)) return prior;
  return new Date(value).toISOString();
}

export const states: Record<string, string> = {
  pending_payment: "Chờ thanh toán",
  paid: "Đã thanh toán",
  processing: "Đang chuẩn bị",
  shipped: "Đang giao",
  completed: "Hoàn tất",
  expired: "Đã hết hạn",
  cancellation_requested: "Đang hủy",
  refund_pending: "Chờ hoàn tiền",
  cancelled: "Đã hủy",
  pending: "Đang chờ",
  succeeded: "Thành công",
  failed: "Thất bại",
  reconciliation_required: "Cần đối soát",
  refunded: "Đã hoàn tiền",
  active: "Đang hoạt động",
  archived: "Đã lưu trữ",
  draft: "Bản nháp",
  published: "Đang bán",
  action_required: "Cần thanh toán",
  retryable: "Có thể thử lại",
  creating: "Đang tạo",
};
