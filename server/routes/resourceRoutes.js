import { Router } from 'express';
import { addResource, editResource, listResources, removeResource, verifyResourceStatus } from '../controllers/resourceController.js';

const router = Router();

router.get('/', listResources);
router.post('/', addResource);
router.put('/:id', editResource);
router.delete('/:id', removeResource);
router.patch('/:id/verify', verifyResourceStatus);

export default router;
