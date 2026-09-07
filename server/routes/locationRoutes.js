import { Router } from 'express';
import { getPincodeInfo, listDistricts, listStates } from '../controllers/locationController.js';

const router = Router();

router.get('/states', listStates);
router.get('/districts', listDistricts);
router.get('/pincode/:pincode', getPincodeInfo);

export default router;
