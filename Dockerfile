# Etapa 1: compilación
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .

# VITE_* se incrusta en el bundle al compilar: la URL debe ser la que usa el navegador, no la de la red de Docker.
ARG VITE_API_URL=http://localhost:8083
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Etapa 2: servidor estático
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
