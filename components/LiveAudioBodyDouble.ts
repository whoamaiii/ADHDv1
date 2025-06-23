/* tslint:disable */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Session } from '@google/genai';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
// Removed createBlob, decode, decodeAudioData as they are not used for STT/TTS directly here yet
// import { createBlob, decode, decodeAudioData } from './utils';
import './visual-3d';

// Attempt to get the SpeechRecognition object, handling vendor prefixes
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

@customElement('gdm-live-audio-body-double')
export class GdmLiveAudioBodyDouble extends LitElement {
  @property({ type: String, attribute: 'api-key' }) apiKey = '';

  @state() isListening = false;
  @state() status = 'Inactive. Press Start.';
  @state() error = '';

  private client: GoogleGenAI | null = null;
  private session: Session | null = null; // Gemini chat session
  private recognition: SpeechRecognition | null = null;

  // Output audio context and related properties removed as window.speechSynthesis handles playback directly.

  static styles = css`
    :host {
      display: block;
      border: 1px solid var(--border-light, #ccc);
      border-radius: 8px;
      color: var(--text-primary, #333);
      padding: 10px;
    }
    #status-error-container {
      min-height: 20px;
      margin-bottom: 10px;
      text-align: center;
      font-size: 0.8em;
    }
    #status-text {
      color: var(--text-secondary, #555);
    }
    #error-text {
      color: var(--error-color, #d9534f);
      font-weight: bold;
    }
    .controls {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: row;
      gap: 10px;
      button {
        outline: none;
        border: 1px solid var(--border-medium, #ccc);
        color: var(--text-primary, #333);
        border-radius: 8px;
        background: var(--bg-card, #fff);
        width: 48px;
        height: 48px;
        cursor: pointer;
        font-size: 20px;
        padding: 0;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover {
          background: var(--bg-light-accent, #f0f0f0);
        }
      }
      button[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }
      button#startButton, button#stopButton {
         /* Manage visibility via disabled attribute in render logic if needed, or CSS classes */
      }
    }
    svg {
      fill: var(--text-primary, #333);
    }
  `;

