import { useEffect, useMemo, useState } from "react";
import "./styles.css";

const PRODUCT_CATALOG = [
  {
    id: "gel-cleanser-basic",
    name: "Gel limpiador con salicílico 2%",
    benefit: "Controla brillo sin resecar",
    image: "🫧",
    category: "limpieza",
    tiers: {
      low: { label: "Opción económica", price: 8, affiliateUrl: "https://amazon.com" },
      mid: { label: "Opción media", price: 15, affiliateUrl: "https://walmart.com" },
      premium: { label: "Opción premium", price: 28, affiliateUrl: "https://sephora.com" },
    },
    skinTypes: ["grasa", "mixta"],
    problems: ["acne", "grasa"],
  },
  {
    id: "cleanser-sensitive",
    name: "Limpiador syndet sin fragancia",
    benefit: "Calma la piel sensible",
    image: "🌿",
    category: "limpieza",
    tiers: {
      low: { label: "Opción económica", price: 10, affiliateUrl: "https://amazon.com" },
      mid: { label: "Opción media", price: 18, affiliateUrl: "https://target.com" },
      premium: { label: "Opción premium", price: 32, affiliateUrl: "https://dermstore.com" },
    },
    skinTypes: ["seca", "sensible", "mixta"],
    problems: ["sensibilidad", "manchas"],
  },
  {
    id: "light-moisturizer",
    name: "Hidratante ligera oil-free",
    benefit: "Hidratación sin pesadez",
    image: "💧",
    category: "hidratante",
    tiers: {
      low: { label: "Opción económica", price: 9, affiliateUrl: "https://walmart.com" },
      mid: { label: "Opción media", price: 16, affiliateUrl: "https://amazon.com" },
      premium: { label: "Opción premium", price: 30, affiliateUrl: "https://sephora.com" },
    },
    skinTypes: ["grasa", "mixta", "normal"],
    problems: ["acne", "grasa", "manchas"],
  },
  {
    id: "spf-gel",
    name: "Protector solar SPF 50 gel-crema",
    benefit: "Protege y previene manchas",
    image: "☀️",
    category: "spf",
    tiers: {
      low: { label: "Opción económica", price: 11, affiliateUrl: "https://amazon.com" },
      mid: { label: "Opción media", price: 19, affiliateUrl: "https://walmart.com" },
      premium: { label: "Opción premium", price: 36, affiliateUrl: "https://dermstore.com" },
    },
    skinTypes: ["grasa", "mixta", "normal", "sensible"],
    problems: ["manchas", "acne", "sensibilidad"],
  },
];

const commitmentCap = { bajo: 3, medio: 4, alto: 5 };
const feedbackMessages = ["Sigue así", "Vas bien", "Un paso más", "Qué bien te estás cuidando"];
const dailyMessages = [
  "Hoy es un buen día para volver a ti ✨",
  "Tu calma también merece espacio hoy 🌿",
  "Un ritual pequeño puede cambiar tu día 💫",
  "Hoy toca cuidarte con cariño y constancia 💖",
];

const initialQuiz = {
  skinType: "",
  problems: [],
  commitment: "medio",
  budget: "medio",
};

const dayKey = () => new Date().toISOString().slice(0, 10);

const getProfileLabel = ({ skinType, problems }) => {
  const skin = skinType || "mixta";
  if (!problems.length) return `Piel ${skin} sin alertas principales`;
  if (problems.length === 1) return `Piel ${skin} con tendencia a ${problems[0]}`;
  return `Piel ${skin} con tendencia a ${problems.slice(0, 2).join(" y ")}`;
};

