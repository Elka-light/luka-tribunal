import { z } from "zod";

const jurisdictionSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  officialName: z.string(),
  commonName: z.string().nullable(),
  jurisdictionType: z.string(),
  province: z.string(),
  city: z.string().nullable(),
  address: z.string(),
  informationSource: z.string(),
  verifiedAt: z.string(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

const responseSchema = z.object({
  data: z.array(jurisdictionSchema),
  meta: z.object({ nextOffset: z.number().int().nonnegative().nullable() }),
});
const detailSchema = jurisdictionSchema.extend({
  municipality: z.string().nullable(),
  territory: z.string().nullable(),
  locality: z.string().nullable(),
  territorialJurisdiction: z.string().nullable(),
  coordinateSource: z.string(),
  contacts: z.array(
    z.object({ type: z.string(), label: z.string().nullable(), value: z.string() }),
  ),
});
const detailResponseSchema = z.object({ data: detailSchema });

export type Jurisdiction = z.infer<typeof jurisdictionSchema>;
export type JurisdictionDetail = z.infer<typeof detailSchema>;

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export async function searchJurisdictions(filters: {
  q?: string;
  province?: string;
  city?: string;
}): Promise<Jurisdiction[]> {
  const parameters = new URLSearchParams();
  if (filters.q) parameters.set("q", filters.q);
  if (filters.province) parameters.set("province", filters.province);
  if (filters.city) parameters.set("city", filters.city);

  parameters.set("limit", "50");
  const items: Jurisdiction[] = [];
  let offset = 0;
  do {
    parameters.set("offset", String(offset));
    const response = await fetch(`${apiUrl}/api/v1/jurisdictions?${parameters}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("La recherche est momentanément indisponible.");
    const page = responseSchema.parse(await response.json());
    items.push(...page.data);
    if (page.meta.nextOffset === null) return items;
    if (page.meta.nextOffset <= offset || page.meta.nextOffset > 100000) {
      throw new Error("Trop de résultats. Précisez votre recherche.");
    }
    offset = page.meta.nextOffset;
  } while (true);
}

export async function getJurisdiction(slug: string): Promise<JurisdictionDetail> {
  const response = await fetch(`${apiUrl}/api/v1/jurisdictions/${encodeURIComponent(slug)}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Cette juridiction est introuvable ou indisponible.");
  return detailResponseSchema.parse(await response.json()).data;
}

export async function createReport(input: {
  jurisdictionId: string;
  category: string;
  comment?: string;
}): Promise<void> {
  const response = await fetch(`${apiUrl}/api/v1/reports`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error("Le signalement n’a pas pu être envoyé.");
}
