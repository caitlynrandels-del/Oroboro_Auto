OROBORO AUTO - State Engine Interface
========================================
Repo: oroboro-auto
Tagline: MAP + COLLISION + OBJECT -> RENDER

WHAT IT IS:
-----------
Single-file dealer Service Lane visualizer. No backend, no keys.
4 vehicles in seed (scalable to N) - not hardcoded. Add VINs to OROBORO_AUTO_SEED[] and everything scales: canvas, EPA, bay view.

PANELS:
-------
1. SHOP FLOOR (MAP DATA) - 4 bays, collision radius 5.5m on click
2. INVENTORY (OBJECT DATA) - Vehicles + live health + DTC
3. WORK QUEUE - RO + status
4. BAY VIEW - Per-bay detail
5. EPA FUEL ECONOMY (New) - MPG bar chart, CO2 Venn (bubble size = pollution), annual fuel cost. Visuals for non-technical.
6. WHAT'S GOING ON? (New) - Plain English: "Running perfect" / "Needs attention - engine light" + health gauge.

DATA SOURCES (Public Domain):
-----------------------------
- NHTSA vPIC: https://vpic.nhtsa.dot.gov/api/ - VIN decode, no key
- EPA FuelEconomy.gov: https://www.fueleconomy.gov/ws/rest/vehicle/{id}
  Credits: U.S. EPA & DOE - fueleconomy.gov

PROXY (Netlify):
----------------
File: /netlify/functions/epa-proxy.js
Code:
fetch(`https://www.fueleconomy.gov/ws/rest/vehicle/${id}`)

Deployed at: /api/epa-proxy?id={id} or ?year=&make=&model=

CREDIT GUARD - Remember credits!
---------------------------------
Server: Validates year/make/model/id BEFORE fetch. Returns creditsConsumed:0 on VALIDATION_FAIL.
Client: 
- canAffordEPARequest() checks cache + validates + balance before fetch
- Cache hit = 0 credits (localStorage epa_cache)
- Network fail = 0 credits
- Only 1 credit consumed after successful upstream

Headers:
X-Credits-Consumed: 1
X-Data-Source: fueleconomy.gov - Public Domain - Credits: U.S. EPA & DOE
X-Credits-Guard: Validated before fetch - 0 credits on validation fail

All API data is public domain. Simulated telemetry (odometer+25, health calc) is marked as demo-only in UI.

STRUCTURE:
----------
OROBORO_AUTO_SEED = [{vin, year, make, model, trim, bay, battery, tire, odometer, roStatus, roValue, dtc}]
-> MAP DATA + COLLISION DATA + OBJECT DATA -> RENDER

Palette: Black/gunmetal/silver + Forest/Copper/Blue (automotive readable source)
Terms: Service Event, Impact Radius, DTC Snapshot, Telemetry Capture, Bay View

DEPLOY:
-------
Netlify Drop: Drag oroboro-netlify-drop.zip to https://app.netlify.com/drop
Contains: index.html + netlify/functions/epa-proxy.js + netlify.toml

GITHUB:
-------
Upload index.html + netlify/functions/epa-proxy.js + README.txt
Commit: feat: EPA live + credit guard + MAP+COLLISION+OBJECT render + charts

SCALE:
------
Change OROBORO_AUTO_SEED.length from 4 to N. No code change needed. 100k VINs = $0.10-0.50/VIN/mo API model.

LICENSE: MIT
Public data sources remain public domain.
