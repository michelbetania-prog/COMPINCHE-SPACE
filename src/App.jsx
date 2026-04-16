import { useMemo, useState } from "react";
import "./styles.css";

const PRODUCT_CATALOG = [
  {
    id: "gel-cleanser-basic",
    name: "Gel limpiador con salicílico 2%",
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
    category: "spf",
    tiers: {
      low: { label: "Opción económica", price: 11, affiliateUrl: "https://amazon.com" },
      mid: { label: "Opción media", price: 19, affiliateUrl: "https://walmart.com" },
      premium: { label: "Opción premium", price: 36, affiliateUrl: "https://dermstore.com" },
    },
    skinTypes: ["grasa", "mixta", "normal", "sensible"],
    problems: ["manchas", "acne", "sensibilidad"],
  },
  {
    id: "barrier-cream",
    name: "Crema barrera con ceramidas",
    category: "hidratante",
    tiers: {
      low: { label: "Opción económica", price: 12, affiliateUrl: "https://target.com" },
      mid: { label: "Opción media", price: 22, affiliateUrl: "https://amazon.com" },
      premium: { label: "Opción premium", price: 38, affiliateUrl: "https://dermstore.com" },
    },
    skinTypes: ["seca", "sensible"],
    problems: ["sensibilidad", "manchas"],
  },
];

