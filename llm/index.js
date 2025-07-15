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