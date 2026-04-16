import { useEffect, useMemo, useState } from "react";
import "./styles.css";

const PRODUCT_CATALOG = [
  { id: "sleep-tea", name: "Infusión relajante nocturna", benefit: "Ayuda a desacelerar antes de dormir", image: "🍵", tag: "Bienestar", link: "https://amazon.com" },
  { id: "journaling-notebook", name: "Journal de claridad diaria", benefit: "Ordena ideas y emociones en 5 minutos", image: "📓", tag: "Journaling", link: "https://amazon.com" },
  { id: "focus-timer", name: "Timer visual de enfoque", benefit: "Sostiene bloques sin distracciones", image: "⏱️", tag: "Productividad", link: "https://walmart.com" },
  { id: "stress-rollon", name: "Roll-on calmante", benefit: "Micro pausa para resetear tensión", image: "🌿", tag: "Estrés", link: "https://target.com" },
];

const LEVELS = [
  { min: 0, label: "🌱 Semilla", note: "Cada paso pequeño ya cuenta." },
  { min: 15, label: "🌿 En proceso", note: "Ya no estás empezando, estás construyendo." },
  { min: 30, label: "🌸 Floreciendo", note: "Ya no estás empezando… estás creciendo." },
  { min: 55, label: "✨ En expansión", note: "Tu constancia está creando nueva energía." },
  { min: 85, label: "💫 Compinche Pro", note: "Tu presencia diaria inspira tu propio cambio." },
];

const dailyMessages = [
  "Hoy tu espacio se siente suave y posible ✨",
  "Tu bienestar también es productividad inteligente 🌿",
  "No necesitas hacer todo, solo avanzar con calma 💫",
  "Respira: hoy también puedes volver a ti 💖",
];

const journalingTypes = [
  { title: "🧠 Mental clarity", prompt: "¿Qué pensamiento ocupa demasiado espacio hoy?" },
  { title: "💖 Emocional", prompt: "¿Qué emoción necesita ser escuchada ahora?" },
  { title: "🎯 Enfoque del día", prompt: "¿Qué cambio haría valioso tu día de hoy?" },
  { title: "🌱 Gratitud", prompt: "Nombra 3 cosas simples por las que agradeces hoy." },
];

const routineTemplates = {
  sleep: {
    title: "😴 Modo descanso profundo",
    color: "sleep",
    steps: [
      { label: "🌗 Check-out emocional", helper: "¿Cómo te sientes antes de dormir?" },
      { label: "🧠 Vaciar mente", helper: "Escribe 1 cosa que te preocupa y suéltala aquí" },
      { label: "📵 Desconexión", helper: "Deja el celular y haz 1 minuto de respiración guiada" },
      { label: "🌿 Ritual final", helper: "Skincare opcional + té/agua" },
    ],
    close: "Mañana será más ligero. Descansa.",
  },
  journaling: {
    title: "✍️ Hablar contigo",
    color: "journal",
    steps: [
      { label: "Selecciona tu tipo", helper: "Rota entre claridad, emoción, enfoque y gratitud" },
      { label: "Pregunta guiada", helper: "Escribe sin filtro durante 2 minutos" },
      { label: "Guardar pensamiento", helper: "Tus pensamientos también merecen espacio" },
    ],
    close: "Me quedo con esto. Gracias por escucharte.",
  },
  stress: {
    title: "😮‍💨 Reset de 3 minutos",
    color: "stress",
    steps: [
      { label: "⏸️ Pausa", helper: "Respira, no todo es urgente" },
      { label: "🌬️ Respiración guiada", helper: "Inhala 4 · pausa 4 · exhala 6" },
      { label: "🧠 Reenfoque", helper: "¿Qué es lo único importante ahora?" },
      { label: "⚡ Acción simple", helper: "Vuelve con claridad" },
    ],
    close: "Tu mente está más clara. Seguimos suave.",
  },
  focus: {
    title: "⚡ Modo enfoque",
    color: "focus",
    steps: [
      { label: "🎯 Define tarea", helper: "Una prioridad concreta" },
      { label: "⏱️ Pomodoro simple", helper: "Enfócate sin multitarea" },
      { label: "🔕 Sin distracciones", helper: "Silencia notificaciones por este bloque" },
      { label: "✅ Cierre", helper: "No necesitas hacer todo… solo avanzar" },
    ],
    close: "Trabajo hecho. Ahora respira 1 minuto.",
  },
};

const dayKey = () => new Date().toISOString().slice(0, 10);

const secondsToClock = (seconds) => {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
};

