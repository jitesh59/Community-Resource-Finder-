import { getDistricts, getStates, lookupPincode } from '../services/locationService.js';

export async function listStates(req, res, next) {
  try {
    const states = await getStates();
    res.json({ states });
  } catch (error) {
    next(error);
  }
}

export async function listDistricts(req, res, next) {
  try {
    const { state } = req.query;
    const districts = await getDistricts(state);
    res.json({ districts });
  } catch (error) {
    next(error);
  }
}

export async function getPincodeInfo(req, res, next) {
  try {
    const { pincode } = req.params;
    const info = await lookupPincode(pincode);
    if (!info) return res.status(404).json({ error: 'PIN code prefix not recognized' });
    res.json(info);
  } catch (error) {
    next(error);
  }
}
