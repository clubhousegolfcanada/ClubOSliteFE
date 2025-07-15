const TONE_MAP = {
  default: "Respond in a balanced and helpful tone.",
  dry: "Respond dry, sharp, no fluff.",
  blunt: "Be brutally clear. No euphemisms.",
  witty: "Use clever phrasing or sarcasm. No cringe.",
  serious: "Sound premium and urgent.",
  friendly: "Helpful, human, no AI weirdness.",
  clubhouse: "ClubOS tone: direct, confident, slightly cocky. Prioritize clarity, time, and respect for intelligence."
}

export function getToneInstruction(toneKey) {
  return TONE_MAP[toneKey] || TONE_MAP['clubhouse']
}