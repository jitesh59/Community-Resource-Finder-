export const SYSTEM_PROMPT = `You are an AI assistant specialized in community resource discovery across all 28 States and 8 Union Territories in India.

Your responsibilities:
- Understand natural language user requirements (healthcare, education, scholarships, employment, skill development, legal aid, NGOs, food assistance, government schemes, emergency services, etc.)
- Extract location parameters (State, District, City, PIN Code) and user eligibility
- Match user queries to actual resources from the application's verified database
- Respond concisely, helpfully, and clearly
- Stay strictly within domain

CRITICAL GROUNDING RULE:
- NEVER invent or hallucinate phone numbers, addresses, organization names, or government schemes.
- Ground your response strictly on the matched database resources provided to you.
- If no matching resources exist in the database, clearly inform the user that no matching resource was found and suggest broadening their location or category filter.`;

export function buildIntentPrompt(message, history = []) {
  return [
    SYSTEM_PROMPT,
    'Return ONLY valid JSON without markdown wrapping. Keys must be:',
    'inDomain: boolean,',
    'intent: string ("resource_search" | "nearby_resource_search" | "emergency_search" | "scheme_search"),',
    'categories: string[],',
    'requirement: string | null,',
    'state: string | null,',
    'district: string | null,',
    'city: string | null,',
    'pincode: string | null,',
    'urgency: "normal" | "emergency",',
    'keywords: string[],',
    'eligibility: string | null',
    `Recent conversation: ${JSON.stringify(history.slice(-6))}`,
    `User query: ${message}`
  ].join('\n\n');
}

export function buildAnswerPrompt({ message, intent, resources, history }) {
  return [
    SYSTEM_PROMPT,
    'Matched resources from actual database:',
    JSON.stringify(resources, null, 2),
    'Instructions:',
    '1. Use ONLY the matched database resources listed above.',
    '2. If resources is empty, politely explain that no matching verified resource was found in the database for this specific location/category, and advise the user to broaden their search or select another state/city.',
    '3. Do NOT make up phone numbers, websites, or services.',
    '4. Provide a 2-3 sentence clear summary highlighting the best matches and key details (phone, eligibility, address).',
    `Recent conversation: ${JSON.stringify(history.slice(-6))}`,
    `Detected intent: ${JSON.stringify(intent)}`,
    `User query: ${message}`
  ].join('\n\n');
}
