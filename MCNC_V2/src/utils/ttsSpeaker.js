// ==========================================
// WARLORD MCNC // GLOBAL TTS ENGINE (ZERO-STATE)
// ==========================================

let isTtsGloballyEnabled = true;

export const setGlobalTtsEnabled = (enabled) => {
  isTtsGloballyEnabled = enabled;
  if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export const getGlobalTtsEnabled = () => isTtsGloballyEnabled;

export const speakAgentResponse = (rawText, preferredVoiceName = null) => {
  if (!isTtsGloballyEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Cancel any currently playing speech buffer
  window.speechSynthesis.cancel();

  // Strip code blocks, markdown asterisks, hashes, and URLs for clean vocalization
  const cleanText = rawText
    .replace(/```[\s\S]*?```/g, ' [Code Block Omitted] ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[#*_\-\[\]]/g, ' ')
    .replace(/https?:\/\/\S+/g, 'link')
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Auto-select clean UK or US natural voice profile
  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = preferredVoiceName 
    ? voices.find(v => v.name.includes(preferredVoiceName))
    : voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('George') || v.name.includes('UK') || v.name.includes('David')));

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.rate = 1.05; // Slightly crisp, tactical pacing
  utterance.pitch = 0.95; // Grounded command tone

  window.speechSynthesis.speak(utterance);
};