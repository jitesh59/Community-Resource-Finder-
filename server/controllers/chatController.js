import { z } from 'zod';
import { getSessionId } from '../middleware/session.js';
import { detectIntent, generateAnswer } from '../services/aiService.js';
import { appendHistory, getHistory } from '../services/historyService.js';
import { getResources, matchResources } from '../services/resourceService.js';

const ChatSchema = z.object({
  message: z.string().min(1).max(1000),
  state: z.string().optional().default('All'),
  district: z.string().optional().default('All'),
  city: z.string().optional().default('All'),
  pincode: z.string().optional(),
  location: z.object({ lat: z.number(), lng: z.number() }).nullish()
});

export async function chat(req, res, next) {
  try {
    const body = ChatSchema.parse(req.body);
    const sessionId = getSessionId(req);
    const history = await getHistory(sessionId);
    const intent = await detectIntent(body.message, history);

    const targetState = intent.state || (body.state !== 'All' ? body.state : undefined);
    const targetDistrict = intent.district || (body.district !== 'All' ? body.district : undefined);
    const targetCity = intent.city || (body.city !== 'All' ? body.city : 'All');
    const targetPincode = intent.pincode || body.pincode;

    const candidates = await getResources({
      state: targetState,
      district: targetDistrict,
      city: targetCity,
      pincode: targetPincode,
      emergency: intent.urgency === 'emergency' ? true : undefined,
      userLat: body.location?.lat,
      userLng: body.location?.lng
    });

    const resources = matchResources(candidates, intent, body.location);
    const answer = await generateAnswer({ message: body.message, intent, resources, history });

    await appendHistory(sessionId, [
      { role: 'user', content: body.message },
      { role: 'assistant', content: answer, resources }
    ]);

    res.json({ answer, intent, resources });
  } catch (error) {
    if (error.name === 'ZodError') error.status = 400;
    next(error);
  }
}
