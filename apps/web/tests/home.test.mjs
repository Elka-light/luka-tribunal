import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the landing page states the service purpose and limitation", async () => {
  const page = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /information et d’orientation/i);
  assert.match(page, /confirmées auprès des autorités judiciaires compétentes/i);
  assert.doesNotMatch(page, /navigator\.geolocation/);
});

test("geolocation is only initiated by an explicit button action", async () => {
  const map = await readFile(
    new URL("../src/components/jurisdiction-map.tsx", import.meta.url),
    "utf8",
  );
  assert.match(map, /onClick=\{locateUser\}/);
  assert.match(map, /Cette position n’est pas enregistrée/);
});

test("administrative publication is explicit and coordinate fields are bounded", async () => {
  const admin = await readFile(
    new URL("../src/components/admin-panel.tsx", import.meta.url),
    "utf8",
  );
  assert.match(admin, /window\.confirm/);
  assert.match(admin, /name="latitude"[^>]*min="-90"[^>]*max="90"/);
  assert.match(admin, /name="longitude"[^>]*min="-180"[^>]*max="180"/);
  assert.match(admin, /Date de vérification/);
});

test("the web layer declares security headers and a restrictive permissions policy", async () => {
  const config = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(config, /Content-Security-Policy/);
  assert.match(config, /frame-ancestors 'none'/);
  assert.match(config, /geolocation=\(self\), camera=\(\), microphone=\(\)/);
});
