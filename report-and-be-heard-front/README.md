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
- `src/app/models` – DTOs (mismos campos que el backend)
- `src/app/services` – un servicio por entidad + reportes, sesión y geografía
- `src/app/components` – mapa del Perú (inicio), reportar, detalle, ingreso/registro, mis reportes y panel de gestión
- `public/geo` – límites oficiales INEI (servicio WFS publicado en GeoIDEP), simplificados para la web
