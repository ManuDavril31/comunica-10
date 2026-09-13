/**
 * Comunica 10 - Repositorio de Datos de Ejercicios, Niveles y Habilidades
 */

const AppData = (() => {
  const LEVELS = [
    { id: 0, name: "Nivel 0", title: "Desbloquear la voz", tagline: "Pierde el miedo y acostúmbrate al lente", targetDuration: "30 - 60 seg", prepTime: 15, difficulty: "Principiante", icon: "mic", skillsFocus: ["Presencia", "Naturalidad"], badge: "🧊 Rompehielos" },
    { id: 1, name: "Nivel 1", title: "Hablar durante 30 segundos", tagline: "Mantén una idea sin abandonar", targetDuration: "30 seg", prepTime: 15, difficulty: "Principiante", icon: "timer", skillsFocus: ["Fluidez", "Control del bloqueo"], badge: "⏱️ Resistencia 30s" },
    { id: 2, name: "Nivel 2", title: "Hablar durante 1 minuto", tagline: "Respuestas con principio, cuerpo y cierre", targetDuration: "60 seg", prepTime: 15, difficulty: "Básico", icon: "clock", skillsFocus: ["Estructura", "Fluidez", "Claridad"], badge: "🎯 Minuto de Oro" },
    { id: 3, name: "Nivel 3", title: "Controlar muletillas", tagline: "Sustituye 'eh', 'este' y 'o sea' por silencio", targetDuration: "60 seg", prepTime: 10, difficulty: "Intermedio", icon: "volume-x", skillsFocus: ["Pausas", "Control de muletillas"], badge: "🔇 Señor del Silencio" },
    { id: 4, name: "Nivel 4", title: "Pensamiento estructurado", tagline: "Método PREP y esquemas mentales", targetDuration: "90 seg", prepTime: 20, difficulty: "Intermedio", icon: "git-merge", skillsFocus: ["Estructura", "Claridad"], badge: "📐 Arquitecto Mental" },
    { id: 5, name: "Nivel 5", title: "Hablar 3–5 minutos", tagline: "Desarrollo profundo sin depender de un guion", targetDuration: "3 - 5 min", prepTime: 30, difficulty: "Intermedio-Avanzado", icon: "layers", skillsFocus: ["Fluidez", "Estructura"], badge: "🎙️ Expositor Firme" },
    { id: 6, name: "Nivel 6", title: "Improvisación", tagline: "Preguntas sorpresa con solo 5 segundos", targetDuration: "60 seg", prepTime: 5, difficulty: "Avanzado", icon: "zap", skillsFocus: ["Improvisación", "Pensamiento rápido"], badge: "⚡ Chispa Espontánea" },
    { id: 7, name: "Nivel 7", title: "Hablar frente a cámara", tagline: "Contacto visual, energía y lenguaje corporal", targetDuration: "60 - 90 seg", prepTime: 15, difficulty: "Avanzado", icon: "video", skillsFocus: ["Presencia", "Conexión visual"], badge: "👁️ Conexión Lente" },
    { id: 8, name: "Nivel 8", title: "Storytelling", tagline: "Historias que enganchan de principio a fin", targetDuration: "2 min", prepTime: 20, difficulty: "Avanzado", icon: "book-open", skillsFocus: ["Storytelling", "Emoción"], badge: "📖 Cuentacuentos" },
    { id: 9, name: "Nivel 9", title: "Persuasión y comunicación avanzada", tagline: "Defiende posturas, explica conceptos y convence", targetDuration: "2 - 3 min", prepTime: 25, difficulty: "Experto", icon: "shield", skillsFocus: ["Persuasión", "Argumentación"], badge: "🏹 Persuasor Clave" },
    { id: 10, name: "Nivel 10", title: "Comunicación espontánea avanzada", tagline: "La prueba cumbre: 10 minutos con preguntas sorpresa", targetDuration: "10 min", prepTime: 30, difficulty: "Maestro", icon: "award", skillsFocus: ["Maestría Integral", "Improvisación"], badge: "👑 Orador Maestro" }
  ];

  const EXERCISES = [
    {
      id: 1,
      level: 0,
      category: "Desbloqueo",
      prompt: "Preséntate: di tu nombre, de dónde eres y qué te motivó a empezar a entrenar hoy.",
      preparationTime: 15,
      targetTime: 45,
      difficulty: 1,
      skills: ["Presencia", "Naturalidad"],
      instructions: "No intentes sonar profesional ni perfecto. Habla exactamente como si le enviaras una videonota a un amigo.",
      successCriteria: ["Mirar al lente de la cámara", "Hablar sin detener el vídeo a mitad de camino", "Sonreír al menos una vez"],
      coachingTip: "El lente es tu amigo. Imagina que detrás de él hay alguien que quiere escucharte con ganas."
    },
    {
      id: 2,
      level: 0,
      category: "Desbloqueo",
      prompt: "Describe tu habitación o el espacio donde estás en este momento.",
      preparationTime: 10,
      targetTime: 45,
      difficulty: 1,
      skills: ["Naturalidad", "Fluidez"],
      instructions: "Mira alrededor. Describe 3 objetos que veas y explica por qué están ahí o qué significan para ti.",
      successCriteria: ["No pausar más de 3 segundos consecutivos", "Utilizar descripciones sensoriales (colores, texturas)"],
      coachingTip: "Cuando describes cosas físicas reales, tu mente no tiene que inventar nada y se reduce el pánico."
    },
    {
      id: 3,
      level: 0,
      category: "Desbloqueo",
      prompt: "¿Cuál es tu comida favorita de todos los tiempos y por qué?",
      preparationTime: 15,
      targetTime: 45,
      difficulty: 1,
      skills: ["Naturalidad", "Emoción"],
      instructions: "Transmite entusiasmo. ¿Quién la cocina? ¿A qué sabe? Haz que se nos haga la boca agua.",
      successCriteria: ["Transmitir emoción con el tono de voz", "Completar los 45 segundos"],
      coachingTip: "La emoción por un tema cotidiano relaja las cuerdas vocales."
    },
    {
      id: 4,
      level: 1,
      category: "Fluidez",
      prompt: "Cuenta qué fue lo primero que hiciste hoy al levantarte y cómo empezó tu día.",
      preparationTime: 15,
      targetTime: 30,
      difficulty: 1,
      skills: ["Fluidez", "Control del bloqueo"],
      instructions: "Mantén una única línea de tiempo cronológica. 30 segundos continuos.",
      successCriteria: ["No abandonar la grabación antes de los 30 segundos", "Ritmo respiratorio estable"],
      coachingTip: "Si te trabas con una palabra, continúa con otra. Nunca pidas perdón en la cámara."
    },
    {
      id: 5,
      level: 1,
      category: "Fluidez",
      prompt: "Explica una costumbre o rutina que tengas todos los días y no te guste saltarte.",
      preparationTime: 15,
      targetTime: 30,
      difficulty: 1,
      skills: ["Fluidez", "Claridad"],
      instructions: "Concéntrate en sostener la idea fija durante los 30 segundos completos.",
      successCriteria: ["Llegar a los 30s sin cortar", "Cerrar con una frase final"],
      coachingTip: "30 segundos pasan muy rápido cuando tienes un objetivo claro en mente."
    },
    {
      id: 6,
      level: 2,
      category: "Estructura",
      prompt: "Explica una habilidad o lección que hayas aprendido durante este último año.",
      preparationTime: 15,
      targetTime: 60,
      difficulty: 2,
      skills: ["Estructura", "Fluidez", "Claridad"],
      instructions: "Usa 3 fases: 1) Qué aprendiste, 2) Cómo lo aprendiste, 3) Cómo te sirve hoy.",
      successCriteria: ["Estructurar en Inicio, Desarrollo y Conclusión", "Duración cercana a los 60 segundos"],
      coachingTip: "Un minuto requiere ritmo: 15s introducción, 35s desarrollo y 10s cierre contundente."
    },
    {
      id: 8,
      level: 3,
      category: "Muletillas",
      prompt: "Explica cómo llegar desde tu casa a tu lugar favorito, o tu ruta habitual.",
      preparationTime: 10,
      targetTime: 60,
      difficulty: 2,
      skills: ["Pausas", "Control de muletillas"],
      instructions: "MISIÓN ESPECIAL: Cada vez que sientas que vas a decir 'ehhh', 'este' u 'o sea', CIERRA la boca y haz una pausa de 1 segundo.",
      successCriteria: ["Menos de 4 muletillas en 1 minuto", "Al menos 3 pausas conscientes"],
      coachingTip: "El silencio transmite serenidad y control. La muletilla transmite angustia por rellenar el aire."
    },
    {
      id: 9,
      level: 3,
      category: "Muletillas",
      prompt: "El poder del silencio: Explica qué ventajas tiene levantarse temprano o trasnochar.",
      preparationTime: 10,
      targetTime: 60,
      difficulty: 2,
      skills: ["Pausas", "Control de muletillas"],
      instructions: "Respira antes de empezar cada nueva oración. Deja que los puntos y comas se conviertan en silencio puro.",
      successCriteria: ["Sustituir al menos 5 muletillas por pausas limpias"],
      coachingTip: "Para tu mente la pausa parece eterna, pero para quien escucha es un segundo de pura elegancia."
    },
    {
      id: 10,
      level: 4,
      category: "Estructura",
      prompt: "Aplica PREP: ¿Debería la gente leer más libros o ver documentales?",
      preparationTime: 20,
      targetTime: 90,
      difficulty: 3,
      skills: ["Estructura", "Argumentación"],
      instructions: "Sigue la estructura: P (Punto central), R (Razón de peso), E (Ejemplo personal), P (Reafirmación del punto).",
      successCriteria: ["Identificar las 4 fases de PREP", "Cerrar volviendo a la tesis inicial"],
      coachingTip: "PREP te salva la vida en cualquier junta o respuesta inesperada."
    },
    {
      id: 13,
      level: 6,
      category: "Improvisación",
      prompt: "¿Qué impacto real crees que tendrá la IA en el trabajo de los próximos 5 años?",
      preparationTime: 5,
      targetTime: 60,
      difficulty: 4,
      skills: ["Improvisación", "Pensamiento rápido", "Fluidez"],
      instructions: "Solo tienes 5 segundos de preparación. No pienses en la respuesta perfecta: da una opinión rotunda y defiéndela.",
      successCriteria: ["Empezar a hablar antes del segundo 6", "No pausar más de 3 segundos al inicio"],
      coachingTip: "No busques ser sabio; busca tu verdad inmediata y arranca."
    },
    {
      id: 15,
      level: 7,
      category: "Cámara",
      prompt: "Vende tu rincón favorito de tu ciudad mirando fijamente al lente con energía positiva.",
      preparationTime: 15,
      targetTime: 60,
      difficulty: 3,
      skills: ["Presencia", "Lenguaje corporal", "Conexión visual"],
      instructions: "Coloca la cámara a la altura de tus ojos. Mantén contacto visual del 90% con el lente, gesticula con soltura.",
      successCriteria: ["No desviar la mirada", "Manos visibles en el encuadre apoyando tus palabras"],
      coachingTip: "Imagina una cara sonriente en el lente para conectar visualmente."
    },
    {
      id: 16,
      level: 8,
      category: "Storytelling",
      prompt: "Cuenta una anécdota vergonzosa o divertida que te haya ocurrido y de la que hoy te rías.",
      preparationTime: 20,
      targetTime: 120,
      difficulty: 4,
      skills: ["Storytelling", "Emoción", "Estructura"],
      instructions: "Aplica la curva narrativa: Gancho ('Nunca olvidaré el día en que...'), tensión cómica y moraleja.",
      successCriteria: ["Gancho en los primeros 10 segundos", "Crear un momento de clímax"],
      coachingTip: "La vulnerabilidad compartida conecta de inmediato con la audiencia."
    },
    {
      id: 17,
      level: 2,
      category: "Fluidez",
      prompt: "Habla durante 60 segundos sobre algo valioso que hayas aprendido recientemente.",
      preparationTime: 15,
      targetTime: 60,
      difficulty: 2,
      skills: ["Fluidez", "Estructura", "Naturalidad"],
      instructions: "Explica cuál es ese aprendizaje, cómo llegó a ti y por qué lo consideras relevante.",
      successCriteria: ["Mantener el tema central sin desviarse", "Conclusión en el segundo 55-65"],
      coachingTip: "Usa anécdotas concretas para aterrizar conceptos abstractos."
    },
    {
      id: 19,
      level: 9,
      category: "Persuasión",
      prompt: "Convence a alguien escéptico de por qué debería hacer ejercicio físico 3 veces por semana.",
      preparationTime: 25,
      targetTime: 120,
      difficulty: 4,
      skills: ["Persuasión", "Argumentación"],
      instructions: "Anticípate a su excusa principal ('no tengo tiempo') y refútala antes de exponer tu tesis.",
      successCriteria: ["Reconocer la objeción del interlocutor", "Ofrecer un primer paso fácil"],
      coachingTip: "No intentes tener la razón; intenta que la otra persona quiera probarlo."
    },
    {
      id: 20,
      level: 10,
      category: "Maestría",
      prompt: "Reto Cumbre: 10 minutos de discurso espontáneo sobre 'El valor de la disciplina vs la motivación'.",
      preparationTime: 30,
      targetTime: 600,
      difficulty: 5,
      skills: ["Maestría Integral", "Improvisación", "Storytelling"],
      instructions: "La prueba final de Comunica 10. Desarrolla conceptos, cuenta historias y mantén la presencia durante 10 minutos.",
      successCriteria: ["Completar los 10 minutos continuos", "Menos de 5 muletillas/min"],
      coachingTip: "Respira hondo y confía en tu entrenamiento. Has llegado hasta aquí."
    },
    // ==========================================
    // BANCO DE PREGUNTAS SORPRESA (IMPROVISACIÓN 60s)
    // ==========================================
    {
      id: 101,
      level: 6,
      category: "Sorpresa",
      prompt: "¿Qué harías si en los primeros 30 segundos de una presentación clave se apaga la pantalla por completo?",
      preparationTime: 5,
      targetTime: 60,
      difficulty: 3,
      skills: ["Improvisación", "Calma bajo presión", "Presencia"],
      instructions: "No tienes diapositivas. Mira a la cámara con tranquilidad y explica a tu audiencia cómo continuarás sin dudar.",
      successCriteria: ["Arrancar en menos de 5 segundos", "Mostrar seguridad en la voz", "Proponer una solución inmediata"],
      coachingTip: "La audiencia no juzga el fallo técnico; juzga tu templanza ante él."
    },
    {
      id: 102,
      level: 6,
      category: "Sorpresa",
      prompt: "Explícale a un niño de 7 años en qué consiste tu trabajo o tu pasión sin usar palabras técnicas.",
      preparationTime: 5,
      targetTime: 60,
      difficulty: 3,
      skills: ["Claridad", "Analogías", "Naturalidad"],
      instructions: "Usa metáforas cotidianas (juguetes, superhéroes, comida). Si usas palabras complejas, pierdes la atención.",
      successCriteria: ["Lenguaje 100% accesible", "Sonreír y gesticular con calidez", "Analogía concreta"],
      coachingTip: "Si no puedes explicárselo a un niño, todavía no lo dominas con sencillez."
    },
    {
      id: 103,
      level: 6,
      category: "Sorpresa",
      prompt: "Si pudieras cenar hoy con cualquier personaje histórico (vivo o muerto), ¿a quién elegirías y qué le preguntarías?",
      preparationTime: 5,
      targetTime: 60,
      difficulty: 2,
      skills: ["Espontaneidad", "Storytelling", "Estructura"],
      instructions: "Di el nombre en menos de 5 segundos, da el motivo en 20 segundos y formula la gran pregunta que le harías.",
      successCriteria: ["Respuesta inmediata", "Razón convincente", "Pregunta memorable"],
      coachingTip: "No busques la respuesta más 'culta'; busca la que despierte tu curiosidad genuina."
    },
    {
      id: 104,
      level: 6,
      category: "Sorpresa",
      prompt: "¿Cuál es una verdad incómoda sobre tu profesión o sector que casi nadie se atreve a decir en voz alta?",
      preparationTime: 5,
      targetTime: 60,
      difficulty: 4,
      skills: ["Persuasión", "Autoridad", "Fluidez"],
      instructions: "Plantea la verdad de golpe. Explica por qué se oculta y cuál es la solución constructiva.",
      successCriteria: ["Tesis firme en los primeros 15s", "Tono profesional y constructivo"],
      coachingTip: "La franqueza respetuosa genera 10 veces más credibilidad que el discurso corporativo estándar."
    },
    {
      id: 105,
      level: 6,
      category: "Sorpresa",
      prompt: "Tienes 60 segundos en televisión nacional para convencer a millones de adoptar un solo hábito diario. ¿Cuál es?",
      preparationTime: 5,
      targetTime: 60,
      difficulty: 3,
      skills: ["Persuasión", "Energía", "Estructura PREP"],
      instructions: "Llamada a la acción urgente y directa. ¿Por qué ese hábito específico cambiará sus vidas?",
      successCriteria: ["Gancho inicial enérgico", "Beneficio tangible inmediato"],
      coachingTip: "Habla con convicción física: postura erguida, mirada al lente, voz firme."
    }
  ];

  return {
    getLevels() {
      return LEVELS;
    },
    getLevel(id) {
      return LEVELS.find(l => l.id === Number(id)) || LEVELS[0];
    },
    getExercises(levelFilter = null) {
      if (levelFilter !== null && levelFilter !== undefined) {
        return EXERCISES.filter(e => e.level === Number(levelFilter));
      }
      return EXERCISES;
    },
    getExercise(id) {
      return EXERCISES.find(e => e.id === Number(id)) || EXERCISES[0];
    },
    getDailyMission() {
      // Misión destacada #17 según especificación
      return this.getExercise(17);
    },
    getRandomSurpriseExercise() {
      const surpriseList = EXERCISES.filter(e => e.category === 'Sorpresa' || e.id >= 100);
      const randomIndex = Math.floor(Math.random() * surpriseList.length);
      return surpriseList[randomIndex] || EXERCISES[0];
    }
  };
})();

if (typeof window !== 'undefined') {
  window.AppData = AppData;
}
