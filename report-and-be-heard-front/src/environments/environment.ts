// Produccion (ng build). En Netlify este archivo lo reescribe scripts/set-env.mjs
// con la variable de entorno API_URL (la URL del backend en AWS).
export const environment = {
  production: true,
  base: 'http://localhost:8084'
};
