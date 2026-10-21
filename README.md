# Lexquant

App mobile de Lexquant. Muestra las mismas pantallas, feature flags, whitelist y métricas que la web, leyendo la API de `Lexquant/apps/api` (Mongo `lexquant`).

## Qué comparte con la web

- Login y registro contra `/api/auth/*`. La sesión es el mismo JWT: la web lo guarda en cookie y la app lo manda como `Authorization: Bearer`.
- Feature flags de `/api/feature-flags/me`. Una pantalla apagada no la ve nadie; prendida, la ven los admins y los correos de la whitelist.
- Dashboard de `/api/dashboard/resumen-ejecutivo` y `/api/dashboard/filtros`, con los mismos filtros.
- Administración (`/api/admin/*`) para quienes tienen rol `admin`: acceso por usuario y encendido de cada flag.

La carga de fallos valida el mismo formulario que la web. Todavía no hay endpoint de alta, así que no escribe en la base.

## Cómo correrla

1. En `Lexquant/apps/api`, levantá la API (`npm run dev`). Tiene que ser la versión que acepta Bearer y devuelve `token` en el login.
2. Desde esta carpeta:

```bash
npm install
npx expo start
```

En el simulador de iOS, la app usa `http://localhost:8001` si no hay otra URL. En un teléfono físico usa el host de Metro, también en el puerto 8001. Para fijarla, copiá `.env.example` a `.env` y ajustá `EXPO_PUBLIC_API_URL`.

## Estructura

```
src/app/            pantallas (Expo Router)
src/api/            cliente HTTP de la API compartida
src/auth/           sesión y contexto de usuario
src/features/       feature flags del usuario
src/dashboard/      filtros y formato de métricas
src/queries/        React Query del resumen
src/components/     UI, gráficos, drawer y bloques del dashboard
src/theme/          paleta clara/oscura, la misma de la web
src/types/          contratos de la API
```
