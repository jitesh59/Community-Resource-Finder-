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
    return Resource.find({ active: { $ne: false } }).lean();
  }

  if (!cachedResources) {
    const raw = await fs.readFile(dataPath, 'utf8');
    cachedResources = JSON.parse(raw);
  }
  return cachedResources.filter((r) => r.active !== false);
}

export async function saveResources(resources) {
  cachedResources = resources;
  await fs.writeFile(dataPath, JSON.stringify(resources, null, 2), 'utf8');
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

export async function getResources(filters = {}) {
  const {
    state,
    district,
    city = 'All',
    pincode,
    categoryId,
    orgType,
    verificationStatus,
    emergency,
    searchQuery,
    userLat,
    userLng,
    maxDistanceKm,
    sortBy = 'relevance'
  } = filters;

  let resources = await loadResources();

  if (state && state !== 'All') {
    const st = state.toLowerCase();
    resources = resources.filter(
      (r) => r.state && (r.state.toLowerCase() === st || r.state.toLowerCase().includes(st))
    );
  }

  if (district && district !== 'All') {
    const dist = district.toLowerCase();
    resources = resources.filter(
      (r) => r.district && (r.district.toLowerCase() === dist || r.district.toLowerCase().includes(dist))
    );
  }

  if (city && city !== 'All') {
    const ct = city.toLowerCase();
    resources = resources.filter(
      (r) =>
        r.city &&
        (r.city.toLowerCase() === ct || r.city.toLowerCase().includes(ct) || ct.includes(r.city.toLowerCase()))
    );
  }

  if (pincode && String(pincode).trim().length > 0) {
    const pin = String(pincode).trim();
    resources = resources.filter(
      (r) => r.pincode && (r.pincode === pin || r.pincode.startsWith(pin.slice(0, 3)))
    );
  }

  if (categoryId && categoryId !== 'All') {
    const cat = categoryId.toLowerCase();
    resources = resources.filter(
      (r) => r.categoryId?.toLowerCase() === cat || r.category?.toLowerCase() === cat
    );
  }

  if (orgType && orgType !== 'All') {
    const ot = orgType.toLowerCase();
    resources = resources.filter((r) => r.orgType?.toLowerCase() === ot);
  }

  if (verificationStatus && verificationStatus !== 'All') {
    resources = resources.filter((r) => r.verificationStatus === verificationStatus);
  }

  if (typeof emergency === 'boolean') {
    resources = resources.filter((r) => r.emergency === emergency);
  }

  if (searchQuery && searchQuery.trim()) {
    const queryTerms = searchQuery.toLowerCase().split(/\W+/).filter(Boolean);
    resources = resources.filter((r) => {
      const text = `${r.name} ${r.description || ''} ${r.addr} ${r.city} ${r.district || ''} ${r.state || ''} ${r.category} ${r.availableServices?.join(' ') || ''}`.toLowerCase();
      return queryTerms.some((term) => text.includes(term));
    });
  }

  const origin = userLat && userLng ? { lat: Number(userLat), lng: Number(userLng) } : null;

  resources = resources.map((r) => ({
    ...r,
    distanceKm: origin ? haversineDistance(origin, r) : Number.MAX_SAFE_INTEGER
  }));

  if (origin && maxDistanceKm && Number(maxDistanceKm) > 0) {
    resources = resources.filter((r) => r.distanceKm <= Number(maxDistanceKm));
  }

  if (sortBy === 'distance' && origin) {
    resources.sort((a, b) => a.distanceKm - b.distanceKm);
  } else if (sortBy === 'rating') {
    resources.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === 'updated') {
    resources.sort((a, b) => new Date(b.lastUpdatedDate || 0) - new Date(a.lastUpdatedDate || 0));
  } else {
    resources.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  return resources;
}

export function matchResources(resources, intent, origin) {
  const terms = [
    ...new Set(
      [
        ...(intent.categories || []),
        ...(intent.keywords || []),
        intent.city,
        intent.district,
        intent.state,
        intent.pincode
      ].filter(Boolean)
    )
  ];
  const query = terms.join(' ').toLowerCase();

  return resources
    .map((resource) => {
      const haystack = `${resource.name} ${resource.description || ''} ${resource.addr} ${resource.city} ${resource.district || ''} ${resource.state || ''} ${resource.pincode || ''} ${resource.category} ${resource.categoryId} ${resource.availableServices?.join(' ') || ''}`.toLowerCase();

      const lexicalScore = terms.reduce(
        (score, term) => score + (haystack.includes(String(term).toLowerCase()) ? 2 : 0),
        0
      );

      const emergencyBoost = intent.urgency === 'emergency' && resource.emergency ? 4 : 0;

      const stateMatch =
        intent.state &&
        resource.state &&
        (resource.state.toLowerCase().includes(intent.state.toLowerCase()) ||
          intent.state.toLowerCase().includes(resource.state.toLowerCase()));
      const stateBoost = stateMatch ? 3 : 0;

      const cityMatch =
        intent.city &&
        resource.city &&
        (resource.city.toLowerCase().includes(intent.city.toLowerCase()) ||
          intent.city.toLowerCase().includes(resource.city.toLowerCase()));
      const cityBoost = cityMatch ? 4 : 0;

      const pinMatch = intent.pincode && resource.pincode && resource.pincode === intent.pincode;
      const pinBoost = pinMatch ? 5 : 0;

      const distance = haversineDistance(origin, resource);
      const totalScore = lexicalScore + emergencyBoost + stateBoost + cityBoost + pinBoost + (resource.rating || 4.0) / 10;

      return { ...resource, distanceKm: distance, score: totalScore };
    })
    .filter((resource) => resource.score > 0 || query.length === 0)
    .sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm || (b.rating || 0) - (a.rating || 0))
    .slice(0, 6);
}

// ── Admin CRUD Methods ─────────────────────────────────────────────────────────

export async function createResource(data) {
  if (mongoose.connection.readyState === 1) {
    const newDoc = new Resource({
      ...data,
      verificationStatus: data.verificationStatus || 'Verified',
      active: true,
      lastUpdatedDate: new Date().toISOString().split('T')[0]
    });
    return (await newDoc.save()).toObject();
  }

  const list = await loadResources();
  const newObj = {
    id: `res-${Date.now()}`,
    ...data,
    verificationStatus: data.verificationStatus || 'Verified',
    active: true,
    lastUpdatedDate: new Date().toISOString().split('T')[0]
  };
  list.unshift(newObj);
  await saveResources(list);
  return newObj;
}

export async function updateResource(id, data) {
  if (mongoose.connection.readyState === 1) {
    return Resource.findByIdAndUpdate(
      id,
      { ...data, lastUpdatedDate: new Date().toISOString().split('T')[0] },
      { new: true }
    ).lean();
  }

  const list = await loadResources();
  const idx = list.findIndex((r) => r.id === id || r._id === id);
  if (idx === -1) throw new Error('Resource not found');
  list[idx] = { ...list[idx], ...data, lastUpdatedDate: new Date().toISOString().split('T')[0] };
  await saveResources(list);
  return list[idx];
}

export async function deleteResource(id) {
  if (mongoose.connection.readyState === 1) {
    return Resource.findByIdAndDelete(id);
  }

  let list = await loadResources();
  list = list.filter((r) => r.id !== id && r._id !== id);
  await saveResources(list);
  return { success: true };
}

export async function verifyResource(id, status = 'Verified') {
  return updateResource(id, { verificationStatus: status });
}
