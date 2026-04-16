# Compinche Space — Product Blueprint

## 1) Estructura de la app (pantallas y flujo)

1. **Landing**
   - Headline: "Descubre tu rutina ideal en 2 minutos"
   - CTA: "Hacer diagnóstico"
2. **Quiz de diagnóstico**
   - tipo de piel, problemas, compromiso, presupuesto
3. **Resultados**
   - perfil generado + rutina mañana/noche + productos con afiliados
   - CTA guardar rutina gratis
   - Upsell a rutina dinámica (plan Pro)
4. **Dashboard**
   - rutina activa por mañana/noche
   - tracker diario y streak
   - progresión por fase según consistencia

## 2) Modelo de datos básico (Supabase)

- `users`
  - `id uuid pk`
  - `email text unique`
  - `plan text check (plan in ('free','pro'))`
  - `stripe_customer_id text`
  - `created_at timestamptz`
- `quiz_responses`
  - `id uuid pk`
  - `user_id uuid fk users(id)`
  - `skin_type text`
  - `problems text[]`
  - `commitment text`
  - `budget text`
  - `created_at timestamptz`
- `routines`
  - `id uuid pk`
  - `user_id uuid fk users(id)`
  - `quiz_response_id uuid fk quiz_responses(id)`
  - `morning_steps jsonb`
  - `night_steps jsonb`
  - `product_recommendations jsonb`
  - `phase int`
  - `is_active bool`
  - `created_at timestamptz`
- `habit_logs`
  - `id uuid pk`
  - `user_id uuid fk users(id)`
  - `routine_id uuid fk routines(id)`
  - `date date`
  - `morning_completed jsonb`
  - `night_completed jsonb`
  - `streak_count int`
- `products`
  - `id uuid pk`
  - `name text`
  - `category text`
  - `tier text`
  - `price numeric`
  - `affiliate_url text`
  - `skin_types text[]`
  - `problems text[]`

## 3) Lógica de generación de rutina

Reglas backend (`/api/generate-routine` en Next.js):

- IF `skinType = grasa` AND `problem includes acne`
  - evitar productos pesados
  - máximo 4 pasos
  - retinol solo después del día 14
- IF `skinType = sensible` OR `problem includes sensibilidad`
  - excluir BHA, retinol, vitamina C alta concentración
  - priorizar fórmulas sin fragancia
- IF `commitment = bajo`
  - máximo 3 pasos
  - no activos hasta fase 3
- IF `budget = bajo`
  - priorizar tier económico
- IF `day >= 14` AND `streak >= 10`
  - desbloquear siguiente fase
  - añadir paso nuevo por perfil

## 4) Ejemplo real de resultado

Entrada:
- piel: grasa
- problemas: acné + sensibilidad
- compromiso: medio
- presupuesto: bajo

Salida esperada:
- Perfil: "Piel grasa con tendencia a acné y sensibilidad"
- Mañana: limpieza suave, hidratante ligera, SPF
- Noche: limpieza, tratamiento calmante antiacné, hidratante
- Fase 1: sin retinol
- Fase 2 (día >=14 y streak>=10): activo nocturno 2 veces/semana

## 5) Estructura inicial del dashboard

- Tarjeta "Rutina actual" (mañana/noche)
- Tarjeta "Tracker" (check mañana / check noche)
- Tarjeta "Streak y fase"
- Tarjeta "Próximos desbloqueos"
- Módulo Pro: guías y ajustes automáticos
