# ReclamaYA – Frontend (Angular)

Mapa de reclamos ciudadanos del Perú. Consume el backend de este repositorio (`http://localhost:8084`).

## Requisitos
- Node.js 22+
- Backend corriendo en `http://localhost:8084` (CORS habilitado para `http://localhost:4200`)

## Ejecutar
```bash
cd report-and-be-heard-front
npm install
npm start            # http://localhost:4200
```

## Datos de prueba (opcional)
Con el backend encendido y la base vacía, desde esta carpeta:
```bash
python3 datos-prueba/inyectar_datos.py   # roles, catálogos y cuentas demo
python3 datos-prueba/inyectar_peru.py    # zonas en las 196 provincias, reclamos y moderaciones
```

## Estructura
Sigue el formato del proyecto de ejemplo del curso:
- `src/app/models` – DTOs (mismos campos que el backend)
- `src/app/services` – un servicio por entidad, más reportes, sesión, geografía, notificaciones y resultados
- `src/app/components/<x>component` – un componente por pantalla; los CRUD del panel tienen `<x>listcomponent` y `<x>insertcomponent` (rutas `listar`, `insertar` y `ediciones/:id`)
- `src/app/shared` – guards, interceptor del JWT, paginador en español y utilidades
- `src/material-theme.scss` y `src/styles.css` – tema de Angular Material y estilos globales
- `public/img` – imágenes de la página; `public/geo` – límites oficiales INEI (servicio WFS publicado en GeoIDEP), simplificados para la web
- `images/` – imágenes originales

## Funciones
Inicio, mapa del Perú por departamento, provincia y distrito, reporte en 3 pasos, detalle con apoyos ("me gusta") y comentarios, notificaciones, resultados públicos (incluye el top de reportes más apoyados) y panel de gestión (bandeja, moderaciones, suspensiones de cuentas, zonas, categorías, usuarios y roles). La interfaz usa componentes de Angular Material.
