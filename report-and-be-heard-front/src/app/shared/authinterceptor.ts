import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Authservice } from '../services/authservice';

// Envia el JWT si hay sesion (el backend actual no lo exige, pero queda listo para cuando se active security)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(Authservice).token()
  if (token && !req.url.endsWith('/login')) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
  }
  return next(req)
}
