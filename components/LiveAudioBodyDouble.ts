/* tslint:disable */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Session } from '@google/genai'; // Removed LiveServerMessage, Modality
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
// Removed createBlob, decode, decodeAudioData as they are not used for STT/TTS directly here yet
// import { createBlob, decode, decodeAudioData } from './utils';
import './visual-3d';

// Attempt to get the SpeechRecognition object, handling vendor prefixes
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
// const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList; // If needed later
// const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent; // If needed later


@customElement('gdm-live-audio-body-double')
export class GdmLiveAudioBodyDouble extends LitElement {
  @property({ type: String, attribute: 'api-key' }) apiKey = '';

  @state() isListening = false; // Changed from isRecording
  @state() status = 'Inactive. Press Start.'; // Initial status
  @state() error = '';

  private client: GoogleGenAI | null = null;
  private session: Session | null = null; // Gemini chat session
  private recognition: SpeechRecognition | null = null;

  // Audio contexts and nodes for visualization - can remain if visualizer is to be used
  private outputAudioContext: AudioContext | null = null;
  @state() private outputNode: GainNode | null = null;
  // Input visualization might be tricky if not directly processing mic stream. For now, removing input related audio nodes.
  // private inputAudioContext: AudioContext | null = null;
  // @state() private inputNode: GainNode | null = null;


  private nextStartTime = 0; // For TTS playback scheduling
  private sources = new Set<AudioBufferSourceNode>(); // For managing output audio sources (TTS)

