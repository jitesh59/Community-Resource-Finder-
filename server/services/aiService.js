import OpenAI from 'openai';
import { buildAnswerPrompt, buildIntentPrompt } from './promptService.js';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function createTextResponse(input) {
  if (!client) throw new Error('OPENAI_API_KEY is not configured');

  const response = await client.responses.create({
    model,
    input,
    temperature: 0.3, // Low temperature keeps resource recommendations factual and stable.
    top_p: 0.8 // Slight nucleus narrowing reduces rambling while allowing natural phrasing.
  });

  return response.output_text?.trim() || '';
}

function fallbackIntent(message) {
  const text = message.toLowerCase();
  const domainWords = ['hospital', 'doctor', 'police', 'atm', 'bank', 'pharmacy', 'medicine', 'college', 'school', 'fire', 'mall', 'park', 'delhi', 'mumbai', 'bengaluru', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'chandigarh', 'ludhiana', 'phagwara', 'jalandhar', 'lpu', 'india'];
  const categories = ['hospitals', 'police', 'atms', 'banks', 'pharmacies', 'education', 'fire', 'parks'].filter((word) =>
    text.includes(word.slice(0, -1)) || text.includes(word)
  );
  const city = ['Delhi NCR', 'Delhi', 'Mumbai', 'Bengaluru', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Chandigarh', 'LPU Campus', 'Phagwara', 'Jalandhar', 'Ludhiana'].find((candidate) => text.includes(candidate.toLowerCase())) || null;
  return {
    inDomain: domainWords.some((word) => text.includes(word)),
    intent: text.includes('near') ? 'nearby_resource_search' : 'resource_search',
    categories,
    city,
    urgency: text.includes('emergency') || text.includes('urgent') ? 'emergency' : 'normal',
    keywords: text.split(/\W+/).filter(Boolean).slice(0, 8)
  };
}

export async function detectIntent(message, history) {
  try {
    const raw = await createTextResponse(buildIntentPrompt(message, history));
    return JSON.parse(raw.replace(/^```json|```$/g, '').trim());
  } catch (_error) {
    return fallbackIntent(message);
  }
}

export async function generateAnswer({ message, intent, resources, history }) {
  if (!intent.inDomain) {
    return 'I can help with local community resources across India such as hospitals, police stations, pharmacies, ATMs, banks, educational institutions, fire services, malls, and parks. Please ask about one of those.';
  }

  try {
    return await createTextResponse(buildAnswerPrompt({ message, intent, resources, history }));
  } catch (_error) {
    if (!resources.length) return 'I could not find a strong match. Which city and resource type should I search?';
    const names = resources.slice(0, 3).map((resource) => `${resource.name} in ${resource.city}`).join(', ');
    return `Here are the best matches I found: ${names}. Open a card for phone, hours, and directions.`;
  }
}
