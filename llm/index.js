import { getToneInstruction } from './utils.js'

export async function sendToLLM(payload) {
  const tone = payload.tone || 'clubhouse'
  const toneInstruction = getToneInstruction(tone)

  const prompt = `
${toneInstruction}

Here’s the full context:
${JSON.stringify(payload, null, 2)}
  `

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'system', content: prompt }],
    temperature: 0.7
  })

  return response.data
}
// index.js (Core LLM Send logic)
export async function sendToLLM(prompt) {
  try {
    const response = await fetch('YOUR_LLM_ENDPOINT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_LLM_API_KEY'
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('LLM call failed:', error);
    throw error;
  }
}