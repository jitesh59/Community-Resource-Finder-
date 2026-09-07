import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const locationsPath = path.resolve(__dirname, '../../data/india_locations.json');

let cachedLocations = null;

export async function loadLocations() {
  if (!cachedLocations) {
    const raw = await fs.readFile(locationsPath, 'utf8');
    cachedLocations = JSON.parse(raw);
  }
  return cachedLocations;
}

export async function getStates() {
  const data = await loadLocations();
  return data.states.map((s) => ({
    name: s.name,
    code: s.code,
    type: s.type,
    districtCount: s.districts.length
  }));
}

export async function getDistricts(stateName) {
  if (!stateName || stateName === 'All') return [];
  const data = await loadLocations();
  const stateObj = data.states.find(
    (s) => s.name.toLowerCase() === stateName.toLowerCase() || s.code.toLowerCase() === stateName.toLowerCase()
  );
  return stateObj ? stateObj.districts : [];
}

export async function lookupPincode(pincode) {
  if (!pincode || String(pincode).trim().length < 2) return null;
  const pinStr = String(pincode).trim();
  const prefix2 = pinStr.slice(0, 2);
  const prefix3 = pinStr.slice(0, 3);
  const data = await loadLocations();

  const matched = data.states.find((s) =>
    s.pincodePrefixes?.some((p) => p === prefix2 || p === prefix3)
  );

  if (!matched) return null;
  return {
    state: matched.name,
    districts: matched.districts,
    pincode: pinStr
  };
}
