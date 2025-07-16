// llmDispatcher.js
import BookingWrapper from './wrappers/BookingWrapper.js';
import EmergencyWrapper from './wrappers/EmergencyWrapper.js';
import TechWrapper from './wrappers/TechWrapper.js';
import GeneralWrapper from './wrappers/GeneralWrapper.js';

const wrapperMap = {
  booking: BookingWrapper,
  emergency: EmergencyWrapper,
  tech: TechWrapper,
  general: GeneralWrapper
};

export default async function dispatchToLLM(type, payload, tone = null) {
  const wrapper = wrapperMap[type];
  if (!wrapper) throw new Error(`No wrapper found for type: ${type}`);
  return await wrapper.handle(payload, tone);
}