// ==========================================
// WARLORD MCNC // GLOBAL MULTI-PERSONA TTS ENGINE
// Strict Persona-to-Gender Matrix (Male / Female)
// ==========================================

let isTtsGloballyEnabled = true;

export const setGlobalTtsEnabled = (enabled) => {
  isTtsGloballyEnabled = enabled;
  if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export const getGlobalTtsEnabled = () => isTtsGloballyEnabled;

// Strict Female Roster
const FEMALE_ROSTER = [
  'roxy',
  'jaz',
  'jasmine',
  'valery',
  'valerie',
  'tess',
  'amber',
  'sarah',
  'elena'
];

// Strict Male Roster
const MALE_ROSTER = [
  'monty',
  'charlie',
  'jack',
  'silas',
  'atlas',
  'askari',
  'commander',
  'mike',
  'system',
  'daemon'
];

export const speakAgentResponse = (rawText, explicitAgent = null) => {
  if (!isTtsGloballyEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Cancel any active audio stream
  window.speechSynthesis.cancel();

  // Strip Markdown, code fences, symbols, and links
  const cleanText = rawText
    .replace(/```[\s\S]*?```/g, ' [Code Block Omitted] ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[#*_\-\[\]]/g, ' ')
    .replace(/https?:\/\/\S+/g, 'link')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) return;

  // 1. Resolve identity
  let target = (explicitAgent || '').toLowerCase().trim();

  // Fallback: Check for bracketed header tag like [ROXY // ...] or [MONTY // ...]
  if (!target) {
    const match = rawText.match(/^\[([A-Za-z0-9_-]+)/);
    if (match) {
      target = match[1].toLowerCase().trim();
    }
  }

  // 2. Classify Gender
  const isFemale = FEMALE_ROSTER.some(f => target.includes(f));

  // 3. Query voices from browser
  const voices = window.speechSynthesis.getVoices();
  const utterance = new SpeechSynthesisUtterance(cleanText);

  if (isFemale) {
    // Locate best matching female voice (Windows default: Microsoft Zira, or Chrome/Edge Natural Female)
    const femaleVoice = voices.find(v => {
      const name = v.name.toLowerCase();
      return (
        name.includes('zira') ||
        name.includes('jenny') ||
        name.includes('aria') ||
        name.includes('sonia') ||
        name.includes('samantha') ||
        (name.includes('female') && !name.includes('male')) ||
        (v.lang.startsWith('en') && (name.includes('natural') || name.includes('online')) && !name.includes('guy') && !name.includes('david'))
      );
    }) || voices.find(v => v.lang.startsWith('en'));

    if (femaleVoice) utterance.voice = femaleVoice;
    utterance.pitch = 1.15; // Higher female pitch register
    utterance.rate = 1.0;
  } else {
    // Locate best matching male voice (Windows default: Microsoft David, or Chrome/Edge Natural Male)
    const maleVoice = voices.find(v => {
      const name = v.name.toLowerCase();
      return (
        name.includes('david') ||
        name.includes('george') ||
        name.includes('guy') ||
        name.includes('mark') ||
        name.includes('ryan') ||
        name.includes('male')
      );
    }) || voices.find(v => v.lang.startsWith('en'));

    if (maleVoice) utterance.voice = maleVoice;
    utterance.pitch = 0.88; // Deep authoritative male pitch register
    utterance.rate = 1.02;
  }

  window.speechSynthesis.speak(utterance);
};