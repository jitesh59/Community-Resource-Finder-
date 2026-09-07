import OpenAI from 'openai';
import { buildAnswerPrompt, buildIntentPrompt } from './promptService.js';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function createTextResponse(input) {
  if (!client) throw new Error('OPENAI_API_KEY is not configured');

  const response = await client.responses.create({
    model,
    input,
    temperature: 0.2, // Low temperature keeps recommendations strictly factual and grounded
    top_p: 0.8
  });

  return response.output_text?.trim() || '';
}

function fallbackIntent(message) {
  const text = message.toLowerCase();
  const domainWords = [
    'hospital', 'doctor', 'clinic', 'police', 'atm', 'bank', 'pharmacy', 'medicine',
    'college', 'school', 'university', 'fire', 'mall', 'park', 'scholarship', 'education',
    'skill', 'employment', 'job', 'ngo', 'legal', 'lawyer', 'food', 'shelter', 'housing',
    'women', 'child', 'senior', 'elderly', 'disability', 'mental', 'counseling', 'blood',
    'delhi', 'mumbai', 'bengaluru', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune',
    'ahmedabad', 'jaipur', 'chandigarh', 'ludhiana', 'phagwara', 'jalandhar', 'punjab',
    'karnataka', 'maharashtra', 'tamil nadu', 'telangana', 'kerala', 'uttar pradesh', 'bihar',
    'india', 'pincode', 'pin'
  ];

  const categoryMap = {
    hospitals: ['hospital', 'doctor', 'clinic', 'medical', 'icu', 'opd'],
    education: ['school', 'college', 'university', 'study'],
    scholarships: ['scholarship', 'stipend', 'grant', 'fee waiver'],
    employment: ['job', 'employment', 'work', 'hiring'],
    skill_development: ['skill', 'training', 'vocational', 'course', 'pmkvy'],
    government_schemes: ['scheme', 'yojana', 'sarkari', 'government'],
    food_assistance: ['food', 'meal', 'ration', 'hunger', 'kitchen', 'khana'],
    housing: ['housing', 'shelter', 'home', 'night shelter'],
    legal_aid: ['legal', 'lawyer', 'advocate', 'court', 'dlsa', 'justice'],
    women_support: ['women', 'sakhi', 'harassment', 'domestic violence', 'female'],
    child_support: ['child', 'children', 'orphan', 'childline', 'kid'],
    senior_citizen_services: ['senior', 'elderly', 'old age', 'pension'],
    disability_support: ['disability', 'handicapped', 'disabled', 'wheelchair'],
    mental_health: ['mental', 'counseling', 'therapy', 'depression', 'stress', 'nimhans'],
    ngos: ['ngo', 'trust', 'charity', 'volunteer', 'foundation'],
    emergency_services: ['emergency', 'ambulance', 'rescue', 'disaster'],
    financial_assistance: ['financial', 'loan', 'credit', 'bank', 'atm'],
    blood_banks: ['blood', 'plasma', 'platelets', 'donor']
  };

  const categories = Object.keys(categoryMap).filter((catKey) =>
    categoryMap[catKey].some((keyword) => text.includes(keyword))
  );

  const pincodeMatch = text.match(/\b\d{6}\b/);
  const pincode = pincodeMatch ? pincodeMatch[0] : null;

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi NCR', 'Delhi', 'Chandigarh', 'Jammu and Kashmir'
  ];

  const matchedState = states.find((s) => text.includes(s.toLowerCase())) || null;

  const cities = ['Delhi NCR', 'Delhi', 'Mumbai', 'Bengaluru', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Chandigarh', 'LPU Campus', 'Phagwara', 'Jalandhar', 'Ludhiana'];
  const matchedCity = cities.find((candidate) => text.includes(candidate.toLowerCase())) || null;

  return {
    inDomain: domainWords.some((word) => text.includes(word)),
    intent: text.includes('near') ? 'nearby_resource_search' : 'resource_search',
    categories: categories.length ? categories : ['hospitals'],
    requirement: text,
    state: matchedState,
    district: null,
    city: matchedCity,
    pincode,
    urgency: text.includes('emergency') || text.includes('urgent') || text.includes('free') ? 'emergency' : 'normal',
    keywords: text.split(/\W+/).filter((w) => w.length > 2).slice(0, 8),
    eligibility: null
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
    return 'I am your India-Wide Community Resource Finder Assistant. I can help you discover healthcare facilities, schools, scholarships, skill programs, legal aid, NGOs, food assistance, and emergency services across all 28 States and 8 Union Territories in India. Please ask about one of those services.';
  }

  try {
    return await createTextResponse(buildAnswerPrompt({ message, intent, resources, history }));
  } catch (_error) {
    if (!resources.length) {
      return 'No verified community resource matching your query was found in our database. Please try broadening your location filter (select State or City) or search for another category.';
    }
    const names = resources.slice(0, 3).map((resource) => `${resource.name} (${resource.city}, ${resource.state || 'India'})`).join(', ');
    return `Here are the top verified matches found in our database: ${names}. Click on any resource card to view full contact details, directions, and available services.`;
  }
}
