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

## Integrante

| Nombre | Rol |
|---|---|
| Karla Ramírez Hidalgo | Desarrollo full stack, análisis y gestión del proyecto (trabajo individual) |

## Metodología de trabajo

Kanban: backlog priorizado con jerarquía Épica → Historia de Usuario → Tarea, tablero con estados
(Por Hacer / En desarrollo / Terminado)
