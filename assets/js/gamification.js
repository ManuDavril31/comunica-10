/**
 * Comunica 10 - Sistema de Gamificación, XP, Rangos y Entrenamiento Adaptativo
 */

const Gamification = (() => {
  const RANKS = [
    { min: 0, max: 999, name: "Principiante", badge: "🌱", nextRank: "Explorador" },
    { min: 1000, max: 2499, name: "Explorador", badge: "🧭", nextRank: "Comunicador" },
    { min: 2500, max: 4999, name: "Comunicador", badge: "🎙️", nextRank: "Orador" },
    { min: 5000, max: 9999, name: "Orador", badge: "🔥", nextRank: "Maestro" },
    { min: 10000, max: Infinity, name: "Maestro", badge: "👑", nextRank: "Leyenda" }
  ];

  return {
    getRank(xp) {
      return RANKS.find(r => xp >= r.min && xp <= r.max) || RANKS[0];
    },

    getRankProgress(xp) {
      const rank = this.getRank(xp);
      if (rank.max === Infinity) return 100;
      const range = rank.max - rank.min;
      const current = xp - rank.min;
      return Math.min(100, Math.round((current / range) * 100));
    },

    /**
     * Recompensa de XP por completar una misión
     */
    calculateReward(options = {}) {
      let totalXP = 100; // Ejercicio normal base
      const details = [{ label: "Misión completada", xp: 100 }];

      if (options.isFirstOfDay) {
        totalXP += 50;
        details.push({ label: "Primera misión del día", xp: 50 });
      }

      if (options.streakActive) {
        totalXP += 20;
        details.push({ label: "Bonus de racha", xp: 20 });
      }

      if (options.beatRecord) {
        totalXP += 100;
        details.push({ label: "Superaste tu récord", xp: 100 });
      }

      if (options.levelCompleted) {
        totalXP += 500;
        details.push({ label: "¡Nivel completado!", xp: 500 });
      }

      return { totalXP, details };
    },

    /**
     * Motor Adaptativo: Detecta debilidad y sugiere la misión adecuada
     * Reglas del documento:
     * - Si muletillas > 10/min -> Entrenamiento de muletillas
     * - Si estructura < 5 -> Entrenamiento de estructura
     * - Si fluidez > 8 pero improvisación < 5 -> Entrenamiento de improvisación
     */
    getAdaptiveRecommendation(user) {
      if (user.level === 0 || !user.stats || user.stats.exercisesCompleted === 0) {
        return {
          type: "desbloqueo",
          reason: "Tu primera misión de desbloqueo",
          title: "Preséntate y rompe el hielo con la cámara",
          description: "Habla frente al lente sin juzgarte ni buscar la perfección.",
          exerciseId: 1
        };
      }

      const skills = user.skills || {};
      const fillersPerMin = user.weeklyFillersPerMin || 0;

      if (fillersPerMin > 10) {
        return {
          type: "muletillas",
          reason: "Tus muletillas superan 10/minuto",
          title: "Entrenamiento de pausas y muletillas",
          description: "Aprende a sustituir 'eh' y 'o sea' por silencios de 1 a 2 segundos.",
          exerciseId: 8
        };
      }

      if ((skills.estructura || 6) < 5.0) {
        return {
          type: "estructura",
          reason: "Tu estructura está por debajo de 5.0",
          title: "Entrenamiento de Pensamiento Estructurado (PREP)",
          description: "Entrena el marco Punto - Razón - Ejemplo - Punto para no divagar.",
          exerciseId: 10
        };
      }

      if ((skills.fluidez || 6) > 8.0 && (skills.improvisacion || 5) < 5.0) {
        return {
          type: "improvisacion",
          reason: "Tienes alta fluidez pero tu improvisación necesita filo",
          title: "Entrenamiento de Improvisación Relámpago",
          description: "5 segundos de preparación ante una pregunta sorpresa.",
          exerciseId: 13
        };
      }

      // Recomendación por defecto: Misión del día
      return {
        type: "mision-del-dia",
        reason: "Tu entrenamiento diario recomendado",
        title: "Habla durante 60 segundos sobre algo que aprendiste",
        description: "Mantén una respuesta estructurada durante 1 minuto completo.",
        exerciseId: 17
      };
    }
  };
})();

if (typeof window !== 'undefined') {
  window.Gamification = Gamification;
}
