export type Location = { code: string; name: string };
export const addressDataVersion = "v5.2.0";

export function searchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export async function loadLocations(
  province: string | undefined,
  signal: AbortSignal,
): Promise<Location[]> {
  if (province !== undefined && !/^\d{2}$/.test(province)) throw new Error("invalid_province_code");
  const response = await fetch(
    `/data/vn-address/${addressDataVersion}/${province || "provinces"}.json`,
    { signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]), credentials: "omit" },
  );
  if (!response.ok) throw new Error("address_data_unavailable");
  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.length || data.length > 1000)
    throw new Error("invalid_address_data");
  const code = province ? /^\d{5}$/ : /^\d{2}$/;
  const seen = new Set<string>();
  for (const item of data) {
    if (
      !item ||
      typeof item.code !== "string" ||
      !code.test(item.code) ||
      seen.has(item.code) ||
      typeof item.name !== "string" ||
      !item.name.trim() ||
      new TextEncoder().encode(item.name).length > 120 ||
      /[<>\p{Cc}]/u.test(item.name)
    )
      throw new Error("invalid_address_data");
    seen.add(item.code);
  }
  return data;
}

export function formatAddress(address: {
  line1?: string;
  line2?: string;
  ward?: string;
  district?: string;
  province?: string;
  postal_code?: string;
}): string {
  return [
    address.line1,
    address.line2,
    address.ward,
    address.district,
    address.province,
    address.postal_code,
  ]
    .filter((part) => part?.trim())
    .join(", ");
}
