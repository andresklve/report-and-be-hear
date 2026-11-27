import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { Authservice } from '../services/authservice';
import { limpiarDatos } from '../services/datosservice';

// Envia el JWT si hay sesion (el backend actual no lo exige, pero queda listo para cuando se active security)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(Authservice).token()
  if (token && !req.url.endsWith('/login')) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
  }
  // Al guardar algo, los datos en cache ya no sirven: se vuelven a descargar
  if (req.method !== 'GET') {
    return next(req).pipe(tap({ next: e => { if (e instanceof HttpResponse) limpiarDatos() }, error: () => limpiarDatos() }))
  }
  return next(req)
}
