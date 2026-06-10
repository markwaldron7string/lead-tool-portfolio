import { Redis } from "@upstash/redis";

const AREAS_KEY = "taken_areas";
const LEADS_KEY = "taken_leads";

function getRedis() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;
  return new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });
}

export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) return Response.json({ taken: [], takenLeads: [] });
    const [taken, takenLeads] = await Promise.all([
      redis.get(AREAS_KEY).then((v) => v || []),
      redis.get(LEADS_KEY).then((v) => v || []),
    ]);
    return Response.json({ taken, takenLeads });
  } catch {
    return Response.json({ taken: [], takenLeads: [] });
  }
}

export async function POST(request) {
  try {
    const redis = getRedis();
    if (!redis) return Response.json({ taken: [], takenLeads: [] });
    const body = await request.json();

    // Lead-level toggle: { lead, taken }
    if (body.lead !== undefined) {
      const current = await redis.get(LEADS_KEY).then((v) => v || []);
      const updated = body.taken
        ? current.includes(body.lead) ? current : [...current, body.lead]
        : current.filter((t) => t !== body.lead);
      await redis.set(LEADS_KEY, updated);
      return Response.json({ takenLeads: updated });
    }

    // Area-level toggle: { area, taken }
    const current = await redis.get(AREAS_KEY).then((v) => v || []);
    const updated = body.taken
      ? current.includes(body.area) ? current : [...current, body.area]
      : current.filter((a) => a !== body.area);
    await redis.set(AREAS_KEY, updated);
    return Response.json({ taken: updated });
  } catch {
    return Response.json({ taken: [], takenLeads: [] });
  }
}