export default function App() {
  const [screen, setScreen] = useState("home");
  const [name] = useState("Compinche");
  const [energyMode, setEnergyMode] = useState("low");
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [routineStepIndex, setRoutineStepIndex] = useState(0);
  const [routineInput, setRoutineInput] = useState("");
  const [celebration, setCelebration] = useState("");
  const [streakPulse, setStreakPulse] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [dailyHistory, setDailyHistory] = useState({});

  const today = dayKey();
  const todayData = dailyHistory[today] || { completed: [], thoughts: [] };

  const dailyMessage = useMemo(() => dailyMessages[new Date().getDate() % dailyMessages.length], []);
  const todayJournal = journalingTypes[new Date().getDate() % journalingTypes.length];

  const streak = useMemo(() => {
    const days = Object.keys(dailyHistory).sort().reverse();
    let count = 0;
    for (const day of days) {
      if ((dailyHistory[day]?.completed?.length || 0) > 0) count += 1;
      else break;
    }
    return count;
  }, [dailyHistory]);

  const completedToday = todayData.completed.length;
  const dayProgress = Math.round((completedToday / 4) * 100);
  const totalCompleted = useMemo(() => Object.values(dailyHistory).reduce((sum, day) => sum + (day.completed?.length || 0), 0), [dailyHistory]);
  const score = streak * 2 + totalCompleted;
  const userLevel = useMemo(() => LEVELS.slice().reverse().find((lvl) => score >= lvl.min) || LEVELS[0], [score]);
  const nextLevel = useMemo(() => LEVELS.find((lvl) => lvl.min > score), [score]);
  const levelProgress = nextLevel ? Math.round(((score - userLevel.min) / (nextLevel.min - userLevel.min)) * 100) : 100;

  const badges = useMemo(() => {
    const list = [];
    if (streak >= 3) list.push("🎖️ Constancia inicial");
    if (streak >= 7) list.push("🔓 Calma nivel 2");
    if (totalCompleted >= 12) list.push("🎁 Compinche activo");
    return list;
  }, [streak, totalCompleted]);

  const compincheOfDay = PRODUCT_CATALOG[new Date().getDate() % PRODUCT_CATALOG.length];
  const suggestedOrder = energyMode === "low" ? ["sleep", "stress", "journaling", "focus"] : ["focus", "journaling", "stress", "sleep"];

  const currentFlow = activeRoutine ? routineTemplates[activeRoutine] : null;
  const currentStep = currentFlow?.steps[routineStepIndex];
  const stepProgress = currentFlow ? Math.round((routineStepIndex / currentFlow.steps.length) * 100) : 0;

  useEffect(() => {
    if (!timerRunning) return undefined;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          setCelebration("Pomodoro completado. No necesitas hacer todo… solo avanzar.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (streak <= 0) return;
    setStreakPulse(true);
    const timer = setTimeout(() => setStreakPulse(false), 900);
    return () => clearTimeout(timer);
  }, [streak]);

  const startRoutine = (key) => {
    setActiveRoutine(key);
    setRoutineStepIndex(0);
    setRoutineInput("");
    setCelebration("");
    setScreen("flow");
  };

  const completeRoutine = () => {
    setDailyHistory((prev) => {
      const existing = prev[today] || { completed: [], thoughts: [] };
      const nextCompleted = existing.completed.includes(activeRoutine)
        ? existing.completed
        : [...existing.completed, activeRoutine];
      const nextThoughts = routineInput ? [...existing.thoughts, routineInput] : existing.thoughts;
      return {
        ...prev,
        [today]: {
          ...existing,
          completed: nextCompleted,
          thoughts: nextThoughts,
        },
      };
    });

    const bridgeMessage = activeRoutine === "focus"
      ? "Ahora respira 1 minuto para cuidar tu energía 🌬️"
      : activeRoutine === "journaling"
        ? "Ahora define tu siguiente acción ⚡"
        : "Lo hiciste hoy. Y eso cuenta.";

    setCelebration(bridgeMessage);
    setScreen("home");
    setActiveRoutine(null);
    setRoutineStepIndex(0);
    setRoutineInput("");
  };

  const nextStep = () => {
    if (!currentFlow) return;
    if (routineStepIndex < currentFlow.steps.length - 1) {
      setRoutineStepIndex((prev) => prev + 1);
      setCelebration(["Sigue así", "Vas bien", "Un paso más"][routineStepIndex % 3]);
      return;
    }
    completeRoutine();
  };

  const startPomodoro = () => {
    setTimerSeconds(25 * 60);
    setTimerRunning(true);
  };

  return (
    <main className="app">
      <header className="topbar panel">
        <div>
          <p className="eyebrow">Hola, {name} 👋</p>
          <h1>Tu espacio hoy se siente así…</h1>
          <p className="helper">{dailyMessage}</p>
        </div>
        <div className="energy-toggle">
          <span>Modo según energía</span>
          <div>
            <button className={energyMode === "low" ? "energy active" : "energy"} onClick={() => setEnergyMode("low")}>Baja energía</button>
            <button className={energyMode === "high" ? "energy active" : "energy"} onClick={() => setEnergyMode("high")}>Alta energía</button>
          </div>
        </div>
      </header>

      {screen === "home" && (
        <>
          <section className="panel home-overview">
            <article className={streakPulse ? "metric pulse" : "metric"}>
              <p>🔥 Racha</p>
              <strong>{streak} días</strong>
            </article>
            <article className="metric">
              <p>📈 Día completado</p>
              <strong>{dayProgress}%</strong>
            </article>
            <article className="metric">
              <p>{userLevel.label}</p>
              <strong>Nivel emocional</strong>
              <small>{userLevel.note}</small>
            </article>
            <article className="metric">
              <p>Progreso al siguiente nivel</p>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.max(levelProgress, 2)}%` }} /></div>
              <small>{nextLevel ? `${nextLevel.label} en ${Math.max(nextLevel.min - score, 0)} pts` : "Nivel máximo alcanzado"}</small>
            </article>
          </section>

          <section className="routine-grid">
            {suggestedOrder.map((key) => {
              const routine = routineTemplates[key];
              const isDone = todayData.completed.includes(key);
              return (
                <article key={key} className={`panel routine-card ${routine.color}`}>
                  <h3>{routine.title}</h3>
                  <p>{routine.steps[0].helper}</p>
                  <button onClick={() => startRoutine(key)}>{isDone ? "Repetir suave" : "Vamos suave"}</button>
                </article>
              );
            })}
          </section>

          <section className="panel compinche-day">
            <h3>💡 Compinche del día</h3>
            <p>Hoy te recomiendo esto 💖</p>
            <div className="compinche-content">
              <div className="emoji">{compincheOfDay.image}</div>
              <div>
                <strong>{compincheOfDay.name}</strong>
                <p>{compincheOfDay.benefit}</p>
              </div>
              <a href={compincheOfDay.link}>Para ti hoy</a>
            </div>
          </section>

          <section className="panel badges">
            <h3>Gamificación emocional</h3>
            <div className="badge-list">
              {badges.length ? badges.map((badge) => <span key={badge}>{badge}</span>) : <span>🎖️ Primer logro pendiente</span>}
            </div>
            {badges.includes("🔓 Calma nivel 2") && <p>Desbloqueaste calma nivel 2</p>}
          </section>
        </>
      )}

      {screen === "flow" && currentFlow && (
        <section className={`panel flow-screen ${currentFlow.color}`}>
          <h2>{currentFlow.title}</h2>
          <p className="step-chip">Paso {routineStepIndex + 1} de {currentFlow.steps.length}</p>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${stepProgress}%` }} /></div>

          <article className="flow-step">
            <h3>{currentStep.label}</h3>
            <p>{currentStep.helper}</p>

            {activeRoutine === "journaling" && (
              <div className="input-block">
                <p><strong>{todayJournal.title}</strong> · {todayJournal.prompt}</p>
                <textarea value={routineInput} onChange={(e) => setRoutineInput(e.target.value)} placeholder="Escribe aquí sin juicio" />
                <button onClick={() => setCelebration("Tus pensamientos también merecen espacio")}>Me quedo con esto</button>
              </div>
            )}

            {activeRoutine === "sleep" && routineStepIndex === 1 && (
              <textarea value={routineInput} onChange={(e) => setRoutineInput(e.target.value)} placeholder="Escribe 1 cosa que te preocupa y suéltala aquí" />
            )}

            {activeRoutine === "focus" && routineStepIndex === 1 && (
              <div className="timer-box">
                <strong>{secondsToClock(timerSeconds)}</strong>
                <div className="cta-row">
                  <button onClick={startPomodoro}>Iniciar Pomodoro</button>
                  <button className="ghost" onClick={() => setTimerRunning((prev) => !prev)}>{timerRunning ? "Pausar" : "Continuar"}</button>
                </div>
              </div>
            )}
          </article>

          {celebration && <p className="celebration">{celebration}</p>}
          <div className="cta-row">
            <button onClick={nextStep}>{routineStepIndex === currentFlow.steps.length - 1 ? "Cerramos por hoy" : "Siguiente paso"}</button>
            <button className="ghost" onClick={() => setScreen("home")}>Volver</button>
          </div>
          <p className="helper">{routineStepIndex === currentFlow.steps.length - 1 ? currentFlow.close : "Transición suave al siguiente paso"}</p>
        </section>
      )}
    </main>
  );
}
