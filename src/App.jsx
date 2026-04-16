import { useEffect, useMemo, useState } from "react";
import "./styles.css";

const routineTemplates = {
  sleep: {
    title: "😴 Modo descanso profundo",
    steps: [
      { label: "🌗 Check-out emocional", helper: "¿Cómo te sientes antes de dormir?" },
      { label: "🧠 Vaciar mente", helper: "Escribe 1 cosa que te preocupa" },
    ],
    close: "Descansa.",
  },
  journaling: {
    title: "✍️ Journaling",
    steps: [
      { label: "Pregunta", helper: "Escribe sin filtro" },
    ],
    close: "Bien hecho.",
  },
  stress: {
    title: "😮‍💨 Reset",
    steps: [
      { label: "Respira", helper: "Inhala y exhala lento" },
    ],
    close: "Más calma.",
  },
  focus: {
    title: "⚡ Modo enfoque",
    steps: [
      { label: "🎯 Define tarea", helper: "Una prioridad concreta" },
      { label: "⏱️ Enfócate", helper: "Sin distracciones" },
      { label: "✅ Cierre", helper: "Avanzaste hoy" },
    ],
    close: "Trabajo hecho.",
  },
};

export default function App() {
  const [screen, setScreen] = useState("start");
  const [streak, setStreak] = useState(3);
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [step, setStep] = useState(0);

  const startRoutine = (key) => {
    setActiveRoutine(key);
    setStep(0);
    setScreen("flow");
  };

  const nextStep = () => {
    const total = routineTemplates[activeRoutine].steps.length;

    if (step < total - 1) {
      setStep(step + 1);
    } else {
      setScreen("home");
      setActiveRoutine(null);
    }
  };

  return (
    <main style={{ padding: "20px" }}>

      {/* 🔥 START */}
      {screen === "start" && (
        <div style={{ textAlign: "center" }}>
          <h1>Hola 👋</h1>
          <p>Hoy no tienes que hacerlo perfecto, solo empezar.</p>

          <button
            style={{
              marginTop: "20px",
              padding: "15px",
              borderRadius: "12px"
            }}
            onClick={() => startRoutine("focus")}
          >
            Comenzar mi día
          </button>

          <p style={{ marginTop: "10px" }}>
            Racha: {streak} días 🔥
          </p>
        </div>
      )}

      {/* 🔥 FLOW */}
      {screen === "flow" && activeRoutine && (
        <div>
          <h2>{routineTemplates[activeRoutine].title}</h2>

          <p>
            {routineTemplates[activeRoutine].steps[step].label}
          </p>

          <p>
            {routineTemplates[activeRoutine].steps[step].helper}
          </p>

          <button onClick={nextStep}>
            {step === routineTemplates[activeRoutine].steps.length - 1
              ? "Finalizar"
              : "Siguiente"}
          </button>
        </div>
      )}

      {/* 🔥 HOME (TU SISTEMA) */}
      {screen === "home" && (
        <div>
          <h2>Tu dashboard</h2>

          <button onClick={() => startRoutine("focus")}>
            Enfocarme
          </button>

          <button onClick={() => startRoutine("journaling")}>
            Journaling
          </button>

          <button onClick={() => startRoutine("stress")}>
            Reducir estrés
          </button>

          <button onClick={() => startRoutine("sleep")}>
            Dormir mejor
          </button>
        </div>
      )}

    </main>
  );
}