  constructor() {
    super();
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = this.handleRecognitionResult.bind(this);
      this.recognition.onerror = this.handleRecognitionError.bind(this);
      this.recognition.onend = this.handleRecognitionEnd.bind(this);
      this.recognition.onstart = () => this.updateStatus("🎤 Listening...");
      this.recognition.onaudiostart = () => console.log("Audio capture started.");
      this.recognition.onaudioend = () => console.log("Audio capture ended.");
      this.recognition.onspeechstart = () => console.log("Speech detected.");
      this.recognition.onspeechend = () => console.log("Speech ended.");

    } else {
      this.updateError("Speech Recognition API not supported by this browser.");
      console.error("Speech Recognition API not supported.");
    }
  }

  connectedCallback() {
    super.connectedCallback();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('apiKey')) {
      if (this.isListening) {
        this.stopListening();
      }
      this.client = null;
      this.session = null;

      if (this.apiKey) {
        this.initGeminiClient();
      } else {
        this.updateError('API Key is now empty. Live Audio disabled.');
      }
    }
  }

  private initGeminiClient() {
    if (!this.apiKey) {
      this.updateError('API Key is missing. Cannot initialize Gemini Client.');
      return;
    }
    this.client = new GoogleGenAI({ apiKey: this.apiKey });
    this.updateStatus('Client initialized. Ready.');
  }

  public async startListening() {
    this.error = '';
    if (!this.apiKey) {
        this.updateError("API Key is not set. Cannot start listening.");
        return;
    }
    if (!this.client) {
        this.updateError("Gemini client not initialized.");
        if (this.apiKey) this.initGeminiClient();
        if (!this.client) return;
    }
    if (!this.recognition) {
        this.updateError("Speech Recognition not available.");
        return;
    }

    if (this.isListening) {
      this.updateStatus("Already listening.");
      return;
    }

    if (!this.session) {
      try {
        await this.initGeminiChatSession();
      } catch (e) {
        return;
      }
    }

    if (this.session) {
      try {
        if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        this.recognition.start();
        this.isListening = true;
      } catch (e: any) {
        this.updateError(`Error starting speech recognition: ${e.message}`);
        console.error("Error starting SpeechRecognition:", e);
        this.isListening = false;
      }
    } else {
         this.updateError("Failed to initialize AI session. Cannot start listening.");
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  private async initGeminiChatSession() {
    if (!this.client) {
      this.updateError('Gemini client not initialized.');
      throw new Error('Gemini client not initialized.');
    }
    const model = 'gemini-1.5-flash-latest';

    try {
      this.updateStatus('Initializing AI session...');
      this.session = await this.client.chat.create({
        model: model,
        systemInstruction: { parts: [{ text: "You are a friendly and supportive companion. The user is currently cleaning their space. Your role is to keep them company with light, engaging conversation. You can ask how they're feeling, chat about interesting topics, or offer general encouragement. Avoid giving specific cleaning instructions. Just be a pleasant presence. Keep your responses concise, typically one or two sentences."}]},
      });
      this.updateStatus('AI session ready. Start speaking.');
    } catch (e: any) {
      console.error('Error initializing Gemini session:', e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      this.updateError(`AI session initialization error: ${errorMsg}`);
      this.session = null;
      throw e;
    }
  }

  private handleRecognitionResult(event: SpeechRecognitionEvent) {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    if (interimTranscript) {
        this.updateStatus(`Thinking: ${interimTranscript}`);
    }

    if (finalTranscript) {
      this.updateStatus(`You said: ${finalTranscript.trim()}`);
      console.log(`Final transcript: ${finalTranscript.trim()}`);
      this.sendTranscriptToGemini(finalTranscript.trim());
    }
  }

  private async sendTranscriptToGemini(text: string) {
    if (!this.session) {
      this.updateError("AI session not active. Cannot send message.");
      return;
    }
    if (!text) return;

    this.updateStatus("Sending to AI...");
    try {
      const result = await this.session.sendMessage(text);
      const response = await result.response;
      if (response && typeof response.text === 'function') {
        const aiText = response.text();
        console.log("AI Response (raw):", aiText);
        this.updateStatus(`AI: ${aiText.substring(0, 50)}...`);
        this.speak(aiText);
      } else {
        throw new Error("Invalid or unexpected response structure from AI.");
      }
    } catch (e: any) {
      console.error("Error sending/receiving message with AI:", e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      this.updateError(`AI Communication Error: ${errorMsg}`);
      if (!this.isListening) {
        this.updateStatus("Error with AI. Please try again.");
      }
    }
  }

  private speak(text: string) {
    if (!text.trim()) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.onstart = () => {
        this.updateStatus("AI Speaking...");
        console.log("TTS started for:", text);
      };
      utterance.onend = () => {
        if (!this.isListening) {
            this.updateStatus("AI finished. Press Start or speak.");
        } else {
            this.updateStatus("🎤 Listening...");
        }
        console.log("TTS ended for:", text);
      };
      utterance.onerror = (ttsErrorEvent) => {
        const errorType = (ttsErrorEvent as SpeechSynthesisErrorEvent).error || 'unknown';
        console.error("SpeechSynthesis Error:", errorType);
        this.updateError(`TTS Error: '${errorType}'. Could not speak AI response.`);
         if (!this.isListening) {
            this.updateStatus("TTS failed. Ready to try again.");
        }
      };

      window.speechSynthesis.speak(utterance);
    } else {
      this.updateError("Speech Synthesis API not supported by this browser.");
    }
  }

  private handleRecognitionError(event: SpeechRecognitionErrorEvent) {
    let errorMsg = `Speech Error: ${event.error}.`;
    switch (event.error) {
      case 'no-speech':
        errorMsg = "No speech was detected. Please try again.";
        break;
      case 'audio-capture':
        errorMsg = "Audio capture failed. Please check your microphone and system audio settings.";
        break;
      case 'not-allowed':
        errorMsg = "Microphone permission denied. Please enable microphone access in your browser settings for this site.";
        break;
      case 'network':
        errorMsg = "A network error occurred during speech recognition. Please check your internet connection.";
        break;
      case 'aborted':
        errorMsg = "Speech recognition was aborted. If this was unexpected, please try again.";
        break;
      case 'language-not-supported':
        errorMsg = "The configured language is not supported for speech recognition by your browser.";
        break;
      case 'service-not-allowed':
        errorMsg = "The speech recognition service is not allowed by your browser or operating system. Check security settings.";
        break;
      case 'bad-grammar':
        errorMsg = "There was an error with the speech recognition grammar configuration.";
        break;
      default:
        errorMsg = `An unexpected speech recognition error occurred: ${event.error}.`;
    }
    this.updateError(errorMsg);
    console.error("SpeechRecognition Error Details:", { errorType: event.error, message: event.message || "No additional message." });
    this.isListening = false;
  }

  private handleRecognitionEnd() {
    this.isListening = false;
    if (!this.error) {
        this.updateStatus("Listening stopped. Press Start.");
    }
    console.log("Speech recognition service ended.");
  }

  private updateStatus(msg: string) {
    this.status = msg;
    if (!msg.toLowerCase().includes("error")) {
        this.error = '';
    }
  }

  private updateError(msg: string) {
    this.error = msg;
    this.status = '';
    console.error("LiveAudio Error:", msg);
  }

  private handleResetClick() {
    this.stopListening();
    if (this.session) {
        this.session = null;
    }
    this.updateStatus('Session Reset. Ready to Start.');
    this.error = '';
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopListening();
    if (this.recognition) {
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.onstart = null;
        this.recognition.onaudiostart = null;
        this.recognition.onaudioend = null;
        this.recognition.onspeechstart = null;
        this.recognition.onspeechend = null;
        this.recognition = null;
    }
  }

  render() {
    if (!SpeechRecognition) {
      return html`<div id="status-error-container"><div id="error-text">Speech Recognition API not supported here.</div></div>`;
    }
    return html`
      <div id="status-error-container">
        ${this.error ? html`<div id="error-text">${this.error}</div>` : html`<div id="status-text">${this.status}</div>`}
      </div>
      <div class="controls">
        <button
          id="resetButton"
          @click=${this.handleResetClick}
          ?disabled=${this.isListening && false}
          title="Reset Session"
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
            <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
          </svg>
        </button>
        <button
          id="startButton"
          @click=${this.startListening}
          ?disabled=${this.isListening || !this.apiKey}
          title="Start Listening"
          style="display: ${this.isListening ? 'none' : 'flex'}"
        >
          <svg viewBox="0 0 100 100" width="24px" height="24px" fill="#c80000">
            <circle cx="50" cy="50" r="50" />
          </svg>
        </button>
        <button
          id="stopButton"
          @click=${this.stopListening}
          ?disabled=${!this.isListening}
          title="Stop Listening"
          style="display: ${this.isListening ? 'flex' : 'none'}"
        >
          <svg viewBox="0 0 100 100" width="24px" height="24px" fill="#000000">
            <rect x="0" y="0" width="100" height="100" rx="15" />
          </svg>
        </button>
      </div>
      <gdm-live-audio-visuals-3d
        .inputNode=${null}
        .outputNode=${null} /* OutputNode also set to null as its AudioContext is removed */
      ></gdm-live-audio-visuals-3d>
    `;
  }
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
