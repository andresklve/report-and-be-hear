# ReclamaYA

Plataforma para reportar problemas de la ciudad y ver los reclamos en un mapa del Perú.

| Carpeta | Contenido |
|---|---|
| [`report-and-be-hear-api/`](report-and-be-hear-api) | Backend REST – Java 21, Spring Boot, PostgreSQL (puerto 8084) |
| [`report-and-be-heard-front/`](report-and-be-heard-front) | Frontend – Angular 21 + Leaflet (puerto 4200) |

## Ejecutar
```bash
# Backend
cd report-and-be-hear-api
./mvnw spring-boot:run

# Frontend (en otra terminal)
cd report-and-be-heard-front
npm install
npm start
```
