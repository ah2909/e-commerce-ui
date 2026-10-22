import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import openapiTS, { astToString } from "openapi-typescript";

const source = await readFile(
  new URL("../../../e-commerce/api/openapi.json", import.meta.url),
  "utf8",
);
const contract = JSON.parse(source);
const digest = createHash("sha256").update(source).digest("hex");
const generated = astToString(await openapiTS(contract));
const routes = Object.entries(contract.paths).flatMap(([path, methods]) =>
  Object.keys(methods)
    .filter((method) => ["get", "post", "put", "patch", "delete"].includes(method))
    .map((method) => ({ path, method: method.toUpperCase() })),
);
const files = {
  "schema.d.ts": generated,
  "routes.json": JSON.stringify(routes, null, 2) + "\n",
  "contract.sha256": digest + "\n",
};
await mkdir(new URL("../../src/lib/api/", import.meta.url), { recursive: true });
for (const [name, content] of Object.entries(files)) {
  const file = new URL(`../../src/lib/api/${name}`, import.meta.url);
  if (process.argv.includes("--check")) {
    if ((await readFile(file, "utf8").catch(() => "")) !== content) {
      throw new Error(`OpenAPI drift in ${name}; run npm run api:generate.`);
    }
  } else await writeFile(file, content);
}
console.log(
  process.argv.includes("--check")
    ? "OpenAPI contract matches."
    : "Generated API types and routes.",
);