const commitmentCap = { bajo: 3, medio: 4, alto: 5 };

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
  const introPlan = ["Día 1-3: limpieza + hidratante", "Día 5: añadir hidratante objetivo", "Día 10: introducir SPF diario"];

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

  const baseMorning = ["Limpieza suave", "Hidratante ligera", "Protector solar SPF 50"];
  const baseNight = ["Limpieza", "Tratamiento objetivo", "Hidratante"];

  const morningSteps = baseMorning.slice(0, maxSteps);
  const nightSteps = baseNight.slice(0, maxSteps);

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
    category: item.category,
    name: item.name,
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
    blockedIngredients,
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

  const streak = useMemo(() => {
    const entries = Object.keys(habitLog).sort().reverse();
    let count = 0;
    for (const key of entries) {
      if (habitLog[key]?.morning && habitLog[key]?.night) count += 1;
      else break;
    }
    return count;
  }, [habitLog]);

  const elapsedDays = useMemo(() => {
    if (!savedRoutine?.createdAt) return 1;
    const start = new Date(savedRoutine.createdAt);
    const now = new Date();
    return Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1);
  }, [savedRoutine]);

  const generated = useMemo(() => applyRules(quiz, elapsedDays, streak), [quiz, elapsedDays, streak]);

  const toggleProblem = (problem) => {
    setQuiz((prev) => ({
      ...prev,
      problems: prev.problems.includes(problem)
        ? prev.problems.filter((p) => p !== problem)
        : [...prev.problems, problem],
    }));
  };

  const saveRoutine = () => {
    setSavedRoutine({ quiz, routine: generated, createdAt: new Date().toISOString(), plan: "free" });
    setScreen("dashboard");
  };

  const markHabit = (slot) => {
    const today = dayKey();
    setHabitLog((prev) => ({
      ...prev,
      [today]: {
        ...prev[today],
        [slot]: !prev[today]?.[slot],
      },
    }));
  };

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Compinche Space</p>
          <h1>Plataforma de autocuidado con lógica de negocio</h1>
        </div>
        {screen !== "landing" && <button onClick={() => setScreen("landing")}>Inicio</button>}
      </header>

      {screen === "landing" && (
        <section className="panel hero">
          <h2>Descubre tu rutina ideal en 2 minutos</h2>
          <p>Diagnóstico guiado + motor de reglas + progresión por adherencia.</p>
          <button onClick={() => setScreen("quiz")}>Hacer diagnóstico</button>
        </section>
      )}

      {screen === "quiz" && (
        <section className="panel">
          <h2>Quiz de diagnóstico</h2>
          <div className="grid">
            <label>
              Tipo de piel
              <select value={quiz.skinType} onChange={(e) => setQuiz({ ...quiz, skinType: e.target.value })}>
                <option value="">Selecciona...</option>
                <option value="grasa">Grasa</option>
                <option value="mixta">Mixta</option>
                <option value="seca">Seca</option>
                <option value="sensible">Sensible</option>
              </select>
            </label>
            <label>
              Compromiso
              <select value={quiz.commitment} onChange={(e) => setQuiz({ ...quiz, commitment: e.target.value })}>
                <option value="bajo">Bajo</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
              </select>
            </label>
            <label>
              Presupuesto
              <select value={quiz.budget} onChange={(e) => setQuiz({ ...quiz, budget: e.target.value })}>
                <option value="bajo">Bajo</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
              </select>
            </label>
          </div>
          <p className="label">Problemas principales</p>
          <div className="chips">
            {["acne", "manchas", "grasa", "sensibilidad"].map((problem) => (
              <button key={problem} className={quiz.problems.includes(problem) ? "chip active" : "chip"} onClick={() => toggleProblem(problem)}>
                {problem}
              </button>
            ))}
          </div>
          <button disabled={!quiz.skinType || quiz.problems.length === 0} onClick={() => setScreen("results")}>Ver resultado</button>
        </section>
      )}

      {screen === "results" && (
        <section className="panel">
          <h2>Resultado personalizado</h2>
          <p><strong>Perfil:</strong> {generated.profileLabel}</p>
          <div className="split">
            <article>
              <h3>Mañana</h3>
              <ol>{generated.morningSteps.map((step) => <li key={step}>{step}</li>)}</ol>
            </article>
            <article>
              <h3>Noche</h3>
              <ol>{generated.nightSteps.map((step) => <li key={step}>{step}</li>)}</ol>
            </article>
          </div>

          <h3>Productos recomendados con afiliados</h3>
          <div className="cards">
            {generated.productRecommendations.map((product) => (
              <div key={product.name} className="card">
                <p><strong>{product.name}</strong></p>
                <a href={product.economical.affiliateUrl}>Económica (${product.economical.price})</a>
                <a href={product.middle.affiliateUrl}>Media (${product.middle.price})</a>
                <a href={product.premium.affiliateUrl}>Premium (${product.premium.price})</a>
              </div>
            ))}
          </div>

          <div className="cta-row">
            <button onClick={saveRoutine}>Guarda tu rutina gratis</button>
            <button className="secondary" onClick={() => setScreen("dashboard")}>Desbloquea tu rutina inteligente que evoluciona contigo</button>
          </div>
        </section>
      )}

      {screen === "dashboard" && (
        <section className="panel">
          <h2>Dashboard</h2>
          <p>Fase actual: <strong>{generated.phase}</strong> · Streak: <strong>{streak}</strong> días</p>
          <div className="split">
            <article>
              <h3>Rutina actual</h3>
              <p>Mañana y noche por día:</p>
              <ul>
                <li>Lunes a domingo (mañana): {generated.morningSteps.join(" → ")}</li>
                <li>Lunes a domingo (noche): {generated.nightSteps.join(" → ")}</li>
              </ul>
            </article>
            <article>
              <h3>Tracker de hábitos</h3>
              <p>Día {elapsedDays}: marca completado para habilitar progresión.</p>
              <div className="cta-row">
                <button onClick={() => markHabit("morning")}>Check mañana</button>
                <button onClick={() => markHabit("night")}>Check noche</button>
              </div>
              <p>Hoy: mañana {habitLog[dayKey()]?.morning ? "✅" : "⬜"} · noche {habitLog[dayKey()]?.night ? "✅" : "⬜"}</p>
            </article>
          </div>

          <h3>Sistema de progresión</h3>
          <ul>
            {generated.introPlan.map((rule) => <li key={rule}>{rule}</li>)}
          </ul>
          <h3>Reglas activas del motor</h3>
          <ul>
            {generated.rules.map((rule) => <li key={rule}>{rule}</li>)}
          </ul>
        </section>
      )}
    </main>
  );
}
