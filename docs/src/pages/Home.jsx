import { useState, useEffect } from "react";

export default function Home() {
  const [streak, setStreak] = useState(3);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const messages = [
      "Hoy no tienes que hacerlo perfecto, solo empezar.",
      "Un pequeño paso hoy cambia tu semana.",
      "Tu versión disciplinada te está esperando.",
    ];

    const random = messages[Math.floor(Math.random() * messages.length)];
    setMessage(random);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F7FC] p-4 flex flex-col gap-6">

      {/* Saludo */}
      <div>
        <h1 className="text-xl font-semibold">Hola 👋</h1>
        <p className="text-gray-600 text-sm mt-1">{message}</p>
      </div>

      {/* Botón principal */}
      <button className="bg-black text-white py-4 rounded-2xl text-lg font-semibold">
        Comenzar mi día
      </button>

      {/* Racha */}
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <p className="text-sm text-gray-500">Tu racha</p>
        <h2 className="text-2xl font-bold">{streak} días 🔥</h2>
      </div>

      {/* Compinche del día */}
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <p className="text-sm text-gray-500">Compinche del día</p>
        <p className="mt-2 font-medium">
          Escribe 1 cosa que quieres lograr hoy.
        </p>
      </div>

      {/* Rutinas */}
      <div className="flex flex-col gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          🌅 Rutina de mañana
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm">
          🧠 Productividad
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm">
          🌙 Rutina de noche
        </div>
      </div>

    </div>
  );
}
