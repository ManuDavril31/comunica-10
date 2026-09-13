/**
 * Comunica 10 - Driver de Grabación, Cámara y Transcripción (Web APIs)
 * Administra navigator.mediaDevices.getUserMedia, MediaRecorder, AudioContext
 * y reconocimiento de voz nativo en tiempo real con Web Speech API.
 */

/**
 * Transcriptor de voz en vivo usando Web Speech API nativa.
 */
class SpeechTranscriber {
  constructor(options = {}) {
    this.lang = options.lang || 'es-ES';
    this.recognition = null;
    this.isListening = false;
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.onUpdate = options.onUpdate || null;
    this.isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    this.init();
  }

  init() {
    if (!this.isSupported) {
      console.warn('[SpeechTranscriber] Web Speech API no soportada en este navegador.');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.lang;

      this.recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            this.finalTranscript += (this.finalTranscript ? ' ' : '') + res[0].transcript.trim();
          } else {
            interim += res[0].transcript;
          }
        }
        this.interimTranscript = interim;

        if (this.onUpdate) {
          this.onUpdate({
            finalText: this.finalTranscript,
            interimText: this.interimTranscript,
            fullText: `${this.finalTranscript} ${this.interimTranscript}`.trim()
          });
        }
      };

      this.recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
          console.warn('[SpeechTranscriber] Error en reconocimiento de voz:', event.error);
        }
      };

      this.recognition.onend = () => {
        // Si sigue grabando, reiniciar automáticamente
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            // Ignorar si ya está arrancando
          }
        }
      };
    } catch (e) {
      console.error('[SpeechTranscriber] No se pudo inicializar SpeechRecognition:', e);
      this.isSupported = false;
    }
  }

  start() {
    this.finalTranscript = '';
    this.interimTranscript = '';
    if (!this.isSupported || !this.recognition) return false;

    try {
      this.isListening = true;
      this.recognition.start();
      return true;
    } catch (e) {
      console.warn('[SpeechTranscriber] Excepción al iniciar escucha:', e);
      return false;
    }
  }

  stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    const full = `${this.finalTranscript} ${this.interimTranscript}`.trim();
    return full;
  }
}

/**
 * Administrador de Cámara, Grabación y Telemetría de Audio
 */
class CameraRecorder {
  constructor(options = {}) {
    this.videoElement = options.videoElement || null;
    this.visualizerElement = options.visualizerElement || null;
    this.onTranscriptUpdate = options.onTranscriptUpdate || null;

    this.stream = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.audioContext = null;
    this.analyser = null;
    this.animFrameId = null;
    this.isRecording = false;
    this.recordedBlob = null;
    this.videoUrl = null;

    // Transcriptor
    this.transcriber = new SpeechTranscriber({
      onUpdate: this.onTranscriptUpdate
    });

    // Telemetría de silencios y pausas conscientes
    this.pauseTracking = {
      isVoiceActive: false,
      silentSince: null,
      voiceSpokenCount: 0,
      pauses: [], // { duration, type: 'good' | 'long' }
      totalSilenceTime: 0
    };
  }

