// /netlify/functions/epa-proxy.js
// PUBLIC DOMAIN SOURCES: NHTSA + EPA - Credits @fueleconomy.gov + @NHTSA
// Credit Guard: Validate request BEFORE consuming EPA quota/calling upstream

const EPA_BASE = "https://www.fueleconomy.gov/ws/rest";

export default async (req) => {
  // --- CREDIT GUARD STEP 1: Parse + Validate before any fetch ---
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const year = url.searchParams.get('year');
  const make = url.searchParams.get('make');
  const model = url.searchParams.get('model');

  // If ID provided, it's a direct vehicle lookup - validate format
  if (id) {
    if (!/^\d+$/.test(id)) {
      return new Response(JSON.stringify({ error: "Invalid vehicle ID", code: "VALIDATION_FAIL", creditsConsumed: 0 }), { status: 400 });
    }
  } else {
    // If no ID, require year/make/model for menu lookup
    if (!year || !make || !model) {
      return new Response(JSON.stringify({ error: "Missing year/make/model or id", code: "VALIDATION_FAIL", creditsConsumed: 0 }), { status: 400 });
    }
    if (!/^\d{4}$/.test(year) || year < 1984 || year > 2030) {
      return new Response(JSON.stringify({ error: "Invalid year", code: "VALIDATION_FAIL", creditsConsumed: 0 }), { status: 400 });
    }
    if (make.length < 2 || model.length < 1) {
      return new Response(JSON.stringify({ error: "Invalid make/model", code: "VALIDATION_FAIL", creditsConsumed: 0 }), { status: 400 });
    }
  }

  // --- CREDIT GUARD STEP 2: Only now we count it as billable ---
  try {
    let upstreamUrl;
    if (id) {
      upstreamUrl = `${EPA_BASE}/vehicle/${id}`;
    } else {
      // Menu options lookup
      upstreamUrl = `${EPA_BASE}/vehicle/menu/options?year=${encodeURIComponent(year)}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
    }

    const res = await fetch(upstreamUrl, {
      headers: { "Accept": "application/xml, text/xml, */*" }
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ 
        error: `EPA upstream ${res.status}`, 
        upstreamUrl,
        creditsConsumed: 1, // consumed because we tried, but upstream failed
        fallback: true 
      }), { status: res.status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
    }

    const text = await res.text();

    // Return XML as-is but with credit header + CORS
    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Access-Control-Allow-Origin": "*",
        "X-Credits-Consumed": "1",
        "X-Data-Source": "fueleconomy.gov - Public Domain - Credits: U.S. EPA & DOE",
        "X-Credits-Guard": "Validated before fetch - 0 credits on validation fail"
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, creditsConsumed: 0, code: "NETWORK_FAIL" }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  }
};

export const config = {
  path: "/api/epa-proxy"
};
