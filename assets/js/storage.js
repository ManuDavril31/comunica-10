/**
 * Comunica 10 - Capa de Persistencia Abstracta (Storage Service)
 * Desacopla la lógica de negocio del almacenamiento subyacente (LocalStorage inicial,
 * permitiendo conectarlo a una API / base de datos en el futuro sin modificar el resto de la app).
 */

const Storage = (() => {
  const KEYS = {
    USER: 'comunica10_user',
    PROGRESS: 'comunica10_progress',
    SESSIONS: 'comunica10_sessions',
    SETTINGS: 'comunica10_settings'
  };

  // Perfil inicial limpio para nuevos usuarios (Nivel 0, sin datos ficticios)
  const CLEAN_USER = {
    name: 'Tú',
    goal: 'hablar-camara',
    level: 0,
    levelProgress: 0,
    xp: 0,
    streak: 0,
    lastPracticeDate: null,
    streakDates: [],
    skills: {
      fluidez: 5.0,
      claridad: 5.0,
      estructura: 5.0,
      naturalidad: 5.0,
      muletillas: 5.0,
      improvisacion: 5.0,
      presencia: 5.0,
      storytelling: 5.0,
      persuasion: 5.0
    },
    fillersWeekly: {
      eh: 0,
      este: 0,
      oSea: 0,
      entonces: 0
    },
    weeklyFillersPerMin: 0,
    previousWeeklyFillersPerMin: 0,
    stats: {
      exercisesCompleted: 0,
      minutesSpoken: 0,
      wordsSpoken: 0,
      fillersReduced: 0
    }
  };

  // Datos de demostración (Carlos)
  const DEMO_USER = {
    name: 'Carlos',
    goal: 'hablar-camara',
    level: 2,
    levelProgress: 62,
    xp: 2680,
    streak: 7,
    lastPracticeDate: new Date().toISOString().split('T')[0],
    streakDates: [],
    skills: {
      fluidez: 6.4,
      claridad: 7.1,
      estructura: 5.8,
      naturalidad: 7.4,
      muletillas: 5.2,
      improvisacion: 4.9,
      presencia: 6.1,
      storytelling: 3.2,
      persuasion: 4.5
    },
    fillersWeekly: {
      eh: 37,
      este: 22,
      oSea: 18,
      entonces: 15
    },
    weeklyFillersPerMin: 8,
    previousWeeklyFillersPerMin: 14,
    stats: {
      exercisesCompleted: 23,
      minutesSpoken: 38,
      wordsSpoken: 5420,
      fillersReduced: 43
    }
  };

  const DEFAULT_USER = CLEAN_USER;

  // Helper seguro para JSON
  const getJson = (key, fallback) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn(`[Storage] Error al leer ${key}:`, e);
      return fallback;
    }
  };

  const setJson = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[Storage] Error al escribir ${key}:`, e);
      return false;
    }
  };

  return {
    // --- USUARIO Y PERFIL ---
    getUser() {
      return getJson(KEYS.USER, DEFAULT_USER);
    },

    saveUser(user) {
      return setJson(KEYS.USER, user);
    },

    updateUser(patch) {
      const current = this.getUser();
      const updated = { ...current, ...patch };
      this.saveUser(updated);
      return updated;
    },

    // --- SESIONES Y GRABACIONES ---
    getSessions() {
      return getJson(KEYS.SESSIONS, []);
    },

    saveSession(sessionData) {
      const sessions = this.getSessions();
      const sessionWithId = {
        id: 'sess_' + Date.now(),
        timestamp: new Date().toISOString(),
        ...sessionData
      };
      sessions.unshift(sessionWithId);
      setJson(KEYS.SESSIONS, sessions);
      return sessionWithId;
    },

    // Obtener los últimos 2 intentos de un ejercicio para comparación
    getAttemptComparison(exerciseId) {
      const sessions = this.getSessions().filter(s => s.exerciseId === Number(exerciseId));
      if (sessions.length === 0) return null;
      if (sessions.length === 1) {
        return { attempt1: sessions[0], attempt2: null };
      }
      // attempt2 es el más reciente (índice 0), attempt1 es el previo (índice 1)
      return {
        attempt1: sessions[1],
        attempt2: sessions[0]
      };
    },

    // --- GAMIFICACIÓN: XP Y RACHAS ---
    addXP(amount, reason = '') {
      const user = this.getUser();
      const newXP = (user.xp || 0) + amount;
      user.xp = newXP;
      
      // Actualizar progreso de nivel según ejercicios
      user.stats.exercisesCompleted = (user.stats.exercisesCompleted || 0) + 1;
      
      this.saveUser(user);
      return { newXP, added: amount, reason };
    },

    updateStreak() {
      const user = this.getUser();
      const today = new Date().toISOString().split('T')[0];
      
      if (!user.streakDates) user.streakDates = [];

      if (!user.streakDates.includes(today)) {
        user.streakDates.push(today);
        
        // Comprobar si ayer practicó
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (user.lastPracticeDate === yesterday) {
          user.streak = (user.streak || 0) + 1;
        } else if (user.lastPracticeDate !== today) {
          // Si pasó más de un día sin practicar
          user.streak = 1;
        }
        user.lastPracticeDate = today;
        this.saveUser(user);
      }
      return user.streak;
    },

    // --- REINICIAR / EXPORTAR ---
    resetAll() {
      localStorage.removeItem(KEYS.USER);
      localStorage.removeItem(KEYS.PROGRESS);
      localStorage.removeItem(KEYS.SESSIONS);
      if (window.VideoStorage) {
        window.VideoStorage.clearAllVideos();
      }
      return true;
    },

    resetToClean(userName = 'Tú') {
      this.resetAll();
      const clean = {
        ...CLEAN_USER,
        name: userName || 'Tú'
      };
      setJson(KEYS.USER, clean);
      return clean;
    },

    loadDemoData() {
      this.resetAll();
      setJson(KEYS.USER, DEMO_USER);
      return DEMO_USER;
    },

    exportData() {
      return {
        user: this.getUser(),
        sessions: this.getSessions()
      };
    }
  };
})();

/**
 * Gestor de Almacenamiento Local de Videos en IndexedDB
 * Permite guardar Blobs de video completos de los intentos sin desbordar LocalStorage.
 */
const VideoStorage = (() => {
  const DB_NAME = 'comunica10_media_db';
  const DB_VERSION = 1;
  const STORE_NAME = 'recordings';

  let dbPromise = null;

  const getDb = () => {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        console.warn('[VideoStorage] IndexedDB no soportado en este navegador.');
        resolve(null);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.error('[VideoStorage] Error abriendo IndexedDB:', request.error);
        resolve(null);
      };
    });

    return dbPromise;
  };

  return {
    async saveVideo(sessionId, blob) {
      if (!blob) return false;
      const db = await getDb();
      if (!db) return false;

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.put({ id: sessionId, blob: blob, timestamp: Date.now() });

          tx.oncomplete = () => resolve(true);
          tx.onerror = () => {
            console.error('[VideoStorage] Error al guardar video:', tx.error);
            resolve(false);
          };
        } catch (e) {
          console.error('[VideoStorage] Excepción al guardar video:', e);
          resolve(false);
        }
      });
    },

    async getVideo(sessionId) {
      if (!sessionId) return null;
      const db = await getDb();
      if (!db) return null;

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(sessionId);

          req.onsuccess = () => {
            if (req.result && req.result.blob) {
              const url = URL.createObjectURL(req.result.blob);
              resolve({ blob: req.result.blob, url });
            } else {
              resolve(null);
            }
          };

          req.onerror = () => {
            console.warn('[VideoStorage] Error al recuperar video:', req.error);
            resolve(null);
          };
        } catch (e) {
          console.error('[VideoStorage] Excepción al recuperar video:', e);
          resolve(null);
        }
      });
    },

    async clearAllVideos() {
      const db = await getDb();
      if (!db) return false;
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.clear();
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (e) {
          resolve(false);
        }
      });
    }
  };
})();

if (typeof window !== 'undefined') {
  window.Storage = Storage;
  window.VideoStorage = VideoStorage;
}

