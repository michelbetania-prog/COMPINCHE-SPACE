import { useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { challenges, motivationalMessages } from "./data/challenges";
import "./styles.css";

const viewStates = {
  welcome: "welcome",
  onboarding: "onboarding",
  challenges: "challenges",
  active: "active",
  progress: "progress",
};

const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (dateString, daysToAdd) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + daysToAdd);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const diffInDays = (startDate) => {
  const start = new Date(startDate);
  const today = new Date();
  const startMidnight = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return Math.floor((todayMidnight - startMidnight) / (1000 * 60 * 60 * 24));
};

const getMotivation = () => {
  const index = Math.floor(Math.random() * motivationalMessages.length);
  return motivationalMessages[index];
};

const getCompletionRatio = (dayEntry, habits) => {
  if (!dayEntry) return 0;
  const completedCount = Object.values(dayEntry.completed || {}).filter(Boolean)
    .length;
  return completedCount / habits.length;
};

const createDayEntry = (habits) => ({
  completed: habits.reduce((acc, _, index) => {
    acc[index] = false;
    return acc;
  }, {}),
});

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState(viewStates.welcome);
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [authError, setAuthError] = useState("");
  const [motivation, setMotivation] = useState(getMotivation());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      if (!user) {
        setProfile(null);
        setView(viewStates.welcome);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authUser) return undefined;

    const userRef = doc(db, "users", authUser.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (!snapshot.exists()) {
        const baseProfile = {
          displayName: authUser.displayName || "",
          onboarded: false,
          recommendedChallengeId: "",
          activeChallenge: null,
        };
        setDoc(userRef, baseProfile, { merge: true });
        setProfile(baseProfile);
        setView(viewStates.onboarding);
        return;
      }

      const data = snapshot.data();
      setProfile(data);
      if (!data.onboarded) {
        setView(viewStates.onboarding);
      } else if (!data.activeChallenge) {
        setView(viewStates.challenges);
      } else {
        setView(viewStates.active);
      }
    });

    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    setMotivation(getMotivation());
  }, [view]);

  const handleAuthChange = (event) => {
    setFormState((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setAuthError("");
    const { email, password, name } = formState;
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (name) {
        await updateProfile(credential.user, { displayName: name });
      }
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthError("");
    const { email, password } = formState;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleOnboarding = async (recommendedId) => {
    if (!authUser) return;
    await updateDoc(doc(db, "users", authUser.uid), {
      onboarded: true,
      recommendedChallengeId: recommendedId,
    });
    setView(viewStates.challenges);
  };

  const startChallenge = async (challenge) => {
    if (!authUser) return;
    const startDate = new Date().toISOString();
    const dayKey = getTodayKey();
    const dayEntry = createDayEntry(challenge.habits);

    await updateDoc(doc(db, "users", authUser.uid), {
      activeChallenge: {
        id: challenge.id,
        title: challenge.title,
        duration: challenge.duration,
        habits: challenge.habits,
        startDate,
        daily: {
          [dayKey]: dayEntry,
        },
      },
    });
    setView(viewStates.active);
  };

  const updateDailyHabit = async (habitIndex) => {
    if (!authUser || !profile?.activeChallenge) return;
    const dayKey = getTodayKey();
    const activeChallenge = profile.activeChallenge;
    const existingDay =
      activeChallenge.daily?.[dayKey] || createDayEntry(activeChallenge.habits);

    const updatedDay = {
      ...existingDay,
      completed: {
        ...existingDay.completed,
        [habitIndex]: !existingDay.completed?.[habitIndex],
      },
    };

    await updateDoc(doc(db, "users", authUser.uid), {
      [`activeChallenge.daily.${dayKey}`]: updatedDay,
    });
  };

  const ensureToday = async () => {
    if (!authUser || !profile?.activeChallenge) return;
    const dayKey = getTodayKey();
    const activeChallenge = profile.activeChallenge;
    if (activeChallenge.daily?.[dayKey]) return;

    const dayEntry = createDayEntry(activeChallenge.habits);
    await updateDoc(doc(db, "users", authUser.uid), {
      [`activeChallenge.daily.${dayKey}`]: dayEntry,
    });
  };

  useEffect(() => {
    ensureToday();
  }, [profile?.activeChallenge]);

  const activeChallenge = profile?.activeChallenge;
  const todayKey = getTodayKey();

  const todayEntry = useMemo(() => {
    if (!activeChallenge) return null;
    return activeChallenge.daily?.[todayKey] || null;
  }, [activeChallenge, todayKey]);

  const completionRatio = useMemo(() => {
    if (!activeChallenge) return 0;
    return getCompletionRatio(todayEntry, activeChallenge.habits);
  }, [activeChallenge, todayEntry]);

  const completionPercent = Math.round(completionRatio * 100);

  const validDays = useMemo(() => {
    if (!activeChallenge) return 0;
    const entries = Object.values(activeChallenge.daily || {});
    return entries.filter(
      (entry) => getCompletionRatio(entry, activeChallenge.habits) >= 0.6
    ).length;
  }, [activeChallenge]);

  const totalProgress = useMemo(() => {
    if (!activeChallenge) return 0;
    return Math.min(
      100,
      Math.round((validDays / activeChallenge.duration) * 100)
    );
  }, [activeChallenge, validDays]);

  const dayNumber = useMemo(() => {
    if (!activeChallenge) return 1;
    const diff = diffInDays(activeChallenge.startDate) + 1;
    return Math.min(activeChallenge.duration, Math.max(1, diff));
  }, [activeChallenge]);

  const isChallengeComplete =
    activeChallenge && validDays >= activeChallenge.duration;

  const recommendedId = profile?.recommendedChallengeId;

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="eyebrow">Retos suaves de hábitos</p>
          <h1>Constancia amable</h1>
        </div>
        {authUser && (
          <button className="link" type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        )}
      </header>

      <main className="app__main">
        {authUser && !profile && (
          <section className="panel">
            <h2>Preparando tu espacio</h2>
            <p>Estamos sincronizando tu información de hábitos.</p>
          </section>
        )}
        {view === viewStates.welcome && (
          <section className="panel">
            <h2>Bienvenida</h2>
            <p>
              Esta app te acompaña a cumplir pequeños hábitos diarios con calma y
              sin presión.
            </p>
            <div className="auth">
              <form className="card" onSubmit={handleRegister}>
                <h3>Crear cuenta</h3>
                <label>
                  Nombre
                  <input
                    name="name"
                    value={formState.name}
                    onChange={handleAuthChange}
                    placeholder="Tu nombre"
                  />
                </label>
                <label>
                  Correo
                  <input
                    type="email"
                    name="email"
                    value={formState.email}
                    onChange={handleAuthChange}
                    placeholder="tu@email.com"
                    required
                  />
                </label>
                <label>
                  Contraseña
                  <input
                    type="password"
                    name="password"
                    value={formState.password}
                    onChange={handleAuthChange}
                    placeholder="••••••"
                    required
                  />
                </label>
                <button type="submit">Crear cuenta</button>
              </form>
              <form className="card" onSubmit={handleLogin}>
                <h3>Iniciar sesión</h3>
                <p className="helper">
                  Usa el mismo correo y contraseña.
                </p>
                <label>
                  Correo
                  <input
                    type="email"
                    name="email"
                    value={formState.email}
                    onChange={handleAuthChange}
                    placeholder="tu@email.com"
                    required
                  />
                </label>
                <label>
                  Contraseña
                  <input
                    type="password"
                    name="password"
                    value={formState.password}
                    onChange={handleAuthChange}
                    placeholder="••••••"
                    required
                  />
                </label>
                <button type="submit">Entrar</button>
              </form>
            </div>
            {authError && <p className="error">{authError}</p>}
          </section>
        )}

        {view === viewStates.onboarding && (
          <section className="panel">
            <h2>Onboarding rápido</h2>
            <p>
              Responde con honestidad: ¿qué ritmo sientes más realista para ti?
            </p>
            <div className="choices">
              <button
                type="button"
                onClick={() => handleOnboarding("reto-15")}
              >
                Quiero empezar suave (15 días)
              </button>
              <button
                type="button"
                onClick={() => handleOnboarding("reto-21")}
              >
                Puedo comprometerme más (21 días)
              </button>
            </div>
            <p className="helper">
              Recomendaremos un reto, pero siempre podrás elegir.
            </p>
          </section>
        )}

        {view === viewStates.challenges && (
          <section className="panel">
            <h2>Elige tu reto</h2>
            <p>Selecciona el desafío que mejor se adapte a tu momento.</p>
            <div className="challenge-grid">
              {challenges.map((challenge) => (
                <article
                  key={challenge.id}
                  className={`challenge-card${
                    challenge.id === recommendedId ? " highlight" : ""
                  }`}
                >
                  <h3>{challenge.title}</h3>
                  <p>{challenge.duration} días de hábitos esenciales.</p>
                  <ul>
                    {challenge.habits.map((habit) => (
                      <li key={habit}>{habit}</li>
                    ))}
                  </ul>
                  {challenge.id === recommendedId && (
                    <span className="tag">Recomendado para ti</span>
                  )}
                  <button type="button" onClick={() => startChallenge(challenge)}>
                    Elegir este reto
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {view === viewStates.active && activeChallenge && (
          <section className="panel">
            <div className="panel__header">
              <div>
                <h2>{activeChallenge.title}</h2>
                <p>
                  Día {dayNumber} de {activeChallenge.duration}
                </p>
              </div>
              <button type="button" onClick={() => setView(viewStates.progress)}>
                Ver progreso
              </button>
            </div>

            <p className="motivation">{motivation}</p>

            <div className="progress">
              <div>
                <p>Progreso de hoy</p>
                <strong>{completionPercent}%</strong>
              </div>
              <div>
                <p>Días válidos</p>
                <strong>
                  {validDays}/{activeChallenge.duration}
                </strong>
              </div>
              <div>
                <p>Progreso total</p>
                <strong>{totalProgress}%</strong>
              </div>
            </div>

            <div className="progress-bar" aria-hidden="true">
              <div
                className="progress-bar__fill"
                style={{ width: `${totalProgress}%` }}
              />
            </div>

            {isChallengeComplete && (
              <div className="completion">
                <strong>¡Reto completado!</strong>
                <p>Gracias por priorizarte con constancia amable.</p>
              </div>
            )}

            <ul className="checklist">
              {activeChallenge.habits.map((habit, index) => (
                <li key={habit}>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={todayEntry?.completed?.[index] || false}
                      onChange={() => updateDailyHabit(index)}
                    />
                    <span>{habit}</span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="helper">
              Un día cuenta como válido al completar al menos el 60% de los
              hábitos.
            </p>
          </section>
        )}

        {view === viewStates.progress && activeChallenge && (
          <section className="panel">
            <div className="panel__header">
              <div>
                <h2>Progreso</h2>
                <p>{activeChallenge.title}</p>
              </div>
              <button type="button" onClick={() => setView(viewStates.active)}>
                Volver al reto
              </button>
            </div>
            <p className="motivation">{motivation}</p>
            <div className="progress-summary">
              <div>
                <strong>{validDays}</strong>
                <span>Días válidos</span>
              </div>
              <div>
                <strong>{activeChallenge.duration}</strong>
                <span>Días totales</span>
              </div>
              <div>
                <strong>{totalProgress}%</strong>
                <span>Progreso global</span>
              </div>
            </div>
            <div className="timeline">
              {Array.from({ length: activeChallenge.duration }, (_, index) => {
                const dayIndex = index + 1;
                const entryKey = addDays(activeChallenge.startDate, index);
                const entry = activeChallenge.daily?.[entryKey] || null;
                const ratio = getCompletionRatio(entry, activeChallenge.habits);
                const isValid = ratio >= 0.6;
                return (
                  <div key={dayIndex} className="timeline__item">
                    <span>Día {dayIndex}</span>
                    <span className={isValid ? "valid" : "pending"}>
                      {entry ? (isValid ? "Válido" : "En progreso") : "Pendiente"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
