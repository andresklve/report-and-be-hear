import { RenderMode, ServerRoute } from '@angular/ssr';

// Todas las paginas consumen el backend, por eso se renderizan en el navegador.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
