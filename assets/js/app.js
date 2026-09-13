/**
 * Comunica 10 - Coordinador Principal de la Aplicación
 */

const App = (() => {
  let activeRecorder = null;
  let prepTimerInterval = null;
  let recordingTimerInterval = null;
  let recordingSeconds = 0;

  // Helper para mostrar un toast de XP flotante
  const showXPToast = (xpAmount, message = '¡Misión completada!') => {
    let toast = document.getElementById('xp-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'xp-toast';
      toast.className = 'xp-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>+${xpAmount} XP</span> • ${message}`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  };

  // Helper para obtener parámetros URL
  const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  return {
    init() {
      // Registrar racha si es nuevo día
      if (window.Storage) {
        Storage.updateStreak();
      }
    },

    showXPToast,
    getQueryParam,

    // =========================================================================
    // CONTROLADOR: HOME / DASHBOARD
    // =========================================================================
    initDashboard() {
      const user = Storage.getUser();
      const rank = Gamification.getRank(user.xp);
      const recommendation = Gamification.getAdaptiveRecommendation(user);

      // Renderizar saludo y nivel
      const greetingEl = document.getElementById('user-greeting');
      if (greetingEl) greetingEl.textContent = `Buenos días, ${user.name} 👋`;

      const levelTitleEl = document.getElementById('user-level-title');
      if (levelTitleEl) levelTitleEl.textContent = `Nivel ${user.level}`;

      const levelProgressEl = document.getElementById('level-progress-bar');
      if (levelProgressEl) levelProgressEl.style.width = `${user.levelProgress}%`;

      const levelPercentEl = document.getElementById('level-percent-label');
      if (levelPercentEl) levelPercentEl.textContent = `${user.levelProgress}%`;

      const streakEl = document.getElementById('streak-count');
      if (streakEl) streakEl.textContent = `${user.streak} días`;

      const xpEl = document.getElementById('user-xp-badge');
      if (xpEl) xpEl.textContent = `${user.xp} XP (${rank.name})`;

      // Renderizar Misión del día
      const mission = AppData.getExercise(recommendation.exerciseId || 17);
      const missionTitleEl = document.getElementById('daily-mission-title');
      if (missionTitleEl) missionTitleEl.textContent = mission.prompt;

      const missionPrepEl = document.getElementById('daily-mission-prep');
      if (missionPrepEl) missionPrepEl.textContent = `${mission.preparationTime}s`;

      const missionTargetEl = document.getElementById('daily-mission-target');
      if (missionTargetEl) missionTargetEl.textContent = `${mission.targetTime}s`;

      const skillsContainer = document.getElementById('daily-mission-skills');
      if (skillsContainer) {
        skillsContainer.innerHTML = mission.skills
          .map(s => `<span class="badge badge-primary">${s}</span>`)
          .join('');
      }

      const startBtn = document.getElementById('btn-start-mission');
      if (startBtn) {
        startBtn.href = `mission.html?id=${mission.id}`;
      }

      // Renderizar Radar de Progreso
      const skillsListEl = document.getElementById('user-skills-summary');
      if (skillsListEl && user.skills) {
        skillsListEl.innerHTML = Object.entries(user.skills).map(([key, val]) => {
          const capName = key.charAt(0).toUpperCase() + key.slice(1);
          const percent = Math.min(100, Math.round((val / 10) * 100));
          return `
            <div class="skill-row">
              <div class="skill-row-header">
                <span class="skill-name">${capName}</span>
                <span class="skill-value">${val}/10</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: ${percent}%;"></div>
              </div>
            </div>
          `;
        }).join('');
      }

      // Botón Modo Sorpresa (Improvisación 60s)
      const surpriseBtn = document.getElementById('btn-surprise-mode');
      if (surpriseBtn) {
        surpriseBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const surpriseExercise = AppData.getRandomSurpriseExercise();
          window.location.href = `mission.html?id=${surpriseExercise.id}&surprise=1`;
        });
      }
    },

    // =========================================================================
    // CONTROLADOR: PANTALLA DE MISIÓN & GRABACIÓN
    // =========================================================================
    async initMissionView() {
      const exerciseId = Number(getQueryParam('id')) || 17;
      const attemptNumber = Number(getQueryParam('attempt')) || 1;
      const isSurprise = getQueryParam('surprise') === '1';
      const exercise = AppData.getExercise(exerciseId);

      // Renderizar datos del reto
      const missionNumberEl = document.getElementById('mission-number');
      if (missionNumberEl) {
        missionNumberEl.textContent = isSurprise ? '🎲 MODO SORPRESA' : `MISIÓN #${exercise.id}`;
        if (isSurprise) missionNumberEl.className = 'badge badge-warning';
      }

      const attemptBadgeEl = document.getElementById('attempt-badge');
      if (attemptBadgeEl) {
        attemptBadgeEl.textContent = `Intento ${attemptNumber}`;
        if (attemptNumber > 1) {
          attemptBadgeEl.classList.add('badge-warning');
        }
      }

      const promptEl = document.getElementById('mission-prompt');
      if (promptEl) promptEl.textContent = `"${exercise.prompt}"`;

      const coachingTipEl = document.getElementById('mission-tip');
      if (coachingTipEl && exercise.coachingTip) {
        coachingTipEl.textContent = `💡 Consejo de oro: ${exercise.coachingTip}`;
      }

      // Configurar Teleprónter Mental según la categoría
      const teleprompterCard = document.getElementById('teleprompter-card');
      const teleprompterBtn = document.getElementById('btn-toggle-teleprompter');
      const teleprompterClose = document.getElementById('btn-close-teleprompter');
      const teleprompterContent = document.getElementById('teleprompter-content');

      if (teleprompterContent) {
        if (exercise.skills && exercise.skills.includes('Estructura')) {
          teleprompterContent.innerHTML = `
            <div class="teleprompter-step"><strong>1. Punto:</strong> Tu tesis en 1 frase clara y concisa.</div>
            <div class="teleprompter-step"><strong>2. Razón:</strong> ¿Por qué es verdad? Justificación lógica.</div>
            <div class="teleprompter-step"><strong>3. Ejemplo:</strong> Anécdota personal o caso concreto.</div>
            <div class="teleprompter-step"><strong>4. Punto:</strong> Remate y llamada a la acción.</div>
          `;
        } else if (exercise.category === 'Storytelling' || exercise.level === 8) {
          teleprompterContent.innerHTML = `
            <div class="teleprompter-step"><strong>1. Contexto:</strong> ¿Quién, dónde y cuándo? (15s)</div>
            <div class="teleprompter-step"><strong>2. El giro:</strong> ¿Qué obstáculo o error surgió? (30s)</div>
            <div class="teleprompter-step"><strong>3. Transformación:</strong> ¿Qué aprendiste para siempre?</div>
          `;
        } else {
          teleprompterContent.innerHTML = `
            <div class="teleprompter-step"><strong>1. Aire:</strong> Inhala antes de pronunciar la primera palabra.</div>
            <div class="teleprompter-step"><strong>2. Mirada al lente:</strong> No mires tu rostro, mira la cámara.</div>
            <div class="teleprompter-step"><strong>3. El poder del silencio:</strong> Cierra labios 1s en lugar de "ehhh".</div>
          `;
        }
      }

      if (teleprompterBtn && teleprompterCard) {
        teleprompterBtn.addEventListener('click', () => {
          const isHidden = teleprompterCard.style.display === 'none';
          teleprompterCard.style.display = isHidden ? 'block' : 'none';
          teleprompterBtn.classList.toggle('active', isHidden);
        });
      }

      if (teleprompterClose && teleprompterCard) {
        teleprompterClose.addEventListener('click', () => {
          teleprompterCard.style.display = 'none';
          if (teleprompterBtn) teleprompterBtn.classList.remove('active');
        });
      }

      const videoElement = document.getElementById('camera-stream');
      const visualizerElement = document.getElementById('audio-visualizer');

      // Inicializar driver de cámara con transcripción en vivo
      activeRecorder = new CameraRecorder({
        videoElement,
        visualizerElement,
        onTranscriptUpdate: ({ fullText }) => {
          const pill = document.getElementById('live-speech-pill');
          const label = document.getElementById('live-speech-label');
          if (pill && label && fullText) {
            pill.style.display = 'inline-flex';
            const recentWords = fullText.split(/\s+/).slice(-4).join(' ');
            label.textContent = `🎙️ "...${recentWords}"`;
          }
        }
      });

      const camStatus = await activeRecorder.initCamera();

      if (!camStatus.success) {
        const warningBanner = document.getElementById('camera-warning');
        if (warningBanner) {
          warningBanner.style.display = 'block';
          warningBanner.textContent = 'Modo cámara simulada (permiso de cámara no concedido o no disponible). El ejercicio continuará guiado.';
        }
      }

      // Iniciar cuenta atrás de preparación (en modo sorpresa solo 5 segundos)
      let prepSecondsLeft = isSurprise ? 5 : (exercise.preparationTime || 15);
      const prepNumberEl = document.getElementById('prep-seconds');
      const prepOverlay = document.getElementById('prep-overlay');
      const hudRecording = document.getElementById('hud-recording');
      const targetTimeEl = document.getElementById('target-time-label');
      if (targetTimeEl) targetTimeEl.textContent = `Objetivo: ${exercise.targetTime}s`;

      const startRecordingFlow = () => {
        if (prepTimerInterval) clearInterval(prepTimerInterval);
        if (prepOverlay) prepOverlay.style.display = 'none';
        if (hudRecording) hudRecording.style.display = 'flex';

        activeRecorder.startRecording();
        recordingSeconds = 0;
        const timerCounterEl = document.getElementById('recording-timer-counter');

        recordingTimerInterval = setInterval(() => {
          recordingSeconds++;
          const mins = String(Math.floor(recordingSeconds / 60)).padStart(2, '0');
          const secs = String(recordingSeconds % 60).padStart(2, '0');
          if (timerCounterEl) timerCounterEl.textContent = `${mins}:${secs}`;
        }, 1000);
      };

      if (prepNumberEl) {
        prepNumberEl.textContent = prepSecondsLeft;
        prepTimerInterval = setInterval(() => {
          prepSecondsLeft--;
          prepNumberEl.textContent = prepSecondsLeft;
          if (prepSecondsLeft <= 0) {
            startRecordingFlow();
          }
        }, 1000);
      }

      // Botón para saltar la preparación e ir directo a grabar
      const skipPrepBtn = document.getElementById('btn-skip-prep');
      if (skipPrepBtn) {
        skipPrepBtn.addEventListener('click', () => {
          startRecordingFlow();
        });
      }

      // Botón para detener la grabación
      const stopBtn = document.getElementById('btn-stop-recording');
      if (stopBtn) {
        stopBtn.addEventListener('click', async () => {
          clearInterval(recordingTimerInterval);
          stopBtn.disabled = true;
          stopBtn.textContent = 'Analizando tu intervención con IA...';

          const { blob, url, transcript, audioMetrics } = await activeRecorder.stopRecording();
          activeRecorder.dispose();

          const duration = Math.max(1, recordingSeconds);

          // Ejecutar análisis pedagógico con datos reales de voz y audio
          const analysis = AIAnalyzer.analyzeSession(exercise, duration, attemptNumber, {
            transcript,
            audioMetrics
          });

          // Persistir la sesión en Storage
          const sessionSaved = Storage.saveSession({
            exerciseId: exercise.id,
            attemptNumber,
            duration,
            analysis,
            hasVideo: !!blob
          });

          // Guardar el video real en IndexedDB
          if (blob && window.VideoStorage) {
            try {
              await VideoStorage.saveVideo(sessionSaved.id, blob);
            } catch (e) {
              console.warn('[App] Error guardando video en IndexedDB:', e);
            }
          }

          // Otorgar XP
          const reward = Gamification.calculateReward({
            isFirstOfDay: attemptNumber === 1,
            streakActive: true
          });
          Storage.addXP(reward.totalXP, `Misión #${exercise.id} (Intento ${attemptNumber})`);

          // Redirigir a resultados
          window.location.href = `results.html?sessionId=${sessionSaved.id}&exerciseId=${exercise.id}&attempt=${attemptNumber}`;
        });
      }
    },

    // =========================================================================
    // CONTROLADOR: RESULTADOS & FEEDBACK
    // =========================================================================
    async initResultsView() {
      const sessionId = getQueryParam('sessionId');
      const exerciseId = Number(getQueryParam('exerciseId')) || 17;
      const attempt = Number(getQueryParam('attempt')) || 1;

      const sessions = Storage.getSessions();
      const currentSession = sessions.find(s => s.id === sessionId) || sessions[0];
      const exercise = AppData.getExercise(exerciseId);

      if (!currentSession) {
        window.location.href = 'index.html';
        return;
      }

      const analysis = currentSession.analysis || {};

      // Cargar video grabado desde IndexedDB si está disponible
      if (window.VideoStorage) {
        try {
          const videoData = await VideoStorage.getVideo(currentSession.id);
          const videoContainer = document.getElementById('result-video-container');
          const videoPlayer = document.getElementById('result-video-player');
          const downloadBtn = document.getElementById('btn-download-video');

          if (videoData && videoData.url && videoContainer && videoPlayer) {
            videoPlayer.src = videoData.url;
            videoContainer.style.display = 'block';
            if (downloadBtn) {
              downloadBtn.href = videoData.url;
              downloadBtn.download = `comunica10_mision_${exercise.id}_intento_${attempt}.webm`;
            }
          }
        } catch (e) {
          console.warn('[App] No se pudo cargar video grabado:', e);
        }
      }

      // Mostrar transcripción con muletillas resaltadas si está disponible
      const transcriptBox = document.getElementById('transcript-box');
      const transcriptHtml = document.getElementById('transcript-html');
      const transcriptWords = document.getElementById('transcript-words');
      const transcriptWpm = document.getElementById('transcript-wpm');

      if (transcriptBox && analysis.highlightedTranscript) {
        transcriptBox.style.display = 'block';
        if (transcriptHtml) transcriptHtml.innerHTML = analysis.highlightedTranscript;
        if (transcriptWords) transcriptWords.textContent = `${analysis.totalWords || 0} palabras`;
        if (transcriptWpm) transcriptWpm.textContent = `${analysis.wordsPerMinute} PPM`;
      }

      // Duración y Objetivo
      const durEl = document.getElementById('res-duration');
      if (durEl) {
        const mins = String(Math.floor(currentSession.duration / 60)).padStart(2, '0');
        const secs = String(currentSession.duration % 60).padStart(2, '0');
        durEl.textContent = `${mins}:${secs}`;
      }

      const objEl = document.getElementById('res-objective');
      if (objEl) {
        const target = analysis.targetDuration || 60;
        const mins = String(Math.floor(target / 60)).padStart(2, '0');
        const secs = String(target % 60).padStart(2, '0');
        objEl.textContent = `${mins}:${secs}`;
      }

      // Métricas
      const setMetric = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      setMetric('m-fluency', `${analysis.fluency}/10`);
      setMetric('m-clarity', `${analysis.clarity}/10`);
      setMetric('m-structure', `${analysis.structure}/10`);
      setMetric('m-naturalness', `${analysis.naturalness}/10`);
      setMetric('m-fillers', analysis.totalFillers !== undefined ? analysis.totalFillers : 0);
      setMetric('m-pauses', analysis.longPauses !== undefined ? analysis.longPauses : 0);
      setMetric('m-wpm', `${analysis.wordsPerMinute || 140} ppm`);

      // Fortalezas
      const strengthsList = document.getElementById('strengths-list');
      if (strengthsList && analysis.strengths) {
        strengthsList.innerHTML = analysis.strengths
          .map(s => `<li>✅ ${s}</li>`)
          .join('');
      }

      // Oportunidad
      const opportunityEl = document.getElementById('opportunity-text');
      if (opportunityEl && analysis.improvements && analysis.improvements.length > 0) {
        opportunityEl.textContent = analysis.improvements[0];
      }

      // Botón "Volver a intentar" (Intento 2)
      const retryBtn = document.getElementById('btn-retry-mission');
      if (retryBtn) {
        retryBtn.href = `mission.html?id=${exercise.id}&attempt=${attempt + 1}`;
      }

      // Botón "Ver Comparación de Intentos"
      const compBtn = document.getElementById('btn-view-comparison');
      if (compBtn) {
        if (attempt >= 2) {
          compBtn.style.display = 'inline-flex';
          compBtn.href = `comparison.html?exerciseId=${exercise.id}`;
        } else {
          compBtn.style.display = 'none';
        }
      }
    },

    // =========================================================================
    // CONTROLADOR: COMPARACIÓN DE INTENTOS
    // =========================================================================
    async initComparisonView() {
      const exerciseId = Number(getQueryParam('exerciseId')) || 17;
      const comparison = Storage.getAttemptComparison(exerciseId);

      if (!comparison || !comparison.attempt1 || !comparison.attempt2) {
        const alertEl = document.getElementById('no-comparison-alert');
        if (alertEl) alertEl.style.display = 'block';
        return;
      }

      // Cargar videos de ambos intentos desde IndexedDB si existen
      if (window.VideoStorage) {
        try {
          const v1 = await VideoStorage.getVideo(comparison.attempt1.id);
          const v2 = await VideoStorage.getVideo(comparison.attempt2.id);

          const player1 = document.getElementById('comp-video-1');
          const player2 = document.getElementById('comp-video-2');
          const videosContainer = document.getElementById('comparison-videos-container');

          if (videosContainer && (v1 || v2)) {
            videosContainer.style.display = 'block';
            if (v1 && v1.url && player1) player1.src = v1.url;
            if (v2 && v2.url && player2) player2.src = v2.url;
          }
        } catch (e) {
          console.warn('[App] Error cargando videos de comparación:', e);
        }
      }

      const compData = AIAnalyzer.compareAttempts(comparison.attempt1, comparison.attempt2);

      const percentEl = document.getElementById('comparison-improvement-percent');
      if (percentEl) {
        percentEl.textContent = `¡Mejoraste un ${compData.percentImprovement}% en esta misión! 🎉`;
      }

      const fillRow = (rowId, metricKey) => {
        const row = document.getElementById(rowId);
        if (!row) return;
        const data = compData[metricKey];
        row.querySelector('.val-a1').textContent = data.prev;
        row.querySelector('.val-a2').textContent = data.curr;
        const diffEl = row.querySelector('.val-diff');
        
        if (metricKey === 'fillers') {
          diffEl.textContent = `${data.diff > 0 ? '+' : ''}${data.diff}`;
          diffEl.className = data.diff <= 0 ? 'val-diff diff-positive' : 'val-diff diff-negative';
        } else {
          diffEl.textContent = `${data.diff > 0 ? '+' : ''}${data.diff}`;
          diffEl.className = data.diff >= 0 ? 'val-diff diff-positive' : 'val-diff diff-negative';
        }
      };

      fillRow('row-fluency', 'fluency');
      fillRow('row-clarity', 'clarity');
      fillRow('row-structure', 'structure');
      fillRow('row-fillers', 'fillers');
    },

    // =========================================================================
    // CONTROLADOR: ENTRENAMIENTO (TRAIN) & NIVELES
    // =========================================================================
    initTrainView() {
      const levels = AppData.getLevels();
      const user = Storage.getUser();

      const levelsContainer = document.getElementById('levels-list');
      if (!levelsContainer) return;

      levelsContainer.innerHTML = levels.map(lvl => {
        const isUnlocked = lvl.id <= user.level;
        const exercises = AppData.getExercises(lvl.id);
        
        return `
          <div class="card ${isUnlocked ? 'card-clickable' : 'card-locked shimmer-bg'}" style="margin-bottom: 14px; opacity: ${isUnlocked ? '1' : '0.6'};">
            <div class="flex justify-between items-center" style="margin-bottom: 8px;">
              <div>
                <span class="badge ${isUnlocked ? 'badge-primary' : ''}">${lvl.badge}</span>
                <h3 style="margin-top: 6px;">${lvl.name}: ${lvl.title}</h3>
                <p class="text-sm text-muted">${lvl.tagline}</p>
              </div>
              <div>
                ${isUnlocked ? '<span style="font-size: 1.4rem;">🔓</span>' : '<span style="font-size: 1.4rem;">🔒</span>'}
              </div>
            </div>

            <p class="text-sm" style="margin: 8px 0;">${lvl.objective}</p>
            
            <div class="flex justify-between items-center" style="margin-top: 12px; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
              <span class="text-xs text-muted">Duración: ${lvl.targetDuration}</span>
              ${isUnlocked && exercises.length > 0 ? 
                `<a href="mission.html?id=${exercises[0].id}" class="btn btn-secondary btn-sm" style="padding: 6px 14px; min-height: 36px; font-size: 0.8rem;">Entrenar (${exercises.length})</a>` : 
                `<span class="text-xs text-muted">Desbloquea completando nivel anterior</span>`
              }
            </div>
          </div>
        `;
      }).join('');
    },

    // =========================================================================
    // CONTROLADOR: PROGRESO & MULETILLAS
    // =========================================================================
    initProgressView() {
      const user = Storage.getUser();

      // Renderizar muletillas semanales
      const ehCount = document.getElementById('filler-eh');
      if (ehCount) ehCount.textContent = user.fillersWeekly?.eh || 37;

      const esteCount = document.getElementById('filler-este');
      if (esteCount) esteCount.textContent = user.fillersWeekly?.este || 22;

      const oSeaCount = document.getElementById('filler-osea');
      if (oSeaCount) oSeaCount.textContent = user.fillersWeekly?.oSea || 18;

      const entoncesCount = document.getElementById('filler-entonces');
      if (entoncesCount) entoncesCount.textContent = user.fillersWeekly?.entonces || 15;

      const prevRate = user.previousWeeklyFillersPerMin || 14;
      const currRate = user.weeklyFillersPerMin || 8;
      const reduction = Math.round(((prevRate - currRate) / prevRate) * 100);

      const reductionEl = document.getElementById('filler-reduction-label');
      if (reductionEl) reductionEl.textContent = `↓ ${reduction}%`;

      const prevRateEl = document.getElementById('prev-filler-rate');
      if (prevRateEl) prevRateEl.textContent = `${prevRate}/min`;

      const currRateEl = document.getElementById('curr-filler-rate');
      if (currRateEl) currRateEl.textContent = `${currRate}/min`;
    },

    // =========================================================================
    // CONTROLADOR: PERFIL
    // =========================================================================
    initProfileView() {
      const user = Storage.getUser();
      const rank = Gamification.getRank(user.xp);

      const nameEl = document.getElementById('prof-name');
      if (nameEl) nameEl.textContent = user.name;

      const levelEl = document.getElementById('prof-level');
      if (levelEl) levelEl.textContent = `Nivel ${user.level}`;

      const rankEl = document.getElementById('prof-rank');
      if (rankEl) rankEl.textContent = `${rank.badge} ${rank.name}`;

      const xpEl = document.getElementById('prof-xp');
      if (xpEl) xpEl.textContent = `${user.xp} XP`;

      const stats = user.stats || {};
      const setStat = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      setStat('stat-exercises', stats.exercisesCompleted || 0);
      setStat('stat-minutes', `${stats.minutesSpoken || 0} min`);
      setStat('stat-streak', `${user.streak || 0} días`);
      setStat('stat-words', stats.wordsSpoken || 0);
      setStat('stat-fillers-reduced', `${stats.fillersReduced || 0}%`);

      // Botón para cambiar nombre
      const editNameBtn = document.getElementById('btn-edit-name');
      if (editNameBtn) {
        editNameBtn.addEventListener('click', () => {
          const currentName = user.name || 'Tú';
          const newName = prompt('¿Cómo te llamas o cómo quieres que te llame la app?', currentName);
          if (newName && newName.trim()) {
            const trimmed = newName.trim();
            Storage.updateUser({ name: trimmed });
            if (nameEl) nameEl.textContent = trimmed;
            App.showXPToast(0, `Nombre actualizado a ${trimmed}`);
          }
        });
      }

      // Botón comenzar de cero (Nivel 0 real)
      const cleanBtn = document.getElementById('btn-start-clean');
      if (cleanBtn) {
        cleanBtn.addEventListener('click', () => {
          const yourName = prompt('¿Cuál es tu nombre para iniciar tu entrenamiento real?', user.name !== 'Carlos' ? user.name : '') || 'Tú';
          Storage.resetToClean(yourName);
          alert(`¡Listo, ${yourName}! Tu perfil se ha iniciado en Nivel 0 con 0 XP.`);
          window.location.reload();
        });
      }

      // Botón cargar demo (Carlos)
      const demoBtn = document.getElementById('btn-load-demo');
      if (demoBtn) {
        demoBtn.addEventListener('click', () => {
          Storage.loadDemoData();
          alert('Se han cargado los datos de demostración de Carlos (Nivel 2).');
          window.location.reload();
        });
      }

      // Botón de borrado general
      const resetBtn = document.getElementById('btn-reset-data');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (confirm('¿Deseas borrar completamente tus datos locales y videos grabados?')) {
            Storage.resetAll();
            window.location.reload();
          }
        });
      }
    }
  };
})();

if (typeof window !== 'undefined') {
  window.App = App;
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
}
