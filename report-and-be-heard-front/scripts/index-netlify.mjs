// El build de Angular (con SSR en modo cliente) genera index.csr.html.
// Netlify sirve archivos estaticos y necesita index.html, asi que se copia.
import { copyFileSync, existsSync } from 'node:fs';

const carpeta = 'dist/report-and-be-heard-front/browser';
if (existsSync(`${carpeta}/index.csr.html`)) {
  copyFileSync(`${carpeta}/index.csr.html`, `${carpeta}/index.html`);
  console.log('index.html listo para Netlify');
}
