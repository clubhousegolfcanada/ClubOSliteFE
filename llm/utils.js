const TONE_MAP = {
  default: "Respond in a neutral and helpful tone.",
  dry: "Use a dry, direct tone. Minimalist and clear.",
  blunt: "Be brutally honest. No padding, no fluff.",
  witty: "Use sharp wit or sarcasm if useful. Never cheesy.",
  serious: "Professional, composed, urgent.",
  friendly: "Casual and helpful. Don’t overdo it.",
  clubhouse: "ClubOS voice: clear, confident, slightly cocky. Prioritize time, precision, and tone-matching."
}

export function getToneInstruction(toneKey) {
  return TONE_MAP[toneKey] || TONE_MAP['clubhouse']
}