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

const responseSchema = z.object({ data: z.array(jurisdictionSchema) });
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

  const response = await fetch(`${apiUrl}/api/v1/jurisdictions?${parameters}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error("La recherche est momentanément indisponible.");
  return responseSchema.parse(await response.json()).data;
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
