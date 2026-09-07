import { createResource, deleteResource, getResources, updateResource, verifyResource } from '../services/resourceService.js';

export async function listResources(req, res, next) {
  try {
    const resources = await getResources({
      state: req.query.state,
      district: req.query.district,
      city: req.query.city || 'All',
      pincode: req.query.pincode,
      categoryId: req.query.categoryId,
      orgType: req.query.orgType,
      verificationStatus: req.query.verificationStatus,
      emergency: req.query.emergency ? req.query.emergency === 'true' : undefined,
      searchQuery: req.query.searchQuery,
      userLat: req.query.userLat,
      userLng: req.query.userLng,
      maxDistanceKm: req.query.maxDistanceKm,
      sortBy: req.query.sortBy || 'relevance'
    });
    res.json({ resources, count: resources.length });
  } catch (error) {
    next(error);
  }
}

export async function addResource(req, res, next) {
  try {
    const resource = await createResource(req.body);
    res.status(201).json({ message: 'Resource created successfully', resource });
  } catch (error) {
    next(error);
  }
}

export async function editResource(req, res, next) {
  try {
    const resource = await updateResource(req.params.id, req.body);
    res.json({ message: 'Resource updated successfully', resource });
  } catch (error) {
    next(error);
  }
}

export async function removeResource(req, res, next) {
  try {
    await deleteResource(req.params.id);
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function verifyResourceStatus(req, res, next) {
  try {
    const status = req.body.status || 'Verified';
    const resource = await verifyResource(req.params.id, status);
    res.json({ message: `Resource status updated to ${status}`, resource });
  } catch (error) {
    next(error);
  }
}