const applyRules = (quiz, elapsedDays = 1, streak = 0) => {
  const rules = [];
  let maxSteps = commitmentCap[quiz.commitment] ?? 4;
  const blockedIngredients = [];
  const introPlan = [
    "Día 1-3: limpieza + hidratante",
    "Día 5: añadir hidratante objetivo",
    "Día 10: introducir SPF diario",
  ];

  if (quiz.skinType === "grasa" && quiz.problems.includes("acne")) {
    rules.push("Evitar texturas pesadas y aceites oclusivos");
    maxSteps = Math.min(maxSteps, 4);
    introPlan.push("Retinol solo después del día 14");
  }

  if (quiz.skinType === "sensible" || quiz.problems.includes("sensibilidad")) {
    blockedIngredients.push("BHA", "retinol", "vitamina C alta concentración");
    rules.push("Priorizar fórmulas sin fragancia y pH neutro");
  }

  if (quiz.commitment === "bajo") {
    maxSteps = 3;
    introPlan.push("No introducir activos hasta fase 3");
    rules.push("Rutina simplificada a pasos esenciales");
  }

  const currentPhase = elapsedDays >= 14 && streak >= 10 ? 2 : 1;
  const morningSteps = ["Limpieza suave", "Hidratante ligera", "Protector solar SPF 50"].slice(0, maxSteps);
  const nightSteps = ["Limpieza", "Tratamiento objetivo", "Hidratante"].slice(0, maxSteps);

  if (currentPhase === 2 && !blockedIngredients.includes("retinol") && maxSteps > 3) {
    nightSteps.splice(2, 0, "Activo progresivo (retinoide 2 noches/semana)");
  }

  const picks = PRODUCT_CATALOG.filter((item) => {
    const skinMatch = item.skinTypes.includes(quiz.skinType);
    const problemMatch = quiz.problems.some((problem) => item.problems.includes(problem));
    return skinMatch || problemMatch;
  }).slice(0, 4);

  const normalizedBudget = quiz.budget === "bajo" ? "low" : quiz.budget === "medio" ? "mid" : "premium";
  const productRecommendations = picks.map((item) => ({
    name: item.name,
    benefit: item.benefit,
    image: item.image,
    economical: item.tiers.low,
    middle: item.tiers.mid,
    premium: item.tiers.premium,
    prioritized: item.tiers[normalizedBudget],
  }));

  return {
    profileLabel: getProfileLabel(quiz),
    morningSteps,
    nightSteps,
    rules,
    introPlan,
    phase: currentPhase,
    productRecommendations,
  };
};

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [quiz, setQuiz] = useState(initialQuiz);
  const [savedRoutine, setSavedRoutine] = useState(null);
  const [habitLog, setHabitLog] = useState({});
  const [period, setPeriod] = useState("morning");
  const [currentStep, setCurrentStep] = useState(0);
  const [celebration, setCelebration] = useState("");
  const [streakPulse, setStreakPulse] = useState(false);

  const streak = useMemo(() => {
    const entries = Object.keys(habitLog).sort().reverse();
    let count = 0;
    for (const key of entries) {
      if (habitLog[key]?.morning && habitLog[key]?.night) count += 1;
      else break;
    }
    return count;
  }, [habitLog]);

  const dailyCompletion = useMemo(() => {
    const today = habitLog[dayKey()];
    if (!today) return 0;
    const done = Number(Boolean(today.morning)) + Number(Boolean(today.night));
    return Math.round((done / 2) * 100);
  }, [habitLog]);

  const elapsedDays = useMemo(() => {
    if (!savedRoutine?.createdAt) return 1;
    const start = new Date(savedRoutine.createdAt);
    const now = new Date();
    return Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1);
  }, [savedRoutine]);

  const generated = useMemo(() => applyRules(quiz, elapsedDays, streak), [quiz, elapsedDays, streak]);

  const dailyMessage = useMemo(() => {
    const index = new Date().getDate() % dailyMessages.length;
    return dailyMessages[index];
  }, []);

  const compincheOfDay = useMemo(() => {
    if (!generated.productRecommendations.length) return null;
    return generated.productRecommendations[(new Date().getDate() + 1) % generated.productRecommendations.length];
  }, [generated.productRecommendations]);

  const routineSteps = period === "morning" ? generated.morningSteps : generated.nightSteps;
  const activeStep = routineSteps[currentStep] || "Tu rutina ya está completa";
  const routineProgress = routineSteps.length ? Math.round((currentStep / routineSteps.length) * 100) : 0;
  const nextMilestone = Math.ceil((streak + 1) / 3) * 3;
  const streakToGoal = Math.min(100, Math.round((streak / Math.max(nextMilestone, 1)) * 100));

  useEffect(() => {
    if (streak > 0) {
      setStreakPulse(true);
      const timer = setTimeout(() => setStreakPulse(false), 900);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [streak]);

  const toggleProblem = (problem) => {
    setQuiz((prev) => ({
      ...prev,
      problems: prev.problems.includes(problem)
        ? prev.problems.filter((p) => p !== problem)
        : [...prev.problems, problem],
    }));
  };

  const saveRoutine = () => {
    setSavedRoutine({ createdAt: new Date().toISOString(), plan: "free" });
    setScreen("dashboard");
  };

  const markHabit = (slot) => {
    const today = dayKey();
    setHabitLog((prev) => {
      const updated = {
        ...prev,
        [today]: {
          ...prev[today],
          [slot]: !prev[today]?.[slot],
        },
      };
      const isDone = updated[today]?.[slot];
      setCelebration(isDone ? "Pequeño paso, gran impacto 💫" : "Vamos suave, tú marcas el ritmo");
      return updated;
    });
  };

  const completeStep = () => {
    if (currentStep < routineSteps.length) {
      const randomMessage = feedbackMessages[currentStep % feedbackMessages.length];
      setCelebration(`${randomMessage} ✨`);
      setCurrentStep((prev) => prev + 1);
      return;
    }
    const slot = period === "morning" ? "morning" : "night";
    markHabit(slot);
    setCurrentStep(0);
    setPeriod((prev) => (prev === "morning" ? "night" : "morning"));
    setCelebration(period === "morning" ? "Listo por hoy ✨" : "Cerramos el día 🌙");
  };

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Compinche Space</p>
          <h1>Esto no es una app, es tu espacio de acompañamiento diario</h1>
        </div>
        {screen !== "landing" && (
          <button className="ghost" onClick={() => setScreen("landing")}>
            Inicio
          </button>
        )}
      </header>

      {screen === "landing" && (
        <>
          <section className="panel hero">
            <p className="badge">{dailyMessage}</p>
            <h2>Tu rutina evoluciona contigo, no al revés</h2>
            <p className="hero-copy">Diagnóstico en 2 minutos, guía paso a paso y constancia diaria estilo Duolingo.</p>

            <div className="metrics-row">
              <div className={`metric-card ${streakPulse ? "pulse" : ""}`}>
                <span>🔥 Racha actual</span>
                <strong>{streak} días</strong>
              </div>
              <div className="metric-card">
                <span>Progreso de hoy</span>
                <strong>{dailyCompletion}%</strong>
              </div>
            </div>

            <div className="cta-row">
              <button onClick={() => (savedRoutine ? setScreen("dashboard") : setScreen("quiz"))}>Empezar mi rutina</button>
              <button className="secondary" onClick={() => setScreen("quiz")}>Vamos suave</button>
            </div>
          </section>

          <section className="panel compinche-block">
            <h3>💎 Compinche del día</h3>
            <p>Tu compinche de hoy cree que necesitas esto 💖</p>
            {compincheOfDay ? (
              <div className="compinche-card">
                <div className="emoji-thumb">{compincheOfDay.image}</div>
                <div>
                  <strong>{compincheOfDay.name}</strong>
                  <p>{compincheOfDay.benefit}</p>
                </div>
                <a className="soft-link" href={compincheOfDay.prioritized.affiliateUrl}>Ver producto</a>
              </div>
            ) : (
              <p>Completa tu diagnóstico para personalizarlo.</p>
            )}
          </section>

          <section className="story-grid">
            <article className="panel story-card"><h3>Problema</h3><p>Te cuesta mantener constancia porque todo se siente complejo.</p></article>
            <article className="panel story-card"><h3>Conexión</h3><p>Aquí no hay juicio, solo un plan realista que te acompaña.</p></article>
            <article className="panel story-card"><h3>Solución</h3><p>Rutina + tracking + progreso visual + recompensas emocionales.</p></article>
            <article className="panel story-card"><h3>Acción</h3><p>Empieza hoy. Un paso pequeño ya cuenta.</p></article>
          </section>
        </>
      )}

      {screen === "quiz" && (
        <section className="panel">
          <h2>Diagnóstico consciente</h2>
          <p className="helper">Respira, son 2 minutos para construir algo que sí puedas sostener.</p>
          <div className="grid">
            <label>Tipo de piel<select value={quiz.skinType} onChange={(e) => setQuiz({ ...quiz, skinType: e.target.value })}><option value="">Selecciona...</option><option value="grasa">Grasa</option><option value="mixta">Mixta</option><option value="seca">Seca</option><option value="sensible">Sensible</option></select></label>
            <label>Nivel de compromiso<select value={quiz.commitment} onChange={(e) => setQuiz({ ...quiz, commitment: e.target.value })}><option value="bajo">Bajo</option><option value="medio">Medio</option><option value="alto">Alto</option></select></label>
            <label>Presupuesto<select value={quiz.budget} onChange={(e) => setQuiz({ ...quiz, budget: e.target.value })}><option value="bajo">Bajo</option><option value="medio">Medio</option><option value="alto">Alto</option></select></label>
          </div>
          <p className="label">¿Qué quieres mejorar primero?</p>
          <div className="chips">{["acne", "manchas", "grasa", "sensibilidad"].map((problem) => (<button key={problem} className={quiz.problems.includes(problem) ? "chip active" : "chip"} onClick={() => toggleProblem(problem)}>{problem}</button>))}</div>
          <button disabled={!quiz.skinType || quiz.problems.length === 0} onClick={() => setScreen("results")}>Ver mi resultado</button>
        </section>
      )}

      {screen === "results" && (
        <section className="panel">
          <h2>Este plan sí se siente tuyo</h2>
          <p><strong>Perfil:</strong> {generated.profileLabel}</p>
          <div className="split">
            <article><h3>Mañana</h3><ol>{generated.morningSteps.map((step) => <li key={step}>{step}</li>)}</ol></article>
            <article><h3>Noche</h3><ol>{generated.nightSteps.map((step) => <li key={step}>{step}</li>)}</ol></article>
          </div>

          <h3>Para este paso puedes usar…</h3>
          <div className="cards">
            {generated.productRecommendations.map((product) => (
              <div key={product.name} className="card">
                <div className="emoji-thumb">{product.image}</div>
                <p><strong>{product.name}</strong></p>
                <small>{product.benefit}</small>
                <a href={product.economical.affiliateUrl}>Económica (${product.economical.price})</a>
                <a href={product.middle.affiliateUrl}>Media (${product.middle.price})</a>
                <a href={product.premium.affiliateUrl}>Premium (${product.premium.price})</a>
              </div>
            ))}
          </div>

          <div className="cta-row">
            <button onClick={saveRoutine}>Guardar este plan</button>
            <button className="secondary" onClick={() => setScreen("dashboard")}>Desbloquear rutina inteligente</button>
          </div>
        </section>
      )}

      {screen === "dashboard" && (
        <section className="panel">
          <h2>Tu ritual guiado de hoy</h2>
          <div className="split">
            <article className="routine-player">
              <div className="player-top">
                <h3>{period === "morning" ? "Mañana" : "Noche"}</h3>
                <button className="ghost" onClick={() => setPeriod((prev) => (prev === "morning" ? "night" : "morning"))}>Cambiar bloque</button>
              </div>
              <p className="step-counter">Paso {Math.min(currentStep + 1, routineSteps.length)} de {routineSteps.length}</p>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${routineProgress}%` }} /></div>
              <p className="active-step">{activeStep}</p>
              <p className="helper">Haz esto conmigo</p>
              <button onClick={completeStep}>{currentStep >= routineSteps.length ? "Seguir rutina" : "Listo por hoy ✨"}</button>
            </article>

            <article>
              <h3 className={streakPulse ? "streak-title pulse" : "streak-title"}>🔥 {streak} días en racha</h3>
              <p>Sigues en racha. No lo rompas 🔥</p>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${streakToGoal}%` }} /></div>
              <small>Meta próxima: {nextMilestone} días</small>
              <div className="habit-actions">
                <label className="habit-check"><input type="checkbox" checked={Boolean(habitLog[dayKey()]?.morning)} onChange={() => markHabit("morning")} /> Rutina mañana</label>
                <label className="habit-check"><input type="checkbox" checked={Boolean(habitLog[dayKey()]?.night)} onChange={() => markHabit("night")} /> Rutina noche</label>
              </div>
              {celebration && <p className="celebration">{celebration}</p>}
            </article>
          </div>

          <section className="trend-grid">
            <article className="trend-card"><span>🔥 Trending</span><p>Doble limpieza suave</p></article>
            <article className="trend-card"><span>✨ Recomendado</span><p>SPF todos los días</p></article>
            <article className="trend-card"><span>💖 Favorito</span><p>Hidratante barrera noche</p></article>
          </section>

          <h3>Progresión personalizada</h3>
          <ul>{generated.introPlan.map((rule) => <li key={rule}>{rule}</li>)}</ul>
        </section>
      )}
    </main>
  );
}
