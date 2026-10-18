# Promaty — Frontend

Frontend de Promaty: sistema de gestión de solicitudes para el ciclo de vida del colaborador,
desarrollado para una empresa del rubro construcción, como Proyecto de Título (CAPSTONE).

Descripción completa del proyecto, arquitectura e integrantes en el repositorio de evidencias
académicas: [CAPSTONE_003V](https://github.com/KarlaRamirez00/CAPSTONE_003V).

## Tecnologías

- Vue 3 (`<script setup>`)
- TypeScript
- Vite
- Vuetify

## Requisitos previos

- Node.js (versión compatible con Vite 5+)
- El backend corriendo (ver [promaty-backend](https://github.com/KarlaRamirez00/promaty-backend))

## Configuración

Crea un archivo `.env` en la raíz con la URL del backend (gateway):

```
VITE_API_URL=http://localhost:8083
```

## Instalación y ejecución local

```bash
npm install
npm run dev
```

Otros comandos disponibles:

```bash
npm run build     # build de producción
npm run preview   # previsualizar el build
npm run lint      # lint del proyecto
```

## Docker

El `Dockerfile` compila la app (Node) y la sirve con nginx. El `docker-compose.yml` de este repo incluye el
compose del backend (`../promaty-backend`, carpeta hermana) y levanta todo el sistema con un comando:

```bash
# 1. Configura el .env del backend (ver su README), con CORS_ALLOWED_ORIGINS=http://localhost:5173
# 2. Desde este repo:
docker compose up --build
```

Frontend en http://localhost:5173 y gateway en http://localhost:8083.

| Variable | Dónde se usa | Por defecto |
|---|---|---|
| `VITE_API_URL` | Build del frontend. Se incrusta en el bundle: es la URL del gateway **vista desde el navegador** | `http://localhost:8083` |
| `FRONTEND_PORT` | Puerto publicado del frontend | `5173` |

Las variables del backend (`DB_*`, `JWT_SECRET`, puertos, `CORS_ALLOWED_ORIGINS`) se leen de `../promaty-backend/.env`.
Si cambias `VITE_API_URL`, reconstruye la imagen (`docker compose build frontend`). Solo el frontend:

```bash
docker build -t promaty-frontend --build-arg VITE_API_URL=http://localhost:8083 .
docker run -p 5173:80 promaty-frontend
```

## Integrante

| Nombre | Rol |
|---|---|
| Karla Ramírez Hidalgo | Desarrollo full stack, análisis y gestión del proyecto (trabajo individual) |

## Metodología de trabajo

Kanban: backlog priorizado con jerarquía Épica → Historia de Usuario → Tarea, tablero con estados
(Por Hacer / En desarrollo / Terminado)