  static styles = css`
    :host {
      display: block;
      /* Added some basic styling for visibility */
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
      this.recognition.continuous = false; // Process after user pauses
      this.recognition.interimResults = true; // Show interim results for better UX
      this.recognition.lang = 'en-US'; // Default language

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
    // Initialization that depends on DOM or attributes being set.
    // API key dependent init is in `updated`.
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('apiKey')) {
      if (this.isListening) {
        this.stopListening(); // Stop current listening session if API key changes
      }
      this.client = null;
      this.session = null; // Reset session too

      // Clear any pending audio output (TTS related, can be kept for now)
      this.sources.forEach(source => { try { source.stop(); } catch(e){ /* ignore */ } });
      this.sources.clear();
      if (this.outputAudioContext) {
          this.nextStartTime = this.outputAudioContext.currentTime;
      } else {
          this.nextStartTime = 0;
      }

      if (this.apiKey) {
        this.initGeminiClient();
        // Output audio context for TTS (can be initialized here or on first use)
        if (!this.outputAudioContext || this.outputAudioContext.state === 'closed') {
            this.outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 }); // Standard sample rate for TTS
            this.outputNode = this.outputAudioContext.createGain();
            this.outputNode.connect(this.outputAudioContext.destination);
            this.initAudioPlaybackState(); // For TTS
        }
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
  
  private initAudioPlaybackState() { // For TTS
    if(this.outputAudioContext){
      this.nextStartTime = this.outputAudioContext.currentTime;
    }
  }

  // Renamed from activateSession to reflect new role
  public async startListening() {
    this.error = '';
    if (!this.apiKey) {
        this.updateError("API Key is not set. Cannot start listening.");
        return;
    }
    if (!this.client) {
        this.updateError("Gemini client not initialized.");
        if (this.apiKey) this.initGeminiClient(); // Attempt re-init
        if (!this.client) return; // If still no client, exit
    }
    if (!this.recognition) {
        this.updateError("Speech Recognition not available.");
        return;
    }

    if (this.isListening) {
      this.updateStatus("Already listening.");
      return;
    }

    // Initialize Gemini Chat Session if it doesn't exist or needs reset
    if (!this.session) {
      try {
        await this.initGeminiChatSession();
      } catch (e) {
        // Error already handled in initGeminiChatSession
        return;
      }
    }

    if (this.session) {
      try {
        this.recognition.start();
        this.isListening = true;
        // Status will be updated by recognition.onstart
      } catch (e: any) {
        this.updateError(`Error starting speech recognition: ${e.message}`);
        console.error("Error starting SpeechRecognition:", e);
        this.isListening = false;
      }
    } else {
         this.updateError("Failed to initialize AI session. Cannot start listening.");
    }
  }

  // Renamed from deactivateSession
  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop(); // This will trigger onend event where isListening is set to false
      // Status update will happen in onend or onerror
    }
    // Session is not closed here, could be reused. Or close it if desired.
    // For now, let's keep the session open for subsequent interactions until reset.
  }

  private async initGeminiChatSession() {
    if (!this.client) {
      this.updateError('Gemini client not initialized.');
      throw new Error('Gemini client not initialized.');
    }
    const model = 'gemini-1.5-flash-latest'; // Using a common model, ensure it's chat-compatible

    try {
      this.updateStatus('Initializing AI session...');
      this.session = await this.client.chat.create({
        model: model,
        systemInstruction: { parts: [{ text: "You are a friendly and supportive companion. The user is currently cleaning their space. Your role is to keep them company with light, engaging conversation. You can ask how they're feeling, chat about interesting topics, or offer general encouragement. Avoid giving specific cleaning instructions. Just be a pleasant presence. Keep your responses concise, typically one or two sentences."}]},
      });
      this.updateStatus('AI session ready. Start speaking.');
    } catch (e: any) {
      console.error('Error initializing Gemini session:', e);
      this.updateError(`AI session error: ${e.message}`);
      this.session = null;
      throw e; // Re-throw to be caught by caller if needed
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

    // Update UI with interim results for responsiveness
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
      // Optionally try to re-initialize session here
      // await this.initGeminiChatSession();
      // if (!this.session) return;
      return;
    }
    if (!text) return;

    this.updateStatus("Sending to AI...");
    try {
      // const response = await this.session.sendMessageStream(text); // For streaming
      // For now, let's use non-streaming sendMessage
      const result = await this.session.sendMessage(text);
      const response = await result.response;
      const aiText = response.text();

      console.log("AI Response (raw):", aiText);
      this.updateStatus(`AI: ${aiText.substring(0, 50)}...`); // Display snippet

      this.speak(aiText); // Call TTS method

    } catch (e: any) {
      console.error("Error sending message to Gemini or processing response:", e);
      this.updateError(`AI Error: ${e.message}`);
    }
  }

  private speak(text: string) {
    if (!text.trim()) return;

    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech to prevent overlap for this basic implementation.
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Optional: Configure voice, lang, rate, pitch if needed.
      // For example, to try and match a language if specified or find a preferred voice.
      // utterance.lang = "en-US"; // Can be dynamic
      // const voices = window.speechSynthesis.getVoices();
      // const desiredVoice = voices.find(voice => voice.name === "Google US English"); // Example
      // if (desiredVoice) {
      //   utterance.voice = desiredVoice;
      // }

      utterance.onstart = () => {
        this.updateStatus("AI Speaking...");
        console.log("TTS started for:", text);
      };
      utterance.onend = () => {
        // Revert status to something neutral or indicate ready for next input
        if (!this.isListening) { // Only update if not actively listening for new input
            this.updateStatus("AI finished. Press Start or speak.");
        } else {
            this.updateStatus("🎤 Listening..."); // If continuous listening was a thing, or just "Ready"
        }
        console.log("TTS ended for:", text);
      };
      utterance.onerror = (event) => {
        console.error("SpeechSynthesis Error:", event.error);
        this.updateError(`TTS Error: ${event.error}`);
        // Potentially revert status if TTS fails
         if (!this.isListening) {
            this.updateStatus("TTS failed. Press Start or speak.");
        }
      };

      window.speechSynthesis.speak(utterance);
    } else {
      this.updateError("Speech Synthesis API not supported by this browser.");
      console.warn("Speech Synthesis not supported. Cannot speak AI response.");
    }
  }

  private handleRecognitionError(event: SpeechRecognitionErrorEvent) {
    this.updateError(`Speech Error: ${event.error}`);
    console.error("SpeechRecognition Error:", event.error, event.message);
    this.isListening = false; // Ensure state is updated
    // Potentially add more specific error handling based on event.error type
    // e.g. 'not-allowed', 'no-speech', 'network'
  }

  private handleRecognitionEnd() {
    this.isListening = false;
    // Don't show "stopped" if an error occurred, as error message is more specific
    if (!this.error) {
        this.updateStatus("Listening stopped. Press Start.");
    }
    console.log("Speech recognition service ended.");
  }

  private updateStatus(msg: string) {
    this.status = msg;
    // Clear error when status updates, unless it's an error status itself
    if (!msg.toLowerCase().includes("error")) {
        this.error = '';
    }
  }

  private updateError(msg: string) {
    this.error = msg;
    this.status = ''; // Clear status when error occurs
    console.error("LiveAudio Error:", msg);
  }

  // Removed old startRecording, stopRecording, processMessage methods

  private handleResetClick() {
    this.stopListening();
    if (this.session) {
        // Decide if session.close() is needed or if a new session is created on next start
        // For now, let's nullify it to force re-creation with potentially fresh history.
        this.session = null;
    }
    this.updateStatus('Session Reset. Ready to Start.');
    this.error = '';
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopListening();
    if (this.recognition) {
        // Clean up event listeners to prevent memory leaks if element is re-added
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.onstart = null;
        // ... and other event listeners
        this.recognition = null; // Release the object
    }
    // Close audio contexts if they exist and are open
    // if(this.inputAudioContext && this.inputAudioContext.state !== 'closed') {
    //   this.inputAudioContext.close().catch(e => console.error("Error closing input audio context:", e));
    //   this.inputAudioContext = null;
    // }
    if(this.outputAudioContext && this.outputAudioContext.state !== 'closed') {
      this.outputAudioContext.close().catch(e => console.error("Error closing output audio context:", e));
      this.outputAudioContext = null;
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
        .inputNode=${null} /* Input node from mic stream is no longer directly available this way */
        .outputNode=${this.outputNode}
      ></gdm-live-audio-visuals-3d>
    `;
  }
}

// Update global interface for SpeechRecognition types if not already present from a lib
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
    // SpeechGrammarList: typeof SpeechGrammarList;
    // webkitSpeechGrammarList: typeof SpeechGrammarList;
    // SpeechRecognitionEvent: typeof SpeechRecognitionEvent;
    // webkitSpeechRecognitionEvent: typeof SpeechRecognitionEvent;
  }
  // Fallback for createScriptProcessor was here, removed as no longer needed.
}

