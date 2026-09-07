export const SYSTEM_PROMPT = `You are an AI assistant specialized in community resource discovery across all states and cities in India.

Your responsibilities:
- Understand user intent
- Map queries to categories (hospital, police, food, etc.)
- Provide relevant recommendations for Indian cities
- Respond concisely and clearly
- Stay strictly within domain

If query is unrelated, politely refuse.`;

export function buildIntentPrompt(message, history = []) {
  return [
    SYSTEM_PROMPT,
    'Return only valid JSON with keys: inDomain:boolean, intent:string, categories:string[], city:string|null, urgency:"normal"|"emergency", keywords:string[].',
    `Recent conversation: ${JSON.stringify(history.slice(-6))}`,
    `User query: ${message}`
  ].join('\n\n');
}

export function buildAnswerPrompt({ message, intent, resources, history }) {
  return [
    SYSTEM_PROMPT,
    'Use the provided matched resources only. Do not invent phone numbers, addresses, ratings, or services.',
    'If no resources are relevant, ask one concise clarifying question.',
    'Format the answer as a short helpful response followed by 2-4 recommended resources.',
    `Recent conversation: ${JSON.stringify(history.slice(-6))}`,
    `Detected intent: ${JSON.stringify(intent)}`,
    `Matched resources: ${JSON.stringify(resources)}`,
    `User query: ${message}`
  ].join('\n\n');
}