  // Inicializa cámara y micrófono
  async initCamera() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador no compatible con captura de cámara.');
      }

      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 720 },
          height: { ideal: 1280 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        this.videoElement.muted = true; // Evitar feedback
        await this.videoElement.play();
      }

      this.initAudioVisualizer();
      return {
        success: true,
        mode: 'video',
        hasSpeechRecognition: this.transcriber.isSupported
      };
    } catch (err) {
      console.warn('[CameraRecorder] No se pudo acceder a la cámara o permisos denegados:', err);
      return {
        success: false,
        error: err.message,
        hasSpeechRecognition: this.transcriber.isSupported
      };
    }
  }

  // Visualizador y detector de silencios en vivo
  initAudioVisualizer() {
    try {
      if (!this.stream) return;
      const audioTrack = this.stream.getAudioTracks()[0];
      if (!audioTrack) return;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.4;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateBars = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Detector de silencio/pausa si está en proceso de grabación
        if (this.isRecording) {
          const now = Date.now();
          const SILENCE_THRESHOLD = 11; // Nivel de ruido ambiente

          if (average > SILENCE_THRESHOLD) {
            // Usuario está hablando
            if (this.pauseTracking.silentSince) {
              const pauseDuration = (now - this.pauseTracking.silentSince) / 1000;
              // Si la pausa duró más de 0.9 segundos y ya había hablado antes
              if (pauseDuration >= 0.9 && this.pauseTracking.voiceSpokenCount > 5) {
                const type = pauseDuration >= 2.2 ? 'long' : 'good';
                this.pauseTracking.pauses.push({
                  duration: +pauseDuration.toFixed(1),
                  type
                });
                this.pauseTracking.totalSilenceTime += pauseDuration;
              }
              this.pauseTracking.silentSince = null;
            }
            this.pauseTracking.isVoiceActive = true;
            this.pauseTracking.voiceSpokenCount++;
          } else {
            // Silencio
            if (!this.pauseTracking.silentSince && this.pauseTracking.isVoiceActive) {
              this.pauseTracking.silentSince = now;
            }
          }
        }

        // Animar barras visuales
        if (this.visualizerElement) {
          const bars = this.visualizerElement.querySelectorAll('.audio-bar');
          bars.forEach((bar, index) => {
            const val = dataArray[index % bufferLength] || average;
            const height = Math.max(4, Math.min(28, (val / 255) * 28));
            bar.style.height = `${height}px`;
          });
        }

        this.animFrameId = requestAnimationFrame(updateBars);
      };

      updateBars();
    } catch (e) {
      console.warn('[CameraRecorder] No se pudo iniciar el visualizador de audio:', e);
    }
  }

  // Comienza la grabación y el transcriptor
  startRecording() {
    this.recordedChunks = [];
    this.recordedBlob = null;
    this.videoUrl = null;
    this.pauseTracking = {
      isVoiceActive: false,
      silentSince: null,
      voiceSpokenCount: 0,
      pauses: [],
      totalSilenceTime: 0
    };

    // Iniciar transcriptor de voz
    this.transcriber.start();

    if (!this.stream) {
      this.isRecording = true;
      console.log('[CameraRecorder] Grabando en modo simulado.');
      return true;
    }

    try {
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/mp4';
          }
        }
      }

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250);
      this.isRecording = true;
      return true;
    } catch (e) {
      console.error('[CameraRecorder] Error iniciando MediaRecorder:', e);
      this.isRecording = true;
      return false;
    }
  }

  // Detiene la grabación y devuelve Blob, URL, transcripción y telemetría de pausas
  async stopRecording() {
    this.isRecording = false;
    const finalTranscript = this.transcriber.stop();

    const longPauses = this.pauseTracking.pauses.filter(p => p.type === 'long').length;
    const goodPauses = this.pauseTracking.pauses.filter(p => p.type === 'good').length;

    const audioMetrics = {
      pauses: this.pauseTracking.pauses,
      longPausesCount: longPauses,
      goodPausesCount: goodPauses,
      totalSilenceSeconds: +this.pauseTracking.totalSilenceTime.toFixed(1)
    };

    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve({
          blob: null,
          url: null,
          transcript: finalTranscript,
          audioMetrics
        });
        return;
      }

      this.mediaRecorder.onstop = () => {
        const type = this.mediaRecorder.mimeType || 'video/webm';
        this.recordedBlob = new Blob(this.recordedChunks, { type });
        this.videoUrl = URL.createObjectURL(this.recordedBlob);

        resolve({
          blob: this.recordedBlob,
          url: this.videoUrl,
          transcript: finalTranscript,
          audioMetrics
        });
      };

      this.mediaRecorder.stop();
    });
  }

  // Libera la cámara y los recursos de audio
  dispose() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.transcriber.stop();
  }
}

if (typeof window !== 'undefined') {
  window.CameraRecorder = CameraRecorder;
  window.SpeechTranscriber = SpeechTranscriber;
}
