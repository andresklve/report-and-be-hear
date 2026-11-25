import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from '../services/authservice';

export const sesionGuard: CanActivateFn = (_route, state) => {
  const auth = inject(Authservice)
  return auth.sesion() ? true : inject(Router).createUrlTree(['/ingresar'], { queryParams: { volver: state.url } })
}

export const equipoGuard: CanActivateFn = (_route, state) => {
  const auth = inject(Authservice)
  const router = inject(Router)
  if (!auth.sesion()) return router.createUrlTree(['/ingresar'], { queryParams: { volver: state.url } })
  return auth.esEquipo() ? true : router.createUrlTree(['/'])
}

export const adminGuard: CanActivateFn = () => {
  const auth = inject(Authservice)
  return auth.esAdmin() ? true : inject(Router).createUrlTree(['/panel'])
}
