import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const revision = "62b1abdfe39625289c37a58ef6678e9db3d37f84";
const version = "v5.2.0";
const source = `https://raw.githubusercontent.com/thanglequoc/vietnamese-provinces-database/${revision}/json/simplified_json_generated_data_vn_units.json`;
const expectedHash = "f624138116bde151c860cbd25a84cd6b9b38250e8a049ed371c55dee729ac286";
const bytes = process.argv[2]
  ? await readFile(process.argv[2])
  : Buffer.from(await (await fetch(source, { signal: AbortSignal.timeout(30000) })).arrayBuffer());
if (createHash("sha256").update(bytes).digest("hex") !== expectedHash)
  throw new Error("Source checksum differs from the reviewed dataset");
const data = JSON.parse(bytes.toString("utf8"));
const seen = new Set();
function location(item, pattern) {
  if (
    !pattern.test(item.Code) ||
    seen.has(item.Code) ||
    typeof item.FullName !== "string" ||
    item.FullName !== item.FullName.trim() ||
    Buffer.byteLength(item.FullName) > 120 ||
    /[<>\p{Cc}]/u.test(item.FullName)
  )
    throw new Error("Invalid or duplicate location");
  seen.add(item.Code);
  return { code: item.Code, name: item.FullName };
}
if (!Array.isArray(data) || data.length !== 34) throw new Error("Unexpected province count");
const provinces = data.map((item) => location(item, /^\d{2}$/));
const wards = data.map((province) => {
  if (
    !Array.isArray(province.Wards) ||
    !province.Wards.length ||
    province.Wards.some((ward) => ward.ProvinceCode !== province.Code)
  )
    throw new Error("Invalid ward parent");
  return province.Wards.map((item) => location(item, /^\d{5}$/));
});
const wardCount = wards.reduce((count, items) => count + items.length, 0);
if (wardCount !== 3321) throw new Error("Unexpected ward count");
const output = fileURLToPath(new URL(`../public/data/vn-address/${version}/`, import.meta.url));
await mkdir(output, { recursive: true });
await writeFile(`${output}/provinces.json`, JSON.stringify(provinces));
for (let index = 0; index < provinces.length; index++)
  await writeFile(`${output}/${provinces[index].code}.json`, JSON.stringify(wards[index]));
await writeFile(
  `${output}/metadata.json`,
  JSON.stringify(
    {
      version,
      revision,
      source,
      source_sha256: expectedHash,
      province_count: provinces.length,
      ward_count: wardCount,
      effective_through: "2026-09-20",
      checked_on: "2026-10-07",
      official_register: "https://danhmuchanhchinh.nso.gov.vn/NghiDinh.aspx",
      resolutions: ["388/NQ-UBTVQH16", "39/2026/QH16", "36/2026/QH16"],
      license: "MIT",
      copyright: "Copyright (c) 2021 Thang Le Quoc",
    },
    null,
    2,
  ),
);
console.log(`Generated ${provinces.length} provinces and ${wardCount} wards (${version})`);
