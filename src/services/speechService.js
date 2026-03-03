export class SpeechService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.voice = null;
    this.enabled = true;
    this.loadVoices();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = this.loadVoices.bind(this);
    }
  }

  loadVoices() {
    const voices = this.synthesis.getVoices();
    // Prefer a natural sounding English voice
    this.voice = voices.find(v => v.name.includes("Google") && v.lang.startsWith("en")) || 
                 voices.find(v => v.lang.startsWith("en")) || 
                 voices[0];
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.synthesis.cancel();
    }
  }

  speak(text, priority = false) {
    if (!this.enabled) return;

    if (priority) {
      this.synthesis.cancel();
    }

    if (this.synthesis.speaking && !priority) return;

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.rate = 1.1; // Slightly faster for efficiency
    utterance.pitch = 1.0;
    
    this.synthesis.speak(utterance);
  }

  stop() {
    this.synthesis.cancel();
  }
}

export const speechService = new SpeechService();
