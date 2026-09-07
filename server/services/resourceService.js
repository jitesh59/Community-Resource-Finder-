import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';
import { Resource } from '../models/Resource.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, '../../data/resources.json');

let cachedResources = null;

export async function loadResources() {
  if (mongoose.connection.readyState === 1) {
    const count = await Resource.estimatedDocumentCount();
    if (count === 0) {
      const seed = JSON.parse(await fs.readFile(dataPath, 'utf8'));
      await Resource.insertMany(seed);
    }
    return Resource.find().lean();
  }

  if (!cachedResources) cachedResources = JSON.parse(await fs.readFile(dataPath, 'utf8'));
  return cachedResources;
}

export async function getResources(filters = {}) {
  const { city = 'All', categoryId, emergency } = filters;
  const resources = await loadResources();
  const targetCity = city.toLowerCase();
  return resources.filter((resource) => {
    if (city !== 'All') {
      const resCity = resource.city.toLowerCase();
      if (resCity !== targetCity && !resCity.includes(targetCity) && !targetCity.includes(resCity)) return false;
    }
    if (categoryId && resource.categoryId !== categoryId) return false;
    if (typeof emergency === 'boolean' && resource.emergency !== emergency) return false;
    return true;
  });
}

export function haversineDistance(origin, resource) {
  if (!origin?.lat || !origin?.lng || !resource.lat || !resource.lng) return Number.MAX_SAFE_INTEGER;
  const radius = 6371;
  const dLat = ((resource.lat - origin.lat) * Math.PI) / 180;
  const dLng = ((resource.lng - origin.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((origin.lat * Math.PI) / 180) *
      Math.cos((resource.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function matchResources(resources, intent, origin) {
  const terms = [...new Set([...(intent.categories || []), ...(intent.keywords || []), intent.city].filter(Boolean))];
  const query = terms.join(' ').toLowerCase();

  return resources
    .map((resource) => {
      const haystack = `${resource.name} ${resource.addr} ${resource.city} ${resource.category} ${resource.categoryId}`.toLowerCase();
      const lexicalScore = terms.reduce((score, term) => score + (haystack.includes(String(term).toLowerCase()) ? 1 : 0), 0);
      const emergencyBoost = intent.urgency === 'emergency' && resource.emergency ? 3 : 0;
      const cityMatch = intent.city && (resource.city.toLowerCase().includes(intent.city.toLowerCase()) || intent.city.toLowerCase().includes(resource.city.toLowerCase()));
      const cityBoost = cityMatch ? 3 : 0;
      const distance = haversineDistance(origin, resource);
      return { ...resource, distanceKm: distance, score: lexicalScore + emergencyBoost + cityBoost + resource.rating / 10 };
    })
    .filter((resource) => resource.score > 0 || query.length === 0)
    .sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm || b.rating - a.rating)
    .slice(0, 6);
}
