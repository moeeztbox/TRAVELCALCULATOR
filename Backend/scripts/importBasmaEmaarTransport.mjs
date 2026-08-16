// scripts/importBasmaEmaarTransport.mjs
// One-off data import: BASMA EMAAR PAKISTAN transport rate sheet.
// Usage: node scripts/importBasmaEmaarTransport.mjs
//
// Dedup key: agentName + route + carType (exact match). Existing records
// for other agents (e.g. "BASMA TRANSPORT", "moeez") are never touched.
import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import Transport from "../Models/transport.js";
import mongoose from "mongoose";

const AGENT_NAME = "BASMA EMAAR PAKISTAN";

// Vehicle master data: carType -> { capacity, luggage (bags) }.
const VEHICLES = [
  { carType: "SEDAN", capacity: "2", luggage: 2 },
  { carType: "GMC YUKON XL 25 MODEL", capacity: "6", luggage: 4 },
  { carType: "STARIA", capacity: "7", luggage: 4 },
  { carType: "HIACE", capacity: "9", luggage: 6 },
  { carType: "COASTER", capacity: "17", luggage: 10 },
  { carType: "BUS 20 MODEL", capacity: "47", luggage: 20 },
  { carType: "BUS 25/26 MODEL", capacity: "49", luggage: 25 },
];

// Determines trip type from route notation. "<>" is checked before ">"
// since "<>" also contains the ">" character.
const deriveTripType = (route) => {
  if (route.includes("<>")) return "roundtrip";
  if (route.includes(">")) return "oneway";
  return null; // no symbol — must be given explicitly below
};

// Prices are ordered to match VEHICLES exactly: Sedan, GMC, Staria, Hiace,
// Coaster, Bus 20, Bus 25/26.
const ROUTES = [
  { route: "JEDDAH AIRPORT > MAKKAH HOTEL", prices: [260, 410, 325, 375, 550, 800, 900] },
  { route: "MAKKAH > MADINAH", prices: [490, 830, 580, 600, 850, 1050, 1150] },
  { route: "JEDDAH AIRPORT > MADINAH", prices: [520, 870, 600, 650, 900, 1150, 1250] },
  { route: "MAKKAH > JEDDAH AIRPORT", prices: [195, 350, 270, 295, 450, 700, 800] },
  {
    route: "MAKKAH & MADINAH ZIYARAT",
    // No ">" or "<>" in the source label. Treated as ROUND TRIP: a Ziyarat
    // tour is a there-and-back sightseeing service (vehicle waits/returns
    // to the hotel), matching the semantics of every other explicit
    // ROUND TRIP route in this sheet rather than a one-way transfer.
    tripTypeOverride: "roundtrip",
    prices: [200, 370, 250, 300, 350, 400, 450],
  },
  { route: "MADINAH AIRPORT <> MADINAH HOTEL", prices: [150, 260, 220, 275, 300, 450, 500] },
  { route: "JEDDAH AIRPORT <> JEDDAH CITY", prices: [180, 330, 250, 280, 300, 450, 500] },
  { route: "MAKKAH > TAIF ZIYARAT", prices: [650, 950, 750, 800, 900, 1000, 1100] },
  { route: "MAKKAH HOTEL > MAKKAH TRAIN STATION", prices: [150, 250, 200, 300, 320, 350, 400] },
  { route: "MADINAH HOTEL > MADINAH TRAIN STATION", prices: [150, 250, 200, 300, 320, 350, 400] },
  { route: "MAKKAH > MADINAH VIA BADR - EXTRA CHARGES", prices: [220, 300, 230, 270, 280, 300, 350] },
  {
    route: "MAKKAH ZIYARAT WITH JOURANA",
    tripTypeOverride: "roundtrip", // same reasoning as above
    prices: [250, 450, 400, 420, 400, 450, 500],
  },
  { route: "MADINAH AIRPORT > MAKKAH HOTEL", prices: [700, 980, 800, 875, 1150, 1400, 1550] },
  { route: "TAIF AIRPORT > MAKKAH HOTEL", prices: [600, 900, 700, 750, 850, 950, 1050] },
];

const run = async () => {
  await connectDB();

  let inserted = 0;
  let skipped = 0;
  const insertedDocs = [];

  for (const { route, prices, tripTypeOverride } of ROUTES) {
    const tripType = tripTypeOverride || deriveTripType(route);
    if (!tripType) {
      throw new Error(`Could not determine trip type for route: "${route}"`);
    }

    for (let i = 0; i < VEHICLES.length; i++) {
      const { carType, capacity, luggage } = VEHICLES[i];
      const price = prices[i];

      const existing = await Transport.findOne({
        agentName: AGENT_NAME,
        route,
        carType,
      });

      if (existing) {
        skipped++;
        continue;
      }

      const doc = await Transport.create({
        carType,
        capacity,
        tripType,
        route,
        agentName: AGENT_NAME,
        price,
        luggage,
      });
      insertedDocs.push(doc);
      inserted++;
    }
  }

  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped (already existed): ${skipped}`);
  console.log(`Total combinations processed: ${inserted + skipped}`);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
