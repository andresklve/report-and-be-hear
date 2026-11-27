// Antes del build de produccion: escribe src/environments/environment.ts con la URL del backend.
// En Netlify se define la variable API_URL (ej. https://api.reclamaya.com). Sin ella, el build
// en Netlify falla a proposito, para no publicar un front que llama a localhost.
import { writeFileSync } from 'node:fs';

const api = (process.env.API_URL ?? '').trim().replace(/\/+$/, '');

if (!api) {
  if (process.env.NETLIFY) {
    console.error('Falta la variable API_URL en Netlify (Site configuration > Environment variables).');
    process.exit(1);
  }
  console.log('API_URL no definida: se usa http://localhost:8084');
  process.exit(0);
}

writeFileSync('src/environments/environment.ts',
  `export const environment = {\n  production: true,\n  base: '${api}'\n};\n`);
console.log(`environment.ts -> base: ${api}`);
