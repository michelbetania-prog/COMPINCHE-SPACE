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

export default function App() {
  const [screen, setScreen] = useState("start"); // 🔥 CAMBIO CLAVE
  const [streak, setStreak] = useState(3);
  const [activeRoutine, setActiveRoutine] = useState(null);

  const startRoutine = (key) => {
    setActiveRoutine(key);
    setScreen("flow");
  };

  return (
    <main style={{ padding: "20px" }}>
      
      {/* 🔥 PANTALLA NUEVA */}
      {screen === "start" && (
        <div style={{ textAlign: "center" }}>
          <h1>Hola 👋</h1>
          <p>Hoy no tienes que hacerlo perfecto, solo empezar.</p>

          <button
            style={{ marginTop: "20px", padding: "15px" }}
            onClick={() => startRoutine("focus")}
          >
            Comenzar mi día
          </button>

          <p style={{ marginTop: "10px" }}>
            Racha: {streak} días 🔥
          </p>
        </div>
      )}

      {/* 🔥 TU SISTEMA SIGUE VIVO */}
      {screen === "flow" && (
        <div>
          <h2>Modo enfoque activado ⚡</h2>
          <p>Ya entraste al flujo. Aquí sigue tu sistema.</p>

          <button onClick={() => setScreen("start")}>
            Volver
          </button>
        </div>
      )}

    </main>
  );
}
