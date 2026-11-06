import { Routes } from '@angular/router';
import { sesionGuard, equipoGuard, adminGuard } from './shared/guards';
// Publico
import { Mapaperucomponent } from './components/mapaperucomponent/mapaperucomponent';
import { Detallecomponent } from './components/detallecomponent/detallecomponent';
import { Reportarcomponent } from './components/reportarcomponent/reportarcomponent';
// Cuenta
import { Authcomponent } from './components/authcomponent/authcomponent';
import { Logincomponent } from './components/authcomponent/logincomponent/logincomponent';
import { Registrocomponent } from './components/authcomponent/registrocomponent/registrocomponent';
import { Misreportescomponent } from './components/misreportescomponent/misreportescomponent';
// Panel (Municipalidad / Administrador)
import { Panelcomponent } from './components/panelcomponent/panelcomponent';
import { Resumencomponent } from './components/resumencomponent/resumencomponent';
import { Bandejacomponent } from './components/bandejacomponent/bandejacomponent';
import { Moderacioncomponent } from './components/moderacioncomponent/moderacioncomponent';
import { Moderacionlistcomponent } from './components/moderacioncomponent/moderacionlistcomponent/moderacionlistcomponent';
import { Zonacomponent } from './components/zonacomponent/zonacomponent';
import { Zonalistcomponent } from './components/zonacomponent/zonalistcomponent/zonalistcomponent';
import { Zonainsertcomponent } from './components/zonacomponent/zonainsertcomponent/zonainsertcomponent';
import { Categoriacomponent } from './components/categoriacomponent/categoriacomponent';
import { Categorialistcomponent } from './components/categoriacomponent/categorialistcomponent/categorialistcomponent';
import { Categoriainsertcomponent } from './components/categoriacomponent/categoriainsertcomponent/categoriainsertcomponent';
import { Usuariocomponent } from './components/usuariocomponent/usuariocomponent';
import { Usuariolistcomponent } from './components/usuariocomponent/usuariolistcomponent/usuariolistcomponent';
import { Usuarioinsertcomponent } from './components/usuariocomponent/usuarioinsertcomponent/usuarioinsertcomponent';
import { Rolcomponent } from './components/rolcomponent/rolcomponent';
import { Rollistcomponent } from './components/rolcomponent/rollistcomponent/rollistcomponent';
import { Rolinsertcomponent } from './components/rolcomponent/rolinsertcomponent/rolinsertcomponent';

export const routes: Routes = [
  { path: '', component: Mapaperucomponent, title: 'ReclamaYA · Mapa de quejas del Perú' },
  { path: 'mapa', redirectTo: '' },
  { path: 'reporte/:id', component: Detallecomponent, title: 'Reporte · ReclamaYA' },
  { path: 'reportar', component: Reportarcomponent, title: 'Reportar un problema · ReclamaYA' },
  {
    path: 'ingresar', component: Authcomponent,
    children: [{ path: '', component: Logincomponent, title: 'Ingresar · ReclamaYA' }]
  },
  {
    path: 'registro', component: Authcomponent,
    children: [{ path: '', component: Registrocomponent, title: 'Crear cuenta · ReclamaYA' }]
  },
  { path: 'mis-reportes', component: Misreportescomponent, canActivate: [sesionGuard], title: 'Mis reportes · ReclamaYA' },
  {
    path: 'panel',
    component: Panelcomponent,
    canActivate: [equipoGuard],
    children: [
      { path: '', redirectTo: 'resumen', pathMatch: 'full' },
      { path: 'resumen', component: Resumencomponent, title: 'Resumen · Panel' },
      { path: 'bandeja', component: Bandejacomponent, title: 'Bandeja · Panel' },
      {
        path: 'moderaciones', component: Moderacioncomponent,
        children: [{ path: '', component: Moderacionlistcomponent, title: 'Moderaciones · Panel' }]
      },
      {
        path: 'zonas', component: Zonacomponent,
        children: [
          { path: '', component: Zonalistcomponent, title: 'Zonas · Panel' },
          { path: 'nuevo', component: Zonainsertcomponent, title: 'Nueva zona · Panel' }
        ]
      },
      {
        path: 'categorias', component: Categoriacomponent,
        children: [
          { path: '', component: Categorialistcomponent, title: 'Categorías · Panel' },
          { path: 'nuevo', component: Categoriainsertcomponent, title: 'Nueva categoría · Panel' }
        ]
      },
      {
        path: 'usuarios', component: Usuariocomponent, canActivate: [adminGuard],
        children: [
          { path: '', component: Usuariolistcomponent, title: 'Usuarios · Panel' },
          { path: 'nuevo', component: Usuarioinsertcomponent, title: 'Nuevo usuario · Panel' }
        ]
      },
      {
        path: 'roles', component: Rolcomponent, canActivate: [adminGuard],
        children: [
          { path: '', component: Rollistcomponent, title: 'Roles · Panel' },
          { path: 'nuevo', component: Rolinsertcomponent, title: 'Nuevo rol · Panel' }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
