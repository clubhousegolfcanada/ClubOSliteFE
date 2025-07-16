// BookingWrapper.js
import { sendToLLM } from '../index.js';

const BookingWrapper = {
  async handle(payload, tone = null) {
    const prompt = this.buildPrompt(payload, tone);
    const response = await sendToLLM(prompt);
    return response;
  },

  buildPrompt(payload, tone) {
    const basePrompt = `
      Handle the following booking issue:
      User: ${payload.userName}
      Bay: ${payload.bayNumber}
      Issue Type: ${payload.issueType}
      Details: ${payload.issueDetails || 'None'}
      
      Conversation History:
      ${payload.conversationHistory.join('\n') || 'None'}
      
      Provide a clear, concise response.
    `;
    return tone ? `${tone}\n\n${basePrompt}` : basePrompt;
  }
};

export default BookingWrapper;