import { Routes } from '@angular/router';
import { sesionGuard, equipoGuard, adminGuard } from './shared/guards';
import { Homecomponent } from './components/homecomponent/homecomponent';
import { Mapaperucomponent } from './components/mapaperucomponent/mapaperucomponent';
import { Detallecomponent } from './components/detallecomponent/detallecomponent';
import { Resultadoscomponent } from './components/resultadoscomponent/resultadoscomponent';
import { Resultadostiposcomponent } from './components/resultadoscomponent/resultadostiposcomponent/resultadostiposcomponent';
import { Resultadosavancecomponent } from './components/resultadoscomponent/resultadosavancecomponent/resultadosavancecomponent';
import { Resultadosinversioncomponent } from './components/resultadoscomponent/resultadosinversioncomponent/resultadosinversioncomponent';
import { Resultadoscasoscomponent } from './components/resultadoscomponent/resultadoscasoscomponent/resultadoscasoscomponent';
import { Resultadosapoyadoscomponent } from './components/resultadoscomponent/resultadosapoyadoscomponent/resultadosapoyadoscomponent';
import { Reportarcomponent } from './components/reportarcomponent/reportarcomponent';
import { Authcomponent } from './components/authcomponent/authcomponent';
import { Logincomponent } from './components/authcomponent/logincomponent/logincomponent';
import { Registrocomponent } from './components/authcomponent/registrocomponent/registrocomponent';
import { Misreportescomponent } from './components/misreportescomponent/misreportescomponent';
import { Panelcomponent } from './components/panelcomponent/panelcomponent';
import { Resumencomponent } from './components/resumencomponent/resumencomponent';
import { Bandejacomponent } from './components/bandejacomponent/bandejacomponent';
import { Moderacioncomponent } from './components/moderacioncomponent/moderacioncomponent';
import { Moderacionlistcomponent } from './components/moderacioncomponent/moderacionlistcomponent/moderacionlistcomponent';
import { Suspensioncomponent } from './components/suspensioncomponent/suspensioncomponent';
import { Suspensionlistcomponent } from './components/suspensioncomponent/suspensionlistcomponent/suspensionlistcomponent';
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
  { path: '', component: Homecomponent, title: 'ReclamaYA · Reclamos ciudadanos del Perú' },
  { path: 'mapa', component: Mapaperucomponent, title: 'Mapa de reclamos · ReclamaYA' },
  { path: 'reporte/:id', component: Detallecomponent, title: 'Reporte · ReclamaYA' },
  {
    path: 'resultados', component: Resultadoscomponent,
    children: [
      { path: '', redirectTo: 'tipos-de-problema', pathMatch: 'full' },
      { path: 'tipos-de-problema', component: Resultadostiposcomponent, title: 'Tipos de problema · ReclamaYA' },
      { path: 'avance-de-atencion', component: Resultadosavancecomponent, title: 'Avance de atención · ReclamaYA' },
      { path: 'inversion', component: Resultadosinversioncomponent, title: 'Inversión · ReclamaYA' },
      { path: 'casos-resueltos', component: Resultadoscasoscomponent, title: 'Casos resueltos · ReclamaYA' },
      { path: 'mas-apoyados', component: Resultadosapoyadoscomponent, title: 'Más apoyados · ReclamaYA' },
    ]
  },
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
        children: [
          { path: '', redirectTo: 'listar', pathMatch: 'full' },
          { path: 'listar', component: Moderacionlistcomponent, title: 'Moderaciones · Panel' }
        ]
      },
      {
        path: 'suspensiones', component: Suspensioncomponent,
        children: [
          { path: '', redirectTo: 'listar', pathMatch: 'full' },
          { path: 'listar', component: Suspensionlistcomponent, title: 'Suspensiones · Panel' }
        ]
      },
      {
        path: 'zonas', component: Zonacomponent,
        children: [
          { path: '', redirectTo: 'listar', pathMatch: 'full' },
          { path: 'listar', component: Zonalistcomponent, title: 'Zonas · Panel' },
          { path: 'insertar', component: Zonainsertcomponent, title: 'Nueva zona · Panel' },
          { path: 'ediciones/:id', component: Zonainsertcomponent, title: 'Editar · Panel' }
        ]
      },
      {
        path: 'categorias', component: Categoriacomponent,
        children: [
          { path: '', redirectTo: 'listar', pathMatch: 'full' },
          { path: 'listar', component: Categorialistcomponent, title: 'Categorías · Panel' },
          { path: 'insertar', component: Categoriainsertcomponent, title: 'Nueva categoría · Panel' },
          { path: 'ediciones/:id', component: Categoriainsertcomponent, title: 'Editar · Panel' }
        ]
      },
      {
        path: 'usuarios', component: Usuariocomponent, canActivate: [adminGuard],
        children: [
          { path: '', redirectTo: 'listar', pathMatch: 'full' },
          { path: 'listar', component: Usuariolistcomponent, title: 'Usuarios · Panel' },
          { path: 'insertar', component: Usuarioinsertcomponent, title: 'Nuevo usuario · Panel' },
          { path: 'ediciones/:id', component: Usuarioinsertcomponent, title: 'Editar · Panel' }
        ]
      },
      {
        path: 'roles', component: Rolcomponent, canActivate: [adminGuard],
        children: [
          { path: '', redirectTo: 'listar', pathMatch: 'full' },
          { path: 'listar', component: Rollistcomponent, title: 'Roles · Panel' },
          { path: 'insertar', component: Rolinsertcomponent, title: 'Nuevo rol · Panel' },
          { path: 'ediciones/:id', component: Rolinsertcomponent, title: 'Editar · Panel' }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
